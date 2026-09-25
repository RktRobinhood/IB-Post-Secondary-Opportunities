/**
 * Guards on the dated-event model, and on the deadline records that feed it.
 *
 *   node scripts/test-calendar.mjs
 *   node scripts/test-calendar.mjs --report   # migration progress, worst first
 *
 * Two different things are checked here and they fail for different reasons.
 *
 * The *shape* guard is strict and applies to every record: a field that exists
 * must be the thing it says it is. A `date` that is not ISO, a `dateState` that
 * is not one of the five, a `consequence` invented on the spot — those are
 * faults now, because the whole point of the migration is that downstream code
 * can stop guessing.
 *
 * *Completeness* is not checked here. A deadline with no date at all is
 * unfinished research, the publication floor is where that is enforced, and
 * failing it twice would only make the two harder to tell apart.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  CONSEQUENCE,
  DATE_STATES,
  allEvents,
  eventsForDestination,
  formatWhen,
  fromCountryDeadline,
  isActionable,
  isClosed,
  READER_ACCESS,
  identityWords,
  sameOccasion,
  sortKey,
  standing,
} from '../src/lib/calendar.mjs';
import { deadlineList } from '../src/lib/primitives.mjs';
import { toString } from '../src/lib/html.mjs';
import { load } from '../src/lib/data.mjs';
import { datesFor, leadOrder, isBinding } from '../src/lib/school-dates.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const REPORT = process.argv.includes('--report');

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

console.log('\nCalendar model\n');

/* --- Formatting ----------------------------------------------------------- */

const at = (o) => ({ label: 'x', consequence: 'hard', ...o });

check('a single day reads as a day', () =>
  assert.equal(formatWhen(at({ date: '2027-01-13' })), '13 January 2027'));

check('a window inside one year does not repeat the year', () =>
  assert.equal(formatWhen(at({ date: '2026-07-20', endDate: '2026-08-06' })), '20 July to 6 August 2026'));

check('a window across a year boundary keeps both years', () =>
  assert.equal(formatWhen(at({ date: '2026-11-01', endDate: '2027-03-01' })), '1 November 2026 to 1 March 2027'));

check('a time of day survives, because 12:00 and 23:59 are different promises', () =>
  assert.equal(
    formatWhen(at({ date: '2027-01-13', timeOfDay: '18:00', timeZone: 'UK time' })),
    '13 January 2027, 18:00 UK time'
  ));

check('an end date equal to the start is not rendered as a range', () =>
  assert.equal(formatWhen(at({ date: '2027-03-15', endDate: '2027-03-15' })), '15 March 2027'));

check('no date reads as the declared state, not as a blank', () =>
  assert.equal(formatWhen(at({ date: null, dateState: 'no-central-deadline' })), 'No central deadline'));

check('an undeclared absence still says something rather than nothing', () =>
  assert.equal(formatWhen(at({ date: null })), 'Date not published'));

/* --- Refusals, which are the point ---------------------------------------- */

check('a prose date is not accepted as a date', () => {
  const e = fromCountryDeadline({ code: 'xx', name: 'X' }, { label: 'x', date: 'Mid-January 2027' }, 0);
  assert.equal(e.date, null, 'prose was read as a date');
  assert.equal(e.legacyDate, 'Mid-January 2027', 'the published wording was lost');
});

check('a sentence in a date field is not sorted as though it were a day', () => {
  const e = fromCountryDeadline({ code: 'xx', name: 'X' }, { label: 'x', date: 'No central deadline' }, 0);
  assert.equal(sortKey(e), '9999-99-99');
});

check('an unknown consequence falls back to indicative rather than inventing a promise', () => {
  const e = fromCountryDeadline({ code: 'xx', name: 'X' }, { label: 'x', consequence: 'absolutely-final' }, 0);
  assert.equal(e.consequence, 'indicative');
});

check('an unknown dateState is not passed through as a label', () => {
  const e = fromCountryDeadline({ code: 'xx', name: 'X' }, { label: 'x', dateState: 'soon-ish' }, 0);
  assert.notEqual(e.dateState, 'soon-ish');
});

/* --- Standing ------------------------------------------------------------- */

check('a date in the past is past', () =>
  assert.equal(standing(at({ date: '2020-01-01' }), '2026-09-23'), 'past'));
