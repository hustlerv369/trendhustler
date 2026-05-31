// TrendHustler — bake data.json into a self-contained index.html
// Run: npm run build   (refresh first, then bake)

import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Built from an ASCII-only string so no raw line-separator chars live in this source.
const LINE_SEP = new RegExp('[\\u2028\\u2029]', 'g');

async function main() {
  const tpl = await readFile(join(root, 'web', 'template.html'), 'utf8');
  let data;
  try {
    data = await readFile(join(root, 'data', 'data.json'), 'utf8');
  } catch {
    console.error('data/data.json missing - run `npm run refresh` first.');
    process.exit(1);
  }

  // Inline the dataset so the file opens straight off disk (no server / CORS).
  // Escape chars that would break out of <script> or the JS parse:
  //   <            -> prevents a </script> breakout
  //   U+2028/2029  -> illegal as raw JS line terminators in source
  const safe = data
    .replace(/</g, '\\u003c')
    .replace(LINE_SEP, (c) => '\\u' + c.charCodeAt(0).toString(16));
  const out = tpl.replace('/*__DATA__*/null', `/*__DATA__*/${safe}`);
  await writeFile(join(root, 'index.html'), out, 'utf8');

  const kb = (Buffer.byteLength(out) / 1024).toFixed(0);
  let hasImg = true;
  try { await access(join(root, 'assets', 'hustler.png')); } catch { hasImg = false; }

  console.log(`Built index.html (${kb}KB, data inlined)`);
  console.log(hasImg ? 'mascot: assets/hustler.png OK' : 'assets/hustler.png missing - drop the mascot in.');
  console.log('Open index.html in a browser, or deploy the folder to Vercel.');
}

main().catch((e) => { console.error('build failed:', e); process.exit(1); });
