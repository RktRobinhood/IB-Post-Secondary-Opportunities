import { html, raw, md, plural } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import { hero, note, sectionHead, crumbs, facts, dataTable, stamp } from '../lib/components.mjs';
import { STATE } from '../lib/primitives.mjs';
import { summarise } from '../lib/attestation.mjs';
import { assessAll, FLOOR_CHECKS } from '../lib/publication-floor.mjs';
import { motionTable } from '../lib/motion.mjs';

/**
 * Trust, corrections and privacy — the page a counsellor reads before deciding
 * whether to put this in front of students.
 *
 * It is written to be checkable rather than reassuring. Everything it claims
 * about what the site does not collect is something you can verify by opening
 * the network tab.
 */
export function trust(site) {
  const cfg = site.config;
  if (!cfg) {
    return page({
      title: 'Trust and corrections',
      path: '/trust/',
      body: html`<section class="section"><div class="wrap">${STATE.empty('Site configuration is missing.')}</div></section>`,
    });
  }

  const ev = site.evidenceSummary || {};
  // Counted here rather than taken from evidenceSummary, which does not yet
  // know the difference between a record its author read and one a second
  // party checked. src/lib/attestation.mjs holds the distinction.
  const att = summarise([...(site.graph?.evidence?.values() || [])]);

  /* Where every Destination stands against the publication floor, computed at
     build time from the records rather than maintained by hand. A page that
     claims a standard has to be able to show its own working, and this is the
     one number on the site that gets worse when we add a country. */
  const floor = assessAll(site.countries, site.graph);
  const met = floor.filter((f) => f.met);
  const queue = floor.filter((f) => !f.met).sort((a, b) => b.missing.length - a.missing.length || a.name.localeCompare(b.name));

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Trust',
  title: 'How to tell whether to believe this',
  lede: 'How far to trust each page, and how to tell us when something is wrong.',
})}