check('a window containing today is open', () =>
  assert.equal(standing(at({ date: '2026-09-01', endDate: '2026-10-01' }), '2026-09-23'), 'open'));
check('a date inside a month is soon', () =>
  assert.equal(standing(at({ date: '2026-10-10' }), '2026-09-23'), 'soon'));
check('a date beyond a month is ahead', () =>
  assert.equal(standing(at({ date: '2027-03-15' }), '2026-09-23'), 'ahead'));
check('an undated event has no standing rather than a wrong one', () =>
  assert.equal(standing(at({ date: null }), '2026-09-23'), 'undated'));

/* --- The records themselves ----------------------------------------------- */

const site = await load();
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED = new Set([
  'id', 'label', 'date', 'endDate', 'timeOfDay', 'timeZone', 'dateState', 'consequence',
  'audience', 'provisional', 'year', 'notes', 'note', 'source', 'sources', 'evidence',
  'route', 'jurisdiction',
  /* "<session>/<event>" in data/ib-calendar.json. Legal here because the date
     belongs to the IB rather than to this country, and scripts/test-ib-calendar.mjs
     reads it back; without it a deadline restating an IB date is indistinguishable
     from one the country published, which is how 61 copies of 6 July happened. */
  'ibCalendar',
  /* Whether the reader can act on this at all (#35). Checked below, and by
     the guard that a closed entry never renders as a date to act on. */
  'readerAccess',
  /* The schools this date is theirs, by page id (#47): checked below. */
  'institutions',
]);

const problems = [];
for (const c of site.countries) {
  for (const [i, d] of (c.application?.deadlines || []).entries()) {
    const where = `${c.code}.deadlines[${i}] "${String(d.label || '').slice(0, 40)}"`;
    for (const key of Object.keys(d)) {
      if (!ALLOWED.has(key)) problems.push(`${where}: unknown field "${key}"`);
    }
    if (d.date != null && typeof d.date === 'string' && d.date && !ISO.test(d.date) && d.dateState) {
      problems.push(`${where}: has both a prose date and a dateState — pick one`);
    }
    if (d.endDate && !ISO.test(d.endDate)) problems.push(`${where}: endDate "${d.endDate}" is not ISO`);
    if (d.dateState && !DATE_STATES[d.dateState]) problems.push(`${where}: dateState "${d.dateState}" is not one of ${Object.keys(DATE_STATES).join(', ')}`);
    if (d.consequence && !CONSEQUENCE[d.consequence]) problems.push(`${where}: consequence "${d.consequence}" is not one of ${Object.keys(CONSEQUENCE).join(', ')}`);
    if (d.timeOfDay && !/^[0-2][0-9]:[0-5][0-9]$/.test(d.timeOfDay)) problems.push(`${where}: timeOfDay "${d.timeOfDay}" is not HH:MM`);
    if (ISO.test(String(d.date)) && d.endDate && d.endDate < d.date) problems.push(`${where}: endDate is before date`);
    if (d.date == null && !d.dateState) problems.push(`${where}: no date and no dateState — say which of the five it is`);
    if (d.readerAccess) problems.push(...accessProblems(where, d.readerAccess));
  }
}
for (const r of site.graph.applicationRoutes.values()) {
  const all = [['', r], ...(r.rounds || []).map((x) => [`.rounds ${x.id}`, x]), ...(r.milestones || []).map((x) => [`.milestones ${x.id}`, x])];
  for (const [at, x] of all) if (x.readerAccess) problems.push(...accessProblems(`${r.id}${at}`, x.readerAccess));
}

/* Country profiles have no JSON schema, so the shape the route schema enforces
   is enforced here for them; and on both, an exclusion must cite its source —
   telling a student a route is closed is as consequential as giving a date. */
function accessProblems(where, a) {
  const out = [];
  if (!READER_ACCESS[a.state]) out.push(`${where}: readerAccess.state "${a.state}" is not one of ${Object.keys(READER_ACCESS).join(', ')}`);
  if (typeof a.reason !== 'string' || a.reason.trim().length < 10) out.push(`${where}: readerAccess has no reason — it is rendered first, so it must say why`);
  if (typeof a.reason === 'string' && a.reason.length > 240) out.push(`${where}: readerAccess.reason is ${a.reason.length} characters — one sentence, please`);
  if (!Array.isArray(a.evidence) || !a.evidence.length) out.push(`${where}: readerAccess cites no evidence`);
  for (const k of Object.keys(a)) if (!['state', 'reason', 'evidence'].includes(k)) out.push(`${where}: readerAccess has unknown field "${k}"`);
  return out;
}

