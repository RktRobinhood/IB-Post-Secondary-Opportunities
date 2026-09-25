import { html, raw, md, plural, slugify, truncate, firstSentence } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import {
  hero, note, facts, sources, crumbs, sectionHead, accordion,
  dataTable, emptyState, card, stamp, tags, topic as topic_,
} from '../lib/components.mjs';
import { picture } from '../lib/data.mjs';

/* --- About ----------------------------------------------------------------- */

export function about(site) {
  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'About',
  title: 'What this is, and what it is not',
  lede: 'A guidance resource for IB Diploma students, built and maintained at an IB school in Denmark.',
})}

<section class="section">
  <div class="wrap">
    <div class="layout-aside">
      <div class="prose">
        <p class="dropcap">This site exists because the information an IB student needs is scattered across
        dozens of national agencies, university admissions offices and PDF handbooks, much of it in languages
        they do not read, and a surprising amount of it out of date even on official pages. The aim here is
        narrow: gather it in one place, say clearly where each fact came from, and date everything.</p>

        <h2 id="who">Who it is for</h2>
        <p>Students taking the IB Diploma who are deciding where to apply — primarily at Ikast-Brande Gymnasium,
        but it is public because the same questions come up everywhere. It assumes you are seventeen or
        eighteen, that you are an EU citizen, and that nobody has explained any of this to you before.</p>

        <h2 id="how">How it is built</h2>
        <p>Every page is generated from JSON data files in a public repository. Each country, institution and
        programme is one record, carrying the date it was last checked and links to the sources behind it. The
        site is static — no database, no tracking, no accounts — and rebuilds automatically whenever the data
        changes.</p>
        <p>That structure is deliberate. It means a teacher can correct a figure without touching any HTML, and
        it means you can see exactly what this site claims and where each claim came from.</p>

        <h2 id="accuracy">On accuracy</h2>
        <p>Three honest caveats.</p>
        <ul class="crosses">
          <li><strong>Admission rules change every year.</strong> Several rules on this site are already
          scheduled to change before autumn 2027 — the Danish SU reform, the UK's Graduate Route, the Dutch
          internationalisation law, Iceland's new non-EEA tuition. Where that is true, the page says so.</li>
          <li><strong>Official sources contradict each other.</strong> Not occasionally — routinely. Where two
          official pages disagree, this site says which one it is following and why, rather than quietly
          picking one.</li>
          <li><strong>Gaps are marked as gaps.</strong> Where a figure could not be verified, the field is
          empty and a note says so. Nothing here is a plausible guess dressed up as a fact.</li>
        </ul>
        ${note(
          `Nothing on this site is an offer, a promise, or advice specific to you. Before you apply, open the
          university's own page and check that what it says still matches what you read here. If it does not,
          the university is right and this site is wrong — and please tell us.`,
          { kind: 'warn', title: 'The necessary disclaimer' }
        )}

        <h2 id="fix">Found something wrong?</h2>
        <p>Open an issue on the repository, or tell your study counsellor and they can. Corrections are the
        most useful contribution anyone can make — a single wrong deadline can cost somebody a year.</p>

        <h2 id="credits">Words and pictures</h2>
        <p>Photographs are either an institution's own Open Graph image, linked from its own server — the
        picture it publishes of itself for exactly this purpose — or a freely licensed photograph from
        Wikimedia Commons, hosted here and credited in full on the <a href="${url('/credits/')}">credits
        page</a>.</p>
      </div>
      <aside class="layout-aside__side stack">
        ${facts([
          { label: 'Built for', value: SITE.cycle.label },
          { label: 'Countries', value: String(site.countries.length) },
          { label: 'Danish institutions', value: String(site.dkInstitutions.length) },
          { label: 'Programmes mapped', value: String(site.programmes.length) },
          { label: 'Licence', value: 'Content CC BY 4.0 · Code MIT' },
        ])}
      </aside>
    </div>
  </div>
