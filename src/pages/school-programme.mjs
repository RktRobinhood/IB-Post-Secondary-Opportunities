import { html, plural, truncate, firstSentence } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import { hero, crumbs, glance, topic, note, stamp, pager, close, tags, sources, facts } from '../lib/components.mjs';
import { buildSubjectIndex, ibTermsPhrase } from '../lib/eligibility.mjs';
import { ibOption } from '../lib/canonical.mjs';
import { identityWords } from '../lib/calendar.mjs';
import { picture } from '../lib/data.mjs';
import { datesPanel, datesFor, isBinding } from '../lib/school-dates.mjs';
import { hostOf } from '../lib/schools.mjs';
import { prettyDate } from './programme-facts.mjs';
import { FIELD, inCardOrder, programmeCard } from './schools.mjs';

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
 * replaces whatever route date they replaced.
 */
function forDates(inst, c, p) {
  const school = inst.school;
  let dates = school.dates || [];
  if (p.closes) {
    const replaced = dates.filter((d) => d.kind === 'closes');
    const supersedes = replaced.find((d) => d.supersedes)?.supersedes;
    dates = [
      ...dates.filter((d) => d.kind !== 'closes'),
      { label: 'Applications close', date: p.closes, kind: 'closes', who: 'any', url: p.requirementsUrl || p.url, ...(supersedes ? { supersedes } : {}) },
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
    if (e.schoolOwn) return true;
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
 * a label connects. None qualifying, no tile. The school-pages guard holds
 * every built tile to the same sources.
 */
function applyBy(site, scope, keep, today) {
  const recorded = new Set(scope.inst.school.dates.map((d) => d.date));
  const e = datesFor(site, scope.inst, { programme: scope.programme }).find(
    (x) =>
      x.schoolOwn && keep(x) && isBinding(x) && READER.has(x.audience || 'any') && (x.endDate || x.date) >= today &&
      (recorded.has(x.endDate || x.date) || (x.institutions || []).includes(scope.inst.key)) &&
      (x.kind ? x.kind === 'closes' : /\b(clos|deadline)/i.test(x.label))
  );
  return e ? e.endDate || e.date : null;
}

/* --- The page ------------------------------------------------------------- */

export function schoolProgrammePage(site, inst, c, p, { prev, next } = {}) {
  const school = inst.school;
  const short = inst.shortName || inst.name;
  const where = inst.shortName && inst.shortName.length > 4 ? inst.shortName : inst.name;
  const today = new Date().toISOString().slice(0, 10);
  const scope = forDates(inst, c, p);
  const keep = keepFor(p, scope);
  const dates = datesPanel(site, scope.inst, { programme: scope.programme, countryName: c.articleName || c.name, keep });
  const closes = applyBy(site, scope, keep, today);

  /* The school's photograph: one slot with its page and its card. */
  const pic = picture(site, inst.key);
  const image = pic && !pic.external
    ? { src: pic.src, alt: pic.alt, credit: pic.credit && { ...pic.credit, text: truncate(pic.credit.text, 80) }, focal: '50% 45%' }
    : null;

  /* Said once: the lede is the first sentence of `about` only when "What it
     is" has more to say; otherwise a line from the record's own fields. */
  const aboutFirst = p.about ? firstSentence(p.about, 40) : '';
  const aboutRest = aboutFirst && !aboutFirst.endsWith('…') ? p.about.trim().slice(aboutFirst.length).trim() : '';
  const lede = aboutRest ? aboutFirst : describe(p, inst);
  const whatItIs = aboutRest || p.about || null;

  const year = String(school.intake || '').match(/\d{4}/)?.[0] || null;
  /* The schema records a start month only when it is not September. */
  const starts = p.starts || (/autumn/.test(school.intake || '') ? 'September' : null);

  const selection = p.selection || [];
  const cut = p.cutoff;
  const cutShown = cut ? cutoffTile(cut) : null;
  const placesNote = p.places ? plural(p.places, 'place') : null;
  const admissionTile = cut
    ? { label: 'Last cut-off', value: cutShown.value, note: [cut.intake, 'not a prediction', placesNote].filter(Boolean).join(' · ') }
    : {
        label: 'Admission',
        value: admissionValue(selection),
        note: [selection.length && !selection.includes('open') ? SELECTION[selection[0]] : null, placesNote].filter(Boolean).join(' · ') || null,
      };
  const fee = valueAndNote(p.tuitionEuEea);

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
  const bare = !p.about && !selection.length && !p.selectionNote && !cut;
  const progs = inCardOrder(school.programmes);
  const at = progs.findIndex((q) => q.slug === p.slug);
  const siblings = progs.length > 1
    ? [1, 2, 3].map((k) => progs[(at + k) % progs.length]).filter((q, i, all) => q.slug !== p.slug && all.indexOf(q) === i)
    : [];

  const pageSources = [
    { title: `${p.name} at ${short}`, url: p.url, retrieved: school.retrieved },
    p.requirementsUrl ? { title: 'Entry requirements', url: p.requirementsUrl } : null,
    cut ? { title: `Cut-off, ${cut.intake}`, url: cut.url } : null,
    school.ib ? { title: `IB applicants at ${short}`, url: school.ib.url } : null,
  ].filter((s, i, all) => s && all.findIndex((t) => t && t.url === s.url) === i);

  const handoff = { href: p.url, label: `Open on ${hostOf(p.url)} ↗` };

  const body = html`
${hero({
  crumbs: crumbs([
    { href: `${c.href}#institutions`, label: c.name },
    { href: inst.href, label: short },
    { label: p.name },
  ]),
  eyebrow: [short, FIELD[p.field] === 'Other' ? null : FIELD[p.field], p.credential, `${p.years} yrs`].filter(Boolean).join(' · '),
  title: p.name,
  lede,
  image,
  variant: image ? 'compact' : 'panel',
})}

