import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { HourlyUniversities, orderedInstitutions, validDate } from './lib/hourly-universities.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TODAY = '2026-10-29';
const SHA = 'a'.repeat(40);
const countries = new Map(['dk', 'no', 'se', 'fi', 'is', 'de', 'fr', 'us'].map((code) => [code, { code, scope: code === 'us' ? 'worldwide' : 'europe' }]));
const row = (key, km, scope = null) => ({ institution_key: key, name: key, country_code: key.split('-')[0], approximate_distance_km: km, scope, model: 'canonical', structural_gaps: [] });
const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2)); };
const fixtures = [];
function fixture(rows = [row('dk-aau', 0), row('dk-second', 0), row('no-next', 200)]) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hourly-universities-test-'));
  fixtures.push(root);
  write(path.join(root, 'docs/research/imports/proximity-queue.json'), { institutions: rows });
  for (const [code, country] of countries) write(path.join(root, `data/countries/${code}.json`), country);
  return { root, worker: new HourlyUniversities(root, { today: TODAY }) };
}
const report = (key) => ({ institution_key: key, accepted: true, reviewer: 'Independent editorial review', evidence: ['https://official.example/admissions'], scores: { admissions: 8, imagery: 9, format: 8 }, validation: { fullGate: true, cleanRelease: true } });
function snapshot(worker) {
  return [fs.readFileSync(worker.stateFile, 'utf8'), fs.readFileSync(path.join(worker.lockDir, 'owner.json'), 'utf8'), fs.readdirSync(worker.lockDir).sort()];
}
function childReserve(root) {
  const source = `import { HourlyUniversities } from ${JSON.stringify(pathToFileURL(path.join(ROOT, 'scripts/lib/hourly-universities.mjs')).href)}; console.log(JSON.stringify(new HourlyUniversities(${JSON.stringify(root)}, { today: ${JSON.stringify(TODAY)} }).reserve()));`;
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--input-type=module', '-e', source], { encoding: 'utf8' });
    let out = '', err = '';
    child.stdout.on('data', (data) => out += data);
    child.stderr.on('data', (data) => err += data);
    child.on('error', reject);
    child.on('exit', (code) => { try { assert.equal(code, 0, err); resolve(JSON.parse(out)); } catch (error) { reject(error); } });
  });
}

