/**
 * No research log on any page a student reads.
 *
 * Registered in scripts/lib/quality-gate.mjs as 'research-log' (stage built).
 *
 * The records are written by researchers reading official pages, and the way
 * they record what they did leaks into what a student reads: "No page read on
 * 2026-09-22 stated whether IB English A or B is accepted", "The DreamApply
 * course page read on 23 September 2026 shows…", "could not be confirmed on
 * any official source and is not stated here as fact", "it is left as context
 * rather than given an entry of its own". Each of those is true, and each
 * tells a seventeen-year-old about our process instead of what to do. Four
 * critic rounds removed them page by page with a regex run by hand over the
 * twenty pages being audited; the rest of the site was never looked at, and
 * the regex was never kept (docs/research/qa/country-audit-europe/round-5.md,
 * section 6; issue #41).
 *
 * This keeps the regex, and runs it over the visible text of every page a
 * student reads in the build: the Destination and Denmark pages, every
 * university and programme page, /prepare/, the guides, /compare/, /faq/,
 * /glossary/, the timeline, the country indexes and the home page. DIST_DIR
 * reads another build, as for every built-stage check.
 *
 * Four pages are not read, on purpose: /trust/, /counsellors/, /about/ and
 * /credits/. They are the pages that describe the method — how many records a
 * person has reviewed, which sources were re-read by machine, what "could not
 * be verified" means — and saying so is their job.
 *
 * Round 3 of the #41 critique found the guard caught its fixtures and not the
 * class: 1 of 31 fresh phrasings. The rule now has two halves
 * (scripts/lib/research-log.mjs): the phrases critics have quoted, so none can
 * come back, and the repository's own vocabulary — "this profile", "the
 * model", a file path, an Evidence id, a snake_case or camelCase field name,
 * "our file", "(not) researched / verified", "Listed because", "inferred
 * from" — which is what catches a phrasing nobody has quoted yet. The 31
 * phrasings are fixtures below.
 *
 * Round 4 found the vocabulary was still built from quoted cases: "Listed so
 * the route is visible" was gone and "Named so the route is visible" was not.
 * So the rule now also catches the shape — a sentence in which the site
 * explains its own coverage ("Named / Listed / Included / Recorded / Mentioned
 * … so / because / for completeness", "recorded here / as", "to record",
 * "inferred", "this site cannot / has no …", "we could not / found", "was
 * checked"). Two forms deliberately stay: "listed above / below / here" is
 * navigation, and "this site assumes / treats / shows X as …" tells the
 * student what judgement was made on their behalf, which is the honest form
 * and the convention for a year the publisher did not give.
 *
 * Evidence `interpretation` is no longer rendered at all (src/lib/primitives.mjs
 * evidenceBlock): it is the researcher's account of how a source was read,
 * and on /prepare/ and /programmes/ it put "This corrects
 * data/ib-conversion.json… Our file said…" in front of students.
 *
 * ## What is and is not a research log
 *
 * Flagged: the act of researching, narrated — a page "read on" a date, "read
 * in French on…", "no page found", "was not found", "retrieved", "re-read",
 * "when checked", "cited here", "could not be confirmed on…", "not recorded
 * here", "left as context", "during this research", "Its admissions page on
 * 23 September 2026: …".
 *
 * The site's convention for a gap is "not confirmed here": it says what the
 * student can rely on without claiming that nobody publishes it. "Not
 * published yet" is only right when the record shows the publisher has said
 * so.
 *
 * Not flagged: a date that tells the student how current something is. "The
 * 2027 dates were still not published on 2026-09-24" and "as of 23 September
 * 2026" say what the world looked like and when; the student can act on that
 * (check again). The freshness stamps the templates draw — "Last read 24
 * September 2026." on the page, "Read 2026-09-22." under a route — and the
 * Sources list's "checked 2026-09-24" are the same: a labelled date in the
 * page's own furniture, not a sentence about what a researcher did. That is
 * why "read" is only flagged inside a sentence ("the page, read on…", "(…,
 * read 2026-09-23)"), never as the first word of a stamp.
 *
 * The rewrite is always the same move: say what it means for the student.
 * "No page read stated X" becomes "X is not confirmed here — ask the faculty".
 *
 * The Evidence records keep their `interpretation` and `retrievedAt`; they are
 * not rendered, and they are where the research belongs
 * (docs/PARALLEL_WORK.md).
 *
 *   node scripts/test-research-log.mjs     (after `node src/build.mjs`)
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { htmlToText } from './lib/html-text.mjs';
import { matches, researchLog } from './lib/research-log.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
// DIST_DIR reads another build, as `src/build.mjs` writes one.
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist');

export { RESEARCH_LOG, researchLog } from './lib/research-log.mjs';

/*
 * Lines another agent owns right now, and which it has been asked to change.
 * An entry names the page, an exact substring of the line and who has it; it
 * fails when it no longer matches, so it cannot outlive the fix. This is a
 * hand-off list, not a place to excuse wording: nothing goes here that the
 * author of this guard was free to rewrite.
 */
