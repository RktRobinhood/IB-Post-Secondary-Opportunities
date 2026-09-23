/**
 * Guards on what the canonical loader is allowed to return.
 *
 * Every one of these tests is about a *successful* load. That is the whole
 * point: none of the faults below ever threw, and none of them produced a
 * smaller number anywhere a person would look. A record whose JSON had a
 * trailing comma was warned about on a line of a build that prints hundreds of
 * lines and ends with "wrote 125 pages". An Opportunity whose id was already
 * taken replaced the record that had it, and the count stayed the same, because
 * one went in as the other came out.
 *
 * So the tests are fixtures rather than assertions about the live data. The
 * live data is clean today — which is exactly why it cannot demonstrate any of
 * this, and why a test written against it would pass forever without ever
 * having run. Each fixture is the smallest data directory that provokes one
 * fault, and the assertion is that the loader refuses it.
 *
 * Modelled on scripts/test-images.mjs, which makes the same argument about
 * pictures: a rule that never refuses anything is not a rule.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { CanonicalIntegrityError, loadCanonical } from '../src/lib/canonical.mjs';

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

console.log('\nCanonical loader guards\n');

/** The directories the loader reads. A fixture supplies only what it needs. */
const DIRS = [
  'destinations', 'places', 'institutions', 'programmes',
  'opportunities', 'application-systems', 'application-routes',
  'context-notes', 'evidence',
];

/**
 * Build a throwaway data directory and load it.
 *
 * `files` maps a path under the fixture root to either an object (written as
 * JSON) or a string (written verbatim, which is how malformed JSON gets in).
 * Every directory the loader reads is created unless the fixture asks for one
 * to be left out, so that "absent" is something a test opts into rather than
 * the accidental state of every fixture.
 */
