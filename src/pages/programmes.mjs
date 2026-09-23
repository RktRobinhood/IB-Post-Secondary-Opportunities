import { html, raw, md, plural, truncate, listSentence } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import {
  hero, card, note, stats, facts, sources, crumbs, sectionHead,
  stamp, dataTable, emptyState, pager, tags, requirementLine, freshness,
} from '../lib/components.mjs';
import { picture } from '../lib/data.mjs';
import { evidenceStatus, resolveEvidence } from '../lib/canonical.mjs';
import { evidenceBlock, preparationPath, filterQuestion, deadlineList, worldWindow } from '../lib/primitives.mjs';
import { allEvents } from '../lib/calendar.mjs';
import { entryAward, ENTRY_AWARD } from '../lib/eligibility.mjs';
import { forBrowser, serialisePolicy } from '../lib/evidence-policy.mjs';

/* What each of the three entry-award states is called where a student reads it.
 *
 * "Not established" is a real answer with a label of its own, not an empty
 * string and not a missing chip. It is the state 3 of the 53 Opportunities are
 * in, and the whole point of naming it is that a student can see it, filter to
 * it, and know to ask — rather than meeting it as a silence that looks like
 * permission. */
const AWARD_LABEL = {
  [ENTRY_AWARD.DIPLOMA_REQUIRED]: 'Asks for the full Diploma',
  [ENTRY_AWARD.COURSE_RESULTS_ACCEPTED]: 'Reachable on Course Results',
  [ENTRY_AWARD.NOT_ESTABLISHED]: 'Not established either way',
};

/**
 * Which IB award opens one Opportunity, said on the Opportunity's own page.
 *
 * The subject requirements above this block are a comparison a student can lose
 * on and still apply. This one is not: if the award they will hold is not the
 * award the source asks for, nothing else on the page matters, which is why it
 * gets a block of its own rather than a line in a list.
 *
 * All three states produce a block. The third is the one worth arguing about —
 * an Opportunity we have established nothing for renders a paragraph saying so,
 * rather than the nothing that would let a Course candidate read the silence as
 * a yes. That is the same discipline as every other gap on this site, applied
 * where it costs the most to get wrong.
 */
function awardBlock(opp) {
  if (!opp) return '';
  const award = entryAward(opp);
  const rule = (opp.requirements || [])
    .filter((r) => r.mandatory !== false)
    .find((r) => r.kind === 'ib-diploma' || r.kind === 'ib-course-results');
  const tail = [rule?.alternativeRoute, rule?.note].filter(Boolean).map((t) => `\n\n${t}`).join('');

  if (award === ENTRY_AWARD.DIPLOMA_REQUIRED) {
    return note(
      `This asks for the **full IB Diploma**. DP Course Results — what the IB awards for individual Diploma
      Programme subjects where the Diploma itself is not — do not satisfy it on their own.${tail}`,
      { title: 'Which IB award this asks for' }
    );
  }

  if (award === ENTRY_AWARD.COURSE_RESULTS_ACCEPTED) {
    const asks = [
      rule?.minSubjects != null ? `${rule.minSubjects} graded subjects` : null,
      rule?.minHigherLevelSubjects != null ? `${rule.minHigherLevelSubjects} of them at HL` : null,
      rule?.minGrade != null ? `at least ${rule.minGrade} in every subject` : null,
      rule?.minPoints != null ? `${rule.minPoints} points in total` : null,
    ].filter(Boolean);
    return note(
      `**DP Course Results** are accepted here — you do not need to have been awarded the full Diploma.${
        asks.length ? ` The source asks for ${asks.slice(0, -1).join(', ')}${asks.length > 1 ? ' and ' : ''}${asks.at(-1)}.` : ''
      }${tail}`,
      { kind: 'ok', title: 'Which IB award this asks for' }
    );
  }

  return note(
    `Whether **DP Course Results** are accepted here, or whether the full IB Diploma is required, is **not
    established**. No source recorded for this programme says either way, and an absence is not a yes — if you
    will not hold the full Diploma, ask the institution in writing before the application deadline rather than
    reading this page as permission.`,
    { kind: 'warn', title: 'Which IB award this asks for' }
  );
}

/* --- An institution -------------------------------------------------------- */

/**
 * The Destination a record belongs to, or a usable stand-in.
 *
 * Every page below used to open with `{ href: '/denmark/', label: 'Denmark' }`
 * written out by hand, which was true of all thirteen Institutions until five
 * of them were Dutch and then was true of eight. The Destination now travels on
 * the record, so the only thing left to decide is what to do when it does not —
 * and the answer is to render the page without a Destination crumb rather than
 * to fall back to a country, because falling back to a country is how every
 * Dutch page came to be filed under Denmark in the first place.
 */
function destinationOf(record) {
  return record?.destination || null;
}

/**
 * A published cut-off, said the way the record actually holds it.
 *
 * Eleven of the thirty-two recorded cut-offs are not numbers. SDU publishes
 * "All qualified applicants accepted" and AAU publishes "All admitted", which
 * are outcomes of the competition rather than scores in it, and the template
 * used to read every one of them as a figure: "a Danish average of **All
 * qualified applicants accepted**". Naming a grade scale beside that sentence
 * would have made it worse rather than better, so the scale is attached only to
 * something measured on it.
 *
 * `quota` and `scale` come off the record and the Recognition Scheme. Neither
 * is this file's to assume — "quota 1" is the name of one country's machinery.
 */
