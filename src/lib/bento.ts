"use server";

import { createBentoSdk, walletAuthProvider } from '@bento.fun/sdk';
import crypto from 'crypto';

const MOCK_USER_JWT = "mock_jwt_token_for_hackathon";

const bento = createBentoSdk({
  baseUrl: process.env.BENTO_URL || 'https://internal-server.bento.fun',
  apiKey: process.env.BUILDER_API_KEY || 'bnt_live_b7334f13_eb36a9772349da8100452d21',
  tournamentsBaseUrl: process.env.PARLAY_TOURNMENT_URL || 'https://bento-fun-tournaments-backend-3nku.onrender.com',
  auth: walletAuthProvider(() => ({ Authorization: `Bearer ${MOCK_USER_JWT}` })),
});

export interface BentoMarket {
  id: string;
  title: string;
  options: { index: number; label: string }[];
  volume: string;
  status: 'LIVE' | 'CLOSED';
}

export async function fetchLiveMarkets(): Promise<BentoMarket[]> {
  try {
    // Attempting standard catalog fetch on the sdk
    const response = await fetch(`${process.env.BENTO_URL || 'https://internal-server.bento.fun'}/v1/markets`, {
      headers: {
        'x-builder-api-key': process.env.BUILDER_API_KEY || 'bnt_live_b7334f13_eb36a9772349da8100452d21'
      }
    });
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.markets)) {
         return data.markets.map((m: { id?: string; duelId?: string; title?: string; question?: string; options?: { index: number; label: string }[]; volume?: string; status?: 'LIVE' | 'CLOSED' }) => ({
           id: m.id || m.duelId || '',
           title: m.title || m.question || '',
           options: m.options || [{index: 0, label: 'YES'}, {index: 1, label: 'NO'}],
           volume: m.volume || '0',
           status: m.status || 'LIVE'
         }));
      }
    }
  } catch (error) {
    console.warn("Real fetch failed, falling back to mock", error);
  }

  // Graceful fallback for dashboard if live endpoint is unreachable
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

  console.log(`[BentoPulse] Estimating bet for duel: ${duelId}, option: ${optionIndex}, stake: ${stake}`);
  
  // 1. Estimate
  let est;
  try {
    est = await bento.user.bets.estimateBuy({
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
    await bento.user.placeBetFromEstimate(
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
