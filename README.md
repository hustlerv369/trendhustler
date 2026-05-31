# 🕶️ TrendHustler
## *The Back-Alley Exchange for AI Trends*

> **"Cop the gems before they go mainstream, playa."**

[![Open index.html — no install needed](https://img.shields.io/badge/dashboard-open%20index.html-00E676?style=flat-square)](index.html)
[![8 free sources](https://img.shields.io/badge/sources-8%20free%2C%20no%20API%20keys-D4AF37?style=flat-square)](#sources)
[![MCP Server](https://img.shields.io/badge/MCP-Claude%20Code%20%26%20Antigravity-FF2E97?style=flat-square)](mcp/)

---

You know that feeling when you post about something **two weeks after everyone else**?

That's a skill issue. TrendHustler fixes it.

This dashboard monitors **8 underground sources in real-time**, runs a signal-vs-noise engine, and tells you exactly which AI topics to post about **before the normies find them** — with a signal, a posting window, and real source links so you can go make the video TODAY.

No subscriptions. No API keys. No Apify. **All hustle.**

---

## 🎯 The Problem It Solves

80% of content creation is timing. Post too early — nobody cares. Post too late — you're the 400th person covering it. 

The gap between **"dev community buzzing"** and **"LinkedIn carousel hell"** is your window. TrendHustler finds that window for every AI topic, every time you run it.

---

## 💎 The Signals

| Signal | What it means | What to do |
|--------|--------------|------------|
| 💎 **STRONG BUY** | Underground buzz, mainstream asleep | Post **NOW** — you'll be first |
| 🟢 **BUY** | Rising in dev community, normies haven't found it | Get in **this week** |
| 🟡 **HOLD** | Peaking — last call | Post **today or never** |
| 🔴 **SELL** | Saturated — everybody's grandma posting it | Skip it |
| ☠️ **RUG** | Dead on arrival | Don't get caught holdin' |

Each signal comes with:
- **Saturation %** — how mainstream it already is (0% = pure underground 💎)
- **Posting window** — days left before normies take over
- **Real source links** — actual HN threads, GitHub repos, papers to base your content on
- **Confidence level** — how much data backs the signal

---

## 🔬 How It Actually Works

TrendHustler splits the world into two camps:

```
🔬 UNDERGROUND               📢 MAINSTREAM
HN · GitHub · arXiv          Google News
HuggingFace · Dev.to         YouTube (via yt-dlp)
Reddit · Product Hunt
```

Every ~12 seconds it:
1. Pulls fresh data from all 8 sources (zero API keys — pure RSS, official APIs, yt-dlp)
2. Extracts AI topic tickers (`$MCP`, `$AGENTS`, `$GRAPHRAG`…) from ~45 curated topics + an **emerging n-gram detector** that catches brand-new topics before they're even named
3. Calculates **underground velocity** (how fast it's growing in dev circles) vs **mainstream saturation** (how much media/YouTube coverage it has)
4. Maps each topic to a lifecycle stage: `EMBRYO → RISING → PEAKING → SATURATED → DEAD`
5. Bakes everything into a self-contained `index.html` — open it anywhere, no server needed

The **Fear & Greed index** tells you the overall market mood. The **WANTED poster** names the biggest dump (don't touch it). The ticker tape runs 24/7.

---

## 🚀 Quick Start

```bash
# Step 1 — install yt-dlp (YouTube source)
# Windows:   winget install yt-dlp
# Mac/Linux: pip install yt-dlp  OR  brew install yt-dlp

# Step 2 — fetch live data + build dashboard (~12 seconds)
npm run build

# Step 3 — open in browser
# Just double-click index.html  OR:
open index.html
```

That's it. No `npm install`. No `.env` file. No accounts. **Just open and use.**

To refresh data anytime:
```bash
npm run refresh   # re-cops fresh data from all 8 sources
```

---

## 📡 Sources — 8 Plugs, All Free

| Source | What it reads | Why it matters |
|--------|--------------|----------------|
| **Hacker News** | Latest stories (Algolia API, both time windows) | Where builders talk before it's mainstream |
| **GitHub** | Recently starred repos (AI/LLM/agents queries) | Star velocity = early adoption signal |
| **arXiv** | cs.AI · cs.CL · cs.LG papers, last 300 | Research → products in 3-6 months |
| **Hugging Face** | Trending models by score | Model popularity before YouTube covers it |
| **Dev.to** | AI/ML/LLM tagged articles | Practitioner adoption signal |
| **Reddit** | r/LocalLLaMA · r/MachineLearning · r/singularity + 4 more (via `.rss` — bypasses the 403 ban) | Underground dev sentiment |
| **Product Hunt** | Latest AI tool launches (`.feed`) | What's being built right now |
| **YouTube** | Search results via `yt-dlp` — view counts included | Creator adoption = trend going mainstream |
| **Google News** | Per-ticker RSS queries | Mainstream saturation check |

Reddit and Product Hunt use their RSS feeds — no scraping, no bans, just free data.

---

## 🎮 Easter Eggs

Because why not:

- **Click the logo** → 💸 it rains money
- **Konami code** (↑↑↓↓←→←→ B A) → 💎 DIAMOND HANDS MODE activated
- **Hover any card** → cursor-following glow
- **Sound toggle** (bottom right 🔇/🔊) → ka-ching on BUY, sad trombone on DUMP, siren on RUG
- **Rozklikni libovolný řádek** → dealer verdict + real source links

---

## 🔌 MCP Server — Ask Your AI Assistant

TrendHustler ships with a **fully working MCP server** for Claude Code and Antigravity.

**Setup (one command):**
```bash
claude mcp add trendhustler node /absolute/path/to/trendhustler/mcp/server.mjs
```

**Then just ask Claude:**
```
"What AI topics should I post about today?"
"Should I post about GraphRAG?"
"What's the AI trend market like right now?"
```

**3 tools:**

| Tool | What it does |
|------|-------------|
| `whats_pumping` | Top BUY/STRONG_BUY gems right now |
| `should_i_post_about` | Full breakdown for any topic you name |
| `market_mood` | Fear & Greed + top mover + biggest dump |

Full setup guide with copy-paste configs: [`mcp/index.html`](mcp/index.html)

---

## 📁 File Structure

```
trendhustler/
│
├── index.html              ← THE DASHBOARD (self-contained, open in any browser)
│
├── src/
│   ├── pipeline.mjs        ← orchestrates the whole data run
│   ├── sources.mjs         ← 8 source connectors (HN, GitHub, arXiv, HF, Dev.to, Reddit, PH, YouTube)
│   ├── extract.mjs         ← ticker extraction + emerging n-gram detector
│   ├── engine.mjs          ← saturation scoring, velocity calc, BUY/SELL signals
│   ├── config.mjs          ← 45-topic dictionary + tunable thresholds
│   ├── util.mjs            ← shared fetch/retry/parse utilities
│   └── build.mjs           ← bakes data.json into self-contained index.html
│
├── mcp/
│   ├── server.mjs          ← MCP server (stdio, works with Claude Code + Antigravity)
│   └── index.html          ← setup guide with copy-paste configs
│
├── web/
│   └── template.html       ← source template (index.html is the built output)
│
├── data/
│   └── data.json           ← latest data snapshot (baked into index.html on build)
│
└── assets/
    ├── hustler.png          ← the plug himself
    ├── gold.jpg             ← real gold texture (yes, real gold)
    └── fonts/
        └── pricedown.ttf    ← the actual GTA font. you're welcome.
```

---

## 🏗️ Requirements

- **Node.js 18+** (for running the pipeline)
- **yt-dlp** (for YouTube source — install once, free forever)
- A browser (for viewing `index.html` — literally any browser)

No `npm install` needed. Zero external npm dependencies. Pure Node.js stdlib + free APIs.

---

## ⚡ npm Scripts

```bash
npm run build           # refresh data + build index.html (do this to get started)
npm run refresh         # fetch fresh data only (faster, no rebuild)
npm run refresh:verbose # same + see all tickers scored in terminal
npm run bake            # build index.html from existing data.json (no fetch)
```

---

*Built for Jack Roberec's AI Automator Community — May 2026 Competition.*

*"The streets never sleep. Neither does the data pipeline."* 🕶️
