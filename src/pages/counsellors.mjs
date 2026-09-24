import { html, plural } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import { hero, note, crumbs, dataTable, stamp, facts } from '../lib/components.mjs';

/**
 * The page a guidance counsellor reads before putting this in front of a student.
 *
 * Deliberately separate from /about/, which is written for the student. A
 * counsellor needs different things: how deep the coverage actually goes, what
 * the site refuses to answer and why, where it will be wrong first, and what to
 * check before repeating something from it in a meeting.
 *
 * Every number here is computed from the data rather than typed, because a
 * coverage claim is exactly the sort of sentence that is true the day it is
 * written and quietly false four months later.
 */
export function counsellors(site) {
  const graph = site.graph || {};
  const countries = site.countries || [];
  const opportunities = [...(graph.opportunities?.values() || [])];
  const programmes = [...(graph.programmes?.values() || [])];
  const destinations = [...(graph.destinations?.values() || [])];
  const ev = site.evidenceSummary || {};

  // Names, not codes. "1 country — dk" is the sort of thing that reads fine to
  // whoever wrote the template and like a bug to everyone else.
  const nameFor = (code) =>
    destinations.find((d) => d.id === code)?.name ||
    countries.find((c) => c.code === code)?.name ||
    code;
  const deepCountries = [...new Set(opportunities.map((o) => o.destination))].map(nameFor).sort();
  const researched = destinations.filter((d) => d.sectorLandscape).map((d) => d.name).sort();
  // Countries with a profile but no national-level research yet. Counted by
  // name, not by subtracting totals: the two lists are not the same set, and
  // the subtraction once printed "the remaining -1 countries".
  const outline = countries.filter((c) => !researched.includes(nameFor(c.code)));
  const instCount =
    (site.institutionCatalogue?.all.length || 0) + countries.reduce((n, c) => n + (c.institutions?.length || 0), 0);

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'For guidance counsellors',
  title: 'What this covers, and where it will fail you first',
  lede: 'What this site covers, where it stops, and how far to rely on it.',
})}

