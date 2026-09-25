/**
 * No programme card or programme page shows a local-level requirement bare,
 * broken, or twice.
 *
 *   node scripts/test-requirement-translation.mjs     (after a build)
 *
 * "Needs English B · Mathematics A" was on every Danish programme card. On a
 * local scale "English B" is a level of study, not the IB course of the same
 * name, and "Mathematics A" means nothing to an IB student at all. The fix is
 * that a requirement published on a local scale is shown with its IB
 * translation leading — computed by the eligibility engine from the
 * Recognition Scheme and the institution's own published additions — and the
 * published form beneath it, small.
 *
 * This reads the built pages and holds them to that:
 *
 *   1. every programme with a local-scale requirement has a `data-req` block on
 *      its programme page, on its institution's page and in the programme
 *      finder's data;
 *   2. inside a block, once the IB text (`.req-ib`), a non-subject option
 *      (`.req-other`), the honest "no IB route" (`.req-none`, `.req-why`) and
 *      the published form (`.req-local`) are taken out, no local "Subject
 *      Level" is left over — and the IB text comes before the published form;
 *   3. every IB phrase in a block is one `requirementModel` produces for that
 *      programme, and every one it produces is there;
 *   4. no block is broken: no empty "as published" line, no line ending on a
 *      separator ("… /"), no phrase repeated within one list — round 1 of the
 *      critic found all three on nine programmes while this guard passed;
 *   5. nowhere else on those pages does the bare published line appear;
 *   6. the planner's sentences about a local-scale rule lead with IB terms.
 *
 * Nothing here names a country: the local subject names and level codes are
 * read from data/recognition/, and a Destination with no scheme has nothing
 * to translate and nothing to check.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadCanonical } from '../src/lib/canonical.mjs';
import { assess, buildSubjectIndex, ibTermsFor } from '../src/lib/eligibility.mjs';
import { requirementLine, requirementModel } from '../src/lib/components.mjs';

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

const { graph, institutions, programmes } = await loadCanonical();
const subjectIndex = buildSubjectIndex({
  subjects: catalogue.subjects,
  schemes,
  institutions: [...graph.institutions.values()],
});
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
const within = (tag, cls) => new RegExp(`<${tag}[^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'g');

/**
 * What is wrong with one block. `expect` is what `requirementModel` says the
 * block should show: `allowed` (every IB text that may appear) and `required`
 * (every one that must). Without it only the structural checks run.
 */
