import { html, raw, plural, truncate, firstSentence } from '../lib/html.mjs';
import { page } from '../lib/layout.mjs';
import { hero, card, sources, crumbs, sectionHead, tags, stamp, pager, topic, glance, close } from '../lib/components.mjs';
import { picture } from '../lib/data.mjs';
import { hostOf, isHomepage } from '../lib/schools.mjs';
import { datesPanel } from '../lib/school-dates.mjs';

/**
 * A school page: one institution from a country profile (issue #43).
 *
 * The same shape as a canonical institution's page (institutions.mjs), in the
 * same order: the place, then what you could study there, then when and what
 * it asks of you, then one targeted link on to the institution's own site.
 *
 * What is in the programme section depends only on the record's `scope`
 * (schemas/school.schema.json), never on the country:
 *   - listed: a card per English-taught degree, each linking to its page here
 *     (school-programme.mjs), which hands on to the programme's own page;
 *   - catalogue: nearly everything is taught in English, so one way into the
 *     course search instead of a list nobody could keep true;
 *   - none: nothing in English, said plainly;
 *   - no record yet: the profile's one-line answer, and the admissions page.
 *
 * Every sentence written here is under twelve words: it appears on hundreds
 * of pages, and the text-walls guard counts repeated sentences of twelve or
 * more as boilerplate.
 */

export const FIELD = {
  engineering: 'Engineering', computing: 'Computing', 'natural-sciences': 'Sciences', mathematics: 'Maths',
  business: 'Business', economics: 'Economics', 'social-sciences': 'Social sciences', law: 'Law',
  humanities: 'Humanities', languages: 'Languages', education: 'Education', health: 'Health',
  medicine: 'Medicine', veterinary: 'Veterinary', 'agriculture-environment': 'Environment',
  'design-architecture': 'Design', 'arts-music': 'Arts', sport: 'Sport', 'hospitality-tourism': 'Hospitality',
  interdisciplinary: 'Interdisciplinary', other: 'Other',
};
/* Each field belongs to one family, and each family has one colour (site.css,
   .card--fam-*), so a colour means the same kind of subject on every page. */
const FAMILY = {
  engineering: 'tech', computing: 'tech', mathematics: 'tech',
  'natural-sciences': 'science', 'agriculture-environment': 'science', veterinary: 'science',
  business: 'business', economics: 'business', 'hospitality-tourism': 'business',
  'social-sciences': 'society', law: 'society', education: 'society', humanities: 'society', languages: 'society',
  health: 'health', medicine: 'health', sport: 'health',
  'design-architecture': 'creative', 'arts-music': 'creative',
  interdisciplinary: 'general', other: 'general',
};

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

/**
 * A profile's answer for a fact tile, whole or not at all: its first clause
 * when that is six words or fewer ("All courses in English"), never a clause
 * cut short ("All courses in"). A longer answer is left to the page's text.
 */
const shortClause = (text) => {
  const clause = firstClause(text, 99);
  return clause && clause.split(/\s+/).length <= 6 ? clause : null;
};

/** The one page a student goes on to: the record's hand-off, else admissions. */
function handoffOf(inst) {
  if (inst.school?.handoff) return inst.school.handoff;
  if (inst.admissionsUrl && !isHomepage(inst.admissionsUrl, inst.website)) {
    return { label: 'Its admissions page', url: inst.admissionsUrl };
  }
  return null;
}

/** The EU/EEA fee when every programme shares it, said once instead of per card. */
function sharedTuition(programmes) {
  const fees = new Set(programmes.map((p) => p.tuitionEuEea || null));
  return fees.size === 1 ? [...fees][0] : null;
}

/** A listed school's programmes in the order its page shows them; their own
    pages page through them in the same order. */
export const inCardOrder = (programmes) =>
  [...programmes].sort((a, b) => a.field.localeCompare(b.field) || a.name.localeCompare(b.name));

function programmeCard(inst, p, { tuitionOnCard, headed }) {
  return card({
    // Its own page on this site (school-programme.mjs), where the link to the
    // programme's page on the institution's site now lives.
    href: p.href,
    mod: `card--prog card--fam-${FAMILY[p.field] || 'general'}`,
    // The field names the card's band, unless a heading above already does.
    kicker: headed ? null : FIELD[p.field],
    title: p.name,
    // "BSc · 3 yrs · Vaasa": the degree type straight under the name.
    sub: [p.credential, `${p.years} yrs`, p.city && p.city !== inst.city ? p.city : null].filter(Boolean).join(' · '),
    text: p.ib || null,
    tags: [
      p.closes ? { label: `Apply by ${shortDate(p.closes)}`, mod: 'sand' } : null,
      tuitionOnCard && p.tuitionEuEea ? { label: `EU/EEA: ${p.tuitionEuEea}`, mod: 'brand' } : null,
    ].filter(Boolean),
  });
}

function knownFor(inst) {
  const f = inst.notableFields || [];
  return f.length
    ? html`<div class="handoff__known"><p class="eyebrow eyebrow--plain">Known for</p>${tags(f, 'tag--brand')}</div>`
    : '';
}

/* A short list is one grid. A long one is grouped under its fields
   ("Engineering · 6"), heading only fields with enough programmes to be a
   group; the rest share "Other fields". */
const GROUP_FROM = 13;
const GROUP_MIN = 3;

