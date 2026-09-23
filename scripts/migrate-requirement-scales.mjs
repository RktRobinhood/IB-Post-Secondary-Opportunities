/**
 * Move every subject requirement onto a named scale.
 *
 *   node scripts/migrate-requirement-scales.mjs [--dry-run]
 *
 * Every Opportunity record in this repository was written as
 * `kind: "ib-subject"` carrying `subject: "Mathematics", level: "A"`. That is
 * not an IB subject requirement: the IB has no A level, and "Mathematics A" is
 * a sentence in one country's admissions vocabulary. The label was wrong, and
 * because it was wrong the requirement model looked as though it could already
 * express any country's rules when it could only express one.
 *
 * So: a requirement whose `level` is a level on some Recognition Scheme's
 * subject scale becomes `kind: "local-equivalency"` and names that scale in
 * `levelScale`. The scale is found from the Opportunity's own `destination`,
 * through the Recognition Scheme recorded for it — nothing here knows any
 * country's name, and adding a second Destination with a scheme needs no edit
 * to this file.
 *
 * This exists as a script and not as thirty-seven hand edits because a hand
 * migration hides which records it got wrong. Re-running it is safe: a
 * requirement already carrying `levelScale` is left alone.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DRY = process.argv.includes('--dry-run');

/* --- what scales exist, and which Destination publishes each --------------- */

const schemes = [];
for (const file of (await fs.readdir(path.join(ROOT, 'data', 'recognition'))).filter((f) => f.endsWith('.json'))) {
  schemes.push(JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'recognition', file), 'utf8')));
}

/** destination id -> { scale, levels:Set, gradeScale } */
const byDestination = new Map();
for (const s of schemes) {
  if (!s.destination || !s.subjectScale?.id) continue;
  byDestination.set(s.destination, {
    scale: s.subjectScale.id,
    levels: new Set((s.subjectScale.levels || []).map((l) => l.code)),
    gradeScale: s.gradeScale?.id || null,
    name: s.name,
  });
}

if (!byDestination.size) {
  console.error('No Recognition Schemes found in data/recognition — nothing to migrate onto.');
  process.exit(1);
}

/* --- the rewrite ----------------------------------------------------------- */

/** Key order, so a migrated record reads like a hand-written one. */
const ORDER = [
  'id', 'kind', 'mandatory', 'label', 'officialWording',
  'ibSubject', 'ibLevel', 'subject', 'levelScale', 'level', 'minGrade', 'gradeScale', 'minPoints',
  'operator', 'alternatives', 'applicability', 'satisfiedBy', 'preparationActions', 'note', 'evidence',
];

function order(rule) {
  const out = {};
  for (const key of ORDER) if (key in rule) out[key] = rule[key];
  for (const key of Object.keys(rule)) if (!(key in out)) out[key] = rule[key];
  return out;
}

const report = { moved: 0, alreadyScaled: 0, leftAlone: [], files: 0 };

function migrateRule(rule, scheme, at) {
  const next = { ...rule };

  if (Array.isArray(rule.alternatives)) {
    next.alternatives = rule.alternatives.map((group) => group.map((r) => migrateRule(r, scheme, at)));
  }

  if (rule.kind !== 'ib-subject') return order(next);
  if (rule.levelScale) { report.alreadyScaled++; return order(next); }

  // An `ib-subject` rule that really is in IB terms already says so.
  if (rule.ibSubject || rule.ibLevel) return order(next);

  if (!rule.subject || !rule.level) {
    report.leftAlone.push(`${at} ${rule.id}: no subject or level to place on a scale`);
    return order(next);
  }
  if (!scheme) {
    report.leftAlone.push(`${at} ${rule.id}: "${rule.subject} ${rule.level}" — no Recognition Scheme is recorded for this Destination`);
    return order(next);
  }
  if (!scheme.levels.has(rule.level)) {
    report.leftAlone.push(`${at} ${rule.id}: level "${rule.level}" is not on ${scheme.scale}`);
    return order(next);
  }

  next.kind = 'local-equivalency';
  next.levelScale = scheme.scale;
  if (next.minGrade != null && !next.gradeScale && scheme.gradeScale) next.gradeScale = scheme.gradeScale;
  report.moved++;
  return order(next);
}

const dir = path.join(ROOT, 'data', 'opportunities');
for (const file of (await fs.readdir(dir)).filter((f) => f.endsWith('.json'))) {
  const full = path.join(dir, file);
  const before = await fs.readFile(full, 'utf8');
  const record = JSON.parse(before);
  const scheme = byDestination.get(record.destination) || null;

  record.requirements = (record.requirements || []).map((r) => migrateRule(r, scheme, file));

  const after = JSON.stringify(record, null, 2) + '\n';
  if (after !== before) {
    report.files++;
    if (!DRY) await fs.writeFile(full, after, 'utf8');
  }
}

console.log('');
console.log(`${report.moved} requirement(s) moved onto a named scale across ${report.files} file(s)${DRY ? ' (dry run)' : ''}.`);
if (report.alreadyScaled) console.log(`${report.alreadyScaled} already carried a scale and were left as they were.`);
if (report.leftAlone.length) {
  console.log(`\n${report.leftAlone.length} requirement(s) this migration could not place — read every one:`);
  for (const line of report.leftAlone) console.log(`  ! ${line}`);
  process.exitCode = 1;
}
console.log('');