const HANDED_OFF = [];

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

console.log('\nNo research log on any page a student reads\n');

check('flags the research narrated', () => {
  for (const t of [
    'No page read on 2026-09-22 stated whether IB English A or B is accepted.',
    'The DreamApply course page read on 23 September 2026 shows the 2026 round.',
    'The University of Vienna page, read on 23 September 2026, dates this window.',
    'Both pages were read on 23 September 2026 and both are live.',
    'A claim that fees will rise could not be confirmed on any official source.',
    'No page found gives IB-specific minimum points.',
    'Year not stated on the source page - figures retrieved September 2026',
    'Study in Slovenia (re-read 2026-09-24: 17 bachelor\'s)',
    'That intake is left as context rather than given an entry of its own.',
    'It is not on any official page, so it is not recorded here.',
    'Current figure on the university budget page, read 2026-09-24',
    'No equivalence is needed (equivalences.cfwb.be, read 2026-09-23).',
    'the CVEC portal, read in French on 2026-09-23, says to pay',
    'Precedent, read in Slovene from the University of Ljubljana VPIS leaflet on 23 September 2026:',
    'No national minimum points figure was found on an official page.',
    'its 2027 dates were not on the page when checked.',
    'does not appear on any official page cited here, so treat it as unconfirmed.',
    'Its admissions page on 23 September 2026: for 2026 Tartu admits to 3 programmes.',
    // Round 2 of the critique.
    'English-taught bachelors: Three found.',
    'In English: None found.',
    'SSE Riga runs the most substantial scholarship scheme found.',
    'sets the highest bar found at IELTS 6.5',
    'no IB-to-Estonian grade conversion table could be found.',
    'was not published in a form that could be verified on the pages checked',
    'did not publish a quota figure at the time of checking',
    'belong to the group but were not checked here',
    "None at the University of Malta for the full-time bachelor's checked",
    'Twente is the only institution in this pass that writes requirements',
    'Its specific entry requirement is still English B, and that is what the record holds.',
    'the pattern ADR 0002 predicts',
    'as read by the round-4 conversion critic (docs/research/qa/conversion/critique-round-4.md).',
    'No Evidence record holds that page yet.',
    'the panels return nothing to a fetch or to a DOM read.',
    'the levelRaise cites the general admission page.',
    'Part-time work is restricted — see workRights.',
    // Round 3 of the critique: 31 phrasings nobody had quoted yet. The first
    // version of this guard caught one of them.
    'Not researched in detail here.',
    'Recorded because it exists and is named by the Agency.',
    'That date is context, because nothing on this profile is a master\'s application.',
    'It is recorded at institution level because that is where the model holds codes.',
    'This corrects data/ib-conversion.json rather than conflicting with anything.',
    'Our file said supplementary subjects are taken as hf-enkeltfag.',
    'as recorded in this project’s country research',
    'Individual colleges were not verified.',
    'Søknadsweb opens (page gives no year)',
    'the year here is inferred from the intake this profile covers',
    'Per the round-5 audit, the date is provisional.',
    'Source: ev-ee-sie-bachelors-list.',
    'See data/evidence/ee.json for the reasoning.',
    'The date_state is open.',
    'The dateState is open.',
    'Listed so that the route is visible.',
    'Recorded so the route is visible.',
    'Listed because a student who needs it will not find it.',
    'The schema has no field for this.',
    'Not researched for international applicants.',
    'Admission of an IB applicant was not researched here.',
    'Figures were not verified from an official page.',
    'This is the one Dutch record in this catalogue that answers by name.',
    'For the destinations in this dataset, a gap year helps.',
    'our research found no minimum.',
    'This record carries a reviewBy date.',
    'the requirement_kind cannot express it',
    'as noted in this audit',
    'It was never researched for IB applicants.',
    '2027 entry, inferred from the 2026 calendar',
    'The year is inferred from a recurring date.',
    // Round 4 of the critique: the site explaining its own coverage in other
    // words. Each was live on a page the first four versions passed.
    'Named so the route is visible.',
    'Not covered here; named so that the route is visible.',
    'Named here so that a student who meets the word knows where it sits.',
    'Named because they exist and are on the same ministry route.',
    'Named because MEXT names it as one of the five routes.',
    'which is exactly why it is worth naming.',
    'Listed for completeness.',
    'Listed for completeness only.',
    'these schools do not appear in the listings, which is why they are named here.',
    "this site cannot state 'a qualification at this level', so it shows a full IB Diploma",
    'and that absence was checked rather than assumed:',
    'As recorded here, places on this programme are not limited.',
    'so they are recorded as that one programme.',
    'is recorded as meeting it.',
    "ETH's estimate is the only official figure recorded here.",
    'Trinity College Dublin is recorded above as an example.',
    '2026 session - recorded as the pattern for 2027',
    'so there is no opening date to record.',
    'so the year here is inferred one cycle forward.',
    'The years are inferred forward to the autumn 2027 intake.',
    '212 dates we could not pin down',
    'Looked for and not published, or set by each institution.',
    'We have not listed its programmes one by one yet.',
    'it is listed here because it was founded in Budapest',
    'Included here and not only in the UAE file because its funding model is unusual.',
    "Bachelor's programs (16 listed; fact boxes checked for language)",
    "16 of 23 bachelor's, checked in a browser",
    'We found no minimum on any page.',
    'This site has no field for the second condition.',
    'Mentioned so that nobody mistakes it for an EU route.',
  ]) assert.ok(researchLog(t).length, `not caught: ${t}`);
});

