/**
 * Checks the school records in data/schools/ (schemas/school.schema.json).
 *
 *   node scripts/check-schools.mjs                 # every record
 *   node scripts/check-schools.mjs fi-uh fi-aalto  # just these
 *
 * Beyond the schema: the key must name an institution in data/countries/, the
 * scope must agree with the programme list, no link the page hands a
 * student on to may be a homepage (issue #43), and a programme's `needs` must
 * name real IB subjects (data/ib-subjects.json) at a level each is offered at,
 * because its page names them from that catalogue. A date whose label says it
 * is only for applicants who already hold the Diploma ("only if you already
 * hold your IB Diploma", "not for final-year IB students") must carry
 * `forDiplomaHolders`, and so must every other date of its round, because a
 * programme page never makes such a date a final-year student's "Apply by".
 * One programme offered on several campuses or as several paths is one card
 * (issue #52): its members share a `family`, two programmes of one subject
 * that stay apart say so in `separateFrom`, and no two cards of one school
 * may share a name (src/lib/families.mjs checkSchoolFamilies).
 * A date scoped to some programmes (`programmes`) names real ones, by the slug
 * of their page; a programme's `round` is one its school's dates name; and no
 * name carries an acute accent (´) where an apostrophe belongs.
 * Exits non-zero on any failure.
 */
import fs from 'node:fs';
import path from 'node:path';
import { SchemaSet } from '../src/lib/validate-schema.mjs';
import { schoolKeys, isHomepage, saysForDiplomaHolders, roundOf, programmePaths } from '../src/lib/schools.mjs';
import { checkSchoolFamilies } from '../src/lib/families.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'data', 'schools');

const set = new SchemaSet();
for (const f of ['common.schema.json', 'school.schema.json']) {
  set.add(f, JSON.parse(fs.readFileSync(path.join(ROOT, 'schemas', f), 'utf8')));
}

const known = schoolKeys(path.join(ROOT, 'data', 'countries'));
/* The IB subject catalogue: every id a `needs` entry may name, and its levels. */
const IB = new Map(
  JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'ib-subjects.json'), 'utf8')).subjects.map((x) => [x.id, x.levels || ['HL', 'SL']])
);

/** What is wrong with one programme's `needs`, as sentences. */
function needsProblems(needs = [], where = 'needs') {
  const out = [];
  for (const [j, n] of (needs || []).entries()) {
    for (const option of n.anyOf || []) {
      // "<id>" at the need's level, or "<id>@HL" / "<id>@SL" at that level alone.
      const [id, at] = String(option).split('@');
      const level = at || n.level;
      const levels = IB.get(id);
      if (!levels) out.push(`${where}[${j}]: "${id}" is not an IB subject in data/ib-subjects.json`);
      else if (at !== undefined && !['HL', 'SL'].includes(at)) out.push(`${where}[${j}]: "${option}" names no IB level (use @HL or @SL)`);
      else if (level && level !== 'any' && !levels.includes(level)) {
        out.push(`${where}[${j}]: "${id}" is not offered at ${level} (only ${levels.join(', ')})`);
      }
    }
  }
  return out;
}

/** What is wrong with a record's dates only for Diploma holders, as sentences. */
function holdersProblems(rec) {
  const out = [];
  const dates = rec.dates || [];
  const rounds = new Set(dates.filter((d) => d.forDiplomaHolders).map((d) => roundOf(d.label)));
  for (const [i, d] of dates.entries()) {
    if (d.forDiplomaHolders) continue;
    if (saysForDiplomaHolders(d.label)) out.push(`dates[${i}] "${d.label}" says it is for Diploma holders only: set forDiplomaHolders`);
    else if (rounds.has(roundOf(d.label))) out.push(`dates[${i}] "${d.label}" is a date of a round for Diploma holders only: set forDiplomaHolders`);
  }
  /* A round the school has not confirmed ("if a programme runs it") is
     provisional on every one of its dates. */
  const unconfirmed = new Set(dates.filter((d) => /\bif a programme runs it\b/i.test(d.label)).map((d) => roundOf(d.label)));
  for (const [i, d] of dates.entries()) {
    if (!d.provisional && unconfirmed.has(roundOf(d.label))) out.push(`dates[${i}] "${d.label}" is a date of a round not confirmed for 2027: set provisional`);
  }
  for (const [i, p] of (rec.programmes || []).entries()) {
    if (p.closesForDiplomaHolders && !p.closes) out.push(`programmes[${i}] "${p.name}" has closesForDiplomaHolders but no closes`);
  }
  return out;
}

