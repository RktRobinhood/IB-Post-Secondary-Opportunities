import fs from 'node:fs';
import path from 'node:path';
import { collection } from './lib/records.mjs';
import { loadRecords } from '../src/lib/records.mjs';
import { schoolKey, schoolKeys, loadSchools, isHomepage, programmePaths, pagedProgrammes, saysForDiplomaHolders, roundOf, notesFor, displayName, NOT_OPEN_YET, AFTER_DIPLOMA, NOT_PUBLISHED, NOT_RECORDED, NO_DEADLINE, CLOSED } from '../src/lib/schools.mjs';
import { schoolCardGroups } from '../src/lib/families.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist');
const TODAY = process.env.SITE_TODAY || new Date().toISOString().slice(0, 10);
const BASE = (process.env.SITE_BASE || '').replace(/\/$/, '');

const failures = [];
const fail = (m) => failures.push(m);
const read = (p) => {
  const f = path.join(DIST, p, 'index.html');
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
};

const routes = collection('application-routes');
const milestones = routes.flatMap((r) => r.milestones || []);
const knownSchools = schoolKeys(path.join(ROOT, 'data', 'countries'));
function applyByAllowed(key, rec, prog, iso) {
  if (prog.closes === iso) return !prog.closesForDiplomaHolders;
  const ownRoutes = new Set((prog.intakes || []).flatMap(i => i.applicationRoutes || []));
  if (routes.some(r => ownRoutes.has(r.id) && r.readerAccess?.state !== 'closed' && (r.milestones || []).some(m => m.type === 'submit' && m.date === iso && m.audience !== 'non-eu' && !m.forDiplomaHolders && m.readerAccess?.state !== 'closed'))) return true;
  const ownRound = prog.round ? roundOf(prog.round) : null;
  const holders = (d) => (ownRound && prog.closes && roundOf(d.label) === ownRound ? prog.closesForDiplomaHolders : d.forDiplomaHolders);
  const own = (rec.dates || []).some(
    (d) =>
      d.date === iso && d.kind === 'closes' && d.who !== 'non-eu' && !holders(d) &&
      (!(d.programmes || []).length || d.programmes.includes(prog.slug)) &&
      (!prog.ownDeadline || (d.programmes || []).includes(prog.slug))
  );
  if (own) return true;
  if (milestones.some((m) => (m.institutions || []).includes(key) && !m.forDiplomaHolders && (m.date === iso || m.endDate === iso))) return true;
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
    const given = Number(m[3]) || null;
    const year = given && (given >= intakeYear || (given === intakeYear - 1 && month >= 9)) ? given : month >= 10 ? intakeYear - 1 : intakeYear;
    out.push({ iso: `${year}-${String(month).padStart(2, '0')}-${m[1].padStart(2, '0')}`, said: m[0] });
  }
  return out;
}
const OWN_ALLOW = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'lib', 'own-deadline-allow.json'), 'utf8')).allow;
{
  const said = ownTextDeadlines('International Physiotherapy Programme, selective: apply by 15 January, then a registration form, tests and an online selection day in February.', 2027);
  const range = ownTextDeadlines('2026: register 2 March to 19 May, exam 30 June', 2027).map((d) => d.iso);
  if (said[0]?.iso !== '2027-01-15' || !(said[0].iso < '2027-08-15') || range.includes('2027-03-02') || !range.includes('2027-05-19')) {
    console.log('  FAIL  self-test: the own-deadline reader misreads a programme line');
    process.exit(1);
  }
  console.log("  ok    self-test: a programme's own \"apply by 15 January\" is read, and would fail a 15 August tile");
}

const NOT_THE_DEADLINE = /\b(early|bird|priority|discount|public universities|norwegian-taught)\b/i;
const recordOwns = (rec, label, key) =>
  (rec.dates || []).some((d) => d.label === label && d.kind === 'closes') ||
  (!rec.ownDeadline && routes.some((r) => r.destination === key.slice(0, 2) && (r.milestones || []).some(
    (m) => m.label === label && (m.institutionTypes || []).includes(knownSchools.get(key)?.type)
  )));
const statusAllowed = (rec, prog, value) =>
  value === AFTER_DIPLOMA
    ? Boolean(prog.closesForDiplomaHolders)
    : value === NOT_OPEN_YET && !prog.closesForDiplomaHolders && (rec.dates || []).some((d) => d.forDiplomaHolders);
function closedAllowed(rec, prog, today) {
  if (prog.closes) return !prog.closesForDiplomaHolders && prog.closes < today;
  const dates = (rec.dates || []).filter((d) =>
    d.kind === 'closes' && d.who !== 'non-eu' && !d.forDiplomaHolders &&
    (!(d.programmes || []).length || d.programmes.includes(prog.slug)));
  return dates.length > 0 && dates.every((d) => d.date < today);
}
{
  const rec = { dates: [{ kind: 'closes', date: '2027-01-15' }] };
  const checks = [
    closedAllowed(rec, { closes: '2026-10-15' }, '2026-10-28'),
    !closedAllowed(rec, { closes: '2026-10-28' }, '2026-10-28'),
    !closedAllowed(rec, { closes: '2026-10-15', closesForDiplomaHolders: true }, '2026-10-28'),
    !closedAllowed({ dates: [{ kind: 'closes', date: '2026-10-15', programmes: ['other'] }] }, { slug: 'medicine' }, '2026-10-28'),
  ];
  if (checks.some((ok) => !ok)) throw new Error('Closed-tile guard misreads a programme deadline');
}
const unescape = (t) => String(t).replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
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

if (!isHomepage('https://www.helsinki.fi/en', null) || isHomepage('https://www.helsinki.fi/en/admissions', null)) {
  console.log('  FAIL  self-test: isHomepage cannot tell a homepage from a targeted page');
  process.exit(1);
}
console.log('  ok    self-test: a homepage is caught, a targeted page passes');