<section class="section">
  <div class="wrap">
    ${crumbs([{ label: 'For counsellors' }])}
    <div class="layout-aside">
      <div class="prose">
        <h2 id="depth">The coverage is uneven, on purpose</h2>
        <p class="lede">${outline.length ? 'Three' : 'Two'} different depths of information sit on this site, and they look more alike
        than they are. Knowing which one you are reading is the single most useful thing on this page.</p>

        ${dataTable({
          caption: 'What exists, and what it will actually answer',
          head: ['Depth', 'Where', 'What you can rely on it for'],
          rows: [
            [
              html`<strong>Programme level</strong>`,
              `${plural(deepCountries.length, 'country', 'countries')} — ${deepCountries.join(', ')}`,
              html`${plural(opportunities.length, 'programme')} with entry requirements recorded subject by subject,
              each against the page it came from. This is the only depth at which the subject checker can
              answer "does this student qualify".`,
            ],
            [
              html`<strong>National level</strong>`,
              researched.length === destinations.length
                ? `All ${destinations.length} destinations on the site`
                : researched.join(', '),
              `How the IB is recognised, the deadlines, the fees, the application system and how the post-secondary sector is structured — including the non-university routes. Enough to advise a student on whether a country is worth pursuing, not enough to tell them whether they qualify for a given degree.`,
            ],
            outline.length
              ? [
                  html`<strong>Orientation</strong>`,
                  `The remaining ${plural(outline.length, 'country', 'countries')}: ${outline.map((c) => c.name).join(', ')}`,
                  `A researched profile with what to watch out for. Treat as a starting point for a conversation, not as an answer.`,
                ]
              : null,
          ].filter(Boolean),
        })}

        ${note(
          `**If you take one thing from this page:** the subject checker gives a real answer for programmes in
          ${deepCountries.join(' and ')} and cannot give one anywhere else yet, because nowhere else has
          requirements recorded at programme level. It says so when you ask it. It does not guess.`,
          { kind: 'warn', title: 'The limit worth knowing' }
        )}

        <h2 id="conversation">Using it in a conversation</h2>
        <p>The order matters more than it looks, because it goes from what cannot be changed to what can.</p>
        <ol>
          <li><strong>Subjects first</strong>, at <a href="${url('/planner/')}">the subject checker</a>.
          Almost every gap this site can show a student is a subject <em>level</em>, not a grade, and levels are
          decided years before the application. A student in their first year can still act on it; a student
          in their last year is looking at a supplementary course.</li>
          <li><strong>Then the country</strong>, for recognition, deadlines and cost. This is where most
          decisions are actually settled — usually by language of instruction or by money.</li>
          <li><strong>Then the programme page</strong>, for the requirements and the official wording.</li>
          <li><strong>Then the institution's own page</strong>, always, before anything is submitted. Every
          programme here links to it. That link is the point of the site, not a courtesy.</li>
        </ol>

        <h2 id="wrong">The four things students reliably get wrong</h2>
        <p>Drawn from what the research actually turned up rather than from general advice.</p>
        <ul class="crosses">
          <li><strong>They think grades are the obstacle.</strong> Far more often it is a subject level —
          Mathematics at A level in Danish terms, which is HL in IB terms. A student with excellent grades and
          Mathematics SL is shut out of engineering everywhere in Denmark, and nothing about their grades
          fixes it.</li>
          <li><strong>They think CAS and the Extended Essay count.</strong> No admissions office in Denmark,
          Norway, Sweden, Germany or the Netherlands will read either. They are worth doing and they are not
          admissions instruments, and a student spending anxious months optimising them for university is
          spending them for nothing.</li>
          <li><strong>They think the deadline is the end of the day.</strong> The Danish deadline is 15 March
          at <em>twelve noon</em>, not midnight. The Dutch numerus fixus deadline is 15 January.</li>
          <li><strong>They forget results arrive after the deadlines.</strong> IB results come out on 6 July;
          most European deadlines fall months earlier. Every system has a different answer to that — Denmark
          has the IB results service, the Netherlands decides it per institution. It is administrative rather
          than academic, and it is the most common way a good application fails.</li>
        </ul>

        <h2 id="check">What to check before repeating something from here</h2>
        <p>Three things, all visible on the page itself.</p>
        <ul class="ticks">
          <li><strong>The check date.</strong> Every page carries one. Admission rules change annually and
          several on this site are already scheduled to change before autumn 2027.</li>
          <li><strong>Whether a date is marked provisional.</strong> That means it is carried from a previous
          cycle because the authority has not published the new one. It is a good estimate and it is not a
          commitment.</li>
          <li><strong>The source link.</strong> Every consequential claim has one. If a student is about to
          act on something, open it.</li>
        </ul>

        <h2 id="verified">How much of this has a person checked</h2>
        <p>The honest answer, which the site publishes on every build rather than on request.</p>
        ${facts([
          {
            label: 'Signed off by a person',
            value: `${ev.verified || 0} of ${ev.total || 0} evidence records. These are the Danish national rules and the records read one at a time.`,
          },
          {
            label: 'Source re-read automatically',
            value: `${ev.sourceChecked || 0} records. The cited page was fetched again and searched for the claim it supports; ${ev.sourceSupported || 0} still carry the wording, with the supporting sentence quoted onto the record.`,
          },
          {
            label: 'What that means for you',
            value:
              'A machine confirming that a phrase is still printed on a page is not the same as a person agreeing it means what we say. Both numbers are published so you can weigh them yourself, and neither is presented as the other.',
          },
        ])}
        <p><a class="arrow-link" href="${url('/trust/')}">How claims get onto the site, and how to report one that is wrong</a></p>

        <h2 id="not">What it will not do, by design</h2>
        <ul class="crosses">
          <li>It will not tell a student their chances. There is no score, no probability and no "likely".
          Past cut-offs appear as history, labelled as history.</li>
          <li>It will not rank institutions, and has no view on which is best.</li>
          <li>It will not submit anything, and ticking something off here has no relationship to whether a
          portal received it.</li>
          <li>It will not guess. A figure nobody could verify is left blank and recorded as missing, which is
          why some fields are empty. That is a finding, not an oversight.</li>
        </ul>

        <h2 id="report">If something here is wrong</h2>
        <p>You are the most likely person to spot it, and a wrong deadline costs a student a year.
        ${site.config?.corrections?.issuesUrl
          ? html`<a href="${site.config.corrections.issuesUrl}" rel="noopener">Open an issue</a> — public,
            threaded and linked to the commit that fixes it.`
          : ''}
        A claim that could cause harm is pulled within one working day while it is checked; a deadline or an
        entry requirement is checked within three.</p>
      </div>

      <aside class="layout-aside__side stack">
        ${stamp(site.config?.dataAsOf)}
        <div class="card card--flat">
          <div class="card__body">
            <p class="eyebrow eyebrow--plain">On this page</p>
            <ul style="list-style:none;padding:0;margin:0;font-size:.9375rem;line-height:2">
              <li><a href="#depth">How deep the coverage goes</a></li>
              <li><a href="#conversation">Using it in a conversation</a></li>
              <li><a href="#wrong">What students get wrong</a></li>
              <li><a href="#check">What to check first</a></li>
              <li><a href="#verified">How much is verified</a></li>
              <li><a href="#not">What it will not do</a></li>
              <li><a href="#report">Reporting a mistake</a></li>
            </ul>
          </div>
        </div>
        ${note(
          `Everything on this site is generated from public data files. If you would rather read the
          underlying records than the pages, they are in the repository, one file per country, institution
          and programme.`,
          { kind: 'ok', title: 'You can read the data directly' }
        )}
      </aside>
    </div>
  </div>
</section>`;

  return page({
    title: 'For guidance counsellors',
    description:
      'How deep the coverage actually goes, what the site refuses to answer and why, what students reliably get wrong, and what to check before repeating anything from it.',
    path: '/counsellors/',
    body,
  });
}
