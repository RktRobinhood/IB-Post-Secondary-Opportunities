/**
 * A calendar card's label must agree with its own note.
 *
 * Every dated event carries a `consequence` — hard deadline, equal
 * consideration, indicative… — which renders as the card's badge and its
 * one-line explanation ("After this the door closes."). The note beneath it is
 * written separately, by whoever researched the date. Four critic rounds in
 * September 2026 kept finding the two disagreeing: UCAS's 15 October marked
 * "equal consideration — later ones may still be read" over a note saying "it
 * is hard"; a Slovenian result day marked "the door closes" over a note saying
 * "you are not rejected". The first points a student the unsafe way.
 *
 * This reads every event the site renders — country deadlines and application
 * route milestones alike, through `allEvents()` — and fails on three shapes:
 *
 *   1. marked hard, while the note says the date is not a closing one;
 *   2. marked softer than hard, while the note says it is;
 *   3. no date at all, marked hard, and labelled as an explanation
 *      ("Set by each institution…") rather than as a deadline.
 *
 * It names no country and no institution; the phrases are about deadlines.
 */
import { load } from '../src/lib/data.mjs';
import { allEvents } from '../src/lib/calendar.mjs';

const SAYS_SOFT =
  /\b(you are not rejected|may still be (read|considered|accepted)|not a (hard )?(barrier|deadline)|can still apply|still (be )?accepted after|is not a closing date|late applications (are|may be) (still )?(considered|accepted))\b/i;
const SAYS_HARD =
  /\b(it is hard|the door closes|no late applications|late applications are not (considered|accepted)|will not be (considered|accepted)|cannot apply after|is final and binding)\b/i;
const EXPLANATION_LABEL = /\b(set by each|varies by|each institution|depends on the institution)\b/i;

const site = await load();
const events = allEvents(site);

const problems = [];
for (const e of events) {
  const where = `${e.destinationName || e.destination}: "${e.label}"${e.date ? ` (${e.date})` : ''}`;
  const note = e.note || '';
  if (e.consequence === 'hard' && SAYS_SOFT.test(note)) {
    problems.push(`${where} is marked a hard deadline, but its note says: "${note.match(SAYS_SOFT)[0]}"`);
  }
  if (e.consequence !== 'hard' && SAYS_HARD.test(note)) {
    problems.push(`${where} is marked "${e.consequence}", but its note says: "${note.match(SAYS_HARD)[0]}"`);
  }
  if (!e.date && !e.legacyDate && e.consequence === 'hard' && EXPLANATION_LABEL.test(e.label)) {
    problems.push(`${where} has no date and explains rather than dates, yet is marked a hard deadline`);
  }
}

console.log('\nCalendar labels agree with their notes\n');
console.log(`  ${events.length} events read`);
if (problems.length) {
  console.log(`  FAIL  ${problems.length} card(s) contradict themselves:`);
  for (const p of problems) console.log(`        ${p}`);
  process.exit(1);
}
console.log('  ok    every label agrees with its note\n');