{
  const seeds = loadSchools(path.join(ROOT, 'data', 'schools'));
  const prog = (key, slug) => programmePaths(key, seeds.get(key)?.programmes || []).find((p) => p.slug === slug);
  const cases = [
    ['at-modul', 'bba-in-tourism-and-hospitality-management', '2027-01-15', false],
    ['at-modul', 'bba-in-tourism-and-hospitality-management', '2027-08-15', true],
    ['at-wu-vienna', 'business-and-economics-bbe', '2027-09-05', false],
    ['at-imc-krems', 'business-administration', '2027-09-05', false],
    ['at-aau', 'social-sciences', '2027-09-05', true],
    ['no-khio', 'bachelor-s-programme-in-classical-ballet', '2027-04-15', false],
    ['nl-radboud', 'artificial-intelligence', '2027-05-01', false],
    ['nl-radboud', 'artificial-intelligence', '2027-07-01', true],
    ['de-tum', 'aerospace', '2027-05-31', false],
    ['nl-radboud', 'artificial-intelligence', '2027-01-15', false],
    ['de-tum', 'aerospace', '2027-07-15', true],
    ['se-kth', 'information-and-communication-technology', '2027-01-15', false],
    ['se-kth', 'information-and-communication-technology', '2027-04-15', true],
  ];
  const wrong = cases.filter(([key, slug, iso, want]) => {
    const p = prog(key, slug);
    return !p || applyByAllowed(key, seeds.get(key), p, iso) !== want;
  });
  const net = ['Super Early Bird, fall entry: €2,000 off the year', 'General closing date at public universities', 'Samordna opptak main deadline (Norwegian-taught programmes)', 'Priority deadline']
    .every((l) => NOT_THE_DEADLINE.test(l)) && !NOT_THE_DEADLINE.test('Final deadline, fall entry');
  if (!net) wrong.push(['the word net', '', '', '']);
  if (wrong.length || isoOf('15 July 2027') !== '2027-07-15') {
    console.log(`  FAIL  self-test: the Apply-by rule misjudges ${wrong.map((w) => `${w[0]}/${w[1]} ${w[2]}`).join(', ') || 'a date'}`);
    process.exit(1);
  }
  console.log("  ok    self-test: a route date for other programmes, or a date for Diploma holders, is refused as Apply by; the school's own passes");
}

for (const r of routes) {
  for (const m of r.milestones || []) {
    if (!m.forDiplomaHolders && saysForDiplomaHolders(`${m.label} ${m.note || ''}`)) {
      fail(`${r.id}/${m.id} "${m.label}" says it is for Diploma holders only: set forDiplomaHolders`);
    }
  }
}

const liftsHolders = (html) =>
  [...html.matchAll(/<li class="dates-panel__item"[^>]*>/g)].some((m) => /data-binding="true"/.test(m[0]) && /data-diploma-holders="true"/.test(m[0]));

const known = schoolKeys(path.join(ROOT, 'data', 'countries'));
const LONG_TITLES = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'lib', 'long-titles.json'), 'utf8')).titles);
const records = (await loadRecords({ retirePassed: true, today: TODAY })).schools;
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
let catalogues = 0;
let flagships = 0;
for (const c of countries) {
  const countryPage = read((c.href || '/destinations/' + c.code + '/').replace(/^\/|\/$/g,''));
  if (!countryPage) {
    fail(`/destinations/${c.code}/ was not built`);
    continue;
  }
  // The institution cards sit in the #institutions section, before the map.
  const section = countryPage.split('id="institutions"')[1]?.split('class="world')[0] || '';
  for (const inst of c.institutions || []) {
    const key = schoolKey(c.code, inst);
    if (records.get(key)?.scope === 'none' && section.includes(`/universities/${key}/`)) {
      fail(`/destinations/${c.code}/ publishes ${key}, despite its confirmed scope:none record`);
    }
  }
  for (const m of section.matchAll(/<h3 class="card__title"><a href="([^"]+)"/g)) {
    cards++;
    if (/^(https?:)?\/\//.test(m[1])) fail(`/destinations/${c.code}/: an institution card leaves the site (${m[1]})`);
  }
}

