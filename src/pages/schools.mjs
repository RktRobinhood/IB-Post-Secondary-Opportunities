import { html, raw, plural, truncate, firstSentence } from '../lib/html.mjs';
import { page } from '../lib/layout.mjs';
import { hero, card, sources, crumbs, sectionHead, tags, stamp, pager, topic, glance, close } from '../lib/components.mjs';
import { picture } from '../lib/data.mjs';
import { hostOf, isHomepage } from '../lib/schools.mjs';

/**
 * A school page: one institution from a country profile (issue #43).
 *
 * The same shape as a canonical institution's page (institutions.mjs), in the
 * same order: the place, then what you could study there, then when and what
 * it asks of you, then one targeted link on to the institution's own site.
 *
 * What is in the programme section depends only on the record's `scope`
 * (schemas/school.schema.json), never on the country:
 *   - listed: a card per English-taught degree, each linking to its own page;
 *   - catalogue: nearly everything is taught in English, so one way into the
 *     course search instead of a list nobody could keep true;
 *   - none: nothing in English, said plainly;
 *   - no record yet: the profile's one-line answer, and the admissions page.
 *
 * Every sentence written here is under twelve words: it appears on hundreds
 * of pages, and the text-walls guard counts repeated sentences of twelve or
 * more as boilerplate.
 */

const FIELD = {
  engineering: 'Engineering', computing: 'Computing', 'natural-sciences': 'Sciences', mathematics: 'Maths',
  business: 'Business', economics: 'Economics', 'social-sciences': 'Social sciences', law: 'Law',
  humanities: 'Humanities', languages: 'Languages', education: 'Education', health: 'Health',
  medicine: 'Medicine', veterinary: 'Veterinary', 'agriculture-environment': 'Environment',
  'design-architecture': 'Design', 'arts-music': 'Arts', sport: 'Sport', 'hospitality-tourism': 'Hospitality',
  interdisciplinary: 'Interdisciplinary', other: 'Other',
};
/* Each field's colour band on its card: six hues from the palette, so cards in
   one grid are told apart at a glance without a photograph each. */
const BAND = Object.fromEntries(Object.keys(FIELD).map((f, i) => [f, i % 6]));

const TODAY = new Date().toISOString().slice(0, 10);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

