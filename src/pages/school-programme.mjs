import { html, plural, truncate, firstSentence } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import { hero, crumbs, glance, topic, note, stamp, pager, close, tags, sources, facts } from '../lib/components.mjs';
import { buildSubjectIndex, ibTermsPhrase } from '../lib/eligibility.mjs';
import { ibOption } from '../lib/canonical.mjs';
import { identityWords } from '../lib/calendar.mjs';
import { picture } from '../lib/data.mjs';
import { datesPanel, datesFor, isBinding, leadsFor, forReader } from '../lib/school-dates.mjs';
import { hostOf, roundOf, notesFor, NOT_OPEN_YET, AFTER_DIPLOMA } from '../lib/schools.mjs';
import { prettyDate } from './programme-facts.mjs';
import { FIELD, FAMILY, programmeCard, schoolCards, yearsText } from './schools.mjs';

/**
 * A page for one programme of a listed school record (issue #43), laid out
 * like a Danish Programme page (programme.mjs): the facts strip, the dates,
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
 * Its photograph is its school's: the school's hero, its card and its
 * programmes' pages are one image slot (docs/STATUS.md, #43), as a Danish
 * Programme page falls back to its Institution's picture.
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
 * canonical requirement published in IB terms is (canonical.mjs ibOption) and
 * phrased by the same function (eligibility.mjs ibTermsPhrase), so a school
 * record and a Danish record never name one requirement two ways.
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
  const city = p.city || inst.city;
  return `A ${[`${years}-year`, field, 'degree'].filter(Boolean).join(' ')}${city ? ` in ${city}` : ''}.`;
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
  if (cut.ibPoints) return { value: `${cut.ibPoints} IB points`, local: cut.value };
  const first = cut.value.match(/\d+(?:[.,]\d+)?/)?.[0];
  const top = cut.value.match(/(?:\/|\bof\b|\bout of\b)\s*(\d+(?:[.,]\d+)?)\s*$/)?.[1];
  if (first && top) return { value: `${first} of ${top}`, local: cut.value };
  if (cut.value.length <= 18 || !first) return { value: cut.value, local: null };
  return { value: first, local: cut.value };
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

/* --- Dates ---------------------------------------------------------------- */

/**
 * The school, as the dates panel reads it: its key as its id, its country as
 * its Destination, its programmes by slug (so a date naming a sibling stays on
 * the sibling's page), and the programme's own closing date in place of the
 * school's. A programme's `closes` is, by the schema, where it differs from
 * the institution's, so the school's closing dates give way to it, and it
 * replaces whatever route date they replaced. A programme whose only round is
 * for Diploma holders (`closesForDiplomaHolders`) keeps that on its date.
 *
 * A programme that runs in one of the school's rounds (`round`) reads that
 * round's dates only, and whether they are for Diploma holders is its own
 * answer: Umeå's January round needs the Diploma in hand, except for
 * Industrial Design, which tells a final-year student to apply in it.
 */
function forDates(inst, c, p) {
  const school = inst.school;
  let dates = school.dates || [];
  if (p.round) {
    const mine = roundOf(p.round);
    const rounds = new Set(dates.filter((d) => d.kind === 'closes').map((d) => roundOf(d.label)));
    dates = dates
      .filter((d) => !rounds.has(roundOf(d.label)) || roundOf(d.label) === mine)
      .map((d) => {
        if (roundOf(d.label) !== mine || !p.closes) return d;
        const { forDiplomaHolders, ...rest } = d;
        return p.closesForDiplomaHolders ? { ...rest, forDiplomaHolders: true } : rest;
      });
  }
  if (p.closes) {
    const replaced = dates.filter((d) => d.kind === 'closes');
    const supersedes = replaced.find((d) => d.supersedes)?.supersedes;
    dates = [
      ...dates.filter((d) => d.kind !== 'closes'),
      {
        label: p.closesForDiplomaHolders ? 'Applications close (only if you already hold your IB Diploma)' : 'Applications close',
        date: p.closes,
        kind: 'closes',
        who: 'any',
        url: p.requirementsUrl || p.url,
        ...(supersedes ? { supersedes } : {}),
        ...(p.closesForDiplomaHolders ? { forDiplomaHolders: true } : {}),
      },
    ];
  }
  return {
    inst: {
      ...inst,
      id: inst.key,
      destination: c.code,
      school: { ...school, dates },
      programmes: school.programmes.map((q) => ({ id: q.slug, name: q.name })),
    },
    programme: { id: p.slug, name: p.name },
    ownCloses: dates.some((d) => d.kind === 'closes'),
    ownRound: Boolean(p.round),
  };
}

