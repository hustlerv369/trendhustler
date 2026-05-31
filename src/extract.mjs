// TrendHustler — topic extraction.
// Turns a pile of raw items into "tickers" two ways:
//   1. Dictionary match against the curated TICKERS list.
//   2. Emerging n-gram detection — catches hot topics that AREN'T in the dictionary yet.
//      (This is the "hidden gem" radar: a brand-new term spiking in the underground.)

import { TICKERS, STOPWORDS, WINDOWS, ENGINE } from './config.mjs';
import { daysAgoMs } from './util.mjs';

function windowOf(ts) {
  const nowCut = daysAgoMs(WINDOWS.NOW_DAYS);
  const baseCut = daysAgoMs(WINDOWS.NOW_DAYS + WINDOWS.BASE_DAYS);
  if (ts >= nowCut) return 'now';
  if (ts >= baseCut) return 'base';
  return null; // outside both windows -> ignore
}

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function extractTickers(items) {
  const tickers = new Map(); // symbol -> { symbol, label, emerging, newsQuery, items:[] }
  const ensure = (symbol, label, emerging, newsQuery) => {
    if (!tickers.has(symbol)) tickers.set(symbol, { symbol, label, emerging, newsQuery, items: [] });
    return tickers.get(symbol);
  };

  // Pre-pack alias list. newsQuery = the canonical (first) alias — a clean phrase for Google News.
  const labelClean = (l) => l.split('/')[0].replace(/\(.*?\)/g, '').trim();
  const dict = Object.entries(TICKERS).map(([symbol, { label, aliases }]) => ({
    symbol, label, aliases,
    newsQuery: (aliases[0] || '').trim() || labelClean(label),
  }));

  // For emerging detection: track candidate terms seen in the NOW window.
  const ngrams = new Map(); // term -> { items:Set(idx), sources:Set(source) }
  const noteNgram = (term, idx, source) => {
    if (!ngrams.has(term)) ngrams.set(term, { items: new Set(), sources: new Set() });
    const e = ngrams.get(term);
    e.items.add(idx);
    e.sources.add(source);
  };

  items.forEach((item, idx) => {
    const win = windowOf(item.ts);
    if (!win) return;
    const text = ` ${(item.text || item.title || '').toLowerCase()} `;
    const compact = { source: item.source, window: win, points: item.points || 0, title: item.title, url: item.url };

    // 1) dictionary match
    for (const { symbol, label, aliases, newsQuery } of dict) {
      if (aliases.some((a) => text.includes(a))) {
        ensure(symbol, label, false, newsQuery).items.push(compact);
      }
    }

    // 2) emerging-term harvesting (NOW window only, from titles)
    //    Only two candidate shapes survive — everything else is English noise:
    //      • bigrams where BOTH words are non-stopword content words (e.g. "world model")
    //      • single tokens containing a digit or hyphen (e.g. "gpt-4o", "qwen3", "olmo-2")
    if (win === 'now') {
      const title = (item.title || '').toLowerCase();
      const words = title.replace(/[^a-z0-9\s.+#-]/g, ' ').split(/\s+/).filter(Boolean);
      const cands = new Set();
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (w.length >= 3 && /[\d-]/.test(w) && !/^[\d.]+$/.test(w) && !STOPWORDS.has(w)) cands.add(w);
        if (i + 1 < words.length) {
          const w2 = words[i + 1];
          if (w.length >= 3 && w2.length >= 3 && !STOPWORDS.has(w) && !STOPWORDS.has(w2)) {
            cands.add(`${w} ${w2}`);
          }
        }
      }
      for (const term of cands) noteNgram(term, idx, item.source);
    }
  });

  // Promote emerging terms: enough distinct items AND cross-source corroboration, not already a dict alias.
  const dictAliasBlob = dict.flatMap((d) => d.aliases).join(' | ');
  const emergingTerms = [...ngrams.entries()]
    .filter(([term, e]) =>
      e.items.size >= ENGINE.EMERGING_MIN_DOCS &&
      e.sources.size >= ENGINE.EMERGING_MIN_SOURCES &&
      !dictAliasBlob.includes(term))
    .sort((a, b) => b[1].items.size - a[1].items.size)
    .slice(0, ENGINE.EMERGING_MAX);

  for (const [term, e] of emergingTerms) {
    const symbol = term.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
    if (!symbol || tickers.has(symbol)) continue;
    const t = ensure(symbol, titleCase(term), true, term);
    for (const idx of e.items) {
      const item = items[idx];
      t.items.push({ source: item.source, window: 'now', points: item.points || 0, title: item.title, url: item.url });
    }
  }

  return [...tickers.values()];
}
