import { html, raw, md, plural, truncate } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import {
  hero, card, note, stats, facts, sources, crumbs, sectionHead,
  stamp, dataTable, emptyState, pager, accordion, requirementLine, tags, contextNotes,
} from '../lib/components.mjs';
import { picture } from '../lib/data.mjs';
import { contextFor } from '../lib/canonical.mjs';

/* --- Denmark hub ---------------------------------------------------------- */

export function denmarkHub(site) {
  const pic =
    picture(site, 'ucph', { prefer: 'commons' }) ||
    picture(site, 'au', { prefer: 'commons' }) ||
    picture(site, 'dtu', { prefer: 'commons' });

  const totalProgrammes = site.programmes.length;
  const fields = [...new Set(site.programmes.map((p) => p.field).filter(Boolean))];

  const body = html`
${hero({
  eyebrow: 'Denmark · ' + SITE.cycle.label,
  title: 'Applying in Denmark with an IB Diploma',
  lede: 'One deadline, one portal, no tuition — and a set of conversion rules that decide everything. Here is how it works, in the detail you will actually need.',
  image: pic ? { src: pic.src, alt: pic.alt, credit: pic.credit, focal: '50% 45%' } : null,
  actions: html`
    <a class="btn btn--primary" href="${url('/planner/')}">Check my subjects</a>
    <a class="btn btn--ghost" href="${url('/denmark/ib-conversion/')}">See the conversion tables</a>`,
})}

<section class="section section--tinted">
  <div class="wrap">
    ${stats([
      { value: '15 March', label: 'Application deadline, 12:00 noon CET' },
      { value: '24', label: 'IB points for access to everything' },
      { value: '8', label: 'Programmes you may list' },
      { value: '28 July', label: 'You get an answer' },
    ])}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="layout-aside">
      <div class="prose">
        <p class="lede">If you hold an IB Diploma with 24 points or more, you can apply to every higher
        education programme in Denmark — provided you also meet the specific subject requirements for the
        programme you want. That second half is where most applications come unstuck.</p>

        <h2 id="five">The five things that decide your application</h2>
        <ol class="steps">
          <li>
            <h3>Your total points become a Danish grade average</h3>
            <p>The Agency publishes a conversion table each year. 30 points is a Danish 6.9; 36 is 9.3;
            40 is 10.7. That average is what you compete on in quota 1.</p>
            <p><a class="arrow-link" href="${url('/denmark/ib-conversion/')}">The full table</a></p>
          </li>
          <li>
            <h3>Your subjects become Danish levels</h3>
            <p>HL generally becomes A level and SL becomes B level, but not always, and the exceptions matter.
            Both mathematics courses — Analysis and Approaches and Applications and Interpretation — count the
            same way at each level. Global Politics has no fixed equivalence at all.</p>
            <p><a class="arrow-link" href="${url('/planner/')}">Check yours against real programmes</a></p>
          </li>
          <li>
            <h3>The programme sets specific requirements</h3>
            <p>Almost every programme names subjects and levels, and some name minimum grades too. Meeting the
            general entry requirement is not enough on its own.</p>
          </li>
          <li>
            <h3>Language decides most of the shortlist</h3>
            <p>Most Danish bachelor's degrees are taught in Danish and need Danish at A level. The
            English-taught ones are a much smaller set — and the ones on this site.</p>
          </li>
          <li>
            <h3>You apply before you have your results</h3>
            <p>Applications close on 15 March. IB results come out on 6 July. Your IB coordinator sends your
            results directly through the IB's results service — you do not wait and upload them yourself.</p>
          </li>
        </ol>

        ${note(
          `Applications close at **12:00 noon CET on 15 March 2027** — not midnight, and not the end of the day.
          That deadline applies to every applicant with an international qualification, including an IB taken at
          a Danish school, and it applies whether you are aiming at quota 1 or quota 2.`,
          { kind: 'warn', title: 'The deadline that catches people out' }
        )}

        <h2 id="quotas">Quota 1 and quota 2</h2>
        <p>Programmes with more applicants than places split their intake into two quotas. <strong>Quota 1</strong>
        takes most of the places and ranks purely on your converted grade average. <strong>Quota 2</strong> takes
        a smaller number and weighs other things — grades in the required subjects, up to twelve months of
        relevant work or study, and sometimes an admission test or an essay.</p>
        <p>You do not choose between them. If you apply by 15 March and your average can be converted to the
        Danish scale, you are automatically considered in quota 1 as well as quota 2.</p>
        <p>Aalborg's admissions office is unusually blunt about what does <em>not</em> count in its quota 2:
        motivational letters and recommendations are not considered relevant and are not required. Other
        institutions — Copenhagen Business School in particular — do want an essay. Check each one.</p>

        <h2 id="danish">The Danish-language problem</h2>
        <p>This is the single biggest constraint on studying in Denmark with an IB, and it is easy to miss
        because it is rarely stated as a headline. The University of Copenhagen puts it plainly on its own
        bachelor page: 78 programmes, <em>all</em> taught in Danish. Aalborg has historically taught four in English. Most of the English-taught
        provision sits at Copenhagen Business School, Southern Denmark, the IT University, Roskilde and the
        university colleges.</p>
        <p>If you took Danish A1 or Danish A Literature — at either level — you are fine. If you did not, and the
        programme is taught in Danish, you will need the <em>Studieprøven</em> language test or an equivalent.</p>

        ${contextNotes([
          ...contextFor(site.graph, 'destination', 'dk'),
          ...contextFor(site.graph, 'application-system', 'dk-optagelse'),
        ])}

        <h2 id="money">What it costs</h2>
        <p>Nothing, if you are an EU, EEA or Swiss citizen: Danish higher education charges no tuition. Everyone
        else pays roughly €6,000–16,000 a year, and a DKK 3,060 fee for the residence permit.</p>
        <p>Danish students can claim SU — DKK 7,426 a month before tax in 2026 if you live away from home.
        Non-Danish EU citizens have to earn equal-treatment status first, usually by working 10–12 hours a week.</p>
        <p><a class="arrow-link" href="${url('/denmark/money/')}">Money, SU and the cost of living</a></p>
      </div>

      <aside class="layout-aside__side stack">
        ${stamp(site.conversion?.dataAsOf)}
        <div class="card card--flat">
          <div class="card__body">
            <p class="eyebrow eyebrow--plain">Jump to</p>
            <ul style="list-style:none;padding:0;margin:0;font-size:.9375rem;line-height:2">
              <li><a href="${url('/denmark/apply/')}">Step by step: how to apply</a></li>
              <li><a href="${url('/denmark/ib-conversion/')}">Conversion tables</a></li>
              <li><a href="${url('/denmark/money/')}">Money, SU and living costs</a></li>
              <li><a href="${url('/programmes/')}">Every English-taught programme</a></li>
              <li><a href="${url('/planner/')}">Subject checker</a></li>
              <li><a href="${url('/timeline/')}">The 2027 calendar</a></li>
            </ul>
          </div>
        </div>
        ${note(
          `Denmark's universities must cut their bachelor intake by about ten per cent between 2025 and 2029
          under the national dimensioning policy. Some programmes have fewer places than they did when older
          cut-off figures were published.`,
          { kind: 'warn', title: 'Fewer places than before' }
        )}
      </aside>
    </div>
  </div>
</section>

${site.dkInstitutions.length
  ? html`<section class="section section--tinted section--rule">
      <div class="wrap">
        ${sectionHead({
          eyebrow: plural(site.dkInstitutions.length, 'institution'),
          title: 'Where you can study in English',
          lede: `${totalProgrammes ? `${totalProgrammes} programmes across ${fields.length} fields.` : ''} Each page lists every English-taught degree and its exact entry requirements.`,
        })}
        <div class="grid grid--3">
          ${site.dkInstitutions
            .slice()
            .sort((a, b) => (b.programmes.length || 0) - (a.programmes.length || 0))
            .map((i) => {
              const p = picture(site, i.id);
              return card({
                href: i.href,
                title: i.shortName ? `${i.shortName} — ${i.name}` : i.name,
                text: i.about,
                image: p ? { src: p.src, alt: p.alt } : null,
                meta: [i.city, plural(i.programmes.length, 'programme')].filter(Boolean),
              });
            })}
        </div>
      </div>
    </section>`
  : ''}`;

  return page({
    title: 'Denmark',
    description:
      'How IB students apply to Danish universities: the 15 March deadline, quota 1 and quota 2, the official conversion tables, and every English-taught bachelor programme.',
    path: '/denmark/',
    section: '/denmark/',
    body,
  });
}