/** What is wrong with a record's early dates and labels, as sentences. */
const EARLY_WORDS = /\b(early|bird|priority|discount)\b/i;
function earlyProblems(rec) {
  const out = [];
  for (const [i, d] of (rec.dates || []).entries()) {
    /* An earlier chance is never the deadline: it is `early`, which a
       programme page gives as the Apply-by tile's note. */
    if (d.kind === 'closes' && EARLY_WORDS.test(d.label)) out.push(`dates[${i}] "${d.label}" is an earlier chance, not the deadline: kind "early"`);
    /* A researcher's working note is not for a student. */
    if (/page gives no year/i.test(d.label)) out.push(`dates[${i}] "${d.label}": say "(yearly date)" and set provisional`);
  }
  if ((rec.lastYear || (rec.programmes || []).some((p) => p.lastYear)) && rec.noDeadline) out.push('lastYear and noDeadline cannot both be said');
  return out;
}

/* Self-test: the early rule must catch an early bird left as a deadline and a
   researcher's note, and pass a final deadline. */
{
  const d = (label, kind = 'closes') => ({ label, date: '2027-01-15', kind, url: 'https://x.test/' });
  const ok = [
    earlyProblems({ dates: [d('Super Early Bird: €2,000 off')] }).length === 1,
    earlyProblems({ dates: [d('Priority deadline')] }).length === 1,
    earlyProblems({ dates: [d('Super Early Bird: €2,000 off', 'early')] }).length === 0,
    earlyProblems({ dates: [d('Final deadline (page gives no year)')] }).length === 1,
    earlyProblems({ dates: [d('Final deadline, fall entry (yearly date)')] }).length === 0,
  ];
  if (ok.some((x) => !x)) {
    console.log('✗ self-test: the early-date rule misjudges a date');
    process.exit(1);
  }
}

/** What is wrong with a record's scopes and rounds, as sentences. */
function scopeProblems(rec, key) {
  const out = [];
  const slugs = new Set(programmePaths(key, rec.programmes || []).map((p) => p.slug));
  const rounds = new Set((rec.dates || []).map((d) => roundOf(d.label)));
  for (const [i, d] of (rec.dates || []).entries()) {
    for (const slug of d.programmes || []) {
      if (!slugs.has(slug)) out.push(`dates[${i}] "${d.label}" is scoped to "${slug}", which is no programme of this record`);
    }
  }
  for (const [i, p] of (rec.programmes || []).entries()) {
    if (p.round && !rounds.has(roundOf(p.round))) out.push(`programmes[${i}] "${p.name}" runs in "${p.round}", which no date of this record names`);
    if (/\u00B4/.test(p.name)) out.push(`programmes[${i}] "${p.name}" has an acute accent (´) for an apostrophe`);
  }
  if (/\u00B4/.test(rec.name || '')) out.push(`name "${rec.name}" has an acute accent (´) for an apostrophe`);
  return out;
}

/* Self-test: the scope rule must catch an unknown slug, an unknown round and
   an acute accent, and pass a real slug and round. */
{
  const rec = {
    name: 'X',
    programmes: [{ name: 'Metal Art' }, { name: 'Bachelor\u00B4s Programme in Y', round: 'June round' }],
    dates: [{ label: 'April round closes', programmes: ['metal-art', 'nope'] }],
  };
  const good = { name: 'X', programmes: [{ name: 'Metal Art', round: 'April round' }], dates: [{ label: 'April round closes', programmes: ['metal-art'] }] };
  if (scopeProblems(rec, 'xx-x').length !== 3 || scopeProblems(good, 'xx-x').length !== 0) {
    console.log('✗ self-test: the scope rule misjudges a record');
    process.exit(1);
  }
}

