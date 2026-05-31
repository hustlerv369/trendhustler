# TrendHustler 🕶️
### *The back-alley exchange for AI trends*

> "Cop the gems before they go mainstream."

A fully functional AI trend dashboard that separates **signal from noise** across 8 free data sources — no API keys, no subscriptions, all hustle.

---

## What it does

TrendHustler monitors **8 real-time sources** and tells you exactly which AI topics to post about **before they go mainstream**:

- 💎 **STRONG BUY** — underground, barely anyone knows yet → post NOW
- 🟢 **BUY** — rising in dev community, mainstream still asleep
- 🟡 **HOLD** — peaking, last chance
- 🔴 **SELL / RUG** — saturated, everybody's grandma is posting this

Each signal comes with **real source links** (HN threads, GitHub repos, arXiv papers) so you can go make content immediately.

## Sources (8, all free, no API keys)

| Source | Camp | What it detects |
|--------|------|-----------------|
| Hacker News | 🔬 Underground | Dev discourse |
| GitHub | 🔬 Underground | Repo star velocity |
| arXiv | 🔬 Underground | Fresh papers |
| Hugging Face | 🔬 Underground | Trending models |
| Dev.to | 🔬 Underground | Practitioner articles |
| Reddit | 🔬 Underground | r/LocalLLaMA, r/MachineLearning, etc. |
| Product Hunt | 🔬 Underground | New AI tool launches |
| YouTube + yt-dlp | 📢 Mainstream | Creator adoption signal |
| Google News | 📢 Mainstream | Media saturation check |

## The engine

**Underground velocity vs. mainstream saturation** = lifecycle stage:

```
EMBRYO → RISING → PEAKING → SATURATED → DEAD
```

For each trend: `saturation %` (how much is mainstream vs underground), `posting window` (days left before it's saturated), and `confidence` level.

Also detects **emerging topics** not in the dictionary — brand new terms spiking in the underground before anyone named them.

---

## Quick start

```bash
# 1. Install yt-dlp (needed for YouTube source)
#    Windows: winget install yt-dlp
#    Mac/Linux: pip install yt-dlp

# 2. Fetch live data + build the dashboard
npm run build

# 3. Open in browser
open index.html   # or just double-click it
```

`npm run build` takes ~12 seconds. It scrapes 8 sources, scores all tickers, and bakes everything into a self-contained `index.html`.

## File structure

```
index.html          ← self-contained dashboard (open in any browser, no server needed)
src/
  pipeline.mjs      ← orchestrator
  sources.mjs       ← 8 source connectors
  extract.mjs       ← ticker extraction + emerging n-gram detector
  engine.mjs        ← saturation scoring + BUY/SELL signals
  config.mjs        ← ~45 AI topic dictionary + tunable thresholds
  util.mjs          ← shared fetch/retry/parse utilities
  build.mjs         ← bakes data.json into index.html
mcp/
  server.mjs        ← MCP server (Claude Code + Antigravity)
  index.html        ← MCP setup guide
assets/
  hustler.png       ← mascot
  gold.jpg          ← gold texture
  fonts/
    pricedown.ttf   ← GTA-style display font
```

## Easter eggs

- Click the **TRENDHUSTLER logo** → money rain 💸
- **Konami code** (↑↑↓↓←→←→ B A) → 💎 DIAMOND HANDS MODE
- **Hover a card** → cursor-following glow
- **Sound toggle** (bottom right) → ka-ching on BUY, siren on DUMP

## MCP Server (Claude Code + Antigravity)

Connect TrendHustler directly to your AI assistant:

```bash
claude mcp add trendhustler node /path/to/trendhustler/mcp/server.mjs
```

Then ask Claude: *"What AI topics should I post about today?"*

Full setup guide: [trendhustler/mcp/](mcp/index.html)

**3 tools:**
- `whats_pumping` — top gems right now
- `should_i_post_about` — check any topic
- `market_mood` — Fear & Greed + top mover

---

## Built for Jack Roberec's AI Automator Community — May 2026 Competition

*No API keys. No Apify. All hustle. ~12s refresh. 8 free sources.*
