import { html, raw, md, plural, truncate, listSentence, firstSentence, slugify, escape } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import {
  hero, card, note, facts, stats, sources, crumbs, sectionHead, stamp, pager, freshness, sectorLandscape, contextNotes, close, topic,
} from '../lib/components.mjs';
import { picture, money, REGION_ORDER, RESEARCH_DEPTH, countryOutline } from '../lib/data.mjs';
import { worldWindow, evidenceBlock, artDirection, patternLayer, deadlineList } from '../lib/primitives.mjs';
import { representativePoint, visualCentre } from '../lib/geo.mjs';
import { contextFor, destinationFacet } from '../lib/canonical.mjs';
import { institutionCount } from './programme-facts.mjs';
import { eventsForDestination } from '../lib/calendar.mjs';
import { groupInstitutions, groupingLede, routeSentence, variationRows } from '../lib/jurisdictions.mjs';
import { cardGroups } from '../lib/paths.mjs';
import { schoolCardGroups } from '../lib/families.mjs';
import { countryTemplate } from '../templates/country.mjs';

/** A topic's id here → the country template's question it answers. */
const TOPIC_SLOT = { landscape: 'system', deadlines: 'dates', 'own-citizens': 'citizens' };
import { isEnglishStudyOption } from '../lib/schools.mjs';

/* Destinations: the Countries page (every Destination, by region) and one page per country. */

/* --- Country cards and indexes -------------------------------------------- */

/** A country's photograph: its own, or else the first of its institutions'
    that the site hosts. The tile and the globe's card for the country use the
    same one (Denmark has no country photograph of its own, and was the one
    text-only card on the globe: #53 round 1). */
export function countryPicture(site, c) {
  return (
    picture(site, c.code, { prefer: 'commons' }) ||
    publicInstitutions(c).map((i) => picture(site, i.key || i.id, { prefer: 'commons' })).find((p) => p && !p.external) ||
    null
  );
}

/** Institutions this English-taught study finder can actually recommend. */
const publicInstitutions = (c) => (c.institutions || []).filter(isEnglishStudyOption);

/**
 * A country as a photograph with its name on it: the place, the one-line
 * tagline, how many universities, and how far the research has got. Fees,
 * language and the rest are on the country page — a card that tried to carry
 * them cut each one off mid-sentence.
 */
export function countryTile(site, c) {
  const pic = countryPicture(site, c);
  // The rest of the country's photographs, as data: site.js creates each one
  // only when it is about to be shown, as the hero gallery does.
  const more = pic ? countrySlides(site, c).filter((s) => s.raw !== pic.src).slice(0, COUNTRY_SLIDES - 1).map((s) => ({ src: s.src })) : [];
  const institutions = publicInstitutions(c);

  // Coverage here is uneven and looks uniform, which is the worst combination,
  // so every tile still says which of the three depths it is — in the count
  // line, where it costs four words rather than a pill.
  const depth = depthLabel(site, c);

  return html`<li><a class="tile tile--place${pic ? '' : ' tile--bare'}" href="${url(c.href)}"${
    more.length ? raw(` data-slides="${escape(JSON.stringify(more))}"`) : ''
  }>
    ${pic ? html`<img class="tile__img" src="${url(pic.src)}" alt="${pic.alt || ''}" loading="lazy" decoding="async" width="800" height="600">` : ''}
    <span class="tile__text">
      <span class="tile__name">${c.name}</span>
      ${c.tagline ? html`<span class="tile__line">${c.tagline}</span>` : ''}
      <span class="tile__where">${institutionCount(institutions)}${depth ? ` · ${depth}` : ''}</span>
    </span>
  </a></li>`;
}

/** How far a Destination has been researched, in the words every tile and light uses. */
export function depthLabel(site, c) {
  const hasProgrammes = [...(site.graph?.opportunities?.values() || [])].some((o) => o.destination === c.code);
  if (hasProgrammes && (!c.researchDepth || c.researchDepth.tier === 'researched')) return 'Programmes recorded';
  return c.researchDepth ? RESEARCH_DEPTH[c.researchDepth.tier].label : '';
}

/**
 * Say, on the Destination page itself, how far this one has actually been
 * researched — and say it in counts, because a tier on its own is a grade and a
 * grade invites an argument about where the line sits. "4 sources for 14
 * institutions" does not.
 *
 * This sits above the summary deliberately. A student who reads to the bottom
 * of a sketch and only then learns it was a sketch has already been misled.
 *
 * Since #37 it is one line by default — the tier and the counts, which are the
 * part that changes how far to trust the page — with the tier's explanation and
 * the freshness statement one tap beneath it. It still comes before the first
 * institution; it just no longer costs a screen to get past.
 */
