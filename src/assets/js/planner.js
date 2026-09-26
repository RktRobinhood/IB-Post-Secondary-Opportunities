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
  applicantGroupsOf, assessAll, buildSubjectIndex, convertAverage, convertProfile, cutoffComparison, OUTCOME,
} from './eligibility.js';

const BASE = document.documentElement.dataset.base === '/' ? '' : document.documentElement.dataset.base;
const json = (id) => JSON.parse(document.getElementById(id).textContent);

const SUBJECTS = json('planner-subjects');
const OPPORTUNITIES = json('planner-opportunities');
const EVIDENCE = json('planner-evidence');
const POLICY = json('planner-evidence-policy');
const CONVERSION = json('planner-conversion');
const GROUPS = json('planner-groups');

/* The local scale's adjective comes from the Recognition Scheme on the page,
   never from this file: with none, or more than one, the words say "local". */
const ADJ = CONVERSION.adjective || null;
const withArticle = (w) => `${/^[AEIOU]/i.test(w) ? 'an' : 'a'} ${w}`;

const subjectIndex = buildSubjectIndex(SUBJECTS);
const STORAGE_KEY = 'ibp-profile-v2';

/**
 * Roll an Opportunity's evidence references up into one status.
 *
 * This used to be a second implementation of the precedence — conflict,
 * unavailable, superseded, stale, needs-review, verified — written out again
 * in the browser, including its own "is this past its review date" against the
 * date the page happened to be opened. Two implementations of a load-bearing
 * product rule cannot be kept in step by intention.
 *
 * Now each record arrives with its `level` already decided at build time, and
 * POLICY carries the order and the labels. The only thing left here is "the
 * weakest one wins", which is a roll-up and not a policy.
 */
function evidenceStatus(refs) {
  const records = (refs || []).map((r) => EVIDENCE[r]).filter(Boolean);
  if (!records.length) return { level: 'none', label: POLICY.labels.none, records: [] };

  const rank = (level) => {
    const i = POLICY.order.indexOf(level);
    // An unrecognised level is not evidence of quality: treat it as the worst.
    return i === -1 ? 0 : i;
  };
  let level = POLICY.order[POLICY.order.length - 1];
  for (const r of records) if (rank(r.level) < rank(level)) level = r.level;

  const checkedAt = records.map((r) => r.retrievedAt).filter(Boolean).sort().at(-1) || null;
  return { level, label: POLICY.labels[level], checkedAt, records };
}

const options = {
  conversion: CONVERSION,
  subjectIndex,
  evidenceStatus,
  dataVersion: document.querySelector('meta[name="data-revision"]')?.content || null,
};