/* --- How to apply ---------------------------------------------------------- */

export function denmarkApply(site) {
  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Denmark',
  title: 'How to apply, step by step',
  lede: 'From choosing programmes in autumn 2026 to accepting a place in August 2027.',
})}

<section class="section">
  <div class="wrap">
    ${crumbs([{ href: '/denmark/', label: 'Denmark' }, { label: 'How to apply' }])}
    <div class="layout-aside">
      <div class="prose">
        <ol class="steps">
          <li>
            <h3>Autumn 2026 — work out what you qualify for</h3>
            <p>Check your six subjects and levels against the programmes you are drawn to. If you are one
            subject short, autumn is when you still have time to do something about it. Some universities
            will give you a written pre-assessment between September and December — ask.</p>
            <p><a class="arrow-link" href="${url('/planner/')}">Check my subjects</a></p>
          </li>
          <li>
            <h3>January–February 2027 — get a MitID and gather documents</h3>
            <p>You apply on <a href="https://www.optagelse.dk" rel="noopener nofollow">optagelse.dk</a>, which
            uses MitID. Sort that out early; it is not something to discover on 14 March. You will need your
            most recent transcript, documentation of anything you want counted in quota 2, and a passport copy
            if you are not an EU citizen.</p>
          </li>
          <li>
            <h3>Before 15 March — ask your IB coordinator for the results service</h3>
            <p>Your results are not out until 6 July, well after the documentation deadline. The fix is the
            IB's own results service: your coordinator registers you and your results go directly to up to six
            institutions. Get a receipt. Institution codes: Copenhagen 002600, Aarhus 000150, Aalborg 000148,
            Southern Denmark 000157.</p>
          </li>
          <li>
            <h3>15 March 2027, 12:00 noon CET — submit</h3>
            <p>You may apply to up to eight programmes, listed in order of priority. You will receive at most
            one offer — the highest-priority programme that admits you. Order matters; think about it properly
            rather than ranking by prestige.</p>
            <p>Some institutions still require a <strong>signature page</strong> printed, signed by hand and
            sent separately by post or email. It is never uploaded to optagelse.dk, and your application is not
            complete without it. Aalborg is explicit about this.</p>
          </li>
          <li>
            <h3>Until 5 July — top up your documentation</h3>
            <p>You can upload annexes and reorder your priorities until 12:00 on 5 July. Everything other than
            your IB results must be in by then.</p>
          </li>
          <li>
            <h3>6 July — results day</h3>
            <p>Your IB results are released. If you registered for the results service, they travel to the
            Danish institutions without you doing anything.</p>
          </li>
          <li>
            <h3>28 July — offers</h3>
            <p>Offers go out and the quota 1 cut-off averages for every programme are published. If you were
            not admitted anywhere, this is also when vacant places appear.</p>
          </li>
          <li>
            <h3>Early August — accept</h3>
            <p>You have a few days to accept. Then housing, CPR registration and a bank account — in that order,
            because each one depends on the last.</p>
          </li>
        </ol>

        ${note(
          `**If you are a fee-paying applicant** — that is, not an EU, EEA or Swiss citizen — the rules are
          harsher and differ between institutions. Aarhus requires your documentation by 15 March and will not
          accept you at all if you sit the IB in the year you apply. Aalborg sets 1 May. Check your specific
          institution early, because this can rule out the whole year.`,
          { kind: 'warn', title: 'Non-EU applicants' }
        )}

        <h2 id="short">If you are a subject short</h2>
        <p>Denmark lets you top up through <strong>GSK</strong> (gymnasial supplering) — individual subjects taken
        at a VUC or GSK centre to reach a level you are missing. Two things to know: GSK subjects are taught in
        Danish, and GSK cannot be used to raise your overall qualification level, only to meet a specific subject
        requirement.</p>
        <p>The separate rules about <em>supplering</em> — two successive level raises, at least one to A level —
        apply only if you hold DP Course Results rather than a full Diploma.</p>

        <h2 id="deferring">Taking a sabbatår</h2>
        <p>Taking a year out after the IB is ordinary in Denmark and carries no penalty in quota 1 — your average
        is your average. The old bonus for applying within two years of finishing no longer exists. A year of
        relevant work can genuinely help in quota 2, where up to twelve documented months counts.</p>
      </div>

      <aside class="layout-aside__side stack">
        ${facts([
          { label: 'Portal', value: '[optagelse.dk](https://www.optagelse.dk)' },
          { label: 'Deadline', value: '15 March 2027, 12:00 CET' },
          { label: 'Max programmes', value: '8, ranked' },
          { label: 'Offers', value: '28 July 2027' },
          { label: 'Documentation', value: '5 July 2027, 12:00' },
        ])}
        ${note(
          `Rank your eight choices by where you would actually rather be, not by how hard they are to get into.
          You only ever receive one offer — the highest-ranked programme that accepts you — so a long-shot at
          number one costs you nothing.`,
          { kind: 'ok', title: 'On ranking' }
        )}
      </aside>
    </div>
  </div>