for (const [key, inst] of known) {
  const html = read(`universities/${key}`);
  if (records.get(key)?.scope === 'none' && !records.get(key)?.publicPage) {
    if (html) fail(`/universities/${key}/ was built despite its confirmed scope:none record`);
    continue;
  }
  if (!html) {
    fail(`/universities/${key}/ was not built`);
    continue;
  }
  pages++;
  const main = html.split('<main')[1]?.split('</main>')[0] || '';
  if (liftsHolders(main)) fail(`/universities/${key}/: the dates panel leads with a date only for Diploma holders`);
  if (panelDates(main).some((d) => d.who === 'non-eu')) fail(`/universities/${key}/: the dates panel shows a date only for applicants from outside the EU/EEA`);
  const admissions = main.replace(/<p class="hero__credit"[\s\S]*?<\/p>/g,'').replace(/<p class="card__credit"[\s\S]*?<\/p>/g,'');
  for (const m of admissions.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    const link = m[1].replace(/&amp;/g, '&');
    if (isHomepage(link, inst.website)) fail(`/universities/${key}/ hands the student to a homepage: ${link}`);
  }
  const rec = records.get(key);
  if (rec?.scope === 'catalogue') {
    const study = (main.split('id="programmes"')[1] || '').split('data-slot="details"')[0];
    const said = unescape((study.match(/data-taught="english"[^>]*>([^<]*)</)?.[1] || '').trim());
    if (!/\btaught in English\b/.test(said)) fail(`/universities/${key}/: its study section does not say its degrees are taught in English`);
    if (rec.handoff && !study.includes(`href="${rec.handoff.url.replace(/&/g, '&amp;')}"`)) {
      fail(`/universities/${key}/: its study section does not hand on to its course search (${rec.handoff.url})`);
    }
    const subjects = rec.faculties?.length ? rec.faculties
      : (inst.knownFor?.length ? inst.knownFor : inst.notableFields || []).map((name) => ({ name, url: rec.handoff?.url }));
    const subjectCards = [...study.matchAll(/<article class="card card--link[^"]*\bcard--subject\b[^"]*">[\s\S]*?<\/article>/g)].map((m) => m[0]);
    const listedSubjects = subjects.filter((subject) => subject.url);
    if (!subjectCards.length || subjectCards.length !== listedSubjects.length)
      fail(`/universities/${key}/: catalogue has ${subjectCards.length} subject cards for ${listedSubjects.length} recorded subject areas`);
    for (const subject of listedSubjects) {
      const card = subjectCards.find((card) => unescape(card.match(/<h3 class="card__title"><a [^>]*>([\s\S]*?)<\/a>/)?.[1] || '') === subject.name);
      const titleHref = card?.match(/<h3 class="card__title"><a href="([^"]+)"/)?.[1];
      if (titleHref !== rec.handoff?.url?.replace(/&/g, '&amp;'))
        fail(`/universities/${key}/: subject area ${subject.name} must open the official catalogue, not its admissions evidence`);
      if (!card?.includes(`href="${subject.url.replace(/&/g, '&amp;')}"`))
        fail(`/universities/${key}/: subject area ${subject.name} lost its entry-detail source link`);
    }
    catalogues++;
    flagships += pagedProgrammes(rec).length;
  }
  if (pagedProgrammes(rec).length) {
    const shown = [...(main.split('id="programmes"')[1] || '').matchAll(/<article class="card card--link[^"]*">/g)].filter((match) => !/\bcard--subject\b/.test(match[0])).length;
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
      const heroClass = body.match(/<section class="([^"]*\bhero\b[^"]*)"/)?.[1] || '';
      if (!heroClass.split(/\s+/).includes('hero--compact')) fail(`${p.href}: programme hero is not compact like the Danish reference`);
      if (/\b(?:hero--fam|hero--panel|card--fam-\S+)/.test(heroClass)) fail(`${p.href}: programme hero uses a retired country-specific treatment (${heroClass})`);
      const heroHtml = body.slice(0, body.indexOf('</section>'));
      if (/class="crumbs"/.test(heroHtml)) fail(`${p.href}: breadcrumbs sit inside the hero instead of following the facts strip like the Danish reference`);
      if (!/class="crumbs"/.test(body.slice(heroHtml.length))) fail(`${p.href}: no breadcrumb trail follows the programme hero`);
      for (const m of body.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
        const link = m[1].replace(/&amp;/g, '&');
        if (isHomepage(link, inst.website)) fail(`${p.href} hands the student to a homepage: ${link}`);
      }
      const tile = body.match(/<dt>Apply by<\/dt>\s*<dd>([^<]+)/)?.[1];
      if (!tile) fail(`${p.href}: no Apply-by tile`);
      const strip = (body.match(/<dl class="glance">([\s\S]*?)<\/dl>/)?.[1] || '').match(/class="glance__item[" ]/g)?.length || 0;
      if (strip !== 8) fail(`${p.href}: the facts strip has ${strip} tiles, not 8`);
      const says = tile?.trim();
      const whyNot = {
        [NOT_PUBLISHED]: Boolean(p.lastYear || rec.lastYear || p.ownDeadline || rec.ownDeadline),
        [NO_DEADLINE]: Boolean(rec.noDeadline),
        [CLOSED]: closedAllowed(rec, p, TODAY),
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
      for (const m of body.matchAll(/<li class="dates-panel__item"[^>]*data-binding="true"[^>]*>[\s\S]*?class="dates-panel__what">([^<]*)</g)) {
        const label = unescape(m[1]).trim();
        if (NOT_THE_DEADLINE.test(label) && !recordOwns(rec, label, key)) fail(`${p.href}: the dates panel leads with "${label}", which is not this school's deadline`);
      }
      const at = main.indexOf(`href="${BASE}${p.href}"`);
      const cardHtml = at < 0 ? '' : main.slice(main.lastIndexOf('<article', at), main.indexOf('</article>', at));
      const tagSlot = cardHtml.match(/<div class="card__tag">([\s\S]*?)<\/div>/)?.[1] || '';
      const chips = [...tagSlot.matchAll(/<li class="tag(?:\s+[^"]*)?">([^<]+)<\/li>/g)].map((match) => unescape(match[1]));
      if (chips.length !== 1 || !/^(Open entry|Selective|Limited places|Ask the university)$/.test(chips[0]))
        fail(`${p.href}: its card needs one admission tag, or an explicit university gap`);
      const visible = body.replace(/<[^>]+>/g, ' ');
      if (/\b(Europe|America|Asia|Australia|Africa)\/[A-Z][a-z_]+/.test(visible)) fail(`${p.href}: shows a raw time-zone id`);
      if (/page gives no year/i.test(visible)) fail(`${p.href}: shows the researcher's note "page gives no year"`);
      const h1 = unescape((body.match(/<h1>([\s\S]*?)<\/h1>/)?.[1] || '').replace(/<[^>]+>/g, '')).trim();
      if (h1.length > 48 && !LONG_TITLES.has(h1)) fail(`${p.href}: the display title "${h1}" is ${h1.length} characters (allow it in scripts/lib/long-titles.json)`);
      const tileIso = isoOf(says || '');
      if (tileIso) {
        const intakeYear = Number(String(rec.intake || '').match(/\d{4}/)?.[0]) || 2027;
        const programmeNotes = notesFor({ ...rec, programmes: programmePaths(key, rec.programmes) }, p).filter((n) => n.mine && !n.theirs).map((n) => n.text);
        const texts = [p.ib, p.selectionNote, p.about, p.closesNote, ...(p.needs || []).map((n) => n.note), ...programmeNotes];
        for (const d of texts.flatMap((t) => ownTextDeadlines(t, intakeYear))) {
          if (d.iso < tileIso && !OWN_ALLOW.some((a) => a.page === p.href && a.said === d.said)) {
            fail(`${p.href}: "Apply by ${says}" is later than "${d.said}" in its own text`);
          }
        }
        const warned = (rec.dates || []).find((d) => d.date === tileIso && /\b(earlier|arts programmes?|auditions?)\b/i.test(d.label));
        if (warned && !p.closes && /\b(audition|portfolio|videos?)\b/i.test(texts.join(' '))) {
          fail(`${p.href}: "Apply by ${says}" is a school-wide date that says "${warned.label}", and this programme auditions or takes a portfolio`);
        }
        ownChecked++;
      }
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
      const notes = notesFor({ ...rec, programmes: programmePaths(key, rec.programmes) }, p);
      if (notes.length) {
        const block = unescape(body.split(/aria-label="(?:Before you apply|Worth knowing)"/)[1]?.split('</aside>')[0] || '');
        if (!notes.every((n) => block.includes(n.text))) fail(`${p.href}: "Before you apply" does not show the record's notes for it`);
        else beforeNotes++;
      }
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
  `  ok    ${pages} school pages (${catalogues} catalogue pages say they teach in English, ${flagships} flagships), ${programmePages} programme pages (${applyTiles} with Apply by, each from its programme or school and none only for Diploma holders; ${holdersTiles} say why there is no date; every strip 8 tiles; ${ownChecked} dated tiles no later than their own text; ${beforeNotes} open on the record's notes), ${cards} institution cards on country pages; none hands a student to a homepage`
);

// Country framing, published sources, portals, open days and public inventory
{
const { default: assert } = await import('node:assert/strict');
const { default: fs } = await import('node:fs/promises');
const { default: path } = await import('node:path');
const { load } = await import('../src/lib/data.mjs');
const { schoolProgrammePage } = await import('../src/pages/school-programme.mjs');
const { universitiesIndex, schoolPage } = await import('../src/pages/schools.mjs');
const { isEnglishStudyOption } = await import('../src/lib/schools.mjs');
const { escape } = await import('../src/lib/html.mjs');
const { url, currentNav } = await import('../src/lib/layout.mjs');

const ROOT = path.resolve(import.meta.dirname, '..');

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message}`);
  }
};
const checkAsync = async (name, fn) => {
  try {
    await fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message}`);
  }
};