function researchDepthNote(c, { freshnessNote = '', events = null, researched = null } = {}) {
  const d = c.researchDepth;
  // Counted from the same dates the calendar below shows — the profile's own
  // entries and the application routes' milestones together — so the line and
  // the calendar cannot disagree about how many there are.
  const total = events ? events.length : d.deadlines;
  const undated = events ? events.filter((e) => !e.date).length : d.undated;
  const meta = RESEARCH_DEPTH[d.tier];
  const counts = [
    // "Across", not "listed": the count includes places checked and found to
    // teach nothing in English, which the grid below leaves out.
    // No institution count: it included places checked and found to teach
    // nothing in English, and disagreed with the cards beneath it.
    `${plural(d.sources, 'source')} recorded`,
    undated ? `${undated} of ${plural(total, 'date')} carry no published day` : null,
  ].filter(Boolean);
  const kind = d.tier === 'outline' ? 'warn' : d.tier === 'researched' ? 'ok' : 'accent';

  return html`<details class="note note--${kind} depth">
    <summary><strong class="note__title">${meta.label}.</strong> ${listSentence(counts)}.</summary>
    ${md(meta.summary)}
    ${freshnessNote}
  </details>`;
}

/**
 * Further pictures for a Destination hero: the institutions a student could
 * actually go to, named.
 *
 * A single photograph of the capital's skyline says "this is a country". Four
 * universities in turn, each captioned, says "these are your options", which is
 * what the page is for — and it costs nothing, because these are the same
 * photographs the institution grid further down the page already uses.
 *
 * Capped at four. Beyond that nobody is still watching, and every slide is a
 * download somebody pays for.
 */
/**
 * The photographs that stand for a country: its own, then its gallery — other
 * cities, regions and student life, never a university (owner, 1 October
 * 2026: one photograph chosen for a whole country is a bias; a few, changing,
 * promote the country for study, and do not advertise an institution). The
 * card on /countries/ and the country page's hero cycle through the same list.
 */
export const COUNTRY_SLIDES = 5;
export function countrySlides(site, c, max = COUNTRY_SLIDES) {
  const own = picture(site, c.code, { prefer: 'commons' });
  if (!own?.src) return [];
  const record = site.images?.[c.code];
  const out = [{ raw: own.src, src: own.external ? own.src : url(own.src), alt: own.alt || '', caption: record?.caption || null, credit: own.credit || null }];
  for (const g of record?.gallery || []) {
    if (out.length >= max) break;
    if (!g.src || g.review?.state !== 'approved' || out.some((s) => s.raw === g.src)) continue;
    out.push({
      raw: g.src,
      src: url(g.src),
      alt: g.caption || '',
      caption: g.caption || null,
      credit: { text: `${g.author || 'Unknown'} · ${g.licence || 'Wikimedia Commons'}`, url: g.page },
    });
  }
  return out;
}

/** The hero's further slides: the country's list, less the picture the hero already shows. */
function heroSlides(site, c, shown) {
  return countrySlides(site, c)
    .filter((s) => s.raw !== shown)
    .slice(0, COUNTRY_SLIDES - 1)
    .map(({ raw: _, ...slide }) => slide);
}

/** A country's position on the map: the middle of its own outline, as the
    eye sees it (src/lib/geo.mjs visualCentre) — Kansas for the United States,
    not Detroit (the owner, #53: pins "not placed in the center of the
    country"). A country with no outline at the globe's scale falls back to
    the one of its own places nearest the rest (the medoid). The mean of its
    places was used once, and the mean of Canada's campuses is in Minnesota. */
export function centroid(c) {
  const rings = c?.code ? countryOutline(c.code) : [];
  return (rings.length && visualCentre(rings)) || representativePoint(c.places?.map((p) => p.coordinates).filter(Boolean) || []);
}

/** The institutions inside a country's light, for the globe's country →
    schools level (worldWindow `schools`, #53): each one with a position and a
    page of its own. Its own coordinates when the record has them, else its
    (first) place's. */
export function schoolsOf(site, c) {
  return publicInstitutions(c)
    .map((i) => {
      const at = i.coords || site.graph?.places?.get(i.place || i.placeIds?.[0])?.coordinates;
      if (!at || !i.href) return null;
      const pic = picture(site, i.key || i.id);
      return {
        id: i.key || i.id,
        /* The name a student can read (globeName): never initials ("UCF",
           #53 round 1) and never a nickname ("U of T", round 2). A long name
           that has no room on a crowded stage loses its label, as any label
           does; the card names it. */
        name: globeName(i),
        lat: at.lat, lon: at.lon, href: i.href, city: typeof i.city === 'string' ? i.city : '',
        image: pic && !pic.external ? pic.src : '',
      };
    })
    .filter(Boolean);
}

/* --- Countries: every Destination, from right here to the other side ------ */

/**
 * Every Destination as a tile-shaped record: the country profiles, plus any
 * Destination that has a hand-written hub of its own instead of a profile
 * (canonical.mjs DESTINATION_HUBS). A hub Destination used to be missing from
 * the Europe index altogether, though it is in Europe and on the compare page.
 * Which one is a hub is read off the records; nothing here names it.
 */
export function placeTiles(site) {
  const profiled = new Set(site.countries.map((c) => c.code));
  const hubs = (site.destinations || [])
    .filter((d) => d.code && !profiled.has(d.code))
    .map((d) => {
      const facet = destinationFacet(site.graph?.destinations?.get(d.code) || d, d.code);
      const institutions = site.institutionCatalogue.in(d.code);
      return {
        code: d.code,
        name: d.name,
        flag: d.flag || '',
        tagline: d.tagline || '',
        scope: d.scope === 'worldwide' ? 'worldwide' : 'europe',
        region: d.region || 'Other',
        href: facet.href,
        institutions,
        researchDepth: null,
        places: institutions
          .map((i) => site.graph?.places?.get(i.place))
          .filter((p) => p?.coordinates),
      };
    });
  return [...site.countries, ...hubs];
}

