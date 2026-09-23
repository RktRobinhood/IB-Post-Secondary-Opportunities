import { html, raw, md, plural } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import { hero, note, sectionHead, crumbs, stamp, sources } from '../lib/components.mjs';
import { preparationPath, evidenceBlock, STATE } from '../lib/primitives.mjs';
import { resolveEvidence } from '../lib/canonical.mjs';

/**
 * The preparation surface.
 *
 * The hard part of this page is not the layout — it is refusing to imply that
 * any of it improves your chances when most of it does not. Everything is
 * labelled as one of three things, the labels are defined in plain words at the
 * top, and the suggestions say outright that they have no effect on admission.
 */
/**
 * Turn a Preparation Action's `appliesTo` into something a student can read.
 *
 * The data has always known which of these are jurisdictional — quota 2 and GSK
 * are Danish mechanisms, not general advice — and the page threw that away, so
 * a student aiming at Utrecht read all fourteen as advice about their own
 * application. Anything not universal now says where it applies, on the card.
 */
function scopeOf(appliesTo, site) {
  const codes = (appliesTo || []).filter(Boolean);
  if (!codes.length || codes.includes('all')) return null;

  // `site.destinations` is the reconciled catalogue: every Destination once,
  // including the ones with no country profile. Denmark is the reason this
  // cannot just read `site.countries` — it has no data/countries/dk.json, which
  // is exactly why the Denmark-specific actions were the ones that read as "DK".
  const names = new Map(
    (site.destinations || []).filter((d) => d.code && d.name).map((d) => [d.code, d.name])
  );

  const listed = codes.map((c) => names.get(c) || c.toUpperCase());
  const last = listed[listed.length - 1];
  const phrase = listed.length === 1 ? last : `${listed.slice(0, -1).join(', ')} and ${last}`;
  return `Applies to ${phrase}`;
}

export function prepare(site) {
  const data = site.preparation;
  if (!data) {
    return page({
      title: 'Preparing',
      path: '/prepare/',
      body: html`<section class="section"><div class="wrap">${STATE.empty('Preparation data is missing.')}</div></section>`,
    });
  }

  const groups = [
    { relevance: 'required', title: 'Decides whether you can apply', lede: 'Get one of these wrong and the rest does not matter. These are the things that create or destroy eligibility.' },
    { relevance: 'selection', title: 'Weighed when places are allocated', lede: 'These are read when more people qualify than there are places. None of them creates eligibility on its own.' },
    { relevance: 'preparation', title: 'Worth doing, with no effect on admission', lede: 'Nothing in this section will help you get in. It is here because it is genuinely worth your time, and because knowing it will not help you get in saves you a great deal of wasted effort.' },
  ];

  const byRelevance = (r) => data.actions.filter((a) => a.relevance === r);

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Planning',
  title: 'What you can actually do before you apply',
  lede: 'Three different things get muddled together under the word "preparation", and the difference between them is worth more than any of the advice.',
})}

<section class="section">
  <div class="wrap">
    ${crumbs([{ label: 'Preparing' }])}
    <div class="layout-aside">
      <div class="prose">
        ${md(data.framing)}

        ${note(
          Object.entries(data.relevanceKey)
            .map(([k, v]) => `- **${k === 'required' ? 'Officially required' : k === 'selection' ? 'Used in selection' : 'Useful preparation'}** — ${v}`)
            .join('\n'),
          { kind: 'accent', title: 'The three labels, in plain words' }
        )}

        ${groups.map((g) => {
          const actions = byRelevance(g.relevance);
          if (!actions.length) return '';
          return html`
          <h2 id="${g.relevance}">${g.title}</h2>
          <p class="lede">${g.lede}</p>
          ${actions.map((a) =>
            preparationPath({
              goal: a.goal,
              relevance: a.relevance,
              timing: a.timing,
              why: a.why,
              evidence: a.evidence || [],
              scope: scopeOf(a.appliesTo, site),
            })
          )}`;
        })}

        <h2 id="sources">Where the required items come from</h2>
        <p>Everything labelled <em>officially required</em> or <em>used in selection</em> above rests on a source
        you can open. The suggestions do not, because they are not claims about admission.</p>
        ${evidenceBlock({
          claim: 'The official requirements and selection factors on this page.',
          records: site.graph
            ? resolveEvidence(site.graph, [...new Set(data.actions.flatMap((a) => a.evidence || []))])
            : [],
          summary: 'Each of these is a page an admissions authority published. Open it and check it still says what we say it says.',
        })}
      </div>

      <aside class="layout-aside__side stack">
        ${stamp(data.dataAsOf)}
        <div class="card card--flat">
          <div class="card__body">
            <p class="eyebrow eyebrow--plain">In order</p>
            <ol style="margin:0;padding-left:1.2em;font-size:.9375rem;line-height:1.8">
              <li><a href="#required">What decides eligibility</a></li>
              <li><a href="#selection">What is weighed</a></li>
              <li><a href="#preparation">What is just worth doing</a></li>
            </ol>
          </div>
        </div>
        ${note(
          `Start from your subjects, not from a country. A gap in a subject level is the only kind this site
          can help you close, and it is the same gap almost everywhere. The subject checker works it out
          against Danish programmes — the conversion is Danish, but the subject levels it shows you are short
          of are the ones the rest of Europe asks for too.`,
          { kind: 'ok', title: 'Where to start' }
        )}
        <a class="btn btn--primary" href="${url('/planner/')}" style="width:100%;justify-content:center">Check my subjects</a>
        <a class="btn btn--quiet" href="${url('/timeline/')}" style="width:100%;justify-content:center">See the calendar</a>
      </aside>
    </div>
  </div>
</section>

<section class="section section--tinted section--rule">
  <div class="wrap wrap--prose">
    ${sectionHead({
      eyebrow: 'One honest summary',
      title: 'If you only remember one thing',
    })}
    <p class="lede">Your subject levels decide what you can apply for. Your grades decide how you do against
    other people who also qualify. Across most of continental Europe, almost everything else you have been
    told matters, does not.</p>
    <p><strong>Where that stops being true:</strong> the United States, Canada and the United Kingdom read
    essays, references and sustained activities as part of the decision, and Denmark's quota 2 reads
    documented work and other experience. If your list is mostly in those places, the third section below is
    not optional for you in the way it is for someone applying to the Netherlands or Germany. Every item on
    this page says where it applies.</p>
    <p>None of that is a reason to do less. It is a reason to do the things that matter for the right reasons:
    an Extended Essay because it tells you whether you like a subject, CAS because it is interesting. The
    worst outcome is a student who spent two years building an application portfolio for a system that was
    never going to read it — or one who assumed nobody reads it and applied to five places that do.</p>
  </div>
</section>`;

  return page({
    title: 'What you can do before you apply',
    description:
      'CAS, the Extended Essay, tests, portfolios and subject choices — clearly separated into what is officially required, what is weighed in selection, and what simply has no effect on admission.',
    path: '/prepare/',
    section: '/prepare/',
    body,
  });
}
