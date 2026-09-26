/**
 * Every institution has its own page, and nothing hands a student to a homepage.
 *
 * Issue #43: an institution card on a country page linked straight to the
 * university's homepage and left the student to find the English-taught
 * degrees on a foreign site. This reads the built site back and holds:
 *
 *   1. every institution in data/countries/ has a page under /universities/;
 *   2. every institution card on a country page links to a page on this site;
 *   3. no link on a school page that leaves the site is a homepage;
 *   4. a school record listing programmes renders one card per programme, or
 *      per family of paths (#52), and links to every programme's page;
 *   5. each listed programme has its own page under its school, the school's
 *      page links to it, and nothing on it that leaves the site is a homepage;
 *   6. a programme page's "Apply by" is a date from the programme (`closes`),
 *      its school record (`dates`), or a route date tied to that school by id
 *      (`institutions`), never a route's general date for other programmes;
 *   7. and never a date only for applicants who already hold the Diploma
 *      (`forDiplomaHolders`, `closesForDiplomaHolders`), nor a housing date
 *      (`kind: "housing"`): where Diploma-holder dates are all there is, the
 *      tile says "After your Diploma" (the programme's only round needs it)
 *      or "Not open yet" (no round for the reader published), and the dates
 *      panel opens on the same line; no card says "Apply by" for such a
 *      programme, and no dates panel lifts such a date to the top
 *      (`data-binding`). A route date whose words say it is for Diploma
 *      holders reaching a school page must carry the flag;
 *   8. a programme page shows only its own dates, for its reader: none scoped
 *      to other programmes (`programmes`), none of a round it does not run in
 *      (`round`), none only for applicants from outside the EU/EEA;
 *   9. and it opens on the school record's note for it ("Before you apply"),
 *      where the record has one that names it or names no other programme.
 *
 * Nothing here names a country. Run after a build: node scripts/test-school-pages.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { schoolKeys, loadSchools, isHomepage, programmePaths, saysForDiplomaHolders, roundOf, notesFor, NOT_OPEN_YET, AFTER_DIPLOMA } from '../src/lib/schools.mjs';
import { schoolCardGroups } from '../src/lib/families.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist');
const BASE = (process.env.SITE_BASE || '').replace(/\/$/, '');

const failures = [];
const fail = (m) => failures.push(m);
const read = (p) => {
  const f = path.join(DIST, p, 'index.html');
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
};

/* Where a programme page's "Apply by" may come from (rules 6 and 7): never a
   date only for Diploma holders. */
const routes = fs
  .readdirSync(path.join(ROOT, 'data', 'application-routes'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'application-routes', f), 'utf8')));
const milestones = routes.flatMap((r) => r.milestones || []);
function applyByAllowed(key, rec, prog, iso) {
  if (prog.closes === iso) return !prog.closesForDiplomaHolders;
  const ownRound = prog.round ? roundOf(prog.round) : null;
  const holders = (d) => (ownRound && prog.closes && roundOf(d.label) === ownRound ? prog.closesForDiplomaHolders : d.forDiplomaHolders);
  if ((rec.dates || []).some((d) => d.date === iso && d.kind !== 'housing' && !holders(d) && (!(d.programmes || []).length || d.programmes.includes(prog.slug)))) return true;
  return milestones.some((m) => (m.institutions || []).includes(key) && !m.forDiplomaHolders && (m.date === iso || m.endDate === iso));
}
/* A tile that gives no day, because every closing date is for Diploma
   holders: which of the two it says follows from the record. */
const statusAllowed = (rec, prog, value) =>
  value === AFTER_DIPLOMA
    ? Boolean(prog.closesForDiplomaHolders)
    : value === NOT_OPEN_YET && !prog.closesForDiplomaHolders && (rec.dates || []).some((d) => d.forDiplomaHolders);
const unescape = (t) => String(t).replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
/* The dates in a built dates panel, as [day, label, who]. */
const panelDates = (html) =>
  [...(html.split('class="dates-panel"')[1] || '').split('</section>')[0].matchAll(/<li class="dates-panel__item" data-date="([^"]+)"([^>]*)>[\s\S]*?class="dates-panel__what">([^<]*)</g)].map((m) => ({
    date: m[1],
    who: m[2].match(/data-who="([^"]+)"/)?.[1] || null,
    label: unescape(m[3]).trim(),
  }));
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const isoOf = (text) => {
  const m = String(text).trim().match(/^(\d{1,2}) ([A-Z][a-z]+) (\d{4})$/);
  const month = m ? MONTHS.indexOf(m[2]) + 1 : 0;
  return month ? `${m[3]}-${String(month).padStart(2, '0')}-${m[1].padStart(2, '0')}` : null;
};

/* Self-test: the homepage rule must catch a homepage and pass a targeted page. */
if (!isHomepage('https://www.helsinki.fi/en', null) || isHomepage('https://www.helsinki.fi/en/admissions', null)) {
  console.log('  FAIL  self-test: isHomepage cannot tell a homepage from a targeted page');
  process.exit(1);
}
console.log('  ok    self-test: a homepage is caught, a targeted page passes');

