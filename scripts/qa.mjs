/**
 * The quality gate. One command, and the only one a release has to trust.
 *
 *   node scripts/qa.mjs                 # everything
 *   node scripts/qa.mjs --stage data    # just the checks that read data/
 *   node scripts/qa.mjs --only floor,map
 *   node scripts/qa.mjs --list
 *
 * `npm test` and deploy CI both call this, so neither can drift from the other
 * by editing one caller. What runs is `scripts/lib/quality-gate.mjs`, which
 * explains why the list is a manifest rather than three hand-maintained copies.
 *
 * Failures are reported all together at the end as well as inline, because a
 * run of seventeen checks that prints a failure in the middle and then keeps
 * going is a run whose result you have to scroll back to find. By default the
 * gate keeps going after a failure — you want to know everything that is broken
 * in one run, not one thing per run — except when a stage cannot meaningfully
 * continue: if the build fails, nothing that reads `dist/` is asked to.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { CHECKS, NETWORK_CHECKS, STAGES } from './lib/quality-gate.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1];
};
const stage = arg('--stage');
const only = arg('--only')?.split(',').map((s) => s.trim()).filter(Boolean);

if (process.argv.includes('--list')) {
  for (const s of STAGES) {
    console.log(`\n${s}`);
    for (const c of CHECKS.filter((c) => c.stage === s)) {
      console.log(`  ${c.id.padEnd(14)} ${c.title}${c.advisory ? '  (advisory)' : ''}`);
    }
  }
  console.log('\nNot in the gate, because they need the network:');
  for (const n of NETWORK_CHECKS) console.log(`  ${n.command.padEnd(28)} ${n.what}`);
  console.log('');
  process.exit(0);
}

const selected = CHECKS.filter((c) => (!stage || c.stage === stage) && (!only || only.includes(c.id)));
if (!selected.length) {
  console.error(`No checks matched${stage ? ` --stage ${stage}` : ''}${only ? ` --only ${only.join(',')}` : ''}.`);
  process.exit(2);
}

const failed = [];
const advised = [];
let buildFailed = false;

console.log(`\nQuality gate — ${selected.length} check${selected.length === 1 ? '' : 's'}\n`);

for (const check of selected) {
  /* Nothing that reads dist/ can say anything true about a build that did not
     happen. Reporting "check: 123 pages missing" after a build failure is three
     more failures that all have one cause. */
  if (buildFailed && check.stage === 'built') {
    console.log(`  skip  ${check.id.padEnd(14)} ${check.title}  (the build failed)`);
    continue;
  }

  const started = Date.now();
  const run = spawnSync(process.execPath, [path.join(ROOT, check.script)], {
    cwd: ROOT,
    encoding: 'utf8',
    env: process.env,
  });
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  const ok = run.status === 0;

  if (ok) {
    console.log(`  ok    ${check.id.padEnd(14)} ${check.title}  ${secs}s`);
  } else if (check.advisory) {
    advised.push(check);
    console.log(`  note  ${check.id.padEnd(14)} ${check.title}  ${secs}s  (advisory)`);
  } else {
    failed.push({ check, run });
    console.log(`  FAIL  ${check.id.padEnd(14)} ${check.title}  ${secs}s`);
    if (check.id === 'build') buildFailed = true;
  }
}

if (failed.length) {
  console.log(`\n${'='.repeat(72)}`);
  console.log(`${failed.length} check${failed.length === 1 ? '' : 's'} failed. Output follows, worst first in run order.\n`);
  for (const { check, run } of failed) {
    console.log(`${'-'.repeat(72)}`);
    console.log(`${check.id} — ${check.title}`);
    console.log(`  ${check.script}\n`);
    const body = [run.stdout, run.stderr].filter(Boolean).join('\n').trimEnd();
    console.log(body || `(no output; exit ${run.status})`);
    console.log('');
  }
  console.log(`${'='.repeat(72)}`);
  console.log(`Failed: ${failed.map((f) => f.check.id).join(', ')}\n`);
  process.exit(1);
}

if (advised.length) console.log(`\n${advised.length} advisory check(s) reported something: ${advised.map((c) => c.id).join(', ')}`);
console.log(`\nAll ${selected.length} checks pass.\n`);
