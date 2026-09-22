/* The subject checker.
 *
 * This is a thin shell around src/lib/eligibility.mjs — the same module the
 * build and the tests use. There is one implementation of the rules, so what a
 * student is told here is exactly what the test suite asserts.
 *
 * The Student Profile lives in this browser and nowhere else. No account, no
 * request, no identifying field.
 */
import {
  assessAll, buildSubjectIndex, convertAverage, convertProfile, OUTCOME,
} from './eligibility.js';

const BASE = document.documentElement.dataset.base === '/' ? '' : document.documentElement.dataset.base;
const json = (id) => JSON.parse(document.getElementById(id).textContent);

const SUBJECTS = json('planner-subjects');
const OPPORTUNITIES = json('planner-opportunities');
const EVIDENCE = json('planner-evidence');
const CONVERSION = json('planner-conversion');

const subjectIndex = buildSubjectIndex(SUBJECTS);
const STORAGE_KEY = 'ibp-profile-v2';

/** Roll an Opportunity's evidence references up into one status. */
function evidenceStatus(refs) {
  const records = (refs || []).map((r) => EVIDENCE[r]).filter(Boolean);
  if (!records.length) return { level: 'none', label: 'No source recorded', records: [] };
  if (records.some((r) => r.conflicts)) return { level: 'conflicting', label: 'Sources disagree', records };
  const states = new Set(records.map((r) => r.state));
  if (states.has('unavailable')) return { level: 'unavailable', label: 'Source unavailable', records };
  if (states.has('superseded')) return { level: 'superseded', label: 'Superseded', records };
  const checkedAt = records.map((r) => r.retrievedAt).filter(Boolean).sort().at(-1);
  const today = new Date().toISOString().slice(0, 10);
  if (records.some((r) => r.reviewBy && r.reviewBy < today)) {
    return { level: 'stale', label: 'Past its review date', checkedAt, records };
  }
  if (states.has('needs-review')) return { level: 'needs-review', label: 'Not yet checked by a person', records, checkedAt };
  return { level: 'verified', label: 'Verified', checkedAt, records };
}

const options = {
  conversion: CONVERSION,
  subjectIndex,
  evidenceStatus,
  dataVersion: document.querySelector('meta[name="data-revision"]')?.content || null,
};

const show = {
  [OUTCOME.MEETS]: true,
  [OUTCOME.POSSIBLE]: true,
  [OUTCOME.NEEDS_REVIEW]: true,
  [OUTCOME.DOES_NOT_MEET]: false,
};

/* --- Reading the form ------------------------------------------------------- */

function readProfile() {
  const subjects = [];
  for (let n = 1; n <= 6; n++) {
    const subject = document.querySelector(`.p-subject[data-slot="${n}"]`)?.value || '';
    const level = document.querySelector(`.p-level[data-slot="${n}"]`)?.value || 'HL';
    const grade = document.querySelector(`.p-grade[data-slot="${n}"]`)?.value || '';
    if (subject) subjects.push({ subject, level, grade: grade ? Number(grade) : null });
  }
  const total = Number(document.getElementById('p-total').value);
  return {
    subjects,
    totalPoints: Number.isFinite(total) && total >= 18 && total <= 45 ? total : null,
    applicantGroup: document.getElementById('p-group')?.value || null,
    holdsDiploma: true,
    languages: [],
  };
}

function save(profile) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch {}
}

function restore() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return; }
  if (!saved) return;
  (saved.subjects || []).forEach((entry, i) => {
    const n = i + 1;
    const s = document.querySelector(`.p-subject[data-slot="${n}"]`);
    const l = document.querySelector(`.p-level[data-slot="${n}"]`);
    const g = document.querySelector(`.p-grade[data-slot="${n}"]`);
    if (s && entry.subject) s.value = entry.subject;
    if (l && entry.level) l.value = entry.level;
    if (g && entry.grade) g.value = String(entry.grade);
  });
  if (saved.totalPoints) document.getElementById('p-total').value = saved.totalPoints;
  if (saved.applicantGroup) document.getElementById('p-group').value = saved.applicantGroup;
}

/* --- Rendering -------------------------------------------------------------- */

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const els = {
  converted: document.getElementById('p-converted'),
  results: document.getElementById('p-results'),
  count: document.getElementById('p-count'),
};

const BADGE = {
  [OUTCOME.MEETS]: ['tag--ok', 'Meets published requirements'],
  [OUTCOME.POSSIBLE]: ['tag--sand', 'Possible with action'],
  [OUTCOME.NEEDS_REVIEW]: ['tag--warn', 'Needs review'],
  [OUTCOME.DOES_NOT_MEET]: ['', 'Does not currently meet'],
};

const MATCH_CLASS = {
  [OUTCOME.MEETS]: 'yes',
  [OUTCOME.POSSIBLE]: 'near',
  [OUTCOME.NEEDS_REVIEW]: 'near',
  [OUTCOME.DOES_NOT_MEET]: 'no',
};

