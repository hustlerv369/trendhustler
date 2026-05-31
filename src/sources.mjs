// TrendHustler — source connectors.
// Every connector returns a flat array of normalized items:
//   { source, title, text, url, ts (ms), points }
// We pull a WIDE recent net (covering NOW + BASE windows) and bucket by timestamp later.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fetchJson, fetchText, rssItems, xmlTag, stripTags, atomEntries, atomLink, daysAgoSec, daysAgoMs, sleep, pAll } from './util.mjs';
import { DEV_SEED_QUERIES, WINDOWS } from './config.mjs';

const execFileP = promisify(execFile);

const TOTAL_DAYS = WINDOWS.NOW_DAYS + WINDOWS.BASE_DAYS + 1; // a little slack

// ---------- Hacker News (Algolia) ----------
// We query the NOW and BASE windows separately so the baseline isn't starved
// (search_by_date only returns the most recent N hits, which would otherwise all land in NOW).
export async function fetchHackerNews() {
  const nowCut = daysAgoSec(WINDOWS.NOW_DAYS);
  const baseCut = daysAgoSec(WINDOWS.NOW_DAYS + WINDOWS.BASE_DAYS);
  const seen = new Map();
  const ranges = [
    `created_at_i>${nowCut}`,                          // NOW window
    `created_at_i>${baseCut},created_at_i<${nowCut}`,  // BASE window
  ];
  for (const q of DEV_SEED_QUERIES) {
    for (const filter of ranges) {
      const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=100&numericFilters=${encodeURIComponent(filter)}`;
      try {
        const data = await fetchJson(url);
        for (const h of data.hits || []) {
          if (!h.title || seen.has(h.objectID)) continue;
          seen.set(h.objectID, {
            source: 'hackernews',
            title: h.title,
            text: `${h.title} ${h.story_text || ''}`,
            url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
            ts: h.created_at_i * 1000,
            points: h.points || 0,
          });
        }
      } catch { /* skip query on failure */ }
    }
  }
  return [...seen.values()];
}

// ---------- GitHub (recently created repos, by stars) ----------
export async function fetchGitHub() {
  const since = new Date(daysAgoMs(TOTAL_DAYS)).toISOString().slice(0, 10);
  const queries = ['AI', 'LLM', 'agent'];
  const seen = new Map();
  for (const q of queries) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(`${q} created:>=${since}`)}&sort=stars&order=desc&per_page=50`;
    try {
      const data = await fetchJson(url, { headers: { Accept: 'application/vnd.github+json' } });
      for (const r of data.items || []) {
        if (seen.has(r.id)) continue;
        seen.set(r.id, {
          source: 'github',
          title: r.full_name,
          text: `${r.name} ${r.description || ''} ${(r.topics || []).join(' ')}`,
          url: r.html_url,
          ts: new Date(r.created_at).getTime(),
          points: r.stargazers_count || 0,
        });
      }
    } catch { /* skip */ }
    await sleep(1500); // be gentle with unauthenticated GitHub rate limit
  }
  return [...seen.values()];
}

// ---------- arXiv (recent AI papers) ----------
export async function fetchArxiv() {
  const url =
    'http://export.arxiv.org/api/query?search_query=' +
    encodeURIComponent('cat:cs.AI OR cat:cs.CL OR cat:cs.LG') +
    '&sortBy=submittedDate&sortOrder=descending&max_results=300';
  try {
    const xml = await fetchText(url);
    const entries = xml.split('<entry>').slice(1);
    return entries.map((e) => {
      const title = stripTags((e.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
      const summary = stripTags((e.match(/<summary>([\s\S]*?)<\/summary>/) || [])[1] || '');
      const published = (e.match(/<published>([\s\S]*?)<\/published>/) || [])[1] || '';
      const id = (e.match(/<id>([\s\S]*?)<\/id>/) || [])[1] || '';
      return {
        source: 'arxiv',
        title,
        text: `${title} ${summary}`,
        url: id.trim(),
        ts: published ? new Date(published).getTime() : Date.now(),
        points: 0,
      };
    }).filter((x) => x.title);
  } catch {
    return [];
  }
}

// ---------- Hugging Face (trending models = pure dev signal snapshot) ----------
export async function fetchHuggingFace() {
  try {
    const data = await fetchJson('https://huggingface.co/api/models?sort=trendingScore&limit=60');
    return (data || []).map((m) => ({
      source: 'huggingface',
      title: m.id,
      text: `${m.id} ${(m.tags || []).join(' ')} ${m.pipeline_tag || ''}`,
      url: `https://huggingface.co/${m.id}`,
      ts: Date.now(), // trending snapshot -> counts toward the NOW window
      points: m.likes || 0,
    }));
  } catch {
    return [];
  }
}

// ---------- Dev.to (recent AI articles) ----------
export async function fetchDevto() {
  const tags = ['ai', 'machinelearning', 'llm'];
  const seen = new Map();
  for (const tag of tags) {
    try {
      const arr = await fetchJson(`https://dev.to/api/articles?tag=${tag}&per_page=60`);
      for (const a of arr || []) {
        if (seen.has(a.id)) continue;
        seen.set(a.id, {
          source: 'devto',
          title: a.title,
          text: `${a.title} ${a.description || ''} ${(a.tag_list || []).join(' ')}`,
          url: a.url,
          ts: new Date(a.published_at || a.published_timestamp || Date.now()).getTime(),
          points: a.positive_reactions_count || 0,
        });
      }
    } catch { /* skip */ }
  }
  return [...seen.values()];
}

// ---------- Reddit (free .rss — bypasses the .json 403 bot-block) ----------
export async function fetchReddit() {
  const subs = ['LocalLLaMA', 'MachineLearning', 'singularity', 'OpenAI', 'artificial', 'StableDiffusion', 'ClaudeAI'];
  const out = [];
  for (const sub of subs) {
    try {
      const xml = await fetchText(`https://www.reddit.com/r/${sub}/hot.rss?limit=40`, { timeoutMs: 12000, retries: 1 });
      for (const e of atomEntries(xml)) {
        const title = stripTags(xmlTag(e, 'title'));
        if (!title) continue;
        const pub = xmlTag(e, 'updated') || xmlTag(e, 'published');
        out.push({
          source: 'reddit',
          title,
          text: `${title} ${stripTags(xmlTag(e, 'content')).slice(0, 240)}`,
          url: atomLink(e),
          ts: pub ? new Date(pub).getTime() : Date.now(),
          points: 0,
        });
      }
    } catch { /* skip sub */ }
  }
  return out;
}

// ---------- Product Hunt (free .feed — early product launches) ----------
export async function fetchProductHunt() {
  try {
    const xml = await fetchText('https://www.producthunt.com/feed', { timeoutMs: 12000, retries: 1 });
    return atomEntries(xml).map((e) => {
      const title = stripTags(xmlTag(e, 'title'));
      const pub = xmlTag(e, 'published') || xmlTag(e, 'updated');
      return {
        source: 'producthunt',
        title,
        text: `${title} ${stripTags(xmlTag(e, 'content')).slice(0, 240)}`,
        url: atomLink(e),
        ts: pub ? new Date(pub).getTime() : Date.now(),
        points: 0,
      };
    }).filter((x) => x.title);
  } catch {
    return [];
  }
}

// ---------- YouTube (free, via yt-dlp — our open-source "Apify replacement") ----------
// Mainstream/creator signal: what AI videos are pulling views right now.
// yt-dlp ships no API key; flat search is fast. Degrades to [] if yt-dlp isn't installed.
export async function fetchYouTube() {
  const queries = ['AI agents', 'LLM', 'AI tools', 'generative AI', 'machine learning', 'AI tutorial'];
  const seen = new Map();
  const runs = await pAll(
    queries.map((q) => async () => {
      try {
        const { stdout } = await execFileP(
          'yt-dlp',
          [`ytsearch15:${q}`, '--flat-playlist', '--dump-json', '--no-warnings'],
          { maxBuffer: 20 * 1024 * 1024, timeout: 30000 }
        );
        return stdout.trim().split('\n').map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      } catch {
        return [];
      }
    }),
    3
  );
  for (const v of runs.flat()) {
    const id = v.id || v.url;
    if (!id || seen.has(id)) continue;
    seen.set(id, {
      source: 'youtube',
      title: v.title || '',
      text: v.title || '',
      url: v.webpage_url || `https://www.youtube.com/watch?v=${id}`,
      ts: Date.now(), // flat search has no reliable upload date -> treat as NOW presence
      points: v.view_count || 0,
    });
  }
  return [...seen.values()].filter((x) => x.title);
}

// ---------- Google News (mainstream coverage per ticker) ----------
// Returns { now, base } article counts for a given query phrase, bucketed by pubDate.
export async function fetchNewsCounts(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`"${query}" AI`)}&hl=en-US&gl=US&ceid=US:en`;
  const nowCut = daysAgoMs(WINDOWS.NOW_DAYS);
  const baseCut = daysAgoMs(WINDOWS.NOW_DAYS + WINDOWS.BASE_DAYS);
  try {
    const xml = await fetchText(url, { timeoutMs: 12000, retries: 1 });
    let now = 0, base = 0;
    for (const block of rssItems(xml)) {
      const pub = xmlTag(block, 'pubDate');
      const ts = pub ? new Date(pub).getTime() : 0;
      if (ts >= nowCut) now++;
      else if (ts >= baseCut) base++;
    }
    return { now, base };
  } catch {
    return { now: 0, base: 0 };
  }
}

// Pull all dev-camp items concurrently.
export async function fetchAllDevItems(log = () => {}) {
  const jobs = [
    ['hackernews', fetchHackerNews],
    ['github', fetchGitHub],
    ['arxiv', fetchArxiv],
    ['huggingface', fetchHuggingFace],
    ['devto', fetchDevto],
    ['reddit', fetchReddit],
    ['producthunt', fetchProductHunt],
    ['youtube', fetchYouTube],
  ];
  const results = await pAll(
    jobs.map(([name, fn]) => async () => {
      const items = await fn();
      log(`  • ${name}: ${items.length} items`);
      return items;
    }),
    5
  );
  return results.flat().filter((x) => x && !x.__error);
}