/**
 * The three ways into Countries, at the distance a student reads them.
 *
 * "Right here" is the school's country (`audience.schoolCountry` in
 * data/site-config.json) — where the reader is, which for four in five of them
 * is not home, so it is never called that. "Nearby" is the rest of Europe;
 * "Explore" is everywhere else. The same three name the menu's chips, the home
 * page's doors and the Countries page's doors, so a place is never called two
 * things. Photographs are chosen in `homeDoors` (here / nearby / far).
 */
export function distanceDoors(site) {
  const hereCode = site.config?.audience?.schoolCountry || null;
  const tiles = placeTiles(site);
  const hereTile = tiles.find((c) => c.code === hereCode) || null;
  const choices = site.config?.homeDoors || {};
  const photo = (key) => {
    const p = key ? picture(site, key, { prefer: 'commons' }) : null;
    return p && !p.external ? p : null;
  };
  const institutionsIn = (list) => institutionCount(list.flatMap(publicInstitutions));
  const near = tiles.filter((c) => c.scope === 'europe' && c.code !== hereCode);
  const far = tiles.filter((c) => c.scope === 'worldwide' && c.code !== hereCode);

  const doorsList = [];
  if (hereTile) {
    const hereInstitutions = publicInstitutions(hereTile);
    const teaching = hereInstitutions.filter((i) => i.programmes?.length);
    // Counted in cards, as a student sees them (#52).
    const degrees = teaching.reduce((n, i) => n + cardGroups(site, i.programmes).length, 0);
    doorsList.push({
      key: 'here',
      href: hereTile.href,
      label: hereTile.name,
      eyebrow: 'Right here',
      title: hereTile.name,
      count: degrees
        ? `${plural(degrees, 'programme')} in English · ${institutionCount(teaching)}`
        : institutionCount(hereInstitutions),
      image: photo(choices.here?.image),
    });
  }
  doorsList.push(
    {
      key: 'nearby',
      href: '/countries/#europe',
      label: 'Europe',
      eyebrow: 'Nearby',
      title: 'Europe',
      count: `${plural(near.length, 'country', 'countries')} · ${institutionsIn(near)}`,
      image: photo(choices.nearby?.image),
    },
    {
      key: 'far',
      href: '/countries/#worldwide',
      label: 'Worldwide',
      eyebrow: 'Explore',
      title: 'Worldwide',
      count: `${plural(far.length, 'country', 'countries')} · ${institutionsIn(far)}`,
      image: photo(choices.far?.image),
    }
  );
  return doorsList;
}

/**
 * The distance, drawn rather than said. Every door starts from the same dot —
 * you, at the school — so the three read as one scale: at "Right here" the dot
 * is the place and rings open around it; at "Nearby" a short hop lands inside
 * the frame; at "Explore" the line leaves the frame altogether. The line draws
 * itself once when the door comes into view (site.js; it spends the
 * `geographic` motion token, because it is geographic movement), and is simply
 * there under reduced motion or without JavaScript. Decorative: the eyebrow and
 * the title carry the meaning.
 */
function distanceTrace(key) {
  const you = '<circle class="trace-you" cx="46" cy="100" r="5"/>';
  const shapes = {
    here: `<circle class="trace-ring" cx="46" cy="100" r="16"/><circle class="trace-ring trace-ring--2" cx="46" cy="100" r="30"/>${you}`,
    nearby: `<path class="trace-line" pathLength="1" d="M46 100 Q 110 20 170 68"/><circle class="trace-end" cx="170" cy="68" r="4"/>${you}`,
    far: `<path class="trace-line" pathLength="1" d="M46 100 Q 260 -60 900 -40"/>${you}`,
  };
  return raw(
    `<svg class="door__trace" viewBox="0 0 300 150" preserveAspectRatio="xMinYMid meet" aria-hidden="true" focusable="false">${shapes[key] || ''}</svg>`
  );
}

/** The three doors, each a photograph with its distance drawn on it. */
export function distanceDoorsHtml(items) {
  return html`<div class="doors doors--distance" data-trace>${items.map(
    (d, i) => html`<a class="door door--${d.key}" href="${url(d.href)}" style="--i:${i}">
      ${d.image
        ? html`<img class="door__img" src="${url(d.image.src)}" alt="" loading="lazy" decoding="async" width="900" height="1100">`
        : ''}
      ${distanceTrace(d.key)}
      <span class="door__text">
        <span class="door__eyebrow">${d.eyebrow}</span>
        <span class="door__title">${d.title}</span>
        ${d.count ? html`<span class="door__count">${d.count}</span>` : ''}
      </span>
      ${d.image?.credit?.text ? html`<span class="door__credit">${d.image.credit.text}</span>` : ''}
    </a>`
  )}</div>`;
}