function cutoffSentence(cutoff, scaleName) {
  if (!cutoff?.value) return null;
  const quota = cutoff.quota ? `${cutoff.quota.toLowerCase()} ` : '';
  const when = cutoff.intake ? ` for the ${cutoff.intake}` : '';
  const numeric = /^\d+([.,]\d+)?$/.test(String(cutoff.value).trim());
  return numeric
    ? `The most recently published ${quota}cut-off was **${cutoff.value}**${scaleName ? ` on the ${scaleName}` : ''}${when}. Cut-offs move every year, so treat any published figure as a floor rather than a target.`
    : `The most recently published ${quota}outcome${when} was "${cutoff.value}" rather than a cut-off figure. That is last year's result, not a promise about this one — where a programme fills up, a figure appears.`;
}

/** An ISO date as a person writes it. Unparseable dates print as they are. */
function prettyDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Further pictures of a university: its own programme pages' photographs.
 *
 * These are worth more than four more shots of the same facade — a university
 * publishes a different picture for Chemical Engineering than for European
 * Studies, and between them they say what the place is actually like to study
 * at. Free, too: the programme pages already carry them.
 */
function universitySlides(site, inst, max = 4) {
  const own = picture(site, inst.id);
  const out = [];

  // Further photographs of the institution itself, where they were collected:
  // a different building, a different season, the same place from the other
  // side. These come first because they are of the university, not of one
  // department's marketing.
  const key = inst.id.replace(/^[a-z]{2}-/, '');
  for (const g of site.images?.[key]?.gallery || site.images?.[inst.id]?.gallery || []) {
    if (out.length >= max) break;
    if (g.review?.state === 'rejected') continue;
    out.push({
      rawSrc: g.src,
      src: url(g.src),
      caption: inst.shortName || inst.name,
      credit: { text: `${g.author || 'Unknown'} · ${g.licence || 'Wikimedia Commons'}`, url: g.page },
    });
  }

  for (const p of inst.programmes) {
    if (out.length >= max) break;
    const pic = picture(site, p.id);
    if (!pic?.src || pic.src === own?.src) continue;
    if (out.some((s) => s.rawSrc === pic.src)) continue;
    out.push({
      rawSrc: pic.src,
      src: pic.external ? pic.src : url(pic.src),
      caption: p.name,
      credit: pic.credit || null,
    });
  }
  return out.map(({ rawSrc, ...slide }) => slide);
}