</section>`;

  return page({
    title: 'How to apply in Denmark',
    description: 'The Danish application process for IB students, step by step, from autumn 2026 to results day in July 2027.',
    path: '/denmark/apply/',
    section: '/denmark/',
    body,
  });
}

/* --- Conversion reference + calculator ------------------------------------- */

export function denmarkConversion(site) {
  const c = site.conversion;
  if (!c) return page({ title: 'Conversion', path: '/denmark/ib-conversion/', body: emptyState('Conversion data is missing.') });

  const avgRows = c.gradeAverage.table.map((r) => [String(r.ib), { num: r.dk.toFixed(1) }]);
  const singleRows = c.singleGrade.table.map((r) => [String(r.ib), r.descriptor, { num: String(r.dk) }]);

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Denmark · Official rules',
  title: 'How Denmark converts your IB',
  lede: 'The tables every Danish university is supposed to use, taken from the Agency\'s Eksamenshåndbogen. Several universities publish their own summaries; several of those are out of date.',
})}

<section class="section">
  <div class="wrap">
    ${crumbs([{ href: '/denmark/', label: 'Denmark' }, { label: 'Conversion' }])}

    <div class="layout-aside">
      <div class="prose">
        ${note(
          c.importantForTwentySeven.map((x) => `- ${x}`).join('\n'),
          { kind: 'warn', title: 'If you finish in May 2027' }
        )}

        <h2 id="calculator">Work out your Danish average</h2>
        <p>Enter your predicted total, including the three bonus points for Theory of Knowledge and the
        Extended Essay.</p>

        <div class="filters" style="margin-bottom:var(--s5)">
          <div class="field">
            <label for="ib-points">IB total points (18–45)</label>
            <input type="number" id="ib-points" min="18" max="45" step="1" value="34" inputmode="numeric">
          </div>
          <div id="conv-out" class="converted" role="status" aria-live="polite"></div>
        </div>

        <h2 id="average">Total points to Danish grade average</h2>
        <p>This is the number you compete on in quota 1. It is re-issued every year — the table below is
        labelled <em>${c.gradeAverage.sourceLabel}</em>, and the version for the summer 2027 intake is published
        by 1 March 2027.</p>
        ${dataTable({
          caption: c.gradeAverage.appliesTo,
          head: ['IB total', { label: 'Danish average', num: true }],
          rows: avgRows,
        })}

        <h2 id="single">Single subject grades</h2>
        <p>Used only where a programme sets a minimum grade in a named subject — Aalborg's Mathematics A at 4.0,
        or Copenhagen Business School's English B at 6.0. It is never used to build your average.</p>
        ${dataTable({
          caption: c.singleGrade.usedFor,
          head: ['IB grade', 'Descriptor', { label: 'Danish grade', num: true }],
          rows: singleRows,
        })}
        <p>${c.singleGrade.rule}</p>

        <h2 id="subjects">Subjects and levels</h2>
        <p>${c.subjectLevels.note}</p>
        ${dataTable({
          caption: 'IB subject and level to Danish subject level',
          head: ['Danish subject', 'Level', 'IB equivalent'],
          rows: c.subjectLevels.map.map((m) => [
            m.danishSubject || m.danish,
            m.level,
            m.ib.length
              ? html`${m.ib.map((x, n) => html`${n ? html`<br>` : ''}${x}`)}${m.note ? html`<br><small>${m.note}</small>` : ''}${m.warning ? html`<br><small><strong>${m.warning}</strong></small>` : ''}`
              : html`<em>No IB equivalent listed.</em>${m.warning ? html`<br><small>${m.warning}</small>` : ''}`,
          ]),
        })}

        <h3 id="languages">Other languages</h3>
        ${dataTable({
          caption: c.subjectLevels.languages.westernEuropean.applies,
          head: ['Danish level', 'IB equivalent'],
          rows: c.subjectLevels.languages.westernEuropean.rows.map((r) => [r.danish, r.ib]),
        })}
        ${dataTable({
          caption: c.subjectLevels.languages.other.applies,
          head: ['Danish level', 'IB equivalent'],
          rows: c.subjectLevels.languages.other.rows.map((r) => [r.danish, r.ib]),
        })}

        <h2 id="special">The awkward cases</h2>
        ${accordion(
          c.subjectLevels.specialCases.map((s) => ({
            q: `${s.subject} — ${s.verdict}`,
            a: html`${md(s.detail)}${s.advice ? note(s.advice, { kind: 'warn', title: 'What to do' }) : ''}`,
          }))
        )}

        <h2 id="access">What qualifies you</h2>
        ${dataTable({
          caption: c.access.summary,
          head: ['What you hold', 'Gives access to', 'Detail'],
          rows: c.access.rules.map((r) => [r.situation, r.givesAccessTo, [r.detail, r.note].filter(Boolean).join(' ')]),
        })}
        ${note(c.access.retakeRule, { kind: 'warn', title: 'Retakes' })}
        ${note(c.access.resultsTiming, { title: 'Results timing' })}

        <h2 id="danish-language">Danish language</h2>
        <p>${c.danishLanguage.summary}</p>
        <ul>${c.danishLanguage.routes.map((r) => html`<li>${r}</li>`)}</ul>
        <p>${c.danishLanguage.note}</p>

        ${sources(c.sources)}
      </div>

      <aside class="layout-aside__side stack">
        ${stamp(c.dataAsOf)}
        ${note(
          `A full **IB Diploma** does not require a grade of 3 in every subject. A 2 may appear, as long as the
          IB's own conditions for awarding the Diploma were met. Several Danish university pages say otherwise;
          the Agency's handbook is the governing source.`,
          { kind: 'ok', title: 'Worth knowing' }
        )}
        <nav aria-label="On this page">
          <p class="eyebrow eyebrow--plain">On this page</p>
          <ul style="list-style:none;padding:0;margin:0;font-size:.9375rem;line-height:2">
            <li><a href="#calculator">Calculator</a></li>
            <li><a href="#average">Grade average table</a></li>
            <li><a href="#single">Single grades</a></li>
            <li><a href="#subjects">Subjects and levels</a></li>
            <li><a href="#special">The awkward cases</a></li>
            <li><a href="#access">What qualifies you</a></li>
            <li><a href="#danish-language">Danish language</a></li>
          </ul>
        </nav>
      </aside>
    </div>
  </div>
