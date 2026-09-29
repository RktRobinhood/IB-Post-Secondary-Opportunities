import { html, md, plural, raw, toString, truncate, firstSentence } from '../lib/html.mjs';
import { datesPanel } from '../lib/school-dates.mjs';
import { page, url } from '../lib/layout.mjs';
import {
  hero, card, note, facts, sources, crumbs, sectionHead, emptyState, pager, topic, glance, institutionRail,
} from '../lib/components.mjs';
import { picture } from '../lib/data.mjs';
import { destinationOf, institutionPicture } from './programme-facts.mjs';
import { cardGroups, programmeCard } from '../lib/paths.mjs';
import { renderProgrammeCard } from '../lib/programme-card.mjs';
import { universityTemplate, statementShort } from '../templates/university.mjs';

/* Institutions: the index of every institution, and one page per institution. */

/**
 * Further pictures of a university: its own programme pages' photographs.
 *
 * These are worth more than four more shots of the same facade — a university
 * publishes a different picture for Chemical Engineering than for European
 * Studies, and between them they say what the place is actually like to study
 * at. Free, too: the programme pages already carry them.
 */
function universitySlides(site, inst, max = 4) {
  const own = institutionPicture(site, inst);
  const out = [];

  // Further photographs of the institution itself, where they were collected:
  // a different building, a different season, the same place from the other
  // side. These come first because they are of the university, not of one
  // department's marketing.
  const key = inst.id.replace(/^[a-z]{2}-/, '');
  for (const g of site.images?.[key]?.gallery || site.images?.[inst.id]?.gallery || []) {
    if (out.length >= max) break;
    if (g.review?.state === 'rejected') continue;
    out.push({
      rawSrc: g.src,
      src: url(g.src),
      caption: inst.shortName || inst.name,
      credit: { text: `${g.author || 'Unknown'} · ${g.licence || 'Wikimedia Commons'}`, url: g.page },
    });
  }

  for (const p of inst.programmes) {
    if (out.length >= max) break;
    const pic = picture(site, p.id);
    if (!pic?.src || pic.src === own?.src) continue;
    if (out.some((s) => s.rawSrc === pic.src)) continue;
    out.push({
      rawSrc: pic.src,
      src: pic.external ? pic.src : url(pic.src),
      caption: p.name,
      credit: pic.credit || null,
    });
  }
  return out.map(({ rawSrc, ...slide }) => slide);
}

/**
 * A canonical institution (Denmark, the Netherlands) as the university
 * template's view model (src/templates/university.mjs). Only the data differs
 * from a school record's page; the page is the template's.
 */
export function university(site, inst, { prev, next }) {
  const pic = institutionPicture(site, inst);
  const dest = destinationOf(inst);
  const sorted = [...inst.programmes]
    .sort((a, b) => (a.field || '').localeCompare(b.field || '') || a.name.localeCompare(b.name));
  // One card per programme, or one per family of paths (src/lib/paths.mjs):
  // a BSc and a BEng of one subject are one card with two short rows.
  const programmeCards = cardGroups(site, sorted).map((g) => ({
    field: g.lead.field,
    html: renderProgrammeCard(programmeCard(site, g, { meta: [g.lead.field].filter(Boolean) })),
    // Under its field's heading the card need not say its field again.
    headedHtml: renderProgrammeCard(programmeCard(site, g, { meta: [] })),
  }));

  const statement = inst.ibRecognitionStatement;
  /* Where its degrees are applied for: the route of its first programme. */
  const opp = site.graph?.opportunities?.get(inst.programmes[0]?.opportunityId || inst.programmes[0]?.id);
  const route = site.graph?.applicationRoutes?.get((opp?.applicationRoutes || [])[0]);
  const system = site.graph?.applicationSystems?.get(route?.applicationSystem);
  const ibNotes = inst.ibNotes || [];

  return universityTemplate({
    hero: {
      eyebrow: [inst.city, dest?.name, inst.type].filter(Boolean).join(' · '),
      title: inst.name,
      lede: firstSentence(inst.about, 32),
      image: pic ? { src: pic.src, alt: pic.alt, credit: pic.credit, focal: '50% 45%' } : null,
      slides: pic ? universitySlides(site, inst) : [],
      variant: pic ? undefined : 'panel',
    },
    glance: [
      /* Cards, as the student counts them (#52): a family of paths is one. */
      { label: 'In English', value: plural(cardGroups(site, inst.programmes).length, 'programme') },
      { label: 'City', value: inst.city },
      { label: 'Apply via', value: system?.name && route?.portalUrl ? html`<a href="${route.portalUrl}" rel="noopener nofollow">${system.name}</a>` : null },
      { label: 'IB transcripts', value: statement?.transcripts5y ? `${statement.transcripts5y.toLocaleString('en-GB')} in 5 yrs` : null },
      { label: 'Students', value: inst.students ? inst.students.toLocaleString('en-GB') : null },
      { label: 'Founded', value: inst.founded ? String(inst.founded) : null },
    ],
    crumbs: [...(dest ? [{ href: `${dest.href}#institutions`, label: dest.name }] : []), { label: inst.shortName || inst.name }],
    dates: datesPanel(site, inst),
    study: inst.programmes.length
      ? { title: 'What you could study here', cards: programmeCards }
      : {
          // The language comes off the record: a Danish institution and a
          // Dutch one teach in different languages.
          title: inst.teachingLanguage ? `Taught in ${inst.teachingLanguage}` : 'Taught in the local language',
          handoff: html`<p class="handoff__line">No English-taught bachelor's here for 2027.</p>`,
        },
    topics: {
      ib: ibNotes.length || statement
        ? {
            short: ibNotes.length ? firstSentence(ibNotes[0], 30) : statementShort(statement),
            body: html`${ibNotes.length ? html`<ul>${ibNotes.map((n) => html`<li>${n}</li>`)}</ul>` : ''}
              ${statement?.diplomaPolicy ? html`<blockquote><p>${statement.diplomaPolicy}</p></blockquote>` : ''}
              ${statement ? html`<p><a href="${statement.url}" rel="noopener nofollow">Its IB recognition statement<span aria-hidden="true"> ↗</span></a></p>` : ''}`,
            more: 'Where it says so',
          }
        : null,
      admissions: inst.quotaNotes ? { short: firstSentence(inst.quotaNotes, 30), body: md(inst.quotaNotes), more: 'In full' } : null,
      notes: (inst.notes || []).length
        ? {
            short: firstSentence(inst.notes[0], 30),
            body: html`<ul>${inst.notes.map((n) => html`<li>${n}</li>`)}</ul>`,
            more: `All ${plural(inst.notes.length, 'note')}`,
          }
        : null,
      sources: inst.sources || [],
    },
    rail: {
      checked: inst.dataAsOf,
      action: inst.admissionsUrl ? { href: inst.admissionsUrl, label: 'The official page ↗', note: 'Its admissions page' } : null,
      rows: [
        { label: 'Campuses', value: (inst.campuses || []).join(', ') || null },
        { label: 'IB results code', value: inst.ibisCode },
        { label: 'Tuition, non-EU', value: inst.tuitionNonEu ? truncate(inst.tuitionNonEu, 40) : null },
      ],
      links: [
        inst.ibPageUrl ? { href: inst.ibPageUrl, label: 'Its IB page' } : null,
        statement ? { href: statement.url, label: 'Its IB statement' } : null,
      ].filter(Boolean),
      knownFor: inst.knownFor || [],
    },
    pager: { prev, next },
    page: {
      title: inst.name,
      description: truncate(
        inst.about || `${inst.name}${dest ? ` in ${dest.sentenceName}` : ''} — English-taught degrees and entry requirements for IB students.`,
        155
      ),
      path: inst.href,
      section: dest?.section,
    },
  });
}

