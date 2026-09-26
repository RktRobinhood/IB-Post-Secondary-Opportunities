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
 *      where the record has one that names it or names no other programme;
 *  10. one deadline rule for every country (round 4): the Apply-by tile is
 *      always there (8 tiles in the strip); a date it gives is a closing date
 *      of this programme or school for an EU/EEA final-year reader, or a
 *      route date that is every such school's deadline (`everySchool`) at a
 *      school of a kind it governs (`institutionTypes`) that runs no selection
 *      of its own (`ownDeadline`); never an earlier chance (`early`) or a
 *      housing date. A word-level net refuses an Apply-by or leading date
 *      whose label says "early", "bird", "priority", "discount", "public
 *      universities" or "Norwegian-taught" unless the school's record owns it.
 *      Without a date the tile says why, from the record: "Not published
 *      yet" (last year's date or an own selection), "No deadline", "Not
 *      recorded yet". Every card of the programme on its school's page says
 *      the same as its tile. No page shows a raw time-zone id or a
 *      researcher's "page gives no year", and no display title runs past 48
 *      characters unless it is listed as an exception;
 *  11. no dated Apply-by is later than a deadline the programme's own text
 *      names (round 5): its `ib`, `selectionNote`, `about`, its `needs`
 *      notes, its `closesNote`, and the school's notes that name it. Every
 *      "apply by", "deadline", "due", "upload", "videos", "portfolio",
 *      "audition" or "register" followed by a date is read, a date with no
 *      year or last year's year taken as this cycle's; a date that begins a
 *      range ("2 March to 19 May") is not a deadline. Exceptions go in
 *      scripts/lib/own-deadline-allow.json with a reason.
 *
 * Nothing here names a country. Run after a build: node scripts/test-school-pages.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { schoolKeys, loadSchools, isHomepage, programmePaths, saysForDiplomaHolders, roundOf, notesFor, displayName, NOT_OPEN_YET, AFTER_DIPLOMA, NOT_PUBLISHED, NOT_RECORDED, NO_DEADLINE } from '../src/lib/schools.mjs';
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
const knownSchools = schoolKeys(path.join(ROOT, 'data', 'countries'));
function applyByAllowed(key, rec, prog, iso) {
  if (prog.closes === iso) return !prog.closesForDiplomaHolders;
  const ownRound = prog.round ? roundOf(prog.round) : null;
  const holders = (d) => (ownRound && prog.closes && roundOf(d.label) === ownRound ? prog.closesForDiplomaHolders : d.forDiplomaHolders);
  /* A closing date of the record, for an EU/EEA final-year reader. */
  const own = (rec.dates || []).some(
    (d) =>
      d.date === iso && d.kind === 'closes' && d.who !== 'non-eu' && !holders(d) &&
      (!(d.programmes || []).length || d.programmes.includes(prog.slug)) &&
      (!prog.ownDeadline || (d.programmes || []).includes(prog.slug))
  );
  if (own) return true;
  if (milestones.some((m) => (m.institutions || []).includes(key) && !m.forDiplomaHolders && (m.date === iso || m.endDate === iso))) return true;
  /* A route's date that is every school's deadline, where it governs this one. */
  const type = knownSchools.get(key)?.type;
  const ownSelection = Boolean(rec.ownDeadline || prog.ownDeadline);
  return !ownSelection && routes.some(
    (r) => r.destination === key.slice(0, 2) &&
      (r.milestones || []).some(
        (m) => m.everySchool && m.date === iso && m.audience !== 'non-eu' &&
          (!(m.institutionTypes || []).length || m.institutionTypes.includes(type))
      )
  );
}
/* Rule 11: the deadlines a programme's own text names, as ISO dates of this
   cycle. A date with no year, or with last year's, is read as this cycle's
   same day (October to December in the autumn before the intake). */
