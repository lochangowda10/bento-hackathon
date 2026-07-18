<div align="center">

# ⚡ BentoPulse

**The AI-Powered Prediction Terminal for Bento**

[Live Demo](https://bentopulse.vercel.app) · [Built for Build on Bento — BLR Edition](https://bento.fun)

<br/>

<img src="./docs/screenshot.png" alt="BentoPulse Terminal" width="100%" />

</div>

---

## The Problem

Prediction markets ask you to bet.  
They never help you **think**.

Every Bento user faces the same moment: a market question, two buttons, and zero intelligence. No data. No sentiment. No conviction signal. Just a guess dressed up as a prediction.

**BentoPulse changes that.**

---

## What It Does

```
SELECT → ANALYZE → DECIDE → EXECUTE → SHARE
```

1. **Select** a live Bento prediction market from the terminal
2. **Analyze** — an AI agent (Anakin) scrapes the web for real-time sentiment, news, and activity
3. **Decide** — receive an **AI Edge Score** (0–100) with cited catalysts, displayed as terminal-style intelligence
4. **Execute** — place your prediction directly through the Bento SDK with one click
5. **Share** — receive a beautiful **Prediction Receipt** designed for social sharing

---

## Bento SDK Integration

This is not a mockup. Every prediction routes through the real Bento SDK.

| SDK Module | What We Use It For |
|---|---|
| `sdk.user.bets.estimateBuy` | Fetches live slippage bounds before execution |
| `sdk.user.placeBetFromEstimate` | Executes the prediction with idempotency protection |
| Market Catalog API | Fetches live markets for the terminal sidebar |

We pass a cryptographically secure `idempotencyKey` with every execution to prevent double-spends from network retries.

---

## Features

- **🧠 AI Edge Score** — Real-time web intelligence via Anakin, rendered as a terminal-style loading sequence
- **⚡ One-Click Execution** — Live Bento SDK calls with slippage protection
- **🧾 Prediction Receipt** — Shareable trade confirmation card with confetti celebration
- **🔊 Execution Sound** — Synthesized confirmation tone via Web Audio API (no files)
- **⌨️ Keyboard Shortcuts** — `↑↓` navigate, `Y/N` position, `Enter` execute
- **🖥️ Bloomberg Aesthetic** — Dark terminal UI with live clock, pulse indicators, and scanline overlay
- **🔒 Secure Architecture** — API keys routed through Next.js Server Actions, never exposed to client

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Prediction Engine | `@bento.fun/sdk` |
| AI Intelligence | Anakin.io REST API |
| Language | Strict TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Sound | Web Audio API (synthesized) |
| Receipt Export | html2canvas |

---

## Architecture

```
src/
├── app/
│   ├── page.tsx          # Full terminal dashboard (client component)
│   ├── layout.tsx        # Root layout with font loading
│   └── globals.css       # Design system tokens
└── lib/
    ├── bento.ts          # Bento SDK — market fetch + prediction execution
    ├── anakin.ts         # Anakin AI — web research server action
    ├── sound.ts          # Web Audio API — execution confirmation tone
    └── utils.ts          # cn() utility for conditional classes
```

---

## Getting Started

```bash
# Clone
git clone https://github.com/lochangowda10/bento-hackathon.git
cd bento-hackathon

# Install
npm install

# Configure environment
cp .env.example .env.local
# Add: BUILDER_API_KEY, BENTO_URL, PARLAY_TOURNMENT_URL, ANAKIN_API_KEY

# Run
npm run dev
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `BUILDER_API_KEY` | Bento builder API key |
| `BENTO_URL` | Bento server endpoint |
| `PARLAY_TOURNMENT_URL` | Bento tournaments endpoint |
| `ANAKIN_API_KEY` | Anakin.io API key for web intelligence |

---

<div align="center">
  <br/>
  <i>"The future of prediction markets isn't better UI. It's better intelligence."</i>
  <br/><br/>
  <sub>Built with conviction by <a href="https://github.com/lochangowda10">Lochan Gowda</a></sub>
</div>
