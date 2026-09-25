/* The comparison tray.
 *
 * Deliberately capped at four. Beyond that it stops being a comparison and
 * becomes a table nobody reads, and the point of this page is to make a
 * trade-off visible rather than to list everything.
 *
 * Nothing here computes a total. Each dimension is shown on its own row with
 * its own coverage, because a country that wins on money can lose on language
 * and no arithmetic should hide that.
 *
 * Every choice — adding a destination, removing one, sorting the whole set —
 * is a history entry, so Back undoes the last choice instead of leaving the
 * page. The address carries the view (`?with=de,nl&sort=coverage`), so a
 * shared link and a restored entry show the same thing.
 */

const BASE = document.documentElement.dataset.base === '/' ? '' : document.documentElement.dataset.base;
const json = (id) => JSON.parse(document.getElementById(id).textContent);

const DESTINATIONS = json('compare-data');
const DIMENSIONS = json('compare-dimensions');
const MAX = 4;
const STORAGE_KEY = 'ibp-compare';

const byCode = new Map(DESTINATIONS.map((d) => [d.code, d]));
let chosen = [];
let sortBy = 'name';
const SORTS = ['name', 'coverage', 'region'];

const els = {
  add: document.getElementById('cmp-add'),
  chosen: document.getElementById('cmp-chosen'),
  tray: document.getElementById('cmp-tray'),
  form: document.getElementById('cmp-picker'),
  set: document.querySelector('#cmp-set .set__rows'),
  sort: document.getElementById('cmp-sort'),
};

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const COVERAGE_LABEL = {
  full: '',
  partial: 'partly recorded',
  none: 'not recorded',
};

function render() {
  /* Chips */
  els.chosen.innerHTML = chosen.length
    ? chosen
        .map(
          (code) =>
            `<button type="button" class="chip" aria-pressed="true" data-remove="${esc(code)}">
               ${esc(byCode.get(code)?.flag || '')} ${esc(byCode.get(code)?.name || code)} ×
             </button>`
        )
        .join('')
    : '<span style="font-size:.8125rem;color:var(--ink-mute)">Nothing chosen yet. Pick two or three.</span>';

  for (const b of els.chosen.querySelectorAll('[data-remove]')) {
    b.addEventListener('click', () => {
      chosen = chosen.filter((c) => c !== b.dataset.remove);
      save();
      render();
      commit();
    });
  }

  els.add.disabled = chosen.length >= MAX;

  /* Tray */
  if (chosen.length < 2) {
    els.tray.innerHTML = `<div class="state state--empty">
      <p><strong>Choose at least two destinations.</strong></p>
      <p>Their differences will line up dimension by dimension, with the gaps in what we know shown rather than smoothed over.</p>
    </div>`;
    paintSet();
    return;
  }

  const items = chosen.map((c) => byCode.get(c)).filter(Boolean);

  const rows = DIMENSIONS.map((dim) => {
    const cells = items.map((it) => it.dimensions.find((d) => d.key === dim.key));
    const known = cells.filter((c) => c && c.value);
    const allSame =
      known.length === items.length && new Set(known.map((c) => c.value)).size === 1;

    return `
    <tr data-dimension="${esc(dim.key)}"${allSame ? ' data-same="true"' : ''}>
      <th scope="row">${esc(dim.label)}<br><small>${esc(dim.note)}</small></th>
      ${cells
        .map((c) => {
          if (!c || !c.value) {
            return `<td data-label="${esc(dim.label)}"><span class="tray__missing">Not recorded${
              c?.uncertainty ? ` — ${esc(c.uncertainty)}` : ''
            }</span></td>`;
          }
          return `<td data-label="${esc(dim.label)}">
            ${esc(c.value)}
            ${c.coverage !== 'full' ? `<br><small class="tray__coverage">${esc(COVERAGE_LABEL[c.coverage] || '')}</small>` : ''}
            ${c.uncertainty ? `<br><small class="tray__uncertain">${esc(c.uncertainty)}</small>` : ''}
          </td>`;
        })
        .join('')}
    </tr>`;
  }).join('');

  els.tray.innerHTML = `
  <div class="tray">
    <div class="table-scroll">
      <table class="data tray__table">
        <thead>
          <tr>
            <th scope="col">Dimension</th>
            ${items
              .map(
                (i) =>
                  `<th scope="col"><a href="${BASE}${i.href}">${esc(i.flag)} ${esc(i.name)}</a>
                     <br><small>${i.coverage.full}/${i.coverage.total} dimensions fully recorded</small>
                     ${i.dataAsOf ? `<br><small>checked ${esc(i.dataAsOf)}</small>` : ''}</th>`
              )
              .join('')}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="tray__note">Academic eligibility is the first row and stands apart from the rest: it decides whether
      you can apply at all, while the others decide whether you should. Nothing here is added up.</p>
  </div>`;

  paintSet();
}

