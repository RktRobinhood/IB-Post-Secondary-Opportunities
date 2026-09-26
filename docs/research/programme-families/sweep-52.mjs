/**
 * The sweep behind campuses-52.md (issue #52): every institution, every pair of
 * programmes with the same or a near-same title, in data/programmes (with the
 * Opportunity campus) and in data/schools/*.json. It prints; it decides nothing.
 * The decisions are the family / separateFrom blocks on the records, and the
 * guards (check-schools, validate, test-card-names) hold them.
 *
 *   node docs/research/programme-families/sweep-52.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
const R = path.resolve(import.meta.dirname, '..', '..', '..');
const rd = (d) => fs.readdirSync(path.join(R, d)).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(R, d, f), 'utf8')));
const progs = rd('data/programmes');
const opps = rd('data/opportunities');
const oppOf = new Map(opps.map((o) => [o.programme, o]));
// loose stem: lowercase, remove brackets, dash-suffix, credential words, campus words
const STOP = new Set(['bsc', 'beng', 'ba', 'bba', 'ap', 'pba', 'msc', 'bachelor', 'of', 'in', 'and', 'the', 'hons', 'honours', 'programme', 'degree']);
const stem = (n) => String(n).toLowerCase().replace(/\([^)]*\)/g, ' ').replace(/\s[–—-]\s.*$/, ' ').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w && !STOP.has(w)).join(' ');
const exact = (n) => String(n).toLowerCase().trim();
function groups(items, key) {
  const m = new Map();
  for (const it of items) { const k = key(it); if (!m.has(k)) m.set(k, []); m.get(k).push(it); }
  return [...m.values()].filter((l) => l.length > 1);
}
// near-same: one stem contains the other as a word prefix, at same institution
function near(items, inst, name) {
  const out = [];
  const byInst = new Map();
  for (const it of items) { const k = inst(it); if (!byInst.has(k)) byInst.set(k, []); byInst.get(k).push(it); }
  for (const list of byInst.values()) for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = stem(name(list[i])), b = stem(name(list[j]));
    if (a === b) continue;
    const wa = a.split(' '), wb = b.split(' ');
    const shared = wa.filter((w) => wb.includes(w)).length;
    if ((a && b && (a.startsWith(b + ' ') || b.startsWith(a + ' '))) || shared / Math.max(wa.length, wb.length) >= 0.67) out.push([list[i], list[j]]);
  }
  return out;
}
console.log('## Danish canonical programmes');
for (const g of groups(progs, (p) => p.institution + '|' + stem(p.name))) {
  console.log('SAME', g.map((p) => `${p.id} [${p.name}] fam=${p.family?.id || '-'} sep=${(p.separateFrom || []).map((s) => s.programme).join(',')} place=${oppOf.get(p.id)?.place} ${p.credential?.abbreviation} ${p.credential?.years}`).join('\n     '));
}
for (const [a, b] of near(progs, (p) => p.institution, (p) => p.name)) console.log('NEAR', a.id, `[${a.name}]`, '<>', b.id, `[${b.name}]`, a.family?.id === b.family?.id && a.family ? 'SAMEFAM' : '');
console.log('\n## Schools');
const schools = fs.readdirSync(path.join(R, 'data/schools')).filter((f) => f.endsWith('.json')).map((f) => ({ key: f.slice(0, -5), ...JSON.parse(fs.readFileSync(path.join(R, 'data/schools', f), 'utf8')) }));
let n = 0;
const items = schools.flatMap((s) => (s.programmes || []).map((p, i) => ({ ...p, school: s.key, i })));
console.log('school programmes', items.length, 'schools', schools.length);
for (const g of groups(items, (p) => p.school + '|' + exact(p.name))) {
  n++;
  console.log('EXACT', g[0].school, JSON.stringify(g[0].name));
  for (const p of g) console.log('   ', `#${p.i}`, p.credential, p.years, p.city || '(main)', p.starts || '', p.points ?? '', JSON.stringify(p.needs || []), p.url);
}
for (const g of groups(items, (p) => p.school + '|' + stem(p.name))) {
  if (new Set(g.map((p) => exact(p.name))).size === 1) continue;
  console.log('STEM', g[0].school, g.map((p) => `#${p.i} ${JSON.stringify(p.name)} ${p.credential} ${p.years} ${p.city || ''}${p.family ? ` fam=${JSON.stringify(p.family.name)}` : ''}${p.separateFrom ? ' separateFrom' : ''}`).join(' | '));
}
for (const [a, b] of near(items, (p) => p.school, (p) => p.name)) console.log('NEAR', a.school, `#${a.i} ${JSON.stringify(a.name)} ${a.credential} ${a.city || ''}`, '<>', `#${b.i} ${JSON.stringify(b.name)} ${b.credential} ${b.city || ''}`, a.family && a.family.name === b.family?.name ? 'SAMEFAM' : '');
