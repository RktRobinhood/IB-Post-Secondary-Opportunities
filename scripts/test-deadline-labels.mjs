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
 *   3. no date at all, marked hard, and an explanation or an announcement
 *      rather than a deadline: "Set by each institution…", a date that varies
 *      by institution, an opening, or "X publishes its timeline";
 *   4. marked hard, while the note says there is no one date to miss: "there
 *      is no single deadline", "each embassy sets its own";
 *   5. marked priority, while the note says missing it costs only money:
 *      priority promises an order of consideration the note denies;
 *   6. marked hard, while the card says the date is not the reader's: a
 *      route or visa step "not for EU citizens" or "listed for completeness".
 *      The reader is an EU/EEA student (docs/PRODUCT_VISION.md), so a door
 *      that is not theirs is not "the door closes" for them.
 *
 * It names no country and no institution; the phrases are about deadlines.
 */
import { load } from '../src/lib/data.mjs';
import { allEvents } from '../src/lib/calendar.mjs';

const SAYS_SOFT =
  /\b(you are not rejected|may still be (read|considered|accepted)|not a (hard )?(barrier|deadline)|can still apply|still (be )?accepted after|is not a closing date|late applications (are|may be) (still )?(considered|accepted))\b/i;
const SAYS_HARD =
  /\b(it is hard|the door closes|no late applications|late applications are not (considered|accepted)|will not be (considered|accepted)|cannot apply after|is final and binding)\b/i;
const SAYS_NO_SINGLE_DATE = /\b(no single deadline|each (embassy|university|college|institution) sets its own)\b/i;
const SAYS_MONEY_ONLY = /\b(costs money|rather than a place)\b/i;
const SAYS_NOT_THE_READERS =
  /\b(non-EU only|not for EU|not open to EU|EU(\/EEA)? citizens cannot use|listed for completeness)\b/i;
const EXPLANATION_LABEL = /\b(set by each|varies by|each institution|depends on the institution)\b/i;
// A card about something being published or opening is not a door closing.
const ANNOUNCEMENT_LABEL = /\b(confirms|publishes|announces|opens|is published|are published)\b/i;

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
  if (e.consequence === 'hard' && SAYS_NO_SINGLE_DATE.test(note)) {
    problems.push(`${where} is marked a hard deadline, but its note says: "${note.match(SAYS_NO_SINGLE_DATE)[0]}"`);
  }
  if (e.consequence === 'priority' && SAYS_MONEY_ONLY.test(note)) {
    problems.push(`${where} is marked priority, but its note says missing it: "${note.match(SAYS_MONEY_ONLY)[0]}"`);
  }
  const card = `${e.label} ${note}`;
  if (e.consequence === 'hard' && SAYS_NOT_THE_READERS.test(card)) {
    problems.push(`${where} is marked a hard deadline, but the card says it is not the reader's: "${card.match(SAYS_NOT_THE_READERS)[0]}"`);
  }
  if (
    !e.date &&
    !e.legacyDate &&
    e.consequence === 'hard' &&
    (EXPLANATION_LABEL.test(e.label) || e.dateState === 'varies-by-institution' || e.type === 'open' || ANNOUNCEMENT_LABEL.test(e.label))
  ) {
    problems.push(`${where} has no date and explains or announces rather than closes, yet is marked a hard deadline`);
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