const show = {
  [OUTCOME.MEETS]: true,
  [OUTCOME.OTHER_ROUTE]: true,
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

  /* Three states, and null is one of them.
   *
   * This used to read `holdsDiploma: true` — a hidden answer to a question the
   * form never asked, which meant every Diploma-gated rule in the engine
   * evaluated in the student's favour and the whole distinction was invisible.
   * An unanswered question is now unanswered: the engine has a branch for that
   * and it says Needs review. */
  const award = document.getElementById('p-award')?.value || '';
  const holdsDiploma = award === 'diploma' ? true : award === 'course-results' ? false : null;

  return {
    subjects,
    totalPoints: Number.isFinite(total) && total >= 18 && total <= 45 ? total : null,
    applicantGroup: document.getElementById('p-group')?.value || null,
    applicantGroups: applicantGroupsOf(document.getElementById('p-group')?.value || null, GROUPS),
    award,
    holdsDiploma,
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
  /* Restored from `award` rather than from `holdsDiploma`, because the stored
     boolean cannot tell "no" from "not answered" once it has been through JSON,
     and a profile saved before this question existed must come back unanswered
     rather than as a Diploma. */
  const award = document.getElementById('p-award');
  if (award && typeof saved.award === 'string') award.value = saved.award;
}

/* --- Rendering -------------------------------------------------------------- */

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const els = {
  converted: document.getElementById('p-converted'),
  results: document.getElementById('p-results'),
  count: document.getElementById('p-count'),
  how: document.getElementById('p-how'),
};

const BADGE = {
  [OUTCOME.MEETS]: ['tag--ok', 'Meets published requirements'],
  // Eligible, but only through another route (the label is the route's: "Quota 2 only").
  [OUTCOME.OTHER_ROUTE]: ['tag--sand', null],
  [OUTCOME.POSSIBLE]: ['tag--sand', 'Possible with action'],
  [OUTCOME.NEEDS_REVIEW]: ['tag--warn', 'Needs review'],
  [OUTCOME.DOES_NOT_MEET]: ['', 'Does not currently meet'],
};

/* What the count line adds once the award is known — or is known not to be.
 *
 * The line for a Course candidate deliberately points at what is still open
 * before it points at what is not. A result that says "six of fifty-three" and
 * stops has told them the worst part of the truth and nothing else; the routes
 * themselves are per-programme and come from the records, on each card. */
const AWARD_NOTE = {
  '': 'You have not said which IB award you will finish with. Anything that turns on it is shown as Needs review rather than guessed either way — answer it on the left and these become yes or no.',
  'course-results': 'You expect Course Results rather than the full Diploma. That changes what some of these will accept and it closes fewer of them than it looks: open <em>Why this result</em> on any programme below and, where its source publishes another way in, it is written there. Where nothing has been established either way, it says that too rather than treating silence as a yes.',
};

const MATCH_CLASS = {
  [OUTCOME.MEETS]: 'yes',
  [OUTCOME.OTHER_ROUTE]: 'near',
  [OUTCOME.POSSIBLE]: 'near',
  [OUTCOME.NEEDS_REVIEW]: 'near',
  [OUTCOME.DOES_NOT_MEET]: 'no',
};

function renderConverted(profile) {
  const chosen = profile.subjects.length;
  if (!chosen) {
    els.converted.innerHTML = `Your ${ADJ ? `${ADJ} levels` : 'converted subject levels'} will appear here.`;
    return;
  }
  const { held, unmappedSubjects } = convertProfile(profile, subjectIndex);

  const chips = [...held.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, v]) => `<span class="tag tag--brand">${esc(name)} ${v.level}</span>`);

  const avg = profile.totalPoints ? convertAverage(profile.totalPoints, CONVERSION.average) : null;

  els.converted.innerHTML = `
    <span style="flex-basis:100%"><strong>${chosen} of 6 subjects entered</strong></span>
    ${chips.length
      ? `<details style="flex-basis:100%"><summary>What your subjects count as${ADJ ? ` on the ${ADJ} scale` : ''}</summary>
           <p style="margin:.5rem 0 0;display:flex;flex-wrap:wrap;gap:.35rem">${chips.join(' ')}</p>
           <p style="margin:.35rem 0 0;font-size:.8125rem;color:var(--ink-mute)">One IB subject can count as several of these at once. Each result below says, in IB terms, which of your subjects meets what.</p>
         </details>`
      : ''}
    ${avg !== null
      ? `<span style="flex-basis:100%;margin-top:.5rem">${profile.totalPoints} points converts to ${withArticle(ADJ ? `${ADJ} average` : 'local average')} of <strong>${avg.toFixed(1)}</strong>.</span>`
      : ''}
    ${unmappedSubjects.length
      ? `<span style="flex-basis:100%;margin-top:.5rem;color:var(--warn)">
           ${unmappedSubjects.map((u) => `${esc(u.name)} ${esc(u.level)} has no published ${ADJ || 'local'} equivalent.`).join(' ')}
         </span>`
      : ''}`;
}

/* The cut-off beside the student's own total — "You: 34 · last cut-off: 40"
   (cutoffComparison, in the engine, where the tests read it) — and, where the
   figure is not a number but a floor exists, the floor in its place: "All
   qualified applicants accepted" is only true above it. A cut-off any IB
   Diploma clears is never printed as a points total below the Diploma's. */
