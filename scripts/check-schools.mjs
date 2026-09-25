/**
 * Checks the school records in data/schools/ (schemas/school.schema.json).
 *
 *   node scripts/check-schools.mjs                 # every record
 *   node scripts/check-schools.mjs fi-uh fi-aalto  # just these
 *
 * Beyond the schema: the key must name an institution in data/countries/, the
 * scope must agree with the programme list, and no link the page hands a
 * student on to may be a homepage (issue #43). Exits non-zero on any failure.
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