</section>

<script type="application/json" id="conversion-data">${raw(
    JSON.stringify({
      average: c.gradeAverage.table,
      single: c.singleGrade.table,
    })
  )}</script>`;

  return page({
    title: 'How Denmark converts your IB',
    description:
      'The official Danish conversion tables: IB total points to the 7-point grade average, single grades, and how each IB subject maps onto Danish A, B and C levels.',
    path: '/denmark/ib-conversion/',
    section: '/denmark/',
    body,
    scripts: ['converter.js'],
  });
}

/* --- Money ---------------------------------------------------------------- */

export function denmarkMoney(site) {
  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Denmark',
  title: 'Money, SU and what it actually costs',
  lede: 'Tuition is free for EU citizens. Everything else is not.',
})}

<section class="section">
  <div class="wrap">
    ${crumbs([{ href: '/denmark/', label: 'Denmark' }, { label: 'Money' }])}
    <div class="layout-aside">
      <div class="prose">
        <h2 id="tuition">Tuition</h2>
        <p>Danish higher education is free for citizens of the EU, the EEA and Switzerland, and for anyone
        holding permanent residence or a temporary permit that can lead to it. Everyone else pays. Study in
        Denmark quotes a range of roughly <strong>€6,000–16,000 per year</strong> — about DKK 45,000–120,000 —
        but no year is attached to that figure, so treat it as indicative and ask the institution.</p>
        <p>There is no central application fee. Non-EU students pay <strong>DKK 3,060</strong> for the residence
        permit itself.</p>

        <h2 id="su">SU — the Danish state grant</h2>
        <p>SU is the reason Danish students can live independently at nineteen. For 2026 the rate for a student
        in higher education living away from home is <strong>DKK 7,426 a month before tax</strong>, with a loan of
        up to DKK 3,799 a month on top.</p>
        <p>If you are a Danish citizen you simply apply through minSU with MitID. If you are an EU citizen who is
        not Danish, you are not automatically entitled: you have to obtain <em>equal status</em>. The realistic
        route is worker status — as a rule <strong>10–12 hours a week</strong>, sustained for at least ten
        continuous weeks and continuing while you receive SU. The Agency warns explicitly that working exactly
        40 hours a month is usually not enough, because most months run longer than four weeks.</p>
        ${note(
          `An SU reform takes effect on **1 January 2027** and applies to anyone starting a new higher education
          programme on or after 1 July 2025 — which includes this cohort. The total grant frame for higher
          education drops from 70 to 58 portions, and SU is limited to the prescribed duration of your programme,
          with a completion loan of up to 24 months if you run out. Plan on finishing on time.`,
          { kind: 'warn', title: 'The 2027 SU reform affects you' }
        )}
        <p>Non-EU students on a study residence permit are <strong>not</strong> allowed to claim SU or housing
        benefit, and doing so can cost them the permit.</p>

        <h2 id="living">Cost of living</h2>
        <p>Study in Denmark's own rough budget, per month:</p>
        ${dataTable({
          caption: 'Monthly budget, in DKK. No year is stated on the source, and 3,000 for rent is optimistic in Copenhagen.',
          head: ['Item', { label: 'DKK per month', num: true }],
          rows: [
            ['Rent, utilities usually included', { num: '3,000–6,500' }],
            ['Food', { num: '2,000–3,500' }],
            ['Other personal spending', { num: '2,000' }],
            ['Books and supplies', { num: '400–650' }],
            ['Insurance', { num: '~300' }],
            ['Mobile phone', { num: '~250' }],
            ['Transport', { num: '~300' }],
            ['Streaming and licences', { num: '~200' }],
            [html`<strong>Total</strong>`, { num: '8,450–13,700' }],
          ],
        })}
        <p>For comparison, the immigration service requires non-EU students to show DKK 7,426 a month — the same
        figure as the SU rate, up to a maximum of DKK 89,112 for a programme longer than a year.</p>

        <h2 id="housing">Housing</h2>
        <p>Danish universities have no tradition of campus accommodation. Most students live in
        <em>kollegier</em> — halls of residence, often some distance from campus — or rent privately. Start
        months before you arrive, and contact your institution about housing the moment you are accepted.
        August and September are the worst possible time to turn up without a room.</p>
        <p>Where to look: <a href="https://www.ungdomsboliger.dk" rel="noopener nofollow">ungdomsboliger.dk</a>
        and <a href="https://www.studenterguiden.dk" rel="noopener nofollow">studenterguiden.dk</a> nationally;
        <a href="https://www.kollegierneskontor.dk" rel="noopener nofollow">Kollegiernes Kontor</a> in Copenhagen;
        Student Housing Aarhus; Studiebolig Aalborg; Boligoen and Kollegieboligselskabet in Odense.</p>

        <h2 id="work">Working while you study</h2>
        <p>EU, EEA, Nordic and Swiss citizens can work without restriction. Students from outside that group
        get a limited work permit: <strong>90 hours a month</strong> from September to May, and full-time
        through June, July and August. Study in Denmark's own pages still quote the old 20-hours-a-week rule —
        the immigration service's 90 hours a month is the current one.</p>
        <p>Danish students typically work 10–20 hours a week. For a non-Danish EU citizen, that is also the route
        to SU.</p>

        <h2 id="admin">The order you have to do things in</h2>
        <ol class="steps">
          <li><h4>Residence document</h4><p>EU and EEA citizens get an EU registration certificate from SIRI within three months of arriving. Book the appointment in advance and bring your passport and letter of admission. Non-EU students need a residence permit before arrival — allow two to three months.</p></li>
          <li><h4>CPR number</h4><p>Your Danish personal number, issued by your municipality once you have an address and the right to stay. Notify them within five days of meeting the conditions.</p></li>
          <li><h4>Health card</h4><p>Arrives automatically with your CPR registration. Choose insurance group 1 — 98% of residents do — which gives you an assigned GP with free consultations and referrals.</p></li>
          <li><h4>Bank account and NemKonto</h4><p>Needs the CPR number. Register the account as your NemKonto so public bodies, including SU, can pay you.</p></li>
        </ol>
        <p>Bring enough money for the first few weeks: rent plus a deposit will land before any of this is
        finished.</p>

        ${sources([
          { title: 'Study in Denmark — tuition fees and scholarships', url: 'https://studyindenmark.dk/study-options/tuition-fees-and-scholarships', retrieved: '2026-09-22' },
          { title: 'Study in Denmark — budget', url: 'https://studyindenmark.dk/live-in-denmark/bank-budget', retrieved: '2026-09-22' },
          { title: 'Study in Denmark — housing', url: 'https://studyindenmark.dk/live-in-denmark/housing', retrieved: '2026-09-22' },
          { title: 'SU rates 2026 — udeboende, higher education', url: 'https://www.su.dk/satser/videregaaende-uddannelser-satser-for-su-til-udeboende', retrieved: '2026-09-22' },
          { title: 'SU — EU rules and equal status', url: 'https://www.su.dk/foreign-citizen/gb-foreign-citizen/eu-rules', retrieved: '2026-09-22' },
          { title: 'SU reform in English', url: 'https://www.su.dk/su-reform/su-reform-in-english', retrieved: '2026-09-22' },
          { title: 'SIRI — higher education residence permit', url: 'https://www.nyidanmark.dk/en-GB/Applying/Study/Higher%20education', retrieved: '2026-09-22' },
        ])}
      </div>

      <aside class="layout-aside__side stack">
        ${facts([
          { label: 'Tuition, EU/EEA', value: 'None' },
          { label: 'Tuition, non-EU', value: '≈ €6,000–16,000 per year' },
          { label: 'Residence permit fee', value: 'DKK 3,060 (non-EU)' },
          { label: 'SU, 2026', value: 'DKK 7,426 / month before tax' },
          { label: 'Living cost', value: 'DKK 8,450–13,700 / month' },
        ])}
        ${note(
          `Rent of DKK 3,000 a month appears in the official budget. In Copenhagen today that is optimistic.
          Aarhus, Odense, Aalborg, Esbjerg and Sønderborg are all materially cheaper, and several strong
          English-taught programmes are in exactly those cities.`,
          { kind: 'warn', title: 'On that rent figure' }
        )}
      </aside>
    </div>
  </div>
</section>`;

  return page({
    title: 'Money, SU and costs in Denmark',
    description: 'Tuition, the SU grant and its 2027 reform, cost of living, housing, work rights and the admin order for international students in Denmark.',
    path: '/denmark/money/',
    section: '/denmark/',
    body,
  });
}