export function university(site, inst, { prev, next }) {
  const pic = picture(site, inst.id);
  const dest = destinationOf(inst);
  const byField = new Map();
  for (const p of inst.programmes) {
    const f = p.field || 'Other';
    if (!byField.has(f)) byField.set(f, []);
    byField.get(f).push(p);
  }

  const body = html`
${hero({
  // The country belongs in the eyebrow now that there is more than one of
  // them. "Delft · Technical university" was a complete description while
  // every institution on the site was Danish and is a riddle now.
  eyebrow: [inst.city, dest?.name, inst.type].filter(Boolean).join(' · '),
  title: inst.name,
  lede: inst.about,
  image: pic ? { src: pic.src, alt: pic.alt, credit: pic.credit, focal: '50% 45%' } : null,
  slides: pic ? universitySlides(site, inst) : [],
  variant: pic ? undefined : 'panel',
})}

<section class="section">
  <div class="wrap">
    ${crumbs([
      ...(dest ? [{ href: dest.href, label: dest.name }] : []),
      { href: '/universities/', label: 'Institutions' },
      { label: inst.shortName || inst.name },
    ])}

    <div class="layout-aside">
      <div class="prose">
        ${inst.programmes.length === 0
          ? note(
              // This used to name Danish at A level and the Studieprøven, which
              // is the right advice at a Danish institution and nonsense at a
              // Dutch one. The specific language qualification is a fact about
              // a Destination's own rules and belongs on that Destination's
              // pages, where it can be sourced. What belongs here is the part
              // that holds at any institution teaching in its own language —
              // and the language comes off the record, because two of the Dutch
              // institutions teach in English and the country does not.
              `No fully English-taught bachelor programmes are listed here for 2027 entry. That does not
              mean you cannot study here — it means you would need to meet its
              ${inst.teachingLanguage ? `${inst.teachingLanguage}-language` : 'local-language'} entry
              requirements and apply to the programmes it teaches in
              ${inst.teachingLanguage || 'its own language'} instead.${
                dest ? ` ${dest.name}'s own section explains what that takes.` : ''
              }`,
              { kind: 'warn', title: 'Nothing in English' }
            )
          : ''}

        ${(inst.ibNotes || []).length
          ? html`<h2 id="ib">What this institution asks of IB students</h2>
              <ul>${inst.ibNotes.map((n) => html`<li>${n}</li>`)}</ul>`
          : ''}

        ${inst.quotaNotes
          ? html`<h2 id="quota">How it runs quota 2</h2>${md(inst.quotaNotes)}`
          : ''}

        ${(inst.notes || []).length
          ? html`<h2 id="notes">Worth knowing</h2>
              <ul>${inst.notes.map((n) => html`<li>${n}</li>`)}</ul>`
          : ''}

        ${inst.programmes.length
          ? html`<h2 id="programmes">English-taught programmes</h2>
              ${[...byField.entries()]
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(
                  ([field, list]) => html`
                  <h3>${field}</h3>
                  <ul class="prog-list">
                    ${list
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((p) => programmeRow(p))}
                  </ul>`
                )}`
          : ''}

        ${sources(inst.sources)}
      </div>

      <aside class="layout-aside__side stack">
        ${stamp(inst.dataAsOf)}
        ${facts([
          { label: 'City', value: inst.city },
          { label: 'Campuses', value: (inst.campuses || []).join(', ') || null },
          { label: 'Founded', value: inst.founded ? String(inst.founded) : null },
          { label: 'Students', value: inst.students ? inst.students.toLocaleString('en-GB') : null },
          { label: 'IB results code', value: inst.ibisCode },
          { label: 'Tuition, non-EU', value: inst.tuitionNonEu },
          {
            label: 'Links',
            value: html`<ul style="list-style:none;padding:0;margin:0">
              ${inst.website ? html`<li><a href="${inst.website}" rel="noopener nofollow">Main site</a></li>` : ''}
              ${inst.admissionsUrl ? html`<li><a href="${inst.admissionsUrl}" rel="noopener nofollow">Admissions</a></li>` : ''}
              ${inst.ibPageUrl ? html`<li><a href="${inst.ibPageUrl}" rel="noopener nofollow">Its IB page</a></li>` : ''}
            </ul>`,
          },
        ])}
        ${(inst.knownFor || []).length ? html`<div><p class="eyebrow eyebrow--plain">Known for</p>${tags(inst.knownFor, 'tag--brand')}</div>` : ''}
        ${(inst.deadlines || []).length
          ? html`<div><p class="eyebrow eyebrow--plain">Deadlines</p>
              <ul style="list-style:none;padding:0;margin:0;font-size:.875rem;line-height:1.8">
                ${inst.deadlines.map((d) => html`<li><strong>${d.date}</strong>${d.time ? ` ${d.time}` : ''} — ${d.label}</li>`)}
              </ul></div>`
          : ''}
      </aside>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">${pager({ prev, next })}</div>
</section>`;

  return page({
    title: inst.name,
    description: truncate(
      inst.about ||
        `${inst.name}${dest ? ` in ${dest.sentenceName}` : ''} — English-taught bachelor programmes and entry requirements for IB students.`,
      155
    ),
    path: inst.href,
    section: dest?.section,
    body,
  });
}

function programmeRow(p) {
  const req = requirementLine(p.entryRequirements) || p.requirementsText;
  return html`<li class="prog">
    <div>
      <h4 class="prog__name"><a href="${url(p.href)}">${p.name}</a></h4>
      <p class="prog__meta">
        ${[p.degree, p.ects ? `${p.ects} ECTS` : null, p.years ? `${p.years} years` : null, p.campus]
          .filter(Boolean)
          .map((m) => html`<span>${m}</span>`)}
      </p>
      ${p.summary ? html`<p class="prog__req">${truncate(p.summary, 180)}</p>` : ''}
    </div>
    <div class="prog__side">
      ${req ? html`<p class="prog__req"><strong>Requires:</strong> ${truncate(req, 150)}</p>` : ''}
      ${p.restrictedAdmission ? html`<p>${tags(['Restricted admission'], 'tag--warn')}</p>` : ''}
      ${p.cutoff?.value
        ? html`<p><small>${p.cutoff.quota ? `${p.cutoff.quota}, ` : ''}${p.cutoff.intake || 'last published'}: ${p.cutoff.value}</small></p>`
        : ''}
    </div>
  </li>`;
}

/* --- Universities index ---------------------------------------------------- */

/**
 * Every Institution on the site, grouped by the Destination it is in.
 *
 * This page was headed "Danish institutions", carried a Denmark breadcrumb and
 * sat in the Denmark section, and then listed Breda, Delft, Maastricht, Twente
 * and Erasmus Rotterdam. The heading was not decoration: a student who reads
 * "Danish institutions" and sees Maastricht concludes the site is broken, and a
 * student who reads it and *doesn't* look concludes there is nothing outside
 * Denmark to look at.
 *
 * So nothing here is asserted. The heading names the Destinations while it can
 * still name them all and says "N destinations" when it cannot, the grouping
 * comes from the records, and the whole page is correct for a third Destination
 * the day one arrives — which is the only version of this fix that is worth
 * making, because the previous copy was also correct on the day it was written.
 */
