import { html, raw, md, plural, truncate, firstSentence } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import {
  hero, card, note, stats, facts, sources, crumbs, sectionHead,
  stamp, dataTable, emptyState, pager, accordion, requirementLine, tags, contextNotes, sectorLandscape, topic,
} from '../lib/components.mjs';
import { picture } from '../lib/data.mjs';
import { contextFor } from '../lib/canonical.mjs';
import { institutionCount } from './programme-facts.mjs';
import { buildSubjectIndex, ibTermsFor } from '../lib/eligibility.mjs';

/** The first publishable photograph among these image keys, shaped for a hero. */
function photo(site, keys) {
  for (const key of keys) {
    const p = picture(site, key, { prefer: 'commons' });
    if (p?.src) return { src: p.src, alt: p.alt, credit: p.credit };
  }
  return null;
}

/* --- The state grant, from its one record ---------------------------------

   SU used to be described here, in the glossary and in every Destination as
   "Danish students can claim SU", which is true for about a fifth of the
   readers. Who can claim it is now written once, in data/funding/dk-su.json,
   and these pages render it. */

function stateGrant(site) {
  return (site.fundingSchemes || []).find((f) => f.destination === 'dk') || null;
}

const money = (n) => Number(n).toLocaleString('en-GB');

/** "a parent who works in Denmark, five years living in Denmark or your own job" */
function routeList(grant) {
  const titles = (grant?.whoCanClaim?.equalStatus || []).map((r) => r.title.charAt(0).toLowerCase() + r.title.slice(1));
  return titles.length > 1 ? `${titles.slice(0, -1).join(', ')} or ${titles.at(-1)}` : titles[0] || '';
}

/** One paragraph: what it pays, and who can claim it. */
function grantSummary(grant) {
  if (!grant) return '';
  const r = grant.rate;
  const citizens = grant.whoCanClaim.citizens.replace(/\.$/, '');
  return `${grant.name} is ${r.currency} ${money(r.amount)} a ${r.per} ${r.basis.startsWith('before tax') ? 'before tax' : ''} in ${r.year} if you live away from your parents. ${citizens} can claim it, and so can EU/EEA citizens with equal status — through ${routeList(grant)}.`.replace(/ {2,}/g, ' ');
}

/* --- Denmark hub ---------------------------------------------------------- */