function cutoffLine(assessment) {
  const c = assessment.selection.historicalCutoffs[0];
  const year = c.intake ? esc(c.intake.split('-')[0]) : null;
  const intake = year ? ` (${year} intake, not a prediction)` : '';
  const floor = (assessment.floors || []).find((f) => f.terms?.ibPoints != null);
  if (!/^\d+([.,]\d+)?$/.test(String(c.value).trim())) {
    if (floor) return ` — ${esc(c.value)} in ${esc(floor.quota.toLowerCase())}, from ${floor.terms.ibPoints} IB points${intake}`;
    /* "All admitted" is an outcome, not a figure: nobody qualified was turned away. */
    return /^all\b/i.test(String(c.value))
      ? ` — in the ${year || 'last'} intake every qualified applicant got a place ("${esc(c.value)}"; not a prediction)`
      : ` — most recent outcome "${esc(c.value)}"${intake}`;
  }
  const cmp = cutoffComparison(c, lastProfile?.totalPoints ?? null, subjectIndex);
  const said = cmp.anyDiploma ? ', which any IB Diploma clears' : cmp.points ? `, ${cmp.points} IB points` : '';
  return ` — most recent cut-off ${esc(c.value)}${said}${intake}${cmp.you ? `. <strong>${esc(cmp.you)}</strong>` : ''}`;
}

let lastProfile = null;

/* A passage many results share — the national supplementary-course sentence,
   the Agency's Course Results route — is said once, above the results, and a
   card that shares it says what it is and points up (round 4: one 90-word
   paragraph was repeated on 46 cards). `common` holds the keys said above. */
function rule(entry, mark, common = new Map()) {
  let text = esc(entry.message);
  for (const s of entry.shared || []) {
    if (!common.has(s.key)) continue;
    text = text.replace(esc(s.text), `${esc(s.short)} (<a href="#p-how">how: see above</a>)`);
  }
  return `<li>${mark} ${text}</li>`;
}

/* Who a shared passage belongs to, for the box above the results. */
function sharedWhose(s) {
  if (s.key.startsWith('route:')) return 'Without the full Diploma';
  return s.whose ? `At ${s.whose}` : `Where the institution names no route of its own${ADJ ? ` (the ${ADJ} national rule)` : ''}`;
}

function renderHow(common) {
  if (!els.how) return;
  if (!common.size) {
    els.how.hidden = true;
    els.how.innerHTML = '';
    return;
  }
  els.how.hidden = false;
  els.how.innerHTML = `<summary>How to close a gap: said once here for the results below that share it</summary>
    <ul style="margin:.25rem 0 0;padding-left:1.2em;font-size:.875rem;color:var(--ink-soft);line-height:1.6">
      ${[...common.values()].map(({ s, n }) => s.key.startsWith('route:')
        /* A route is long (up to 400 words for a Dutch one): its one-line
           summary here, the whole of it one tap down. */
        ? `<li><strong>${esc(sharedWhose(s))}</strong> (${n} results): ${esc(s.short)}
             <details><summary style="font-family:var(--sans);font-size:.8125rem;font-weight:400;padding:.2rem 1.6rem .2rem 0">The whole route, as its record words it</summary><p style="margin:.25rem 0 0">${esc(s.text)}</p></details></li>`
        : `<li><strong>${esc(sharedWhose(s))}</strong> (${n} results): ${esc(s.text)}</li>`).join('')}
    </ul>`;
}

/* The faded photograph of the discipline behind a result. The same markup as
   backdropImg() in src/lib/components.mjs and backdrop() in explorer.js, from
   fields built by src/pages/planner.mjs. */
function backdrop(b) {
  return b
    ? `<img class="prog__backdrop" src="${esc(b.src)}" srcset="${esc(b.srcset)}" sizes="${esc(b.sizes)}" alt="" loading="lazy" decoding="async" width="${esc(b.width)}" height="${esc(b.height)}" data-backdrop="${esc(b.key)}">`
    : '';
}