<section class="section section--tinted section--glance">
  <div class="wrap">
    ${glance([
      { label: 'Where', value: p.city || inst.city || c.name, note: p.city || inst.city ? c.name : null },
      { label: 'Degree', value: p.credential },
      { label: 'Length', value: `${p.years} years` },
      { label: 'Taught in', value: 'English' },
      { label: 'Starts', value: starts ? [starts, year].filter(Boolean).join(' ') : null },
      { label: 'Apply by', value: closes ? prettyDate(closes) : null },
      admissionTile,
      { label: 'EU/EEA fee', value: fee.value, note: fee.note },
    ])}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="layout-aside${dates ? ' layout-aside--dates' : ''}">
      ${dates}
      <div class="prose">
        <h2 id="requirements">What you need</h2>
        ${lead}
        ${!lead ? html`<p class="need__note">No requirement is recorded here yet.</p>` : ''}
        ${hasFull
          ? html`<details class="topic__more"><summary>Requirements in full</summary><div class="topic__body">${fullBody}</div></details>`
          : ''}
        ${bare
          ? html`<p class="need__cta"><a class="btn btn--solid" href="${handoff.href}" rel="noopener nofollow">${handoff.label}</a></p>`
          : ''}

        ${decided}

        ${whatItIs ? topic({ id: 'what', title: 'What it is', short: whatItIs }) : ''}

        ${siblings.length
          ? html`<section class="topic" aria-labelledby="more-here">
              <h2 id="more-here">More at ${short}</h2>
              <div class="prog-siblings">${siblings.map((q) => programmeCard(inst, q, { tuitionOnCard: false, headed: false, brief: true }))}</div>
            </section>`
          : ''}

        <details class="sources-foot"><summary>Written from ${plural(pageSources.length, 'official page')}</summary>
          ${sources(pageSources, { title: null })}</details>
      </div>

      <aside class="layout-aside__side stack">
        ${stamp(school.retrieved)}
        ${facts([
          { label: 'Institution', value: html`<a href="${url(inst.href)}">${inst.name}</a>` },
          { label: 'Country', value: html`<a href="${url(c.href)}">${c.name}</a>` },
          {
            label: 'Apply via',
            value: school.apply ? html`<a href="${school.apply.url}" rel="noopener nofollow">${school.apply.via.split(' (')[0]}</a>` : null,
          },
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