</section>`;

  return page({ title: 'About', description: 'How IB Pathways is built, maintained and sourced.', path: '/about/', body });
}

/* --- Glossary -------------------------------------------------------------- */

const TERMS = [
  { term: 'Adgangskvotient', where: 'Denmark', def: 'Your grade point average converted to the Danish 7-point scale. It is the number you compete on in quota 1.' },
  { term: 'ATAR', where: 'Australia', def: 'The Australian Tertiary Admission Rank, a percentile from 0 to 99.95. Australian universities publish a table converting IB points to an ATAR equivalent.' },
  { term: 'CAO points', where: 'Ireland', def: 'Irish applications are scored out of 600. Ireland publishes an explicit IB-to-CAO table, and awards 25 bonus points for Higher Level Mathematics at grade 4 or above.' },
  { term: 'CPR number', where: 'Denmark', def: 'Your Danish personal identification number. Ten digits, the first six being your date of birth. You cannot open a bank account or get a health card without it.' },
  { term: 'DP Course Results', where: 'IB', def: 'What the IB issues when you take Diploma Programme subjects but are not awarded the full Diploma. Formerly called an IB Certificate. It gives narrower access than a Diploma almost everywhere.' },
  { term: 'ECTS', where: 'Europe', def: 'European Credit Transfer System. A full academic year is 60 ECTS, so a three-year bachelor\'s is 180 and a Danish professional bachelor\'s is often 210.' },
  { term: 'EHIC', where: 'EU/EEA', def: 'The European Health Insurance Card — the blue card. It covers medically necessary state healthcare in other EU/EEA countries. It is not travel insurance and does not cover repatriation.' },
  { term: 'Eksamenshåndbogen', where: 'Denmark', def: 'The Danish Agency\'s handbook of international examinations. It contains the authoritative rules for converting an IB Diploma, and every Danish institution is supposed to follow it.' },
  { term: 'GSK', where: 'Denmark', def: 'Gymnasial supplering — individual upper-secondary subjects taken at a VUC to reach a level you are missing. Taught in Danish. It can meet a subject requirement but cannot raise your overall qualification level.' },
  { term: 'GSU list', where: 'Norway', def: 'The list that decides whether a foreign qualification gives generell studiekompetanse — general university admission certification — in Norway.' },
  { term: 'Hochschulzugangsberechtigung', where: 'Germany', def: 'Your right to enter German higher education. An IB Diploma grants it, but only if your six subjects satisfy the KMK\'s specific combination rules.' },
  { term: 'ISEE', where: 'Italy', def: 'The Italian income indicator that sets your tuition. Italian public universities means-test fees rather than charging by nationality, so a foreign family must obtain an ISEE parificato or be billed the top band.' },
  { term: 'Kollegium', where: 'Denmark', def: 'A Danish hall of residence. Usually off-campus, usually self-catered, and usually oversubscribed in August.' },
  { term: 'Numerus fixus', where: 'Netherlands', def: 'A capped Dutch programme with its own selection procedure and a hard 15 January deadline that does not reopen.' },
  { term: 'Nostrification', where: 'Central Europe', def: 'Formal recognition of a foreign school-leaving certificate. In Czechia an IB Diploma has been exempt from it since March 2025 — a Danish studentereksamen is not.' },
  { term: 'Optagelse.dk', where: 'Denmark', def: 'The single national portal for Danish higher education applications. Uses MitID. Closes at 12:00 noon on 15 March.' },
  { term: 'Parcoursup', where: 'France', def: 'The French national admissions platform for EU applicants. Non-EU applicants use Études en France instead.' },
  { term: 'Quota 1 / Quota 2', where: 'Denmark', def: 'Programmes with more applicants than places split their intake. Quota 1 ranks on grade average alone; quota 2 weighs other things and has far fewer places. You are considered for both automatically.' },
  { term: 'Samordna opptak', where: 'Norway', def: 'Norway\'s central admissions service — for Norwegian-taught programmes only. English-taught programmes apply direct to the institution.' },
  { term: 'Studielink', where: 'Netherlands', def: 'The Dutch national application portal. You register there and then usually complete a second application with the university itself.' },
  { term: 'Studieprøven', where: 'Denmark', def: 'The Danish language test for higher education. It can substitute for Danish A at most universities, but it is not an upper-secondary subject and can never meet a subject grade requirement.' },
  { term: 'Todistusvalinta', where: 'Finland', def: 'Finland\'s certificate-based admission. Your IB grades are scored directly against published per-field tables, with no entrance exam.' },
  { term: 'UCAS', where: 'UK', def: 'The UK\'s central application service. One form, up to five choices, and two deadlines — mid-October for Oxbridge and medicine, mid-January for everything else.' },
  { term: 'UNEDasiss', where: 'Spain', def: 'The accreditation Spanish universities require from IB holders. It converts your diploma into a Spanish admission mark and is the gateway to the whole system.' },
];

/** A grant's glossary entry, from its record — who can claim it travels with the name. */
function fundingTerm(f, site) {
  const where = site.destinations?.find((d) => d.code === f.destination)?.name || f.destination;
  const r = f.rate;
  const rate = r ? ` ${r.currency} ${Number(r.amount).toLocaleString('en-GB')} a ${r.per} (${r.basis}) in ${r.year}.` : '';
  return { term: f.name, where, def: `${f.longName ? `${f.longName}. ` : ''}${f.summary}${rate} ${f.otherwise}` };
}

export function glossary(site = {}) {
  const terms = [...TERMS, ...(site.fundingSchemes || []).map((f) => fundingTerm(f, site))]
    .sort((a, b) => a.term.localeCompare(b.term));
  const grouped = new Map();
  for (const t of terms) {
    const letter = t.term[0].toUpperCase();
    if (!grouped.has(letter)) grouped.set(letter, []);
    grouped.get(letter).push(t);
  }

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Reference',
  title: 'The words nobody explains',
  lede: 'Admissions systems are full of untranslated local jargon. Here is what the terms on this site mean.',
})}
<section class="section">
  <div class="wrap">
    <div class="prose">
      ${[...grouped.keys()].sort().map(
        (letter) => html`
        <h2 id="letter-${letter}">${letter}</h2>
        <dl class="facts">
          ${grouped.get(letter).map(
            (t) => html`<div>
              <dt>${t.term}<br><small style="text-transform:none;letter-spacing:0;font-weight:400">${t.where}</small></dt>
              <dd>${t.def}</dd>
            </div>`
          )}
        </dl>`
      )}
    </div>
  </div>
</section>`;

  return page({ title: 'Glossary', description: 'Admissions jargon explained, from adgangskvotient to UNEDasiss.', path: '/glossary/', body });
}

