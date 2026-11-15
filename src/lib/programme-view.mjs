import { html } from './html.mjs';

/** One set of programme elements, restyled in place; filters survive view changes.
 * External lists use their existing filter engine through a select control. */
export function programmeControls({ subjects = [], subjectSelect = null, label = 'Programmes' } = {}) {
  const fields = [...new Set(subjects.filter(Boolean))].sort();
  return html`<div class="programme-controls" data-programme-controls hidden>
    <div class="programme-controls__view" role="group" aria-label="${label}: view">
      <button class="chip" type="button" data-programme-view="cards" aria-pressed="true">Cards</button>
      <button class="chip" type="button" data-programme-view="list" aria-pressed="false">List</button>
    </div>
    ${fields.length ? html`<div class="programme-controls__subjects" role="group" aria-label="${label}: subject area"${subjectSelect ? html` data-subject-select="${subjectSelect}"` : ''}>
      ${['', ...fields].map((field) => html`<button class="chip" type="button" data-subject-filter="${field}" aria-pressed="${field ? 'false' : 'true'}">${field || 'All subjects'}</button>`)}
    </div>` : ''}
  </div>`;
}

export function programmeView({ cards = [], label = 'Programmes' } = {}) {
  if (!cards.length) return '';
  return html`<div class="programme-browser" data-programme-browser data-view="cards">
    ${programmeControls({ subjects: cards.map((c) => c.field), label })}
    <p class="programme-browser__count" data-programme-count aria-live="polite" hidden></p>
    <div class="programme-browser__items" data-programme-items>
      ${cards.map((c) => html`<div data-programme-item data-subject="${c.field || 'Other'}">${c.html}</div>`)}
    </div>
    <button class="btn btn--quiet" type="button" data-programme-more hidden>Show all choices</button>
  </div>`;
}
