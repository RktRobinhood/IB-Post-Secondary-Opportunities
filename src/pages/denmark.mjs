import { html, raw, md, plural, truncate, firstSentence, listSentence } from '../lib/html.mjs';
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

/**
 * One dated step: when, what to do in one line, and the rest a tap beneath.
 *
 * This page was the right shape, a dated sequence, written as prose: thirteen
 * consecutive paragraphs and 734 words from the top (docs/research/ia/
 * text-walls.md §3.6). Now the eight steps fit on about two phone screens, and
 * everything that was in them — the institution codes, the signature page,
 * each institution's documentation and acceptance dates — is still in them,
 * behind the step it belongs to.
 */
function applyStep({ when, what, line, more, moreLabel = 'The detail' }) {
  return html`<li>
    <h3><span class="apply-step__when">${when}</span> ${what}</h3>
    <p>${line}</p>
    ${more
      ? html`<details class="topic__more">
          <summary>${moreLabel}</summary>
          <div class="topic__body">${more}</div>
        </details>`
      : ''}
  </li>`;
}

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
        <ol class="steps apply-steps">
          ${applyStep({
            when: 'Autumn 2026',
            what: 'Work out what you qualify for',
            line: html`Check your six subjects and levels against the programmes you want: autumn is when a missing subject can still be fixed. <a class="arrow-link" href="${url('/planner/')}">Check my subjects</a>`,
            more: html`<p>Some universities will give you a written pre-assessment between September and December — ask.</p>`,
            moreLabel: 'Ask for a pre-assessment',
          })}
          ${applyStep({
            when: 'January–February 2027',
            what: 'Log in and gather documents',
            line: html`Log in to <a href="https://www.optagelse.dk" rel="noopener nofollow">optagelse.dk</a> with MitID, or with your email address if you have no Danish CPR number.`,
            more: html`<p>You will need your most recent transcript, documentation of anything you want counted in quota 2, and
              a passport copy if you are not an EU citizen.</p>`,
            moreLabel: 'Which documents',
          })}
          ${applyStep({
            when: 'Before 15 March',
            what: 'Ask your IB coordinator for the results service',
            line: 'Your results come out on 6 July, after the deadline, so your coordinator sends them straight to up to six institutions.',
            more: html`<p>Your coordinator registers you for the IB's own results service. Get a receipt. Institution codes: Copenhagen 002600, Aarhus 000150, Aalborg 000148,
              Southern Denmark 000157.</p>`,
            moreLabel: 'Institution codes',
          })}
          ${applyStep({
            when: '15 March 2027, 12:00 noon CET',
            what: 'Submit up to eight programmes, and sign them',
            line: 'List them in order of priority and sign every application by the same deadline. You get at most one offer: your highest-ranked programme that admits you.',
            more: html`<p>Order matters; think about it properly rather than ranking by prestige.</p>
              <p>With MitID you sign inside
              optagelse.dk. Without MitID you must print the <strong>signature page</strong>, sign it by hand and
              email or post it to every institution you apply to — it is never uploaded, and your application is
              not complete without it.</p>`,
            moreLabel: 'Signing, with or without MitID',
          })}
          ${applyStep({
            when: 'Spring to 5 July',
            what: 'Top up your documentation',
            line: 'You can reorder your priorities until 12:00 on 5 July. Documentation deadlines are set by each institution.',
            more: html`<p>Aarhus and Aalborg accept documents until 5 July, but Copenhagen wants them with the
              application on 15 March and some academies set 1 April. Check each one you list.</p>`,
            moreLabel: 'Each institution’s deadline',
          })}
          ${applyStep({
            when: '6 July',
            what: 'Results day',
            line: 'If you registered for the results service, your results travel to the Danish institutions without you doing anything.',
          })}
          ${applyStep({
            when: '28 July',
            what: 'Offers',
            line: 'Offers go out and every programme’s quota 1 cut-off is published. If you were not admitted anywhere, vacant places appear now.',
          })}
          ${applyStep({
            when: 'Early August',
            what: 'Accept within a few days',
            line: 'The deadline is the institution’s: in 2026, 2 August at Copenhagen, 3 August at Southern Denmark and 5 August at Aalborg.',
            more: html`<p>Then housing, CPR registration and a
              bank account — in that order, because each one depends on the last.</p>
              <p><a class="arrow-link" href="${url('/denmark/money/#admin')}">The order you have to do things in</a></p>`,
            moreLabel: 'Then housing, CPR and a bank',
          })}
        </ol>
        <p class="small-print"><a href="${url('/timeline/?destinations=dk')}">These dates beside any other country’s, on Deadlines</a></p>

        ${topic({
          id: 'paying',
          title: 'If you will pay tuition',
          short: 'The rules are harsher and differ by institution. At Aarhus you cannot apply in the year you take the IB, so check early: this can rule out the whole year.',
          body: html`<p><strong>If you will pay tuition</strong> — you are not an EU, EEA or Swiss citizen and hold no permit that exempts
            you, such as permanent residence or a Special Act permit for displaced persons from Ukraine (see
            <a href="${url('/denmark/money/#tuition')}">Money</a>) — the rules are harsher and differ between institutions. Aarhus says that "if you are a paying applicant,
            then you cannot apply if you earn your IB exam in the year of application", because paying applicants must
            document everything by 15 March. Aalborg sets 1 May. Check your specific institution early, because this
            can rule out the whole year. If you do not pay tuition, these harsher rules do not apply to you.</p>`,
          more: 'Who this applies to',
        })}

        ${topic({
          id: 'short',
          title: 'If you are a subject short',
          short: 'Top up the missing level through **GSK**. It is taught in Danish, and only meets a specific subject requirement.',
          body: html`<p>Denmark lets you top up through <strong>GSK</strong> (gymnasial supplering) — individual subjects taken
            at a VUC or GSK centre to reach a level you are missing. Two things to know: GSK subjects are taught in
            Danish, and GSK cannot be used to raise your overall qualification level, only to meet a specific subject
            requirement.</p>
            <p>The separate rules about <em>supplering</em> — two successive level raises, at least one to A level —
            apply only if you hold DP Course Results rather than a full Diploma
            (<a href="${url('/denmark/ib-conversion/#access')}">what qualifies you</a>).</p>`,
          more: 'How GSK works',
        })}

        ${topic({
          id: 'deferring',
          title: 'Taking a sabbatår',
          short: 'A year out carries no penalty in quota 1, and relevant work can help in quota 2.',
          body: html`<p>Taking a year out after the IB is ordinary in Denmark and carries no penalty in quota 1 — your average
            is your average. The old bonus for applying within two years of finishing no longer exists. A year of
            relevant work can genuinely help in quota 2, where many institutions count documented work — Aalborg up to twelve months.</p>`,
          more: 'Why it costs nothing',
        })}
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

