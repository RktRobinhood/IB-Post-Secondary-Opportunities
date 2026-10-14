import { html, raw, plural, toString, slugify } from '../lib/html.mjs';
import { url, SITE } from '../lib/layout.mjs';
import { picture } from '../lib/data.mjs';
import { worldWindow, filterQuestion, flagsInHtml } from '../lib/primitives.mjs';
import { entryAward, ENTRY_AWARD } from '../lib/eligibility.mjs';
import { cardGroups, programmeCard } from '../lib/paths.mjs';
import { renderProgrammeCard } from '../lib/programme-card.mjs';
import { institutionPicture } from './programme-facts.mjs';
import { distanceDoors, placeTiles, countryTile, centroid, readableName, depthLabel, schoolsOf, countryPicture } from './destinations.mjs';
import { requiresMathsHL } from './explorer.mjs';
import { isEnglishStudyOption, displayName } from '../lib/schools.mjs';
import { schoolCards, programmeCard as schoolProgrammeCard, FIELD_CANON } from './schools.mjs';
import { deadlineOf } from '../lib/programme-deadline.mjs';
import { continentOf } from '../lib/continents.mjs';

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
/** Cards to a file of card markup that discover.js fetches as it needs them. */
const CHUNK = 48;

/* Words too common in English to say what a degree is about. */
const STOP = new Set(('the and for you are but not its with from that this into your than then they them what when who how all any can has have '
  + 'was were will one two per yet own also about after more most such each only over very much other some who which where their there these those '
  + 'year years first second third degree programme course courses taught english study studies student students').split(' '));

/** A description's distinct words, lower case, three letters or more, in one string. */
/** The still of home's desk globe (scripts/make-globe-poster.mjs). */
export const DISCOVER_POSTER = '/assets/img/globe/poster-discover-map.webp';

export function wordsOf(text) {
  const words = String(text || '').toLowerCase().normalize('NFC').match(/\p{L}{3,}/gu) || [];
  // Forty words say what a degree is about; more only weigh down the index.
  return [...new Set(words)].filter((w) => !STOP.has(w)).slice(0, 40).join(' ');
}

/**
 * The cards in an order that shows the range first (home round 1: the first
 * twelve were an A–B slice ending in three business cards from one school).
 * Greedy: each next card is the one least like the cards just placed — a title
 * already shown, the same institution in the last few, the same subject area
 * in the last two, the same country as the last — ties broken alphabetically.
 * Nothing is picked by name; the same rule orders any set of cards.
 */
