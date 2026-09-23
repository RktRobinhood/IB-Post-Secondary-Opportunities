/**
 * Guards on the one IB session calendar.
 *
 * The fault these exist to prevent produced no error and no smaller number
 * anywhere. `2027-07-06` was written into 41 files and cited in none of them,
 * and because every copy was an independent assertion there was no way for two
 * of them to disagree out loud — the one that did, `au.json` saying 5–6 July,
 * was found by reading all 61 by hand. The explanation somebody then wrote on
 * two records to reconcile them, that 5 July was when coordinators got school
 * access, was invented and is wrong; 5 July is the IB's transcript-request
 * cut-off. A plausible sentence is what this kind of duplication produces, and
 * a plausible sentence is invisible to every other check in this repository.
 *
 * So the load-bearing test here is not "is the date right today". It is that a
 * record may not state an IB date on its own authority at all. One pointer to
 * `data/ib-calendar.json`, or the guard refuses it.
 *
 * Most of the tests run against fixtures rather than against the live data, on
 * the same argument as scripts/test-canonical.mjs: the repository is clean
 * after the migration, which is exactly why it cannot demonstrate any of these
 * refusals, and a rule that never refuses anything is not a rule. The live
 * data is then asserted once, at the end, against the same function.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  DATE_STATES,
  IB_DATE_BASIS,
  IB_RESULTS_EVENT,
  claimsIbRelease,
  ibSessionEvent,
} from '../src/lib/calendar.mjs';
import { isRealDate } from '../src/lib/publication-floor.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'data');

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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/* --- The audit ------------------------------------------------------------- */

/**
 * The canonical record is a record like any other and can be wrong.
 *
 * The check that matters most here is the last one: two events of one session
 * may not fall on the same day. Results day and the transcript cut-off ARE a
 * day apart and the whole model exists to keep them apart, so a session that
 * collapses them has lost the distinction at source, and every record
 * downstream would then be correct and still wrong.
 */
function auditCalendar(calendar) {
  const problems = [];
  const sessions = calendar?.sessions || [];
  if (!sessions.length) problems.push('data/ib-calendar.json holds no sessions');

  const cycles = sessions.filter((s) => s.isTheCycleThisSiteCovers);
  if (cycles.length !== 1) {
    problems.push(
      `${cycles.length} session(s) claim to be the cycle this site covers. Exactly one may: it is what a record with no pointer of its own falls back to.`
    );
  }

  for (const session of sessions) {
    const seen = new Map();
    for (const [id, event] of Object.entries(session.events || {})) {
      const at = `${session.id}/${id}`;
      if (!IB_DATE_BASIS[event.basis]) {
        problems.push(`${at}: basis "${event.basis}" is not one of ${Object.keys(IB_DATE_BASIS).join(', ')}`);
      }
      if (event.date != null && !isRealDate(event.date)) {
        problems.push(`${at}: date "${event.date}" is not ISO`);
      }
      if (event.date == null && !DATE_STATES[event.dateState]) {
        problems.push(`${at}: no date and no dateState — say which of the ${Object.keys(DATE_STATES).length} it is`);
      }
      if (event.basis === 'published' && !(event.evidence || []).length) {
        problems.push(`${at}: claims basis "published" and cites no Evidence. Published means somebody read it and the excerpt is on a record.`);
      }
      if (isRealDate(event.date)) {
        if (seen.has(event.date)) {
          problems.push(
            `${at} and ${session.id}/${seen.get(event.date)} are both on ${event.date}. Two IB events on one day is how the distinction between them gets lost.`
          );
        }
        seen.set(event.date, id);
      }
    }
  }
  return problems;
}

/**
 * Every milestone and country deadline, against the record it points at.
 *
 * `entries` is a flat list of `{ where, label, date, dateState, provisional,
 * evidence, ibCalendar }` — the shape both a route milestone and a country
 * deadline already have, so the guard never has to know which it is holding.
 */
