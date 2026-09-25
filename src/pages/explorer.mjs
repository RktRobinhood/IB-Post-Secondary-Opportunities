import { html, raw, plural, truncate, toString } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import { hero, note, crumbs, requirementSummary } from '../lib/components.mjs';
import { picture } from '../lib/data.mjs';
import { worldWindow, filterQuestion } from '../lib/primitives.mjs';
import { entryAward, ENTRY_AWARD } from '../lib/eligibility.mjs';
import { AWARD_LABEL, institutionPicture } from './programme-facts.mjs';
import { ROW_SIZES, srcsetOf } from '../lib/programme-imagery.mjs';

/* A programme's card background, in the shape explorer.js and planner.js
   write into their rows. The paths are resolved here, at build time, so the
   client never has to know the site's base path for an image. */
export function backdropData(b) {
  return b ? { key: b.key, src: url(b.src), srcset: srcsetOf(b, url), sizes: ROW_SIZES, width: b.width, height: b.height } : null;
}

/* The programme finder: every Opportunity, filterable, with the map. */

/* --- Programme explorer ---------------------------------------------------- */

export function programmesIndex(site) {
  const scope = site.opportunityScope;
  const programmeCount = site.programmes.length;
  const fields = [...new Set(site.programmes.map((p) => p.field).filter(Boolean))].sort();
  const institutions = site.institutionCatalogue.all
    .filter((i) => i.programmes.length)
    .map((i) => ({ id: i.id, name: i.shortName || i.name }));
  const campuses = [...new Set(site.programmes.map((p) => p.campus).filter(Boolean))].sort();

  // Places the map can light up, joined to the programmes that sit there.
  const placeIndex = {};
  for (const p of site.programmes) {
    if (!p.placeId) continue;
    const place = site.graph?.places?.get(p.placeId);
    if (!place) continue;
    placeIndex[p.placeId] ||= {
      id: place.id,
      name: place.name,
      lat: place.coordinates.lat,
      lon: place.coordinates.lon,
      precision: place.coordinatePrecision,
      character: place.character || null,
      country: place.destination || '',
    };
  }

  const index = site.programmes.map((p) => ({
    id: p.id,
    name: p.name,
    href: p.href,
    institutionId: p.institutionId,
    institution: p.institutionName,
    field: p.field || 'Other',
    campus: p.campus || '',
    placeId: p.placeId || '',
    degree: p.degree || '',
    ects: p.ects || null,
    restricted: p.restrictedAdmission === true,
    open: p.restrictedAdmission === false,
    cutoff: p.cutoff?.value || null,
    cutoffPoints: p.cutoff?.ibPoints || null,
    // A picture of the place: the programme's own, or its institution's.
    image: (() => {
      const pic = picture(site, p.id, { prefer: 'commons' }) || institutionPicture(site, site.institutionCatalogue.all.find((i) => i.id === p.institutionId), { prefer: 'commons' });
      return pic ? (pic.external ? pic.src : url(pic.src)) : null;
    })(),
    // The discipline, faded behind the row (src/lib/programme-imagery.mjs).
    backdrop: backdropData(p.backdrop),
    summary: truncate(p.summary || '', 170),
    // Built once, here, by the same component as the institution cards, so the
    // list shows IB terms first and the published form beneath it (explorer.js
    // inserts it as-is; everything in it was escaped at build time).
    reqHtml: p.entryRequirements ? toString(requirementSummary(p.entryRequirements, { lead: 'Requires:' })) : '',
    requirements: p.entryRequirements ? '' : truncate(p.requirementsText || '', 150),
    entry: p.entryRequirements || null,
    award: entryAward({ requirements: p.requirements }),
    search: [p.name, p.institutionName, p.field, p.campus, p.degree, p.summary].filter(Boolean).join(' ').toLowerCase(),
  }));

  /* The filter is offered for the states this catalogue actually holds, with
     counts, so it can never promise a choice that returns nothing. */
  const awardCounts = new Map();
  for (const p of index) awardCounts.set(p.award, (awardCounts.get(p.award) || 0) + 1);
  const awardOptions = [
    ENTRY_AWARD.DIPLOMA_REQUIRED,
    ENTRY_AWARD.COURSE_RESULTS_ACCEPTED,
    ENTRY_AWARD.NOT_ESTABLISHED,
  ]
    .filter((state) => awardCounts.get(state))
    .map((state) => ({ value: state, label: AWARD_LABEL[state], count: awardCounts.get(state) }));

  /* Every distinct route a source publishes for somebody who does not hold the
     Diploma, gathered from the records rather than written here. This page does
     not know what a route looks like in any particular country and must not: a
     jurisdiction that publishes one gets its own sentence the moment a record
     carries it, and one that publishes none contributes nothing. */
  const routes = [...new Set(
    site.programmes.flatMap((p) => (p.requirements || []).map((r) => r.alternativeRoute).filter(Boolean))
  )];

  const body = html`
${hero({
  variant: 'plain',
  // Derived from the Opportunity records rather than asserted. This page said
  // "in Denmark" in its eyebrow, its heading, its lede and its breadcrumb, and
  // the day Delft appeared in the list all four became false at once.
  eyebrow: scope.label,
  title: 'Every English-taught programme',
  lede: `${plural(programmeCount, 'degree')} taught in English in ${scope.label}. Filter them, or follow the map.`,
})}

<section class="section section--tight">
  <div class="wrap wrap--wide">
    ${crumbs([{ label: 'Find a degree' }])}

    <div id="prog-map">
      ${worldWindow({
        places: Object.values(placeIndex).map((p) => ({
          ...p,
          href: '#prog-results',
          count: site.programmes.filter((x) => x.placeId === p.id).length,
          // The globe's card shows a picture of the place when this page
          // already has one: the first programme photographed there.
          image: site.programmes
            .filter((x) => x.placeId === p.id)
            .map((x) => picture(site, x.id, { prefer: 'commons' }) || institutionPicture(site, site.institutionCatalogue.all.find((i) => i.id === x.institutionId), { prefer: 'commons' }))
            .find((pic) => pic && !pic.external)?.src || '',
        })),
        id: 'explorer-map',
        unit: 'programme',
        activeLayer: 'Places with matching programmes',
        caption: 'Choose a place on the map or in the list, then show its programmes. The list below is the same set either way.',
      })}
    </div>

    <form class="filters" id="prog-filters" role="search" aria-label="Filter programmes">
      <div class="filters__row">
        <div class="field filter-q" data-field="q">
          <label for="f-q">Search for anything</label>
          <input type="search" id="f-q" data-filter="q" placeholder="engineering, Odense, data…" autocomplete="off">
        </div>
        ${filterQuestion({
          id: 'f-field',
          question: 'What do you want to study?',
          field: 'field',
          options: fields.map((f) => ({ value: f, label: f })),
        })}
        ${filterQuestion({
          id: 'f-inst',
          question: 'Anywhere in particular?',
          field: 'inst',
          options: institutions.map((i) => ({ value: i.id, label: i.name })),
        })}
        ${filterQuestion({
          id: 'f-campus',
          question: 'Which city?',
          field: 'campus',
          options: campuses.map((c) => ({ value: c, label: c })),
        })}
        ${awardOptions.length > 1
          ? filterQuestion({
              id: 'f-award',
              question: 'Full Diploma, or Course Results?',
              help: 'What the source says it will accept. Not established means nobody has recorded an answer — ask before you rule it in or out.',
              field: 'award',
              options: awardOptions,
            })
          : ''}
      </div>
      <div class="chips">
        <button type="button" class="chip" id="f-open" aria-pressed="false">Open admission only</button>
        <button type="button" class="chip" id="f-nomath" aria-pressed="false">No Mathematics A</button>
        <button type="button" class="chip" id="f-reset">Clear filters</button>
      </div>
    </form>

    <div class="shell__bar">
      <p class="result-count" id="prog-count" role="status" aria-live="polite" style="margin:0"></p>
      <ul class="shell__active" id="prog-active" aria-label="Active filters"></ul>
    </div>

    ${awardOptions.length > 1
      ? note(
          // Written once, server-side, and shown whether or not the filter is
          // on — because a Course candidate who filters and gets a short list
          // has been told the worst part of the truth and needs the rest of it
          // on the same screen. The routes come from the records.
          `Not every IB student leaves with the Diploma. Take individual Diploma Programme subjects, or sit the
          Diploma and miss its conditions, and the IB awards **DP Course Results** instead — a real qualification,
          read differently from a Diploma rather than not read at all.

          ${awardOptions
            .map((o) => `**${o.label}** — ${o.count} of ${programmeCount}.`)
            .join(' ')}
          ${routes.length ? `\n\nAsking for the Diploma is not the same as closing the door, and where a source publishes another way in it is written here.${routes.map((r) => `\n\n${r}`).join('')}` : ''}

          **Not established** is the honest third answer and it is not a soft yes. It means no source recorded
          here says either way, so nothing on this page should be read as saying Course Results are accepted.
          Ask the institution in writing, and ask before the application deadline rather than after it.`,
          { title: 'If you will not hold the full Diploma' }
        )
      : ''}

    <ul class="prog-list" id="prog-results"></ul>
    <noscript>
      <p class="empty">Filtering needs JavaScript. Every programme is also listed on its institution's page —
      see <a href="${url('/universities/')}">every institution</a>.</p>
    </noscript>
  </div>
</section>

<script type="application/json" id="programme-data">${raw(JSON.stringify(index))}</script>
<script type="application/json" id="place-data">${raw(JSON.stringify(placeIndex))}</script>`;

  return page({
    // The hero stopped asserting Denmark when Delft landed; the <title> and the
    // meta description, which are what a search result shows, did not.
    title: `Find a degree in ${scope.label}`,
    description: `Search every English-taught undergraduate programme in ${scope.label} by field, institution, city and entry requirements.`,
    path: '/programmes/',
    section: '/programmes/',
    body,
    scripts: ['explorer.js'],
  });
}
