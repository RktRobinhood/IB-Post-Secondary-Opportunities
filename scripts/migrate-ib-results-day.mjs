/**
 * Point every IB session date at data/ib-calendar.json instead of restating it.
 *
 *   node scripts/migrate-ib-results-day.mjs              # report
 *   node scripts/migrate-ib-results-day.mjs --write
 *
 * WHAT WENT WRONG
 *
 * `2027-07-06` appeared 61 times across 41 files — 22 Application Route
 * milestones, 5 country profiles, 14 verifier logs — and every one of them
 * asserted the same fact on its own authority. None cited anything, because
 * ibo.org refuses both automated fetch and a browser session.
 *
 * It had already drifted. `au.json` said 5–6 July where everything else said
 * 6 July, and the note written on two records to explain the second day — that
 * 5 July was when coordinators got school access — was an inference made to
 * reconcile the two. It was wrong. 5 July is the IB's transcript-request
 * cut-off, which is a real and separate IB deadline the site did not hold at
 * all. Sixty-one independent copies is how a made-up reconciliation survives.
 *
 * WHAT THIS DOES
 *
 * Every occurrence gains `ibCalendar: "<session>/<event>"` and then takes its
 * date, its provisional flag and its Evidence from that record. Re-running is
 * free and is how a date change propagates: edit data/ib-calendar.json, run
 * this, and scripts/test-ib-calendar.mjs stops failing.
 *
 * WHAT IT MATCHES, AND WHY NOT THE STRING
 *
 * Not every 2027-07-05 or 2027-07-06 in this repository is an IB date, and the
 * near misses are the expensive ones: Denmark's documentation deadline at 12:00
 * CET, AUS's Early File Completion, Iceland's registration fee, the Flemish
 * veterinary entrance examination, a Poznań examination window. A match is made
 * on the claim — a label that opens "IB results", which is the IB publishing
 * to candidates — and never on the date. Anything carrying a canonical date
 * WITHOUT that claim is listed at the end and left alone, so the decision not
 * to touch it is visible rather than silent.
 *
 * WHAT IT WILL NOT DO
 *
 * It will not write a label or a note. Twenty-two of the labels are identical
 * and several are not — "IB results released — what an Ontario offer turns on"
 * says something true about Ontario — and the notes are the most destination-
 * specific writing on the site. The date is the shared fact; the sentence
 * around it is not.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { IB_DATE_BASIS, IB_RESULTS_EVENT, claimsIbRelease, ibSessionEvent, ibSessionEventRefs } from '../src/lib/calendar.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'data');
const WRITE = process.argv.includes('--write');

const isIso = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

async function readJson(p) {
  return JSON.parse(await fs.readFile(p, 'utf8'));
}

async function writeJson(p, doc) {
  await fs.writeFile(p, JSON.stringify(doc, null, 2) + '\n', 'utf8');
}

async function listJson(dir) {
  try {
    return (await fs.readdir(dir)).filter((f) => f.endsWith('.json')).sort();
  } catch {
    return [];
  }
}

/* --- the canonical record -------------------------------------------------- */

const calendar = await readJson(path.join(DATA, 'ib-calendar.json'));

/** The session a record with no pointer of its own belongs to. */
const CYCLE = (calendar.sessions || []).find((s) => s.isTheCycleThisSiteCovers);
if (!CYCLE) {
  console.error('\ndata/ib-calendar.json names no session as the cycle this site covers. Nothing can be migrated from it.\n');
  process.exit(1);
}
const DEFAULT_REF = `${CYCLE.id}/${IB_RESULTS_EVENT}`;

/** Every canonical date, for the "carries the date but makes no claim" sweep. */
const CANONICAL_DATES = new Map();
for (const s of calendar.sessions || []) {
  for (const [id, e] of Object.entries(s.events || {})) {
    if (isIso(e.date)) CANONICAL_DATES.set(e.date, `${s.id}/${id}`);
  }
}

/* --- applying one record --------------------------------------------------- */

const changes = [];
const matched = [];
const leftAlone = [];

/**
 * Bring one milestone or deadline entry into line with the record it points at.
 * Returns the list of fields it actually changed, so a re-run reports nothing.
 */
