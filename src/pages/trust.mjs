import { html, raw, md, plural } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import { hero, note, sectionHead, crumbs, facts, dataTable, stamp } from '../lib/components.mjs';
import { STATE } from '../lib/primitives.mjs';

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

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Trust',
  title: 'How to tell whether to believe this',
  lede: 'This site can influence an expensive, time-sensitive decision made by someone under eighteen. That deserves operational rules rather than a promise to be careful.',
})}

<section class="section">
  <div class="wrap">
    ${crumbs([{ label: 'Trust and corrections' }])}
    <div class="layout-aside">
      <div class="prose">
        <h2 id="wrong">Something here is wrong. What do I do?</h2>
        <p class="lede">Tell us. A wrong deadline can cost a student a year, and the people most likely to
        spot one are the people using the site.</p>

        ${cfg.corrections.contactEmail
          ? html`<p><strong>Email <a href="mailto:${cfg.corrections.contactEmail}">${cfg.corrections.contactEmail}</a></strong> —
              no account needed. Say which page, what looks wrong, and a link to the official page if you have one.</p>`
          : note(
              `**No email address has been set yet**, so the only reporting route right now is GitHub, which needs
              a free account. That is a gap, it is recorded as one, and the release checklist fails until a
              monitored address is added. In the meantime: ${cfg.corrections.counsellorRoute}`,
              { kind: 'warn', title: 'An honest gap' }
            )}

        <p>You can also
        <a href="${cfg.corrections.issuesUrl}" rel="noopener">open an issue on the repository</a>, which needs a
        free GitHub account. ${cfg.corrections.counsellorRoute}</p>

        <p>Useful things to include, none of them required: the page, what looks wrong, the official page that
        says otherwise, and the intake you are applying for. Please do not send anything about yourself.</p>

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
            ['Verified', 'A person read the source and confirmed it supports the wording.', 'Shown normally.'],
            ['Published', 'Visible for a stated intake.', 'Shown with its intake and check date.'],
            ['Needs review', 'The interval elapsed, the source changed, or sources conflict.', 'Shown with a caveat, or held back entirely if the evidence is stale or contested.'],
            ['Superseded or unavailable', 'No longer current, but still traceable.', 'Not used as current evidence.'],
          ],
        })}
        ${note(
          `**Where this currently stands: ${ev.verified || 0} verified, ${ev.needsReview || 0} awaiting review.**
          The verified records are the Danish national rules, read page by page. The rest came from research
          that did read official pages, but no person has signed them off one at a time. Every build prints
          that ratio so it cannot quietly rot.`,
          { kind: 'warn', title: 'The honest number' }
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
              <li><a href="#ai">What automation may do</a></li>
              <li><a href="#independence">Who pays for this</a></li>
              <li><a href="#ordering">Why this order</a></li>
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