/* --- FAQ ------------------------------------------------------------------- */

const QUESTIONS = [
  {
    q: 'I do not have my results yet. Can I still apply?',
    a: `Yes — almost everywhere expects it. Danish applications close on 15 March 2027 and IB results are not
    released until 6 July. The mechanism is the IB's own results service: your coordinator registers you and
    your results are sent directly to up to six institutions. Ask for it in spring, and get a receipt.
    Some countries instead want predicted grades; a few, like NMBU in Norway, will not make conditional offers
    at all and simply will not consider you.`,
  },
  {
    q: 'Does a 2 in one subject ruin everything?',
    a: `Not if you are awarded the full Diploma. The Danish Agency's handbook is explicit that a Diploma may
    contain a grade of 2, as long as the IB's own conditions for awarding it were met. Several Danish
    university pages say every subject must be 3 or above — that rule applies to DP Course Results, not to a
    full Diploma. For Course Results, a single 1 or 2 does make the qualification non-qualifying in Denmark.`,
  },
  {
    q: 'Does it matter which mathematics course I took?',
    a: `In Denmark, no. The official table treats Analysis and Approaches and Applications and Interpretation
    identically: HL of either is Mathematics A, SL of either is Mathematics B. Elsewhere it very much does.
    Norway counts Maths AA SL as R1+R2 but Maths AI SL only as S1+S2. LUT in Finland excludes AI SL from its
    engineering list. Germany's rules turn on whether one of your HL subjects is a language, mathematics or a
    natural science. Check the specific country.`,
  },
  {
    q: 'I took Global Politics. Does that count as Social Studies?',
    a: `There is no fixed answer, and that is the official position rather than an evasion. The Danish Agency
    says institutions must decide case by case, because Global Politics goes far deeper into international
    politics than Danish Social Studies A but omits the sociology and economics that the Danish subject
    includes. Copenhagen accepts Global Politics HL as Social Studies B; Aarhus accepts it only in combination
    with Economics. If a programme matters to you, write to its admissions office before 15 March and ask for
    a written assessment.`,
  },
  {
    q: 'Can I study in Denmark without speaking Danish?',
    a: `Yes, but the choice is much narrower than most people expect. The University of Copenhagen teaches
    essentially all of its bachelor's degrees in Danish. Most of the English-taught provision is at Copenhagen
    Business School, Southern Denmark, the IT University, Roskilde, Aalborg and the university colleges. If you
    took Danish A1 or Danish A Literature at either level, the Danish-taught system is open to you too.`,
  },
  {
    q: 'Will my student grant follow me abroad?',
    a: `Often, yes — but which grant depends on your passport. Danish SU can pay for a complete degree abroad if
    you can claim it (as a Danish citizen, or as an EU/EEA citizen with equal status under EU rules, for example
    through a parent who works in Denmark) and you meet the ties-to-Denmark requirement, such as two years living
    in Denmark in the last ten. The programme must be recognised in that country and usable in Denmark without
    extra courses. In another Nordic country it is paid as if you studied in Denmark — for anyone starting from
    July 2025, for the programme's prescribed length. Elsewhere it is capped at four years. Either way it uses SU
    klip, within an overall frame of 70 for higher education abroad. Apply through minSU's Fast Track, no later
    than the first month you want the grant for. If you cannot claim SU, look first at your own country's student
    finance: several EU/EEA systems fund a full degree in another country.`,
  },
  {
    q: 'Is a gap year going to hurt my application?',
    a: `In Denmark, no. Your average is your average, and the old bonus for applying soon after finishing no
    longer exists. A year of relevant work can actively help in quota 2, where up to twelve documented months
    counts. Elsewhere it varies — and note that in Norway, age points are being abolished from 2028, which
    changes the calculation for anyone applying after this cohort.`,
  },
  {
    q: 'Do I need IELTS or TOEFL?',
    a: `Usually not. An IB taught in English satisfies the English requirement in most European systems, and
    several state it outright — Denmark, Norway, Finland's LUT, Iceland, Estonia's Tallinn University. Where a
    test is demanded, the IB English grade often substitutes: Corvinus accepts IB English SL 5 or HL 4, CEU
    accepts IB English 5. Check the individual institution rather than assuming either way.`,
  },
  {
    q: 'Everything says "free tuition". Is it really free?',
    a: `Tuition is genuinely free for EU/EEA citizens across the Nordics, Germany, Austria, Czechia and Poland
    — with important asterisks. Norway and Iceland charge a semester or registration fee. Germany charges a
    semester contribution. Czechia is free only for programmes taught in Czech; in Poland, Polish-taught study is free for EU citizens and some English-taught programmes are too.
    Living costs are the real number: Norway budgets NOK 15,488 a month (about €1,435), Denmark DKK 8,450–13,700 (about €1,130–1,830), at the ECB rate of 24 September 2026. Free tuition
    and an expensive city can still come to more than modest tuition somewhere cheap.`,
  },
  {
    q: 'I want to study medicine but my grades will not reach the cut-offs.',
    a: `You are far from alone, and English-taught medicine in Central Europe is a well-trodden route —
    Hungary, Czechia, Poland, Latvia and Lithuania all recruit heavily from Scandinavia. It is expensive, often
    €12,000–19,000 a year, and requires an entrance exam, though several waive it for strong IB science grades.
    The thing to check before anything else is whether the degree will let you practise in the country where you want to work — Denmark included.`,
  },
  {
    q: 'How many places can I apply to?',
    a: `It varies a lot and it shapes your strategy. Denmark: eight, ranked, one offer. Norway: ten ranked
    through Samordna opptak. Finland: six. The UK: five through UCAS. The Netherlands: four through Studielink,
    of which at most two numerus fixus. Ireland: ten at level 8 and ten at level 6/7. Where you rank choices, rank by where you
    would rather be — a long shot at number one usually costs you nothing.`,
  },
  {
    q: 'Something on this site contradicts my university\'s website.',
    a: `Believe the university, then tell us. Every page here carries the date it was checked and links to its
    sources, precisely so you can see how old a claim is. Admissions rules change annually and some of the ones
    here are scheduled to change before autumn 2027.`,
  },
];

