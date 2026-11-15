import { html, firstSentence } from '../lib/html.mjs';
import { page } from '../lib/layout.mjs';
import { hero, glance, crumbs, topic, pager, institutionRail, sources, sectionNav } from '../lib/components.mjs';
import { programmeView } from '../lib/programme-view.mjs';

/** One repeatable page shape, including unanswered questions. */
export function statementShort(statement) {
  if (!statement) return null;
  if (statement.diplomaPolicy) return firstSentence(statement.diplomaPolicy, 30);
  const text = String(statement.text || '').trim();
  if (text && !/\btranscripts?\b/i.test(text)) return `${text[0].toUpperCase()}${text.slice(1)}.`;
  return html`<ul class="tags"><li class="tag">Recognises the IB Diploma</li></ul>`;
}

export function universityTemplate(vm) {
  const t = vm.topics;
  const gap = (href = vm.ask) => html`<p><a href="${href}" rel="noopener nofollow">Ask the university<span aria-hidden="true"> ↗</span></a></p>`;
  const answer = (id, title, value) => html`<div data-section="${id}">${topic({ id, title, ...(value || { short: gap() }) })}</div>`;
  const body = html`
${hero(vm.hero)}
<section class="section section--tinted section--glance" data-slot="glance">
  <div class="wrap">${glance(vm.glance)}</div>
</section>
${sectionNav([
  { href: '#programmes', label: 'Study' },
  { href: '#ib', label: 'Your IB' },
  { href: '#costs', label: 'Costs' },
  { href: '#applying', label: 'Applying' },
  { href: '#notes', label: 'Worth knowing' },
  { href: '#sources', label: 'Sources' },
], vm.rail.action && /^https?:/.test(vm.rail.action.href) ? { href: vm.rail.action.href, label: 'Official page ↗' } : null)}
<section class="section university-study" data-slot="study" data-section="study">
  <div class="wrap">
    ${crumbs(vm.crumbs)}
    <header class="section-head" id="programmes"><h2>What you can study</h2>${vm.study.lede ? html`<p class="lede">${vm.study.lede}</p>` : ''}</header>
    ${programmeView({ cards: vm.study.cards, label: 'What you can study' })}
    ${vm.study.handoff ? html`<div class="handoff">${vm.study.handoff}</div>` : !vm.study.cards?.length ? gap() : ''}
    ${vm.catalogue || ''}
  </div>
</section>
<section class="section section--tinted section--rule university-details" data-slot="details">
  <div class="wrap layout-aside">
    <div class="prose">
      ${answer('ib', 'What your IB needs', t.ib)}
      ${answer('costs', 'What it costs', t.costs)}
      <div data-section="applying">
        ${topic({ id: 'applying', title: 'How and when to apply', ...(t.applying || { short: gap() }) })}
        ${t.admissions ? html`<div class="university-selection"><h3 id="admissions">How places are decided</h3>${t.admissions.short ? html`<p>${t.admissions.short}</p>` : ''}${t.admissions.body ? html`<details class="topic__more"><summary>${t.admissions.more || 'In full'}</summary><div class="topic__body">${t.admissions.body}</div></details>` : ''}</div>` : ''}
        ${vm.dates || ''}
      </div>
      ${answer('notes', 'Worth knowing', t.notes)}
      <div data-section="sources">${topic({ id: 'sources', title: 'Sources', short: null, body: t.sources?.length ? sources(t.sources, { title: null }) : gap(), more: 'All sources' })}</div>
    </div>
    ${institutionRail({ ...vm.rail, knownFor: vm.rail.knownFor })}
  </div>
</section>
${vm.pager?.prev || vm.pager?.next ? html`<section class="section section--pager" data-slot="pager"><div class="wrap">${pager(vm.pager)}</div></section>` : ''}`;
  return page({ ...vm.page, body, template: 'university', scripts: ['programme-view.js', ...(vm.dates ? ['dates-panel.js'] : [])] });
}
