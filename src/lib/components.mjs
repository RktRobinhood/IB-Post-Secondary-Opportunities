import { html, raw, md, truncate, plural, escape } from './html.mjs';
import { url } from './layout.mjs';
import { emptyPanel } from './imagery.mjs';

/* --- Page furniture ------------------------------------------------------ */

export function crumbs(trail) {
  return html`<nav aria-label="Breadcrumb"><ol class="crumbs">
    <li><a href="${url('/')}">Home</a></li>
    ${trail.map((t, i) =>
      i === trail.length - 1
        ? html`<li aria-current="page">${t.label}</li>`
        : html`<li><a href="${url(t.href)}">${t.label}</a></li>`
    )}
  </ol></nav>`;
}

export function eyebrow(text, mod = '') {
  return html`<p class="eyebrow ${mod}">${text}</p>`;
}

export function sectionHead({ num, eyebrow: eb, title, lede, id }) {
  return html`<header class="section-head"${id ? raw(` id="${id}"`) : ''}>
    ${num ? html`<p class="section-head__num">${num}</p>` : ''}
    ${eb ? html`<p class="eyebrow">${eb}</p>` : ''}
    <h2>${title}</h2>
    ${lede ? html`<p class="lede">${lede}</p>` : ''}
  </header>`;
}

/* --- Scenes -------------------------------------------------------------- */

/*
 * A page has three kinds of scene and they are three different shapes.
 *
 *   **Arrival** — `hero({ variant: 'arrival' })`. Full-bleed, the largest type
 *   on the site, one sentence, one invitation, and a quiet way past it.
 *   **Chapter** — `mapChapter()` in primitives.mjs. A number, a question, a
 *   camera, one invitation.
 *   **Close** — `close()`. The end of the page: what to do now, once.
 *
 * Every one of them takes its invitation as a single object rather than a block
 * of markup, which is how "one obvious invitation per scene" stops being advice
 * and starts being something you would have to change a signature to break.
 * `hero()`'s free-form `actions` slot survives for the interior pages that are
 * not scenes — a country page opens with a heading, not with an arrival — and
 * is ignored where an `invitation` is given, so the two cannot both render.
 */

/**
 * @param {object} o
 * @param {string} o.title
 * @param {string} [o.lede]
 * @param {string} [o.eyebrow]
 * @param {object} [o.image]  { src, alt, focal, credit: {text, url} }
 * @param {object} [o.invitation] { href, label } — exactly one, and it wins over `actions`
 * @param {object} [o.escape]     { href, label } — the way past the invitation
 * @param {any}    [o.actions]
 * @param {any}    [o.aside]  extra content under the lede
 * @param {string} [o.variant] 'arrival' | 'compact' | 'plain' | 'panel'
 *
 * 'arrival' is the opening scene of a page that has one: full-bleed, and sized
 * so that the sentence and the single invitation are the only things competing
 * for attention. 'plain' is a hero that never wanted a photograph — About,
 * Compare, the glossary. 'panel' is a hero that wanted one and has none,
 * because nothing publishable was found: same typography, but it says so by
 * looking deliberate rather than by looking like a heading. They are different
 * situations and a reader can tell, which is the whole argument for not
 * collapsing them.
 */
