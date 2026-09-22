import { html, raw, md, plural, truncate, listSentence } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import {
  hero, card, note, stats, facts, sources, crumbs, sectionHead,
  tags, stamp, dataTable, emptyState, pager, accordion,
} from '../lib/components.mjs';
import { picture, money, REGION_ORDER } from '../lib/data.mjs';

/* --- Home ---------------------------------------------------------------- */

export function home(site) {
  const heroPic = picture(site, 'dk-ku') || picture(site, 'se') || picture(site, 'de');
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

  return card({
    href: c.href,
    title: c.name,
    text: c.tagline || truncate(c.summary, 130),
    image: pic ? { src: pic.src, alt: pic.alt } : null,
    flag: c.flag,
    meta,
    tags: englishOffer ? [truncate(englishOffer, 36)] : null,
  });
}

function countryIndex(site, { scope, title, lede, eyebrow, path: pagePath, heroKey }) {
  const list = scope === 'europe' ? site.europe : site.world;
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
  const pic = picture(site, c.code, { prefer: 'commons' });
  const eu = money(c.costs?.tuitionEuEea);
  const nonEu = money(c.costs?.tuitionNonEu);
  const living = money(c.costs?.livingCostMonthly);

  const body = html`
${hero({
  eyebrow: `${c.flag} ${c.region}`,
  title: c.name,
  lede: c.tagline,
  image: pic ? { src: pic.src, alt: pic.alt, credit: pic.credit, focal: '50% 45%' } : null,
  variant: pic ? undefined : 'plain',
})}

<section class="section">
  <div class="wrap">
    ${crumbs([
      { href: c.scope === 'europe' ? '/europe/' : '/world/', label: c.scope === 'europe' ? 'Europe' : 'Worldwide' },
      { label: c.name },
    ])}
    <div class="layout-aside">
      <div class="prose">
        <p class="lede">${c.summary}</p>

        ${c.whyConsider.length
          ? html`<h2 id="why">Why it might suit you</h2>
              <ul class="ticks">${c.whyConsider.map((x) => html`<li>${x}</li>`)}</ul>`
          : ''}

        ${c.watchOuts.length
          ? html`<h2 id="watch">What to watch for</h2>
              <ul class="crosses">${c.watchOuts.map((x) => html`<li>${x}</li>`)}</ul>`
          : ''}

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
                : ''}`
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
                    <div class="timeline__when">${d.date}${d.year ? html`<br><small>${d.year}</small>` : ''}</div>
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
</section>`;

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
  const rows = site.countries
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => {
      const eu = money(c.costs?.tuitionEuEea);
      const living = money(c.costs?.livingCostMonthly);
      // Some deadlines are recorded with a year but no date yet, and some the
      // other way round. Only show what is actually there.
      const firstDeadline = c.deadlines.find((d) => d && (d.date || d.year));
      return [
        html`<a href="${url(c.href)}">${c.flag} ${c.name}</a>`,
        c.scope === 'europe' ? c.region : `${c.region} (worldwide)`,
        truncate(c.language?.englishTaughtBachelors || '—', 46),
        eu ? truncate(eu.value, 44) : '—',
        living ? truncate(living.value, 30) : '—',
        firstDeadline
          ? [firstDeadline.date, firstDeadline.year ? `(${firstDeadline.year})` : null].filter(Boolean).join(' ')
          : '—',
      ];
    });

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Side by side',
  title: 'Compare every destination',
  lede: 'One screen, every country. Tuition is what an EU/EEA citizen pays — for most of you, that is the number that counts.',
})}

<section class="section">
  <div class="wrap wrap--wide">
    ${note(
      `Tuition and living costs come from different sources with different years attached, so read this as a
      rough ordering rather than a precise comparison. Each country page carries the exact figure, its year
      and its source.`,
      { title: 'Read this first' }
    )}
    ${dataTable({
      caption: `${site.countries.length} destinations, sorted alphabetically`,
      head: ['Country', 'Region', 'English-taught bachelors', 'Tuition (EU/EEA)', 'Living cost', 'First deadline'],
      rows,
    })}
  </div>
</section>`;

  return page({
    title: 'Compare destinations',
    description: 'Tuition, living costs, English-taught provision and application deadlines for every country on IB Pathways.',
    path: '/compare/',
    body,
  });
}
