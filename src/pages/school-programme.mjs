import { alike } from '../lib/designed-backdrop.mjs';
import { html, md, truncate } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import { note, tags, requirementDetail, facts } from '../lib/components.mjs';
import { programmeTemplate } from '../templates/programme.mjs';
import { programmeCatalogue, programmeCataloguePanel } from '../lib/studyinfo.mjs';
import { buildSubjectIndex, ibTermsPhrase, entryAward, ENTRY_AWARD } from '../lib/eligibility.mjs';
import { ibOption } from '../lib/records.mjs';
import { identityWords } from '../lib/calendar.mjs';
import { datesPanel } from '../lib/school-dates.mjs';
import { notesFor, displayName, NOT_OPEN_YET, AFTER_DIPLOMA } from '../lib/schools.mjs';
import { deadlineOf, startsOf } from '../lib/programme-deadline.mjs';
import { awardBlock, cutoffSentence } from './programme-facts.mjs';
import { pathsTable } from '../lib/paths.mjs';
import { intakeLanguageWarning } from '../lib/intake-language.mjs';
import { deliveryModeOf, studyLocation, studyLocationClause } from '../lib/delivery.mjs';
import { FIELD, programmeCard, schoolCards, yearsText, placesText, feeText } from './schools.mjs';
import { programmeSummary } from '../lib/summary.mjs';
const NUMBER_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six'];

/**
 * A page for one programme of a school record (issue #43): a listed
 * school's degree, or a catalogue school's flagship. Laid out
 * with the shared facts strip, dates,
 * what you need in IB terms, how places are decided, what it is, then one
 * targeted hand-off to the programme's own page.
 *
 * It shows only what the record holds (schemas/school.schema.json, `programme`).
 * A programme with just a name, a credential, a length and an `ib` line is a
 * short page that still ends on something to do (its own page) and somewhere
 * to go (three of its siblings); `about`, `needs`, `points`, `selection`,
 * `cutoff`, `places` and `starts` each light up their block once a researcher
 * fills them. Nothing here names a country or a school.
 *
 * It opens on the image its card shows (#67): its own photograph when one
 * was chosen for it (data/programme-images.json, a `school:` record, #54),
 * else the design generated for it (src/lib/designed-backdrop.mjs). The
 * school's photograph heads the school's page.
 *
 * Every sentence written here is under twelve words, because it appears on
 * hundreds of pages (the text-walls guard's repeated-sentence rule), and a
 * school's general IB rule, which every programme of the school shares, sits
 * behind a disclosure unless it is the only requirement the page has.
 */

/* --- Subjects, named the way every other page names them ------------------- */

const indexes = new WeakMap();
function subjectIndexOf(site) {
  if (!indexes.has(site)) {
    indexes.set(site, buildSubjectIndex({ subjects: site.ibSubjects || [], diplomaMinimumPoints: site.ibDiplomaMinimumPoints ?? null }));
  }
  return indexes.get(site);
}

/**
 * One `needs` entry as a student reads it: "Maths HL (AA or AI)", "Any IB
 * Maths", "Maths AA (SL or HL) or AI HL". The options are built exactly as a
 * structured requirement published in IB terms is (records.mjs ibOption),
 * phrased by the same function (eligibility.mjs ibTermsPhrase).
 *
 * An option is a subject id, at the need's `level`, or "<id>@HL" / "<id>@SL",
 * at that level alone. A subject is never said to be accepted at a level it
 * is not offered at.
 */
export function needPhrase(need, subjectIndex) {
  const options = (need.anyOf || []).map((option) => {
    const [id, at] = String(option).split('@');
    const o = ibOption({ ibSubject: id, ibLevel: at || need.level }, subjectIndex);
    const wanted = at ? [at] : o.levels;
    const offered = subjectIndex.get(id)?.levels;
    const levels = offered ? wanted.filter((l) => offered.includes(l)) : wanted;
    return { ...o, levels: levels.length ? levels : wanted };
  });
  return ibTermsPhrase(options, subjectIndex);
}

/* How places are decided, a word or two each (schema `selection`). */
const SELECTION = {
  grades: 'IB grades',
  'entrance-exam': 'Entrance exam',
  interview: 'Interview',
  portfolio: 'Portfolio',
  audition: 'Audition',
  assignment: 'Pre-assignment',
  motivation: 'Motivation letter',
  'test-score': 'Test score (SAT, ACT or similar)',
  'first-come': 'First come, first served',
  lottery: 'Lottery',
  open: 'Everyone eligible is admitted',
};