/* --- Universities index ---------------------------------------------------- */

/**
 * Every Institution on the site, grouped by the Destination it is in.
 *
 * This page was headed "Danish institutions", carried a Denmark breadcrumb and
 * sat in the Denmark section, and then listed Breda, Delft, Maastricht, Twente
 * and Erasmus Rotterdam. The heading was not decoration: a student who reads
 * "Danish institutions" and sees Maastricht concludes the site is broken, and a
 * student who reads it and *doesn't* look concludes there is nothing outside
 * Denmark to look at.
 *
 * So nothing here is asserted. The heading names the Destinations while it can
 * still name them all and says "N destinations" when it cannot, the grouping
 * comes from the records, and the whole page is correct for a third Destination
 * the day one arrives — which is the only version of this fix that is worth
 * making, because the previous copy was also correct on the day it was written.
 */
export function universitiesIndex(site) {
  const catalogue = site.institutionCatalogue;
  const scope = catalogue.scope;

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: scope.label,
  title: 'Where you can study',
  lede: `Every institution in ${scope.label} with degrees taught in English — and the ones without, so you know.`,
})}
<section class="section">
  <div class="wrap">
    ${crumbs([{ label: 'Institutions' }])}
    ${catalogue.byDestination.length
      ? catalogue.byDestination.map(
          (d) => html`
          ${sectionHead({
            eyebrow: plural(d.institutions.length, 'institution'),
            title: `In ${d.sentenceName}`,
            lede: `${plural(d.programmes, 'English-taught programme')} on this site.`,
          })}
          <div class="grid grid--3 grid--spaced">
            ${d.institutions
              .slice()
              .sort((a, b) => b.programmes.length - a.programmes.length || a.name.localeCompare(b.name))
              .map((i) => {
                const p = institutionPicture(site, i);
                return card({
                  href: i.href,
                  title: i.shortName && !i.name.startsWith(i.shortName) ? `${i.shortName} — ${i.name}` : i.name,
                  text: firstSentence(i.about, 32),
                  image: p ? { src: p.src, alt: p.alt } : null,
                  placeholder: i.shortName || i.name,
                  meta: [i.city, plural(i.programmes.length, 'English-taught programme')],
                });
              })}
          </div>`
        )
      : emptyState('Institution data has not been built yet.')}
  </div>
</section>`;

  return page({
    title: `Institutions in ${scope.label}`,
    description: `Universities, university colleges and academies in ${scope.label} with English-taught undergraduate programmes.`,
    path: '/universities/',
    // No section. This page spans Destinations, and highlighting one of them in
    // the navigation is the same claim the old heading made.
    body,
  });
}
