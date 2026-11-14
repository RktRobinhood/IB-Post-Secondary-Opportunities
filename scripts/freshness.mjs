/** Report the age of sourced student facts; --rollover lists intake dates. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { sourceFacts } from './lib/source-facts.mjs';
import { loadRecords } from '../src/lib/records.mjs';
const ROOT = path.resolve(import.meta.dirname, '..');
const json = process.argv.includes('--json');
const rollover = process.argv.includes('--rollover');
const today = new Date().toISOString().slice(0, 10);
const policy = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'freshness-policy.json'), 'utf8'));
const records = await loadRecords();
const provisional = [...records.graph.applicationRoutes.values()].flatMap(route => (route.milestones || []).filter(m => m.provisional).map(m => ({ where: 'countries/' + route.destination + '.json', id: m.id, label: m.label, date: m.date, consequence: m.consequence })));
if (rollover) {
  const dateBound = [...records.graph.applicationRoutes.values()].flatMap(route => [...(route.milestones || []).map(m => ({ where: 'countries/' + route.destination + '.json', what: m.label, date: m.date, kind: 'milestone' })), ...(route.rounds || []).map(r => ({ where: 'countries/' + route.destination + '.json', what: r.label, date: r.closes, kind: 'round' }))]);
  for (const [key, school] of records.schools) {
    for (const p of school.programmes || []) {
      for (const intake of p.intakes || []) dateBound.push({ where: 'schools/' + key + '.json', what: p.name + ': ' + intake.intake, date: intake.intake, kind: 'intake' });
      if (p.closes) dateBound.push({ where: 'schools/' + key + '.json', what: p.name, date: p.closes, kind: 'programme-deadline' });
    }
    for (const d of school.dates || []) dateBound.push({ where: 'schools/' + key + '.json', what: d.label, date: d.date, kind: 'school-date' });
  }
  for (const c of records.countries) for (const d of c.application?.deadlines || []) dateBound.push({ where: 'countries/' + c.code + '.json', what: d.label, date: d.date, kind: 'country-deadline' });
  if (json) console.log(JSON.stringify({ rollover: policy.rollover, dateBound, provisional }, null, 2));
  else { console.log('Rollover: ' + policy.rollover.currentIntake + ' → ' + policy.rollover.nextIntake); for (const d of dateBound) console.log(d.where + ' · ' + (d.date || 'not published') + ' · ' + d.what); }
} else {
  const report = { stale: [], incomplete: [], unavailable: [], conflicting: [], fresh: 0, provisional, checkedAt: today };
  for (const fact of await sourceFacts()) {
    if (!fact.retrieved) { report.incomplete.push({ where: fact.file, field: fact.field, what: 'source has no checked date', url: fact.url }); continue; }
    const interval = policy.intervals.find(i => i.matches.some(m => fact.field.includes(m)))?.reviewEveryDays || policy.defaultReviewEveryDays;
    const age = Math.round((new Date(today) - new Date(fact.retrieved)) / 86400000);
    if (age > interval) report.stale.push({ ...fact, age, reason: age + ' days old; interval ' + interval }); else report.fresh++;
  }
  if (json) console.log(JSON.stringify(report, null, 2));
  else { console.log('Source freshness checked ' + today + ': ' + report.fresh + ' current, ' + report.stale.length + ' old, ' + report.incomplete.length + ' missing checked dates.'); for (const fact of report.stale.slice(0, 15)) console.log(fact.file + ' · ' + fact.url + ' · ' + fact.reason); }
}
