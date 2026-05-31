#!/usr/bin/env node
// TrendHustler MCP Server — stdio transport (works with Claude Code & Antigravity)
// The back-alley exchange for AI trends, now in your AI assistant.
//
// Tools:
//   whats_pumping       — top BUY/STRONG_BUY tickers right now (the hidden gems)
//   should_i_post_about — signal + posting window for a specific AI topic
//   market_mood         — overall Fear&Greed + top mover + biggest dump

import { readFile, access } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_PATH = join(ROOT, 'data', 'data.json');

const SERVER_INFO = {
  name: 'trendhustler',
  version: '1.0.0',
  description: "The back-alley exchange for AI trends. Cop the gems before they go mainstream.",
};

const TOOLS = [
  {
    name: 'whats_pumping',
    description: "Returns the top trending AI topics that are still underground (BUY signals) — hidden gems before they go mainstream. Use this to find what to make content about right now.",
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'How many gems to return (default 5, max 15)', default: 5 },
        signal: { type: 'string', enum: ['all', 'STRONG_BUY', 'BUY'], description: "Filter by signal strength (default 'all' = BUY + STRONG_BUY)", default: 'all' },
      },
    },
  },
  {
    name: 'should_i_post_about',
    description: "Check if a specific AI topic is worth posting about right now. Returns signal (BUY/HOLD/SELL/RUG), saturation %, days before it goes mainstream, and a dealer verdict.",
    inputSchema: {
      type: 'object',
      required: ['topic'],
      properties: {
        topic: { type: 'string', description: "The AI topic to check (e.g. 'MCP servers', 'GraphRAG', 'voice agents', 'quantization')" },
      },
    },
  },
  {
    name: 'market_mood',
    description: "Overall AI trend market mood right now: Fear & Greed index, sentiment, hottest hidden gem, top mover, biggest dump, and breakdown of buy/hold/sell signals.",
    inputSchema: { type: 'object', properties: {} },
  },
];

// --- data helpers ---

let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 min

async function getData() {
  const now = Date.now();
  if (_cache && now - _cacheTime < CACHE_TTL) return _cache;
  try {
    const raw = await readFile(DATA_PATH, 'utf8');
    _cache = JSON.parse(raw);
    _cacheTime = now;
    return _cache;
  } catch {
    return null;
  }
}

function dataAge(iso) {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 90) return 'just refreshed';
  if (s < 5400) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

const SIG_EMOJI = { STRONG_BUY: '💎', BUY: '🟢', HOLD: '🟡', SELL: '🔴', RUG: '☠️' };
const VERDICTS = {
  STRONG_BUY: "Cop it NOW. Streets don't know yet.",
  BUY: "Get in before the normies catch on.",
  HOLD: "Peakin'. Ride it but watch ya back.",
  SELL: "Washed. Everybody and they grandma postin' this.",
  RUG: "Dead on arrival. Don't get caught holdin'.",
};

function formatTicker(t, rank) {
  const sig = SIG_EMOJI[t.signal] || '';
  const chg = t.dailyChangePct >= 0 ? `+${t.dailyChangePct}%` : `${t.dailyChangePct}%`;
  const win = t.postingWindowDays === 0 ? 'CLOSED — too late' : `~${t.postingWindowDays} days before mainstream`;
  const emerging = t.emerging ? ' ✨ FRESH OFF THE BLOCK' : '';
  const lines = [
    `${rank ? `${rank}. ` : ''}${sig} $${t.symbol} — ${t.label}${emerging}`,
    `   Signal: ${t.signal} | Price: $${t.price.toLocaleString()} (${chg} today) | Saturation: ${t.saturationPct}% mainstream`,
    `   Post window: ${win}`,
    `   Verdict: "${VERDICTS[t.signal]}"`,
    `   Confidence: ${t.confidence}`,
  ];
  if (t.evidence && t.evidence.length) {
    lines.push(`   Sources right now:`);
    t.evidence.slice(0, 3).forEach(e => lines.push(`     • [${e.source}] ${e.title}${e.points ? ` (${e.points} pts)` : ''}`));
  }
  return lines.join('\n');
}

// --- tool handlers ---

async function toolWhatsPumping(args) {
  const data = await getData();
  if (!data) return noData();
  const limit = Math.min(15, Math.max(1, args.limit ?? 5));
  const filter = args.signal ?? 'all';
  const tickers = data.tickers.filter(t =>
    filter === 'STRONG_BUY' ? t.signal === 'STRONG_BUY' :
    filter === 'BUY' ? t.signal === 'BUY' :
    t.signal === 'BUY' || t.signal === 'STRONG_BUY'
  ).slice(0, limit);

  if (!tickers.length) return { content: [{ type: 'text', text: "Ain't no product on the corner right now. All trends either peaking or washed. Try refreshing the data." }] };

  const lines = [
    `🕶️ TRENDHUSTLER — Cop Report (data ${dataAge(data.market.generatedAt)})`,
    `Market mood: ${data.market.sentiment} (Fear&Greed ${data.market.fearGreed})`,
    `${tickers.length} gems on the block right now:\n`,
    ...tickers.map((t, i) => formatTicker(t, i + 1)),
    `\nRun "should_i_post_about" with any of these for a detailed breakdown.`,
    `Live dashboard: https://trendhustler.hukot.net`,
  ];
  return { content: [{ type: 'text', text: lines.join('\n') }] };
}