function auditRecords(calendar, entries) {
  const problems = [];

  for (const e of entries) {
    const claims = claimsIbRelease(e.label);

    /* THE ONE. A record that names the IB's own results day and carries a date
       of its own has restated a fact it does not own, which is how there came
       to be 61 of them. */
    if (claims && !e.ibCalendar) {
      problems.push(
        `${e.where}: "${e.label}" states an IB results date (${e.date ?? '—'}) on its own authority. ` +
          `Point it at data/ib-calendar.json with ibCalendar and let scripts/migrate-ib-results-day.mjs fill the date.`
      );
      continue;
    }
    if (!e.ibCalendar) continue;

    const event = ibSessionEvent(calendar, e.ibCalendar);
    if (!event) {
      problems.push(`${e.where}: ibCalendar "${e.ibCalendar}" resolves to nothing in data/ib-calendar.json`);
      continue;
    }

    /* Conflation. A label that says the IB released results, pointing at an
       event that is not the release, publishes another IB date to a student as
       though it were results day. This is the shape of the original drift. */
    if (claims && event.eventId !== IB_RESULTS_EVENT) {
      problems.push(
        `${e.where}: "${e.label}" claims the IB released results and points at ${e.ibCalendar}, which is "${event.label}". ` +
          `They are different events and a student reading this would take the wrong day.`
      );
    }

    if (isRealDate(event.date)) {
      if (e.date !== event.date) {
        problems.push(
          `${e.where}: "${e.label}" says ${e.date ?? '—'} where ${e.ibCalendar} says ${event.date}. ` +
            `Run scripts/migrate-ib-results-day.mjs --write.`
        );
      }
      /* An inferred date shown as a confirmed one is the failure the honesty
         field exists to stop, and `provisional` is the only part of it a
         student ever sees. */
      if (event.basis !== 'published' && e.provisional !== true) {
        problems.push(
          `${e.where}: "${e.label}" takes a date whose basis is "${event.basis}" and is not marked provisional, ` +
            `so an inference renders as a published date.`
        );
      }
    } else if (e.date != null) {
      problems.push(`${e.where}: "${e.label}" carries ${e.date} where ${e.ibCalendar} has no date at all`);
    }

    const cited = Array.isArray(e.evidence) ? e.evidence : [];
    const missing = (event.evidence || []).filter((id) => !cited.includes(id));
    if (missing.length) {
      problems.push(`${e.where}: "${e.label}" does not cite ${missing.join(', ')}, which ${e.ibCalendar} is held on`);
    }
  }

  return problems;
}

/**
 * Prose, which is where the drift started and where no field can catch it.
 *
 * Two patterns, both built from the canonical dates rather than typed in, so
 * this file names no day and no month of its own:
 *
 *   - a range spanning two events of one session — "5-6 July" — which reads to
 *     a student as one event lasting two days and is what `au.json` said;
 *   - a sentence that names IB results and then a day that is not results day.
 *
 * Evidence records and the canonical record itself are NOT audited. Describing
 * the mistake is what an `interpretation` field is for, and a guard that
 * refused the correction along with the error would make the record unable to
 * say what it had corrected.
 */