export function universitiesIndex(site) {
  const catalogue = site.institutionCatalogue;
  const scope = catalogue.scope;

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: scope.label,
  title: 'Where you can study',
  lede: `Every institution in ${scope.label} that teaches at least some of its undergraduate degrees in
    English — and the ones that do not, so you know.`,
})}
<section class="section">
  <div class="wrap">
    ${crumbs([{ label: 'Institutions' }])}
    ${catalogue.byDestination.length
      ? catalogue.byDestination.map(
          (d) => html`
          ${sectionHead({
            eyebrow: plural(d.institutions.length, 'institution'),
            title: `In ${d.sentenceName}`,
            lede: `${plural(d.programmes, 'English-taught programme')} recorded here.`,
          })}
          <div class="grid grid--3" style="margin-bottom:var(--s7)">
            ${d.institutions
              .slice()
              .sort((a, b) => b.programmes.length - a.programmes.length || a.name.localeCompare(b.name))
              .map((i) => {
                const p = picture(site, i.id);
                return card({
                  href: i.href,
                  title: i.shortName ? `${i.shortName} — ${i.name}` : i.name,
                  text: i.about,
                  image: p ? { src: p.src, alt: p.alt } : null,
                  placeholder: i.shortName || i.name,
                  meta: [i.city, plural(i.programmes.length, 'English-taught programme')],
                });
              })}
          </div>`
        )
      : emptyState('Institution data has not been built yet.')}
  </div>
</section>`;

  return page({
    title: `Institutions in ${scope.label}`,
    description: `Universities, university colleges and academies in ${scope.label} with English-taught undergraduate programmes.`,
    path: '/universities/',
    // No section. This page spans Destinations, and highlighting one of them in
    // the navigation is the same claim the old heading made.
    body,
  });
}

/* --- A single programme ---------------------------------------------------- */

export function programme(site, p, inst) {
  const pic = picture(site, p.id) || picture(site, inst.id);
  const req = p.entryRequirements;
  const opp = site.graph?.opportunities?.get(p.opportunityId || p.id);
  const ev = site.graph ? evidenceStatus(site.graph, opp?.evidence) : null;
  const route = site.graph?.applicationRoutes?.get((opp?.applicationRoutes || [])[0]);
  const provisionalDates = (route?.milestones || []).filter((m) => m.provisional).length;
  const dest = destinationOf(p) || destinationOf(inst);

  /* The name of the scale a cut-off is published on, from the Recognition
     Scheme that defines it. "A Danish average of 11.4" used to be written into
     this template, which made it a sentence about Denmark printed over whatever
     Opportunity you were looking at. The record names its scale; the Scheme
     names the scale; neither of them is this file's opinion. */
  const scheme = (site.recognitionSchemes || []).find((s) => s.destination === dest?.code);
  const cutoffScale = p.cutoff?.scale && scheme?.gradeScale?.id === p.cutoff.scale ? scheme.gradeScale.name : null;

  /* When applications actually close, taken from the Application Route rather
     than asserted. The sidebar said "15 March 2027, 12:00 CET" and "apply at
     optagelse.dk" on every Programme page on the site, which on Delft's page
     was two confident falsehoods about the only two things a student would act
     on. A Route may publish more than one closing date — the Netherlands has
     one for numerus fixus and a later one for everything else — so all of them
     are listed rather than one of them being picked. */
  const closes = (route?.milestones || []).filter((m) => m.type === 'submit' && m.consequence === 'hard');
  const system = site.graph?.applicationSystems?.get(route?.applicationSystem);

  const body = html`
${hero({
  variant: 'compact',
  eyebrow: `${inst.shortName || inst.name}${p.campus ? ` · ${p.campus}` : ''}`,
  title: p.name,
  lede: p.summary,
  image: pic ? { src: pic.src, alt: pic.alt, credit: pic.credit } : null,
})}

