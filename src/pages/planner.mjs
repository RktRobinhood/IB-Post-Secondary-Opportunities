import { html, raw } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import { hero, note } from '../lib/components.mjs';
import { forBrowser, serialisePolicy } from '../lib/evidence-policy.mjs';
import { backdropData } from './explorer.mjs';

/* The subject checker. */

/* --- Subject planner -------------------------------------------------------- */

export function planner(site) {
  const subjects = site.ibSubjects || [];

  const groups = [];
  for (const subject of subjects) {
    let g = groups.find((x) => x.name === subject.group);
    if (!g) { g = { name: subject.group, items: [] }; groups.push(g); }
    g.items.push(subject);
  }

  // The engine runs in the browser against the same canonical records the build
  // uses, so a result shown to a student is never a second implementation.
  const opportunities = [...(site.graph?.opportunities?.values() || [])].map((o) => {
    const prog = site.graph.programmes.get(o.programme) || {};
    const inst = site.graph.institutions.get(o.institution) || {};
    const place = site.graph.places.get(o.place);
    return {
      id: o.id,
      destination: o.destination,
      // Whose own additions to a Recognition Scheme apply (ibEquivalences).
      institution: o.institution,
      intake: o.intake,
      meta: o.meta,
      evidence: o.evidence || [],
      requirements: o.requirements || [],
      admission: o.admission || {},
      officialRequirementsText: o.officialRequirementsText || [],
      display: {
        name: prog.name || o.id,
        href: `/programmes/${o.id}/`,
        institution: inst.shortName || inst.name || '',
        institutionHref: `/universities/${inst.id}/`,
        campus: place?.name || '',
        field: prog.field?.primary || 'other',
        degree: prog.credential?.title || '',
        official: prog.links?.official || null,
        backdrop: backdropData(site.backdropFor?.(o.programme)),
      },
    };
  });

  /* The Recognition Schemes the catalogue on this page actually needs. A
     requirement written in IB terms consults none of them; one written on a
     local scale names that scale and is translated through the scheme that
     defines it. Where the whole catalogue sits behind a single scheme, its
     grade tables also drive the "your total converts to" panel — with two, that
     panel is asking about a jurisdiction nobody named and is left empty rather
     than guessing one. */
  const destinations = new Set(opportunities.map((o) => o.destination).filter(Boolean));
  /* Institutions that publish their own additions to a scheme, carrying only
     those additions: the engine reads them for their own Opportunities. */
  const institutions = [...(site.graph?.institutions?.values() || [])]
    .filter((i) => (i.ibEquivalences || []).length || (i.admissionRoutes || []).length || i.levelRaise)
    .map((i) => ({ id: i.id, name: i.name, shortName: i.shortName, ibEquivalences: i.ibEquivalences, admissionRoutes: i.admissionRoutes, levelRaise: i.levelRaise }));
  /* What the "eligible, but only through another route" outcome is called:
     the route's own name where every institution names the same one ("Quota
     2 only"), so the filter chip and the count line say one thing (round 4:
     "Another route only" beside "15 quota 2 only"). */
  const routeNames = [...new Set(institutions.flatMap((i) => (i.admissionRoutes || []).map((r) => r.quota)).filter(Boolean))];
  const otherRouteLabel = routeNames.length === 1 ? `${routeNames[0]} only` : 'Another route only';
  const schemes = (site.recognitionSchemes || []).filter((s) => destinations.has(s.destination));
  const soleScheme = schemes.length === 1 ? schemes[0] : null;
  /* What to call the levels the panel fills in. "Your Danish levels" is right
     while one Scheme covers the page and meaningless the moment two do. */
  const schemeAdjective = soleScheme
    ? site.destinations.find((d) => d.code === soleScheme.destination)?.adjective || null
    : null;

  /* Each record ships with its level already decided, and the policy ships
     beside it. The browser used to classify these itself — a second
     implementation of the precedence, in a second language, that could drift
     from the server's without anything failing. It also had to ask "is this
     past its review date", which depends on today's date: a page sitting in a
     student's browser for a week would have answered that with the day they
     opened it, and quietly disagreed with the server-rendered claim beside it. */
  const evidenceIndex = Object.fromEntries(
    [...(site.graph?.evidence?.values() || [])].map((e) => [e.id, forBrowser(e)])
  );
  const evidencePolicy = serialisePolicy();

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Tool',
  title: 'Will my subjects get me in?',
  // The conversion step is not universal and this sentence used to say it was.
  // A requirement written in IB terms consults no Recognition Scheme at all,
  // which is most of the world and now most of this catalogue — so the sentence
  // names a Scheme only where one Scheme covers everything on the page, and
  // names the Destinations the catalogue actually holds either way.
  lede: `Enter your six subjects. See which of the ${site.opportunityScope.label} degrees they open, and why${
      soleScheme ? ` — converted using ${soleScheme.label}` : ''
    }.`,
})}