function auditProse(calendar, texts) {
  const problems = [];
  const parts = (iso) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? { year: +m[1], month: +m[2], day: +m[3] } : null;
  };

  const ranges = [];
  const days = [];
  for (const session of calendar?.sessions || []) {
    const dated = Object.entries(session.events || {})
      .map(([id, ev]) => ({ id, ev, p: parts(ev.date) }))
      .filter((x) => x.p);
    for (const { id, ev, p } of dated) {
      days.push({ ref: `${session.id}/${id}`, label: ev.label, ...p, isResults: id === IB_RESULTS_EVENT });
    }
    for (const a of dated) {
      for (const b of dated) {
        if (a.id === b.id || a.p.month !== b.p.month || a.p.year !== b.p.year || a.p.day >= b.p.day) continue;
        ranges.push({
          a: a.id,
          b: b.id,
          re: new RegExp(`\\b${a.p.day}\\s*(?:[-–—]|to)\\s*${b.p.day}\\s+${MONTHS[a.p.month - 1]}\\b`, 'i'),
        });
      }
    }
  }

  const MENTIONS_IB = /\bIB\b[^.]{0,40}?\b(?:results?|releases?|publishes)\b/i;

  /* A release VERB is required between the IB and the day, and this is not
     fussiness. Without it the rule fired on "your IB results must reach UC by
     15 July" and on "official IB examination results due 15 July" — four true
     sentences about somebody else's deadline, which is the same distinction
     the label rule makes and the same one that matters. */
  const DAY = `\\b(\\d{1,2})\\s+(${MONTHS.join('|')})\\b`;
  const RELEASED = `(?:released?|release|publish(?:ed|es)?|issued?|comes? out|came out|arrives?|are out)`;
  const SAYS_RELEASE = [
    new RegExp(`\\bIB\\b[^.;]{0,25}?\\bresults?\\b[^.;]{0,50}?${RELEASED}[^.;]{0,45}?${DAY}`, 'gi'),
    new RegExp(`\\bIB\\b[^.;]{0,15}?\\b(?:releases?|publishes)\\b[^.;]{0,45}?${DAY}`, 'gi'),
  ];

  for (const { where, text } of texts) {
    if (!MENTIONS_IB.test(text)) continue;

    for (const r of ranges) {
      if (r.re.test(text)) {
        problems.push(
          `${where}: describes IB results as spanning ${r.a} and ${r.b}. They are two different IB events one day apart, ` +
            `and a student reading a range takes the earlier day.`
        );
      }
    }

    for (const m of SAYS_RELEASE.flatMap((re) => [...text.matchAll(re)])) {
      const day = Number(m[1]);
      const month = MONTHS.indexOf(m[2].replace(/^./, (c) => c.toUpperCase())) + 1;
      const hit = days.find((d) => d.day === day && d.month === month);
      if (hit && !hit.isResults) {
        problems.push(
          `${where}: names IB results and then ${day} ${m[2]}, which is ${hit.ref} — "${hit.label}" — and not results day.`
        );
      }
      const results = days.find((d) => d.isResults && d.month === month);
      if (results && !hit && day !== results.day) {
        problems.push(
          `${where}: names IB results and then ${day} ${m[2]}, where ${results.ref} says ${results.day} ${m[2]}.`
        );
      }
    }
  }

  return problems;
}

/**
 * The verifier's cached probes. They are derived, not asserted — but a probe
 * string carrying a superseded date is a record of a check nobody ran against
 * the date now on the site, and it reads exactly like one somebody did.
 */
function auditDerived(calendar, probes) {
  const problems = [];
  for (const { where, requirement } of probes) {
    const m = /^(.*) — (\d{4}-\d{2}-\d{2})/.exec(requirement);
    if (!m || !claimsIbRelease(m[1])) continue;
    for (const session of calendar?.sessions || []) {
      const event = session.events?.[IB_RESULTS_EVENT];
      if (!isRealDate(event?.date) || m[2] === event.date) continue;
      if (session.isTheCycleThisSiteCovers) {
        problems.push(
          `${where}: cached probe ${JSON.stringify(requirement)} still carries ${m[2]}, where ${session.id}/${IB_RESULTS_EVENT} says ${event.date}`
        );
      }
    }
  }
  return problems;
}

/* --- Fixtures, which are the refusals -------------------------------------- */

const CAL = {
  sessions: [
    {
      id: '2027-05',
      isTheCycleThisSiteCovers: true,
      events: {
        'results-day': {
          label: 'IB results released',
          date: '2027-07-06',
          basis: 'inferred-from-precedent',
          evidence: ['ev-x'],
        },
        'transcript-request-cutoff': {
          label: 'Transcript requests stop being free',
          date: '2027-07-05',
          basis: 'published',
          evidence: ['ev-y'],
        },
      },
    },
  ],
};

const entry = (o) => ({ where: 'fixture', label: 'IB results released', evidence: ['ev-x'], provisional: true, ...o });

