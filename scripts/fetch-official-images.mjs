/**
 * Collects each institution's own promotional imagery — and links to it rather
 * than copying it into this repository.
 *
 * Universities publish an Open Graph image on their admissions and programme
 * pages precisely so that the page looks right when someone shares it. That is
 * the institution's own marketing picture of itself, served from its own CDN,
 * and linking to it is what it is published for. So for institutions we prefer
 * that image, hot-linked, and fall back to a self-hosted Wikimedia Commons
 * photograph only where no official image can be found.
 *
 *   node scripts/fetch-official-images.mjs
 *   node scripts/fetch-official-images.mjs --refresh
 *   node scripts/fetch-official-images.mjs --only=dtu,cbs
 *   node scripts/fetch-official-images.mjs --verify     # re-check existing links still resolve
 *
 * Writes data/official-images.json. Anything that 404s later is caught by
 * `npm run check:links`, and the build silently falls back to the Commons photo.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'data', 'official-images.json');
const UA = {
  'User-Agent':
    'Mozilla/5.0 (compatible; ib-pathways/1.0; educational guidance site; +https://github.com/)',
  Accept: 'text/html,application/xhtml+xml',
};

const args = process.argv.slice(2);
const REFRESH = args.includes('--refresh');
const VERIFY_ONLY = args.includes('--verify');
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').replace('--only=', '').split(',').filter(Boolean);

const MIN_BYTES = 12_000;

/** Images that are logos, placeholders or share-button furniture rather than photographs. */
const REJECT = /logo|favicon|placeholder|default-share|sprite|icon|avatar|blank|spacer|1x1|pixel/i;

async function head(url) {
  try {
    const res = await fetch(url, { method: 'GET', headers: UA, redirect: 'follow' });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') || '';
    if (!/^image\//.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < MIN_BYTES) return null;
    return { type, bytes: buf.length, dims: dimensions(buf, type) };
  } catch {
    return null;
  }
}

/** Read width/height straight from the file header — no image library needed. */
function dimensions(buf, type) {
  try {
    if (/png/.test(type) && buf.length > 24) {
      return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    }
    if (/jpe?g/.test(type)) {
      let i = 2;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
        }
        i += 2 + len;
      }
    }
    if (/webp/.test(type) && buf.length > 30 && buf.toString('ascii', 12, 16) === 'VP8X') {
      return { w: (buf.readUIntLE(24, 3) & 0xffffff) + 1, h: (buf.readUIntLE(27, 3) & 0xffffff) + 1 };
    }
  } catch {}
  return null;
}

function metaImages(html, baseUrl) {
  const found = [];
  const push = (v) => {
    if (!v) return;
    try {
      const abs = new URL(v.trim().replace(/&amp;/g, '&'), baseUrl).href;
      if (!REJECT.test(abs)) found.push(abs);
    } catch {}
  };

  // og:image and twitter:image, in either attribute order.
  const patterns = [
    /<meta[^>]+property=["']og:image(?::url|:secure_url)?["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::url|:secure_url)?["']/gi,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html))) push(m[1]);
  }
  return [...new Set(found)];
}

async function officialImageFor(pages) {
  for (const pageUrl of pages.filter(Boolean)) {
    let html;
    try {
      const res = await fetch(pageUrl, { headers: UA, redirect: 'follow' });
      if (!res.ok) continue;
      html = await res.text();
    } catch {
      continue;
    }

    const title = (html.match(/<title[^>]*>([^<]{0,140})/i) || [])[1]?.trim() || null;

    for (const candidate of metaImages(html, pageUrl)) {
      const info = await head(candidate);
      if (!info) continue;
      // An og:image is usually 1200x630. Anything much smaller or portrait is
      // a logo card rather than a photograph of the place.
      if (info.dims && (info.dims.w < 600 || info.dims.w / info.dims.h < 1.1)) continue;
      return { url: candidate, sourcePage: pageUrl, pageTitle: title, ...info };
    }
  }
  return null;
}

async function targets() {
  const out = [];

  for (const f of await ls(path.join(ROOT, 'data', 'dk'))) {
    const i = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'dk', f), 'utf8'));
    out.push({
      key: i.id,
      label: i.name,
      pages: [i.admissionsUrl, i.website, i.ibPageUrl],
    });
    for (const p of i.programmes || []) {
      if (p.url) out.push({ key: p.id, label: `${i.shortName || i.name} — ${p.name}`, pages: [p.url] });
    }
  }

  for (const f of await ls(path.join(ROOT, 'data', 'countries'))) {
    const c = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'countries', f), 'utf8'));
    for (const i of c.institutions || []) {
      out.push({
        key: `${c.code}-${slug(i.shortName || i.name)}`,
        label: i.name,
        pages: [i.admissionsUrl, i.ibPageUrl, i.website],
      });
    }
  }

  const seen = new Set();
  return out.filter((t) => t.pages.some(Boolean) && (seen.has(t.key) ? false : seen.add(t.key)));
}

async function ls(dir) {
  try { return (await fs.readdir(dir)).filter((f) => f.endsWith('.json')); } catch { return []; }
}

function slug(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  let picks = {};
  try { picks = JSON.parse(await fs.readFile(OUT, 'utf8')); } catch {}

  if (VERIFY_ONLY) {
    let alive = 0, dead = [];
    for (const [key, v] of Object.entries(picks)) {
      const ok = await head(v.url);
      if (ok) alive++;
      else { dead.push(key); delete picks[key]; }
    }
    await fs.writeFile(OUT, JSON.stringify(picks, null, 2));
    console.log(`alive ${alive} · removed ${dead.length}`);
    if (dead.length) console.log('removed:', dead.join(', '));
    return;
  }

  const list = await targets();
  const wanted = ONLY.length ? list.filter((t) => ONLY.includes(t.key)) : list;
  console.log(`${wanted.length} targets\n`);

  let got = 0, kept = 0, none = 0;
  for (const t of wanted) {
    if (!REFRESH && picks[t.key]) { kept++; continue; }
    process.stdout.write(`  ${t.key.padEnd(34)}`);
    const hit = await officialImageFor(t.pages);
    if (hit) {
      picks[t.key] = {
        ...hit,
        subject: t.label,
        licence: 'Published by the institution as its own Open Graph share image; linked, not copied.',
        fetched: new Date().toISOString().slice(0, 10),
      };
      console.log(` ok  ${hit.dims ? `${hit.dims.w}×${hit.dims.h}` : ''}  ${hit.url.slice(0, 60)}`);
      got++;
      await fs.writeFile(OUT, JSON.stringify(picks, null, 2));
    } else {
      console.log(' — none');
      none++;
    }
  }

  await fs.writeFile(OUT, JSON.stringify(picks, null, 2));
  console.log(`\nfound ${got} · kept ${kept} · none ${none}`);
  console.log('Institutions without an official image fall back to the Wikimedia Commons photo.');
}

main().catch((e) => { console.error(e); process.exit(1); });
