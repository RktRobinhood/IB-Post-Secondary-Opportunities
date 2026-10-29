import assert from 'node:assert/strict';
import { fetchIndex } from './fetch-studyindenmark.mjs';
import { compareDenmarkCatalogue } from './lib/denmark-catalogue.mjs';

const source = (title = 'Engineering, BSc in Engineering', degree = 'Bachelor') => ({ '@id': 'https://studyindenmark.dk/portal/university/campus/engineering', UID: 'source-id', Title: title, institution_title: 'Example University (EU)', degree_title: degree, credits: '180' });
const institution = { id: 'dk-example', name: 'Example University' };
const programme = { id: 'dk-example-engineering', institution: institution.id, name: 'Engineering', credential: { comparableLevel: 'bachelor', abbreviation: 'BSc', ects: 180 } };
const opportunity = { programme: programme.id, intake: '2027-autumn', language: { instruction: 'English', fullyInLanguage: true } };
const compare = (items, programmes = [programme], opportunities = [opportunity]) => compareDenmarkCatalogue(items, [institution], programmes, opportunities);
let checks = 0;
async function check(name, run) { await run(); checks++; console.log(`  ok ${name}`); }

await check('complete index pagination retains every distinct listing', async () => {
  const second = { ...source(), '@id': `${source()['@id']}-2` };
  let calls = 0;
  const result = await fetchIndex(async () => ++calls === 1 ? { items: [source()], items_total: 2 } : { items: [second], items_total: 2 });
  assert.equal(result.length, 2); assert.equal(calls, 2);
});
await check('truncated, changed, duplicate or malformed indices fail before publication', async () => {
  let calls = 0;
  await assert.rejects(fetchIndex(async () => ++calls === 1 ? { items: [source()], items_total: 2 } : { items: [], items_total: 2 }), /Incomplete/);
  calls = 0;
  await assert.rejects(fetchIndex(async () => ({ items: [source()], items_total: ++calls === 1 ? 2 : 3 })), /changed during/);
  await assert.rejects(fetchIndex(async () => ({ items: [source(), source()], items_total: 2 })), /Duplicate/);
  await assert.rejects(fetchIndex(async () => ({ items: [], items_total: null })), /format changed/);
});
await check('top-ups and postgraduate programmes are not first-year choices', () => {
  const result = compare([source('Engineering', 'Top-up degree'), source('Engineering', 'Master (2 years)')]);
  assert.equal(result.totals.compared, 0); assert.equal(result.excluded['Top-up degree'], 1); assert.equal(result.totals.curatedOnly, 1);
});
await check('exact title matches retain institution and credential boundaries', () => {
  assert.equal(compare([source()]).totals.matched, 1);
  assert.equal(compare([{ ...source(), institution_title: 'Other University' }]).totals.matched, 0);
  assert.equal(compare([source('Engineering, BEng')]).totals.matched, 0);
  assert.equal(compare([source('Engineering')], [programme, { ...programme, id: 'duplicate' }], [opportunity, { ...opportunity, programme: 'duplicate' }]).comparisons[0].status, 'ambiguous-programme-name');
});
await check('prior-intake and mixed-language opportunities cannot count as current English matches', () => {
  assert.equal(compare([source()], [programme], [{ ...opportunity, intake: '2026-autumn' }]).totals.matched, 0);
  assert.equal(compare([source()], [programme], [{ ...opportunity, language: { instruction: 'English', fullyInLanguage: false } }]).totals.matched, 0);
});
await check('source credit disagreements are preserved rather than resolved', () => {
  const before = JSON.stringify(programme);
  const result = compare([{ ...source(), credits: '210' }]);
  assert.deepEqual(result.comparisons[0].ectsConflict, { catalogue: 210, curated: 180 });
  assert.equal(JSON.stringify(programme), before);
  assert.match(result.caution, /not presumed cancelled/);
});
console.log(`${checks} Denmark catalogue checks passed`);
