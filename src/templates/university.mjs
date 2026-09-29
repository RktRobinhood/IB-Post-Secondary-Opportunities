import { html, raw, toString, plural, firstSentence } from '../lib/html.mjs';
import { page } from '../lib/layout.mjs';
import { hero, glance, crumbs, sectionHead, topic, pager, institutionRail, sources } from '../lib/components.mjs';

/**
 * The university page: one template for every institution in every country.
 *
 * The site has three levels — country, university, programme — and each is
 * one template (src/templates/). Data arrives in different shapes (canonical
 * Danish records, country school records), so each shape has an adapter that
 * turns its record into the view model below; the page itself is drawn only
 * here. A slot with nothing in it is left out, never replaced by a different
 * design. scripts/test-templates.mjs reads every built page back and fails if
 * a university page was not drawn here or its slots are out of order.
 *
 * Slots, in order:
 *   hero       the place: photograph, name, one line
 *   glance     four facts: in English, city, apply via, IB transcripts
 *   study      trail, the school's dates, and what you could study
 *   details    short answers (what it asks of IB students, worth knowing,
 *              sources) beside the rail with the one official page to open
 *   pager      previous and next university in the same country
 *
 * @param {object} vm
 * @param {object} vm.hero       hero() options
 * @param {Array}  vm.glance     [{ label, value }] — the first four with a value show
 * @param {Array}  vm.crumbs     crumbs() trail, without Home
 * @param {any}    [vm.dates]    the dates panel (src/lib/school-dates.mjs)
 * @param {object} vm.study      { title, lede, cards, handoff } — `cards` [{ html, field }]
 *                               for every degree, or `handoff`, one line when there
 *                               is no list (a catalogue, nothing in English, not yet
 *                               researched). A long list is grouped by field here.
 * @param {object} vm.topics     { ib, admissions, notes } — each { short, body, more } or
 *                               null — and `sources` [{ title, url, retrieved }]. The
 *                               template owns the headings, so every page asks the
 *                               same questions in the same order.
 * @param {object} vm.rail       institutionRail() options
 * @param {object} [vm.pager]    { prev, next }
 * @param {object} vm.page       { title, description, path, section }
 */
/**
 * The short answer an IB recognition statement gives to "What it asks of IB
 * students": its diploma policy's first sentence, else its one-line text —
 * never a count of transcripts, which says how many went, not what it asks
 * (#67). Both adapters use it, so the answer is chosen one way.
 */
export function statementShort(statement) {
  if (!statement) return null;
  if (statement.diplomaPolicy) return firstSentence(statement.diplomaPolicy, 30);
  const text = String(statement.text || '').trim();
  if (text && !/\btranscripts?\b/i.test(text)) return `${text[0].toUpperCase()}${text.slice(1)}.`;
  return 'It publishes an IB recognition statement.';
}

/* A short list is one grid. A long one is grouped under its fields
   ("Engineering · 6"), heading only fields with enough programmes to be a
   group; the rest share "Other fields". */
const GROUP_FROM = 13;
const GROUP_MIN = 3;

function studyBody({ cards = [], handoff = null }) {
  if (!cards.length) return handoff ? html`<div class="handoff">${handoff}</div>` : '';
  if (cards.length < GROUP_FROM) return html`<div class="grid grid--3">${cards.map((c) => c.html)}</div>`;
  const byField = new Map();
  for (const c of cards) {
    const f = c.field || 'Other';
    if (!byField.has(f)) byField.set(f, []);
    byField.get(f).push(c);
  }
  const fieldGroups = [...byField].filter(([, list]) => list.length >= GROUP_MIN);
  const rest = [...byField].filter(([, list]) => list.length < GROUP_MIN).flatMap(([, list]) => list);
  const group = (head, list, headed) => html`<div class="prog-group">
      <h3 class="prog-group__head">${head} <span>· ${list.length}</span></h3>
      <div class="grid grid--3">${list.map((c) => (headed && c.headedHtml) || c.html)}</div>
    </div>`;
  return [
    ...fieldGroups.map(([field, list]) => group(field, list, true)),
    rest.length ? group(fieldGroups.length ? 'Other fields' : 'All fields', rest, false) : '',
  ];
}

export function universityTemplate(vm) {
  const t = vm.topics;
  const topics = [
    t.ib && topic({ id: 'ib', title: 'What it asks of IB students', ...t.ib }),
    t.admissions && topic({ id: 'admissions', title: 'How places are decided', ...t.admissions }),
    t.notes && topic({ id: 'notes', title: 'Worth knowing', ...t.notes }),
    t.sources?.length &&
      topic({
        id: 'sources',
        title: 'Sources',
        short: `The ${plural(t.sources.length, 'official page')} this was written from.`,
        body: sources(t.sources, { title: null }),
        more: 'All sources',
      }),
  ].filter(Boolean);
  const body = html`
${hero(vm.hero)}

<section class="section section--tinted section--glance" data-slot="glance">
  <div class="wrap">
    ${glance(vm.glance.filter((g) => g && g.value).slice(0, 4))}
  </div>
</section>

<section class="section" data-slot="study">
  <div class="wrap">
    ${crumbs(vm.crumbs)}
    ${vm.dates ? raw(`<div class="layout-aside layout-aside--dates">${toString(vm.dates)}<div class="layout-aside__main">`) : ''}
    ${sectionHead({ title: vm.study.title, lede: vm.study.lede, id: 'programmes' })}
    ${studyBody(vm.study)}
    ${vm.dates ? raw('</div></div>') : ''}
  </div>
</section>

<section class="section section--tinted section--rule" data-slot="details">
  <div class="wrap">
    <div class="layout-aside">
      <div class="prose">${topics}</div>
      ${institutionRail(vm.rail)}
    </div>
  </div>
</section>

${vm.pager?.prev || vm.pager?.next
  ? html`<section class="section section--pager" data-slot="pager">
      <div class="wrap">${pager(vm.pager)}</div>
    </section>`
  : ''}`;

  return page({
    ...vm.page,
    body,
    template: 'university',
    scripts: vm.dates ? ['dates-panel.js'] : undefined,
  });
}
