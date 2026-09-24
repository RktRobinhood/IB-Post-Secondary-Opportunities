import { html, plural } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import { hero, doors, reel, toolkit } from '../lib/components.mjs';
import { picture, REGION_ORDER } from '../lib/data.mjs';
import { filterQuestion } from '../lib/primitives.mjs';

/* The home page: photographs, three doors, a reel of places, then the tools. */

/* --- Home ---------------------------------------------------------------- */

/**
 * The home page sells the trip before it hands over the paperwork.
 *
 * Order, top to bottom: photographs of real universities; three doors —
 * Denmark, Europe, Worldwide — at equal weight; a reel of named places a
 * student could picture themselves in; one question about what they want to
 * study; and only then the tools. Every block is a picture or a list of ways
 * in, and no block carries more than one sentence of copy. The detail is on
 * the page each of them opens, one click away — that is where it belongs.
 *
 * Denmark is the first door, not the whole page. Most readers are at a Danish
 * school and will look there anyway; what they have not yet seen is how much
 * else is open to them, which is the thing this page exists to show.
 */
export function home(site) {
  const dk = site.dkInstitutions.filter((i) => i.programmes?.length);
  const dkProgrammes = dk.reduce((n, i) => n + i.programmes.length, 0);
  const europeInstitutions = site.europe.reduce((n, c) => n + c.institutions.length, 0);
  const worldInstitutions = site.world.reduce((n, c) => n + c.institutions.length, 0);

  // Which photographs open the hero and each door is an editorial decision,
  // recorded in data/site-config.json rather than here, and chosen so that no
  // picture on this page appears twice. The reel then skips all of them.
  const photo = (key) => {
    const p = key ? picture(site, key, { prefer: 'commons' }) : null;
    return p && !p.external ? p : null;
  };
  const choices = site.config?.homeDoors || {};
  const doorImages = {
    denmark: photo(choices.denmark?.image),
    europe: photo(choices.europe?.image),
    world: photo(choices.world?.image),
  };
  const heroImages = (choices.hero || []).map(photo).filter(Boolean);
  const places = showcase(
    site,
    new Set([...Object.values(doorImages), ...heroImages].map((p) => p?.src).filter(Boolean))
  );

  const fieldCounts = new Map();
  for (const p of site.programmes) {
    if (p.field) fieldCounts.set(p.field, (fieldCounts.get(p.field) || 0) + 1);
  }
  const fields = [...fieldCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const [first, ...rest] = heroImages;

  const body = html`
${hero({
  variant: 'arrival',
  eyebrow: SITE.cycle.label,
  title: 'Your IB is a passport. This is the map.',
  lede: 'English-taught degrees in Denmark, across Europe and around the world.',
  image: first ? { src: first.src, alt: first.alt, credit: first.credit } : null,
  slides: rest.map((p) => ({ src: url(p.src), caption: null, credit: p.credit || null })),
  invitation: { href: '#where', label: 'Where could I go?' },
  escape: { href: '/programmes/', label: 'Or search every degree' },
})}

<section class="section section--doors" id="where">
  <div class="wrap wrap--wide">
    ${doors([
      {
        href: '/denmark/',
        eyebrow: 'Denmark',
        title: 'Close to home',
        count: `${plural(dkProgrammes, 'degree')} in English · ${plural(dk.length, 'university', 'universities')}`,
        line: 'Every one checked subject by subject.',
        image: doorImages.denmark,
      },
      {
        href: '/europe/',
        eyebrow: 'Europe',
        title: 'A short flight away',
        count: `${plural(site.europe.length, 'country', 'countries')} · ${plural(europeInstitutions, 'university', 'universities')}`,
        line: 'From Dublin to Athens.',
        image: doorImages.europe,
      },
      {
        href: '/world/',
        eyebrow: 'Worldwide',
        title: 'As far as you like',
        count: `${plural(site.world.length, 'country', 'countries')} · ${plural(worldInstitutions, 'university', 'universities')}`,
        line: 'From Toronto to Singapore.',
        image: doorImages.world,
      },
    ])}
  </div>
</section>

<section class="section section--reel">
  <div class="wrap wrap--wide">
    <header class="reel-head">
      <h2>Picture yourself here</h2>
    </header>
  </div>
  ${reel(places)}
</section>

<section class="section section--tinted">
  <div class="wrap">
    ${filterQuestion({
      id: 'home-field',
      question: 'What do you want to study?',
      field: 'field',
      type: 'links',
      help: `${plural(site.programmes.length, 'degree')} mapped to the subject so far.`,
      options: fields.map(([label, count]) => ({
        value: label,
        label,
        count,
        href: `/programmes/?field=${encodeURIComponent(label)}`,
      })),
    })}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="toolkit-head">When you are ready</h2>
    ${toolkit([
      { href: '/planner/', title: 'Check my subjects', line: 'Your six subjects against every mapped degree.' },
      { href: '/timeline/', title: 'Every deadline', line: 'Some close before you have predicted grades.' },
      { href: '/prepare/', title: 'What counts', line: 'CAS, the EE, tests: required, weighed, or neither.' },
      { href: '/compare/', title: 'Compare countries', line: 'Fees, language and dates side by side.' },
    ])}
    <p class="small-print">Every figure carries its date and source. Confirm anything that matters at the source.
      <a href="${url('/about/')}">How this is built</a> · <a href="${url('/trust/')}">Something wrong?</a></p>
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

/**
 * The places the home page shows: named universities with a photograph,
 * spread across Denmark, Europe and the rest of the world.
 *
 * Chosen for spread and nothing else. One Destination from each region (the
 * one with the most institutions recorded, so the choice follows the records),
 * and from it one institution that teaches bachelor's degrees in English and
 * has a self-hosted photograph — the one the most IB transcripts go to, which
 * is a fact about where IB students go, not a judgement of the place. Denmark
 * contributes its institutions with the most English-taught degrees. The same
 * set comes back on every build.
 */
function showcase(site, exclude = new Set()) {
  const photo = (key) => {
    const p = picture(site, key, { prefer: 'commons' });
    return p && !p.external && !exclude.has(p.src) ? p : null;
  };

  const denmark = site.dkInstitutions
    .filter((i) => i.programmes?.length && photo(i.id))
    .sort((a, b) => b.programmes.length - a.programmes.length || a.name.localeCompare(b.name))
    .map((i) => ({
      scope: 'denmark',
      name: i.name,
      where: `${i.city}, Denmark`,
      flag: '🇩🇰',
      href: i.href,
      image: photo(i.id),
    }));

  const fromRegions = (list, scope) => {
    const byRegion = new Map();
    for (const c of list) {
      const best = byRegion.get(c.region);
      if (!best || c.institutions.length > best.institutions.length) byRegion.set(c.region, c);
    }
    const order = (r) => (REGION_ORDER.indexOf(r) + 99) % 99;
    return [...byRegion.values()]
      .sort((a, b) => order(a.region) - order(b.region) || a.name.localeCompare(b.name))
      .map((c) => {
        const i = c.institutions
          .filter((x) => x.englishBachelors && photo(x.key))
          .sort((a, b) => (b.ibRecognitionStatement?.transcripts5y || 0) - (a.ibRecognitionStatement?.transcripts5y || 0))[0];
        return i
          ? {
              scope,
              name: i.name,
              where: `${i.city ? `${i.city}, ` : ''}${c.name}`,
              flag: c.flag,
              href: `${c.href}#institutions`,
              image: photo(i.key),
            }
          : null;
      })
      .filter(Boolean);
  };

  const europe = fromRegions(site.europe, 'europe');
  const world = fromRegions(site.world, 'world');

  // Interleaved, so no stretch of the reel is all one place.
  const out = [];
  const queues = [europe, world, denmark];
  while (queues.some((q) => q.length) && out.length < 12) {
    for (const q of queues) if (q.length && out.length < 12) out.push(q.shift());
  }
  return out;
}