console.log('\nIB session calendar guards\n');

check('a record may not state an IB results date on its own authority', () => {
  const problems = auditRecords(CAL, [entry({ date: '2027-07-06', ibCalendar: undefined })]);
  assert.equal(problems.length, 1, `expected one refusal, got: ${problems.join(' | ')}`);
  assert.match(problems[0], /on its own authority/);
});

check('and the refusal does not depend on the date being wrong', () => {
  // The regression this whole issue is about: a new record copying today's
  // correct date is exactly as bad as one copying a stale one, because the
  // next change to the canonical record will not reach it.
  const problems = auditRecords(CAL, [entry({ date: '2027-07-06' }), entry({ date: '2027-08-30' })]);
  assert.equal(problems.length, 2);
});

check('a pointed record whose date disagrees with the canonical one is refused', () => {
  const problems = auditRecords(CAL, [entry({ date: '2027-07-05', ibCalendar: '2027-05/results-day' })]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /says 2027-07-05 where 2027-05\/results-day says 2027-07-06/);
});

check('results day and the transcript cut-off may not be conflated', () => {
  const problems = auditRecords(CAL, [
    entry({ label: 'IB results released', date: '2027-07-05', ibCalendar: '2027-05/transcript-request-cutoff', evidence: ['ev-y'], provisional: undefined }),
  ]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /different events/);
});

check('an inferred date shown without a provisional mark is refused', () => {
  const problems = auditRecords(CAL, [entry({ date: '2027-07-06', ibCalendar: '2027-05/results-day', provisional: false })]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /renders as a published date/);
});

check('a record that does not cite the Evidence the date is held on is refused', () => {
  const problems = auditRecords(CAL, [entry({ date: '2027-07-06', ibCalendar: '2027-05/results-day', evidence: [] })]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /does not cite ev-x/);
});

check('a pointer to a session that no longer exists fails loudly', () => {
  const problems = auditRecords(CAL, [entry({ date: '2027-07-06', ibCalendar: '2028-05/results-day' })]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /resolves to nothing/);
});

check('a deadline that merely mentions IB results keeps its own date', () => {
  // NTU wants actuals within three days; UC wants them by 15 July. Four real
  // deadlines would have moved onto the IB's day under a looser rule.
  const problems = auditRecords(CAL, [
    { where: 'fixture', label: 'NTU actual IB results due', date: '2027-07-09', evidence: [] },
    { where: 'fixture', label: 'Official IB examination results to UC', date: '2027-07-15', evidence: [] },
  ]);
  assert.deepEqual(problems, []);
});

check('prose describing results day as a two-day range is refused', () => {
  const problems = auditProse(CAL, [{ where: 'fixture', text: 'Because your IB results arrive on 5-6 July 2027, you will apply conditionally.' }]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /two different IB events/);
});

check('prose naming IB results and then the other event’s day is refused', () => {
  const problems = auditProse(CAL, [{ where: 'fixture', text: 'IB results are released on 5 July 2027.' }]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /and not results day/);
});

check('prose naming IB results and a day nobody publishes is refused', () => {
  const problems = auditProse(CAL, [{ where: 'fixture', text: 'IB results come out 9 July.' }]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /says 6 July/);
});

check('prose that names the right day is left alone', () => {
  assert.deepEqual(
    auditProse(CAL, [{ where: 'fixture', text: 'IB results are released on 6 July 2027, after the Danish documentation deadline.' }]),
    []
  );
});

check('two IB events on one day is refused at the source', () => {
  const collapsed = structuredClone(CAL);
  collapsed.sessions[0].events['transcript-request-cutoff'].date = '2027-07-06';
  const problems = auditCalendar(collapsed);
  assert.ok(problems.some((p) => /Two IB events on one day/.test(p)), problems.join(' | '));
});

