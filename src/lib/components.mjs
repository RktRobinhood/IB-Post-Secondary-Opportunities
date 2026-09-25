import { html, raw, md, truncate, plural, escape, toString } from './html.mjs';
import { url } from './layout.mjs';
import { ibTermsLine, ibTermsPhrase, routesPhrase } from './eligibility.mjs';
import { emptyPanel } from './imagery.mjs';
import { CARD_SIZES, srcsetOf } from './programme-imagery.mjs';

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
 *
 * `backdrop` is a different thing from `image`: a faded photograph of a
 * discipline behind the whole card, from `src/lib/programme-imagery.mjs`. It
 * is decorative (`alt=""`), because the card's words already say what the
 * programme is, and it is credited on /credits/. It is positioned absolutely,
 * so it cannot change the card's height, and it loads lazily.
 */
export function card({ href, title, text, image, flag, meta, tags, logo, external, placeholder, aside, req, backdrop, kicker, sub, mod }) {
  const panel = !image && placeholder ? emptyPanel(typeof placeholder === 'string' ? placeholder : title) : null;
  return html`<article class="card card--link${backdrop ? ' card--backdrop' : ''}${mod ? ` ${mod}` : ''}">
    ${backdrop ? backdropImg(backdrop, CARD_SIZES, 'card__backdrop') : ''}
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
      ${/* A word above the title (a field), and the line a reader needs
            straight after it (a degree type), both optional. */
        kicker ? html`<p class="card__kicker">${kicker}</p>` : ''}
      <h3 class="card__title"><a href="${external ? href : url(href)}"${
        external ? raw(' rel="noopener"') : ''
      }>${title}</a></h3>
      ${sub ? html`<p class="card__sub">${sub}</p>` : ''}
      ${text ? html`<p class="card__text">${truncate(text, 150)}</p>` : ''}
      ${/* A programme's requirements, IB terms first (requirementSummary). */ req || ''}
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
      ${/* One short line with its own link, beside the card's main one — for
            a fact about the place that lives on someone else's page, such as
            an institution's IB recognition statement (#38). It sits above the
            stretched title link, so both are reachable and neither swallows
            the other. Absent unless the caller has something to put there. */
        aside?.href
          ? html`<p class="card__aside"><a href="${aside.href}" rel="noopener nofollow">${aside.label}<span aria-hidden="true"> ↗</span></a>${
              aside.text ? html` <span>${aside.text}</span>` : ''
            }</p>`
          : ''}
    </div>
  </article>`;
}

/**
 * The <img> behind a card or a finder row. `explorer.js` and `planner.js`
 * write the same markup on the client from the same fields, so there are three
 * places that must agree. scripts/test-programme-images.mjs checks the built
 * pages.
 */
export function backdropImg(b, sizes, className) {
  return html`<img class="${className}" src="${url(b.src)}" srcset="${srcsetOf(b, url)}" sizes="${sizes}" alt="" loading="lazy" decoding="async" width="${b.width}" height="${b.height}" data-backdrop="${b.key}">`;
}

/* --- Ways in ------------------------------------------------------------- */

/**
 * Large photographic doors: where a page offers a few places to go next and
 * each is a place. The picture fills the tile and the words sit on it — a
 * name, a count and one line — because the door is the invitation and the
 * page behind it is the explanation.
 *
 * @param {Array} items [{ href, eyebrow, title, count, line, image }]
 */
export function doors(items) {
  return html`<div class="doors">${items.map(
    (d) => html`<a class="door" href="${url(d.href)}">
      ${d.image
        ? html`<img class="door__img" src="${url(d.image.src)}" alt="" loading="lazy" decoding="async" width="900" height="1100">`
        : ''}
      <span class="door__text">
        <span class="door__eyebrow">${d.eyebrow}</span>
        <span class="door__title">${d.title}</span>
        ${d.count ? html`<span class="door__count">${d.count}</span>` : ''}
        ${d.line ? html`<span class="door__line">${d.line}</span>` : ''}
      </span>
      ${d.image?.credit?.text ? html`<span class="door__credit">${d.image.credit.text}</span>` : ''}
    </a>`
  )}</div>`;
}

/**
 * A horizontal run of named places, each a photograph with a caption. Scrolls
 * sideways by touch or trackpad and snaps; on a keyboard every tile is a link
 * in order. Nothing moves on its own.
 *
 * @param {Array} items [{ href, name, where, flag, image }]
 */
