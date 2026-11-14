/** Country identity and intake-language facts survive the single school model. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { load } from '../src/lib/data.mjs';
import { englishProgrammeCounts } from '../src/lib/intake-language.mjs';
import { toString } from '../src/lib/html.mjs';
import { schoolProgrammePage } from '../src/pages/school-programme.mjs';
import { schoolPage, schoolCards, programmeCard, universitiesIndex } from '../src/pages/schools.mjs';
import { destination } from '../src/pages/destinations.mjs';
import { planner } from '../src/pages/planner.mjs';

const site = await load();
const codes = site.destinations.map((d) => d.code);
assert.equal(codes.length, new Set(codes).size, 'each country appears once');
for (const file of (await fs.readdir(new URL('../data/countries/', import.meta.url))).filter((f) => f.endsWith('.json'))) {
  const country = JSON.parse(await fs.readFile(new URL(`../data/countries/${file}`, import.meta.url), 'utf8'));
  const loaded = site.destinations.find((c) => c.code === country.code);
  assert.ok(loaded, `${country.code} must reach the catalogue`);
  assert.equal(loaded.institutions.length, country.institutions.length, `${country.code} keeps its school inventory`);
  assert.equal(new Set(loaded.institutions.map((i) => i.key)).size, loaded.institutions.length, `${country.code} has no duplicate school`);
}
console.log('  ok    every country and its school inventory appears once');

const graph = { programmes: new Map([
  ['a', { id: 'a', family: { id: 'family' } }], ['b', { id: 'b', family: { id: 'family' } }], ['c', { id: 'c' }],
]) };
const pending = { language: 'English', languageIntakeStatus: 'unconfirmed' };
const members = [{ id: 'a-1', programmeId: 'a', language: 'English' }, { ...pending, id: 'b-1', programmeId: 'b' }, { ...pending, id: 'c-1', programmeId: 'c' }, { ...pending, id: 'c-2', programmeId: 'c' }];
assert.deepEqual(englishProgrammeCounts(graph, members), { confirmed: 1, pending: 1 });
assert.deepEqual(englishProgrammeCounts(graph, members.slice(1)), { confirmed: 0, pending: 2 });
console.log('  ok    programme families count once and keep unsettled language separate');

const country = site.destinations.find((c) => c.guideContent?.programmeCounts && c.institutions.some((i) => i.school?.programmes?.some((p) => p.opportunityId)));
const original = country.institutions.find((i) => i.school?.programmes?.some((p) => p.opportunityId && !site.graph.programmes.get(p.programmeId)?.family));
const source = original.school.programmes.find((p) => p.opportunityId && !site.graph.programmes.get(p.programmeId)?.family);
const p = { ...source, intake: '2028-autumn', language: 'English', languageIntakeStatus: 'unconfirmed', languageNote: 'English is currently listed; the next intake teaching language is under review.' };
const inst = { ...original, programmes: [p], school: { ...original.school, programmes: [p] } };
const changedCountry = { ...country, institutions: [inst] };
const changedGraph = { ...site.graph, opportunities: new Map(site.graph.opportunities) };
const opp = changedGraph.opportunities.get(p.opportunityId);
changedGraph.opportunities.set(opp.id, { ...opp, intake: p.intake, language: { instruction: 'English', fullyInLanguage: true, intakeStatus: 'unconfirmed', note: p.languageNote } });
const fixture = { ...site, graph: changedGraph, programmes: [p], countries: [changedCountry], destinations: [changedCountry], institutions: [inst], institutionCatalogue: { ...site.institutionCatalogue, all: [inst], byDestination: [{ ...inst.destination, institutions: [inst], programmes: 0, pendingProgrammes: 1 }] } };
const group = schoolCards([p])[0];
const card = toString(programmeCard(inst, group, { country: changedCountry.name, site: fixture }));
assert.match(card, /teaching language unconfirmed/);
const detail = schoolProgrammePage(fixture, inst, changedCountry, p, {});
assert.match(detail, /2028 teaching language unconfirmed/);
assert.match(detail, /English is currently listed; the next intake teaching language is under review\./);
assert.match(detail, /Unconfirmed for this intake/);
assert.match(schoolPage(fixture, inst, changedCountry, {}), /0 programmes · 1 awaiting language confirmation/);
assert.match(universitiesIndex(fixture), /0 English-taught programmes · 1 awaiting language confirmation/);
const countryHtml = destination(fixture, changedCountry, {});
assert.match(countryHtml, /0 programmes taught in English/);
assert.match(countryHtml, /1 further programme awaiting intake language confirmation/);
const exportData = JSON.parse(planner(fixture).match(/id="planner-opportunities">([\s\S]*?)<\/script>/)[1]);
assert.equal(exportData.find((o) => o.id === opp.id).language.intakeStatus, 'unconfirmed');
console.log('  ok    conditional teaching language reaches cards, pages, counts and the planner');
