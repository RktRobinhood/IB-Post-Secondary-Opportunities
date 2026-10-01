/**
 * Candidate degree photos from each degree's own page, for the degrees that
 * have none (owner, 1 October 2026: "it is the university's choice how they
 * picture it; we choose the most appropriate of those available and hold
 * quality requirements. A picture they picked that is not great is still
 * better than the placeholder").
 *
 *   node scripts/harvest-official-photos.mjs <cc>
 *
 * For every school degree in the country without a record in
 * data/programme-images.json, it reads the degree's `url`, lists the share
 * image and every <img>/<source> on it (scripts/lib/official-image.mjs), and
 * keeps the ones that pass the quality floor:
 *
 *   - a photograph (JPEG or WebP; not SVG, GIF or a PNG with transparency),
 *     at least MIN_WIDTH wide and within OFFICIAL_MAX_BYTES;
 *   - landscape enough to crop to 16:10 without losing the picture
 *     (width / height between MIN_RATIO and MAX_RATIO);
 *   - not a logo, icon, flag, avatar or placeholder by its address;
 *   - not the school's default: an address that more than one degree page at
 *     the school shows is its site template, not the picture of a degree;
 *   - not already used by another record.
 *
 * It writes docs/research/programme-images/official-candidates-<cc>.json and
 * a numbered contact sheet beside it (official-candidates-<cc>.jpg), one row
 * per degree. A person or the photo critic then picks one candidate per
 * degree, or none when every candidate fails a hard rule (a logo or text
 * slab, a broken or blank image, a portrait with no setting), and the picks
 * become official lines in schools-<cc>.jsonl. The critic chooses between
 * candidates; it does not veto the university's taste.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { programmePaths, pagedProgrammes } from '../src/lib/schools.mjs';
import { OFFICIAL_MAX_BYTES } from '../src/lib/data.mjs';
import { imagesOn, MIN_WIDTH, UA } from './lib/official-image.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const CC = process.argv[2];
// --why=<part of a key>: print every image those degrees' pages show and why each was dropped.
const WHY = (process.argv.find((a) => a.startsWith('--why=')) || '').slice(6);
if (!/^[a-z]{2}$/.test(CC || '')) { console.error('usage: node scripts/harvest-official-photos.mjs <cc>'); process.exit(1); }
const OUT = path.join(ROOT, 'docs', 'research', 'programme-images', `official-candidates-${CC}.json`);
const SHEET = OUT.replace(/\.json$/, '.jpg');

const MIN_RATIO = 1.2;
const MAX_RATIO = 3.2;
const PER_DEGREE = 4;
const NOT_A_PHOTO = /logo|icon|favicon|sprite|placeholder|avatar|flag|badge|emblem|herb|godlo|signet|qr[-_]|banner[-_]?default|default[-_]?(?:image|og|share)|share[-_]?default|og[-_]?default|blank|spacer|pixel|\.svg(?:$|\?)|\.gif(?:$|\?)/i;

const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'programme-images.json'), 'utf8'));
const usedUrls = new Set(Object.values(manifest).map((r) => r.url).filter(Boolean));
const official = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'official-images.json'), 'utf8').catch(() => '{}'));
for (const r of Object.values(official)) if (r?.url) usedUrls.add(r.url);

const get = async (url, accept) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 25_000);
  try { return await fetch(url, { headers: { ...UA, Accept: accept }, redirect: 'follow', signal: ctrl.signal }); }
  finally { clearTimeout(t); }
};

/** Probe one image: its served address, size and whether it is a photograph. */
const probed = new Map();
async function probe(url) {
  if (probed.has(url)) return probed.get(url);
  const job = (async () => {
    try {
      const res = await get(url, 'image/*');
      if (res.status !== 200) return { problem: `answers ${res.status}` };
      const type = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      if (!/^image\/(jpeg|jpg|webp|png)$/.test(type)) return { problem: `served as ${type || 'nothing'}` };
      if (Number(res.headers.get('content-length')) > OFFICIAL_MAX_BYTES) return { problem: 'over the byte ceiling' };
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > OFFICIAL_MAX_BYTES) return { problem: 'over the byte ceiling' };
      const meta = await sharp(buf).metadata();
      const turned = (meta.orientation || 1) >= 5;
      const width = turned ? meta.height : meta.width, height = turned ? meta.width : meta.height;
      if (type === 'image/png' && meta.hasAlpha) return { problem: 'a PNG with transparency (a graphic)' };
      if (!(width >= MIN_WIDTH)) return { problem: `${width} px wide` };
      const ratio = width / height;
      if (ratio < MIN_RATIO || ratio > MAX_RATIO) return { problem: `ratio ${ratio.toFixed(2)}` };
      // The importer names the address the image is served from.
      return { url: res.redirected && res.url ? res.url : url, width, height, bytes: buf.length, type, buf };
    } catch (e) { return { problem: e.name === 'AbortError' ? 'timed out' : e.message }; }
  })();
  probed.set(url, job);
  return job;
}