function faults(block, expect = null) {
  const out = [];
  const ib = [...block.matchAll(classed('req-ib'))].map((m) => text(m[2]));
  const local = [...block.matchAll(classed('req-local'))].map((m) => text(m[2]));
  const firstIb = block.search(/class="[^"]*\breq-(ib|none|other)\b/);
  const firstLocal = block.search(/class="[^"]*\breq-local\b/);

  // Nothing local left over once every labelled part is taken out.
  const residue = text(
    ['req-ib', 'req-none', 'req-why', 'req-grade', 'req-other', 'req-local'].reduce((b, cls) => b.replace(classed(cls), ' '), block)
  );
  for (const m of residue.matchAll(BARE)) out.push(`"${m[0]}" is shown bare, outside any IB translation: …${residue.slice(Math.max(0, m.index - 30), m.index + 40)}…`);

  // Broken lines.
  for (const l of local) if (/:\s*$/.test(l)) out.push(`an empty published line: "${l}"`);
  for (const m of block.matchAll(within('p', 'req__ib'))) {
    const line = text(m[1]);
    if (/(\/|—|\+|·|one of:)\s*$/.test(line)) out.push(`a line ending on a separator: "${line}"`);
    // Options, not parts: "Physics + Chemistry / Biology + Chemistry" names
    // Chemistry twice and is right to.
    const options = line
      .split(/\s[/·—]\s/)
      .map((x) => x.replace(/^(Needs|Requires:?|one of:)\s*/i, '').replace(/\s*\(and \d+ .*\)$/, '').trim())
      .filter(Boolean);
    const twice = options.filter((x, i) => options.indexOf(x) !== i);
    if (twice.length) out.push(`"${twice[0]}" is listed twice in one line`);
  }
  for (const m of block.matchAll(/<ul[^>]*>([\s\S]*?)<\/ul>/g)) {
    const cards = [...m[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((li) =>
      [...li[1].matchAll(classed('req-ib'))].map((x) => text(x[2])).join(' + ')
    ).filter(Boolean);
    const twice = cards.filter((x, i) => cards.indexOf(x) !== i);
    if (twice.length) out.push(`"${twice[0]}" is listed twice in one list`);
  }

  if (expect) {
    if (!local.length) out.push('the requirement as published is not shown beside its translation');
    if (firstLocal !== -1 && (firstIb === -1 || firstLocal < firstIb)) out.push('the published form comes before the IB terms');
    for (const p of ib) if (!expect.allowed.has(p)) out.push(`"${p}" is in the IB slot but is not a phrase the model produces for this programme`);
    for (const p of expect.required) if (!ib.includes(p)) out.push(`"${p}" should be shown and is not`);
  }
  return out;
}

/** What the card and the programme page should each show, from the model. */
function expected(entry) {
  const model = requirementModel(entry);
  const open = model.sets.filter((x) => !x.implied);
  const card = new Set();
  for (const x of model.all) if (x.kind === 'ib') card.add(x.text);
  for (const set of open) {
    if (set.union) card.add(set.union.text);
    else for (const o of set.open) for (const x of o.parts) if (x.kind === 'ib') card.add(x.text);
  }
  for (const f of model.floors) card.add(f.ib);

  const detail = new Set();
  const detailText = (r) =>
    r.other ? null : r.floor ? r.ibText : r.translation ? r.translation.phrase : r.ibPhrase || `${r.subject} ${r.level}`;
  for (const x of model.all) if (x.kind === 'ib') detail.add(x.detail || detailText(x.r));
  for (const set of open) {
    for (const o of set.open) o.groups[0].forEach((r, i) => { const t = o.parts[i]?.detail || detailText(r); if (t) detail.add(t); });
  }
  for (const f of model.floors) detail.add(f.ib);
  detail.delete(null);
  // A card may show an option on its own where the union is not formed, and
  // the page shows each option: either is an honest rendering of the model.
  const allowed = new Set([...card, ...detail]);
  for (const set of open) for (const o of set.open) for (const x of o.parts) if (x.kind === 'ib') allowed.add(x.text);
  return { card: { allowed, required: card }, detail: { allowed, required: detail } };
}

/* --- the guard can see what it is for ----------------------------------------- */

{
  const before = '<div class="req" data-req><p class="req__ib">Needs English B · Mathematics A</p></div>';
  const beforeFaults = faults(blocks(before)[0]);
  check('the guard catches the old card ("Needs English B · Mathematics A")', beforeFaults.length === 2, beforeFaults.join('; '));

  const broken =
    '<div class="req" data-req><p class="req__ib"><strong>Needs</strong> one of: <span class="req-ib">Any IB English, at least a 3</span> / </p>' +
    '<p class="req__local"><span class="req-local">Danish requirement: </span></p></div>';
  const bf = faults(blocks(broken)[0]);
  check('it catches a trailing "/" and an empty published line (round 1, BAAA)', bf.some((f) => /separator/.test(f)) && bf.some((f) => /empty published/.test(f)), bf.join('; '));

  const twice =
    '<div class="req" data-req><p class="req__ib">one of: <span class="req-ib">Any IB English, at least a 3</span> / <span class="req-ib">Any IB English, at least a 3</span></p></div>';
  check('it catches one phrase listed twice (round 1, VIA Design, Technology and Business)', faults(blocks(twice)[0]).some((f) => /twice/.test(f)));

  const flipped =
    '<div class="req" data-req><p><span class="req-local">As published: Mathematics A</span></p><p class="req__ib"><span class="req-ib">Maths HL (AA or AI)</span></p></div>';
  const expect = { allowed: new Set(['Maths HL (AA or AI)']), required: new Set(['Maths HL (AA or AI)']) };
  check('and refuses the published form leading', faults(blocks(flipped)[0], expect).some((f) => /comes before/.test(f)));
}

/* --- the built pages --------------------------------------------------------- */

const read = async (...parts) => {
  try { return await fs.readFile(path.join(DIST, ...parts), 'utf8'); } catch { return null; }
};

/* The finder is the home page's discovery surface (docs/research/ia/plan.md,
   Batch D). Its cards are drawn at build time, one per programme or family. */
const finder = await read('index.html');
const finderIds = (() => {
  const m = finder?.match(/<script type="application\/json" id="discover-data">([\s\S]*?)<\/script>/);
  return m ? new Set(JSON.parse(m[1]).cards.flatMap((c) => c.members.map((x) => x.id))) : new Set();
})();
check('the discovery surface is built and carries its data', finderIds.size > 0);

const instPages = new Map();
let translatedProgrammes = 0;
const stripBlocks = (s) => s.replace(/<div[^>]*\bdata-req\b[^>]*>[\s\S]*?<\/div>/g, ' ');

for (const p of programmes) {
  const rules = localRules(p.requirements);
  if (!rules.length) continue;
  translatedProgrammes++;
  const expect = expected(p.entryRequirements);
  // The whole published line, as the old card printed it. A one-subject line
  // ("English B") is a phrase the institution's own quoted wording may use too;
  // inside the blocks the residue check above covers it.
  const published = requirementLine(p.entryRequirements);
  const bareLine = /·|one of:/.test(published) ? published : null;

  // Programme page.
  const page = await read('programmes', p.id, 'index.html');
  if (!page) { check(`${p.id}: programme page is built`, false); continue; }
  const pageBlocks = blocks(page);
  check(`${p.id}: programme page shows its requirements in a data-req block`, pageBlocks.length > 0);
  for (const b of pageBlocks) {
    const f = faults(b, expect.detail);
    check(`${p.id}: programme page`, !f.length, f.join('\n        '));
  }
  check(`${p.id}: programme page never prints the bare published line`, !bareLine || !text(stripBlocks(page)).includes(bareLine), bareLine);

  // The programme's card on its institution's page.
  const inst = institutions.find((i) => i.id === p.institutionId);
  if (!instPages.has(p.institutionId)) instPages.set(p.institutionId, await read('universities', p.institutionId, 'index.html'));
  const ip = instPages.get(p.institutionId);
  if (inst && ip) {
    const cardRe = new RegExp(`<article class="card[^"]*"[^>]*>(?:(?!<\\/article>)[\\s\\S])*?/programmes/${esc(p.id)}/(?:(?!<\\/article>)[\\s\\S])*?<\\/article>`);
    const cardHtml = ip.match(cardRe)?.[0];
    check(`${p.id}: has a card on its institution's page`, !!cardHtml);
    if (cardHtml) {
      const cb = blocks(cardHtml);
      check(`${p.id}: its card shows requirements in a data-req block`, cb.length === 1);
      for (const b of cb) {
        const f = faults(b, expect.card);
        check(`${p.id}: institution card`, !f.length, f.join('\n        '));
      }
      check(`${p.id}: its card never prints the bare published line`, !bareLine || !text(stripBlocks(cardHtml)).includes(bareLine), bareLine);
    }
  }

  // Its card on the discovery surface (the home page).
  check(`${p.id}: is on the discovery surface`, finderIds.has(p.id));
  const homeRe = new RegExp(`<article class="card[^"]*"[^>]*>(?:(?!<\\/article>)[\\s\\S])*?/programmes/${esc(p.id)}/(?:(?!<\\/article>)[\\s\\S])*?<\\/article>`);
  const homeCard = finder?.match(homeRe)?.[0];
  check(`${p.id}: has a card on the discovery surface`, !!homeCard);
  if (homeCard) {
    const hb = blocks(homeCard);
    check(`${p.id}: its discovery card shows requirements in a data-req block`, hb.length === 1);
    for (const b of hb) {
      const f = faults(b, expect.card);
      check(`${p.id}: discovery card`, !f.length, f.join('\n        '));
    }
    check(`${p.id}: its discovery card never prints the bare published line`, !bareLine || !text(stripBlocks(homeCard)).includes(bareLine), bareLine);
  }
}
check('there are programmes with local-scale requirements to check', translatedProgrammes > 0);

/* --- no Markdown left unrendered ---------------------------------------------- *
 *
 * Round 2 of the critic found "([how totals convert](/denmark/…))" printed as
 * literal text on 24 programme pages: md() only knew absolute links. Any
 * "](/" or "](http" in a page's visible text is a link that never became one.
 */
{
  const pages = [];
  const walk = async (dir) => {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.name.endsWith('.html')) pages.push(full);
    }
  };
  await walk(DIST);
  const leaks = [];
  for (const f of pages) {
    const visible = (await fs.readFile(f, 'utf8')).replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ');
    const m = visible.match(/\]\((\/|https?:)[^)\s]*\)/);
    if (m) leaks.push(`${path.relative(DIST, f)}: …${m[0].slice(0, 60)}`);
  }
  check('no built page prints a Markdown link as text', leaks.length === 0, leaks.slice(0, 8).join('\n        '));
  check('and the scan looked at the built site', pages.length > 50);
  const planted = 'See the table ([how totals convert](/denmark/ib-conversion/#average)).';
  check('the scan can see one', /\]\((\/|https?:)[^)\s]*\)/.test(planted));
}

/* --- the planner's sentences ------------------------------------------------- */

{
  const profile = {
    subjects: [
      { subject: 'english-b', level: 'SL', grade: 4 },
      { subject: 'mathematics-aa', level: 'SL', grade: 5 },
      { subject: 'history', level: 'HL', grade: 6 },
      { subject: 'biology', level: 'HL', grade: 5 },
      { subject: 'chemistry', level: 'SL', grade: 4 },
      { subject: 'global-politics', level: 'HL', grade: 5 },
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
      const t = ibTermsFor(r, subjectIndex, opp.institution);
      const leads = /exempt/.test(e.message) || (t.phrase ? e.message.includes(t.phrase) : /^No IB subject is equivalent/.test(e.message));
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