<section class="section">
  <div class="wrap">
    ${crumbs([
      ...(dest ? [{ href: dest.href, label: dest.name }] : []),
      { href: '/programmes/', label: 'Programmes' },
      { href: inst.href, label: inst.shortName || inst.name },
      { label: p.name },
    ])}

    <div class="layout-aside">
      <div class="prose">
        ${ev
          ? freshness({
              intake: opp?.intake,
              checkedAt: ev.checkedAt || opp?.meta?.dataAsOf,
              level: ev.level,
              provisional: provisionalDates,
            })
          : ''}

        <h2 id="requirements">Entry requirements</h2>
        ${req
          ? html`
            ${req.all?.length
              ? html`<h3>You need all of these</h3>
                  <ul class="ticks">
                    ${req.all.map(
                      // "minimum Danish grade" was true while every Opportunity
                      // was Danish. A requirement written in IB terms carries a
                      // grade on the IB's own 1–7 scale, and naming the wrong
                      // scale beside a number is worse than naming none.
                      (r) => html`<li><strong>${r.subject} ${r.level}</strong>${r.minGrade ? ` — minimum grade ${r.minGrade}` : ''}</li>`
                    )}
                  </ul>`
              : ''}
            ${req.oneOf?.length
              ? html`<h3>And one of these combinations</h3>
                  <ul>
                    ${req.oneOf.map(
                      (group) => html`<li>${group.map((r, n) => html`${n ? ' + ' : ''}<strong>${r.subject} ${r.level}</strong>${r.minGrade ? ` (min ${r.minGrade})` : ''}`)}</li>`
                    )}
                  </ul>`
              : ''}`
          : ''}
        ${p.requirementsText
          ? note(p.requirementsText, { title: 'In the university\'s own words' })
          : req
            ? ''
            : emptyState('No entry requirements have been recorded for this programme yet.')}

        ${awardBlock(opp)}

        ${(p.extraRequirements || []).length
          ? html`<h3>On top of the subjects</h3>
              <ul>${p.extraRequirements.map((x) => html`<li>${x}</li>`)}</ul>`
          : ''}

        ${(p.selectionFactors || []).length
          ? html`<h3>What decides who gets in</h3>
              <p>These do not decide whether you <em>qualify</em>. They decide the order among everyone who
              does, so not meeting one is not the same as being ineligible.</p>
              <ul>${p.selectionFactors.map((x) => html`<li>${x}</li>`)}</ul>`
          : ''}

        ${p.restrictedAdmission
          ? note(
              // The second sentence used to be unconditional and was about
              // Danish national policy, which read as a fact about whichever
              // programme you happened to be looking at. It now travels with
              // the cut-off — and the competition it came out of and the scale
              // it is measured on are read off the record and the Recognition
              // Scheme rather than named here, because "quota 1" and "a Danish
              // average" are the names of one country's machinery and this
              // paragraph is printed over every country's programmes.
              `This programme has restricted admission, so meeting the requirements does not guarantee a place.
              ${cutoffSentence(p.cutoff, cutoffScale) ||
                'How places are allocated among everyone who qualifies is set by the institution, and is listed above where we have recorded it.'}`,
              { kind: 'warn', title: 'Restricted admission' }
            )
          : note(
              `As recorded here, this programme does not have restricted admission — everyone who meets the
              entry requirements is admitted. Confirm on the university's own page before you rely on it.`,
              { kind: 'ok', title: 'Open admission' }
            )}

        <h2 id="what">What it is</h2>
        ${p.summary ? md(p.summary) : ''}
        ${facts([
          { label: 'Degree', value: p.degree },
          { label: 'Length', value: p.years ? `${p.years} years${p.ects ? `, ${p.ects} ECTS` : ''}` : p.ects ? `${p.ects} ECTS` : null },
          { label: 'Taught in', value: p.language || 'English' },
          { label: 'Campus', value: p.campus },
          { label: 'Starts', value: p.startMonth },
          { label: 'Field', value: p.field },
        ])}

        ${route?.milestones?.length
          ? html`<h2 id="deadlines">Deadlines for this intake</h2>
              <ul class="timeline">
                ${route.milestones
                  .filter((m) => ['submit', 'signature', 'document', 'result', 'reply'].includes(m.type))
                  .map(
                    (m) => html`<li data-date="${m.date || ''}"${m.provisional ? raw(' data-provisional="true"') : ''}>
                      <div class="timeline__when">${m.date || 'Date not published'}${m.timeOfDay ? html`<br>${m.timeOfDay} ${m.timeZone || ''}` : ''}</div>
                      <div class="timeline__what">
                        <h4>${m.label}</h4>
                        ${m.note ? md(m.note) : ''}
                        ${m.consequence === 'hard' ? html`<p><small>Missing this closes the door for this intake.</small></p>` : ''}
                      </div>
                    </li>`
                  )}
              </ul>`
          : ''}

        ${evidenceBlock({
          claim: `Entry requirements and admission rules for ${p.name}.`,
          records: site.graph ? resolveEvidence(site.graph, opp?.evidence) : [],
          summary: 'Open this to see the exact page each rule came from, when it was read, and whether a person has checked it.',
        })}

        <h2 id="check">Does your IB fit?</h2>
        <p>The subject checker reads your six IB subjects against this programme's published requirements —
        converting them only where the destination publishes a conversion — and tells you whether they satisfy
        it, and if not, exactly what is missing.</p>
        <p><a class="btn btn--primary" href="${url('/planner/')}">Check my subjects</a></p>

        ${p.url || p.source
          ? sources([
              p.url ? { title: `${p.name} at ${inst.shortName || inst.name}`, url: p.url, retrieved: p.verified } : null,
              p.source && p.source !== p.url ? { title: 'Entry requirements', url: p.source, retrieved: p.verified } : null,
            ].filter(Boolean))
          : ''}
      </div>

      <aside class="layout-aside__side stack">
        ${stamp(p.verified || inst.dataAsOf)}
        ${p.url
          ? html`<a class="btn btn--solid" href="${p.url}" rel="noopener nofollow" style="width:100%;justify-content:center">The official page</a>`
          : ''}
        ${facts([
          { label: 'Institution', value: html`<a href="${url(inst.href)}">${inst.name}</a>` },
          { label: 'Country', value: dest ? html`<a href="${url(dest.href)}">${dest.name}</a>` : null },
          {
            label: closes.length > 1 ? 'Applications close' : 'Apply by',
            value: closes.length
              ? html`<ul style="list-style:none;padding:0;margin:0">
                  ${closes.map(
                    (m) => html`<li><strong>${prettyDate(m.date)}</strong>${m.timeOfDay ? ` ${m.timeOfDay} ${m.timeZone || ''}` : ''}${
                      closes.length > 1 ? html` — ${m.label}` : ''
                    }</li>`
                  )}
                </ul>`
              : null,
          },
          {
            label: 'Apply at',
            value: route?.portalUrl
              ? html`<a href="${route.portalUrl}" rel="noopener nofollow">${system?.name || new URL(route.portalUrl).hostname.replace(/^www\./, '')}</a>`
              : null,
          },
        ])}
        ${note(
          `Requirements change between admission years. Before you apply, open the official page and check that
          what it says still matches what you see here.`,
          { kind: 'warn', title: 'Always verify' }
        )}
      </aside>
    </div>
  </div>