/** A profile's free-text answer, down to its first clause: "None", "Limited". */
const firstClause = (text, words = 12) =>
  truncate(
    String(text || '')
      .replace(/,?\s*(checked|as of|on)\s+\d{4}-\d{2}-\d{2}/gi, '')
      .split(/[.;:(]| — /)[0]
      .trim()
      .split(/\s+/)
      .slice(0, words)
      .join(' '),
    80
  );

/** The one page a student goes on to: the record's hand-off, else admissions. */
function handoffOf(inst) {
  if (inst.school?.handoff) return inst.school.handoff;
  if (inst.admissionsUrl && !isHomepage(inst.admissionsUrl, inst.website)) {
    return { label: 'Its admissions page', url: inst.admissionsUrl };
  }
  return null;
}

function programmeCards(inst, school) {
  return [...school.programmes]
    .sort((a, b) => a.field.localeCompare(b.field) || a.name.localeCompare(b.name))
    .map((p) =>
      card({
        href: p.url,
        external: true,
        mod: `card--prog card--band-${BAND[p.field] ?? 0}`,
        kicker: FIELD[p.field],
        title: p.name,
        // "BSc · 3 yrs · Vaasa": the degree type straight under the name.
        sub: [p.credential, `${p.years} yrs`, p.city && p.city !== inst.city ? p.city : null].filter(Boolean).join(' · '),
        text: p.ib || null,
        tags: [
          p.closes ? { label: `Apply by ${shortDate(p.closes)}`, mod: 'sand' } : null,
          p.tuitionEuEea ? { label: `EU/EEA: ${p.tuitionEuEea}`, mod: 'brand' } : null,
        ].filter(Boolean),
      })
    );
}

function knownFor(inst) {
  const f = inst.notableFields || [];
  return f.length ? html`<div class="handoff__known">${tags(f, 'tag--brand')}</div>` : '';
}

function programmeSection(inst) {
  const school = inst.school;
  const where = inst.shortName && inst.shortName.length > 4 ? inst.shortName : inst.name;

  if (school?.scope === 'listed') {
    const n = school.programmes.length;
    return html`${sectionHead({
        title: 'What you could study here',
        lede: `${plural(n, "bachelor's degree")} taught in English.`,
        id: 'programmes',
      })}
      <div class="grid ${n <= 2 ? 'grid--2' : 'grid--3'}">${programmeCards(inst, school)}</div>`;
  }

  if (school?.scope === 'catalogue') {
    return html`${sectionHead({ title: 'What you could study here', id: 'programmes' })}
      <div class="handoff">
        <p class="handoff__line">Nearly every course at ${where} is taught in English.</p>
        ${knownFor(inst)}
      </div>`;
  }

  if (school?.scope === 'none') {
    return html`${sectionHead({ title: 'Nothing taught in English', id: 'programmes' })}
      <div class="handoff">
        <p class="handoff__line">No bachelor's degree here is taught in English for 2027.</p>
        ${knownFor(inst)}
      </div>`;
  }

  // Not researched yet: the profile's one-line answer, honestly labelled.
  const answer = firstClause(inst.englishBachelors);
  return html`${sectionHead({ title: 'What you could study here', id: 'programmes' })}
    <div class="handoff">
      ${answer ? html`<p class="handoff__line">In English: ${answer}.</p>` : ''}
      ${knownFor(inst)}
      <p class="handoff__todo">We have not listed its programmes one by one yet.</p>
    </div>`;
}

/**
 * Deadlines & sessions. Dates already gone fold into one line at the foot,
 * so the first line is always the next thing to do.
 */
function datesPanel(inst, c) {
  const all = [...(inst.school?.dates || [])].sort((a, b) => a.date.localeCompare(b.date));
  const ahead = all.filter((d) => d.date >= TODAY);
  const gone = all.filter((d) => d.date < TODAY);
  const item = (d) => html`<li data-date="${d.date}"><strong>${shortDate(d.date)}</strong>
    <a href="${d.url}" rel="noopener nofollow">${d.label}</a></li>`;
  return html`<div class="dates-panel" id="dates">
    <p class="eyebrow eyebrow--plain">Deadlines &amp; sessions</p>
    ${ahead.length
      ? html`<ul class="dates-panel__list">${ahead.map(item)}</ul>`
      : html`<p class="dates-panel__none">No dates of its own recorded yet.</p>`}
    ${gone.length
      ? html`<details class="dates-panel__gone"><summary>${plural(gone.length, 'date')} already passed</summary>
          <ul class="dates-panel__list">${gone.map(item)}</ul></details>`
      : ''}
    <p class="dates-panel__more"><a href="${`${c.href}#deadlines`}">${c.name}: every national date</a></p>
  </div>`;
}

export function schoolPage(site, inst, c, { prev, next }) {
  const school = inst.school;
  const pic = picture(site, inst.key);
  const go = handoffOf(inst);
  const statement = inst.ibRecognitionStatement;
  const apply = school?.apply || null;
  const lede = school?.summary || firstSentence(inst.note, 22);

  const inEnglish =
    school?.scope === 'listed'
      ? plural(school.programmes.length, 'degree')
      : school?.scope === 'catalogue'
      ? 'Nearly everything'
      : school?.scope === 'none'
      ? 'Nothing'
      : firstClause(inst.englishBachelors, 3) || null;

  const ibLink = (u, label) => html`<p><a href="${u}" rel="noopener nofollow">${label}<span aria-hidden="true"> ↗</span></a></p>`;
  const notes = school?.notes?.length ? school.notes : [];
  const topics = [
    (school?.ib || statement) &&
      topic({
        id: 'ib',
        title: 'What it asks of IB students',
        short: school?.ib?.text || (statement?.text ? `${statement.text[0].toUpperCase()}${statement.text.slice(1)}.` : null),
        body: html`${school?.ib ? ibLink(school.ib.url, 'Where it says so') : ''}
          ${statement?.diplomaPolicy ? html`<blockquote><p>${statement.diplomaPolicy}</p></blockquote>` : ''}
          ${statement ? ibLink(statement.url, 'Its IB recognition statement') : ''}`,
        more: 'Sources',
      }),
    notes.length &&
      topic({
        id: 'notes',
        title: 'Worth knowing',
        short: notes[0],
        body: notes.length > 1 ? html`<ul>${notes.slice(1).map((n) => html`<li>${n}</li>`)}</ul>` : '',
        more: plural(notes.length - 1, 'more thing'),
      }),
    // A profile note that says more than the hero already does.
    !notes.length && inst.note && firstSentence(inst.note, 60) !== lede && inst.note.trim() !== lede
      ? topic({
          id: 'notes',
          title: 'Worth knowing',
          short: firstSentence(inst.note, 30),
          body: firstSentence(inst.note, 30) !== inst.note.trim() ? html`<p>${inst.note}</p>` : '',
          more: 'In full',
        })
      : null,
  ].filter(Boolean);

  const links = [
    inst.admissionsUrl && inst.admissionsUrl !== go?.url && !isHomepage(inst.admissionsUrl, inst.website)
      ? { href: inst.admissionsUrl, label: 'Admissions' }
      : null,
    inst.ibPageUrl && !isHomepage(inst.ibPageUrl, inst.website) ? { href: inst.ibPageUrl, label: 'Its IB page' } : null,
  ].filter(Boolean);

  const body = html`
${hero({
  eyebrow: [inst.city, c.name, inst.type].filter(Boolean).join(' · '),
  title: inst.name,
  lede,
  // Some Commons authors wrote a paragraph where their name goes; the line
  // under the photo keeps the name, and /credits/ keeps the rest.
  image: pic && !pic.external
    ? { src: pic.src, alt: pic.alt, credit: pic.credit && { ...pic.credit, text: truncate(pic.credit.text, 80) }, focal: '50% 45%' }
    : null,
  variant: pic && !pic.external ? undefined : 'panel',
})}

<section class="section section--tinted section--glance">
  <div class="wrap">
    ${glance([
      { label: 'In English', value: inEnglish },
      { label: 'City', value: inst.city },
      {
        label: 'Apply via',
        value: apply ? html`<a href="${apply.url}" rel="noopener nofollow">${apply.via}</a>` : null,
      },
      { label: 'IB transcripts', value: statement?.transcripts5y ? `${statement.transcripts5y.toLocaleString('en-GB')} in 5 yrs` : null },
      { label: 'Founded', value: inst.founded ? String(inst.founded) : null },
    ].filter((g) => g.value).slice(0, 4))}
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${crumbs([{ href: `${c.href}#institutions`, label: c.name }, { label: inst.name }])}
    ${programmeSection(inst)}
  </div>
</section>

<section class="section section--tinted section--rule">
  <div class="wrap">
    <div class="layout-aside layout-aside--dates-first">
      <div class="prose">
        ${topics}
        ${school?.sources?.length
          ? html`<details class="sources-foot"><summary>Written from ${plural(school.sources.length, 'official page')}</summary>
              ${sources(school.sources, { title: null })}</details>`
          : ''}
      </div>
      <aside class="layout-aside__side stack">
        ${school ? stamp(school.retrieved) : ''}
        ${datesPanel(inst, c)}
        ${links.length
          ? html`<div><p class="eyebrow eyebrow--plain">Links</p><ul class="plain-list">
              ${links.map((l) => html`<li><a href="${l.href}" rel="noopener nofollow">${l.label}</a></li>`)}
            </ul></div>`
          : ''}
      </aside>
    </div>
  </div>
</section>

${close({
  eyebrow: 'Next step',
  title: go ? `Go on to ${inst.name}` : `More in ${c.name}`,
  copy: go ? `${go.label}, on ${hostOf(go.url)}.` : null,
  invitation: go ? { href: go.url, label: `${go.label} ↗` } : { href: `${c.href}#institutions`, label: `Every institution in ${c.name}` },
})}

<section class="section section--pager">
  <div class="wrap">${pager({ prev, next })}</div>
</section>`;

  return page({
    title: inst.name,
    description: truncate(
      school?.summary || `${inst.name} in ${c.name}: English-taught degrees and what it asks of IB students.`,
      155
    ),
    path: inst.href,
    section: '/countries/',
    body,
  });
}
