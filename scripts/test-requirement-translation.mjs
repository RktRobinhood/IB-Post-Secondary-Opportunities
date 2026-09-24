/**
 * No programme card or programme page shows a local-level requirement bare.
 *
 *   node scripts/test-requirement-translation.mjs     (after a build)
 *
 * "Needs English B · Mathematics A" was on every Danish programme card. On a
 * local scale "English B" is a level of study, not the IB course of the same
 * name, and "Mathematics A" means nothing to an IB student at all. The fix is
 * that a requirement published on a local scale is shown with its IB
 * translation leading — computed by the eligibility engine from the
 * Recognition Scheme — and the published form beneath it, small.
 *
 * This reads the built pages and holds them to that:
 *
 *   1. every programme with a local-scale requirement has a `data-req` block on
 *      its programme page, on its institution's page and in the programme
 *      finder's data;
 *   2. inside a block, once the IB text (`.req-ib`), the honest "no IB
 *      equivalent" (`.req-none`) and the published form (`.req-local`) are
 *      taken out, no local "Subject Level" is left over — and the IB text
 *      comes before the published form;
 *   3. every IB phrase in a block is one the engine produces for that
 *      programme, and every translatable requirement's phrase is there;
 *   4. nowhere else on those pages does the bare published line appear;
 *   5. the planner's sentences about a local-scale rule lead with IB terms.
 *
 * Nothing here names a country: the local subject names and level codes are
 * read from data/recognition/, and a Destination with no scheme has nothing
 * to translate and nothing to check.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadCanonical } from '../src/lib/canonical.mjs';
import { assess, buildSubjectIndex, ibTermsFor } from '../src/lib/eligibility.mjs';
import { requirementLine } from '../src/lib/components.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');

let passed = 0;
const failures = [];
const check = (name, ok, detail = '') => {
  if (ok) passed++;
  else failures.push(`${name}${detail ? `\n        ${detail}` : ''}`);
};

/* --- the vocabulary a bare local requirement is written in ----------------- */

const readJson = async (p) => JSON.parse(await fs.readFile(p, 'utf8'));
const recognitionDir = path.join(ROOT, 'data', 'recognition');
const schemes = [];
for (const f of (await fs.readdir(recognitionDir)).filter((x) => x.endsWith('.json'))) {
  schemes.push(await readJson(path.join(recognitionDir, f)));
}
const catalogue = await readJson(path.join(ROOT, 'data', 'ib-subjects.json'));
const subjectIndex = buildSubjectIndex({ subjects: catalogue.subjects, schemes });

const { institutions, programmes } = await loadCanonical();
const scales = new Set(schemes.map((s) => s.subjectScale?.id).filter(Boolean));

const localSubjects = new Set();
const levelCodes = new Set();
for (const s of schemes) {
  for (const l of s.subjectScale?.levels || []) levelCodes.add(l.code);
  for (const row of s.subjectEquivalence || []) {
    for (const targets of Object.values(row.maps || {})) for (const t of targets) localSubjects.add(t.subject);
  }
  for (const row of s.subjectsWithoutEquivalence || []) localSubjects.add(row.subject);
}
const localRules = (reqs) => {
  const out = [];
  const walk = (r) => {
    if (r.kind === 'subject-combination') return (r.alternatives || []).flat().forEach(walk);
    if (r.levelScale && scales.has(r.levelScale) && r.subject && r.level) out.push(r);
  };
  (reqs || []).filter((r) => r.mandatory !== false).forEach(walk);
  return out;
};
for (const p of programmes) for (const r of localRules(p.requirements)) localSubjects.add(r.subject);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const BARE = new RegExp(
  `(?<![A-Za-z])(${[...localSubjects].sort((a, b) => b.length - a.length).map(esc).join('|')})\\s+(${[...levelCodes].map(esc).join('|')})(?![A-Za-z])`,
  'g'
);

/* --- reading a block -------------------------------------------------------- */

const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const text = (s) => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/** Every `data-req` block in a page. Blocks hold no nested <div>. */
const blocks = (page) => [...page.matchAll(/<div[^>]*\bdata-req\b[^>]*>([\s\S]*?)<\/div>/g)].map((m) => m[1]);

const classed = (cls) => new RegExp(`<(span|strong|small)[^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*>([\\s\\S]*?)<\\/\\1>`, 'g');

/**
 * What is wrong with one block, given the IB phrases the engine produces for
 * its programme. An empty list means it passes.
 */
