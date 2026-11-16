/** A photograph may be reused on another page, but never twice on one page. */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { imageElements } from './lib/built-images.mjs';
import { homeIndex, homeChunkCards } from './lib/home-cards.mjs';
import { choosePhoto, photoIdentity } from '../src/assets/js/photo-pools.js';
import { decodeEntities } from './lib/html-text.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist');
const hashes = new Map();
const normalize = src => { const i = String(src).indexOf('/assets/img/'); return i < 0 ? src : src.slice(i); };
const bytesHash = src => {
  const file = path.join(ROOT, 'src', normalize(src));
  return fs.existsSync(file) ? crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') : src;
};
const byBytes = new Map();
for (const name of ['images', 'programme-images']) {
  const records = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', `${name}.json`), 'utf8'));
  for (const r of Object.values(records).flatMap(r => [r, ...(r.gallery || [])])) {
    const hash = bytesHash(r.src);
    const identity = byBytes.get(hash) || r.page || hash;
    byBytes.set(hash, identity);
    for (const v of [r, ...(r.variants || [])]) hashes.set(v.src, identity);
  }
}
function duplicates(markup) {
  const seen = new Map();
  const bad = [];
  for (const image of imageElements(markup)) {
    const src = normalize(image.src);
    if (!/^\/assets\/img\/(?:places|programmes)\//.test(src)) continue;
    const key = hashes.get(src) || bytesHash(src);
    if (seen.has(key)) bad.push(`${src} repeats ${seen.get(key)}`);
    seen.set(key, src);
  }
  return bad;
}

// This rule is deliberately page-local. Variants and copied files still
// represent one photograph, while using it on a separate page is allowed.
const one = '<img src="/assets/img/places/fixture.webp" alt="">';
assert.deepEqual(duplicates(one), []);
assert.deepEqual(duplicates(one), []);
assert.equal(duplicates(one + one).length, 1);
const a = '/assets/img/places/fixture.webp';
const b = '/assets/img/places/fixture-480.webp';
hashes.set(a, 'fixture'); hashes.set(b, 'fixture');
assert.equal(duplicates(`<img src="${a}" alt=""><img src="${b}" alt="">`).length, 1);

function* htmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(file);
    else if (entry.name.endsWith('.html')) yield file;
  }
}
const bad = [];
let pages = 0;
for (const file of htmlFiles(DIST)) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(DIST, file);
  // Templates are separate display modes; their photographs are inert until
  // cloned, so check each mode independently of the initial document.
  const templates = [...html.matchAll(/<template\b[^>]*>([\s\S]*?)<\/template>/g)].map(m => m[1]);
  const visible = html.replace(/<template\b[^>]*>[\s\S]*?<\/template>/g, '');
  for (const [n, mode] of [visible, ...templates].entries()) {
    for (const issue of duplicates(mode)) bad.push(`${rel}${n ? ` template ${n}` : ''}: ${issue}`);
  }
  pages++;
}

const scriptData = (html, id) => JSON.parse(html.match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)</script>`))?.[1] || 'null');
const pageSize = 12;
function checkResultPages(name, items, pools, reserved = []) {
  if (!pools || !Object.keys(pools).length) { bad.push(`${name}: no client photo pools`); return; }
  const groups = [items];
  for (const property of ['field', 'country', 'institution']) {
    const grouped = new Map();
    for (const item of items) {
      const value = item[property];
      if (value) { if (!grouped.has(value)) grouped.set(value, []); grouped.get(value).push(item); }
    }
    groups.push(...grouped.values());
  }
  for (const group of groups) for (let n = 0; n < group.length; n += pageSize) {
    const used = new Set(reserved.map(photoIdentity));
    const shown = [];
    for (const item of group.slice(n, n + pageSize)) {
      const photo = choosePhoto(item.photo, item.field, used, pools);
      if (!photo) { bad.push(`${name}: exhausted ${item.field} pool on result page ${n / pageSize + 1}`); continue; }
      used.add(photoIdentity(photo.src));
      used.add(photoIdentity(photo));
      shown.push(`<img src="${photo.src}" alt="">`);
      if (!photo.credit?.text || !photo.credit?.url) bad.push(`${name}: replacement ${photo.src} has no credit`);
    }
    for (const problem of duplicates(shown.join(''))) bad.push(`${name}: ${problem}`);
  }
}
const home = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const homeData = scriptData(home, 'discover-data');
const homeCards = [...homeChunkCards(DIST).matchAll(/<article class="card[^>]*>[\s\S]*?<\/article>/g)].map(m => m[0]);
const homeFacts = homeIndex(DIST)?.cards || homeData?.cards || [];
checkResultPages('home', homeCards.map((card, i) => {
  const member = homeFacts[i]?.members[0] || {};
  const image = imageElements(card)[0];
  const credit = card.match(/<a class="photo-credit"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
  return { photo: image && { ...image, credit: credit ? { text: decodeEntities(credit[2].replace(/<[^>]+>/g, '')), url: decodeEntities(credit[1]) } : null }, field: member.f, country: member.d, institution: member.i };
}), homeIndex(DIST)?.photoPools);
const planner = fs.readFileSync(path.join(DIST, 'planner', 'index.html'), 'utf8');
checkResultPages('planner', (scriptData(planner, 'planner-opportunities') || []).map(o => ({
  photo: o.display?.backdrop, field: o.display?.field, country: o.destination, institution: o.institution,
})), scriptData(planner, 'planner-photo-pools'));
if (bad.length) {
  console.error(`${bad.length} same-page photo repeats:\n${bad.slice(0, 45).join('\n')}`);
  process.exit(1);
}
console.log(`No photograph repeats on any of ${pages} built pages; cross-page reuse is allowed.`);