export function faq() {
  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Questions',
  title: 'The ones that come up every year',
  lede: 'Short answers, with the reasoning, to the questions study counsellors get asked most.',
})}
<section class="section">
  <div class="wrap wrap--prose">
    ${accordion(QUESTIONS.map((q, i) => ({ ...q, open: i === 0 })))}
  </div>
</section>`;

  return page({
    title: 'Questions',
    description: 'Common questions from IB students applying to university in Denmark, Europe and beyond.',
    path: '/faq/',
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: QUESTIONS.map((q) => ({
        '@type': 'Question',
        name: q.q,
        acceptedAnswer: { '@type': 'Answer', text: q.a.replace(/\s+/g, ' ').trim() },
      })),
    },
  });
}

/* --- Credits --------------------------------------------------------------- */

export function credits(site) {
  const commons = Object.entries(site.images || {}).sort((a, b) =>
    (a[1].subject || a[0]).localeCompare(b[1].subject || b[0])
  );
  /* The faded photographs behind programme cards, one row per photograph:
     several programmes can share one, and it is the photographer being
     credited, not the card. */
  const disciplines = [];
  for (const r of Object.values(site.programmeImages || {})) {
    if (!r.file || !r.src) continue;
    const row = disciplines.find((d) => d.file === r.file);
    if (row) row.subjects.push(r.subject);
    else disciplines.push({ ...r, subjects: [r.subject] });
  }
  disciplines.sort((a, b) => a.subjects[0].localeCompare(b.subjects[0]));
  const official = Object.entries(site.officialImages || {}).sort((a, b) =>
    (a[1].subject || a[0]).localeCompare(b[1].subject || b[0])
  );

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Credits',
  title: 'Where the words and pictures came from',
  lede: 'Every source behind this site, and every photograph with its photographer and licence.',
})}

<section class="section">
  <div class="wrap">
    <div class="prose">
      <h2 id="text">Text and data</h2>
      <p>Facts on this site come from national admissions agencies, ministries and the universities' own
      admissions pages. Each country and institution page lists its own sources at the foot, with the date it
      was checked. The Danish conversion tables come from the Agency's <em>Eksamenshåndbogen</em>.</p>
      <p>Where an official source could not be reached or contradicted another, the page says so rather than
      quietly picking one.</p>

      <h2 id="official">Institutional photographs</h2>
      <p>Where a university publishes an Open Graph image — the picture it attaches to its own pages so they
      look right when shared — that image is linked directly from the institution's own server. Nothing is
      copied into this repository, and each one links back to the page it was published on.</p>
      ${official.length
        ? dataTable({
            caption: `${plural(official.length, 'institutional image')}, linked from the institution's own server`,
            head: ['Subject', 'Published on'],
            rows: official.map(([key, v]) => [
              v.subject || key,
              v.sourcePage ? html`<a href="${v.sourcePage}" rel="noopener nofollow">${truncate(v.sourcePage.replace(/^https?:\/\//, ''), 60)}</a>` : '—',
            ]),
          })
        : html`<p><em>None recorded yet.</em></p>`}

      <h2 id="commons">Freely licensed photographs</h2>
      <p>The rest are photographs from Wikimedia Commons, hosted here under their licences. Thank you to the
      photographers.</p>
      ${commons.length
        ? dataTable({
            caption: `${plural(commons.length, 'photograph')} from Wikimedia Commons`,
            head: ['Subject', 'Photographer', 'Licence', 'File'],
            rows: commons.map(([key, v]) => [
              v.subject || key,
              v.author || 'Unknown',
              v.licenceUrl ? html`<a href="${v.licenceUrl}" rel="noopener nofollow">${v.licence}</a>` : v.licence || '—',
              v.page ? html`<a href="${v.page}" rel="noopener nofollow">${truncate(v.file || 'Commons', 46)}</a>` : v.file || '—',
            ]),
          })
        : html`<p><em>None recorded yet.</em></p>`}

      <h2 id="disciplines">Behind the programme cards</h2>
      <p>Each programme card has a faded photograph of its discipline behind it. The photograph is the
      programme's own where one fits, and otherwise one of its field. These also come from Wikimedia Commons and
      are hosted here under their licences.</p>
      ${disciplines.length
        ? dataTable({
            caption: `${plural(disciplines.length, 'photograph')} behind programme cards`,
            head: ['Used for', 'Photographer', 'Licence', 'File'],
            rows: disciplines.map((v) => [
              v.subjects.join(', '),
              v.author || 'Unknown',
              v.licenceUrl ? html`<a href="${v.licenceUrl}" rel="noopener nofollow">${v.licence}</a>` : v.licence || '—',
              v.page ? html`<a href="${v.page}" rel="noopener nofollow">${truncate(v.file || 'Commons', 46)}</a>` : v.file || '—',
            ]),
          })
        : html`<p><em>None recorded yet.</em></p>`}

      <h2 id="globe">The globe</h2>
      <p>The Earth on the maps is NASA's <a href="https://visibleearth.nasa.gov/images/74092" rel="noopener">Blue Marble: Next Generation</a>
      (July 2004, NASA Earth Observatory / Reto Stöckli, NASA Goddard Space Flight Center), and its clouds are NASA's
      <a href="https://visibleearth.nasa.gov/images/57747" rel="noopener">Blue Marble cloud layer</a> — both public domain.
      Country borders are from <a href="https://www.naturalearthdata.com/" rel="noopener">Natural Earth</a>, also public domain.
      NASA does not endorse this site.</p>
      <p>Close up, the map is drawn with <a href="https://maplibre.org/" rel="noopener">MapLibre GL JS</a> (BSD licence).
      Its satellite imagery is <a href="https://cloudless.eox.at/" rel="noopener">EOxCloudless 2024</a> by EOX IT Services
      GmbH (contains modified Copernicus Sentinel data 2024), used under EOX's terms for non-commercial use; its streets
      and places are <a href="https://openfreemap.org/" rel="noopener">OpenFreeMap</a> © OpenMapTiles, data ©
      <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap contributors</a>.</p>

      <h2 id="reuse">Reusing this</h2>
      <p>The text and data on this site are published under <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener">CC BY 4.0</a>
      and the code under the MIT licence. Photographs are not ours to relicense — each carries its own terms
      above.</p>
    </div>
  </div>