console.log('\nDestination framing guards\n');

const site = await load();

const between = (html, re) => (html.match(re) || [])[1] || '';
const titleOf = (html) => between(html, /<title>([\s\S]*?)<\/title>/);
const descriptionOf = (html) => between(html, /<meta name="description" content="([\s\S]*?)">/);
const headingOf = (html) => between(html, /<h1[^>]*>([\s\S]*?)<\/h1>/).replace(/<[^>]+>/g, '').trim();
const base = url('/').slice(0, -1);
const sitePath = (href) => (base && href.startsWith(base) ? href.slice(base.length) : href);
const crumbHrefs = (html) => {
  const trail = between(html, /<nav aria-label="Breadcrumb">([\s\S]*?)<\/nav>/);
  // A crumb may land on the country page's list of institutions (#institutions);
  // it still goes through that country.
  return [...trail.matchAll(/href="([^"]*)"/g)].map((m) => sitePath(m[1]).split('#')[0]);
};
const sectionOf = (html) => sitePath(between(html, /<a href="([^"]*)" aria-current="page"/));

const countryOf = (inst) => site.destinations.find((c) => c.code === inst.destination?.code);
const schoolOf = (inst) => countryOf(inst)?.institutions.find((i) => i.id === inst.id || i.key === inst.id) || inst;
const renderUniversity = (inst) => schoolPage(site, schoolOf(inst), countryOf(inst), { prev: null, next: null });
const renderProgramme = (inst, p) => {
  const school = schoolOf(inst);
  const record = school.school?.programmes.find((x) => x.opportunityId === p.id || x.id === p.id || x.href === p.href) || p;
  return schoolProgrammePage(site, school, countryOf(inst), record);
};

const institutions = site.institutionCatalogue.all;
const publicInstitutions = institutions.filter((i) => isEnglishStudyOption(i) || i.school?.publicPage);
const danish = site.dkInstitutions;

check('every institution carries the country facts a breadcrumb and sentence need', () => {
  for (const inst of institutions) {
    for (const field of ['code', 'name', 'sentenceName', 'href', 'section']) {
      assert.ok(inst.destination?.[field], `${inst.id}'s country has no ${field}`);
    }
    assert.ok(countryOf(inst), `${inst.id} has no country page`);
    assert.ok(schoolOf(inst).school, `${inst.id} has no school record for the common adapter`);
  }
});
check('country articles remain part of sentences rather than breadcrumb labels', () => {
  const nl = institutions.find((i) => i.destination.code === 'nl');
  assert.equal(nl.destination.sentenceName, 'the Netherlands');
  assert.equal(nl.destination.name, 'Netherlands');
});

check('dkInstitutions holds only Danish Institutions', () => {
  const strays = danish.filter((i) => i.destination?.code !== 'dk').map((i) => i.id);
  assert.deepEqual(strays, [], `these are not Danish and are being handed to Denmark's pages: ${strays.join(', ')}`);
  assert.ok(danish.length > 0, 'expected Denmark to have Institutions');
});

check('the catalogue holds more than Denmark', () => {
  assert.ok(
    institutions.length > danish.length,
    'expected the catalogue to hold Institutions outside Denmark — this test is meaningless otherwise'
  );
});

check('asking for a Destination we hold nothing for returns nothing', () => {
  // Not "everything". A caller that asks about a Destination is making a claim
  // about that Destination, and handing it Denmark's list is how the bug this
  // file exists for got written in the first place.
  assert.deepEqual(site.institutionCatalogue.in('zz'), []);
});

check('every Institution is in exactly one Destination group', () => {
  const grouped = site.institutionCatalogue.byDestination.flatMap((d) => d.institutions);
  assert.equal(grouped.length, institutions.length, 'grouping lost or duplicated an Institution');
  assert.equal(new Set(grouped.map((i) => i.id)).size, institutions.length);
});

check('no Institution page anywhere borrows another Destination\'s framing', () => {
  // The general form, so a third Destination cannot reintroduce this.
  for (const inst of institutions) {
    const html = renderUniversity(inst);
    const hubs = crumbHrefs(html).filter((h) => h === '/denmark/' || h.startsWith('/destinations/'));
    assert.deepEqual(
      hubs,
      [inst.destination.href],
      `${inst.id} is in ${inst.destination.code} and its breadcrumb goes through ${hubs.join(', ') || 'nowhere'}`
    );
    assert.equal(sectionOf(html), currentNav('/countries/'), `${inst.id} is in the wrong navigation section`);
  }
});

