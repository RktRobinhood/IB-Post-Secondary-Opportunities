// Both views use the same elements and therefore the same facts and links.
for (const browser of document.querySelectorAll('[data-programme-browser]')) {
  const controls = browser.querySelector('[data-programme-controls]');
  if (!controls) continue;
  controls.hidden = false;
  const select = document.querySelector(controls.dataset.subjectSelect || ':not(*)');
  const count = browser.querySelector('[data-programme-count]');
  const more = browser.querySelector('[data-programme-more]');
  let expanded = false;
  let subject = select?.value || '';
  const sync = () => {
    for (const button of controls.querySelectorAll('[data-subject-filter]')) {
      button.setAttribute('aria-pressed', String(button.dataset.subjectFilter === subject));
    }
    if (select) return; // The home page's search engine owns its matching set.
    const items = [...browser.querySelectorAll('[data-programme-item]')];
    let shown = 0, matches = 0;
    for (const item of items) {
      const match = !subject || item.dataset.subject === subject;
      if (match) matches++;
      item.hidden = !match || Boolean(more && !expanded && shown >= 9);
      if (!item.hidden) shown++;
    }
    if (count) {
      count.hidden = !subject && shown === items.length;
      count.textContent = shown ? `${shown} of ${matches} choices${subject ? ` in ${subject}` : ''}` : 'No choices in this subject area.';
    }
    if (more) { more.hidden = shown >= matches; more.textContent = `Show all ${matches} choices`; }
  };
  controls.addEventListener('click', (event) => {
    const view = event.target.closest('[data-programme-view]');
    if (view) {
      browser.dataset.view = view.dataset.programmeView;
      for (const button of controls.querySelectorAll('[data-programme-view]')) {
        button.setAttribute('aria-pressed', String(button === view));
      }
    }
    const filter = event.target.closest('[data-subject-filter]');
    if (filter) {
      subject = subject === filter.dataset.subjectFilter ? '' : filter.dataset.subjectFilter;
      if (select) {
        select.value = subject;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      sync();
    }
  });
  more?.addEventListener('click', () => { expanded = true; sync(); });
  if (select) {
    select.addEventListener('change', () => { subject = select.value; sync(); });
    // Search reset and Back navigation also update the underlying select.
    browser.addEventListener('programme-filters-changed', () => { subject = select.value; sync(); });
  } else {
    const list = browser.querySelector('[data-programme-items]');
    if (list) new MutationObserver(sync).observe(list, { childList: true });
  }
  sync();
}