check('every deadline record is the shape it says it is', () => {
  if (problems.length) throw new Error(`${problems.length} problems\n          ${problems.slice(0, 20).join('\n          ')}`);
});

/* --- The model is universal ----------------------------------------------- */

check('no country code appears in the calendar model', async () => {
  const src = await fs.readFile(path.join(ROOT, 'src', 'lib', 'calendar.mjs'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const offenders = site.countries.map((c) => c.code).filter((c) => new RegExp(`['"\`]${c}['"\`]`).test(code));
  if (offenders.length) throw new Error(`country codes appear in the model: ${offenders.join(', ')}`);
});

check('every consequence says what actually happens if the date is missed', () => {
  for (const [id, spec] of Object.entries(CONSEQUENCE)) {
    assert.ok(spec.label, `${id} has no label`);
    assert.ok(spec.note && spec.note.length > 20, `${id} does not say what missing it costs`);
  }
});

check('a route milestone supersedes the profile deadline it was migrated from', () => {
  const graph = {
    applicationRoutes: new Map([
      ['r', { id: 'r', destination: 'xx', intake: '2027-autumn', milestones: [{ id: 'm', type: 'submit', label: 'Apply', date: '2027-03-15', consequence: 'hard' }] }],
    ]),
  };
  const country = { code: 'xx', name: 'X', application: { deadlines: [{ label: 'Apply', date: '2027-03-15' }, { label: 'Something else', date: '2027-04-01' }] } };
  const events = eventsForDestination(country, graph);
  assert.equal(events.length, 2, 'the migrated deadline was counted twice');
  assert.equal(events.find((e) => e.label === 'Apply').origin, 'route');
});

check('a Destination whose dates live only in a route still reaches the calendar', () => {
  /* The bug this is here for: `allEvents` iterated `data/countries`, and the one
     Destination that has finished migrating has no record there at all. Denmark's
     dates — including the 15 March noon deadline the calendar page's own lede
     promises to tell you about — were simply absent, and nothing failed. */
  const all = allEvents(site);
  const reached = new Set(all.map((e) => e.destination));
  const missing = [...site.graph.destinations.values()]
    .filter((d) => {
      const routes = [...site.graph.applicationRoutes.values()].filter((r) => r.destination === d.id);
      return routes.some((r) => (r.milestones || []).length || (r.rounds || []).length);
    })
    .filter((d) => !reached.has(d.id))
    .map((d) => d.name);
  if (missing.length) throw new Error(`Destinations with dated routes that never reach the calendar: ${missing.join(', ')}`);
});

check('a round and its own closing milestone are not two things to do', () => {
  const graph = {
    applicationRoutes: new Map([
      ['r', {
        id: 'r', destination: 'xx', intake: '2027-autumn',
        rounds: [{ id: 'rd', label: 'The only round', closes: '2027-03-15', consequence: 'hard' }],
        milestones: [{ id: 'm', type: 'submit', label: 'Applications close', date: '2027-03-15', consequence: 'hard' }],
      }],
    ]),
  };
  const events = eventsForDestination({ code: 'xx', name: 'X' }, graph);
  assert.equal(events.length, 1, 'the same day was listed twice');
  assert.equal(events[0].label, 'Applications close', 'the round won, but the milestone is the one that says what closes');
});

/* --- One event, one card ---------------------------------------------------- */

/* The same deadline from the country profile and from the route, worded
   differently, reached the calendar as two cards ~90 times across 25
   Destinations (docs/research/variants/systemic.md §5). The fold lives in
   `foldTwins`; the test of "the same event" here is deliberately a different
   one — same day, same end, same kind, no two different routes, and labels
   that name the same things — so a change to the fold's scoring cannot quietly
   redefine what it is checked against. */
const flatLabel = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
function sameEvent(a, b) {
  if (!sameOccasion(a, b)) return false;
  const fa = flatLabel(a.label);
  const fb = flatLabel(b.label);
  if (fa.startsWith(fb) || fb.startsWith(fa)) return 'one label is the other with words added';
  const wa = identityWords(a.label);
  const wb = identityWords(b.label);
  const within = (x, y) => [...x].every((w) => y.has(w));
  if (within(wa, wb) && within(wb, wa)) return 'both labels name the same things';
  if (a.origin !== b.origin && ((wa.size && within(wa, wb)) || (wb.size && within(wb, wa)))) return 'the profile and the route name the same thing';
  return false;
}
function twinsIn(events) {
  const dated = events.filter((e) => e.date && isActionable(e));
  const out = [];
  for (let i = 0; i < dated.length; i++)
    for (let j = i + 1; j < dated.length; j++) {
      const why = dated[i].destination === dated[j].destination && sameEvent(dated[i], dated[j]);
      if (why) out.push(`${dated[i].destination} ${dated[i].date}: "${dated[i].label}" and "${dated[j].label}" (${why})`);
    }
  return out;
}

const twinGraph = (milestones) => ({
  applicationRoutes: new Map([['r', { id: 'r', destination: 'xx', intake: '2027-autumn', label: 'Applying to Xland', milestones }]]),
});

check('a deadline worded differently in the profile and the route is one card, with both sources and the stricter consequence', () => {
  const graph = twinGraph([{ id: 'm', type: 'submit', label: 'Alpha University first round closes', date: '2026-11-25', consequence: 'priority', note: 'Results in March.' }]);
  const country = { code: 'xx', name: 'X', application: { deadlines: [
    { label: 'Alpha University — first round', date: '2026-11-25', timeOfDay: '12:00', consequence: 'hard', source: 'https://alpha.example/dates', notes: 'Results in March. Fee 50 EUR.' },
  ] } };
  const events = eventsForDestination(country, graph);
  assert.equal(events.length, 1, `the same deadline printed ${events.length} cards`);
  const [e] = events;
  assert.deepEqual(e.sources, ['https://alpha.example/dates'], 'the profile source was lost in the merge');
  assert.equal(e.consequence, 'hard', 'the merge kept the weaker consequence');
  assert.equal(e.timeOfDay, '12:00', 'the time of day recorded only in the profile was lost');
  assert.equal(e.note, 'Results in March. Fee 50 EUR.', 'the notes were repeated or lost rather than joined once');
});

check('two institutions on one day each keep their own card, and each finds its own twin', () => {
  const graph = twinGraph([
    { id: 'a', type: 'submit', label: 'ABC first round closes', date: '2026-11-25', consequence: 'priority' },
    { id: 'b', type: 'submit', label: 'ABCD priority round closes', date: '2026-11-25', consequence: 'priority' },
  ]);
  const country = { code: 'xx', name: 'X', application: { deadlines: [
    { label: 'ABCD — priority round', date: '2026-11-25', consequence: 'priority', source: 'https://abcd.example' },
    { label: 'ABC — first round', date: '2026-11-25', consequence: 'priority', source: 'https://abc.example' },
    { label: 'Omega College — applications close', date: '2026-11-25', consequence: 'priority' },
  ] } };
  const events = eventsForDestination(country, graph);
  assert.equal(events.length, 3, `expected ABC, ABCD and Omega; got ${events.map((e) => e.label).join(' / ')}`);
  assert.deepEqual(events.find((e) => e.id === 'a').sources, ['https://abc.example'], 'ABC took the wrong twin');
  assert.deepEqual(events.find((e) => e.id === 'b').sources, ['https://abcd.example'], 'ABCD took the wrong twin');
});

check('an exam and the application it belongs to are two things on one day', () => {
  const graph = twinGraph([{ id: 'm', type: 'submit', label: 'Alpha University applications close', date: '2026-10-15', consequence: 'hard' }]);
  const country = { code: 'xx', name: 'X', application: { deadlines: [{ label: 'Alpha University admissions test', date: '2026-10-15', consequence: 'hard' }] } };
  assert.equal(eventsForDestination(country, graph).length, 2);
});

check('a window restating an opening and a closing adds no card, and loses neither day', () => {
  const graph = twinGraph([
    { id: 'o', type: 'open', label: 'Beta University applications open', date: '2026-10-15', consequence: 'indicative' },
    { id: 'c', type: 'submit', label: 'Beta University applications close', date: '2027-03-19', consequence: 'hard' },
  ]);
  const country = { code: 'xx', name: 'X', application: { deadlines: [
    { label: 'Beta University — application window', date: '2026-10-15', endDate: '2027-03-19', consequence: 'hard', source: 'https://beta.example' },
  ] } };
  const events = eventsForDestination(country, graph);
  assert.deepEqual(events.map((e) => e.id), ['o', 'c']);
  assert.ok(events.every((e) => e.sources.includes('https://beta.example')), 'the window’s source did not reach both days');
});

const rawEvents = [...site.countries].flatMap((c) => eventsForDestination(c, site.graph, { fold: false }));
const foldedEvents = [...site.countries].flatMap((c) => eventsForDestination(c, site.graph));

check(`no two cards on the site are the same event (${rawEvents.length} records → ${foldedEvents.length} cards on country pages)`, () => {
  assert.ok(twinsIn(rawEvents).length > 0, 'the detector finds no twins in the unfolded records, so it would pass on anything');
  const found = [...twinsIn(allEvents(site)), ...twinsIn(foldedEvents)];
  if (found.length) throw new Error([...new Set(found)].join('\n          '));
});

check('folding twins loses no date, no source and no note', () => {
  const problems = [];
  for (const c of site.countries) {
    const raw = eventsForDestination(c, site.graph, { fold: false });
    const folded = eventsForDestination(c, site.graph);
    const days = new Set(folded.flatMap((e) => [e.date, e.endDate]).filter(Boolean));
    const sources = new Set(folded.flatMap((e) => e.sources));
    const notes = folded.map((e) => flatLabel(e.note));
    for (const e of raw) {
      for (const d of [e.date, e.endDate].filter(Boolean)) if (!days.has(d)) problems.push(`${c.code} lost ${d} ("${e.label}")`);
      for (const s of e.sources) if (!sources.has(s)) problems.push(`${c.code} lost the source ${s}`);
      if (e.note && !notes.some((n) => n.includes(flatLabel(e.note)))) problems.push(`${c.code} lost the note on "${e.label}"`);
    }
  }
  if (problems.length) throw new Error(problems.join('\n          '));
});

/* --- A route the reader cannot take is not a date to act on (#35) ---------- */

/* What "rendered as actionable" means, read off the markup the one renderer
   produces: a `data-date` (which `site.js` and `calendar.js` use to mark the
   next thing to do), a consequence badge, or a countdown chip. */
function actionableMarks(markup) {
  assert.ok(markup.includes('<li'), 'the renderer produced no list item, so this guard would pass on nothing');
  return ['data-date=', 'data-consequence=', 'timeline__badge', 'data-countdown'].filter((m) => markup.includes(m));
}

check('the actionable-markup detector sees an ordinary hard deadline', () => {
  const markup = toString(deadlineList([{ id: 'a', label: 'Apply', date: '2027-03-15', consequence: 'hard', sources: [], access: null }]));
  assert.ok(actionableMarks(markup).includes('data-date='), 'the detector cannot see a date, so it cannot see a closed one rendered as one');
});

const CLOSED = { state: 'closed', reason: 'The reader is not eligible for this route at all.', evidence: ['ev-x'] };

check('a closed route is one line, after every date a student acts on, with no standing', () => {
  const graph = {
    applicationRoutes: new Map([
      ['shut', {
        id: 'shut', destination: 'xx', intake: '2027-autumn', label: 'The closed route', readerAccess: CLOSED,
        rounds: [{ id: 'rd', label: 'Window', opens: '2026-09-01', closes: '2026-09-30', consequence: 'hard' }],
        milestones: [{ id: 'm1', type: 'result', label: 'Result', date: '2026-10-16', consequence: 'indicative' }],
      }],
      ['open', {
        id: 'open', destination: 'xx', intake: '2027-autumn', label: 'The open route',
        milestones: [{ id: 'm2', type: 'submit', label: 'Apply', date: '2027-03-15', consequence: 'hard' }],
      }],
    ]),
  };
  const country = { code: 'xx', name: 'X', application: { deadlines: [{ label: 'Profile copy of the window', date: '2026-09-30', consequence: 'hard', route: 'shut' }] } };
  const events = eventsForDestination(country, graph);
  const shut = events.filter(isClosed);
  assert.equal(shut.length, 1, `a closed route printed ${shut.length} entries — its milestones, or the profile entry pointing at it, leaked out`);
  assert.equal(events.at(-1).id, 'shut', 'a closed route was sorted among the dates to act on');
  assert.equal(standing(shut[0], '2026-09-23'), 'closed');
});

check('a closed milestone on an open route keeps its date but loses its place and its badge', () => {
  const graph = {
    applicationRoutes: new Map([
      ['r', {
        id: 'r', destination: 'xx', intake: '2027-autumn',
        milestones: [
          { id: 'early', type: 'submit', label: 'Round for others', date: '2026-10-01', consequence: 'hard', readerAccess: CLOSED },
          { id: 'late', type: 'submit', label: 'Apply', date: '2027-03-15', consequence: 'hard' },
        ],
      }],
    ]),
  };
  const events = eventsForDestination({ code: 'xx', name: 'X' }, graph);
  assert.deepEqual(events.map((e) => e.id), ['late', 'early'], 'the closed round was sorted by its date');
  const markup = toString(deadlineList(events.filter(isClosed)));
  assert.deepEqual(actionableMarks(markup), [], 'a closed milestone rendered as a date to act on');
  assert.ok(markup.indexOf(READER_ACCESS.closed.label) < markup.indexOf('Round for others'), 'the exclusion is not stated first');
});

check('no closed entry anywhere on the site renders as actionable, or sorts among those that do', () => {
  const all = allEvents(site);
  const firstClosed = all.findIndex(isClosed);
  if (firstClosed >= 0 && all.slice(firstClosed).some(isActionable)) throw new Error('a closed entry is sorted among the actionable ones');
  const offenders = [];
  for (const e of all.filter(isClosed)) {
    const marks = actionableMarks(toString(deadlineList([e])));
    if (marks.length) offenders.push(`${e.destination} "${e.label}": ${marks.join(', ')}`);
  }
  if (offenders.length) throw new Error(offenders.join('\n          '));
});

check('a route closed to every reader is closed in a field, not in a sentence', () => {
  /* Korea's 2027 GKS round, on both tracks: its graduation-certificate
     deadline of 31 December 2026 sits in the guidelines' general eligibility
     section, so no May 2027 IB candidate can use either the Embassy Track or
     the University Track, whatever their passport. The University Track was
     shown as "open to every nationality" until the audience critique caught
     it. Pinned because it is why the field exists. If either is ever reopened,
     it is reopened in its record and this line with it. */
  for (const id of ['kr-gks-embassy-2027', 'kr-gks-university-2027']) {
  const route = site.graph.applicationRoutes.get(id);
  assert.ok(route, `${id} is gone`);
  assert.equal(route.readerAccess?.state, 'closed', `${id} is not declared closed`);
  assert.match(route.readerAccess.reason, /31 December 2026/, `${id} should say why it is closed to everyone: the graduation-certificate date`);
  const events = allEvents(site).filter((e) => e.routeId === id);
  assert.ok(events.length >= 1, `${id} no longer reaches the calendar at all — it should be shown, not hidden`);
  assert.ok(events.every(isClosed), `${id} still produces an actionable entry`);
  }
});

check('a route closed only to some nationalities is conditional, not closed', () => {
  /* Japan's embassy MEXT undergraduate route is screened at the embassy in
     the applicant's country of nationality (2027 guidelines, 5(1)). The
     embassy in Copenhagen offers Danish nationals no undergraduate call, which
     is true for about a fifth of this site's readers. Marking it closed told
     the other four fifths "Not open to you" (docs/research/audience). */
  const id = 'jp-mext-embassy-2028';
  const route = site.graph.applicationRoutes.get(id);
  assert.ok(route, `${id} is gone`);
  assert.equal(route.readerAccess?.state, 'conditional', `${id} should be conditional on nationality`);
  assert.match(route.readerAccess.reason, /nationality/i, `${id} should name the condition`);
  const events = allEvents(site).filter((e) => e.routeId === id);
  assert.ok(events.length >= 1, `${id} no longer reaches the calendar`);
  assert.ok(events.every((e) => !isClosed(e)), `${id} still renders as closed to everyone`);
});

/* --- The Deadlines page opens on what is ahead ------------------------------ */

/* /timeline/ used to open on 1 September 2025 and list 60 past dates before the
   first one a student could still act on (docs/research/ia/text-walls.md §3.1).
   Rendered for a fixed "today", every date visible without opening anything must
   be ahead of it (or a window still open), and every dated event must still be
   on the page, one tap away. */
const { timeline, NEXT_UP } = await import('../src/pages/timeline.mjs');
const { defaultView } = await import('./lib/page-measure.mjs');

for (const today of ['2026-09-25', '2027-02-01']) {
  check(`the Deadlines page, as of ${today}, shows no past date before the first upcoming one`, () => {
    const out = timeline(site, { today });
    const pageHtml = typeof out === 'string' ? out : toString(out);
    const view = defaultView(pageHtml);
    const shown = [...view.matchAll(/<li\b[^>]*\sdata-date="([^"]+)"(?:[^>]*\sdata-end="([^"]+)")?/g)].map((m) => ({ date: m[1], end: m[2] || m[1] }));
    assert.ok(shown.length > 0 && shown.length <= NEXT_UP, `the default view shows ${shown.length} dates; it should open on at most ${NEXT_UP}`);
    const pastFirst = shown.filter((d) => d.end < today);
    assert.deepEqual(pastFirst, [], `past dates in the default view: ${pastFirst.map((d) => d.date).join(', ')}`);
    const sorted = shown.map((d) => d.date).slice().sort();
    assert.deepEqual(shown.map((d) => d.date), sorted, 'the dates shown first are not in date order');
    // Nothing dropped: every dated, actionable event is still on the page (the
    // "next up" dates appear twice there, once in the full list).
    const all = new Set([...pageHtml.matchAll(/<li\b[^>]*\sdata-date="([^"]+)"/g)].map((m) => m[1]));
    const missing = allEvents(site).filter((e) => e.date && isActionable(e) && !all.has(e.date));
    assert.deepEqual(missing.map((e) => e.id), [], 'dated events missing from the page');
  });
}

/* --- A school's dates are its own (#47) ----------------------------------- */

/* Every page a school has, by the id it answers to, and its Destination. */
const schoolPages = [
  ...site.countries.flatMap((c) =>
    c.institutions.filter((i) => !i.canonicalId).map((i) => ({ id: i.key, dest: c.code, inst: { ...i, id: i.key, destination: c.code } }))
  ),
  ...site.institutionCatalogue.all.map((i) => ({ id: i.id, dest: i.destination?.code || i.destination, inst: i })),
];
const pageIds = new Map(schoolPages.map((p) => [p.id, p.dest]));
for (const c of site.countries) for (const i of c.institutions) if (i.canonicalId) pageIds.set(i.key, c.code);

check('every date tied to schools names schools that have a page, in its own country', () => {
  const bad = [];
  const look = (where, dest, ids) => {
    if (ids === undefined) return;
    if (!Array.isArray(ids) || !ids.length) return bad.push(`${where}: institutions must be a non-empty list`);
    for (const id of ids) if (pageIds.get(id) !== dest) bad.push(`${where}: "${id}" is not a school page in ${dest}`);
  };
  for (const r of site.graph.applicationRoutes.values()) {
    for (const x of [...(r.rounds || []), ...(r.milestones || [])]) look(`${r.id}/${x.id}`, r.destination, x.institutions);
  }
  for (const c of site.countries) (c.application?.deadlines || []).forEach((d, i) => look(`${c.code}.deadlines[${i}]`, c.code, d.institutions));
  if (bad.length) throw new Error(`${bad.length} bad ties\n          ${bad.slice(0, 20).join('\n          ')}`);
});

check('every date a school says it replaces is a real route date', () => {
  const refs = new Set([...site.graph.applicationRoutes.values()].flatMap((r) => [...(r.milestones || []), ...(r.rounds || [])].map((m) => `${r.id}/${m.id}`)));
  const bad = [];
  for (const r of site.graph.applicationRoutes.values()) for (const m of r.milestones || []) if (m.supersedes && !refs.has(m.supersedes)) bad.push(`${r.id}/${m.id} → ${m.supersedes}`);
  for (const c of site.countries) for (const i of c.institutions) for (const d of i.school?.dates || []) if (d.supersedes && !refs.has(d.supersedes)) bad.push(`${i.key} "${d.label}" → ${d.supersedes}`);
  if (bad.length) throw new Error(`${bad.length} dangling supersedes\n          ${bad.join('\n          ')}`);
});

/* The wrong-school scan. On every school page, a date that is not tied to
   schools by id and whose label names one other school of the same country,
   by its full name or its short name as whole words, and not this one, is
   that other school's date on the wrong page (#47: SFU's dates on UBC's page
   because "British Columbia —" completed UBC's name). A label naming several
   other schools is a shared rule ("Oxford, Cambridge, medicine …") and is
   left to the tie: a date that is only those schools' carries `institutions`. */
const fold = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, "'");
const escRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const namesOfPage = (r) =>
  [r.name, r.shortName, r.localName].filter(Boolean)
    .flatMap((n) => { const m = n.match(/^(.*?)\s*\(([^)]+)\)\s*$/); return m ? [m[1], m[2]] : [n]; })
    .filter((n) => n.length >= 3);
