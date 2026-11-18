/**
 * Country slideshow photographs: one list per country in data/images.json
 * (`<code>.gallery`), files in src/assets/img/places/. Nothing is hard-coded
 * in the templates; the country page shows the lead photo plus this list.
 *
 *   node scripts/country-photos.mjs add dk "File:Odense Domkirke.jpg" "Odense cathedral"
 *   node scripts/country-photos.mjs remove dk "Odense cathedral"      # caption, or index (1-based)
 *   node scripts/country-photos.mjs list dk
 *   node scripts/country-photos.mjs fill dk se ...|--all [--max 12] [--dry]
 *
 * `fill` looks for a Wikimedia Commons photograph (CC BY, CC BY-SA, CC0 or
 * public domain, landscape, at least 1400px) of each city that has a
 * university but no slide yet, most institutions first, up to --max slides.
 * Read the captions it prints and `remove` anything unsuitable.
 * Needs sharp (authoring tool only).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { normalise } from './lib/image-standard.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PICKS = path.join(ROOT, 'data', 'images.json');
const IMG = path.join(ROOT, 'src', 'assets', 'img', 'places');
const UA = 'IBPathwaysPhotoTool/1.0 (educational site; photo attribution kept in data/images.json)';
const OK_LICENCE = /^(CC BY(-SA)? [\d.]+|CC0|Public domain|PD)/i;
const BAD_TITLE = /\b(map|logo|flag|coat|seal|diagram|plan|stamp|poster|portrait|interior|inside|panorama|night|crest|sign|bus|train|tram|metro|station|car|statue|bust|grave|menu|people|crowd|protest|demo)\b/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const read = () => JSON.parse(fs.readFileSync(PICKS, 'utf8'));
const write = (d) => fs.writeFileSync(PICKS, JSON.stringify(d, null, 2) + '\n');
const strip = (h) => String(h || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

async function api(params) {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  for (const [k, v] of Object.entries({ format: 'json', ...params })) u.searchParams.set(k, v);
  for (let i = 0; i < 5; i++) {
    const r = await fetch(u, { headers: { 'user-agent': UA } });
    if (r.status === 429) { await sleep(4000 * (i + 1)); continue; }
    if (!r.ok) throw new Error(`Commons ${r.status}`);
    return r.json();
  }
  throw new Error('Commons rate limit');
}

function toCandidate(p) {
  const ii = p.imageinfo?.[0];
  if (!ii) return null;
  const m = ii.extmetadata || {};
  return {
    title: p.title,
    page: ii.descriptionurl,
    thumb: ii.thumburl?.replace('//thumb.wikimedia.org/', '//upload.wikimedia.org/').replace(/\?.*$/, ''),
    original: ii.url?.replace(/\?.*$/, ''),
    width: ii.width, height: ii.height, mime: ii.mime,
    author: strip(m.Artist?.value) || 'Unknown',
    licence: strip(m.LicenseShortName?.value),
    licenceUrl: m.LicenseUrl?.value || '',
    description: strip(m.ImageDescription?.value).slice(0, 140) || p.title.replace(/^File:/, '').replace(/\.\w+$/, ''),
  };
}

async function byTitle(title) {
  const j = await api({ action: 'query', titles: title, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: 1920 });
  return toCandidate(Object.values(j.query.pages)[0]);
}

async function search(q) {
  const j = await api({ action: 'query', generator: 'search', gsrnamespace: 6, gsrsearch: q, gsrlimit: 25, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: 1920 });
  return Object.values(j.query?.pages || {}).sort((a, b) => a.index - b.index).map(toCandidate).filter(Boolean);
}

async function store(code, c, caption) {
  let res;
  for (const u of [c.thumb, c.original].filter(Boolean)) {
    res = await fetch(u, { headers: { 'user-agent': UA } }).catch(() => null);
    if (res?.ok) break;
  }
  if (!res?.ok) throw new Error(`download failed for ${c.title}`);
  const out = await normalise(Buffer.from(await res.arrayBuffer()));
  const hash = crypto.createHash('sha1').update(c.page).digest('hex').slice(0, 8);
  const file = `${code}-${hash}.webp`;
  fs.writeFileSync(path.join(IMG, file), out.data);
  return {
    src: `/assets/img/places/${file}`, page: c.page, author: c.author, licence: c.licence, licenceUrl: c.licenceUrl,
    description: c.description, width: out.width, height: out.height, caption,
  };
}

function cities(code) {
  const n = new Map();
  for (const f of fs.readdirSync(path.join(ROOT, 'data', 'schools'))) {
    if (!f.endsWith('.json')) continue;
    const s = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'schools', f), 'utf8'));
    if ((s.country || '').toLowerCase() !== code || !s.city) continue;
    const city = s.city.split(',')[0].trim();
    n.set(city, (n.get(city) || 0) + 1);
  }
  return [...n].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([c]) => c);
}

const fold = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

async function fill(code, max, dry, data) {
  const rec = data[code];
  if (!rec?.src) return console.log(`${code}: no lead photograph, skipped`);
  rec.gallery ||= [];
  const have = () => [rec, ...rec.gallery].map((g) => fold(`${g.caption || ''} ${g.description || ''}`)).join(' | ');
  const tried = new Set([rec.page, ...rec.gallery.map((g) => g.page)]);
  for (const city of cities(code)) {
    if (1 + rec.gallery.length >= max) break;
    if (have().includes(fold(city))) continue;
    let pick;
    for (const q of [`${city} filetype:bitmap`, `${city} skyline OR cathedral OR university OR square`]) {
      const found = await search(q); await sleep(700);
      pick = found.find((c) => !tried.has(c.page) && c.mime === 'image/jpeg' && c.width >= 1400 && c.width / c.height >= 1.3
        && OK_LICENCE.test(c.licence) && fold(c.title).includes(fold(city)) && !BAD_TITLE.test(c.title));
      if (pick) break;
    }
    if (!pick) { console.log(`${code} ${city}: nothing suitable`); continue; }
    tried.add(pick.page);
    const caption = `${city}`;
    console.log(`${code} ${city}: ${pick.title} (${pick.licence})`);
    if (!dry) {
      try { rec.gallery.push(await store(code, pick, caption)); write(data); }
      catch (e) { console.log(`  ${e.message}`); }
      await sleep(500);
    }
  }
}

const [cmd, ...rest] = process.argv.slice(2);
const flag = (n, d) => { const i = rest.indexOf(n); if (i < 0) return d; const v = rest[i + 1]; rest.splice(i, 2); return v; };
const data = read();
if (cmd === 'add') {
  const [code, title, caption] = rest;
  const c = await byTitle(title.startsWith('File:') ? title : `File:${title}`);
  if (!c || !OK_LICENCE.test(c.licence)) throw new Error(`not found or licence not allowed: ${c?.licence}`);
  (data[code].gallery ||= []).push(await store(code, c, caption || c.description));
  write(data); console.log(`added to ${code}: ${caption}`);
} else if (cmd === 'remove') {
  const [code, which] = rest; const g = data[code].gallery || [];
  const i = /^\d+$/.test(which) ? Number(which) - 1 : g.findIndex((x) => x.caption === which);
  if (i < 0 || !g[i]) throw new Error('no such slide');
  const [gone] = g.splice(i, 1);
  const used = Object.values(data).some((r) => r !== data[code] && [r, ...(r.gallery || [])].some((x) => x.src === gone.src)) || g.some((x) => x.src === gone.src);
  if (!used) fs.rmSync(path.join(ROOT, 'src', gone.src), { force: true });
  write(data); console.log(`removed ${gone.caption}`);
} else if (cmd === 'list') {
  for (const code of rest) { console.log(code); [data[code], ...(data[code].gallery || [])].forEach((g, i) => console.log(`  ${i}. ${g.caption}  — ${g.author}, ${g.licence}`)); }
} else if (cmd === 'fill') {
  const max = Number(flag('--max', 12)); const dry = rest.includes('--dry') && rest.splice(rest.indexOf('--dry'), 1);
  const all = rest.includes('--all');
  const codes = all ? Object.keys(data).filter((k) => /^[a-z]{2}$/.test(k)) : rest;
  for (const code of codes) await fill(code, max, !!dry, data);
} else { console.error('usage: add | remove | list | fill (see file header)'); process.exit(1); }