function faults(block, phrases) {
  const out = [];
  const ib = [...block.matchAll(classed('req-ib'))].map((m) => text(m[2]));
  const local = [...block.matchAll(classed('req-local'))];
  const firstIb = block.search(/class="[^"]*\breq-(ib|none)\b/);
  const firstLocal = block.search(/class="[^"]*\breq-local\b/);

  const residue = text(
    block
      .replace(classed('req-ib'), ' ')
      .replace(classed('req-none'), ' ')
      .replace(classed('req-why'), ' ')
      .replace(classed('req-local'), ' ')
  );
  for (const m of residue.matchAll(BARE)) out.push(`"${m[0]}" is shown bare, outside any IB translation: …${residue.slice(Math.max(0, m.index - 30), m.index + 40)}…`);

  if (phrases) {
    if (!local.length) out.push('the requirement as published is not shown beside its translation');
    if (firstLocal !== -1 && (firstIb === -1 || firstLocal < firstIb)) out.push('the published form comes before the IB terms');
    // A requirement already in IB terms sits in the IB slot as published.
    const allowed = new Set([...phrases.values()].flat().concat([...(phrases.native || [])]));
    for (const p of ib) if (!allowed.has(p)) out.push(`"${p}" is in the IB slot but is not a phrase the engine produces for this programme`);
    for (const [local, variants] of phrases) {
      if (!variants.some((v) => ib.includes(v))) out.push(`${local} has an IB translation ("${variants[0]}") that is not shown`);
    }
  }
  return out;
}

/** local form → the IB phrases a page may show for it. */
function phrasesFor(rules, entry = null) {
  const map = new Map();
  const items = [...(entry?.all || []), ...(entry?.oneOfSets || []).flat(2)];
  map.native = new Set(
    items.filter((r) => !r.translation).map((r) => `${r.subject} ${r.level}${r.minGrade ? ` (min ${r.minGrade})` : ''}`)
  );
  for (const r of rules) {
    const t = ibTermsFor(r, subjectIndex);
    if (!t?.phrase) continue;
    map.set(t.local, [t.phrase, t.minIbGrade != null ? `${t.phrase}, at least a ${t.minIbGrade}` : null].filter(Boolean));
  }
  return map;
}

/* --- the guard can see a bare requirement ----------------------------------- */

{
  const before = '<div class="req" data-req><p>Needs English B · Mathematics A</p></div>';
  const beforeFaults = faults(blocks(before)[0], null);
  check('the guard catches the old card ("Needs English B · Mathematics A")', beforeFaults.length === 2, beforeFaults.join('; '));

  const rules = [{ subject: 'Mathematics', level: 'A', levelScale: [...scales][0] }];
  const phrases = phrasesFor(rules);
  const phrase = [...phrases.values()][0]?.[0];
  if (phrase) {
    const after = `<div class="req" data-req><p>Needs <span class="req-ib">${phrase}</span></p><p><span class="req-local">As published: Mathematics A</span></p></div>`;
    check('and passes the same requirement shown IB first', faults(blocks(after)[0], phrases).length === 0, faults(blocks(after)[0], phrases).join('; '));
    const flipped = `<div class="req" data-req><p><span class="req-local">As published: Mathematics A</span></p><p><span class="req-ib">${phrase}</span></p></div>`;
    check('and refuses it with the published form leading', faults(blocks(flipped)[0], phrases).length > 0);
  }
}

/* --- the built pages --------------------------------------------------------- */

const read = async (...parts) => {
  try { return await fs.readFile(path.join(DIST, ...parts), 'utf8'); } catch { return null; }
};

const finder = await read('programmes', 'index.html');
const finderData = (() => {
  const m = finder?.match(/<script type="application\/json" id="programme-data">([\s\S]*?)<\/script>/);
  return m ? new Map(JSON.parse(m[1]).map((p) => [p.id, p])) : new Map();
})();
check('the programme finder is built and carries its data', finderData.size > 0);

const instPages = new Map();
let translatedProgrammes = 0;

