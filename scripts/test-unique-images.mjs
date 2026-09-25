/**
 * No decorative photograph appears twice.
 *
 * The owner, 25 September 2026: "We can't have repeated pictures. It seems
 * silly if multiple programmes have the same image." And: eye candy is not
 * the same thing over and over. This guard makes that a property of the build
 * rather than a hope:
 *
 *   1. **Programme cards.** Every card (a programme, or a family of paths that
 *      share one card — src/lib/families.mjs) resolves one background, and no
 *      two cards resolve to the same picture. "Same" is by the bytes on disk
 *      (SHA-1), not by name, so a file copied under a new key is still caught.
 *   2. **Site-wide.** Every hosted photograph a page shows — country heroes,
 *      institution photographs, gallery slides and card backgrounds — has
 *      bytes no other slot has. Hot-linked institution share images are
 *      compared by URL, and may only repeat within one programme family.
 *   3. **Built pages.** On every built page, no two programme cards that are
 *      different cards draw the same background, and the finder and planner
 *      data agree with the cards.
 *   4. **No special cases.** src/lib/families.mjs and the resolver name no
 *      programme, institution or country.
 *
 * A deliberate repeat goes in scripts/lib/unique-images-allow.json with a
 * reason; nothing else passes. It reads dist/, so it runs in the built stage.
 */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { load } from '../src/lib/data.mjs';
import { cardKey, families } from '../src/lib/families.mjs';
import { entries, publishable } from '../src/lib/imagery.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const ALLOW = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'lib', 'unique-images-allow.json'), 'utf8'));

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message.split('\n').join('\n          ')}`);
  }
};

console.log('\nNo photograph twice\n');

const site = await load();
const programmes = [...site.graph.programmes.values()];
const cardOf = new Map(programmes.map((p) => [p.id, cardKey(p)]));
const oppCard = new Map([...site.graph.opportunities.values()].map((o) => [o.id, cardOf.get(o.programme)]));

const hashCache = new Map();
function hashOf(src) {
  if (!src) return null;
  if (!hashCache.has(src)) {
    const f = path.join(ROOT, 'src', ...String(src).split('/').filter(Boolean));
    hashCache.set(src, fs.existsSync(f) ? crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex') : null);
  }
  return hashCache.get(src);
}
const allowed = (value, slots) =>
  ALLOW.some((a) => (a.hash === value || a.url === value) && a.reason && slots.every((s) => (a.slots || []).includes(s)));

/* --- 1. Programme cards ------------------------------------------------- */

const cards = new Map();
for (const p of site.programmes) {
  const k = cardOf.get(p.programmeId || p.id) || p.id;
  if (!cards.has(k)) cards.set(k, new Set());
  cards.get(k).add(p.backdrop?.src || null);
}

check('every card resolves exactly one background', () => {
  const bad = [...cards].filter(([, s]) => s.size !== 1 || s.has(null)).map(([k, s]) => `${k}: ${[...s].join(' | ') || 'none'}`);
  assert.deepEqual(bad, []);
});

check('no two programme cards show the same photograph (by content)', () => {
  const byHash = new Map();
  for (const [k, s] of cards) {
    const src = [...s][0];
    const h = hashOf(src);
    if (!h) continue;
    if (!byHash.has(h)) byHash.set(h, []);
    byHash.get(h).push(`${k} (${src.split('/').pop()})`);
  }
  const bad = [...byHash]
    .filter(([h, ks]) => ks.length > 1 && !allowed(h, ks.map((x) => `card:${x.split(' ')[0]}`)))
    .map(([h, ks]) => `${h.slice(0, 10)} on ${ks.length} cards: ${ks.join(', ')}`);
  const short = new Map();
  for (const line of bad) for (const k of line.split(': ')[1].split(', ')) {
    const f = site.graph.programmes.get(k.split(' ')[0])?.field?.primary
      || [...families(programmes).values()].find((x) => x.id === k.split(' ')[0])?.members[0]?.field?.primary;
    short.set(f, (short.get(f) || 0) + 1);
  }
  assert.deepEqual(bad, [], `add a programme picture or grow the field pool (data/programme-images.json); cards per field in repeats: ${[...short].map(([f, n]) => `${f} ${n}`).join(', ')}`);
});

check('every family draws its one picture from its primary path when that path has one', () => {
  const bad = [];
  for (const fam of families(programmes).values()) {
    const own = Object.values(site.programmeImages || {}).find((r) => r.scope === `programme:${fam.primary.id}` && publishable(r));
    const shown = site.programmes.find((p) => (p.programmeId || p.id) === fam.primary.id)?.backdrop?.src;
    if (own && shown !== own.src) bad.push(`${fam.id}: shows ${shown}, primary's own is ${own.src}`);
  }
  assert.deepEqual(bad, []);
});

/* --- 2. Site-wide ------------------------------------------------------- */

