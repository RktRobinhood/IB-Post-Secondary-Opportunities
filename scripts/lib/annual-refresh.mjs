/** Annual comparison: fetching discovers changes; only a reviewed baseline can carry facts forward. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fetchSource, FINGERPRINT_VERSION } from './source-audit.mjs';

export const SNAPSHOT_VERSION = FINGERPRINT_VERSION;
const DIRECTORIES = ['schools', 'countries', 'recognition', 'funding', 'country-guides', 'places', 'sessions', 'topics'];
const SINGLETONS = ['ib-conversion.json', 'ib-calendar.json', 'preparation.json', 'ib-statements.json', 'ib-subjects.json', 'other-language-institutions.json', 'applicant-groups.json'];
const webLink = value => typeof value === 'string' && /^https?:\/\/[^\s]+$/.test(value);
export const fetchUrl = value => { const u = new URL(value); u.hash = ''; return u.href; };
const digest = value => JSON.stringify(value);

/** Every URL retains its authored field and the fact immediately around it. */
export function recordLinks(value, file, country = 'shared') {
  const links = [];
  function visit(node, field = '', fact = node, sourceContext = false) {
    if (webLink(node)) { links.push({ url: node, field, file, country, oldValue: fact }); return; }
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach((item, i) => visit(item, `${field}[${i}]`, fact, sourceContext)); return; }
    for (const [key, child] of Object.entries(node)) {
      // Sources describe their enclosing fact; link collections describe themselves.
      const citation = sourceContext || key === 'sources';
      const context = sourceContext ? fact : node;
      visit(child, field ? `${field}.${key}` : key, context, citation);
    }
  }
  visit(value);
  return links;
}

