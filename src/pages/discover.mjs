import { html, raw, plural, toString } from '../lib/html.mjs';
import { url, SITE } from '../lib/layout.mjs';
import { card, requirementSummary } from '../lib/components.mjs';
import { picture } from '../lib/data.mjs';
import { worldWindow, filterQuestion } from '../lib/primitives.mjs';
import { entryAward, ENTRY_AWARD } from '../lib/eligibility.mjs';
import { cardGroups, familyCard, pathsBlock, credentialLine, facetsOf, cutoffLabel } from '../lib/paths.mjs';
import { institutionPicture } from './programme-facts.mjs';
import { distanceDoors, placeTiles, countryTile, centroid, readableName, depthLabel } from './destinations.mjs';
import { awardLabel } from './course-results.mjs';
import { requiresMathsHL } from './explorer.mjs';

/**
 * The discovery surface: the home page's globe, the three distances, a few
 * filters, and every mapped degree as a card beneath them
 * (docs/research/ia/plan.md, Batch D).
 *
 * The owner's brief: adventure, discovery and opportunity, with no text that
 * does not change what a student does. So: the globe first; one line over it;
 * the three distances as ways to move it; filters that answer the questions a
 * student actually filters on; then the cards, drawn here at build time
 * through the same `card()` the institution pages use, so a card looks and
 * reads the same wherever it is. With no JavaScript every card is on the page;
 * discover.js hides the ones a choice rules out and moves the globe.
 *
 * Nothing here names a country. The school's country is read from the site
 * config, the scopes from the Destination records, the places from the graph.
 */

/* Cards open on the page before the rest fold behind "Show all" (#44: no text walls). */
const FIRST_CARDS = 12;
const TAG_MOD = { 'tag--ok': 'ok', 'tag--sand': 'sand', 'tag--warn': 'warn' };

/** A programme with no structured subject requirements: IB terms first, the published sentence beneath. */
function awardOnlyReq(p) {
  const ib = {
    [ENTRY_AWARD.DIPLOMA_REQUIRED]: 'the full IB Diploma',
    [ENTRY_AWARD.COURSE_RESULTS_ACCEPTED]: 'the IB Diploma or Course Results',
  }[entryAward(p)];
  const published = String(p.requirementsText || '').split(/(?<=\.)\s/)[0].slice(0, 150);
  if (!ib && !published) return '';
  return html`<div class="req">
    ${ib ? html`<p class="req__ib"><strong>Requires</strong> ${ib}</p>` : ''}
    ${published ? html`<p class="req__local">As published: ${published}</p>` : ''}
  </div>`;
}

