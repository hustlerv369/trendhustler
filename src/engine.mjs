// TrendHustler — the trend engine.
// Converts extracted tickers + mainstream coverage into prices, signals and lifecycle stages.
// This is the "brain": underground velocity vs mainstream saturation -> BUY / HOLD / DUMP.

import { SOURCES, ENGINE, WINDOWS } from './config.mjs';
import { clamp } from './util.mjs';

const EPS = 1e-6;

function weightedCount(items, window, camp) {
  let n = 0;
  for (const it of items) {
    if (it.window !== window) continue;
    const src = SOURCES[it.source];
    if (!src || src.camp !== camp) continue;
    n += src.weight;
  }
  return n;
}

function classify({ saturation, velocity, devVelocity, volume }) {
  const { SATURATION_RISING_MAX, SATURATION_PEAK_MAX, EMBRYO_MAX_VOLUME } = ENGINE;
  if (volume <= EMBRYO_MAX_VOLUME && devVelocity > 0 && saturation < SATURATION_RISING_MAX)
    return { stage: 'EMBRYO', signal: 'STRONG_BUY' };
  if (saturation < SATURATION_RISING_MAX && velocity > 0)
    return { stage: 'RISING', signal: 'BUY' };
  if (saturation < SATURATION_PEAK_MAX && velocity >= 0)
    return { stage: 'PEAKING', signal: 'HOLD' };
  if (saturation >= SATURATION_PEAK_MAX && velocity < 0)
    return { stage: 'DEAD', signal: 'RUG' };
  if (saturation >= SATURATION_PEAK_MAX)
    return { stage: 'SATURATED', signal: 'SELL' };
  return { stage: 'COOLING', signal: 'SELL' }; // fizzling in the underground
}

function postingWindow(saturation, hypeVelocity) {
  if (saturation >= ENGINE.SATURATION_PEAK_MAX) return 0; // CLOSED — already mainstream
  const gap = ENGINE.SATURATION_PEAK_MAX - saturation;
  const dailySatGrowth = Math.max(hypeVelocity, 0) * 0.1 + 0.01;
  return Math.round(clamp(gap / dailySatGrowth, 1, ENGINE.POSTING_WINDOW_CAP));
}

