/**
 * What a programme is at a glance, and what differs between the paths of one.
 *
 * The owner, 25 September 2026: "Show the type of degree on those, or maybe all
 * cards, so they are not identical and a point of confusion. I like clarity and
 * legibility at a glance." Two things answer that:
 *
 *   1. A credential line on every programme card and page header — degree,
 *      length, and the campus where the institution has more than one:
 *      "BEng · 3½ yrs · Sønderborg". Built from the record's credential, never
 *      from a name.
 *   2. One card per programme family (src/lib/families.mjs): the facts the
 *      paths share once, and a short row per path for what differs — its
 *      credential or campus, and any admission difference in IB terms, taken
 *      from requirementModel() so it reads exactly as the requirement block
 *      does. Every member page carries the same Paths table.
 *
 * Nothing here names a programme, an institution or a country; the guard in
 * scripts/test-unique-images.mjs reads this file back for literals.
 */
import { html } from './html.mjs';
import { url, SITE } from './layout.mjs';
import { requirementModel, requirementSummary, requirementLine, needsRarity, keepTogether } from './components.mjs';
import { entryAward, ENTRY_AWARD } from './eligibility.mjs';
import { COMPARABLE_LEVEL } from './credentials.mjs';
import { cardKey, families } from './families.mjs';

/* --- The credential line ------------------------------------------------ */

/**
 * The degree in the fewest plain-English words. An English bachelor-style
 * abbreviation (BSc, BA, BEng, BBA) is what a student already reads; anything
 * else — a PBA, an AP — is spelled out from the record's English title, because
 * an unfamiliar abbreviation is the confusion this line exists to remove. A
 * title made only of English degree names ("Bachelor of Arts or Bachelor of
 * Science") takes their standard abbreviations ("BA or BSc"); any other title
 * is written in sentence case, so "Professional bachelor" and "Academy
 * profession degree" read alike (programme cards round 2, bug 6).
 */
export function degreeShort(credential) {
  const abbr = credential?.abbreviation;
  if (abbr && /^B[A-Z]/.test(abbr)) return abbr;
  const title = credential?.localTitleEn || (!abbr ? credential?.localTitle : null);
  if (title) return abbreviatedTitle(title) || sentenceCase(title);
  if (abbr) return abbr;
  return COMPARABLE_LEVEL[credential?.comparableLevel]?.label || null;
}

/* The standard English abbreviations of English degree names. A convention of
   the language, not of any country. */
const DEGREE_NAMES = {
  'bachelor of arts': 'BA',
  'bachelor of science': 'BSc',
  'bachelor of engineering': 'BEng',
  'bachelor of business administration': 'BBA',
  'bachelor of laws': 'LLB',
  'bachelor of fine arts': 'BFA',
  'bachelor of music': 'BMus',
  'bachelor of education': 'BEd',
};

/** "Bachelor of Arts or Bachelor of Science" → "BA or BSc"; null for any other title. */
function abbreviatedTitle(title) {
  const names = String(title).split(/\s*(?:,|\bor\b|\band\b|\/)\s*/i).filter(Boolean);
  const out = names.map((n) => DEGREE_NAMES[n.trim().toLowerCase()]);
  return names.length && out.every(Boolean) ? [...new Set(out)].join(' or ') : null;
}

/** "Academy Profession degree" → "Academy profession degree"; acronyms kept. */
function sentenceCase(title) {
  return String(title)
    .split(' ')
    .map((w, i) => (i === 0 || /^[A-Z0-9]{2,}$/.test(w) || /[A-Z].*[A-Z]/.test(w.slice(1)) ? w : w.toLowerCase()))
    .join(' ');
}

const FRACTION = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

/** "3 yrs", "3½ yrs", "1 yr". Null when the length is not recorded. */
export function yearsShort(years) {
  const y = Number(years);
  if (!Number.isFinite(y) || y <= 0) return null;
  const whole = Math.floor(y);
  const frac = FRACTION[Math.round((y - whole) * 100) / 100];
  const n = frac ? `${whole || ''}${frac}` : String(Math.round(y * 100) / 100);
  return `${n} ${y === 1 ? 'yr' : 'yrs'}`;
}