function renderCard({ opportunity, assessment }, common = new Map()) {
  const d = opportunity.display;
  const [badgeClass, fixedLabel] = BADGE[assessment.outcome];
  const badgeLabel = fixedLabel || assessment.outcomeLabel;
  const ev = assessment.provenance.evidence;

  const explanation = [
    ...assessment.matched.map((e) => rule(e, '<span aria-hidden="true">✓</span>')),
    ...assessment.gaps.map((e) => rule(e, '<span aria-hidden="true">✗</span>', common)),
    ...assessment.unknowns.map((e) => rule(e, '<span aria-hidden="true">?</span>')),
    /* A floor that decides which quota ranks you, not whether you qualify. */
    ...(assessment.floors || []).map((f) =>
      rule(
        { message: `${f.quota}: ${f.message}` },
        f.status === 'met' ? '<span aria-hidden="true">✓</span>' : f.status === 'unmet' ? '<span aria-hidden="true">!</span>' : '<span aria-hidden="true">?</span>'
      )
    ),
  ].join('');

  return `
  <li class="prog${d.backdrop ? ' prog--backdrop' : ''}" data-match="${MATCH_CLASS[assessment.outcome]}">
    ${backdrop(d.backdrop)}
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
      <p><span class="tag ${badgeClass}">${esc(badgeLabel)}</span></p>
      ${assessment.route
        ? `<p><small><strong>Your way in:</strong> ${esc(assessment.route.text)}</small></p>`
        : ''}
      ${assessment.actionSummary
        ? `<p><small><strong>To do:</strong> ${esc(assessment.actionSummary)}</small></p>`
        : ''}
      <p><small>
        ${assessment.selection.restricted
          ? `Restricted admission${assessment.selection.historicalCutoffs.length
              ? cutoffLine(assessment)
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
    renderHow(new Map());
    return;
  }

  lastProfile = profile;
  const results = assessAll(profile, OPPORTUNITIES, options);
  const tally = {};
  for (const r of results) tally[r.assessment.outcome] = (tally[r.assessment.outcome] || 0) + 1;

  const visible = results.filter((r) => show[r.assessment.outcome]);

  els.count.innerHTML =
    `<b>${tally[OUTCOME.MEETS] || 0}</b> meet the published requirements · ` +
    (tally[OUTCOME.OTHER_ROUTE]
      ? `<b>${tally[OUTCOME.OTHER_ROUTE]}</b> ${esc(otherRouteLabel(results))} · `
      : '') +
    `<b>${tally[OUTCOME.POSSIBLE] || 0}</b> possible with action · ` +
    `<b>${tally[OUTCOME.NEEDS_REVIEW] || 0}</b> need review · ` +
    `<b>${tally[OUTCOME.DOES_NOT_MEET] || 0}</b> not currently met` +
    (profile.subjects.length < 6
      ? ` <span style="color:var(--warn)">(only ${profile.subjects.length} of 6 subjects entered)</span>`
      : '') +
    (AWARD_NOTE[profile.award] ? `<br><small>${AWARD_NOTE[profile.award]}</small>` : '');

  /* Passages on two or more of the visible cards are said once, above them. */
  const common = new Map();
  for (const r of visible) {
    const seen = new Set();
    for (const g of r.assessment.gaps) {
      for (const s of g.shared || []) {
        if (seen.has(s.key)) continue;
        seen.add(s.key);
        const had = common.get(s.key);
        common.set(s.key, { s, n: (had?.n || 0) + 1 });
      }
    }
  }
  for (const [k, v] of common) if (v.n < 2) common.delete(k);
  renderHow(common);

  els.results.innerHTML = visible.length
    ? visible.map((r) => renderCard(r, common)).join('')
    : '<li class="empty">Nothing to show with those filters on.</li>';
}

/* "quota 2 only", from the results that carry it — the route's own name. */
function otherRouteLabel(results) {
  const labels = [...new Set(results.filter((r) => r.assessment.outcome === OUTCOME.OTHER_ROUTE).map((r) => r.assessment.outcomeLabel))];
  return labels.length === 1 ? labels[0].toLowerCase() : 'only through another admission route';
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
  const award = document.getElementById('p-award');
  if (award) award.value = '';
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
