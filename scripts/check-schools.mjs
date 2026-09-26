/**
 * Checks the school records in data/schools/ (schemas/school.schema.json).
 *
 *   node scripts/check-schools.mjs                 # every record
 *   node scripts/check-schools.mjs fi-uh fi-aalto  # just these
 *
 * Beyond the schema: the key must name an institution in data/countries/, the
 * scope must agree with the programme list, no link the page hands a
 * student on to may be a homepage (issue #43), and a programme's `needs` must
 * name real IB subjects (data/ib-subjects.json) at a level each is offered at,
 * because its page names them from that catalogue. Exits non-zero on any failure.
 */
import fs from 'node:fs';
import path from 'node:path';
import { SchemaSet } from '../src/lib/validate-schema.mjs';
import { schoolKeys, isHomepage } from '../src/lib/schools.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'data', 'schools');

const set = new SchemaSet();
for (const f of ['common.schema.json', 'school.schema.json']) {
  set.add(f, JSON.parse(fs.readFileSync(path.join(ROOT, 'schemas', f), 'utf8')));
}

const known = schoolKeys(path.join(ROOT, 'data', 'countries'));
/* The IB subject catalogue: every id a `needs` entry may name, and its levels. */
const IB = new Map(
  JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'ib-subjects.json'), 'utf8')).subjects.map((x) => [x.id, x.levels || ['HL', 'SL']])
);

/** What is wrong with one programme's `needs`, as sentences. */
function needsProblems(needs = [], where = 'needs') {
  const out = [];
  for (const [j, n] of (needs || []).entries()) {
    for (const option of n.anyOf || []) {
      // "<id>" at the need's level, or "<id>@HL" / "<id>@SL" at that level alone.
      const [id, at] = String(option).split('@');
      const level = at || n.level;
      const levels = IB.get(id);
      if (!levels) out.push(`${where}[${j}]: "${id}" is not an IB subject in data/ib-subjects.json`);
      else if (at !== undefined && !['HL', 'SL'].includes(at)) out.push(`${where}[${j}]: "${option}" names no IB level (use @HL or @SL)`);
      else if (level && level !== 'any' && !levels.includes(level)) {
        out.push(`${where}[${j}]: "${id}" is not offered at ${level} (only ${levels.join(', ')})`);
      }
    }
  }
  return out;
}

/* Self-test: the needs rule must refuse an invented id and a level a subject
   is not offered at, and pass a real one. */
{
  const abInitio = [...IB].find(([, l]) => !l.includes('HL'))?.[0];
  const bad = [
    needsProblems([{ anyOf: ['not-a-subject'], level: 'HL' }]).length === 1,
    !abInitio || needsProblems([{ anyOf: [abInitio], level: 'HL' }]).length === 1,
    needsProblems([{ anyOf: [[...IB.keys()][0]], level: 'any' }]).length === 0,
    needsProblems([{ anyOf: ['not-a-subject@HL'], level: 'SL' }]).length === 1,
    !abInitio || needsProblems([{ anyOf: [`${abInitio}@HL`], level: 'SL' }]).length === 1,
    needsProblems([{ anyOf: [`${[...IB.keys()][0]}@XL`], level: 'SL' }]).length === 1,
    needsProblems([{ anyOf: [[...IB.keys()][0], `${[...IB.keys()][0]}@HL`], level: 'SL' }]).length === 0,
  ].some((ok) => !ok);
  if (bad) {
    console.log('✗ self-test: the needs rule cannot tell a catalogue subject from an invented one');
    process.exit(1);
  }
}
const only = process.argv.slice(2).map((a) => a.replace(/\.json$/, ''));
const files = fs.existsSync(DIR)
  ? fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && (!only.length || only.includes(f.slice(0, -5))))
  : [];

let failures = 0;
const counts = { listed: 0, catalogue: 0, none: 0, programmes: 0 };

for (const f of files.sort()) {
  const key = f.slice(0, -5);
  const problems = [];
  let rec;
  try {
    rec = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  } catch (err) {
    problems.push(`not JSON: ${err.message}`);
  }

  if (rec) {
    problems.push(...set.validate(rec, 'school.schema.json').map((e) => (typeof e === 'string' ? e : `${e.path}: ${e.message}`)));
    const inst = known.get(key);
    if (rec.institution !== key) problems.push(`institution "${rec.institution}" does not match the file name`);
    if (!inst) problems.push(`no institution with key "${key}" in data/countries/`);

    const progs = rec.programmes || [];
    if (rec.scope === 'listed' && !progs.length) problems.push('scope is "listed" but no programmes are listed');
    if (rec.scope !== 'listed' && progs.length) problems.push(`scope is "${rec.scope}" but programmes are listed`);

    const home = inst?.website;
    if (rec.handoff?.url && isHomepage(rec.handoff.url, home)) problems.push(`handoff is a homepage: ${rec.handoff.url}`);
    const seen = new Set();
    for (const [i, p] of progs.entries()) {
      if (isHomepage(p.url, home)) problems.push(`programmes[${i}] "${p.name}" links to a homepage`);
      if (seen.has(p.url)) problems.push(`programmes[${i}] "${p.name}" shares its link with another programme`);
      problems.push(...needsProblems(p.needs, `programmes[${i}] "${p.name}" needs`));
      seen.add(p.url);
    }
    for (const [i, d] of (rec.dates || []).entries()) {
      if (d.date < '2026-01-01' || d.date > '2027-12-31') problems.push(`dates[${i}] ${d.date} is outside the 2027 cycle`);
    }

    counts[rec.scope] = (counts[rec.scope] || 0) + 1;
    counts.programmes += progs.length;
  }

  if (problems.length) {
    failures++;
    console.log(`✗ data/schools/${f}`);
    for (const p of problems) console.log(`    ${p}`);
  }
}

console.log(
  `${files.length} school records · ${counts.listed} listed (${counts.programmes} programmes) · ` +
    `${counts.catalogue} catalogue · ${counts.none} none · ${failures} failing · ` +
    `${known.size - (only.length ? 0 : files.length)} of ${known.size} institutions without one`
);
process.exit(failures ? 1 : 0);