const mentions = (label, n) => {
  const N = fold(n);
  return new RegExp(`(^|[^A-Za-z0-9])${escRe(N)}($|[^A-Za-z0-9])`, /\s/.test(N.trim()) ? 'i' : '').test(fold(label));
};
const byDest = new Map();
for (const p of schoolPages) byDest.set(p.dest, [...(byDest.get(p.dest) || []), p]);
const schoolToday = new Date().toISOString().slice(0, 10);
const wrongSchool = [];
let panelsChecked = 0;
const bindingLate = [];
for (const p of schoolPages) {
  const own = namesOfPage(p.inst);
  const others = byDest.get(p.dest).filter((q) => q !== p);
  const shown = datesFor(site, p.inst).filter((e) => e.date && (e.endDate || e.date) >= schoolToday);
  panelsChecked++;
  for (const e of shown) {
    if ((e.institutions || []).length) continue;
    if (own.some((n) => mentions(e.label, n))) continue;
    let named = others.filter((q) => namesOfPage(q.inst).some((n) => mentions(e.label, n)));
    named = named.filter((q) => !named.some((o) => o !== q && namesOfPage(o.inst).some((on) => namesOfPage(q.inst).some((qn) => on !== qn && fold(on).includes(fold(qn)) && mentions(e.label, on)))));
    if (named.length === 1) wrongSchool.push(`${p.id}: "${e.label}" is ${named[0].id}'s`);
  }
  /* Binding before soft: in the panel's order no soft date comes before a binding one. */
  const order = leadOrder(shown);
  const firstSoft = order.findIndex((e) => !isBinding(e));
  if (firstSoft >= 0 && order.slice(firstSoft).some(isBinding)) bindingLate.push(p.id);
}
check(`no school page shows another school's date (${panelsChecked} pages)`, () => {
  if (wrongSchool.length) throw new Error(`${wrongSchool.length} dates on the wrong page\n          ${wrongSchool.slice(0, 25).join('\n          ')}`);
});
check('every binding date comes before any soft one on a school page', () => {
  if (bindingLate.length) throw new Error(`soft before binding on ${bindingLate.join(', ')}`);
});

