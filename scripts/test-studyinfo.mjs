import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { catalogueEntry, cataloguePanel, programmeCatalogue, programmeCataloguePanel, identity, ENGLISH, IB_DIPLOMA } from '../src/lib/studyinfo.mjs';
import { nationalSources, nationalSourcesPanel } from '../src/lib/national-sources.mjs';
import { toString } from '../src/lib/html.mjs';
import { schoolKey } from '../src/lib/schools.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const fixture = () => ({
  oid: '1.2.246.562.17.123', koulutusOid: '1.2.246.562.13.123', tila: 'julkaistu',
  oppilaitokset: ['institution'], nimi: { en: 'Engineering <script>' },
  koulutus: { johtaaTutkintoon: true, eqf: [{ koodiUri: 'eqf_6#1' }, { koodiUri: 'eqf_7' }] },
  metadata: { opetus: { opetuskieli: [{ koodiUri: `${ENGLISH}#2` }] } },
  tarjoajat: [], hakukohteet: [{ oid: 'application', tila: 'julkaistu',
    paateltyAlkamisajankohta: { pvm: '2027-08-01' },
    pohjakoulutusvaatimus: [{ koodiUri: `${IB_DIPLOMA}#1` }],
  }],
});
const project = (d) => catalogueEntry(d, 'institution', 2027, 'autumn');
let checks = 0;
function check(name, run) { run(); checks++; console.log(`  ok ${name}`); }

