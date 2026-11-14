/** Discovery report, not an admissions import. Refresh index separately if due.
 * npm run compare:denmark [-- --cached]
 * --cached accepts the legacy un-dated cache without inventing a retrieval date.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { collection } from './lib/records.mjs';
import { compareDenmarkCatalogue } from './lib/denmark-catalogue.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
let harvest;
let cachePath = '.cache/sid-index-harvest.json';
try { harvest = JSON.parse(await fs.readFile(path.join(ROOT, cachePath), 'utf8')); }
catch (error) {
  if (error.code !== 'ENOENT') throw error;
  if (!process.argv.includes('--cached')) throw new Error('No dated index harvest. Run node scripts/fetch-studyindenmark.mjs --index-only first, or explicitly use --cached for the legacy undated index.');
  cachePath = '.cache/sid-index.json';
  harvest = { retrievedAt: null, items: JSON.parse(await fs.readFile(path.join(ROOT, cachePath), 'utf8')) };
}
if (!Array.isArray(harvest.items)) throw new Error('Invalid Study in Denmark harvest');
const [institutions, programmes, opportunities] = ['institutions','programmes','opportunities'].map(name => collection(name).filter(r => (r.destination || r.institution || r.id).startsWith('dk')));
const result = compareDenmarkCatalogue(harvest.items, institutions, programmes, opportunities);
const report = { schemaVersion: 1, source: { name: 'Study in Denmark', url: 'https://studyindenmark.dk/portal',
  retrievedAt: harvest.retrievedAt, cache: cachePath,
  sha256: createHash('sha256').update(JSON.stringify(harvest.items)).digest('hex') }, ...result };
const output = path.join(ROOT, 'data', 'external', 'denmark-catalogue-comparison.json');
await fs.writeFile(`${output}.tmp`, `${JSON.stringify(report, null, 2)}\n`);
await fs.rename(`${output}.tmp`, output);
console.log(`${result.totals.compared} listings at matched institutions: ${result.totals.matched} exact programme matches, ${result.totals.unresolved} needing review; ${result.totals.curatedOnly} curated English programmes not matched. Public admissions data unchanged.`);
