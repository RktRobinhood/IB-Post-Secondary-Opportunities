/* Programme explorer: filter the Danish catalogue in the page, no requests. */

const BASE = document.documentElement.dataset.base === '/' ? '' : document.documentElement.dataset.base;
const programmes = JSON.parse(document.getElementById('programme-data').textContent);

const els = {
  q: document.getElementById('f-q'),
  field: document.getElementById('f-field'),
  inst: document.getElementById('f-inst'),
  campus: document.getElementById('f-campus'),
  open: document.getElementById('f-open'),
  nomath: document.getElementById('f-nomath'),
  reset: document.getElementById('f-reset'),
  count: document.getElementById('prog-count'),
  results: document.getElementById('prog-results'),
};

const state = { q: '', field: '', inst: '', campus: '', open: false, nomath: false };

/** Does this programme demand Mathematics at A level anywhere in its requirements? */
function needsMathsA(p) {
  const e = p.entry;
  if (!e) return /mathematics\s+a\b/i.test(p.requirements || '');
  const inAll = (e.all || []).some((r) => r.subject === 'Mathematics' && r.level === 'A');
  if (inAll) return true;
  // Only counts if EVERY alternative demands it — otherwise there is a way round.
  const groups = e.oneOf || [];
  return groups.length > 0 && groups.every((g) => g.some((r) => r.subject === 'Mathematics' && r.level === 'A'));
}

function matches(p) {
  if (state.field && p.field !== state.field) return false;
  if (state.inst && p.institutionId !== state.inst) return false;
  if (state.campus && p.campus !== state.campus) return false;
  if (state.open && p.restricted) return false;
  if (state.nomath && needsMathsA(p)) return false;
  if (state.q) {
    const terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.every((t) => p.search.includes(t))) return false;
  }
  return true;
}

function row(p) {
  const meta = [p.degree, p.campus, p.ects ? `${p.ects} ECTS` : null].filter(Boolean);
  return `
  <li class="prog">
    <div>
      <h3 class="prog__name"><a href="${BASE}${p.href}">${escapeHtml(p.name)}</a></h3>
      <p class="prog__meta">
        <span><strong>${escapeHtml(p.institution)}</strong></span>
        ${meta.map((m) => `<span>${escapeHtml(m)}</span>`).join('')}
      </p>
      ${p.summary ? `<p class="prog__req">${escapeHtml(p.summary)}</p>` : ''}
    </div>
    <div class="prog__side">
      ${p.requirements ? `<p class="prog__req"><strong>Requires:</strong> ${escapeHtml(p.requirements)}</p>` : ''}
      ${p.restricted
        ? `<p><span class="tag tag--warn">Restricted admission</span></p>`
        : `<p><span class="tag tag--ok">Open admission</span></p>`}
      ${p.cutoff ? `<p><small>Cut-off ${escapeHtml(p.cutoff)}</small></p>` : ''}
    </div>
  </li>`;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
}

function render() {
  const hits = programmes.filter(matches).sort((a, b) => a.name.localeCompare(b.name));

  els.count.innerHTML = hits.length
    ? `<b>${hits.length}</b> of ${programmes.length} programmes`
    : `<b>Nothing matches</b>`;

  els.results.innerHTML = hits.length
    ? hits.map(row).join('')
    : `<li class="empty">No programme matches those filters. Try removing one — the English-taught
       catalogue in Denmark is small, so two or three filters can empty it quickly.</li>`;

  syncUrl();
}

function syncUrl() {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(state)) {
    if (v === true) params.set(k, '1');
    else if (typeof v === 'string' && v) params.set(k, v);
  }
  const qs = params.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}

function readUrl() {
  const params = new URLSearchParams(location.search);
  for (const k of ['q', 'field', 'inst', 'campus']) {
    const v = params.get(k);
    if (v) { state[k] = v; if (els[k]) els[k].value = v; }
  }
  for (const k of ['open', 'nomath']) {
    if (params.get(k) === '1') { state[k] = true; els[k].setAttribute('aria-pressed', 'true'); }
  }
}

/* Wiring */
els.q?.addEventListener('input', (e) => { state.q = e.target.value; render(); });
for (const k of ['field', 'inst', 'campus']) {
  els[k]?.addEventListener('change', (e) => { state[k] = e.target.value; render(); });
}
for (const k of ['open', 'nomath']) {
  els[k]?.addEventListener('click', () => {
    state[k] = !state[k];
    els[k].setAttribute('aria-pressed', String(state[k]));
    render();
  });
}
els.reset?.addEventListener('click', () => {
  Object.assign(state, { q: '', field: '', inst: '', campus: '', open: false, nomath: false });
  els.q.value = '';
  for (const k of ['field', 'inst', 'campus']) els[k].value = '';
  for (const k of ['open', 'nomath']) els[k].setAttribute('aria-pressed', 'false');
  render();
});
document.getElementById('prog-filters')?.addEventListener('submit', (e) => e.preventDefault());

readUrl();
render();