check('no Programme page anywhere borrows another Destination\'s framing', () => {
  for (const inst of institutions) {
    for (const p of inst.programmes) {
      const html = renderProgramme(inst, p);
      for (const source of p.sources || []) if (source.quote) {
        assert.ok(html.includes(escape(source.quote)), p.href + ' dropped quoted facts from ' + source.url);
      }
      const hubs = crumbHrefs(html).filter((h) => h === '/denmark/' || h.startsWith('/destinations/'));
      assert.deepEqual(hubs, [p.destination?.href || inst.destination.href], `${p.id} sits under ${hubs.join(', ') || 'nowhere'}`);
    }
  }
});

check('every programme names the application portal in its recorded route', () => {
  for (const inst of institutions) {
    for (const p of inst.programmes) {
      const intake = site.graph.opportunities.get(p.opportunityId || p.id);
      const route = site.graph.applicationRoutes.get(intake?.applicationRoutes?.[0]);
      if (!route?.portalUrl) continue;
      const html = renderProgramme(inst, p);
      assert.ok(html.includes(route.portalUrl.replace(/&/g, '&amp;')), `${p.id} lost its recorded application portal ${route.portalUrl}`);
    }
  }
});

check('a Danish Institution page still sits under Denmark', () => {
  const inst = institutions.find((i) => i.id === 'dk-au');
  assert.ok(inst, 'expected dk-au in the catalogue');
  const html = renderUniversity(inst);
  assert.ok(crumbHrefs(html).includes('/denmark/'), 'a Danish institution lost its Denmark breadcrumb');
  // Every place is under Countries in the menu; the breadcrumb is what keeps it Danish.
  assert.equal(sectionOf(html), '/countries/');
  assert.ok(/Denmark/.test(html), 'the page does not mention Denmark at all');
});

check('a Danish Programme page still names the Danish machinery', () => {
  const inst = institutions.find((i) => i.id === 'dk-au');
  const p = inst.programmes.find((x) => x.cutoff?.value);
  assert.ok(p, 'expected at least one Danish Opportunity with a published cut-off');
  const html = renderProgramme(inst, p);
  assert.ok(crumbHrefs(html).includes('/denmark/'), 'a Danish programme lost its Denmark breadcrumb');
  // Quota 1 and the Danish 7-point scale are Danish national mechanisms, not
  // framing. Generalising them away would be the opposite mistake: the figure
  // means nothing without the competition it came out of and the scale it is
  // on, and both are on the record.
  assert.ok(/quota 1/i.test(html), 'the quota the cut-off came out of is no longer named');
  assert.ok(/7-point/.test(html), 'the scale the cut-off is measured on is no longer named');
  assert.ok(/optagelse\.dk/.test(html), 'a Danish applicant is no longer told where to apply');
});

check('the institution index does not present itself as one Destination\'s', () => {
  const html = universitiesIndex(site);
  assert.ok(!/Danish institutions/i.test(html), 'it is still headed "Danish institutions"');
  assert.ok(!crumbHrefs(html).includes('/denmark/'), 'it still sits under Denmark');
  assert.equal(sectionOf(html), '', 'it claims a navigation section while spanning Destinations');
});

check('the institution index names every Destination it actually holds', () => {
  const html = universitiesIndex(site);
  const headings = [...html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/g)]
    .map((m) => m[1].replace(/<[^>]+>/g, ''))
    .join(' | ');
  const publicDestinations = site.institutionCatalogue.byDestination.filter((d) => d.institutions.some((i) => isEnglishStudyOption(i) || i.school?.publicPage));
  for (const d of publicDestinations) {
    assert.ok(
      headings.includes(d.sentenceName) || descriptionOf(html).includes(d.sentenceName),
      `the index lists ${d.code} Institutions without saying so in a heading: ${headings}`
    );
  }
  // Derived rather than asserted: the wording must move with the data.
  assert.equal(
    [...html.matchAll(/<details class="topic__more"><summary>/g)].length,
    publicDestinations.length,
    'the index groups a different number of countries from the public catalogue'
  );
});

check('every public institution reaches the index', () => {
  const html = universitiesIndex(site);
  const missing = publicInstitutions.filter((i) => !html.includes(i.href)).map((i) => i.id);
  assert.deepEqual(missing, [], `these Institutions are built but unreachable from the index: ${missing.join(', ')}`);
});

check('internal records with no English provision have no links on the index', () => {
  const html = universitiesIndex(site);
  const leaked = institutions.filter((i) => !isEnglishStudyOption(i) && !i.school?.publicPage && html.includes(i.href)).map((i) => i.id);
  assert.deepEqual(leaked, [], `internal records reach the index: ${leaked.join(', ')}`);
});

check('programme-specific open days remain visible on their programme pages', () => {
  let checked = 0;
  for (const [key, sessions] of site.sessions) {
    const inst = institutions.find(i => i.id === key);
    if (!inst) continue;
    for (const session of sessions) for (const id of session.programmes || []) {
      const p = inst.programmes.find(p => p.programmeId === id || p.id === id);
      assert.ok(p, session.title + ' names a missing programme ' + id);
      const rendered = renderProgramme(inst,p);
      assert.ok(rendered.includes(escape(session.title)), p.href + ' lost ' + session.title);
      for (const date of session.dates || []) assert.ok(rendered.includes(date.date), p.href + ' lost session date ' + date.date);
      checked++;
    }
  }
  assert.ok(checked > 0, 'no programme-specific sessions inspected');
});

console.log(failures ? `\n${failures} failing\n` : '\nAll destination guards pass\n');
if (failures) process.exit(1);
}