</section>`;

  return page({
    title: `${p.name} — ${inst.shortName || inst.name}`,
    description: truncate(
      p.summary ||
        `${p.name} at ${inst.name}${dest ? ` in ${dest.sentenceName}` : ''}: entry requirements for IB students, taught in English.`,
      155
    ),
    path: p.href,
    section: dest?.section,
    body,
  });
}

/* --- Programme explorer ---------------------------------------------------- */

export function programmesIndex(site) {
  const scope = site.opportunityScope;
  const programmeCount = site.programmes.length;
  const fields = [...new Set(site.programmes.map((p) => p.field).filter(Boolean))].sort();
  const institutions = site.institutionCatalogue.all
    .filter((i) => i.programmes.length)
    .map((i) => ({ id: i.id, name: i.shortName || i.name }));
  const campuses = [...new Set(site.programmes.map((p) => p.campus).filter(Boolean))].sort();

  // Places the map can light up, joined to the programmes that sit there.
  const placeIndex = {};
  for (const p of site.programmes) {
    if (!p.placeId) continue;
    const place = site.graph?.places?.get(p.placeId);
    if (!place) continue;
    placeIndex[p.placeId] ||= {
      id: place.id,
      name: place.name,
      lat: place.coordinates.lat,
      lon: place.coordinates.lon,
      precision: place.coordinatePrecision,
      character: place.character || null,
    };
  }

  const index = site.programmes.map((p) => ({
    id: p.id,
    name: p.name,
    href: p.href,
    institutionId: p.institutionId,
    institution: p.institutionName,
    field: p.field || 'Other',
    campus: p.campus || '',
    placeId: p.placeId || '',
    degree: p.degree || '',
    ects: p.ects || null,
    restricted: !!p.restrictedAdmission,
    cutoff: p.cutoff?.value || null,
    summary: truncate(p.summary || '', 170),
    requirements: requirementLine(p.entryRequirements) || truncate(p.requirementsText || '', 150),
    entry: p.entryRequirements || null,
    award: entryAward({ requirements: p.requirements }),
    search: [p.name, p.institutionName, p.field, p.campus, p.degree, p.summary].filter(Boolean).join(' ').toLowerCase(),
  }));

  /* The filter is offered for the states this catalogue actually holds, with
     counts, so it can never promise a choice that returns nothing. */
  const awardCounts = new Map();
  for (const p of index) awardCounts.set(p.award, (awardCounts.get(p.award) || 0) + 1);
  const awardOptions = [
    ENTRY_AWARD.DIPLOMA_REQUIRED,
    ENTRY_AWARD.COURSE_RESULTS_ACCEPTED,
    ENTRY_AWARD.NOT_ESTABLISHED,
  ]
    .filter((state) => awardCounts.get(state))
    .map((state) => ({ value: state, label: AWARD_LABEL[state], count: awardCounts.get(state) }));

  /* Every distinct route a source publishes for somebody who does not hold the
     Diploma, gathered from the records rather than written here. This page does
     not know what a route looks like in any particular country and must not: a
     jurisdiction that publishes one gets its own sentence the moment a record
     carries it, and one that publishes none contributes nothing. */
  const routes = [...new Set(
    site.programmes.flatMap((p) => (p.requirements || []).map((r) => r.alternativeRoute).filter(Boolean))
  )];

  const body = html`
${hero({
  variant: 'plain',
  // Derived from the Opportunity records rather than asserted. This page said
  // "in Denmark" in its eyebrow, its heading, its lede and its breadcrumb, and
  // the day Delft appeared in the list all four became false at once.
  eyebrow: scope.label,
  title: 'Every English-taught programme',
  lede: `${plural(programmeCount, 'undergraduate degree')} you can take in English in ${scope.label}. Filter them, or follow the map — both show the same set.${
    scope.complete ? '' : ' Coverage this deep exists for these destinations so far; every other destination has a country page.'
  }`,
})}