check('a session cannot claim "published" with nothing read', () => {
  const unread = structuredClone(CAL);
  unread.sessions[0].events['transcript-request-cutoff'].evidence = [];
  const problems = auditCalendar(unread);
  assert.ok(problems.some((p) => /cites no Evidence/.test(p)), problems.join(' | '));
});

check('an invented basis is not accepted as an honesty field', () => {
  const invented = structuredClone(CAL);
  invented.sessions[0].events['results-day'].basis = 'pretty-sure';
  const problems = auditCalendar(invented);
  assert.ok(problems.some((p) => /basis "pretty-sure"/.test(p)), problems.join(' | '));
});

check('a dateless event still has to say why', () => {
  const blank = structuredClone(CAL);
  blank.sessions[0].events['results-day'] = { label: 'IB results released', date: null, basis: 'not-established', evidence: [] };
  const problems = auditCalendar(blank);
  assert.ok(problems.some((p) => /no date and no dateState/.test(p)), problems.join(' | '));
});

check('a stale cached probe is refused', () => {
  const problems = auditDerived(CAL, [
    { where: 'fixture', requirement: 'IB results released — 2027-07-05' },
    { where: 'fixture', requirement: 'American University of Sharjah — Early File Completion for Fall 2027 — 2027-07-05' },
    { where: 'fixture', requirement: 'Documentation deadline — 2027-07-05 12:00' },
  ]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /still carries 2027-07-05/);
});

/* --- The real repository ---------------------------------------------------- */

async function readJson(p) {
  return JSON.parse(await fs.readFile(p, 'utf8'));
}

async function listJson(dir) {
  try {
    return (await fs.readdir(dir)).filter((f) => f.endsWith('.json')).sort();
  } catch {
    return [];
  }
}

/** Every string in a record, so prose is audited wherever a pass put it. */
function strings(node, out = []) {
  if (typeof node === 'string') out.push(node);
  else if (Array.isArray(node)) for (const v of node) strings(v, out);
  else if (node && typeof node === 'object') for (const v of Object.values(node)) strings(v, out);
  return out;
}

/** Where a student reads prose. `evidence` is excluded on purpose — see auditProse. */
const PROSE_DIRS = [
  'countries', 'application-routes', 'application-systems', 'destinations',
  'topics', 'context-notes', 'institutions', 'programmes', 'opportunities', 'recognition', 'dk',
];

const calendar = await readJson(path.join(DATA, 'ib-calendar.json'));

const entries = [];
const texts = [];
const probes = [];

for (const f of await listJson(path.join(DATA, 'application-routes'))) {
  const doc = await readJson(path.join(DATA, 'application-routes', f));
  for (const m of doc.milestones || []) entries.push({ where: `application-routes/${f} → ${m.id}`, ...m });
}
for (const f of await listJson(path.join(DATA, 'countries'))) {
  const doc = await readJson(path.join(DATA, 'countries', f));
  for (const [i, d] of (doc.application?.deadlines || []).entries()) {
    entries.push({ where: `countries/${f} → deadlines[${i}]`, ...d });
  }
}
for (const dir of PROSE_DIRS) {
  for (const f of await listJson(path.join(DATA, dir))) {
    const doc = await readJson(path.join(DATA, dir, f));
    for (const text of strings(doc)) texts.push({ where: `${dir}/${f}`, text });
  }
}
for (const f of await listJson(path.join(DATA, 'evidence'))) {
  const doc = await readJson(path.join(DATA, 'evidence', f));
  for (const r of Array.isArray(doc) ? doc : doc.records || []) {
    for (const c of r.sourceCheck?.claims || []) {
      for (const d of c.details || []) probes.push({ where: `evidence/${f} → ${r.id}`, requirement: d.requirement || '' });
    }
  }
}

await checkAsync('the canonical record is the shape it says it is', async () => {
  assert.deepEqual(auditCalendar(calendar), []);
});

await checkAsync('no record on the site states an IB date on its own authority', async () => {
  const problems = auditRecords(calendar, entries);
  assert.deepEqual(problems, [], `${problems.length} problem(s)\n          ${problems.join('\n          ')}`);
});