/* Words that name a field of study, from the schema's field list. A date
   closing applications for a field names it ("Medicine and neighbours close").
   "Education" is left out: a deadline for "education finished this spring"
   means schooling, not the field. */
const NOT_A_FIELD = new Set(['education']);
const FIELD_WORDS = new Map(
  Object.entries(FIELD)
    .filter(([id]) => id !== 'other' && id !== 'interdisciplinary')
    .map(([id, label]) => [
      id,
      new Set([...id.split('-'), ...label.toLowerCase().split(/\s+/)].filter((w) => w.length > 3 && !NOT_A_FIELD.has(w))),
    ])
);

/**
 * Which dates are this programme's. The school's own (its record's, and a
 * route date tied to it or naming it) always are. A date of the route it is
 * applied through is, unless it is for a subset this programme is not
 * recorded in: numerus fixus only (a school record never says a programme is
 * one), or a deadline naming another field of study. Where the school's
 * record gives its own closing date, the route's deadlines are not its own.
 */
function keepFor(p, scope) {
  const mine = FIELD_WORDS.get(p.field) || new Set();
  const otherField = (label) => {
    const have = new Set(String(label).toLowerCase().split(/[^a-z]+/));
    return [...FIELD_WORDS].some(([id, ws]) => id !== p.field && [...ws].some((w) => have.has(w) && !mine.has(w)));
  };
  return (e) => {
    if (!forReader(e)) return false;
    if (e.schoolOwn) return true;
    /* A programme in one named round has all its dates in the record. */
    if (scope.ownRound) return false;
    if (e.numerusFixusOnly) return false;
    if (isBinding(e) && (scope.ownCloses || otherField(e.label))) return false;
    return true;
  };
}

/* The groups a date can be for that include this site's reader. */
const READER = new Set(['any', 'eu-eea-ch']);

/**
 * "Apply by": the programme's own closing date, else its school record's,
 * else a route date tied to the school by id (`institutions`). Never a
 * route's general date, which may be for other programmes, and never one only
 * a label connects. Never a date only for applicants who already hold the
 * Diploma (`forDiplomaHolders`): the reader is in their final IB year. Where
 * that is the only closing date there is, the tile says so instead of giving
 * a day; with none at all, no tile. The school-pages guard holds every built
 * tile to the same sources.
 */
function applyBy(site, scope, keep, today) {
  const recorded = new Set(scope.inst.school.dates.map((d) => d.date));
  const all = datesFor(site, scope.inst, { programme: scope.programme });
  const closing = all.filter(
    (x) =>
      x.schoolOwn && keep(x) && isBinding(x) && READER.has(x.audience || 'any') && (x.endDate || x.date) >= today &&
      (recorded.has(x.endDate || x.date) || (x.institutions || []).includes(scope.inst.key)) &&
      (x.kind ? x.kind === 'closes' : /\b(clos|deadline)/i.test(x.label))
  );
  const e = closing.find(leadsFor);
  const date = e ? e.endDate || e.date : null;
  /* A housing date is not an application deadline; one before it is worth
     knowing beside it ("Housing: apply by 1 May"). */
  const housing = date
    ? all.find((x) => x.kind === 'housing' && keep(x) && READER.has(x.audience || 'any') && x.date >= today && x.date <= date)
    : null;
  return { date, provisional: Boolean(e?.provisional), housing: housing?.date || null, holdersOnly: !e && closing.some((x) => x.forDiplomaHolders) };
}