export function hero(o) {
  const plain = o.variant === 'plain' || o.variant === 'panel';
  const cls = [
    'hero',
    o.variant === 'arrival' && 'hero--arrival',
    o.variant === 'compact' && 'hero--compact',
    plain && 'hero--plain',
    o.variant === 'panel' && 'hero--panel',
  ]
    .filter(Boolean)
    .join(' ');
  return html`<section class="${cls}"${o.image?.focal ? raw(` style="--focal:${o.image.focal}"`) : ''}>
    ${o.image
      ? html`<div class="hero__media"${
          // Further pictures of the same place, as data rather than as markup.
          // A slide that is in the DOM is a slide the browser downloads, even
          // at opacity 0 — so the script creates each one only when it is about
          // to be shown, and a reader who never waits never pays for them.
          o.slides?.length ? raw(` data-slides="${escape(JSON.stringify(o.slides))}"`) : ''
        }>
          <img src="${url(o.image.src)}" alt="${o.image.alt || ''}" fetchpriority="high" decoding="async" width="2000" height="1200">
        </div>`
      : ''}
    <div class="wrap wrap--wide">
      ${o.crumbs || ''}
      ${o.eyebrow ? html`<p class="eyebrow">${o.eyebrow}</p>` : ''}
      <h1>${o.title}</h1>
      ${o.lede ? html`<p class="lede">${o.lede}</p>` : ''}
      ${o.aside || ''}
      ${o.invitation
        ? html`<div class="hero__actions hero__actions--one">
            <a class="btn btn--primary btn--lg" href="${url(o.invitation.href)}">${o.invitation.label}</a>
            ${o.escape
              ? html`<a class="hero__escape" href="${url(o.escape.href)}">${o.escape.label}</a>`
              : ''}
          </div>`
        : o.actions
          ? html`<div class="hero__actions">${o.actions}</div>`
          : ''}
    </div>
    ${o.slides?.length
      ? html`<p class="hero__caption" data-hero-caption hidden></p>`
      : ''}
    ${o.image?.credit
      ? html`<p class="hero__credit" data-hero-credit>${
          o.image.credit.url
            ? html`<a href="${o.image.credit.url}" rel="noopener nofollow">${o.image.credit.text}</a>`
            : o.image.credit.text
        }</p>`
      : ''}
  </section>`;
}

/**
 * The closing scene: what a student does now that they have read the page.
 *
 * It exists because every page on this site used to stop rather than end —
 * the last section was whatever happened to be last, and the reader was left
 * at the footer with four columns of links and no suggestion. One heading, one
 * sentence, one invitation, and `also` for the things that are genuinely next
 * but are not the point.
 *
 * @param {object} o
 * @param {string} [o.eyebrow]
 * @param {string} o.title
 * @param {string} [o.copy]        markdown
 * @param {object} o.invitation    { href, label } — exactly one
 * @param {Array}  [o.also]        [{ href, label }] quieter links beside it
 */
export function close({ eyebrow, title, copy, invitation, also = [] }) {
  return html`<section class="close">
    <div class="wrap wrap--prose">
      ${eyebrow ? html`<p class="eyebrow">${eyebrow}</p>` : ''}
      <h2>${title}</h2>
      ${copy ? md(copy) : ''}
      ${invitation
        ? html`<p class="close__go"><a class="btn btn--solid btn--lg" href="${url(invitation.href)}">${invitation.label}</a></p>`
        : ''}
      ${also.length
        ? html`<p class="close__also">${also.map(
            (a, i) => html`${i ? ' · ' : ''}<a href="${url(a.href)}">${a.label}</a>`
          )}</p>`
        : ''}
    </div>
  </section>`;
}

/* --- Cards --------------------------------------------------------------- */

/**
 * `placeholder: true` asks for the typographic panel when no picture is
 * publishable, which is not the same thing as a card that never wanted one. The
 * three navigation cards on the home page have no image on purpose and would
 * look absurd with a monogram; an institution card with no image has a hole in
 * a grid of photographs. So the caller says which kind of card it is, once, and
 * `emptyPanel()` decides what goes in it.
 */
export function card({ href, title, text, image, flag, meta, tags, logo, external, placeholder }) {
  const panel = !image && placeholder ? emptyPanel(typeof placeholder === 'string' ? placeholder : title) : null;
  return html`<article class="card card--link">
    ${image
      ? html`<div class="card__media">
          <img src="${url(image.src)}" alt="${image.alt || ''}" loading="lazy" decoding="async" width="800" height="500">
          ${flag ? html`<span class="card__flag" aria-hidden="true">${flag}</span>` : ''}
        </div>`
      : panel
      ? html`<div class="card__media card__media--empty" aria-hidden="true">
          <span class="card__monogram">${panel.initials}</span>
          ${/* An institution whose name is already an acronym — LUNEX, RCSI,
                KAIST — has a monogram identical to its label, and printing both
                reads as a rendering fault rather than as a design. */
            panel.initials === panel.label
              ? ''
              : html`<span class="card__panel-label">${panel.label}</span>`}
          ${flag ? html`<span class="card__flag">${flag}</span>` : ''}
        </div>`
      : ''}
    <div class="card__body">
      ${logo ? html`<span class="logo-chip"><img src="${url(logo.src)}" alt="" loading="lazy"></span>` : ''}
      <h3 class="card__title"><a href="${external ? href : url(href)}"${
        external ? raw(' rel="noopener"') : ''
      }>${title}</a></h3>
      ${text ? html`<p class="card__text">${truncate(text, 150)}</p>` : ''}
      ${tags?.length
        ? html`<ul class="tags">${tags.map((t) =>
            // A tag may be a plain string, or {label, mod} where the modifier
            // separates a claim about our coverage from a description of the
            // place. Two identical pills, one saying "we researched this" and
            // one saying "few courses in English", read as the same kind of
            // thing and are not.
            typeof t === 'string'
              ? html`<li class="tag">${t}</li>`
              : html`<li class="tag tag--${t.mod || 'brand'}">${t.label}</li>`
          )}</ul>`
        : ''}
      ${meta?.length ? html`<div class="card__foot">${meta.map((m) => html`<span>${m}</span>`)}</div>` : ''}
    </div>
  </article>`;
}

