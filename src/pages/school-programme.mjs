import { html, plural, truncate, firstSentence } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import { hero, crumbs, glance, topic, facts, note, stamp, pager, close, tags, sources } from '../lib/components.mjs';
import { buildSubjectIndex, ibTermsPhrase } from '../lib/eligibility.mjs';
import { ibOption } from '../lib/canonical.mjs';
import { datesPanel, datesFor, isBinding } from '../lib/school-dates.mjs';
import { hostOf } from '../lib/schools.mjs';
import { prettyDate } from './programme-facts.mjs';
import { FIELD } from './schools.mjs';

/**
 * A page for one programme of a listed school record (issue #43), laid out
 * like a Danish Programme page (programme.mjs): the facts strip, the dates,
 * what you need in IB terms, how places are decided, what it is, then one
 * targeted hand-off to the programme's own page.
 *
 * It shows only what the record holds (schemas/school.schema.json, `programme`).
 * A programme with just a name, a credential, a length and an `ib` line is a
 * short, honest page; `about`, `needs`, `points`, `selection`, `cutoff`,
 * `places` and `starts` each light up their block once a researcher fills
 * them. Nothing here names a country or a school.
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
 * Maths", "Physics (SL or HL)". The options are built exactly as a canonical
 * requirement published in IB terms is (canonical.mjs ibOption) and phrased by
 * the same function (eligibility.mjs ibTermsPhrase), so a school record and a
 * Danish record can never name one requirement two ways. A subject only
 * offered at SL is never said to be accepted at HL.
 */