check('combined bachelor and master remains a bachelor entry point', () => assert.ok(project(fixture()).entry));
check('another institution cannot inherit a listing', () => {
  const f = fixture(); f.oppilaitokset = ['another']; assert.equal(project(f).reason, 'institution-or-status');
});
check('English interface text cannot establish English teaching', () => {
  const f = fixture(); f.kielivalinta = ['en']; f.metadata.opetus.opetuskieli = [{ koodiUri: 'oppilaitoksenopetuskieli_1' }];
  assert.equal(project(f).reason, 'mixed-or-other-teaching-language');
});
check('bilingual programmes do not become English-only programmes', () => {
  const f = fixture(); f.metadata.opetus.opetuskieli.push({ koodiUri: 'oppilaitoksenopetuskieli_1' });
  assert.equal(project(f).reason, 'mixed-or-other-teaching-language');
});
check('masters without a bachelor award and non-degrees stay out', () => {
  const f = fixture(); f.koulutus.eqf = [{ koodiUri: 'eqf_7' }]; assert.equal(project(f).reason, 'not-bachelor');
  const g = fixture(); g.koulutus.johtaaTutkintoon = false; assert.equal(project(g).reason, 'not-bachelor');
});
check('past intakes, spring intakes and withdrawn routes stay out', () => {
  for (const start of ['2026-08-01', '2027-01-01', null]) {
    const f = fixture(); f.hakukohteet[0].paateltyAlkamisajankohta.pvm = start;
    assert.equal(project(f).reason, 'no-target-intake-with-first-year-route');
  }
  const f = fixture(); f.hakukohteet[0].tila = 'arkistoitu'; assert.equal(project(f).reason, 'no-target-intake-with-first-year-route');
});
check('IB recognition in a different intake cannot qualify a transfer route', () => {
  const f = fixture(); const old = structuredClone(f.hakukohteet[0]); old.paateltyAlkamisajankohta.pvm = '2026-08-01';
  f.hakukohteet[0].pohjakoulutusvaatimus = [{ koodiUri: 'pohjakoulutusvaatimuskouta_102' }]; f.hakukohteet.push(old);
  assert.equal(project(f).reason, 'no-target-intake-with-first-year-route');
});
check('general first-year qualifications do not become IB recognition claims', () => {
  for (const qualification of ['pohjakoulutusvaatimuskouta_100', 'pohjakoulutusvaatimuskouta_123']) {
    const f = fixture(); f.hakukohteet[0].pohjakoulutusvaatimus = [{ koodiUri: qualification }];
    const result = project(f).entry;
    assert.ok(result); assert.equal(result.applications[0].ibQualificationListed, false);
    assert.deepEqual(result.applications[0].qualificationCodes, [qualification]);
  }
});
check('missing English name stays unresolved', () => {
  const f = fixture(); f.nimi = { fi: 'Tekniikka' }; assert.equal(project(f).reason, 'no-english-name');
});
check('name matching keeps universities and applied sciences distinct', () => {
  assert.notEqual(identity('Tampere University'), identity('Tampere University of Applied Sciences'));
  assert.equal(identity('University of Jyväskylä'), identity('University of Jyvaskyla'));
});
const snapshot = JSON.parse(await fs.readFile(path.join(ROOT, 'data/external/studyinfo.json'), 'utf8'));
const country = JSON.parse(await fs.readFile(path.join(ROOT, 'data/countries/fi.json'), 'utf8'));
check('snapshot covers exactly the institutions we track', () => {
  assert.deepEqual(Object.keys(snapshot.institutions).sort(), country.institutions.map((i) => schoolKey('fi', i)).sort());
  assert.match(snapshot.retrievedAt, /^\d{4}-\d{2}-\d{2}$/); assert.equal(snapshot.source.id, 'studyinfo');
  assert.equal(snapshot.schemaVersion, 2);
  for (const institution of Object.values(snapshot.institutions)) {
    assert.equal(new Set(institution.programmes.map((p) => p.id)).size, institution.programmes.length);
    for (const p of institution.programmes) {
      assert.equal(p.url, `https://opintopolku.fi/konfo/en/toteutus/${p.id}`);
      assert.deepEqual(p.teachingLanguages, ['en']); assert.ok(p.applications.length);
      for (const a of p.applications) {
        assert.equal(Number(a.intakeStart.slice(0, 4)), snapshot.intakeYear);
        assert.equal(Number(a.intakeStart.slice(5, 7)) >= 7, snapshot.season === 'autumn');
        assert.equal(a.ibQualificationListed, a.qualificationCodes.includes(IB_DIPLOMA));
        assert.ok(a.qualificationCodes.some((c) => [IB_DIPLOMA, 'pohjakoulutusvaatimuskouta_100', 'pohjakoulutusvaatimuskouta_123'].includes(c)));
      }
    }
  }
});
check('programme joins require an unambiguous official ID in the same institution', () => {
  const entry = project(fixture()).entry;
  const data = { ...snapshot, institutions: { test: { programmes: [entry] } } };
  const p = { name: entry.name, requirementsUrl: 'https://opintopolku.fi/konfo/en/hakukohde/application/valintaperuste' };
  // Real IDs are numeric OIDs; names or plausible paths never qualify a join.
  assert.equal(programmeCatalogue(data, 'test', p), null);
  p.url = entry.url;
  assert.equal(programmeCatalogue(data, 'test', p).id, entry.id);
  assert.equal(programmeCatalogue(data, 'another', p), null);
  assert.equal(programmeCatalogue(data, 'test', { name: entry.name }), null);
  assert.equal(programmeCatalogue(data, 'test', { url: entry.url.replace('opintopolku.fi', 'example.com') }), null);
  data.institutions.test.programmes.push({ ...entry });
  assert.equal(programmeCatalogue(data, 'test', p), null);
});
check('complete study path totals cannot look like bachelor-only credits', () => {
  const entry = { ...project(fixture()).entry, source: snapshot.source, asOf: snapshot.retrievedAt,
    qualifications: ['Bachelor of Science', 'Master of Science'], totalEcts: 300, plannedYears: 5, plannedMonths: 0 };
  const text = toString(programmeCataloguePanel(entry));
  assert.ok(text.includes('Complete study path')); assert.ok(text.includes('300 ECTS · 5 years overall'));
  assert.ok(text.includes('Bachelor of Science + Master of Science'));
});
const externalSources = JSON.parse(await fs.readFile(path.join(ROOT, 'data/external/sources.json'), 'utf8'));
check('national resources are country-scoped and counts exclude internal exclusions', () => {
  const institutions = Object.entries(snapshot.institutions).map(([key, r]) => ({ key, name: r.name, href: `/universities/${key}/`, school: { scope: 'listed' } }));
  const site = { externalSources, externalCatalogues: { studyinfo: snapshot } };
  const actual = nationalSources(site, 'fi', institutions);
  const expected = Object.values(snapshot.institutions).reduce((n, i) => n + i.programmes.length, 0);
  assert.equal(actual.imported[0].count, expected);
  assert.ok(actual.sources.every((s) => s.country === 'fi'));
  const none = institutions.map((i) => ({ ...i, school: { scope: 'none' } }));
  assert.deepEqual(nationalSources(site, 'fi', none).imported, []);
  assert.equal(nationalSources(site, 'xx', institutions), null);
  const text = toString(nationalSourcesPanel(actual));
  assert.ok(text.includes('National course catalogues')); assert.ok(text.includes('national-catalogue'));
  assert.ok(!text.includes('public-api')); assert.ok(!text.includes('agreement-required'));
  assert.ok(!text.includes('UCAS'));
  const countries = new Set(externalSources.sources.map((s) => s.country));
  assert.equal(countries.size, externalSources.sources.length);
  for (const source of externalSources.sources) assert.equal(new URL(source.url).protocol, 'https:');
});
check('catalogue rendering escapes text, attributes source and retains original date', () => {
  const f = { ...snapshot, institutions: { test: { programmes: [project(fixture()).entry] } } };
  const rendered = toString(cataloguePanel(f, 'test'));
  assert.ok(rendered.includes('Engineering &lt;script&gt;')); assert.ok(!rendered.includes('<script>'));
  assert.ok(rendered.includes(snapshot.source.publisher)); assert.ok(rendered.includes('As of'));
  assert.ok(rendered.includes('entry conditions'));
  assert.equal(cataloguePanel(snapshot, 'absent'), '');
  assert.equal(cataloguePanel({ institutions: { test: { programmes: [] } } }, 'test'), '');
});
console.log(`${checks} Studyinfo checks passed`);
