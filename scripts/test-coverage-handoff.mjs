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

const ROOT = path.resolve(import.meta.dirname, '..');
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

console.log(`  ok    ${code} handoff keeps research, programme detail, programme photos, institution photos and the remaining queue separate`);
