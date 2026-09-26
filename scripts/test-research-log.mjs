/**
 * No research log on a Destination or university page.
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
 * This keeps the regex, and runs it over the visible text of every built
 * Destination page — every dist/destinations/<code>/index.html and the
 * Denmark page — not only the twenty in the audit, and of every institution
 * page under dist/universities/, because each card on a Destination page links
 * there and the page renders the same note, `about`, "In English" text and
 * `meta.notes`. DIST_DIR reads another build, as for every built-stage check.
 *
 * Programme pages (dist/programmes/) are not read: they render Evidence
 * `interpretation`, which is written for reviewers, and whether they should
 * is a question for the programme template, not for this guard
 * (docs/research/qa/country-audit-europe/follow-ups-41.md).
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

const ROOT = path.resolve(import.meta.dirname, '..');
// DIST_DIR reads another build, as `src/build.mjs` writes one.
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist');

export const RESEARCH_LOG = [
  /\bpages? read\b/i,
  /\bread on \d/i,
  /[,(]\s*read \d/i,
  /\bwere read\b/i,
  /\bno pages? (?:read|found)\b/i,
  /\bpages? found\b/i,
  /\bretrieved\b/i,
  /\bre-read\b/i,
  /\bcould not be (?:confirmed|verified|found) (?:on|in)\b/i,
  /\bnot recorded here\b/i,
  /\bleft as context\b/i,
  /\b(?:during|in) this research\b/i,
  /\bthis research could\b/i,
  /\bwere not read\b/i,
  /\bcould find\b/i,
  /\bwikipedia field\b/i,
  /\bthat is the finding\b/i,
  /\brecorded here so\b/i,
  /\bthe model can\b/i,
  /\bnow 404s?\b/i,
  /\bnot on this calendar\b/i,
  // Round 1 of the #41 critique: the forms the first version missed.
  /\bread in \w+ (?:on|from)\b/i,
  /\b(?:was|were) (?:not )?found\b/i,
  /\bwhen checked\b/i,
  /\bcited here\b/i,
  /\b(?:page|leaflet|portal) on \d{1,2} \w+ 20\d\d:/i,
];

export const researchLog = (text) => RESEARCH_LOG.map((rx) => text.match(rx)?.[0]).filter(Boolean);

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

console.log('\nNo research log on a Destination or university page\n');

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
  ]) assert.deepEqual(researchLog(t), [], t);
});

/* --- The built pages --------------------------------------------------------- */

const pages = [];
const indexPages = (dir) => {
  const abs = path.join(DIST, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).map((d) => path.join(abs, d, 'index.html')).filter((f) => fs.existsSync(f));
};
const destinationPages = indexPages('destinations');
pages.push(...destinationPages);
const denmark = path.join(DIST, 'denmark', 'index.html');
if (fs.existsSync(denmark)) pages.push(denmark);
// Every card on a Destination page links to the institution's own page, and
// that page renders the same note, `about` and "In English" text.
const universityPages = indexPages('universities');
pages.push(...universityPages);

check('the build produced a page for every Destination profile', () => {
  const profiles = fs.readdirSync(path.join(ROOT, 'data', 'countries')).filter((f) => f.endsWith('.json')).length;
  assert.ok(
    destinationPages.length >= profiles && universityPages.length > 0,
    `found ${destinationPages.length} Destination page(s) and ${universityPages.length} university page(s) in ${path.relative(ROOT, DIST) || DIST} for ${profiles} profiles — run \`node src/build.mjs\` first`
  );
});

const found = [];
for (const f of pages) {
  const text = htmlToText(fs.readFileSync(f, 'utf8'));
  for (const line of text.split('\n')) {
    for (const rx of RESEARCH_LOG) {
      const m = rx.exec(line);
      if (!m) continue;
      const at = m.index;
      found.push(`${path.relative(ROOT, f)}: "${m[0]}" in "…${line.slice(Math.max(0, at - 70), at + 90).trim()}…"`);
      break;
    }
  }
}

check(`no Destination or university page narrates the research (${pages.length} pages read)`, () => {
  assert.equal(
    found.length,
    0,
    `${found.length} line(s):\n${found.join('\n')}\n` +
      'Say what it means for the student instead ("not confirmed here — check the university\'s page"). ' +
      'What was read and when belongs in the Evidence record (retrievedAt, interpretation), which is not rendered.'
  );
});

console.log(failures ? `\n${failures} failed.\n` : '\nNo research log on any Destination or university page.\n');
process.exit(failures ? 1 : 0);