/* The admission tile's value, from how places are decided. */
function admissionValue(selection) {
  if (!selection.length) return 'Not recorded yet';
  if (selection.includes('open')) return 'Open to all who qualify';
  if (selection[0] === 'first-come' || selection[0] === 'lottery') return SELECTION[selection[0]];
  return 'Selective';
}

/* --- Small wording --------------------------------------------------------- */

const NUMBER = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];

/** "A three-year engineering degree in Garching": the record's own fields in words. */
function describe(p, inst) {
  const years = Number.isInteger(p.years) ? NUMBER[p.years] || String(p.years) : String(p.years).replace(/\.5$/, '½');
  const field = p.field === 'other' ? null : (FIELD[p.field] || '').toLowerCase().replace(/^sciences$/, 'science');
  return `A ${[`${years}-year`, field, 'degree'].filter(Boolean).join(' ')}${studyLocationClause(p, inst.city)}.`;
}

/** "€2,771 (2027/28 statutory fee)" → a value and its note. */
function valueAndNote(text) {
  const m = String(text || '').match(/^(.*?)\s*\((.+)\)\s*$/);
  return m && m[1] ? { value: m[1], note: m[2] } : { value: text || null, note: null };
}

/**
 * A cut-off short enough for a fact tile: IB points where an official table
 * converts it, else the first number over the scale's top where it has one
 * ("143.7 of 172.1"), else the value as published when it is short.
 */
function cutoffTile(cut) {
  /* The scale's floor: what a student needs to know is that everyone got in. */
  if (cut.everyoneIn) return { value: 'Everyone eligible', local: String(cut.value) };
  const value = String(cut.value);
  if (cut.anyDiploma) return { value: 'Any IB Diploma', local: value };
  if (cut.ibPoints) return { value: `${cut.ibPoints} IB points`, local: value };
  const first = value.match(/\d+(?:[.,]\d+)?/)?.[0];
  const top = value.match(/(?:\/|\bof\b|\bout of\b)\s*(\d+(?:[.,]\d+)?)\s*$/)?.[1];
  if (first && top) return { value: `${first} of ${top}`, local: String(cut.value) };
  if (value.length <= 18 || !first) return { value, local: null };
  return { value: first, local: String(cut.value) };
}

/**
 * The school's general IB rule, less any sentence about a sibling programme
 * and not this one ("Product and Interaction Design add Maths SL 4"). A
 * sibling is named when every identifying word of its name (two or more) is
 * in the sentence; a one-word name is too easily a subject.
 */
function generalRule(text, p, programmes) {
  const words = (s) => identityWords(s);
  const names = (sentence, q) => {
    const want = words(q.name);
    if (want.size < 2) return false;
    const have = words(sentence);
    return [...want].every((w) => have.has(w));
  };
  const siblings = programmes.filter((q) => q.slug !== p.slug);
  const kept = String(text)
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .filter((sentence) => names(sentence, p) || !siblings.some((q) => names(sentence, q)));
  return kept.join(' ') || text;
}

/* --- Dates ----------------------------------------------------------------
   When a student can apply, and why not when they cannot, is one rule for
   every country: src/lib/programme-deadline.mjs. */

/* --- Before you apply ------------------------------------------------------ */

/* A requirement line that says how places are decided. */
const SAYS_SELECTION = /\b(rank(ed|s|ing)?|select(ed|ion|s)?|interview(ed|s)?|portfolio|audition|work samples|admission test|aptitude|entrance (exam|test)|points|numerus clausus|places are limited)\b/i;

/* A note that changes whether or when to apply, rather than describing the
   degree: it leads "Before you apply". */
