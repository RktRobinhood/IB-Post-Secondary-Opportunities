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
import { formatWhen, consequenceOf, isClosed, READER_ACCESS } from './calendar.mjs';

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
  const pattern = ['none', 'latitude', 'grid', 'wave'].includes(source.pattern) ? source.pattern : 'none';
  const focal = /^\d{1,3}% \d{1,3}%$/.test(source.focal || '') ? source.focal : '50% 45%';

  /*
   * Every one of the thirty-four accents in `data/countries` was chosen against
   * warm paper, and not one record carries an `accentDark`. In dark mode that
   * put a mid-dark, saturated dot on a near-black sea with a near-black stroke
   * around it — a country's identity, drawn in a colour nobody could see. The
   * dark accent is therefore derived rather than demanded: the same hue, lifted
   * towards the dark theme's ink until it reads on the dark sea.
   *
   * `#F3ECE0` is the literal the dark theme sets `--ink` to. It has to be a
   * literal because this value is computed in every theme and only *used* in
   * one, so reading `var(--ink)` here would mix the light theme's near-black
   * into the light theme's accent and darken it for nobody's benefit.
   *
   * A record may still state its own `accentDark` and is believed when it does.
   * This is still colour and nothing but colour: the whitelist has not grown,
   * and art direction still cannot reorder, hide or re-rank a single thing.
   */
  const accentDark = hex(source.accentDark) || (accent ? `color-mix(in oklab, ${accent} 55%, #F3ECE0)` : null);

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
   WorldWindow — the globe, and the list it is drawn from
   ======================================================================== */

/**
 * The places a page holds, as a list — and, where the browser can draw it, as
 * the globe drawn from that list (ADR 0005, ADR 0007).
 *
 * **There is no build-time map any more.** Until 26 September 2026 this wrote
 * an inline SVG flat map that was the first paint, the no-JavaScript map and
 * the no-WebGL map, and `assets/js/map.js` cross-faded it out under the globe.
 * The owner saw it flash before every globe and asked for it to go (issue
 * #53, ADR 0007). What this writes now:
 *
 *   - an empty, transparent stage the size the globe will be, so nothing on
 *     the page moves when it lands, and nothing different is drawn first;
 *   - the places as JSON for the globe (`world__data`);
 *   - the list, which is the control and the source of truth, and which is
 *     the whole of the world window where the globe cannot run (no
 *     JavaScript, no WebGL, a software renderer): primitives.css hides the
 *     stage and shows the one line `world__off` instead.
 *
 * The pins are a picture of the list and nothing but: not focusable, no name
 * of their own. Everything a pin does, its list entry does.
 *
 * @param {object} o
 * @param {Array}  o.places   [{ id, name, lat, lon, count, href, precision, state }]
 *                            `state` is a short, record-derived confidence cue —
 *                            the wording is the caller's, because this file does
 *                            not know what kind of record a place stands for.
 * @param {object} [o.bounds] { north, south, west, east } — a region the page
 *                            is about, which the globe frames (`data-frame`)
 * @param {string} [o.caption]
 * @param {string} [o.activeLayer] what the lights currently mean
 * @param {string} [o.unit]   what `count` counts, singular ("programme"), for
 *                            the globe's cards. Absent: the cards show no count.
 *
 * A place may also carry `country` (the ISO code of the Destination it sits in,
 * so the globe can total a country without guessing from a raster), `image`
 * (a picture the page already shows of it), `external` (its `href` leaves
 * the site) and `schools` — for a light that stands for a whole country, the
 * institutions inside it that have their own position, as
 * [{ id, name, lat, lon, href, city }]. The globe shows those as their own
 * dots once the camera is close enough to that country (country → schools).
 */