/** The Recognition Scheme this handbook is the published form of. */
function schemeFor(site, c) {
  return (site.recognitionSchemes || []).find((x) => x.authority?.name && x.authority.name === c.authority?.name) || null;
}

/** "Subject|level" → the programmes on this site that ask for it, on the scheme's scale. */
function askedBy(site, scale) {
  const asked = new Map();
  const walk = (r, id) => {
    if (r.kind === 'subject-combination') return (r.alternatives || []).flat().forEach((x) => walk(x, id));
    if (r.levelScale !== scale || !r.subject || !r.level) return;
    const key = `${r.subject}|${r.level}`;
    if (!asked.has(key)) asked.set(key, new Set());
    asked.get(key).add(id);
  };
  for (const p of site.programmes || []) for (const r of p.requirements || []) walk(r, p.id);
  return asked;
}

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
  const scheme = schemeFor(site, c);
  if (!scheme) return [];
  const institutions = [...(site.graph?.institutions?.values() || [])].filter((i) => (i.ibEquivalences || []).length);
  const index = buildSubjectIndex({ subjects: site.ibSubjects || [], schemes: [scheme], institutions });
  const scale = scheme.subjectScale.id;
  const rank = new Map(scheme.subjectScale.levels.map((l) => [l.code, l.rank]));

  const asked = askedBy(site, scale);

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

/**
 * The subject lookup under the calculator: pick the IB course you take, see the
 * Danish level it counts as and how many programmes here ask for that level.
 * The handbook's table read the other way round, so it cannot disagree with it;
 * the awkward cases are offered too, with their verdict instead of a level.
 */
