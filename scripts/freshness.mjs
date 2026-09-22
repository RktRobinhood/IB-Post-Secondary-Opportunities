/**
 * Reports what in the dataset can no longer be trusted, and why.
 *
 *   node scripts/freshness.mjs             # the standing report
 *   node scripts/freshness.mjs --rollover  # every date-bound claim for the next intake
 *   node scripts/freshness.mjs --json      # machine-readable, for CI
 *
 * Four categories, kept apart because they need different responses:
 *   stale        — read once, but past the review interval for its claim type
 *   incomplete   — a consequential field with no evidence behind it at all
 *   unavailable  — the source could not be reached when last checked
 *   conflicting  — two sources disagree and nobody has resolved it
 *
 * Exits non-zero only when something is *conflicting* or *unavailable*, because
 * those are wrong now. Stale and incomplete are debt, and failing the build on
 * debt just teaches people to ignore the build.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'data');
const ROLLOVER = process.argv.includes('--rollover');
const AS_JSON = process.argv.includes('--json');

const TODAY = new Date();
const today = TODAY.toISOString().slice(0, 10);

async function readJson(p, fallback = null) {
  try { return JSON.parse(await fs.readFile(p, 'utf8')); } catch { return fallback; }
}

async function readDir(dir) {
  try {
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json')).sort();
    const out = [];
    for (const f of files) {
      const j = await readJson(path.join(dir, f));
      if (j) out.push({ file: `${path.basename(dir)}/${f}`, value: j });
    }
    return out;
  } catch {
    return [];
  }
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function claimTypeFor(policy, fields) {
  for (const interval of policy.intervals) {
    if (interval.matches.some((m) => fields.some((f) => f.includes(m)))) return interval;
  }
  return { claimType: 'other', reviewEveryDays: policy.defaultReviewEveryDays, hardStop: null };
}

async function main() {
  const policy = await readJson(path.join(DATA, 'freshness-policy.json'));
  if (!policy) {
    console.error('data/freshness-policy.json is missing.');
    process.exit(1);
  }

  /* Evidence */
  const evidenceFiles = await readDir(path.join(DATA, 'evidence'));
  const evidence = new Map();
  for (const { value } of evidenceFiles) {
    for (const ev of Array.isArray(value) ? value : Object.values(value)) {
      if (ev?.id) evidence.set(ev.id, ev);
    }
  }

  const report = { stale: [], incomplete: [], unavailable: [], conflicting: [], fresh: 0 };

  for (const ev of evidence.values()) {
    const fields = (ev.supports || []).map((s) => s.field || '');
    const interval = claimTypeFor(policy, fields);
    const age = ev.retrievedAt ? daysBetween(ev.retrievedAt, today) : null;

    if ((ev.conflictsWith || []).length) {
      report.conflicting.push({
        id: ev.id,
        claimType: interval.claimType,
        publisher: ev.publisher,
        with: ev.conflictsWith,
        note: ev.interpretation || null,
      });
      continue;
    }
    if (ev.verificationState === 'unavailable') {
      report.unavailable.push({ id: ev.id, claimType: interval.claimType, url: ev.sourceUrl, publisher: ev.publisher });
      continue;
    }
    if (ev.verificationState === 'superseded') {
      report.stale.push({ id: ev.id, claimType: interval.claimType, reason: 'superseded and not replaced', age });
      continue;
    }

    const pastReviewBy = ev.meta?.reviewBy && ev.meta.reviewBy < today;
    const pastInterval = age !== null && age > interval.reviewEveryDays;
    if (pastReviewBy || pastInterval) {
      report.stale.push({
        id: ev.id,
        claimType: interval.claimType,
        reason: pastReviewBy ? `review date ${ev.meta.reviewBy} has passed` : `${age} days old, interval is ${interval.reviewEveryDays}`,
        age,
        url: ev.sourceUrl,
      });
      continue;
    }
    report.fresh++;
  }

  /* Consequential fields with no evidence at all */
  const opportunities = await readDir(path.join(DATA, 'opportunities'));
  for (const { file, value } of opportunities) {
    if (!(value.evidence || []).length) {
      report.incomplete.push({ where: file, field: 'evidence', what: 'the Opportunity as a whole has no source' });
    }
    for (const r of value.requirements || []) {
      if (!(r.evidence || []).length) {
        report.incomplete.push({ where: file, field: `requirements.${r.id}`, what: `"${r.label || r.kind}" has no source` });
      }
    }
    for (const c of value.cost || []) {
      if (!(c.evidence || []).length) {
        report.incomplete.push({ where: file, field: `cost.${c.applicantGroup}`, what: 'a cost with no source' });
      }
      if (c.tuition && !c.priceYear) {
        report.incomplete.push({ where: file, field: `cost.${c.applicantGroup}`, what: 'a tuition figure with no academic year — unusable' });
      }
    }
  }

  const destinations = await readDir(path.join(DATA, 'destinations'));
  for (const { file, value } of destinations) {
    if (value.ibRecognition && !(value.ibRecognition.evidence || []).length) {
      report.incomplete.push({ where: file, field: 'ibRecognition', what: 'IB recognition rules with no source' });
    }
  }

  /* Country profiles that have not migrated still need a freshness view. */
  const countries = await readDir(path.join(DATA, 'countries'));
  for (const { file, value } of countries) {
    if (!value.dataAsOf) {
      report.incomplete.push({ where: `countries/${path.basename(file)}`, field: 'dataAsOf', what: 'no date stamp at all' });
    } else if (daysBetween(value.dataAsOf, today) > policy.defaultReviewEveryDays) {
      report.stale.push({
        id: file,
        claimType: 'country-profile',
        reason: `${daysBetween(value.dataAsOf, today)} days since it was checked`,
      });
    }
    if (!(value.sources || []).length) {
      report.incomplete.push({ where: file, field: 'sources', what: 'no sources listed' });
    }
  }

  /* Provisional dates — inherited from a previous cycle and not yet confirmed. */
  const routes = await readDir(path.join(DATA, 'application-routes'));
  const provisional = [];
  for (const { file, value } of routes) {
    for (const m of value.milestones || []) {
      if (m.provisional) {
        provisional.push({ where: file, id: m.id, label: m.label, date: m.date, consequence: m.consequence });
      }
    }
  }

  /* --- rollover mode ------------------------------------------------------- */

  if (ROLLOVER) {
    const dateBound = [];
    for (const { file, value } of routes) {
      for (const m of value.milestones || []) dateBound.push({ where: file, what: m.label, date: m.date || '—', kind: 'milestone' });
      for (const r of value.rounds || []) dateBound.push({ where: file, what: r.label, date: r.closes || '—', kind: 'round' });
    }
    for (const { file, value } of opportunities) {
      if (value.intake !== policy.rollover.nextIntake) {
        dateBound.push({ where: file, what: `intake ${value.intake}`, date: value.intake, kind: 'intake' });
      }
    }
    for (const { file, value } of countries) {
      for (const d of value.application?.deadlines || []) {
        dateBound.push({ where: `countries/${path.basename(file)}`, what: d.label, date: `${d.date || '—'} ${d.year || ''}`.trim(), kind: 'country-deadline' });
      }
    }

    if (AS_JSON) {
      console.log(JSON.stringify({ rollover: policy.rollover, dateBound, provisional }, null, 2));
      return;
    }

    console.log(`\nRollover: ${policy.rollover.currentIntake} → ${policy.rollover.nextIntake}\n`);
    console.log(`${dateBound.length} date-bound claims need re-verification:\n`);
    const byFile = new Map();
    for (const d of dateBound) {
      if (!byFile.has(d.where)) byFile.set(d.where, []);
      byFile.get(d.where).push(d);
    }
    for (const [where, items] of byFile) {
      console.log(`  ${where}`);
      for (const i of items) console.log(`      ${String(i.date).padEnd(26)} ${i.what}`);
    }
    console.log(`\nChecklist:`);
    policy.rollover.steps.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
    console.log('');
    return;
  }

  /* --- standing report ----------------------------------------------------- */

  if (AS_JSON) {
    console.log(JSON.stringify({ ...report, provisional, checkedAt: today }, null, 2));
    return;
  }

  const total = evidence.size;
  console.log(`\nFreshness — ${total} evidence records, checked ${today}\n`);
  console.log(`  fresh        ${String(report.fresh).padStart(4)}`);
  console.log(`  stale        ${String(report.stale.length).padStart(4)}`);
  console.log(`  incomplete   ${String(report.incomplete.length).padStart(4)}`);
  console.log(`  unavailable  ${String(report.unavailable.length).padStart(4)}`);
  console.log(`  conflicting  ${String(report.conflicting.length).padStart(4)}`);
  console.log(`  provisional dates ${String(provisional.length).padStart(3)}\n`);

  const show = (title, items, fmt) => {
    if (!items.length) return;
    console.log(`${title}:`);
    for (const i of items.slice(0, 15)) console.log(`  · ${fmt(i)}`);
    if (items.length > 15) console.log(`  … and ${items.length - 15} more`);
    console.log('');
  };

  show('Conflicting — a person must resolve these before the claim is shown', report.conflicting,
    (i) => `${i.id} (${i.claimType}) conflicts with ${i.with.join(', ')}`);
  show('Unavailable — the source could not be reached', report.unavailable,
    (i) => `${i.id} — ${i.url}`);
  show('Stale — past its review interval', report.stale,
    (i) => `${i.id} (${i.claimType}) — ${i.reason}`);
  show('Incomplete — a consequential field with nothing behind it', report.incomplete,
    (i) => `${i.where} → ${i.field}: ${i.what}`);
  show('Provisional dates — inherited from a previous cycle, not yet confirmed', provisional,
    (i) => `${i.where} → ${i.label} (${i.date}, ${i.consequence})`);

  const hardStops = policy.intervals.filter((i) => i.hardStop);
  if (hardStops.length) {
    console.log('Hard stops that no interval can override:');
    for (const h of hardStops) console.log(`  · ${h.claimType}: ${h.hardStop}`);
    console.log('');
  }

  if (report.conflicting.length || report.unavailable.length) {
    console.log('Failing: conflicting or unavailable evidence is wrong now, not merely old.\n');
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