check('no hosted photograph fills two slots anywhere on the site', () => {
  const slots = new Map();
  const add = (h, slot) => {
    if (!h) return;
    if (!slots.has(h)) slots.set(h, new Set());
    slots.get(h).add(slot);
  };
  for (const e of entries(site.images)) {
    if (!e.pick?.src || e.pick.review?.state === 'rejected') continue;
    add(hashOf(e.pick.src), `place:${e.key}`);
  }
  for (const [k, s] of cards) add(hashOf([...s][0]), `card:${k}`);
  const bad = [...slots]
    .filter(([h, s]) => s.size > 1 && !allowed(h, [...s]))
    .map(([h, s]) => `${h.slice(0, 10)}: ${[...s].join(', ')}`);
  assert.deepEqual(bad, []);
});

check('an institution share image repeats only within one programme family', () => {
  /* The share image a programme's page actually shows: picture() in
     src/lib/data.mjs, which tries the id, then without the country prefix,
     then without the intake. Records no page reaches are not shown. */
  const store = site.officialImages || {};
  const shownFor = (id) => {
    const noPrefix = id.replace(/^[a-z]{2}-/, '');
    const noIntake = (s) => s.replace(/-\d{4}-(?:autumn|spring|summer|winter)$/, '');
    for (const k of [id, noPrefix, noIntake(id), noIntake(noPrefix)]) {
      const r = store[k];
      if (r?.url && r.review?.state !== 'rejected') return r.url;
    }
    return null;
  };
  const byUrl = new Map();
  for (const o of site.graph.opportunities.values()) {
    const u = shownFor(o.id) || shownFor(o.programme);
    if (!u) continue;
    if (!byUrl.has(u)) byUrl.set(u, new Map());
    byUrl.get(u).set(oppCard.get(o.id), o.id);
  }
  const bad = [];
  for (const [u, m] of byUrl) {
    if (m.size < 2) continue;
    const slots = [...m.keys()].map((k) => `card:${k}`);
    if (!allowed(u, slots)) bad.push(`${u.slice(0, 90)}: ${[...m.values()].join(', ')}`);
  }
  assert.deepEqual(bad, []);
});

/* --- 3. Built pages ----------------------------------------------------- */

function* htmlFiles(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(f);
    else if (e.name.endsWith('.html')) yield f;
  }
}

check('on every built page, two different cards never draw one background', () => {
  assert.ok(fs.existsSync(DIST), 'dist/ is not built');
  const bad = [];
  let pages = 0;
  for (const f of htmlFiles(DIST)) {
    const text = fs.readFileSync(f, 'utf8');
    if (!text.includes('data-backdrop=')) continue;
    pages++;
    const seen = new Map();
    const re = /<article class="card[^"]*card--backdrop">([\s\S]*?)<\/article>/g;
    for (let m; (m = re.exec(text)); ) {
      const key = (m[1].match(/data-backdrop="([^"]+)"/) || [])[1];
      const id = (m[1].match(/\/programmes\/([a-z0-9-]+)\//) || [])[1];
      if (!key || !id) continue;
      const card = oppCard.get(id) || cardOf.get(id) || id;
      if (!seen.has(key)) seen.set(key, new Set());
      seen.get(key).add(card);
    }
    for (const [key, cs] of seen) if (cs.size > 1) bad.push(`${path.relative(DIST, f)}: ${key} on ${[...cs].join(', ')}`);
  }
  assert.ok(pages > 0, 'no built page carries a card background');
  assert.deepEqual(bad, []);
});

check('the finder and planner data give different cards different backgrounds', () => {
  const bad = [];
  for (const [rel, id, pick] of [
    ['programmes/index.html', 'programme-data', (r) => [r.id, r.backdrop?.key]],
    ['planner/index.html', 'planner-opportunities', (o) => [o.id, o.display?.backdrop?.key]],
  ]) {
    const f = path.join(DIST, rel);
    if (!fs.existsSync(f)) { bad.push(`${rel} not built`); continue; }
    const m = fs.readFileSync(f, 'utf8').match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)</script>`));
    if (!m) { bad.push(`${rel} has no #${id}`); continue; }
    const seen = new Map();
    for (const row of JSON.parse(m[1])) {
      const [oid, key] = pick(row);
      if (!key) continue;
      const card = oppCard.get(oid) || oid;
      if (!seen.has(key)) seen.set(key, new Set());
      seen.get(key).add(card);
    }
    for (const [key, cs] of seen) if (cs.size > 1) bad.push(`${rel}: ${key} on ${[...cs].join(', ')}`);
  }
  assert.deepEqual(bad, []);
});

/* --- 4. No special cases ------------------------------------------------ */

check('the family rules and the resolver name no programme, institution or country', () => {
  const names = new Set();
  for (const p of programmes) { names.add(p.id); names.add(p.institution); }
  for (const d of site.graph.destinations.values()) { if (d.name) names.add(d.name.toLowerCase()); }
  for (const c of site.countries || []) { if (c.name) names.add(String(c.name).toLowerCase()); }
  const bad = [];
  for (const rel of ['src/lib/families.mjs', 'src/lib/programme-imagery.mjs']) {
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const literals = [...src.matchAll(/'([^'\n]*)'|"([^"\n]*)"/g)].map((m) => (m[1] ?? m[2]).toLowerCase());
    for (const l of literals) if (names.has(l)) bad.push(`${rel}: "${l}"`);
  }
  assert.deepEqual(bad, []);
});

console.log(failures ? `\n${failures} check(s) failed.\n` : '\nAll unique-image checks passed.\n');
process.exit(failures ? 1 : 0);