/* Self-test: the Apply-by rule must refuse the two route dates that reached
   programme pages in review round 1 (a national medicine date on an aerospace
   degree; a numerus fixus date on a degree not recorded as one) and accept the
   school's own closing date. */
{
  const seeds = loadSchools(path.join(ROOT, 'data', 'schools'));
  const prog = (key, slug) => programmePaths(key, seeds.get(key)?.programmes || []).find((p) => p.slug === slug);
  const cases = [
    /* A housing lottery date is not an application deadline. */
    ['nl-radboud', 'artificial-intelligence', '2027-05-01', false],
    ['nl-radboud', 'artificial-intelligence', '2027-07-01', true],
    ['de-tum', 'aerospace', '2027-05-31', false],
    ['nl-radboud', 'artificial-intelligence', '2027-01-15', false],
    ['de-tum', 'aerospace', '2027-07-15', true],
    /* KTH's January round is for Diploma holders; its April round is not. */
    ['se-kth', 'information-and-communication-technology', '2027-01-15', false],
    ['se-kth', 'information-and-communication-technology', '2027-04-15', true],
  ];
  const wrong = cases.filter(([key, slug, iso, want]) => {
    const p = prog(key, slug);
    return !p || applyByAllowed(key, seeds.get(key), p, iso) !== want;
  });
  if (wrong.length || isoOf('15 July 2027') !== '2027-07-15') {
    console.log(`  FAIL  self-test: the Apply-by rule misjudges ${wrong.map((w) => `${w[0]}/${w[1]} ${w[2]}`).join(', ') || 'a date'}`);
    process.exit(1);
  }
  console.log("  ok    self-test: a route date for other programmes, or a date for Diploma holders, is refused as Apply by; the school's own passes");
}

/* Rule 7, on the routes: a milestone whose words say it is for Diploma
   holders ("tells IB students who have not finished the Diploma not to apply
   in this round") carries the flag, so no school page leads with it. */
for (const r of routes) {
  for (const m of r.milestones || []) {
    if (!m.forDiplomaHolders && saysForDiplomaHolders(`${m.label} ${m.note || ''}`)) {
      fail(`${r.id}/${m.id} "${m.label}" says it is for Diploma holders only: set forDiplomaHolders`);
    }
  }
}

/* No dates panel lifts a date only for Diploma holders to the top. */
const liftsHolders = (html) =>
  [...html.matchAll(/<li class="dates-panel__item"[^>]*>/g)].some((m) => /data-binding="true"/.test(m[0]) && /data-diploma-holders="true"/.test(m[0]));

const known = schoolKeys(path.join(ROOT, 'data', 'countries'));
const records = loadSchools(path.join(ROOT, 'data', 'schools'));
const countries = fs
  .readdirSync(path.join(ROOT, 'data', 'countries'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'countries', f), 'utf8')));

let pages = 0;
let programmePages = 0;
let applyTiles = 0;
let holdersTiles = 0;
let beforeNotes = 0;
let cards = 0;
for (const c of countries) {
  const countryPage = read(`destinations/${c.code}`);
  if (!countryPage) {
    fail(`/destinations/${c.code}/ was not built`);
    continue;
  }
  // The institution cards sit in the #institutions section, before the map.
  const section = countryPage.split('id="institutions"')[1]?.split('class="world')[0] || '';
  for (const m of section.matchAll(/<h3 class="card__title"><a href="([^"]+)"/g)) {
    cards++;
    if (/^(https?:)?\/\//.test(m[1])) fail(`/destinations/${c.code}/: an institution card leaves the site (${m[1]})`);
  }
}