/**
 * The name a label can carry. A short name that is a word ("Leiden") or names
 * its place ("TU Delft", "KU Leuven") reads on its own; a single word with two
 * or more capitals ("UT", "EUR", "BUas") is a code only its own students know,
 * so the label takes the full name instead.
 */
export function readableName(i) {
  const s = i.shortName;
  return !s || (!/\s/.test(s) && (s.match(/\p{Lu}/gu) || []).length >= 2) ? i.name : s;
}

/**
 * The name a school carries on the globe, where a student meets it with no
 * page around it (#53 round 2: "U of T", "Dal", "Unistra", "Nord" and
 * "Western" were cryptic, and "Michigan" read as a state). Its full name
 * whenever that is short enough to be a label ("University of Michigan",
 * "Yale University", "Dalhousie University"); for a long one, its short name
 * only when every word of it is in the full name, none is a code, and it is
 * not the place the school is "of" ("Illinois"): "Chalmers", "Queen's";
 * else the full name. Derived, never listed.
 */
export function globeName(i) {
  const name = i.name || i.shortName || '';
  const s = i.shortName || '';
  if (!s || name.length <= 26) return name;
  const words = new Set(name.toLowerCase().split(/[^\p{L}'’-]+/u).filter(Boolean));
  const code = (w) => w.length < 3 || (w.match(/\p{Lu}/gu) || []).length >= 2;
  /* "Illinois" for the University of Illinois is a state, not a school. */
  const ofPlace = new RegExp(`\\bof\\s+${s.split(/\s+/)[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'iu').test(name);
  return !ofPlace && s.split(/\s+/).every((w) => words.has(w.toLowerCase()) && !code(w)) ? s : name;
}

const regionSlug = (region) => `region-${slugify(region)}`;
const regionOrder = (r) => (REGION_ORDER.indexOf(r) + 99) % 99;

/**
 * /countries/: the doors, then every Destination grouped by region, then the
 * globe, then compare. Europe and Worldwide used to be two pages built from
 * one function; they are the two halves of this one, at #europe and
 * #worldwide, and their old addresses redirect here.
 */
export function countriesIndex(site) {
  const tiles = placeTiles(site);
  const hereCode = site.config?.audience?.schoolCountry || null;
  const halves = [
    { id: 'europe', title: 'Europe', list: tiles.filter((c) => c.scope === 'europe') },
    { id: 'worldwide', title: 'Worldwide', list: tiles.filter((c) => c.scope === 'worldwide') },
  ].filter((h) => h.list.length);

  const grouped = halves.map((h) => {
    const byRegion = new Map();
    for (const c of h.list) {
      if (!byRegion.has(c.region)) byRegion.set(c.region, []);
      byRegion.get(c.region).push(c);
    }
    const regions = [...byRegion.keys()].sort((a, b) => regionOrder(a) - regionOrder(b) || a.localeCompare(b));
    return {
      ...h,
      regions: regions.map((region) => ({
        region,
        // The reader's own region starts with where they are; the rest alphabetically.
        list: byRegion
          .get(region)
          .sort((a, b) => (b.code === hereCode) - (a.code === hereCode) || a.name.localeCompare(b.name)),
      })),
    };
  });

  const mapPlaces = tiles
    .map((c) => ({ c, pos: centroid(c) }))
    .filter((x) => x.pos)
    .map(({ c, pos }) => ({
      id: c.code,
      name: `${c.flag} ${c.name}`,
      lat: pos.lat,
      lon: pos.lon,
      href: c.href,
      count: publicInstitutions(c).length,
      country: c.code,
      image: (() => {
        const p = countryPicture(site, c);
        return p && !p.external ? p.src : '';
      })(),
      precision: 'region',
      schools: schoolsOf(site, c),
      // How much is known about this destination, in the page's own words: a
      // light that says nothing about its own evidence implies a confidence
      // this site is not allowed to imply.
      state: depthLabel(site, c),
    }));

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: `${tiles.length} countries`,
  title: 'Countries',
  lede: 'Where the English-taught degrees are, and what each country asks of your IB.',
})}

<section class="section section--doors section--tight">
  <div class="wrap wrap--wide">
    ${distanceDoorsHtml(distanceDoors(site))}
  </div>
</section>

<section class="section section--tight">
  <div class="wrap wrap--wide">
    <nav class="region-nav" aria-label="Regions">
      <ul class="chips region-nav__list" role="list">
        ${grouped.flatMap((h) =>
          h.regions.map((g) => html`<li><a class="chip" href="#${regionSlug(g.region)}">${regionHeadline(g.region)}</a></li>`)
        )}
      </ul>
    </nav>
    ${grouped.map(
      (h) => html`<div class="half" id="${h.id}">
        <h2 class="half__name">${h.title}</h2>
        ${h.regions.map(
          (g) => html`<div class="region" id="${regionSlug(g.region)}">
            <h3 class="region__name">${regionHeadline(g.region)}</h3>
            <ul class="tiles" role="list">${g.list.map((c) => countryTile(site, c))}</ul>
          </div>`
        )}
      </div>`
    )}
  </div>
</section>

${mapPlaces.length
  ? html`<section class="section section--tinted" id="map">
      <div class="wrap wrap--wide">
        <h2 class="region__name">On the map</h2>
        ${worldWindow({
          places: mapPlaces,
          id: 'index-countries',
          unit: 'institution',
          poster: '/assets/img/globe/poster-index-countries.webp',
          activeLayer: 'Destinations covered',
          caption: 'Each light is a country. Follow one, or read the list above.',
        })}
      </div>
    </section>`
  : ''}

${close({
  title: 'Two or three in mind?',
  copy: 'Put their fees, language and deadlines side by side.',
  invitation: { href: '/compare/', label: 'Compare countries' },
  also: [{ href: '/timeline/', label: 'Deadlines' }],
})}`;

  return page({
    title: 'Countries',
    description: `${tiles.length} countries where an IB student can study in English, from right here to the other side of the world.`,
    path: '/countries/',
    section: '/countries/',
    body,
    scripts: ['map.js'],
  });
}

function regionHeadline(region) {
  return (
    {
      Nordics: 'The Nordics',
      'British Isles': 'Britain and Ireland',
      'Western Europe': 'Western Europe',
      'Central Europe': 'Central Europe',
      Baltics: 'The Baltics',
      'Southern Europe': 'Southern Europe',
      'North America': 'North America',
      'Asia-Pacific': 'Asia and the Pacific',
      'Middle East': 'The Gulf',
    }[region] || region
  );
}

export function destination(site, c, { prev, next }) {
  // A country profile and a canonical Destination record are two different
  // things: most countries have only the first. Where the second exists it
  // carries the researched sector landscape and the context notes, so it is
  // looked up rather than assumed, and everything below renders nothing at all
  // when it is absent.
  const canonical = site.graph?.destinations?.get(c.code) || null;
  const landscape = canonical?.sectorLandscape || null;
  // A note about the application system is a note about applying here, and the
  // destination page is where someone reads about applying here. Collecting
  // them at the point of display rather than duplicating the note keeps one
  // observation in one place.
  const notes = canonical
    ? [
        ...contextFor(site.graph, 'destination', c.code),
        ...(canonical.applicationSystems || []).flatMap((id) =>
          contextFor(site.graph, 'application-system', id)
        ),
      ]
    : [];

  const pic = picture(site, c.code, { prefer: 'commons' });
  const art = artDirection(c.artDirection);

  // Dated events come from one model, whether they were written on the country
  // profile or migrated into an Application Route. The page does not need to
  // know which, and must not be able to tell — that is what stopped the
  // calendar and the country pages drifting apart.
  const events = eventsForDestination(c, site.graph);

  // How this Destination's institutions divide for the purpose of applying.
  // Declared in the record, never inferred here: a country that is genuinely
  // one system and a country nobody has examined both render as one group, and
  // `grouping.declared` is the only thing that tells them apart.
  const institutions = publicInstitutions(c);
  const publicCountry = { ...c, institutions };
  const { grouping, groups } = groupInstitutions(publicCountry, site.graph);

  // Institutions that have a resolved location become lights on the map. The
  // list beneath it is the same set, and is what a keyboard or screen reader
  // uses — the picture is an enhancement of the list, never a replacement.
  const mapPlaces = institutions
    .filter((i) => i.coords)
    .map((i) => ({
      id: i.key,
      name: readableName(i),
      lat: i.coords.lat,
      lon: i.coords.lon,
      // The institution's own page on this site, which is where its card on
      // this page goes too (#43).
      href: i.href || null,
      external: false,
      country: c.code,
      image: (() => { const p = picture(site, i.key); return p && !p.external ? p.src : ''; })(),
      precision: i.coordinatePrecision,
      count: 1,
    }));
  const eu = money(c.costs?.tuitionEuEea);
  const nonEu = money(c.costs?.tuitionNonEu);
  const living = money(c.costs?.livingCostMonthly);

  /* #37 — what is possible before what is required.
   *
   * This page used to run every section in full, in the order a researcher
   * would file them, and put the institutions last — below the sources. On a
   * phone that was 52 screens, with "Where to study" 79% of the way down. So
   * the order is now: the place (hero), how far to trust the page (one line),
   * the institutions, and only then the questions — each as a short answer
   * taken from the record, with the full researched prose one tap beneath it.
   * Nothing was deleted to get there; it was moved behind `<details>`.
   *
   * scripts/test-page-budget.mjs reads the built page back and fails if the
   * default view grows past its budget or the institutions stop coming first.
   */
  const one = (t) => firstSentence(t);
  const portalName = String(c.application?.portal?.name || '');
  // No central portal: said either as a name starting "None", or by the record
  // declaring the system decentralised — in which case its "name" is a
  // description ("Each university's own portal…") and reads as one.
  const saysNone = /^none\b/i.test(portalName.trim());
  const noPortal = saysNone || (c.application?.centralised === false && Boolean(portalName));
  const portalRest = saysNone
    ? portalName.replace(/^none(?:\s+nationally)?[\s.:,;–—-]*/i, '').trim()
    : noPortal
      ? portalName.trim()
      : '';
  const summaryLead = firstSentence(c.summary, 40);
  // A lead cut mid-sentence ends in an ellipsis; then the whole summary goes
  // beneath it, otherwise only what follows the first sentence.
  const summaryRest = summaryLead.endsWith('…')
    ? c.summary
    : String(c.summary || '').replace(/\s+/g, ' ').trim().slice(summaryLead.length).trim();
  const lead = (label, t) => (t ? `**${label}:** ${one(t)}` : null);
  const lines = (...xs) => xs.filter(Boolean).join('\n\n') || null;

  const topics = [
    c.whyConsider.length &&
      ({
        id: 'why',
        title: 'Why it might suit you',
        short: one(c.whyConsider[0]),
        body: html`<ul class="ticks">${c.whyConsider.map((x) => html`<li>${x}</li>`)}</ul>`,
        more: `All ${plural(c.whyConsider.length, 'reason')}`,
      }),

    c.watchOuts.length &&
      ({
        id: 'watch',
        title: 'What to watch for',
        short: one(c.watchOuts[0]),
        body: html`<ul class="crosses">${c.watchOuts.map((x) => html`<li>${x}</li>`)}</ul>`,
        more: `All ${plural(c.watchOuts.length, 'thing')} to watch`,
      }),

    landscape?.routes?.length &&
      ({
        id: 'landscape',
        title: `The shape of ${c.name}'s system`,
        short: one(landscape.summary),
        body: sectorLandscape(landscape, { destinationName: c.name, heading: false }),
        more: `The ${plural(landscape.routes.length, 'route')} in full`,
      }),

    notes.length &&
      ({
        id: 'context',
        title: 'What it is actually like',
        short: `${plural(notes.length, 'observation')} from people who have watched students go through this — observations, not rules.`,
        body: contextNotes(notes, { heading: false }),
        more: 'Read them',
      }),

    c.ibRecognition &&
      ({
        id: 'ib',
        title: 'How your IB is read here',
        short: c.ibRecognition.accepted === false
          ? 'Not straightforwardly — see the notes.'
          : lead('Minimum', c.ibRecognition.minimumPoints) || 'Yes, an IB Diploma is accepted.',
        body: html`${facts([
            { label: 'Accepted', value: c.ibRecognition.accepted === false ? 'Not straightforwardly — see the notes' : 'Yes' },
            { label: 'Minimum', value: c.ibRecognition.minimumPoints },
            { label: 'Subjects and levels', value: c.ibRecognition.subjectLevelRule },
            { label: 'Score conversion', value: c.ibRecognition.gradeConversion },
          ])}
          ${(c.ibRecognition.notes || []).length
            ? html`<ul>${(c.ibRecognition.notes || []).map((n) => html`<li>${n}</li>`)}</ul>`
            : ''}
          ${evidenceBlock({
            claim: `How ${c.name} reads an IB Diploma.`,
            records: (c.sources || []).slice(0, 6).map((s) => ({
              sourceUrl: s.url,
              publisher: s.title || s.url,
              retrievedAt: s.retrieved || c.dataAsOf,
              verificationState: 'needs-review',
            })),
            summary: 'These are the pages this section was written from. None has been signed off by a person yet, so confirm anything consequential at the source.',
          })}`,
        more: 'Subjects, levels and conversion',
      }),

    c.application?.steps?.length &&
      ({
        id: 'apply',
        title: 'How applying actually works',
        // The portal is the one thing a student does next, so it is the short
        // answer — in the record's own words, linked where the record links.
        // A record with no central portal says so in the name ("None. You apply
        // to each university…"); that reads as advice, not as a portal called
        // "None".
        short: noPortal
          ? html`<p><strong>Where to apply:</strong> directly to each university — there is no central portal.</p>`
          : c.application.portal?.name
          ? html`<p><strong>Where to apply:</strong> ${c.application.portal.url
              ? html`<a href="${c.application.portal.url}" rel="noopener nofollow">${one(c.application.portal.name)}</a>`
              : one(c.application.portal.name)}</p>`
          : one(c.application.steps[0]),
        body: html`${noPortal
            ? note(
                html`${portalRest || 'There is no central portal — you apply to each institution separately.'}
                ${c.application.portal.url ? html` <a href="${c.application.portal.url}" rel="noopener nofollow">Where to find the programmes</a>.` : ''}`,
                { kind: '', title: 'Where to apply' }
              )
            : c.application.portal?.name
            ? note(
                html`Applications go through <a href="${c.application.portal.url}" rel="noopener nofollow">${c.application.portal.name}</a>.
                ${c.application.centralised === false ? 'There is no single national portal — you apply to each institution separately.' : ''}`,
                { kind: '', title: 'Where to apply' }
              )
            : ''}
          <ol class="steps">${c.application.steps.map((s) => html`<li>${md(s)}</li>`)}</ol>
          ${c.application.selectionNotes ? md(c.application.selectionNotes) : ''}`,
        more: `The ${plural(c.application.steps.length, 'step')}`,
      }),

    events.length &&
      ({
        id: 'deadlines',
        title: 'Deadlines',
        short: html`<p>${plural(events.length, 'dated event')} recorded.
          <a href="${url('/timeline/')}?destinations=${c.code}">See them on the calendar</a>,
          alongside anywhere else you are looking at.</p>`,
        body: deadlineList(events),
        more: `All ${plural(events.length, 'date')}`,
      }),

    ({
      id: 'money',
      title: 'Money',
      short: lines(
        eu ? lead('Tuition, EU/EEA', eu.value) : nonEu ? lead('Tuition, non-EU', nonEu.value) : null,
        living ? lead('Living costs', living.value) : null
      ),
      body: html`${facts([
          { label: 'Tuition, EU/EEA', value: eu ? `${eu.value}${eu.year ? ` *(${eu.year})*` : ''}` : null },
          { label: 'Tuition, non-EU', value: nonEu ? `${nonEu.value}${nonEu.year ? ` *(${nonEu.year})*` : ''}` : null },
          { label: 'Application fee', value: c.costs?.applicationFee },
          { label: 'Living costs', value: living ? `${living.value}${living.year ? ` *(${living.year})*` : ''}` : null },
        ])}
        ${(c.costs?.notes || []).length ? html`<ul>${c.costs.notes.map((n) => html`<li>${n}</li>`)}</ul>` : ''}
        ${c.funding.length
          ? html`<h3>Funding you could actually get</h3>
              <ul>${c.funding.map((f) => html`<li>${f}</li>`)}</ul>`
          : ''}`,
      more: 'Fees, living costs and funding',
    }),

    /* Most of this page is written for an EU/EEA citizen from somewhere else.
       Some readers hold this country's citizenship; the record says what
       changes for them (docs/research/audience, critique round 2). */
    c.ownCitizens &&
      (() => {
        const [first, ...rest] = c.ownCitizens.split(/(?<=\.)\s+/);
        return ({
          id: 'own-citizens',
          title: `If you are ${c.adjective || 'a citizen'}`,
          short: first,
          body: rest.length ? html`<p>${rest.join(' ')}</p>` : '',
          more: 'What else changes',
        });
      })(),

    c.language &&
      ({
        id: 'language',
        title: 'Language',
        short: lead('English-taught bachelors', c.language.englishTaughtBachelors),
        body: html`${facts([
            { label: 'English-taught bachelors', value: c.language.englishTaughtBachelors },
            { label: 'Proving your English', value: c.language.englishProof },
            { label: 'Local language needed?', value: c.language.localLanguageRequired === true ? 'Yes, for most programmes' : c.language.localLanguageRequired === false ? 'Not for English-taught programmes' : null },
          ])}
          ${(c.language.notes || []).length ? html`<ul>${c.language.notes.map((n) => html`<li>${n}</li>`)}</ul>` : ''}`,
        more: 'Proving your English, and the rest',
      }),

    ({
      id: 'living',
      title: 'Living there',
      short: lead('Residency', c.residency) || lead('Housing', c.housing),
      body: facts([
        { label: 'Residency', value: c.residency },
        { label: 'Working', value: c.workRights },
        { label: 'Housing', value: c.housing },
        { label: 'Healthcare', value: c.healthcare },
      ]),
      more: 'Residency, work, housing and healthcare',
    }),

    // Last, and closed. The sources are what the short answers stand on, not
    // what a student came for — and they used to sit above the universities.
    c.sources.length &&
      ({
        id: 'sources',
        title: 'Sources',
        short: `The ${plural(c.sources.length, 'page')} this page was written from.`,
        body: sources(c.sources, { title: null }),
        more: `All ${plural(c.sources.length, 'source')}`,
      }),
  ].filter(Boolean);

  /* How far to trust the page. A sketch says so before the list, because
     reading a list and only then learning it was a sketch is being misled; a
     page researched in depth says it in the side rail, so the cards start
     where Denmark's start. */
  const depthNote = researchDepthNote(c, {
    events,
    researched: (c.institutions || []).length,
    freshnessNote: freshness({
      intake: c.targetIntake ? '2027-autumn' : null,
      checkedAt: c.dataAsOf,
      level: c.sources.length ? 'needs-review' : 'none',
      // A provisional date is a field rather than a phrase to grep for.
      provisional: events.filter((e) => e.provisional).length,
    }),
  });

  /* The four numbers under the photograph, from what the records can count
     rather than from prose: how many places, how many degrees are mapped one
     by one, where you apply, and how often IB students already go there. A
     number nothing supports is left out. */
  const mapped = institutions.reduce((n, i) => n + degreesIn(site, i), 0);
  const transcripts = institutions.reduce((n, i) => n + (i.ibRecognitionStatement?.transcripts5y || 0), 0);
  /* Where you apply, only when the record leaves no doubt: it names one
     central portal without a qualifier ("Norwegian-taught only", "then each
     region's…"), or it says in its own words that there is none. A portal
     name with a caveat reads as advice it is not, so it is left to the
     "How applying actually works" topic below. */
  const portalShort = portalName.split(/ \(| — | - |[.;,]/)[0].trim();
  const qualified = /\b(only|then|accreditation|information|pre-?enrol)/i.test(portalName);
  const saysNoPortal = /^(none|no central portal|no shared application)\b/i.test(portalName.trim());
  const strip = [
    institutions.length ? { value: String(institutions.length), label: institutions.length === 1 ? 'Institution teaching in English' : 'Institutions teaching in English' } : null,
    mapped ? { value: String(mapped), label: mapped === 1 ? 'Degree mapped in English' : 'Degrees mapped in English' } : null,
    saysNoPortal
      ? { value: 'Direct', label: 'You apply to each university' }
      : c.application?.centralised === true && !qualified && portalShort && portalShort.split(/\s+/).length <= 3
        ? { value: portalShort, label: 'National application portal' }
        : null,
    transcripts ? { value: transcripts.toLocaleString('en-GB'), label: 'IB transcripts sent here in five years' } : null,
  ].filter(Boolean);

  /* This country's page, drawn by the one country template (src/templates/country.mjs). */
  return countryTemplate({
    artStyle: art.style,
    hero: {
      region: c.region,
      title: c.name,
      lede: c.tagline,
      image: pic ? { src: pic.src, alt: pic.alt, credit: pic.credit, focal: art.focal, caption: site.images?.[c.code]?.caption || null } : null,
      slides: pic ? heroSlides(site, publicCountry, pic.src) : [],
      // No publishable photograph of this Destination, so the hero becomes the
      // designed empty state rather than a hero that lost its picture.
      variant: pic ? undefined : 'panel',
      aside: patternLayer(art.pattern),
      actions: [
        mapped ? { href: `/?where=dest:${c.code}#discover`, label: 'See every degree' } : null,
        events.length ? { href: `/timeline/?destinations=${c.code}`, label: 'See the dates' } : null,
      ].filter(Boolean),
    },
    stats: strip,
    crumbs: [
      { href: c.scope === 'europe' ? '/countries/#europe' : '/countries/#worldwide', label: c.scope === 'europe' ? 'Europe' : 'Worldwide' },
      { label: c.name },
    ],
    notice: c.researchDepth?.tier === 'researched' ? null : depthNote,
    places: {
      count: institutions.length,
      lede: grouping.id === 'none' ? null : groupingLede(canonical),
      groups: groups.map((g) => ({
        name: groups.length === 1 ? null : g.name,
        route: routeSentence(g),
        routeHref: g.route?.portalUrl || null,
        more: groupMore(g),
        cards: g.institutions.map((i) => institutionCard(site, i)),
      })),
      map: mapPlaces.length
        ? worldWindow({
            places: mapPlaces,
            id: `map-${c.code}`,
            activeLayer: `Institutions in ${c.name}`,
            caption: `${plural(mapPlaces.length, 'institution')} with a resolved location.`,
          })
        : null,
    },
    details: {
      lede: summaryLead,
      more: summaryRest || null,
      adjective: c.adjective || null,
      // The record's answers, keyed by the template's questions (TOPICS).
      topics: Object.fromEntries(topics.map(({ id, title, ...t }) => [TOPIC_SLOT[id] || id, t])),
    },
    rail: {
      checked: c.dataAsOf,
      notice: c.researchDepth?.tier === 'researched' ? depthNote : null,
      deeper: [
        mapped ? { href: `/?where=dest:${c.code}#discover`, label: `Every degree in ${c.name}` } : null,
        events.length ? { href: `/timeline/?destinations=${c.code}`, label: 'The dates on the calendar' } : null,
        { href: '/compare/', label: 'Compare countries' },
        { href: '/countries/', label: 'Every country' },
      ].filter(Boolean),
    },
    pager: { prev, next },
    page: {
      title: c.name,
      description: c.tagline || truncate(c.summary, 155),
      path: c.href,
      section: '/countries/',
      scripts: ['map.js'],
    },
  });
}

/**
 * What varies along one group's route (#37): detail for someone already
 * choosing, one tap beneath the route line.
 */
function groupMore(g) {
  const rows = variationRows(g);
  if (!g.summary && !rows.length) return null;
  return html`${g.summary ? html`<p class="jgroup__summary">${g.summary}</p>` : ''}
    ${rows.length
      ? html`<dl class="jgroup__vary">
          ${rows.map((r) => html`<div><dt>${r.label}</dt><dd>${md(r.value)}${r.source
            ? html` <small><a href="${r.source}" rel="noopener nofollow">Source</a></small>`
            : ''}</dd></div>`)}
        </dl>`
      : ''}`;
}

/** The degree cards an institution shows: its school record's, or its
    canonical programmes' (the five Dutch universities mapped in depth
    showed no count at all). */
function degreesIn(site, i) {
  if (i.school?.scope === 'listed') return schoolCardGroups(i.school.programmes).length;
  return i.programmes?.length ? cardGroups(site, i.programmes).length : 0;
}

/** An institution as the country template's card: photograph, name, one
    sentence, and where it is and how many degrees it teaches in English. */
function institutionCard(site, i) {
  const pic = picture(site, i.key);
  const listed = degreesIn(site, i);
  return {
    href: i.href,
    name: i.name,
    shortName: i.shortName,
    // The note's own first sentence: the card is a way in, not the account of
    // the place. It used to be cut at 150 characters, mid-sentence (#37).
    text: i.school?.summary || firstSentence(i.note, 32),
    image: pic ? { src: pic.src, alt: pic.alt } : null,
    meta: [i.city, listed ? plural(listed, 'programme') : i.school?.scope === 'catalogue' ? 'Nearly all in English' : null],
  };
}
