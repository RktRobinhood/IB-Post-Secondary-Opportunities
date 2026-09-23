import { html, raw, md, plural, truncate, listSentence } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import {
  hero, card, note, stats, facts, sources, crumbs, sectionHead,
  tags, stamp, dataTable, emptyState, pager, accordion, freshness,
  sectorLandscape, contextNotes,
} from '../lib/components.mjs';
import { picture, money, REGION_ORDER, RESEARCH_DEPTH } from '../lib/data.mjs';
import {
  worldWindow, evidenceBlock, artDirection, patternLayer, opportunityTeaser, STATE,
} from '../lib/primitives.mjs';
import { DIMENSIONS, assessDestination, coverageSummary, COVERAGE } from '../lib/dimensions.mjs';
import { contextFor } from '../lib/canonical.mjs';

/* --- Home ---------------------------------------------------------------- */

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
  const instCount =
    site.dkInstitutions.length + site.countries.reduce((n, c) => n + c.institutions.length, 0);

  const featured = ['nl', 'gb', 'de', 'se', 'ie', 'it']
    .map((code) => site.countries.find((c) => c.code === code))
    .filter(Boolean);

  const body = html`
${hero({
  eyebrow: SITE.cycle.label,
  title: 'Your IB is a passport. This is the map.',
  lede: 'Where an IB Diploma can take you — what each country actually asks for, when you have to apply, what it costs, and which degrees are taught in English. Built for students finishing the Diploma in May 2027.',
  image: heroPic
    ? { src: heroPic.src, alt: heroPic.alt, credit: heroPic.credit, focal: '50% 40%' }
    : null,
  actions: html`
    <a class="btn btn--primary" href="${url('/planner/')}">Check my subjects</a>
    <a class="btn btn--ghost" href="${url('/denmark/')}">Start with Denmark</a>`,
})}

<section class="section section--tinted">
  <div class="wrap">
    ${stats([
      { value: site.countries.length, label: 'Countries covered' },
      { value: instCount, label: 'Institutions profiled' },
      { value: '15 Mar', label: 'Danish deadline, 2027' },
      { value: '6 Jul', label: 'IB results day, 2027' },
    ])}
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead({
      num: '01',
      eyebrow: 'Start here',
      title: 'Four questions worth answering before you pick anywhere',
      lede: 'Most students start from a country they like the sound of. It works better the other way round — start from what your subjects and your money allow, then choose between what is left.',
    })}
    <div class="grid grid--4">
      ${[
        {
          href: '/planner/',
          title: 'Do my subjects qualify?',
          text: 'Enter your six IB subjects and levels. See which Danish degrees you meet the entry requirements for, and which ones you are one subject short of.',
        },
        {
          href: '/denmark/ib-conversion/',
          title: 'What is my score worth?',
          text: 'The official conversion from IB points to the Danish 7-point average, plus how the UK, Ireland, Norway and Hungary convert your results.',
        },
        {
          href: '/timeline/',
          title: 'When do I have to act?',
          text: 'Every deadline that matters, in order, from autumn 2026 to results day in July 2027. Some close before you have predicted grades.',
        },
        {
          href: '/compare/',
          title: 'What will it cost?',
          text: 'Tuition, living costs and whether Danish SU follows you, side by side across every country on this site.',
        },
      ].map((c) => card({ ...c }))}
    </div>
  </div>
</section>

<section class="section section--dark">
  <div class="wrap">
    <div class="layout-aside">
      <div>
        <p class="eyebrow">The home option</p>
        <h2>Denmark, in more detail than anywhere else</h2>
        <p class="lede">Most of you will apply in Denmark, whatever else you do. So Denmark is covered
        programme by programme: every English-taught bachelor's degree, the exact subjects and levels each
        one demands, and the official rules that decide how your IB converts.</p>
        <p>The conversion tables here come from the Danish Agency's <em>Eksamenshåndbogen</em> — the handbook
        every Danish university is supposed to follow. Several universities publish their own summaries of it,
        and several of those summaries are out of date.</p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="${url('/denmark/')}">The Denmark guide</a>
          <a class="btn btn--ghost" href="${url('/programmes/')}">Browse every programme</a>
        </div>
      </div>
      <aside class="layout-aside__side">
        ${stats([
          { value: site.programmes.length || '—', label: 'English-taught programmes mapped' },
          { value: site.dkInstitutions.length || '—', label: 'Danish institutions' },
        ])}
      </aside>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead({
      num: '02',
      eyebrow: `${europeCount} countries`,
      title: 'Europe, honestly assessed',
      lede: 'Including the places where the English-taught offer is thinner than the brochures suggest. A country page that tells you there is nothing for you has done its job.',
    })}
    <div class="grid grid--3">
      ${featured.map((c) => countryCard(site, c))}
    </div>
    <p style="margin-top:var(--s6)"><a class="arrow-link" href="${url('/europe/')}">All ${europeCount} European destinations</a></p>
  </div>
</section>

<section class="section section--tinted section--rule">
  <div class="wrap">
    ${sectionHead({
      num: '03',
      eyebrow: `${worldCount} countries`,
      title: 'And further out',
      lede: 'The IB is built to travel. If you are willing to go a long way and can fund it, these systems know exactly what your diploma is worth.',
    })}
    <div class="grid grid--3">
      ${site.world.slice(0, 6).map((c) => countryCard(site, c))}
    </div>
    <p style="margin-top:var(--s6)"><a class="arrow-link" href="${url('/world/')}">Everything beyond Europe</a></p>
  </div>
</section>

<section class="section">
  <div class="wrap wrap--prose">
    ${note(
      `Every figure on this site carries the date it was checked and a link to where it came from.
      Admission rules change every year, and several of the ones here are scheduled to change before
      autumn 2027. Treat this as a map, not a contract — and confirm anything that matters with the
      university before you rely on it.`,
      { kind: 'accent', title: 'How to use this' }
    )}
  </div>
</section>`;

  return page({
    title: null,
    description: SITE.description,
    path: '/',
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE.name,
      description: SITE.description,
    },
  });
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
 */
