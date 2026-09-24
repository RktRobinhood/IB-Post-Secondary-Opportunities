import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.argv[2];
const OUT = process.argv[3];
const PATTERNS = [
  /\bDanes?\b/,
  /\bDanish (student|applicant|citizen|family|families|IB student|passport|reader|school leaver|pupil|teenager|parent|resident|national|people|household)s?\b/i,
  /\b(from|at|near|close to|away from|leaving|leave|left) home\b/i,
  /\bhome (country|market|university|system)\b/i,
  /\byour (own )?country\b/i,
  /\bDKK\b|\bkroner\b|\bkr\.?\s?\d|\d\s?kr\b/i,
  /\bSU\b|\bSU-|Statens Uddannelsesst/,
  /\bfrom Denmark\b/i,
  /\bDanish perspective\b/i,
  /\bleav(e|ing) Denmark\b/i,
  /\babroad\b/i,
  /\bin Denmark\b/i,
  /\bDenmark\b.{0,40}\b(home|you live|you grew up|your)\b/i,
  /\b(stay|staying) (in Denmark|home)\b/i,
  /\bDanish (citizenship|nationals?|CPR|MitID|NemID|gymnasium|upper[- ]secondary|school|qualification|exam|STX|HHX|HTX|HF)\b/i,
  /\bCPR\b|\bMitID\b|\bNemID\b/,
  /\bhere in Denmark\b|\bback in Denmark\b|\bour country\b/i,
  /\bforeign\b/i,
  /\binternational (student|applicant)s?\b/i,
  /\bnon-EU|\bEU\/EEA|\bEEA\b|\bEU citizens?\b/i,
  /\bnearby\b|\bneighbou?r(ing)?\b/i,
  /\bSwedish neighbour|\bjust across\b|\bfamiliar\b/i,
  /\bDanish\b/,
  /\bdomestic\b/i,
  /\btuition[- ]free\b|\bfree tuition\b|\bno tuition\b/i,
];
const hits = [];
function walk(v, p, file) {
  if (typeof v === 'string') {
    const m = PATTERNS.filter((re) => re.test(v)).map((re) => re.source);
    if (m.length) hits.push({ file, path: p, text: v, pats: m });
  } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}[${i}]`, file));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, p ? `${p}.${k}` : k, file);
}
function files(dir, ext) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...files(f, ext));
    else if (ext.some((x) => e.name.endsWith(x))) out.push(f);
  }
  return out;
}
for (const f of files(path.join(ROOT, 'data'), ['.json'])) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  if (/source-fingerprints|harvests|geo\//.test(rel)) continue;
  try { walk(JSON.parse(fs.readFileSync(f, 'utf8')), '', rel); } catch (e) { console.error('parse', rel, e.message); }
}
for (const dir of ['src/pages', 'src/lib', 'src/assets/js', 'src/templates']) {
  if (!fs.existsSync(path.join(ROOT, dir))) continue;
  for (const f of files(path.join(ROOT, dir), ['.mjs', '.js', '.html'])) {
    const rel = path.relative(ROOT, f).split(path.sep).join('/');
    fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      const m = PATTERNS.filter((re) => re.test(line)).map((re) => re.source);
      if (m.length) hits.push({ file: rel, path: `L${i + 1}`, text: line.trim().slice(0, 600), pats: m });
    });
  }
}
fs.writeFileSync(OUT, hits.map((h) => JSON.stringify(h)).join('\n'));
const byGroup = {};
for (const h of hits) { const g = h.file.split('/').slice(0, 2).join('/'); byGroup[g] = (byGroup[g] || 0) + 1; }
console.log(hits.length, byGroup);
