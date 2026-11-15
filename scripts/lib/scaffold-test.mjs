import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { schoolDraft, writeSchoolDraft } from '../new-university.mjs';

const draft = await schoolDraft('dk-new-university');
assert.equal(draft.institution, 'dk-new-university');
assert.equal(draft.id, 'dk-new-university');
assert.equal(draft.name, null);
assert.equal(draft.country, null);
assert.equal(draft.scope, null);
assert.equal(draft.ownDeadline, null);
assert.equal(draft.students, null);
assert.equal(draft.retrieved, null);
assert.deepEqual(draft.places, []);
assert.equal(draft.handoff.url, null);
assert.equal(draft.sources[0].quote, null);
assert.equal(draft.programmes[0].name, null);
assert.equal(draft.programmes[0].intakes[0].requirements[0].minGrade, null);
assert.equal(draft.programmes[0].intakes[0].cost[0].tuition.amount, null);
assert.deepEqual(draft.programmes[0].intakes[0].requirements[0].alternatives, []);

for (const key of ['../escape', '..', 'dk/escape', 'dk\\escape', 'C:escape', '', 'DK-name', 'x'.repeat(97)]) {
  await assert.rejects(schoolDraft(key), /lowercase kebab-case/);
}

const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'university-scaffold-'));
const target = path.join(directory, 'dk-new-university.json');
try {
  assert.equal(await writeSchoolDraft('dk-new-university', { directory }), target);
  const before = await fs.readFile(target, 'utf8');
  assert.deepEqual(JSON.parse(before), draft);
  await assert.rejects(writeSchoolDraft('dk-new-university', { directory }), { code: 'EEXIST' });
  assert.equal(await fs.readFile(target, 'utf8'), before);
  await assert.rejects(writeSchoolDraft('../escape', { directory }), /lowercase kebab-case/);
} finally {
  await fs.unlink(target).catch((error) => { if (error.code !== 'ENOENT') throw error; });
  await fs.rmdir(directory);
}
console.log('Scaffold: unknown values, nested examples, path safety and overwrite protection pass.');
