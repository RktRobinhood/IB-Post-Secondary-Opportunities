import { html } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import { discoverSection, DISCOVER_POSTER } from './discover.mjs';
import { posterPreload } from '../lib/primitives.mjs';

/* --- Home ---------------------------------------------------------------- */

/**
 * The home page is the discovery surface:
 * the globe, the three distances, a few filters, and every mapped degree as a
 * photograph beneath them. "Find a degree" in the menu comes here.
 *
 * It used to open on a photo hero, three doors, a reel of named places and a
 * question about what to study, and hand the searching to /programmes/. The
 * owner's verdict on that split: the finder should be the fun, visual thing,
 * and it should be the front page. The reel's photographs are now the cards'
 * own; the doors are the globe's presets; the question is the subject filter.
 * What is left below the cards is the tools, one line each.
 */
export function home(site) {
  const body = html`
${discoverSection(site)}

<section class="section section--tight">
  <div class="wrap">
    <nav aria-label="More ways to plan">
      <ul class="home-tools" role="list">
        <li><a class="arrow-link" href="${url('/timeline/')}">Deadlines</a></li>
        <li><a class="arrow-link" href="${url('/prepare/')}">What counts</a></li>
        <li><a class="arrow-link" href="${url('/compare/')}">Compare countries</a></li>
      </ul>
    </nav>
  </div>
</section>`;

  return page({
    title: null,
    description: SITE.description,
    path: '/',
    section: '/#discover',
    bodyClass: 'page-discover',
    body,
    preload: posterPreload(DISCOVER_POSTER),
    scripts: ['discover.js', 'programme-view.js'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE.name,
      description: SITE.description,
    },
  });
}
