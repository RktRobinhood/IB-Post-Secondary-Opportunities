/**
 * No institution shows two programme cards with the same name (issue #52).
 *
 * The owner, 26 September 2026: "Programmes with the same name at the same
 * university appear as separate cards that differ only by location. A student
 * cannot tell whether they are the same programme or different ones." One
 * programme on several campuses, or as several paths, is one card with its
 * paths inside (src/lib/families.mjs), and every path's page carries a small
 * table of what differs between them.
 *
 * The records are checked before the build (validate.mjs checkFamilies,
 * check-schools.mjs checkSchoolFamilies). This reads what was built, so the
 * rule holds for whatever a template does with the records:
 *
 *   1. **Institution pages.** On every /universities/<key>/ page, no two
 *      programme cards share a name once case, punctuation, degree words
 *      ("BSc in", "Bachelor's Programme in") and campus words ("(Herning)",
 *      "at Herning", ", Campus Herning", a bare town the institution teaches
 *      in) are set aside (families.mjs nameStem) — unless the records
 *      declare the two separate (`separateFrom`). The page's "In English"
 *      tile counts exactly the cards it shows, and every row of a family
 *      card says what differs about its path.
 *   2. **The home page.** No two discovery cards share a name and an
 *      institution, and its counts ("Show all 67 programmes") are cards.
 *   3. **Family pages.** Every path of every family has a page with the
 *      Paths table, one row per path, linking to every other path; a family
 *      taught on several campuses says "The same programme is offered at …".
 *
 * It self-tests its reader on a page with two cards of one name first, so a
 * change of markup cannot make it pass by finding nothing. Built stage.
 */
import fs from 'node:fs';
import path from 'node:path';
import { nameClashes, normalName, nameStem, placeWords } from '../src/lib/families.mjs';
import { programmePaths, schoolKeys } from '../src/lib/schools.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist');
const BASE = (process.env.SITE_BASE || '').replace(/\/$/, '');

const failures = [];
const fail = (m) => failures.push(m);
const read = (p) => {
  const f = path.join(DIST, p, 'index.html');
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
};
const mainOf = (html) => html.split('<main')[1]?.split('</main>')[0] || '';
const text = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

/** The programme cards of a page: a Danish programme card has a backdrop, a school's is `card--prog`. */
function programmeCards(main) {
  return [...main.matchAll(/<article class="card card--link[^"]*(?:card--backdrop|card--prog)[^"]*">([\s\S]*?)<\/article>/g)].map((m) => ({
    title: text(m[1].match(/<h3 class="card__title"><a [^>]*>([\s\S]*?)<\/a>/)?.[1] || ''),
    foot: text(m[1].match(/<div class="card__foot">([\s\S]*?)<\/div>/)?.[1] || ''),
    // Each path row of a family card: its label, and whether it says what differs.
    rows: [...m[1].matchAll(/<li class="card__path">([\s\S]*?)<\/li>/g)].map((r) => ({
      label: text(r[1].match(/<a [^>]*>([\s\S]*?)<\/a>/)?.[1] || ''),
      detail: text(r[1].match(/<span class="card__path-detail"[^>]*>([\s\S]*?)<\/span>/)?.[1] || ''),
    })),
  }));
}

/** The "In English" tile of a page's facts strip: its number, or null. */
const tileCount = (main) => {
  const v = main.match(/<dt>In English<\/dt>\s*<dd>([^<]*)/)?.[1];
  const n = v && /^\s*(\d+)\s+programmes?\b/.exec(v);
  return v == null ? null : n ? Number(n[1]) : NaN;
};

/* --- Self-test --------------------------------------------------------------- */
{
  const art = (t) => `<article class="card card--link card--prog card--fam-tech"><div class="card__body"><h3 class="card__title"><a href="/x/">${t}</a></h3></div></article>`;
  const twice = programmeCards(art('Computer Science') + art('Computer  science') + art('Electronics'));
  const clash = nameClashes(twice.map((c) => c.title));
  /* The owner's complaint (#52): the same name with its campus in brackets. */
  const campus = programmeCards(art('Civil Engineering') + art('Civil Engineering (Lappeenranta)') + art('BSc in Civil Engineering at Lahti'));
  const campusClash = nameClashes(campus.map((c) => c.title), (t) => nameStem(t, placeWords(['Lappeenranta and Lahti'])));
  if (twice.length !== 3 || clash.length !== 1 || normalName('Computer Science') !== normalName('computer-science') || campusClash[0]?.[1] !== 3) {
    console.log('✗ self-test: the card reader cannot see two cards of one name');
    process.exit(1);
  }
}

