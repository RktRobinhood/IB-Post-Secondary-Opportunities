/**
 * Guards on Destination identity.
 *
 * The fault these exist to prevent did not look like a bug from inside the
 * code. `[...migrated, ...countries]` is an obviously correct way to get every
 * Destination, and it was, for as long as no Destination was in both lists. It
 * became wrong silently, one migration at a time, and the symptom appeared on a
 * page rather than in a stack trace: `/compare/` offering two Australias, and
 * the two rows disagreeing because one was canonical and one was the profile.
 *
 * So the tests are about the *seam*, not about today's numbers. Asserting "36
 * destinations" would pass until somebody researched a thirty-seventh; asserting
 * "a Destination present in both representations appears once" holds forever
 * and is the thing that was actually broken.
 */
import assert from 'node:assert/strict';
import { canonicalOnlyCodes, mergeDestination, reconcileDestinations } from '../src/lib/catalogue.mjs';
import { load } from '../src/lib/data.mjs';

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

console.log('\nDestination catalogue guards\n');

/* --- The seam, on fixtures ------------------------------------------------- */

check('a Destination in both representations appears exactly once', () => {
  const out = reconcileDestinations(
    [{ code: 'au', name: 'Australia', migrated: true }],
    [{ code: 'au', name: 'Australia' }, { code: 'at', name: 'Austria' }]
  );
  assert.deepEqual(out.map((d) => d.code), ['au', 'at']);
});

check('a canonical-only Destination is not dropped', () => {
  // The inverse failure, and the more dangerous one: Denmark has no country
  // profile, so a naive de-duplication that iterates profiles loses the most
  // complete record on the site.
  const out = reconcileDestinations(
    [{ code: 'dk', name: 'Denmark' }],
    [{ code: 'at', name: 'Austria' }]
  );
  assert.deepEqual(out.map((d) => d.code).sort(), ['at', 'dk']);
});

check('the canonical record wins where it says something', () => {
  const merged = mergeDestination(
    { code: 'de', name: 'Germany', region: 'Western Europe' },
    { code: 'de', name: 'Germany', region: 'Europe' }
  );
  assert.equal(merged.region, 'Western Europe');
});

check('the profile fills what the canonical record has not migrated', () => {
  // This is the test that stops the obvious fix. Preferring the canonical
  // record wholesale would empty Germany's institution list and drop every
  // German deadline from the calendar, because those parts have not migrated
  // and the projection represents that as an empty array.
  const merged = mergeDestination(
    { code: 'de', name: 'Germany', institutions: [], deadlines: [], sources: [] },
    { code: 'de', name: 'Germany', institutions: [{ name: 'RWTH Aachen' }], deadlines: [{ date: '2027-01-15' }], sources: ['x'] }
  );
  assert.equal(merged.institutions.length, 1, 'an empty canonical array must not erase the profile list');
  assert.equal(merged.deadlines.length, 1);
  assert.equal(merged.sources.length, 1);
});

check('nested costs merge per member rather than whole', () => {
  const merged = mergeDestination(
    { code: 'de', costs: { tuitionEuEea: { value: 'none' }, livingCostMonthly: null } },
    { code: 'de', costs: { tuitionEuEea: { value: 'stale' }, livingCostMonthly: { value: '950 EUR' } } }
  );
  assert.equal(merged.costs.tuitionEuEea.value, 'none', 'canonical wins where it speaks');
  assert.equal(merged.costs.livingCostMonthly.value, '950 EUR', 'and does not erase what it is silent about');
});

check('a merged Destination says both things about itself', () => {
  const merged = mergeDestination({ code: 'de' }, { code: 'de' });
  assert.equal(merged.migrated, true, 'a canonical record exists');
  assert.equal(merged.hasProfile, true, 'and un-migrated research is still behind it');
});

check('canonicalOnlyCodes names the Destinations with no profile', () => {
  const only = canonicalOnlyCodes(
    [{ code: 'dk' }, { code: 'de' }],
    [{ code: 'de' }, { code: 'at' }]
  );
  assert.deepEqual(only, ['dk']);
});

/* --- The live catalogue ---------------------------------------------------- */

await checkAsync('the live catalogue holds every Destination exactly once', async () => {
  const site = await load();
  const codes = site.destinations.map((d) => d.code);
  const dupes = [...new Set(codes.filter((c, i) => codes.indexOf(c) !== i))];
  assert.deepEqual(dupes, [], `these Destinations appear more than once: ${dupes.join(', ')}`);
  assert.equal(codes.length, new Set(codes).size);
});

await checkAsync('every country profile and every canonical Destination is represented', async () => {
  // Uniqueness is easy to achieve by losing records. This is the other half.
  const site = await load();
  const codes = new Set(site.destinations.map((d) => d.code));
  for (const c of site.countries) assert.ok(codes.has(c.code), `country profile ${c.code} is missing from the catalogue`);
  for (const d of site.graph.destinations.values()) assert.ok(codes.has(d.id), `canonical Destination ${d.id} is missing from the catalogue`);
});

await checkAsync('no merged Destination lost its institutions or its deadlines', async () => {
  const site = await load();
  const overlapping = site.destinations.filter((d) => d.migrated && d.hasProfile);
  assert.ok(overlapping.length > 0, 'expected at least one half-migrated Destination to test');
  const empty = overlapping.filter((d) => !d.institutions.length);
  assert.deepEqual(
    empty.map((d) => d.code),
    [],
    `these half-migrated Destinations have no institutions, which is what preferring the canonical record does: ${empty.map((d) => d.code).join(', ')}`
  );
});

console.log(failures ? `\n${failures} failing\n` : '\nAll catalogue guards pass\n');
process.exit(failures ? 1 : 0);
