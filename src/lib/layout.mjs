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
 * Four items, one per question a student brings: where, what, when, and what
 * matters (docs/research/ia/nav-audit.md). It used to be seven — Denmark,
 * Europe and Worldwide were three items on one axis and two of them one
 * template; "Check my subjects" filtered the same list as "Find a degree";
 * "Preparing" was called three other things elsewhere. Each label here is the
 * page's own name: its H1 eyebrow, its footer link and its home-page link say
 * the same word (docs/adr/0006-four-task-navigation.md).
 *
 * `line` is what the phone menu says under the label: a drawer can afford one
 * line, a desktop bar cannot.
 *
 * `scope` marks an item built on Opportunity records, so what it covers is
 * whatever has been researched to that depth. The tooltip and accessible name
 * say so; `setScope()` is called once by the build, from the records.
 */
const NAV = [
  {
    href: '/countries/',
    label: 'Countries',
    line: 'Where the English-taught degrees are, from right here to the other side of the world.',
  },
  {
    href: '/programmes/',
    label: 'Find a degree',
    scope: 'opportunities',
    line: 'Every mapped degree, by subject and place.',
  },
  { href: '/timeline/', label: 'Deadlines', line: 'The next dates that apply to you, in order.' },
  {
    href: '/prepare/',
    label: 'What counts',
    line: 'Subjects, grades, CAS, the EE and tests: what decides, what is weighed, what changes nothing.',
  },
];

/* For the adults. Set apart from the student items — right-aligned on a
   desktop, below a rule in the drawer — the way Common App and UCAS keep their
   counsellor links out of the student journey. */
const QUIET = [{ href: '/counsellors/', label: 'For counsellors' }];

/* A URL that stopped being a page is still a section a page can claim while its
   module catches up: the subject checker is part of Find a degree. */
const RETIRED = { '/planner/': '/programmes/' };

/**
 * Which menu item a page is inside.
 *
 * A page says its `section`. If that names a menu item, that item. If it names
 * a retired one, where it went. Otherwise the section is a place — a
 * Destination's own hub or the region index it used to sit under — and every
 * place is under Countries. That last rule names no country: a Destination
 * that earns a hub of its own tomorrow is under Countries without a line here.
 */
export function currentNav(section) {
  if (!section) return '';
  const all = [...NAV, ...QUIET];
  if (all.some((n) => n.href === section)) return section;
  if (RETIRED[section]) return RETIRED[section];
  return '/countries/';
}

/* The three ways into Countries, at the distance a student reads them: where
   they are, what is near, and the rest. Handed in by the build from the
   records (`distanceDoors()` in src/pages/destinations.mjs), so the menu, the
   home page and the Countries page name them identically. */
let PLACES = [];
export function setPlaces(list) {
  PLACES = list || [];
}

/** The nav link's accessible name, which spells out what the chip abbreviates. */
/* What the Opportunity-backed tools actually cover, handed in by the build so
   the navigation cannot claim a scope the records do not support. */
let SCOPE = null;
export function setScope(scope) {
  SCOPE = scope || null;
}

/* A feedback link shown on every page while the site is being tried out with
   students and counsellors. Set in data/site-config.json under `feedback`;
   with no `url` there, nothing renders. */
let FEEDBACK = null;
export function setFeedback(feedback) {
  FEEDBACK = feedback?.url ? feedback : null;
}

/* The scope is said in the accessible name and the tooltip, and on the pages
   themselves. A visible chip in the masthead read as clutter, not as honesty. */
const scopeLong = (n) =>
  n.scope === 'opportunities' && SCOPE ? (SCOPE.complete ? null : `${SCOPE.label} only`) : null;
const navLabel = (n) => {
  const long = scopeLong(n);
  return long ? `${n.label} — ${long}` : n.label;
};

/* The footer uses the menu's own words for the menu's own pages, so no page
   is reached by three different names. The places come from `setPlaces()`. */