<section class="section section--tight">
  <div class="wrap wrap--wide">
    ${crumbs([{ label: 'Find a degree' }])}

    <div id="prog-map">
      ${worldWindow({
        places: Object.values(placeIndex).map((p) => ({
          ...p,
          href: '#prog-results',
          count: site.programmes.filter((x) => x.placeId === p.id).length,
        })),
        id: 'explorer-map',
        activeLayer: 'Places with matching programmes',
        caption: 'Choose a place to filter to it. The list below is the same set either way.',
      })}
    </div>

    <form class="filters" id="prog-filters" role="search" aria-label="Filter programmes">
      <div class="filters__row">
        <div class="field filter-q" data-field="q">
          <label for="f-q">Search for anything</label>
          <input type="search" id="f-q" data-filter="q" placeholder="engineering, Odense, data…" autocomplete="off">
        </div>
        ${filterQuestion({
          id: 'f-field',
          question: 'What do you want to study?',
          field: 'field',
          options: fields.map((f) => ({ value: f, label: f })),
        })}
        ${filterQuestion({
          id: 'f-inst',
          question: 'Anywhere in particular?',
          field: 'inst',
          options: institutions.map((i) => ({ value: i.id, label: i.name })),
        })}
        ${filterQuestion({
          id: 'f-campus',
          question: 'Which city?',
          field: 'campus',
          options: campuses.map((c) => ({ value: c, label: c })),
        })}
        ${awardOptions.length > 1
          ? filterQuestion({
              id: 'f-award',
              question: 'Full Diploma, or Course Results?',
              help: 'What the source says it will accept. Not established means nobody has recorded an answer — ask before you rule it in or out.',
              field: 'award',
              options: awardOptions,
            })
          : ''}
      </div>
      <div class="chips">
        <button type="button" class="chip" id="f-open" aria-pressed="false">Open admission only</button>
        <button type="button" class="chip" id="f-nomath" aria-pressed="false">No Mathematics A</button>
        <button type="button" class="chip" id="f-reset">Clear filters</button>
      </div>
    </form>

    <div class="shell__bar">
      <p class="result-count" id="prog-count" role="status" aria-live="polite" style="margin:0"></p>
      <ul class="shell__active" id="prog-active" aria-label="Active filters"></ul>
    </div>

    ${awardOptions.length > 1
      ? note(
          // Written once, server-side, and shown whether or not the filter is
          // on — because a Course candidate who filters and gets a short list
          // has been told the worst part of the truth and needs the rest of it
          // on the same screen. The routes come from the records.
          `Not every IB student leaves with the Diploma. Take individual Diploma Programme subjects, or sit the
          Diploma and miss its conditions, and the IB awards **DP Course Results** instead — a real qualification,
          read differently from a Diploma rather than not read at all.

          ${awardOptions
            .map((o) => `**${o.label}** — ${o.count} of ${programmeCount}.`)
            .join(' ')}
          ${routes.length ? `\n\nAsking for the Diploma is not the same as closing the door, and where a source publishes another way in it is written here.${routes.map((r) => `\n\n${r}`).join('')}` : ''}

          **Not established** is the honest third answer and it is not a soft yes. It means no source recorded
          here says either way, so nothing on this page should be read as saying Course Results are accepted.
          Ask the institution in writing, and ask before the application deadline rather than after it.`,
          { title: 'If you will not hold the full Diploma' }
        )
      : ''}

    <ul class="prog-list" id="prog-results"></ul>
    <noscript>
      <p class="empty">Filtering needs JavaScript. Every programme is also listed on its institution's page —
      see <a href="${url('/universities/')}">every institution</a>.</p>
    </noscript>
  </div>
</section>

