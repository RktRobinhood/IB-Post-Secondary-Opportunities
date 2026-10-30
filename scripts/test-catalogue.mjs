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
import { englishProgrammeCounts } from '../src/lib/intake-language.mjs';
import { cardGroups, programmeCard } from '../src/lib/paths.mjs';
import { renderProgrammeCard } from '../src/lib/programme-card.mjs';
import { toString } from '../src/lib/html.mjs';
import { programme as programmePage } from '../src/pages/programme.mjs';
import { university, universitiesIndex } from '../src/pages/institutions.mjs';
import { denmarkHub } from '../src/pages/denmark.mjs';
import { planner } from '../src/pages/planner.mjs';

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

check('English totals count programme families once and keep pending language separate', () => {
  const graph = { programmes: new Map([
    ['a', { id: 'a', family: { id: 'family' } }],
    ['b', { id: 'b', family: { id: 'family' } }],
    ['c', { id: 'c' }],
  ]) };
  const pending = { language: 'English', languageIntakeStatus: 'unconfirmed' };
  const members = [{ id: 'a-1', programmeId: 'a', language: 'English' }, { ...pending, id: 'b-1', programmeId: 'b' }, { ...pending, id: 'c-1', programmeId: 'c' }, { ...pending, id: 'c-2', programmeId: 'c' }];
  assert.deepEqual(englishProgrammeCounts(graph, members), { confirmed: 1, pending: 1 });
  assert.deepEqual(englishProgrammeCounts(graph, members.slice(1)), { confirmed: 0, pending: 2 });
});

await checkAsync('conditional language reaches shared cards, detail, totals and browser planner', async () => {
  const site = await load();
  const original = site.dkInstitutions.find((i) => i.programmes.some((p) => !site.graph.programmes.get(p.programmeId)?.family));
  const source = original.programmes.find((p) => !site.graph.programmes.get(p.programmeId)?.family);
  const p = { ...source, intake: '2028-autumn', language: 'English', languageIntakeStatus: 'unconfirmed', languageNote: 'English is currently listed; the next intake teaching language is under review.' };
  const inst = { ...original, programmes: [p] };
  const graph = { ...site.graph, opportunities: new Map(site.graph.opportunities) };
  const opp = graph.opportunities.get(p.opportunityId);
  graph.opportunities.set(opp.id, { ...opp, intake: p.intake, language: { instruction: 'English', fullyInLanguage: true, intakeStatus: 'unconfirmed', note: p.languageNote } });
  const fixture = { ...site, graph, programmes: [p], dkInstitutions: [inst], institutionCatalogue: { ...site.institutionCatalogue, all: [inst], byDestination: [{ ...inst.destination, institutions: [inst], programmes: 0, pendingProgrammes: 1 }] } };
  const card = toString(renderProgrammeCard(programmeCard(fixture, cardGroups(fixture, [p])[0])));
  assert.match(card, /2028 teaching language unconfirmed/);
  const normal = { ...source, languageIntakeStatus: null };
  assert.doesNotMatch(toString(renderProgrammeCard(programmeCard(fixture, { lead: normal, members: [normal] }))), /teaching language unconfirmed/);
  assert.match(toString(renderProgrammeCard(programmeCard(fixture, { lead: normal, members: [normal, p] }))), /2028 teaching language unconfirmed/, 'a confirmed lead cannot hide its pending sibling');
  const detail = programmePage(fixture, p, inst);
  assert.match(detail, /2028 teaching language unconfirmed/);
  assert.match(detail, /English is currently listed; the next intake teaching language is under review\./);
  assert.match(detail, /Unconfirmed for this intake/);
  assert.match(university(fixture, inst, {}), /0 programmes · 1 awaiting language confirmation/);
  assert.match(universitiesIndex(fixture), /0 English-taught programmes · 1 awaiting language confirmation/);
  const country = denmarkHub(fixture);
  assert.match(country, /0 programmes taught in English/);
  assert.match(country, /1 further programme awaiting intake language confirmation/);
  const plannerHtml = planner(fixture);
  const exportData = JSON.parse(plannerHtml.match(/id="planner-opportunities">([\s\S]*?)<\/script>/)[1]);
  assert.equal(exportData.find((o) => o.id === opp.id).language.intakeStatus, 'unconfirmed');
});

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