async function toolShouldIPostAbout(args) {
  const topic = (args.topic || '').toLowerCase().trim();
  if (!topic) return { content: [{ type: 'text', text: 'Gimme a topic, playa. E.g. "MCP servers" or "voice agents".' }] };
  const data = await getData();
  if (!data) return noData();

  // Find best match: symbol, label, or alias substring match
  const scored = data.tickers.map(t => {
    const haystack = `${t.symbol} ${t.label}`.toLowerCase();
    const exactSym = topic === t.symbol.toLowerCase() ? 100 : 0;
    const labelInc = t.label.toLowerCase().includes(topic) ? 60 : 0;
    const topicInc = topic.split(' ').filter(w => w.length > 2).filter(w => haystack.includes(w)).length * 20;
    return { t, score: exactSym + labelInc + topicInc };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  if (!scored.length) {
    return { content: [{ type: 'text', text: `Yo, "${ args.topic }" ain't on the board right now. Could be too niche, too new, or just not poppin'. Check back after the next refresh, or try a broader term.` }] };
  }

  const { t } = scored[0];
  const sig = SIG_EMOJI[t.signal];
  const chg = t.dailyChangePct >= 0 ? `+${t.dailyChangePct}%` : `${t.dailyChangePct}%`;

  const lines = [
    `🕶️ TRENDHUSTLER — Should you post about "${args.topic}"?`,
    ``,
    `${sig} VERDICT: ${t.signal}`,
    `"${VERDICTS[t.signal]}"`,
    ``,
    `Topic: ${t.label}${t.emerging ? ' ✨ (fresh — just hit the underground)' : ''}`,
    `Hype price: $${t.price.toLocaleString()} (${chg} today)`,
    `Saturation: ${t.saturationPct}% mainstream coverage — ${t.saturationPct < 20 ? 'barely on the radar' : t.saturationPct < 45 ? 'warming up' : t.saturationPct < 68 ? 'peaking' : 'everybody got it'}`,
    `Post window: ${t.postingWindowDays === 0 ? '❌ CLOSED — already mainstream' : `⏳ ~${t.postingWindowDays} days left before the normies take over`}`,
    `Confidence: ${t.confidence}`,
    `Stage: ${t.stage}`,
    ``,
    `Where the buzz is coming from right now:`,
    ...Object.entries(t.breakdown).map(([src, n]) => `  • ${src}: ${n} mentions`),
    t.news?.now ? `  • mainstream media: ${t.news.now} articles` : '',
  ].filter(Boolean);

  if (t.evidence?.length) {
    lines.push('', 'Real sources (go make content from these):');
    t.evidence.slice(0, 4).forEach(e => {
      lines.push(`  [${e.source}] ${e.title}`);
      if (e.url) lines.push(`  ${e.url}`);
    });
  }

  lines.push('', `Data refreshed: ${dataAge(data.market.generatedAt)} | Dashboard: https://trendhustler.hukot.net`);
  return { content: [{ type: 'text', text: lines.join('\n') }] };
}

async function toolMarketMood() {
  const data = await getData();
  if (!data) return noData();
  const m = data.market;
  const lines = [
    `🕶️ TRENDHUSTLER — Market Mood (${dataAge(m.generatedAt)})`,
    ``,
    `Fear & Greed: ${m.fearGreed}/100 — ${m.sentiment}`,
    ``,
    `Signals breakdown:`,
    `  💎 STRONG BUY: ${m.counts.STRONG_BUY} topics`,
    `  🟢 BUY:        ${m.counts.BUY} topics`,
    `  🟡 HOLD:       ${m.counts.HOLD} topics`,
    `  🔴 SELL:       ${m.counts.SELL} topics`,
    `  ☠️ RUG:        ${m.counts.RUG} topics`,
    ``,
    m.hottestGem ? `💎 Hottest gem right now: $${m.hottestGem.symbol} (${m.hottestGem.label}) — underground, mainstream asleep` : '',
    m.topMover ? `🚀 Top mover: $${m.topMover.symbol} (${m.topMover.label}) ${m.topMover.change > 0 ? '+' : ''}${m.topMover.change}% today` : '',
    m.biggestDump ? `💀 Biggest dump: $${m.biggestDump.symbol} (${m.biggestDump.label}) ${m.biggestDump.change}% — do NOT post this` : '',
    ``,
    `Total tickers tracked: ${m.totalTickers}`,
    `Dashboard: https://trendhustler.hukot.net`,
  ].filter(s => s !== undefined && s !== null);
  return { content: [{ type: 'text', text: lines.join('\n') }] };
}

function noData() {
  return { content: [{ type: 'text', text: "No data on the corner right now. Run `npm run refresh` in the TrendHustler project to fetch fresh data, then try again." }] };
}

// --- MCP stdio protocol ---

function respond(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}
function respondError(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n');
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on('line', async (line) => {
  line = line.trim();
  if (!line) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return; }

  const { id, method, params } = msg;

  if (method === 'initialize') {
    respond(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: SERVER_INFO,
    });
    return;
  }

  if (method === 'notifications/initialized') return; // no response needed

  if (method === 'tools/list') {
    respond(id, { tools: TOOLS });
    return;
  }

  if (method === 'tools/call') {
    const name = params?.name;
    const args = params?.arguments ?? {};
    try {
      let result;
      if (name === 'whats_pumping') result = await toolWhatsPumping(args);
      else if (name === 'should_i_post_about') result = await toolShouldIPostAbout(args);
      else if (name === 'market_mood') result = await toolMarketMood();
      else { respondError(id, -32601, `Unknown tool: ${name}`); return; }
      respond(id, result);
    } catch (e) {
      respondError(id, -32000, `Tool error: ${e.message}`);
    }
    return;
  }

  if (id !== undefined) respondError(id, -32601, `Method not found: ${method}`);
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
