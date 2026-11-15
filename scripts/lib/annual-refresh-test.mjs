import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { refresh } from '../refresh.mjs';
import { recordLinks, compareSources, SNAPSHOT_VERSION } from './annual-refresh.mjs';
import { fingerprint, FINGERPRINT_VERSION } from './source-audit.mjs';
import { SITE } from '../../src/lib/layout.mjs';
import './source-audit-test.mjs';

const ROOT = path.resolve(import.meta.dirname, '../..');
const cache = path.join(ROOT, '.cache');
await fs.mkdir(cache, { recursive: true });
const fixture = await fs.mkdtemp(path.join(cache, 'annual-refresh-test-'));
const today = '2027-09-15';
const oldDate = '2027-03-15';
const url = name => `https://university.example/${name}`;
const source = name => ({ title: `${name} official rule`, url: url(name), retrieved: '2026-09-01' });
const programme = name => ({
  id: `${name}-degree`, name: 'English degree', url: url(name), closes: oldDate,
  intakes: [{ id: `${name}-degree-2027`, intake: '2027-autumn', retrieved: '2026-09-01',
    requirements: [{ kind: 'ib-points', minimum: 32, sources: [source(name)] }],
    cost: [{ tuition: { amount: 8500, currency: 'EUR' }, sources: [source(name)] }],
    admission: { historicalCutoffs: [{ value: 8.5, intake: '2026-autumn', retrieved: '2026-08-01' }] },
  }],
});
const school = (name, country = 'dk') => ({
  institution: `${country}-${name}`, country, scope: 'listed', retrieved: '2026-09-01',
  programmes: [programme(name)], sources: [source(name)],
  dates: [{ label: 'Applications close', date: oldDate, sources: [source(name)] }],
});
const original = {
  'site-config.json': { cycle: { intake: '2027-autumn', session: 'May 2027' } },
  'schools/dk-clean.json': school('clean'),
  'schools/dk-changed.json': school('changed'),
  'schools/dk-broken.json': school('broken'),
  'schools/dk-unverified.json': school('unverified'),
  'schools/dk-unknown.json': { institution: 'dk-unknown', country: 'dk', intake: '2027-autumn', programmes: [] },
  'schools/nl-other.json': school('other', 'nl'),
  'countries/dk.json': { code: 'dk', targetIntake: '2027-autumn', dataAsOf: '2026-09-01',
    sources: [source('country')], routes: [{ id: 'dk-route', intake: '2027-autumn',
      milestones: [{ id: 'dk-apply', date: oldDate, sources: [source('country')] }],
    }],
  },
};
const readData = async file => JSON.parse(await fs.readFile(path.join(fixture, 'data', file), 'utf8'));
const readBaseline = () => fs.readFile(path.join(fixture, '.cache/refresh/baseline.json'), 'utf8');
const snapshot = async () => Object.fromEntries(await Promise.all(Object.keys(original).map(async file => [file, await fs.readFile(path.join(fixture, 'data', file), 'utf8')])));
const pages = new Map(['clean', 'changed', 'other', 'country', 'published'].map(name => [url(name), `Official ${name} page: IB 32 points; tuition EUR 8500; closes 15 March 2027.`]));
const requested = [];
const fetcher = async link => {
  requested.push(link);
  if (link === url('broken')) return { status: 'broken', reason: 'HTTP 404', finalUrl: link };
  if (link === url('unverified')) return { status: 'unverified', reason: 'robot challenge', finalUrl: link };
  const text = pages.get(link);
  assert.ok(text, `fixture must provide a verdict for ${link}`);
  return { status: 'ok', hash: fingerprint(text), text, finalUrl: link };
};
const logs = [];
const run = options => refresh({ root: fixture, today, fetcher, log: line => logs.push(line), ...options });

