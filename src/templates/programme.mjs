import { html, plural } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import { hero, glance, crumbs, topic, pager, stamp, facts, note, sources } from '../lib/components.mjs';

/**
 * The programme page: one template for every degree in every country.
 *
 * The third of the site's three levels (src/templates/). Canonical Danish and
 * Dutch programmes (src/pages/programme.mjs) and country school records
 * (src/pages/school-programme.mjs) are adapters that fill the view model
 * below; the page is drawn only here, and it ends where the site does: one
 * button to the programme's own page on the university's site.
 * scripts/test-templates.mjs fails the build if a programme page was not
 * drawn here or its slots moved.
 *
 * Slots, in order:
 *   glance   the facts a student compares on (where, degree, length, apply by,
 *            admission, fee)
 *   before   one caveat to read before applying, when the record has one
 *   detail   trail; the dates; what you need; how places are decided; what
 *            it is; more at this university; sources — beside the rail with
 *            the official page
 *   pager    previous and next programme at the same university
 *
 * @param {object} vm
 * @param {object} vm.hero      hero() options (drawn compact)
 * @param {Array}  vm.glance    [{ label, value, note }]
 * @param {any}    [vm.before]  one caveat, shown under the facts
 * @param {object} vm.trail     { country: { href, label }, university: { href, label }, title }
 * @param {any}    [vm.dates]   the dates panel (src/lib/school-dates.mjs)
 * @param {any}    [vm.paths]   the table of what differs between a family's paths
 * @param {object} vm.need      { lead, extra, full, fullLabel, cta } — the requirement
 * @param {any}    [vm.notice]  how fresh the requirement is
 * @param {object} [vm.decided] { short, body, more } — how places are decided
 * @param {object} [vm.what]    { short, body, more } — what the degree is
 * @param {object} [vm.more]    { title, cards } — more programmes to look at
 * @param {any}    [vm.evidence] the evidence disclosure, where records carry it
 * @param {Array}  vm.sources   [{ title, url, retrieved }]
 * @param {object} vm.rail      { checked, official, rows } — official is the programme's own page
 * @param {object} [vm.pager]   { prev, next }
 * @param {object} vm.page      { title, description, path, section }
 */
export function programmeTemplate(vm) {
  const sourceList = (vm.sources || []).filter((s, i, all) => s && s.url && all.findIndex((t) => t && t.url === s.url) === i);
  const body = html`
${hero({ ...vm.hero, variant: 'compact' })}

<section class="section section--tinted section--glance" data-slot="glance">
  <div class="wrap">${glance(vm.glance.filter(Boolean))}</div>
</section>
${vm.before
  ? html`<section class="section section--before" data-slot="before">
      <div class="wrap">${vm.before}</div>
    </section>`
  : ''}
<section class="section" data-slot="detail">
  <div class="wrap">
    ${crumbs([vm.trail.country, vm.trail.university, { label: vm.trail.title }].filter(Boolean))}
    <div class="layout-aside${vm.dates ? ' layout-aside--dates' : ''}">
      ${vm.dates || ''}
      <div class="prose">
        ${vm.paths || ''}
        <h2 id="requirements">What you need</h2>
        ${vm.need.lead || html`<p class="need__note">No requirement is recorded here yet.</p>`}
        ${vm.need.extra || ''}
        ${vm.need.full
          ? html`<details class="topic__more"><summary>${vm.need.fullLabel || 'Requirements in full'}</summary><div class="topic__body">${vm.need.full}</div></details>`
          : ''}
        ${vm.need.cta ? html`<p class="need__cta"><a class="btn btn--primary" href="${url(vm.need.cta.href)}">${vm.need.cta.label}</a></p>` : ''}
        ${vm.notice || ''}
        ${vm.decided ? topic({ id: 'selection', title: 'How places are decided', ...vm.decided }) : ''}
        ${vm.what ? topic({ id: 'what', title: 'What it is', ...vm.what }) : ''}
        ${vm.more?.cards?.length
          ? html`<section class="topic" aria-labelledby="more-here">
              <h2 id="more-here">${vm.more.title}</h2>
              <div class="prog-siblings">${vm.more.cards}</div>
            </section>`
          : ''}
        ${vm.evidence || ''}
        ${sourceList.length
          ? html`<details class="sources-foot"><summary>Written from ${plural(sourceList.length, 'official page')}</summary>
              ${sources(sourceList, { title: null })}</details>`
          : ''}
      </div>
      <aside class="layout-aside__side stack">
        ${stamp(vm.rail.checked)}
        ${vm.rail.official
          ? html`<a class="btn btn--solid btn--block" href="${vm.rail.official}" rel="noopener nofollow">The official page ↗</a>`
          : ''}
        ${facts(vm.rail.rows || [])}
        ${note('Requirements change between admission years. Check the official page before you apply.', { kind: 'warn', title: 'Always verify' })}
      </aside>
    </div>
  </div>
</section>
${vm.pager?.prev || vm.pager?.next
  ? html`<section class="section section--pager" data-slot="pager">
      <div class="wrap">${pager(vm.pager)}</div>
    </section>`
  : ''}`;

  return page({ ...vm.page, body, template: 'programme', scripts: vm.dates ? ['dates-panel.js'] : undefined });
}
