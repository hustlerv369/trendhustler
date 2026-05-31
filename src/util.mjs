// TrendHustler — shared utilities (fetch, time, text, concurrency)

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

export const nowMs = () => Date.now();
export const daysAgoMs = (d) => Date.now() - d * 24 * 60 * 60 * 1000;
export const daysAgoSec = (d) => Math.floor(daysAgoMs(d) / 1000);

// fetch with timeout + UA + basic retry
async function rawFetch(url, { headers = {}, timeoutMs = 15000, retries = 2 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': BROWSER_UA, ...headers },
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (attempt === retries) throw err;
      await sleep(400 * (attempt + 1));
    }
  }
}

export async function fetchJson(url, opts) {
  const res = await rawFetch(url, { headers: { Accept: 'application/json' }, ...opts });
  return res.json();
}

export async function fetchText(url, opts) {
  const res = await rawFetch(url, opts);
  return res.text();
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Run async tasks with a concurrency limit. tasks = array of () => Promise
export async function pAll(tasks, concurrency = 5) {
  const results = new Array(tasks.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
    while (i < tasks.length) {
      const idx = i++;
      try {
        results[idx] = await tasks[idx]();
      } catch (err) {
        results[idx] = { __error: err.message };
      }
    }
  });
  await Promise.all(workers);
  return results;
}

// Decode the handful of HTML/XML entities that show up in RSS titles.
export function decodeEntities(s = '') {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}

export function stripTags(s = '') {
  return decodeEntities(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

// Tiny XML helper: pull repeated <item>...</item> blocks and a tag's text.
export function rssItems(xml) {
  const items = [];
  const re = /<item\b[^>]*>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml))) items.push(m[1]);
  return items;
}
export function xmlTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!m) return '';
  return decodeEntities(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')).trim();
}

export const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// Atom feed helpers (Reddit / Product Hunt use <entry> not <item>).
export function atomEntries(xml) {
  return xml.split('<entry>').slice(1);
}
export function atomLink(block) {
  const m = block.match(/<link[^>]*href="([^"]+)"/i);
  return m ? decodeEntities(m[1]) : '';
}
