/** Published requirements and dates keep usable citations and checked dates. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const DATA = path.resolve(import.meta.dirname, '..', 'data');
const problems = [];
let sourceCount = 0;
let factCount = 0;
const isoDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const webUrl = (value) => { try { return /^https?:$/.test(new URL(value).protocol); } catch { return false; } };
const homepage = (value) => { const u = new URL(value); return u.pathname === '/' && !u.search && !u.hash; };
const asSource = (value) => typeof value === 'string' ? { url: value } : value;
const checkedAt = (value, inherited) => value?.checked || value?.retrieved || value?.retrievedAt || value?.dataAsOf || inherited;

function inspect(value, where, inheritedDate = null) {
  if (typeof value === 'string' && /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) problems.push(`${where}: control character in a published record`);
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, i) => inspect(item, `${where}[${i}]`, inheritedDate));
    return;
  }
  const checked = checkedAt(value, inheritedDate);
  const own = (Array.isArray(value.sources) ? value.sources : []).map(asSource);
  for (const [i, source] of own.entries()) {
    sourceCount++;
    if (!webUrl(source?.url)) problems.push(`${where}.sources[${i}]: invalid source URL`);
    if (!isoDate(checkedAt(source, checked))) problems.push(`${where}.sources[${i}]: missing or invalid checked date`);
  }
  const direct = [value.source, value.url, value.requirementsUrl].filter(Boolean).map(asSource);
  const citations = [...direct, ...own].filter((source) => webUrl(source?.url));
  // An explicitly provisional personal reminder is a suggestion, not an official deadline.
  const personal = value.type === 'personal' && value.consequence === 'personal' && value.provisional === true;
  const isDated = !personal && ['date', 'endDate', 'opens', 'closes', 'closesForDiplomaHolders']
    .some((key) => isoDate(value[key]));
  const isRequirement = /\.requirements\[\d+\]$/.test(where) || /\.ib$/.test(where);
  if (isDated || isRequirement) {
    factCount++;
    if (!citations.length) problems.push(`${where}: ${isDated ? 'date' : 'requirement'} has no source link`);
    else if (!citations.some((source) => isoDate(checkedAt(source, checked)))) problems.push(`${where}: fact has no checked date`);
    if (isDated) {
      // An explicit date citation must reach the rule, rather than a site root.
      for (const source of [...direct, ...own].filter((source) => webUrl(source?.url))) {
        if (homepage(source.url)) problems.push(`${where}: date cited to a homepage (${source.url})`);
      }
    }
  }
  for (const [key, child] of Object.entries(value)) {
    if (key !== 'sources') inspect(child, `${where}.${key}`, checked);
  }
}

assert.ok(isoDate('2027-01-15'));
assert.ok(!isoDate('2027-02-30'));
assert.ok(webUrl('https://example.edu/admissions'));
assert.ok(!webUrl('javascript:alert(1)'));
inspect({ date: '2027-01-15' }, 'fixture');
assert.match(problems.pop(), /date has no source link/);
inspect({ kind: 'ib-points' }, 'fixture.requirements[0]');
assert.match(problems.pop(), /requirement has no source link/);
inspect({ date: '2027-01-15', url: 'https://example.edu/' , retrieved: '2026-11-15' }, 'fixture');
assert.match(problems.pop(), /date cited to a homepage/);
inspect({ requirements: [{ sources: [{ url: 'https://example.edu/entry' }] }], retrieved: '2026-11-15' }, 'fixture');
assert.deepEqual(problems, [], 'a fact may inherit its enclosing record\'s checked date');
sourceCount = factCount = 0;

const schools = new Map();
for (const directory of ['schools', 'countries', 'recognition', 'funding', 'country-guides']) {
  const files = (await fs.readdir(path.join(DATA, directory))).filter((name) => name.endsWith('.json'));
  for (const name of files) {
    const record = JSON.parse(await fs.readFile(path.join(DATA, directory, name), 'utf8'));
    inspect(record, `${directory}/${name}`);
    if (directory === 'schools') {
      schools.set(name.slice(0, -5), record);
      for (const alias of record.aliases || []) schools.set(alias, record);
    }
  }
}

for (const name of ['ib-conversion.json', 'ib-calendar.json', 'preparation.json']) {
  inspect(JSON.parse(await fs.readFile(path.join(DATA, name), 'utf8')), name);
}

const statements = JSON.parse(await fs.readFile(path.join(DATA, 'ib-statements.json'), 'utf8'));
inspect(statements, 'ib-statements.json');
assert.equal(statements.database.url, 'https://recognition.ibo.org/');
assert.ok(isoDate(statements.database.retrievedAt), 'IB database keeps its checked date');
for (const [key, statement] of Object.entries(statements.statements)) {
  if (!schools.has(key)) problems.push(`ib-statements.json.${key}: unknown institution`);
  if (!/^https:\/\/recognition\.ibo\.org\/en-US\/university-statements\/\?id=[0-9a-f-]{36}$/.test(statement.statementUrl)) problems.push(`ib-statements.json.${key}: no direct IB statement URL`);
  for (const qualification of ['diploma', 'courseResults']) {
    if (![true, false, null].includes(statement.recognises?.[qualification])) problems.push(`ib-statements.json.${key}: ${qualification} recognition must be explicit or unknown`);
  }
  if (!(statement.sources || []).some((source) => source.url === statement.statementUrl)) problems.push(`ib-statements.json.${key}: no source for the statement`);
}

assert.deepEqual(problems, [], problems.join('\n'));
console.log(`  ok    ${sourceCount} citations retain source links and checked dates; ${factCount} dated facts and requirements are sourced`);
console.log('  ok    IB statements refer to existing institutions and distinguish Diploma from Course Results');