await checkAsync('no prose on the site conflates the two IB dates', async () => {
  const problems = auditProse(calendar, texts);
  assert.deepEqual(problems, [], `${problems.length} problem(s)\n          ${problems.join('\n          ')}`);
});

await checkAsync('no cached probe carries a superseded IB date', async () => {
  const problems = auditDerived(calendar, probes);
  assert.deepEqual(problems, [], `${problems.length} problem(s)\n          ${problems.join('\n          ')}`);
});

await checkAsync('every Evidence record the calendar is held on exists, and none claims more than it has', async () => {
  const byId = new Map();
  for (const f of await listJson(path.join(DATA, 'evidence'))) {
    const doc = await readJson(path.join(DATA, 'evidence', f));
    for (const r of Array.isArray(doc) ? doc : doc.records || []) byId.set(r.id, r);
  }
  const problems = [];
  for (const session of calendar.sessions || []) {
    for (const [id, event] of Object.entries(session.events || {})) {
      for (const ref of event.evidence || []) {
        const record = byId.get(ref);
        if (!record) {
          problems.push(`${session.id}/${id} cites Evidence "${ref}", which does not exist`);
          continue;
        }
        /* An inference signed off as verified is the single dishonesty this
           record exists to prevent. `verified` means a second party read it
           back against its source, and nobody can do that for a page that
           cannot be opened. */
        if (event.basis !== 'published' && record.verificationState === 'verified') {
          problems.push(`${ref} is marked verified and backs ${session.id}/${id}, whose basis is "${event.basis}"`);
        }
      }
    }
  }
  assert.deepEqual(problems, []);
});

await checkAsync('results day reaches the calendar once per route, on the canonical day', async () => {
  /* Not a count of today's data — "24 events" would pass forever until somebody
     researched a thirty-seventh Destination, and then fail for the wrong reason.
     Three invariants instead, each of which is what a real fault would break.

     Note what is NOT asserted: one per Destination. The UAE runs four
     Application Routes and Singapore three, and each tells its own students
     where this date sits relative to their own deadlines, so four UAE entries
     is the calendar working. What would be a fault is the same route or the
     same profile contributing twice, which is exactly what the route/profile
     de-duplication in `eventsForDestination` exists to prevent. */
  const { load } = await import('../src/lib/data.mjs');
  const { allEvents } = await import('../src/lib/calendar.mjs');
  const site = await load();
  const results = allEvents(site).filter((e) => claimsIbRelease(e.label));

  assert.ok(results.length > 0, 'no IB results day reaches the calendar at all');

  const cycle = (calendar.sessions || []).find((s) => s.isTheCycleThisSiteCovers);
  const day = cycle?.events?.[IB_RESULTS_EVENT]?.date;
  assert.deepEqual(
    results.filter((e) => e.date !== day).map((e) => `${e.destination} ${e.date} "${e.label}"`),
    [],
    'an IB results event on the calendar is not on the canonical day'
  );

  const perSource = new Map();
  for (const e of results) {
    const key = `${e.destination}:${e.routeId || e.origin}`;
    perSource.set(key, (perSource.get(key) || 0) + 1);
  }
  assert.deepEqual(
    [...perSource].filter(([, n]) => n > 1).map(([k, n]) => `${k} contributes ${n}`),
    [],
    'one route or profile is putting results day on the calendar more than once'
  );

  /* And every Destination whose records carry the date still shows it. Losing
     one to a de-duplication would be silent otherwise. */
  const reached = new Set(results.map((e) => e.destination));
  const expected = new Set(
    entries
      .filter((e) => e.ibCalendar === `${cycle.id}/${IB_RESULTS_EVENT}`)
      .map((e) => e.where.replace(/^(?:countries|application-routes)\//, '').slice(0, 2))
  );
  assert.deepEqual([...expected].filter((code) => !reached.has(code)), []);
});

console.log(failures ? `\n${failures} failing\n` : '\nAll IB calendar guards pass\n');
process.exit(failures ? 1 : 0);