<script type="application/json" id="programme-data">${raw(JSON.stringify(index))}</script>
<script type="application/json" id="place-data">${raw(JSON.stringify(placeIndex))}</script>`;

  return page({
    // The hero stopped asserting Denmark when Delft landed; the <title> and the
    // meta description, which are what a search result shows, did not.
    title: `Find a degree in ${scope.label}`,
    description: `Search every English-taught undergraduate programme in ${scope.label} by field, institution, city and entry requirements.`,
    path: '/programmes/',
    section: '/programmes/',
    body,
    scripts: ['explorer.js'],
  });
}

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
  lede: `Enter the IB subjects you are taking and the level you are taking each at, and say which IB award you
    expect to finish with. ${
      soleScheme ? `This converts them using ${soleScheme.label}, then checks` : 'This checks'
    } them against every English-taught programme in ${site.opportunityScope.label} — and shows its reasoning
    for each one.`,
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
              <option value="eu-eea-ch">EU, EEA or Swiss citizen</option>
              <option value="non-eu">Outside the EU/EEA</option>
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
          <button type="button" class="chip" data-show="possible-with-action" aria-pressed="true">Possible with action</button>
          <button type="button" class="chip" data-show="needs-review" aria-pressed="true">Needs review</button>
          <button type="button" class="chip" data-show="does-not-currently-meet" aria-pressed="false">Does not currently meet</button>
        </div>
        <ul class="prog-list" id="p-results"></ul>
        <noscript>
          <p class="state state--empty">The subject checker needs JavaScript, because it runs entirely in your
          browser — that is also why nothing you type is sent anywhere. Without it, every programme and its
          exact entry requirements are still listed under
          <a href="${url('/programmes/')}">Find a degree</a>, and the conversion tables are on the
          <a href="${url('/denmark/ib-conversion/')}">conversion page</a>.</p>
        </noscript>

        ${note(
          `Four outcomes, and they mean exactly what they say. **Meets published requirements** means every
          recorded mandatory rule is satisfied for the 2027 intake. **Possible with action** means one rule is
          not met but could plausibly be before the deadline. **Does not currently meet** means more than one
          rule is unmet. **Needs review** means the data is missing, unverified, or the rule is one no tool can
          check — an essay, an interview, a language document.`,
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

<script type="application/json" id="planner-subjects">${raw(JSON.stringify({ subjects, schemes }))}</script>
<script type="application/json" id="planner-opportunities">${raw(JSON.stringify(opportunities))}</script>
<script type="application/json" id="planner-evidence">${raw(JSON.stringify(evidenceIndex))}</script>
<script type="application/json" id="planner-evidence-policy">${raw(JSON.stringify(evidencePolicy))}</script>
<script type="application/json" id="planner-conversion">${raw(
    JSON.stringify({
      average: soleScheme?.gradeConversion?.average?.table || [],
      single: soleScheme?.gradeConversion?.single?.table || [],
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


/* --- The calendar ----------------------------------------------------------- */

/**
 * Every dated event on the site, scoped by default to what the student is
 * actually interested in.
 *
 * This page used to hold a hard-coded array of eighteen events. Two things were
 * wrong with that, and the second is the worse one (#13).
 *
 * It was **not derived from the data**. Every country record already carried
 * `application.deadlines[]`, the country pages already rendered them, and this
 * page duplicated a hand-picked subset of the same facts in a second place with
 * no source field and no Verification State. It could drift from the country
 * pages and nothing would catch it. It now reads the same model they do, so a
 * date can only be wrong in one place.
 *
 * And it was **shown in full to everyone**. For a student looking at Denmark
 * and the Netherlands, eleven of the eighteen entries were noise; for a student
 * who had chosen nothing, all of it was. A combined calendar is the right thing
 * to have and the wrong thing to make the only view.
 *
 * ## Why the scoping happens in the browser
 *
 * Every event is rendered into the page and the browser hides what is out of
 * scope. That is the opposite of what a server would normally do, and it is
 * deliberate: the signals that decide the scope — the Exploration List, the
 * compare selection, the Student Profile — live in `localStorage` and are never
 * sent anywhere, which is the promise the subject checker makes in as many
 * words. A server that scoped this page would have to be told what a student is
 * interested in.
 *
 * It also means the no-JavaScript fallback is the *complete* calendar rather
 * than an empty one. A student without JavaScript sees more than they need,
 * which is a far better failure than seeing nothing.
 */
export function timeline(site) {
  const events = allEvents(site);
  const dated = events.filter((e) => e.date);
  const undated = events.filter((e) => !e.date);

  /* Destinations that actually have something on the calendar, so the scope
     picker never offers a country with nothing to show. */
  const represented = [...new Set(events.map((e) => e.destination))]
    .map((code) => site.destinations.find((d) => d.code === code))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  const withDates = new Set(dated.map((e) => e.destination)).size;

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: SITE.cycle.label,
  title: 'The calendar',
  lede: 'Every deadline that matters, in order. Some of them close before you have predicted grades, and one of them closes at noon.',
})}

<section class="section">
  <div class="wrap">
    <div class="layout-aside">
      <div class="prose">

        <div class="scope" id="cal-scope" hidden>
          <p class="scope__state" id="cal-scope-state" role="status"></p>
          <div class="scope__actions">
            <button type="button" class="btn btn--ghost btn--sm" id="cal-show-all">Show every deadline</button>
            <button type="button" class="btn btn--ghost btn--sm" id="cal-show-mine" hidden>Back to mine</button>
            <button type="button" class="btn btn--ghost btn--sm" id="cal-share" hidden>Copy a link to this view</button>
          </div>
          <details class="scope__pick">
            <summary>Choose which destinations to show</summary>
            <div class="scope__grid">
              ${represented.map(
                (c) => html`<label class="scope__opt">
                  <input type="checkbox" name="scope" value="${c.code}" data-sentence-name="${c.articleName || c.name}"> <span>${c.flag} ${c.name}</span>
                </label>`
              )}
            </div>
          </details>
        </div>

        <noscript>
          <p class="state state--empty">This calendar normally shows only the destinations you are looking at.
          That needs JavaScript, because which destinations those are is kept in your browser and is never sent
          anywhere. Without it you get the complete calendar below — more than you need, rather than less.</p>
        </noscript>

        ${deadlineList(dated, { showDestination: true })}

        ${undated.length
          ? html`<h2 id="undated">${plural(undated.length, 'date')} we could not pin down</h2>
              <p>Every one of these was looked for and was not published, or is set by each institution rather
              than centrally. They are here rather than hidden, because "there is no date" is something you can
              act on and a blank is not.</p>
              ${deadlineList(undated, { showDestination: true })}`
          : ''}
      </div>

      <aside class="layout-aside__side stack">
        ${note(
          `Every date here comes from a country record or an Application Route, with the source it was read
          from. Nothing on this page is typed in by hand — if a date is wrong, it is wrong on the destination
          page too, and fixing it there fixes it here.`,
          { title: 'Where these come from' }
        )}
        ${note(
          `Anything marked **provisional** is carried over from the previous cycle because the authority has
          not republished it yet. The day and month have usually been stable for years; the year has not been
          confirmed. Treat a provisional date as a warning to check, not as a date.`,
          { kind: 'warn', title: 'Provisional dates' }
        )}
        ${stats([
          { value: dated.length, label: 'Dated events' },
          { value: withDates, label: 'Destinations with dates' },
        ])}
      </aside>
    </div>
  </div>
</section>`;

  return page({
    title: 'Application calendar',
    description:
      'Every university application deadline for IB students finishing in May 2027, scoped to the destinations you are looking at — in order, from autumn 2026 to results day.',
    path: '/timeline/',
    section: '/timeline/',
    body,
    scripts: ['calendar.js'],
  });
}
