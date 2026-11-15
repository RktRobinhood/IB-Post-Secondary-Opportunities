/** npm run refresh [--dry-run] [--baseline] [--country=dk,nl] */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { SNAPSHOT_VERSION, refreshRecords, builtLinks, auditSources, compareSources, classifyRecords, carryRecord, writeRefreshReports } from './lib/annual-refresh.mjs';

export async function refresh({ root = path.resolve(import.meta.dirname, '..'), dryRun = false, baselineOnly = false, resume = false, countries = [], today = new Date().toISOString().slice(0, 10), fetcher, concurrency = 16, log = console.log } = {}) {
  const config = JSON.parse(await fs.readFile(path.join(root, 'data', 'site-config.json'), 'utf8'));
  const currentIntake = config.cycle.intake;
  const nextIntake = config.cycle.nextIntake || currentIntake.replace(/^\d{4}/, year => String(Number(year) + 1));
  const directory = path.join(root, '.cache', 'refresh');
  const baselineFile = path.join(directory, 'baseline.json');
  let baseline = null;
  try { baseline = JSON.parse(await fs.readFile(baselineFile, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const records = (await refreshRecords(root)).filter(record => !countries.length || countries.includes(record.country));
  const published = countries.length ? [] : await builtLinks(path.join(root, 'dist'));
  const links = [...records.flatMap(record => record.links), ...published];
  if (!published.length && !countries.length) log('No built outbound links found; run npm run build to include the published site in the audit.');
  await fs.mkdir(directory, { recursive: true });
  const checkpoint = path.join(directory, 'fetches.jsonl');
  const initial = {};
  if (resume) {
    let lines = '';
    try { lines = await fs.readFile(checkpoint, 'utf8'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    for (const line of lines.split('\n').filter(Boolean)) {
      try {
        const saved = JSON.parse(line);
        if (saved.version === SNAPSHOT_VERSION && saved.today === today) initial[saved.url] = saved.result;
      } catch { /* A process interruption may leave one incomplete final line. */ }
    }
    if (lines && !lines.endsWith('\n')) await fs.appendFile(checkpoint, '\n');
    log(`Resuming ${Object.keys(initial).length} same-day source fetches.`);
  } else await fs.writeFile(checkpoint, '');
  let checkpointWrite = Promise.resolve();
  log(`Fetching ${new Set(links.map(link => link.url.split('#')[0])).size} pages for ${records.length} records${dryRun ? ' (dry run)' : ''}…`);
  const results = await auditSources(links, { fetcher, concurrency, initial,
    onResult: (url, result) => {
      checkpointWrite = checkpointWrite.then(() => fs.appendFile(checkpoint, JSON.stringify({ version: SNAPSHOT_VERSION, today, url, result }) + '\n'));
      return checkpointWrite;
    },
    onProgress: (done, total) => { if (done % 100 === 0 || done === total) log(`  fetched ${done}/${total}`); },
  });
  const comparisons = compareSources(results, baseline);
  const classified = classifyRecords(records, comparisons);
  const report = await writeRefreshReports(directory, { today, currentIntake, nextIntake, records: classified, comparisons, links, dryRun, selectedCountries: countries });
  for (const [country, counts] of Object.entries(report.countries).sort()) log(`${country.padEnd(8)} ${counts.unchanged} unchanged · ${counts.changed} changed · ${counts.broken} broken`);
  log(`Pages: ${report.sources.changed}/${report.sources.total} changed (${(report.changedShare * 100).toFixed(1)}%); ${report.sources.broken} broken; ${report.sources.unverified} unverified.`);
  let carried = 0;
  if (!dryRun && !baselineOnly) for (const record of classified.filter(record => record.status === 'unchanged')) {
    const updated = carryRecord(record.value, { currentIntake, nextIntake, today });
    if (updated !== record.value) {
      await fs.writeFile(path.join(root, 'data', record.file), JSON.stringify(updated, null, 2) + '\n');
      carried++;
    }
  }
  // A comparison run never silently accepts changed pages as next year's baseline.
  // --baseline is an explicit action after an agent has checked the country batch.
  if (baselineOnly && !dryRun) {
    const sources = { ...(baseline?.version === SNAPSHOT_VERSION ? baseline.sources : {}) };
    for (const [url, result] of Object.entries(results)) if (result.status === 'ok' && typeof result.hash === 'string' && result.hash) sources[url] = { hash: result.hash, text: result.text, checkedAt: today, finalUrl: result.finalUrl };
    await fs.writeFile(baselineFile, JSON.stringify({ version: SNAPSHOT_VERSION, checkedAt: today, sources }, null, 2) + '\n');
    log('Saved the reviewed source baseline. No records were carried forward.');
  }
  log(`${carried} records carried forward. Reports: ${path.relative(root, directory)} (ignored).`);
  return { report, comparisons, records: classified, carried };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const known = args.every(arg => ['--dry-run', '--baseline', '--resume'].includes(arg) || /^--country=[a-z]{2}(,[a-z]{2})*$/.test(arg));
  if (!known) { console.error('Usage: npm run refresh -- [--dry-run] [--baseline] [--resume] [--country=dk,nl]'); process.exitCode = 2; }
  else await refresh({ dryRun: args.includes('--dry-run'), baselineOnly: args.includes('--baseline'), resume: args.includes('--resume'), countries: (args.find(arg => arg.startsWith('--country='))?.slice(10) || '').split(',').filter(Boolean) });
}