/* Self-test: the Diploma-holders rule must catch the wording and a sibling
   date of the same round, and pass the qualification's name ("IB Diploma
   holders") and an April round beside a flagged January one. */
{
  const d = (label, flag) => ({ label, date: '2027-01-15', kind: 'closes', url: 'https://x.test/', ...(flag ? { forDiplomaHolders: true } : {}) });
  const ok = [
    holdersProblems({ dates: [d('January round closes (only if you already hold your IB Diploma)')] }).length === 1,
    holdersProblems({ dates: [d('January round closes (not for final-year IB students)')] }).length === 1,
    holdersProblems({ dates: [d('January round opens (only if you already hold your IB Diploma)', true), d('January round: documents due')] }).length === 1,
    holdersProblems({ dates: [d('January round opens (only if you already hold your IB Diploma)', true), d('April round closes')] }).length === 0,
    holdersProblems({ dates: [d('Admission group 2 (IB Diploma holders) closes')] }).length === 0,
    holdersProblems({ programmes: [{ name: 'X', closesForDiplomaHolders: true }] }).length === 1,
  ];
  if (ok.some((x) => !x)) {
    console.log('✗ self-test: the Diploma-holders rule misjudges a date');
    process.exit(1);
  }
}

/* Self-test: the needs rule must refuse an invented id and a level a subject
   is not offered at, and pass a real one. */
{
  const abInitio = [...IB].find(([, l]) => !l.includes('HL'))?.[0];
  const bad = [
    needsProblems([{ anyOf: ['not-a-subject'], level: 'HL' }]).length === 1,
    !abInitio || needsProblems([{ anyOf: [abInitio], level: 'HL' }]).length === 1,
    needsProblems([{ anyOf: [[...IB.keys()][0]], level: 'any' }]).length === 0,
    needsProblems([{ anyOf: ['not-a-subject@HL'], level: 'SL' }]).length === 1,
    !abInitio || needsProblems([{ anyOf: [`${abInitio}@HL`], level: 'SL' }]).length === 1,
    needsProblems([{ anyOf: [`${[...IB.keys()][0]}@XL`], level: 'SL' }]).length === 1,
    needsProblems([{ anyOf: [[...IB.keys()][0], `${[...IB.keys()][0]}@HL`], level: 'SL' }]).length === 0,
  ].some((ok) => !ok);
  if (bad) {
    console.log('✗ self-test: the needs rule cannot tell a catalogue subject from an invented one');
    process.exit(1);
  }
}
/* Self-test: the family rule must refuse two cards with one name, a pair of
   one subject that is neither a family nor declared separate, and a family
   whose paths do not differ; and pass a proper family and a declared pair. */
{
  const prog = (name, extra = {}) => ({ name, credential: 'BSc', years: 3, ...extra });
  const fam = (path, extra = {}) => ({ name: 'Physics', axis: 'campus', path, differs: `Taught in ${path}.`, ...extra });
  const bad = [
    checkSchoolFamilies([prog('Physics'), prog('Physics', { city: 'B' })]).length > 0,
    checkSchoolFamilies([prog('Physics'), prog('Physics (double degree)')]).length > 0,
    checkSchoolFamilies([prog('Physics', { city: 'A', family: fam('A', { primary: true }) }), prog('Physics', { city: 'A', family: fam('B') })]).length > 0,
    checkSchoolFamilies([prog('Physics', { city: 'A', family: fam('A', { primary: true }) }), prog('Physics', { city: 'B', family: fam('B') })]).length === 0,
    checkSchoolFamilies([prog('Physics', { separateFrom: [{ name: 'Physics - Astro', reason: 'x' }] }), prog('Physics - Astro')]).length === 0,
    /* The owner's complaint (#52) in every shape a title takes: a campus in
       brackets, after "at" or ", Campus", or bare; a degree prefix; a longer
       version; a near name. Each must be a family or declared separate. */
    ...[
      ['Civil Engineering', 'Civil Engineering (Lappeenranta)'],
      ['Economics', 'BSc in Economics'],
      ['Economics', "Bachelor's Programme in Economics"],
      ['Economics', 'Economics, Campus Herning'],
      ['Economics', 'Economics at Herning'],
      ['Economics', 'Economics Venlo'],
      ['BSc in Management', 'BSc in Management with Professional Experience'],
      ['International Business', 'International Business and Politics'],
      ['Sciences, Mathematics', 'Sciences, Physics'],
    ].map(([a, b]) => checkSchoolFamilies([prog(a), prog(b, { city: 'Venlo' })], 'x', ['Herning']).length > 0),
    checkSchoolFamilies([prog('Economics'), prog('Philosophy')]).length === 0,
  ].some((ok) => !ok);
  if (bad) {
    console.log('✗ self-test: the family rule lets two cards of one name through, or refuses a proper family');
    process.exit(1);
  }
}
const only = process.argv.slice(2).map((a) => a.replace(/\.json$/, ''));
const files = fs.existsSync(DIR)
  ? fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && (!only.length || only.includes(f.slice(0, -5))))
  : [];

