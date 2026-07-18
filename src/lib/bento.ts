"use server";

import { createBentoSdk, walletAuthProvider } from '@bento.fun/sdk';
import crypto from 'crypto';

import { privateKeyToAccount } from 'viem/accounts';

const BUILDER_KEY = process.env.BUILDER_API_KEY || process.env.BENTO_BUILDER_API_KEY || 'bnt_live_b7334f13_eb36a9772349da8100452d21';

// Stable server-side private key for automated demo wallet (exactly 32 bytes / 64 hex chars)
const MOCK_PRIVATE_KEY = '0xe4e2b02e9cf3e5a09383bd4f4d3f27817950ac7d91113534be1c6eb99b7d398b';
const account = privateKeyToAccount(MOCK_PRIVATE_KEY);

const bento = createBentoSdk({
  baseUrl: process.env.BENTO_URL || 'https://internal-server.bento.fun',
  apiKey: BUILDER_KEY,
  tournamentsBaseUrl: process.env.PARLAY_TOURNMENT_URL || 'https://bento-fun-tournaments-backend-3nku.onrender.com',
  auth: walletAuthProvider(() => ({})), // Public config, overwritten dynamically for mutations
});

// Helper to get real JWT for the server-side EOA wallet
async function getAuthenticatedUserToken(): Promise<string> {
  const ts = String(Date.now());
  const message = `Bento.fun Login\nTimestamp: ${ts}\nWallet: ${account.address}`;
  
  try {
    const signature = await account.signMessage({ message });
    
    // 1. Try to login
    const loginRes = await bento.public.auth.eoaLogin({
      address: account.address,
      signature,
      timestamp: ts
    });

    if (loginRes.exists && loginRes.token) {
      return loginRes.token as string;
    }

    // 2. If user doesn't exist, register them
    const registerRes = await bento.public.auth.eoaRegister({
      address: account.address,
      signature,
      timestamp: ts,
      username: `pulse_bot_${account.address.slice(2, 8).toLowerCase()}`
    });

    if (registerRes.token) {
      return registerRes.token as string;
    }
  } catch (error) {
    console.error("[BentoPulse] Auth fallback login failed:", error);
  }

  // Fallback to configured env JWT or builder key
  return process.env.BENTO_USER_JWT || BUILDER_KEY;
}

export interface BentoMarket {
  id: string;
  title: string;
  options: { index: number; label: string }[];
  volume: string;
  status: 'LIVE' | 'CLOSED';
}

export async function fetchLiveMarkets(): Promise<BentoMarket[]> {
  try {
    console.log("[BentoPulse] Fetching live testnet markets from Bento SDK...");
    const response = await bento.public.listDuels({ page: 1, limit: 10 });
    console.log("[BentoPulse] SDK Response received. Parsing...");
    
    // Parse defensively to support various API response shapes
    const rawMarkets: any[] = Array.isArray(response) ? response : 
                             (response && Array.isArray((response as any).data)) ? (response as any).data :
                             (response && Array.isArray((response as any).results)) ? (response as any).results :
                             (response && Array.isArray((response as any).markets)) ? (response as any).markets : 
                             [];

    if (rawMarkets.length > 0) {
      console.log(`[BentoPulse] Successfully mapped ${rawMarkets.length} live testnet markets.`);
      return rawMarkets.map((m: any) => {
        const options = Array.isArray(m.options) ? m.options.map((o: any, idx: number) => ({
          index: idx,
          label: String(o)
        })) : [{index: 0, label: 'YES'}, {index: 1, label: 'NO'}];

        return {
          id: m.duelId || m.id || '',
          title: m.betString || m.question || m.title || '',
          options,
          volume: m.totalBetAmountUsdc !== undefined ? Number(m.totalBetAmountUsdc).toLocaleString() : '0',
          status: m.status === -1 ? 'LIVE' : 'CLOSED'
        };
      });
    }
    console.log("[BentoPulse] SDK returned 0 markets, falling back to mocks...");
  } catch (error) {
    console.warn("[BentoPulse] Real SDK listDuels failed, falling back to mock:", error);
  }

  // Graceful fallback for dashboard if live endpoint is unreachable or empty
  return [
    {
      id: "duel-btc-100k",
      title: "Bitcoin hits $100k by Friday?",
      options: [{index: 0, label: 'YES'}, {index: 1, label: 'NO'}],
      volume: "1,250,000",
      status: "LIVE"
    },
    {
      id: "duel-eth-etf",
      title: "Ethereum ETF approved this month?",
      options: [{index: 0, label: 'YES'}, {index: 1, label: 'NO'}],
      volume: "890,500",
      status: "LIVE"
    },
    {
      id: "duel-sol-flippening",
      title: "Solana flips Ethereum market cap in 2026?",
      options: [{index: 0, label: 'YES'}, {index: 1, label: 'NO'}],
      volume: "450,200",
      status: "LIVE"
    }
  ];
}

export async function placeBentoPrediction(duelId: string, optionIndex: number, amount: number) {
  // Convert amount to string wei (18 decimals for credits/USDC typically)
  const stake = (BigInt(amount) * BigInt(10 ** 18)).toString();

  console.log(`[BentoPulse] Acquiring real user auth token...`);
  const token = await getAuthenticatedUserToken();

  // Create an authenticated client dynamically using the real JWT token
  const authedBento = createBentoSdk({
    baseUrl: process.env.BENTO_URL || 'https://internal-server.bento.fun',
    apiKey: BUILDER_KEY,
    tournamentsBaseUrl: process.env.PARLAY_TOURNMENT_URL || 'https://bento-fun-tournaments-backend-3nku.onrender.com',
    auth: walletAuthProvider(() => ({ Authorization: `Bearer ${token}` })),
  });

  console.log(`[BentoPulse] Estimating bet for duel: ${duelId}, option: ${optionIndex}, stake: ${stake}`);
  
  // 1. Estimate
  let est;
  try {
    est = await authedBento.user.bets.estimateBuy({
      duelId: duelId,
      optionIndex: optionIndex as 0 | 1,
      betAmountUsdc: stake,
      slippageBps: 100, // 1%
    });
  } catch (e: unknown) {
    console.error("SDK Estimate Error:", e);
    const errMsg = e instanceof Error ? e.message : String(e);
    return { 
      success: false, 
      message: `Bento Engine Estimate Error: ${errMsg || "Unauthorized (Invalid User JWT)"}` 
    };
  }

  if (!est.success) {
    return { success: false, message: 'Estimate rejected by Bento engine' };
  }

  console.log(`[BentoPulse] Estimate success, placing bet...`);

  // 2. Place Bet
  const idempotencyKey = crypto.randomUUID();
  try {
    await authedBento.user.placeBetFromEstimate(
      {
        estimate: est.estimate,
        duelId: duelId,
        duelType: 'PREDICTION',
        bet: optionIndex === 0 ? 'YES' : 'NO',
        optionIndex: optionIndex as 0 | 1,
        betAmount: stake,
        betAmountUsdc: stake,
        slippageBps: 100,
        tokenDecimals: 18,
      },
      { idempotencyKey }
    );
    return { success: true, message: "Prediction executed successfully." };
  } catch (e: unknown) {
    console.error("SDK Place Error:", e);
    const errMsg = e instanceof Error ? e.message : String(e);
    return { 
      success: false, 
      message: `Bento Engine Placement Error: ${errMsg || "Failed to place prediction on-chain"}` 
    };
  }
}