export function worldWindow({ places = [], bounds, caption, activeLayer = 'Opportunities in view', id = 'world', unit = '', foldList = '' }) {
  const dots = places
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon))
    // The list's order: the biggest first, as the lights were always drawn.
    .sort((a, b) => (b.count || 0) - (a.count || 0));

  // How exactly this light is placed, in one phrase, written once. The pin
  // carries it and so does the list entry, because the reader who cannot hover
  // needs it as much as the one who can.
  // `institution` locates the institution itself (schemas/common.schema.json),
  // finer than a city: it carries no cue, like a campus.
  const cueFor = (p) =>
    !p.precision || p.precision === 'campus' || p.precision === 'institution'
      ? ''
      : p.precision === 'region'
        ? 'Placed at the country, not at a campus'
        : 'Placed at the city, not at the campus';

  // What the globe needs about every place. `<` is escaped so no record can
  // close the script element.
  const globeData = JSON.stringify(
    dots.map((d) => ({
      id: d.id,
      name: d.name,
      lat: +d.lat.toFixed(4),
      lon: +d.lon.toFixed(4),
      count: d.count || 0,
      href: d.href ? url(d.href) : '',
      state: d.state || '',
      cue: cueFor(d),
      precision: d.precision || '',
      country: d.country || '',
      image: d.image ? url(d.image) : '',
      external: !!d.external,
      ...(d.schools?.length
        ? {
            schools: d.schools
              .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lon))
              .map((s) => ({
                id: s.id,
                name: s.name,
                lat: +s.lat.toFixed(4),
                lon: +s.lon.toFixed(4),
                href: s.href ? url(s.href) : '',
                city: s.city || '',
              })),
          }
        : {}),
    }))
  ).replace(/</g, '\\u003c');

  const listName = foldList ? `“${foldList}” below` : 'the list below';

  return html`<figure class="world" id="${id}" data-world data-layer="${activeLayer}"${unit ? html` data-unit="${unit}"` : ''}${
    bounds ? html` data-frame="${[bounds.north, bounds.south, bounds.west, bounds.east].join(',')}"` : ''}>
  <div class="world__stage">
    <script type="application/json" class="world__data">${raw(globeData)}</script>
  </div>
  <p class="world__off">This browser cannot draw the globe. Every place is in ${listName}.</p>

  <!-- The semantic list is the interaction source of truth. The globe is an
       enhancement of it, never a replacement — so this works with a keyboard,
       a screen reader, and no JavaScript at all. Everything a pin's card says
       is written into the entry itself, because a cue a mouse can read and a
       keyboard cannot is not a cue. -->
  ${/* A page whose own filters already name every place (the home page's
        "Where") folds the list behind one line: it is still the keyboard's
        and the screen reader's way in, one tap away. */
    foldList ? raw(`<details class="world__fold"><summary>${foldList} (${dots.length})</summary>`) : ''}
  <ul class="world__list" aria-label="${activeLayer}">
    ${dots.map(
      (d) => html`<li>
        <a href="${d.href ? url(d.href) : `#${id}`}" data-place="${d.id}"${d.href && d.external ? raw(' rel="noopener nofollow"') : ''}>
          <span class="world__name">${d.name}</span>
          ${d.count ? html`<span class="world__count">${d.count}</span>` : ''}
          ${d.state ? html`<span class="visually-hidden">. ${d.state}</span>` : ''}
          ${cueFor(d) ? html`<span class="visually-hidden">. ${cueFor(d)}</span>` : ''}
        </a>
      </li>`
    )}
  </ul>
  ${foldList ? raw('</details>') : ''}

  ${/* One line under the globe (home round 2: four grey paragraphs between the
        globe and the results). The rest — hollow markers, how to use it — one
        tap down. The globe adds its own hint to the caption; site.css shows it
        only while "How to use" is open. */ ''}
  <figcaption class="world__caption">
    <span class="world__legend">
      <span class="world__legend-dot world__legend-dot--sm"></span>
      <span class="world__legend-dot world__legend-dot--lg"></span>
      Bigger light, more ${unit ? `${unit}s` : 'opportunities'}
    </span>
    ${(() => {
      /* One line for every hollow marker, however many kinds of place it
         stands for (round 4: two "Hollow markers" lines that disagreed). */
      const kinds = [...new Set(dots.filter((d) => cueFor(d)).map((d) => (d.precision === 'region' ? 'country' : 'city')))].sort();
      const more = [
        'Size says how much is here, not how good a place is.',
        kinds.length ? `Hollow markers: placed at the ${kinds.join(' or the ')}, not at a campus.` : '',
        caption || '',
      ].filter(Boolean);
      return html`<details class="world__how"><summary>How to use the globe</summary>${more.map((t) => html`<span class="world__legend">${t}</span>`)}</details>`;
    })()}
  </figcaption>
</figure>`;
}

