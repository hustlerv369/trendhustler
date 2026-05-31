// TrendHustler — pipeline orchestrator.
// Run: npm run refresh   ->   writes data/data.json
//
//   1. cop raw items from the underground (dev sources)
//   2. extract tickers (dictionary + emerging n-grams)
//   3. check mainstream coverage (Google News) for the loudest tickers
//   4. score -> price / signal / lifecycle
//   5. write data/data.json for the dashboard

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { fetchAllDevItems, fetchNewsCounts } from './sources.mjs';
import { extractTickers } from './extract.mjs';
import { computeScores } from './engine.mjs';
import { SOURCES, ENGINE } from './config.mjs';
import { pAll } from './util.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const verbose = process.argv.includes('--verbose');
const log = (...a) => console.log(...a);

function devNowCount(t) {
  return t.items.filter((it) => it.window === 'now' && SOURCES[it.source]?.camp === 'dev').length;
}

async function main() {
  const t0 = Date.now();
  log('🕶️  TrendHustler — working the corner...\n');

  log('① Copping goods from the underground:');
  const items = await fetchAllDevItems((m) => log(m));
  log(`   → ${items.length} raw items total\n`);

  log('② Cutting it into tickers...');
  const rawTickers = extractTickers(items);
  log(`   → ${rawTickers.length} tickers (${rawTickers.filter((t) => t.emerging).length} emerging)\n`);

  // Only spend mainstream lookups on the loudest tickers.
  const ranked = [...rawTickers].sort((a, b) => devNowCount(b) - devNowCount(a));
  const newsTargets = ranked.slice(0, ENGINE.MAX_NEWS_TICKERS);

  log(`③ Checking how mainstream they've gone (Google News x${newsTargets.length})...`);
  const newsResults = await pAll(
    newsTargets.map((t) => async () => [t.symbol, await fetchNewsCounts(t.newsQuery || t.label)]),
    6
  );
  const newsBySymbol = {};
  for (const r of newsResults) if (Array.isArray(r)) newsBySymbol[r[0]] = r[1];
  log(`   → mainstream coverage checked\n`);

  log('④ Running the numbers (velocity vs saturation)...');
  const { tickers, market } = computeScores(rawTickers, newsBySymbol);
  log(`   → ${tickers.length} tickers priced\n`);

  const out = {
    meta: {
      app: 'TrendHustler',
      tagline: "Your plug for AI trends nobody's seen yet.",
      generatedAt: market.generatedAt,
      windows: { nowDays: 2, baseDays: 7 },
      sources: Object.entries(SOURCES).map(([k, v]) => ({ key: k, ...v })),
      runtimeMs: Date.now() - t0,
    },
    market,
    tickers,
  };

  const dir = join(__dirname, '..', 'data');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'data.json'), JSON.stringify(out, null, 2), 'utf8');

  log(`✅ Wrote data/data.json in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  log(`\n📊 MARKET: ${market.sentiment} (F&G ${market.fearGreed}) | ` +
      `🟢 ${market.counts.STRONG_BUY + market.counts.BUY} buys · 🟡 ${market.counts.HOLD} holds · 🔴 ${market.counts.SELL + market.counts.RUG} dumps`);
  if (market.hottestGem) log(`💎 Hottest gem: $${market.hottestGem.symbol} (${market.hottestGem.label})`);
  if (market.topMover) log(`🚀 Top mover: $${market.topMover.symbol} ${market.topMover.change > 0 ? '+' : ''}${market.topMover.change}%`);

  if (verbose) {
    log('\nTOP 12 BY PRICE:');
    for (const t of tickers.slice(0, 12)) {
      log(`  $${t.symbol.padEnd(12)} ${String(t.price).padStart(5)} ${(t.dailyChangePct >= 0 ? '+' : '') + t.dailyChangePct}% ` +
          `sat${t.saturationPct}% [${t.signal}] ${t.stage}${t.emerging ? ' ✨' : ''}`);
    }
  }
}

main().catch((e) => { console.error('💥 pipeline failed:', e); process.exit(1); });