export function denmarkHub(site) {
  const grant = stateGrant(site);
  const pic =
    picture(site, 'ucph', { prefer: 'commons' }) ||
    picture(site, 'dk-au', { prefer: 'commons' }) ||
    picture(site, 'dtu', { prefer: 'commons' });

  // Denmark's programmes, not every programme on the site. `site.programmes`
  // stopped meaning "Danish programmes" when the Dutch Opportunities landed,
  // and this page went on counting them under "Where you can study in English".
  const dkProgrammes = site.dkInstitutions.flatMap((i) => i.programmes || []);
  const totalProgrammes = dkProgrammes.length;
  const institutions = site.dkInstitutions
    .slice()
    .sort((a, b) => (b.programmes.length || 0) - (a.programmes.length || 0));
  const teaching = institutions.filter((i) => i.programmes.length).length;

  /* What is possible before what is required. This page used to open with
     1,700 words on conversion rules and quotas and put the universities last.
     Now: the place, four facts, the universities, and then each rule as a
     heading and a short answer, with the full explanation one tap beneath.
     Nothing was cut; it moved behind `<details>`. */
  const notes = [
    ...contextFor(site.graph, 'destination', 'dk'),
    ...contextFor(site.graph, 'application-system', 'dk-optagelse'),
  ];

  const topics = [
    topic({
      id: 'points',
      title: 'Your points become a grade average',
      short: 'The Agency converts your IB total to the Danish scale: 30 points is 6.9, 36 is 9.3, 40 is 10.7.',
      body: html`<p>The Agency publishes a conversion table each year. That average is what you compete on in
        quota 1.</p>
        <p><a class="arrow-link" href="${url('/denmark/ib-conversion/')}">The full table</a></p>`,
      more: 'How it is used',
    }),
    topic({
      id: 'subjects',
      title: 'Your subjects become Danish levels',
      short: 'HL generally becomes A level and SL becomes B — but not always, and the exceptions matter.',
      body: html`<p>Both mathematics courses — Analysis and Approaches and Applications and Interpretation — count
        the same way at each level. Global Politics has no fixed national equivalence; a few universities publish their own rule for it, and the programme pages show it.</p>
        <p>Almost every programme names subjects and levels, and some name minimum grades too. Meeting the general
        entry requirement is not enough on its own.</p>
        <p><a class="arrow-link" href="${url('/planner/')}">Check yours against real programmes</a></p>`,
      more: 'The exceptions',
    }),
    topic({
      id: 'deadline',
      title: 'You apply before you have results',
      short: 'Applications close at **12:00 noon CET on 15 March 2027** — not midnight. Results come out on 6 July.',
      body: html`<p>That deadline applies to every applicant with an international qualification, including an IB
        taken at a Danish school, and whether you are aiming at quota 1 or quota 2. Your IB coordinator sends your
        results directly through the IB's results service — you do not wait and upload them yourself.</p>
        <p><a class="arrow-link" href="${url('/denmark/apply/')}">Step by step: how to apply</a></p>`,
      more: 'What happens after',
    }),
    topic({
      id: 'quotas',
      title: 'Quota 1 and quota 2',
      short: 'Quota 1 ranks on your converted average alone; quota 2 weighs other things. You are considered for both.',
      body: html`<p>Programmes with more applicants than places split their intake into two quotas.
        <strong>Quota 1</strong> takes most of the places. <strong>Quota 2</strong> takes a smaller number and
        weighs whatever each institution publishes — typically grades in the required subjects, relevant work or
        study (Aalborg counts up to twelve months), and sometimes an admission test or an essay.</p>
        <p>If you apply by 15 March and your average can be converted to the Danish scale, you are automatically
        considered in quota 1 as well as quota 2.</p>
        <p>Aalborg's admissions office is unusually blunt about what does <em>not</em> count in its quota 2:
        motivational letters and recommendations are not considered relevant and are not required. Other
        institutions — Copenhagen Business School in particular — do want an essay. Check each one.</p>
        ${note(
          `Denmark's universities must cut their bachelor intake by about ten per cent between 2025 and 2029
          under the national dimensioning policy. Some programmes have fewer places than they did when older
          cut-off figures were published.`,
          { kind: 'warn', title: 'Fewer places than before' }
        )}`,
      more: 'How the quotas work',
    }),
    topic({
      id: 'danish',
      title: 'Most degrees are taught in Danish',
      short: 'The English-taught set is much smaller — and it is the set on this site.',
      body: html`<p>This is the single biggest constraint on studying in Denmark with an IB. The University of
        Copenhagen puts it plainly on its own bachelor page: 78 programmes, <em>all</em> taught in Danish. Aalborg
        has historically taught four in English. Most of the English-taught provision sits at Copenhagen Business
        School, Southern Denmark, the IT University, Roskilde and the university colleges.</p>
        <p>If you took Danish A1 or Danish A Literature — at either level — you are fine. If you did not, and the
        programme is taught in Danish, you will need the <em>Studieprøven</em> language test or an equivalent.</p>
        ${sectorLandscape(site.graph.destinations.get('dk')?.sectorLandscape, { destinationName: 'Denmark' })}`,
      more: 'Where the English-taught degrees are',
    }),
    topic({
      id: 'money',
      title: 'What it costs',
      short: 'Nothing for EU, EEA and Swiss citizens. Everyone else pays roughly €6,000–16,000 a year.',
      body: html`<p>Non-EU students also pay an application fee of roughly €100–200 to each university, and DKK 3,060 (2026 rate) for the residence permit.</p>
        <p>If you hold a residence permit under Denmark's Special Act for displaced persons from Ukraine (Act no. 324 of
        16 March 2022), you pay neither tuition nor the application fee.</p>
        ${grant ? html`<p>${grantSummary(grant)} ${grant.otherwise}</p>` : ''}
        <p><a class="arrow-link" href="${url('/denmark/money/')}">Money, SU and the cost of living</a></p>`,
      more: 'SU and living costs',
    }),
    notes.length &&
      topic({
        id: 'context',
        title: 'What it is actually like',
        short: `${plural(notes.length, 'observation')} from people who have watched students go through this — observations, not rules.`,
        body: contextNotes(notes, { heading: false }),
        more: 'Read them',
      }),
  ].filter(Boolean);

  const body = html`
${hero({
  eyebrow: 'Denmark · ' + SITE.cycle.label,
  title: 'Denmark',
  lede: `${plural(totalProgrammes, 'degree')} taught in English, at ${institutionCount(institutions.filter((i) => i.programmes.length))} — each mapped subject by subject.`,
  image: pic ? { src: pic.src, alt: pic.alt, credit: pic.credit, focal: '50% 45%' } : null,
  // The universities a student could actually go to, each named, in turn.
  slides: institutions
    .filter((i) => i.programmes.length)
    .map((i) => ({ i, p: picture(site, i.id, { prefer: 'commons' }) }))
    .filter(({ p }) => p?.src && p.src !== pic?.src)
    .slice(0, 4)
    .map(({ i, p }) => ({ src: p.external ? p.src : url(p.src), caption: `${i.name} · ${i.city}`, credit: p.credit || null })),
  actions: html`
    <a class="btn btn--primary" href="${url('/programmes/')}">See every degree</a>
    <a class="btn btn--ghost" href="${url('/planner/')}">Check my subjects</a>`,
})}

<section class="section section--tinted section--tight">
  <div class="wrap">
    ${stats([
      { value: '15 March', label: 'Deadline, 12:00 noon CET' },
      { value: '24', label: 'IB points for general access' },
      { value: '8', label: 'Programmes you may list' },
      { value: '28 July', label: 'You get an answer' },
    ])}
  </div>
</section>

${institutions.length
  ? html`<section class="section">
      <div class="wrap">
        ${sectionHead({
          eyebrow: plural(teaching, 'institution'),
          title: 'Where you can study in English',
          id: 'institutions',
        })}
        <div class="grid grid--3">
          ${institutions.filter((i) => i.programmes.length).map((i) => {
            const p = picture(site, i.id);
            return card({
              href: i.href,
              title: i.shortName && !i.name.startsWith(i.shortName) ? `${i.shortName} — ${i.name}` : i.name,
              text: firstSentence(i.about, 24),
              image: p ? { src: p.src, alt: p.alt } : null,
              placeholder: i.shortName || i.name,
              meta: [i.city, plural(i.programmes.length, 'programme')].filter(Boolean),
            });
          })}
        </div>
        ${/* A university with nothing in English is worth knowing about, but
              not as a card in a grid of places to go. */
          institutions
            .filter((i) => !i.programmes.length)
            .map(
              (i) => html`<p class="small-print">No bachelor's degrees in English at
                <a href="${url(i.href)}">${i.name}</a> — every one is taught in Danish.</p>`
            )}
      </div>
    </section>`
  : ''}

<section class="section section--tinted section--rule">
  <div class="wrap">
    <div class="layout-aside">
      <div class="prose">
        <h2 id="how">How it works</h2>
        <p class="lede">An IB Diploma with 24 points opens every programme in Denmark — if you also meet that
        programme's subject requirements.</p>
        ${topics}
      </div>
      <aside class="layout-aside__side stack">
        ${stamp(site.conversion?.dataAsOf)}
        <nav aria-label="Denmark guides">
          <p class="eyebrow eyebrow--plain">Go deeper</p>
          <ul class="side-links">
            <li><a href="${url('/denmark/apply/')}">How to apply, step by step</a></li>
            <li><a href="${url('/denmark/ib-conversion/')}">Conversion tables</a></li>
            <li><a href="${url('/denmark/money/')}">Money, SU and living costs</a></li>
            <li><a href="${url('/timeline/')}">The 2027 calendar</a></li>
          </ul>
        </nav>
      </aside>
    </div>
  </div>
</section>`;

  return page({
    title: 'Denmark',
    description:
      'How IB students apply in Denmark: the 15 March deadline, quota 1 and quota 2, the official conversion tables, and every English-taught degree at the universities and colleges.',
    path: '/denmark/',
    section: '/denmark/',
    body,
  });
}