/* ========================================================================
   MapChapter — a configured step in a geographic journey
   ======================================================================== */

/**
 * One step in a curated geographic journey: a number, the question this step
 * asks, the copy that answers it, a camera pointed at the places it is about,
 * and exactly one way out.
 *
 * Chapters are content, not code. A new journey is a new array of these, and
 * nothing in here knows which journey it is on.
 *
 * **Where the camera is.** The Mapbox pattern this borrows from keeps one map
 * on screen and flies it to the active chapter's target as the reader scrolls.
 * That is not what happens here, and the difference is deliberate: the research
 * doc forbids scroll hijacking and narrative text that leaves before it can be
 * read. So a chapter's camera is resolved at build time — `bounds`, written
 * as the figure's `data-frame`, or the frame `places` implies — and the
 * reader is handed the view already arrived at. `assets/js/map.js` then wires
 * each one like any other world window (a globe since ADR 0005; the list alone
 * where the globe cannot run, ADR 0007).
 *
 * **There is no motion policy, and there was.** The doc's chapter carries one,
 * and this took a `motion` parameter that wrote `data-motion` for the stylesheet
 * to animate the frame's arrival. Both went: a CSS transform on a thousand-path
 * inline SVG buys a composited layer on first paint for an effect no reader
 * asked for, which is the wrong side of the performance contract, and the
 * `geographic` token that wanted it was deleted rather than left unspent. The
 * notes in `assets/css/primitives.css` and above `MOTION` in
 * `src/lib/motion.mjs` carry the reasoning. A parameter declaring a policy that
 * nothing enacts is the same lie as a primitive nothing calls, so it went too,
 * and it comes back when something genuinely flies a camera.
 *
 * **What is highlighted.** A chapter's `places` *are* its highlighted set.
 * There is no separate list of ids, because a highlight that no reader without
 * JavaScript can see is a field that lies about what the page does — the frame
 * is fitted to these places and only these places are lit.
 *
 * **One invitation.** `invitation` is a single link, not an array, and that is
 * the whole enforcement of "one obvious invitation per scene": a chapter that
 * wants to offer two things cannot, without someone changing this signature and
 * having to argue for it.
 *
 * @param {object} o
 * @param {number} [o.index]       chapter number, printed in the margin
 * @param {string} [o.eyebrow]     the question this chapter asks
 * @param {string} o.title
 * @param {string} [o.copy]        markdown
 * @param {string} [o.scope]       what the lights currently add up to, in a sentence
 * @param {Array}  [o.places]      the chapter's highlighted set — and its camera
 * @param {object} [o.bounds]      an explicit camera target, when the places do not imply one
 * @param {string} [o.layer]       what the lights mean, for the legend and the label
 * @param {object} [o.media]       a picture instead of a camera
 * @param {object} [o.invitation]  { href, label } — exactly one
 */