/**
 * The Apply-by tile when no closing date is this reader's: every one is only
 * for applicants who already hold the Diploma. Two different answers, from
 * the record: the programme's only round needs the Diploma
 * (`closesForDiplomaHolders`), so it is a gap-year option; or no round for a
 * final-year student is published yet, so it may still open.
 */
function holdersStatus(p, year) {
  if (p.closesForDiplomaHolders) {
    return {
      value: AFTER_DIPLOMA,
      note: p.round ? `Runs only in the ${p.round}, which needs the Diploma in hand` : 'Its only round needs the Diploma in hand',
    };
  }
  return { value: NOT_OPEN_YET, note: `No ${year ? `${year} ` : ''}round for final-year IB students published yet` };
}


/* --- Before you apply ------------------------------------------------------ */

/* A requirement line that says how places are decided. */
const SAYS_SELECTION = /\b(rank(ed|s)?|select(ed|ion)?|interview(ed|s)?|portfolio|audition|work samples|admission test|aptitude|entrance exam)\b/i;

/**
 * "Before you apply": the school record's notes that are this programme's to
 * read (`notesFor`), the one that names it first. One line shows; the rest
 * are one tap down.
 */
function beforeYouApply(school, p) {
  const kept = notesFor(school, p);
  if (!kept.length) return '';
  const [first, ...more] = kept;
  /* Lines of a panel, not prose: the same school note is on each of its
     programmes' pages (the text-walls guard reads <p> as prose). */
  return html`<aside class="note note--warn note--before" aria-label="Before you apply">
    <p class="note__title">Before you apply</p>
    <div class="note__line">${first.text}</div>
    ${more.length
      ? html`<details class="note__more"><summary>${plural(more.length, 'more thing')} to know</summary>${more.map((n) => html`<div class="note__line">${n.text}</div>`)}</details>`
      : ''}
  </aside>`;
}

/* --- Names, towns and neighbours --------------------------------------------- */

/**
 * The programme's name without the degree type the eyebrow already carries:
 * "Bachelor´s Programme in Experimental and Industrial Biomedicine" is set
 * as "Experimental and Industrial Biomedicine", "BFA Programme in Metal Art"
 * as "Metal Art". The official name stays in the aside.
 */