function apply(entry, where) {
  const ref = entry.ibCalendar || DEFAULT_REF;
  const event = ibSessionEvent(calendar, ref);
  if (!event) {
    changes.push(`${where}: ibCalendar "${ref}" resolves to nothing. Known: ${ibSessionEventRefs(calendar).join(', ')}`);
    return [];
  }
  if (!IB_DATE_BASIS[event.basis]) {
    changes.push(`${where}: ${ref} declares basis "${event.basis}", which is not one of ${Object.keys(IB_DATE_BASIS).join(', ')}`);
    return [];
  }

  const done = [];
  if (entry.ibCalendar !== ref) {
    entry.ibCalendar = ref;
    done.push(`ibCalendar ← ${ref}`);
  }
  if (isIso(event.date)) {
    if (entry.date !== event.date) {
      done.push(`date ${entry.date ?? '—'} → ${event.date}`);
      entry.date = event.date;
    }
    /* A date and a dateState together is a record saying both "here it is" and
       "here is why there isn't one". The date wins; the honesty now lives on
       `basis` in the canonical record and on `provisional` here. */
    if (entry.dateState) {
      delete entry.dateState;
      done.push('dateState removed — the canonical record has a date');
    }
  }

  /* An inferred date is a provisional date. `provisional` already means
     "carried from a previous cycle because the authority has not published
     this one" and /timeline/ already explains it, so the inference reaches a
     student through a mechanism that exists rather than a new one nobody
     renders. Fifteen of the twenty-two route milestones lacked it. */
  const shouldBeProvisional = event.basis !== 'published';
  if (shouldBeProvisional && entry.provisional !== true) {
    entry.provisional = true;
    done.push(`provisional ← true (basis: ${event.basis})`);
  }
  if (!shouldBeProvisional && entry.provisional === true) {
    delete entry.provisional;
    done.push('provisional removed — the canonical record is published and read');
  }

  const want = event.evidence || [];
  if (want.length) {
    const have = Array.isArray(entry.evidence) ? entry.evidence : [];
    const add = want.filter((id) => !have.includes(id));
    if (add.length) {
      entry.evidence = [...have, ...add];
      done.push(`evidence += ${add.join(', ')}`);
    }
  }
  return done;
}

/* --- routes ----------------------------------------------------------------- */

for (const file of await listJson(path.join(DATA, 'application-routes'))) {
  const p = path.join(DATA, 'application-routes', file);
  const doc = await readJson(p);
  let touched = 0;

  for (const m of doc.milestones || []) {
    const claims = claimsIbRelease(m.label) || Boolean(m.ibCalendar);
    if (!claims) {
      if (isIso(m.date) && CANONICAL_DATES.has(m.date)) {
        leftAlone.push(`application-routes/${file}: "${m.label}" on ${m.date} — same day as ${CANONICAL_DATES.get(m.date)}, different event`);
      }
      continue;
    }
    const done = apply(m, `application-routes/${file} → ${m.id}`);
    matched.push({ where: `application-routes/${file}`, label: m.label, ref: m.ibCalendar, entity: doc.id, field: 'milestones' });
    if (done.length) {
      changes.push(`application-routes/${file} → ${m.id}: ${done.join('; ')}`);
      touched++;
    }
  }

  if (touched && WRITE) await writeJson(p, doc);
}

/* --- country profiles -------------------------------------------------------- */

for (const file of await listJson(path.join(DATA, 'countries'))) {
  const p = path.join(DATA, 'countries', file);
  const doc = await readJson(p);
  let touched = 0;

  for (const [i, d] of (doc.application?.deadlines || []).entries()) {
    const claims = claimsIbRelease(d.label) || Boolean(d.ibCalendar);
    if (!claims) {
      for (const day of [d.date, d.endDate]) {
        if (isIso(day) && CANONICAL_DATES.has(day)) {
          leftAlone.push(`countries/${file}: "${d.label}" on ${day} — same day as ${CANONICAL_DATES.get(day)}, different event`);
        }
      }
      continue;
    }
    const done = apply(d, `countries/${file} → deadlines[${i}]`);
    matched.push({ where: `countries/${file}`, label: d.label, ref: d.ibCalendar, entity: doc.code, field: 'deadlines' });
    if (done.length) {
      changes.push(`countries/${file} → deadlines[${i}]: ${done.join('; ')}`);
      touched++;
    }
  }

  if (touched && WRITE) await writeJson(p, doc);
}

/* --- the verifier's own logs -------------------------------------------------
 *
 * The 14 evidence files do not assert this date; they cache what
 * scripts/verify-evidence.mjs looked for, in strings like
 * "IB results released — 2027-07-06". Derived, and they still have to agree:
 * a cached probe carrying a superseded date is a record of a check that was
 * never run against the date now on the site, and it reads exactly like one
 * that was. Rewritten by the same rule and never by the date, so
 * "American University of Sharjah — Early File Completion for Fall 2027 —
 * 2027-07-05" and "Documentation deadline — 2027-07-05 12:00" stay put.
 */

const RELEASE_DATE = ibSessionEvent(calendar, DEFAULT_REF)?.date;