// Intake language is explicit in cards, detail pages, counts and planner
{
const { default: assert } = await import('node:assert/strict');
const { default: fs } = await import('node:fs/promises');
const { load } = await import('../src/lib/data.mjs');
const { englishProgrammeCounts } = await import('../src/lib/intake-language.mjs');
const { toString } = await import('../src/lib/html.mjs');
const { schoolProgrammePage } = await import('../src/pages/school-programme.mjs');
const { schoolPage, schoolCards, programmeCard, universitiesIndex } = await import('../src/pages/schools.mjs');
const { destination } = await import('../src/pages/destinations.mjs');
const { planner } = await import('../src/pages/planner.mjs');

const site = await load();
const codes = site.destinations.map((d) => d.code);
assert.equal(codes.length, new Set(codes).size, 'each country appears once');
for (const file of (await fs.readdir(new URL('../data/countries/', import.meta.url))).filter((f) => f.endsWith('.json'))) {
  const country = JSON.parse(await fs.readFile(new URL(`../data/countries/${file}`, import.meta.url), 'utf8'));
  const loaded = site.destinations.find((c) => c.code === country.code);
  assert.ok(loaded, `${country.code} must reach the catalogue`);
  assert.equal(loaded.institutions.length, country.institutions.length, `${country.code} keeps its school inventory`);
  assert.equal(new Set(loaded.institutions.map((i) => i.key)).size, loaded.institutions.length, `${country.code} has no duplicate school`);
}
console.log('  ok    every country and its school inventory appears once');

const graph = { programmes: new Map([
  ['a', { id: 'a', family: { id: 'family' } }], ['b', { id: 'b', family: { id: 'family' } }], ['c', { id: 'c' }],
]) };
const pending = { language: 'English', languageIntakeStatus: 'unconfirmed' };
const members = [{ id: 'a-1', programmeId: 'a', language: 'English' }, { ...pending, id: 'b-1', programmeId: 'b' }, { ...pending, id: 'c-1', programmeId: 'c' }, { ...pending, id: 'c-2', programmeId: 'c' }];
assert.deepEqual(englishProgrammeCounts(graph, members), { confirmed: 1, pending: 1 });
assert.deepEqual(englishProgrammeCounts(graph, members.slice(1)), { confirmed: 0, pending: 2 });
assert.deepEqual(englishProgrammeCounts({ programmes: new Map() }, [
  { id: 'school-a-campus-1', institution: 'school-a', language: 'English', family: { name: 'Degree A' } },
  { ...pending, id: 'school-a-campus-2', institution: 'school-a', family: { name: 'Degree A' } },
  { ...pending, id: 'school-a-degree-b', institution: 'school-a', family: { name: 'Degree B' } },
  { id: 'school-b-campus-1', institution: 'school-b', language: 'English', family: { name: 'Degree A' } },
]), { confirmed: 2, pending: 1 }, 'school-record families count once per university even without a graph family id');
console.log('  ok    programme families count once and keep unsettled language separate');

const country = site.destinations.find((c) => c.guideContent?.programmeCounts && c.institutions.some((i) => i.school?.programmes?.some((p) => p.opportunityId)));
const original = country.institutions.find((i) => i.school?.programmes?.some((p) => p.opportunityId && !site.graph.programmes.get(p.programmeId)?.family));
const source = original.school.programmes.find((p) => p.opportunityId && !site.graph.programmes.get(p.programmeId)?.family);
const p = { ...source, intake: '2028-autumn', language: 'English', languageIntakeStatus: 'unconfirmed', languageNote: 'English is currently listed; the next intake teaching language is under review.' };
const inst = { ...original, programmes: [p], school: { ...original.school, programmes: [p] } };
const changedCountry = { ...country, institutions: [inst] };
const changedGraph = { ...site.graph, opportunities: new Map(site.graph.opportunities) };
const opp = changedGraph.opportunities.get(p.opportunityId);
changedGraph.opportunities.set(opp.id, { ...opp, intake: p.intake, language: { instruction: 'English', fullyInLanguage: true, intakeStatus: 'unconfirmed', note: p.languageNote } });
const fixture = { ...site, graph: changedGraph, programmes: [p], countries: [changedCountry], destinations: [changedCountry], institutions: [inst], institutionCatalogue: { ...site.institutionCatalogue, all: [inst], byDestination: [{ ...inst.destination, institutions: [inst], programmes: 0, pendingProgrammes: 1 }] } };
const group = schoolCards([p])[0];
const card = toString(programmeCard(inst, group, { country: changedCountry.name, site: fixture }));
assert.match(card, /unconfirmed for 2028/);
const detail = schoolProgrammePage(fixture, inst, changedCountry, p, {});
assert.match(detail, /unconfirmed for 2028/);
assert.match(detail, /English is currently listed; the next intake teaching language is under review\./);
assert.match(detail, /Unconfirmed for this intake/);
assert.match(schoolPage(fixture, inst, changedCountry, {}), /1 degree · 1 with teaching language unconfirmed/);
assert.match(universitiesIndex(fixture), /1 English-taught programme · 1 with teaching language unconfirmed/);
const countryHtml = destination(fixture, changedCountry, {});
assert.match(countryHtml, /1 programme/);
assert.match(countryHtml, /1 with teaching language unconfirmed/);
for (const output of [card, detail, schoolPage(fixture, inst, changedCountry, {}), universitiesIndex(fixture), countryHtml])
  assert.doesNotMatch(output, /\b0 programmes\b/);
const exportData = JSON.parse(planner(fixture).match(/id="planner-opportunities">([\s\S]*?)<\/script>/)[1]);
assert.equal(exportData.find((o) => o.id === opp.id).language.intakeStatus, 'unconfirmed');
console.log('  ok    conditional teaching language reaches cards, pages, counts and the planner');
}

// Programme families have one card, accurate counts and distinguishable paths
{
const { default: fs } = await import('node:fs');
const { homeChunkCards } = await import('./lib/home-cards.mjs');
const { default: path } = await import('node:path');
const { nameClashes, normalName, nameStem, placeWords } = await import('../src/lib/families.mjs');
const { programmePaths, pagedProgrammes, schoolKeys } = await import('../src/lib/schools.mjs');

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

function programmeCards(main) {
  return [...main.matchAll(/<article class="card card--link([^"]*)">([\s\S]*?)<\/article>/g)].filter((m) => !/\bcard--subject\b/.test(m[1]) && m[2].includes('class="card__cred"')).map((m) => ({
    title: text(m[2].match(/<h3 class="card__title"><a [^>]*>([\s\S]*?)<\/a>/)?.[1] || ''),
    foot: text(m[2].match(/<div class="card__foot">([\s\S]*?)<\/div>/)?.[1] || ''),
    languagePending: /unconfirmed for \d{4}|teaching language unconfirmed/i.test(text(m[2])),
    // Each path row of a family card: its label, and whether it says what differs.
    rows: [...m[2].matchAll(/<li class="card__path">([\s\S]*?)<\/li>/g)].map((r) => ({
      label: text(r[1].match(/<a [^>]*>([\s\S]*?)<\/a>/)?.[1] || ''),
      detail: text(r[1].match(/<span class="card__path-detail"[^>]*>([\s\S]*?)<\/span>/)?.[1] || ''),
    })),
  }));
}