function subjectLookup(site, c) {
  const scheme = schemeFor(site, c);
  const asked = scheme ? askedBy(site, scheme.subjectScale.id) : new Map();
  const byCourse = new Map();
  for (const m of c.subjectLevels.map) {
    for (const course of m.ib) {
      if (!byCourse.has(course)) byCourse.set(course, []);
      byCourse.get(course).push({
        level: `${m.danish} ${m.level}`,
        local: `${m.danishSubject} ${m.level}`,
        asked: asked.get(`${m.danish}|${m.level}`)?.size || 0,
        note: m.note || null,
      });
    }
  }
  const rows = [...byCourse].map(([course, levels]) => ({ course, levels }));
  for (const s of c.subjectLevels.specialCases) rows.push({ course: s.subject, verdict: s.verdict });
  return rows.sort((a, b) => a.course.localeCompare(b.course));
}

export function denmarkConversion(site) {
  const c = site.conversion;
  if (!c) return page({ title: 'Conversion', path: '/denmark/ib-conversion/', body: emptyState('Conversion data is missing.') });

  const levels = levelRows(site, c);
  const lookup = subjectLookup(site, c);
  const avgRows = c.gradeAverage.table.map((r) => [String(r.ib), { num: r.dk.toFixed(1) }]);
  const singleRows = c.singleGrade.table.map((r) => [String(r.ib), r.descriptor, { num: String(r.dk) }]);
  const special = c.subjectLevels.specialCases;

  /* The calculator first. A student comes here to type a total and see an
     average, or to look up one subject; the page used to put 623 words and a
     thirty-row table in front of the input, which sat twelve phone screens
     down. Every table is still here, one tap beneath its own one-line answer. */
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
        <h2 id="calculator">Your IB total as a Danish average</h2>
        <p>Enter your predicted total, including the three bonus points for Theory of Knowledge and the
        Extended Essay.</p>

        <div class="filters conv-tool">
          <div class="field">
            <label for="ib-points">IB total points (18–45)</label>
            <input type="number" id="ib-points" min="18" max="45" step="1" value="34" inputmode="numeric">
          </div>
          <div id="conv-out" class="converted" role="status" aria-live="polite"></div>
        </div>
        <p class="small-print conv-tool__stamp">${c.gradeAverage.sourceLabel}. ${c.gradeAverage.nextTable || ''}</p>

        <div class="filters conv-tool">
          <div class="field">
            <label for="subject-lookup">Look up one IB subject</label>
            <select id="subject-lookup">
              <option value="">Choose a subject and level</option>
              ${lookup.map((r, i) => html`<option value="${i}">${r.course}</option>`)}
            </select>
          </div>
          <div id="lookup-out" class="converted" role="status" aria-live="polite" hidden></div>
        </div>

        ${topic({
          id: 'levels',
          title: 'What a Danish requirement means in IB terms',
          short: '**Danish A, B and C are levels of study, not grades.** A is the highest, and a higher level always covers a lower one.',
          body: html`<p><strong>Danish A, B and C are levels of study, not grades.</strong> A is the highest level a subject can be
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
            <p>A minimum grade is converted with the <a href="#single">single-grade table</a>: the lowest IB grade
            that converts to the Danish minimum or above. The handbook's full subject table is under
            <a href="#subjects">subjects and levels</a>.</p>`,
          more: `Every requirement a programme here asks for (${levels.length})`,
        })}

        ${topic({
          id: 'average',
          title: 'Total points to Danish grade average',
          short: 'The number you compete on in quota 1. There is no bonus on top of it, and it is re-issued every year.',
          body: html`<p>This is the number you compete on in quota 1. It is re-issued every year — the table below is
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
            ${note(c.importantForTwentySeven.map((x) => `- ${x}`).join('\n'), { kind: 'warn', title: 'If you finish in May 2027' })}`,
          more: `The table, ${c.gradeAverage.table[0].ib} to ${c.gradeAverage.table.at(-1).ib} points`,
        })}

        ${topic({
          id: 'single',
          title: 'Single subject grades',
          short: 'Used only where a programme sets a minimum grade in a named subject. Never used to build your average.',
          body: html`<p>Used only where a programme sets a minimum grade in a named subject — Aalborg's Mathematics A at 4.0,
            or Copenhagen Business School's English B at 6.0. It is never used to build your average.</p>
            ${dataTable({
              caption: c.singleGrade.usedFor,
              head: ['IB grade', 'Descriptor', { label: 'Danish grade', num: true }],
              rows: singleRows,
            })}
            <p>${c.singleGrade.rule}</p>`,
          more: 'IB grade 1–7 to the Danish scale',
        })}

        ${topic({
          id: 'subjects',
          title: 'Subjects and levels: the handbook in full',
          short: `${plural(c.subjectLevels.map.length, 'Danish subject level')} and the IB courses that meet each, plus the rule for other languages.`,
          body: html`<p>${c.subjectLevels.note}</p>
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
            })}`,
          more: 'The full table',
        })}

        ${topic({
          id: 'special',
          title: 'The awkward cases',
          short: `${listSentence(special.map((s) => s.subject.replace(/\s*\(.*\)$/, '')))}: no straightforward equivalent, and what to do about it.`,
          body: accordion(
            special.map((s) => ({
              q: `${s.subject} — ${s.verdict}`,
              a: html`${md(s.detail)}${s.advice ? note(s.advice, { kind: 'warn', title: 'What to do' }) : ''}`,
            }))
          ),
          more: `All ${special.length}`,
        })}

        ${topic({
          id: 'access',
          title: 'What qualifies you',
          short: html`<ul>${(c.access.short || [c.access.summary]).map((x) => html`<li>${md(x)}</li>`)}</ul>`,
          body: html`${dataTable({
              caption: c.access.summary,
              head: ['What you hold', 'Gives access to', 'Detail'],
              rows: c.access.rules.map((r) => [r.situation, r.givesAccessTo, [r.detail, r.note].filter(Boolean).join(' ')]),
            })}
            ${note(c.access.retakeRule, { kind: 'warn', title: 'Retakes' })}
            ${note(c.access.resultsTiming, { title: 'Results timing' })}`,
          more: 'Every case, and the retake rule',
        })}

        ${topic({
          id: 'danish-language',
          title: 'Danish language',
          short: c.danishLanguage.summary,
          body: html`<ul>${c.danishLanguage.routes.map((r) => html`<li>${r}</li>`)}</ul>
            <p>${c.danishLanguage.note}</p>`,
          more: 'The four ways to meet it',
        })}

        ${c.sources?.length
          ? topic({
              id: 'sources',
              title: 'Sources',
              short: `${plural(c.sources.length, 'official source')}, as of ${c.dataAsOf}.`,
              body: sources(c.sources, { title: null }),
              more: 'Show them',
            })
          : ''}
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
            <li><a href="#calculator">Calculator and subject lookup</a></li>
            <li><a href="#levels">Danish levels in IB terms</a></li>
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
      lookup,
    }).replace(/</g, '\\u003c')
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