export function displayName(name) {
  const n = String(name || '').trim();
  const shorter = n
    .replace(/^(?:International\s+)?(?:Bachelor(?:['´’]?s)?|BFA|BSc|BA)(?:\s+of\s+(?:Fine\s+Arts|Science|Arts))?(?:\s+(?:Programme|Program))?\s+(?:in|of)\s+/i, '')
    .replace(/,?\s+(?:Bachelor(?:['´’]?s)?\s+)?(?:Programme|Program)$/i, '')
    .trim();
  return shorter.length >= 3 && shorter !== n ? shorter.charAt(0).toUpperCase() + shorter.slice(1) : n;
}

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
 * Up to `n` programmes in the same field at the country's other listed
 * schools, one per school, in the country's school order: real records only.
 */
function sameFieldElsewhere(c, inst, p, n) {
  const out = [];
  for (const s of c.institutions || []) {
    if (out.length >= n) break;
    if (s.key === inst.key || s.school?.scope !== 'listed') continue;
    /* A card, as the school's own page draws it: a family is one card (#52). */
    const g = schoolCards(s.school.programmes).find((x) => x.lead.field === p.field);
    if (g) out.push({ school: s, group: g });
  }
  return out;
}

/* --- The paths of a family ------------------------------------------------- */

/** "the Lappeenranta campus and the Lahti campus". */
const campusList = (cities) => {
  const named = cities.map((c) => `the ${c} campus`);
  return named.length > 1 ? `${named.slice(0, -1).join(', ')} and ${named[named.length - 1]}` : named[0];
};

/**
 * On every path's page of a family (issues #46 and #52): the same small
 * table, the current path marked, and only the facts in which the paths
 * actually differ — campus, start, deadline, places, the minimum, the
 * subjects, how places are decided, the last cut-off, the fee. A family whose
 * paths differ only in where they are taught says so in plain words first:
 * "The same programme is offered at the X campus and the Y campus." The markup
 * and its phone layout are the Danish Paths table's (site.css `.paths`).
 */
function schoolPathsTable(site, inst, p, { starts: startsOf, applyByOf }) {
  const group = schoolCards(inst.school.programmes).find((g) => g.members.some((m) => m.slug === p.slug));
  if (!group?.family || group.members.length < 2) return '';
  const members = group.members;
  const short = inst.shortName || inst.name;
  const sx = subjectIndexOf(site);
  const needsOf = (m) => (m.needs || []).map((n) => `${needPhrase(n, sx)}${n.grade ? ` (${n.grade}+)` : ''}`).join('; ') || null;
  const cities = [...new Set(members.map((m) => m.city || inst.city).filter(Boolean))];
  const cols = [
    { head: 'Degree', cell: (m) => m.credential },
    { head: 'Length', cell: (m) => yearsText(m.years) },
    { head: 'Campus', cell: (m) => m.city || inst.city || null },
    { head: 'Starts', cell: (m) => startsOf(m) },
    { head: 'Apply by', cell: (m) => applyByOf(m) },
    { head: 'Places', cell: (m) => (m.places ? String(m.places) : null) },
    { head: 'Minimum', cell: (m) => (m.points ? `${m.points} IB points` : null) },
    { head: 'Subjects', cell: needsOf },
    { head: 'Places decided by', cell: (m) => (m.selection || []).map((x) => SELECTION[x]).filter(Boolean).join(', ') || null },
    { head: 'Last cut-off', cell: (m) => (m.cutoff ? cutoffTile(m.cutoff).value : null) },
    { head: 'EU/EEA fee', cell: (m) => valueAndNote(m.tuitionEuEea).value },
  ]
    // Only what differs, and not a fact every path's own label already says.
    .filter((c) => new Set(members.map((m) => c.cell(m) ?? '')).size > 1)
    .filter((c) => !members.every((m) => c.cell(m) && String(m.family.path).includes(c.cell(m))));
  const heads = new Set(cols.map((c) => c.head));
  const admissionDiffers = ['Minimum', 'Subjects', 'Places decided by'].some((h) => heads.has(h));
  const onlyCampus = cities.length > 1 && group.family.axis === 'campus';
  const lede = [
    onlyCampus ? `The same programme is offered at ${campusList(cities)}.` : `${short} offers this as ${members.length} paths.`,
    admissionDiffers
      ? 'What it takes to get in differs between them, so check each one.'
      : `The entry requirements are the same on each${heads.has('Last cut-off') ? ', but last year’s cut-offs were not' : ''}.`,
  ].join(' ');
  return html`<section class="paths" aria-labelledby="paths-title">
    <h2 id="paths-title">${onlyCampus ? `${displayName(group.family.name)} on ${members.length} campuses` : `${members.length} ways to study ${displayName(group.family.name)}`}</h2>
    <p class="paths__lede">${lede}</p>
    <div class="table-scroll paths__scroll"><table class="data paths__table">
      <thead><tr><th scope="col">Path</th>${cols.map((c) => html`<th scope="col">${c.head}</th>`)}<th scope="col">What is different</th></tr></thead>
      <tbody>${members.map((m) => {
        const here = m.slug === p.slug;
        return html`<tr${here ? html` aria-current="page" class="paths__here"` : ''}>
          <th scope="row">${here
            ? html`<strong>${m.family.path}</strong> <span class="paths__you">You are here</span>`
            : html`<a href="${url(m.href)}">${m.family.path}</a>`}</th>
          ${cols.map((c) => html`<td data-label="${c.head}">${c.cell(m) || '—'}</td>`)}
          <td class="paths__diff" data-label="What is different">${m.family.differs}</td>
        </tr>`;
      })}</tbody>
    </table></div>
  </section>`;
}

/* --- The page ------------------------------------------------------------- */

export function schoolProgrammePage(site, inst, c, p, { prev, next } = {}) {
  const school = inst.school;
  const short = inst.shortName || inst.name;
  const where = inst.shortName && inst.shortName.length > 4 ? inst.shortName : inst.name;
  const today = new Date().toISOString().slice(0, 10);
  const year = String(school.intake || '').match(/\d{4}/)?.[0] || null;
  const scope = forDates(inst, c, p);
  const keep = keepFor(p, scope);
  const { date: closes, provisional, housing, holdersOnly } = applyBy(site, scope, keep, today);
  const status = !closes && holdersOnly ? holdersStatus(p, year) : null;
  /* With no round open to the reader, the route's steps (its second round's
     results, say) are not theirs either: the school's own dates and the IB
     calendar stay. */
  const keepShown = status ? (e) => keep(e) && (e.schoolOwn || Boolean(e.ibCalendar)) : keep;
  const dates = datesPanel(site, scope.inst, { programme: scope.programme, countryName: c.articleName || c.name, keep: keepShown, status });

  /* The school's photograph: one slot with its page and its card. Not where
     the programme is taught in another town: a main-campus photograph over
     "a design degree in Dals Långed" names the wrong place. The page then
     opens on paper in the colour of its field. */
  const elsewhere = p.city && inst.city && !sameTown(p.city, inst.city);
  const pic = elsewhere ? null : picture(site, inst.key);
  const image = pic && !pic.external
    ? { src: pic.src, alt: pic.alt, credit: pic.credit && { ...pic.credit, text: truncate(pic.credit.text, 80) }, focal: '50% 45%' }
    : null;
  const title = displayName(p.name);

  /* Said once: the lede is the first sentence of `about` only when "What it
     is" has more to say; otherwise a line from the record's own fields. */
  const aboutFirst = p.about ? firstSentence(p.about, 40) : '';
  const aboutRest = aboutFirst && !aboutFirst.endsWith('…') ? p.about.trim().slice(aboutFirst.length).trim() : '';
  const lede = aboutRest ? aboutFirst : describe(p, inst);
  const whatItIs = aboutRest || p.about || null;

  /* The schema records a start month only when it is not September. */
  const starts = p.starts || (/autumn/.test(school.intake || '') ? 'September' : null);

  const selection = p.selection || [];
  const cut = p.cutoff;
  const cutShown = cut ? cutoffTile(cut) : null;
  const placesNote = p.places ? plural(p.places, 'place') : null;
  /* Where the record has no `selection` but its requirement line says how
     places are decided, the tile points to it rather than calling it a gap. */
  const saysSelection = !selection.length && SAYS_SELECTION.test(p.ib || '');
  const admissionTile = cut
    ? { label: 'Last cut-off', value: cutShown.value, note: [cut.intake, 'not a prediction', placesNote].filter(Boolean).join(' · ') }
    : {
        label: 'Admission',
        value: saysSelection ? 'See what you need' : admissionValue(selection),
        note: [selection.length && !selection.includes('open') ? SELECTION[selection[0]] : null, placesNote].filter(Boolean).join(' · ') || null,
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
  const lead = own ? chips : p.ib ? said(p.ib) : rule ? said(rule, `Every IB applicant at ${where}`) : '';
  const generalShown = !own && !p.ib && !!rule;
  const fullBody = html`
    ${own && p.ib ? note(p.ib, { title: 'In its own words' }) : ''}
    ${rule && !generalShown ? html`<h3>Every IB applicant at ${where}</h3><p>${rule}</p>` : ''}
    ${[
      school.ib ? { href: school.ib.url, label: 'Where it says so' } : null,
      p.requirementsUrl ? { href: p.requirementsUrl, label: 'Its entry requirements' } : null,
    ]
      .filter(Boolean)
      .map((l) => html`<p><a href="${l.href}" rel="noopener nofollow">${l.label}<span aria-hidden="true"> ↗</span></a></p>`)}`;
  const hasFull = (own && p.ib) || school.ib || p.requirementsUrl;

  const selectionLabels = selection.map((s) => SELECTION[s]).filter(Boolean);
  const decided = selectionLabels.length || p.selectionNote || cut
    ? topic({
        id: 'selection',
        title: 'How places are decided',
        /* One card, like the requirement: the note is often the school's
           and the same on each of its programmes. */
        short: selectionLabels.length || p.selectionNote
          ? html`<ul class="need need--ib"><li class="need__card need__card--plain">${selectionLabels.length ? tags(selectionLabels, 'tag--brand') : ''}${
              p.selectionNote ? html`<span class="need__said">${p.selectionNote}</span>` : ''
            }</li></ul>`
          : html`<p>A past cut-off is recorded.</p>`,
        body: cut
          ? html`<p>Last admitted in ${cut.intake}: ${cut.value}${cut.ibPoints && !/\bIB\b/.test(cut.value) ? ` (${cut.ibPoints} IB points)` : ''}.</p>
              <p>A past result, not a prediction.</p>
              <p><a href="${cut.url}" rel="noopener nofollow">Where it is published<span aria-hidden="true"> ↗</span></a></p>`
          : '',
        more: 'The last cut-off',
      })
    : '';

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
  const nearby = siblings.length ? [] : sameFieldElsewhere(c, inst, p, 3);

  const pageSources = [
    { title: `${p.name} at ${short}`, url: p.url, retrieved: school.retrieved },
    p.requirementsUrl ? { title: 'Entry requirements', url: p.requirementsUrl } : null,
    cut ? { title: `Cut-off, ${cut.intake}`, url: cut.url } : null,
    school.ib ? { title: `IB applicants at ${short}`, url: school.ib.url } : null,
  ].filter((s, i, all) => s && all.findIndex((t) => t && t.url === s.url) === i);

  const handoff = { href: p.url, label: `Open on ${hostOf(p.url)} ↗` };
  const before = beforeYouApply(school, p);

  const paths = schoolPathsTable(site, inst, p, {
    starts: (m) => m.starts || (/autumn/.test(school.intake || '') ? 'September' : null),
    /* The same reader-aware Apply-by as each path's own facts strip: an
       application deadline for this reader, else "After your Diploma" or
       "Not open yet" (round 3). */
    applyByOf: (m) => {
      if (m.slug === p.slug) return closes ? prettyDate(closes) : status ? status.value : null;
      const s = forDates(inst, c, m);
      const r = applyBy(site, s, keepFor(m, s), today);
      return r.date ? prettyDate(r.date) : r.holdersOnly ? holdersStatus(m, year).value : null;
    },
  });

  const body = html`
${hero({
  crumbs: crumbs([
    { href: `${c.href}#institutions`, label: c.name },
    { href: inst.href, label: short },
    { label: title },
  ]),
  eyebrow: [short, FIELD[p.field] === 'Other' ? null : FIELD[p.field], p.credential, `${p.years} yrs`].filter(Boolean).join(' · '),
  title,
  lede,
  image,
  variant: image ? 'compact' : 'panel',
  mod: image ? null : `hero--fam card--fam-${FAMILY[p.field] || 'general'}`,
})}

<section class="section section--tinted section--glance">
  <div class="wrap">
    ${glance([
      { label: 'Where', value: p.city || inst.city || c.name, note: p.city || inst.city ? c.name : null },
      { label: 'Degree', value: p.credential },
      { label: 'Length', value: `${p.years} years` },
      { label: 'Taught in', value: 'English' },
      { label: 'Starts', value: starts ? [starts, year].filter(Boolean).join(' ') : null },
      closes
        ? {
            label: 'Apply by',
            value: prettyDate(closes),
            /* A round the school has not confirmed for this year says so. */
            note: provisional ? `Not yet confirmed for ${year || 'this year'}` : housing ? `Housing: apply by ${prettyDate(housing).replace(/ \d{4}$/, '')}` : null,
          }
        : status
          ? { label: 'Apply by', value: status.value, note: status.note }
          : null,
      admissionTile,
      { label: 'EU/EEA fee', value: fee.value, note: fee.note },
    ])}
  </div>
</section>
${before
  ? html`<section class="section section--before">
      <div class="wrap">${before}</div>
    </section>`
  : ''}
<section class="section">
  <div class="wrap">
    <div class="layout-aside${dates ? ' layout-aside--dates' : ''}">
      ${dates}
      <div class="prose">
        ${/* One programme on several campuses, or as several paths: what
              differs, in one small table, on every path's page. */ paths}
        <h2 id="requirements">What you need</h2>
        ${lead}
        ${!lead ? html`<p class="need__note">No requirement is recorded here yet.</p>` : ''}
        ${hasFull
          ? html`<details class="topic__more"><summary>Requirements in full</summary><div class="topic__body">${fullBody}</div></details>`
          : ''}

        ${decided}

        ${whatItIs ? topic({ id: 'what', title: 'What it is', short: whatItIs }) : ''}

        ${siblings.length
          ? html`<section class="topic" aria-labelledby="more-here">
              <h2 id="more-here">More at ${short}</h2>
              <div class="prog-siblings">${siblings.map((g) => programmeCard(inst, g, { tuitionOnCard: false, headed: false, brief: true }))}</div>
            </section>`
          : nearby.length
            ? html`<section class="topic" aria-labelledby="more-here">
                <h2 id="more-here">More ${FIELD[p.field].toLowerCase()} in ${c.name}</h2>
                <div class="prog-siblings">${nearby.map(({ school: s, group: g }) => programmeCard(s, g, { tuitionOnCard: false, headed: false, brief: true, at: s.shortName || s.name }))}</div>
              </section>`
            : ''}

        <details class="sources-foot"><summary>Written from ${plural(pageSources.length, 'official page')}</summary>
          ${sources(pageSources, { title: null })}</details>
      </div>

      <aside class="layout-aside__side stack">
        ${stamp(school.retrieved)}
        ${facts([
          /* The name as the institution writes it, where the title shortens it. */
          { label: 'Official name', value: title !== p.name ? p.name : null },
          { label: 'Institution', value: html`<a href="${url(inst.href)}">${inst.name}</a>` },
          { label: 'Country', value: html`<a href="${url(c.href)}">${c.name}</a>` },
          {
            label: 'Apply via',
            value: school.apply ? html`<a href="${school.apply.url}" rel="noopener nofollow">${school.apply.via.split(' (')[0]}</a>` : null,
          },
          /* The code the application asks for (a CAO code), when it has one. */
          { label: 'Course code', value: p.code || null },
        ])}
        ${note('Requirements change between admission years. Check the official page before you apply.', { kind: 'warn', title: 'Always verify' })}
      </aside>
    </div>
  </div>
</section>

${close({
  // The one link that leaves the site: the programme's own page.
  eyebrow: 'Next step',
  title: "The programme's own page",
  invitation: handoff,
  also: [{ href: inst.href, label: `Every degree at ${short}` }],
})}
${prev || next
  ? html`<section class="section section--pager">
      <div class="wrap">${pager({ prev, next })}</div>
    </section>`
  : ''}`;

  return page({
    title: `${p.name} — ${short}`,
    description: truncate(
      p.about || `${p.name} (${p.credential}) at ${inst.name}, ${c.name}: what it asks of IB students, and when to apply.`,
      155
    ),
    path: p.href,
    section: '/countries/',
    body,
    scripts: dates ? ['dates-panel.js'] : undefined,
  });
}
