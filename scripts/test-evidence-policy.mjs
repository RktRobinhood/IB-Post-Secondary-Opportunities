/**
 * Guards on what a Verification State means.
 *
 * The contradiction these were written for is latent rather than visible:
 * there are no stale Evidence records today, so nothing on the site is
 * currently wrong. It becomes wrong on its own, on the first day a
 * `meta.reviewBy` elapses, with no commit in between. That is the worst kind of
 * fault to leave in place — it has no change to be caught by.
 *
 * So the central test is a fixture, not an assertion about the live data: a
 * record marked `verificationState: "verified"` whose review date has passed
 * must read as stale *everywhere*, and must never be counted as verified by
 * any output. The public export was the one that got this wrong.
 *
 * The rest are about precedence, which is the part six copies of a rule are
 * most likely to disagree about, and about the direction of an unknown value —
 * a typo in a state must not count as verified.
 */
import assert from 'node:assert/strict';
import {
  DECLINE,
  LABELS,
  ORDER,
  classify,
  forBrowser,
  serialisePolicy,
  statusFor,
  summarise,
} from '../src/lib/evidence-policy.mjs';

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

console.log('\nEvidence policy guards\n');

const TODAY = '2026-09-23';
const ev = (o) => ({ id: 'ev-x', sourceUrl: 'https://example.org', publisher: 'x', retrievedAt: '2026-01-01', ...o });

/* --- The regression the issue was filed over ------------------------------- */

check('verified + elapsed reviewBy is stale, not verified', () => {
  const record = ev({ verificationState: 'verified', meta: { reviewBy: '2026-09-01' } });
  assert.equal(classify(record, TODAY), 'stale');
});

check('and it is never counted as verified by any summary', () => {
  // The concrete divergence: the public export did not inspect reviewBy, so
  // this record stayed in the `verified` column of data.json after its review
  // date. One summary function now means it cannot.
  const s = summarise([ev({ verificationState: 'verified', meta: { reviewBy: '2026-09-01' } })], TODAY);
  assert.equal(s.verified, 0, 'an expired record must not be counted verified');
  assert.equal(s.stale, 1);
  assert.equal(s.total, 1);
});

check('a reviewBy still in the future leaves the record verified', () => {
  assert.equal(classify(ev({ verificationState: 'verified', meta: { reviewBy: '2027-01-01' } }), TODAY), 'verified');
});

/* --- Precedence ------------------------------------------------------------ */

check('a conflict outranks everything, including verified', () => {
  // Not a severity judgement. A conflict must never resolve to the more
  // permissive source, and "verified" is the more permissive reading.
  assert.equal(classify(ev({ verificationState: 'verified', conflictsWith: ['ev-other'] }), TODAY), 'conflicting');
});

check('a conflict outranks stale too', () => {
  const r = ev({ verificationState: 'verified', conflictsWith: ['ev-other'], meta: { reviewBy: '2020-01-01' } });
  assert.equal(classify(r, TODAY), 'conflicting');
});

check('unavailable and superseded outrank stale', () => {
  assert.equal(classify(ev({ verificationState: 'unavailable', meta: { reviewBy: '2020-01-01' } }), TODAY), 'unavailable');
  assert.equal(classify(ev({ verificationState: 'superseded', meta: { reviewBy: '2020-01-01' } }), TODAY), 'superseded');
});

check('stale outranks needs-review', () => {
  assert.equal(classify(ev({ verificationState: 'needs-review', meta: { reviewBy: '2020-01-01' } }), TODAY), 'stale');
});

check('an unrecognised state does not count as verified', () => {
  // The old build console ended `else ev.verified++`, so a typo in a state was
  // silently promoted to the strongest claim the site makes.
  const s = summarise([ev({ verificationState: 'verrified' })], TODAY);
  assert.equal(s.verified, 0, `a typo'd state must not be counted verified (got ${JSON.stringify(s)})`);
});

/* --- Mixed claims ---------------------------------------------------------- */

check('a claim is only as strong as its weakest record — conflict plus verified', () => {
  const s = statusFor([ev({ verificationState: 'verified' }), ev({ verificationState: 'verified', conflictsWith: ['ev-o'] })], TODAY);
  assert.equal(s.level, 'conflicting');
  assert.equal(s.label, LABELS.conflicting);
});

