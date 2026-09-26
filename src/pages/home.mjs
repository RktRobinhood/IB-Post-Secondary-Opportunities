import { html } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import { toolkit } from '../lib/components.mjs';
import { discoverSection, DISCOVER_POSTER } from './discover.mjs';
import { posterPreload } from '../lib/primitives.mjs';

/* --- Home ---------------------------------------------------------------- */

/**
 * The home page is the discovery surface (docs/research/ia/plan.md, Batch D):
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
    ${toolkit([
      { href: '/timeline/', title: 'Deadlines', line: 'Some close before you have predicted grades.' },
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
    section: '/#discover',
    bodyClass: 'page-discover',
    body,
    preload: posterPreload(DISCOVER_POSTER),
    scripts: ['discover.js'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE.name,
      description: SITE.description,
    },
  });
}
