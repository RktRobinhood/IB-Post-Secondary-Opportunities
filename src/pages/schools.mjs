import { html, raw, plural, truncate, firstSentence } from '../lib/html.mjs';
import { page } from '../lib/layout.mjs';
import { hero, card, note, facts, sources, crumbs, sectionHead, tags, stamp, pager, topic, glance, close } from '../lib/components.mjs';
import { picture } from '../lib/data.mjs';
import { hostOf, isHomepage } from '../lib/schools.mjs';

/**
 * A school page: one institution from a country profile (issue #43).
 *
 * The same shape as a canonical institution's page (institutions.mjs), in the
 * same order: the place, then what you could study there, then what it asks of
 * you and when, then one targeted link on to the institution's own site.
 *
 * What is in the programme section depends only on the record's `scope`
 * (schemas/school.schema.json), never on the country:
 *   - listed: a card per English-taught degree, each linking to its own page;
 *   - catalogue: nearly everything is taught in English, so one way into the
 *     course search instead of a list nobody could keep true;
 *   - none: nothing in English, said plainly;
 *   - no record yet: what the country profile holds, and the admissions page.
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
  interdisciplinary: 'Interdisciplinary', other: null,
};

const TODAY = new Date().toISOString().slice(0, 10);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

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
        title: p.name,
        // "BSc · 3 yrs · Vaasa": the degree type first, at a glance.
        meta: [FIELD[p.field], p.credential, `${p.years} yrs`, p.city && p.city !== inst.city ? p.city : null].filter(Boolean),
        text: p.ib || null,
        tags: [
          p.tuitionEuEea ? { label: `EU/EEA: ${p.tuitionEuEea}`, mod: 'brand' } : null,
          p.closes ? { label: `Apply by ${shortDate(p.closes)}`, mod: 'sand' } : null,
        ].filter(Boolean),
      })
    );
}

function programmeSection(inst, c, go) {
  const school = inst.school;
  const where = inst.shortName || inst.name;

  if (school?.scope === 'listed') {
    return html`${sectionHead({
        title: 'What you could study here',
        lede: `${plural(school.programmes.length, "bachelor's degree")} taught in English. Each card opens its own page.`,
        id: 'programmes',
      })}
      <div class="grid grid--3">${programmeCards(inst, school)}</div>`;
  }

  if (school?.scope === 'catalogue') {
    return html`${sectionHead({ title: 'What you could study here', id: 'programmes' })}
      <div class="handoff">
        <p class="handoff__line">Nearly every course at ${where} is taught in English.</p>
        ${(inst.notableFields || []).length ? tags(inst.notableFields.map((f) => `Known for ${f}`), 'tag--brand') : ''}
        ${go ? html`<p><a class="btn btn--primary" href="${go.url}" rel="noopener">${go.label}<span aria-hidden="true"> ↗</span></a></p>` : ''}
      </div>`;
  }

  if (school?.scope === 'none') {
    return html`${sectionHead({ title: 'What you could study here', id: 'programmes' })}
      ${note(`No bachelor's degree here is taught in English for 2027.`, { kind: 'warn', title: 'Nothing in English' })}`;
  }

  // Not researched yet: what the country profile holds, honestly labelled.
  return html`${sectionHead({ title: 'What you could study here', id: 'programmes' })}
    <div class="handoff">
      ${inst.englishBachelors ? html`<p class="handoff__line">In English: ${inst.englishBachelors}</p>` : ''}
      ${(inst.notableFields || []).length ? tags(inst.notableFields.map((f) => `Known for ${f}`), 'tag--brand') : ''}
      <p class="handoff__todo">We have not listed its programmes one by one yet.</p>
    </div>`;
}

function datesPanel(inst, c) {
  const dates = [...(inst.school?.dates || [])].sort((a, b) => a.date.localeCompare(b.date));
  return html`<div class="dates-panel" id="dates">
    <p class="eyebrow eyebrow--plain">Deadlines &amp; sessions</p>
    ${dates.length
      ? html`<ul class="dates-panel__list">
          ${dates.map(
            (d) => html`<li data-date="${d.date}"${d.date < TODAY ? raw(' class="is-past"') : ''}><strong>${shortDate(d.date)}</strong>
              <a href="${d.url}" rel="noopener nofollow">${d.label}</a></li>`
          )}
        </ul>`
      : html`<p class="dates-panel__none">No dates of its own recorded yet.</p>`}
    <p class="dates-panel__more"><a href="${`${c.href}#deadlines`}">${c.name}: every national date</a></p>
  </div>`;
}

export function schoolPage(site, inst, c, { prev, next }) {
  const school = inst.school;
  const pic = picture(site, inst.key);
  const go = handoffOf(inst);
  const where = inst.shortName || inst.name;
  const statement = inst.ibRecognitionStatement;
  // Only the school's own record names a portal: a country profile's portal
  // field is often a paragraph, and would repeat on every school in it.
  const apply = school?.apply || null;

  const inEnglish =
    school?.scope === 'listed'
      ? plural(school.programmes.length, 'degree')
      : school?.scope === 'catalogue'
      ? 'Nearly everything'
      : school?.scope === 'none'
      ? 'None for 2027'
      : inst.englishBachelors
      ? truncate(inst.englishBachelors, 28)
      : null;

  const topics = [
    school?.ib &&
      topic({
        id: 'ib',
        title: 'What it asks of IB students',
        short: school.ib.text,
        body: html`<p><a href="${school.ib.url}" rel="noopener nofollow">Where it says so<span aria-hidden="true"> ↗</span></a></p>`,
        more: 'Source',
      }),
    statement &&
      topic({
        id: 'ib-statement',
        title: 'What it tells the IB',
        short: statement.text ? `${statement.text[0].toUpperCase()}${statement.text.slice(1)}.` : 'It publishes an IB recognition statement.',
        body: html`${statement.diplomaPolicy ? html`<blockquote><p>${statement.diplomaPolicy}</p></blockquote>` : ''}
          <p><a href="${statement.url}" rel="noopener nofollow">Its full IB recognition statement<span aria-hidden="true"> ↗</span></a></p>`,
        more: 'In its own words',
      }),
    apply &&
      topic({
        id: 'apply',
        title: 'Where you apply',
        short: `Through ${apply.via}.`,
        body: html`<p><a href="${apply.url}" rel="noopener nofollow">${hostOf(apply.url)}<span aria-hidden="true"> ↗</span></a></p>`,
        more: 'Link',
      }),
    (school?.notes?.length || inst.note) &&
      topic({
        id: 'notes',
        title: 'Worth knowing',
        short: firstSentence(school?.notes?.[0] || inst.note, 30),
        body: html`<ul>${(school?.notes?.length ? school.notes : [inst.note]).map((n) => html`<li>${n}</li>`)}</ul>`,
        more: school?.notes?.length > 1 ? `All ${plural(school.notes.length, 'note')}` : 'In full',
      }),
    school?.sources?.length &&
      topic({
        id: 'sources',
        title: 'Sources',
        short: `The ${plural(school.sources.length, 'page')} this was written from.`,
        body: sources(school.sources, { title: null }),
        more: 'All sources',
      }),
  ].filter(Boolean);

  const body = html`
${hero({
  eyebrow: [inst.city, c.name, inst.type].filter(Boolean).join(' · '),
  title: inst.name,
  lede: school?.summary || firstSentence(inst.note, 22),
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
      { label: 'Apply via', value: apply?.via || null },
      { label: 'Founded', value: inst.founded ? String(inst.founded) : null },
    ])}
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${crumbs([{ href: `${c.href}#institutions`, label: c.name }, { label: where.length > 4 ? where : inst.name }])}
    ${programmeSection(inst, c, go)}
  </div>
</section>

<section class="section section--tinted section--rule">
  <div class="wrap">
    <div class="layout-aside">
      <div class="prose">${topics}</div>
      <aside class="layout-aside__side stack">
        ${school ? stamp(school.retrieved) : ''}
        ${datesPanel(inst, c)}
        ${facts([
          {
            label: 'Links',
            value: html`<ul class="plain-list">
              ${inst.admissionsUrl && inst.admissionsUrl !== go?.url && !isHomepage(inst.admissionsUrl, inst.website)
                ? html`<li><a href="${inst.admissionsUrl}" rel="noopener nofollow">Admissions</a></li>`
                : ''}
              ${inst.ibPageUrl && !isHomepage(inst.ibPageUrl, inst.website) ? html`<li><a href="${inst.ibPageUrl}" rel="noopener nofollow">Its IB page</a></li>` : ''}
              ${statement ? html`<li><a href="${statement.url}" rel="noopener nofollow">Its IB statement</a></li>` : ''}
            </ul>`,
          },
        ])}
      </aside>
    </div>
  </div>
</section>

${go
  ? close({
      eyebrow: 'Next step',
      title: `Go on to ${inst.name}`,
      copy: `${go.label}, on ${hostOf(go.url)}.`,
      invitation: { href: go.url, label: `${go.label} ↗` },
    })
  : ''}

<section class="section">
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
