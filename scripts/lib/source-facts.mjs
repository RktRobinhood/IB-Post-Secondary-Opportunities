/** Read source links beside their authored facts, without any review ledger. */
import fs from 'node:fs/promises';
import path from 'node:path';
const ROOT = path.resolve(import.meta.dirname, '..', '..');
export async function sourceFacts({ only = '' } = {}) {
  const files = [];
  for (const dir of ['schools', 'countries', 'recognition', 'funding', 'country-guides']) {
    try { for (const name of (await fs.readdir(path.join(ROOT, 'data', dir))).filter(f => f.endsWith('.json')).sort()) files.push(path.join(dir, name)); } catch (err) { if (err.code !== 'ENOENT') throw err; }
  }
  files.push('ib-conversion.json', 'ib-calendar.json', 'preparation.json', 'ib-statements.json');
  const facts = [];
  function visit(value, file, field = '', inherited = null) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach((item, i) => visit(item, file, field + '[' + i + ']', inherited)); return; }
    const checked = value.retrieved || value.dataAsOf || value.retrievedAt || inherited;
    for (const source of Array.isArray(value.sources) ? value.sources : []) if (source?.url) facts.push({ file: file.split(path.sep).join('/'), field, title: source.title, url: source.url, retrieved: source.retrieved || checked || null });
    for (const [key, child] of Object.entries(value)) if (key !== 'sources' || !Array.isArray(value.sources)) visit(child, file, field ? field + '.' + key : key, checked);
  }
  for (const file of files) {
    if (only && !file.includes(only)) continue;
    visit(JSON.parse(await fs.readFile(path.join(ROOT, 'data', file), 'utf8')), file);
  }
  return facts;
}
