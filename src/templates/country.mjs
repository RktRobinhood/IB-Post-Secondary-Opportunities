import { html, raw, md, plural } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import { hero, card, stats, crumbs, sectionHead, topic, pager, stamp } from '../lib/components.mjs';

/**
 * The country page: one template for every country, Denmark included.
 *
 * The site's three levels — country, university, programme — are one template
 * each (src/templates/). Denmark's canonical records and every other
 * country's profile are turned into the view model below by their adapters
 * (src/pages/denmark.mjs, src/pages/destinations.mjs); the page is drawn only
 * here, so every country looks the same with its own pictures, universities
 * and answers. A slot with nothing in it is left out. scripts/test-templates.mjs
 * fails the build if a country page was not drawn here or its slots moved.
 *
 * Slots, in order:
 *   hero      the place: photograph, name, one line, two ways on
 *   stats     four numbers
 *   places    trail, a warning if the page is only a sketch, the universities
 *             as cards (in groups where the way you apply differs), the map
 *   details   "How it works": one line, then each question as a short answer,
 *             beside the rail (checked date, how far it was researched, where
 *             to go next, on this page)
 *   pager     previous and next country
 *
 * @param {object} vm
 * @param {string} [vm.artStyle]  the country's accent (artDirection().style)
 * @param {object} vm.hero        hero() options; `region` (the eyebrow reads "region · cycle"),
 *                                `actions` as [{ href, label }]
 * @param {Array}  vm.stats       [{ value, label }] — shown when two or more
 * @param {Array}  vm.crumbs      crumbs() trail, without Home
 * @param {any}    [vm.notice]    shown before the cards (a sketch says so first)
 * @param {object} vm.places      { count, lede, groups: [{ name, route, routeHref, more, cards }], footnote, map }
 *                                each card { href, name, shortName, text, image, meta }
 * @param {object} vm.details     { lede, more, adjective, topics } — `topics` is keyed by
 *                                the slots in TOPICS ({ short, body, more } each); the
 *                                template owns every heading and the order, so every
 *                                country asks the same questions
 * @param {object} vm.rail        { checked, notice, deeper: [{ href, label }] }
 * @param {object} [vm.pager]     { prev, next }
 * @param {object} vm.page        { title, description, path, section, scripts }
 */
/** The questions every country page answers, in order. A country without an
    answer to one leaves it out; none adds its own. */
export const TOPICS = [
  ['why', 'Why it might suit you'],
  ['watch', 'What to watch for'],
  ['ib', 'How your IB is read'],
  ['subjects', 'How your subjects count'],
  ['apply', 'How and when you apply'],
  ['dates', 'Deadlines'],
  ['selection', 'How places are decided'],
  ['system', 'The shape of the system'],
  ['money', 'Money'],
  ['language', 'Language'],
  ['living', 'Living there'],
  ['citizens', 'If you are a citizen'],
  ['context', 'What it is actually like'],
  ['sources', 'Sources'],
];

