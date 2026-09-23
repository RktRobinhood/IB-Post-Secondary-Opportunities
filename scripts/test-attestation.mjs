/**
 * Guards on who is allowed to have agreed.
 *
 * `verified` is the strongest claim this site makes about a record, and
 * `src/lib/canonical.mjs` and `/trust/` both define it the same way: a person
 * read the source and agreed with what the record says. `/trust/` prints that
 * number under the heading "The honest number", beside a sentence promising
 * that a machine finding the words is not the same as a person agreeing with
 * them and that this site will not blur the line.
 *
 * It had blurred. At its worst 152 records were `verified` and every one had
 * been set by the pass that wrote it. When that was unwound, eight survived —
 * and all eight carried `verifiedBy: "automated"` while a `review.by` two
 * fields down said, in as many words, "not a person". The record was honest.
 * The state on it was not, and the state is what gets counted.
 *
 * Nothing caught it, because there is nothing structurally wrong with a record
 * that says "automated" in a free-text field. That is what makes this worth a
 * guard rather than a correction: the correction is one commit, and the fault
 * recurs the moment somebody writes a plausible sentence in `verifiedBy`.
 *
 * The rule is therefore deliberately blunt and deliberately conservative: a
 * `verified` record must name a verifier, and that name must not describe a
 * machine. Failing the other way — refusing a real person because their name
 * contained an unlucky word — is cheap to notice and cheap to fix. Passing the
 * other way puts "checked by a person" on a page for a check no person did,
 * which is the one failure this whole model exists to prevent.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { reviewerIsPerson } from '../src/lib/attestation.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const EVIDENCE = path.join(ROOT, 'data', 'evidence');

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
const checkAsync = async (name, fn) => {
  try {
    await fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message}`);
  }
};

console.log('\nAttestation guards\n');

async function allEvidence() {
  const out = [];
  for (const f of (await fs.readdir(EVIDENCE)).filter((f) => f.endsWith('.json'))) {
    const parsed = JSON.parse(await fs.readFile(path.join(EVIDENCE, f), 'utf8'));
    for (const e of Array.isArray(parsed) ? parsed : Object.values(parsed)) out.push({ file: `data/evidence/${f}`, e });
  }
  return out;
}

const records = await allEvidence();

/* --- The rule, on fixtures ------------------------------------------------- */

check('a machine cannot describe itself as a person', () => {
  for (const by of [
    'automated',
    'automated pass',
    'the research pass that wrote this record',
    'second-reading pass (not a person)',
    'verify-evidence.mjs',
    'Claude',
    'an agent',
    'machine re-read',
  ]) {
    assert.equal(reviewerIsPerson(by), false, `"${by}" should not count as a person`);
  }
});

check('an ordinary name still counts as a person', () => {
  // The guard must not be so broad that nobody can ever pass it.
  for (const by of ['M. Pilley', 'the admissions counsellor at IBG', 'Matt', 'A. N. Other, Head of Sixth Form']) {
    assert.equal(reviewerIsPerson(by), true, `"${by}" should count as a person`);
  }
});

/* --- The live data --------------------------------------------------------- */

await checkAsync('every verified record names a verifier', async () => {
  const bad = records.filter(({ e }) => e.verificationState === 'verified' && !String(e.verifiedBy || '').trim());
  assert.deepEqual(
    bad.map(({ file, e }) => `${file}: ${e.id}`),
    [],
    'a record cannot be verified by nobody'
  );
});

await checkAsync('no verified record was verified by a machine', async () => {
  // The exact fault: verifiedBy "automated" on a record counted as
  // person-verified by /trust/ and the README.
  const bad = records.filter(({ e }) => e.verificationState === 'verified' && !reviewerIsPerson(e.verifiedBy));
  assert.deepEqual(
    bad.map(({ file, e }) => `${file}: ${e.id} — verifiedBy "${e.verifiedBy}"`),
    [],
    `these records claim the strongest state on the site and name a machine as the verifier:\n          ` +
      bad.map(({ file, e }) => `${file}: ${e.id} — "${e.verifiedBy}"`).join('\n          ')
  );
});

await checkAsync('a record that says it was not reviewed by a person is not verified', async () => {
  // Belt and braces, and it is the shape that actually occurred: the honest
  // sentence was in `review.by` while `verificationState` said otherwise.
  const bad = records.filter(
    ({ e }) => e.verificationState === 'verified' && e.review?.by && !reviewerIsPerson(e.review.by)
  );
  assert.deepEqual(
    bad.map(({ file, e }) => `${file}: ${e.id} — review.by "${e.review.by}"`),
    [],
    'the record contradicts its own state'
  );
});

await checkAsync('a review that disagreed did not leave the record verified', async () => {
  const bad = records.filter(({ e }) => e.verificationState === 'verified' && e.review?.agreed === false);
  assert.deepEqual(bad.map(({ file, e }) => `${file}: ${e.id}`), [], 'reviewed and found wrong, but still verified');
});

await checkAsync('the work that was really done is still recorded', async () => {
  // Demoting a record must not throw away what was genuinely established. If
  // this ever fails, somebody has "fixed" the numbers by deleting evidence of
  // the checking rather than by correcting the claim about it.
  const checked = records.filter(({ e }) => e.sourceCheck?.outcome).length;
  assert.ok(
    checked > records.length / 2,
    `only ${checked} of ${records.length} records carry a source check; the automated re-read is the column that should be going up`
  );
});

console.log(failures ? `\n${failures} failing\n` : '\nAll attestation guards pass\n');
process.exit(failures ? 1 : 0);
