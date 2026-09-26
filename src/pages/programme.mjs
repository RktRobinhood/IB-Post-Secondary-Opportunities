import { html, raw, md, plural, truncate, firstSentence } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import {
  hero, note, facts, sources, crumbs, stamp, emptyState, freshness, topic, glance, requirementDetail,
} from '../lib/components.mjs';
import { picture } from '../lib/data.mjs';
import { evidenceBlock } from '../lib/primitives.mjs';
import { evidenceStatus, resolveEvidence } from '../lib/canonical.mjs';
import { readerAccessOf } from '../lib/calendar.mjs';
import { entryAward, ENTRY_AWARD } from '../lib/eligibility.mjs';
import { awardBlock, destinationOf, cutoffSentence, prettyDate, institutionPicture } from './programme-facts.mjs';
import { datesPanel } from '../lib/school-dates.mjs';
import { credentialLine, facetsOf, pathsTable } from '../lib/paths.mjs';

/* One page per Programme: what it is, at a glance, then what it takes. */

/* --- A single programme ---------------------------------------------------- */

export function programme(site, p, inst) {
  const pic = picture(site, p.id) || institutionPicture(site, inst);
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
     on. The glance band shows the first; every date is in the panel below. */
  /* A route closed to the reader has no date for them to act on (#35). */
  const routeClosed = readerAccessOf(route?.readerAccess)?.state === 'closed';
  const closes = routeClosed
    ? []
    : (route?.milestones || []).filter(
        (m) => m.type === 'submit' && m.consequence === 'hard' && readerAccessOf(m.readerAccess)?.state !== 'closed'
      );
  const system = site.graph?.applicationSystems?.get(route?.applicationSystem);

  /* What it is, at a glance, before what it takes. The hero carries one
     sentence; the band under it carries the facts a student compares on; the
     subjects are chips; and every paragraph of rules and qualifications is one
     tap beneath its heading. Nothing was removed — see #37 for the argument. */
  const award = opp ? entryAward(opp) : null;
  const openQuestions = (opp?.requirements || []).filter((r) => r.mandatory !== false && r.openQuestion);
  /* A quota floor, where the cut-off is not a number ("All qualified
     applicants accepted" still means nothing below the floor in quota 1). */
  const quotaFloorText = (req?.quotaFloors || []).length
    ? `${req.quotaFloors[0].quota.toLowerCase()} needs ${req.quotaFloors.map((f) => f.ibText).join(' and ')}`
    : null;
  const numericCutoff = p.cutoff?.value && /^\d+([.,]\d+)?$/.test(String(p.cutoff.value).trim());
  /* Every date for this programme, from every route it is applied through,
     with open days and webinars: one panel, first in the column on a phone
     and at the top of the side column on a wide screen (school-dates.mjs).
     It replaced a "Deadlines for this intake" topic that read the first route
     only, and an "Apply by" line in the aside that repeated its first date. */
  const dates = datesPanel(site, inst, { programme: p });

  /* A requirement published on a local scale leads with its IB translation
     (requirementDetail); one already in IB terms keeps its chips. */
  const oneOfSets = req?.oneOfSets || (req?.oneOf?.length ? [req.oneOf] : []);
  const translated = [...(req?.all || []), ...oneOfSets.flat(2)].some((r) => r.translation);
  const need = translated ? html`${requirementDetail(req)}` : html`${req?.all?.length
      ? html`<ul class="need" aria-label="Required subjects">${req.all.map(
          (r) => html`<li class="need__item"><strong>${r.subject} ${r.level}</strong>${r.minGrade ? html`<span>minimum ${r.minGrade}</span>` : ''}</li>`
        )}</ul>`
      : ''}
    ${oneOfSets.map((set) => html`<p class="need__or">And one of these combinations:</p>
          <ul class="need need--or">${set.map(
            (group) => html`<li class="need__item">${group.map((r, n) => html`${n ? ' + ' : ''}<strong>${r.subject} ${r.level}</strong>${r.minGrade ? ` (min ${r.minGrade})` : ''}`)}</li>`
          )}</ul>`)}
    ${!req && !p.requirementsText ? emptyState('No entry requirements have been recorded for this programme yet.') : ''}`;

  const body = html`
${hero({
  variant: 'compact',
  // The institution, then what kind of degree, how long and where:
  // "SDU · BEng · 3½ yrs · Sønderborg" (src/lib/paths.mjs).
  eyebrow: [inst.shortName || inst.name, credentialLine(facetsOf(site, p))].filter(Boolean).join(' · '),
  title: p.name,
  lede: firstSentence(p.summary, 20),
  image: pic ? { src: pic.src, alt: pic.alt, credit: pic.credit } : null,
})}

<section class="section section--tinted section--glance">
  <div class="wrap">
    ${glance([
      { label: 'Where', value: [p.campus || inst.city, dest?.name].filter(Boolean).join(', ') || null },
      // The kind of degree first, because an academy profession degree is not a
      // bachelor's and a student comparing the two needs to see that at once.
      {
        label: 'Degree',
        value: p.degree ? p.degree.replace(/ – academy profession, not a bachelor's$/, '') : null,
        note: /not a bachelor/.test(p.degree || '') ? "Academy profession degree — not a bachelor's" : null,
      },
      { label: 'Length', value: p.years ? `${p.years} years` : p.ects ? `${p.ects} ECTS` : null },
      { label: 'Taught in', value: p.language || 'English' },
      { label: 'Starts', value: p.startMonth },
      { label: 'Apply by', value: closes.length ? prettyDate(closes[0].date) : null },
      {
        label: p.restrictedAdmission ? (numericCutoff ? 'Last cut-off' : p.cutoff?.value ? 'Last intake' : 'Admission') : 'Admission',
        /* IB points lead: for this reader "11.1" is the confusing number and
           "42 IB points" the one they can act on. The Danish figure follows. */
        value: p.restrictedAdmission === true
          ? numericCutoff
            ? p.cutoff.anyDiploma ? 'Any IB Diploma' : p.cutoff.ibPoints ? `${p.cutoff.ibPoints} IB points` : String(p.cutoff.value)
            : p.cutoff?.value ? String(p.cutoff.value) : 'Limited places'
          : p.restrictedAdmission === false ? 'Open to all who qualify' : 'Not recorded',
        note: p.restrictedAdmission && numericCutoff
          ? [p.cutoff.ibPoints || p.cutoff.anyDiploma ? `Danish ${p.cutoff.value}` : null, p.cutoff.intake, 'not a prediction'].filter(Boolean).join(' · ')
          : [p.cutoff?.intake, quotaFloorText].filter(Boolean).join(' · ') || null,
      },
    ])}
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${crumbs([
      ...(dest ? [{ href: dest.href, label: dest.name }] : []),
      { href: '/#discover', label: 'Find a degree' },
      { href: inst.href, label: inst.shortName || inst.name },
      { label: p.name },
    ])}

    <div class="layout-aside${dates ? ' layout-aside--dates' : ''}">
      ${dates}
      <div class="prose">
        ${/* One programme offered as several paths: what differs, in one table,
              on every member page (src/lib/paths.mjs). */ pathsTable(site, p, inst)}
        <h2 id="requirements">What you need</h2>
        ${need}
        ${/* A question the record leaves open is said where the requirements are
             read, not only one tap down (verification 2 after round 5: SEA's
             page led with "DP Course Results are accepted"). */
          openQuestions.map((r) => html`<p class="need__note req-open"><strong>${(r.satisfiedBy || []).includes('ib-diploma') ? 'With DP Course Results:' : 'Open question:'}</strong> ${r.label ? `${r.label} — ` : ''}${r.openQuestion}</p>`)}
        ${award === ENTRY_AWARD.NOT_ESTABLISHED ? awardBlock(opp) : ''}
        <p class="need__cta"><a class="btn btn--primary" href="${url('/planner/')}">Check my subjects against it</a></p>

        ${ev
          ? freshness({
              intake: opp?.intake,
              checkedAt: ev.checkedAt || opp?.meta?.dataAsOf,
              level: ev.level,
              provisional: provisionalDates,
            })
          : ''}

        ${topic({
          id: 'fine-print',
          title: 'The fine print',
          short: [
            award === ENTRY_AWARD.DIPLOMA_REQUIRED ? 'Asks for the full IB Diploma.' : null,
            award === ENTRY_AWARD.COURSE_RESULTS_ACCEPTED
              ? openQuestions.some((r) => (r.satisfiedBy || []).includes('ib-diploma')) ? 'DP Course Results are accepted, with an open question: see "What you need".' : 'DP Course Results are accepted.'
              : null,
            p.restrictedAdmission ? 'Meeting the requirements does not guarantee a place.' : null,
          ].filter(Boolean).join(' ') || null,
          body: html`
            ${p.requirementsText ? note(p.requirementsText, { title: 'In the institution\'s own words' }) : ''}
            ${award !== ENTRY_AWARD.NOT_ESTABLISHED ? awardBlock(opp) : ''}
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
            ${p.restrictedAdmission === null
              ? note(
                  `Whether places on this programme are limited is not recorded here. Check the institution's own
                  page: if it is restricted, meeting the requirements does not guarantee a place.`,
                  { kind: 'warn', title: 'Admission not recorded' }
                )
              : p.restrictedAdmission
              ? note(
                  `Places on this programme are limited, so meeting the requirements does not guarantee a place.
                  ${cutoffSentence(p.cutoff, cutoffScale, scheme?.display?.averageExplainedAt ? url(scheme.display.averageExplainedAt) : null) ||
                    'How places are allocated among everyone who qualifies is set by the institution, and is listed above where we have recorded it.'}`,
                  { kind: 'warn', title: 'Limited places' }
                )
              : note(
                  `As recorded here, places on this programme are not limited — everyone who meets the
                  entry requirements is admitted. Confirm on the university's own page before you rely on it.`,
                  { kind: 'ok', title: 'Open entry' }
                )}`,
          more: 'Requirements in full, and how places are allocated',
        })}

        ${p.summary
          ? topic({
              id: 'what',
              title: 'What it is',
              short: p.summary,
              body: facts([
                { label: 'Degree', value: p.degree },
                { label: 'Length', value: p.years ? `${p.years} years${p.ects ? `, ${p.ects} ECTS` : ''}` : p.ects ? `${p.ects} ECTS` : null },
                { label: 'Field', value: p.field },
              ]),
              more: 'Degree and length',
            })
          : ''}

        ${evidenceBlock({
          claim: `Entry requirements and admission rules for ${p.name}.`,
          records: site.graph ? resolveEvidence(site.graph, opp?.evidence) : [],
          summary: 'Open this to see the exact page each rule came from, when it was read, and whether a person has checked it.',
        })}

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
            label: 'Apply at',
            value: route?.portalUrl
              ? html`<a href="${route.portalUrl}" rel="noopener nofollow">${system?.name || new URL(route.portalUrl).hostname.replace(/^www\./, '')}</a>`
              : null,
          },
        ])}
        ${note(
          `Requirements change between admission years. Check the official page before you apply.`,
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
    scripts: dates ? ['dates-panel.js'] : undefined,
  });
}