/* --- 1. The degrees without a photograph ------------------------------- */

const degrees = [];
for (const f of (await fs.readdir(path.join(ROOT, 'data', 'schools'))).filter((f) => f.startsWith(`${CC}-`) && f.endsWith('.json'))) {
  const school = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'schools', f), 'utf8'));
  for (const p of programmePaths(school.institution, pagedProgrammes(school))) {
    const key = `school-${school.institution}-${p.slug}`;
    if (manifest[key]) continue;
    degrees.push({ key, scope: `school:${school.institution}-${p.slug}`, school: school.institution, name: p.name, page: p.url || null });
  }
}
console.log(`${CC}: ${degrees.length} degrees without a photograph`);

/* --- 2. Every image each page shows ------------------------------------ */

// Pages beyond the one we link: a degree's faculty or programme page on the
// institution's own site, found by a researcher when the linked page is an
// admission system with no pictures (official-pages-<cc>.jsonl).
const extra = new Map();
for (const l of (await fs.readFile(path.join(ROOT, 'docs', 'research', 'programme-images', `official-pages-${CC}.jsonl`), 'utf8').catch(() => '')).split('\n')) {
  if (!l.trim()) continue;
  const { key, pages = [] } = JSON.parse(l);
  extra.set(key, pages.filter((u) => /^https:\/\//.test(u)));
}

const jobs = degrees.flatMap((d) => [...new Set([d.page, ...(extra.get(d.key) || [])].filter(Boolean))].map((page) => ({ d, page })));
for (const d of degrees) { d.found = []; if (!d.page && !extra.get(d.key)?.length) d.problem = 'no page'; }
let i = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (i < jobs.length) {
    const { d, page } = jobs[i++];
    try {
      const res = await get(page, 'text/html,application/xhtml+xml');
      if (res.status !== 200) { d.problem = `${page} answers ${res.status}`; continue; }
      for (const u of imagesOn(await res.text(), res.url || page)) {
        if (/^https:/.test(u) && !NOT_A_PHOTO.test(u)) d.found.push({ url: u, page });
      }
    } catch (e) { d.problem = `${page}: ${e.name === 'AbortError' ? 'timed out' : e.message}`; }
  }
}));

// An address more than TEMPLATE pages at the school show is its site
// template, not a picture of a degree. A faculty page two or three degrees
// share is allowed; the pick gives each picture to one degree only.
const TEMPLATE = 3;
const base = (d, u) => `${d.school} ${u.split('?')[0]}`;
// Counted in distinct pages, not degrees: four degrees of one faculty may
// share its page, and that is one page showing the picture, not a template.
const pagesShowing = new Map();
for (const d of degrees) for (const f of d.found) {
  if (!pagesShowing.has(base(d, f.url))) pagesShowing.set(base(d, f.url), new Set());
  pagesShowing.get(base(d, f.url)).add(f.page);
}
const seenAt = new Map([...pagesShowing].map(([k, v]) => [k, v.size]));

/** A 64-bit difference hash: the same picture at two sizes or two addresses hashes alike. */
async function dhash(buf) {
  const px = await sharp(buf).rotate().greyscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer();
  let bits = '';
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += px[y * 9 + x] < px[y * 9 + x + 1] ? '1' : '0';
  return bits;
}
const alikeHash = (a, b) => [...a].filter((c, k) => c !== b[k]).length <= 6;

/* --- 3. Probe, filter, keep the best few -------------------------------- */

for (const d of degrees) {
  const own = d.found.filter((f) => seenAt.get(base(d, f.url)) <= TEMPLATE && !usedUrls.has(f.url));
  if (WHY && d.key.includes(WHY)) {
    console.log(`\n${d.key} ${d.problem || ''}`);
    for (const f of d.found) {
      const shared = seenAt.get(base(d, f.url)) > TEMPLATE;
      const p = shared ? null : await probe(f.url);
      console.log(`  ${shared ? 'school-wide' : p.problem || `ok ${p.width}x${p.height}`}  ${f.url.slice(0, 150)}`);
    }
  }
  const kept = [];
  for (const f of own.slice(0, 30)) {
    const p = await probe(f.url);
    if (!p.url || usedUrls.has(p.url)) continue;
    const hash = p.hash || (p.hash = await dhash(p.buf));
    // One picture offered at several sizes: keep the widest copy.
    const twin = kept.find((k) => alikeHash(k.hash, hash));
    if (twin) { if (p.width > twin.width) kept.splice(kept.indexOf(twin), 1, { ...p, page: f.page }); continue; }
    kept.push({ ...p, page: f.page });
  }
  kept.sort((a, b) => b.width - a.width);
  d.candidates = kept.slice(0, PER_DEGREE);
  d.skippedShared = d.found.length - own.length;
}

