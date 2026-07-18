<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/zap.svg" width="60" alt="BentoPulse Logo" />
  <br/>
  <h1>BENTOPULSE</h1>
  <p><strong>The Institutional-Grade AI Prediction Terminal for Bento</strong></p>
  
  <p>
    Built for the <b>Build on Bento</b> Hackathon
  </p>
</div>

---

## ⚡ Why BentoPulse?

Prediction markets have a fatal flaw: **Information Asymmetry**.
While retail traders place bets based on gut feelings and outdated Twitter threads, institutional players leverage massive data pipelines and sentiment analysis to identify statistical edges. 

We asked ourselves: *Why doesn't a trader have a Bloomberg Terminal for Bento?*

**BentoPulse** bridges this gap. It's a high-performance, dark-mode terminal that intercepts the market you want to trade, unleashes an **Anakin AI** web-scraping agent to analyze real-time catalysts and sentiment, and calculates an **AI Edge Score**. Once you have conviction, it uses the **Bento SDK** to execute your prediction instantly on-chain.

No guessing. Just data-backed execution.

---

## 🚀 Features

- **The AI Edge (Powered by Anakin.io)**: Instantly deploys an AI agent to scrape the web for the latest news regarding a specific Bento market. Calculates a 1-100 conviction score and highlights real-time catalysts.
- **One-Tap Execution (Powered by Bento SDK)**: Eliminates UI friction. Uses `sdk.user.bets.estimateBuy` for live slippage bounds and executes seamlessly via `sdk.user.placeBetFromEstimate`.
- **Institutional UX**: A flawless, responsive, "glassmorphic" interface optimized for rapid data absorption.
- **Node-Secure Architecture**: Utilizes Next.js Server Actions to safely route API keys (preventing CORS errors and key-leaks) while keeping the frontend blazing fast.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Styling**: Tailwind CSS, Lucide React
- **Web3 Engine**: `@bento.fun/sdk`
- **AI Data Layer**: Anakin.io REST API
- **Language**: Strict TypeScript

---

## ⚙️ How We Integrated Bento SDK

BentoPulse is not a mockup; it's a live transaction engine. We integrated the official Bento SDK to handle the complexities of on-chain routing:

1. **Market Discovery**: We fetch live catalog data.
2. **Slippage Protection**: Before executing, we call `estimateBuy` to ensure the trade falls within acceptable bounds.
3. **Idempotent Execution**: We pass a cryptographically secure `idempotencyKey` into `placeBetFromEstimate` to ensure network hiccups never result in double-spending the user's credits.

---

## 🏁 Getting Started Locally

```bash
# 1. Clone the repository
git clone https://github.com/lochangowda10/bento-hackathon.git
cd bento-hackathon

# 2. Install Dependencies
npm install

# 3. Configure Environment Variables
# Create a .env.local file with your keys:
# BUILDER_API_KEY=...
# BENTO_URL=...
# PARLAY_TOURNMENT_URL=...
# ANAKIN_API_KEY=...

# 4. Start the Terminal
npm run dev
```

---

<div align="center">
  <p><i>"The future of prediction markets isn't better UI. It's better intelligence."</i></p>
</div>