function renderConverted(profile) {
  const chosen = profile.subjects.length;
  if (!chosen) {
    els.converted.innerHTML = 'Your Danish levels will appear here.';
    return;
  }
  const { held, unmappedSubjects } = convertProfile(profile, subjectIndex);

  const chips = [...held.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, v]) => `<span class="tag tag--brand">${esc(name)} ${v.level}</span>`);

  const avg = profile.totalPoints ? convertAverage(profile.totalPoints, CONVERSION.average) : null;

  els.converted.innerHTML = `
    <span style="flex-basis:100%"><strong>${chosen} of 6 subjects entered</strong></span>
    ${chips.join(' ')}
    ${avg !== null
      ? `<span style="flex-basis:100%;margin-top:.5rem">${profile.totalPoints} points converts to a Danish average of <strong>${avg.toFixed(1)}</strong>.</span>`
      : ''}
    ${unmappedSubjects.length
      ? `<span style="flex-basis:100%;margin-top:.5rem;color:var(--warn)">
           ${unmappedSubjects.map((u) => `${esc(u.name)} ${esc(u.level)} has no published Danish equivalent.`).join(' ')}
         </span>`
      : ''}`;
}

function rule(entry, mark) {
  return `<li>${mark} ${esc(entry.message)}</li>`;
}

function renderCard({ opportunity, assessment }) {
  const d = opportunity.display;
  const [badgeClass, badgeLabel] = BADGE[assessment.outcome];
  const ev = assessment.provenance.evidence;

  const explanation = [
    ...assessment.matched.map((e) => rule(e, '<span aria-hidden="true">✓</span>')),
    ...assessment.gaps.map((e) => rule(e, '<span aria-hidden="true">✗</span>')),
    ...assessment.unknowns.map((e) => rule(e, '<span aria-hidden="true">?</span>')),
  ].join('');

  return `
  <li class="prog" data-match="${MATCH_CLASS[assessment.outcome]}">
    <div>
      <h3 class="prog__name"><a href="${BASE}${d.href}">${esc(d.name)}</a></h3>
      <p class="prog__meta">
        <span><strong>${esc(d.institution)}</strong></span>
        ${d.campus ? `<span>${esc(d.campus)}</span>` : ''}
        ${d.degree ? `<span>${esc(d.degree)}</span>` : ''}
      </p>
      <details class="acc" style="border:0">
        <summary style="font-family:var(--sans);font-size:.9375rem;padding:.35rem 1.6rem .35rem 0">
          Why this result
        </summary>
        <ul style="margin:.25rem 0 0;padding-left:1.2em;font-size:.875rem;color:var(--ink-soft);line-height:1.6">
          ${explanation || '<li>No requirements are recorded for this programme yet.</li>'}
          ${assessment.dataIssues.map((i) => `<li><strong>${esc(i)}</strong></li>`).join('')}
        </ul>
      </details>
    </div>
    <div class="prog__side">
      <p><span class="tag ${badgeClass}">${badgeLabel}</span></p>
      <p><small>
        ${assessment.selection.restricted
          ? `Restricted admission${assessment.selection.historicalCutoffs.length
              ? ` — most recent cut-off ${esc(assessment.selection.historicalCutoffs[0].value)} (${esc(assessment.selection.historicalCutoffs[0].intake.split('-')[0])} intake, not a prediction)`
              : ''}.`
          : 'Open admission: meeting the requirements is enough.'}
      </small></p>
      <p><small>
        ${ev ? `Evidence: ${esc(ev.label.toLowerCase())}${ev.checkedAt ? `, checked ${esc(ev.checkedAt)}` : ''}. ` : ''}
        Intake ${esc(assessment.provenance.intake || '')}.
      </small></p>
      ${d.official ? `<p><small><a href="${esc(d.official)}" rel="noopener nofollow">Check the official page</a></small></p>` : ''}
    </div>
  </li>`;
}

function render() {
  const profile = readProfile();
  save(profile);
  renderConverted(profile);

  if (profile.subjects.length < 2) {
    els.count.textContent = 'Choose at least two subjects to see where you stand.';
    els.results.innerHTML = '';
    return;
  }

  const results = assessAll(profile, OPPORTUNITIES, options);
  const tally = {};
  for (const r of results) tally[r.assessment.outcome] = (tally[r.assessment.outcome] || 0) + 1;

  const visible = results.filter((r) => show[r.assessment.outcome]);

  els.count.innerHTML =
    `<b>${tally[OUTCOME.MEETS] || 0}</b> meet the published requirements · ` +
    `<b>${tally[OUTCOME.POSSIBLE] || 0}</b> possible with action · ` +
    `<b>${tally[OUTCOME.NEEDS_REVIEW] || 0}</b> need review · ` +
    `<b>${tally[OUTCOME.DOES_NOT_MEET] || 0}</b> not currently met` +
    (profile.subjects.length < 6
      ? ` <span style="color:var(--warn)">(only ${profile.subjects.length} of 6 subjects entered)</span>`
      : '');

  els.results.innerHTML = visible.length
    ? visible.map(renderCard).join('')
    : '<li class="empty">Nothing to show with those filters on.</li>';
}

/* --- Wiring ------------------------------------------------------------------ */

const form = document.getElementById('picker');
form?.addEventListener('change', render);
form?.addEventListener('input', (e) => { if (e.target.id === 'p-total') render(); });
form?.addEventListener('submit', (e) => e.preventDefault());

document.getElementById('p-reset')?.addEventListener('click', () => {
  for (const el of document.querySelectorAll('.p-subject, .p-grade')) el.value = '';
  for (const el of document.querySelectorAll('.p-level')) el.value = 'HL';
  document.getElementById('p-total').value = '';
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  render();
});

for (const chip of document.querySelectorAll('[data-show]')) {
  chip.addEventListener('click', () => {
    const key = chip.dataset.show;
    show[key] = !show[key];
    chip.setAttribute('aria-pressed', String(show[key]));
    render();
  });
}

restore();
render();
