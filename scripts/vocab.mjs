/**
 * Every controlled vocabulary in the schemas, printed.
 *
 *   npm run vocab              # everything
 *   npm run vocab -- feeStatus # one field
 *
 * WHY
 *
 * The first destination researched against docs/RESEARCH_BRIEF.md produced nine
 * schema errors, and every one of them was a guessed enum value: "most" where
 * the schema wanted "partial", "several" where it wanted "many", "reduced"
 * where it wanted "eu-eea-rate". The research was sound and the vocabulary was
 * invented, because the brief described what to find out and never said what
 * the allowed answers were.
 *
 * Writing the lists into the brief by hand would fix it until the schemas
 * changed and then quietly stop being true. So they are generated from the
 * schemas themselves, and cannot drift.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SCHEMAS = path.join(ROOT, 'schemas');

const filter = process.argv.slice(2).filter((a) => !a.startsWith('--'))[0]?.toLowerCase();

/** Walk a schema and collect every enum, with the path that reaches it. */
function collectEnums(node, trail, into) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node.enum)) {
    const key = trail[trail.length - 1] || '(root)';
    into.push({ field: key, path: trail.join('.'), values: node.enum, description: node.description });
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === 'properties' || k === '$defs') {
      for (const [name, sub] of Object.entries(v || {})) collectEnums(sub, [...trail, name], into);
    } else if (k === 'items') {
      collectEnums(v, trail, into);
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      collectEnums(v, trail, into);
    }
  }
}

const files = (await fs.readdir(SCHEMAS)).filter((f) => f.endsWith('.json')).sort();
const seen = new Map();

for (const f of files) {
  const schema = JSON.parse(await fs.readFile(path.join(SCHEMAS, f), 'utf8'));
  const found = [];
  collectEnums(schema, [], found);
  for (const e of found) {
    // The same vocabulary often appears in several schemas via $ref. Show it
    // once, under every field name that uses it.
    const key = e.values.join('|');
    if (!seen.has(key)) seen.set(key, { fields: new Set(), values: e.values, description: e.description, where: new Set() });
    const entry = seen.get(key);
    entry.fields.add(e.field);
    entry.where.add(f.replace('.schema.json', ''));
    if (!entry.description && e.description) entry.description = e.description;
  }
}

const rows = [...seen.values()]
  .map((e) => ({ ...e, fields: [...e.fields].sort(), where: [...e.where].sort() }))
  .filter((e) => !filter || e.fields.some((f) => f.toLowerCase().includes(filter)))
  .sort((a, b) => a.fields[0].localeCompare(b.fields[0]));

if (!rows.length) {
  console.log(`\nNo vocabulary matching "${filter}".\n`);
  process.exit(0);
}

console.log(`\nControlled vocabularies — generated from schemas/, never hand-written.\n`);
for (const r of rows) {
  console.log(`  ${r.fields.join(' / ')}`);
  console.log(`    ${r.values.map((v) => `"${v}"`).join('  ')}`);
  if (r.description) {
    const wrapped = r.description.replace(/\s+/g, ' ').match(/.{1,86}(\s|$)/g) || [];
    for (const line of wrapped) console.log(`    ${line.trim()}`);
  }
  console.log(`    in: ${r.where.join(', ')}\n`);
}
console.log(`${rows.length} vocabularies. Use these values exactly; the validator does not guess.\n`);
