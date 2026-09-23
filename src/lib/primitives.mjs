/**
 * The reusable component grammar from docs/PAGE_TEMPLATES.md.
 *
 * Every primitive takes a plain data object and returns markup. None of them
 * knows which page it is on, which country it is describing, or what the data
 * came from. That is the point: adding a destination, an institution or a
 * thousand opportunities should need new *records*, not new code.
 *
 * Art direction is passed separately and can only supply colour, media and an
 * accent. It can never reorder, hide or re-rank anything — a destination may
 * look different, but the same question is answered in the same place on every
 * page.
 */
import { html, raw, md, truncate, plural, slugify } from './html.mjs';
import { url } from './layout.mjs';

/* ========================================================================
   Art direction
   ======================================================================== */

/**
 * A destination may carry `artDirection: { accent, accentDark, pattern, focal }`.
 * Anything outside this whitelist is ignored rather than trusted, so a data
 * file cannot quietly inject style.
 */
export function artDirection(source = {}) {
  const hex = (v) => (/^#[0-9a-fA-F]{6}$/.test(v || '') ? v : null);
  const accent = hex(source.accent);
  const accentDark = hex(source.accentDark);
  const pattern = ['none', 'latitude', 'grid', 'wave'].includes(source.pattern) ? source.pattern : 'none';
  const focal = /^\d{1,3}% \d{1,3}%$/.test(source.focal || '') ? source.focal : '50% 45%';

  const style = [
    accent ? `--art-accent:${accent}` : null,
    accentDark ? `--art-accent-dark:${accentDark}` : null,
    `--focal:${focal}`,
  ]
    .filter(Boolean)
    .join(';');

  return { style, pattern, focal, hasAccent: !!accent };
}

/** The decorative field behind a hero. Never carries information. */
export function patternLayer(pattern) {
  if (!pattern || pattern === 'none') return '';
  return raw(`<div class="pattern pattern--${pattern}" aria-hidden="true"></div>`);
}

/* ========================================================================
   WorldWindow — geographic overview with a static fallback
   ======================================================================== */

/**
 * A cropped band of the world with a light for each place that has
 * opportunities in view. Renders as an inline SVG with no dependencies, so it
 * works with JavaScript off, at 200% zoom, and with a keyboard.
 *
 * @param {object} o
 * @param {Array}  o.places   [{ id, name, lat, lon, count, href, precision }]
 * @param {object} [o.bounds] { north, south, west, east } — defaults to Europe
 * @param {string} [o.caption]
 * @param {string} [o.activeLayer] what the lights currently mean
 */
export function worldWindow({ places = [], bounds, caption, activeLayer = 'Opportunities in view', id = 'world' }) {
  const box = bounds || boundsFor(places);
  const W = 1000;
  const H = 420;

  const project = (lat, lon) => {
    const x = ((lon - box.west) / (box.east - box.west)) * W;
    // Mercator-ish, enough for a stylised band rather than a survey.
    const mercator = (deg) => Math.log(Math.tan(Math.PI / 4 + (deg * Math.PI) / 360));
    const yTop = mercator(box.north);
    const yBottom = mercator(box.south);
    const y = ((yTop - mercator(lat)) / (yTop - yBottom)) * H;
    return { x: clamp(x, 8, W - 8), y: clamp(y, 8, H - 8) };
  };

  const maxCount = Math.max(1, ...places.map((p) => p.count || 1));
  const dots = places
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon))
    .map((p) => {
      const { x, y } = project(p.lat, p.lon);
      // Size communicates how much is here, never prestige.
      const r = 4 + Math.sqrt((p.count || 1) / maxCount) * 9;
      return { ...p, x, y, r };
    })
    .sort((a, b) => b.r - a.r);

  return html`<figure class="world" id="${id}">
  <div class="world__stage">
    <svg viewBox="0 0 ${W} ${H}" class="world__svg" role="img"
         aria-label="${activeLayer}: ${plural(dots.length, 'place')} shown.">
      <defs>
        <radialGradient id="${id}-glow">
          <stop offset="0%" stop-color="var(--art-accent, var(--sand))" stop-opacity=".9"/>
          <stop offset="70%" stop-color="var(--art-accent, var(--sand))" stop-opacity=".18"/>
          <stop offset="100%" stop-color="var(--art-accent, var(--sand))" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <g class="world__graticule" aria-hidden="true">
        ${[0.2, 0.4, 0.6, 0.8].map((f) => html`<line x1="0" y1="${(H * f).toFixed(0)}" x2="${W}" y2="${(H * f).toFixed(0)}"/>`)}
        ${[0.2, 0.4, 0.6, 0.8].map((f) => html`<line x1="${(W * f).toFixed(0)}" y1="0" x2="${(W * f).toFixed(0)}" y2="${H}"/>`)}
      </g>

      ${dots.map(
        (d, i) => html`<g class="world__place" style="--i:${i}">
          <circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="${(d.r * 2.6).toFixed(1)}" fill="url(#${id}-glow)" aria-hidden="true"/>
          <circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="${d.r.toFixed(1)}" class="world__dot"
                  data-place="${d.id}"${d.precision && d.precision !== 'campus' ? raw(' data-approx="true"') : ''}/>
        </g>`
      )}
    </svg>
  </div>

  <!-- The semantic list is the interaction source of truth. The picture is an
       enhancement of it, never a replacement — so this works with a keyboard,
       a screen reader, and no JavaScript at all. -->
  <ul class="world__list" aria-label="${activeLayer}">
    ${dots.map(
      (d) => html`<li>
        <a href="${d.href ? url(d.href) : `#${id}`}" data-place="${d.id}">
          <span class="world__name">${d.name}</span>
          ${d.count ? html`<span class="world__count">${d.count}</span>` : ''}
        </a>
      </li>`
    )}
  </ul>

  <figcaption class="world__caption">
    <span class="world__legend">
      <span class="world__legend-dot world__legend-dot--sm"></span>
      <span class="world__legend-dot world__legend-dot--lg"></span>
      Larger means more opportunities here — not a better place.
    </span>
    ${dots.some((d) => d.precision && d.precision !== 'campus')
      ? html`<span class="world__legend">Hollow markers are city-level, not an exact campus.</span>`
      : ''}
    ${caption ? html`<span>${caption}</span>` : ''}
  </figcaption>
</figure>`;
}

