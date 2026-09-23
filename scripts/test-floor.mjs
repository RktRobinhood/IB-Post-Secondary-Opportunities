/**
 * Holds every published Destination to the publication floor, and prints the
 * outstanding work for the ones still being brought up to it.
 *
 *   node scripts/test-floor.mjs            # guard: fail if a published one is below
 *   node scripts/test-floor.mjs --report   # the work list, worst first
 *
 * The guard only fails Destinations that have a canonical record in
 * `data/destinations`. Writing that record is the act of publishing, so it is
 * also the moment the rest of the floor starts being enforced. A country with
 * only a profile is an outline, is labelled as one on its page, and is not a
 * failure — it is the queue.
 */
import { load } from '../src/lib/data.mjs';
import { assessAll, FLOOR_CHECKS } from '../src/lib/publication-floor.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const REPORT = process.argv.includes('--report');
const ROOT = path.resolve(import.meta.dirname, '..');

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

const site = await load();
const results = assessAll(site.countries, site.graph);
const published = results.filter((r) => r.published);
const queue = results.filter((r) => !r.published);

/* --- The guard ------------------------------------------------------------ */

console.log('\nPublication floor\n');

for (const r of published) {
  check(`${r.name} meets the floor`, () => {
    if (r.met) return;
    const lines = r.missing.map((m) => `${m.id}: ${m.detail}`).join('\n          ');
    throw new Error(`${r.missing.length} checks below the floor\n          ${lines}`);
  });
}

/* --- The floor is universal ----------------------------------------------- */

/* The checks decide whether a record is good enough, so a check that knew the
   name of a country could quietly hold one Destination to a different standard
   from the rest. Reading the file back is crude and it is also the only thing
   that actually stops it. */
check('no floor check branches on a country or institution name', async () => {
  const src = await fs.readFile(path.join(ROOT, 'src', 'lib', 'publication-floor.mjs'), 'utf8');
  const body = src.slice(src.indexOf('export const FLOOR_CHECKS'));
  const code = body.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const codes = site.countries.map((c) => c.code);
  const offenders = codes.filter((c) => new RegExp(`['"\`]${c}['"\`]`).test(code));
  if (offenders.length) throw new Error(`country codes appear in the checks: ${offenders.join(', ')}`);
});

check('every check explains what a reader loses when it fails', () => {
  for (const c of FLOOR_CHECKS) {
    if (!c.why || c.why.length < 60) throw new Error(`${c.id} has no useful "why"`);
    if (!c.title) throw new Error(`${c.id} has no title`);
  }
});

/* --- The work list -------------------------------------------------------- */

if (REPORT) {
  console.log(`\n\nPublished — held to the floor (${published.length})\n`);
  for (const r of published) {
    console.log(`  ${r.met ? '✓' : '✗'} ${r.name}`);
    for (const c of r.checks) console.log(`      ${c.ok ? '·' : '!'} ${c.id.padEnd(13)} ${c.detail}`);
  }

  console.log(`\n\nThe queue — outlines, worst first (${queue.length})\n`);
  const worstFirst = [...queue].sort((a, b) => b.missing.length - a.missing.length || a.code.localeCompare(b.code));
  for (const r of worstFirst) {
    console.log(`  ${String(r.missing.length).padStart(2)} of ${FLOOR_CHECKS.length} below  ${r.name.padEnd(22)} ${r.missing.map((m) => m.id).join(' ')}`);
  }

  console.log(`\n  ${published.filter((r) => r.met).length} of ${results.length} Destinations meet the floor.\n`);
}

console.log(failures ? `\n${failures} failing\n` : `\nAll ${published.length} published Destinations meet the floor\n`);
process.exit(failures ? 1 : 0);
