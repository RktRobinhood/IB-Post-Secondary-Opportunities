import { html, plural, firstSentence } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import { hero, glance, crumbs, topic, topicHasContent, pager, stamp, facts, sources, sectionNav, panelHue } from '../lib/components.mjs';

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
 *   detail   trail; the dates; what it is; what you need; how places are
 *            decided; sources — beside the rail with the official page
 *   more     other degrees, in a band of their own after this one ends
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
const hostName = (u) => {
  try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return 'its own site'; }
};

export function programmeTemplate(vm) {
  const sourceList = (vm.sources || []).filter((s, i, all) => s && s.url && all.findIndex((t) => t && t.url === s.url) === i);
  /* The hero says what the degree is in its own first sentence, once; the
     facts are the strip's, and the eyebrow says only whose and where
     (round 8: the facts were said three times over the fold). */
  const whatText = typeof vm.what?.short === 'string' ? vm.what.short.trim() : '';
  const opening = whatText ? firstSentence(whatText, 26) : '';
  const usable = opening && !opening.endsWith('…') && opening.length < whatText.length + 1;
  const clause = !usable && whatText ? (whatText.match(/^[^—;:(]{20,140}?(?=\s*[—;:(])/) || [])[0] : null;
  const lede = usable ? opening : clause ? `${clause.trim()}.` : null;
  const what = usable && vm.what ? { ...vm.what, short: whatText.slice(opening.length).trim() || null } : vm.what;
  const showWhat = topicHasContent(what);
  const eyebrow = [vm.trail.university?.name || vm.trail.university?.label, vm.trail.country?.label].filter(Boolean).join(' · ') || vm.hero.eyebrow;
  const body = html`
${hero({ ...vm.hero, eyebrow, lede, variant: 'compact' })}

<section class="section section--tinted section--glance" data-slot="glance">
  <div class="wrap">${glance(vm.glance.filter(Boolean))}</div>
</section>
${sectionNav([
  showWhat && { href: '#what', label: 'What it is' },
  { href: '#requirements', label: 'What you need' },
  vm.decided && { href: '#selection', label: 'How places are decided' },
  vm.dates && { href: '#dates', label: 'Deadlines' },
  (vm.more?.cards?.length || vm.trail.university) && { href: '#more-here', label: vm.more?.cards?.length ? 'Other degrees' : 'More' },
], vm.rail.official ? { href: vm.rail.official, label: 'Official page ↗' } : null)}
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
        ${showWhat ? topic({ id: 'what', title: 'What it is', ...what }) : ''}
        ${vm.paths || ''}
        <h2 id="requirements">What you need</h2>
        ${vm.need.lead || html`<p class="need__note">No requirement is recorded here yet.</p>`}
        ${vm.need.extra || ''}
        ${vm.need.full
          ? html`<details class="topic__more"><summary>${vm.need.fullLabel || 'Requirements in full'}</summary><div class="topic__body">${vm.need.full}</div></details>`
          : ''}
        ${vm.need.cta ? html`<p class="need__cta"><a class="btn btn--primary" href="${url(vm.need.cta.href)}">${vm.need.cta.label}</a></p>` : ''}
        ${/* On a phone the rail comes last; the way to the official page is not left there. */
          vm.rail.official
          ? html`<p class="need__official"><a href="${vm.rail.official}" rel="noopener nofollow">Check it on ${hostName(vm.rail.official)}<span aria-hidden="true"> ↗</span></a></p>`
          : ''}
        ${vm.notice || ''}
        ${vm.decided ? topic({ id: 'selection', title: 'How places are decided', ...vm.decided }) : ''}
        ${vm.evidence || ''}
        ${sourceList.length
          ? html`<details class="sources-foot"><summary>Sources <span>(${sourceList.length})</span></summary>
              ${sources(sourceList, { title: null })}</details>`
          : ''}
      </div>
      <aside class="layout-aside__side stack">
        ${stamp(vm.rail.checked)}
        ${/* The hand-off, as on a university page: the button, and where it goes. */
          vm.rail.official
          ? html`<div class="rail-action"><a class="btn btn--solid btn--block" href="${vm.rail.official}" rel="noopener nofollow">The official page ↗</a>
              <p class="rail-note">On ${hostName(vm.rail.official)}</p></div>`
          : ''}
        ${facts(vm.rail.rows || [])}
      </aside>
    </div>
  </div>
</section>
${/* Other degrees: a band of its own after this programme ends, so it never
     reads as more about this one. */
  vm.more?.cards?.length || vm.trail.university
  ? html`<section class="section section--more" data-slot="more" aria-labelledby="more-here">
      <div class="wrap">
        <h2 class="more__title" id="more-here">${vm.more?.cards?.length ? vm.more.title : `More at ${vm.trail.university.label}`}</h2>
        ${vm.more?.cards?.length
          ? html`<div class="prog-siblings">${vm.more.cards}</div>`
          : html`<div class="more__way">
              <a class="more__card" href="${url(vm.trail.university.href)}" style="--ph:${panelHue(vm.trail.university.name || vm.trail.university.label)}"><strong>${vm.trail.university.name || vm.trail.university.label}</strong></a>
              ${vm.trail.country ? html`<a class="more__card" href="${url(vm.trail.country.href)}" style="--ph:${panelHue(vm.trail.country.label)}"><strong>${vm.trail.country.label}</strong><span>Universities</span></a>` : ''}
            </div>`}
      </div>
    </section>`
  : ''}
${(vm.pager?.prev || vm.pager?.next) && !vm.more?.cards?.length
  ? html`<section class="section section--pager" data-slot="pager">
      <div class="wrap">${pager(vm.pager)}</div>
    </section>`
  : ''}`;

  return page({ ...vm.page, body, template: 'programme', scripts: vm.dates ? ['dates-panel.js'] : undefined });
}
