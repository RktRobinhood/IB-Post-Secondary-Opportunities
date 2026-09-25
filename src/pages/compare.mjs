import { html, raw, truncate } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import { hero, sectionHead } from '../lib/components.mjs';
import { money } from '../lib/data.mjs';
import { DIMENSIONS, assessDestination, coverageSummary } from '../lib/dimensions.mjs';

/* The comparison table across every Destination.

   On a phone the "whole set" used to be a 36-row, six-column table whose cells
   were truncated sentences; stacked one card per row it came to about 22 phone
   screens (docs/research/ia/text-walls.md §3.7). It is now one compact row per
   Destination — name, the first clause of its EU/EEA tuition, and coverage as
   dots — with the full cells behind the row, sortable in the browser. The
   compare-two tray above stays the main tool. */

/** The first clause of a sentence-shaped value: what a compact row can carry. */
function firstClause(value, max = 48) {
  const clause = String(value).split(/[;(]|\.(?:\s|$)|\s[-—–]\s/)[0].trim();
  return truncate(clause || String(value), max);
}

/** Coverage as dots, so seven rows can be compared at a glance. */
function dots(full, total) {
  return '●'.repeat(full) + '○'.repeat(Math.max(0, total - full));
}

/* --- Comparison table ------------------------------------------------------ */

export function compare(site) {
  const sorted = site.destinations.slice().sort((a, b) => a.name.localeCompare(b.name));

  // Every destination, assessed across the seven dimensions at build time.
  const assessed = sorted.map((c) => {
    const dims = assessDestination(c);
    return {
      code: c.code,
      name: c.name,
      flag: c.flag,
      href: c.href,
      scope: c.scope,
      region: c.region,
      dataAsOf: c.dataAsOf || null,
      coverage: coverageSummary(dims),
      dimensions: dims.map((d) => ({
        key: d.key,
        value: d.value,
        coverage: d.coverage,
        uncertainty: d.uncertainty,
      })),
    };
  });

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Side by side',
  title: 'Compare destinations',
  lede: 'Seven separate dimensions, kept separate. There is no overall score, because the weighting would be ours and the decision is yours.',
})}

<section class="section">
  <div class="wrap wrap--wide">
    <form class="filters" id="cmp-picker">
      <div class="field">
        <label for="cmp-add">Add a destination to compare</label>
        <select id="cmp-add">
          <option value="">Choose…</option>
          ${assessed.map((a) => html`<option value="${a.code}">${a.flag} ${a.name}</option>`)}
        </select>
      </div>
      <div class="chips" id="cmp-chosen" aria-label="Chosen destinations"></div>
    </form>

    <div id="cmp-tray"></div>
    <noscript>
      <p class="state state--empty">Choosing destinations to compare needs JavaScript. The full table below
      works without it, and every destination page carries the same seven dimensions in full.</p>
    </noscript>

    ${sectionHead({
      eyebrow: `${assessed.length} destinations`,
      title: 'Or scan the whole set',
      lede: 'Coverage says how much of the picture we have, not how good a country is. A country we know less about is not a worse country.',
    })}

    <div class="set" id="cmp-set">
      <p class="set__sort" id="cmp-sort" hidden>
        <span>Sort</span>
        <button type="button" class="chip" data-sort="name" aria-pressed="true">A–Z</button>
        <button type="button" class="chip" data-sort="coverage" aria-pressed="false">Most recorded</button>
        <button type="button" class="chip" data-sort="region" aria-pressed="false">By region</button>
      </p>
      <p class="set__head" aria-hidden="true"><span>Destination</span><span>Tuition, EU/EEA</span><span>Recorded</span></p>
      <div class="set__rows">
      ${assessed.map((a) => {
        const c = sorted.find((x) => x.code === a.code);
        const eu = money(c.costs?.tuitionEuEea);
        const living = money(c.costs?.livingCostMonthly);
        const learning = a.dimensions.find((d) => d.key === 'learning');
        const region = a.scope === 'europe' ? a.region : `${a.region} (worldwide)`;
        return html`<details class="set__row" data-code="${a.code}" data-name="${a.name}" data-region="${region}" data-coverage="${a.coverage.full}">
          <summary>
            <span class="set__name">${a.flag} ${a.name}</span>
            <span class="set__fee">${eu ? firstClause(eu.value) : html`<span class="tray__missing">Not recorded</span>`}</span>
            <span class="set__cov" aria-label="${a.coverage.full} of ${a.coverage.total} dimensions fully recorded">${dots(a.coverage.full, a.coverage.total)}</span>
          </summary>
          <dl class="set__more">
            <div><dt>Region</dt><dd>${region}</dd></div>
            <div><dt>English-taught bachelors</dt><dd>${learning?.value || html`<span class="tray__missing">Not recorded</span>`}</dd></div>
            <div><dt>Tuition (EU/EEA)</dt><dd>${eu ? eu.value : html`<span class="tray__missing">Not recorded</span>`}</dd></div>
            <div><dt>Living cost</dt><dd>${living ? living.value : html`<span class="tray__missing">Not recorded</span>`}</dd></div>
            <div><dt>Recorded</dt><dd>${a.coverage.full} of ${a.coverage.total} dimensions in full</dd></div>
          </dl>
          <p class="set__links"><a class="arrow-link" href="${url(a.href)}">The ${a.name} page</a>
            <button type="button" class="btn btn--ghost btn--sm" data-add="${a.code}" hidden>Add to the comparison</button></p>
        </details>`;
      })}
      </div>
    </div>
  </div>
</section>

<script type="application/json" id="compare-data">${raw(JSON.stringify(assessed))}</script>
<script type="application/json" id="compare-dimensions">${raw(
    JSON.stringify(DIMENSIONS.map((d) => ({ key: d.key, label: d.label, note: d.note })))
  )}</script>`;

  return page({
    title: 'Compare destinations',
    description:
      'Compare destinations across seven separate dimensions — academic, financial, practical, learning, support, future and personal — with no overall score.',
    path: '/compare/',
    body,
    scripts: ['compare.js'],
  });
}
