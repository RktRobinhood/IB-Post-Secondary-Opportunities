import { html, raw, toString } from './html.mjs';

const cardsIcon = html`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m4 17 6-6 5 5 2-2 3 3"/></svg>`;
const listIcon = html`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01" stroke-width="3"/></svg>`;

export const programmeSubject = (field = 'Other') => html`<span class="programme-subject">${field || 'Other'}</span>`;

function subjectCard(card) {
  const field = card.field || 'Other';
  const text = toString(html`${field}`);
  let markup = toString(card.html);
  let labelled = false;
  // Reuse a subject already printed in the card's metadata.
  markup = markup.replace(/(<div class="card__foot">)([\s\S]*?)(<\/div>)/, (all, start, body, end) => {
    const label = `<span>${text}</span>`;
    if (!body.includes(label)) return all;
    labelled = true;
    return start + body.replace(label, `<span class="programme-subject">${text}</span>`) + end;
  });
  // A catalogue subject card already names its subject as its title.
  const title = markup.match(/<h3 class="card__title"><a[^>]*>([\s\S]*?)<\/a><\/h3>/)?.[1];
  return html`${labelled || title === text ? '' : programmeSubject(field)}${raw(markup)}`;
}

/** One set of programme elements, restyled in place; filters survive view changes.
 * External lists use their existing filter engine through a select control. */
export function programmeControls({ subjects = [], subjectSelect = null, label = 'Programmes' } = {}) {
  const fields = [...new Set(subjects.filter(Boolean))].sort();
  return html`<div class="programme-controls" data-programme-controls${subjectSelect ? html` data-subject-select="${subjectSelect}"` : ''} hidden>
    ${fields.length > 1 ? html`<div class="programme-controls__subjects" role="group" aria-label="${label}: subject area">
      ${fields.map((field) => html`<button class="chip" type="button" data-subject-filter="${field}" aria-pressed="false"><span class="programme-controls__subject-label">${field}</span></button>`)}
    </div>` : ''}
    <div class="programme-controls__view" role="group" aria-label="${label}: view">
      <button class="chip" type="button" data-programme-view="cards" aria-label="Card view" title="Cards" aria-pressed="true">${cardsIcon}</button>
      <button class="chip" type="button" data-programme-view="list" aria-label="List view" title="List" aria-pressed="false">${listIcon}</button>
    </div>
  </div>`;
}

export function programmeView({ cards = [], label = 'Programmes' } = {}) {
  if (!cards.length) return '';
  return html`<div class="programme-browser" data-programme-browser data-view="cards">
    ${programmeControls({ subjects: cards.map((c) => c.field), label })}
    <p class="programme-browser__count" data-programme-count aria-live="polite" hidden></p>
    <div class="programme-browser__items" data-programme-items>
      ${cards.map((c) => html`<div data-programme-item data-subject="${c.field || 'Other'}">${subjectCard(c)}</div>`)}
    </div>
    <button class="btn btn--quiet" type="button" data-programme-more hidden>Show all choices</button>
  </div>`;
}