export function computeScores(tickers, newsBySymbol) {
  const scored = tickers.map((t) => {
    const devNow = weightedCount(t.items, 'now', 'dev');
    const devBase = weightedCount(t.items, 'base', 'dev');
    // Mainstream signal = Google News (per-ticker) + harvested mainstream sources (YouTube).
    const news = newsBySymbol[t.symbol] || { now: 0, base: 0 };
    const ytNow = weightedCount(t.items, 'now', 'mainstream');
    const ytBase = weightedCount(t.items, 'base', 'mainstream');

    const devNowRate = devNow / WINDOWS.NOW_DAYS;
    const devBaseRate = devBase / WINDOWS.BASE_DAYS;
    // Mainstream is damped so its raw firehose doesn't drown the underground signal.
    const hypeNowRate = ((news.now + ytNow) / WINDOWS.NOW_DAYS) * ENGINE.HYPE_SCALE;
    const hypeBaseRate = ((news.base + ytBase) / WINDOWS.BASE_DAYS) * ENGINE.HYPE_SCALE;

    const totalNowRate = devNowRate + hypeNowRate;
    const totalBaseRate = devBaseRate + hypeBaseRate;

    // Bounded momentum in (-1, 1): (now - base) / (now + base + SMOOTH). No more +999% blowups.
    const mom = (now, base) => (now - base) / (now + base + ENGINE.SMOOTH);
    const velocity = mom(totalNowRate, totalBaseRate);
    const devVelocity = mom(devNowRate, devBaseRate);
    const hypeVelocity = mom(hypeNowRate, hypeBaseRate);
    const saturation = hypeNowRate / (hypeNowRate + devNowRate + EPS);
    const volume = devNow;

    const { stage, signal } = classify({ saturation, velocity, devVelocity, volume });

    // per-source NOW breakdown (for the dashboard)
    const breakdown = {};
    for (const it of t.items) if (it.window === 'now') breakdown[it.source] = (breakdown[it.source] || 0) + 1;

    // evidence = top real links from dev sources in the NOW window
    const evidence = t.items
      .filter((it) => it.window === 'now' && SOURCES[it.source]?.camp === 'dev')
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, ENGINE.MAX_EVIDENCE_PER_TICKER)
      .map((it) => ({ source: it.source, title: it.title, url: it.url, points: it.points }));

    const rawItemCount = t.items.filter((it) => it.window === 'now').length + news.now;
    const confidence = rawItemCount >= 15 ? 'high' : rawItemCount >= 5 ? 'medium' : 'low';

    return {
      symbol: t.symbol,
      label: t.label,
      emerging: t.emerging,
      stage,
      signal,
      dailyChangePct: Math.round(clamp(velocity * 100, -99, 999)),
      saturationPct: Math.round(saturation * 100),
      devVelocityPct: Math.round(devVelocity * 100),
      hypeVelocityPct: Math.round(hypeVelocity * 100),
      postingWindowDays: postingWindow(saturation, hypeVelocity),
      confidence,
      breakdown,
      news,
      evidence,
      _rate: totalNowRate, // used for price scaling, stripped from final output
    };
  });

  // Scale a "stock price" across all tickers (sqrt for a nicer spread).
  const maxRate = Math.max(...scored.map((s) => s._rate), EPS);
  for (const s of scored) {
    const norm = Math.sqrt(s._rate) / Math.sqrt(maxRate);
    s.price = Math.round(ENGINE.PRICE_MIN + (ENGINE.PRICE_MAX - ENGINE.PRICE_MIN) * norm);
    delete s._rate;
  }

  // Rank: biggest absolute footprint first (the "TOP TRENDING NOW" order).
  scored.sort((a, b) => b.price - a.price);

  const market = buildMarketSummary(scored);
  return { tickers: scored, market };
}

function buildMarketSummary(scored) {
  const counts = { STRONG_BUY: 0, BUY: 0, HOLD: 0, SELL: 0, RUG: 0 };
  let velSum = 0, satSum = 0;
  for (const s of scored) {
    counts[s.signal] = (counts[s.signal] || 0) + 1;
    velSum += s.dailyChangePct;
    satSum += s.saturationPct;
  }
  const n = scored.length || 1;
  const meanVel = velSum / n;
  const meanSat = satSum / n;
  // Fear & Greed 0..100: more pumping + more saturation = greedier market.
  const fearGreed = Math.round(clamp(50 + meanVel * 0.25 + (meanSat - 40) * 0.6, 0, 100));

  const buys = scored.filter((s) => s.signal === 'STRONG_BUY' || s.signal === 'BUY');
  const hottestGem = [...scored].filter((s) => s.signal === 'STRONG_BUY')
    .sort((a, b) => b.devVelocityPct - a.devVelocityPct)[0] || buys.sort((a, b) => b.dailyChangePct - a.dailyChangePct)[0];
  const topMover = [...scored].sort((a, b) => b.dailyChangePct - a.dailyChangePct)[0];
  const biggestDump = [...scored].sort((a, b) => a.dailyChangePct - b.dailyChangePct)[0];

  return {
    generatedAt: new Date().toISOString(),
    totalTickers: scored.length,
    counts,
    fearGreed,
    sentiment: fearGreed >= 75 ? 'EXTREME GREED' : fearGreed >= 55 ? 'GREED' : fearGreed >= 45 ? 'NEUTRAL' : fearGreed >= 25 ? 'FEAR' : 'EXTREME FEAR',
    hottestGem: hottestGem ? { symbol: hottestGem.symbol, label: hottestGem.label } : null,
    topMover: topMover ? { symbol: topMover.symbol, label: topMover.label, change: topMover.dailyChangePct } : null,
    biggestDump: biggestDump ? { symbol: biggestDump.symbol, label: biggestDump.label, change: biggestDump.dailyChangePct } : null,
  };
}