check('stale plus needs-review reports stale', () => {
  const s = statusFor(
    [ev({ verificationState: 'needs-review' }), ev({ verificationState: 'verified', meta: { reviewBy: '2020-01-01' } })],
    TODAY
  );
  assert.equal(s.level, 'stale');
});

check('all verified reports verified, with the newest retrieval date', () => {
  const s = statusFor(
    [ev({ verificationState: 'verified', retrievedAt: '2026-01-01' }), ev({ verificationState: 'verified', retrievedAt: '2026-06-01' })],
    TODAY
  );
  assert.equal(s.level, 'verified');
  assert.equal(s.checkedAt, '2026-06-01');
});

check('no records is "none", which is not the same as verified', () => {
  assert.equal(statusFor([], TODAY).level, 'none');
  assert.equal(statusFor(null, TODAY).level, 'none');
});

/* --- The two axes ---------------------------------------------------------- */

check('a source check is counted separately from the verification state', () => {
  // A record can be unreviewed by a person and still have had its page re-read
  // with the supporting sentence quoted onto it. Folding those into one number
  // hides which of the two a reader is getting.
  const s = summarise(
    [ev({ verificationState: 'needs-review', sourceCheck: { outcome: 'supported', checkedAt: '2026-09-20' } })],
    TODAY
  );
  assert.equal(s.needsReview, 1);
  assert.equal(s.verified, 0);
  assert.equal(s.sourceChecked, 1);
  assert.equal(s.sourceSupported, 1);
  assert.equal(s.lastCheckedAt, '2026-09-20');
});

/* --- One rule across the runtime boundary ---------------------------------- */

check('the browser is given a level, not the means to invent one', () => {
  const b = forBrowser(ev({ verificationState: 'verified', meta: { reviewBy: '2026-09-01' } }), TODAY);
  assert.equal(b.level, 'stale', 'the level must be decided at build time, against the build date');
});

check('the serialised policy carries the same precedence this module uses', () => {
  const p = serialisePolicy();
  assert.deepEqual(p.order, ORDER, 'the browser must roll records up in this order, not its own');
  assert.equal(p.labels.stale, LABELS.stale);
});

check('the two shapes classify identically', () => {
  // A full Evidence record and the trimmed browser object must not be able to
  // disagree, which is exactly what two implementations did.
  const full = ev({ verificationState: 'verified', conflictsWith: ['ev-o'], meta: { reviewBy: '2027-01-01' } });
  assert.equal(classify(full, TODAY), classify(forBrowser(full, TODAY), TODAY));
});

check('the levels that make the product decline are the ones above needs-review', () => {
  for (const l of ['conflicting', 'unavailable', 'superseded', 'stale']) assert.ok(DECLINE.has(l), `${l} should decline`);
  for (const l of ['needs-review', 'verified']) assert.ok(!DECLINE.has(l), `${l} should not decline`);
});

/* --- Every output agrees --------------------------------------------------- */

await checkAsync('the live data classifies the same through every caller', async () => {
  const { load } = await import('../src/lib/data.mjs');
  const { evidenceStatus } = await import('../src/lib/canonical.mjs');
  const site = await load();
  const records = [...site.graph.evidence.values()];

  const direct = summarise(records);
  assert.equal(direct.total, records.length);

  // The aggregate the site publishes must be the same object this policy
  // produces, not a second count that happens to agree today.
  const published = site.evidenceSummary;
  for (const k of ['total', 'verified', 'needsReview', 'stale', 'superseded', 'unavailable', 'conflicting']) {
    assert.equal(published[k], direct[k], `evidenceSummary.${k} disagrees with the policy (${published[k]} vs ${direct[k]})`);
  }

  // And a per-claim status must agree with classifying its records directly.
  const withRefs = [...site.graph.opportunities.values()].find((o) => (o.evidence || []).length > 1);
  if (withRefs) {
    const viaGraph = evidenceStatus(site.graph, withRefs.evidence);
    const viaPolicy = statusFor(withRefs.evidence.map((r) => site.graph.evidence.get(r)).filter(Boolean));
    assert.equal(viaGraph.level, viaPolicy.level, `canonical.evidenceStatus disagrees with the policy for ${withRefs.id}`);
  }
});

console.log(failures ? `\n${failures} failing\n` : '\nAll evidence policy guards pass\n');
process.exit(failures ? 1 : 0);
