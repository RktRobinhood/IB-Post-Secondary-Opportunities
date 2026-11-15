/**
 * Guards on what an IB recognition statement is allowed to become here (#38).
 *
 * The IB Recognition Statements Database holds 2,300 universities' own IB
 * policies, and the failure it invites is not a wrong fact but a wrong
 * proportion: importing it. So most of these are refusals of that —
 *
 *   - a statement for an institution the site does not list (the file must
 *     never become a back door for adding institutions);
 *   - a quotation long enough to be a copy rather than a touch;
 *   - a statement with no way back to the IB's own page for it;
 *   - a record that looks like unchecked research when it is really a host
 *     that refuses automation, or that claims a sign-off nobody gave.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXCERPT_MAX, excerpt } from './import-ib-statements.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');
const readJson = async (f) => JSON.parse(await fs.readFile(f, 'utf8'));

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  ok  ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL ${name}\n       ${e.message.split('\n').join('\n       ')}`);
  }
}

const file = path.join(DATA, 'ib-statements.json');
const exists = await fs.access(file).then(() => true, () => false);
if (!exists) {
  console.log('No data/ib-statements.json — nothing to check.');
  process.exit(0);
}

const { statements, database } = await readJson(file);

const institutions = new Set();
for (const f of (await fs.readdir(path.join(DATA, 'schools'))).filter((f) => f.endsWith('.json'))) {
  const school = await readJson(path.join(DATA, 'schools', f));
  institutions.add(f.slice(0, -5));
  for (const alias of school.aliases || []) institutions.add(alias);
}

const entries = Object.entries(statements);
console.log(`IB recognition statements — ${entries.length} on file\n`);

check('the database itself is named, dated and linked', () => {
  assert.equal(database.url, 'https://recognition.ibo.org/');
  assert.match(database.retrievedAt, /^\d{4}-\d{2}-\d{2}$/);
});

check('every statement belongs to an institution the site already lists', () => {
  const strays = entries.map(([k]) => k).filter((k) => !institutions.has(k));
  assert.deepEqual(strays, [], `not institutions on the site: ${strays.join(', ')}`);
});

check('every statement links to its own page in the IB database', () => {
  const bad = entries.filter(([, s]) => !/^https:\/\/recognition\.ibo\.org\/en-US\/university-statements\/\?id=[0-9a-f-]{36}$/.test(s.statementUrl));
  assert.deepEqual(bad.map(([k]) => k), []);
});

check(`a quotation is a touch, not a copy (at most ${EXCERPT_MAX} characters)`, () => {
  const long = entries.filter(([, s]) => (s.diplomaPolicy || '').length > EXCERPT_MAX + 1);
  assert.deepEqual(long.map(([k, s]) => `${k} (${s.diplomaPolicy.length})`), []);
});

check('the excerpt cutter refuses to exceed the limit, and prefers a sentence end', () => {
  const para = `${'The IB Diploma is accepted. '.repeat(20)}`;
  const cut = excerpt(para);
  assert.ok(cut.length <= EXCERPT_MAX, `cut to ${cut.length}`);
  assert.ok(cut.endsWith('.'), 'cut mid-sentence when a sentence end was available');
  assert.equal(excerpt('Short.'), 'Short.');
});

check('recognition is a stated yes or no, never inferred from silence', () => {
  const bad = entries.filter(([, s]) => ![true, false, null].includes(s.recognises?.diploma));
  assert.deepEqual(bad.map(([k]) => k), []);
});

check('every statement keeps its own source link and checked date', () => {
  const problems = [];
  for (const [key, statement] of entries) {
    const source = (statement.sources || []).find((source) => source.url === statement.statementUrl);
    if (!source) problems.push(key + ': no statement source');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(source?.checked || source?.retrieved || statement.retrievedAt || '')) problems.push(key + ': no checked date');
  }
  assert.deepEqual(problems, []);
});

check('a statement whose website contradicts the name match is not published as a match', () => {
  const bad = entries.filter(([, s]) => s.websiteAgrees === false && s.match !== 'reviewed' && s.match !== 'manual');
  assert.deepEqual(bad.map(([k, s]) => `${k} → ${s.ibName}`), [], 'resolve these by hand: confirm and mark reviewed, or remove');
});

console.log(failures ? `\n${failures} failed.` : '\nAll pass.');
process.exit(failures ? 1 : 0);
