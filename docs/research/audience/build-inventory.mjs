/**
 * Merges candidates/ + parts/ + candidates/auto-c.jsonl into inventory.jsonl
 * (one line per hit location) and prints the counts PLAN.md quotes.
 *
 *   node docs/research/audience/build-inventory.mjs
 *
 * Re-runnable at any point: a candidate with no classification yet is written
 * as class "pending", so a half-finished run is visible rather than silent.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = import.meta.dirname;
const read = (f) =>
  fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];

const candDir = path.join(DIR, 'candidates');
const partDir = path.join(DIR, 'parts');

const cands = new Map();
for (const f of fs.readdirSync(candDir).filter((f) => f.endsWith('.jsonl') && f !== 'auto-c.jsonl')) {
  for (const c of read(path.join(candDir, f))) cands.set(c.id, { ...c, group: f.replace(/\.jsonl$/, '') });
}
const decisions = new Map();
const extras = [];
for (const f of fs.readdirSync(partDir).filter((f) => f.endsWith('.jsonl'))) {
  for (const d of read(path.join(partDir, f))) {
    if (d.extra) extras.push({ ...d, group: f.replace(/\.jsonl$/, '') });
    else decisions.set(d.id, d);
  }
}

const apply = (text, edits = []) => {
  let out = text;
  const problems = [];
  for (const e of edits) {
    if (!out.includes(e.find)) problems.push(`find not present: ${e.find.slice(0, 60)}`);
    else out = out.replace(e.find, e.replace);
  }
  return { out, problems };
};

const lines = [];
const problems = [];
for (const c of cands.values()) {
  const d = decisions.get(c.id);
  const { out, problems: p } = apply(c.text, d?.edits);
  if (p.length) problems.push(`${c.id}: ${p.join('; ')}`);
  for (const loc of c.locations) {
    lines.push({
      file: loc.file,
      path: loc.path,
      candidateId: c.id,
      group: c.group,
      current: c.text,
      class: d?.class || 'pending',
      proposed: d?.edits?.length ? out : null,
      edits: d?.edits || [],
      appliesTo: d?.appliesTo || null,
      needsVerification: !!d?.needsVerification,
      verifyNote: d?.verifyNote || null,
      readerAccess: d?.readerAccess || null,
      note: d?.note || null,
    });
  }
}
for (const x of extras) {
  const { out } = apply(x.extra.text, x.edits);
  lines.push({
    file: x.extra.file, path: x.extra.path, candidateId: x.id, group: x.group, current: x.extra.text,
    class: x.class, proposed: out, edits: x.edits, appliesTo: x.appliesTo || null,
    needsVerification: !!x.needsVerification, verifyNote: x.verifyNote || null, readerAccess: x.readerAccess || null,
    note: x.note || null, foundBy: 'reading',
  });
}
for (const a of read(path.join(candDir, 'auto-c.jsonl'))) {
  lines.push({ file: a.file, path: a.path, candidateId: null, group: 'auto', current: a.text, class: 'C', proposed: null, edits: [], appliesTo: null, needsVerification: false, verifyNote: null, readerAccess: null, note: `auto: ${a.why}` });
}

lines.sort((a, b) => (a.file + a.path).localeCompare(b.file + b.path));
fs.writeFileSync(path.join(DIR, 'inventory.jsonl'), lines.map((l) => JSON.stringify(l)).join('\n') + '\n');

const fileGroup = (f) => {
  const m = f.match(/^(data\/[^/]+|src\/[^/]+(?:\/[^/]+)?)/);
  return m ? m[1].replace(/\.json$/, '') : f;
};
const tally = {};
const byGroup = {};
for (const l of lines) {
  tally[l.class] = (tally[l.class] || 0) + 1;
  const g = fileGroup(l.file);
  byGroup[g] ??= { A: 0, B: 0, money: 0, C: 0, pending: 0 };
  byGroup[g][l.class] = (byGroup[g][l.class] || 0) + 1;
}
const distinct = {};
for (const c of cands.values()) {
  const k = decisions.get(c.id)?.class || 'pending';
  distinct[k] = (distinct[k] || 0) + 1;
}
console.log('locations by class', tally);
console.log('distinct reviewed strings by class', distinct, '+ extras', extras.length);
console.log('needsVerification (locations)', lines.filter((l) => l.needsVerification).length);
console.log('readerAccess proposals', lines.filter((l) => l.readerAccess).map((l) => `${l.file} ${l.path}`));
console.table(byGroup);
if (problems.length) {
  console.log(`\n${problems.length} edit(s) whose find is not in the text:`);
  for (const p of problems) console.log('  ' + p);
}
