# ⚡ BentoPulse
> The AI-Powered Prediction Terminal for Bento

## Project

| Field | Your answer |
|-------|-------------|
| **Project name** | BentoPulse |
| **Tagline** | AI-Powered Prediction Terminal for Bento |
| **Team name** | Solo Builder |
| **Team members** | Lochan Gowda |
| **Contact email** | 10lochangowda@gmail.com |
| **Track** (if applicable) | - |

### Links

| | URL |
|---|-----|
| **Live demo** | [https://bentopulse.vercel.app/](https://bentopulse.vercel.app/) |
| **Demo video or slide deck** | [Link to slide deck / video] |
| **Pitch deck** (optional) | - |

---

## What you built

BentoPulse is a professional Bloomberg-style terminal for Bento prediction markets. It solves a core problem: users typically have to guess when making predictions without data. BentoPulse integrates an AI research agent (Anakin) that scrapes real-time sentiment, news, and activity for any market to provide a curated **AI Edge Score** (0-100) with cited catalysts. Users can view live order details, copy and fund their server-side terminal wallet, and execute predictions directly via the Bento SDK with slippage protection and automated signature authorization.

### Screenshots

<div align="center">
  <img src="./docs/screenshot.png" alt="BentoPulse Terminal" width="100%" />
</div>

---

## Bento integration

| Surface | Yes / No | Describe (if Yes) |
|---------|----------|-------------------|
| Markets / duels (browse, bet, create) | **Yes** | Uses `bento.public.listDuels` to display live markets, `bento.user.bets.estimateBuy` to fetch live rates/slippage, `bento.user.placeBetFromEstimate` to place trades on-chain, `bento.public.publicBets.getYesPercentageSnapshots` to render sparkline trajectory charts, and `bento.public.publicBets.estimatedWin` to calculate potential payouts. |
| Multi-outcome / parent markets | **No** | |
| Parlays | **No** | |
| Tournaments / F1 / fantasy | **No** | |
| Packs | **No** | |
| Polymarket bridge | **No** | |
| Agents | **Yes** | Uses server-side dynamic wallet signing (`eoaLogin`/`eoaRegister`) to execute actions securely on behalf of the user terminal. |
| Realtime / social | **Yes** | Queries real-time Credits balances using `bento.public.portfolio.getAccountDetails` to let users fund the terminal wallet dynamically, and displays a protocol-wide metrics ticker utilizing `bento.public.protocolStats.getStats`. |
| Others | **Yes** | Displays a dynamic trading leaderboard calling `bento.public.leaderboard.listTraders`. |

**Builder API key:** Minted from Bento docs. Keys are stored securely in environment variables and never committed.

---

## How to run

```bash
# Clone the repository
git clone https://github.com/lochangowda10/bento-hackathon.git
cd bento-hackathon/submissions/bento-pulse

# Configure environment
cp .env.example .env.local

# Install dependencies and start development server
npm install
npm run dev
```

| Env var | Required | Description |
|---------|----------|-------------|
| `BENTO_BUILDER_API_KEY` | yes | Testnet builder key (`x-builder-api-key`) |
| `BENTO_URL` | yes | Markets host (`https://internal-server.bento.fun`) |
| `PARLAY_TOURNMENT_URL` | no | Tournaments host (`https://bento-fun-tournaments-backend-3nku.onrender.com`) |
| `ANAKIN_API_KEY` | yes | Anakin.io API key for web intelligence |
| `USER_PRIVATE_KEY` | no | (Optional) Private key of a funded testnet wallet to override the default EOA bot wallet |

---

## Architecture (short)

- **Stack:** Next.js 15 (App Router, Server Actions), Tailwind CSS, Lucide icons, html2canvas, and `@bento.fun/sdk`.
- **Repo layout:** Next.js application inside `submissions/bento-pulse/`.
- **Auth:** Uses the Bento SDK's wallet authentication. Signs an login challenge message with the terminal's private key (`viem/accounts`) server-side to obtain a user JWT token, keeping keys safe from client leakage.
- **What's on-chain vs off-chain:** Market data lookup and prediction placement are executed on-chain via the Bento engine. AI web scraping and news analysis are handled off-chain via the Anakin API.
