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
 *   node scripts/fetch-official-images.mjs --report     # what is too heavy to publish
 *   node scripts/fetch-official-images.mjs --shrink     # ask their CDN for a smaller copy
 *   node scripts/fetch-official-images.mjs --missing    # where an official image would help most
 *
 * Writes data/official-images.json. Anything that 404s later is caught by
 * `npm run check:links`, and the build silently falls back to the Commons photo.
 *
 * These files are not put through the image standard, because they are not ours
 * to re-encode — we link to them where they are served. So they arrive at
 * whatever size the press office exported, and some are enormous: CBS publishes
 * its share images as 6720×4480 JPEGs of 20 MB. `picture()` declines to publish
 * anything over OFFICIAL_MAX_BYTES and falls back to the Commons photograph;
 * `--report` lists what that held back, so a person can find a smaller official
 * image for those pages.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { OFFICIAL_MAX_BYTES } from '../src/lib/data.mjs';
import { REVIEW_THRESHOLD, withheldLabel, withheldReason } from '../src/lib/imagery.mjs';

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
const REPORT_ONLY = args.includes('--report');
const SHRINK_ONLY = args.includes('--shrink');
const MISSING_ONLY = args.includes('--missing');
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

/**
 * Un-escape a URL taken out of an HTML attribute.
 *
 * Once is not enough: Malmö University publishes its og:image with the query
 * separator written as `&amp;amp;`, so a single pass leaves `&amp;` in the
 * stored URL, the template escapes it again on output, and the page ships
 * `&amp;amp;` — which the built-site checker catches as a double-escaped
 * entity. Loop until it stops changing.
 */