const CAUTION = /\b(must|cannot|can't|not|no|only|deadline|before|late|ask|restricted|binding|require[sd]?|need(s|ed)?|lose|miss|until|apply|register)\b/i;

/**
 * "Before you apply": the school record's notes that are this programme's to
 * read (`notesFor`), with the caution first, for the template's notice slot.
 */
function beforeYouApply(school, p) {
  const notes = notesFor(school, p);
  if (!notes.length) return [];
  /* Only notes about this programme reach it (`notesFor`: one that names
     it, or one that names no other programme and no other part of the
     school). A caution leads the shared list. */
  const lead = notes.find((n) => CAUTION.test(n.text));
  const kept = lead ? [lead, ...notes.filter((n) => n !== lead)] : notes;
  return kept.map((n) => ({ text: n.text }));
}

/* --- Names, towns and neighbours --------------------------------------------- */

/**
 * Whether a programme's `city` is (one of) the school's towns, however the
 * record spells its accents or lists several ("Joensuu or Kuopio"). A
 * programme taught online is at no other town.
 */
const fold = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const towns = (s) => fold(s).split(/,|\(|\band\b|\bor\b/).map((t) => t.trim()).filter(Boolean);
function sameTown(a, b) {
  if (/\b(online|distance)\b/i.test(a)) return true;
  const x = fold(a);
  const y = fold(b);
  if (x === y || x.includes(y) || y.includes(x)) return true;
  const theirs = new Set(towns(b));
  return towns(a).some((t) => theirs.has(t));
}

/**
 * What a card group draws when it has no photograph: its design's motif and
 * tone (src/lib/designed-backdrop.mjs), else null.
 */
const lookOf = (g) => (g.members.some((m) => m.backdrop) || !g.lead.design ? null : g.lead.design);

/**
 * Up to `n` programmes in the same field at the country's other schools
 * with programme pages (a listed school's degrees, a catalogue school's
 * flagships), one per school, in the country's school order: real records only.
 * Every school deals its designs apart, but the same field at two schools
 * can come out alike, so a card whose design looks like one already on the
 * page (`looks`: the hero's motif and tone, then each card taken), or looks
 * like a card already taken (`alike`: three cards in a column or a row sit
 * side by side), gives way to the school's next card, else to the next
 * school (#67 round 2: no two designed cards on one page alike).
 */
function sameFieldElsewhere(site, c, inst, p, n, today, looks = new Set()) {
  const schools = [];
  for (const s of c.institutions || []) {
    if (s.key === inst.key || !s.school?.programmes?.length) continue;
    /* A card, as the school's own page draws it: a family is one card (#52).
       Per school, one a final-year student can apply to now, if any. */
    const cards = schoolCards(s.school.programmes)
      .filter((x) => x.lead.field === p.field)
      .map((g) => ({ school: s, group: g, open: deadlineOf(site, s, c, g.lead, today).open }));
    if (cards.length) schools.push([...cards.filter((x) => x.open), ...cards.filter((x) => !x.open)]);
  }
  /* Somewhere they can apply comes first, then the country's order. */
  const ordered = [...schools.filter((cs) => cs[0].open), ...schools.filter((cs) => !cs[0].open)];
  const found = [];
  const picked = [];
  for (const cards of ordered) {
    if (found.length >= n) break;
    const fits = (x) => {
      const d = lookOf(x.group);
      return !d || (!looks.has(`${d.motif}/${d.tone}`) && !picked.some((y) => alike(y, d)));
    };
    const pick = cards.find(fits);
    if (!pick) continue;
    found.push(pick);
    const d = lookOf(pick.group);
    if (d) {
      looks.add(`${d.motif}/${d.tone}`);
      picked.push(d);
    }
  }
  return found;
}

/* --- The paths of a family ------------------------------------------------- */

/**
 * On every path's page of a family (issues #46 and #52): the same small
 * table, the current path marked, and only the facts in which the paths
 * actually differ — campus, start, deadline, places, the minimum, the
 * subjects, how places are decided, the last cut-off, the fee. A family whose
 * paths differ only in where they are taught says so in plain words first:
 * "The same programme is offered at the X campus and the Y campus." The markup
 * and its phone layout are shared with every paths table (site.css `.paths`).
 */
function schoolPathsTable(site, inst, p, { starts: startsOfPath, applyByOf }) {
  const group = schoolCards(inst.school.programmes).find((g) => g.members.some((m) => m.slug === p.slug));
  if (!group?.family || group.members.length < 2) return '';
  const members = group.members;
  const short = inst.shortName || inst.name;
  const sx = subjectIndexOf(site);
  const needsOf = (m) => (m.needs || []).map((n) => `${needPhrase(n, sx)}${n.grade ? ` (${n.grade}+)` : ''}`).join('; ') || null;
  const remote = members.some((m) => ['online', 'hybrid'].includes(deliveryModeOf(m)));
  const cities = [...new Set(members.map((m) => studyLocation(m, inst.city)).filter(Boolean))];
  const cols = [
    { head: 'Degree', cell: (m) => m.credential },
    { head: 'Length', cell: (m) => yearsText(m.years) },
    { head: remote ? 'Where' : 'Campus', cell: (m) => studyLocation(m, inst.city) },
    { head: 'Starts', cell: (m) => startsOfPath(m) },
    { head: 'Apply by', cell: (m) => applyByOf(m) },
    { head: 'Places', cell: (m) => placesText(m) },
    { head: 'Minimum', cell: (m) => (m.points ? `${m.points} IB points` : null) },
    { head: 'Subjects', cell: needsOf },
    { head: 'Places decided by', cell: (m) => (m.selection || []).map((x) => SELECTION[x]).filter(Boolean).join(', ') || null },
    { head: 'Last cut-off', cell: (m) => (m.cutoff ? cutoffTile(m.cutoff).value : null) },
    { head: 'EU/EEA fee', cell: (m) => feeText({ ...m, tuitionEuEea: valueAndNote(m.tuitionEuEea).value }) },
  ]
    // Only what differs, and not a fact every path's own label already says.
    .filter((c) => new Set(members.map((m) => c.cell(m) ?? '')).size > 1)
    .filter((c) => !members.every((m) => c.cell(m) && String(m.family.path).includes(c.cell(m))));
  const heads = new Set(cols.map((c) => c.head));
  const admissionDiffers = ['Minimum', 'Subjects', 'Places decided by'].some((h) => heads.has(h));
  /* "Taught on two campuses" only when each path is a place, not a path
     named for one (IE's "Segovia or Madrid" beside a Global BBA). */
  const onlyCampus = !remote && cities.length > 1 && group.family.axis === 'campus';
  /* Whatever the axis, paths on different campuses say so in plain words (#52). */
  const lede = admissionDiffers
    ? 'Entry requirements differ between them.'
    : heads.has('Last cut-off') ? 'Last year’s cut-offs differed.' : '';
  return html`<section class="paths" aria-labelledby="paths-title">
    <h2 id="paths-title">${((w) => (onlyCampus ? `Taught on ${w} campuses` : `${w[0].toUpperCase()}${w.slice(1)} ways to take it`))(String(NUMBER_WORDS[members.length] || members.length))}</h2>
    ${lede ? html`<p class="paths__lede">${lede}</p>` : ''}
    <div class="table-scroll paths__scroll"><table class="data paths__table">
      <thead><tr><th scope="col">Path</th>${cols.map((c) => html`<th scope="col">${c.head}</th>`)}<th scope="col">What is different</th></tr></thead>
      <tbody>${members.map((m) => {
        const here = m.slug === p.slug;
        return html`<tr${here ? html` aria-current="page" class="paths__here"` : ''}>
          <th scope="row">${here
            ? html`<strong>${m.family.path}</strong>`
            : html`<a href="${url(m.href)}">${m.family.path}</a>`}</th>
          ${/* A cell that repeats the path's own name says nothing more (round 8). */
            cols.map((c) => (c.cell(m) && String(c.cell(m)) !== String(m.family.path) ? html`<td data-label="${c.head}">${c.cell(m)}</td>` : html`<td class="is-empty" data-label="${c.head}">—</td>`))}
          <td class="paths__diff" data-label="What is different">${m.family.differs}</td>
        </tr>`;
      })}</tbody>
    </table></div>
  </section>`;
}

/* --- The page ------------------------------------------------------------- */

export function schoolProgrammePage(site, inst, c, p, { prev, next } = {}) {
  const school = inst.school;
  const opp = site.graph?.opportunities?.get(p.opportunityId || p.intakes?.[0]?.id);
  const route = site.graph?.applicationRoutes?.get(opp?.applicationRoutes?.[0]);
  const system = site.graph?.applicationSystems?.get(route?.applicationSystem);
  const apply = school.apply || (route?.portalUrl ? { url: route.portalUrl, via: system?.name || 'Application portal' } : null);
  const rules = opp || (p.requirements?.length ? p : null);
  const award = rules ? entryAward(rules) : null;
  const openQuestions = (rules?.requirements || []).filter((r) => r.mandatory !== false && r.openQuestion);
  const scheme = (site.recognitionSchemes || []).find((x) => x.destination === c.code);
  const cutoffScale = p.cutoff?.scale && p.cutoff.scale === scheme?.gradeScale?.id ? scheme.gradeScale.name : null;
  const languageWarning = intakeLanguageWarning(p);
  const short = inst.shortName || inst.name;
  const where = inst.shortName && inst.shortName.length > 4 ? inst.shortName : inst.name;
  const today = new Date().toISOString().slice(0, 10);
  const year = String(school.intake || '').match(/\d{4}/)?.[0] || null;
  /* When to apply, or why not yet: one rule for every country, shared with
     every card that stands for this programme (programme-deadline.mjs). */
  const dl = deadlineOf(site, inst, c, p, today);
  const { scope, keep, status } = dl;
  /* With no round open to the reader, the route's steps (its second round's
     results, say) are not theirs either: the school's own dates and the IB
     calendar stay. */
  const noRound = status && (status.value === NOT_OPEN_YET || status.value === AFTER_DIPLOMA);
  const keepShown = noRound ? (e) => keep(e) && (e.schoolOwn || Boolean(e.ibCalendar)) : keep;
  /* The dates panel opens on the tile's own words when there is no date. */
  const dates = datesPanel(site, scope.inst, {
    programme: scope.programme,
    countryName: c.articleName || c.name,
    keep: keepShown,
    status: status ? { value: dl.tile.value, note: dl.tile.note } : null,
  });
  const statusOf = (owner, q) => deadlineOf(site, owner, c, q, today).chip;

  const title = displayName(p.name);
  /* The page opens on the picture its card shows (#67: the reader clicks a
     card and the page opens on the same image): its own photograph (#54);
     on the page a family's card opens, the photograph that card shows;
     else the design generated for it, which hero() draws when there is no
     image. The school's photograph heads the school's page, not this one. */
  const card = schoolCards(school.programmes).find((g) => g.members.some((m) => m.slug === p.slug));
  const photo = p.backdrop || (card?.lead?.slug === p.slug ? card.members.find((m) => m.backdrop)?.backdrop : null) || null;
  const image = photo
    ? {
        src: photo.src,
        alt: truncate(photo.alt || title, 120),
        credit: photo.credit ? { ...photo.credit, text: truncate(photo.credit.text, 100) } : null,
        focal: photo.focus || '50% 50%',
      }
    : null;

  /* With an `overview` (the owner, 14 Oct 2026: "more like a short paragraph,
     kind of like the course description"), the one-liner opens the page and
     the paragraph is "What it is". */
  const overview = p.overview?.trim() || '';
  /* Every programme page has a "What it is" (owner, 14 Oct 2026: "the same
     program template for every single program"): the overview, or else the
     one-liner whole, with that one-line field opening the hero. */
  const lede = programmeSummary(p, describe(p, inst));
  const whatItIs = overview || p.about || describe(p, inst);

  /* When it starts, only as a record says it; else the season. */
  const starts = p.startMonth || startsOf(school, p, dl);

  const selection = p.selection || [];
  const cut = p.cutoff;
  const cutShown = cut ? cutoffTile(cut) : null;
  const placesNote = placesText(p);
  /* Where the record has no `selection` but its requirement line says how
     places are decided, the tile points to it rather than calling it a gap. */
  const saysSelection = !selection.length && SAYS_SELECTION.test(`${p.ib || ''} ${school.ib?.text || ''}`);
  let admissionTile = cut
    ? { label: cut.everyoneIn ? 'Last year' : cut.ibPoints || cut.anyDiploma || /^\d+([.,]\d+)?$/.test(String(cut.value)) ? 'Last cut-off' : 'Last intake', value: cutShown.value, note: [cut.intake, placesNote].filter(Boolean).join(' · ') }
    : {
        label: 'Admission',
        value: saysSelection ? 'See what you need' : admissionValue(selection),
        /* The selection's name once: not as the value and again as its note. */
        note: [selection.length && !selection.includes('open') && admissionValue(selection) !== SELECTION[selection[0]] ? SELECTION[selection[0]] : null, placesNote].filter(Boolean).join(' · ') || null,
      };
  if (typeof p.restrictedAdmission === 'boolean' && !cut) admissionTile = {
    label: 'Admission',
    value: p.restrictedAdmission ? 'Limited places' : 'Open to all who qualify',
    note: (p.entryRequirements?.quotaFloors || []).map((f) => `${f.quota}: ${f.ibText}`).join('; ') || null,
  };
  /* A fee not recorded is a gap, and says so, as the Admission tile does. */
  const fee = p.tuitionEuEea ? valueAndNote(p.tuitionEuEea) : { value: 'Not recorded yet', note: null };

  /* What you need: the subjects in IB terms, the points, and the record's
     own line. With neither subjects nor points, that line is the requirement;
     with them, it is the fine print. With nothing of its own, the school's
     general rule is what applies, and is said so. */
  const sx = subjectIndexOf(site);
  const needs = (p.needs || []).map((n) => ({ phrase: needPhrase(n, sx), grade: n.grade, note: n.note }));
  const own = needs.length > 0 || !!p.points;
  const cards = needs.some((n) => n.note);
  const chips = own
    ? cards
      ? html`<ul class="need need--ib" aria-label="Required subjects">
          ${p.points ? html`<li class="need__card"><strong class="req-ib">IB Diploma</strong><span class="need__why">at least ${p.points} points</span></li>` : ''}
          ${needs.map((n) => html`<li class="need__card"><strong class="req-ib">${n.phrase}</strong>${
            n.grade || n.note ? html`<span class="need__why">${[n.grade ? `minimum ${n.grade}` : null, n.note].filter(Boolean).join(' · ')}</span>` : ''
          }</li>`)}
        </ul>`
      : html`<ul class="need" aria-label="Required subjects">
          ${p.points ? html`<li class="need__item"><strong>IB Diploma</strong><span>at least ${p.points} points</span></li>` : ''}
          ${needs.map((n) => html`<li class="need__item"><strong>${n.phrase}</strong>${n.grade ? html`<span>minimum ${n.grade}</span>` : ''}</li>`)}
        </ul>`
    : '';
  const rule = school.ib ? generalRule(school.ib.text, p, school.programmes) : null;
  const said = (text, label) => html`<ul class="need need--ib"><li class="need__card">${label ? html`<span class="need__why">${label}</span>` : ''}<span class="need__said">${text}</span></li></ul>`;
  const lead = p.entryRequirements ? requirementDetail(p.entryRequirements) : own ? chips : p.ib ? said(p.ib) : rule ? said(rule) : '';
  const generalShown = !own && !p.ib && !!rule;
  const fullBody = html`
    ${p.requirementsText ? note(p.requirementsText, { title: p.requirementsOfficial ? "In the institution's own words" : 'Requirements summary' }) : ''}
    ${(p.extraRequirements || []).length ? html`<h3>On top of the subjects</h3><ul>${p.extraRequirements.map((x) => html`<li>${x}</li>`)}</ul>` : ''}
    ${own && p.ib ? note(p.ib, { title: 'In its own words' }) : ''}
    ${rule && !generalShown ? html`<h3>Every IB applicant at ${where}</h3><p>${rule}</p>` : ''}
    ${[
      school.ib ? { href: school.ib.url, label: 'Where it says so' } : null,
      p.requirementsUrl ? { href: p.requirementsUrl, label: 'Its entry requirements' } : null,
    ]
      .filter(Boolean)
      .map((l) => html`<p><a href="${l.href}" rel="noopener nofollow">${l.label}<span aria-hidden="true"> ↗</span></a></p>`)}`;
  const hasFull = (own && p.ib) || school.ib || p.requirementsUrl || p.requirementsText || p.extraRequirements?.length;

  const selectionLabels = selection.map((s) => SELECTION[s]).filter(Boolean);
  const selectionFactors = p.selectionFactors || [];
  const rankingRules = (opp?.admission?.selection || []).map((r) => [r.description, r.weight ? `(${r.weight})` : null].filter(Boolean).join(' ')).filter(Boolean);
  const ownRanking = rankingRules.length ? rankingRules : p.selectionNote ? [p.selectionNote] : selectionFactors;
  const decided = selectionLabels.length || ownRanking.length || cut || rules || typeof p.restrictedAdmission === 'boolean'
    ? {
        short: ownRanking.length
          ? html`<div class="selection-rule">${ownRanking.map((rule) => md(rule))}</div>`
          : html`<p>${selectionLabels.length ? selectionLabels.join(' · ') : p.restrictedAdmission === false ? 'Everyone meeting the entry requirements is admitted.' : p.restrictedAdmission === true ? 'Places are limited; qualifying does not guarantee admission.' : 'The ranking rule is not recorded. Confirm it with the university.'}</p>`,
        body: html`${selectionLabels.length ? tags(selectionLabels, 'tag--brand') : ''}
          ${rankingRules.length && p.selectionNote && !rankingRules.includes(p.selectionNote) ? md(p.selectionNote) : ''}
          ${selectionFactors.length && ownRanking !== selectionFactors ? html`<h3>Selection factors</h3><ul>${selectionFactors.map((x) => html`<li>${x}</li>`)}</ul>` : ''}
          ${rules ? awardBlock(rules) : ''}
          ${typeof p.restrictedAdmission === 'boolean' ? note(
            p.restrictedAdmission
              ? 'Places are limited; qualifying does not guarantee admission.'
              : 'Everyone meeting the entry requirements is admitted. Confirm the published rules before applying.',
            { title: p.restrictedAdmission ? 'Limited places' : 'Open entry', kind: p.restrictedAdmission ? 'warn' : 'ok' }) : ''}
          ${p.restrictedAdmission === null ? note('Whether places are limited is not confirmed. Ask the university before relying on open entry.', { kind: 'warn', title: 'Admission not confirmed' }) : ''}
          ${cut ? html`${cut.scale
            ? md(cutoffSentence(cut, cutoffScale, scheme?.display?.averageExplainedAt ? url(scheme.display.averageExplainedAt) : null))
            : html`<p>Last admitted in ${cut.intake}: ${cut.value}${cut.ibPoints && !/\bIB\b/.test(String(cut.value)) ? ` (${cut.ibPoints} IB points)` : ''}.</p>`}
            <p>A past result, not a prediction.</p>
            ${cut.url ? html`<p><a href="${cut.url}" rel="noopener nofollow">Where it is published<span aria-hidden="true"> ↗</span></a></p>` : ''}` : ''}`,
        more: 'Admission rules and past cut-offs',
      }
    : null;

  /* A page with little of its own still ends on the way on, in the column. */
  /* Siblings are cards, never the page's own family: its paths are in the
     table above (#52). */
  const groups = schoolCards(school.programmes);
  const at = groups.findIndex((g) => g.members.some((q) => q.slug === p.slug));
  const siblings = groups.length > 1
    ? [1, 2, 3].map((k) => groups[(at + k) % groups.length]).filter((g, i, all) => g !== groups[at] && all.indexOf(g) === i)
    : [];
  /* A school with one programme: the same field at the country's other
     schools, so the column ends on possibilities, not paper. */
  const nearby = siblings.length
    ? []
    : sameFieldElsewhere(site, c, inst, p, 3, today, new Set(image || !p.design ? [] : [`${p.design.motif}/${p.design.tone}`]));

  const pageSources = [
    ...(p.sources || []),
    ...(opp?.sources || []),
    { title: `${p.name} at ${short}`, url: p.url, retrieved: school.retrieved },
    p.requirementsUrl ? { title: 'Entry requirements', url: p.requirementsUrl } : null,
    /* A flagship: the university's own page that presents it as a strength. */
    p.flagshipSource ? { title: p.flagshipSource.title, url: p.flagshipSource.url } : null,
    cut?.url ? { title: `Cut-off, ${cut.intake}`, url: cut.url, retrieved: p.verified || school.retrieved } : null,
    school.ib ? { title: `IB applicants at ${short}`, url: school.ib.url } : null,
  ].filter(Boolean);

  const notices = [
    languageWarning ? { title: p.languageNote ? languageWarning : null, text: p.languageNote || languageWarning } : null,
    ...beforeYouApply(school, p),
  ].filter(Boolean);

  const paths = pathsTable(site, p, { ...inst, programmes: school.programmes }) || schoolPathsTable(site, inst, p, {
    starts: (m) => (m.slug === p.slug ? starts : startsOf(school, m, deadlineOf(site, inst, c, m, today))),
    /* The same Apply-by as each path's own facts strip. */
    applyByOf: (m) => (m.slug === p.slug ? dl.tile.value : deadlineOf(site, inst, c, m, today).tile.value),
  });

  /* Drawn by the one programme template (src/templates/programme.mjs). */
  return programmeTemplate({
    hero: {
      eyebrow: [short, p.credential, `${p.years} yrs`, studyLocation(p, inst.city)].filter(Boolean).join(' · '),
      title,
      lede,
      image,
      design: p.design || null,
    },
    glance: [
      { label: 'Where', value: studyLocation(p, inst.city) || c.name, note: deliveryModeOf(p) === 'online' ? null : p.city || inst.city ? c.name : null },
      // "Grado (Spanish bachelor's degree)": the name, with its gloss as the note.
      { label: 'Degree', ...(p.degree ? { value: p.degree, note: /not a bachelor/i.test(p.degree) ? "Academy profession degree — not a bachelor's" : null } : valueAndNote(p.credential)) },
      { label: 'Length', value: `${p.years} years` },
      { label: 'Taught in', value: languageWarning ? 'Unconfirmed for this intake' : p.language || 'English' },
      { label: 'Starts', value: starts },
      /* Always a tile: a date, or why there is none (never dropped). */
      dl.tile,
      admissionTile,
      { label: 'EU/EEA fee', value: fee.value, note: fee.note },
    ],
    notices,
    trail: {
      country: { href: `${c.href}#institutions`, label: c.name },
      university: { href: inst.href, label: short, name: inst.name },
      title,
    },
    dates,
    // One programme on several campuses, or as several paths: what differs.
    paths,
    need: {
      lead,
      extra: html`${openQuestions.map((r) => html`<p class="need__note req-open"><strong>${(r.satisfiedBy || []).includes('ib-diploma') ? 'With DP Course Results:' : 'Open question:'}</strong> ${r.label ? `${r.label} — ` : ''}${r.openQuestion}</p>`)}
        ${award === ENTRY_AWARD.NOT_ESTABLISHED ? awardBlock(rules) : ''}`,
      full: hasFull ? fullBody : null,
      cta: p.requirements?.length ? { href: '/planner/', label: 'Check my subjects against it' } : null,
    },
    decided,
    // Always a "What it is", always under its own opening line.
    what: { short: whatItIs, lede, body: p.ects ? facts([{ label: 'Credits', value: `${p.ects} ECTS` }]) : null, more: p.ects ? 'Credits' : null },
    more: siblings.length
      ? { title: `Other degrees at ${short}`, cards: siblings.map((g) => ({ field: FIELD[g.lead.field], html: programmeCard(inst, g, { tuitionOnCard: false, headed: false, brief: true, statusOf: (q) => statusOf(inst, q) }) })) }
      : nearby.length
        ? {
            title: `More ${FIELD[p.field].toLowerCase()} degrees in ${c.name}`,
            cards: nearby.map(({ school: s, group: g }) => ({ field: FIELD[g.lead.field], html: programmeCard(s, g, { tuitionOnCard: false, headed: false, brief: true, at: s.shortName || s.name, statusOf: (q) => statusOf(s, q) }) })),
          }
        : null,
    sources: pageSources,
    catalogue: programmeCataloguePanel(programmeCatalogue(site.externalCatalogues?.studyinfo, inst.key, p)),
    rail: {
      checked: p.verified || school.retrieved,
      carryForward: school.carryForward,
      official: p.url,
      rows: [
        /* The name as the institution writes it, where the title shortens it. */
        { label: 'Official name', value: title !== p.name ? p.name : null },
        { label: 'Institution', value: html`<a href="${url(inst.href)}">${inst.name}</a>` },
        { label: 'Country', value: html`<a href="${url(c.href)}">${c.name}</a>` },
        { label: 'Apply via', value: apply ? html`<a href="${apply.url}" rel="noopener nofollow">${apply.via.split(' (')[0]}</a>` : null },
        /* The code the application asks for (a CAO code), when it has one. */
        { label: 'Course code', value: p.code || null },
      ],
    },
    pager: { prev, next },
    page: {
      title: `${p.name} — ${short}`,
      description: truncate(
        p.about || `${p.name} (${p.credential}) at ${inst.name}, ${c.name}: what it asks of IB students, and when to apply.`,
        155
      ),
      path: p.href,
      section: '/countries/',
    },
  });
}