</section>`;

  return page({ title: 'Sources and photo credits', description: 'Sources, photographers and licences for everything on IB Pathways.', path: '/credits/', body });
}

/* --- Topic guides ---------------------------------------------------------- */

export function topicPage(site, topic, slug) {
  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Guide',
  title: topic.title,
  lede: firstSentence(topic.intro, 40),
})}
<section class="section">
  <div class="wrap">
    ${crumbs([{ label: topic.title }])}
    <div class="layout-aside">
      <div class="prose">
        ${/* The options are what a student came for, so they come first — each
              a name, a place and one sentence, with the rest one tap beneath. The
              explanation of why the routes exist follows them. */ ''}
        ${(topic.options || []).length
          ? html`<h2 id="options">The options</h2>
              <div class="options">${topic.options.map(
                (o) => html`<article class="option">
                  <h3 class="option__name">${o.url ? html`<a href="${o.url}" rel="noopener nofollow">${o.name}</a>` : o.name}</h3>
                  ${o.where ? html`<p class="option__where">${o.where}</p>` : ''}
                  ${o.what ? html`<p class="option__what">${firstSentence(o.what, 30)}</p>` : ''}
                  ${tags(o.tags || [], 'tag--brand')}
                  <details class="option__more"><summary>Who it suits, cost, deadlines</summary>
                    ${o.what ? md(o.what) : ''}
                    ${facts([
                      { label: 'Who it suits', value: o.whoItSuits },
                      { label: 'Cost', value: o.cost },
                      { label: 'Deadlines', value: o.deadlineNote },
                    ])}
                  </details>
                </article>`
              )}</div>`
          : ''}
        ${(topic.sections || []).map((s) =>
          topic_({
            id: slugify(s.heading || ''),
            title: s.heading,
            short: s.body ? firstSentence(s.body, 35) : null,
            body: html`${s.body ? md(s.body) : ''}
              ${(s.bullets || []).length ? html`<ul>${s.bullets.map((b) => html`<li>${b}</li>`)}</ul>` : ''}`,
            more: 'Read more',
          })
        )}
        ${sources(topic.sources)}
      </div>
      <aside class="layout-aside__side stack">
        ${stamp(topic.dataAsOf)}
        ${note(
          `Guides like this go stale faster than the country pages, because they describe routes rather than
          rules. Check the dates, and check with the institution.`,
          { kind: 'warn', title: 'Shelf life' }
        )}
      </aside>
    </div>
  </div>
</section>`;

  return page({
    title: topic.title,
    description: truncate(topic.intro || topic.title, 155),
    path: `/guides/${slug}/`,
    body,
  });
}

/* --- 404 ------------------------------------------------------------------- */

export function notFound() {
  const body = html`
<section class="section" style="padding-block:var(--s10)">
  <div class="wrap wrap--prose" style="text-align:center">
    <p class="eyebrow eyebrow--plain" style="justify-content:center">404</p>
    <h1>That page has moved, or never existed</h1>
    <p class="lede" style="margin-inline:auto">Which is frustrating, but less frustrating than a deadline you
    did not know about.</p>
    <p style="margin-top:var(--s6)">
      <a class="btn btn--primary" href="${url('/')}">Back to the start</a>
      <a class="btn btn--quiet" href="${url('/timeline/')}">The calendar</a>
    </p>
  </div>
</section>`;
  return page({ title: 'Page not found', description: 'That page could not be found.', path: '/404.html', body });
}
