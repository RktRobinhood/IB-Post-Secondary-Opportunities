/** Make an incomplete, schema-shaped research draft; null always means unknown. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '..');
const SCHEMA = 'school.schema.json';

function checkKey(key) {
  if (typeof key !== 'string' || key.length < 2 || key.length > 96 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)) {
    throw new Error('Use a lowercase kebab-case institution key, 2–96 characters (for example dk-new-university).');
  }
}

/** Expand properties and object-array examples without choosing factual defaults. */
export function unknownShape(node, schemas, schemaId = SCHEMA, references = new Set()) {
  if (node.$ref) {
    const [file, pointer = ''] = node.$ref.split('#');
    const id = file || schemaId;
    const ref = `${id}#${pointer}`;
    if (references.has(ref)) return null; // A requirement can contain alternative requirements.
    let target = schemas.get(id);
    for (const part of pointer.split('/').filter(Boolean)) {
      target = target?.[part.replace(/~1/g, '/').replace(/~0/g, '~')];
    }
    if (!target) throw new Error(`Cannot resolve schema reference ${node.$ref}`);
    return unknownShape(target, schemas, id, new Set([...references, ref]));
  }
  const properties = { ...node.properties };
  for (const branch of [...(Array.isArray(node.oneOf) ? node.oneOf : []), ...(Array.isArray(node.anyOf) ? node.anyOf : [])]) {
    Object.assign(properties, branch.properties);
  }
  if (Object.keys(properties).length) {
    return Object.fromEntries(Object.entries(properties).map(([key, value]) => [key, unknownShape(value, schemas, schemaId, references)]));
  }
  if (node.type === 'array') {
    const example = node.items && unknownShape(node.items, schemas, schemaId, references);
    // Empty primitive lists are unknown; object examples expose every field to fill.
    return example && typeof example === 'object' && (!Array.isArray(example) || example.length) ? [example] : [];
  }
  return null;
}

export async function schoolDraft(key) {
  checkKey(key);
  const schemas = new Map(await Promise.all(['common.schema.json', SCHEMA].map(async (name) => [
    name, JSON.parse(await fs.readFile(path.join(ROOT, 'schemas', name), 'utf8')),
  ])));
  const draft = unknownShape(schemas.get(SCHEMA), schemas);
  draft.institution = key;
  draft.id = key;
  return draft;
}

export async function writeSchoolDraft(key, { directory = path.join(ROOT, 'data', 'schools') } = {}) {
  const draft = await schoolDraft(key);
  const target = path.resolve(directory, `${key}.json`);
  if (path.dirname(target) !== path.resolve(directory)) throw new Error('School path escapes the target directory.');
  await fs.writeFile(target, `${JSON.stringify(draft, null, 2)}\n`, { flag: 'wx' });
  return target;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3) throw new Error('Usage: npm run university:new -- <key>');
    const target = await writeSchoolDraft(process.argv[2]);
    console.log(`Created ${target}`);
    console.log('This is an incomplete draft: null means unknown, including dates, fees and booleans.');
    console.log('Fill researched fields and remove unused object examples before checking or publishing.');
  } catch (error) {
    console.error(error.code === 'EEXIST' ? 'School already exists; the existing record was left untouched.' : error.message);
    process.exitCode = 1;
  }
}
