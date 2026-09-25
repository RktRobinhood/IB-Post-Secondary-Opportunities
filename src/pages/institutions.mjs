import { html, md, plural, truncate, firstSentence } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import {
  hero, card, note, facts, sources, crumbs, sectionHead, tags, stamp, emptyState, pager, topic, requirementSummary, glance,
} from '../lib/components.mjs';
import { picture } from '../lib/data.mjs';
import { destinationOf, institutionPicture } from './programme-facts.mjs';

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

export function university(site, inst, { prev, next }) {
  const pic = institutionPicture(site, inst);
  const dest = destinationOf(inst);
  const byField = new Map();
  for (const p of inst.programmes) {
    const f = p.field || 'Other';
    if (!byField.has(f)) byField.set(f, []);
    byField.get(f).push(p);
  }

  /* The degrees first, as pictures a student can click; what the institution
     says about the IB, how it runs its admissions and the notes after them,
     each as a short answer with the rest one tap beneath. */
  const programmeCards = [...inst.programmes]
    .sort((a, b) => (a.field || '').localeCompare(b.field || '') || a.name.localeCompare(b.name))
    .map((p) => {
      // Text cards, all the same shape: the pictures of the place are in the
      // hero above. Behind the words is a faded photograph of the discipline:
      // the programme's own, else its field's (src/lib/programme-imagery.mjs).
      // IB terms first, the published form beneath (requirementSummary).
      return card({
        href: p.href,
        title: p.name,
        backdrop: p.backdrop,
        req: requirementSummary(p.entryRequirements),
        meta: [p.field, p.years ? `${p.years} years` : null, p.campus && p.campus !== inst.city ? p.campus : null].filter(Boolean),
        tags: p.restrictedAdmission
          ? [{ label: p.cutoff?.value && /^\d+([.,]\d+)?$/.test(String(p.cutoff.value).trim()) ? (p.cutoff.anyDiploma
              ? `Last cut-off: any IB Diploma (Danish ${p.cutoff.value})`
              : p.cutoff.ibPoints
              ? `Last cut-off ${p.cutoff.ibPoints} IB points (Danish ${p.cutoff.value})`
              : `Last cut-off ${p.cutoff.value}`) : 'Restricted admission', mod: 'sand' }]
          : null,
      });
    });

  const statement = inst.ibRecognitionStatement;
  const topics = [
    statement &&
      topic({
        id: 'ib-statement',
        title: 'What it tells IB students',
        short: statement.text
          ? `${statement.text[0].toUpperCase()}${statement.text.slice(1)}.`
          : 'It publishes an IB recognition statement.',
        body: html`${statement.diplomaPolicy ? html`<blockquote><p>${statement.diplomaPolicy}</p></blockquote>` : ''}
          <p><a href="${statement.url}" rel="noopener nofollow">Its full IB recognition statement<span aria-hidden="true"> ↗</span></a>,
          written by the university and published by the IB.</p>`,
        more: 'In its own words',
      }),
    (inst.ibNotes || []).length &&
      topic({
        id: 'ib',
        title: 'What it asks of IB students',
        short: firstSentence(inst.ibNotes[0], 30),
        body: html`<ul>${inst.ibNotes.map((n) => html`<li>${n}</li>`)}</ul>`,
        more: `All ${plural(inst.ibNotes.length, 'note')}`,
      }),
    inst.quotaNotes &&
      topic({
        id: 'quota',
        title: 'How it runs quota 2',
        short: firstSentence(inst.quotaNotes, 30),
        body: md(inst.quotaNotes),
        more: 'In full',
      }),
    (inst.notes || []).length &&
      topic({
        id: 'notes',
        title: 'Worth knowing',
        short: firstSentence(inst.notes[0], 30),
        body: html`<ul>${inst.notes.map((n) => html`<li>${n}</li>`)}</ul>`,
        more: `All ${plural(inst.notes.length, 'note')}`,
      }),
    (inst.sources || []).length &&
      topic({
        id: 'sources',
        title: 'Sources',
        short: `The ${plural(inst.sources.length, 'page')} this was written from.`,
        body: sources(inst.sources, { title: null }),
        more: 'All sources',
      }),
  ].filter(Boolean);

  const body = html`
${hero({
  // The country belongs in the eyebrow now that there is more than one of
  // them. "Delft · Technical university" was a complete description while
  // every institution on the site was Danish and is a riddle now.
  eyebrow: [inst.city, dest?.name, inst.type].filter(Boolean).join(' · '),
  title: inst.name,
  lede: firstSentence(inst.about, 22),
  image: pic ? { src: pic.src, alt: pic.alt, credit: pic.credit, focal: '50% 45%' } : null,
  slides: pic ? universitySlides(site, inst) : [],
  variant: pic ? undefined : 'panel',
})}

<section class="section section--tinted section--glance">
  <div class="wrap">
    ${glance([
      { label: 'In English', value: plural(inst.programmes.length, 'degree') },
      { label: 'City', value: inst.city },
      { label: 'Students', value: inst.students ? inst.students.toLocaleString('en-GB') : null },
      { label: 'Founded', value: inst.founded ? String(inst.founded) : null },
      { label: 'Tuition, non-EU', value: inst.tuitionNonEu ? truncate(inst.tuitionNonEu, 40) : null },
    ])}
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${crumbs([
      ...(dest ? [{ href: dest.href, label: dest.name }] : []),
      { href: '/universities/', label: 'Institutions' },
      { label: inst.shortName || inst.name },
    ])}

    ${inst.programmes.length
      ? html`${sectionHead({ title: 'What you could study here', id: 'programmes' })}
          <div class="grid grid--3">${programmeCards}</div>`
      : note(
          // This used to name Danish at A level and the Studieprøven, which
          // is the right advice at a Danish institution and nonsense at a
          // Dutch one. The specific language qualification is a fact about
          // a Destination's own rules and belongs on that Destination's
          // pages, where it can be sourced. What belongs here is the part
          // that holds at any institution teaching in its own language —
          // and the language comes off the record, because two of the Dutch
          // institutions teach in English and the country does not.
          `No fully English-taught bachelor programmes are listed here for 2027 entry. That does not
          mean you cannot study here — it means you would need to meet its
          ${inst.teachingLanguage ? `${inst.teachingLanguage}-language` : 'local-language'} entry
          requirements and apply to the programmes it teaches in
          ${inst.teachingLanguage || 'its own language'} instead.${
            dest ? ` ${dest.name}'s own section explains what that takes.` : ''
          }`,
          { kind: 'warn', title: 'Nothing in English' }
        )}
  </div>
</section>

<section class="section section--tinted section--rule">
  <div class="wrap">
    <div class="layout-aside">
      <div class="prose">
        ${topics}
      </div>

      <aside class="layout-aside__side stack">
        ${stamp(inst.dataAsOf)}
        ${facts([
          { label: 'Campuses', value: (inst.campuses || []).join(', ') || null },
          { label: 'IB results code', value: inst.ibisCode },
          {
            label: 'Links',
            value: html`<ul style="list-style:none;padding:0;margin:0">
              ${inst.website ? html`<li><a href="${inst.website}" rel="noopener nofollow">Main site</a></li>` : ''}
              ${inst.admissionsUrl ? html`<li><a href="${inst.admissionsUrl}" rel="noopener nofollow">Admissions</a></li>` : ''}
              ${inst.ibPageUrl ? html`<li><a href="${inst.ibPageUrl}" rel="noopener nofollow">Its IB page</a></li>` : ''}
              ${statement ? html`<li><a href="${statement.url}" rel="noopener nofollow">Its IB statement</a></li>` : ''}
            </ul>`,
          },
        ])}
        ${(inst.knownFor || []).length ? html`<div><p class="eyebrow eyebrow--plain">Known for</p>${tags(inst.knownFor, 'tag--brand')}</div>` : ''}
        ${(inst.deadlines || []).length
          ? html`<div><p class="eyebrow eyebrow--plain">Deadlines</p>
              <ul style="list-style:none;padding:0;margin:0;font-size:.875rem;line-height:1.8">
                ${inst.deadlines.map((d) => html`<li><strong>${d.date}</strong>${d.time ? ` ${d.time}` : ''} — ${d.label}</li>`)}
              </ul></div>`
          : ''}
      </aside>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">${pager({ prev, next })}</div>
</section>`;

  return page({
    title: inst.name,
    description: truncate(
      inst.about ||
        `${inst.name}${dest ? ` in ${dest.sentenceName}` : ''} — English-taught degrees and entry requirements for IB students.`,
      155
    ),
    path: inst.href,
    section: dest?.section,
    body,
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
            lede: `${plural(d.programmes, 'English-taught programme')} recorded here.`,
          })}
          <div class="grid grid--3" style="margin-bottom:var(--s7)">
            ${d.institutions
              .slice()
              .sort((a, b) => b.programmes.length - a.programmes.length || a.name.localeCompare(b.name))
              .map((i) => {
                const p = institutionPicture(site, i);
                return card({
                  href: i.href,
                  title: i.shortName && !i.name.startsWith(i.shortName) ? `${i.shortName} — ${i.name}` : i.name,
                  text: firstSentence(i.about, 24),
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