export function reel(items) {
  if (!items?.length) return '';
  return html`<ul class="reel" role="list">${items.map(
    (p) => html`<li class="reel__item">
      <a class="tile" href="${url(p.href)}">
        <img class="tile__img" src="${url(p.image.src)}" alt="${p.image.alt || ''}" loading="lazy" decoding="async" width="600" height="750">
        <span class="tile__text">
          <span class="tile__name">${p.name}</span>
          <span class="tile__where">${p.flag ? html`<span aria-hidden="true">${p.flag}</span> ` : ''}${p.where}</span>
        </span>
      </a>
    </li>`
  )}</ul>`;
}

/**
 * The tools, once a reader wants them: a name and one line each.
 *
 * @param {Array} items [{ href, title, line }]
 */
export function toolkit(items) {
  return html`<ul class="toolkit" role="list">${items.map(
    (t) => html`<li><a class="toolkit__item" href="${url(t.href)}">
      <span class="toolkit__title">${t.title}</span>
      <span class="toolkit__line">${t.line}</span>
    </a></li>`
  )}</ul>`;
}

/**
 * The handful of facts a student compares on, in a row under the hero: a
 * label, a value, and at most a few words of qualification. Rows with no value
 * are left out rather than shown empty.
 *
 * @param {Array} items [{ label, value, note }]
 */
