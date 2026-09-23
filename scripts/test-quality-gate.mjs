/**
 * Guards on the gate itself.
 *
 * The failure this prevents is not a broken check. It is a *working* check that
 * nothing runs — which is invisible in every way a person would normally
 * notice. `npm test` goes green, CI goes green, the guard file is right there
 * in `scripts/` with its tests passing when anyone runs it by hand, and the
 * architectural decision it enforces is simply no longer enforced.
 *
 * That is exactly what had happened. `test-floor.mjs`, `test-calendar.mjs`,
 * `test-jurisdictions.mjs` and `release-check.mjs` all passed, and none of them
 * was run by `npm test` or by deploy CI.
 *
 * So the assertions here are about wiring rather than behaviour:
 *
 *   - every `scripts/test-*.mjs` on disk is named by the manifest, so writing a
 *     guard and forgetting to register it is a failing test rather than a
 *     silent no-op;
 *   - `npm test` and deploy CI both go through the gate, so neither can drift
 *     from the other by editing one caller — the specific drift that produced
 *     two different sets of checks in the first place;
 *   - the checks the issue named are present by id, so a future tidy-up cannot
 *     quietly drop one.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { CHECKS, NETWORK_CHECKS, STAGES } from './lib/quality-gate.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');

let failures = 0;
const checkAsync = async (name, fn) => {
  try {
    await fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message}`);
  }
};

console.log('\nQuality gate wiring\n');

await checkAsync('every guard on disk is in the manifest', async () => {
  // Including this file. A wiring guard that the gate does not run is the
  // same hole it was written to close, one level up.
  const onDisk = (await fs.readdir(path.join(ROOT, 'scripts')))
    .filter((f) => /^test-.*\.mjs$/.test(f))
    .map((f) => `scripts/${f}`);
  const named = new Set(CHECKS.map((c) => c.script));
  const orphans = onDisk.filter((f) => !named.has(f));
  assert.deepEqual(
    orphans,
    [],
    `these guards exist and nothing runs them — add them to scripts/lib/quality-gate.mjs:\n          ${orphans.join('\n          ')}`
  );
});

await checkAsync('every check in the manifest exists on disk', async () => {
  const missing = [];
  for (const c of CHECKS) {
    try {
      await fs.access(path.join(ROOT, c.script));
    } catch {
      missing.push(`${c.id} → ${c.script}`);
    }
  }
  assert.deepEqual(missing, [], `the manifest names checks that are not there:\n          ${missing.join('\n          ')}`);
});

await checkAsync('the checks this was filed over cannot be dropped', async () => {
  // Named by id rather than counted, so the assertion still means something
  // after the list grows.
  const required = [
    'calendar', 'floor', 'jurisdictions', 'release',
    'probes', 'sourcing', 'credentials', 'map', 'images',
    'validate', 'build', 'check',
  ];
  const have = new Set(CHECKS.map((c) => c.id));
  const gone = required.filter((id) => !have.has(id));
  assert.deepEqual(gone, [], `the gate no longer runs: ${gone.join(', ')}`);
});

await checkAsync('npm test goes through the gate', async () => {
  const pkg = JSON.parse(await fs.readFile(path.join(ROOT, 'package.json'), 'utf8'));
  assert.match(
    pkg.scripts.test,
    /scripts\/qa\.mjs/,
    'package.json "test" must delegate to the gate rather than listing checks itself — that list is what drifted from CI'
  );
});

await checkAsync('deploy CI goes through the same gate', async () => {
  const wf = await fs.readFile(path.join(ROOT, '.github', 'workflows', 'deploy.yml'), 'utf8');
  assert.match(wf, /scripts\/qa\.mjs/, 'the deploy workflow must invoke the gate');

  // The specific regression: CI reconstructing its own list of scripts.
  const reconstructed = [...wf.matchAll(/node (scripts\/[\w-]+\.mjs)/g)]
    .map((m) => m[1])
    .filter((s) => s !== 'scripts/qa.mjs');
  assert.deepEqual(
    reconstructed,
    [],
    `the deploy workflow is naming individual checks again, which is how it drifted from npm test:\n          ${reconstructed.join('\n          ')}`
  );
});

await checkAsync('every check declares a stage the runner knows', async () => {
  const bad = CHECKS.filter((c) => !STAGES.includes(c.stage)).map((c) => `${c.id} → "${c.stage}"`);
  assert.deepEqual(bad, [], `unknown stage(s): ${bad.join(', ')}`);
});

await checkAsync('check ids are unique', async () => {
  const ids = CHECKS.map((c) => c.id);
  const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  assert.deepEqual(dupes, [], `duplicate check id(s): ${dupes.join(', ')} — --only would be ambiguous`);
});

await checkAsync('the network checks are excluded on purpose, not by omission', async () => {
  // A check that needs the network must be named somewhere, so that "not in the
  // gate" is a decision on the record. A gate that is red because a university
  // was rebooting teaches people to ignore it.
  assert.ok(NETWORK_CHECKS.length > 0, 'NETWORK_CHECKS should name what is deliberately left out');
  const gated = new Set(CHECKS.map((c) => c.script));
  for (const n of NETWORK_CHECKS) {
    assert.ok(n.command && n.what, 'each excluded check needs a command and a reason a reader can act on');
    assert.ok(!gated.has(n.command), `${n.command} is both excluded and in the gate`);
  }
});

console.log(failures ? `\n${failures} failing\n` : '\nAll quality gate wiring guards pass\n');
process.exit(failures ? 1 : 0);
