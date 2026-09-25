/**
 * Phase 2b: the busy-file batch. Applies the inventory's A/B/money edits to
 * data/countries, data/destinations, data/evidence and data/application-routes
 * (plus data/application-systems), after re-validating each against the
 * *current* text. It also turns SU funding lines into references to
 * data/funding/dk-su.json, and sets the two scholarship access states.
 *
 *   node docs/research/audience/apply-busy.mjs            # dry run, reports stale edits
 *   node docs/research/audience/apply-busy.mjs --write
 *
 * Locating an edit: the string at the inventory's JSON path, if it still holds
 * the `find`; otherwise the one string in the same file that holds it. If
 * neither, the edit is reported as stale, for a person to re-read, and
 * nothing is guessed. Already-applied edits are skipped, so this re-runs.
 * Values are substituted into the raw text, so each file keeps its formatting.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = import.meta.dirname;
const ROOT = path.resolve(DIR, '../../..');
const WRITE = process.argv.includes('--write');
const SCOPE = /^data\/(countries|destinations|evidence|application-routes|application-systems)\//;

/* --- ECB reference rates, 24 September 2026 (verification.md §6) ---------- */
const AT = 'at the ECB rate of 24 September 2026';

/* Edits whose EUR figures or wording were corrected after verification.
   Keyed by candidate id; each replaces that candidate's edit list. */
const OVERRIDE = {
  '02885089a1': [['CHF 2,190 per semester rather than CHF 730', `CHF 2,190 per semester (about €2,330 ${AT}) rather than CHF 730`]],
  '8b6c1a0429': [['CHF 2,190 per semester against CHF 730', 'CHF 2,190 (about €2,330) per semester against CHF 730 (about €780)']],
  '4b8a566a40': [
    ['CHF 2,190 per semester', `CHF 2,190 (about €2,330 ${AT}) per semester`],
    ['CHF 730 for Swiss residents', 'CHF 730 (about €780) for Swiss residents'],
  ],
  '1e5a320c7d': [[
    'for a Danish IB student is roughly GBP 22,000-40,000 a year for a normal degree, and GBP 45,000-70,000 a year for clinical medicine.',
    `for an IB student from Denmark paying international fees is roughly GBP 22,000-40,000 (about €25,600-46,500) a year for a normal degree, and GBP 45,000-70,000 (about €52,300-81,400) a year for clinical medicine, ${AT}.`,
  ]],
  '50e7f11f1e': [['Immigration Health Surcharge of GBP 776 per year', 'Immigration Health Surcharge of GBP 776 (about €900) per year']],
  '6d514d3d42': [['about DKK 770,000 to 940,000 at September 2026 exchange rates', `about €101,000 to 123,000 (DKK 755,000 to 922,000) ${AT}`]],
  e20666d257: [['about HK$250,000 to 280,000 a year at HKU', `about HK$250,000 to 280,000 (about €28,000–31,400 ${AT}) a year at HKU`]],
  ef71d7f3de: [['a 250 USD entrance exam fee', `a 250 USD (about €220 ${AT}) entrance exam fee`]],
  '5fb59dbf90': [['ISK 1,794,000 a year', `ISK 1,794,000 (about €13,000 ${AT}) a year`]],
  dbdb603670: null, // jp funding[0] (MEXT): re-read below — its SU/MEXT wording is handled with the MEXT change
  '3d0af8d0e1': [['117,000 yen a month', `117,000 yen (about €650 ${AT}) a month`]],
  '15df3051bd': [
    ['tuition up to 5m KRW a semester', `tuition up to 5m KRW (about €3,200 ${AT}) a semester`],
    ['14.4m KRW a year', '14.4m KRW (about €9,300) a year'],
  ],
  '6198107947': [['458,340 KRW a semester', `458,340 KRW (about €295 ${AT}) a semester`]],
  '3ea04b0657': [['664,000 KRW a semester', `664,000 KRW (about €430 ${AT}) a semester`]],
  '58a154061e': [['Harvard\'s is 4,954 USD and Berkeley\'s SHIP 5,066 USD for 2026-27', `Harvard's is 4,954 USD and Berkeley's SHIP 5,066 USD for 2026-27 (about €4,360 and €4,460 ${AT})`]],
  '22cbf7ee30': [['from about 62,000 USD for an international student at Illinois to 95,000-100,000 USD at Harvard', `from about 62,000 USD (about €54,500) for an international student at Illinois to 95,000-100,000 USD (about €83,600–88,000, ${AT}) at Harvard`]],
  '17e705f1a7': [["Arizona State puts an international student's total at 69,906 USD.", `Arizona State puts an international student's total at 69,906 USD (about €61,500 ${AT}).`]],
  fb057c1024: [['from nothing at Colby to 100 USD at Stanford.', 'from nothing at Colby to 100 USD (about €88) at Stanford.']],
  d91265009c: [],
  '376330fe7f': [['2,533 USD per semester', `2,533 USD (about €2,230 ${AT}) per semester`]],
  /* Hungary: bilateral scholarships depend on nationality (verification §4). */
  '8ae715f9fb': [['A realistic conclusion: a Danish IB student in Hungary is self-funded, with Danish SU as the only meaningful support.',
    "A realistic conclusion: unless your country has a bilateral scholarship agreement with Hungary, you are self-funded here, with Danish SU if you can claim it, or your own country's student finance, as the only meaningful support."]],
};