let failures = 0;
const counts = { listed: 0, catalogue: 0, none: 0, programmes: 0 };

for (const f of files.sort()) {
  const key = f.slice(0, -5);
  const problems = [];
  let rec;
  try {
    rec = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  } catch (err) {
    problems.push(`not JSON: ${err.message}`);
  }

  if (rec) {
    problems.push(...set.validate(rec, 'school.schema.json').map((e) => (typeof e === 'string' ? e : `${e.path}: ${e.message}`)));
    const inst = known.get(key);
    if (rec.institution !== key) problems.push(`institution "${rec.institution}" does not match the file name`);
    if (!inst) problems.push(`no institution with key "${key}" in data/countries/`);

    const progs = rec.programmes || [];
    if (rec.scope === 'listed' && !progs.length) problems.push('scope is "listed" but no programmes are listed');
    if (rec.scope !== 'listed' && progs.length) problems.push(`scope is "${rec.scope}" but programmes are listed`);

    const home = inst?.website;
    if (rec.handoff?.url && isHomepage(rec.handoff.url, home)) problems.push(`handoff is a homepage: ${rec.handoff.url}`);
    const seen = new Set();
    for (const [i, p] of progs.entries()) {
      if (isHomepage(p.url, home)) problems.push(`programmes[${i}] "${p.name}" links to a homepage`);
      if (seen.has(p.url)) problems.push(`programmes[${i}] "${p.name}" shares its link with another programme`);
      problems.push(...needsProblems(p.needs, `programmes[${i}] "${p.name}" needs`));
      seen.add(p.url);
    }
    for (const [i, d] of (rec.dates || []).entries()) {
      if (d.date < '2026-01-01' || d.date > '2027-12-31') problems.push(`dates[${i}] ${d.date} is outside the 2027 cycle`);
    }
    problems.push(...holdersProblems(rec));
    problems.push(...checkSchoolFamilies(progs, 'programmes', [inst?.city].filter(Boolean)));
    problems.push(...scopeProblems(rec, key));
    problems.push(...earlyProblems(rec));

    counts[rec.scope] = (counts[rec.scope] || 0) + 1;
    counts.programmes += progs.length;
  }

  if (problems.length) {
    failures++;
    console.log(`✗ data/schools/${f}`);
    for (const p of problems) console.log(`    ${p}`);
  }
}

console.log(
  `${files.length} school records · ${counts.listed} listed (${counts.programmes} programmes) · ` +
    `${counts.catalogue} catalogue · ${counts.none} none · ${failures} failing · ` +
    `${known.size - (only.length ? 0 : files.length)} of ${known.size} institutions without one`
);
process.exit(failures ? 1 : 0);