/* --- Small pieces -------------------------------------------------------- */

export function note(body, { kind = '', title } = {}) {
  const cls = kind ? `note note--${kind}` : 'note';
  return html`<aside class="${cls}">
    ${title ? html`<p class="note__title">${title}</p>` : ''}
    ${typeof body === 'string' ? md(body) : body}
  </aside>`;
}

export function stats(items) {
  return html`<div class="stats">
    ${items.map(
      (s) => html`<div class="stat">
        <span class="stat__value">${s.value}</span>
        <span class="stat__label">${s.label}</span>
      </div>`
    )}
  </div>`;
}

export function facts(rows) {
  const real = rows.filter((r) => r && r.value !== null && r.value !== undefined && r.value !== '');
  if (!real.length) return '';
  return html`<dl class="facts">
    ${real.map(
      (r) => html`<div>
        <dt>${r.label}</dt>
        <dd>${typeof r.value === 'string' ? md(r.value) : r.value}</dd>
      </div>`
    )}
  </dl>`;
}

export function tags(items, mod = '') {
  if (!items?.length) return '';
  return html`<ul class="tags">${items.map((t) => html`<li class="tag ${mod}">${t}</li>`)}</ul>`;
}

export function steps(items) {
  return html`<ol class="steps">
    ${items.map(
      (s) => html`<li>
        ${s.title ? html`<h3>${s.title}</h3>` : ''}
        ${typeof s.body === 'string' ? md(s.body) : s.body || md(s)}
      </li>`
    )}
  </ol>`;
}

export function sources(list, { title = 'Sources' } = {}) {
  if (!list?.length) return '';
  return html`<section class="sources">
    <h2>${title}</h2>
    <ol>
      ${list.map(
        (s) => html`<li>
          <a href="${s.url}" rel="noopener nofollow">${s.title || s.url}</a>${
            s.retrieved ? html` — checked ${s.retrieved}` : ''
          }${s.note ? html`. ${s.note}` : ''}
        </li>`
      )}
    </ol>
  </section>`;
}