/* --- How to apply ---------------------------------------------------------- */

export function denmarkApply(site) {
  const body = html`
${hero({
  variant: 'compact',
  image: photo(site, ['itu','cbs']),
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
            <h3>January–February 2027 — log in and gather documents</h3>
            <p>You apply on <a href="https://www.optagelse.dk" rel="noopener nofollow">optagelse.dk</a>. Log in
            with MitID if you have one; without a Danish CPR number you log in with your email address instead.
            You will need your most recent transcript, documentation of anything you want counted in quota 2, and
            a passport copy if you are not an EU citizen.</p>
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
            <p><strong>Sign every application by the same deadline.</strong> With MitID you sign inside
            optagelse.dk. Without MitID you must print the <strong>signature page</strong>, sign it by hand and
            email or post it to every institution you apply to — it is never uploaded, and your application is
            not complete without it.</p>
          </li>
          <li>
            <h3>Spring to 5 July — top up your documentation</h3>
            <p>You can reorder your priorities until 12:00 on 5 July. Documentation deadlines are set by each
            institution: Aarhus and Aalborg accept documents until 5 July, but Copenhagen wants them with the
            application on 15 March and some academies set 1 April. Check each one you list.</p>
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
            <p>You have a few days to accept, and the deadline is the institution's: in 2026 it was 2 August at
            Copenhagen, 3 August at Southern Denmark and 5 August at Aalborg. Then housing, CPR registration and a
            bank account — in that order, because each one depends on the last.</p>
          </li>
        </ol>

        ${note(
          `**If you will pay tuition** — you are not an EU, EEA or Swiss citizen and hold no permit that exempts
          you, such as permanent residence or a Special Act permit for displaced persons from Ukraine (see Money) —
          the rules are harsher and differ between institutions. Aarhus says that "if you are a paying applicant,
          then you cannot apply if you earn your IB exam in the year of application", because paying applicants must
          document everything by 15 March. Aalborg sets 1 May. Check your specific institution early, because this
          can rule out the whole year. If you do not pay tuition, these harsher rules do not apply to you.`,
          { kind: 'warn', title: 'Applicants who pay tuition' }
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
        relevant work can genuinely help in quota 2, where many institutions count documented work — Aalborg up to twelve months.</p>
      </div>

      <aside class="layout-aside__side stack">
        ${facts([
          { label: 'Portal', value: '[optagelse.dk](https://www.optagelse.dk)' },
          { label: 'Deadline', value: '15 March 2027, 12:00 CET' },
          { label: 'Max programmes', value: '8, ranked' },
          { label: 'Offers', value: '28 July 2027' },
          { label: 'Documentation', value: 'Set by each institution — 15 March to 5 July' },
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

/**
 * "Danish level → IB": one row per subject and level a student will meet,
 * each translated by the eligibility engine from the Recognition Scheme — the
 * same words the programme cards use, so the table and the cards cannot say
 * different things.
 *
 * Which rows: every subject a programme on this site asks for on the scheme's
 * scale, at every level it is asked for and every level the handbook's table
 * lists for it. That is "the common subjects" by definition rather than by
 * opinion, and it includes the ones with no IB equivalent, which are the ones a
 * student most needs warning about.
 */
function levelRows(site, c) {
  const scheme = (site.recognitionSchemes || []).find((x) => x.authority?.name && x.authority.name === c.authority?.name);
  if (!scheme) return [];
  const institutions = [...(site.graph?.institutions?.values() || [])].filter((i) => (i.ibEquivalences || []).length);
  const index = buildSubjectIndex({ subjects: site.ibSubjects || [], schemes: [scheme], institutions });
  const scale = scheme.subjectScale.id;
  const rank = new Map(scheme.subjectScale.levels.map((l) => [l.code, l.rank]));

  const asked = new Map();
  const walk = (r, id) => {
    if (r.kind === 'subject-combination') return (r.alternatives || []).flat().forEach((x) => walk(x, id));
    if (r.levelScale !== scale || !r.subject || !r.level) return;
    const key = `${r.subject}|${r.level}`;
    if (!asked.has(key)) asked.set(key, new Set());
    asked.get(key).add(id);
  };
  for (const p of site.programmes || []) for (const r of p.requirements || []) walk(r, p.id);

  const subjects = new Set([...asked.keys()].map((k) => k.split('|')[0]));
  const keys = new Set(asked.keys());
  const localName = new Map();
  for (const m of c.subjectLevels.map) {
    if (!subjects.has(m.danish)) continue;
    keys.add(`${m.danish}|${m.level}`);
    localName.set(`${m.danish}|${m.level}`, m.danishSubject);
  }

  return [...keys]
    .map((k) => k.split('|'))
    .sort((a, b) => a[0].localeCompare(b[0]) || (rank.get(b[1]) ?? 0) - (rank.get(a[1]) ?? 0))
    .map(([subject, level]) => {
      const t = ibTermsFor({ subject, level, levelScale: scale }, index);
      const n = asked.get(`${subject}|${level}`)?.size || 0;
      const own = localName.get(`${subject}|${level}`);
      /* Where an institution publishes its own route, it is named beside the
         national answer: "no fixed equivalent" is not the whole story at Aarhus. */
      const local = institutions
        .map((i) => ({ i, t: ibTermsFor({ subject, level, levelScale: scale }, index, i.id) }))
        .filter(({ t: x }) => x.institution);
      return [
        html`<strong>${subject} ${level}</strong>${own ? html`<br><small lang="da">${own} ${level}</small>` : ''}`,
        t.phrase
          ? html`<span class="req-ib">${t.phrase}</span>`
          : html`<span class="req-none">No ${local.length ? 'national ' : ''}IB equivalent.</span> <small>${firstSentence(t.none, 40)}</small>${local.map(
              ({ i, t: x }) => html`<br><small><strong>${i.shortName || i.name}:</strong> ${x.institution.phrase}</small>`
            )}`,
        n ? plural(n, 'programme') : '—',
      ];
    });
}

export function denmarkConversion(site) {
  const c = site.conversion;
  if (!c) return page({ title: 'Conversion', path: '/denmark/ib-conversion/', body: emptyState('Conversion data is missing.') });

  const levels = levelRows(site, c);
  const avgRows = c.gradeAverage.table.map((r) => [String(r.ib), { num: r.dk.toFixed(1) }]);
  const singleRows = c.singleGrade.table.map((r) => [String(r.ib), r.descriptor, { num: String(r.dk) }]);

  const body = html`
${hero({
  variant: 'compact',
  image: photo(site, ['dtu','sdu']),
  eyebrow: 'Denmark · Official rules',
  title: 'How Denmark converts your IB',
  lede: 'The official tables, from the Agency\'s Eksamenshåndbogen — not the out-of-date summaries some universities publish.',
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

        <h2 id="levels">What a Danish requirement means in IB terms</h2>
        <p><strong>Danish A, B and C are levels of study, not grades.</strong> A is the highest level a subject can be
        taken at and C the lowest, and a higher level always covers a lower one. So when a programme asks for
        <em>English B</em>, it means English at B level — not the IB course English B, although English B SL is one
        way to meet it. <em>Any IB English</em> means any English A or English B course — not English ab initio.</p>
        <p>Every subject a programme on this site asks for, read through the Agency's handbook. SL or HL means
        either level meets it. Where a university publishes its own additions, they are named under the national
        answer.</p>
        ${levels.length
          ? dataTable({
              head: ['Danish requirement', 'In IB terms', 'Asked for by'],
              rows: levels,
            })
          : ''}
        <p>A minimum grade is converted with the <a href="#single">single-grade table</a> below: the lowest IB grade
        that converts to the Danish minimum or above. The handbook's full subject table is <a href="#subjects">further
        down</a>.</p>

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
        <p>There is no bonus on top of it. The admission order in force for universities
        (<a href="https://www.retsinformation.dk/eli/lta/2026/288" rel="noopener nofollow">Adgangsbekendtgørelsen, BEK nr 288 of 17 February 2026</a>,
        § 17) ranks quota 1 on the exam average — for an IB Diploma, the converted average in this table — and
        contains no multiplier for applying soon after school. So a programme's cut-off and your converted average
        compare directly, and the IB points shown beside a cut-off on this site are read straight off this table.</p>
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

        <h2 id="subjects">The handbook's subject table, in full</h2>
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
            <li><a href="#levels">Danish levels in IB terms</a></li>
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
  const grant = stateGrant(site);
  const body = html`
${hero({
  variant: 'compact',
  image: photo(site, ['cbs','ruc']),
  eyebrow: 'Denmark',
  title: 'Money, SU and what it actually costs',
  lede: 'Tuition is free for EU, EEA and Swiss citizens. Everything else is not.',
})}

<section class="section">
  <div class="wrap">
    ${crumbs([{ href: '/denmark/', label: 'Denmark' }, { label: 'Money' }])}
    <div class="layout-aside">
      <div class="prose">
        <h2 id="tuition">Tuition</h2>
        <p>Danish higher education is free for citizens of the EU, the EEA and Switzerland, and for anyone
        holding permanent residence or a temporary permit that can lead to it. If you hold a residence permit under the
        Special Act for displaced persons from Ukraine (Act no. 324 of 16 March 2022), you are exempt too, from both
        tuition and the application fee. Everyone else pays. Study in
        Denmark quotes a range of roughly <strong>€6,000–16,000 per year</strong> — about DKK 45,000–120,000 —
        but no year is attached to that figure, so treat it as indicative and ask the institution.</p>
        <p>optagelse.dk charges nothing, but most universities charge non-EU/EEA applicants an
        <strong>application fee of roughly €100–200 per institution</strong>, payable by 15 March — Aalborg €150,
        Roskilde €200. An unpaid fee stops the application. Non-EU students then pay <strong>DKK 3,060</strong>
        (2026 rate) for the residence permit itself.</p>

        <h2 id="su">SU — the Danish state grant</h2>
        <p>SU is the reason students in Denmark can live independently at nineteen — if they can claim it. For
        2026 the rate for a student in higher education living away from their parents is <strong>DKK 7,426 a month
        before tax</strong>, with a loan of up to DKK 3,799 a month on top.</p>
        <p>If you are a Danish citizen you simply apply through minSU with MitID. If you are an EU, EEA or Swiss
        citizen without Danish citizenship, you are not automatically entitled: you apply for <em>equal status</em>.
        There are three routes, and if you moved to Denmark with your family the first two are usually the ones
        that fit:</p>
        ${grant
          ? html`<ul>${grant.whoCanClaim.equalStatus.map((r) => html`<li><strong>${r.title}.</strong> ${r.text}</li>`)}</ul>
            <p>${grant.whoCanClaim.note || ''} The Agency warns that working exactly 40 hours a month is usually
            not enough for the job route, because most months run longer than four weeks.</p>
            <h3 id="su-abroad">Taking SU to a degree abroad</h3>
            <p>${grant.abroad.summary} ${grant.abroad.ties} ${grant.abroad.duration}</p>
            <p>${grant.otherwise}</p>`
          : ''}
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
        <p>Students in Denmark typically work 10–20 hours a week. If you are an EU/EEA citizen without Danish
        citizenship and no other route to equal status, that job can also be your route to SU.</p>

        <h2 id="admin">The order you have to do things in</h2>
        <ol class="steps">
          <li><h4>Residence document</h4><p>If you are a Nordic citizen you need none: you register directly for a CPR number at Citizen Service. If you already live in Denmark as another EU/EEA citizen, you will usually have a registration certificate; ask SIRI whether yours needs updating once you are here as a student rather than as a family member. If you are arriving, EU and EEA citizens get an EU registration certificate from SIRI within three months. Book the appointment in advance and bring your passport and letter of admission. Non-EU students need a residence permit before arrival — allow two to three months.</p></li>
          <li><h4>CPR number</h4><p>Your Danish personal number. If you already live in Denmark you have one, and it stays yours when you move for university — register the new address within five days. Otherwise your municipality issues it once you have an address and the right to stay.</p></li>
          <li><h4>Health card</h4><p>Arrives automatically with your CPR registration. Choose insurance group 1 — 98% of residents do — which gives you an assigned GP with free consultations and referrals.</p></li>
          <li><h4>Bank account and NemKonto</h4><p>Needs the CPR number. Register the account as your NemKonto so public bodies, including SU, can pay you.</p></li>
        </ol>
        <p>Bring enough money for the first few weeks: rent plus a deposit will land before any of this is
        finished.</p>

        ${sources([
          { title: 'Aarhus University — tuition fees and exemptions, including the Special Act for displaced persons from Ukraine', url: 'https://bachelor.au.dk/en/international-applicants/moreinfo/tuition-fees-and-application-fee', retrieved: '2026-09-24' },
          { title: 'Study in Denmark — tuition fees and scholarships', url: 'https://studyindenmark.dk/study-options/tuition-fees-and-scholarships', retrieved: '2026-09-22' },
          { title: 'Study in Denmark — budget', url: 'https://studyindenmark.dk/live-in-denmark/bank-budget', retrieved: '2026-09-22' },
          { title: 'Study in Denmark — housing', url: 'https://studyindenmark.dk/live-in-denmark/housing', retrieved: '2026-09-22' },
          { title: 'SU rates 2026 — udeboende, higher education', url: 'https://www.su.dk/satser/videregaaende-uddannelser-satser-for-su-til-udeboende', retrieved: '2026-09-22' },
          ...(grant?.sources || [{ title: 'SU — EU rules and equal status', url: 'https://www.su.dk/foreign-citizen/gb-foreign-citizen/eu-rules', retrieved: '2026-09-22' }]),
          { title: 'SU reform in English', url: 'https://www.su.dk/su-reform/su-reform-in-english', retrieved: '2026-09-22' },
          { title: 'SIRI — higher education residence permit', url: 'https://www.nyidanmark.dk/en-GB/Applying/Study/Higher%20education', retrieved: '2026-09-22' },
        ])}
      </div>

      <aside class="layout-aside__side stack">
        ${facts([
          { label: 'Tuition, EU/EEA', value: 'None' },
          { label: 'Tuition, non-EU', value: '≈ €6,000–16,000 per year' },
          { label: 'Residence permit fee', value: 'DKK 3,060 (non-EU)' },
          { label: 'SU, 2026', value: 'DKK 7,426 / month before tax, if you can claim it' },
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