export function mapChapter({
  index = 1,
  eyebrow,
  title,
  copy,
  scope,
  places = [],
  bounds,
  layer,
  caption,
  media,
  invitation,
}) {
  const stage = media
    ? html`<figure class="chapter__figure">
        <img src="${url(media.src)}" alt="${media.alt || ''}" loading="lazy" decoding="async" width="900" height="560">
        ${media.credit
          ? html`<figcaption>${
              media.credit.url
                ? html`<a href="${media.credit.url}" rel="noopener nofollow">${media.credit.text}</a>`
                : media.credit.text
            }</figcaption>`
          : ''}
      </figure>`
    : places.length
      ? worldWindow({
          places,
          bounds,
          id: `chapter-${index}`,
          activeLayer: layer || title,
          caption,
        })
      : null;

  return html`<section class="chapter${stage ? '' : ' chapter--solo'}" data-chapter="${index}">
    <div class="chapter__text">
      <p class="chapter__num">${String(index).padStart(2, '0')}</p>
      ${eyebrow ? html`<p class="chapter__q">${eyebrow}</p>` : ''}
      <h2>${title}</h2>
      ${copy ? md(copy) : ''}
      ${scope ? html`<p class="chapter__scope">${scope}</p>` : ''}
      ${invitation
        ? html`<p class="chapter__go"><a class="arrow-link" href="${url(invitation.href)}">${invitation.label}</a></p>`
        : ''}
    </div>
    ${stage ? html`<div class="chapter__stage">${stage}</div>` : ''}
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
 * @param {Array}  o.options    [{ value, label, count, href }]
 * @param {string} [o.type]     'select' | 'chips' | 'links'
 */
export function filterQuestion({ id, question, field, options = [], type = 'select', help }) {
  /*
   * `links` is the same question asked where there is no query state to change
   * yet — on the home page, ahead of the explorer. Each option carries the URL
   * that *is* the answer, so the first choice a student makes is a link rather
   * than a control, works with JavaScript switched off, and arrives at the
   * explorer with the filter already applied and already removable. The field
   * is still declared, because it is still the canonical field the href sets.
   */
  if (type === 'links') {
    return html`<div class="filter-q filter-q--links" data-field="${field}">
      <p class="filter-q__question" id="${id}">${question}</p>
      ${help ? html`<p class="filter-q__help">${help}</p>` : ''}
      <ul class="chips chips--links" aria-labelledby="${id}">
        ${options.map(
          (o) => html`<li><a class="chip" href="${url(o.href)}" data-filter="${field}" data-value="${o.value}">
            ${o.label}${o.count != null ? html` <span class="chip__count">${o.count}</span>` : ''}
          </a></li>`
        )}
      </ul>
    </div>`;
  }

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
export function preparationPath({ id, goal, relevance = 'preparation', timing, why, evidence = [], scope = null }) {
  const [cls, label] = RELEVANCE[relevance] || RELEVANCE.preparation;
  return html`<article class="prep" data-relevance="${relevance}"${id ? raw(` id="${id}"`) : ''}>
    <header class="prep__head">
      <span class="tag ${cls}">${label}</span>
      ${scope ? html`<span class="prep__scope">${scope}</span>` : ''}
      ${timing ? html`<span class="prep__timing">${timing}</span>` : ''}
    </header>
    <h4>${goal}</h4>
    ${/* The reasoning is the long part, and it is one tap away: the goal and
          its timing are what a student scans for. */
      why ? html`<details class="prep__why"><summary>Why</summary>${md(why)}</details>` : ''}
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

/* ========================================================================
   Dated events
   ======================================================================== */

/**
 * A list of dated events — deadlines, openings, tests, results — rendered the
 * same way wherever they appear.
 *
 * One renderer, because there used to be two and they disagreed. The country
 * pages printed `application.deadlines[]`; `/timeline/` printed a hand-typed
 * array of eighteen events covering a hand-picked subset of the same facts,
 * with no source field and no Verification State, which meant it could drift
 * from the country pages with nothing to catch it (#13). Both now read the
 * model in `src/lib/calendar.mjs`, so a date can only be wrong in one place.
 *
 * Three things this renders that the old one could not, all of which come from
 * the migration rather than from here:
 *
 *   - **What missing it costs.** UCAS publishes an *equal consideration* date,
 *     not a deadline. Rendering both as "Deadline" frightens students
 *     unnecessarily and reassures them wrongly, so the consequence is shown.
 *   - **A window as a window**, with both ends, rather than a sentence.
 *   - **A provisional date as provisional.** A year we inferred from last
 *     cycle is never shown as one that was published.
 *
 * `data-date` is what `site.js` reads to mark what has passed and what is next,
 * so an undated event carries none and is simply never marked — which is
 * correct, and is why the attribute is omitted rather than left empty.
 */
/* The applicant groups in schemas/common.schema.json, as a student reads them.
   The raw value ("non-eu") reached the page for a while and read as "not for
   you" to the EU citizens this site is mostly for. */
const AUDIENCE = {
  'eu-eea-ch': 'EU, EEA and Swiss citizens',
  nordic: 'Nordic citizens',
  domestic: 'citizens and residents of this country',
  'non-eu': 'applicants from outside the EU, EEA and Switzerland',
};

export function deadlineList(events, { showDestination = false, emptyText } = {}) {
  if (!events.length) {
    return STATE.empty(
      emptyText || 'No dates recorded yet.',
      'That is a gap in our research rather than a quiet period — check the official portal.'
    );
  }

  return html`<ul class="timeline">
    ${events.map((e) => deadlineItem(e, { showDestination }))}
  </ul>`;
}

/**
 * A route or date the reader cannot take (#35). Shown rather than hidden — a
 * student who heard of it elsewhere needs telling — but with the exclusion
 * first and nothing a student could mistake for something to act on: no
 * `data-date`, so `site.js` never marks it "next"; no consequence badge; no
 * date in the when column.
 */
function closedItem(e, { showDestination }) {
  return html`<li class="timeline__closed" data-access="closed"
    ${e.destination ? raw(`data-destination="${e.destination}"`) : ''}
  >
    <div class="timeline__when"><span class="timeline__access">${READER_ACCESS.closed.label}</span></div>
    <div class="timeline__what">
      <h4>${showDestination && e.destinationName ? html`<span class="timeline__where">${e.destinationName}</span> ` : ''}${e.label}</h4>
      <p class="timeline__access-reason">${e.access.reason}</p>
      ${e.sources.length
        ? html`<p><small>${e.sources.map(
            (s, i) => html`${i ? raw(' · ') : ''}<a href="${s}" rel="noopener nofollow">${e.sources.length > 1 ? `Source ${i + 1}` : 'Source'}</a>`
          )}</small></p>`
        : ''}
    </div>
  </li>`;
}

function deadlineItem(e, { showDestination }) {
  if (isClosed(e)) return closedItem(e, { showDestination });
  const when = formatWhen(e);
  const c = consequenceOf(e);
  const undated = !e.date;

  /* A legacy string is a date we have not migrated yet, not a date we could not
     find. Showing it as written is better than dropping it, and it must not
     borrow the styling of either a real date or a declared absence. */
  const whenMarkup = undated
    ? e.legacyDate
      ? html`<span class="timeline__legacy" title="Not yet migrated to a structured date">${e.legacyDate}</span>`
      : html`<span class="timeline__unpublished">${when}</span>`
    : when;

  return html`<li
    ${e.date ? raw(`data-date="${e.date}"`) : ''}
    ${/* A window that opened last week is still open: "past" is read off its end. */ e.endDate ? raw(`data-end="${e.endDate}"`) : ''}
    ${e.destination ? raw(`data-destination="${e.destination}"`) : ''}
    ${e.provisional ? raw('data-provisional="true"') : ''}
    ${e.consequence ? raw(`data-consequence="${e.consequence}"`) : ''}
  >
    <div class="timeline__when">
      ${whenMarkup}
      ${e.intake ? html`<br><small>${e.intake}</small>` : ''}
    </div>
    <div class="timeline__what">
      <h4>${showDestination && e.destinationName ? html`<span class="timeline__where">${e.destinationName}</span> ` : ''}${e.label}</h4>
      ${e.access?.state === 'conditional'
        ? html`<p class="timeline__access-reason"><strong>${READER_ACCESS.conditional.label}:</strong> ${e.access.reason}</p>`
        : ''}
      ${e.audience && e.audience !== 'any'
        ? html`<p class="timeline__audience">Applies to: ${AUDIENCE[e.audience] || e.audience}</p>`
        : ''}
      ${e.consequence && e.consequence !== 'indicative'
        ? html`<p class="timeline__consequence"><span class="timeline__badge" data-consequence="${e.consequence}">${c.label}</span>
            ${e.routeLabel ? html`<span class="timeline__route">Via ${e.routeLabel}</span>` : ''}</p>`
        : e.routeLabel ? html`<p class="timeline__route">Via ${e.routeLabel}</p>` : ''}
      ${/* The date, what it is and what missing it costs are the line a student
            scans. What the consequence means, the note and the sources are one
            tap beneath it — the calendar was 66,000 words long with every one of
            them open. */
        (e.consequence && e.consequence !== 'indicative') || e.note || e.sources.length
          ? html`<details class="timeline__more"><summary>Details</summary>
              ${e.consequence && e.consequence !== 'indicative'
                ? html`<p class="timeline__consequence-note">${c.note}</p>`
                : ''}
              ${e.note ? md(e.note) : ''}
              ${e.sources.length
                ? html`<p><small>${e.sources.map(
                    (s, i) => html`${i ? raw(' · ') : ''}<a href="${s}" rel="noopener nofollow">${e.sources.length > 1 ? `Source ${i + 1}` : 'Source'}</a>`
                  )}</small></p>`
                : ''}
            </details>`
          : ''}
    </div>
  </li>`;
}
