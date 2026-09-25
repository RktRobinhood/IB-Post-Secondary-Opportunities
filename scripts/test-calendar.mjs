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
  sortKey,
  standing,
} from '../src/lib/calendar.mjs';
import { deadlineList } from '../src/lib/primitives.mjs';
import { toString } from '../src/lib/html.mjs';
import { load } from '../src/lib/data.mjs';

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