console.log('\nOne card per programme at each institution\n');

/* --- 1. Institution pages ------------------------------------------------------ */
let pages = 0;
let cards = 0;
/* Per institution, from the records: the words of the places it teaches in,
   and the name stems its records declare separate on purpose. */
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const recordsOf = new Map();
{
  const instCity = new Map([...schoolKeys(path.join(ROOT, 'data', 'countries'))].map(([k, i]) => [k, i.city]));
  const sdir = path.join(ROOT, 'data', 'schools');
  for (const f of fs.readdirSync(sdir).filter((f) => f.endsWith('.json'))) {
    const key = f.slice(0, -5);
    const rec = readJson(path.join(sdir, f));
    const progs = rec.programmes || [];
    const words = placeWords([instCity.get(key), ...progs.map((p) => p.city)].filter(Boolean));
    const separate = new Set(progs.flatMap((p) => (p.separateFrom || []).flatMap((x) => [p.name, x.name])).map((n) => nameStem(n, words)));
    recordsOf.set(key, { words, separate });
  }
  const pdir = path.join(ROOT, 'data', 'programmes');
  const odir = path.join(ROOT, 'data', 'opportunities');
  const places = new Map();
  for (const f of fs.readdirSync(odir).filter((f) => f.endsWith('.json'))) {
    const o = readJson(path.join(odir, f));
    if (!places.has(o.institution)) places.set(o.institution, []);
    places.get(o.institution).push(o.place);
  }
  const byInst = new Map();
  for (const f of fs.readdirSync(pdir).filter((f) => f.endsWith('.json'))) {
    const p = readJson(path.join(pdir, f));
    if (!byInst.has(p.institution)) byInst.set(p.institution, []);
    byInst.get(p.institution).push(p);
  }
  for (const [inst, progs] of byInst) {
    const words = placeWords(places.get(inst) || []);
    const name = new Map(progs.map((p) => [p.id, p.name]));
    const separate = new Set(progs.flatMap((p) => (p.separateFrom || []).flatMap((x) => [p.name, name.get(x.programme)])).filter(Boolean).map((n) => nameStem(n, words)));
    recordsOf.set(inst, { words, separate });
  }
}

let rows = 0;
for (const key of fs.readdirSync(path.join(DIST, 'universities'))) {
  const html = read(`universities/${key}`);
  if (!html) continue;
  const main = mainOf(html);
  const list = programmeCards(main);
  if (!list.length) continue;
  pages++;
  cards += list.length;
  const { words = new Set(), separate = new Set() } = recordsOf.get(key) || {};
  for (const [title, n] of nameClashes(list.map((c) => c.title), (t) => nameStem(t, words), separate)) {
    fail(`/universities/${key}/ shows ${n} programme cards called "${title}" (once campus and degree words are set aside): one programme is one card, its campuses or paths inside — or say separateFrom on the records`);
  }
  /* The number a student reads is the number of cards they can count. */
  const tile = tileCount(main);
  if (tile !== null && tile !== list.length) fail(`/universities/${key}/: the "In English" tile says ${Number.isNaN(tile) ? 'something other than "N programmes"' : tile}, but the page shows ${list.length} programme cards`);
  /* Every family row says what differs about its path. */
  for (const c of list) {
    for (const r of c.rows) {
      rows++;
      if (!r.detail) fail(`/universities/${key}/: the "${c.title}" card's row "${r.label}" says nothing about what differs`);
    }
  }
}
if (!pages) fail('no programme cards found on any institution page — has the card markup changed?');