<section class="section">
  <div class="wrap">
    ${crumbs([{ label: 'Trust and corrections' }])}
    <div class="layout-aside">
      <div class="prose">
        <h2 id="wrong">Something here is wrong. What do I do?</h2>
        <p class="lede">Tell us. A wrong deadline can cost a student a year, and the people most likely to
        spot one are the people using the site.</p>

        <p><strong><a href="${cfg.corrections.issuesUrl}" rel="noopener">Open an issue on the repository</a></strong>
        — that is the reporting route, and it is a deliberate choice rather than a default. An issue is public,
        so you can see it was received; threaded, so a question about it has somewhere to go; and linked to the
        commit that fixes it, so you can check the fix rather than take our word for it. An inbox is none of
        those things.</p>

        <p>It needs a free GitHub account, which is the real cost of that choice. If you do not have one and do
        not want one: ${cfg.corrections.counsellorRoute}</p>

        ${cfg.corrections.contactEmail
          ? html`<p>You can also email
              <a href="mailto:${cfg.corrections.contactEmail}">${cfg.corrections.contactEmail}</a>.</p>`
          : ''}

        <p>Useful things to include, none of them required: the page, what looks wrong, the official page that
        says otherwise, and the intake you are applying for. Please do not put anything about yourself in an
        issue — it is public, and nothing about you is needed to fix a wrong deadline.</p>

        <h3>What happens then</h3>
        ${dataTable({
          caption: 'What we aim for, so you know whether to chase',
          head: ['If it is', 'Then'],
          rows: [
            ['A claim that could cause harm', cfg.corrections.responseTargets.unsafeClaim],
            ['A deadline or an entry requirement', cfg.corrections.responseTargets.deadlineOrRequirement],
            ['Anything else', cfg.corrections.responseTargets.anythingElse],
          ],
        })}
        <p>A correction changes the underlying record, so it propagates to every page and to the public data
        export on the next build. Evidence history is not rewritten: a superseded claim stays traceable rather
        than quietly disappearing.</p>

        <h2 id="lifecycle">How a claim gets onto the site</h2>
        <p>Every consequential claim moves through states, and the state is visible on the page rather than
        hidden in a database.</p>
        ${dataTable({
          caption: 'The claim lifecycle',
          head: ['State', 'What it means', 'What a student sees'],
          rows: [
            ['Discovered', 'A possible claim and a source have been found.', 'Nothing. It is not published.'],
            ['Structured', 'Entered as a record, with its applicability and its source.', 'Nothing yet.'],
            ['Attested', 'Whoever wrote the record opened the source, read it and quoted the supporting sentence. First-hand, and not yet checked by anyone else.', 'Shown, with the quotation available.'],
            ['Source checked', 'A script re-opened the page and found the wording still there. Confirms the words, not the meaning.', 'Shown, with the quotation available.'],
            ['Verified', 'A second party read the record back against its source and agreed. Never the party that wrote it.', 'Shown normally.'],
            ['Published', 'Visible for a stated intake.', 'Shown with its intake and check date.'],
            ['Needs review', 'The interval elapsed, the source changed, or sources conflict.', 'Shown with a caveat, or held back entirely if the evidence is stale or contested.'],
            ['Superseded or unavailable', 'No longer current, but still traceable.', 'Not used as current evidence.'],
          ],
        })}
        <h3 id="numbers">Where this currently stands</h3>
        <p>Three separate questions, kept apart. Rolling them into one number would let the strongest-sounding
        one stand in for the others, which is exactly what happened here once already.</p>
        ${dataTable({
          caption: `The condition of ${att.total} evidence records`,
          head: ['', 'How many', 'What it means'],
          rows: [
            [
              html`<strong>Read first-hand</strong>`,
              String(att.attested),
              'Whoever wrote the record opened the source, read it, and quoted the sentence that carries the claim. First-hand and genuine — and done by the same party that wrote the record, so nobody has checked it.',
            ],
            [
              html`<strong>Independently reviewed</strong>`,
              String(att.reviewed),
              html`A <em>second</em> party read the record back against its source and agreed — never the party that
              wrote it. ${att.reviewedByPerson
                ? html`${String(att.reviewedByPerson)} of those by a person.`
                : html`<strong>None of those is yet by a person</strong>, and that matters: a second reading
                  catches a misread table or a claim that overstates its source, and it is not somebody deciding
                  the claim is safe to publish.`}
              ${att.disagreed
                ? html`A further ${String(att.disagreed)} ${att.disagreed === 1 ? 'record was' : 'records were'}
                  reviewed and found <em>wrong</em>; ${att.disagreed === 1 ? 'it is' : 'they are'} held back from
                  this count and carry the reviewer's note.`
                : ''}`,
            ],
            [
              html`<strong>Source re-read by machine</strong>`,
              String(att.sourceChecked),
              'The cited page was fetched again and searched for the claim it supports, with the supporting sentence quoted onto the record. It confirms the words are still printed there; it cannot notice that the page now means something different by them.',
            ],
          ],
        })}
        ${note(
          `**Independently reviewed stands at ${att.reviewed} of ${att.total}, and that is the honest number.**

          It used to read 152. Those records were written by research passes that opened the official page,
          quoted it, wrote the record, and marked their own work verified in the same breath. The reading was
          real — it is kept, and counted in the first row — but nobody had checked it, and the site said
          otherwise.

          ${att.disagreed
            ? `The review is worth having: of the first ${att.reviewed + att.disagreed} records read back
               against their sources, **${att.disagreed} turned out to be wrong** — in each case a condition
               that applies only to one Danish admission quota, recorded as though you could not apply without
               it. Those are corrected or held back, not quietly counted as checked.`
            : ''}

          The rule now is not "a human must do it", because a human who writes a record from a page has not
          been checked either. It is that **the party who read the source cannot be the party who confirms
          it**. A test fails any record claiming otherwise, which is what the previous version of this
          paragraph should have been instead of a paragraph.`,
          { kind: 'warn', title: 'The honest number' }
        )}

        <h3 id="floor">How far each destination has been researched</h3>
        <p>Coverage on this site is uneven by an order of magnitude, and for a long time every page presented
        its own depth with the same confidence. The five checks below are what a destination has to clear
        before we treat it as researched. They are run on every build against the records themselves —
        nothing in a file can claim to have passed them.</p>

        ${dataTable({
          caption: 'What each check asks',
          head: ['Check', 'What it means'],
          rows: FLOOR_CHECKS.map((c) => [html`<strong>${c.title}</strong>`, c.why]),
        })}

        <p><strong>${met.length} of ${floor.length}</strong> destinations currently meet all five.
        The rest are labelled on their own pages as outlines, at the top rather than the bottom — a student
        who reads to the end of a sketch and only then learns it was a sketch has already been misled.</p>

        ${queue.length
          ? html`<details class="acc">
              <summary>The ${queue.length} still short, and what each one is missing</summary>
              ${dataTable({
                caption: 'Outstanding research, worst first',
                head: ['Destination', 'Short by', 'What is missing'],
                rows: queue.map((f) => [
                  f.name,
                  `${f.missing.length} of ${FLOOR_CHECKS.length}`,
                  f.missing.map((m) => m.detail).join('; '),
                ]),
              })}
            </details>`
          : ''}

        ${note(
          `Publishing a destination is an act that commits us to it. The moment a destination gets its
          canonical record, the build starts holding it to all five checks and the test suite fails until it
          meets them — so the cost of a half-finished country is a broken build rather than a page that
          quietly looks as authoritative as Denmark's.`,
          { kind: 'accent', title: 'Why this list can be trusted to be complete' }
        )}

        <h2 id="ai">What automation is and is not allowed to do</h2>
        <p>Much of this site was researched with automated help, and that is worth being direct about.</p>
        <ul class="ticks">
          <li>Automation <strong>may</strong> find pages, extract candidate facts, compare versions of a page
          over time, and flag that something changed.</li>
          <li>Automation <strong>may not</strong> be the final authority on a consequential rule. Anything a
          script produced stays at <em>needs review</em> until a person signs it off.</li>
        </ul>
        <ul class="crosses">
          <li>Nothing is ever invented to fill a gap. A missing figure is left empty and recorded as missing —
          a plausible-looking wrong number is worse than nothing, because nobody checks it.</li>
          <li>Where two official sources disagree, both are kept and the public result is held back. It is
          never resolved by taking the more generous reading.</li>
        </ul>

        <h2 id="independence">Who pays for this</h2>
        ${facts([
          { label: 'Sponsorship', value: cfg.independence.sponsorship === 'none' ? 'None.' : cfg.independence.sponsorship },
          { label: 'Affiliate links', value: cfg.independence.affiliateLinks === 'none' ? 'None. Every outbound link goes to an official page.' : cfg.independence.affiliateLinks },
          { label: 'Paid placement', value: cfg.independence.paidPlacement === 'none' ? 'None. No institution can buy inclusion, position or prominence.' : cfg.independence.paidPlacement },
          { label: 'Relationships', value: cfg.independence.institutionalRelationships },
        ])}
        <p>If that ever changes, it will be labelled where it is displayed and kept out of eligibility and
        ordering entirely — and this page will say so before you notice it anywhere else.</p>

        <h2 id="ordering">Why things are in the order they are</h2>
        <p>${cfg.ordering.explanation}</p>
        <p>You can reorder results yourself by ${cfg.ordering.studentControlled.join(', ')}. When you do, the
        filters you applied are listed above the results so you can see what is shaping them. There is no
        “best match” score anywhere on this site, and no result is hidden because of something inferred
        about you.</p>

        <h2 id="motion">What moves, and what happens if you would rather it did not</h2>
        <p>Animation on this site has to explain something. There are three kinds, each with a stated purpose
        and a stated behaviour when motion is turned down — and nothing animates for any other reason, which is
        a rule we hold ourselves to by keeping the list short enough to print.</p>

        ${dataTable({
          caption: 'Every animation on this site',
          head: ['When', 'What it is for', 'How long', 'With reduced motion'],
          rows: motionTable().map((m) => [
            html`<strong>${m.token.replace(/-/g, ' ')}</strong>`,
            m.purpose,
            m.timing,
            m.reduced,
          ]),
        })}

        <p>The reduced-motion column is not the same animation played faster. Each is a different, designed
        behaviour, because an effect that is uncomfortable at full speed is usually still uncomfortable at
        double. We follow your operating system's setting automatically, and the <strong>Reduce motion</strong>
        control in the footer overrides it either way if your machine's setting is not what you want here.</p>

        ${note(
          `There used to be a fourth, for moving a camera across geography. It was removed rather than kept:
          the only thing on this site that moves a camera is the map, the map already uses the
          overview-to-detail timing, and a token defined for a movement nothing performs is a claim about the
          system that is not true. It comes back when something flies a camera, together with the code that
          spends it.`,
          { title: 'Why there are three and not four' }
        )}

        <h2 id="privacy">What this site knows about you</h2>
        <p class="lede">${cfg.privacy.plainLanguage}</p>
        ${dataTable({
          caption: 'Everything stored in your browser, and nothing beyond it',
          head: ['Stored as', 'What it holds'],
          rows: cfg.privacy.localStorageKeys.map((k) => [html`<code>${k.key}</code>`, k.holds]),
        })}
        <p>No account is needed for anything: exploring, checking your subjects, comparing destinations and
        planning all work signed out, because there is nothing to sign in to. There are no streaks, no
        countdown pressure beyond the real deadlines, and no comparison with other students.</p>
        <p>If accounts are ever added, that needs a separate data-protection and child-safety review first,
        and this page will describe it before it ships.</p>

        <h2 id="boundaries">What this site does not do</h2>
        <ul class="crosses">
          <li>It does not submit anything. Marking something done here is a note to yourself and has no
          relationship to whether a portal received it.</li>
          <li>It does not predict whether you will be offered a place. Past cut-offs are history, labelled as
          history.</li>
          <li>It does not rank institutions, and it does not have a view on which is best.</li>
          <li>It is not admissions advice. The institution's own page is the authority, every time.</li>
        </ul>
      </div>

      <aside class="layout-aside__side stack">
        ${stamp(cfg.dataAsOf)}
        <div class="card card--flat">
          <div class="card__body">
            <p class="eyebrow eyebrow--plain">On this page</p>
            <ul style="list-style:none;padding:0;margin:0;font-size:.9375rem;line-height:2">
              <li><a href="#wrong">Report a mistake</a></li>
              <li><a href="#lifecycle">How a claim gets published</a></li>
              <li><a href="#numbers">Where this stands</a></li>
              <li><a href="#ai">What automation may do</a></li>
              <li><a href="#independence">Who pays for this</a></li>
              <li><a href="#ordering">Why this order</a></li>
              <li><a href="#motion">What moves</a></li>
              <li><a href="#privacy">What we know about you</a></li>
              <li><a href="#boundaries">What this does not do</a></li>
            </ul>
          </div>
        </div>
        ${note(
          `Everything this page claims about what the site does not collect is checkable. Open your browser's
          network tab and use the site — there are no third-party requests except the font stylesheet, and no
          requests carrying anything you typed.`,
          { kind: 'ok', title: 'Do not take our word for it' }
        )}
      </aside>
    </div>
  </div>
</section>`;

  return page({
    title: 'Trust and corrections',
    description:
      'How claims are verified, how to report a mistake without an account, who pays for this site, and exactly what it stores about you.',
    path: '/trust/',
    body,
  });
}
