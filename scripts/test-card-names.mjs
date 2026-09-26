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
 *      programme cards share a name (ignoring case, spacing and punctuation).
 *   2. **The home page.** No two discovery cards share a name and an
 *      institution.
 *   3. **Family pages.** Every path of every family has a page with the
 *      Paths table, one row per path, linking to every other path; a family
 *      taught on several campuses says "The same programme is offered at …".
 *
 * It self-tests its reader on a page with two cards of one name first, so a
 * change of markup cannot make it pass by finding nothing. Built stage.
 */
import fs from 'node:fs';
import path from 'node:path';
import { nameClashes, normalName } from '../src/lib/families.mjs';
import { programmePaths } from '../src/lib/schools.mjs';

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
  }));
}

/* --- Self-test --------------------------------------------------------------- */
{
  const art = (t) => `<article class="card card--link card--prog card--fam-tech"><div class="card__body"><h3 class="card__title"><a href="/x/">${t}</a></h3></div></article>`;
  const twice = programmeCards(art('Computer Science') + art('Computer  science') + art('Electronics'));
  const clash = nameClashes(twice.map((c) => c.title));
  if (twice.length !== 3 || clash.length !== 1 || normalName('Computer Science') !== normalName('computer-science')) {
    console.log('✗ self-test: the card reader cannot see two cards of one name');
    process.exit(1);
  }
}

console.log('\nOne card per programme at each institution\n');

/* --- 1. Institution pages ------------------------------------------------------ */
let pages = 0;
let cards = 0;
for (const key of fs.readdirSync(path.join(DIST, 'universities'))) {
  const html = read(`universities/${key}`);
  if (!html) continue;
  const list = programmeCards(mainOf(html));
  if (!list.length) continue;
  pages++;
  cards += list.length;
  for (const [title, n] of nameClashes(list.map((c) => c.title))) {
    fail(`/universities/${key}/ shows ${n} programme cards called "${title}": one programme is one card, its campuses or paths inside`);
  }
}
if (!pages) fail('no programme cards found on any institution page — has the card markup changed?');

/* --- 2. The home page ---------------------------------------------------------- */
const home = read('');
const homeCards = home ? programmeCards(mainOf(home)) : [];
if (!homeCards.length) fail('no programme cards found on the home page — has the card markup changed?');
for (const [title, n] of nameClashes(homeCards.map((c) => `${c.title} — ${c.foot}`))) {
  fail(`the home page shows ${n} cards "${title}" (one name at one institution)`);
}

/* --- 3. Family pages ----------------------------------------------------------- */
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
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
  `  ok    ${cards} programme cards on ${pages} institution pages, ${homeCards.length} on the home page: no two at one institution share a name\n` +
    `  ok    ${families.length} families of paths, ${memberPages} path pages, each with its Paths table\n`
);
