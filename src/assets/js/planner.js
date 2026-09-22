/* Subject checker.
 *
 * Takes the six IB subjects a student actually has, converts them to Danish
 * levels using the Agency's published table (emitted into the page by the
 * build), and tests them against every programme's requirements.
 *
 * Two rules do most of the work and are worth stating plainly:
 *   - A higher Danish level satisfies a lower requirement. Mathematics A meets
 *     a Mathematics B requirement; the reverse is not true.
 *   - A requirement is only "met" if the level is high enough AND any minimum
 *     grade is reached, after converting the IB grade to the Danish scale.
 */

const BASE = document.documentElement.dataset.base === '/' ? '' : document.documentElement.dataset.base;
const SUBJECTS = JSON.parse(document.getElementById('planner-subjects').textContent);
const PROGRAMMES = JSON.parse(document.getElementById('planner-programmes').textContent);
const CONVERSION = JSON.parse(document.getElementById('planner-conversion').textContent);

const LEVEL_RANK = { A: 3, B: 2, C: 1 };

/**
 * Programme requirements name Danish school subjects; the conversion table
 * groups some of them together. This reconciles the two vocabularies.
 */
const ALIASES = {
  'Business and economics subjects': [
    'International Economics', 'Business Economics', 'Economics', 'Marketing', 'Afsætning',
  ],
  'Computing / IT / programming': ['Information Technology', 'Communication and IT', 'Computer Science'],
  'Danish as a second language': ['Danish'],
  Geography: ['Geography'],
};

/** Subjects a programme may ask for that the official table does not map. */
const UNMAPPED_WARNING = {
  'Social Studies':
    'Denmark publishes no fixed equivalence for Social Studies. If you took Global Politics, each institution decides case by case — ask its admissions office in writing before 15 March.',
  Geoscience:
    'The handbook lists no IB equivalent for Geoscience A. IB Geography HL is not automatically accepted; you would normally need a Danish supplementary course.',
};

/* --- Convert the student's subjects ---------------------------------------- */

const state = { picks: [], total: null, show: { yes: true, near: true, no: false } };

function danishGrade(ibGrade) {
  const row = CONVERSION.single.find((r) => r.ib === Number(ibGrade));
  return row ? row.dk : null;
}

function danishAverage(points) {
  const row = CONVERSION.average.find((r) => r.ib === Number(points));
  return row ? row.dk : null;
}

/** The student's Danish subject levels, keeping the best level for each subject. */
function heldSubjects() {
  const held = new Map();
  for (const pick of state.picks) {
    if (!pick.subject) continue;
    const entry = SUBJECTS.find((s) => s.ib === pick.subject);
    if (!entry) continue;

    const names = [entry.danish, ...(ALIASES[entry.danish] || [])];
    for (const name of names) {
      const existing = held.get(name);
      const rank = LEVEL_RANK[entry.level] || 0;
      if (!existing || rank > existing.rank) {
        held.set(name, { level: entry.level, rank, ib: pick.subject, grade: pick.grade || null });
      } else if (existing && rank === existing.rank && pick.grade && Number(pick.grade) > Number(existing.grade || 0)) {
        existing.grade = pick.grade;
      }
    }
  }
  return held;
}

/** Test one requirement against what the student holds. */
function testRequirement(req, held) {
  const have = held.get(req.subject);
  if (!have) {
    return {
      ok: false,
      why: UNMAPPED_WARNING[req.subject]
        ? `${req.subject} ${req.level} — ${UNMAPPED_WARNING[req.subject]}`
        : `You do not have ${req.subject} at any level.`,
      soft: !!UNMAPPED_WARNING[req.subject],
    };
  }
  const needed = LEVEL_RANK[req.level] || 0;
  if (have.rank < needed) {
    return { ok: false, why: `${req.subject}: you have ${have.level} level, this needs ${req.level}.` };
  }
  if (req.minGrade) {
    const dk = have.grade ? danishGrade(have.grade) : null;
    if (dk === null) {
      return { ok: true, why: `${req.subject} ${req.level} needs a minimum Danish grade of ${req.minGrade} — add your grade to check.`, unknown: true };
    }
    if (dk < Number(req.minGrade)) {
      return { ok: false, why: `${req.subject}: your ${have.ib} grade converts to ${dk}, below the required ${req.minGrade}.` };
    }
  }
  return { ok: true };
}

/** Evaluate a whole programme: 'yes', 'near' (one thing missing) or 'no'. */
function evaluate(p, held) {
  const misses = [];
  const caveats = [];

  for (const req of p.entry?.all || []) {
    const r = testRequirement(req, held);
    if (!r.ok) misses.push(r.why);
    else if (r.why) caveats.push(r.why);
  }

  const groups = p.entry?.oneOf || [];
  if (groups.length) {
    let best = null;
    for (const group of groups) {
      const groupMisses = [];
      for (const req of group) {
        const r = testRequirement(req, held);
        if (!r.ok) groupMisses.push(r.why);
        else if (r.why) caveats.push(r.why);
      }
      if (!best || groupMisses.length < best.length) best = groupMisses;
      if (groupMisses.length === 0) break;
    }
    if (best && best.length) misses.push(...best);
  }

  return {
    status: misses.length === 0 ? 'yes' : misses.length === 1 ? 'near' : 'no',
    misses,
    caveats,
  };
}

/* --- Rendering -------------------------------------------------------------- */

const converted = document.getElementById('p-converted');
const results = document.getElementById('p-results');
const count = document.getElementById('p-count');

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
}