/* --- SU funding lines become references (verification §1) ---------------- */
const EU = 'The programme must be SU-approved, and outside the Nordics SU is capped at four years (48 klip).';
const OUT = 'A full degree outside the EU/EEA follows separate rules, with its own ties-to-Denmark form: check su.dk before budgeting.';
const RATE = 'In 2026 it is DKK 7,426 a month before tax if you live away from your parents.';
const NORDIC = (n) => `Because ${n} is a Nordic country, it is paid as if you studied in Denmark — for anyone starting after 1 July 2025, for the programme's prescribed length only.`;
const LEAVE = 'Apply to Uddannelses- og Forskningsstyrelsen before you leave.';
const SU = {
  'data/countries/ae.json|funding[4]': OUT,
  'data/countries/at.json|funding[0]': `${EU} It is usually the biggest single source of money.`,
  'data/countries/au.json|funding[4]': OUT,
  'data/countries/be.json|funding[0]': `${EU} ${LEAVE}`,
  'data/countries/ca.json|funding[3]': OUT,
  'data/countries/ch.json|funding[0]': 'Check with su.dk whether and how a Swiss degree qualifies, because Swiss living costs make this the decisive factor.',
  'data/countries/cn.json|funding[6]': OUT,
  'data/countries/cz.json|funding[0]': `${RATE} ${EU} The cap does not cover a six-year medical degree.`,
  'data/countries/de.json|funding[0]': `${EU} It is usually the largest single source of money.`,
  'data/countries/ee.json|funding[0]': `${RATE} ${EU} There is no extra SU if you are delayed.`,
  'data/countries/es.json|funding[0]': EU,
  'data/countries/fi.json|funding[0]': `${NORDIC('Finland')} The programme must be officially recognised in Finland. Apply in minSU Fast Track no later than the first month you want support for.`,
  'data/countries/fr.json|funding[0]': EU,
  'data/countries/gb.json|funding[2]': 'The UK is outside the EU/EEA, so a full degree there follows separate rules, with its own ties-to-Denmark form: check su.dk early.',
  'data/countries/gr.json|funding[1]': EU,
  'data/countries/hk.json|funding[4]': OUT,
  'data/countries/hu.json|funding[0]': `${RATE} ${EU} The cap does not cover a six-year medical degree: plan for that gap.`,
  'data/countries/ie.json|funding[1]': `${EU} ${LEAVE}`,
  'data/countries/is.json|funding[0]': `${RATE} ${NORDIC('Iceland')} Apply through minSU Fast Track no later than the first month you want support for, and document your progress twice a year.`,
  'data/countries/it.json|funding[0]': EU,
  'data/countries/jp.json|funding[6]': OUT,
  'data/countries/kr.json|funding[4]': OUT,
  'data/countries/lt.json|funding[2]': EU,
  'data/countries/lu.json|funding[0]': `${EU} ${LEAVE}`,
  'data/countries/lv.json|funding[2]': EU,
  'data/countries/mt.json|funding[2]': EU,
  'data/countries/nl.json|funding[0]': `${EU} ${LEAVE}`,
  'data/countries/no.json|funding[0]': `${RATE} ${NORDIC('Norway')} It draws on the same SU-klip as a Danish degree.`,
  'data/countries/nz.json|funding[4]': OUT,
  'data/countries/pl.json|funding[7]': `${EU} Danish tuition support is decided in Denmark too, at su.dk and ufm.dk: apply early.`,
  'data/countries/pt.json|funding[0]': EU,
  'data/countries/se.json|funding[0]': NORDIC('Sweden'),
  'data/countries/sg.json|funding[6]': OUT,
  'data/countries/si.json|funding[3]': EU,
  'data/countries/us.json|funding[4]': `${OUT} The application has its own deadlines.`,
  'data/destinations/au.json|livingContext.funding[3]': OUT,
  'data/destinations/ca.json|livingContext.funding[3]': OUT,
  'data/destinations/jp.json|livingContext.funding[4]': OUT,
  'data/destinations/kr.json|livingContext.funding[3]': OUT,
  'data/destinations/nz.json|livingContext.funding[3]': OUT,
  'data/destinations/dk.json|livingContext.funding[0]': 'It is DKK 7,426 a month before tax in 2026 if you live away from your parents, with a loan of up to DKK 3,799 on top.',
};
/* dk's second line restated the job route only; the reference now carries all three. */
const DROP = new Set(['data/destinations/dk.json|livingContext.funding[1]']);

