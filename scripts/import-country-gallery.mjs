/**
 * A country's further photographs: the gallery its card and its page's hero
 * cycle through (src/pages/destinations.mjs countrySlides).
 *
 * The owner, 1 October 2026: one photograph chosen for a whole country is a
 * bias; five, changing, promote the country. At this level the pictures are
 * student life, nature, culture and the country's character, never a
 * university: institutions have their own pages.
 *
 *   node scripts/import-country-gallery.mjs            # fetch every line, unsigned
 *   node scripts/import-country-gallery.mjs --sheet=<out.jpg>
 *   REVIEWER="…" node scripts/import-country-gallery.mjs --sign
 *
 * Reads docs/research/country-gallery/picks.jsonl, one line per photograph:
 *   {"country":"pl","commonsFile":"…","caption":"Kraków's Main Square","theme":"culture","why":"…"}
 * A line with "primary": true is the country's hero (a country with none yet).
 *
 * The research file is the source of truth: a gallery photograph whose line
 * is removed is removed from data/images.json and from disk on the next run,
 * so dropping a critic's reject is deleting its line. Each photograph is
 * stored to docs/IMAGE_STANDARD.md through scripts/lib/image-standard.mjs and
 * credited from Commons. Nothing is signed until --sign, which approves the
 * photographs that landed in the name REVIEWER gives.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { normalise, EXT } from './lib/image-standard.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PICKS = path.join(ROOT, 'docs', 'research', 'country-gallery', 'picks.jsonl');
const IMAGES = path.join(ROOT, 'data', 'images.json');
const DIR = path.join(ROOT, 'src', 'assets', 'img', 'places');
const UA = { 'User-Agent': 'ib-pathways/1.0 (school guidance site; country gallery) contact-via-github' };
const OPEN = /^(cc0|public domain|pd\b|cc by(-sa)? \d(\.\d)?|cc by(-sa)?$)/i;
const SIGN = process.argv.includes('--sign');
const SHEET = (process.argv.find((a) => a.startsWith('--sheet=')) || '').slice(8);
const REVIEWER = process.env.REVIEWER;
const TODAY = new Date().toISOString().slice(0, 10);
if (SIGN && !REVIEWER) { console.error('--sign needs REVIEWER="who judged them"'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const lines = (await fs.readFile(PICKS, 'utf8')).split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
const images = JSON.parse(await fs.readFile(IMAGES, 'utf8'));
const regionName = new Intl.DisplayNames(['en'], { type: 'region' });

async function info(file) {
  const q = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', titles: `File:${file}`, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1800' });
  for (let n = 1; n <= 5; n++) {
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${q}`, { headers: UA });
    if (res.ok) return (await res.json()).query?.pages?.[0]?.imageinfo?.[0] || null;
    await sleep(2000 * n);
  }
  return null;
}

async function store(i, out) {
  let res;
  for (let n = 1; n <= 5; n++) {
    res = await fetch(i.thumburl || i.url, { headers: UA });
    if (res.ok || (res.status !== 429 && res.status < 500)) break;
    await sleep(3000 * n);
  }
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  const stored = await normalise(Buffer.from(await res.arrayBuffer()));
  await fs.writeFile(out, stored.data);
  return stored;
}

const byCountry = new Map();
for (const l of lines) {
  if (!/^[a-z]{2}$/.test(l.country) || !l.commonsFile) throw new Error(`bad line: ${JSON.stringify(l)}`);
  if (!byCountry.has(l.country)) byCountry.set(l.country, []);
  byCountry.get(l.country).push({ ...l, commonsFile: l.commonsFile.replace(/^File:/, '') });
}

let added = 0, kept = 0, removed = 0, failed = 0, signed = 0;
for (const [cc, picks] of byCountry) {
  const record = images[cc] || null;
  const primary = picks.find((p) => p.primary);
  const held = new Map((record?.gallery || []).map((g) => [g.file, g]));
  const gallery = [];
  for (const p of picks) {
    const isPrimary = p === primary;
    const recorded = isPrimary ? (record?.file === p.commonsFile ? record : null) : held.get(p.commonsFile);
    // A record whose file is not on disk is fetched again, not trusted.
    const onDisk = recorded?.src && (await fs.stat(path.join(ROOT, 'src', recorded.src)).then(() => true, () => false));
    const prior = onDisk ? recorded : null;
    let entry = prior;
    if (!prior) {
      const i = await info(p.commonsFile);
      const licence = clean(i?.extmetadata?.LicenseShortName?.value);
      if (!i) { failed++; console.log(`  ${cc}: ${p.commonsFile} not found on Commons`); continue; }
      if (!OPEN.test(licence)) { failed++; console.log(`  ${cc}: ${p.commonsFile} licence "${licence}" is not open`); continue; }
      if (i.width < i.height) { failed++; console.log(`  ${cc}: ${p.commonsFile} is portrait`); continue; }
      const name = `${cc}-${crypto.createHash('sha1').update(p.commonsFile).digest('hex').slice(0, 8)}${EXT}`;
      try {
        const s = await store(i, path.join(DIR, name));
        const m = i.extmetadata || {};
        entry = {
          file: p.commonsFile,
          page: i.descriptionurl,
          author: clean(m.Artist?.value) || 'Unknown',
          licence,
          licenceUrl: m.LicenseUrl?.value || null,
          description: clean(m.ImageDescription?.value).slice(0, 220) || null,
          src: `/assets/img/places/${name}`,
          width: s.width, height: s.height, bytes: s.bytes,
          fetched: TODAY,
        };
        added++;
      } catch (e) { failed++; console.log(`  ${cc}: ${p.commonsFile} ${e.message}`); continue; }
    } else kept++;
    entry = { ...entry, caption: p.caption || null, theme: p.theme || null };
    if (SIGN && entry.review?.file !== entry.file) {
      entry.review = { state: 'approved', by: REVIEWER, at: TODAY, file: entry.file, note: p.why || 'Country gallery photograph.' };
      signed++;
    }
    if (isPrimary) {
      const { theme, ...hero } = entry;
      images[cc] = { ...hero, kind: 'country', subject: record?.subject || regionName.of(cc.toUpperCase()), gallery: record?.gallery || [] };
      // The hero it replaces keeps its place only as a line of its own; its old file goes.
      if (record?.src && record.src !== hero.src && !picks.some((x) => x.commonsFile === record.file)) {
        await fs.rm(path.join(ROOT, 'src', record.src), { force: true });
      }
    } else gallery.push(entry);
  }
  // A gallery photograph whose line is gone goes, with its file.
  for (const [file, g] of held) {
    // Still shown: kept in the gallery, or promoted to lead the country.
    if (gallery.some((x) => x.file === file) || images[cc]?.src === g.src) continue;
    removed++;
    await fs.rm(path.join(ROOT, 'src', g.src), { force: true });
  }
  if (images[cc]) images[cc].gallery = gallery;
  else if (gallery.length) console.log(`  ${cc}: no hero photograph to hang a gallery on; add a "primary" line`);
}
// What the first slide shows, for a hero that has no line of its own here.
const heroCaptions = JSON.parse(await fs.readFile(path.join(path.dirname(PICKS), 'hero-captions.json'), 'utf8').catch(() => '{}'));
for (const [cc, caption] of Object.entries(heroCaptions)) if (images[cc]?.kind === 'country') images[cc].caption = caption;
await fs.writeFile(IMAGES, `${JSON.stringify(images, null, 2)}\n`);
console.log(`gallery: ${added} added, ${kept} kept, ${removed} removed, ${failed} failed${SIGN ? `, ${signed} signed` : ''}`);

/* The contact sheet: one row per country, the hero then its gallery, as cards crop them. */
if (SHEET) {
  const TW = 360, TH = 225, LABEL = 150, PAD = 8, COLS = 5;
  const rows = [...byCountry.keys()].filter((cc) => images[cc]);
  const layers = [];
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  for (const [r, cc] of rows.entries()) {
    const y = PAD + r * (TH + PAD);
    layers.push({ input: Buffer.from(`<svg width="${LABEL}" height="${TH}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fff"/><text x="10" y="40" font-family="Arial" font-size="30" font-weight="bold">${cc.toUpperCase()}</text></svg>`), left: 0, top: y });
    const slides = [images[cc], ...(images[cc].gallery || [])].slice(0, COLS);
    for (const [c, s] of slides.entries()) {
      const x = LABEL + PAD + c * (TW + PAD);
      try {
        layers.push({ input: await sharp(path.join(ROOT, 'src', s.src)).resize(TW, TH, { fit: 'cover' }).jpeg({ quality: 70 }).toBuffer(), left: x, top: y });
      } catch { continue; }
      const label = `${r + 1}.${c + 1}${c ? ` ${s.caption || ''}` : ' (hero)'}`.slice(0, 40);
      layers.push({ input: Buffer.from(`<svg width="${TW}" height="26" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="26" fill="#000" opacity="0.7"/><text x="6" y="19" font-family="Arial" font-size="16" fill="#fff">${esc(label)}</text></svg>`), left: x, top: y + TH - 26 });
    }
  }
  await sharp({ create: { width: LABEL + PAD + COLS * (TW + PAD), height: PAD + rows.length * (TH + PAD), channels: 3, background: '#ddd' } })
    .composite(layers).jpeg({ quality: 70 }).toFile(SHEET);
  console.log(`sheet: ${SHEET}`);
}