/* --- Progress ------------------------------------------------------------- */

if (REPORT) {
  const rows = site.countries
    .map((c) => {
      const ds = c.application?.deadlines || [];
      const iso = ds.filter((d) => ISO.test(String(d.date))).length;
      const declared = ds.filter((d) => !ISO.test(String(d.date)) && DATE_STATES[d.dateState]).length;
      return { code: c.code, name: c.name, total: ds.length, done: iso + declared };
    })
    .sort((a, b) => a.done / (a.total || 1) - b.done / (b.total || 1) || b.total - a.total);

  console.log('\n\nDeadline migration — least migrated first\n');
  for (const r of rows) {
    const bar = r.total ? '█'.repeat(Math.round((r.done / r.total) * 20)).padEnd(20, '·') : ''.padEnd(20, ' ');
    console.log(`  ${r.code}  ${bar}  ${String(r.done).padStart(3)} of ${String(r.total).padEnd(3)}  ${r.name}`);
  }
  const all = allEvents(site);
  const dated = all.filter((e) => e.date).length;
  console.log(`\n  ${dated} of ${all.length} events across the site carry a sortable date.\n`);
}

console.log(failures ? `\n${failures} failing\n` : '\nAll calendar guards pass\n');
process.exit(failures ? 1 : 0);