export function stamp(dateString, { label = 'Checked' } = {}) {
  if (!dateString) return '';
  const then = new Date(dateString);
  const monthsOld = (Date.now() - then.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  const stale = monthsOld > 9;
  const pretty = then.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return html`<span class="stamp ${stale ? 'stamp--stale' : ''}">${label} ${pretty}</span>`;
}

export function pager({ prev, next }) {
  if (!prev && !next) return '';
  return html`<nav class="pager" aria-label="More pages">
    ${prev ? html`<a href="${url(prev.href)}"><span>Previous</span><b>${prev.label}</b></a>` : ''}
    ${next ? html`<a href="${url(next.href)}"><span>Next</span><b>${next.label}</b></a>` : ''}
  </nav>`;
}

export function accordion(items) {
  return html`<div>${items.map(
    (i) => html`<details class="acc"${i.open ? raw(' open') : ''}>
      <summary>${i.q}</summary>
      ${typeof i.a === 'string' ? md(i.a) : i.a}
    </details>`
  )}</div>`;
}

export function dataTable({ caption, head, rows, className = 'data' }) {
  /* Each cell carries the heading of the column it is in.
   *
   * A wide table read through a phone is a canvas scrubbed sideways: the
   * comparison index is six columns and fifty rows, and at 375px that was an
   * 857px scroll inside a 343px window. The stylesheet can turn a table into
   * one card per row at phone width — but only if a cell can say which
   * question it answers, because CSS cannot read a `th` into a `td`. Without
   * that, the cells stack as "Limited.", "No tuition fee during the
   * standard..." — prose fragments with nothing to anchor them, which is worse
   * than the scroll.
   *
   * So the label travels with the cell. `compare.js` already does this for the
   * tray it builds in the browser, and the CSS is keyed on
   * `table.data:has(td[data-label])` rather than on either component — a fact
   * about labelled cells, so every table built through here gets it. */
  const labelFor = (h) => (typeof h === 'object' ? h?.label : h) ?? '';

  return html`<div class="table-scroll">
    <table class="${className}">
      ${caption ? html`<caption>${caption}</caption>` : ''}
      <thead><tr>${head.map((h) =>
        typeof h === 'object' ? html`<th class="${h.num ? 'num' : ''}" scope="col">${h.label}</th>` : html`<th scope="col">${h}</th>`
      )}</tr></thead>
      <tbody>${rows.map(
        (r) => html`<tr>${r.map((c, i) =>
          typeof c === 'object' && c && c.num !== undefined
            ? html`<td class="num" data-label="${labelFor(head[i])}">${c.num}</td>`
            : html`<td data-label="${labelFor(head[i])}">${typeof c === 'string' ? md(c) : c}</td>`
        )}</tr>`
      )}</tbody>
    </table>
  </div>`;
}

/* --- Domain-specific ----------------------------------------------------- */

/** A compact line describing a programme's Danish entry requirements. */
export function requirementLine(entry) {
  if (!entry) return '';
  const fmt = (r) => `${r.subject} ${r.level}${r.minGrade ? ` (min ${r.minGrade})` : ''}`;
  const parts = [];
  if (entry.all?.length) parts.push(entry.all.map(fmt).join(' · '));
  if (entry.oneOf?.length) {
    parts.push('one of: ' + entry.oneOf.map((group) => group.map(fmt).join(' + ')).join(' / '));
  }
  return parts.join(' — ');
}

/**
 * Says how much weight a page's facts can carry: which intake they describe,
 * when they were last read, and whether any of it is inherited from a previous
 * cycle rather than confirmed for this one.
 *
 * Deliberately plain rather than reassuring. A student who is about to act on a
 * deadline should be able to tell in one glance whether it has been confirmed.
 */
export function freshness({ intake, checkedAt, level = 'verified', reviewBy, provisional = 0 } = {}) {
  const LABEL = {
    verified: ['ok', 'Checked against the source'],
    'needs-review': ['', 'Read from the source, not yet checked by a person'],
    stale: ['warn', 'Past its review date'],
    superseded: ['warn', 'Superseded and not yet replaced'],
    unavailable: ['warn', 'The source could not be reached'],
    conflicting: ['warn', 'Sources disagree'],
    none: ['warn', 'No source recorded'],
  };
  const [kind, label] = LABEL[level] || LABEL.verified;

  const pretty = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

  return html`<aside class="freshness freshness--${kind || 'plain'}">
    <p class="freshness__line">
      <strong>${label}.</strong>
      ${checkedAt ? html` Last read ${pretty(checkedAt)}.` : ''}
      ${intake ? html` Describes the ${intake.replace('-', ' ')} intake.` : ''}
    </p>
    ${provisional
      ? html`<p class="freshness__line freshness__line--warn">
          ${plural(provisional, 'date on this page is', 'dates on this page are')} carried over from the previous
          cycle because the authority has not yet published this one. Treat ${provisional === 1 ? 'it' : 'them'}
          as indicative and check before you rely on ${provisional === 1 ? 'it' : 'them'}.
        </p>`
      : ''}
    ${reviewBy && reviewBy < new Date().toISOString().slice(0, 10)
      ? html`<p class="freshness__line freshness__line--warn">
          This was due for review on ${pretty(reviewBy)} and has not been re-checked.
        </p>`
      : ''}
  </aside>`;
}

export function emptyState(text) {
  return html`<p class="empty">${text}</p>`;
}

/**
 * A context note: how a place actually behaves, as opposed to what it requires.
 *
 * The presentation carries the same weight as the data rule behind it. Three
 * things are deliberate and none is decoration:
 *
 *   The attribution is inside the note, not in a footnote. A student who reads
 *   only the first line still learns who is talking.
 *
 *   The confidence is stated in words rather than implied by styling. "One
 *   source says this" is information; a slightly paler background is not.
 *
 *   A contested note shows the counterpoint in the same block, at the same
 *   size. Showing a disagreement from one side only is worse than not showing
 *   it, because the reader gets the confidence without the doubt.
 */
export function contextNote(n) {
  if (!n) return '';
  const CONFIDENCE = {
    'widely-reported': 'Several sources agree on this',
    'single-source': 'One source says this — worth knowing, worth checking',
    contested: 'Sources disagree, and the disagreement is the useful part',
  };
  return html`<aside class="context" aria-label="Context, not a requirement">
    <p class="context__kind">Context, not a rule</p>
    <h3 class="context__topic">${n.topic}</h3>
    <div class="context__body">${md(n.text)}</div>
    ${n.counterpoint
      ? html`<div class="context__counter">
          <p class="context__counter-label">Others disagree</p>
          ${md(n.counterpoint)}
        </div>`
      : ''}
    ${n.whatThisIsNot ? html`<p class="context__not"><strong>Not to be confused with:</strong> ${n.whatThisIsNot}</p>` : ''}
    <footer class="context__foot">
      <span class="context__who">${n.attribution}</span>
      <span class="context__confidence">${CONFIDENCE[n.confidence] || n.confidence}</span>
    </footer>
  </aside>`;
}

/** A run of context notes, with nothing rendered when there are none. */
export function contextNotes(list, { title = 'What it is actually like' } = {}) {
  const notes = (list || []).filter(Boolean);
  if (!notes.length) return '';
  return html`<div class="context-set">
    <h2 class="context-set__title">${title}</h2>
    <p class="context-set__lede">These are observations rather than rules — the things people who have
    watched students go through this tend to say. Nothing here decides whether you can apply.</p>
    ${notes.map(contextNote)}
  </div>`;
}

/**
 * How a country's post-secondary system is actually organised.
 *
 * Renders entirely from the record, including the local names, so it works for
 * a country whose categories nobody here has heard of. There is no branch on a
 * destination anywhere in this function, and scripts/test-credentials.mjs fails
 * if one appears — the moment a template starts saying "if France", the data
 * model has stopped carrying the meaning and the fix belongs there.
 */
export function sectorLandscape(landscape, { destinationName = 'this country' } = {}) {
  if (!landscape?.routes?.length) return '';

  const ACCESS = {
    yes: { label: 'Open to IB', cls: 'ok' },
    partly: { label: 'Partly open to IB', cls: 'warn' },
    rarely: { label: 'Rarely open to IB', cls: 'warn' },
    unknown: { label: 'Not yet checked', cls: 'mute' },
  };
  const ENGLISH = {
    common: 'Often taught in English',
    some: 'Some English-taught',
    rare: 'Rarely English-taught',
    none: 'Not taught in English',
    unknown: 'Language of instruction not yet checked',
  };

  return html`<div class="landscape">
    <h2 id="landscape">The shape of ${destinationName}'s system</h2>
    <p class="landscape__summary">${landscape.summary}</p>
    <ul class="landscape__routes">
      ${landscape.routes.map((r) => {
        const access = ACCESS[r.ibAccessible] || ACCESS.unknown;
        return html`<li class="route">
          <div class="route__head">
            <h3 class="route__name" lang="">${r.localName}</h3>
            ${r.englishName && r.englishName.toLowerCase() !== r.localName.toLowerCase()
              ? html`<span class="route__en">${r.englishName}</span>`
              : ''}
          </div>
          <p class="route__what">${r.what}</p>
          <div class="route__flags">
            <span class="flag flag--${access.cls}">${access.label}</span>
            <span class="flag flag--mute">${ENGLISH[r.englishTaught] || ENGLISH.unknown}</span>
          </div>
          ${r.note ? html`<p class="route__note">${r.note}</p>` : ''}
        </li>`;
      })}
    </ul>
  </div>`;
}