export function discoverSection(site) {
  const tiles = placeTiles(site);
  const tileBy = new Map(tiles.map((t) => [t.code, t]));
  const hereCode = site.config?.audience?.schoolCountry || null;
  const instById = new Map(site.institutionCatalogue.all.map((i) => [i.id, i]));
  const destOf = (p) => (typeof p.destination === 'object' ? p.destination : null);
  const destCode = (p) => destOf(p)?.code || (typeof p.destination === 'string' ? p.destination : '');

  /* How far a Destination is, in the three words the doors use. */
  const scopeOf = (code) =>
    code && code === hereCode ? 'here' : tileBy.get(code)?.scope === 'worldwide' ? 'far' : 'nearby';

  /* --- The facts a filter reads, one row per programme --------------------- */
  const facts = (p) => ({
    id: p.id,
    f: p.field || 'Other',
    d: destCode(p),
    s: scopeOf(destCode(p)),
    c: p.campus || '',
    i: p.institutionId,
    p: p.placeId || '',
    a: entryAward(p),
    m: requiresMathsHL(p.entryRequirements) ? 1 : 0,
    o: p.restrictedAdmission === false ? 1 : 0,
    q: [p.name, p.institutionName, instById.get(p.institutionId)?.name, p.field, p.campus, p.degree, destOf(p)?.name]
      .filter(Boolean).join(' ').toLowerCase(),
  });

  /* --- The cards ------------------------------------------------------------ */
  const sorted = [...site.programmes].sort((a, b) => a.name.localeCompare(b.name));
  const groups = cardGroups(site, sorted);
  const cardData = [];
  const cards = groups.map((g, n) => {
    const lead = g.lead;
    const inst = instById.get(lead.institutionId);
    const where = inst ? readableName(inst) : lead.institutionName;
    const award = awardLabel(lead);
    const awardTag = { label: award.label, mod: TAG_MOD[award.cls] || 'plain' };
    cardData.push({ members: g.members.map(facts) });
    const fam = familyCard(site, g, { campus: true });
    const body = fam
      ? card({
          href: fam.href,
          title: fam.title,
          line: fam.line,
          backdrop: fam.backdrop,
          req: fam.req,
          paths: pathsBlock(fam.paths),
          meta: [where],
          tags: [awardTag, fam.tag ? { label: fam.tag, mod: 'sand' } : null].filter(Boolean),
        })
      : card({
          href: lead.href,
          title: lead.name,
          line: credentialLine(facetsOf(site, lead, { campus: true })),
          backdrop: lead.backdrop,
          req: lead.entryRequirements ? requirementSummary(lead.entryRequirements) : awardOnlyReq(lead),
          meta: [where],
          tags: [
            awardTag,
            cutoffLabel(lead) ? { label: cutoffLabel(lead), mod: 'sand' } : lead.restrictedAdmission === false ? { label: 'Open admission', mod: 'ok' } : null,
          ].filter(Boolean),
        });
    return html`<li class="discover__card" data-card="${n}">${body}</li>`;
  });

  /* --- The filters' options, from the records ------------------------------ */
  const count = (pred) => site.programmes.filter(pred).length;
  const fields = [...new Set(site.programmes.map((p) => p.field).filter(Boolean))].sort();
  const dests = [...new Map(site.programmes.map((p) => [destCode(p), destOf(p)])).entries()]
    .filter(([c]) => c)
    .sort((a, b) => (a[1]?.name || a[0]).localeCompare(b[1]?.name || b[0]));
  const whereGroups = dests.flatMap(([code, d]) => {
    const name = d?.name || code;
    const inDest = site.programmes.filter((p) => destCode(p) === code);
    const cities = [...new Set(inDest.map((p) => p.campus).filter(Boolean))].sort();
    const insts = [...new Set(inDest.map((p) => p.institutionId))].map((id) => instById.get(id)).filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
    return [
      { label: `${name}: places`, options: [
        { value: `dest:${code}`, label: `Anywhere in ${d?.sentenceName || name}`, count: inDest.length },
        ...cities.map((c) => ({ value: `city:${c}`, label: c, count: inDest.filter((p) => p.campus === c).length })),
      ] },
      { label: `${name}: universities and colleges`, options: insts.map((i) => ({ value: `inst:${i.id}`, label: i.name, count: count((p) => p.institutionId === i.id) })) },
    ];
  });
  const total = site.programmes.length;
  const accepted = count((p) => entryAward(p) === ENTRY_AWARD.COURSE_RESULTS_ACCEPTED);
  const unknown = count((p) => entryAward(p) === ENTRY_AWARD.NOT_ESTABLISHED);
  const noMaths = count((p) => !requiresMathsHL(p.entryRequirements));
  const open = count((p) => p.restrictedAdmission === false);
  const awardNote = [
    `${accepted} of ${total} accept DP Course Results (the IB's award for separate subjects) in place of the Diploma, on points, grade and HL conditions that differ by country.`,
    unknown ? `${unknown} say nothing either way: ask them in writing.` : '',
  ].filter(Boolean).join(' ');

  /* --- The globe ------------------------------------------------------------ */
  const withDegrees = new Set(site.programmes.map(destCode));
  const placeIndex = {};
  for (const p of site.programmes) {
    if (!p.placeId) continue;
    const place = site.graph?.places?.get(p.placeId);
    if (!place?.coordinates) continue;
    placeIndex[p.placeId] ||= {
      id: place.id,
      name: place.name,
      lat: place.coordinates.lat,
      lon: place.coordinates.lon,
      precision: place.coordinatePrecision,
      country: place.destination || destCode(p),
      href: '#discover-results',
      count: 0,
      image: '',
    };
    placeIndex[p.placeId].count++;
    if (!placeIndex[p.placeId].image) {
      const pic = picture(site, p.id, { prefer: 'commons' }) || institutionPicture(site, instById.get(p.institutionId), { prefer: 'commons' });
      if (pic && !pic.external) placeIndex[p.placeId].image = pic.src;
    }
  }
  // Every Destination without a mapped degree is a light too, so "Explore"
  // swings out to somewhere rather than to an empty planet. Its light goes to
  // its own page.
  const countryLights = tiles
    .filter((c) => !withDegrees.has(c.code))
    .map((c) => ({ c, pos: centroid(c) }))
    .filter((x) => x.pos)
    .map(({ c, pos }) => ({
      id: c.code,
      name: `${c.flag} ${c.name}`.trim(),
      lat: pos.lat,
      lon: pos.lon,
      href: c.href,
      count: c.institutions.length,
      country: c.code,
      precision: 'region',
      state: depthLabel(site, c),
      image: (() => { const p = picture(site, c.code, { prefer: 'commons' }); return p && !p.external ? p.src : ''; })(),
    }));

  /* The three distances, as ways to move the globe. Each frames what it names:
     the school's country, the rest of Europe's Destinations, or everything. */
  const doors = distanceDoors(site);
  const boundsOf = (list) => {
    const pts = list.map(centroid).filter(Boolean);
    if (!pts.length) return null;
    return {
      north: Math.max(...pts.map((x) => x.lat)), south: Math.min(...pts.map((x) => x.lat)),
      west: Math.min(...pts.map((x) => x.lon)), east: Math.max(...pts.map((x) => x.lon)),
    };
  };
  const presetView = {
    here: hereCode ? { country: hereCode } : null,
    nearby: (() => { const b = boundsOf(tiles.filter((c) => c.scope === 'europe' && c.code !== hereCode)); return b ? { bounds: b, label: 'Europe' } : null; })(),
    far: { reset: true },
  };
  const scopeDegrees = (key) => count((p) => scopeOf(destCode(p)) === key);

  const noDegreeTiles = tiles.filter((c) => !withDegrees.has(c.code));

  return html`
<section class="discover" id="discover" aria-labelledby="discover-title">
  <div class="discover__hero">
    <div class="discover__intro wrap wrap--wide">
      <div class="discover__lead">
        <p class="eyebrow discover__eyebrow">${SITE.cycle.label}</p>
        <h1 id="discover-title" class="discover__title">Your IB is a passport. This is the map.</h1>
        <div class="discover__presets" role="group" aria-label="How far from here">
          ${doors.map(
            (d) => html`<button type="button" class="preset preset--${d.key}" data-scope="${d.key}" aria-pressed="false"
                data-view="${JSON.stringify(presetView[d.key] || {})}">
              <span class="preset__eyebrow">${d.eyebrow}</span>
              <span class="preset__title">${d.title}</span>
              <span class="preset__count">${scopeDegrees(d.key) ? plural(scopeDegrees(d.key), 'degree') : plural(tiles.filter((c) => scopeOf(c.code) === d.key).length, 'country', 'countries')}</span>
            </button>`
          )}
        </div>
      </div>

      <form class="filters finder__filters discover__filters" id="prog-filters" role="search" aria-label="Filter degrees">
        <script>document.currentScript.parentNode.dataset.enhanced = '';</script>
        <div class="finder__top">
          <div class="field filter-q" data-field="q">
            <label for="f-q">Search</label>
            <input type="search" id="f-q" data-filter="q" placeholder="Subject, city or university" autocomplete="off">
          </div>
          <button type="button" class="btn finder__open" id="f-sheet-open" aria-controls="f-sheet" aria-expanded="false">
            Filters<span class="finder__n" data-n></span>
          </button>
        </div>
        <div class="finder__sheet" id="f-sheet" role="group" aria-label="Filters">
          <div class="finder__sheet-head">
            <p class="finder__sheet-title">Filters</p>
            <button type="button" class="btn btn--ghost" data-sheet-close>Close</button>
          </div>
          <div class="filters__row">
            ${filterQuestion({ id: 'f-field', question: 'Subject area', field: 'field', options: fields.map((f) => ({ value: f, label: f })) })}
            <div class="field filter-q" data-field="where">
              <label for="f-where">Where</label>
              <select id="f-where" data-filter="where">
                <option value="">Anywhere</option>
                ${whereGroups.filter((g) => g.options.length).map(
                  (g) => html`<optgroup label="${g.label}">${g.options.map((o) => html`<option value="${o.value}">${o.label} (${o.count})</option>`)}</optgroup>`
                )}
              </select>
            </div>
          </div>
          <div class="chips finder__chips">
            <a class="chip chip--go" href="${url('/planner/')}">Fits my IB subjects</a>
            ${accepted
              ? html`<span class="chip-with-info">
                  <button type="button" class="chip" id="f-award" aria-pressed="false" data-value="${ENTRY_AWARD.COURSE_RESULTS_ACCEPTED}">Accepts Course Results <span class="chip__count">${accepted}</span></button>
                  <button type="button" class="info" data-info aria-expanded="false" aria-controls="f-award-note" aria-label="About Course Results">i</button>
                  <span class="info__panel" id="f-award-note" role="note" hidden>${awardNote} <a href="${url('/guides/course-results/')}">How it works in each country</a></span>
                </span>`
              : ''}
            ${noMaths && noMaths < total ? html`<button type="button" class="chip" id="f-nomath" aria-pressed="false">No Maths HL needed <span class="chip__count">${noMaths}</span></button>` : ''}
            ${open && open < total ? html`<button type="button" class="chip" id="f-open" aria-pressed="false">Open admission <span class="chip__count">${open}</span></button>` : ''}
            <button type="button" class="chip" id="f-reset">Clear all</button>
          </div>
          <div class="finder__sheet-foot">
            <button type="button" class="btn btn--primary" data-sheet-close data-show>Show degrees</button>
          </div>
        </div>
      </form>
    </div>

    <div class="discover__globe" id="prog-map">
      ${worldWindow({
        places: [...Object.values(placeIndex), ...countryLights],
        id: 'discover-map',
        unit: 'degree',
        activeLayer: 'Where the degrees are',
        caption: 'Choose a place to see its degrees.',
        foldList: 'Every place on the globe',
      })}
    </div>
  </div>

  <div class="wrap wrap--wide discover__results">
    <div class="shell__bar">
      <p class="result-count" id="prog-count" role="status" aria-live="polite" style="margin:0">${plural(total, 'degree')}</p>
      <ul class="shell__active" id="prog-active" aria-label="Active filters"></ul>
    </div>
    <noscript><p class="discover__noscript">The filters and the globe need JavaScript. Every degree is listed below.</p></noscript>
    <ul class="grid grid--3 discover__cards" id="discover-results" role="list">
      ${cards.slice(0, FIRST_CARDS)}
    </ul>
    ${/* The first dozen cards, then the rest one tap away — and opened by
          discover.js the moment any filter is on, so a result is never
          folded away. */
      cards.length > FIRST_CARDS
      ? html`<details class="discover__more" id="discover-more">
          <summary>Show all ${plural(total, 'degree')}</summary>
          <ul class="grid grid--3 discover__cards" role="list">${cards.slice(FIRST_CARDS)}</ul>
        </details>`
      : ''}
    <p class="discover__empty" id="discover-empty" hidden>No degree matches all of those. <button type="button" class="linkish" data-clear-all>Clear the filters</button>.</p>
    ${noDegreeTiles.length
      ? html`<div class="discover__places" id="discover-places" hidden>
          <p class="discover__places-line">No degrees are mapped subject by subject here yet. These countries are researched:</p>
          <template id="discover-places-tiles"><ul class="tiles" role="list">${noDegreeTiles.map((c) => raw(toString(countryTile(site, c)).replace('<li>', `<li data-scope="${scopeOf(c.code)}">`)))}</ul></template>
        </div>`
      : ''}
  </div>
</section>

<script type="application/json" id="discover-data">${raw(JSON.stringify({
  cards: cardData,
  // The lights of Destinations with no mapped degree: how far each is, and how
  // many institutions it has, so a scope can light them and a filter dim them.
  lights: Object.fromEntries(countryLights.map((l) => [l.id, { s: scopeOf(l.id), n: l.count }])),
}).replace(/</g, '\\u003c'))}</script>
<script type="application/json" id="place-data">${raw(JSON.stringify(placeIndex).replace(/</g, '\\u003c'))}</script>`;
}