const tilePending = (main) => Number(main.match(/<dt>Degrees in English<\/dt>\s*<dd>([^<]*)/)?.[1]?.match(/\b(\d+) with teaching language unconfirmed\b/)?.[1] || 0);
const tileCount = (main) => {
  const v = main.match(/<dt>Degrees in English<\/dt>\s*<dd>([^<]*)/)?.[1];
  const n = v && /^\s*(\d+)\s+degrees?\b/.exec(v);
  return v == null ? null : n ? Number(n[1]) : NaN;
};

{
  const art = (t) => `<article class="card card--link card--backdrop"><div class="card__body"><h3 class="card__title"><a href="/x/">${t}</a></h3><p class="card__cred">BSc</p></div></article>`;
  const twice = programmeCards(art('Computer Science') + art('Computer  science') + art('Electronics'));
  const clash = nameClashes(twice.map((c) => c.title));
  const campus = programmeCards(art('Civil Engineering') + art('Civil Engineering (Lappeenranta)') + art('BSc in Civil Engineering at Lahti'));
  const campusClash = nameClashes(campus.map((c) => c.title), (t) => nameStem(t, placeWords(['Lappeenranta and Lahti'])));
  if (twice.length !== 3 || clash.length !== 1 || normalName('Computer Science') !== normalName('computer-science') || campusClash[0]?.[1] !== 3) {
    console.log('✗ self-test: the card reader cannot see two cards of one name');
    process.exit(1);
  }
  const pendingTile = '<dt>Degrees in English</dt><dd>5 degrees · 1 with teaching language unconfirmed</dd>';
  const pendingCard = programmeCards(art('Conditional programme').replace('</h3>', '</h3><p><strong>unconfirmed for 2028</strong></p>'));
  if (tileCount(pendingTile) !== 5 || tilePending(pendingTile) !== 1 || !pendingCard[0]?.languagePending || twice.some((c) => c.languagePending)) {
    console.log('✗ self-test: the reader cannot distinguish confirmed and pending language choices');
    process.exit(1);
  }
}

console.log('\nOne card per programme at each institution\n');

let pages = 0;
let cards = 0;
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
    // A catalogue record's cards are its flagships, not every degree it teaches.
    recordsOf.set(key, { words, separate, flagships: rec.scope === 'catalogue' });
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
  const { words = new Set(), separate = new Set(), flagships = false } = recordsOf.get(key) || {};
  for (const [title, n] of nameClashes(list.map((c) => c.title), (t) => nameStem(t, words), separate)) {
    fail(`/universities/${key}/ shows ${n} programme cards called "${title}" (once campus and degree words are set aside): one programme is one card, its campuses or paths inside — or say separateFrom on the records`);
  }
  const tile = tileCount(main);
  if (flagships && tile !== null && !Number.isNaN(tile)) fail(`/universities/${key}/: the "Degrees in English" tile counts ${tile} degrees, but its programme cards are only its flagships`);
  else if (!flagships && tile !== null && tile !== list.length) fail(`/universities/${key}/: the "Degrees in English" tile says ${Number.isNaN(tile) ? 'something other than "N degrees"' : tile}, but the page shows ${list.length} programme cards`);
  if (tilePending(main) > list.filter((c) => c.languagePending).length) fail(`/universities/${key}/: pending intake-language choices lack visible warnings on their programme cards`);
  for (const c of list) {
    for (const r of c.rows) {
      rows++;
      if (!r.detail) fail(`/universities/${key}/: the "${c.title}" card's row "${r.label}" says nothing about what differs`);
    }
  }
}
if (!pages) fail('no programme cards found on any institution page — has the card markup changed?');

const home = read('');
// Every card: the page carries its first ones, the rest are files beside it.
const homeCards = home ? programmeCards(homeChunkCards(DIST) || mainOf(home)) : [];
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

const families = [];