/* --- Scholarship access (verification §2, §3, §7) ------------------------- */
const MEXT = {
  state: 'conditional',
  reason: 'Depends on your nationality: you apply through the Japanese embassy in your country of citizenship, and each decides what it offers. The one in Copenhagen offers Danish nationals no undergraduate call.',
  evidence: ['ev-jp-mext-ug-2027-guidelines', 'ev-jp-embassy-denmark-mext-types'],
};
const GKS = {
  state: 'closed',
  reason: 'The 2027 round needs a graduation certificate by 31 December 2026, which a May 2027 IB candidate cannot supply, whatever their passport.',
  evidence: ['ev-kr-gks-2027-eligibility', 'ev-kr-gks-2027-countries'],
};
const ACCESS = {
  'data/application-routes/jp-mext-embassy-2028.json|readerAccess': MEXT,
  'data/countries/jp.json|application.deadlines[route=jp-mext-embassy-2028].readerAccess': MEXT,
  'data/application-routes/kr-gks-embassy-2027.json|readerAccess': GKS,
  'data/countries/kr.json|application.deadlines[route=kr-gks-embassy-2027].readerAccess': GKS,
};

/* --- Machinery ------------------------------------------------------------ */

const parsePath = (p) => p.match(/[^.[\]]+|\[[^\]]+\]/g).map((k) => (k.startsWith('[') ? k.slice(1, -1) : k));
function resolve(obj, p) {
  let parent = null, key = null, o = obj;
  for (const k of parsePath(p)) {
    parent = o;
    if (Array.isArray(o) && k.includes('=')) {
      const [f, v] = k.split('=');
      key = o.findIndex((x) => x?.[f] === v);
    } else key = Array.isArray(o) ? Number(k) : k;
    o = o?.[key];
  }
  return { parent, key, value: o };
}
function* strings(v, p = '') {
  if (typeof v === 'string') yield [p, v];
  else if (Array.isArray(v)) for (let i = 0; i < v.length; i++) yield* strings(v[i], `${p}[${i}]`);
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) yield* strings(x, p ? `${p}.${k}` : k);
}