/* The whole set: sort order, and which rows can still be added. */
function paintSet() {
  if (!els.set) return;
  const rows = [...els.set.children];
  const key = {
    name: (r) => r.dataset.name,
    coverage: (r) => String(9 - Number(r.dataset.coverage)) + r.dataset.name,
    region: (r) => r.dataset.region + r.dataset.name,
  }[sortBy];
  rows.sort((a, b) => key(a).localeCompare(key(b))).forEach((r) => els.set.append(r));
  for (const b of els.sort?.querySelectorAll('[data-sort]') || []) b.setAttribute('aria-pressed', String(b.dataset.sort === sortBy));
  for (const b of els.set.querySelectorAll('[data-add]')) {
    b.hidden = false;
    const inIt = chosen.includes(b.dataset.add);
    b.disabled = inIt || chosen.length >= MAX;
    b.textContent = inIt ? 'In the comparison' : chosen.length >= MAX ? `Comparison full (${MAX})` : 'Add to the comparison';
  }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(chosen)); } catch {}
}

function address() {
  const q = new URLSearchParams();
  if (chosen.length) q.set('with', chosen.join(','));
  if (sortBy !== 'name') q.set('sort', sortBy);
  const qs = q.toString().replace(/%2C/g, ',');
  return `${location.pathname}${qs ? `?${qs}` : ''}`;
}

/** A deliberate choice: a new history entry, so Back undoes it. */
function commit() {
  history.pushState({ compare: true, chosen: [...chosen], sortBy }, '', address());
}

window.addEventListener('popstate', (ev) => {
  const st = ev.state;
  if (!st?.compare) return;
  chosen = st.chosen.filter((c) => byCode.has(c)).slice(0, MAX);
  sortBy = SORTS.includes(st.sortBy) ? st.sortBy : 'name';
  save();
  render();
});

function restore() {
  const params = new URLSearchParams(location.search);
  if (SORTS.includes(params.get('sort'))) sortBy = params.get('sort');
  const fromUrl = params.get('with');
  if (fromUrl) {
    chosen = fromUrl.split(',').filter((c) => byCode.has(c)).slice(0, MAX);
    return;
  }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(saved)) chosen = saved.filter((c) => byCode.has(c)).slice(0, MAX);
  } catch {}
}

els.add?.addEventListener('change', () => {
  const code = els.add.value;
  els.add.value = '';
  if (!code || chosen.includes(code) || chosen.length >= MAX) return;
  chosen.push(code);
  save();
  render();
  commit();
});

/* "Add to the comparison" inside a row of the whole set. */
els.set?.addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-add]');
  if (!b || chosen.includes(b.dataset.add) || chosen.length >= MAX) return;
  chosen.push(b.dataset.add);
  save();
  render();
  commit();
  els.tray.scrollIntoView({ block: 'start' });
});

if (els.sort) {
  els.sort.hidden = false;
  els.sort.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-sort]');
    if (!b || b.dataset.sort === sortBy) return;
    sortBy = b.dataset.sort;
    paintSet();
    commit();
  });
}

els.form?.addEventListener('submit', (e) => e.preventDefault());

restore();
render();
/* The entry the student arrived on, holding the view restored from the link or
   from their last visit, so Back from their first choice returns to it. */
history.replaceState({ compare: true, chosen: [...chosen], sortBy }, '', address() + location.hash);