check('leaves dates of currency and advice alone', () => {
  for (const t of [
    'The 2027 dates were still not published on 2026-09-24.',
    "The University of Vienna's page, as of 23 September 2026, dates this window.",
    'Re-check the University of Vienna admission page from January 2027.',
    'Study in Slovenia - Programmes in English — checked 2026-09-24',
    'IB-specific minimum points are not confirmed here; ask the faculty directly.',
    'Vilnius University confirms that EU citizens can apply for state-funded places.',
    'For the 2027/2028 round admissions.vu.lt now reads: applications open on 1 December 2026.',
    'Last read 24 September 2026.',
    'Read 2026-09-22.',
    "so read 28 August as the pattern rather than as the 2027 date.",
    'IB-specific minimum points are not confirmed here; ask the faculty directly.',
    'the CVEC portal says (in French) to pay',
    'Precedent, from medizinstudieren.at (in German, as of 23 September 2026):',
    'None of the university pages linked from this page publishes a minimum.',
    'Rooms are usually found through Facebook groups.',
    "Apply through eApply, then Leiden's portal uSis; see uOttawa and the iSchool.",
    'The selection details here come from the admission regulation (PDF).',
    'Submit before the deadline and have your original documents verified.',
    'for graduated applicants who want their IB results verified electronically.',
    'Researched in depth. 58 sources recorded for 14 institutions listed.',
    'Also researched: countries whose degrees are not mapped one by one yet.',
    "UNED's page (https://unedasiss.uned.es/fechas_clave) covers only 2026/2027.",
    'Published as "1 February" with no year; this site assumes the 2027 intake.',
    'Not covered in detail on this site; ask the institutions directly.',
    '2027 entry, projected from the 2026 calendar',
    // Round 4: navigation, the student's own steps and the honest disclosures stay.
    'None of these sources has been checked by a person yet.',
    'This source has not been checked by a person yet.',
    'Checked 24 September 2026',
    'The rule has to be checked while those subjects are still changeable.',
    'Eligibility must be checked directly with CSN.',
    'Four are taught in English and are listed here.',
    'the higher preferences you listed above it',
    'This site treats either one, at SL or HL, as meeting the requirement; Zealand has not confirmed that.',
    'chosen when you apply, so this site shows them as that one programme.',
    '212 dates with no published day',
    'ETH gives no years; this site assumes the autumn 2027 intake.',
  ]) assert.deepEqual(researchLog(t), [], t);
});

