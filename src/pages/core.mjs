import { html, raw, md, plural, truncate, listSentence, firstSentence } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import {
  hero, card, note, stats, facts, sources, crumbs, sectionHead,
  tags, stamp, dataTable, emptyState, pager, accordion, freshness,
  sectorLandscape, contextNotes, close, topic,
} from '../lib/components.mjs';
import { picture, money, REGION_ORDER, RESEARCH_DEPTH } from '../lib/data.mjs';
import {
  worldWindow, evidenceBlock, artDirection, patternLayer, opportunityTeaser, deadlineList, STATE,
  mapChapter, filterQuestion,
} from '../lib/primitives.mjs';
import { DIMENSIONS, assessDestination, coverageSummary, COVERAGE } from '../lib/dimensions.mjs';
import { contextFor } from '../lib/canonical.mjs';
import { eventsForDestination } from '../lib/calendar.mjs';
import { groupInstitutions, routeSentence, variationRows } from '../lib/jurisdictions.mjs';

/* --- Home ---------------------------------------------------------------- */

/**
 * The home page is the one place on this site that is a *journey* rather than a
 * reference page, and it is laid out in the order `DYNAMIC_SITE_INSPIRATION.md`
 * sets out: invitation, first choice, world response, possibility cards,
 * personal fit, preparation, decision.
 *
 * Three things about that are deliberate and would be easy to undo by accident.
 *
 * **Every scene carries one invitation.** Not one prominent link among several
 * — one. `hero({ variant: 'arrival' })`, `mapChapter()` and `close()` all take
 * their invitation as a single object rather than a block of markup, so a scene
 * that wants to offer two things cannot without someone changing a signature.
 * The arrival's second link is an `escape` — the way *past* the invitation,
 * straight to the search — because the research doc forbids forcing a prelude
 * in front of the useful part of the product.
 *
 * **The first choice is a link, not a control.** Four fields, with counts, each
 * linking to `/programmes/?field=…`. The explorer reads that field off the URL
 * and shows it as a removable chip, so a student's first answer survives the
 * page boundary — and it does that with JavaScript switched off, which a
 * control on this page could not.
 *
 * **The dashboard is gone on purpose.** This page used to open with a band of
 * four statistics and a grid of four feature cards. The doc's home-page note
 * rules out exactly that — "a dashboard of every feature" — and asks for "a
 * living sample of opportunities rather than generic statistics". The numbers
 * that survived are the ones attached to something a student can then go and
 * look at: the scope sentence beside each camera, and the count on each field.
 */