export async function refreshRecords(root) {
  const files = [];
  for (const directory of DIRECTORIES) {
    try { for (const name of (await fs.readdir(path.join(root, 'data', directory))).filter(n => n.endsWith('.json')).sort()) files.push(`${directory}/${name}`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  for (const file of SINGLETONS) {
    try { await fs.access(path.join(root, 'data', file)); files.push(file); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const records = [];
  for (const file of files) {
    const value = JSON.parse(await fs.readFile(path.join(root, 'data', file), 'utf8'));
    const directory = file.split('/')[0];
    const country = value.country || value.destination || (['countries', 'country-guides', 'recognition'].includes(directory) ? path.basename(file, '.json') : 'shared');
    records.push({ file, country, value, links: recordLinks(value, file, country) });
  }
  return records;
}

/** Include links emitted by templates and stored photo credits, beyond data citations. */
export async function builtLinks(dist) {
  const links = [];
  async function visit(directory) {
    let entries;
    try { entries = await fs.readdir(directory, { withFileTypes: true }); }
    catch (error) { if (error.code === 'ENOENT') return; throw error; }
    for (const entry of entries) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(file);
      else if (entry.name.endsWith('.html')) {
        const html = await fs.readFile(file, 'utf8');
        for (const match of html.matchAll(/<a\b[^>]*\bhref=["'](https?:\/\/[^"']+)["']/gi)) {
          links.push({ url: match[1].replace(/&amp;/g, '&'), field: 'href', file: 'dist/' + path.relative(dist, file).split(path.sep).join('/'), country: 'built' });
        }
      }
    }
  }
  await visit(dist);
  return links;
}

export async function auditSources(links, { fetcher = fetchSource, concurrency = 16, initial = {}, onProgress = () => {}, onResult = () => {} } = {}) {
  const urls = [...new Set(links.map(link => fetchUrl(link.url)))].sort();
  const results = Object.fromEntries(urls.filter(url => initial[url]).map(url => [url, initial[url]]));
  const pending = urls.filter(url => !results[url]);
  let next = 0;
  let done = Object.keys(results).length;
  await Promise.all(Array.from({ length: Math.min(concurrency, pending.length) }, async () => {
    while (next < pending.length) {
      const url = pending[next++];
      try { results[url] = await fetcher(url); }
      catch (error) { results[url] = { status: 'unverified', reason: error.message }; }
      await onResult(url, results[url]);
      onProgress(++done, urls.length);
    }
  }));
  return Object.fromEntries(urls.map(url => [url, results[url]]));
}

export function compareSources(results, baseline) {
  const previous = baseline?.version === SNAPSHOT_VERSION ? baseline.sources || {} : {};
  return Object.fromEntries(Object.entries(results).map(([url, current]) => {
    const old = previous[url];
    const hasHash = typeof current.hash === 'string' && current.hash.length > 0;
    const status = current.status === 'broken' ? 'broken' : current.status !== 'ok' || !hasHash ? 'unverified'
      : !old?.hash ? 'changed' : old.hash === current.hash ? 'unchanged' : 'changed';
    return [url, { ...current, status, reason: current.reason || (current.status === 'ok' && !hasHash ? 'Source has no comparison fingerprint' : !old?.hash ? 'No reviewed comparison baseline' : undefined), previous: old || null }];
  }));
}

/** Unreadable and missing sources go to the work list, never the unchanged bucket. */
export function classifyRecords(records, comparisons) {
  return records.map(record => {
    const sources = record.links.map(link => ({ ...link, ...comparisons[fetchUrl(link.url)] }));
    const status = sources.some(source => source.status === 'broken') ? 'broken'
      : sources.length && sources.every(source => source.status === 'unchanged') ? 'unchanged' : 'changed';
    return { ...record, status, sources, reason: !sources.length ? 'No source links recorded' : undefined };
  });
}

/** Never rewrite a requirement, fee, prose or calendar value. IDs remain stable. */
export function carryRecord(value, { currentIntake, nextIntake, today }) {
  const out = structuredClone(value);
  let bumped = false;
  const bump = (object, field) => {
    if (object?.[field] === currentIntake) { object[field] = nextIntake; bumped = true; }
  };
  bump(out, 'intake'); bump(out, 'targetIntake');
  for (const route of out.routes || []) bump(route, 'intake');
  for (const programme of out.programmes || []) for (const intake of programme.intakes || []) bump(intake, 'intake');
  if (!bumped) return value;
  const dateFields = ['date', 'endDate', 'opens', 'closes', 'closesForDiplomaHolders'];
  function annotate(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(annotate); return; }
    if (dateFields.some(field => typeof node[field] === 'string' && /^\d{4}-\d{2}-\d{2}/.test(node[field]))) {
      node.provisional = true;
      node.carriedForwardFrom ||= currentIntake;
    }
    // Checked dates describe the source fetch, not a newly verified admission year.
    for (const key of ['retrieved', 'retrievedAt', 'dataAsOf']) if (Object.hasOwn(node, key)) node[key] = today;
    for (const [key, child] of Object.entries(node)) if (key !== 'historicalCutoffs') annotate(child);
  }
  annotate(out);
  out.carryForward = { fromIntake: currentIntake, toIntake: nextIntake, checkedAt: today, status: 'carried forward, source unchanged' };
  return out;
}

const markdown = value => String(value || '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
export async function writeRefreshReports(directory, { today, currentIntake, nextIntake, records, comparisons, links, dryRun, selectedCountries = [] }) {
  await fs.mkdir(directory, { recursive: true });
  const countries = {};
  for (const record of records) {
    const summary = countries[record.country] ||= { unchanged: 0, changed: 0, broken: 0 };
    summary[record.status]++;
  }
  const counts = { total: Object.keys(comparisons).length, unchanged: 0, changed: 0, broken: 0, unverified: 0 };
  for (const source of Object.values(comparisons)) counts[source.status]++;
  const report = { checkedAt: today, currentIntake, nextIntake, dryRun, sources: counts, changedShare: counts.total ? counts.changed / counts.total : 0, countries };
  await fs.writeFile(path.join(directory, 'summary.json'), JSON.stringify(report, null, 2) + '\n');
  const failures = links.flatMap(link => {
    const result = comparisons[fetchUrl(link.url)];
    return ['broken', 'unverified'].includes(result?.status) ? [{ file: link.file, field: link.field, url: link.url, status: result.status, finalUrl: result.finalUrl, reason: result.reason }] : [];
  });
  await fs.writeFile(path.join(directory, 'links.json'), JSON.stringify({ checkedAt: today, failures }, null, 2) + '\n');
  await fs.writeFile(path.join(directory, 'links.md'), `# Outbound link report — ${today}\n\nUnverified links require a browser check; they are never counted as unchanged.\n\n| Record or built page | Field | URL | Result / reason |\n|---|---|---|---|\n` + failures.map(link => `| ${markdown(link.file)} | ${markdown(link.field)} | ${markdown(link.url)} | ${markdown(link.status + ': ' + link.reason)} |`).join('\n') + '\n');
  const batches = path.join(directory, 'countries');
  await fs.mkdir(batches, { recursive: true });
  // Remove stale work lists individually; never recursively clear an arbitrary path.
  for (const name of await fs.readdir(batches)) if (/^[a-z0-9-]+\.(json|md)$/.test(name) &&
    (!selectedCountries.length || selectedCountries.includes(name.replace(/\.(json|md)$/, '')))) await fs.unlink(path.join(batches, name));
  for (const country of Object.keys(countries).sort()) {
    const work = records.filter(record => record.country === country && record.status !== 'unchanged');
    if (!work.length) continue;
    const entries = work.map(record => ({ file: record.file, status: record.status, reason: record.reason, oldValues: record.value, sources: record.sources.filter(source => source.status !== 'unchanged').map(({ oldValue, previous, text, ...source }) => ({ ...source, oldValue, previousText: previous?.text || null, currentText: text || null })) }));
    await fs.writeFile(path.join(batches, `${country}.json`), JSON.stringify(entries, null, 2) + '\n');
    const lines = [`# ${country} — ${currentIntake} → ${nextIntake}`, '', 'Read each changed source, then update the fact and its checked date. Do not infer a new date or fee from an unchanged page.', ''];
    for (const entry of entries) {
      lines.push(`## ${entry.file} (${entry.status})`, '', entry.reason || '', '', '| Field / source | Old recorded values | Current source / reason |', '|---|---|---|');
      for (const source of entry.sources) lines.push(`| ${markdown(source.field)}<br>${markdown(source.url)} | ${markdown(digest(source.oldValue))} | ${markdown(source.reason || source.currentText || 'No readable source text; open the URL.')} |`);
      lines.push('');
    }
    await fs.writeFile(path.join(batches, `${country}.md`), lines.join('\n') + '\n');
  }
  return report;
}