async function withFixture(files, { omit = [], strict = false } = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ib-canonical-'));
  try {
    for (const d of DIRS) {
      if (!omit.includes(d)) await fs.mkdir(path.join(root, d), { recursive: true });
    }
    for (const [rel, body] of Object.entries(files)) {
      const full = path.join(root, rel);
      await fs.mkdir(path.dirname(full), { recursive: true });
      await fs.writeFile(full, typeof body === 'string' ? body : JSON.stringify(body, null, 2));
    }
    return await loadCanonical({ dataDir: root, strict });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

const errors = (result) => result.diagnostics.filter((d) => d.level === 'error').map((d) => d.message);

/* --- Malformed JSON -------------------------------------------------------- */

await checkAsync('malformed JSON is an error, not a warning', async () => {
  const r = await withFixture({
    'destinations/dk.json': { id: 'dk', name: 'Denmark' },
    'destinations/se.json': '{ "id": "se", "name": "Sweden",, }',
  });
  const errs = errors(r);
  assert.equal(errs.length, 1, `expected exactly one error, got: ${errs.join(' | ')}`);
  assert.match(errs[0], /destinations\/se\.json/, 'the diagnostic must name the file that failed to parse');
});

await checkAsync('a record lost to malformed JSON cannot reach a caller as a valid graph', async () => {
  // The failure this whole issue is about: Sweden is simply not there, and
  // nothing in the returned shape says so.
  await assert.rejects(
    () =>
      withFixture(
        {
          'destinations/dk.json': { id: 'dk', name: 'Denmark' },
          'destinations/se.json': '{ "id": "se",, }',
        },
        { strict: true }
      ),
    CanonicalIntegrityError,
    'a strict load over malformed JSON must throw rather than return a short graph'
  );
});

await checkAsync('the thrown error names every problem, not the first', async () => {
  const err = await withFixture(
    {
      'destinations/dk.json': '{ bad',
      'places/dk-aarhus.json': '{ also bad',
    },
    { strict: true }
  ).then(
    () => null,
    (e) => e
  );
  assert.ok(err instanceof CanonicalIntegrityError, 'expected a CanonicalIntegrityError');
  assert.equal(err.diagnostics.filter((d) => d.level === 'error').length, 2);
  assert.match(err.message, /destinations\/dk\.json/);
  assert.match(err.message, /places\/dk-aarhus\.json/);
});

/* --- Duplicate ids --------------------------------------------------------- */

await checkAsync('a duplicate entity id is an error and both files are named', async () => {
  const r = await withFixture({
    'opportunities/a.json': { id: 'dk-au-cs-2027-autumn', name: 'from a' },
    'opportunities/b.json': { id: 'dk-au-cs-2027-autumn', name: 'from b' },
  });
  const errs = errors(r);
  assert.equal(errs.length, 1, `expected one error, got: ${errs.join(' | ')}`);
  assert.match(errs[0], /opportunities\/a\.json/, 'the first file must be named');
  assert.match(errs[0], /opportunities\/b\.json/, 'the second file must be named');
});

await checkAsync('the earlier record wins rather than being silently replaced', async () => {
  // Which one survives matters less than that the survivor is not a surprise.
  // The old `new Map(list.map(...))` kept the *last*, so adding a file could
  // change the meaning of a record defined somewhere else entirely.
  const r = await withFixture({
    'opportunities/a.json': { id: 'x', name: 'from a' },
    'opportunities/b.json': { id: 'x', name: 'from b' },
  });
  assert.equal(r.graph.opportunities.get('x').name, 'from a');
  assert.equal(r.graph.opportunities.size, 1);
});

await checkAsync('duplicate Evidence ids within one file are caught', async () => {
  const r = await withFixture({
    'evidence/dk.json': [
      { id: 'dk-tuition-2027', verificationState: 'needs-review' },
      { id: 'dk-tuition-2027', verificationState: 'verified' },
    ],
  });
  const errs = errors(r);
  assert.equal(errs.length, 1, `expected one error, got: ${errs.join(' | ')}`);
  assert.match(errs[0], /dk-tuition-2027/);
});

await checkAsync('duplicate Evidence ids ACROSS files are caught', async () => {
  // The one a per-file check would miss, and the likeliest to happen: two
  // Destination research passes reaching for the same obvious id.
  const r = await withFixture({
    'evidence/dk.json': [{ id: 'eu-fee-status', verificationState: 'verified' }],
    'evidence/se.json': [{ id: 'eu-fee-status', verificationState: 'needs-review' }],
  });
  const errs = errors(r);
  assert.equal(errs.length, 1, `expected one error, got: ${errs.join(' | ')}`);
  assert.match(errs[0], /evidence\/dk\.json/);
  assert.match(errs[0], /evidence\/se\.json/);
});

await checkAsync('a record with no id at all is an error', async () => {
  const r = await withFixture({ 'places/nowhere.json': { name: 'a place with no id' } });
  assert.equal(errors(r).length, 1);
});

/* --- Absence is not corruption --------------------------------------------- */

await checkAsync('an absent optional directory is not an error', async () => {
  const r = await withFixture(
    { 'destinations/dk.json': { id: 'dk', name: 'Denmark' } },
    { omit: ['context-notes'] }
  );
  assert.deepEqual(errors(r), [], 'a directory that is simply not there must not fail the load');
  assert.ok(
    r.diagnostics.some((d) => d.level === 'absent' && /context-notes/.test(d.message)),
    'absence should still be recorded, so it can be told from an empty directory'
  );
});

await checkAsync('an empty present directory is distinguishable from an absent one', async () => {
  const r = await withFixture({ 'destinations/dk.json': { id: 'dk', name: 'Denmark' } });
  assert.ok(
    !r.diagnostics.some((d) => d.level === 'absent' && /context-notes/.test(d.message)),
    'a directory that exists and is empty must not be reported as absent'
  );
});

/* --- The real data --------------------------------------------------------- */

await checkAsync('the repository loads clean under strict', async () => {
  // If this fails, one of the fixtures above just found something real.
  const r = await loadCanonical();
  assert.deepEqual(errors(r), []);
  assert.ok(r.graph.destinations.size > 0, 'a clean load with no Destinations is not a clean load');
});

console.log(failures ? `\n${failures} failing\n` : '\nAll canonical loader guards pass\n');
process.exit(failures ? 1 : 0);
