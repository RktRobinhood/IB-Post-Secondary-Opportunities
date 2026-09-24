import { html, raw, md, plural, truncate, listSentence, firstSentence } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import {
  hero, card, note, facts, sources, crumbs, sectionHead, stamp, pager, freshness, sectorLandscape, contextNotes, close, topic,
} from '../lib/components.mjs';
import { picture, money, REGION_ORDER, RESEARCH_DEPTH } from '../lib/data.mjs';
import { worldWindow, evidenceBlock, artDirection, patternLayer, deadlineList } from '../lib/primitives.mjs';
import { representativePoint } from '../lib/geo.mjs';
import { contextFor } from '../lib/canonical.mjs';
import { eventsForDestination } from '../lib/calendar.mjs';
import { groupInstitutions, routeSentence, variationRows } from '../lib/jurisdictions.mjs';

/* Destinations: the Europe and Worldwide indexes, and one page per country. */

/* --- Country cards and indexes -------------------------------------------- */

/**
 * A country as a photograph with its name on it: the place, the one-line
 * tagline, how many universities, and how far the research has got. Fees,
 * language and the rest are on the country page — a card that tried to carry
 * them cut each one off mid-sentence.
 */
function countryTile(site, c) {
  const pic = picture(site, c.code, { prefer: 'commons' });

  // Coverage here is uneven and looks uniform, which is the worst combination,
  // so every tile still says which of the three depths it is — in the count
  // line, where it costs four words rather than a pill.
  const d = c.researchDepth;
  const hasProgrammes = [...(site.graph?.opportunities?.values() || [])].some((o) => o.destination === c.code);
  const depth = d.tier === 'researched' && hasProgrammes ? 'Programmes recorded' : RESEARCH_DEPTH[d.tier].label;

  return html`<li><a class="tile tile--place${pic ? '' : ' tile--bare'}" href="${url(c.href)}">
    ${pic ? html`<img class="tile__img" src="${url(pic.src)}" alt="${pic.alt || ''}" loading="lazy" decoding="async" width="800" height="600">` : ''}
    <span class="tile__text">
      <span class="tile__name">${c.name}</span>
      ${c.tagline ? html`<span class="tile__line">${c.tagline}</span>` : ''}
      <span class="tile__where">${plural(c.institutions.length, 'university', 'universities')} · ${depth}</span>
    </span>
  </a></li>`;
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
function researchDepthNote(c, { freshnessNote = '', events = null } = {}) {
  const d = c.researchDepth;
  // Counted from the same dates the calendar below shows — the profile's own
  // entries and the application routes' milestones together — so the line and
  // the calendar cannot disagree about how many there are.
  const total = events ? events.length : d.deadlines;
  const undated = events ? events.filter((e) => !e.date).length : d.undated;
  const meta = RESEARCH_DEPTH[d.tier];
  const counts = [
    `${plural(d.sources, 'source')} recorded for ${plural(d.institutions, 'institution')} listed`,
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

/** A country's position on the map: the one of its own places nearest the
    rest (src/lib/geo.mjs). The mean of its places used to be used, and the
    mean of Canada's campuses is in Minnesota. */
export function centroid(c) {
  return representativePoint(c.places?.map((p) => p.coordinates).filter(Boolean) || []);
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
      country: c.code,
      // The picture its own tile already shows, for the globe's card.
      image: (() => { const p = picture(site, c.code, { prefer: 'commons' }); return p && !p.external ? p.src : ''; })(),
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
  // Other countries on the page, one after another, each named.
  slides: list
    .filter((c) => c.code !== heroKey)
    .map((c) => ({ c, p: picture(site, c.code, { prefer: 'commons' }) }))
    .filter(({ p }) => p?.src && !p.external)
    .slice(0, 5)
    .map(({ c, p }) => ({ src: url(p.src), caption: c.name, credit: p.credit || null })),
})}

${/* The countries first, as photographs; the map after them, for anyone who
     thinks in distances. */ ''}
<section class="section section--tight">
  <div class="wrap wrap--wide">
    ${regions.map(
      (region) => html`
      <div class="region">
        <h2 class="region__name">${regionHeadline(region)}</h2>
        <ul class="tiles" role="list">
          ${byRegion.get(region).sort((a, b) => a.name.localeCompare(b.name)).map((c) => countryTile(site, c))}
        </ul>
      </div>`
    )}
  </div>
</section>

${mapPlaces.length
  ? html`<section class="section section--tinted">
      <div class="wrap wrap--wide">
        <h2 class="region__name">On the map</h2>
        ${worldWindow({
          places: mapPlaces,
          id: `index-${scope}`,
          unit: 'institution',
          activeLayer: 'Destinations covered',
          caption: 'Each light is a destination. Follow one, or read down the list.',
        })}
      </div>
    </section>`
  : ''}

${close({
  title: 'Two or three in mind?',
  copy: 'Put their fees, language and deadlines side by side.',
  invitation: { href: '/compare/', label: 'Compare destinations' },
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
    lede: 'Where the English-taught degrees are, and what each country asks of your IB.',
    path: '/europe/',
    heroKey: 'it',
  });
}

export function worldIndex(site) {
  return countryIndex(site, {
    scope: 'worldwide',
    eyebrow: `${site.world.length} countries`,
    title: 'Beyond Europe',
    lede: 'Systems that know the IB well — most with international fees to match.',
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
      // The institution's own site, which is where its card on this page goes
      // too. It leaves the site, so it opens in a new tab (site.js).
      href: i.website || null,
      external: !!i.website,
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
      events,
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
        ${/* The short version is one sentence. Summaries run to a hundred words,
              and the rest of it is one tap down rather than cut. */ ''}
        <p class="lede">${summaryLead}</p>
        ${summaryRest
          ? html`<details class="topic__more"><summary>More on ${c.name}</summary>
              <div class="topic__body"><p>${summaryRest}</p></div></details>`
          : ''}
        ${topics}
      </div>

      <aside class="layout-aside__side stack">
        ${stamp(c.dataAsOf)}
        ${facts([
          { label: 'Capital', value: c.capital },
          { label: 'Currency', value: c.currency },
          { label: 'EU member', value: c.eu === true ? 'Yes' : c.eu === false ? 'No' : null },
          { label: 'EEA / fee status', value: c.eea === true ? 'EU/EEA — EU/EEA citizens usually pay the home-student rate' : null },
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