const publishedSchools = (await loadRecords({ retirePassed: true, today: TODAY })).schools;
for (const [key, rec] of publishedSchools) {
  const byName = new Map();
  for (const p of programmePaths(key, pagedProgrammes(rec))) {
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
    if (fam.axis === 'campus' && campuses && !/Taught on \w+ campuses/.test(text(table))) {
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
  `  ok    ${cards} programme cards on ${pages} institution pages, ${homeCards.length} on the home page: no two at one institution share a name or a name stem; every "Degrees in English" tile counts its cards; ${rows} family rows each say what differs\n` +
    `  ok    ${families.length} families of paths, ${memberPages} path pages, each with its Paths table\n`
);
}

// Country application groups preserve every institution and the correct scoped route
{
const { default: assert } = await import('node:assert/strict');
const { default: fs } = await import('node:fs/promises');
const { default: path } = await import('node:path');
const { GROUPINGS, groupInstitutions, groupingOf, routeSentence, variationRows } = await import('../src/lib/jurisdictions.mjs');
const { load } = await import('../src/lib/data.mjs');

const ROOT = path.resolve(import.meta.dirname, '..');

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message}`);
  }
};

console.log('\nApplication jurisdictions\n');

const flat = {
  code: 'zz',
  name: 'Flatland',
  institutions: [{ name: 'A', key: 'zz-a' }, { name: 'B', key: 'zz-b' }],
};

const federal = {
  code: 'zy',
  name: 'Federalia',
  institutions: [
    { name: 'A', key: 'zy-a', jurisdiction: 'zy-north' },
    { name: 'B', key: 'zy-b', jurisdiction: 'zy-north' },
    { name: 'C', key: 'zy-c', jurisdiction: 'zy-south' },
  ],
};

function graphWith({ destination, routes = [] }) {
  return {
    destinations: new Map(destination ? [[destination.id, destination]] : []),
    applicationRoutes: new Map(routes.map((r) => [r.id, r])),
  };
}

check('a Destination that declares nothing renders as one group', () => {
  const { groups } = groupInstitutions(flat, graphWith({}));
  assert.equal(groups.length, 1);
  assert.equal(groups[0].institutions.length, 2);
});

check('and it is recorded as undeclared, not as an examined finding', () => {
  assert.equal(groupingOf(null).declared, false);
  assert.equal(groupingOf({ institutionGrouping: 'none' }).declared, true);
});

check('an unknown grouping falls back rather than throwing or inventing one', () => {
  const g = groupingOf({ institutionGrouping: 'by-vibes' });
  assert.equal(g.id, 'none');
  assert.equal(g.declared, false);
});

check('a federal Destination groups by the jurisdiction its record declares', () => {
  const { groups } = groupInstitutions(
    federal,
    graphWith({
      destination: {
        id: 'zy',
        institutionGrouping: 'jurisdiction',
        jurisdictions: [
          { id: 'zy-north', name: 'North', kind: 'province' },
          { id: 'zy-south', name: 'South', kind: 'province' },
        ],
      },
    })
  );
  assert.deepEqual(groups.map((g) => g.name), ['North', 'South']);
  assert.deepEqual(groups.map((g) => g.institutions.length), [2, 1]);
});

check('declared order is kept, because someone put them in an order for a reason', () => {
  const { groups } = groupInstitutions(
    federal,
    graphWith({
      destination: {
        id: 'zy',
        institutionGrouping: 'jurisdiction',
        jurisdictions: [
          { id: 'zy-south', name: 'South', kind: 'province' },
          { id: 'zy-north', name: 'North', kind: 'province' },
        ],
      },
    })
  );
  assert.deepEqual(groups.map((g) => g.name), ['South', 'North']);
});

check('an institution whose jurisdiction nobody defined is shown, not dropped', () => {
  const { groups } = groupInstitutions(
    { ...federal, institutions: [...federal.institutions, { name: 'D', key: 'zy-d' }] },
    graphWith({
      destination: {
        id: 'zy',
        institutionGrouping: 'jurisdiction',
        jurisdictions: [{ id: 'zy-north', name: 'North', kind: 'province' }],
      },
    })
  );
  const all = groups.flatMap((g) => g.institutions);
  assert.equal(all.length, 4, 'an institution disappeared');
  const unplaced = groups.find((g) => g.kind === 'unplaced');
  assert.ok(unplaced, 'the orphan was not called out');
  assert.equal(unplaced.defined, false);
});

check('a group finds the route scoped to its jurisdiction', () => {
  const { groups } = groupInstitutions(
    federal,
    graphWith({
      destination: {
        id: 'zy',
        institutionGrouping: 'jurisdiction',
        jurisdictions: [{ id: 'zy-north', name: 'North', kind: 'province' }],
      },
      routes: [
        { id: 'r-north', destination: 'zy', jurisdiction: 'zy-north', label: 'The Northern Service' },
        { id: 'r-other', destination: 'zy', jurisdiction: 'zy-south', label: 'The Southern Service' },
      ],
    })
  );
  assert.equal(groups[0].route.id, 'r-north');
});

check('a named route on the jurisdiction wins over one that merely matches', () => {
  const { groups } = groupInstitutions(
    federal,
    graphWith({
      destination: {
        id: 'zy',
        institutionGrouping: 'jurisdiction',
        jurisdictions: [{ id: 'zy-north', name: 'North', kind: 'province', applicationRoute: 'r-special' }],
      },
      routes: [
        { id: 'r-north', destination: 'zy', jurisdiction: 'zy-north' },
        { id: 'r-special', destination: 'zy' },
      ],
    })
  );
  assert.equal(groups[0].route.id, 'r-special');
});

check('"apply directly" is a route, and no route at all says nothing', () => {
  const direct = routeSentence({ institutions: [1, 2], route: { channel: 'direct', id: 'r' } });
  assert.match(direct, /directly/);
  assert.equal(routeSentence({ institutions: [1], route: null }), null,
    'an absent route was described as though it had been researched');
});

check('per-jurisdiction variation comes out structured, not as prose', () => {
  const rows = variationRows({
    variations: [
      { field: 'healthcare', summary: 'Mandatory cover, about 750 a year.' },
      { field: 'workRights', label: 'Working', summary: '20 hours in term.' },
    ],
  });
  assert.deepEqual(rows.map((r) => r.label), ['Healthcare', 'Working']);
});

check('a group with no declared variation produces no rows rather than an empty table', () => {
  assert.deepEqual(variationRows({}), []);
});

const site = await load();

check('every grouping explains what it means for the reader', () => {
  for (const [id, g] of Object.entries(GROUPINGS)) {
    assert.ok(g.label, `${id} has no label`);
    assert.ok(g.lede && g.lede.length > 30, `${id} does not say what the grouping means`);
    assert.equal(typeof g.keyOf, 'function', `${id} cannot group anything`);
  }
});

check('every declared jurisdiction on disk is used by at least one institution', () => {
  const orphaned = [];
  for (const d of site.graph.destinations.values()) {
    if (!Array.isArray(d.jurisdictions)) continue;
    const country = site.countries.find((c) => c.code === d.id);
    const used = new Set((country?.institutions || []).map((i) => i.jurisdiction).filter(Boolean));
    for (const j of d.jurisdictions) {
      if (!used.has(j.id)) orphaned.push(`${d.id}: "${j.name}" (${j.id}) has no institutions`);
    }
  }
  if (orphaned.length) throw new Error(orphaned.join('\n          '));
});

check('every institution jurisdiction resolves to a declared one', () => {
  const unknown = [];
  for (const c of site.countries) {
    const d = site.graph.destinations.get(c.code);
    const declared = new Set((d?.jurisdictions || []).map((j) => j.id));
    for (const i of c.institutions || []) {
      if (i.jurisdiction && !declared.has(i.jurisdiction)) {
        unknown.push(`${c.code}: "${i.name}" claims jurisdiction "${i.jurisdiction}", which is not declared`);
      }
    }
  }
  if (unknown.length) throw new Error(unknown.join('\n          '));
});

console.log(failures ? `\n${failures} failing\n` : '\nAll jurisdiction guards pass\n');
if (failures) process.exit(1);
}