/* --- The built pages --------------------------------------------------------- */

const METHOD_PAGES = new Set(['trust', 'counsellors', 'about', 'credits', 'assets']);
const walkHtml = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : []).flatMap((e) =>
  e.isDirectory() ? walkHtml(path.join(d, e.name)) : e.name.endsWith('.html') ? [path.join(d, e.name)] : []);
const pages = walkHtml(DIST).filter((f) => !METHOD_PAGES.has(path.relative(DIST, f).split(path.sep)[0]));
const under = (dir) => pages.filter((f) => path.relative(DIST, f).split(path.sep)[0] === dir);
const destinationPages = under('destinations');
const universityPages = under('universities');

check('the build produced every kind of page this reads', () => {
  const profiles = fs.readdirSync(path.join(ROOT, 'data', 'countries')).filter((f) => f.endsWith('.json')).length;
  const missing = ['universities', 'programmes', 'prepare', 'guides', 'compare', 'faq', 'glossary', 'denmark'].filter((d) => !under(d).length);
  assert.ok(
    destinationPages.length >= profiles && !missing.length && pages.some((f) => path.relative(DIST, f) === 'index.html'),
    `found ${destinationPages.length} Destination page(s) for ${profiles} profiles in ${path.relative(ROOT, DIST) || DIST}` +
      `${missing.length ? `, and nothing under ${missing.join(', ')}` : ''} — run \`node src/build.mjs\` first`
  );
});

const found = [];
const handedOff = new Set();
for (const f of pages) {
  const rel = path.relative(DIST, f).split(path.sep).join('/');
  const text = htmlToText(fs.readFileSync(f, 'utf8'));
  for (const line of text.split('\n')) {
    const hit = matches(line)[0];
    if (!hit) continue;
    const excused = HANDED_OFF.find((h) => h.page === rel && line.includes(h.match));
    if (excused) { handedOff.add(excused); continue; }
    const [m, at] = hit;
    found.push(`${path.relative(ROOT, f)}: "${m}" in "…${line.slice(Math.max(0, at - 70), at + 90).trim()}…"`);
  }
}

check(`no student page narrates the research (${pages.length} pages read)`, () => {
  assert.equal(
    found.length,
    0,
    `${found.length} line(s):\n${found.join('\n')}\n` +
      'Say what it means for the student instead ("not confirmed here — check the university\'s page"). ' +
      'What was read and when belongs in the Evidence record (retrievedAt, interpretation), which is not rendered.'
  );
});

check('every handed-off line is still there, and names its owner', () => {
  const stale = HANDED_OFF.filter((h) => !handedOff.has(h));
  assert.equal(stale.length, 0, stale.map((h) => `fixed or moved — remove it from HANDED_OFF: ${h.page} "${h.match}"`).join('\n'));
});
if (HANDED_OFF.length) console.log(`  note  ${HANDED_OFF.length} line(s) handed off to their owner: ${HANDED_OFF.map((h) => h.page.split('/')[1]).join(', ')}`);

console.log(failures ? `\n${failures} failed.\n` : '\nNo research log on any page a student reads.\n');
process.exit(failures ? 1 : 0);
