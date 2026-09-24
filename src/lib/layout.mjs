import { html, raw, toString } from './html.mjs';

export const SITE = {
  name: 'IB Pathways',
  tagline: 'University routes for IB Diploma students',
  description:
    'Where an IB Diploma can take you: admission requirements, deadlines, costs and English-taught degrees in Denmark, across Europe and around the world. Built for the May 2027 session.',
  author: 'Ikast-Brande Gymnasium',
  locale: 'en',
  cycle: {
    session: 'May 2027',
    intake: 'Autumn 2027',
    label: 'May 2027 IB session · Autumn 2027 entry',
  },
};

/** Set at build time so the same templates work locally and under a project path. */
export let BASE = process.env.SITE_BASE ?? '';

export function setBase(value) {
  BASE = value.replace(/\/$/, '');
}

/** Guides that actually exist in this build, for the footer. */
let GUIDES = [];
export function setGuides(list) {
  GUIDES = list;
}

/** The commit the data came from, surfaced so a result can be traced back. */
let REVISION = '';
export function setRevision(value) {
  REVISION = value || '';
}

/** Root-relative link that respects the GitHub Pages project path. */
export function url(path = '/') {
  if (/^(https?:)?\/\//.test(path) || path.startsWith('mailto:') || path.startsWith('#')) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${p}`;
}

/**
 * `scope` marks a nav item whose tool only covers one Destination. Four of
 * these labels read as site-wide and three of them were not: a student aiming
 * at Utrecht could click "Find a degree", "Check my subjects" or "Preparing"
 * and be given Danish answers, discovering the scope only on reading the lede.
 * Denmark is where this site starts, deliberately — but the starting point has
 * to be visible at the point of entry, not after the click.
 */
const NAV = [
  { href: '/denmark/', label: 'Denmark' },
  { href: '/europe/', label: 'Europe' },
  { href: '/world/', label: 'Worldwide' },
  /* These two are built on Opportunity records, so what they cover is whatever
     has been researched to that depth. The chip used to read "DK" and the
     tooltip "Denmark only"; both were hard-coded and both went stale the day a
     second destination landed. `setScope()` is called once by the build. */
  { href: '/programmes/', label: 'Find a degree', scope: 'opportunities' },
  { href: '/planner/', label: 'Check my subjects', scope: 'opportunities' },
  { href: '/prepare/', label: 'Preparing' },
  { href: '/timeline/', label: 'Deadlines' },
];

/** The nav link's accessible name, which spells out what the chip abbreviates. */
/* What the Opportunity-backed tools actually cover, handed in by the build so
   the navigation cannot claim a scope the records do not support. */
let SCOPE = null;
export function setScope(scope) {
  SCOPE = scope || null;
}

const scopeChip = (n) => (n.scope === 'opportunities' ? SCOPE?.chip : null);
const scopeLong = (n) =>
  n.scope === 'opportunities' && SCOPE ? (SCOPE.complete ? null : `${SCOPE.label} only`) : null;
const navLabel = (n) => {
  const long = scopeLong(n);
  return long ? `${n.label} — ${long}` : n.label;
};

const FOOTER = [
  {
    title: 'Destinations',
    links: [
      { href: '/denmark/', label: 'Denmark' },
      { href: '/europe/', label: 'Europe A–Z' },
      { href: '/world/', label: 'Beyond Europe' },
      { href: '/compare/', label: 'Compare countries' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { href: '/programmes/', label: 'Programme finder' },
      { href: '/planner/', label: 'Subject checker' },
      { href: '/denmark/ib-conversion/', label: 'Grade converter' },
      { href: '/timeline/', label: 'Application calendar' },
    ],
  },
  {
    title: 'Guides',
    links: [
      { href: '/denmark/apply/', label: 'Applying in Denmark' },
      { href: '/denmark/money/', label: 'Money and SU' },
      { href: '/prepare/', label: 'CAS, the EE and what counts' },
    ],
    // Topic guides are appended at build time from whatever is in data/topics,
    // so the footer never links to a guide that was not generated.
    dynamic: 'guides',
  },
  {
    title: 'About',
    links: [
      { href: '/about/', label: 'About this site' },
      { href: '/counsellors/', label: 'For counsellors' },
      { href: '/glossary/', label: 'Glossary' },
      { href: '/faq/', label: 'Questions' },
      { href: '/trust/', label: 'Trust and corrections' },
      { href: '/credits/', label: 'Photo credits' },
    ],
  },
];

function icon(name) {
  const paths = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
  };
  return raw(
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`
  );
}

function mark() {
  // A compass rose reduced to its simplest form — a pointer on a ring.
  return raw(`<svg class="brand__mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="1.6" opacity=".35"/>
  <path d="M16 4.5 20.2 16 16 27.5 11.8 16z" fill="currentColor"/>
  <path d="M16 4.5 11.8 16 16 27.5z" fill="currentColor" opacity=".45"/>
</svg>`);
}

/**
 * Renders a complete page.
 *
 * @param {object} o
 * @param {string} o.title        page title, without the site name
 * @param {string} o.description  meta description
 * @param {string} o.path         the page's own URL path, for canonical + nav state
 * @param {any}    o.body         page content
 * @param {string} [o.section]    which top-level nav item is current
 * @param {string} [o.bodyClass]
 * @param {string[]} [o.scripts]  extra script files from /assets/js/
 * @param {object} [o.jsonLd]
 * @param {string} [o.ogImage]
 */
export function page(o) {
  const title = o.title ? `${o.title} · ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
  const desc = o.description || SITE.description;
  const canonical = o.path || '/';
  // A JPEG, and an absolute address: the places a link gets pasted — Teams,
  // Outlook, Facebook, LinkedIn — show neither SVG nor relative previews.
  // Regenerate with `npm run share-card`.
  const og = o.ogImage || '/assets/img/share-card.jpg';
  const origin = process.env.SITE_ORIGIN || 'https://rktrobinhood.github.io';

  return toString(html`<!doctype html>
<html lang="${SITE.locale}" data-base="${BASE || '/'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="color-scheme" content="light dark">
${REVISION ? raw(`<meta name="data-revision" content="${REVISION}">`) : ''}
<meta name="theme-color" content="#0F302C" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#FBF7F0" media="(prefers-color-scheme: light)">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${o.title || SITE.name}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${/^https?:/.test(og) ? og : origin + url(og)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${origin}${url(canonical)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${url('/assets/img/favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${url('/assets/img/apple-touch-icon.svg')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600&family=Inter:wght@400..700&display=swap">
<link rel="stylesheet" href="${url('/assets/css/site.css')}">
<link rel="stylesheet" href="${url('/assets/css/motion.css')}">
<link rel="stylesheet" href="${url('/assets/css/primitives.css')}">
<script>
  // Applied before first paint so the page never flashes the wrong theme.
  try {
    var t = localStorage.getItem('ibp-theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
    var m = localStorage.getItem('ibp-motion');
    if (m) document.documentElement.setAttribute('data-motion', m);
  } catch (e) {}
</script>
${o.jsonLd ? raw(`<script type="application/ld+json">${JSON.stringify(o.jsonLd)}</script>`) : ''}
</head>
<body class="${o.bodyClass || ''}">
<a class="skip-link" href="#main">Skip to content</a>

<header class="masthead">
  <div class="wrap wrap--wide masthead__inner">
    <a class="brand" href="${url('/')}">${mark()}<span>${SITE.name}</span></a>
    <nav class="nav" aria-label="Main">
      ${NAV.map(
        (n) =>
          html`<a href="${url(n.href)}"${o.section === n.href ? raw(' aria-current="page"') : ''}${
            scopeLong(n) ? raw(` aria-label="${navLabel(n)}" title="${navLabel(n)}"`) : ''
          }>${n.label}${scopeChip(n) ? html`<span class="nav__scope" aria-hidden="true">${scopeChip(n)}</span>` : ''}</a>`
      )}
    </nav>
    <div class="masthead__tools">
      <button class="icon-btn" id="theme-toggle" type="button" aria-label="Switch between light and dark">
        <span class="t-sun">${icon('sun')}</span><span class="t-moon" hidden>${icon('moon')}</span>
      </button>
      <button class="icon-btn nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="drawer" aria-label="Open menu">
        ${icon('menu')}
      </button>
    </div>
  </div>
</header>

<div class="drawer" id="drawer" data-open="false">
  ${NAV.map(
    (n) =>
      html`<a href="${url(n.href)}">${n.label}${
        scopeLong(n) ? html`<span class="nav__scope nav__scope--long">${scopeLong(n)}</span>` : ''
      }</a>`
  )}
  <a href="${url('/about/')}">About this site</a>
  <a href="${url('/counsellors/')}">For counsellors</a>
</div>

<main id="main">
${o.body}
</main>

<footer class="site-foot">
  <div class="wrap wrap--wide">
    <div class="site-foot__grid">
      <div>
        <h2>${SITE.name}</h2>
        <p style="max-width:26ch">${SITE.tagline}. Built for the ${SITE.cycle.session} session.</p>
      </div>
      ${FOOTER.map((col) => {
        const links = col.dynamic === 'guides' ? [...col.links, ...GUIDES] : col.links;
        return html`<div>
        <h3>${col.title}</h3>
        <ul>${links.map((l) => html`<li><a href="${url(l.href)}">${l.label}</a></li>`)}</ul>
      </div>`;
      })}
    </div>
    <div class="site-foot__bar">
      <p style="margin:0">Always confirm details with the university before you apply. Rules change.</p>
      <label class="motion-toggle">
        <input type="checkbox" id="motion-toggle">
        Reduce motion
      </label>
      <p style="margin:0"><a href="${url('/trust/#wrong')}">Something wrong on this page? Tell us</a> · <a href="${url('/credits/')}">Sources &amp; credits</a></p>
    </div>
  </div>
</footer>

<script src="${url('/assets/js/site.js')}" type="module"></script>
${(o.scripts || []).map((s) => html`<script src="${url(`/assets/js/${s}`)}" type="module"></script>`)}
</body>
</html>`);
}

export { canonicalPath };
function canonicalPath(p) {
  return p.endsWith('/') ? p : `${p}/`;
}