function researchDepthNote(c) {
  const d = c.researchDepth;
  const meta = RESEARCH_DEPTH[d.tier];
  const counts = [
    `${plural(d.sources, 'source')} recorded for ${plural(d.institutions, 'institution')} listed`,
    d.undated ? `${d.undated} of ${plural(d.deadlines, 'deadline')} carry no published date` : null,
  ].filter(Boolean);

  return note(`${meta.summary}\n\n**On this page:** ${listSentence(counts)}.`, {
    kind: d.tier === 'outline' ? 'warn' : d.tier === 'researched' ? 'ok' : 'accent',
    title: meta.label,
  });
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

<section class="section section--tinted section--rule">
  <div class="wrap wrap--prose">
    <h2>Want them side by side?</h2>
    <p>The comparison table puts tuition, living costs, language of instruction and application deadlines
    for every country on one screen.</p>
    <p><a class="btn btn--solid" href="${url('/compare/')}">Compare every destination</a></p>
  </div>
</section>`;

  return page({ title, description: lede, path: pagePath, section: pagePath, body });
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

  const body = html`
${raw(`<div style="${art.style}">`)}
${hero({
  eyebrow: `${c.flag} ${c.region}`,
  title: c.name,
  lede: c.tagline,
  image: pic ? { src: pic.src, alt: pic.alt, credit: pic.credit, focal: art.focal } : null,
  slides: pic ? heroSlides(site, c) : [],
  variant: pic ? undefined : 'plain',
  aside: patternLayer(art.pattern),
})}

<section class="section">
  <div class="wrap">
    ${crumbs([
      { href: c.scope === 'europe' ? '/europe/' : '/world/', label: c.scope === 'europe' ? 'Europe' : 'Worldwide' },
      { label: c.name },
    ])}
    <div class="layout-aside">
      <div class="prose">
        ${freshness({
          intake: c.targetIntake ? '2027-autumn' : null,
          checkedAt: c.dataAsOf,
          level: c.sources.length ? 'needs-review' : 'none',
          provisional: c.deadlines.filter((d) => /not yet published|indicative|re-check/i.test(`${d.year || ''} ${d.notes || ''}`)).length,
        })}
        ${researchDepthNote(c)}
        <p class="lede">${c.summary}</p>

        ${mapPlaces.length
          ? html`<div style="margin-bottom:var(--s7)">
              ${worldWindow({
                places: mapPlaces,
                id: `map-${c.code}`,
                activeLayer: `Institutions in ${c.name}`,
                caption: `${plural(mapPlaces.length, 'institution')} with a resolved location.`,
              })}
            </div>`
          : ''}

        ${c.whyConsider.length
          ? html`<h2 id="why">Why it might suit you</h2>
              <ul class="ticks">${c.whyConsider.map((x) => html`<li>${x}</li>`)}</ul>`
          : ''}

        ${c.watchOuts.length
          ? html`<h2 id="watch">What to watch for</h2>
              <ul class="crosses">${c.watchOuts.map((x) => html`<li>${x}</li>`)}</ul>`
          : ''}

        ${landscape ? sectorLandscape(landscape, { destinationName: c.name }) : ''}

        ${contextNotes(notes)}

        ${c.ibRecognition
          ? html`<h2 id="ib">How your IB is read here</h2>
              ${facts([
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
              })}`
          : ''}

        ${c.application?.steps?.length
          ? html`<h2 id="apply">How applying actually works</h2>
              ${c.application.portal?.name
                ? note(
                    html`Applications go through <a href="${c.application.portal.url}" rel="noopener nofollow">${c.application.portal.name}</a>.
                    ${c.application.centralised === false ? 'There is no single national portal — you apply to each institution separately.' : ''}`,
                    { kind: '', title: 'Where to apply' }
                  )
                : ''}
              <ol class="steps">${c.application.steps.map((s) => html`<li>${md(s)}</li>`)}</ol>
              ${c.application.selectionNotes ? md(c.application.selectionNotes) : ''}`
          : ''}

        ${c.deadlines.length
          ? html`<h2 id="deadlines">Deadlines</h2>
              <ul class="timeline">
                ${c.deadlines.map(
                  (d) => html`<li>
                    <div class="timeline__when">${
                      // A missing date rendered as an empty cell reads as a
                      // layout fault, not as a statement — and it is a
                      // statement: we went to the official page and the date
                      // was not on it. Twenty-eight deadlines are in this
                      // position, mostly outside Europe. Say so.
                      d.date == null
                        ? html`<span class="timeline__unpublished">Date not published</span>`
                        : d.date
                    }${d.year ? html`<br><small>${d.year}</small>` : ''}</div>
                    <div class="timeline__what">
                      <h4>${d.label}</h4>
                      ${d.notes ? md(d.notes) : ''}
                      ${d.source ? html`<p><small><a href="${d.source}" rel="noopener nofollow">Source</a></small></p>` : ''}
                    </div>
                  </li>`
                )}
              </ul>`
          : ''}

        <h2 id="money">Money</h2>
        ${facts([
          { label: 'Tuition, EU/EEA', value: eu ? `${eu.value}${eu.year ? ` *(${eu.year})*` : ''}` : null },
          { label: 'Tuition, non-EU', value: nonEu ? `${nonEu.value}${nonEu.year ? ` *(${nonEu.year})*` : ''}` : null },
          { label: 'Application fee', value: c.costs?.applicationFee },
          { label: 'Living costs', value: living ? `${living.value}${living.year ? ` *(${living.year})*` : ''}` : null },
        ])}
        ${(c.costs?.notes || []).length ? html`<ul>${c.costs.notes.map((n) => html`<li>${n}</li>`)}</ul>` : ''}
        ${c.funding.length
          ? html`<h3>Funding you could actually get</h3>
              <ul>${c.funding.map((f) => html`<li>${f}</li>`)}</ul>`
          : ''}

        ${c.language
          ? html`<h2 id="language">Language</h2>
              ${facts([
                { label: 'English-taught bachelors', value: c.language.englishTaughtBachelors },
                { label: 'Proving your English', value: c.language.englishProof },
                { label: 'Local language needed?', value: c.language.localLanguageRequired === true ? 'Yes, for most programmes' : c.language.localLanguageRequired === false ? 'Not for English-taught programmes' : null },
              ])}
              ${(c.language.notes || []).length ? html`<ul>${c.language.notes.map((n) => html`<li>${n}</li>`)}</ul>` : ''}`
          : ''}

        <h2 id="living">Living there</h2>
        ${facts([
          { label: 'Residency', value: c.residency },
          { label: 'Working', value: c.workRights },
          { label: 'Housing', value: c.housing },
          { label: 'Healthcare', value: c.healthcare },
        ])}

        ${sources(c.sources)}
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
            ${[
              c.whyConsider.length && ['#why', 'Why it might suit you'],
              c.watchOuts.length && ['#watch', 'What to watch for'],
              landscape && ['#landscape', `The shape of ${c.name}'s system`],
              c.ibRecognition && ['#ib', 'How your IB is read'],
              c.application?.steps?.length && ['#apply', 'How applying works'],
              c.deadlines.length && ['#deadlines', 'Deadlines'],
              ['#money', 'Money'],
              c.language && ['#language', 'Language'],
              ['#living', 'Living there'],
              c.institutions.length && ['#institutions', 'Where to study'],
            ]
              .filter(Boolean)
              .map(([h, label]) => html`<li style="padding:.3rem 0"><a href="${h}">${label}</a></li>`)}
          </ul>
        </nav>
      </aside>
    </div>
  </div>
</section>

${c.institutions.length
  ? html`<section class="section section--tinted section--rule">
      <div class="wrap">
        ${sectionHead({
          eyebrow: plural(c.institutions.length, 'institution'),
          title: 'Where to study',
          lede: `A spread of what ${c.name} offers, not a ranking. Check each one's own pages before you apply.`,
          id: 'institutions',
        })}
        <div class="grid grid--3">
          ${c.institutions.map((i) => institutionCard(site, i))}
        </div>
      </div>
    </section>`
  : ''}

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
  });
}

function institutionCard(site, i) {
  const pic = picture(site, i.key);
  const meta = [i.city, i.type].filter(Boolean);
  return card({
    href: i.website || '#',
    external: true,
    title: i.name,
    text: i.note,
    image: pic ? { src: pic.src, alt: pic.alt } : null,
    meta,
    tags: i.englishBachelors ? [truncate(i.englishBachelors, 34)] : null,
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
