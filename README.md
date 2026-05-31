# 🕶️ TrendHustler
## *The Back-Alley Exchange for AI Trends*

> **"Everybody wants to be a content creator. Nobody wants to do the homework."**
> 
> *TrendHustler does the homework.*

---

## Yo, what is this thing?

You know that feeling when you post a YouTube video about some AI topic... and realize 400 people already did it last week?

That's called **getting caught holdin'**. And it happens because you're picking your topics from what's already viral — which means you're always late.

**TrendHustler fixes this.**

It watches 8 underground sources where AI builders, researchers, and developers talk about stuff **before it goes mainstream**. It measures how much buzz a topic has in the developer underground vs. how much coverage it already has in the media and on YouTube.

The gap between those two numbers? **That's your window.**

Post in that window = you look like a genius. Miss it = you're the 400th video on the topic.

---

## The one thing you need to understand

AI topics go through a lifecycle. Every single one:

```
🥚 EMBRYO  →  📈 RISING  →  🔥 PEAKING  →  💀 SATURATED  →  👴 DEAD
(devs only)   (growing)    (last chance)   (everyone)     (nobody cares)
```

**TrendHustler tells you exactly where every topic is right now.**

Post in EMBRYO or RISING = early mover advantage. Views, subs, algorithmic love.

Post in SATURATED or DEAD = you're the 400th person. Algorithm ignores you. Audience thinks you're behind.

---

## The signals — what each one means for YOU

| Signal | What's happening | What you should do |
|--------|-----------------|-------------------|
| 💎 **STRONG BUY** | Devs are buzzing. Media hasn't found it yet. | Drop everything. Make the video TODAY. |
| 🟢 **BUY** | Growing fast underground. Mainstream waking up. | This week. Don't overthink it. |
| 🟡 **HOLD** | Peak. Everyone's about to post about it. | Today or never. Last call. |
| 🔴 **SELL** | It's everywhere. Every newsletter, every carousel. | Skip it. You're too late. |
| ☠️ **RUG** | Dead. Used to be hot. Now it's a corpse. | Don't get caught posting this. |

---

## What the numbers actually mean

**The saturation bar** (the green/red bar on each topic):

```
[████░░░░░░] 20% mainstream
```

This means: only 20% of the buzz around this topic is coming from mainstream media and YouTube. 80% is still in the developer underground. **That's a gem.**

```
[██████████] 91% mainstream
```

This means: media is EVERYWHERE on this topic. Every podcast, newsletter, and LinkedIn thought leader is covering it. **That's a corpse. Move on.**

**The posting window** (the number of days):

```
⏳ 11 days left
```

In 11 days this topic will be fully mainstream. You have 11 days to get your video out before you're one of many.

```
❌ CLOSED
```

Already mainstream. Window is gone. Don't bother.

**The daily change** (the % number):

```
+49% today
```

This topic gained 49% more mentions in the last 48 hours vs the previous week. It's accelerating fast.

---

## Real example — what it found TODAY

When TrendHustler ran this morning, here's what it found:

**💎 STRONG BUY: $GRAPHRAG** — only 0% mainstream coverage. Dev community buzzing. Nobody on YouTube has covered it yet. Window: 60 days.

*If you make a "What is GraphRAG and why it matters" video today, you'll be first. Or close to it.*

**🔴 SELL: $AGENTS** — AI Agents is at 10% mainstream but moving fast. LinkedIn carousel season has begun.

**☠️ RUG: $SAFETY** — AI Safety down 52% in 48 hours. The discourse died. Nobody's clicking this anymore.

*This is the difference between being a thought leader and being background noise.*

---

## What it watches (8 sources, zero dollars)

Here's where TrendHustler gets its intel — all free, no API keys:

| Source | What it's actually watching |
|--------|----------------------------|
| **Hacker News** | What software engineers are actually discussing |
| **GitHub** | Which AI repos are getting stars right now |
| **arXiv** | Fresh research papers (products follow research by 3-6 months) |
| **Hugging Face** | Which AI models are trending among practitioners |
| **Dev.to** | What developers are writing about and reading |
| **Reddit** | r/LocalLLaMA, r/MachineLearning, r/singularity — the underground |
| **Product Hunt** | New AI tools launching today |
| **YouTube** | What creators are already covering (the mainstream signal) |
| **Google News** | How much media coverage a topic already has |

The first 7 = underground. The last 2 = mainstream. The gap between them = your opportunity.

---

## The Fear & Greed Index

At the top of the dashboard you'll see a number from 0 to 100.

- **Above 65 (Greed)** — AI content world is hyped. Lots of topics are peaking. Good time to post on popular topics, bad time to find hidden gems.
- **Below 35 (Fear)** — Quiet period. Most topics still underground. Great time to find gems that haven't blown up yet.
- **Right now: 38 (FEAR)** — Most topics are still underground. Lots of opportunities.

---

## How to use it (for real though)

**For YouTube creators:**
1. Run it in the morning (`npm run build`)
2. Filter to "🟢 Cop (Buy)"
3. Look for topics with less than 20% saturation and a posting window over 14 days
4. Click the topic → get real links to actual discussions, papers, repos
5. Make your video from those sources
6. Post before the wave hits

**For newsletter writers / Twitter / LinkedIn:**
Same thing. Find what's being talked about in the dev underground and write about it before every major newsletter does.

**For anyone in the AI space:**
Know what's actually happening in AI before it's on the front page. Be the person who "called it" early.

---

## Quick start

```bash
# You need Node.js 18+ and yt-dlp installed
# Install yt-dlp: winget install yt-dlp  (Windows)
#                 pip install yt-dlp     (Mac/Linux)

# Pull fresh data and build the dashboard
npm run build

# Open index.html in your browser
# (just double-click it — no server, no setup, no accounts)
```

Takes about 12 seconds. Pulls live data from all 8 sources, scores every topic, bakes it into a single HTML file you can open anywhere.

**Refresh whenever you want fresh data:**
```bash
npm run refresh
```

---

## Also: it has an MCP server

If you use Claude Code or Antigravity, you can plug TrendHustler directly into your AI assistant:

```bash
claude mcp add trendhustler node /path/to/trendhustler/mcp/server.mjs
```

Then ask Claude:
- *"What AI topics should I post about today?"*
- *"Should I make a video about voice agents?"*
- *"What's the AI market mood right now?"*

And get a dealer-grade breakdown. Setup guide: [mcp/index.html](mcp/index.html)

---

## The vibe

This dashboard is built to be used, not just looked at. Click stuff:

- **Click the TRENDHUSTLER logo** — 💸 money rain
- **Konami code** (↑↑↓↓←→←→ B A) — 💎 Diamond Hands Mode
- **Sound on** (bottom right) — ka-ching on BUY, siren on RUG
- **Click any row** — dealer verdict + real source links to go make content

---

## Bottom line

TrendHustler is a **content timing tool for AI creators**.

It doesn't tell you what to think. It tells you **when to post**.

Find the gap between what developers are talking about and what's already in the mainstream. Post in that gap. That's the whole game.

*"The streets never sleep. Neither does the data pipeline."* 🕶️

---

*Built for Jack Roberec's AI Automator Community — May 2026 Competition.*  
*8 free sources. No API keys. No Apify. ~12 second refresh. All hustle.*