const MONTH_RE = '(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
const DEADLINE_WORDS = /\b(apply|applications?|deadline|due|upload|videos?|portfolio|audition|register|registration|submit|closes?|by)\b/i;
export function ownTextDeadlines(text, intakeYear) {
  const out = [];
  const re = new RegExp(`(\\d{1,2})\\s+${MONTH_RE}\\b(?:\\s+(?:in\\s+)?(\\d{4}))?`, 'g');
  const str = String(text || '');
  for (const m of str.matchAll(re)) {
    const before = str.slice(Math.max(0, m.index - 45), m.index);
    const after = str.slice(m.index + m[0].length, m.index + m[0].length + 6);
    if (/^\s*(?:–|-|to\b)/.test(after)) continue; // the start of a range
    if (/\b(from|opens?|opening|starts?|between)\s*$/i.test(before)) continue; // an opening, not a deadline
    if (!DEADLINE_WORDS.test(before)) continue;
    const month = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(m[2].slice(0, 3).toLowerCase()) + 1;
    /* A year this cycle or later stands; last year's spring date, or none,
       is this cycle's same day; October to December is the autumn before. */
    const given = Number(m[3]) || null;
    const year = given && (given >= intakeYear || (given === intakeYear - 1 && month >= 9)) ? given : month >= 10 ? intakeYear - 1 : intakeYear;
    out.push({ iso: `${year}-${String(month).padStart(2, '0')}-${m[1].padStart(2, '0')}`, said: m[0] });
  }
  return out;
}
const OWN_ALLOW = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'lib', 'own-deadline-allow.json'), 'utf8')).allow;
{
  /* Self-test: Hanze Physiotherapy's own line against the school's 15 August. */
  const said = ownTextDeadlines('International Physiotherapy Programme, selective: apply by 15 January, then a registration form, tests and an online selection day in February.', 2027);
  const range = ownTextDeadlines('2026: register 2 March to 19 May, exam 30 June', 2027).map((d) => d.iso);
  if (said[0]?.iso !== '2027-01-15' || !(said[0].iso < '2027-08-15') || range.includes('2027-03-02') || !range.includes('2027-05-19')) {
    console.log('  FAIL  self-test: the own-deadline reader misreads a programme line');
    process.exit(1);
  }
  console.log("  ok    self-test: a programme's own \"apply by 15 January\" is read, and would fail a 15 August tile");
}

/* Words that mark a date as not this school's deadline unless its record says
   it is: an earlier chance, a discount, or another group's general date. */
const NOT_THE_DEADLINE = /\b(early|bird|priority|discount|public universities|norwegian-taught)\b/i;
/* Owned: the school's record has it, or a route says it governs this kind of
   school (`institutionTypes`), and the school runs no selection of its own. */
const recordOwns = (rec, label, key) =>
  (rec.dates || []).some((d) => d.label === label && d.kind === 'closes') ||
  (!rec.ownDeadline && routes.some((r) => r.destination === key.slice(0, 2) && (r.milestones || []).some(
    (m) => m.label === label && (m.institutionTypes || []).includes(knownSchools.get(key)?.type)
  )));
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
    /* A discount date is not the deadline; the final one is (MODUL). */
    ['at-modul', 'bba-in-tourism-and-hospitality-management', '2027-01-15', false],
    ['at-modul', 'bba-in-tourism-and-hospitality-management', '2027-08-15', true],
    /* Austria's public-university 5 September: not WU's (its own selection),
       not IMC's (a Fachhochschule), but a public university's open degree. */
    ['at-wu-vienna', 'business-and-economics-bbe', '2027-09-05', false],
    ['at-imc-krems', 'business-administration', '2027-09-05', false],
    ['at-aau', 'social-sciences', '2027-09-05', true],
    /* Samordna's Norwegian-taught 15 April is not a ballet audition's. */
    ['no-khio', 'bachelor-s-programme-in-classical-ballet', '2027-04-15', false],
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
  /* And the word-level net catches what the rule is for. */
  const net = ['Super Early Bird, fall entry: €2,000 off the year', 'General closing date at public universities', 'Samordna opptak main deadline (Norwegian-taught programmes)', 'Priority deadline']
    .every((l) => NOT_THE_DEADLINE.test(l)) && !NOT_THE_DEADLINE.test('Final deadline, fall entry');
  if (!net) wrong.push(['the word net', '', '', '']);
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
/* Official names with no degree-type words to take off, each longer than 48
   characters: the exceptions rule 10 allows. */
