import { html, raw, toString, plural, firstSentence } from '../lib/html.mjs';
import { page } from '../lib/layout.mjs';
import { hero, glance, crumbs, sectionHead, topic, pager, institutionRail, sources, sectionNav } from '../lib/components.mjs';

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
 *                               for every degree (or a catalogue school's flagships),
 *                               and `handoff`, the way on when the cards are not the
 *                               whole list (a catalogue's course search), or the one
 *                               line when there is no list (nothing in English, not
 *                               yet researched). The cards come first, the hand-off
 *                               after them. A long list is grouped by field here.
 * @param {any} [vm.catalogue]   Optional national catalogue links, from a dated local snapshot.
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
  // A chip, not a sentence: on a hundred pages a sentence is a wall (text-walls).
  return html`<ul class="tags"><li class="tag">Recognises the IB Diploma</li></ul>`;
}

/* A short list is one grid. A long one is grouped under its fields
   ("Engineering · 6"), heading only fields with enough programmes to be a
   group; the rest share "Other fields". */
const GROUP_FROM = 13;
const GROUP_MIN = 2;
/** Cards a field shows before "Show all". */
const GROUP_SHOWN = 6;

function studyBody({ cards = [], handoff = null }) {
  const way = handoff ? html`<div class="handoff">${handoff}</div>` : '';
  if (!cards.length) return way;
  const grid = html`<div class="grid grid--3">${cards.map((c) => c.html)}</div>`;
  if (cards.length < GROUP_FROM) return way ? html`<div class="stack">${grid}${way}</div>` : grid;
  const byField = new Map();
  for (const c of cards) {
    const f = c.field || 'Other';
    if (!byField.has(f)) byField.set(f, []);
    byField.get(f).push(c);
  }
  const fieldGroups = [...byField].filter(([, list]) => list.length >= GROUP_MIN);
  const rest = [...byField].filter(([, list]) => list.length < GROUP_MIN).flatMap(([, list]) => list);
  /* Groups only help when they hold most of the list. */
  if (!fieldGroups.length || rest.length >= Math.max(...fieldGroups.map(([, list]) => list.length))) {
    // Ungrouped but long: the first nine, the rest one tap away.
    const shortGrid = html`<div class="grid grid--3">${cards.slice(0, 9).map((c) => c.html)}</div>
      <details class="prog-group__more"><summary>Show all ${cards.length}</summary>
        <div class="grid grid--3">${cards.slice(9).map((c) => c.html)}</div></details>`;
    return way ? html`<div class="stack">${shortGrid}${way}</div>` : shortGrid;
  }
  /* A field shows its first cards; the rest are one tap away (Studyportals,
     UvA: template-references.md), so a long list is not a wall of cards. */
  const cardOf = (c, headed) => (headed && c.headedHtml) || c.html;
  const group = (head, list, headed) => html`<div class="prog-group">
      <h3 class="prog-group__head">${head} <span>· ${list.length}</span></h3>
      <div class="grid grid--3">${list.slice(0, GROUP_SHOWN).map((c) => cardOf(c, headed))}</div>
      ${list.length > GROUP_SHOWN + 1
        ? html`<details class="prog-group__more"><summary>Show all ${list.length}</summary>
            <div class="grid grid--3">${list.slice(GROUP_SHOWN).map((c) => cardOf(c, headed))}</div></details>`
        : list.length === GROUP_SHOWN + 1 ? html`<div class="grid grid--3">${cardOf(list[GROUP_SHOWN], headed)}</div>` : ''}
    </div>`;
  return [
    ...fieldGroups.map(([field, list]) => group(field, list, true)),
    rest.length ? group(fieldGroups.length ? 'Other fields' : 'All fields', rest, false) : '',
    way,
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
        short: null,
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
${sectionNav([
  (vm.study.cards?.length || vm.study.handoff) && { href: '#programmes', label: vm.study.cards?.length ? 'Degrees' : vm.study.title },
  vm.dates && { href: '#dates', label: 'Deadlines' },
  t.ib && { href: '#ib', label: 'What it asks' },
  t.admissions && { href: '#admissions', label: 'How places are decided' },
  t.notes && { href: '#notes', label: 'Worth knowing' },
], vm.rail.action && /^https?:/.test(vm.rail.action.href) ? { href: vm.rail.action.href, label: 'Official page ↗' } : null)}

${vm.study.cards?.length || vm.study.handoff || vm.dates ? html`<section class="section" data-slot="study">
  <div class="wrap">
    ${crumbs(vm.crumbs)}
    ${vm.dates ? raw(`<div class="layout-aside layout-aside--dates">${toString(vm.dates)}<div class="layout-aside__main">`) : ''}
    ${vm.study.cards?.length || vm.study.handoff ? html`${sectionHead({ title: vm.study.title, lede: vm.study.lede, id: 'programmes' })}
    ${studyBody(vm.study)}` : ''}
    ${vm.catalogue || ''}
    ${vm.dates ? raw('</div></div>') : ''}
  </div>
</section>` : ''}

<section class="section section--tinted section--rule" data-slot="details">
  <div class="wrap">
    ${vm.study.cards?.length || vm.study.handoff || vm.dates ? '' : crumbs(vm.crumbs)}
    <div class="layout-aside">
      <div class="prose">${topics}</div>
      ${institutionRail({ ...vm.rail, knownFor: (vm.study.cards?.length || 0) >= 3 ? [] : vm.rail.knownFor })}
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