export function glance(items) {
  const real = items.filter((i) => i && i.value !== null && i.value !== undefined && i.value !== '');
  if (!real.length) return '';
  return html`<dl class="glance">${real.map(
    (i) => html`<div class="glance__item">
      <dt>${i.label}</dt>
      <dd>${i.value}${i.note ? html`<small>${i.note}</small>` : ''}</dd>
    </div>`
  )}</dl>`;
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
  // `title: null` when the list sits inside a disclosure whose summary already
  // names it, so the heading is not said twice.
  return html`<section class="sources">
    ${title ? html`<h2>${title}</h2>` : ''}
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

/**
 * One question on a reference page: a short answer, and the long one a tap away.
 *
 * #37. A Destination page rendered every section in full, one after another,
 * and came to 52 phone screens with the universities at the bottom. Every
 * section was defensible; the sum was a wall. So the default view of a topic
 * is its heading and a sentence or two, and the researched prose — all of it,
 * unchanged — sits in a native `<details>` beneath. Native because it opens
 * without JavaScript, is announced by every screen reader, and is found by the
 * browser's find-in-page.
 *
 * `short` is text taken from the record (see `firstSentence`), never written
 * here. `body` is the existing full rendering. With no body there is nothing to
 * disclose and the short answer stands alone; with no short answer the heading
 * leads straight to the disclosure.
 *
 * The heading stays outside the disclosure so that "On this page" links and
 * anchors from elsewhere still land on something visible.
 */
export function topic({ id, title, short, body, more = 'Read the full detail' }) {
  const hasBody = body && String(typeof body === 'object' ? toString(body) : body).trim();
  return html`<section class="topic" aria-labelledby="${id}">
    <h2 id="${id}">${title}</h2>
    ${short ? html`<div class="topic__short">${typeof short === 'string' ? md(short) : short}</div>` : ''}
    ${hasBody
      ? html`<details class="topic__more">
          <summary>${more}</summary>
          <div class="topic__body">${body}</div>
        </details>`
      : ''}
  </section>`;
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

/**
 * A programme's subject requirements, as published: "English B · Mathematics B
 * — one of: History B / …". On a local scale this is the institution's own
 * vocabulary, so it is only ever shown beneath its IB translation — see
 * `requirementSummary`, and scripts/test-requirement-translation.mjs, which
 * fails a page that shows it bare.
 */
export function requirementLine(entry) {
  if (!entry) return '';
  const fmt = (r) =>
    r.ibNative ? null : r.other ? r.label : r.floor ? r.localText : `${r.subject} ${r.level}${r.minGrade ? ` (min ${minGradeOf(r)})` : ''}`;
  const parts = [];
  const all = (entry.all || []).map(fmt).filter(Boolean);
  if (all.length) parts.push(all.join(' · '));
  for (const set of oneOfSets(entry)) {
    const groups = set.map((group) => group.map(fmt).filter(Boolean)).filter((g) => g.length);
    if (groups.length) parts.push('one of: ' + groups.map((g) => g.join(' + ')).join(' / '));
  }
  return parts.join(' — ');
}

/** A minimum grade as its scale writes it ("02"), where the scheme says how. */
function minGradeOf(r) {
  return r.translation?.localMinGradeLabel ?? r.minGrade;
}

/** Every "one of" an entry carries; older projections held only `oneOf`. */
function oneOfSets(entry) {
  return entry?.oneOfSets || (entry?.oneOf?.length ? [entry.oneOf] : []);
}

/* --- Requirements, in IB terms first -------------------------------------- */

/*
 * A requirement published on a local scale ("Mathematics A", "English B") is a
 * level of study in someone else's school system, and "English B" there is not
 * the IB course. So wherever one is shown, the IB translation leads — computed
 * by the eligibility engine from the Recognition Scheme and the institution's
 * own published additions (`ibTermsFor`, carried on each projected item as
 * `translation`; `ibTermsLine` for the words) — and the published form follows,
 * small, so a student can still match it with the institution's own page.
 *
 * The markup is part of the contract: every block carries `data-req`; IB text
 * sits in `.req-ib`, a non-subject option ("an accepted English test") in
 * `.req-other`, an honest "no IB route" in `.req-none`, and the published form
 * in `.req-local`. scripts/test-requirement-translation.mjs reads the built
 * pages by those classes, and reads `requirementModel` to know what they should
 * say.
 */

const localForm = (r) => (r.other ? r.label : r.floor ? r.localText : `${r.subject} ${r.level}`);
const published = (r) =>
  r.other || r.floor ? localForm(r) : `${localForm(r)}${r.minGrade ? `, minimum ${minGradeOf(r)}` : ''}`;

/** A group can be met with IB subjects (or with a non-subject option). */
const translatable = (group) => group.every((r) => r.other || !r.translation || r.translation.phrase);

/**
 * One subject required twice at different levels — CBS asks for English A (the
 * language requirement) and English B at 6.0 — is one requirement in IB terms.
 * The lower one folds into the higher when its grade cannot bite there: it has
 * none, or the institution waives it at a level the higher one already reaches.
 */
function mergeSameSubject(items) {
  const out = items.map((r) => ({ r, merged: [] }));
  for (const lower of out) {
    const t = lower.r.translation;
    if (!t || lower.gone) continue;
    const higher = out.find(
      (h) => h !== lower && !h.gone && h.r.translation && h.r.translation.scale === t.scale &&
        h.r.subject === lower.r.subject && h.r.translation.levelRank > t.levelRank
    );
    if (!higher) continue;
    const reach = higher.r.translation.levelRank;
    if (lower.r.minGrade != null && !(t.waiver && t.waiver.rank <= reach)) continue;
    higher.merged.push(lower.r);
    lower.gone = true;
  }
  return out.filter((x) => !x.gone);
}

/**
 * The routes a card still needs to name for one option, once its siblings in
 * the same "one of" have named theirs: at CBS, "History (SL or HL)" and
 * "Economics or Business Management (SL or HL)" are already on the line, so
 * Social Studies B adds only Global Politics, Geography HL and Anthropology HL.
 */
function narrowedPhrase(r, siblings) {
  const t = r.translation;
  if (!t?.institution) return t?.phrase || null;
  const covered = (x) =>
    siblings.some((g) => g.length === 1 && g[0] !== r && (g[0].translation?.options || []).some(
      (o) => o.id === x.id && (x.level === 'HL' ? o.levels.includes('HL') : o.levels.length === 2)
    ));
  const routes = t.institution.routes.filter((group) => !(group.length === 1 && covered(group[0])));
  return [t.schemePhrase, routes.length ? routesPhrase(routes) : null].filter(Boolean).join('; or ') || null;
}

/** A requirement published in IB terms, written as the translated ones are. */
function nativeText(r) {
  const phrase = r.ibPhrase || `${r.subject} ${r.level}`;
  return r.minGrade ? `${phrase}, at least a ${r.minGrade}` : phrase;
}

/** The quota floors, as one IB line: "at least 28 IB points and a 5 in Maths HL (AA or AI)". */
function floorLine(floors) {
  const byQuota = new Map();
  for (const f of floors || []) {
    if (!byQuota.has(f.quota)) byQuota.set(f.quota, []);
    byQuota.get(f.quota).push(f);
  }
  return [...byQuota].map(([quota, fs]) => {
    const other = fs.find((f) => f.otherRoute)?.otherRoute || null;
    return {
      quota,
      ib: `${quota}: ${fs.map((f) => f.ibText).join(' and ')}`,
      local: `${quota}: ${fs.map((f) => f.localText).join(' and ')}`,
      // What is left below it, from the institution's record: "SDU's entrance test".
      below: other ? `below that, ${other.quota.toLowerCase()}: ${other.short || other.text}` : null,
      belowFull: other ? `Below this, your way in is ${other.quota.toLowerCase()}: ${other.text}` : null,
    };
  });
}

/**
 * What a requirement block says, before it is markup: shared by the card, the
 * programme page and the guard, so the three cannot drift apart.
 */
export function requirementModel(entry) {
  const items = [...(entry?.all || []), ...oneOfSets(entry).flat(2)];
  const first = items.map((r) => r.translation).find(Boolean) || null;

  const line = (r, siblings = []) => {
    if (r.other) return { kind: 'other', text: r.shortLabel || r.label };
    if (r.floor) return { kind: 'ib', text: r.ibText };
    const t = r.translation;
    if (!t) return { kind: 'ib', text: nativeText(r) };
    if (t.diplomaExempt) {
      const text = `${t.phrase || t.local}: IB Diploma holders exempt`;
      return { kind: 'ib', text, phrase: text, detail: text };
    }
    const phrase = narrowedPhrase(r, siblings);
    if (!t.phrase) return { kind: 'none', text: `${t.local} — no IB route` };
    if (!phrase) return null; // every route is already named by a sibling
    return { kind: 'ib', text: ibTermsLine(t, phrase), phrase, detail: phrase };
  };

  const all = mergeSameSubject(entry?.all || []).map(({ r, merged }) => {
    const x = line(r);
    return { ...x, detail: x.detail || (r.translation ? r.translation.phrase : x.text), r, merged };
  });
  const allTexts = new Set(all.filter((x) => x.kind === 'ib').map((x) => x.text));

  const sets = oneOfSets(entry).map((groups) => {
    const open = [];
    const seen = new Map();
    for (const g of groups.filter(translatable)) {
      const parts = g.map((r) => line(r, groups));
      if (parts.some((x) => x === null)) continue;
      const key = parts.map((x) => x.text).join(' + ');
      // Two options that read the same in IB terms are one option: English B
      // and English C are both "Any IB English".
      if (seen.has(key)) {
        seen.get(key).groups.push(g);
        continue;
      }
      const option = { parts, groups: [g] };
      seen.set(key, option);
      open.push(option);
    }
    /* An option that asks for everything a smaller option asks for, and more,
       is never the easier way in: VIA's "English B" or "English C + an
       English test" is just "Any IB English" in IB terms. The larger one keeps
       its published form, beside the smaller one's. */
    const texts = (o) => o.parts.map((x) => x.text);
    /* One option whose every IB route a sibling already accepts adds nothing:
       Contemporary History B is History HL, and History (SL or HL) is already
       on the line. */
    const accepts = (o) => (o.groups[0].length === 1 ? o.groups[0][0].translation?.options || [] : null);
    const covers = (q, o) =>
      accepts(q) && accepts(o)?.length && !o.groups[0][0].translation?.institution &&
      accepts(o).every((x) => accepts(q).some((y) => y.id === x.id && x.levels.every((l) => y.levels.includes(l))));
    for (const o of [...open]) {
      const wider = open.find((q) => q !== o && covers(q, o) && !covers(o, q));
      if (!wider) continue;
      wider.groups.push(...o.groups);
      open.splice(open.indexOf(o), 1);
    }
    for (const o of [...open]) {
      const smaller = open.find((q) => q !== o && q.parts.length < o.parts.length && texts(q).every((t) => texts(o).includes(t)));
      if (!smaller) continue;
      smaller.groups.push(...o.groups);
      open.splice(open.indexOf(o), 1);
    }
    const closed = groups.filter((g) => !translatable(g));
    /* A choice already settled by a subject required outright — BAAA asks for
       English C, and then for English B or a test — is left off the card. */
    const implied = open.some((o) => o.parts.every((x) => x.kind === 'ib' && allTexts.has(x.text)));

    /* On a card, options that are each one subject read as one list of IB
       subjects — "History, Economics, Business Management or Global Politics
       (SL or HL), Geography HL or Anthropology HL" — rather than five choices
       that overlap (unionPhrase, computed where the catalogue is known). The
       programme page keeps them apart. */
    let union = null;
    const translatedGroups = groups.filter(translatable);
    if (groups.union && open.length > 1 && translatedGroups.every((g) => g.length === 1 && g[0].translation?.phrase)) {
      union = { text: groups.union };
    }
    return { open, closed, implied, union };
  });

  /* One requirement, one line. A "one of" between a subject and an English
     test is how that subject is met: CBS's English A-or-test, with the English
     B minimum the test depends on folded in — "English A or English B HL, any
     grade — or English B SL 5+ with an English test (IELTS 7.0)". */
  for (const set of sets) {
    if (set.implied || set.closed.length) continue;
    const subjectOptions = set.open.filter((o) => o.groups[0].every((r) => r.translation?.phrase));
    const tests = set.open.filter((o) => o.groups[0].every((r) => r.other && r.kind === 'test'));
    if (subjectOptions.length !== 1 || !tests.length || subjectOptions.length + tests.length !== set.open.length) continue;
    const subj = subjectOptions[0].groups[0][0];
    const low = all.find((x) => x.r.translation && x.r.subject === subj.subject && x.r.translation.waiver &&
      x.r.translation.waiver.rank <= subj.translation.levelRank && x.r.translation.minIbGrade != null);
    const testText = tests.map((o) => o.parts.map((x) => x.text).join(' + ')).join(' or ');
    const text = low
      ? `${subj.translation.phrase} — or ${low.r.translation.waiver.gradedPhrase} ${low.r.translation.minIbGrade}+ with ${testText}`
      : `${subjectOptions[0].parts.map((x) => x.text).join(' + ')} — or ${testText}`;
    const at = low ? all.indexOf(low) : 0;
    if (low) all.splice(at, 1);
    all.splice(at, 0, {
      kind: 'ib', text, detail: text, fold: true,
      r: subj, merged: [...(low ? [low.r] : []), ...subjectOptions[0].groups.slice(1).flat()],
      tests: tests.flatMap((o) => o.groups.flat()),
    });
    set.folded = true;
  }

  return { first, all, sets: sets.map((x) => (x.folded ? { ...x, implied: true, silent: true } : x)), floors: floorLine(entry?.quotaFloors) };
}

/** "Danish requirement: Mathematics A (min 4)" — the published form, small. */
function localBlock(entry, first, className) {
  const href = first.explainedAt;
  const floors = floorLine(entry?.quotaFloors).map((f) => f.local).join(' · ');
  const text = [requirementLine(entry), floors].filter(Boolean).join(' · ');
  if (!text) return '';
  return html`<p class="${className}"><span class="req-local">${first.requirementLabel}: ${text}</span>${
    href ? html` <a class="req__how" href="${url(href)}">What this means in IB terms</a>` : ''
  }</p>`;
}

const partHtml = (x) =>
  x.kind === 'other'
    ? html`<span class="req-other">${x.text}</span>`
    : x.kind === 'none'
    ? html`<span class="req-none">${x.text}</span>`
    : html`<span class="req-ib">${x.text}</span>`;

/**
 * "(2 other options need a Danish-school subject)" — counted on a card,
 * explained on the programme page. Not "+ 2 …": a "+" on this line already
 * means "together with".
 */
function closedNote(closed, first, other = true) {
  const noun = first?.localOnlyNoun || 'option with no IB route';
  const n = closed.length;
  return other ? `and ${n} ${noun}${n === 1 ? '' : 's'}` : `${n} ${noun}${n === 1 ? '' : 's'}`;
}

/**
 * A card-sized summary: one line in IB terms, the published form beneath it.
 * Returns '' for an entry with nothing to show.
 */
export function requirementSummary(entry, { lead = 'Needs' } = {}) {
  if (!entry) return '';
  const model = requirementModel(entry);
  const { first } = model;

  const all = model.all.map(partHtml);
  const oneOf = model.sets.filter((set) => !set.implied).map(({ open, closed }, k) => {
    // A "one of" with a single option left is just another requirement.
    const single = open.length === 1 && !closed.length;
    const sep = all.length || k ? (single ? ' · ' : ' — ') : '';
    if (!open.length) {
      return html`${sep}<span class="req-none req__more">one of ${closedNote(closed, first, false)} (no IB route)</span>`;
    }
    const more = closed.length ? html` <span class="req-none req__more">(${closedNote(closed, first)})</span>` : '';
    const union = model.sets.filter((x) => !x.implied)[k]?.union;
    // The list already names every IB route; the Danish-only ones are on the
    // programme page. Four lines, not six.
    if (union) return html`${sep}one of <span class="req-ib">${union.text}</span>`;
    return html`${sep}${open.length > 1 || closed.length ? 'one of: ' : ''}${open.map(
      (o, i) => html`${i ? ' / ' : ''}${o.parts.map((x, n) => html`${n ? ' + ' : ''}${partHtml(x)}`)}`
    )}${more}`;
  });

  return html`<div class="req" data-req>
    <p class="req__ib"><strong>${lead}</strong> ${all.map((x, i) => html`${i ? ' · ' : ''}${x}`)}${oneOf}</p>
    ${model.floors.map((f) => html`<p class="req__floor"><span class="req-ib">${f.ib}</span>${f.below ? html`<span class="req-why">; ${f.below}</span>` : ''}</p>`)}
    ${first ? localBlock(entry, first, 'req__local') : ''}
  </div>`;
}

/** One item on a programme page: the IB terms, the grade, and whose rule it is. */
function detailItem(r, { alternatives = false, phrase = null } = {}) {
  if (r.other) return html`<strong class="req-other">${r.label}</strong>`;
  if (r.floor) return html`<strong class="req-ib">${r.ibText}</strong>`;
  const t = r.translation;
  if (!t) {
    return html`<strong class="req-ib">${r.ibPhrase || `${r.subject} ${r.level}`}</strong>${
      r.minGrade ? html`<span class="need__grade req-grade">At least a ${r.minGrade}.</span>` : ''
    }`;
  }
  if (!t.phrase) {
    return html`<strong class="req-none">${t.local}: no IB route</strong>
      <span class="need__why req-why">${t.none}${alternatives ? ' The other options are the way in.' : ''}</span>`;
  }
  const grade = t.minIbGrade == null
    ? (t.localMinGrade != null ? t.gradeNote : '')
    : t.waiver
    ? (t.waiver.gradedPhrase
        ? `At least a ${t.minIbGrade} in ${t.waiver.gradedPhrase}; any grade otherwise, because no minimum applies at ${t.waiver.level} level. ${t.gradeNote.charAt(0).toUpperCase()}${t.gradeNote.slice(1)}.`
        : `No minimum grade: every IB route here counts at ${t.waiver.level} level, where none applies.`)
    : `At least a ${t.minIbGrade} (${t.gradeNote}).`;
  return html`<strong class="req-ib">${phrase || t.phrase}</strong>${
    grade ? html`<span class="need__grade req-grade">${grade}</span>` : ''
  }${(t.cautions || []).map((c) => html`<span class="need__why req-why">${c}</span>`)}${t.institution
    ? html`<span class="need__why req-why">${t.schemePhrase ? 'The last part is' : 'This is'} ${t.institution.name}'s own rule${
        t.schemePhrase ? '' : '; the national table publishes no IB equivalent'
      }.</span>`
    : ''}`;
}

/**
 * The programme page's "What you need", for an entry that carries local-scale
 * requirements: each subject as a card that leads with the IB terms.
 */
export function requirementDetail(entry) {
  if (!entry) return '';
  const model = requirementModel(entry);
  const { first } = model;
  /* The published form, for the items that have one: a requirement published
     in IB terms has no "Danish requirement" line of its own. */
  const asPublished = (items, sep = ' and ') => {
    // A non-subject option is shown as written already; it has no other form.
    const shown = items.filter((r) => !r.ibNative && !(r.other && r.kind !== 'published'));
    return first && shown.length
      ? html`<small class="req-local">${first.requirementLabel}: ${shown.map(published).join(sep)}</small>`
      : '';
  };

  const everything = [...(entry.all || []), ...oneOfSets(entry).flat(2)];
  const graded = everything.some((r) => r.minGrade != null);

  /* A "one of" left with a single option is just another requirement, and one
     already settled by a subject required outright is not asked twice. */
  const sets = oneOfSets(entry).map((groups, k) => ({ groups, ...model.sets[k] }));
  const single = sets.filter((x) => !x.implied && x.open.length === 1 && !x.closed.length);
  const choices = sets.filter((x) => !x.implied && !single.includes(x));
  const implied = sets.filter((x) => x.implied);
  const card = (o) => html`<li class="need__card">
    ${o.groups[0].map((r, n) => html`${n ? html`<span class="need__plus">+</span>` : ''}${detailItem(r, { phrase: o.parts[n]?.detail })}`)}
    ${asPublished(o.groups.map((g) => ({ other: true, kind: 'published', label: g.filter((r) => !r.ibNative && !r.other).map(published).join(' + ') })).filter((x) => x.label), ' or ')}
  </li>`;

  return html`<div class="req-detail" data-req>
    <p class="need__note">${model.floors.length
      ? 'Subjects carry no minimum grade unless one is shown. The averages at the end decide your quota.'
      : graded
      ? 'Where no grade is shown, no minimum grade is recorded for that subject.'
      : 'No minimum grade is recorded for any of these subjects.'}</p>
    ${model.all.length || single.length
      ? html`<ul class="need need--ib" aria-label="Required subjects">${model.all.map(
          (x) => x.fold
            ? html`<li class="need__card">
                <strong class="req-ib">${x.detail}</strong>
                ${x.tests.map((t) => html`<span class="need__why req-why">${[t.label, t.note].filter(Boolean).join('. ')}</span>`)}
                ${asPublished([x.r, ...x.merged, ...x.tests.map((t) => ({ other: true, kind: 'published', label: t.label }))], ' · ')}
              </li>`
            : html`<li class="need__card${x.kind === 'none' ? ' need__card--none' : ''}">
                ${detailItem(x.r, { phrase: x.detail })}${asPublished([x.r, ...x.merged])}
              </li>`
        )}${single.map((x) => card(x.open[0]))}</ul>`
      : ''}
    ${implied.filter((x) => !x.silent).map(
      (x) => html`<p class="need__note"><span class="req-local">${first?.requirementLabel || 'As published'}: also one of ${x.groups
        .map((g) => g.map(published).join(' + '))
        .join(' / ')}</span> — already met by what is listed above.</p>`
    )}
    ${choices.map(({ groups, open, closed }, k) => {
      const someOpen = open.length > 0;
      return html`<p class="need__or">${model.all.length || single.length || k ? 'And one of these:' : 'One of these:'}</p>
          <ul class="need need--ib need--or">${[
            ...open.map(card),
            /* Every option with no IB route, folded into one muted card: named,
               with each reason said once. */
            ...(closed.length
              ? [html`<li class="need__card need__card--none">
                  <strong class="req-none">${someOpen
                    ? `Also accepted: ${closedNote(closed, first, false)}, with no IB route`
                    : `None of these has an IB route`}</strong>
                  ${[...new Map(closed.flat().filter((r) => r.translation && !r.translation.phrase).map((r) => [r.translation.local, `${r.translation.local}: ${r.translation.none}`])).values()].map(
                    (why) => html`<span class="need__why req-why">${why}</span>`
                  )}${someOpen ? html`<span class="need__why req-why">The options above are the way in.</span>` : ''}
                  ${asPublished(closed.map((g) => ({ other: true, kind: 'published', label: g.map(published).join(' + ') })), ' / ')}
                </li>`]
              : []),
          ]}</ul>`;
    })}
    ${model.floors.map(
      (f) => html`<p class="need__or">To be ranked in ${f.quota.toLowerCase()}:</p>
        <ul class="need need--ib"><li class="need__card need__card--floor">
          <strong class="req-ib">${f.ib}</strong>
          <span class="need__why req-why">${f.belowFull || 'Below this, you can still be admitted in the other quota.'}</span>
          ${first ? html`<small class="req-local">${first.requirementLabel}: ${f.local}</small>` : ''}
        </li></ul>`
    )}
    ${first?.explainedAt
      ? html`<p class="need__how"><a class="arrow-link" href="${url(first.explainedAt)}">How these requirements read in IB terms</a></p>`
      : ''}
  </div>`;
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
export function contextNotes(list, { title = 'What it is actually like', heading = true } = {}) {
  const notes = (list || []).filter(Boolean);
  if (!notes.length) return '';
  return html`<div class="context-set">
    ${heading ? html`<h2 class="context-set__title">${title}</h2>` : ''}
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
export function sectorLandscape(landscape, { destinationName = 'this country', heading = true } = {}) {
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
    ${heading ? html`<h2 id="landscape">The shape of ${destinationName}'s system</h2>` : ''}
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
