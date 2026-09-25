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
import { url } from './layout.mjs';
import { requirementModel, requirementSummary, requirementLine } from './components.mjs';
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

/** The last cut-off as a card tag, IB points first. Null when unrestricted. */
export function cutoffLabel(p) {
  if (!p.restrictedAdmission) return null;
  const v = p.cutoff?.value;
  if (!(v && /^\d+([.,]\d+)?$/.test(String(v).trim()))) return 'Restricted admission';
  /* In IB terms only: the institution's own number is on the programme page,
     and on a card it made the tag too long for one line (#46). */
  if (p.cutoff.anyDiploma) return 'Last cut-off: any IB Diploma';
  if (p.cutoff.ibPoints) return `Last cut-off ${p.cutoff.ibPoints} IB points`;
  return `Last cut-off ${v}`;
}

const AWARD_TEXT = {
  [ENTRY_AWARD.COURSE_RESULTS_ACCEPTED]: 'DP Course Results accepted',
  [ENTRY_AWARD.DIPLOMA_REQUIRED]: 'Full IB Diploma required',
  [ENTRY_AWARD.NOT_ESTABLISHED]: null,
};

/** What a path asks, as short strings in IB terms, for comparison. */
function admissionOf(site, p) {
  const opp = site.graph?.opportunities?.get(p.opportunityId || p.id);
  const model = requirementModel(p.entryRequirements);
  const withoutFloors = p.entryRequirements ? { ...p.entryRequirements, quotaFloors: [] } : null;
  const award = opp ? entryAward(opp) : null;
  return {
    floor: model.floors.map((f) => f.ib).join('; ') || null,
    // The floor without its quota's name, for a card row: "at least 31 IB points".
    floorShort: model.floors.map((f) => f.ib.replace(`${f.quota}: `, '')).join('; ') || null,
    floorLocal: model.floors.map((f) => f.local).join('; ') || null,
    award: award ? AWARD_TEXT[award] : null,
    awardShort: award ? AWARD_SHORT[award] || null : null,
    cutoff: cutoffLabel(p),
    cutoffShort: p.restrictedAdmission && p.cutoff?.ibPoints ? `cut-off ${p.cutoff.ibPoints} IB points`
      : p.restrictedAdmission && p.cutoff?.anyDiploma ? 'cut-off: any Diploma' : cutoffLabel(p),
    // Every subject requirement in full, to tell whether the paths share them.
    subjects: requirementLine(withoutFloors),
  };
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
 * A card's one tag, chosen from what is true of every path it holds: a last
 * cut-off with a number is the most telling, then open admission, then the IB
 * award asked for, then plain "Restricted admission". One tag, not three
 * (#46: one line per block).
 */
export function cardTag({ cutoff = null, open = false, award = null } = {}) {
  if (cutoff && /\d/.test(cutoff)) return { label: cutoff, mod: 'sand' };
  if (open) return { label: 'Open admission', mod: 'ok' };
  if (award) return award;
  if (cutoff) return { label: cutoff, mod: 'sand' };
  return null;
}

const AWARD_SHORT = {
  [ENTRY_AWARD.COURSE_RESULTS_ACCEPTED]: 'Course Results accepted',
  [ENTRY_AWARD.DIPLOMA_REQUIRED]: 'full Diploma',
};

/**
 * Everything a family card shows, as data: the credential line — never
 * without the degree: "BSc or BEng · 3–3½ yrs · Sønderborg" when the paths
 * differ (programme cards round 2, change 1) — the requirement summary
 * (floors moved to the rows when they differ), one short row per path, and
 * what every path shares, for the tag. A single-member group returns null.
 */
export function familyCard(site, group, { campus = true } = {}) {
  if (!group.family || group.members.length < 2) return null;
  const members = group.members;
  const recs = members.map((p) => recordOf(site, p));
  const facets = members.map((p) => facetsOf(site, p, { campus }));
  const adm = members.map((p) => admissionOf(site, p));
  const same = (k, list) => new Set(list.map((x) => x[k] ?? '')).size === 1;

  const differing = ['degree', 'years', 'campus'].filter((k) => !same(k, facets));
  const line = credentialLine({
    degree: orList(facets.map((f) => f.degree)),
    years: same('years', facets) ? facets[0].years : yearsRange(facets.map((f) => f.rawYears)),
    campus: orList(facets.map((f) => f.campus)),
  });
  const axis = group.family.axis;
  const floorsDiffer = !same('floor', adm);
  const awardDiffer = !same('award', adm);
  const cutoffDiffer = !same('cutoff', adm);
  const subjectsDiffer = !same('subjects', adm);

  const rows = members.map((p, i) => {
    const f = recs[i]?.family || {};
    const label = axis === 'specialisation' || !differing.length
      ? f.path
      : differing.map((k) => facets[i][k]).filter(Boolean).join(' ');
    return {
      href: p.href,
      label: f.tag ? `${label} (${f.tag})` : label,
      // Short, so each row stays one line: "full Diploma · at least 31 IB points".
      detail: [
        awardDiffer ? adm[i].awardShort : null,
        floorsDiffer ? adm[i].floorShort : null,
        cutoffDiffer ? adm[i].cutoffShort : null,
      ].filter(Boolean),
      full: [
        awardDiffer ? adm[i].award : null,
        floorsDiffer ? adm[i].floor : null,
        cutoffDiffer ? adm[i].cutoff : null,
      ].filter(Boolean),
    };
  });

  const lead = group.lead;
  const leadEntry = lead.entryRequirements;
  return {
    title: group.family.name,
    href: lead.href,
    line,
    req: requirementSummary(floorsDiffer && leadEntry ? { ...leadEntry, quotaFloors: [] } : leadEntry),
    paths: {
      head: `${members.length} ${AXIS_HEAD[axis] || 'paths'}`,
      rows,
      note: subjectsDiffer ? 'The subject options differ slightly between them.' : null,
    },
    // What every path shares, for the card's one tag (cardTag).
    shared: {
      cutoff: cutoffDiffer ? null : adm[0].cutoff,
      open: members.every((p) => p.restrictedAdmission === false),
      awardSame: !awardDiffer,
    },
    tag: cutoffDiffer ? null : adm[0].cutoff,
    backdrop: lead.backdrop,
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

  const cols = [
    { head: 'Degree', cell: (i) => facets[i].degree },
    { head: 'Length', cell: (i) => [facets[i].years, ects(members[i]) ? `${ects(members[i])} ECTS` : null].filter(Boolean).join(' · ') || null },
    { head: 'Campus', cell: (i) => facets[i].campus },
    { head: 'Starts', cell: (i) => members[i].startMonth || null },
    { head: floorHead, cell: (i) => stripLead(adm[i].floor), small: (i) => stripLead(adm[i].floorLocal) },
    { head: 'DP Course Results', cell: (i) => (adm[i].award === AWARD_TEXT[ENTRY_AWARD.COURSE_RESULTS_ACCEPTED] ? 'Accepted' : adm[i].award === AWARD_TEXT[ENTRY_AWARD.DIPLOMA_REQUIRED] ? 'Full Diploma needed' : 'Not recorded') },
    { head: 'Last cut-off', cell: (i) => adm[i].cutoff?.replace(/^Last cut-off:?\s*/, '') || null },
  ]
    // Only what differs, and not a column that repeats the path's own name
    // (a campus family's paths are already called after their campuses).
    .filter((c) => new Set(members.map((_, i) => c.cell(i) ?? '')).size > 1)
    .filter((c) => !members.every((_, i) => c.cell(i) && String(recs[i]?.family?.path || '').includes(c.cell(i))));
  const cutoffsDiffer = cols.some((c) => c.head === 'Last cut-off');

  const differsAdmission = rec.family.admission === 'differs';
  return html`<section class="paths" aria-labelledby="paths-title">
    <h2 id="paths-title">${members.length} ways to study ${rec.family.name}</h2>
    <p class="paths__lede">${inst.shortName || inst.name} offers this as ${members.length} ${AXIS_HEAD[rec.family.axis] || 'paths'}. ${
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