const LONG_TITLES = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'lib', 'long-titles.json'), 'utf8')).titles);
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
let ownChecked = 0;
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
      /* Rule 10: never a dropped tile, never a short strip. */
      if (!tile) fail(`${p.href}: no Apply-by tile`);
      const strip = (body.match(/<dl class="glance">([\s\S]*?)<\/dl>/)?.[1] || '').match(/class="glance__item"/g)?.length || 0;
      if (strip !== 8) fail(`${p.href}: the facts strip has ${strip} tiles, not 8`);
      const says = tile?.trim();
      const whyNot = {
        [NOT_PUBLISHED]: Boolean(p.lastYear || rec.lastYear || p.ownDeadline || rec.ownDeadline),
        [NO_DEADLINE]: Boolean(rec.noDeadline),
        /* No reader's closing date that could be this programme's: none
           scoped or named to another programme. */
        [NOT_RECORDED]: !p.closes && !(rec.dates || []).some((d) =>
          d.kind === 'closes' && d.who !== 'non-eu' && !d.forDiplomaHolders &&
          (!(d.programmes || []).length || d.programmes.includes(p.slug)) &&
          !rec.programmes.some((q) => q.name !== p.name && d.label.toLowerCase().includes(displayName(q.name).toLowerCase()))),
      };
      if (says in whyNot) {
        if (!whyNot[says]) fail(`${p.href}: "Apply by ${says}" does not follow from its record`);
        const line = body.match(/class="dates-panel__status"><strong>([^<]+)/)?.[1];
        if (line && line !== says) fail(`${p.href}: the dates panel opens on "${line}", not "${says}"`);
        holdersTiles++;
      } else if (tile && (tile.trim() === NOT_OPEN_YET || tile.trim() === AFTER_DIPLOMA)) {
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
      /* Rule 10: no leading deadline that is someone else's, by its words. */
      for (const m of body.matchAll(/<li class="dates-panel__item"[^>]*data-binding="true"[^>]*>[\s\S]*?class="dates-panel__what">([^<]*)</g)) {
        const label = unescape(m[1]).trim();
        if (NOT_THE_DEADLINE.test(label) && !recordOwns(rec, label, key)) fail(`${p.href}: the dates panel leads with "${label}", which is not this school's deadline`);
      }
      /* Rule 10: the card says what the tile says. */
      const expect = isoOf(says || '') ? `Apply by ${says.split(' ').slice(0, 2).join(' ').replace(/(\d+ [A-Z][a-z]{2})[a-z]*/, '$1')}` : says;
      const at = main.indexOf(`href="${BASE}${p.href}"`);
      const cardHtml = at < 0 ? '' : main.slice(main.lastIndexOf('<article', at), main.indexOf('</article>', at));
      const chip = cardHtml.match(/<li class="tag tag--sand">([^<]+)<\/li>/)?.[1];
      const inFamily = /class="card__paths|paths-block|pathrow/.test(cardHtml);
      if (!inFamily && chip && unescape(chip) !== expect) fail(`${p.href}: its card says "${unescape(chip)}", its page "${expect}"`);
      /* Rule 10: what a student reads, not what a researcher wrote. */
      const visible = body.replace(/<[^>]+>/g, ' ');
      if (/\b(Europe|America|Asia|Australia|Africa)\/[A-Z][a-z_]+/.test(visible)) fail(`${p.href}: shows a raw time-zone id`);
      if (/page gives no year/i.test(visible)) fail(`${p.href}: shows the researcher's note "page gives no year"`);
      const h1 = unescape((body.match(/<h1>([\s\S]*?)<\/h1>/)?.[1] || '').replace(/<[^>]+>/g, '')).trim();
      if (h1.length > 48 && !LONG_TITLES.has(h1)) fail(`${p.href}: the display title "${h1}" is ${h1.length} characters (allow it in scripts/lib/long-titles.json)`);
      /* Rule 11: never later than a deadline the programme's own text names. */
      const tileIso = isoOf(says || '');
      if (tileIso) {
        const intakeYear = Number(String(rec.intake || '').match(/\d{4}/)?.[0]) || 2027;
        const programmeNotes = notesFor({ ...rec, programmes: programmePaths(key, rec.programmes) }, p).filter((n) => n.mine).map((n) => n.text);
        const texts = [p.ib, p.selectionNote, p.about, p.closesNote, ...(p.needs || []).map((n) => n.note), ...programmeNotes];
        for (const d of texts.flatMap((t) => ownTextDeadlines(t, intakeYear))) {
          if (d.iso < tileIso && !OWN_ALLOW.some((a) => a.page === p.href && a.said === d.said)) {
            fail(`${p.href}: "Apply by ${says}" is later than "${d.said}" in its own text`);
          }
        }
        /* A school-wide date that itself warns some programmes are earlier
           ("arts programmes are earlier") is not the tile of a programme its
           own text says auditions or takes a portfolio, unless that programme
           has its own date. */
        const warned = (rec.dates || []).find((d) => d.date === tileIso && /\b(earlier|arts programmes?|auditions?)\b/i.test(d.label));
        if (warned && !p.closes && /\b(audition|portfolio|videos?)\b/i.test(texts.join(' '))) {
          fail(`${p.href}: "Apply by ${says}" is a school-wide date that says "${warned.label}", and this programme auditions or takes a portfolio`);
        }
        ownChecked++;
      }
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
      /* Rule 9: the record's notes for this programme open the page, a
         caution first ("Before you apply"), else as "Worth knowing". */
      const notes = notesFor({ ...rec, programmes: programmePaths(key, rec.programmes) }, p);
      if (notes.length) {
        const block = unescape(body.split(/aria-label="(?:Before you apply|Worth knowing)"/)[1]?.split('</aside>')[0] || '');
        if (!notes.every((n) => block.includes(n.text))) fail(`${p.href}: "Before you apply" does not show the record's notes for it`);
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
  `  ok    ${pages} school pages, ${programmePages} programme pages (${applyTiles} with Apply by, each from its programme or school and none only for Diploma holders; ${holdersTiles} say why there is no date; every strip 8 tiles; ${ownChecked} dated tiles no later than their own text; ${beforeNotes} open on the record's notes), ${cards} institution cards on country pages; none hands a student to a homepage`
);