function renderConverted(held) {
  const chosen = state.picks.filter((p) => p.subject).length;
  if (!chosen) {
    converted.innerHTML = 'Your Danish levels will appear here.';
    return;
  }

  const rows = [...held.entries()]
    .filter(([name]) => !Object.values(ALIASES).flat().includes(name) || held.size < 4)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, v]) => `<span class="tag tag--brand">${escapeHtml(name)} ${v.level}</span>`);

  const avg = state.total ? danishAverage(state.total) : null;

  converted.innerHTML = `
    <span style="flex-basis:100%"><strong>${chosen} of 6 subjects entered</strong></span>
    ${rows.join(' ')}
    ${avg !== null
      ? `<span style="flex-basis:100%;margin-top:.5rem">${state.total} points converts to a Danish average of <strong>${avg.toFixed(1)}</strong>.</span>`
      : ''}`;
}

function card(p, verdict) {
  const badge =
    verdict.status === 'yes'
      ? '<span class="tag tag--ok">You qualify</span>'
      : verdict.status === 'near'
        ? '<span class="tag tag--sand">One subject short</span>'
        : '<span class="tag">Not eligible</span>';

  return `
  <li class="prog" data-match="${verdict.status}">
    <div>
      <h3 class="prog__name"><a href="${BASE}${p.href}">${escapeHtml(p.name)}</a></h3>
      <p class="prog__meta">
        <span><strong>${escapeHtml(p.institution)}</strong></span>
        ${p.campus ? `<span>${escapeHtml(p.campus)}</span>` : ''}
        <span>${escapeHtml(p.field)}</span>
      </p>
      ${p.requirements ? `<p class="prog__req"><strong>Requires:</strong> ${escapeHtml(p.requirements)}</p>` : ''}
      ${verdict.misses.length
        ? `<ul style="margin:.5rem 0 0;padding-left:1.1em;font-size:.875rem;color:var(--ink-soft)">
             ${verdict.misses.map((m) => `<li>${escapeHtml(m)}</li>`).join('')}
           </ul>`
        : ''}
      ${verdict.caveats.length
        ? `<p class="prog__req" style="color:var(--warn)">${verdict.caveats.map(escapeHtml).join(' ')}</p>`
        : ''}
    </div>
    <div class="prog__side">
      <p>${badge}</p>
      ${p.restricted
        ? `<p><small>Restricted admission${p.cutoff ? ` — cut-off ${escapeHtml(p.cutoff)}` : ''}. Meeting the requirements is not the same as getting a place.</small></p>`
        : `<p><small>Open admission — meet the requirements and you are in.</small></p>`}
    </div>
  </li>`;
}

function render() {
  const held = heldSubjects();
  renderConverted(held);

  const chosen = state.picks.filter((p) => p.subject).length;
  if (chosen < 2) {
    count.textContent = 'Choose at least two subjects to see which programmes you qualify for.';
    results.innerHTML = '';
    return;
  }

  const scored = PROGRAMMES.map((p) => ({ p, v: evaluate(p, held) }));
  const order = { yes: 0, near: 1, no: 2 };
  const visible = scored
    .filter(({ v }) => state.show[v.status])
    .sort((a, b) => order[a.v.status] - order[b.v.status] || a.p.name.localeCompare(b.p.name));

  const n = { yes: 0, near: 0, no: 0 };
  for (const { v } of scored) n[v.status]++;

  count.innerHTML =
    `<b>${n.yes}</b> you qualify for · <b>${n.near}</b> one subject short · <b>${n.no}</b> not eligible` +
    (chosen < 6 ? ` <span style="color:var(--warn)">(only ${chosen} of 6 subjects entered)</span>` : '');

  results.innerHTML = visible.length
    ? visible.map(({ p, v }) => card(p, v)).join('')
    : `<li class="empty">Nothing to show with those filters on.</li>`;
}

/* --- Wiring ----------------------------------------------------------------- */

function readForm() {
  state.picks = [1, 2, 3, 4, 5, 6].map((n) => ({
    subject: document.querySelector(`.p-subject[data-slot="${n}"]`)?.value || '',
    grade: document.querySelector(`.p-grade[data-slot="${n}"]`)?.value || '',
  }));
  const total = Number(document.getElementById('p-total').value);
  state.total = Number.isFinite(total) && total >= 18 && total <= 45 ? total : null;
  save();
}

function save() {
  try {
    localStorage.setItem('ibp-planner', JSON.stringify({ picks: state.picks, total: state.total }));
  } catch {}
}

function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem('ibp-planner') || 'null');
    if (!saved?.picks) return;
    saved.picks.forEach((pick, i) => {
      const n = i + 1;
      const s = document.querySelector(`.p-subject[data-slot="${n}"]`);
      const g = document.querySelector(`.p-grade[data-slot="${n}"]`);
      if (s && pick.subject) s.value = pick.subject;
      if (g && pick.grade) g.value = pick.grade;
    });
    if (saved.total) document.getElementById('p-total').value = saved.total;
  } catch {}
}

document.getElementById('picker')?.addEventListener('change', () => { readForm(); render(); });
document.getElementById('picker')?.addEventListener('input', (e) => {
  if (e.target.id === 'p-total') { readForm(); render(); }
});
document.getElementById('picker')?.addEventListener('submit', (e) => e.preventDefault());

document.getElementById('p-reset')?.addEventListener('click', () => {
  for (const el of document.querySelectorAll('.p-subject, .p-grade')) el.value = '';
  document.getElementById('p-total').value = '';
  try { localStorage.removeItem('ibp-planner'); } catch {}
  readForm();
  render();
});

for (const chip of document.querySelectorAll('[data-show]')) {
  chip.addEventListener('click', () => {
    const key = chip.dataset.show;
    state.show[key] = !state.show[key];
    chip.setAttribute('aria-pressed', String(state.show[key]));
    render();
  });
}

restore();
readForm();
render();