function retagRequirement(text) {
  const m = String(text).match(/^(.*) — (\d{4}-\d{2}-\d{2})(.*)$/);
  if (!m) return null;
  const [, label, day, tail] = m;
  if (!claimsIbRelease(label)) return null;
  if (!RELEASE_DATE || day === RELEASE_DATE) return null;
  return `${label} — ${RELEASE_DATE}${tail}`;
}

for (const file of await listJson(path.join(DATA, 'evidence'))) {
  const p = path.join(DATA, 'evidence', file);
  const doc = await readJson(p);
  const records = Array.isArray(doc) ? doc : doc.records || [];
  let touched = 0;

  for (const r of records) {
    for (const c of r.sourceCheck?.claims || []) {
      for (const d of c.details || []) {
        const next = retagRequirement(d.requirement);
        if (next) {
          changes.push(`evidence/${file} → ${r.id}: ${JSON.stringify(d.requirement)} → ${JSON.stringify(next)}`);
          d.requirement = next;
          touched++;
        }
      }
    }
  }

  if (touched && WRITE) await writeJson(p, doc);
}

/* --- the Evidence record's index of what depends on it -----------------------
 *
 * `supports` is what the freshness report walks to find every claim that moves
 * when a page does. Hand-maintaining it across 24 records is the same problem
 * this migration exists to end, so it is regenerated here: the anchor on the
 * session record, plus one entry per occurrence, sorted so a re-run produces
 * no diff.
 */

const EVIDENCE_FILE = path.join(DATA, 'evidence', 'ib.json');

/** evidence id → the supports[] it should carry, rebuilt from what points at it. */
const wantSupports = new Map();
const noteSupport = (evidenceIds, entry) => {
  for (const id of evidenceIds || []) {
    if (!wantSupports.has(id)) wantSupports.set(id, []);
    wantSupports.get(id).push(entry);
  }
};

/* The anchor: the session record itself is the thing the Evidence is primarily
   about, and without it an Evidence record cited by nothing yet would have an
   empty supports[] and fail the schema. */
for (const session of calendar.sessions || []) {
  for (const event of Object.values(session.events || {})) {
    noteSupport(event.evidence, { entity: `ib-${session.id}`, field: 'deadlines' });
  }
}

/* And every occurrence, under the event it actually points at. Grouping by the
   pointer rather than by "was matched" is the whole distinction this migration
   exists to hold: Ireland's entry and Germany's are both IB dates and they are
   not the same IB date. */
for (const m of matched) {
  if (!m.entity) continue;
  const event = ibSessionEvent(calendar, m.ref);
  noteSupport(event?.evidence, { entity: m.entity, field: m.field });
}

{
  const doc = await readJson(EVIDENCE_FILE);
  const records = Array.isArray(doc) ? doc : doc.records || [];
  let touched = 0;

  for (const [id, entries] of wantSupports) {
    const record = records.find((r) => r.id === id);
    if (!record) {
      changes.push(`data/evidence/ib.json: no record "${id}", which data/ib-calendar.json cites`);
      continue;
    }
    const key = (x) => `${x.entity}.${x.field}`;
    const unique = [...new Map(entries.map((x) => [key(x), x])).values()].sort((a, b) => key(a).localeCompare(key(b)));
    if (JSON.stringify(unique) !== JSON.stringify(record.supports)) {
      changes.push(`data/evidence/ib.json → ${id}: supports ${record.supports?.length ?? 0} → ${unique.length} entries`);
      record.supports = unique;
      touched++;
    }
  }

  if (touched && WRITE) await writeJson(EVIDENCE_FILE, doc);
}

/* --- report ------------------------------------------------------------------ */

console.log(`\nIB session dates, from data/ib-calendar.json\n`);
console.log(`  cycle: ${CYCLE.id} — ${CYCLE.name}`);
for (const [id, e] of Object.entries(CYCLE.events || {})) {
  console.log(`    ${id.padEnd(26)} ${String(e.date ?? '—').padEnd(12)} ${e.basis}`);
}

console.log(`\n  ${matched.length} occurrence(s) matched on the claim:\n`);
for (const m of matched) console.log(`    ${m}`);

if (changes.length) {
  console.log(`\n  ${changes.length} change(s)${WRITE ? ' written' : ' — run with --write'}:\n`);
  for (const c of changes) console.log(`    ${c}`);
} else {
  console.log(`\n  Nothing to change: every occurrence already agrees with the canonical record.`);
}

if (leftAlone.length) {
  console.log(`\n  ${leftAlone.length} record(s) carry a canonical date and make no IB claim. Deliberately untouched:\n`);
  for (const l of leftAlone) console.log(`    ${l}`);
}

console.log(
  `\n  Prose is not migrated. A sentence describing results day is checked by ` +
    `scripts/test-ib-calendar.mjs and fixed by a person.\n`
);