<section class="section">
  <div class="wrap wrap--wide">
    <div class="layout-aside layout-aside--left">
      <aside class="layout-aside__side">
        <form class="picker" id="picker" aria-label="Your IB subjects">
          <p class="eyebrow eyebrow--plain">Your six subjects</p>
          ${[1, 2, 3, 4, 5, 6].map(
            (n) => html`
            <div class="picker__slot">
              <span class="picker__num">${n}</span>
              <select aria-label="Subject ${n}" data-slot="${n}" class="p-subject">
                <option value="">Choose a subject…</option>
                ${groups.map(
                  (g) => html`<optgroup label="${g.name}">
                    ${g.items.map((x) => html`<option value="${x.id}">${x.name}</option>`)}
                  </optgroup>`
                )}
              </select>
              <select aria-label="Level for subject ${n}" data-slot="${n}" class="p-level">
                <option value="HL">HL</option>
                <option value="SL">SL</option>
              </select>
              <select aria-label="Grade for subject ${n}" data-slot="${n}" class="p-grade">
                <option value="">Grade</option>
                ${[7, 6, 5, 4, 3, 2, 1].map((g) => html`<option value="${g}">${g}</option>`)}
              </select>
            </div>`
          )}
          <div class="field">
            <label for="p-total">Predicted total, including the TOK and EE bonus</label>
            <input type="number" id="p-total" min="18" max="45" step="1" placeholder="e.g. 34" inputmode="numeric">
          </div>
          <!-- One question, three honest answers, and no default.
               A student who has not answered it is not assumed to be either
               kind: the engine returns Needs review on anything that turns on
               the award, which is the correct answer to a question nobody has
               asked yet. Guessing "full Diploma" here — which this form used to
               do, silently, in code — makes every Diploma-gated programme show
               a clean pass to a Course candidate. -->
          <div class="field">
            <label for="p-award">Which IB award will you finish with?</label>
            <select id="p-award">
              <option value="">Not sure yet</option>
              <option value="diploma">The full IB Diploma</option>
              <option value="course-results">DP Course Results, not the full Diploma</option>
            </select>
            <p style="font-size:.8125rem;color:var(--ink-mute);margin:.35rem 0 0">
              Course Results are what the IB awards for individual subjects where the Diploma is not — whether you
              registered for courses rather than the Diploma, or sat it and did not meet its conditions. It changes
              what some programmes will accept, and each result below says how.
            </p>
          </div>
          <div class="field">
            <label for="p-group">Your fee status</label>
            <select id="p-group">
              ${(site.applicantGroups || []).map((g) => html`<option value="${g.id}">${g.label}</option>`)}
              <option value="">Prefer not to say</option>
            </select>
          </div>
          <div class="chips">
            <button type="button" class="chip" id="p-reset">Clear and start again</button>
          </div>
          <p style="font-size:.8125rem;color:var(--ink-mute);margin:0">
            Nothing here leaves your browser. It is stored on this device only, and the button above erases it.
          </p>
        </form>
        <div class="converted" id="p-converted" role="status" aria-live="polite">
          Your ${schemeAdjective ? `${schemeAdjective} levels` : 'converted subject levels'} will appear here.
        </div>
      </aside>

      <div>
        <p class="result-count" id="p-count" role="status" aria-live="polite">
          Choose at least two subjects to see where you stand.
        </p>
        <div class="chips" style="margin-bottom:var(--s5)">
          <button type="button" class="chip" data-show="meets" aria-pressed="true">Meets requirements</button>
          <button type="button" class="chip" data-show="other-route-only" aria-pressed="true">${otherRouteLabel}</button>
          <button type="button" class="chip" data-show="possible-with-action" aria-pressed="true">Possible with action</button>
          <button type="button" class="chip" data-show="needs-review" aria-pressed="true">Needs review</button>
          <button type="button" class="chip" data-show="does-not-currently-meet" aria-pressed="false">Does not currently meet</button>
        </div>
        <details class="acc" id="p-how" hidden open style="margin-bottom:var(--s5)"></details>
        <ul class="prog-list" id="p-results"></ul>
        <noscript>
          <p class="state state--empty">The subject checker needs JavaScript, because it runs entirely in your
          browser — that is also why nothing you type is sent anywhere. Without it, every programme and its
          exact entry requirements are still listed under
          <a href="${url('/#discover')}">Find a degree</a>, and the conversion tables are on the
          <a href="${url('/denmark/ib-conversion/')}">conversion page</a>.</p>
        </noscript>

        ${note(
          `**Meets published requirements**: every recorded rule is met — shown as **${otherRouteLabel}** where
          you are below the floor for the main route, so only that route is open. **Possible with action**:
          every gap has a named step — one test or route, or at most two supplementary courses. **Does not
          currently meet**: a gap with no recorded step. **Needs review**: missing or unverified data, or a
          rule a person must judge.`,
          { title: 'What the four outcomes mean' }
        )}

        ${note(
          `This checks published requirements. It does not predict whether you will be offered a place — for
          programmes with restricted admission, meeting the requirements is where the competition starts, not
          where it ends. Past cut-offs are shown as context and are never used as a rule.`,
          { kind: 'warn', title: 'What this cannot tell you' }
        )}
      </div>
    </div>
  </div>
</section>

<script type="application/json" id="planner-subjects">${raw(JSON.stringify({ subjects, schemes, institutions, diplomaMinimumPoints: site.ibDiplomaMinimumPoints ?? null }))}</script>
<script type="application/json" id="planner-opportunities">${raw(JSON.stringify(opportunities))}</script>
<script type="application/json" id="planner-evidence">${raw(JSON.stringify(evidenceIndex))}</script>
<script type="application/json" id="planner-groups">${raw(JSON.stringify(site.applicantGroups || []))}</script>
<script type="application/json" id="planner-evidence-policy">${raw(JSON.stringify(evidencePolicy))}</script>
<script type="application/json" id="planner-conversion">${raw(
    JSON.stringify({
      average: soleScheme?.gradeConversion?.average?.table || [],
      single: soleScheme?.gradeConversion?.single?.table || [],
      /* What to call the local scale in browser-written sentences. Null when
         the page spans more than one Scheme; the script then says "local". */
      adjective: schemeAdjective,
    })
  )}</script>`;

  return page({
    title: 'Check my subjects',
    description: `Enter your IB subjects, levels and grades to see which English-taught degrees in ${site.opportunityScope.label} you meet the published requirements for — with the reasoning for every rule.`,
    path: '/planner/',
    section: '/planner/',
    body,
    scripts: ['planner.js'],
  });
}
