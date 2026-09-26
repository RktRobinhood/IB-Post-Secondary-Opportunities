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
import { requirementLine, requirementModel, floorShort } from '../src/lib/components.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist');

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
function faults(block, expect = null, { card = false } = {}) {
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

  if (expect && card) {
    /* A card is one Needs line (#46 round 2): the published form stays on the
       programme page, and whatever does not fit is counted, "+n more", never
       silently dropped. */
    if (local.length) out.push('a card shows the published form; it belongs on the programme page');
    for (const p of ib) if (!expect.allowed.has(p)) out.push(`"${p}" is in the IB slot but is not a phrase the model produces for this programme`);
    const more = Number((block.match(/class="req__count">\+(\d+) more</) || [])[1] || 0);
    // A "one of" shown as one option says how many others it has ("or 2 other routes").
    const others = /class="req__others">or \d+ other/.test(block);
    const shown = new Set(ib.map((p) => expect.alias?.get(p) || p));
    const missing = [...expect.required].filter((p) => !shown.has(p));
    if (missing.length && !more && !others) out.push(`"${missing[0]}" is neither shown nor counted in a "+n more"`);
    /* Round 3: "one of: Any IB English +1 more" showed a choice of one. A
       "one of:" names at least two options, or none. */
    for (const m of block.matchAll(within('p', 'req__ib'))) {
      for (const seg of text(m[1]).split(' · ').filter((x) => /one of:/.test(x))) {
        if (!/ \/ /.test(seg)) out.push(`"${seg}" is a "one of" with a single option`);
      }
    }
  } else if (expect) {
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
  /* A card writes a points floor without its quota's name, "31+ IB points",
     and may write a one-level grade short, "Any IB Maths, 5+ in Maths SL". */
  const cardText = (x) => (x.floor ? floorShort(x.text) : x.text);
  const card = new Set();
  const shortForms = new Set();
  for (const x of model.all) if (x.kind === 'ib') { card.add(x.text); if (x.short) shortForms.add(x.short); }
  for (const set of open) {
    if (set.union) card.add(set.union.text);
    else for (const o of set.open) for (const x of o.parts) if (x.kind === 'ib') card.add(cardText(x));
  }
  for (const f of model.floors) card.add(f.card);

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
  const allowed = new Set([...card, ...detail, ...shortForms]);
  for (const set of open) for (const o of set.open) for (const x of o.parts) if (x.kind === 'ib') allowed.add(cardText(x));
  // A card's short form stands for the full one: shown, it counts as shown.
  const alias = new Map(model.all.filter((x) => x.short).map((x) => [x.short, x.text]));
  return { card: { allowed, required: card, alias }, detail: { allowed, required: detail } };
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

  const cardExpect = { allowed: new Set(['Any IB English', 'Maths HL (AA or AI)']), required: new Set(['Any IB English', 'Maths HL (AA or AI)']) };
  const cut = '<div class="req" data-req><p class="req__ib"><strong>Needs</strong> <span class="req-ib">Any IB English</span></p></div>';
  check('a card that drops a requirement without counting it is caught', faults(blocks(cut)[0], cardExpect, { card: true }).some((f) => /neither shown nor counted/.test(f)));
  const counted = '<div class="req" data-req><p class="req__ib"><strong>Needs</strong> <span class="req-ib">Any IB English</span> <span class="req__count">+1 more</span></p></div>';
  check('and one that counts it passes', faults(blocks(counted)[0], cardExpect, { card: true }).length === 0, faults(blocks(counted)[0], cardExpect, { card: true }).join('; '));
  const single = '<div class="req" data-req><p class="req__ib"><strong>Needs</strong> one of: <span class="req-ib">Any IB English</span> <span class="req__count">+1 more</span></p></div>';
  check('a "one of" showing a single option is caught (round 3, Crafts in Glass and Ceramics)', faults(blocks(single)[0], cardExpect, { card: true }).some((f) => /single option/.test(f)));
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
/* A programme family's card (src/lib/paths.mjs) shows each path's own grade
   floor — "Quota 1: at least 31 IB points" — in that path's row, since the
   paths differ there; the shared block holds what they share. A phrase a
   path row shows counts as shown. */
const onPaths = (exp, html) => {
  // A row shows a short form and carries the full one in its title.
  const rows = [...html.matchAll(/<span class="card__path-detail"(?: title="([^"]*)")?>([\s\S]*?)<\/span>/g)].map((m) => `${decode(m[1] || '')} ${text(m[2])}`).join(' | ');
  return rows ? { ...exp, required: [...exp.required].filter((r) => !rows.includes(r)) } : exp;
};
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
        const f = faults(b, onPaths(expect.card, cardHtml), { card: true });
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
      const f = faults(b, onPaths(expect.card, homeCard), { card: true });
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

/* --- round 4: what the pages say about outcomes, cut-offs and tests ---------- *
 *
 * The round-4 critic (docs/research/qa/conversion/critique-round-4.md) read
 * these on the live site: a legend for four outcomes beside five chips and a
 * stale definition; a chip called "Another route only" beside a count that
 * said "quota 2 only"; "Also accepted … with no IB route", which contradicts
 * itself; the test phrase printed two or three times in one English box; a
 * glance "Last cut-off Restricted"; and the finder's "No Mathematics A".
 */
{
  const planner = await read('planner', 'index.html');
  check('the planner page is built', !!planner);
  if (planner) {
    const visible = text(planner.replace(/<script[\s\S]*?<\/script>/g, ' '));
    const chip = text(planner.match(/<button[^>]*data-show="other-route-only"[^>]*>([\s\S]*?)<\/button>/)?.[1] || '');
    const quotas = [...new Set([...graph.institutions.values()].flatMap((i) => (i.admissionRoutes || []).map((r) => r.quota)))];
    check('the planner\'s other-route chip is named as the count names it (the route\'s own name)',
      quotas.length !== 1 || chip === `${quotas[0]} only`, `chip "${chip}", routes ${JSON.stringify(quotas)}`);
    const { OUTCOME_LABEL, OUTCOME } = await import('../src/lib/eligibility.mjs');
    for (const [k, label] of Object.entries(OUTCOME_LABEL)) {
      if (k === OUTCOME.OTHER_ROUTE) continue;
      check(`the planner legend defines "${label}"`, new RegExp(`${esc(label)}\\s*:`).test(visible), label);
    }
    check('the legend names the other-route outcome by the chip\'s name', !chip || visible.includes(chip), chip);
    check('the legend no longer says one unmet rule is "possible" and two are not',
      !/one rule is not met|more than one rule is unmet/.test(visible));
  }

  const progDir = path.join(DIST, 'programmes');
  const stale = [];
  const glanceWords = [];
  const doubled = [];
  for (const id of await fs.readdir(progDir).catch(() => [])) {
    const page = await read('programmes', id, 'index.html');
    if (!page) continue;
    const t = text(page.replace(/<script[\s\S]*?<\/script>/g, ' '));
    if (/Also accepted:[^|]{0,120}no IB route/.test(t)) stale.push(id);
    for (const m of page.matchAll(/<dt>Last cut-off<\/dt>\s*<dd>([^<]*)/g)) {
      if (!/^\s*(\d|Any IB Diploma)/.test(decode(m[1]))) glanceWords.push(`${id}: "${m[1].trim()}"`);
    }
    // A test written out as its own line is not repeated in the published line beneath it.
    for (const card of page.matchAll(/<li class="need__card">([\s\S]*?)<\/li>/g)) {
      const whys = [...card[1].matchAll(/class="need__why req-why">([\s\S]*?)<\/span>/g)].map((m) => text(m[1]));
      const local = text(card[1].match(/class="req-local">([\s\S]*?)<\/small>/)?.[1] || '');
      for (const w of whys) {
        const head = w.split('. ')[0];
        if (head.length > 20 && local.includes(head)) doubled.push(`${id}: "${head.slice(0, 50)}…"`);
      }
    }
  }
  check('no programme page says "Also accepted … with no IB route"', stale.length === 0, stale.slice(0, 5).join(', '));
  check('no glance "Last cut-off" is a word rather than a figure', glanceWords.length === 0, glanceWords.slice(0, 5).join(', '));
  check('the glance scan can see one (round 4\'s "Last cut-off Restricted")',
    [...'<dt>Last cut-off</dt>\n      <dd>Restricted<small>'.matchAll(/<dt>Last cut-off<\/dt>\s*<dd>([^<]*)/g)].some((m) => !/^\s*(\d|Any IB Diploma)/.test(m[1])));
  check('no test is written out twice in one requirement card', doubled.length === 0, doubled.slice(0, 5).join(' | '));
  const cbs = await read('programmes', 'dk-cbs-international-business-2027-autumn', 'index.html');
  if (cbs) {
    const detail = text(cbs.match(/<div class="req-detail"[\s\S]*?<p class="need__how">/)?.[0] || '');
    check('CBS International Business names the Cambridge route beside the English grade', /Cambridge C1 185\+/.test(detail), detail.slice(0, 200));
    check('and writes the IELTS scores out once', (detail.match(/IELTS Academic 7\.0 overall/g) || []).length <= 1, detail.slice(0, 300));
  }
  check('the finder does not say "No Mathematics A"', !(finder || '').includes('No Mathematics A'));

  /* The research log stays out of what a student reads: the Editor critic
     found "as read by the round-4 conversion critic … No Evidence record
     holds that page's full URL yet; the levelRaise cites …" on ITU's page. */
  const LOG = /\bcritic\b|\bcritique\b|\bround-\d\b|docs\/research|Evidence record|\blevelRaise\b|\bibEquivalences\b/;
  const logged = [];
  for (const dir of ['universities', 'programmes']) {
    for (const id of await fs.readdir(path.join(DIST, dir)).catch(() => [])) {
      const page = await read(dir, id, 'index.html');
      if (!page) continue;
      const m = text(page.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ')).match(LOG);
      if (m) logged.push(`${dir}/${id}: "${m[0]}"`);
    }
  }
  check('no university or programme page shows research-log words', logged.length === 0, logged.slice(0, 6).join(', '));
  check('the research-log scan can see one', LOG.test('as read by the round-4 conversion critic'));

  /* An open question the planner shows as a "?" is on the programme page too
     (verification after round 5: SEA's pages said only "Course Results are
     accepted"). */
  let asked = 0;
  for (const opp of graph.opportunities.values()) {
    for (const r of (opp.requirements || []).filter((x) => x.mandatory !== false && x.openQuestion)) {
      asked++;
      const page = await read('programmes', opp.id, 'index.html');
      check(`${opp.id}: its programme page says the open question the planner asks`, !!page && text(page).includes(text(r.openQuestion).replace(/"/g, '"')),
        r.openQuestion);
    }
  }
  check('there are open questions to look for', asked > 0);
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