try {
  const ordered = orderedInstitutions([row('us-close', 1), row('de-close', 2), row('is-far', 2000), row('se-near', 100), row('no-unknown', null), row('dk-z', 0), row('dk-a', 0), row('fr-far', 800)], countries);
  assert.deepEqual(ordered.map((item) => item.institution_key), ['dk-a', 'dk-z', 'se-near', 'is-far', 'no-unknown', 'de-close', 'fr-far', 'us-close']);
  assert.throws(() => orderedInstitutions([row('dk-a', 0), row('dk-a', 0)], countries), /duplicate/);
  assert.equal(validDate('2026-02-30'), false);
  assert.equal(validDate('2026-10-29'), true);

  const { root, worker } = fixture();
  assert.equal(worker.next().institution.institution_key, 'dk-aau');
  assert.equal(fs.existsSync(worker.stateFile), false, '--next must not create a ledger');
  assert.equal(fs.existsSync(path.join(root, '.cache')), false, '--next must not create cache directories');
  const reserved = worker.reserve();
  assert.equal(reserved.status, 'reserved');
  assert.equal(worker.next().status, 'needs-attention');
  assert.equal(worker.reserve().status, 'needs-attention');
  const reviewFile = 'docs/research/imports/review.json';
  write(path.join(root, reviewFile), report('dk-aau'));
  const before = snapshot(worker);
  const invalid = [
    {},
    { runId: reserved.run_id, state: 'complete' },
    { runId: 'wrong-run', state: 'complete', review: reviewFile, commit: SHA },
    { runId: reserved.run_id, state: 'complete', review: reviewFile },
    { runId: reserved.run_id, state: 'complete', review: reviewFile, commit: SHA },
    { runId: reserved.run_id, state: 'deferred', review: reviewFile, reason: 'Not published', nextCheckOn: TODAY },
    { runId: reserved.run_id, state: 'deferred', review: reviewFile, nextCheckOn: '2026-11-02' },
    { runId: reserved.run_id, state: 'failed', review: reviewFile },
  ];
  for (const options of invalid) {
    assert.throws(() => worker.finish(options));
    assert.deepEqual(snapshot(worker), before, 'invalid finish must preserve ledger and lock byte for byte');
  }
  const acceptedWorker = new HourlyUniversities(root, { today: TODAY, verifyCommit: (_root, sha) => { assert.equal(sha, SHA); return sha; } });
  write(path.join(root, reviewFile), { ...report('dk-aau'), accepted: false });
  assert.throws(() => acceptedWorker.finish({ runId: reserved.run_id, state: 'complete', review: reviewFile, commit: SHA }), /Review must/);
  assert.deepEqual(snapshot(worker), before);
  write(path.join(root, reviewFile), { ...report('dk-aau'), scores: { admissions: 8, imagery: 7, format: 8 } });
  assert.throws(() => acceptedWorker.finish({ runId: reserved.run_id, state: 'complete', review: reviewFile, commit: SHA }), /Review must/);
  assert.deepEqual(snapshot(worker), before);
  write(path.join(root, reviewFile), report('dk-aau'));
  assert.equal(acceptedWorker.finish({ runId: reserved.run_id, state: 'complete', review: reviewFile, commit: SHA }).status, 'complete');
  assert.equal(fs.existsSync(worker.lockDir), false);
  assert.equal(worker.next().institution.institution_key, 'dk-second', 'completed institution must be skipped');
  const second = worker.reserve();
  worker.finish({ runId: second.run_id, state: 'deferred', review: reviewFile, reason: '2027 rules not published', nextCheckOn: '2026-11-02' });
  assert.equal(worker.next().institution.institution_key, 'no-next', 'future deferral must be skipped');
  assert.equal(new HourlyUniversities(root, { today: '2026-11-02' }).next().institution.institution_key, 'dk-second', 'due recheck returns to geographic tier');
  assert.equal(worker.ledger().institutions['dk-second'].state, 'deferred', 'skipped is never complete');

  const exclusions = fixture([row('dk-excluded', 0, 'none'), row('no-next', 100)]);
  assert.equal(exclusions.worker.next().institution.institution_key, 'no-next', 'supported exclusion without date must not repeat');
  write(path.join(exclusions.root, 'docs/research/imports/queue.json'), { items: [{ institution_key: 'dk-excluded', open_items: [{ next_check_on: '2026-11-02' }] }] });
  assert.equal(exclusions.worker.next().institution.institution_key, 'no-next');
  assert.equal(new HourlyUniversities(exclusions.root, { today: '2026-11-02' }).next().institution.institution_key, 'dk-excluded');
  const discovery = fixture([row('dk-aau', 0)]);
  write(path.join(discovery.root, 'docs/research/imports/discovery-candidates.json'), { institutions: [
    { ...row('dk-aau', 0), name: 'Duplicate that must not overwrite canonical identity', model: 'discovery-candidate' },
    { ...row('dk-discovered', null), model: 'discovery-candidate' },
  ] });
  assert.equal(discovery.worker.next().institution.name, 'dk-aau');
  assert.equal(discovery.worker.next().queue_size, 2);
  assert.equal(discovery.worker.next().discovery_candidates, 1);
  const existing = discovery.worker.reserve();
  write(path.join(discovery.root, reviewFile), report('dk-aau'));
  discovery.worker.finish({ runId: existing.run_id, state: 'deferred', review: reviewFile, reason: 'Pending publication', nextCheckOn: '2026-11-02' });
  assert.match(discovery.worker.next().institution.action, /resolve-aliases-and-duplicates/);

  const race = fixture();
  const results = await Promise.all([childReserve(race.root), childReserve(race.root)]);
  assert.deepEqual(results.map((result) => result.status).sort(), ['needs-attention', 'reserved'], 'exactly one process may reserve');
  const owner = JSON.parse(fs.readFileSync(path.join(race.worker.lockDir, 'owner.json'), 'utf8'));
  assert.equal(race.worker.ledger().institutions['dk-aau'].run_id, owner.run_id);
  assert.equal(Object.keys(race.worker.ledger().institutions).length, 1);

  // A slow old finish resumes after a competing finish and the next reservation.
  // Its validation hook reproduces that interleaving without sleeps or real git.
  const handoff = fixture();
  const firstRun = handoff.worker.reserve();
  write(path.join(handoff.root, reviewFile), report('dk-aau'));
  const fastFinisher = new HourlyUniversities(handoff.root, { today: TODAY, verifyCommit: () => SHA });
  let nextRun, nextSnapshot;
  const staleFinisher = new HourlyUniversities(handoff.root, { today: TODAY, verifyCommit: () => {
    fastFinisher.finish({ runId: firstRun.run_id, state: 'complete', review: reviewFile, commit: SHA });
    nextRun = handoff.worker.reserve();
    assert.equal(nextRun.institution.institution_key, 'dk-second');
    nextSnapshot = snapshot(handoff.worker);
    return SHA;
  } });
  assert.throws(() => staleFinisher.finish({ runId: firstRun.run_id, state: 'complete', review: reviewFile, commit: SHA }), /Reservation changed/);
  assert.deepEqual(snapshot(handoff.worker), nextSnapshot, 'stale finish must leave the new reservation byte for byte intact');
  assert.deepEqual(fs.readdirSync(path.dirname(handoff.worker.lockDir)), ['hourly-university.lock'], 'stale finish must not leave a finish guard');
  write(path.join(handoff.root, reviewFile), report('dk-second'));
  assert.equal(fastFinisher.finish({ runId: nextRun.run_id, state: 'complete', review: reviewFile, commit: SHA }).status, 'complete', 'the next reservation must remain finishable');

  const guardFailure = fixture();
  const guardedRun = guardFailure.worker.reserve();
  write(path.join(guardFailure.root, reviewFile), { notes: 'Official source unavailable' });
  const guardedSnapshot = snapshot(guardFailure.worker);
  const ledger = guardFailure.worker.ledger.bind(guardFailure.worker);
  let ledgerReads = 0;
  guardFailure.worker.ledger = () => { if (++ledgerReads === 2) throw new Error('Injected read failure after finish guard'); return ledger(); };
  assert.throws(() => guardFailure.worker.finish({ runId: guardedRun.run_id, state: 'failed', review: reviewFile, reason: 'Unavailable' }), /Injected read failure/);
  assert.deepEqual(snapshot(guardFailure.worker), guardedSnapshot);
  assert.deepEqual(fs.readdirSync(path.dirname(guardFailure.worker.lockDir)), ['hourly-university.lock'], 'failed finish cleans only its own guard');
  guardFailure.worker.ledger = ledger;
  assert.equal(guardFailure.worker.finish({ runId: guardedRun.run_id, state: 'failed', review: reviewFile, reason: 'Unavailable' }).status, 'failed');

  for (const outcome of ['deferred', 'failed']) {
    const partial = fixture();
    const partialRun = partial.worker.reserve();
    write(path.join(partial.root, reviewFile), { notes: 'Accepted partial research and remaining source gap' });
    const partialOptions = { runId: partialRun.run_id, state: outcome, review: reviewFile, reason: 'Official publication pending', ...(outcome === 'deferred' ? { nextCheckOn: '2026-11-02' } : {}) };
    const partialSnapshot = snapshot(partial.worker);
    assert.throws(() => partial.worker.finish({ ...partialOptions, commit: 'not-a-sha' }), /real local commit SHA/);
    assert.deepEqual(snapshot(partial.worker), partialSnapshot, 'invalid partial commit preserves ledger and reservation');
    assert.throws(() => partial.worker.finish({ ...partialOptions, commit: SHA }), /real local commit/);
    assert.deepEqual(snapshot(partial.worker), partialSnapshot, 'nonexistent partial commit preserves ledger and reservation');
    const partialPublisher = new HourlyUniversities(partial.root, { today: TODAY, verifyCommit: (_root, sha) => { assert.equal(sha, SHA); return sha; } });
    assert.equal(partialPublisher.finish({ ...partialOptions, commit: SHA }).status, outcome);
    const partialEntry = partialPublisher.ledger().institutions['dk-aau'];
    assert.equal(partialEntry.commit, SHA, 'partial publication retains its verified commit');
    assert.equal(partialEntry.state, outcome, 'a partial commit never marks an institution complete');
  }

  const orphan = fixture();
  fs.mkdirSync(orphan.worker.lockDir, { recursive: true });
  assert.equal(orphan.worker.reserve().status, 'needs-attention', 'a stale ownerless lock is never stolen');
  assert.equal(fs.existsSync(orphan.worker.stateFile), false);
  const orphanLedger = fixture();
  write(orphanLedger.worker.stateFile, { schema_version: 1, institutions: { 'dk-aau': { state: 'in_progress', run_id: 'orphan' } } });
  assert.equal(orphanLedger.worker.reserve().status, 'needs-attention', 'a running ledger blocks selection even without a lock');

  const empty = fixture([]);
  assert.equal(empty.worker.next().status, 'queue-exhausted');
  assert.equal(empty.worker.next().world_coverage_complete, false);
  const deferredOnly = fixture([row('dk-wait', 0)]);
  const waiting = deferredOnly.worker.reserve();
  write(path.join(deferredOnly.root, reviewFile), { notes: 'Waiting for official publication' });
  deferredOnly.worker.finish({ runId: waiting.run_id, state: 'deferred', review: reviewFile, reason: 'Publication pending', nextCheckOn: '2026-11-04' });
  assert.equal(deferredOnly.worker.next().status, 'no-actionable-institution');
  assert.equal(deferredOnly.worker.next().next_check_on, '2026-11-04');
  const due = new HourlyUniversities(deferredOnly.root, { today: '2026-11-04' });
  const retry = due.reserve();
  assert.equal(due.ledger().institutions['dk-wait'].attempts.length, 1, 'retry preserves previous outcome');
  due.finish({ runId: retry.run_id, state: 'failed', review: reviewFile, reason: 'Official site unavailable' });
  assert.equal(due.next().institution.institution_key, 'dk-wait', 'failure is eligible, never complete');
  const failureRetry = due.reserve();
  due.finish({ runId: failureRetry.run_id, state: 'failed', review: reviewFile, reason: 'Source remains unavailable', nextCheckOn: '2026-11-06' });
  assert.equal(due.next().status, 'no-actionable-institution', 'failed runs can avoid repeated source retries');
  assert.equal(due.next().next_check_on, '2026-11-06');

  const actualQueue = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/research/imports/proximity-queue.json'), 'utf8')).institutions;
  assert.equal(orderedInstitutions(actualQueue.filter((item) => item.country_code === 'dk'), countries)[0].institution_key, 'dk-aau');
  const help = spawnSync(process.execPath, [path.join(ROOT, 'scripts/hourly-universities.mjs'), '--help'], { encoding: 'utf8' });
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /editorial acceptance/);
  const invalidCli = spawnSync(process.execPath, [path.join(ROOT, 'scripts/hourly-universities.mjs'), '--finish', '--state', 'complete'], { encoding: 'utf8' });
  assert.equal(invalidCli.status, 2);
  assert.match(invalidCli.stderr, /Missing value/);
  console.log('  ok    hourly university tiers, radial ordering, durable outcomes, exact ownership, race protection and invalid-finish preservation');
} finally {
  for (const root of fixtures) {
    const relative = path.relative(os.tmpdir(), root);
    assert.ok(relative.startsWith('hourly-universities-test-') && !relative.includes(path.sep), 'cleanup must remain inside its named temporary fixture');
    fs.rmSync(root, { recursive: true, force: true });
  }
}