/** "3–3½ yrs": the lengths of several paths as one range. Null unless every path records one. */
export function yearsRange(list) {
  const ys = list.map(Number);
  if (!ys.length || ys.some((y) => !Number.isFinite(y) || y <= 0)) return null;
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  if (lo === hi) return yearsShort(lo);
  return `${yearsShort(lo).replace(/ yrs?$/, '')}–${yearsShort(hi)}`;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** "15 March 2027" from an ISO date (or date-time). */
const prettyDay = (iso) => {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : null;
};

/** Several values as one fact: the distinct ones, in path order, joined with "or". */
const orList = (list) => [...new Set(list.filter(Boolean))].join(' or ') || null;

/** The raw record behind a programme view model. */
function recordOf(site, p) {
  return site.graph?.programmes?.get(p.programmeId || p.id) || null;
}

/** An institution teaches on more than one campus when its programmes say so. */
export function isMultiCampus(inst) {
  return new Set((inst?.programmes || []).map((p) => p.campus).filter(Boolean)).size > 1;
}

/** The three facts a student compares first, each already short. */
export function facetsOf(site, p, { campus = true } = {}) {
  const rec = recordOf(site, p);
  const rawYears = p.years ?? rec?.credential?.years;
  return {
    degree: degreeShort(rec?.credential) || null,
    years: yearsShort(rawYears),
    rawYears: Number.isFinite(Number(rawYears)) && Number(rawYears) > 0 ? Number(rawYears) : null,
    campus: campus ? p.campus || null : null,
  };
}

/** "BSc · 3 yrs · Odense": the at-a-glance line, empty facts left out. */
export function credentialLine(facets) {
  return [facets.degree, facets.years, facets.campus].filter(Boolean).join(' · ');
}

/* --- Admission facts, for comparing paths ------------------------------- */

/* The year this site's students start, from the cycle it is built for
   ("Autumn 2027"), so a cut-off from the year before reads "Last year". */
const ENTRY_YEAR = Number((String(SITE.cycle?.intake || '').match(/\d{4}/) || [])[0]) || null;

/**
 * Last year's cut-off as a plain fact, or null. `when` is "Last year" for the
 * round before this site's intake and the year itself otherwise; `value` is
 * "38 IB points", "any Diploma" or "all qualified" — never a local scale, which
 * the programme page keeps (#46). Null for an unrestricted programme and for a
 * restricted one with no published figure: "Restricted admission" said
 * nothing a student can act on (programme cards round 3).
 */
export function cutoffFact(p) {
  if (!p.restrictedAdmission || !p.cutoff?.value) return null;
  const year = Number((String(p.cutoff.intake || '').match(/\d{4}/) || [])[0]) || null;
  const when = year && ENTRY_YEAR && ENTRY_YEAR - year === 1 ? 'Last year' : year ? String(year) : 'Last year';
  const v = String(p.cutoff.value).trim();
  // "All admitted", "All qualified applicants accepted": nobody qualified was turned away.
  if (/^all\b/i.test(v)) return { when, value: 'all qualified', open: true };
  if (!/^\d+([.,]\d+)?$/.test(v)) return null;
  if (p.cutoff.anyDiploma) return { when, value: 'any Diploma' };
  if (p.cutoff.ibPoints) return { when, value: `${p.cutoff.ibPoints} IB points` };
  return null;
}

/** "Last year: 38 IB points" / "Last year: all qualified got in", for a card's tag. */
export function cutoffLabel(p) {
  const f = cutoffFact(p);
  if (!f) return null;
  return `${f.when}: ${f.open || f.value === 'any Diploma' ? `${f.value} got in` : f.value}`;
}

const AWARD_TEXT = {
  [ENTRY_AWARD.COURSE_RESULTS_ACCEPTED]: 'DP Course Results accepted',
  [ENTRY_AWARD.DIPLOMA_REQUIRED]: 'Full IB Diploma required',
  [ENTRY_AWARD.NOT_ESTABLISHED]: null,
};

/**
 * The card's admission vocabulary: four kinds of tag, one per card, in plain
 * words (programme cards round 3: six ways to say it, and Danish jargon).
 * Anything else a card might have said is on the programme page.
 */
export const TAG_KINDS = {
  cutoff: 'sand',                      // "Last year: 38 IB points"
  open: 'ok',                          // "Open entry"
  [ENTRY_AWARD.DIPLOMA_REQUIRED]: 'plain',          // "Full Diploma"
  [ENTRY_AWARD.COURSE_RESULTS_ACCEPTED]: 'ok',      // "Diploma or Course Results"
};
const AWARD_TAG = {
  [ENTRY_AWARD.DIPLOMA_REQUIRED]: 'Full Diploma',
  [ENTRY_AWARD.COURSE_RESULTS_ACCEPTED]: 'Diploma or Course Results',
};

/** What a path asks, as short strings in IB terms, for comparison. */
function admissionOf(site, p) {
  const opp = site.graph?.opportunities?.get(p.opportunityId || p.id);
  const model = requirementModel(p.entryRequirements);
  const withoutFloors = p.entryRequirements ? { ...p.entryRequirements, quotaFloors: [] } : null;
  const award = opp ? entryAward(opp) : entryAward(p);
  const cut = cutoffFact(p);
  return {
    floor: model.floors.map((f) => f.ib).join('; ') || null,
    // The floor as a card writes it: "31+ IB points".
    floorShort: model.floors.map((f) => f.card).join('; ') || null,
    floorLocal: model.floors.map((f) => f.local).join('; ') || null,
    awardKey: award,
    award: award ? AWARD_TEXT[award] : null,
    awardShort: AWARD_TAG[award] || null,
    cutoff: cutoffLabel(p),
    cutoffValue: cut ? cut.value : null,
    cutoffShort: cut ? `${cut.when.toLowerCase()} ${cut.value}` : null,
    open: p.restrictedAdmission === false,
    // Every subject requirement in full, to tell whether the paths share them.
    subjects: requirementLine(withoutFloors),
  };
}

/**
 * A card's one tag, from what is true of every path it holds: last year's
 * cut-off is the most telling, then open entry, then the IB award asked for.
 * One tag, not three (#46), and one of TAG_KINDS' four kinds.
 */
export function cardTag({ cutoff = null, open = false, award = null } = {}) {
  if (cutoff) return { label: cutoff, mod: TAG_KINDS.cutoff };
  if (open) return { label: 'Open entry', mod: TAG_KINDS.open };
  if (AWARD_TAG[award]) return { label: AWARD_TAG[award], mod: TAG_KINDS[award] };
  return null;
}

/* How a selection step is said on a card, by the schema's requirement kind. */
const SELECTION_WORDS = {
  essay: 'a written statement',
  test: 'a test',
  portfolio: 'a portfolio',
  interview: 'an interview',
  audition: 'an audition',
  'work-sample': 'a work sample',
  activity: 'your experience',
};

/**
 * For a programme with no subject requirements to show, the card's one line
 * is how places are decided: "Selected on a portfolio · an interview", from
 * its Selection Factors (`mandatory: false`). What they weigh, and anything
 * the schema has no word for, is on the programme page. '' when there are none.
 */
export function selectionLine(p) {
  const steps = stepsOf(p, { selection: true });
  if (!steps.length) return '';
  return html`<div class="req"><p class="req__ib"><strong>Selected on</strong> ${steps.join(' · ')}</p></div>`;
}

/**
 * The steps a programme asks of everyone beyond its subjects ("a portfolio",
 * "a test"), or, with `selection`, the ones that rank those who qualify —
 * in the card's words, from the record's requirement kinds.
 */
export function stepsOf(p, { selection = false } = {}) {
  return [...new Set((p.requirements || [])
    .filter((r) => (selection ? r.mandatory === false : r.mandatory !== false))
    .map((r) => SELECTION_WORDS[r.kind]).filter(Boolean))];
}

const RARITY = new WeakMap();

/** How common each thing a card could say is across this catalogue (needsRarity), worked out once. */
export function rarityOf(site) {
  const list = site.programmes || [];
  if (!RARITY.has(list)) RARITY.set(list, needsRarity(list.map((p) => ({ entry: p.entryRequirements, steps: stepsOf(p) }))));
  return RARITY.get(list);
}

/* --- Cards: one per programme, or one per family ------------------------ */

/**
 * The cards for a list of programme view models, in the order given: each
 * family collapses to its primary member's position, with its members in path
 * order.
 */
export function cardGroups(site, programmes) {
  const recs = programmes.map((p) => recordOf(site, p)).filter(Boolean);
  const fams = families(recs);
  const groups = new Map();
  for (const p of programmes) {
    const rec = recordOf(site, p);
    const key = rec ? cardKey(rec) : p.id;
    if (!groups.has(key)) groups.set(key, { key, family: fams.get(key) || null, members: [] });
    groups.get(key).members.push(p);
  }
  for (const g of groups.values()) {
    if (!g.family) continue;
    const order = (p) => recordOf(site, p)?.family?.order ?? 99;
    g.members.sort((a, b) => order(a) - order(b));
    g.lead = g.members.find((p) => recordOf(site, p)?.family?.primary) || g.members[0];
  }
  for (const g of groups.values()) if (!g.lead) g.lead = g.members[0];
  return [...groups.values()];
}

const AXIS_HEAD = { credential: 'paths', campus: 'campuses', specialisation: 'paths' };

/**
 * Everything a family card shows, as data: the credential line — never
 * without the degree: "BSc or BEng · 3–3½ yrs · Sønderborg" when the paths
 * differ (programme cards round 2, change 1) — the requirement summary
 * (floors moved to the rows when they differ), one short row per path, and
 * its one tag, from what every path shares. A single-member group returns null.
 */
export function familyCard(site, group, { campus = true } = {}) {
  if (!group.family || group.members.length < 2) return null;
  const members = group.members;
  const recs = members.map((p) => recordOf(site, p));
  const facets = members.map((p) => facetsOf(site, p, { campus }));
  const adm = members.map((p) => admissionOf(site, p));
  const same = (k, list) => new Set(list.map((x) => x[k] ?? '')).size === 1;

  const differing = ['degree', 'years', 'campus'].filter((k) => !same(k, facets));
  /* Several campuses read as a count on the line ("BSc · 3 yrs · 2
     campuses"); the rows under it name them, each once (#52). */
  const campuses = new Set(facets.map((f) => f.campus).filter(Boolean));
  const line = credentialLine({
    degree: orList(facets.map((f) => f.degree)),
    years: same('years', facets) ? facets[0].years : yearsRange(facets.map((f) => f.rawYears)),
    campus: campuses.size > 1 ? `${campuses.size} campuses` : orList(facets.map((f) => f.campus)),
  });
  const axis = group.family.axis;
  const floorsDiffer = !same('floor', adm);
  const awardDiffer = !same('award', adm);
  const cutoffDiffer = !same('cutoff', adm);
  const subjectsDiffer = !same('subjects', adm);

  /* Where the subject options differ, the path that accepts more of them
     says so on its row: the Needs line above is the lead path's, and a
     student who fits only the other path's extra combination must not read
     it as closed to them (#52 round 2). */
  const combos = members.map((p) => {
    const e = p.entryRequirements || {};
    const sets = e.oneOfSets || (e.oneOf?.length ? [e.oneOf] : []);
    return sets.reduce((n, set) => n + set.length, 0);
  });
  const moreCombos = (i) => subjectsDiffer && combos[i] > Math.min(...combos);
  const rows = members.map((p, i) => {
    const f = recs[i]?.family || {};
    const label = axis === 'specialisation' || !differing.length
      ? f.path
      : differing.map((k) => facets[i][k]).filter(Boolean).join(' ');
    return {
      href: p.href,
      label: f.tag ? `${label} (${f.tag})` : label,
      // Short, so each row stays one line: "Full Diploma · 31+ IB points".
      // The record's own short line leads where it has one (`cardLine`).
      detail: [
        f.cardLine || null,
        awardDiffer ? adm[i].awardShort : null,
        floorsDiffer ? adm[i].floorShort : null,
        cutoffDiffer ? adm[i].cutoffShort : null,
        moreCombos(i) ? 'more subject combinations' : null,
      ].filter(Boolean),
      full: [
        f.cardLine || null,
        awardDiffer ? adm[i].award : null,
        floorsDiffer ? adm[i].floor : null,
        cutoffDiffer ? adm[i].cutoff : null,
        moreCombos(i) ? 'accepts more subject combinations than the other path' : null,
      ].filter(Boolean),
    };
  });

  const lead = group.lead;
  const leadEntry = lead.entryRequirements;
  return {
    title: group.family.name,
    href: lead.href,
    line,
    req: requirementSummary(floorsDiffer && leadEntry ? { ...leadEntry, quotaFloors: [] } : leadEntry, { rarity: rarityOf(site), steps: stepsOf(lead) }),
    paths: {
      head: `${members.length} ${AXIS_HEAD[axis] || 'paths'}`,
      rows,
      note: subjectsDiffer ? 'The subject options differ slightly between them.' : null,
    },
    // One tag, and only one every path shares.
    tag: cardTag({
      cutoff: cutoffDiffer ? null : adm[0].cutoff,
      open: adm.every((a) => a.open),
      award: awardDiffer ? null : adm[0].awardKey,
    }),
    backdrop: lead.backdrop,
  };
}

/**
 * The props of one programme card, the same on every page that draws one
 * (the home page, an institution's page): a family's card, or a single
 * programme's — its credential line, its Needs line (what makes it
 * different, components.mjs requirementSummary), or how places are decided
 * when it has no subject requirements, and its one tag. `meta` is the page's
 * own footer line. The campus is always named: a card is read on its own.
 */
export function programmeCard(site, group, { meta = [] } = {}) {
  const fam = familyCard(site, group, { campus: true });
  if (fam) {
    return {
      href: fam.href,
      title: fam.title,
      line: fam.line,
      backdrop: fam.backdrop,
      req: fam.req,
      paths: pathsBlock(fam.paths),
      meta,
      tags: [fam.tag].filter(Boolean),
    };
  }
  const p = group.lead;
  const adm = admissionOf(site, p);
  return {
    href: p.href,
    title: p.name,
    line: credentialLine(facetsOf(site, p, { campus: true })),
    backdrop: p.backdrop,
    req: p.entryRequirements ? requirementSummary(p.entryRequirements, { rarity: rarityOf(site), steps: stepsOf(p) }) : selectionLine(p),
    meta,
    tags: [cardTag({ cutoff: adm.cutoff, open: adm.open, award: adm.awardKey })].filter(Boolean),
  };
}

/**
 * The markup of a card's path rows (the card component places it): one line
 * per path, its link and what differs about it. The count ("2 campuses") is
 * for a screen reader; the rows show it.
 */
export function pathsBlock(paths) {
  if (!paths?.rows?.length) return '';
  return html`<div class="card__paths">
    <p class="card__paths-head visually-hidden">${paths.head}</p>
    <ul class="card__path-list">${paths.rows.map(
      (r) => html`<li class="card__path"><a href="${url(r.href)}">${r.label}</a>${
        r.detail.length ? html`<span class="card__path-detail" title="${r.full.join(' · ')}">${r.detail.join(' · ')}</span>` : ''
      }</li>`
    )}</ul>
  </div>`;
}

/* --- Where each path is taught -------------------------------------------- */

const NUMBER_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six'];

/**
 * The plain sentence for a family whose paths are not all on one campus
 * (#52): "The same programme is offered at the Aarhus campus and the Herning
 * campus." when the campus is all that differs (`axis: campus`), else where
 * each path is taught, by its own label: "Taught on two campuses: the LUT
 * degree in Lappeenranta; the LUT + HEBUT double degree in Lahti." Null when
 * every path is in one place. `paths` is `[{ label, city }]`.
 */
export function campusSentence(paths, axis) {
  const cities = [...new Set(paths.map((x) => x.city).filter(Boolean))];
  if (cities.length < 2) return null;
  if (axis === 'campus') {
    const named = cities.map((c) => `the ${c} campus`);
    return `The same programme is offered at ${named.slice(0, -1).join(', ')} and ${named[named.length - 1]}.`;
  }
  const each = paths.map(({ label, city }) => {
    const bare = String(label || '').replace(new RegExp(`,?\\s*${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '').trim();
    if (!bare || bare === city) return city;
    const lead = /^[A-Z]{2,}|^\d/.test(bare) ? `the ${bare}` : `the ${bare.charAt(0).toLowerCase()}${bare.slice(1)}`;
    return `${lead} in ${city}`;
  });
  return `Taught on ${NUMBER_WORDS[cities.length] || cities.length} campuses: ${each.join('; ')}.`;
}

/* --- The Paths table on a member's page --------------------------------- */

/**
 * On every member page of a family: the same table, the current path marked,
 * and only the columns in which the paths actually differ — so the table is
 * the difference, not a second copy of the page. Below 40rem each row is a
 * stacked block (site.css `.paths__table`): the path, what is different, then
 * one line per fact, each carrying its column's name (`data-label`).
 */
export function pathsTable(site, p, inst) {
  const rec = recordOf(site, p);
  if (!rec?.family) return '';
  const group = cardGroups(site, inst.programmes).find((g) => g.family?.id === rec.family.id);
  if (!group || group.members.length < 2) return '';
  const members = group.members;
  const recs = members.map((m) => recordOf(site, m));
  const facets = members.map((m) => facetsOf(site, m));
  const adm = members.map((m) => admissionOf(site, m));
  const ects = (m) => recordOf(site, m)?.credential?.ects || m.ects;
  /* The floor's own name ("Quota 1") heads its column, from the record. */
  const quota = requirementModel(p.entryRequirements).floors[0]?.quota;
  const floorHead = quota ? `${quota} needs` : 'Minimum to apply';
  const stripLead = (t) => (t && quota ? t.split(`${quota}: `).join('') : t) || null;
  // A figure stays on the line of its words: no "7.0" alone on a phone (round 3, bug 9).
  const keep = (t) => (t ? keepTogether(t) : null);

  /* The first hard closing date of each path's Application Route, for the
     reader: the "Apply by" of its own page. */
  const applyBy = (m) => {
    const opp = site.graph?.opportunities?.get(m.opportunityId || m.id);
    const route = site.graph?.applicationRoutes?.get((opp?.applicationRoutes || [])[0]);
    const close = (route?.milestones || []).find((x) => x.type === 'submit' && x.consequence === 'hard');
    return close?.date ? prettyDay(close.date) : null;
  };
  const cols = [
    { head: 'Degree', cell: (i) => facets[i].degree },
    { head: 'Length', cell: (i) => [facets[i].years, ects(members[i]) ? `${ects(members[i])} ECTS` : null].filter(Boolean).join(' · ') || null },
    { head: 'Campus', cell: (i) => facets[i].campus },
    { head: 'Taught in', cell: (i) => members[i].language || null },
    { head: 'Starts', cell: (i) => members[i].startMonth || null },
    { head: 'Apply by', cell: (i) => applyBy(members[i]) },
    { head: floorHead, cell: (i) => keep(stripLead(adm[i].floor)), small: (i) => keep(stripLead(adm[i].floorLocal)) },
    { head: 'DP Course Results', cell: (i) => (adm[i].award === AWARD_TEXT[ENTRY_AWARD.COURSE_RESULTS_ACCEPTED] ? 'Accepted' : adm[i].award === AWARD_TEXT[ENTRY_AWARD.DIPLOMA_REQUIRED] ? 'Full Diploma needed' : 'Not recorded') },
    { head: 'Last cut-off', cell: (i) => (adm[i].cutoffValue === 'all qualified' ? 'all qualified got in' : adm[i].cutoffValue) },
  ]
    // Only what differs, and not a column that repeats the path's own name
    // (a campus family's paths are already called after their campuses).
    .filter((c) => new Set(members.map((_, i) => c.cell(i) ?? '')).size > 1)
    .filter((c) => !members.every((_, i) => c.cell(i) && String(recs[i]?.family?.path || '').includes(c.cell(i))));
  const cutoffsDiffer = cols.some((c) => c.head === 'Last cut-off');

  const differsAdmission = rec.family.admission === 'differs';
  /* A family of campuses says what it is in plain words: one programme,
     taught in more than one place (#52). */
  const cities = [...new Set(facets.map((f) => f.campus).filter(Boolean))];
  const onlyCampus = rec.family.axis === 'campus' && cities.length > 1;
  /* Whatever the axis, paths on different campuses say so in plain words. */
  const where = campusSentence(members.map((m, i) => ({ label: recs[i]?.family?.path, city: facets[i].campus })), rec.family.axis);
  const opening = onlyCampus
    ? where
    : [`${inst.shortName || inst.name} offers this as ${members.length} ${AXIS_HEAD[rec.family.axis] || 'paths'}.`, where].filter(Boolean).join(' ');
  return html`<section class="paths" aria-labelledby="paths-title">
    <h2 id="paths-title">${onlyCampus ? `${rec.family.name} on ${members.length} campuses` : `${members.length} ways to study ${rec.family.name}`}</h2>
    <p class="paths__lede">${opening} ${
      differsAdmission
        ? 'What it takes to get in differs between them, so check each one.'
        : `The entry requirements are the same on each${cutoffsDiffer ? ', but last year’s cut-offs were not' : ''}.`
    }</p>
    <div class="table-scroll paths__scroll"><table class="data paths__table">
      <thead><tr><th scope="col">Path</th>${cols.map((c) => html`<th scope="col">${c.head}</th>`)}<th scope="col">What is different</th></tr></thead>
      <tbody>${members.map((m, i) => {
        const here = m === p || (m.id === p.id);
        const f = recs[i]?.family || {};
        return html`<tr${here ? html` aria-current="page" class="paths__here"` : ''}>
          <th scope="row">${here
            ? html`<strong>${f.path}</strong> <span class="paths__you">You are here</span>`
            : html`<a href="${url(m.href)}">${f.path}</a>`}</th>
          ${cols.map((c) => html`<td data-label="${c.head}">${c.cell(i) || '—'}${c.small?.(i) ? html`<small class="req-local">${c.small(i)}</small>` : ''}</td>`)}
          <td class="paths__diff" data-label="What is different">${f.differs}</td>
        </tr>`;
      })}</tbody>
    </table></div>
  </section>`;
}
