/**
 * Compares the draft guard with the reviewers' classifications in
 * inventory.jsonl. Run after build-inventory.mjs.
 *
 *   node docs/research/audience/draft/calibrate.mjs [--list]
 *
 * - guard hit on a string reviewers called C   → false positive (allowlist or tighten)
 * - reviewers' A/B string the guard misses       → coverage gap (fine if not pattern-shaped)
 * - guard hit on the proposed rewrite            → the rewrite would still fail the guard
 */
import fs from 'node:fs';
import path from 'node:path';
import { audienceRules, audienceLabels, problemsIn } from '../../../../scripts/lib/audience.mjs';

const DIR = path.resolve(import.meta.dirname, '..');
const ROOT = path.resolve(DIR, '../../..');
const LIST = process.argv.includes('--list');

const audience = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site-config.json'), 'utf8')).audience;
const dest = JSON.parse(fs.readFileSync(path.join(ROOT, `data/destinations/${audience.schoolCountry}.json`), 'utf8'));
const who = { adjective: dest.adjective, name: dest.name, ...audience.schoolCountryPeople, grants: audience.citizenGrants || [] };
const rules = audienceRules(who);
const labels = audienceLabels(who);
const hit = (t) => problemsIn(t, rules, labels);

const inv = fs.readFileSync(path.join(DIR, 'inventory.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const reviewed = new Map();
for (const l of inv) if (l.candidateId) reviewed.set(l.candidateId, l);

const fp = [], gap = [], stillFails = [], caught = [];
for (const l of reviewed.values()) {
  if (l.note?.includes('Code comment') || l.note?.startsWith('auto:')) continue;
  const h = hit(l.current);
  const bad = l.class === 'A' || l.class === 'B';
  if (h.length && l.class === 'C') fp.push({ l, h });
  if (bad && !h.length) gap.push(l);
  if (bad && h.length) caught.push(l);
  if (l.proposed && hit(l.proposed).length) stillFails.push({ l, h: hit(l.proposed) });
}
const ab = [...reviewed.values()].filter((l) => l.class === 'A' || l.class === 'B').length;
console.log(`reviewed A/B strings: ${ab}; guard catches ${caught.length} (${Math.round((100 * caught.length) / ab)}%)`);
console.log(`false positives (guard hit, reviewers said C): ${fp.length}`);
console.log(`proposed rewrites the guard would still refuse: ${stillFails.length}`);
if (LIST) {
  console.log('\n-- false positives');
  for (const { l, h } of fp) console.log(`  ${l.candidateId} ${l.file} ${l.path} — ${h.map((x) => `${x.rule.id}:"${x.match}"`).join(', ')}`);
  console.log('\n-- rewrites still refused');
  for (const { l, h } of stillFails) console.log(`  ${l.candidateId} ${l.file} ${l.path} — ${h.map((x) => `${x.rule.id}:"${x.match}"`).join(', ')}`);
  console.log('\n-- gaps (A/B not caught), first 40');
  for (const l of gap.slice(0, 40)) console.log(`  ${l.class} ${l.candidateId} ${l.file} ${l.path} — ${l.current.slice(0, 110)}`);
}