export function countryTemplate(vm) {
  const placeCard = (i) =>
    card({
      href: i.href,
      title: i.shortName && !i.name.startsWith(i.shortName) ? `${i.shortName} — ${i.name}` : i.name,
      text: i.text,
      image: i.image || null,
      placeholder: i.shortName || i.name,
      meta: (i.meta || []).filter(Boolean),
    });
  const grid = (cards) => html`<div class="grid grid--3 grid--places">${cards.map(placeCard)}</div>`;
  const groups = vm.places.groups.filter((g) => g.cards.length);
  const given = vm.details.topics || {};
  const topics = TOPICS.filter(([slot]) => given[slot]).map(([slot, title]) => ({
    ...given[slot],
    id: slot,
    title: slot === 'citizens' && vm.details.adjective ? `If you are ${vm.details.adjective}` : title,
  }));
  const toc = [
    groups.length && ['#institutions', 'Where you can study'],
    ['#how', 'How it works'],
    ...topics.map((t) => [`#${t.id}`, t.title]),
  ].filter(Boolean);

  const body = html`
${vm.artStyle ? raw(`<div class="art" style="${vm.artStyle}">`) : ''}
${hero({
  ...vm.hero,
  // One eyebrow for every country: where it is, and the admission cycle.
  eyebrow: [vm.hero.region, SITE.cycle.label].filter(Boolean).join(' · '),
  actions: vm.hero.actions?.length
    ? html`${vm.hero.actions.map((a, i) => html`<a class="btn ${i ? 'btn--ghost' : 'btn--primary'}" href="${url(a.href)}">${a.label}</a>`)}`
    : null,
})}

${vm.stats.length >= 2
  ? html`<section class="section section--tinted section--tight" data-slot="stats">
      <div class="wrap">${stats(vm.stats.slice(0, 4))}</div>
    </section>`
  : ''}

<section class="section" data-slot="places">
  <div class="wrap">
    ${crumbs(vm.crumbs)}
    ${vm.notice || ''}
    ${groups.length
      ? html`${sectionHead({
          eyebrow: plural(vm.places.count, 'institution'),
          title: 'Where you can study in English',
          lede: vm.places.lede || null,
          id: 'institutions',
        })}
        ${groups.length === 1 && !groups[0].name
          ? grid(groups[0].cards)
          : groups.map((g) => html`<section class="jgroup">
              <header class="jgroup__head">
                <h3 class="jgroup__name">${g.name}</h3>
                ${g.route
                  ? html`<p class="jgroup__route">${g.routeHref ? html`<a href="${g.routeHref}" rel="noopener nofollow">${g.route}</a>` : g.route}</p>`
                  : html`<p class="jgroup__route jgroup__route--none">No application route recorded for ${g.name} yet — check each institution's own admissions page.</p>`}
              </header>
              ${g.more ? html`<details class="jgroup__more"><summary>How applying differs</summary>${g.more}</details>` : ''}
              ${grid(g.cards)}
            </section>`)}`
      : ''}
    ${vm.places.footnote || ''}
    ${vm.places.map ? html`<div class="dest-open__map">${vm.places.map}</div>` : ''}
  </div>
</section>

<section class="section section--tinted section--rule" data-slot="details">
  <div class="wrap">
    <div class="layout-aside">
      <div class="prose">
        <h2 id="how">How it works</h2>
        ${vm.details.lede ? html`<p class="lede">${vm.details.lede}</p>` : ''}
        ${vm.details.more
          ? html`<details class="topic__more"><summary>More on ${vm.hero.title}</summary>
              <div class="topic__body"><p>${vm.details.more}</p></div></details>`
          : ''}
        ${topics.map((t) => topic(t))}
      </div>
      <aside class="layout-aside__side stack">
        ${stamp(vm.rail.checked)}
        ${vm.rail.notice || ''}
        ${vm.rail.deeper?.length
          ? html`<nav aria-label="Go deeper">
              <p class="eyebrow eyebrow--plain">Go deeper</p>
              <ul class="side-links">${vm.rail.deeper.map((l) => html`<li><a href="${url(l.href)}">${l.label}</a></li>`)}</ul>
            </nav>`
          : ''}
        <nav aria-label="On this page">
          <p class="eyebrow eyebrow--plain">On this page</p>
          <ul class="side-links">${toc.map(([h, label]) => html`<li><a href="${h}">${label}</a></li>`)}</ul>
        </nav>
      </aside>
    </div>
  </div>
</section>

${vm.pager?.prev || vm.pager?.next
  ? html`<section class="section section--pager" data-slot="pager">
      <div class="wrap">${pager(vm.pager)}</div>
    </section>`
  : ''}
${vm.artStyle ? raw('</div>') : ''}`;

  return page({ ...vm.page, body, template: 'country' });
}
