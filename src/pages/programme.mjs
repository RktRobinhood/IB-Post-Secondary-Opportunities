import { html, raw, md, plural, truncate, firstSentence } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import {
  hero, note, facts, sources, crumbs, stamp, emptyState, freshness, topic, glance,
} from '../lib/components.mjs';
import { picture } from '../lib/data.mjs';
import { evidenceBlock } from '../lib/primitives.mjs';
import { evidenceStatus, resolveEvidence } from '../lib/canonical.mjs';
import { readerAccessOf } from '../lib/calendar.mjs';
import { entryAward, ENTRY_AWARD } from '../lib/eligibility.mjs';
import { awardBlock, destinationOf, cutoffSentence, prettyDate } from './programme-facts.mjs';

/* One page per Programme: what it is, at a glance, then what it takes. */

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
  const numericCutoff = p.cutoff?.value && /^\d+([.,]\d+)?$/.test(String(p.cutoff.value).trim());
  const deadlineRows = (route?.milestones || [])
    .filter((m) => ['submit', 'signature', 'document', 'result', 'reply'].includes(m.type))
    .filter((m) => readerAccessOf(m.readerAccess)?.state !== 'closed');

  const need = html`${req?.all?.length
      ? html`<ul class="need" aria-label="Required subjects">${req.all.map(
          (r) => html`<li class="need__item"><strong>${r.subject} ${r.level}</strong>${r.minGrade ? html`<span>minimum ${r.minGrade}</span>` : ''}</li>`
        )}</ul>`
      : ''}
    ${req?.oneOf?.length
      ? html`<p class="need__or">And one of these combinations:</p>
          <ul class="need need--or">${req.oneOf.map(
            (group) => html`<li class="need__item">${group.map((r, n) => html`${n ? ' + ' : ''}<strong>${r.subject} ${r.level}</strong>${r.minGrade ? ` (min ${r.minGrade})` : ''}`)}</li>`
          )}</ul>`
      : ''}
    ${!req && !p.requirementsText ? emptyState('No entry requirements have been recorded for this programme yet.') : ''}`;

  const body = html`
${hero({
  variant: 'compact',
  eyebrow: `${inst.shortName || inst.name}${p.campus ? ` · ${p.campus}` : ''}`,
  title: p.name,
  lede: firstSentence(p.summary, 20),
  image: pic ? { src: pic.src, alt: pic.alt, credit: pic.credit } : null,
})}

<section class="section section--tinted section--glance">
  <div class="wrap">
    ${glance([
      { label: 'Where', value: [p.campus || inst.city, dest?.name].filter(Boolean).join(', ') || null },
      { label: 'Length', value: p.years ? `${p.years} years` : p.ects ? `${p.ects} ECTS` : null },
      { label: 'Taught in', value: p.language || 'English' },
      { label: 'Starts', value: p.startMonth },
      { label: 'Apply by', value: closes.length ? prettyDate(closes[0].date) : null },
      {
        label: p.restrictedAdmission ? 'Last cut-off' : 'Admission',
        value: p.restrictedAdmission
          ? numericCutoff ? String(p.cutoff.value) : 'Restricted'
          : 'Open to all who qualify',
        note: p.restrictedAdmission && numericCutoff ? [p.cutoff.intake, 'not a prediction'].filter(Boolean).join(' · ') : null,
      },
    ])}
  </div>
</section>

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
        <h2 id="requirements">What you need</h2>
        ${need}
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
            award === ENTRY_AWARD.COURSE_RESULTS_ACCEPTED ? 'DP Course Results are accepted.' : null,
            p.restrictedAdmission ? 'Meeting the requirements does not guarantee a place.' : null,
          ].filter(Boolean).join(' ') || null,
          body: html`
            ${p.requirementsText ? note(p.requirementsText, { title: 'In the university\'s own words' }) : ''}
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
            ${p.restrictedAdmission
              ? note(
                  `This programme has restricted admission, so meeting the requirements does not guarantee a place.
                  ${cutoffSentence(p.cutoff, cutoffScale) ||
                    'How places are allocated among everyone who qualifies is set by the institution, and is listed above where we have recorded it.'}`,
                  { kind: 'warn', title: 'Restricted admission' }
                )
              : note(
                  `As recorded here, this programme does not have restricted admission — everyone who meets the
                  entry requirements is admitted. Confirm on the university's own page before you rely on it.`,
                  { kind: 'ok', title: 'Open admission' }
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

        ${deadlineRows.length && !routeClosed
          ? topic({
              id: 'deadlines',
              title: 'Deadlines for this intake',
              short: closes.length
                ? `Applications close **${prettyDate(closes[0].date)}**${closes[0].timeOfDay ? ` at ${closes[0].timeOfDay} ${closes[0].timeZone || ''}` : ''}.`
                : `${plural(deadlineRows.length, 'date')} recorded.`,
              body: html`<ul class="timeline">
                ${deadlineRows.map(
                  (m) => html`<li data-date="${m.date || ''}"${m.provisional ? raw(' data-provisional="true"') : ''}>
                    <div class="timeline__when">${m.date || 'Date not published'}${m.timeOfDay ? html`<br>${m.timeOfDay} ${m.timeZone || ''}` : ''}</div>
                    <div class="timeline__what">
                      <h4>${m.label}</h4>
                      ${m.note ? md(m.note) : ''}
                      ${m.consequence === 'hard' ? html`<p><small>Missing this closes the door for this intake.</small></p>` : ''}
                    </div>
                  </li>`
                )}
              </ul>`,
              more: `All ${plural(deadlineRows.length, 'date')}`,
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
  });
}