export function home(site) {
  // 'dk-ku' was a guess at the University of Copenhagen's key and never matched
  // anything — the Danish institutions use bare ids, and Copenhagen's is 'ucph'.
  // So the home page quietly fell through to the Swedish country picture, which
  // for a while was a stock-market index chart. Wrong key, wrong fallback,
  // wrong picture, and nothing anywhere failed.
  const heroPic =
    picture(site, 'ucph') ||
    picture(site, 'dtu') ||
    picture(site, 'aau') ||
    picture(site, 'se') ||
    picture(site, 'de');
  const europeCount = site.europe.length;
  const worldCount = site.world.length;

  /* The first choice: the same question the explorer asks, asked where there is
     no query state yet. Counted from the same array the explorer filters, so
     the number on the chip and the number the student lands on are the same
     number by construction. */
  const fieldCounts = new Map();
  for (const p of site.programmes) {
    if (p.field) fieldCounts.set(p.field, (fieldCounts.get(p.field) || 0) + 1);
  }
  const fields = [...fieldCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  /* Chapter one's camera: where the programmes actually are, sized by how many
     are there. Every light is a link into the explorer already filtered to that
     place, so the picture is a way in rather than an illustration of one.
   *
   * Which Destinations that covers is read off the records rather than assumed.
   * It was assumed for about an hour, and in that hour the Netherlands arrived:
   * the chapter drew Delft and Rotterdam under a heading that said Denmark, and
   * counted them in a sentence that said Danish. A chapter that names its own
   * scope has to compute it, because the scope is the thing that changes. */
  const programmeDestinations = [
    ...new Set([...(site.graph?.opportunities?.values() || [])].map((o) => o.destination).filter(Boolean)),
  ]
    .map((code) => site.graph?.destinations?.get(code)?.name || code)
    .sort((a, b) => a.localeCompare(b));

  const dkPlaces = [];
  for (const [id, place] of site.graph?.places || new Map()) {
    const count = site.programmes.filter((p) => p.placeId === id).length;
    if (!count || !place.coordinates) continue;
    dkPlaces.push({
      id,
      name: place.name,
      lat: place.coordinates.lat,
      lon: place.coordinates.lon,
      count,
      href: `/programmes/?place=${id}`,
      precision: place.coordinatePrecision,
      state: plural(count, 'programme'),
    });
  }

  /* Chapter two's camera: one light per European destination, sized by how many
     institutions are recorded there and captioned with how far the research has
     actually got. A light that says nothing about its own evidence is the kind
     of confidence this site is not allowed to imply. */
  const europePlaces = site.europe
    .map((c) => ({ c, pos: centroid(c) }))
    .filter((x) => x.pos)
    .map(({ c, pos }) => ({
      id: c.code,
      name: `${c.flag} ${c.name}`,
      lat: pos.lat,
      lon: pos.lon,
      href: c.href,
      count: c.institutions.length,
      precision: 'region',
      state: RESEARCH_DEPTH[c.researchDepth.tier]?.label,
    }));
  const europeInstitutions = site.europe.reduce((n, c) => n + c.institutions.length, 0);
  const worldInstitutions = site.world.reduce((n, c) => n + c.institutions.length, 0);

  const worldPic = picture(site, 'us', { prefer: 'commons' }) || picture(site, 'au', { prefer: 'commons' });

  const body = html`
${hero({
  variant: 'arrival',
  eyebrow: SITE.cycle.label,
  title: 'Your IB is a passport. This is the map.',
  lede: `What each country actually asks of an IB Diploma, when you have to apply, what it costs, and which
    degrees are taught in English. Built for students finishing in ${SITE.cycle.session}.`,
  image: heroPic
    ? { src: heroPic.src, alt: heroPic.alt, credit: heroPic.credit, focal: '50% 40%' }
    : null,
  invitation: { href: '/planner/', label: 'Check my subjects' },
  escape: { href: '/programmes/', label: 'Or search every English-taught degree' },
})}

<section class="section section--tinted">
  <div class="wrap">
    ${filterQuestion({
      id: 'home-field',
      question: 'What do you want to study?',
      field: 'field',
      type: 'links',
      help: `One answer is enough to start, and it carries through to the programme finder where you can take
        it off again. ${plural(site.programmes.length, 'English-taught bachelor’s degree')} mapped to the
        subject and grade so far, and nothing here is a shortlist.`,
      options: fields.map(([label, count]) => ({
        value: label,
        label,
        count,
        href: `/programmes/?field=${encodeURIComponent(label)}`,
      })),
    })}
  </div>
</section>

<div class="wrap wrap--wide">
  <div class="journey">
    ${mapChapter({
      index: 1,
      eyebrow: 'Where is the detail deepest?',
      title: 'Some of it is mapped programme by programme',
      copy: `Most of this site is a country guide. Part of it goes all the way down: every English-taught
        bachelor's degree, the exact subjects and levels each one demands, and the official rules that
        decide how an IB Diploma converts. Denmark was first and is still the deepest, because most of you
        will apply there whatever else you do.\n\nIts conversion tables come from the Danish Agency's
        *Eksamenshåndbogen* — the handbook every Danish university is supposed to follow. Several
        universities publish their own summaries of it, and several of those summaries are out of date.`,
      scope: `${plural(site.programmes.length, 'programme')} in ${listSentence(programmeDestinations)},
        across ${plural(dkPlaces.length, 'town and city', 'towns and cities')} at
        ${plural(site.institutionCatalogue.all.length, 'institution')}. Follow a light to see only that place.`,
      places: dkPlaces,
      layer: 'Places with English-taught programmes',
      caption: 'Each light is a town, sized by how many programmes are there.',
      invitation: { href: '/programmes/', label: 'Browse every programme' },
    })}

    ${mapChapter({
      index: 2,
      eyebrow: 'And if you leave?',
      title: 'Europe, honestly assessed',
      copy: `Including the places where the English-taught offer is thinner than the brochures suggest. A
        country page that tells you there is nothing here for you has done its job, and several of them do.`,
      scope: `${plural(europeCount, 'European destination')} and ${plural(europeInstitutions, 'institution')}.
        A light is how many institutions are recorded there and how far the research has got — never how good
        a country is.`,
      places: europePlaces,
      layer: 'European destinations covered',
      caption: 'Each light is a destination. Follow one, or read down the list.',
      invitation: { href: '/europe/', label: `All ${europeCount} European destinations` },
    })}

    ${mapChapter({
      index: 3,
      eyebrow: 'How far are you willing to go?',
      title: 'And further out',
      copy: `The IB is built to travel. If you are willing to go a long way and can fund it, these systems
        already know what your diploma is worth — and several of them close their applications before you
        have predicted grades, let alone results.`,
      scope: `${plural(worldCount, 'destination')} beyond Europe and ${plural(worldInstitutions, 'institution')},
        with the fee status and the deadline stated for each.`,
      media: worldPic ? { src: worldPic.src, alt: worldPic.alt, credit: worldPic.credit } : null,
      invitation: { href: '/world/', label: 'Everything beyond Europe' },
    })}
  </div>
</div>

<section class="section section--rule">
  <div class="wrap">
    ${sectionHead({
      eyebrow: 'Three to look at',
      title: 'Not a shortlist, and not a ranking',
      lede: `Three programmes picked for contrast — a different field and a different institution each time —
        so the first things you see are unlike one another. There is no order here and no score.`,
    })}
    <div class="grid grid--3">
      ${contrastingProgrammes(site, 3).map((p) =>
        opportunityTeaser({
          opportunity: {
            name: p.name,
            href: p.href,
            institution: p.institutionName,
            place: p.campus,
            field: p.field,
            credential: p.degree,
          },
          evidence: p.evidence?.length
            ? { level: 'needs-review', label: `${plural(p.evidence.length, 'source')} recorded` }
            : { level: 'none', label: 'No source recorded yet' },
        })
      )}
    </div>
  </div>
</section>

<section class="section section--dark">
  <div class="wrap">
    <div class="layout-aside">
      <div>
        <p class="eyebrow">Does any of it fit?</p>
        <h2>Your six subjects decide more than your total does</h2>
        <p class="lede">A Danish programme can demand Mathematics at A level, or Physics at B, and no number
        of points substitutes for a subject you did not take. The subject checker compares what you are
        actually sitting against every programme here, and tells you which ones you are one subject short
        of.</p>
        <p>It runs in your browser. Nothing you type is sent anywhere, and nothing is kept beyond this
        device.</p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="${url('/planner/')}">Check my subjects</a>
        </div>
      </div>
      <aside class="layout-aside__side">
        ${note(
          `Meeting the published requirements is not the same as being offered a place. Where a programme
          restricts admission, its page shows the most recent cut-off and says plainly that it is history
          rather than a forecast.`,
          { kind: '', title: 'What this cannot tell you' }
        )}
      </aside>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap wrap--prose">
    ${sectionHead({
      eyebrow: 'Before any of it',
      title: 'What is worth doing now, and what only looks like it is',
      lede: `CAS, the Extended Essay, tests, portfolios and volunteering are not all the same kind of thing.
        Some are required, some are weighed when places are allocated, and some are simply worth doing.`,
    })}
    <p>Every preparation step on this site is labelled as one of those three, and the ones that are neither
    required nor weighed say so in as many words. The point is to stop you spending a year on something in
    the belief that an admissions office will count it.</p>
    <p><a class="arrow-link" href="${url('/prepare/')}">CAS, the EE and what actually counts</a></p>
  </div>
</section>

${close({
  eyebrow: 'When you are ready to choose',
  title: 'Put them side by side, and look at the dates',
  copy: `Every figure here carries the date it was checked and a link to where it came from. Admission rules
    change every year and several of the ones on this site are scheduled to change before autumn 2027, so
    treat it as a map rather than a contract and confirm anything consequential at the source.`,
  invitation: { href: '/compare/', label: 'Compare destinations' },
  also: [
    { href: '/denmark/', label: 'The Denmark guide' },
    { href: '/timeline/', label: 'Every deadline, in order' },
    { href: '/about/', label: 'How this site is built' },
    { href: '/trust/', label: 'Something wrong? Tell us' },
  ],
})}`;

  return page({
    title: null,
    description: SITE.description,
    path: '/',
    body,
    scripts: ['map.js'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE.name,
      description: SITE.description,
    },
  });
}

/**
 * A few opportunities chosen so that they are unlike each other.
 *
 * Deliberately not "the best", "the most popular" or "featured": the doc's
 * possibility cards are "three contrasting, evidence-backed opportunities — not
 * a prestige ranking", and this site has no basis on which to rank a programme
 * and no intention of acquiring one. The rule is contrast and nothing else — a
 * field not already shown, then an institution not already shown — walked over
 * a stable alphabetical order, so the same three come back on every build and a
 * reader who returns is not shown a slot machine.
 */
function contrastingProgrammes(site, want) {
  const pool = site.programmes.slice().sort((a, b) => a.name.localeCompare(b.name));
  const out = [];
  for (const key of ['field', 'institutionId']) {
    for (const p of pool) {
      if (out.length >= want) break;
      if (out.includes(p)) continue;
      if (out.some((q) => q[key] === p[key])) continue;
      out.push(p);
    }
  }
  // A catalogue too small to be contrasting still has to fill the row.
  for (const p of pool) {
    if (out.length >= want) break;
    if (!out.includes(p)) out.push(p);
  }
  return out.slice(0, want);
}

/* --- Country cards and indexes -------------------------------------------- */

function countryCard(site, c) {
  const pic = picture(site, c.code, { prefer: 'commons' });
  const englishOffer = c.language?.englishTaughtBachelors;
  const meta = [];
  const eu = money(c.costs?.tuitionEuEea);
  if (eu) meta.push(truncate(eu.value, 42));
  if (c.institutions.length) meta.push(plural(c.institutions.length, 'institution'));

  // Coverage here is uneven and looks uniform, which is the worst combination.
  // This used to name the researched countries and stay silent about the rest,
  // so a sketch was indistinguishable from an unlabelled anything. Every card
  // now says which of the three depths it is.
  const d = c.researchDepth;
  const hasProgrammes = [...(site.graph?.opportunities?.values() || [])].some((o) => o.destination === c.code);
  const depth = d.tier === 'researched' && hasProgrammes ? 'Programmes recorded' : RESEARCH_DEPTH[d.tier].label;

  return card({
    href: c.href,
    title: c.name,
    text: c.tagline || truncate(c.summary, 130),
    image: pic ? { src: pic.src, alt: pic.alt } : null,
    // This card shows a photograph when there is one to show, so when there is
    // not it gets the typographic panel rather than a hole in the grid.
    placeholder: true,
    flag: c.flag,
    meta,
    tags: [
      { label: depth, mod: d.tier === 'outline' ? 'thin' : 'brand' },
      englishOffer ? truncate(englishOffer, 36) : null,
    ].filter(Boolean),
  });
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
function researchDepthNote(c, { freshnessNote = '' } = {}) {
  const d = c.researchDepth;
  const meta = RESEARCH_DEPTH[d.tier];
  const counts = [
    `${plural(d.sources, 'source')} recorded for ${plural(d.institutions, 'institution')} listed`,
    d.undated ? `${d.undated} of ${plural(d.deadlines, 'deadline')} carry no published date` : null,
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
function heroSlides(site, c, max = 4) {
  const out = [];
  for (const i of c.institutions) {
    if (out.length >= max) break;
    const p = picture(site, i.key);
    if (!p?.src) continue;
    // Not the same picture the hero is already showing.
    if (out.some((s) => s.src === p.src)) continue;
    out.push({
      src: p.external ? p.src : url(p.src),
      caption: `${i.shortName || i.name}${i.city ? ` · ${i.city}` : ''}`,
      credit: p.credit || null,
    });
  }
  return out;
}

/** A country's position on the map: the mean of the places we actually know. */
function centroid(c) {
  const pts = c.places?.map((p) => p.coordinates).filter(Boolean) || [];
  if (!pts.length) return null;
  return {
    lat: pts.reduce((n, p) => n + p.lat, 0) / pts.length,
    lon: pts.reduce((n, p) => n + p.lon, 0) / pts.length,
  };
}

function countryIndex(site, { scope, title, lede, eyebrow, path: pagePath, heroKey }) {
  const list = scope === 'europe' ? site.europe : site.world;

  const mapPlaces = list
    .map((c) => ({ c, pos: centroid(c) }))
    .filter((x) => x.pos)
    .map(({ c, pos }) => ({
      id: c.code,
      name: `${c.flag} ${c.name}`,
      lat: pos.lat,
      lon: pos.lon,
      href: c.href,
      count: c.institutions.length,
      precision: 'region',
      // How much is known about this destination, in the same words the page
      // itself uses — a light that says nothing about its own evidence is the
      // kind of confidence this site is not allowed to imply.
      state: RESEARCH_DEPTH[c.researchDepth.tier]?.label,
    }));
  const byRegion = new Map();
  for (const c of list) {
    if (!byRegion.has(c.region)) byRegion.set(c.region, []);
    byRegion.get(c.region).push(c);
  }
  const regions = [...byRegion.keys()].sort(
    (a, b) => (REGION_ORDER.indexOf(a) + 99) % 99 - (REGION_ORDER.indexOf(b) + 99) % 99
  );

  const pic = picture(site, heroKey, { prefer: 'commons' });

  const body = html`
${hero({
  variant: 'compact',
  eyebrow,
  title,
  lede,
  image: pic ? { src: pic.src, alt: pic.alt, credit: pic.credit } : null,
})}

${mapPlaces.length
  ? html`<section class="section section--tight">
      <div class="wrap wrap--wide">
        ${worldWindow({
          places: mapPlaces,
          id: `index-${scope}`,
          activeLayer: 'Destinations covered',
          caption: 'Each light is a destination. Follow one, or read down the list.',
        })}
      </div>
    </section>`
  : ''}

<section class="section">
  <div class="wrap">
    ${regions.map(
      (region) => html`
      <div style="margin-bottom:var(--s8)">
        ${sectionHead({ eyebrow: region, title: regionHeadline(region), lede: null })}
        <div class="grid grid--3">
          ${byRegion.get(region).sort((a, b) => a.name.localeCompare(b.name)).map((c) => countryCard(site, c))}
        </div>
      </div>`
    )}
  </div>
</section>

${close({
  eyebrow: 'Once you have two or three in mind',
  title: 'Want them side by side?',
  copy: `The comparison table puts tuition, living costs, language of instruction and application deadlines
    for every country on one screen — seven dimensions kept apart, with no overall score, because the
    weighting would be ours and the decision is yours.`,
  invitation: { href: '/compare/', label: 'Compare every destination' },
  also: [{ href: '/timeline/', label: 'Every deadline, in order' }],
})}`;

  return page({ title, description: lede, path: pagePath, section: pagePath, body, scripts: ['map.js'] });
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

export function europeIndex(site) {
  return countryIndex(site, {
    scope: 'europe',
    eyebrow: `${site.europe.length} countries`,
    title: 'Europe, country by country',
    lede: 'What each system asks of an IB student, what it costs, and how much of it is actually available in English.',
    path: '/europe/',
    heroKey: 'it',
  });
}

export function worldIndex(site) {
  return countryIndex(site, {
    scope: 'worldwide',
    eyebrow: `${site.world.length} countries`,
    title: 'Beyond Europe',
    lede: 'Systems that know the IB well and teach in English — and, for most of them, charge international fees to match.',
    path: '/world/',
    heroKey: 'us',
  });
}

/* --- A single destination -------------------------------------------------- */

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
  const { grouping, groups } = groupInstitutions(c, site.graph);

  // Institutions that have a resolved location become lights on the map. The
  // list beneath it is the same set, and is what a keyboard or screen reader
  // uses — the picture is an enhancement of the list, never a replacement.
  const mapPlaces = c.institutions
    .filter((i) => i.coords)
    .map((i) => ({
      id: i.key,
      name: i.shortName || i.name,
      lat: i.coords.lat,
      lon: i.coords.lon,
      href: null,
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
  const lead = (label, t) => (t ? `**${label}:** ${one(t)}` : null);
  const lines = (...xs) => xs.filter(Boolean).join('\n\n') || null;

  const topics = [
    c.whyConsider.length &&
      topic({
        id: 'why',
        title: 'Why it might suit you',
        short: one(c.whyConsider[0]),
        body: html`<ul class="ticks">${c.whyConsider.map((x) => html`<li>${x}</li>`)}</ul>`,
        more: `All ${plural(c.whyConsider.length, 'reason')}`,
      }),

    c.watchOuts.length &&
      topic({
        id: 'watch',
        title: 'What to watch for',
        short: one(c.watchOuts[0]),
        body: html`<ul class="crosses">${c.watchOuts.map((x) => html`<li>${x}</li>`)}</ul>`,
        more: `All ${plural(c.watchOuts.length, 'thing')} to watch`,
      }),

    landscape?.routes?.length &&
      topic({
        id: 'landscape',
        title: `The shape of ${c.name}'s system`,
        short: one(landscape.summary),
        body: sectorLandscape(landscape, { destinationName: c.name, heading: false }),
        more: `The ${plural(landscape.routes.length, 'route')} in full`,
      }),

    notes.length &&
      topic({
        id: 'context',
        title: 'What it is actually like',
        short: `${plural(notes.length, 'observation')} from people who have watched students go through this — observations, not rules.`,
        body: contextNotes(notes, { heading: false }),
        more: 'Read them',
      }),

    c.ibRecognition &&
      topic({
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
      topic({
        id: 'apply',
        title: 'How applying actually works',
        // The portal is the one thing a student does next, so it is the short
        // answer — in the record's own words, linked where the record links.
        short: c.application.portal?.name
          ? html`<p><strong>Where to apply:</strong> ${c.application.portal.url
              ? html`<a href="${c.application.portal.url}" rel="noopener nofollow">${one(c.application.portal.name)}</a>`
              : one(c.application.portal.name)}</p>`
          : one(c.application.steps[0]),
        body: html`${c.application.portal?.name
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
      topic({
        id: 'deadlines',
        title: 'Deadlines',
        short: html`<p>${plural(events.length, 'dated event')} recorded.
          <a href="${url('/timeline/')}?destinations=${c.code}">See them on the calendar</a>,
          alongside anywhere else you are looking at.</p>`,
        body: deadlineList(events),
        more: `All ${plural(events.length, 'date')}`,
      }),

    topic({
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

    c.language &&
      topic({
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

    topic({
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
      topic({
        id: 'sources',
        title: 'Sources',
        short: `The ${plural(c.sources.length, 'page')} this page was written from.`,
        body: sources(c.sources, { title: null }),
        more: `All ${plural(c.sources.length, 'source')}`,
      }),
  ].filter(Boolean);

  const toc = [
    c.institutions.length && ['#institutions', 'Where to study'],
    ['#overview', 'The short version'],
    c.whyConsider.length && ['#why', 'Why it might suit you'],
    c.watchOuts.length && ['#watch', 'What to watch for'],
    landscape?.routes?.length && ['#landscape', `The shape of ${c.name}'s system`],
    notes.length && ['#context', 'What it is actually like'],
    c.ibRecognition && ['#ib', 'How your IB is read'],
    c.application?.steps?.length && ['#apply', 'How applying works'],
    events.length && ['#deadlines', 'Deadlines'],
    ['#money', 'Money'],
    c.language && ['#language', 'Language'],
    ['#living', 'Living there'],
    c.sources.length && ['#sources', 'Sources'],
  ].filter(Boolean);

  const body = html`
${/* `art` is the class the stylesheet resolves `--art` on: the destination's
     accent in whichever theme the reader is in. Without it the inline hex is
     still set and nothing can see it, because a `var()` written at `:root`
     cannot read a custom property declared further down the tree. */
  raw(`<div class="art" style="${art.style}">`)}
${hero({
  eyebrow: `${c.flag} ${c.region}`,
  title: c.name,
  lede: c.tagline,
  image: pic ? { src: pic.src, alt: pic.alt, credit: pic.credit, focal: art.focal } : null,
  slides: pic ? heroSlides(site, c) : [],
  // No publishable photograph of this Destination, so the hero becomes the
  // designed empty state rather than a hero that lost its picture.
  variant: pic ? undefined : 'panel',
  aside: patternLayer(art.pattern),
})}

${/* What is possible: the institutions, straight after the place itself. The
     one thing allowed in front of them is the line saying how far to trust
     the page, because reading a list and only then learning it was a sketch
     is being misled. */ ''}
<section class="section section--tight dest-open">
  <div class="wrap">
    ${crumbs([
      { href: c.scope === 'europe' ? '/europe/' : '/world/', label: c.scope === 'europe' ? 'Europe' : 'Worldwide' },
      { label: c.name },
    ])}
    ${researchDepthNote(c, {
      freshnessNote: freshness({
        intake: c.targetIntake ? '2027-autumn' : null,
        checkedAt: c.dataAsOf,
        level: c.sources.length ? 'needs-review' : 'none',
        // A provisional date is now a field rather than a phrase to grep for.
        // The old test read the year and notes for "not yet published",
        // "indicative" or "re-check", which caught whichever wording a
        // researcher happened to use and missed the rest.
        provisional: events.filter((e) => e.provisional).length,
      }),
    })}

    ${c.institutions.length
      ? html`${sectionHead({
            eyebrow: plural(c.institutions.length, 'institution'),
            title: 'Where to study',
            lede: grouping.id === 'none'
              ? `A spread of what ${c.name} offers, not a ranking. Check each one's own pages before you apply.`
              : `${grouping.lede} A spread of what ${c.name} offers, not a ranking — but which group a place is in changes how you apply to it.`,
            id: 'institutions',
          })}
          ${groups.map((g) => institutionGroup(site, g, groups.length))}`
      : ''}

    ${mapPlaces.length
      ? html`<div class="dest-open__map">
          ${worldWindow({
            places: mapPlaces,
            id: `map-${c.code}`,
            activeLayer: `Institutions in ${c.name}`,
            caption: `${plural(mapPlaces.length, 'institution')} with a resolved location.`,
          })}
        </div>`
      : ''}
  </div>
</section>

${/* What is required: every question, short answer first. */ ''}
<section class="section section--tinted section--rule">
  <div class="wrap">
    <div class="layout-aside">
      <div class="prose">
        <h2 id="overview">The short version</h2>
        <p class="lede">${c.summary}</p>
        ${topics}
      </div>

      <aside class="layout-aside__side stack">
        ${stamp(c.dataAsOf)}
        ${facts([
          { label: 'Capital', value: c.capital },
          { label: 'Currency', value: c.currency },
          { label: 'EU member', value: c.eu === true ? 'Yes' : c.eu === false ? 'No' : null },
          { label: 'EEA / fee status', value: c.eea === true ? 'EU/EEA — Danish students treated as home students for fees in most systems' : null },
          { label: 'Target intake', value: c.targetIntake },
        ])}
        <nav aria-label="On this page">
          <p class="eyebrow eyebrow--plain">On this page</p>
          <ul style="list-style:none;padding:0;margin:0;font-size:.9375rem">
            ${toc.map(([h, label]) => html`<li style="padding:.3rem 0"><a href="${h}">${label}</a></li>`)}
          </ul>
        </nav>
      </aside>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">${pager({ prev, next })}</div>
</section>
${raw('</div>')}`;

  return page({
    title: c.name,
    description: c.tagline || truncate(c.summary, 155),
    path: c.href,
    section: c.scope === 'europe' ? '/europe/' : '/world/',
    body,
    scripts: ['map.js'],
  });
}

/**
 * One group of institutions, headed by the route they apply through.
 *
 * A Destination that divides into one group renders without a heading, so a
 * centralised system looks exactly as it did before and only a federal one pays
 * for the structure. That is deliberate: the grouping exists to show a branch,
 * and drawing a branch where there is none would be its own kind of lie.
 */
function institutionGroup(site, g, groupCount) {
  const cards = html`<div class="grid grid--3 grid--places">${g.institutions.map((i) => institutionCard(site, i))}</div>`;
  if (groupCount === 1) return cards;

  const rows = variationRows(g);
  const sentence = routeSentence(g);

  return html`<section class="jgroup" ${g.id ? raw(`id="j-${g.id}"`) : ''}>
    <header class="jgroup__head">
      <h3 class="jgroup__name">${g.name}</h3>
      ${sentence
        ? html`<p class="jgroup__route">${g.route?.portalUrl
            ? html`<a href="${g.route.portalUrl}" rel="noopener nofollow">${sentence}</a>`
            : sentence}</p>`
        : html`<p class="jgroup__route jgroup__route--none">No application route recorded for ${g.name} yet —
            check each institution's own admissions page.</p>`}
    </header>
    ${/* The route sentence is the branch, so it stays in view. What varies
          along that branch is detail for someone already choosing, and sits
          one tap beneath it (#37). */
      g.summary || rows.length
        ? html`<details class="jgroup__more">
            <summary>What is different in ${g.name}</summary>
            ${g.summary ? html`<p class="jgroup__summary">${g.summary}</p>` : ''}
            ${rows.length
              ? html`<dl class="jgroup__vary">
                  ${rows.map((r) => html`<div><dt>${r.label}</dt><dd>${md(r.value)}${r.source
                    ? html` <small><a href="${r.source}" rel="noopener nofollow">Source</a></small>`
                    : ''}</dd></div>`)}
                </dl>`
              : ''}
          </details>`
        : ''}
    ${cards}
  </section>`;
}

function institutionCard(site, i) {
  const pic = picture(site, i.key);
  const meta = [i.city, i.type].filter(Boolean);
  return card({
    href: i.website || '#',
    external: true,
    title: i.name,
    // The note's own first sentence: the card is a way in, not the account of
    // the place. It used to be cut at 150 characters, mid-sentence (#37).
    text: firstSentence(i.note, 24),
    image: pic ? { src: pic.src, alt: pic.alt } : null,
    placeholder: i.shortName || i.name,
    meta,
    tags: i.englishBachelors ? [truncate(i.englishBachelors, 34)] : null,
    // One short line and a link of its own, when the record has one. Kept as
    // a slot so that #38 — each institution's IB recognition statement, from
    // the IB's database — is a data change plus this one line, not a redesign
    // of the card. Nothing renders while the field is absent.
    aside: i.ibRecognitionStatement?.url
      ? { label: 'IB statement', href: i.ibRecognitionStatement.url, text: i.ibRecognitionStatement.text }
      : null,
  });
}

/* --- Comparison table ------------------------------------------------------ */

export function compare(site) {
  const sorted = site.destinations.slice().sort((a, b) => a.name.localeCompare(b.name));

  // Every destination, assessed across the seven dimensions at build time.
  const assessed = sorted.map((c) => {
    const dims = assessDestination(c);
    return {
      code: c.code,
      name: c.name,
      flag: c.flag,
      href: c.href,
      scope: c.scope,
      region: c.region,
      dataAsOf: c.dataAsOf || null,
      coverage: coverageSummary(dims),
      dimensions: dims.map((d) => ({
        key: d.key,
        value: d.value,
        coverage: d.coverage,
        uncertainty: d.uncertainty,
      })),
    };
  });

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Side by side',
  title: 'Compare destinations',
  lede: 'Seven separate dimensions, kept separate. There is no overall score, because the weighting would be ours and the decision is yours.',
})}

<section class="section">
  <div class="wrap wrap--wide">
    ${note(
      `Meeting the entry requirements does not make a degree affordable, reachable or right for you. These are
      seven different questions and they are shown as seven different rows — a country that wins on money can
      lose on language, and no arithmetic should hide that from you.`,
      { kind: 'accent', title: 'Why there is no ranking' }
    )}

    <form class="filters" id="cmp-picker">
      <div class="field">
        <label for="cmp-add">Add a destination to compare</label>
        <select id="cmp-add">
          <option value="">Choose…</option>
          ${assessed.map((a) => html`<option value="${a.code}">${a.flag} ${a.name}</option>`)}
        </select>
      </div>
      <div class="chips" id="cmp-chosen" aria-label="Chosen destinations"></div>
    </form>

    <div id="cmp-tray"></div>
    <noscript>
      <p class="state state--empty">Choosing destinations to compare needs JavaScript. The full table below
      works without it, and every destination page carries the same seven dimensions in full.</p>
    </noscript>

    ${sectionHead({
      eyebrow: `${assessed.length} destinations`,
      title: 'Or scan the whole set',
      lede: 'Coverage says how much of the picture we have, not how good a country is. A country we know less about is not a worse country.',
    })}

    ${dataTable({
      caption: 'Every destination, with how completely each is recorded',
      head: ['Destination', 'Region', 'English-taught bachelors', 'Tuition (EU/EEA)', 'Living cost', 'Coverage'],
      rows: assessed.map((a) => {
        const c = sorted.find((x) => x.code === a.code);
        const eu = money(c.costs?.tuitionEuEea);
        const living = money(c.costs?.livingCostMonthly);
        const learning = a.dimensions.find((d) => d.key === 'learning');
        return [
          html`<a href="${url(a.href)}">${a.flag} ${a.name}</a>`,
          a.scope === 'europe' ? a.region : `${a.region} (worldwide)`,
          learning?.value ? truncate(learning.value, 44) : html`<span class="tray__missing">Not recorded</span>`,
          eu ? truncate(eu.value, 40) : html`<span class="tray__missing">Not recorded</span>`,
          living ? truncate(living.value, 28) : html`<span class="tray__missing">Not recorded</span>`,
          html`<span class="coverage coverage--${a.coverage.full >= 5 ? 'good' : a.coverage.full >= 3 ? 'part' : 'thin'}">${a.coverage.full}/${a.coverage.total}</span>`,
        ];
      }),
    })}
  </div>
</section>

<script type="application/json" id="compare-data">${raw(JSON.stringify(assessed))}</script>
<script type="application/json" id="compare-dimensions">${raw(
    JSON.stringify(DIMENSIONS.map((d) => ({ key: d.key, label: d.label, note: d.note })))
  )}</script>`;

  return page({
    title: 'Compare destinations',
    description:
      'Compare destinations across seven separate dimensions — academic, financial, practical, learning, support, future and personal — with no overall score.',
    path: '/compare/',
    body,
    scripts: ['compare.js'],
  });
}
