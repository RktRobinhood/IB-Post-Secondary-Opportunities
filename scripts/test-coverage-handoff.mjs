/**
 * A country batch must end with four separate parity facts, not a vague
 * "country complete" claim or a blended Danish-standard percentage (#60).
 * This protects the handoff interface; it deliberately does not require any
 * country to reach a coverage threshold.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { load, picture } from '../src/lib/data.mjs';
import { institutionPicture } from '../src/pages/programme-facts.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const coverageFile = path.join(ROOT, 'docs/research/schools/COVERAGE.md');
const coverageBefore = fs.readFileSync(coverageFile, 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'research', 'schools', 'manifest.json'), 'utf8'));
const code = Object.keys(manifest).sort()[0];
const run = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'coverage-report.mjs'), '--handoff', code, '--stdout'], {
  cwd: ROOT,
  encoding: 'utf8',
});

assert.equal(run.status, 0, run.stderr || 'coverage handoff command failed');
const text = run.stdout;
for (const label of ['Research coverage', 'Programme detail', 'Programme photos', 'Institution photos', 'Queue']) {
  assert.match(text, new RegExp(`^- ${label}:`, 'm'), `handoff omits its ${label.toLowerCase()} line`);
}
assert.doesNotMatch(text, /Danish.standard/i, 'the handoff must not collapse parity into one Danish-standard score');

const fractions = [...text.matchAll(/\*\*(\d+)\/(\d+) (?:institutions|listed paths)\*\*/g)];
assert.equal(fractions.length, 4, 'each parity layer must expose its numerator and denominator');
for (const [, have, total] of fractions) {
  assert.ok(Number(have) <= Number(total), `coverage cannot exceed its total (${have}/${total})`);
}

const unknown = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'coverage-report.mjs'), '--handoff', 'not-a-country', '--stdout'], {
  cwd: ROOT,
  encoding: 'utf8',
});
assert.equal(unknown.status, 2, 'an unknown country code should fail clearly');
assert.match(unknown.stderr, /Unknown country code/, 'an unknown code should explain what is wrong');

const missing = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'coverage-report.mjs'), '--handoff', '--stdout'], {
  cwd: ROOT,
  encoding: 'utf8',
});
assert.equal(missing.status, 2, 'a missing country code should not silently write the full report');
assert.match(missing.stderr, /Missing country code/, 'a missing code should show an example');

/* Cyprus was added after the old assignment manifest. A real current country
   must still have a handoff; the assignment snapshot is not catalogue scope. */
const cyprus = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'coverage-report.mjs'), '--handoff', 'cy', '--stdout'], {
  cwd: ROOT,
  encoding: 'utf8',
});
assert.equal(cyprus.status, 0, cyprus.stderr || 'current Cyprus profile omitted from coverage');
assert.match(cyprus.stdout, /Parity handoff: Cyprus/);

// Denmark has no country-profile file. Its real pages, and the Dutch canonical
// pages alongside the remaining profile cohort, must still get honest handoffs.
const site = await load();
for (const cc of ['dk', 'nl']) {
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts/coverage-report.mjs'), '--handoff', cc, '--stdout'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || `canonical ${cc} handoff failed`);
  assert.match(result.stdout, /— canonical model/);
  assert.match(result.stdout, /source\/readiness counts, not evidence verification or country completeness/);
  assert.match(result.stdout, /separate cohort/);
  assert.doesNotMatch(result.stdout, /have both `about` and `selection`/, 'canonical detail must describe its own fields');
  for (const label of ['Research coverage', 'Programme detail', 'Programme photos', 'Institution photos', 'Queue']) {
    assert.match(result.stdout, new RegExp(`^- ${label}:`, 'm'));
  }
  const layers = [...result.stdout.matchAll(/\*\*(\d+)\/(\d+) (?:institutions|listed paths)\*\*/g)]
    .map(([, have, total]) => [Number(have), Number(total)]);
  assert.equal(layers.length, 4);
  const institutions = site.institutionCatalogue.in(cc);
  const paths = institutions.flatMap((i) => i.programmes);
  assert.deepEqual(layers[0], [institutions.length, institutions.length], 'research inventory uses canonical institutions, without profile twins');
  assert.equal(layers[1][1], paths.length, 'detail denominator follows actual rendered paths, not source programme files or card families');
  const detailedPaths = paths.filter((p) => p.summary?.trim() && (p.selectionFactors?.length || p.cutoff?.ibPoints || p.restrictedAdmission === false));
  assert.equal(layers[1][0], detailedPaths.length, 'detail requires a rendered explanation of selection, ranking or open entry');
  const genericWarnings = paths.filter((p) => p.summary?.trim() && p.restrictedAdmission === true && !p.selectionFactors?.length && !p.cutoff?.ibPoints);
  if (genericWarnings.length) assert.ok(layers[1][0] < paths.filter((p) => p.summary?.trim()).length, 'a bare limited-places warning cannot establish complete programme detail');
  assert.deepEqual(layers[2], [paths.filter((p) => p.backdrop?.src ? p.backdrop.scope?.startsWith('programme:') : Boolean(picture(site, p.id))).length, paths.length]);
  assert.deepEqual(layers[3], [institutions.filter((i) => institutionPicture(site, i)).length, institutions.length]);
  assert.ok(paths.some((p) => p.backdrop?.scope?.startsWith('field:')), 'fixture includes published generic field backdrops');
  assert.ok(layers[2][0] < paths.filter((p) => p.backdrop?.src || picture(site, p.id)).length, 'generic field photography must not become an own-photo count');
  for (const [have, total] of layers) assert.ok(have <= total);
}
const overall = spawnSync(process.execPath, [path.join(ROOT, 'scripts/coverage-report.mjs'), '--stdout'], { cwd: ROOT, encoding: 'utf8' });
assert.equal(overall.status, 0, overall.stderr);
assert.match(overall.stdout, /Canonical institutions .* are not counted here/);
assert.doesNotMatch(overall.stdout, /\| Denmark \(dk\) \|/, 'legacy overall tables must not silently gain canonical countries');
assert.equal(fs.readFileSync(coverageFile, 'utf8'), coverageBefore, 'stdout handoffs must never rewrite COVERAGE.md');

console.log(`  ok    ${code}, dk and nl handoffs keep canonical/profile cohorts, research, detail, own photos, institution photos and the queue separate`);
