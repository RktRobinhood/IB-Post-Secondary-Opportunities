/* A filter box over a long reference list: the glossary, the credits.
 *
 *   <input type="search" data-filter="#scope" data-filter-items=".item">
 *
 * Typing hides every item in the scope that does not contain the text, hides a
 * `[data-filter-group]` with nothing left in it, and opens any disclosure that
 * holds a match so the match is visible. Clearing the box puts every
 * disclosure back as it was. A filter is continuous input, so it never touches
 * history: Back leaves the page state exactly as the student last saw it.
 *
 * Without JavaScript the box does nothing and everything is still there, one
 * tap down.
 */
for (const input of document.querySelectorAll('input[data-filter]')) {
  const scope = document.querySelector(input.dataset.filter);
  if (!scope) continue;
  const items = [...scope.querySelectorAll(input.dataset.filterItems)];
  const groups = [...scope.querySelectorAll('[data-filter-group]')];
  const disclosures = [...scope.querySelectorAll('details')];
  const wasOpen = new Map(disclosures.map((d) => [d, d.open]));
  const empty = scope.querySelector('[data-filter-empty]');
  const text = new Map(items.map((el) => [el, el.textContent.toLowerCase().replace(/\s+/g, ' ')]));

  const run = () => {
    const q = input.value.trim().toLowerCase().replace(/\s+/g, ' ');
    let shown = 0;
    for (const el of items) {
      const hit = !q || text.get(el).includes(q);
      el.hidden = !hit;
      if (hit) shown++;
    }
    for (const g of groups) g.hidden = Boolean(q) && !items.some((el) => !el.hidden && g.contains(el));
    for (const d of disclosures) {
      if (!q) d.open = wasOpen.get(d);
      // `contains` is true of the element itself, so a matching term that is
      // its own disclosure opens to show its whole definition.
      else d.open = items.some((el) => !el.hidden && d.contains(el));
    }
    if (empty) empty.hidden = !q || shown > 0;
  };

  input.addEventListener('input', run);
  // A browser restoring the page on Back may restore the typed text too.
  if (input.value) run();
}