function programmeSection(inst, c) {
  const school = inst.school;
  const where = inst.shortName && inst.shortName.length > 4 ? inst.shortName : inst.name;

  if (school?.scope === 'listed') {
    const progs = inCardOrder(school.programmes);
    const fee = sharedTuition(progs);
    const one = (p, headed = false) => programmeCard(inst, p, { tuitionOnCard: !fee, headed });
    const lede = fee ? (fee === 'Free' ? 'Free for EU/EEA citizens.' : `EU/EEA tuition: ${fee}.`) : null;

    let cards;
    if (progs.length < GROUP_FROM) {
      cards = html`<div class="grid ${progs.length <= 2 ? 'grid--2' : 'grid--3'}">${progs.map((p) => one(p))}</div>`;
    } else {
      const byField = new Map();
      for (const p of progs) {
        const f = FIELD[p.field];
        if (!byField.has(f)) byField.set(f, []);
        byField.get(f).push(p);
      }
      const groups = [...byField].filter(([, list]) => list.length >= GROUP_MIN);
      const rest = [...byField].filter(([, list]) => list.length < GROUP_MIN).flatMap(([, list]) => list);
      const group = (head, list, headed) => html`<div class="prog-group">
          <h3 class="prog-group__head">${head} <span>· ${list.length}</span></h3>
          <div class="grid grid--3">${list.map((p) => one(p, headed))}</div>
        </div>`;
      cards = [
        ...groups.map(([field, list]) => group(field, list, true)),
        rest.length ? group(groups.length ? 'Other fields' : 'All fields', rest, false) : '',
      ];
    }
    return html`${sectionHead({ title: 'What you could study here', lede, id: 'programmes' })}${cards}`;
  }

  if (school?.scope === 'catalogue') {
    return html`${sectionHead({ title: 'What you could study here', id: 'programmes' })}
      <div class="handoff">
        <p class="handoff__line">${school.courses
          ? `${school.courses} undergraduate courses, all taught in English.`
          : `Nearly every course at ${where} is taught in English.`}</p>
        ${knownFor(inst)}
      </div>`;
  }

  if (school?.scope === 'none') {
    return html`${sectionHead({
        title: school.language ? `Taught in ${school.language}` : 'Taught in the local language',
        id: 'programmes',
      })}
      <div class="handoff">
        ${/* The way in for a student who has the language, when the record
              says what it takes: that is the useful line here. */ ''}
        <p class="handoff__line">${school.ib?.text || "No English-taught bachelor's here for 2027."}</p>
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

export function schoolPage(site, inst, c, { prev, next }) {
  const school = inst.school;
  const pic = picture(site, inst.key);
  const go = handoffOf(inst);
  const statement = inst.ibRecognitionStatement;
  const apply = school?.apply || null;
  const lede = school?.summary || firstSentence(inst.note, 22);
  /* The same panel as a canonical institution's page (src/lib/school-dates.mjs):
     its own dates and its country's route, first on a phone and beside the
     degrees on a wide screen. */
  const dates = datesPanel(site, { ...inst, id: inst.key, destination: c.code }, { countryName: c.articleName || c.name });

  const inEnglish =
    school?.scope === 'listed'
      ? plural(school.programmes.length, 'degree')
      : school?.scope === 'catalogue'
      ? school.courses ? `${school.courses} courses` : 'Nearly everything'
      : school?.scope === 'none'
      ? 'Nothing'
      : shortClause(inst.englishBachelors);

  const ibLink = (u, label) => html`<p><a href="${u}" rel="noopener nofollow">${label}<span aria-hidden="true"> ↗</span></a></p>`;
  const notes = school?.notes?.length ? school.notes : [];
  const topics = [
    ((school?.ib && school.scope !== 'none') || statement) &&
      topic({
        id: 'ib',
        title: 'What it asks of IB students',
        short: (school?.scope !== 'none' && school?.ib?.text) || (statement?.text ? `${statement.text[0].toUpperCase()}${statement.text.slice(1)}.` : null),
        body: html`${school?.ib ? ibLink(school.ib.url, school.scope === 'none' ? 'Its language rules' : 'Where it says so') : ''}
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
  // The trail sits above the name, where it takes one line on a phone.
  crumbs: crumbs([{ href: `${c.href}#institutions`, label: c.name }, { label: inst.shortName || inst.name }]),
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
        // "Studyinfo.fi", not "Studyinfo.fi (national joint application)".
        value: apply ? html`<a href="${apply.url}" rel="noopener nofollow">${apply.via.split(' (')[0]}</a>` : null,
      },
      { label: 'IB transcripts', value: statement?.transcripts5y ? `${statement.transcripts5y.toLocaleString('en-GB')} in 5 yrs` : null },
      { label: 'Founded', value: inst.founded ? String(inst.founded) : null },
    ].filter((g) => g.value).slice(0, 4))}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="layout-aside layout-aside--dates">${dates}<div class="layout-aside__main">
      ${programmeSection(inst, c)}
    </div></div>
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
        ${links.length
          ? html`<div><p class="eyebrow eyebrow--plain">Links</p><ul class="plain-list">
              ${links.map((l) => html`<li><a href="${l.href}" rel="noopener nofollow">${l.label}</a></li>`)}
            </ul></div>`
          : ''}
      </aside>
    </div>
  </div>
</section>

${
  /* Where nothing is in English the next step is another school, and the
     school's own page is the quieter link beside it. */
  school?.scope === 'none' || !go
    ? close({
        eyebrow: 'Next step',
        title: `Other schools in ${c.name}`,
        invitation: { href: `${c.href}#institutions`, label: `Every institution in ${c.name}` },
        also: go ? [{ href: go.url, label: `${go.label} ↗` }] : [],
      })
    : close({
        // The heading says what the page is, the button where it is.
        eyebrow: 'Next step',
        title: go.label,
        invitation: { href: go.url, label: `Open on ${hostOf(go.url)} ↗` },
      })
}

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
    scripts: ['dates-panel.js'],
  });
}
