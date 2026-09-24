/**
 * The conversion handbook and the Recognition Scheme that executes it must say
 * the same thing.
 *
 * The IB-to-local grade tables are held twice, on purpose: `data/ib-conversion.json`
 * is the handbook as published, which the conversion page renders, and the
 * Recognition Scheme under `data/recognition/` is the same numbers in the form
 * the eligibility engine runs. The handbook's own note says "change the
 * handbook here and change the scheme there, in the same commit" — and nothing
 * checked that anybody had. A year's update applied to one file and not the
 * other would show a student one average and grade them on another.
 *
 * This compares every row of every table the two share. It names no country:
 * the scheme it compares against is the one whose destination the handbook
 * declares, found by reading the records.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = async (p) => JSON.parse(await fs.readFile(path.join(ROOT, p), 'utf8'));

const handbook = await read('data/ib-conversion.json');
const dir = path.join(ROOT, 'data', 'recognition');
const schemes = await Promise.all(
  (await fs.readdir(dir)).filter((f) => f.endsWith('.json')).map((f) => read(path.join('data', 'recognition', f)))
);

// The handbook covers one destination; its tables are published by the same
// authority the scheme names.
const scheme = schemes.find((s) => s.authority?.name && s.authority.name === handbook.authority?.name);

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n        ${e.message}`);
  }
};

console.log('\nConversion handbook and Recognition Scheme agree\n');

check('a Recognition Scheme exists for the handbook’s authority', () =>
  assert.ok(scheme, `no scheme in data/recognition/ names "${handbook.authority?.name}" as its authority`)
);

const rows = (table, key) => new Map((table || []).map((r) => [r.ib, r[key]]));

for (const [label, own, theirs] of [
  ['total points → grade average', handbook.gradeAverage?.table, scheme?.gradeConversion?.average?.table],
  ['single subject grade', handbook.singleGrade?.table, scheme?.gradeConversion?.single?.table],
]) {
  check(`${label}: every row matches`, () => {
    const a = rows(own, 'dk');
    const b = rows(theirs, 'local');
    assert.ok(a.size, `the handbook has no ${label} table`);
    assert.deepEqual(
      [...a.keys()].sort((x, y) => x - y),
      [...b.keys()].sort((x, y) => x - y),
      `the two ${label} tables cover different IB values`
    );
    const differ = [...a].filter(([ib, v]) => b.get(ib) !== v).map(([ib, v]) => `IB ${ib}: handbook ${v}, scheme ${b.get(ib)}`);
    assert.deepEqual(differ, [], `rows differ:\n        ${differ.join('\n        ')}`);
  });
}

console.log(failures ? `\n${failures} failing\n` : '\nThe two copies agree\n');
process.exit(failures ? 1 : 0);