export function needPhrase(need, subjectIndex) {
  const options = (need.anyOf || []).map((id) => {
    const o = ibOption({ ibSubject: id, ibLevel: need.level }, subjectIndex);
    const offered = subjectIndex.get(id)?.levels;
    const levels = offered ? o.levels.filter((l) => offered.includes(l)) : o.levels;
    return { ...o, levels: levels.length ? levels : o.levels };
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
  };
}

/** The first binding closing date still ahead: the one to plan around. */
function applyBy(site, scope, today) {
  const e = datesFor(site, scope.inst, { programme: scope.programme }).find(
    (x) => isBinding(x) && (x.endDate || x.date) >= today && (x.kind === 'closes' || /\b(clos|deadline|application)/i.test(x.label))
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
  const dates = datesPanel(site, scope.inst, { programme: scope.programme, countryName: c.articleName || c.name });
  const closes = applyBy(site, scope, today);

  const year = String(school.intake || '').match(/\d{4}/)?.[0] || null;
  /* The schema records a start month only when it is not September. */
  const starts = p.starts || (/autumn/.test(school.intake || '') ? 'September' : null);

  const cut = p.cutoff;
  const cutValue = cut ? (cut.ibPoints ? `${cut.ibPoints} IB points` : cut.value) : null;
  const entryTile = cut
    ? { label: 'Last cut-off', value: cutValue, note: [cut.ibPoints && cut.value !== cutValue ? cut.value : null, cut.intake, 'not a prediction'].filter(Boolean).join(' · ') }
    : p.points
    ? { label: 'Minimum', value: `${p.points} IB points` }
    : (p.selection || []).includes('open')
    ? { label: 'Admission', value: 'Open to all who qualify' }
    : null;

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
  const said = (text, label) => html`<ul class="need need--ib"><li class="need__card">${label ? html`<span class="need__why">${label}</span>` : ''}<span class="need__said">${text}</span></li></ul>`;
  const lead = own ? chips : p.ib ? said(p.ib) : school.ib ? said(school.ib.text, `Every IB applicant at ${where}`) : '';
  const generalShown = !own && !p.ib && !!school.ib;
  const fullBody = html`
    ${own && p.ib ? note(p.ib, { title: 'In its own words' }) : ''}
    ${school.ib && !generalShown
      ? html`<h3>Every IB applicant at ${where}</h3><p>${school.ib.text}</p>`
      : ''}
    ${[
      school.ib ? { href: school.ib.url, label: 'Where it says so' } : null,
      p.requirementsUrl ? { href: p.requirementsUrl, label: 'Its entry requirements' } : null,
    ]
      .filter(Boolean)
      .map((l) => html`<p><a href="${l.href}" rel="noopener nofollow">${l.label}<span aria-hidden="true"> ↗</span></a></p>`)}`;
  const hasFull = (own && p.ib) || school.ib || p.requirementsUrl;

  const selection = (p.selection || []).map((s) => SELECTION[s]).filter(Boolean);
  const decided = selection.length || p.selectionNote || cut || p.places
    ? topic({
        id: 'selection',
        title: 'How places are decided',
        short: html`${selection.length ? tags(selection, 'tag--brand') : ''}${p.selectionNote ? html`<p>${p.selectionNote}</p>` : ''}${
          !selection.length && !p.selectionNote ? html`<p>${p.places ? `${plural(p.places, 'study place')}.` : 'A past cut-off is recorded.'}</p>` : ''
        }`,
        body: cut || (p.places && (selection.length || p.selectionNote))
          ? html`${cut
              ? html`<p>Last admitted in ${cut.intake}: ${cut.value}${cut.ibPoints && !/\bIB\b/.test(cut.value) ? ` (${cut.ibPoints} IB points)` : ''}.</p>
                  <p>A past result, not a prediction.</p>
                  <p><a href="${cut.url}" rel="noopener nofollow">Where it is published<span aria-hidden="true"> ↗</span></a></p>`
              : ''}
            ${p.places && (selection.length || p.selectionNote) ? html`<p>${plural(p.places, 'study place')}.</p>` : ''}`
          : '',
        more: cut ? 'The last cut-off' : 'Study places',
      })
    : '';

  const pageSources = [
    { title: `${p.name} at ${short}`, url: p.url, retrieved: school.retrieved },
    p.requirementsUrl ? { title: 'Entry requirements', url: p.requirementsUrl } : null,
    cut ? { title: `Cut-off, ${cut.intake}`, url: cut.url } : null,
    school.ib ? { title: `IB applicants at ${short}`, url: school.ib.url } : null,
  ].filter((s, i, all) => s && all.findIndex((t) => t && t.url === s.url) === i);

  const body = html`
${hero({
  crumbs: crumbs([
    { href: `${c.href}#institutions`, label: c.name },
    { href: inst.href, label: short },
    { label: p.name },
  ]),
  eyebrow: [short, p.credential, `${p.years} yrs`, p.city || inst.city].filter(Boolean).join(' · '),
  title: p.name,
  lede: p.about ? firstSentence(p.about, 40) : null,
  variant: 'panel',
})}

<section class="section section--tinted section--glance">
  <div class="wrap">
    ${glance([
      { label: 'Where', value: [p.city || inst.city, c.name].filter(Boolean).join(', ') || null },
      { label: 'Degree', value: p.credential },
      { label: 'Length', value: `${p.years} years` },
      { label: 'Taught in', value: 'English' },
      { label: 'Starts', value: starts ? [starts, year].filter(Boolean).join(' ') : null },
      { label: 'Apply by', value: closes ? prettyDate(closes) : null },
      entryTile,
      { label: 'Places', value: p.places ? String(p.places) : null },
      { label: 'EU/EEA fee', value: p.tuitionEuEea || null },
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

        ${decided}

        ${p.about
          ? topic({
              id: 'what',
              title: 'What it is',
              short: p.about,
              body: facts([
                { label: 'Degree', value: p.credential },
                { label: 'Length', value: `${p.years} years` },
                { label: 'Field', value: FIELD[p.field] || null },
              ]),
              more: 'Degree and length',
            })
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
  title: `${p.name} at ${short}`,
  invitation: { href: p.url, label: `Open on ${hostOf(p.url)} ↗` },
  also: [{ href: inst.href, label: `Every degree at ${short}` }],
})}

<section class="section section--pager">
  <div class="wrap">${pager({ prev, next })}</div>
</section>`;

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
