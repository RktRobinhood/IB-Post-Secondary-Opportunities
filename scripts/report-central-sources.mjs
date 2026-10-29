/** Cheap, offline coverage report for continuation runs. No provider requests. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { programmeCatalogue } from '../src/lib/studyinfo.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = async (p) => JSON.parse(await fs.readFile(path.join(ROOT, p), 'utf8'));
const manifest = await read('data/external/sources.json');
const studyinfo = await read('data/external/studyinfo.json');
const snapshots = { studyinfo };
const countries = [];
for (const source of manifest.sources) {
  const snapshot = snapshots[source.id];
  let programmePages = 0;
  for (const [key] of Object.entries(snapshot?.institutions || {})) {
    let school;
    try { school = await read(`data/schools/${key}.json`); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    if (school.scope === 'none') continue;
    for (const programme of school.programmes || []) if (programmeCatalogue(snapshot, key, programme)) programmePages++;
  }
  const records = Object.values(snapshot?.institutions || {});
  countries.push({ country: source.country, source: source.id, access: source.access,
    snapshotAsOf: snapshot?.retrievedAt || null, intake: snapshot ? `${snapshot.intakeYear}-${snapshot.season}` : null,
    institutionsInSnapshot: records.length, institutionsWithListings: records.filter((i) => i.programmes.length).length,
    listings: records.reduce((n, i) => n + i.programmes.length, 0), exactProgrammeLinks: programmePages });
}
const report = {
  generatedAt: new Date().toISOString(),
  note: 'Coverage is computed from local records, not a verification or a claim of completeness.',
  countries,
};
await fs.writeFile(path.join(ROOT, 'docs/CENTRAL_SOURCE_COVERAGE.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`${countries.length} countries with national resources; ${countries.reduce((n, c) => n + c.listings, 0)} imported listings; ${countries.reduce((n, c) => n + c.exactProgrammeLinks, 0)} programme pages joined by official ID.`);