/* --- 2. The home page ---------------------------------------------------------- */
const home = read('');
const homeCards = home ? programmeCards(mainOf(home)) : [];
if (!homeCards.length) fail('no programme cards found on the home page — has the card markup changed?');
{
  const main = home ? mainOf(home) : '';
  const all = main.match(/<summary>Show all (\d+) programmes<\/summary>/)?.[1];
  const counter = main.match(/id="prog-count"[^>]*>(\d+) programmes</)?.[1];
  if (all && Number(all) !== homeCards.length) fail(`the home page says "Show all ${all} programmes" but has ${homeCards.length} cards`);
  if (!counter || Number(counter) !== homeCards.length) fail(`the home page's count says ${counter ?? 'nothing in programmes'}, but it has ${homeCards.length} cards`);
}
for (const [title, n] of nameClashes(homeCards.map((c) => `${c.title} — ${c.foot}`))) {
  fail(`the home page shows ${n} cards "${title}" (one name at one institution)`);
}

/* --- 3. Family pages ----------------------------------------------------------- */
const families = [];

/* Canonical programmes: members by family id, each at its Opportunity's page. */
const progDir = path.join(ROOT, 'data', 'programmes');
const oppDir = path.join(ROOT, 'data', 'opportunities');
const opps = fs.readdirSync(oppDir).filter((f) => f.endsWith('.json')).map((f) => readJson(path.join(oppDir, f)));
const byFamily = new Map();
for (const f of fs.readdirSync(progDir).filter((f) => f.endsWith('.json'))) {
  const p = readJson(path.join(progDir, f));
  if (!p.family?.id) continue;
  if (!byFamily.has(p.family.id)) byFamily.set(p.family.id, { name: p.family.name, axis: p.family.axis, members: [] });
  const places = opps.filter((o) => o.programme === p.id);
  for (const o of places) byFamily.get(p.family.id).members.push({ href: `/programmes/${o.id}/`, place: o.place, path: p.family.path });
}
families.push(...byFamily.values());

/* School records: members by family name within a record. */
const schoolDir = path.join(ROOT, 'data', 'schools');
for (const f of fs.readdirSync(schoolDir).filter((f) => f.endsWith('.json'))) {
  const key = f.slice(0, -5);
  const rec = readJson(path.join(schoolDir, f));
  if (rec.scope !== 'listed') continue;
  const byName = new Map();
  for (const p of programmePaths(key, rec.programmes)) {
    if (!p.family?.name) continue;
    if (!byName.has(p.family.name)) byName.set(p.family.name, { name: p.family.name, axis: p.family.axis, members: [] });
    byName.get(p.family.name).members.push({ href: p.href, place: p.city || '', path: p.family.path });
  }
  families.push(...byName.values());
}

let memberPages = 0;
for (const fam of families) {
  const campuses = new Set(fam.members.map((m) => m.place)).size > 1;
  for (const m of fam.members) {
    const html = read(m.href.slice(1, -1));
    if (!html) {
      fail(`${m.href} (a path of "${fam.name}") was not built`);
      continue;
    }
    memberPages++;
    const table = mainOf(html).match(/<section class="paths"[\s\S]*?<\/section>/)?.[0];
    if (!table) {
      fail(`${m.href}: no Paths table for "${fam.name}" — a student cannot see what differs between its ${fam.members.length} paths`);
      continue;
    }
    const rows = table.match(/<tr[\s>]/g)?.length - 1;
    if (rows !== fam.members.length) fail(`${m.href}: the Paths table has ${rows} rows for ${fam.members.length} paths of "${fam.name}"`);
    for (const other of fam.members) {
      if (other === m) continue;
      if (!table.includes(`href="${BASE}${other.href}"`)) fail(`${m.href}: the Paths table does not link to ${other.href}`);
    }
    if (fam.axis === 'campus' && campuses && !/The same programme is offered at /.test(text(table))) {
      fail(`${m.href}: "${fam.name}" is one programme on several campuses and its page does not say so plainly`);
    }
  }
}

if (failures.length) {
  for (const f of failures.slice(0, 40)) console.log(`  FAIL  ${f}`);
  if (failures.length > 40) console.log(`  … and ${failures.length - 40} more`);
  console.log(`\n${failures.length} failure(s)\n`);
  process.exit(1);
}
console.log(
  `  ok    ${cards} programme cards on ${pages} institution pages, ${homeCards.length} on the home page: no two at one institution share a name or a name stem; every "In English" tile counts its cards; ${rows} family rows each say what differs\n` +
    `  ok    ${families.length} families of paths, ${memberPages} path pages, each with its Paths table\n`
);