function boundsFor(places) {
  const lats = places.map((p) => p.lat).filter(Number.isFinite);
  const lons = places.map((p) => p.lon).filter(Number.isFinite);
  if (!lats.length) return { north: 71, south: 35, west: -11, east: 32 };
  const pad = 4;
  return {
    north: Math.min(83, Math.max(...lats) + pad),
    south: Math.max(-83, Math.min(...lats) - pad),
    west: Math.max(-179, Math.min(...lons) - pad),
    east: Math.min(179, Math.max(...lons) + pad),
  };
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* ========================================================================
   MapChapter — a configured step in a geographic journey
   ======================================================================== */

/**
 * Chapters are content, not code: a title, some copy, where the camera should
 * be, and which opportunities to light up. A new journey is a new data record.
 */
export function mapChapter({ title, copy, places = [], highlight = [], media, motion = 'geographic', index = 1 }) {
  return html`<section class="chapter" data-motion="${motion}" data-chapter="${index}">
    <div class="chapter__text">
      <p class="chapter__num">${String(index).padStart(2, '0')}</p>
      <h3>${title}</h3>
      ${copy ? md(copy) : ''}
      ${highlight.length
        ? html`<p class="chapter__count">${plural(highlight.length, 'opportunity', 'opportunities')} in view</p>`
        : ''}
    </div>
    <div class="chapter__stage">
      ${media
        ? html`<img src="${url(media.src)}" alt="${media.alt || ''}" loading="lazy" width="900" height="560">`
        : worldWindow({ places, id: `chapter-${index}`, activeLayer: title })}
    </div>
  </section>`;
}

/* ========================================================================
   OpportunityTeaser — one opportunity, at a glance
   ======================================================================== */

/**
 * @param {object} o
 * @param {object} o.opportunity  { name, href, institution, place, field, credential }
 * @param {object} [o.fit]        { outcome, label, reason } — plain-language, never a score
 * @param {object} [o.evidence]   { level, label, checkedAt }
 * @param {object} [o.media]
 */
export function opportunityTeaser({ opportunity: op, fit, evidence, media }) {
  const OUTCOME_CLASS = {
    meets: 'tag--ok',
    'possible-with-action': 'tag--sand',
    'needs-review': 'tag--warn',
    'does-not-currently-meet': '',
  };

  return html`<article class="teaser card card--link"${fit ? raw(` data-outcome="${fit.outcome}"`) : ''}>
    ${media
      ? html`<div class="card__media">
          <img src="${url(media.src)}" alt="${media.alt || ''}" loading="lazy" decoding="async" width="800" height="500">
        </div>`
      : ''}
    <div class="card__body">
      <h3 class="card__title"><a href="${url(op.href)}">${op.name}</a></h3>
      <p class="teaser__where">
        ${[op.institution, op.place].filter(Boolean).map((x, i) => html`${i ? ' · ' : ''}${x}`)}
      </p>
      ${fit
        ? html`<p class="teaser__fit">
            <span class="tag ${OUTCOME_CLASS[fit.outcome] || ''}">${fit.label}</span>
            ${fit.reason ? html`<span class="teaser__reason">${truncate(fit.reason, 120)}</span>` : ''}
          </p>`
        : ''}
      <div class="card__foot">
        ${op.field ? html`<span>${op.field}</span>` : ''}
        ${op.credential ? html`<span>${op.credential}</span>` : ''}
        ${evidence ? html`<span class="teaser__evidence" data-level="${evidence.level}">${evidence.label}</span>` : ''}
      </div>
    </div>
  </article>`;
}

/* ========================================================================
   FilterQuestion — a student-friendly prompt over a canonical field
   ======================================================================== */

/**
 * Filters are phrased as questions a seventeen-year-old would ask, but each one
 * declares the canonical field it maps to, so the query state stays honest.
 *
 * @param {object} o
 * @param {string} o.id
 * @param {string} o.question   "Where would you like to be?"
 * @param {string} o.field      canonical query field, e.g. "destination"
 * @param {Array}  o.options    [{ value, label, count }]
 * @param {string} [o.type]     'select' | 'chips'
 */
export function filterQuestion({ id, question, field, options = [], type = 'select', help }) {
  if (type === 'chips') {
    return html`<fieldset class="filter-q" data-field="${field}">
      <legend>${question}</legend>
      ${help ? html`<p class="filter-q__help">${help}</p>` : ''}
      <div class="chips">
        ${options.map(
          (o) => html`<button type="button" class="chip" data-filter="${field}" data-value="${o.value}" aria-pressed="false">
            ${o.label}${o.count != null ? html` <span class="chip__count">${o.count}</span>` : ''}
          </button>`
        )}
      </div>
    </fieldset>`;
  }

  return html`<div class="field filter-q" data-field="${field}">
    <label for="${id}">${question}</label>
    ${help ? html`<p class="filter-q__help">${help}</p>` : ''}
    <select id="${id}" data-filter="${field}">
      <option value="">No preference</option>
      ${options.map(
        (o) => html`<option value="${o.value}">${o.label}${o.count != null ? ` (${o.count})` : ''}</option>`
      )}
    </select>
  </div>`;
}

/* ========================================================================
   FitExplanation — every calculated result, auditable
   ======================================================================== */

/**
 * @param {object} assessment  the output of src/lib/eligibility.mjs
 * @param {object} [o]         { assumptions, whatIf }
 */
export function fitExplanation(assessment, { assumptions = [], whatIf } = {}) {
  if (!assessment) return '';
  const { outcome, outcomeLabel, matched, gaps, unknowns, dataIssues, caveats, selection, provenance } = assessment;

  return html`<section class="fit" data-outcome="${outcome}">
    <header class="fit__head">
      <p class="fit__outcome">${outcomeLabel}</p>
      ${dataIssues?.length
        ? html`<p class="fit__blocked">${dataIssues.join(' ')}</p>`
        : ''}
    </header>

    ${assumptions.length
      ? html`<div class="fit__assumptions">
          <p class="eyebrow eyebrow--plain eyebrow--muted">Working from</p>
          <ul>${assumptions.map((a) => html`<li>${a}</li>`)}</ul>
        </div>`
      : ''}

    ${matched?.length
      ? html`<div class="fit__group fit__group--met">
          <h4>What you meet</h4>
          <ul>${matched.map((m) => html`<li>${m.message}</li>`)}</ul>
        </div>`
      : ''}

    ${gaps?.length
      ? html`<div class="fit__group fit__group--gap">
          <h4>${gaps.some((g) => g.actionable) ? 'What is missing — and whether you can still change it' : 'What is missing'}</h4>
          <ul>${gaps.map(
            (g) => html`<li>${g.message}${g.actionable ? html` <span class="fit__actionable">You may still be able to act on this.</span>` : ''}</li>`
          )}</ul>
        </div>`
      : ''}

    ${unknowns?.length
      ? html`<div class="fit__group fit__group--unknown">
          <h4>What this cannot check</h4>
          <ul>${unknowns.map((u) => html`<li>${u.message}</li>`)}</ul>
        </div>`
      : ''}

    ${caveats?.length ? html`<p class="fit__caveat">${caveats.join(' ')}</p>` : ''}

    ${selection
      ? html`<div class="fit__selection">
          <h4>Getting a place is a separate question</h4>
          <p>${selection.note}</p>
          ${selection.historicalCutoffs?.length
            ? html`<ul>${selection.historicalCutoffs.map(
                (c) => html`<li>${c.quota || 'Cut-off'} ${c.value} for the ${c.intake.split('-')[0]} intake. This is history, not a forecast.</li>`
              )}</ul>`
            : ''}
        </div>`
      : ''}

    ${whatIf || ''}

    ${provenance
      ? html`<p class="fit__provenance">
          Intake ${provenance.intake || 'not recorded'}.
          ${provenance.dataAsOf ? html` Data as of ${provenance.dataAsOf}.` : ''}
          ${provenance.evidence?.checkedAt ? html` Source last read ${provenance.evidence.checkedAt}.` : ''}
          ${provenance.dataVersion ? html` Build ${provenance.dataVersion}.` : ''}
        </p>`
      : ''}
  </section>`;
}

/* ========================================================================
   EvidenceBlock — the audit drawer
   ======================================================================== */

/**
 * @param {object} o
 * @param {string} o.claim
 * @param {Array}  o.records  Evidence records
 * @param {string} [o.summary]
 */
export function evidenceBlock({ claim, records = [], summary }) {
  if (!records.length) {
    return html`<details class="evidence evidence--none">
      <summary>Where this comes from</summary>
      <p>No source is recorded for this claim yet. Treat it as unverified and check the institution's own page.</p>
    </details>`;
  }

  const conflicted = records.some((r) => (r.conflictsWith || []).length);

  return html`<details class="evidence${conflicted ? ' evidence--conflict' : ''}">
    <summary>Where this comes from${records.length > 1 ? html` <span>(${records.length} sources)</span>` : ''}</summary>
    ${claim ? html`<p class="evidence__claim">${claim}</p>` : ''}
    ${summary ? html`<p>${summary}</p>` : ''}
    ${conflicted
      ? html`<p class="evidence__warning">These sources disagree. The result is held back until a person resolves it —
          it is deliberately not settled by taking the more generous reading.</p>`
      : ''}
    <ol class="evidence__list">
      ${records.map(
        (r) => html`<li>
          <p class="evidence__source">
            <a href="${r.sourceUrl}" rel="noopener nofollow">${r.publisher || r.sourceUrl}</a>
            ${r.publisherType ? html` <span class="evidence__type">${r.publisherType.replace(/-/g, ' ')}</span>` : ''}
          </p>
          ${r.excerpt ? html`<blockquote class="evidence__excerpt">${r.excerpt}</blockquote>` : ''}
          ${r.claim && r.claim !== claim ? html`<p>${r.claim}</p>` : ''}
          <p class="evidence__meta">
            Read ${r.retrievedAt || 'date not recorded'}.
            ${r.appliesToIntake ? html` Applies to the ${r.appliesToIntake.replace('-', ' ')} intake.` : ''}
            ${r.appliesToApplicantGroup && r.appliesToApplicantGroup !== 'any'
              ? html` For ${r.appliesToApplicantGroup.replace(/-/g, '/')} applicants.`
              : ''}
            Status: ${r.verificationState || 'unknown'}.
          </p>
          ${r.interpretation ? html`<p class="evidence__interpretation">${r.interpretation}</p>` : ''}
        </li>`
      )}
    </ol>
  </details>`;
}

/* ========================================================================
   PreparationPath — what a student could do, honestly labelled
   ======================================================================== */

const RELEVANCE = {
  required: ['tag--warn', 'Officially required'],
  selection: ['tag--sand', 'Used in selection'],
  preparation: ['tag--brand', 'Useful preparation'],
};

/**
 * @param {object} o
 * @param {string} o.goal
 * @param {'required'|'selection'|'preparation'} o.relevance
 * @param {string} [o.timing]
 * @param {string} [o.why]
 * @param {Array}  [o.evidence]
 */
export function preparationPath({ goal, relevance = 'preparation', timing, why, evidence = [], scope = null }) {
  const [cls, label] = RELEVANCE[relevance] || RELEVANCE.preparation;
  return html`<article class="prep" data-relevance="${relevance}">
    <header class="prep__head">
      <span class="tag ${cls}">${label}</span>
      ${scope ? html`<span class="prep__scope">${scope}</span>` : ''}
      ${timing ? html`<span class="prep__timing">${timing}</span>` : ''}
    </header>
    <h4>${goal}</h4>
    ${why ? md(why) : ''}
    ${relevance !== 'required'
      ? html`<p class="prep__caveat">${
          relevance === 'selection'
            ? 'This is weighed when places are allocated. It does not create eligibility and it does not guarantee an offer.'
            : 'This is not required and does not affect whether you are admitted. It is here because it is worth doing.'
        }</p>`
      : ''}
    ${evidence.length ? html`<p class="prep__evidence">${evidence.length} source${evidence.length > 1 ? 's' : ''} recorded.</p>` : ''}
  </article>`;
}

/* ========================================================================
   ComparisonTray — a deliberately small set, aligned by dimension
   ======================================================================== */

/**
 * @param {object} o
 * @param {Array}  o.items       opportunities being compared
 * @param {Array}  o.dimensions  [{ key, label, values: [], note }]
 */
export function comparisonTray({ items = [], dimensions = [], max = 4 }) {
  if (!items.length) {
    return html`<p class="empty">Nothing selected to compare yet. Add two or three opportunities and their
      differences will line up here.</p>`;
  }
  const shown = items.slice(0, max);

  return html`<div class="tray">
    ${items.length > max
      ? html`<p class="tray__limit">Comparing the first ${max} of ${items.length}. More than four at once stops
          being a comparison and starts being a table.</p>`
      : ''}
    <div class="table-scroll">
      <table class="data tray__table">
        <thead>
          <tr>
            <th scope="col">Dimension</th>
            ${shown.map((i) => html`<th scope="col"><a href="${url(i.href)}">${i.name}</a><br><small>${i.institution}</small></th>`)}
          </tr>
        </thead>
        <tbody>
          ${dimensions.map((d) => {
            const values = shown.map((_, n) => d.values[n]);
            const known = values.filter((v) => v != null && v !== '');
            const allSame = known.length > 1 && new Set(known.map(String)).size === 1;
            return html`<tr data-dimension="${d.key}"${allSame ? raw(' data-same="true"') : ''}>
              <th scope="row">${d.label}${d.note ? html`<br><small>${d.note}</small>` : ''}</th>
              ${values.map(
                (v) => html`<td>${
                  v == null || v === ''
                    ? html`<span class="tray__missing">Not recorded</span>`
                    : v
                }</td>`
              )}
            </tr>`;
          })}
        </tbody>
      </table>
    </div>
    <p class="tray__note">Dimensions are kept apart on purpose. There is no overall score, because the weighting
      would be ours and the decision is yours.</p>
  </div>`;
}

/* ========================================================================
   States — designed, not accidental
   ======================================================================== */

export const STATE = {
  loading: (what = 'Loading') =>
    html`<p class="state state--loading" role="status">${what}…</p>`,

  empty: (what, suggestion) =>
    html`<div class="state state--empty">
      <p><strong>${what}</strong></p>
      ${suggestion ? html`<p>${suggestion}</p>` : ''}
    </div>`,

  stale: (checkedAt, reviewBy) =>
    html`<div class="state state--stale" role="status">
      <p><strong>This was last checked on ${checkedAt}</strong>${reviewBy ? html` and was due for review on ${reviewBy}` : ''}.
      Treat it as a starting point and confirm at the source.</p>
    </div>`,

  conflict: (detail) =>
    html`<div class="state state--conflict" role="alert">
      <p><strong>Sources disagree about this.</strong> ${detail || 'The result is held back until a person resolves it.'}
      It is deliberately not settled by taking the more generous reading.</p>
    </div>`,

  error: (what) =>
    html`<div class="state state--error" role="alert">
      <p><strong>Something here did not load.</strong> ${what || 'The rest of the page still works.'}</p>
    </div>`,

  noMap: () =>
    html`<p class="state state--nomap">The map is not available, so everything is listed below instead. Nothing is
      missing — the list is what the map is drawn from.</p>`,
};