for (const p of programmes) {
  const rules = localRules(p.requirements);
  if (!rules.length) continue;
  translatedProgrammes++;
  const phrases = phrasesFor(rules, p.entryRequirements);
  const bareLine = requirementLine(p.entryRequirements);

  // Programme page.
  const page = await read('programmes', p.id, 'index.html');
  if (!page) { check(`${p.id}: programme page is built`, false); continue; }
  const pageBlocks = blocks(page);
  check(`${p.id}: programme page shows its requirements in a data-req block`, pageBlocks.length > 0);
  for (const b of pageBlocks) {
    const f = faults(b, phrases);
    check(`${p.id}: programme page`, !f.length, f.join('\n        '));
  }
  const outside = text(page.replace(/<div[^>]*\bdata-req\b[^>]*>[\s\S]*?<\/div>/g, ' '));
  check(`${p.id}: programme page never prints the bare published line`, !bareLine || !outside.includes(bareLine), bareLine);

  // The programme's card on its institution's page.
  const inst = institutions.find((i) => i.id === p.institutionId);
  if (!instPages.has(p.institutionId)) instPages.set(p.institutionId, await read('universities', p.institutionId, 'index.html'));
  const ip = instPages.get(p.institutionId);
  if (inst && ip) {
    const cardRe = new RegExp(`<article class="card[^"]*">(?:(?!<\\/article>)[\\s\\S])*?/programmes/${esc(p.id)}/(?:(?!<\\/article>)[\\s\\S])*?<\\/article>`);
    const cardHtml = ip.match(cardRe)?.[0];
    check(`${p.id}: has a card on its institution's page`, !!cardHtml);
    if (cardHtml) {
      const cb = blocks(cardHtml);
      check(`${p.id}: its card shows requirements in a data-req block`, cb.length === 1);
      for (const b of cb) {
        const f = faults(b, phrases);
        check(`${p.id}: institution card`, !f.length, f.join('\n        '));
      }
      const cardOutside = text(cardHtml.replace(/<div[^>]*\bdata-req\b[^>]*>[\s\S]*?<\/div>/g, ' '));
      check(`${p.id}: its card never prints the bare published line`, !bareLine || !cardOutside.includes(bareLine), bareLine);
    }
  }

  // The programme finder, which the browser renders from this data as-is.
  const row = finderData.get(p.id);
  check(`${p.id}: is in the programme finder`, !!row);
  if (row) {
    const fb = blocks(row.reqHtml || '');
    check(`${p.id}: finder row carries a data-req block`, fb.length === 1);
    for (const b of fb) {
      const f = faults(b, phrases);
      check(`${p.id}: programme finder`, !f.length, f.join('\n        '));
    }
    check(`${p.id}: finder row has no bare requirements string`, !row.requirements || !BARE.test(row.requirements), row.requirements);
    BARE.lastIndex = 0;
  }
}
check('there are programmes with local-scale requirements to check', translatedProgrammes > 0);

/* --- the planner's sentences ------------------------------------------------- */

{
  const { graph } = await loadCanonical();
  const profile = {
    subjects: [
      { subject: 'english-b', level: 'SL', grade: 4 },
      { subject: 'mathematics-aa', level: 'SL', grade: 5 },
      { subject: 'history', level: 'HL', grade: 6 },
      { subject: 'biology', level: 'HL', grade: 5 },
      { subject: 'chemistry', level: 'SL', grade: 4 },
      { subject: 'psychology', level: 'SL', grade: 5 },
    ],
    totalPoints: 32,
    holdsDiploma: true,
    applicantGroup: null,
    languages: [],
  };
  let seen = 0;
  for (const opp of graph.opportunities.values()) {
    const rules = localRules(opp.requirements).filter((r) => r.kind === 'local-equivalency');
    if (!rules.length) continue;
    const result = assess(profile, opp, { subjectIndex });
    const byId = new Map(rules.map((r) => [r.id, r]));
    for (const e of [...result.matched, ...result.gaps, ...result.unknowns]) {
      const r = byId.get(e.id);
      if (!r) continue;
      seen++;
      const t = ibTermsFor(r, subjectIndex);
      const leads = t.phrase ? e.message.includes(t.phrase) : /^No IB subject is equivalent/.test(e.message);
      check(`${opp.id}: planner sentence for ${t.local} leads with IB terms`, leads, e.message);
    }
  }
  check('the planner sentences were looked at', seen > 0);
}

/* --- report ------------------------------------------------------------------ */

console.log('\nRequirements are shown in IB terms first\n');
if (failures.length) {
  for (const f of failures.slice(0, 40)) console.log(`  ✗ ${f}`);
  if (failures.length > 40) console.log(`  … and ${failures.length - 40} more`);
  console.log(`\n${passed} passed, ${failures.length} failed\n`);
  process.exit(1);
}
console.log(`  ${translatedProgrammes} programmes with local-scale requirements, all shown IB first.`);
console.log(`\nAll ${passed} checks pass.\n`);
