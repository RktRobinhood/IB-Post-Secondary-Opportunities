import { html, raw, truncate } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import { hero, note, sectionHead, dataTable } from '../lib/components.mjs';
import { money } from '../lib/data.mjs';
import { DIMENSIONS, assessDestination, coverageSummary } from '../lib/dimensions.mjs';

/* The comparison table across every Destination. */

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
    ${note(
      `Meeting the entry requirements does not make a degree affordable, reachable or right for you. These are
      seven different questions and they are shown as seven different rows — a country that wins on money can
      lose on language, and no arithmetic should hide that from you.`,
      { kind: 'accent', title: 'Why there is no ranking' }
    )}

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

    ${dataTable({
      caption: 'Every destination, with how completely each is recorded',
      head: ['Destination', 'Region', 'English-taught bachelors', 'Tuition (EU/EEA)', 'Living cost', 'Coverage'],
      rows: assessed.map((a) => {
        const c = sorted.find((x) => x.code === a.code);
        const eu = money(c.costs?.tuitionEuEea);
        const living = money(c.costs?.livingCostMonthly);
        const learning = a.dimensions.find((d) => d.key === 'learning');
        return [
          html`<a href="${url(a.href)}">${a.flag} ${a.name}</a>`,
          a.scope === 'europe' ? a.region : `${a.region} (worldwide)`,
          learning?.value ? truncate(learning.value, 44) : html`<span class="tray__missing">Not recorded</span>`,
          eu ? truncate(eu.value, 40) : html`<span class="tray__missing">Not recorded</span>`,
          living ? truncate(living.value, 28) : html`<span class="tray__missing">Not recorded</span>`,
          html`<span class="coverage coverage--${a.coverage.full >= 5 ? 'good' : a.coverage.full >= 3 ? 'part' : 'thin'}">${a.coverage.full}/${a.coverage.total}</span>`,
        ];
      }),
    })}
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