// The same picture offered to two degrees: say so on the sheet, so the pick
// gives it to one.
const all = degrees.flatMap((d) => (d.candidates || []).map((c) => ({ d, c })));
for (const { d, c } of all) {
  const others = all.filter((o) => o.d !== d && alikeHash(o.c.hash, c.hash)).map((o) => o.d.key);
  if (others.length) c.alsoOn = [...new Set(others)];
}

const withAny = degrees.filter((d) => d.candidates?.length);
console.log(`${withAny.length} with at least one candidate; ${degrees.length - withAny.length} with none`);
for (const d of degrees.filter((d) => !d.candidates?.length)) {
  console.log(`  none  ${d.key}${d.problem ? ` (${d.problem})` : d.skippedShared ? ` (${d.skippedShared} school-wide images skipped)` : ''}`);
}

/* --- 4. The record and the contact sheet ------------------------------- */

// `row` is the degree's number on the sheet; candidate n is its column.
const record = degrees.map(({ key, scope, name, page, problem, candidates }) => ({
  key, scope, name, row: withAny.findIndex((d) => d.key === key) + 1 || null, linkedPage: page || null, problem: problem || null,
  candidates: (candidates || []).map(({ url, page: sourcePage, width, height, bytes, type, alsoOn }, n) => ({ n: n + 1, url, sourcePage, width, height, bytes, type, ...(alsoOn ? { alsoOn } : {}) })),
}));
await fs.writeFile(OUT, `${JSON.stringify(record, null, 2)}\n`);

// The sheet, in pages of ROWS_PER_SHEET so each can be judged at a legible size.
const TW = 320, TH = 200, LABEL = 340, PAD = 8, ROWS_PER_SHEET = 12;
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
for (const old of (await fs.readdir(path.dirname(SHEET))).filter((f) => f.startsWith(`official-candidates-${CC}`) && f.endsWith('.jpg'))) {
  await fs.rm(path.join(path.dirname(SHEET), old));
}
for (let from = 0; from < withAny.length; from += ROWS_PER_SHEET) {
  const rows = withAny.slice(from, from + ROWS_PER_SHEET);
  const W = LABEL + PER_DEGREE * (TW + PAD) + PAD, RH = TH + PAD;
  const layers = [];
  for (const [k, d] of rows.entries()) {
    const r = from + k, y = PAD + k * RH;
    const words = `${r + 1}. ${d.name}`.match(/.{1,30}(\s|$)/g) || [d.name];
    layers.push({ input: Buffer.from(`<svg width="${LABEL}" height="${TH}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fff"/>${
      words.slice(0, 4).map((w, j) => `<text x="8" y="${28 + j * 24}" font-family="Arial" font-size="19" font-weight="bold">${esc(w.trim())}</text>`).join('')
    }<text x="8" y="${TH - 12}" font-family="Arial" font-size="14" fill="#555">${esc(d.key.replace(/^school-/, ''))}</text></svg>`), left: 0, top: y });
    for (const [c, p] of d.candidates.entries()) {
      const tile = await sharp(p.buf).rotate().resize(TW, TH, { fit: 'cover' }).jpeg({ quality: 70 }).toBuffer();
      const x = LABEL + PAD + c * (TW + PAD);
      layers.push({ input: tile, left: x, top: y });
      layers.push({ input: Buffer.from(`<svg width="64" height="30" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="30" fill="#000" opacity="0.75"/><text x="8" y="22" font-family="Arial" font-size="18" fill="#fff">${r + 1}.${c + 1}</text></svg>`), left: x, top: y });
    }
  }
  const out = SHEET.replace(/\.jpg$/, `-${from / ROWS_PER_SHEET + 1}.jpg`);
  await sharp({ create: { width: W, height: PAD + rows.length * RH, channels: 3, background: '#ddd' } })
    .composite(layers).jpeg({ quality: 72 }).toFile(out);
  console.log(`sheet: ${path.relative(ROOT, out)} (rows ${from + 1}-${from + rows.length})`);
}
console.log(`candidates: ${path.relative(ROOT, OUT)}`);