function unescapeUrl(value) {
  let out = String(value).trim();
  for (let i = 0; i < 4; i++) {
    const next = out
      .replace(/&amp;/gi, '&')
      .replace(/&#0*38;/g, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#0*39;|&apos;/gi, "'");
    if (next === out) break;
    out = next;
  }
  return out;
}

function metaImages(html, baseUrl) {
  const found = [];
  const push = (v) => {
    if (!v) return;
    try {
      const abs = new URL(unescapeUrl(v), baseUrl).href;
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

/**
 * Ask the institution's own CDN for a smaller copy.
 *
 * A press office exports at print size and the CMS serves it raw, so the best
 * picture of a place is often the one we cannot afford to show. Most content
 * platforms will resize on request, from the same server, which is theirs to do
 * and ours to link to: AAU's Umbraco turns a 7.4 MB JPEG into a 150 KB WebP.
 *
 * Servers that do not support a parameter mostly ignore it and return the
 * original, so a variant is only accepted if it actually came back smaller.
 */
const RESIZERS = [
  { name: 'umbraco/webp', params: { width: '1600', format: 'webp' } },
  { name: 'umbraco', params: { width: '1600' } },
  { name: 'imgix', params: { w: '1600', fm: 'webp' } },
  { name: 'wordpress', params: { resize: '1600,1000' } },
  { name: 'sitecore', params: { mw: '1600' } },
];

async function shrink(url, originalBytes) {
  for (const r of RESIZERS) {
    let candidate;
    try {
      const u = new URL(url);
      for (const [k, v] of Object.entries(r.params)) u.searchParams.set(k, v);
      candidate = u.href;
    } catch {
      continue;
    }
    const info = await head(candidate);
    if (!info) continue;
    // Ignored parameters come back as the original file, byte for byte.
    if (info.bytes >= originalBytes * 0.9) continue;
    if (info.bytes > OFFICIAL_MAX_BYTES) continue;
    if (info.dims && (info.dims.w < 600 || info.dims.w / info.dims.h < 1.1)) continue;
    return { url: candidate, resizedBy: r.name, ...info };
  }
  return null;
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
      kind: 'institution',
      key: i.id,
      label: i.name,
      pages: [i.admissionsUrl, i.website, i.ibPageUrl],
    });
    for (const p of i.programmes || []) {
      if (p.url) out.push({ kind: 'programme', key: p.id, label: `${i.shortName || i.name} — ${p.name}`, pages: [p.url] });
    }
  }

  for (const f of await ls(path.join(ROOT, 'data', 'countries'))) {
    const c = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'countries', f), 'utf8'));
    for (const i of c.institutions || []) {
      out.push({
        kind: 'institution',
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

  if (SHRINK_ONLY) {
    const heavy = Object.entries(picks).filter(([, v]) => typeof v.bytes === 'number' && v.bytes > OFFICIAL_MAX_BYTES);
    console.log(`${heavy.length} official image(s) over the ceiling\n`);
    let fixed = 0;
    for (const [key, v] of heavy) {
      process.stdout.write(`  ${key.padEnd(48)}`);
      const smaller = await shrink(v.url, v.bytes);
      if (!smaller) {
        console.log(` — its server will not resize; left on Commons`);
        continue;
      }
      picks[key] = { ...v, ...smaller, originalUrl: v.url, originalBytes: v.bytes };
      console.log(
        ` ${(v.bytes / 1048576).toFixed(1)} MB → ${(smaller.bytes / 1024).toFixed(0)} KB  via ${smaller.resizedBy}`
      );
      fixed++;
      await fs.writeFile(OUT, JSON.stringify(picks, null, 2));
    }
    await fs.writeFile(OUT, JSON.stringify(picks, null, 2));
    console.log(`\n${fixed} of ${heavy.length} recovered at a publishable size.`);
    return;
  }

  /**
   * Where an official image would do the most good.
   *
   * Issue #17's best single suggestion was to widen this script's coverage
   * before falling back to Commons, because a university's own picture of
   * itself is better than the best thing a heuristic can find in a category.
   * Re-running the fetch across every institution is 450 HTTP requests to 450
   * different press offices; this is the list that says which of them are worth
   * making first — the institutions whose Commons photograph the build is
   * currently withholding, or whose photograph is in the review queue.
   *
   * Reads local files only. No network.
   */
  if (MISSING_ONLY) {
    const images = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'images.json'), 'utf8'));
    const list = await targets();
    const rows = [];
    for (const t of list) {
      // Programme pages fall back to their institution's photograph, which is
      // the right answer rather than a gap, so they are not listed here.
      if (t.kind !== 'institution') continue;
      if (picks[t.key]) continue;                    // it already has an official image
      const commons = images[t.key];
      const reason = withheldReason(commons);
      const score = commons?.score;
      if (!commons) rows.push({ key: t.key, label: t.label, score: null, why: 'no picture at all' });
      else if (reason) rows.push({ key: t.key, label: t.label, score, why: withheldLabel(reason) });
      else if (typeof score === 'number' && score <= REVIEW_THRESHOLD)
        rows.push({ key: t.key, label: t.label, score, why: 'in the review queue' });
    }
    rows.sort((a, b) => (a.score ?? -1) - (b.score ?? -1));
    console.log(`\n${rows.length} institution(s) with no official image and a weak or withheld Commons photograph.\n`);
    for (const r of rows) {
      console.log(`  ${String(r.score ?? '—').padStart(4)}  ${r.key.padEnd(44)} ${r.why}`);
    }
    console.log(`\nFetch one with:  npm run images:official -- --only=<key>`);
    console.log(`An official image is preferred by picture() and is not measured against the score floor.\n`);
    return;
  }

  if (REPORT_ONLY) {
    const sized = Object.entries(picks).filter(([, v]) => typeof v.bytes === 'number');
    const heavy = sized.filter(([, v]) => v.bytes > OFFICIAL_MAX_BYTES).sort((a, b) => b[1].bytes - a[1].bytes);
    const mb = (b) => `${(b / 1048576).toFixed(1)} MB`;
    console.log(`${Object.keys(picks).length} official images · ${sized.length} report a size\n`);
    if (!heavy.length) {
      console.log(`All of them are within the ${mb(OFFICIAL_MAX_BYTES)} publication ceiling.`);
      return;
    }
    console.log(`Held back — over the ${mb(OFFICIAL_MAX_BYTES)} ceiling, so the page falls back to its`);
    console.log('Wikimedia photograph. Find a smaller official image and pin it by hand:\n');
    for (const [key, v] of heavy) {
      console.log(`  ${mb(v.bytes).padStart(9)}  ${v.dims ? `${v.dims.w}×${v.dims.h}`.padEnd(11) : ''.padEnd(11)}  ${key}`);
      console.log(`             ${v.sourcePage}`);
    }
    console.log(`\n${heavy.length} of ${sized.length} held back.`);
    return;
  }

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
