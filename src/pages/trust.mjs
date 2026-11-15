import { html, raw, md, plural, firstSentence } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import { hero, note, crumbs, facts, dataTable, stamp, topic, glance } from '../lib/components.mjs';
import { STATE } from '../lib/primitives.mjs';
import { assessAll, FLOOR_CHECKS } from '../lib/publication-floor.mjs';

/**
 * Trust, corrections and privacy — the page a counsellor reads before deciding
 * whether to put this in front of students.
 *
 * It is written to be checkable rather than reassuring. Everything it claims
 * about what the site does not collect is something you can verify by opening
 * the network tab.
 *
 * It opens on the two things a reader acts on: a button to report a mistake,
 * and the two numbers that say how far to trust the rest. Then nine questions,
 * each a heading and a short answer, with the full answer — every table and
 * every paragraph this page used to print open — one tap beneath (#37's
 * `topic()` pattern). How animation
 * behaves moved to /about/, which is where a question about the site itself
 * belongs.
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

  const sources = [...(site.graph?.evidence?.values() || [])];
  const dated = sources.filter((s) => (s.sourceUrl || s.url) && (s.retrievedAt || s.checked)).length;

  /* Where every Destination stands against the publication floor, computed at
     build time from the records rather than maintained by hand. A page that
     claims a standard has to be able to show its own working, and this is the
     one number on the site that gets worse when we add a country. */
  const floor = assessAll(site.countries, site.graph);
  const met = floor.filter((f) => f.met);
  const queue = floor.filter((f) => !f.met).sort((a, b) => b.missing.length - a.missing.length || a.name.localeCompare(b.name));

  const ind = cfg.independence;
  const noneOf = ['sponsorship', 'affiliateLinks', 'paidPlacement'].every((k) => ind[k] === 'none');

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
        <p class="trust-actions">
          <a class="btn btn--primary" href="${cfg.corrections.issuesUrl}" rel="noopener">Report a mistake</a>
          <a class="btn btn--ghost" href="#wrong">No GitHub account?</a>
        </p>

        ${glance([
          { label: 'Sources with a checked date', value: `${dated} of ${sources.length}`, note: 'follow the official source before applying' },
          { label: 'Destinations researched in depth', value: `${met.length} of ${floor.length}`, note: `meet all ${FLOOR_CHECKS.length} checks${queue.length ? '; the rest are labelled as outlines' : ''}` },
        ])}

        ${topic({
          id: 'wrong',
          title: 'Something here is wrong. What do I do?',
          short: `Tell us: a wrong deadline can cost a student a year. [Open an issue](${cfg.corrections.issuesUrl}), or, without a GitHub account: ${cfg.corrections.counsellorRoute.split(/(?<=\.)\s/)[0]}`,
          body: html`<p><strong><a href="${cfg.corrections.issuesUrl}" rel="noopener">Open an issue on the repository</a></strong>
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
            export on the next build. Git history records the change.</p>`,
          more: 'What to include, and how fast we act',
        })}

        ${topic({
          id: 'lifecycle',
          title: 'How a claim gets onto the site',
          short: 'Facts carry a source link and the date it was checked. The official institution or rule-owner remains the authority.',
          body: html`<p>We record the intake, applicant group and any conditions beside a fact. A date checked is a record of when its source was read; it is no guarantee that the rule is still current.</p><p>Missing answers stay visible as gaps. Conflicting guidance is explained beside the affected fact, with a link to ask the university.</p>`,
          more: 'Sources and gaps',
        })}

        ${topic({
          id: 'numbers',
          title: 'Where this currently stands',
          short: `**${dated} of ${sources.length}** source references have a link and checked date.`,
          body: html`<p>Source links let you check the rule yourself. They do not establish independent review or predict an offer. Confirm deadlines, fees and entry requirements on the official page for your intake before acting.</p>`,
          more: 'What a checked date means',
        })}

        ${topic({
          id: 'floor',
          title: 'How far each destination has been researched',
          short: `**${met.length} of ${floor.length}** destinations meet all ${FLOOR_CHECKS.length} checks.${queue.length ? " The rest say they are outlines at the top of their own pages." : " A new one fails the build until it does too."}`,
          body: html`<p>Coverage on this site is uneven by an order of magnitude, and for a long time every page presented
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
              published country record, the build starts holding it to all five checks and the test suite fails until it
              meets them — so the cost of a half-finished country is a broken build rather than a page that
              quietly looks as authoritative as Denmark's.`,
              { kind: 'accent', title: 'Why this list can be trusted to be complete' }
            )}`,
          more: 'The checks, and who is still short',
        })}

        ${topic({
          id: 'ai',
          title: 'What automation is and is not allowed to do',
          short: 'It may find pages and flag changes. It may not be the final authority on a consequential rule, and nothing is invented to fill a gap.',
          body: html`<p>Much of this site was researched with automated help, and that is worth being direct about.</p>
            <ul class="ticks">
              <li>Automation <strong>may</strong> find pages, extract candidate facts, compare versions of a page
              over time, and flag that something changed.</li>
              <li>Automation <strong>may not</strong> be the final authority on a consequential rule. Anything a
              script suggests must be checked against the official rule-owner's page before it is recorded.</li>
            </ul>
            <ul class="crosses">
              <li>Nothing is ever invented to fill a gap. A missing figure is left empty and recorded as missing —
              a plausible-looking wrong number is worse than nothing, because nobody checks it.</li>
              <li>Where two official sources disagree, both are kept and the public result is held back. It is
              never resolved by taking the more generous reading.</li>
            </ul>`,
          more: 'The rules',
        })}

        ${topic({
          id: 'independence',
          title: 'Who pays for this',
          short: noneOf
            ? 'No sponsorship, no affiliate links and no paid placement. No institution has seen its own entry before publication.'
            : 'Any sponsorship, affiliate link or paid placement is listed below.',
          body: html`${facts([
              { label: 'Sponsorship', value: ind.sponsorship === 'none' ? 'None.' : ind.sponsorship },
              { label: 'Affiliate links', value: ind.affiliateLinks === 'none' ? 'None. Every outbound link goes to an official page.' : ind.affiliateLinks },
              { label: 'Paid placement', value: ind.paidPlacement === 'none' ? 'None. No institution can buy inclusion, position or prominence.' : ind.paidPlacement },
              { label: 'Relationships', value: ind.institutionalRelationships },
            ])}
            <p>If that ever changes, it will be labelled where it is displayed and kept out of eligibility and
            ordering entirely — and this page will say so before you notice it anywhere else.</p>`,
          more: 'In full',
        })}

        ${topic({
          id: 'ordering',
          title: 'Why things are in the order they are',
          short: cfg.ordering.explanation,
          body: html`<p>You can reorder results yourself by ${cfg.ordering.studentControlled.join(', ')}. When you do, the
            filters you applied are listed above the results so you can see what is shaping them. There is no
            “best match” score anywhere on this site, and no result is hidden because of something inferred
            about you.</p>`,
          more: 'What you can change',
        })}

        ${topic({
          id: 'privacy',
          title: 'What this site knows about you',
          short: `${firstSentence(cfg.privacy.plainLanguage)} No accounts, no cookies, no analytics.`,
          body: html`<p>${cfg.privacy.plainLanguage}</p>
            ${dataTable({
              caption: 'Everything stored in your browser, and nothing beyond it',
              head: ['Stored as', 'What it holds'],
              rows: cfg.privacy.localStorageKeys.map((k) => [html`<code>${k.key}</code>`, k.holds]),
            })}
            <p>No account is needed for anything: exploring, checking your subjects, comparing destinations and
            planning all work signed out, because there is nothing to sign in to. There are no streaks, no
            countdown pressure beyond the real deadlines, and no comparison with other students.</p>
            <p>If accounts are ever added, that needs a separate data-protection and child-safety review first,
            and this page will describe it before it ships.</p>`,
          more: 'Everything stored in your browser',
        })}

        ${topic({
          id: 'boundaries',
          title: 'What this site does not do',
          short: 'It does not submit anything, predict offers, rank institutions or give admissions advice.',
          body: html`<ul class="crosses">
              <li>It does not submit anything. Marking something done here is a note to yourself and has no
              relationship to whether a portal received it.</li>
              <li>It does not predict whether you will be offered a place. Past cut-offs are history, labelled as
              history.</li>
              <li>It does not rank institutions, and it does not have a view on which is best.</li>
              <li>It is not admissions advice. The institution's own page is the authority, every time.</li>
            </ul>`,
          more: 'Each one',
        })}

        ${topic({
          id: 'motion',
          title: 'What moves on this site',
          short: html`<p>Three kinds of animation, each with a designed reduced-motion version. Your system setting is
            followed; <strong>Reduce motion</strong> in the footer overrides it. <a href="${url('/about/#motion')}">Every animation, listed</a></p>`,
        })}
      </div>

      <aside class="layout-aside__side stack">
        ${stamp(cfg.dataAsOf)}
        <nav aria-label="On this page">
          <p class="eyebrow eyebrow--plain">On this page</p>
          <ul class="side-links">
              <li><a href="#wrong">Report a mistake</a></li>
              <li><a href="#lifecycle">How a claim gets published</a></li>
              <li><a href="#numbers">Where this stands</a></li>
              <li><a href="#floor">How far each destination is researched</a></li>
              <li><a href="#ai">What automation may do</a></li>
              <li><a href="#independence">Who pays for this</a></li>
              <li><a href="#ordering">Why this order</a></li>
              <li><a href="#privacy">What we know about you</a></li>
              <li><a href="#boundaries">What this does not do</a></li>
            </ul>
        </nav>
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