/**
 * What it costs, who can claim the grant, and everything else one tap down.
 *
 * This page was 1,432 words with no disclosures and a 760-word run of prose
 * from the top (docs/research/ia/text-walls.md §3.3). A student wants three
 * numbers and one answer: tuition, living costs, the grant — and whether they
 * can claim it. So it opens on a table of costs and the grant's routes, read
 * from data/funding/, and each other section is a heading and a short answer
 * with the researched text, unchanged, beneath it.
 */
export function denmarkMoney(site) {
  const grant = stateGrant(site);
  const r = grant?.rate;
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
        <h2 id="costs">What it costs</h2>
        ${/* Two columns that stay two columns on a phone: a cost table that
              stacks into one card per row was two and a half screens long. */ ''}
        ${dataTable({
          className: 'cost-table',
          caption: 'Indicative: Study in Denmark attaches no year to the tuition range or the budget, so ask the institution.',
          head: ['What, and who pays it', 'Amount'],
          rows: [
            [html`<strong>Tuition</strong><small>EU, EEA and Swiss citizens; permanent residence or a permit that can lead to it; a Special Act permit (Ukraine)</small>`, 'None'],
            [html`<strong>Tuition</strong><small>Everyone else</small>`, '≈ €6,000–16,000 a year'],
            [html`<strong>Application fee</strong><small>Non-EU/EEA applicants, at most universities (not Special Act permit holders)</small>`, '≈ €100–200 per institution, by 15 March'],
            [html`<strong>Residence permit</strong><small>Non-EU students</small>`, 'DKK 3,060 (2026)'],
            [html`<strong>Living costs</strong><small>Everyone; more in Copenhagen</small>`, 'DKK 8,450–13,700 a month'],
            ...(r
              ? [[
                  html`<strong>${grant.name}, the state grant</strong><small>${grant.whoCanClaim.citizens.replace(/.$/, '')}, and EU/EEA citizens with <a href="#su">equal status</a></small>`,
                  `Up to ${r.currency} ${money(r.amount)} a ${r.per} (${r.year}), ${r.basis}${r.loan ? `; plus a loan of up to ${r.currency} ${money(r.loan)}` : ''}`,
                ]]
              : []),
          ],
        })}

        ${grant
          ? html`<h2 id="su">${grant.name}: who can claim it</h2>
            <p>If you hold Danish citizenship, apply through minSU with MitID. Other EU, EEA and Swiss citizens are
            not automatically entitled: you apply for <em>equal status</em>, through one of three routes. If you moved
            to Denmark with your family, the first two usually fit.</p>
            <div class="su-routes">
              ${grant.whoCanClaim.equalStatus.map(
                (x) => html`<details class="topic__more">
                  <summary>${x.title}</summary>
                  <div class="topic__body"><p>${x.text}</p>${x.id === 'work'
                    ? html`<p>The Agency warns that working exactly 40 hours a month is usually not enough for the job
                      route, because most months run longer than four weeks.</p>`
                    : ''}</div>
                </details>`
              )}
            </div>
            <p>Non-EU students on a study residence permit are <strong>not</strong> allowed to claim SU or housing
            benefit, and doing so can cost them the permit.</p>
            ${grant.whoCanClaim.note ? html`<p class="small-print">${grant.whoCanClaim.note}</p>` : ''}`
          : ''}

        ${topic({
          id: 'reform',
          title: 'The 2027 SU reform affects this cohort',
          short: 'From **1 January 2027** the grant is limited to the prescribed duration of the programme, and the total frame drops from 70 to 58 portions.',
          body: html`<p>An SU reform takes effect on <strong>1 January 2027</strong> and applies to anyone starting a new higher education
            programme on or after 1 July 2025 — which includes this cohort. The total grant frame for higher
            education drops from 70 to 58 portions, and SU is limited to the prescribed duration of your programme,
            with a completion loan of up to 24 months if you run out. Plan on finishing on time.</p>`,
          more: 'What changes',
        })}

        ${grant
          ? topic({
              id: 'su-abroad',
              title: 'Taking SU to a degree abroad',
              short: grant.abroad.summary,
              body: html`<p>${grant.abroad.ties} ${grant.abroad.duration}</p>
                <p>${grant.otherwise}</p>`,
              more: 'The ties requirement, and for how long',
            })
          : ''}

        ${topic({
          id: 'tuition',
          title: 'Tuition and fees',
          short: 'Free for EU, EEA and Swiss citizens and some permit holders. Everyone else pays roughly €6,000–16,000 a year, and an application fee.',
          body: html`<p>Danish higher education is free for citizens of the EU, the EEA and Switzerland, and for anyone
            holding permanent residence or a temporary permit that can lead to it. If you hold a residence permit under the
            Special Act for displaced persons from Ukraine (Act no. 324 of 16 March 2022), you are exempt too, from both
            tuition and the application fee. Everyone else pays. Study in
            Denmark quotes a range of roughly <strong>€6,000–16,000 per year</strong> — about DKK 45,000–120,000 —
            but no year is attached to that figure, so treat it as indicative and ask the institution.</p>
            <p>optagelse.dk charges nothing, but most universities charge non-EU/EEA applicants an
            <strong>application fee of roughly €100–200 per institution</strong>, payable by 15 March — Aalborg €150,
            Roskilde €200. An unpaid fee stops the application. Non-EU students then pay <strong>DKK 3,060</strong>
            (2026 rate) for the residence permit itself.</p>`,
          more: 'Who is exempt, and the fees',
        })}

        ${topic({
          id: 'living',
          title: 'Cost of living',
          short: 'Study in Denmark budgets DKK 8,450–13,700 a month. Its rent figure is optimistic in Copenhagen.',
          body: html`<p>Study in Denmark's own rough budget, per month:</p>
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
            figure as the SU rate, up to a maximum of DKK 89,112 for a programme longer than a year.</p>`,
          more: 'The budget, line by line',
        })}

        ${topic({
          id: 'housing',
          title: 'Housing',
          short: 'No campus tradition: most students live in *kollegier* or rent privately. Start months before you arrive.',
          body: html`<p>Danish universities have no tradition of campus accommodation. Most students live in
            <em>kollegier</em> — halls of residence, often some distance from campus — or rent privately. Start
            months before you arrive, and contact your institution about housing the moment you are accepted.
            August and September are the worst possible time to turn up without a room.</p>
            <p>Where to look: <a href="https://www.ungdomsboliger.dk" rel="noopener nofollow">ungdomsboliger.dk</a>
            and <a href="https://www.studenterguiden.dk" rel="noopener nofollow">studenterguiden.dk</a> nationally;
            <a href="https://www.kollegierneskontor.dk" rel="noopener nofollow">Kollegiernes Kontor</a> in Copenhagen;
            Student Housing Aarhus; Studiebolig Aalborg; Boligoen and Kollegieboligselskabet in Odense.</p>`,
          more: 'Where to look',
        })}

        ${topic({
          id: 'work',
          title: 'Working while you study',
          short: 'EU, EEA, Nordic and Swiss citizens can work without restriction. Other students: 90 hours a month, September to May.',
          body: html`<p>EU, EEA, Nordic and Swiss citizens can work without restriction. Students from outside that group
            get a limited work permit: <strong>90 hours a month</strong> from September to May, and full-time
            through June, July and August. Study in Denmark's own pages still quote the old 20-hours-a-week rule —
            the immigration service's 90 hours a month is the current one.</p>
            <p>Students in Denmark typically work 10–20 hours a week. If you are an EU/EEA citizen without Danish
            citizenship and no other route to equal status, that job can also be your route to SU.</p>`,
          more: 'The hours, and SU through a job',
        })}

        ${topic({
          id: 'admin',
          title: 'The order you have to do things in',
          short: 'Residence document, then CPR number, health card, and a bank account as your NemKonto: each needs the one before.',
          body: html`<ol class="steps">
              <li><h4>Residence document</h4><p>If you are a Nordic citizen you need none: you register directly for a CPR number at Citizen Service. If you already live in Denmark as another EU/EEA citizen, you will usually have a registration certificate; ask SIRI whether yours needs updating once you are here as a student rather than as a family member. If you are arriving, EU and EEA citizens get an EU registration certificate from SIRI within three months. Book the appointment in advance and bring your passport and letter of admission. Non-EU students need a residence permit before arrival — allow two to three months.</p></li>
              <li><h4>CPR number</h4><p>Your Danish personal number. If you already live in Denmark you have one, and it stays yours when you move for university — register the new address within five days. Otherwise your municipality issues it once you have an address and the right to stay.</p></li>
              <li><h4>Health card</h4><p>Arrives automatically with your CPR registration. Choose insurance group 1 — 98% of residents do — which gives you an assigned GP with free consultations and referrals.</p></li>
              <li><h4>Bank account and NemKonto</h4><p>Needs the CPR number. Register the account as your NemKonto so public bodies, including SU, can pay you.</p></li>
            </ol>
            <p>Bring enough money for the first few weeks: rent plus a deposit will land before any of this is
            finished.</p>`,
          more: 'Each step',
        })}

        ${topic({
          id: 'sources',
          title: 'Sources',
          short: 'The official pages each figure on this page was read from.',
          body: sources([
            { title: 'Aarhus University — tuition fees and exemptions, including the Special Act for displaced persons from Ukraine', url: 'https://bachelor.au.dk/en/international-applicants/moreinfo/tuition-fees-and-application-fee', retrieved: '2026-09-24' },
            { title: 'Study in Denmark — tuition fees and scholarships', url: 'https://studyindenmark.dk/study-options/tuition-fees-and-scholarships', retrieved: '2026-09-22' },
            { title: 'Study in Denmark — budget', url: 'https://studyindenmark.dk/live-in-denmark/bank-budget', retrieved: '2026-09-22' },
            { title: 'Study in Denmark — housing', url: 'https://studyindenmark.dk/live-in-denmark/housing', retrieved: '2026-09-22' },
            { title: 'SU rates 2026 — udeboende, higher education', url: 'https://www.su.dk/satser/videregaaende-uddannelser-satser-for-su-til-udeboende', retrieved: '2026-09-22' },
            ...(grant?.sources || [{ title: 'SU — EU rules and equal status', url: 'https://www.su.dk/foreign-citizen/gb-foreign-citizen/eu-rules', retrieved: '2026-09-22' }]),
            { title: 'SU reform in English', url: 'https://www.su.dk/su-reform/su-reform-in-english', retrieved: '2026-09-22' },
            { title: 'SIRI — higher education residence permit', url: 'https://www.nyidanmark.dk/en-GB/Applying/Study/Higher%20education', retrieved: '2026-09-22' },
          ], { title: null }),
          more: 'Show them',
        })}
      </div>

      <aside class="layout-aside__side stack">
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
