/**
 * Can the credential model describe systems that are not Danish?
 *
 * The acceptance test for this model is not "does Denmark still work". It is
 * whether four genuinely different post-secondary systems can be described
 * without the presentation code learning any of their names. So the fixtures
 * below are deliberately awkward:
 *
 *   Germany  — a Staatsexamen, which is not a bachelor, not a master, has no
 *              bachelor exit, and is awarded by the state rather than the
 *              university. And a Fachhochschule, which is not a university and
 *              is not a polytechnic.
 *   France   — a diplôme d'ingénieur from a grande école, reached through two
 *              years of preparatory class and a competitive exam, which is a
 *              structure no other country has.
 *   USA      — an associate degree from a community college, which is shorter
 *              than a bachelor and explicitly designed to transfer into one.
 *   Denmark  — a diplomingeniør, to check the home case did not regress.
 *
 * Every assertion below renders through the SAME helpers, with no branch on
 * country anywhere. If one of these ever needs a special case in a template,
 * the model is wrong and the fix belongs in src/lib/credentials.mjs.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  credentialName,
  sectorName,
  credentialSummary,
  credentialExplainer,
  levelOrder,
  COMPARABLE_LEVEL,
} from '../src/lib/credentials.mjs';

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

const GERMAN_MEDICINE = {
  comparableLevel: 'integrated-long',
  structure: 'integrated-long',
  localTitle: 'Staatsexamen',
  localTitleEn: 'State Examination',
  sector: { local: 'Universität', en: 'university', kind: 'research' },
  eqf: 7,
  years: 6,
};

const GERMAN_APPLIED = {
  comparableLevel: 'bachelor',
  structure: 'standard',
  localTitle: 'Bachelor of Engineering',
  localTitleEn: 'Bachelor of Engineering',
  abbreviation: 'BEng',
  sector: { local: 'Fachhochschule', en: 'university of applied sciences', kind: 'applied' },
  eqf: 6,
  ects: 210,
  years: 3.5,
};

const FRENCH_ENGINEER = {
  comparableLevel: 'integrated-long',
  structure: 'integrated-long',
  localTitle: "Diplôme d'ingénieur",
  localTitleEn: 'Engineering Diploma',
  sector: { local: 'grande école', en: 'specialist engineering school', kind: 'professional' },
  eqf: 7,
  years: 5,
};

const US_ASSOCIATE = {
  comparableLevel: 'short-cycle',
  structure: 'short-cycle',
  localTitle: 'Associate of Arts',
  localTitleEn: 'Associate of Arts',
  abbreviation: 'AA',
  sector: { local: 'community college', en: 'community college', kind: 'college' },
  years: 2,
};

const DANISH_BENG = {
  comparableLevel: 'bachelor',
  structure: 'standard',
  localTitle: 'Diplomingeniør',
  localTitleEn: 'Bachelor of Engineering',
  abbreviation: 'BEng',
  sector: { local: 'universitet', en: 'university', kind: 'research' },
  eqf: 6,
  ects: 210,
  years: 3.5,
};

const ALL = { GERMAN_MEDICINE, GERMAN_APPLIED, FRENCH_ENGINEER, US_ASSOCIATE, DANISH_BENG };

/* --- the local vocabulary survives ---------------------------------------- */

check('a Staatsexamen is called a Staatsexamen', () =>
  assert.equal(credentialName(GERMAN_MEDICINE), 'Staatsexamen (State Examination)'));

check("a diplôme d'ingénieur keeps its accents and its name", () =>
  assert.equal(credentialName(FRENCH_ENGINEER), "Diplôme d'ingénieur (Engineering Diploma)"));

check('a Fachhochschule is not flattened into "university"', () =>
  assert.equal(sectorName(GERMAN_APPLIED.sector), 'Fachhochschule (university of applied sciences)'));

check('a grande école keeps its own name', () =>
  assert.equal(sectorName(FRENCH_ENGINEER.sector), 'grande école (specialist engineering school)'));

check('an English name is not repeated in brackets after itself', () =>
  assert.equal(credentialName(US_ASSOCIATE), 'Associate of Arts'));

check('Denmark still reads correctly', () =>
  assert.equal(credentialName(DANISH_BENG), 'Diplomingeniør (Bachelor of Engineering)'));

/* --- comparison across systems still works -------------------------------- */

check('an associate degree sorts below a bachelor, which sorts below a long degree', () => {
  const order = [GERMAN_MEDICINE, US_ASSOCIATE, DANISH_BENG]
    .sort((a, b) => levelOrder(a) - levelOrder(b))
    .map((c) => c.comparableLevel);
  assert.deepEqual(order, ['short-cycle', 'bachelor', 'integrated-long']);
});

check('a German Staatsexamen and a French ingénieur compare as the same level', () =>
  assert.equal(levelOrder(GERMAN_MEDICINE), levelOrder(FRENCH_ENGINEER)));

check('a Fachhochschule bachelor and a Danish bachelor compare as the same level', () =>
  assert.equal(levelOrder(GERMAN_APPLIED), levelOrder(DANISH_BENG)));

/* --- the explainer says the thing that actually matters ------------------- */

check('a long degree warns that there is no bachelor exit', () => {
  const e = credentialExplainer(GERMAN_MEDICINE);
  assert.match(e.explain, /no bachelor exit/i);
  assert.match(e.explain, /apply once/i);
});

check('a short-cycle qualification says it is continuable', () =>
  assert.match(credentialExplainer(US_ASSOCIATE).explain, /continue/i));

check('a standard degree adds no redundant structural note', () =>
  assert.equal(credentialExplainer(DANISH_BENG).extra, null));

check('a non-standard structure does add one', () =>
  assert.ok(credentialExplainer(GERMAN_MEDICINE).extra));

/* --- every fixture renders without special-casing ------------------------- */

check('every fixture produces a name, a sector and a summary', () => {
  for (const [name, c] of Object.entries(ALL)) {
    assert.ok(credentialName(c), `${name} has no rendered name`);
    assert.ok(sectorName(c.sector), `${name} has no rendered sector`);
    assert.ok(credentialSummary(c), `${name} has no summary`);
    assert.ok(credentialExplainer(c), `${name} has no explainer`);
  }
});

check('every comparable level has an explanation a student could use', () => {
  for (const [key, v] of Object.entries(COMPARABLE_LEVEL)) {
    assert.ok(v.label, `${key} has no label`);
    assert.ok(v.explain && v.explain.length > 50, `${key} has no useful explanation`);
  }
});

/* --- and no template may branch on a country ------------------------------ */

check('no presentation code branches on a country code', async () => {
  const ROOT = path.resolve(import.meta.dirname, '..');
  const suspects = [];
  const walk = async (dir) => {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (/\.(mjs|js)$/.test(e.name)) {
        const text = await fs.readFile(p, 'utf8');
        // A comparison of a destination or country against a literal two-letter
        // code, which is how country-specific rendering starts.
        const re = /(?:destination|country|dest)\w*\s*===\s*['"][a-z]{2}['"]/g;
        for (const m of text.matchAll(re)) {
          suspects.push(`${path.relative(ROOT, p)}: ${m[0]}`);
        }
      }
    }
  };
  await walk(path.join(ROOT, 'src'));
  assert.deepEqual(
    suspects,
    [],
    `presentation code is branching on a country:\n          ${suspects.join('\n          ')}`
  );
});

await new Promise((r) => setTimeout(r, 0));
console.log(failures ? `\n${failures} failing\n` : '\nAll credential guards pass\n');
process.exit(failures ? 1 : 0);
