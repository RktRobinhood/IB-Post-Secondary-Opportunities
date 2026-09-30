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
 *      compared by URL, and may only repeat within one programme family. An
 *      official degree photo (data/programme-images.json, `official: true`)
 *      is hot-linked too: it is compared by URL, and no other record, degree
 *      or institution, may name the same address.
 *   3. **Built pages.** On every built page, no two programme cards that are
 *      different cards draw the same background, and the finder and planner
 *      data agree with the cards. A school's photograph is one slot with its
 *      page, its card and its own programmes' pages (docs/STATUS.md, #43): a
 *      programme page under /universities/<key>/ shows its own photograph
 *      when one was chosen for it (#54), else its school's hero or none, and
 *      the school's photograph heads no page outside its school.
 *   4. **No special cases.** src/lib/families.mjs and the resolver name no
 *      programme, institution or country.
 *   5. **No designed backdrop twice (#67).** A programme with no photograph
 *      draws a pattern generated for it (src/lib/designed-backdrop.mjs). Its
 *      parameter tuple (`data-design`) belongs to one programme page,
 *      site-wide; on every built page no two designed backdrops share a
 *      motif in the same tone (round 2: "no two designed cards on one page
 *      look alike"), no two cards up to LOOK_BACK apart in a grid (every
 *      look before one repeats) look alike (`alike`: one look of motif, field hues within ten
 *      degrees; round 3), and each design wears its field's colour.
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
import { TONES, alike, LOOK_BACK } from '../src/lib/designed-backdrop.mjs';
import { FIELD_TONES } from '../src/lib/canonical.mjs';
import { schoolCards } from '../src/pages/schools.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist');
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
/** What a slot shows: a hosted file by its bytes, a hot-linked one by its address. */
const idOf = (src) => hashOf(src) || (/^https:\/\//.test(src || '') ? src : null);
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
    const h = idOf(src);
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
  for (const [k, s] of cards) add(idOf([...s][0]), `card:${k}`);
  // A school programme's own photograph (#54) is a slot of its own.
  for (const c of site.countries || []) {
    for (const inst of c.institutions || []) {
      for (const p of inst.school?.programmes || []) if (p.backdrop?.src) add(idOf(p.backdrop.src), `degree:${inst.key}/${p.slug}`);
    }
  }
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

check("an official degree photo's address is its own: no other record names it", () => {
  // Every address a record links, by the records that link it: degree photos
  // and institution share images alike.
  const byUrl = new Map();
  const add = (u, who) => {
    if (!u) return;
    if (!byUrl.has(u)) byUrl.set(u, []);
    byUrl.get(u).push(who);
  };
  for (const [k, r] of Object.entries(site.programmeImages || {})) add(r.url, `programme-images ${k}`);
  for (const [k, r] of Object.entries(site.officialImages || {})) add(r.url, `official-images ${k}`);
  const degree = new Set(Object.values(site.programmeImages || {}).filter((r) => r.official).map((r) => r.url));
  const bad = [...byUrl]
    .filter(([u, who]) => degree.has(u) && who.length > 1)
    .map(([u, who]) => `${u.slice(0, 90)}: ${who.join(', ')}`);
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
    const re = /<article class="card[^"]*\bcard--backdrop\b[^"]*">([\s\S]*?)<\/article>/g;
    for (let m; (m = re.exec(text)); ) {
      const key = (m[1].match(/data-backdrop="([^"]+)"/) || [])[1];
      // A programme card links to /programmes/<id>/; a school programme's
      // card (#54) to /universities/<key>/<slug>/, its first link.
      const id = (m[1].match(/\/programmes\/([a-z0-9-]+)\//) || m[1].match(/\/universities\/([a-z0-9-]+\/[a-z0-9-]+)\//) || [])[1];
      // A designed backdrop is no photograph; section 5 holds those.
      if (!key || key === 'designed' || !id) continue;
      const card = oppCard.get(id) || cardOf.get(id) || id;
      if (!seen.has(key)) seen.set(key, new Set());
      seen.get(key).add(card);
    }
    for (const [key, cs] of seen) if (cs.size > 1) bad.push(`${path.relative(DIST, f)}: ${key} on ${[...cs].join(', ')}`);
  }
  assert.ok(pages > 0, 'no built page carries a card background');
  assert.deepEqual(bad, []);
});

check("a school's photograph heads only its own page and its own programmes' pages; a programme with its own photograph heads with that", () => {
  const root = path.join(DIST, 'universities');
  assert.ok(fs.existsSync(root), 'dist/universities/ is not built');
  const degreeSrc = new Map();
  for (const c of site.countries || []) {
    for (const inst of c.institutions || []) {
      for (const p of inst.school?.programmes || []) if (p.backdrop?.src) degreeSrc.set(`${inst.key}/${p.slug}`, p.backdrop.src);
      /* The page a family's card opens heads with the photograph that card
         shows (#67), which may be another path's. */
      for (const g of inst.school ? schoolCards(inst.school.programmes) : []) {
        const shown = g.lead.backdrop?.src || g.members.find((m) => m.backdrop)?.backdrop?.src;
        if (shown) degreeSrc.set(`${inst.key}/${g.lead.slug}`, shown);
      }
    }
  }
  const heroOf = (f) => (fs.readFileSync(f, 'utf8').match(/<div class="hero__media"[^>]*>\s*<img src="([^"]+)"/) || [])[1] || null;
  // Every hero on the site, by the page it heads.
  const heroes = new Map();
  for (const f of htmlFiles(DIST)) {
    const src = heroOf(f);
    if (src) heroes.set(path.relative(DIST, f).split(path.sep).join('/'), src);
  }
  const bad = [];
  let pages = 0;
  for (const key of fs.readdirSync(root)) {
    const dir = path.join(root, key);
    if (!fs.statSync(dir).isDirectory()) continue;
    const school = heroes.get(`universities/${key}/index.html`) || null;
    let children = 0;
    for (const slug of fs.readdirSync(dir)) {
      const f = path.join(dir, slug, 'index.html');
      if (!fs.existsSync(f)) continue;
      pages++;
      children++;
      const own = heroOf(f);
      // The photograph its card shows (#54, #67), when it has one; else its school's or none.
      const degree = degreeSrc.get(`${key}/${slug}`);
      if (degree) { if (!own || !own.endsWith(degree)) bad.push(`universities/${key}/${slug}/: hero ${own || 'none'} is not its own photograph (${degree})`); }
      else if (own && own !== school) bad.push(`universities/${key}/${slug}/: hero ${own} is not its school's (${school || 'none'})`);
    }
    /* A canonical Institution's photograph heads its Programmes' pages under
       /programmes/, by the older rule; only a school with programme pages of
       its own is held to its own directory. */
    if (!school || !children) continue;
    for (const [page, src] of heroes) {
      if (src === school && !page.startsWith(`universities/${key}/`)) bad.push(`${page}: heads with ${key}'s photograph`);
    }
  }
  assert.ok(pages > 0, 'no programme page under a school was built');
  assert.deepEqual(bad, []);
});

check('the planner data gives different cards different backgrounds', () => {
  const bad = [];
  for (const [rel, id, pick] of [
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
  for (const rel of ['src/lib/families.mjs', 'src/lib/programme-imagery.mjs', 'src/lib/paths.mjs', 'src/lib/designed-backdrop.mjs']) {
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const literals = [...src.matchAll(/'([^'\n]*)'|"([^"\n]*)"/g)].map((m) => (m[1] ?? m[2]).toLowerCase());
    for (const l of literals) if (names.has(l)) bad.push(`${rel}: "${l}"`);
  }
  assert.deepEqual(bad, []);
});

/* --- 5. Designed backdrops (#67) --------------------------------------- */

/* Every programme page the site has, with the design resolved for it and
   the school whose page shows its card. */
const designs = new Map();
for (const p of site.programmes) designs.set(p.href, p.design);
for (const c of site.countries || []) for (const inst of c.institutions || []) for (const p of inst.school?.programmes || []) designs.set(p.href, p.design && { ...p.design, group: inst.key });

/** The designed cards of one built page: `{ href, key }`, the page the card opens and its tuple. */
function designedCards(text) {
  const out = [];
  const re = /<article class="card[^"]*\bcard--backdrop\b[^"]*">\s*<svg class="dz card__backdrop"[^>]*\bdata-design="([^"]+)"[\s\S]*?<h3 class="card__title"><a href="[^"]*?(\/(?:programmes\/[a-z0-9-]+|universities\/[a-z0-9-]+\/[a-z0-9-]+)\/)"/g;
  for (let m; (m = re.exec(text)); ) out.push({ key: m[1], href: m[2] });
  return out;
}

check('the designed-card reader can see what it is for', () => {
  const card = (key, href) => `<article class="card card--link card--backdrop">\n<svg class="dz card__backdrop" viewBox="0 0 400 250" aria-hidden="true" data-backdrop="designed" data-design="${key}"></svg><div class="card__body"><h3 class="card__title"><a href="/base${href}">T</a></h3></div></article>`;
  const got = designedCards(card('hatch/lines/5', '/universities/x-y/art/') + card('dots/disc/10', '/programmes/p-1/'));
  assert.deepEqual(got, [{ key: 'hatch/lines/5', href: '/universities/x-y/art/' }, { key: 'dots/disc/10', href: '/programmes/p-1/' }]);
});

check('every programme page resolves a designed tuple, and each tuple belongs to one programme page, site-wide', () => {
  const byKey = new Map();
  const missing = [];
  for (const [href, d] of designs) {
    if (!d?.key) { missing.push(href); continue; }
    if (!byKey.has(d.key)) byKey.set(d.key, []);
    byKey.get(d.key).push(href);
  }
  assert.deepEqual(missing.slice(0, 12), [], `${missing.length} programme pages resolve no design`);
  const twice = [...byKey].filter(([, hs]) => hs.length > 1).map(([k, hs]) => `${k}: ${hs.join(', ')}`);
  assert.deepEqual(twice, []);
});

check('on every built page no two designed backdrops share a parameter set, and each is the one its programme resolves', () => {
  const bad = [];
  const shownAs = new Map();
  let cardsSeen = 0;
  for (const f of htmlFiles(DIST)) {
    const text = fs.readFileSync(f, 'utf8');
    if (!text.includes('data-backdrop="designed"')) continue;
    const rel = path.relative(DIST, f);
    const cardsHere = designedCards(text);
    const onPage = new Map();
    for (const { key, href } of cardsHere) {
      cardsSeen++;
      if (designs.get(href)?.key !== key) bad.push(`${rel}: the card for ${href} draws ${key}, not ${designs.get(href)?.key || 'no design'}`);
      if (onPage.has(key) && onPage.get(key) !== href) bad.push(`${rel}: ${key} on ${onPage.get(key)} and ${href}`);
      onPage.set(key, href);
      if (!shownAs.has(href)) shownAs.set(href, new Set());
      shownAs.get(href).add(key);
    }
    // Every designed backdrop on the page is a card the reader saw, or the hero.
    const all = (text.match(/data-backdrop="designed"/g) || []).length;
    const hero = (text.match(/class="hero__media hero__media--designed"/g) || []).length;
    if (all !== cardsHere.length + hero) bad.push(`${rel}: ${all} designed backdrops, ${cardsHere.length} read as cards and ${hero} as a hero`);
  }
  for (const [href, keys] of shownAs) if (keys.size > 1) bad.push(`${href}: drawn as ${[...keys].join(' and ')} on different pages`);
  assert.ok(cardsSeen > 100, `only ${cardsSeen} designed cards found`);
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} problems`);
});

/** A design's look, from its tuple: `motif/tone/…`. */
const lookOf = (key) => key.split('/').slice(0, 2).join(' in tone ');

/** Each grid of cards on a page, as its cards' tuples in order (null for a photograph card). */
function gridsOf(text) {
  return text
    .split(/<(?:ul|ol|div|section)\b[^>]*\bclass="(?:[^"]*\s)?(?:grid|prog-siblings)(?:\s[^"]*)?"/)
    .slice(1)
    .map((chunk) => [...chunk.matchAll(/<article class="card[^"]*">\s*(?:<svg class="dz card__backdrop"[^>]*\bdata-design="([^"]+)"|<)/g)].map((m) => m[1] || null));
}

check('the grid reader sees cards side by side', () => {
  const svg = (k) => `<article class="card card--backdrop">
<svg class="dz card__backdrop" data-design="${k}"></svg></article>`;
  const got = gridsOf(`<ul class="grid grid--3"><li>${svg('a/1.0/x')}</li><li><article class="card card--backdrop">
<img></article></li></ul><h2>x</h2><div class="grid">${svg('b/2.0/y')}</div>`);
  assert.deepEqual(got, [['a/1.0/x', null], ['b/2.0/y']]);
});

check('on every built page no two designed backdrops look alike: no motif twice in one tone, and no neighbours of one look and one colour', () => {
  const bad = [];
  let pages = 0;
  for (const f of htmlFiles(DIST)) {
    const text = fs.readFileSync(f, 'utf8');
    if (!text.includes('data-backdrop="designed"')) continue;
    pages++;
    const rel = path.relative(DIST, f);
    const looks = new Map();
    for (const [, key] of text.matchAll(/data-backdrop="designed" data-design="([^"]+)"/g)) {
      const look = lookOf(key);
      if (looks.has(look) && looks.get(look) !== key) bad.push(`${rel}: two designs are ${look}`);
      looks.set(look, key);
    }
    /* Neighbours: up to LOOK_BACK apart in one grid, so a run of cards uses
       every look before it repeats one, and nothing alike sits beside,
       above or two rows from another at any width (rounds 3 and 4). */
    for (const grid of gridsOf(text)) {
      const ds = grid.map((k) => k && { motif: k.split('/')[0], tone: k.split('/')[1] });
      for (let i = 0; i < ds.length; i++) {
        for (let j = i + 1; j <= i + LOOK_BACK && j < ds.length; j++) {
          if (alike(ds[i], ds[j])) bad.push(`${rel}: ${ds[i].motif} ${ds[i].tone} and ${ds[j].motif} ${ds[j].tone}, ${j - i} apart, look alike`);
        }
      }
    }
  }
  assert.ok(pages > 100, `only ${pages} pages with designed backdrops`);
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} problems`);
});

check("every design wears its field's colour", () => {
  const bad = [];
  for (const c of site.countries || []) {
    for (const inst of c.institutions || []) {
      for (const p of inst.school?.programmes || []) {
        const d = p.design;
        if (!d) continue;
        const t = FIELD_TONES[p.field] || FIELD_TONES.other;
        const [base, v] = d.tone.split('.').map(Number);
        if (base !== t.hue || !TONES[v]) bad.push(`${p.href}: tone ${d.tone} is not one of its field's (${t.hue})`);
        else if (d.hue !== (((t.hue + TONES[v].shift) % 360) + 360) % 360) bad.push(`${p.href}: hue ${d.hue} is not its tone's`);
      }
    }
  }
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} problems`);
});

check('the look test groups what reads alike and parts what does not', () => {
  assert.ok(alike({ motif: 'rings', tone: '32.0' }, { motif: 'arcs', tone: '32.2' }), 'rings and arcs in one colour');
  assert.ok(alike({ motif: 'hatch', tone: '212.0' }, { motif: 'weave', tone: '212.1' }), 'hatch and weave in one colour');
  assert.ok(!alike({ motif: 'rings', tone: '32.0' }, { motif: 'arcs', tone: '212.0' }), 'curves in two colours');
  assert.ok(!alike({ motif: 'dots', tone: '32.0' }, { motif: 'rays', tone: '32.0' }), 'two looks in one colour');
});

console.log(failures ? `\n${failures} check(s) failed.\n` : '\nAll unique-image checks passed.\n');
process.exit(failures ? 1 : 0);
