/** Coverage handoffs use the same school inventory for every country. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { load } from '../src/lib/data.mjs';
import { pagedProgrammes } from '../src/lib/schools.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const coverageFile = path.join(ROOT, '.cache/coverage.md');
const before = fs.existsSync(coverageFile) ? fs.readFileSync(coverageFile, 'utf8') : null;
const run = (...args) => spawnSync(process.execPath, ['scripts/coverage-report.mjs', ...args, '--stdout'], { cwd: ROOT, encoding: 'utf8' });
const site = await load();
for (const code of ['dk', 'nl', 'cy']) {
  const country = site.destinations.find((c) => c.code === code);
  assert.ok(country?.institutions.length, `${code} has school records to report`);
  const result = run('--handoff', code);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, new RegExp(`Country handoff: ${country.name}`));
  for (const label of ['Research coverage', 'Programme detail', 'Programme photos', 'Institution photos', 'Queue']) assert.match(result.stdout, new RegExp(`^- ${label}:`, 'm'));
  const layers = [...result.stdout.matchAll(/\*\*(\d+)\/(\d+) (?:institutions|listed paths)\*\*/g)].map(([, have, total]) => [Number(have), Number(total)]);
  assert.equal(layers.length, 4, 'each coverage layer exposes its numerator and denominator');
  const schools = country.institutions;
  const programmes = schools.flatMap((i) => pagedProgrammes(i.school));
  assert.deepEqual(layers[0], [schools.filter((i) => i.school).length, schools.length], 'school records determine coverage without separate cohorts');
  assert.equal(layers[1][1], programmes.length, 'detail denominator follows every listed programme path');
  assert.equal(layers[2][1], programmes.length, 'own-photo denominator follows the same paths');
  assert.equal(layers[3][1], schools.length, 'school-photo denominator includes the whole inventory');
  for (const [have, total] of layers) assert.ok(have <= total);
  assert.doesNotMatch(result.stdout, /canonical|separate cohort|Danish.standard/i);
}
const overall = run();
assert.equal(overall.status, 0, overall.stderr);
for (const country of site.destinations.filter((c) => c.institutions?.length)) assert.ok(overall.stdout.includes(`| ${country.name} (${country.code}) |`), `${country.name} appears in overall coverage`);
const unknown = run('--handoff', 'not-a-country');
assert.equal(unknown.status, 2);
assert.match(unknown.stderr, /Unknown country code/);
const missing = run('--handoff');
assert.equal(missing.status, 2);
assert.match(missing.stderr, /Missing country code/);
assert.equal(fs.existsSync(coverageFile) ? fs.readFileSync(coverageFile, 'utf8') : null, before, 'stdout reports must not rewrite the cached report');
console.log('  ok    country coverage uses one school inventory and separates detail, own photos and institution photos');