const inv = fs.readFileSync(path.join(DIR, 'inventory.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const files = new Map(); // file -> { raw, json, changes: [[old, new]] }
const doc = (file) => {
  if (!files.has(file)) {
    const raw = fs.readFileSync(path.join(ROOT, file), 'utf8');
    files.set(file, { raw, json: JSON.parse(raw), changes: [] });
  }
  return files.get(file);
};

const report = { applied: 0, already: 0, relocated: 0, stale: [], su: 0, access: 0, dropped: 0 };

for (const l of inv) {
  if (!SCOPE.test(l.file) || l.class === 'C') continue;
  const key = `${l.file}|${l.path}`;
  if (SU[key] || DROP.has(key)) continue;
  if (l.path.endsWith('readerAccess.reason')) continue;
  let edits = l.edits.map((e) => [e.find, e.replace]);
  if (l.candidateId in OVERRIDE) edits = OVERRIDE[l.candidateId] || [];
  if (!edits.length) continue;
  const d = doc(l.file);
  for (const [find, replace] of edits) {
    let { parent, key: k, value } = resolve(d.json, l.path);
    if (typeof value === 'string' && value.includes(replace)) { report.already++; continue; }
    if (typeof value !== 'string' || !value.includes(find)) {
      const hits = [...strings(d.json)].filter(([, s]) => s.includes(find) && !s.includes(replace));
      const done = [...strings(d.json)].some(([, s]) => s.includes(replace));
      if (done) { report.already++; continue; }
      if (hits.length !== 1) { report.stale.push(`${l.candidateId} ${l.file} ${l.path}: "${find.slice(0, 80)}" ${hits.length ? `in ${hits.length} strings` : 'not found'}`); continue; }
      ({ parent, key: k, value } = resolve(d.json, hits[0][0]));
      report.relocated++;
    }
    const next = value.replace(find, replace);
    d.changes.push([value, next]);
    parent[k] = next;
    report.applied++;
  }
}

for (const [key, note] of Object.entries(SU)) {
  const [file, p] = key.split('|');
  const d = doc(file);
  const { parent, key: k, value } = resolve(d.json, p);
  if (value && typeof value === 'object' && value.fund) { report.already++; continue; }
  if (typeof value !== 'string' || !/\bSU\b/.test(value)) { report.stale.push(`SU line ${key}: not an SU line any more — "${String(value).slice(0, 60)}"`); continue; }
  d.changes.push([value, { fund: 'fund-dk-su', note }]);
  parent[k] = { fund: 'fund-dk-su', note };
  report.su++;
}
for (const key of DROP) {
  const [file, p] = key.split('|');
  const d = doc(file);
  const { parent, key: k, value } = resolve(d.json, p);
  if (typeof value === 'string' && /equal-treatment status/.test(value)) { parent.splice(k, 1); d.changes.push([value, null]); report.dropped++; }
}
for (const [key, access] of Object.entries(ACCESS)) {
  const [file, p] = key.split('|');
  const d = doc(file);
  const { parent, key: k, value } = resolve(d.json, p);
  if (!value) { report.stale.push(`access ${key}: not found`); continue; }
  if (JSON.stringify(value) === JSON.stringify(access)) { report.already++; continue; }
  parent[k] = access;
  d.changes.push([value, access]);
  report.access++;
}

/* Write. Files whose raw formatting survives a round trip are re-serialised;
   the others get each changed string substituted in their raw text. */
for (const [file, d] of files) {
  if (!d.changes.length) continue;
  const roundTrips = JSON.stringify(JSON.parse(d.raw), null, 2) + '\n' === d.raw;
  let out;
  if (roundTrips) out = JSON.stringify(d.json, null, 2) + '\n';
  else {
    out = d.raw;
    for (const [from, to] of d.changes) {
      if (typeof from !== 'string') throw new Error(`${file}: structural change in a file that does not round-trip`);
      const f = JSON.stringify(from);
      if (!out.includes(f)) throw new Error(`${file}: cannot find a changed string verbatim`);
      /* A string that became a reference is written compactly, in the style
         these hand-formatted files already use for small objects. */
      const t = typeof to === 'string' ? JSON.stringify(to) : `{ ${Object.entries(to).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(', ')} }`;
      out = out.split(f).join(t);
    }
  }
  JSON.parse(out);
  if (WRITE) fs.writeFileSync(path.join(ROOT, file), out);
}

console.log(`${WRITE ? 'Applied' : 'Would apply'}: ${report.applied} edits (${report.relocated} relocated), ${report.su} SU lines → fund-dk-su, ${report.dropped} dropped, ${report.access} access states. Already applied: ${report.already}. Files: ${[...files.values()].filter((d) => d.changes.length).length}.`);
if (report.stale.length) {
  console.log(`\n${report.stale.length} stale — re-read by hand:`);
  for (const s of report.stale) console.log('  ' + s);
}