for (const [key, inst] of known) {
  const html = read(`universities/${key}`);
  if (!html) {
    // A profile institution with a canonical twin is served by the canonical page.
    const twin = [...fs.readdirSync(path.join(ROOT, 'data', 'institutions'))].some((f) => {
      const r = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'institutions', f), 'utf8'));
      return (r.links?.website || '').replace(/^https?:\/\/(www\.)?/, '').split('/')[0] ===
        (inst.website || '').replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    });
    if (!twin) fail(`/universities/${key}/ was not built`);
    continue;
  }
  pages++;
  const main = html.split('<main')[1]?.split('</main>')[0] || '';
  if (liftsHolders(main)) fail(`/universities/${key}/: the dates panel leads with a date only for Diploma holders`);
  if (panelDates(main).some((d) => d.who === 'non-eu')) fail(`/universities/${key}/: the dates panel shows a date only for applicants from outside the EU/EEA`);
  for (const m of main.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    const link = m[1].replace(/&amp;/g, '&');
    if (isHomepage(link, inst.website)) fail(`/universities/${key}/ hands the student to a homepage: ${link}`);
  }
  const rec = records.get(key);
  if (rec?.scope === 'listed') {
    const shown = (main.split('id="programmes"')[1] || '').match(/class="card card--link/g)?.length || 0;
    // One card per programme, or per family of paths (#52), which links to every path.
    const want = schoolCardGroups(rec.programmes).length;
    if (shown !== want) fail(`/universities/${key}/ shows ${shown} programme cards; its record makes ${want} (${rec.programmes.length} programmes)`);
    for (const p of programmePaths(key, rec.programmes)) {
      const own = read(p.href.slice(1, -1));
      if (!own) {
        fail(`${p.href} was not built for "${p.name}"`);
        continue;
      }
      programmePages++;
      if (!main.includes(`href="${BASE}${p.href}"`)) fail(`/universities/${key}/ does not link to ${p.href}`);
      const body = own.split('<main')[1]?.split('</main>')[0] || '';
      for (const m of body.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
        const link = m[1].replace(/&amp;/g, '&');
        if (isHomepage(link, inst.website)) fail(`${p.href} hands the student to a homepage: ${link}`);
      }
      const tile = body.match(/<dt>Apply by<\/dt>\s*<dd>([^<]+)/)?.[1];
      if (tile && (tile.trim() === NOT_OPEN_YET || tile.trim() === AFTER_DIPLOMA)) {
        if (!statusAllowed(rec, p, tile.trim())) fail(`${p.href}: "Apply by ${tile.trim()}" does not follow from its record`);
        const line = body.match(/class="dates-panel__status"><strong>([^<]+)/)?.[1];
        if (line !== tile.trim()) fail(`${p.href}: the dates panel does not open on "${tile.trim()}"`);
        holdersTiles++;
      } else if (tile) {
        const iso = isoOf(tile);
        if (!iso || !applyByAllowed(key, rec, p, iso)) {
          fail(`${p.href}: "Apply by ${tile.trim()}" is not the programme's, its school's, or a date tied to the school, or is only for Diploma holders`);
        }
        applyTiles++;
      }
      if (liftsHolders(body)) fail(`${p.href}: the dates panel leads with a date only for Diploma holders`);
      /* Rule 8: only this programme's dates, for this reader. */
      const shownDates = panelDates(body);
      if (shownDates.some((d) => d.who === 'non-eu')) fail(`${p.href}: the dates panel shows a date only for applicants from outside the EU/EEA`);
      const rounds = new Set((rec.dates || []).filter((d) => d.kind === 'closes').map((d) => roundOf(d.label)));
      for (const d of rec.dates || []) {
        const otherProgramme = (d.programmes || []).length && !d.programmes.includes(p.slug);
        const otherRound = p.round && rounds.has(roundOf(d.label)) && roundOf(d.label) !== roundOf(p.round);
        if ((otherProgramme || otherRound) && shownDates.some((x) => x.date === d.date && x.label === d.label)) {
          fail(`${p.href}: shows "${d.label}", a date ${otherProgramme ? 'for other programmes' : 'of a round it does not run in'}`);
        }
      }
      /* Rule 9: the record's note for this programme opens the page. */
      const notes = notesFor({ ...rec, programmes: programmePaths(key, rec.programmes) }, p);
      if (notes.length) {
        const block = body.split('aria-label="Before you apply"')[1]?.split('</aside>')[0] || '';
        if (!unescape(block).includes(notes[0].text)) fail(`${p.href}: "Before you apply" does not show the record's note for it`);
        else beforeNotes++;
      }
      /* Its card on the school's page gives no day to a final-year student either. */
      if (p.closesForDiplomaHolders) {
        const at = main.indexOf(`href="${BASE}${p.href}"`);
        const cardHtml = at < 0 ? '' : main.slice(main.lastIndexOf('<article', at), main.indexOf('</article>', at));
        if (/Apply by/.test(cardHtml)) fail(`/universities/${key}/: the card for "${p.name}" says "Apply by" a date only for Diploma holders`);
      }
      // The hand-off is the programme's own page, and it is the page's last word.
      if (!body.includes(`href="${p.url.replace(/&/g, '&amp;')}"`)) fail(`${p.href} does not hand on to the programme's own page`);
    }
  }
}

if (!cards) fail('no institution cards found on any country page — has the markup changed?');

if (failures.length) {
  for (const f of failures.slice(0, 40)) console.log(`  FAIL  ${f}`);
  if (failures.length > 40) console.log(`  … and ${failures.length - 40} more`);
  process.exit(1);
}
if (!programmePages) {
  console.log('  FAIL  no programme pages found under any listed school — has the markup changed?');
  process.exit(1);
}
console.log(
  `  ok    ${pages} school pages, ${programmePages} programme pages (${applyTiles} with Apply by, each from its programme or school and none only for Diploma holders; ${holdersTiles} "${NOT_OPEN_YET}" or "${AFTER_DIPLOMA}"; ${beforeNotes} open on the record's note), ${cards} institution cards on country pages; none hands a student to a homepage`
);
