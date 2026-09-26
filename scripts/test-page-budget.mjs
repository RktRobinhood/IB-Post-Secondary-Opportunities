/**
 * A Destination page's default view has a budget, and the institutions come first.
 *
 * Issue #37. `/destinations/de/` was 5,950 words and 52 phone screens, with
 * "Where to study" beginning 79% of the way down — below the sources. Every
 * check in the gate passed, because none of them asked how long a page was or
 * what order it was in. #34 had measured the phone carefully and found the
 * layout correct; it asked "does this reflow" rather than "is this usable". A
 * rule nothing enforces is advice, so this file reads the built pages back.
 *
 * What it measures is the **default view**: the words inside `<main>` that a
 * reader sees without opening anything — the body of a closed `<details>` is
 * not counted, its summary line is — less navigation, scripts and SVG. See
 * scripts/lib/page-measure.mjs, which is also what to run by hand.
 *
 * ## The numbers, and why these ones
 *
 * Measured on the rebuilt pages (September 2026, 35 Destinations):
 *
 *   before "Where to study"        28–45 words   (was 2,653–7,914)
 *   the reading, #overview onward  307–488 words
 *   one topic's default view       at most 64 words, heading and summary included
 *   the whole default view         616–1,298 words (was 2,849–9,580)
 *
 * The budget sits above each with headroom, so a researcher adding a sentence
 * does not break the build, and doubling a section does:
 *
 *   - **Before the first institution: 120 words.** About one phone screen of
 *     body text at 375px. With the hero above it that puts "Where to study" at
 *     about one screen and the first institution inside ~1.6 — measured at
 *     801px, and 1,030px (Canada, with its group heading, 1,288px), at
 *     375x812.
 *   - **The reading: 650 words.** Headings, one or two sentences per question,
 *     and the one-paragraph overview. The long form is behind `<details>`.
 *   - **One topic: 90 words.** A short answer that needs more than that is not
 *     a short answer, and is the first place a wall of text grows back.
 *   - **The whole default view: 1,500 words.** Most of what is left is the
 *     institution list — a name, a city, one sentence, one tag — which is the
 *     part of the page that is meant to be there. It scales with how many
 *     institutions a Destination lists, so this ceiling is looser than the
 *     others and is the one to revisit if a Destination lists thirty.
 *
 * Screens cannot be measured without a browser, so the screen figures are the
 * hand measurements above and in docs/EXPERIENCE_PRINCIPLES.md; the word
 * budget before the first institution is the proxy this file can enforce.
 *
 * ## Order
 *
 * What is possible before what is required: `#institutions` before
 * `#overview` and before every topic, and the sources the last topic on the
 * page. The ordering check is what would have caught the original bug outright.
 *
 * Nothing here names a Destination. Every page under dist/destinations/ is
 * held to the same numbers.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { measure, countWords, defaultView } from './lib/page-measure.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
// An optional argument points at another build — how the "before" figures in
// #37 were taken, and how to see this guard fail on the old page order.
const DIR = path.join(process.argv[2] ? path.resolve(process.argv[2]) : process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist'), 'destinations');

export const BUDGET = {
  beforeInstitutions: 120,
  reading: 650,
  topic: 90,
  total: 1500,
};

let failures = 0;
const fail = (page, msg) => {
  failures++;
  console.log(`  FAIL  ${page}: ${msg}`);
};

console.log('\nDestination page budget (#37)\n');

let codes;
try {
  codes = (await fs.readdir(DIR, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
} catch {
  console.log('  FAIL  dist/destinations/ does not exist — run the build first');
  process.exit(1);
}
if (!codes.length) {
  console.log('  FAIL  no Destination pages were built');
  process.exit(1);
}

const rows = [];
let maxTopic = 0;
for (const code of codes.sort()) {
  const rel = `destinations/${code}/`;
  let pageHtml;
  try {
    pageHtml = await fs.readFile(path.join(DIR, code, 'index.html'), 'utf8');
  } catch {
    continue;
  }
  const { words, wordsBefore, view } = measure(pageHtml, ['institutions', 'overview']);

  // A Destination with no institutions has nothing to lead with, and the
  // ordering rule has nothing to say about it; the reading budget still holds.
  const hasInstitutions = /\sid="institutions"/.test(pageHtml);
  const overviewAt = view.search(/\sid="overview"/);
  const reading = overviewAt >= 0 ? countWords(view.slice(overviewAt)) : words;

  rows.push({ code, words, before: wordsBefore.institutions, reading });

  if (words > BUDGET.total) fail(rel, `default view is ${words} words; the budget is ${BUDGET.total}`);
  if (reading > BUDGET.reading)
    fail(rel, `the reading after the institutions is ${reading} words in the default view; the budget is ${BUDGET.reading}`);

  if (hasInstitutions) {
    if (wordsBefore.institutions > BUDGET.beforeInstitutions)
      fail(rel, `${wordsBefore.institutions} words before "Where to study"; the budget is ${BUDGET.beforeInstitutions}`);

    // Institutions before every question about applying, and before the sources.
    const inst = pageHtml.search(/\sid="institutions"/);
    const firstTopic = pageHtml.search(/<section class="topic"/);
    const overview = pageHtml.search(/\sid="overview"/);
    if (overview >= 0 && overview < inst) fail(rel, 'the overview comes before the institutions');
    if (firstTopic >= 0 && firstTopic < inst) fail(rel, 'a topic section comes before the institutions');
    const src = pageHtml.search(/<section class="sources"|\sid="sources"/);
    if (src >= 0 && src < inst) fail(rel, 'the sources come before the institutions');
  }

  // Every topic: a short answer, and the long one behind a disclosure.
  const topics = [...view.matchAll(/<section class="topic"[\s\S]*?(?=<section class="topic"|<\/div>\s*<aside|$)/g)];
  for (const t of topics) {
    const title = (t[0].match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1] || '?').replace(/<[^>]+>/g, '').trim();
    const n = countWords(t[0]);
    maxTopic = Math.max(maxTopic, n);
    if (n > BUDGET.topic) fail(rel, `"${title}" shows ${n} words by default; a short answer is at most ${BUDGET.topic}`);
  }

  // The sources, where there are any, are the last topic and closed.
  const topicIds = [...pageHtml.matchAll(/<section class="topic" aria-labelledby="([^"]+)"/g)].map((m) => m[1]);
  if (topicIds.includes('sources') && topicIds.at(-1) !== 'sources')
    fail(rel, `the sources are not last (topics run: ${topicIds.join(', ')})`);
  if (/<section class="sources">/.test(defaultView(pageHtml)))
    fail(rel, 'the source list is open in the default view; it belongs behind a disclosure');
}

const pad = (s, n) => String(s).padStart(n);
console.log('  page   default  before-inst  reading');
for (const r of rows) console.log(`  ${r.code.padEnd(5)} ${pad(r.words, 8)} ${pad(r.before ?? '—', 12)} ${pad(r.reading, 8)}`);
console.log(
  `\n  budget ${pad(BUDGET.total, 8)} ${pad(BUDGET.beforeInstitutions, 12)} ${pad(BUDGET.reading, 8)}   (one topic ≤ ${BUDGET.topic}; largest now ${maxTopic})`
);

if (failures) {
  console.log(`\n${failures} breach${failures === 1 ? '' : 'es'} of the Destination page budget.\n`);
  process.exit(1);
}
console.log(`\n  ok    ${rows.length} Destination pages inside the budget, institutions first.\n`);
