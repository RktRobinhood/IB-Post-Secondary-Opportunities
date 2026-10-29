import { html, raw, md, plural, firstSentence } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import { hero, card, stats, crumbs, sectionHead, topic, topicHasContent, pager, stamp } from '../lib/components.mjs';
import { nationalSourcesPanel } from '../lib/national-sources.mjs';

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
 * @param {object} [vm.nationalSources] National catalogues and imported listing groups.
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
/** The questions every country page answers, in order, in three bands. A
    country without an answer to one leaves it out; none adds its own. */
export const TOPICS = [
  ['why', 'Why it might suit you', 'choose'],
  ['watch', 'What to watch for', 'choose'],
  ['context', 'What it is actually like', 'choose'],
  ['system', 'The shape of the system', 'choose'],
  ['ib', 'How your IB is read', 'in'],
  ['subjects', 'How your subjects count', 'in'],
  ['apply', 'How and when you apply', 'in'],
  ['dates', 'Deadlines', 'in'],
  ['selection', 'How places are decided', 'in'],
  ['language', 'Language', 'in'],
  ['money', 'Money', 'life'],
  ['living', 'Living there', 'life'],
  ['citizens', 'If you are a citizen', 'life'],
  ['sources', 'Sources', 'end'],
];
/** Fewer places than this and the cards say it all. */
const MAP_FROM = 4;
const BANDS = { choose: 'Is it for you?', in: 'Getting in', life: 'Money and life' };

export function countryTemplate(vm) {
  const placeCard = (i) =>
    card({
      href: i.href,
      title: i.shortName && !i.name.startsWith(i.shortName) ? `${i.shortName} — ${i.name}` : i.name,
      text: i.text ? firstSentence(i.text, 14) : null,
      image: i.image || null,
      placeholder: i.shortName || i.name,
      meta: (i.meta || []).filter(Boolean),
    });
  const grid = (cards) => html`<div class="grid grid--3 grid--places">${cards.map(placeCard)}</div>`;
  const groups = vm.places.groups.filter((g) => g.cards.length);
  const given = vm.details.topics || {};
  const titleOf = (slot, title) => (slot === 'citizens' && vm.details.adjective ? `If you are ${vm.details.adjective}` : title);
  const topics = TOPICS.filter(([slot]) => topicHasContent(given[slot])).map(([slot, title, band]) => ({
    ...given[slot],
    id: slot,
    band,
    title: titleOf(slot, title),
  }));
  const inBand = (b) => topics.filter((t) => t.band === b).length;
  const banded = topics.map((t, i) => html`${t.band !== topics[i - 1]?.band && BANDS[t.band] && inBand(t.band) > 1
    ? html`<h2 class="topic-band" id="band-${t.band}">${BANDS[t.band]}</h2>`
    : ''}${topic(t)}`);
  const toc = [
    groups.length && ['#institutions', 'Where you can study'],
    (vm.details.lede || topics.some((t) => t.id !== 'sources')) && ['#how', 'How it works'],
    // The bands, not every question: a rail of fourteen links is a wall.
    ...Object.keys(BANDS).filter((b) => inBand(b) > 1).map((b) => [`#band-${b}`, BANDS[b]]),
  ].filter(Boolean);

  const body = html`
${vm.artStyle ? raw(`<div class="art" style="${vm.artStyle}">`) : ''}
${hero({
  ...vm.hero,
  // One eyebrow for every country: where it is, and the admission cycle.
  eyebrow: html`<span>${vm.hero.region || ''}<span class="eyebrow__cycle">${vm.hero.region ? ' · ' : ''}${SITE.cycle.label}</span></span>`,
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
                <h3 class="jgroup__name">${String(g.name).split(/\s+[—–-]\s+/)[0]}</h3>
                <p class="jgroup__route">${plural(g.cards.length, 'university', 'universities')}</p>
              </header>
              ${/* The route, and what differs, one tap down: the heading already
                    names the group (round 8: one phrase said three times). */
                g.route || g.more
                ? html`<details class="jgroup__more"><summary>How to apply</summary>
                    ${g.route ? html`<p>${g.routeHref ? html`<a href="${g.routeHref}" rel="noopener nofollow">${g.route}</a>` : g.route}</p>` : ''}
                    ${g.more || ''}</details>`
                : ''}
              ${grid(g.cards)}
            </section>`)}`
      : ''}
    ${vm.places.footnote || ''}
    ${nationalSourcesPanel(vm.nationalSources)}
    ${/* A globe for two pins is an empty screen: the cards are the map. */
      vm.places.map && vm.places.count >= MAP_FROM ? html`<div class="dest-open__map">${vm.places.map}</div>` : ''}
  </div>
</section>

<section class="section section--tinted section--rule" data-slot="details">
  <div class="wrap">
    <div class="layout-aside">
      <div class="prose">
        ${vm.details.lede || topics.some((t) => t.id !== 'sources') ? html`<h2 id="how">How it works</h2>` : ''}
        ${vm.details.lede ? html`<p class="lede">${vm.details.lede}</p>` : ''}
        ${vm.details.more
          ? html`<details class="topic__more"><summary>In full</summary>
              <div class="topic__body"><p>${vm.details.more}</p></div></details>`
          : ''}
        ${banded}
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
        ${/* A short page needs no contents list. */
          toc.length >= 3
          ? html`<nav aria-label="On this page">
              <p class="eyebrow eyebrow--plain">On this page</p>
              <ul class="side-links">${toc.map(([h, label]) => html`<li><a href="${h}">${label}</a></li>`)}</ul>
            </nav>`
          : ''}
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