const FOOTER = [
  {
    title: 'Countries',
    links: [
      { href: '/countries/', label: 'Countries' },
      { places: true },
      { href: '/compare/', label: 'Compare countries' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { href: '/programmes/', label: 'Find a degree' },
      { href: '/planner/', label: 'Check my subjects' },
      { href: '/denmark/ib-conversion/', label: 'Grade converter' },
      { href: '/timeline/', label: 'Deadlines' },
    ],
  },
  {
    title: 'Guides',
    links: [
      { href: '/prepare/', label: 'What counts' },
      { href: '/denmark/apply/', label: 'Applying in Denmark' },
      { href: '/denmark/money/', label: 'Money and SU' },
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
  const here = currentNav(o.section);
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
          html`<a href="${url(n.href)}"${here === n.href ? raw(' aria-current="page"') : ''}${
            scopeLong(n) ? raw(` aria-label="${navLabel(n)}" title="${navLabel(n)}"`) : ''
          }>${n.label}</a>`
      )}
      ${QUIET.map(
        (n) =>
          html`<a class="nav__quiet" href="${url(n.href)}"${here === n.href ? raw(' aria-current="page"') : ''}>${n.label}</a>`
      )}
    </nav>
    <div class="masthead__tools">
      <button class="icon-btn" id="theme-toggle" type="button" aria-label="Switch between light and dark">
        <span class="t-sun">${icon('sun')}</span><span class="t-moon" hidden>${icon('moon')}</span>
      </button>
      <button class="icon-btn nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="drawer">
        ${icon('menu')}<span class="nav-toggle__text">Menu</span>
      </button>
    </div>
  </div>
</header>

${/* The phone menu: the four items, each with its one line, and the three
     ways into Countries as chips under it, so the place a student goes most
     is still one tap away. Then the adults' links below a rule. */ ''}
<nav class="drawer" id="drawer" data-open="false" aria-label="Menu">
  <ul class="drawer__list" role="list">
    ${NAV.map(
      (n) => html`<li class="drawer__row">
        <a class="drawer__item" href="${url(n.href)}"${here === n.href ? raw(' aria-current="page"') : ''}${
          scopeLong(n) ? raw(` aria-label="${navLabel(n)}"`) : ''
        }>
          <span class="drawer__label">${n.label}</span>
          <span class="drawer__line">${n.line}</span>
        </a>
        ${n.href === '/countries/' && PLACES.length
          ? html`<ul class="drawer__places" role="list">${PLACES.map(
              (p) => html`<li><a class="chip" href="${url(p.href)}">${p.label}</a></li>`
            )}</ul>`
          : ''}
      </li>`
    )}
  </ul>
  <ul class="drawer__quiet" role="list">
    ${QUIET.map((n) => html`<li><a href="${url(n.href)}"${here === n.href ? raw(' aria-current="page"') : ''}>${n.label}</a></li>`)}
    <li><a href="${url('/about/')}">About this site</a></li>
    <li><a href="${url('/trust/#wrong')}">Something wrong?</a></li>
  </ul>
</nav>

${FEEDBACK
  ? html`<aside class="feedback-bar" aria-label="Feedback">
      <div class="wrap wrap--wide">
        <span>${FEEDBACK.message || 'This is a preview.'}</span>
        <a href="${FEEDBACK.url}" rel="noopener">${FEEDBACK.label || 'Tell us what you think'}</a>
      </div>
    </aside>`
  : ''}
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
        const links = (col.dynamic === 'guides' ? [...col.links, ...GUIDES] : col.links).flatMap((l) => (l.places ? PLACES : [l]));
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

/**
 * A page that moved. GitHub Pages cannot answer with a 301, so the old URL
 * gets this stub: a meta refresh for anything without JavaScript, a canonical
 * link and noindex for search engines, and a script that replaces the location
 * rather than adding to history — Back from the new page goes to wherever the
 * student was before, not to this stub — keeping the query and the anchor, so
 * a saved link with state in it still lands with that state.
 *
 * `scripts/check.mjs` recognises these by the refresh and fails any page that
 * links to one: internal links go straight to the new address.
 *
 * @param {string} to       the new root-relative address, optionally with a #hash
 * @param {string} title    what the page is now called
 */
export function redirectPage(to, title) {
  const [pathPart, hash = ''] = to.split('#');
  const target = url(pathPart);
  const origin = process.env.SITE_ORIGIN || 'https://rktrobinhood.github.io';
  return `<!doctype html>
<html lang="${SITE.locale}" data-base="${BASE || '/'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · ${SITE.name}</title>
<meta name="description" content="This page moved to ${title}. You are being taken there now.">
<meta name="robots" content="noindex">
<link rel="canonical" href="${origin}${target}${hash ? '#' + hash : ''}">
<meta http-equiv="refresh" content="0; url=${target}${hash ? '#' + hash : ''}">
<script>
  (function () {
    var hash = location.hash || ${JSON.stringify(hash ? '#' + hash : '')};
    location.replace(${JSON.stringify(target)} + location.search + hash);
  })();
</script>
</head>
<body>
<main id="main">
<h1>This page moved</h1>
<p><a href="${target}${hash ? '#' + hash : ''}">${title}</a></p>
</main>
</body>
</html>
`;
}

export { canonicalPath };
function canonicalPath(p) {
  return p.endsWith('/') ? p : `${p}/`;
}