export function variedOrder(items) {
  const left = items.map((x, i) => ({ ...x, i }));
  const out = [];
  const titles = new Set();
  while (left.length) {
    const score = (x) => {
      let s = 0;
      if (titles.has(x.title)) s += 1000;
      out.slice(-4).forEach((y, k, recent) => { if (y.inst === x.inst) s += 200 + 20 * (k - recent.length); });
      out.slice(-2).forEach((y, k, recent) => { if (y.field === x.field) s += 100 * (k + 3 - recent.length); });
      if (out.length && out[out.length - 1].dest === x.dest) s += 10;
      return s;
    };
    let best = 0;
    let bestScore = Infinity;
    left.forEach((x, k) => {
      const sc = score(x);
      if (sc < bestScore || (sc === bestScore && x.i < left[best].i)) { best = k; bestScore = sc; }
    });
    const [pick] = left.splice(best, 1);
    titles.add(pick.title);
    out.push(pick);
  }
  return out.map((x) => x.i);
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
    // The words of its own description, for a search that names no degree:
    // "psychology" is part of a social-sciences degree (discover.js nearest).
    w: wordsOf(p.summary),
  });

  /* --- The cards ------------------------------------------------------------ */
  /* Every degree on the site: the canonical records' and every school
     record's, one card list in one order. The page carries the first
     FIRST_CARDS; the rest, and every card's facts, load as the student
     explores (discover.js; owner, 14 Oct: "the load is just what you can see"). */
  const sorted = [...site.programmes].sort((a, b) => a.name.localeCompare(b.name));
  const canon = cardGroups(site, sorted).map((g) => {
    const inst = instById.get(g.lead.institutionId);
    return {
      title: g.family?.name || g.lead.name,
      inst: g.lead.institutionId,
      field: g.lead.field || 'Other',
      dest: destCode(g.lead),
      members: () => g.members.map(facts),
      html: () => renderProgrammeCard(programmeCard(site, g, { meta: [inst ? readableName(inst) : g.lead.institutionName, destOf(g.lead)?.name].filter(Boolean) })),
    };
  });
  const schoolFacts = (q, inst, c) => ({
    id: q.href,
    f: FIELD_CANON[q.field] || 'Other',
    d: c.code,
    s: scopeOf(c.code),
    c: q.city || inst.city || '',
    i: inst.key,
    p: '',
    a: '',
    // Not worked out for school records: no "No Maths HL" claim either way.
    m: null,
    o: (q.selection || []).includes('open') ? 1 : 0,
    q: [displayName(q.name), q.name, inst.name, inst.shortName, FIELD_CANON[q.field], q.city || inst.city, q.credential, c.name]
      .filter(Boolean).join(' ').toLowerCase(),
    w: wordsOf(q.about),
  });
  const school = [];
  for (const c of site.countries || []) {
    for (const inst of c.institutions || []) {
      const sc = inst.school;
      if (inst.canonicalId || !sc?.programmes?.length || !['listed', 'catalogue'].includes(sc.scope)) continue;
      const statusOf = (q) => deadlineOf(site, inst, c, q).chip;
      for (const g of schoolCards(sc.programmes)) {
        const members = g.members || [g];
        const lead = g.lead || g;
        school.push({
          title: displayName(g.family?.name || lead.name),
          inst: inst.key,
          field: FIELD_CANON[lead.field] || 'Other',
          dest: c.code,
          members: () => members.map((q) => schoolFacts(q, inst, c)),
          html: () => schoolProgrammeCard(inst, g, { tuitionOnCard: true, headed: false, brief: true, at: inst.name, statusOf, country: c.name }),
        });
      }
    }
  }
  const all = [...canon, ...school];
  const order = variedOrder(all.map(({ title, inst, field, dest }) => ({ title, inst, field, dest })));
  const entries = order.map((i) => all[i]);
  const cardData = entries.map((e) => ({ members: e.members() }));
  const cardHtml = entries.map((e) => toString(e.html()));
  const cards = cardHtml.slice(0, FIRST_CARDS).map((h, n) => html`<li class="discover__card" data-card="${n}">${raw(h)}</li>`);
  /* The rest, for discover.js: chunks of card markup, and the facts of all.
     src/build.mjs writes them beside the page. */
  const chunks = [];
  for (let k = 0; k * CHUNK < cardHtml.length; k++) chunks.push(cardHtml.slice(k * CHUNK, (k + 1) * CHUNK));
  site.discoverFiles = { chunks, index: { cards: cardData } };

  /* --- The filters' options, from the records ------------------------------ */
  /* Every number counts cards, what a student sees and can count (#52): a
     card matches when any of its paths does, as the filters do. */
  const count = (pred) => cardData.filter((c) => c.members.some(pred)).length;
  const membersAll = cardData.flatMap((c) => c.members);
  const fields = [...new Set(membersAll.map((m) => m.f).filter(Boolean))].sort();
  const destName = new Map([
    ...(site.countries || []).map((c) => [c.code, c.name]),
    ...site.programmes.map((p) => [destCode(p), destOf(p)?.name]).filter(([, n]) => n),
  ]);
  const instName = new Map([
    ...(site.countries || []).flatMap((c) => (c.institutions || []).map((i) => [i.key, i.name])),
    ...site.institutionCatalogue.all.map((i) => [i.id, i.name]),
  ]);
  // A university chosen on the globe is named on its chip (discover.js).
  site.discoverFiles.index.names = Object.fromEntries([...new Set(membersAll.map((m) => m.i))].filter((id) => instName.get(id)).map((id) => [id, instName.get(id)]));
  const dests = [...new Set(membersAll.map((m) => m.d).filter(Boolean))]
    .sort((x, y) => (destName.get(x) || x).localeCompare(destName.get(y) || y));
  /* Where: one choice per country, by distance. A city or a university is a
     word in the search, or a light on the globe (round 7: a list of every
     campus on the site was a thousand options and a wall of words). */
  const DISTANCE = [['here', 'Right here'], ['nearby', 'Nearby'], ['far', 'Explore']];
  const whereGroups = DISTANCE.map(([key, label]) => ({
    label,
    options: dests.filter((code) => scopeOf(code) === key).map((code) => ({
      value: `dest:${code}`,
      label: destName.get(code) || code,
      count: count((m) => m.d === code),
    })),
  }));
  const total = cardData.length;
  const accepted = count((m) => m.a === ENTRY_AWARD.COURSE_RESULTS_ACCEPTED);
  const unknown = count((m) => m.a === ENTRY_AWARD.NOT_ESTABLISHED);
  const noMaths = count((m) => m.m === 0);
  const open = count((m) => m.o === 1);
  const awardNote = [
    `${accepted} of ${total} accept DP Course Results (the IB's award for separate subjects) in place of the Diploma, on points, grade and HL conditions that differ by country.`,
    unknown ? `${unknown} say nothing either way: ask them in writing.` : '',
  ].filter(Boolean).join(' ');

  /* --- The globe ------------------------------------------------------------ */
  const withDegrees = new Set(membersAll.map((m) => m.d));
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
    if (!placeIndex[p.placeId].image) {
      const pic = picture(site, p.id, { prefer: 'commons' }) || institutionPicture(site, instById.get(p.institutionId), { prefer: 'commons' });
      if (pic && !pic.external) placeIndex[p.placeId].image = pic.src;
    }
  }
  // Counted in cards, as the filter and the count under the globe are (#52,
  // #67): a card of several paths at one place is one there.
  for (const id of Object.keys(placeIndex)) placeIndex[id].count = count((p) => p.placeId === id);
  // Every Destination without a mapped degree is a light too, so "Explore"
  // swings out to somewhere rather than to an empty planet. Its light goes to
  // its own page.
  /* The globe's levels (the owner, 6 October 2026): every Destination is one
     light, holding its universities, whether its degrees are mapped one by
     one or not — continent, then country, then university, as the templates
     go. The ones with no mapped degree are also the "doors" the filters
     light by country. */
  const allLights = tiles
    .map((c) => ({ c, pos: centroid(c) }))
    .filter((x) => x.pos)
    .map(({ c, pos }) => ({
      id: c.code,
      name: `${c.flag} ${c.name}`.trim(),
      lat: pos.lat,
      lon: pos.lon,
      href: c.href,
      // Only the places the finder can recommend: a school checked and found
      // to teach nothing in English is research, not a light (QA 29 Sep:
      // Austria's light said 15 where its card said 8).
      count: c.institutions.filter(isEnglishStudyOption).length,
      country: c.code,
      precision: 'region',
      // A door: a country with no degree on this page. Its light counts
      // institutions, never degrees, and a group of doors says how many
      // countries it holds (#53 round 1).
      door: !withDegrees.has(c.code),
      schools: schoolsOf(site, c),
      state: depthLabel(site, c),
      image: (() => { const p = countryPicture(site, c); return p && !p.external ? p.src : ''; })(),
    }));
  const countryLights = allLights.filter((l) => l.door);

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
    /* Nearby is the continent the nearby countries share, when they share
       one (the globe opens it into its countries); else their bounds. */
    nearby: (() => {
      const near = tiles.filter((c) => c.scope === 'europe' && c.code !== hereCode);
      const continents = [...new Set(near.map((c) => continentOf(c)?.id || ''))];
      if (near.length && continents.length === 1 && continents[0]) return { region: continents[0], label: continentOf(near[0]).name };
      const b = boundsOf(near);
      return b ? { bounds: b, label: 'Europe' } : null;
    })(),
    /* Worldwide turns the desk globe to where the faraway lights weigh most:
       the mean of the far Destinations on the sphere, each weighted by the
       institutions its light stands for. Turning to the single biggest one
       framed the Americas, where two of ten are lit (home round 2, bug 6). */
    far: (() => {
      const far = tiles.filter((c) => scopeOf(c.code) === 'far').map((c) => ({ w: c.institutions.length || 1, pos: centroid(c) })).filter((x) => x.pos);
      if (!far.length) return { reset: true };
      const rad = Math.PI / 180;
      const v = far.reduce((s, { w, pos }) => [
        s[0] + w * Math.cos(pos.lat * rad) * Math.cos(pos.lon * rad),
        s[1] + w * Math.cos(pos.lat * rad) * Math.sin(pos.lon * rad),
        s[2] + w * Math.sin(pos.lat * rad),
      ], [0, 0, 0]);
      const lat = Math.atan2(v[2], Math.hypot(v[0], v[1])) / rad;
      const lon = Math.atan2(v[1], v[0]) / rad;
      return { camera: { lat: Math.round(Math.max(-20, Math.min(40, lat)) * 10) / 10, lon: Math.round(lon * 10) / 10, alt: 99 }, label: 'the world' };
    })(),
  };

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
              <span class="preset__count">${
                /* Right here counts its degrees; farther doors count countries.
                   "Europe · 16 programmes" counted only the degrees mapped one
                   by one and made 25 researched countries read as tiny. */
                /* One unit on every door (round 7): universities, which every
                   country has, where degrees are mapped only in some. */
                plural(tiles.filter((c) => scopeOf(c.code) === d.key).reduce((n, c) => n + c.institutions.filter(isEnglishStudyOption).length, 0), 'university', 'universities')}${
                /* The globe's Europe holds the school's own country too: the
                   door says what it leaves out, so the two numbers agree. */
                d.key === 'nearby' && tileBy.get(hereCode) ? html`<span class="preset__beyond"> beyond ${tileBy.get(hereCode).name}</span>` : ''}</span>
            </button>`
          )}
        </div>
      </div>

      <form class="filters finder__filters discover__filters" id="prog-filters" role="search" aria-label="Filter degrees">
        <script>document.currentScript.parentNode.dataset.enhanced = '';</script>
        <div class="finder__top">
          <div class="field filter-q" data-field="q">
            <label for="f-q" class="visually-hidden">Search a subject, city or university</label>
            <input type="search" id="f-q" data-filter="q" placeholder="Subject, city, university" autocomplete="off">
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
            ${open && open < total ? html`<button type="button" class="chip" id="f-open" aria-pressed="false">Open entry <span class="chip__count">${open}</span></button>` : ''}
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
        places: allLights,
        id: 'discover-map',
        here: hereCode || '',
        unit: 'programme',
        activeLayer: 'Where the universities are',
        caption: 'Choose a continent, then a country, then a university.',
        foldList: 'All places',
        poster: DISCOVER_POSTER,
      })}
    </div>
  </div>

  <div class="wrap wrap--wide discover__results">
    <div class="shell__bar">
      <p class="result-count" id="prog-count" role="status" aria-live="polite">${plural(total, 'programme')}</p>
      <ul class="shell__active" id="prog-active" aria-label="Active filters"></ul>
    </div>
    <noscript><p class="discover__noscript">The filters and the globe need JavaScript. Every degree is on its university's page, by country.</p></noscript>
    ${/* Above the cards: when nothing matches, the degrees nearest a search
          show beneath this line (discover.js nearest). */ ''}
    <div class="discover__empty" id="discover-empty" hidden>
      <p class="discover__empty-line" id="discover-empty-line">No degree here matches all of those yet.</p>
      <ul class="discover__empty-ways" id="discover-empty-ways"></ul>
    </div>
    <ul class="grid grid--3 discover__cards" id="discover-results" role="list">
      ${cards.slice(0, FIRST_CARDS)}
    </ul>
    ${/* The rest arrive as the student scrolls (discover.js): this line is where
          the next ones are fetched, and a button for a reader who prefers one. */
      total > FIRST_CARDS
      ? html`<div class="discover__next" id="discover-next">
          <button type="button" class="btn btn--ghost" id="discover-more-btn" hidden>Show more programmes</button>
          <noscript><a class="btn btn--ghost" href="${url('/countries/')}">Every country and its universities</a></noscript>
        </div>`
      : ''}
    ${noDegreeTiles.length
      ? html`<div class="discover__places" id="discover-places" hidden>
          <p class="discover__places-line" id="discover-places-line">More countries to explore, each with its own page.</p>
          <template id="discover-places-tiles"><ul class="tiles" role="list">${noDegreeTiles.map((c) => raw(flagsInHtml(toString(countryTile(site, c))).replace('<li>', `<li data-scope="${scopeOf(c.code)}">`).replace('<a ', `<a data-code="${c.code}" `)))}</ul></template>
        </div>`
      : ''}
  </div>
</section>

<script type="application/json" id="discover-data">${raw(JSON.stringify({
  // The first cards' facts; discover.js loads the rest (discover/index.json).
  cards: cardData.slice(0, FIRST_CARDS),
  total,
  chunk: CHUNK,
  // The lights of Destinations with no mapped degree: how far each is, and how
  // many institutions it has, so a scope can light them and a filter dim them.
  // Its name too, for the chip a choice of it on the globe leaves (#62).
  lights: Object.fromEntries(countryLights.map((l) => [l.id, { s: scopeOf(l.id), n: l.count, t: l.name.replace(/^\p{RI}{2}\s*/u, '') }])),
  // Every Destination on the globe and how far it is, so a distance or a
  // country chosen lights all its universities until a filter asks about degrees.
  scopes: Object.fromEntries(allLights.map((l) => [l.id, scopeOf(l.id)])),
  // The site's guides, so a search with no degree can hand over to one.
  guides: (site.topicList || []).map((t) => ({ t: t.navLabel || t.title, h: url(`/guides/${slugify(t.slug || t.title || 'guide')}/`) })).filter((g) => g.t),
}).replace(/</g, '\\u003c'))}</script>
<script type="application/json" id="place-data">${raw(JSON.stringify(placeIndex).replace(/</g, '\\u003c'))}</script>`;
}