try {
  for (const [file, value] of Object.entries(original)) {
    const target = path.join(fixture, 'data', file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, JSON.stringify(value, null, 2) + '\n');
  }
  await fs.mkdir(path.join(fixture, 'dist'), { recursive: true });
  await fs.writeFile(path.join(fixture, 'dist/index.html'), `<a href="${url('published')}#fees">Official fees</a><a href="${url('broken')}">Missing page</a>`);

  const requirement = original['schools/dk-clean.json'].programmes[0].intakes[0].requirements[0];
  const citation = recordLinks(requirement, 'schools/dk-clean.json', 'dk').find(link => link.field === 'sources[0].url');
  assert.deepEqual(citation.oldValue, requirement, 'country work list must pair changed citation text with the old requirement, not just its source object');

  const before = await snapshot();
  const first = await run({ dryRun: true });
  assert.equal(first.report.sources.unchanged, 0, 'a missing baseline must never count as unchanged');
  assert.equal(first.carried, 0);
  assert.deepEqual(await snapshot(), before, 'dry run must leave every authored byte untouched');
  await assert.rejects(readBaseline(), { code: 'ENOENT' });
  assert.ok(logs.some(line => /^dk\s+0 unchanged/.test(line)), 'dry run prints per-country unchanged/changed/broken counts');
  assert.equal(first.report.countries.dk.broken, 1);

  requested.length = 0;
  await fs.appendFile(path.join(fixture, '.cache/refresh/fetches.jsonl'), '{"interrupted":');
  await run({ dryRun: true, resume: true });
  assert.equal(requested.length, 0, 'an interrupted same-day audit resumes completed URL fetches');
  await run({ dryRun: true, resume: true, today: '2027-09-16' });
  assert.equal(requested.length, 7, 'next-day runs must re-read every source');
  assert.deepEqual(await snapshot(), before, 'resuming a dry run still leaves authoring data untouched');

  await run({ baselineOnly: true, dryRun: true });
  await assert.rejects(readBaseline(), { code: 'ENOENT' }, 'even --baseline must obey dry run');
  await run({ baselineOnly: true });
  assert.deepEqual(await snapshot(), before, 'recording a reviewed baseline must never carry data');
  const baselineBytes = await readBaseline();
  const baseline = JSON.parse(baselineBytes);
  assert.equal(baseline.version, SNAPSHOT_VERSION);
  assert.equal(SNAPSHOT_VERSION, FINGERPRINT_VERSION, 'normalization changes invalidate prior fingerprints automatically');
  assert.equal(baseline.sources[url('broken')], undefined, 'a broken page cannot establish a baseline');
  assert.equal(baseline.sources[url('unverified')], undefined, 'an unreadable page cannot establish a baseline');

  pages.set(url('changed'), 'Official changed page: IB 34 points; tuition EUR 9000; closes 16 March 2028.');
  const preview = await run({ dryRun: true });
  assert.equal(preview.report.countries.dk.unchanged, 2, 'only the clean school and country are safe to carry');
  assert.equal(preview.report.countries.dk.changed, 3, 'changed, unverified and unknown records need country work');
  assert.equal(preview.report.countries.dk.broken, 1);
  assert.equal(preview.report.countries.nl.unchanged, 1);
  assert.equal(preview.report.sources.changed, 1);
  assert.equal(preview.report.sources.total, 7, 'shared URLs and URL fragments are fetched once');
  assert.equal(preview.report.changedShare, 1 / 7);
  assert.equal(await readBaseline(), baselineBytes, 'comparison never silently accepts changed pages');
  assert.deepEqual(await snapshot(), before);

  const work = JSON.parse(await fs.readFile(path.join(fixture, '.cache/refresh/countries/dk.json'), 'utf8'));
  assert.deepEqual(work.map(record => record.file).sort(), ['schools/dk-broken.json', 'schools/dk-changed.json', 'schools/dk-unknown.json', 'schools/dk-unverified.json']);
  const changedWork = work.find(record => record.file.endsWith('dk-changed.json'));
  assert.deepEqual(changedWork.oldValues, original['schools/dk-changed.json']);
  assert.ok(changedWork.sources.every(source => /IB 34 points/.test(source.currentText) && /IB 32 points/.test(source.previousText)), 'changed source shows old and current content beside the old data');
  const failures = JSON.parse(await fs.readFile(path.join(fixture, '.cache/refresh/links.json'), 'utf8')).failures;
  assert.ok(failures.some(f => f.file === 'dist/index.html' && f.field === 'href' && f.reason === 'HTTP 404'), 'link report includes built-only links with field and reason');
  assert.ok(failures.some(f => f.file === 'schools/dk-unverified.json' && f.field === 'sources[0].url' && /robot/.test(f.reason)));

  const applied = await run();
  assert.equal(applied.carried, 3);
  const clean = await readData('schools/dk-clean.json');
  assert.equal(clean.programmes[0].intakes[0].intake, '2028-autumn');
  assert.equal(clean.programmes[0].intakes[0].id, original['schools/dk-clean.json'].programmes[0].intakes[0].id, 'stable identifiers are not renamed');
  assert.equal(clean.dates[0].date, oldDate);
  assert.equal(clean.programmes[0].closes, oldDate);
  assert.equal(clean.dates[0].provisional, true);
  assert.equal(clean.dates[0].carriedForwardFrom, '2027-autumn');
  assert.equal(clean.carryForward.status, 'carried forward, source unchanged');
  assert.equal(clean.carryForward.checkedAt, today);
  assert.equal(clean.programmes[0].intakes[0].requirements[0].minimum, 32);
  assert.deepEqual(clean.programmes[0].intakes[0].cost[0].tuition, { amount: 8500, currency: 'EUR' });
  assert.deepEqual(clean.programmes[0].intakes[0].admission.historicalCutoffs, original['schools/dk-clean.json'].programmes[0].intakes[0].admission.historicalCutoffs, 'historical intake and checked date are not rolled');
  assert.equal(clean.programmes[0].intakes[0].requirements[0].sources[0].retrieved, today);
  assert.equal((await readData('countries/dk.json')).targetIntake, '2028-autumn');
  assert.equal((await readData('countries/dk.json')).routes[0].intake, '2028-autumn');
  assert.equal((await readData('countries/dk.json')).routes[0].milestones[0].date, oldDate);
  for (const name of ['changed', 'broken', 'unverified', 'unknown']) assert.deepEqual(await readData(`schools/dk-${name}.json`), original[`schools/dk-${name}.json`], `${name} record must not carry its intake, fact, checked date or deadline`);
  assert.equal(await readBaseline(), baselineBytes);

  const afterFirst = await snapshot();
  assert.equal((await run()).carried, 0, 'repeating a completed cycle is idempotent');
  assert.deepEqual(await snapshot(), afterFirst);
  await fs.writeFile(path.join(fixture, 'data/site-config.json'), JSON.stringify({ cycle: { intake: '2028-autumn', session: 'May 2028' } }));
  requested.length = 0;
  const otherWork = path.join(fixture, '.cache/refresh/countries/nl.md');
  await fs.writeFile(otherWork, 'An unfinished country batch.');
  const next = await run({ countries: ['dk'], today: '2028-09-15' });
  assert.equal(next.carried, 2);
  assert.equal(next.report.countries.nl, undefined);
  assert.ok(!requested.includes(url('other')) && !requested.includes(url('published')), 'a country batch only fetches its own links');
  assert.equal(await fs.readFile(otherWork, 'utf8'), 'An unfinished country batch.', 'a country run preserves other unfinished country work lists');
  assert.equal((await readData('schools/nl-other.json')).programmes[0].intakes[0].intake, '2028-autumn');
  const twice = await readData('schools/dk-clean.json');
  assert.equal(twice.programmes[0].intakes[0].intake, '2029-autumn');
  assert.equal(twice.dates[0].date, oldDate, 'successive annual refreshes never invent a new date');
  assert.equal(twice.dates[0].carriedForwardFrom, '2027-autumn', 'successive refreshes preserve the original date provenance');
  assert.deepEqual(await readData('schools/dk-changed.json'), original['schools/dk-changed.json'], 'a changed source does not become unchanged just because it was fetched last year');
  assert.equal(await readBaseline(), baselineBytes);

  const oldAlgorithm = compareSources({ [url('clean')]: { status: 'ok', hash: baseline.sources[url('clean')].hash } }, { ...baseline, version: 0 });
  assert.equal(oldAlgorithm[url('clean')].status, 'changed', 'a baseline from an incompatible algorithm is not confirmation');
  const noHash = compareSources({ [url('clean')]: { status: 'ok', text: 'incomplete fetch' } }, baseline);
  assert.equal(noHash[url('clean')].status, 'unverified', 'a nominally OK fetch without a fingerprint cannot confirm a source');

  const config = JSON.parse(await fs.readFile(path.join(ROOT, 'data/site-config.json'), 'utf8'));
  assert.equal(SITE.cycle.intakeId, config.cycle.intake);
  assert.equal(SITE.cycle.session, config.cycle.session);
  assert.equal(SITE.cycle.year, Number(config.cycle.intake.slice(0, 4)));
  await fs.mkdir(path.join(fixture, 'src/lib'), { recursive: true });
  for (const file of ['layout.mjs', 'html.mjs']) await fs.copyFile(path.join(ROOT, 'src/lib', file), path.join(fixture, 'src/lib', file));
  const moduleUrl = pathToFileURL(path.join(fixture, 'src/lib/layout.mjs')).href;
  const nextLayout = spawnSync(process.execPath, ['--input-type=module', '-e', `import { SITE } from ${JSON.stringify(moduleUrl)}; console.log(JSON.stringify(SITE));`], { encoding: 'utf8' });
  assert.equal(nextLayout.status, 0, nextLayout.stderr);
  const futureSite = JSON.parse(nextLayout.stdout);
  assert.equal(futureSite.cycle.label, 'May 2028 IB session · Autumn 2028 entry', 'changing only data config updates displayed session and intake');
  assert.match(futureSite.description, /May 2028/);
  // Ignore comments while retaining strings and template interpolation.
  const scan = async directory => {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await scan(file);
      else if (entry.name.endsWith('.mjs')) {
        const source = await fs.readFile(file, 'utf8');
        const executable = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        assert.doesNotMatch(executable, /2027/, `${path.relative(ROOT, file)} must read the cycle from config or a record`);
      }
    }
  };
  for (const directory of ['pages', 'lib', 'templates']) await scan(path.join(ROOT, 'src', directory));
} finally {
  const resolved = path.resolve(fixture);
  if (path.dirname(resolved) !== path.resolve(cache) || !path.basename(resolved).startsWith('annual-refresh-test-')) throw new Error(`Refusing cleanup outside the test fixture: ${resolved}`);
  await fs.rm(resolved, { recursive: true, force: true });
}
console.log('Annual refresh: dry-run safety, reviewed baselines, country batches, unchanged-only carries, immutable facts/dates, successive cycles and cycle config pass.');
