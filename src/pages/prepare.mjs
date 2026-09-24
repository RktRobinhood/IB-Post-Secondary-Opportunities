import { html, raw, md, plural } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import { hero, note, sectionHead, crumbs, stamp, sources, topic } from '../lib/components.mjs';
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
    { relevance: 'required', title: 'Decides whether you can apply', short: 'Decides', line: 'Get one wrong and nothing else matters.' },
    { relevance: 'selection', title: 'Weighed when places are allocated', short: 'Weighed', line: 'Counts only once you already qualify.' },
    { relevance: 'preparation', title: 'Worth doing — changes nothing', short: 'Changes nothing', line: 'Worth your time. Not your admission.' },
  ];

  const byRelevance = (r) => data.actions.filter((a) => a.relevance === r);
  const idOf = (a) => `prep-${data.actions.indexOf(a) + 1}`;

  /* The answer first, as a board: every action on the site, sorted into the
     three kinds, one line each. The reasoning for each is further down and
     one tap deep. This page used to open with a paragraph defining the three
     labels and then 2,100 words of cards; the board is the same information
     in the shape a student would draw it. */
  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Before you apply',
  title: 'What actually counts',
  lede: 'Some things decide whether you can apply. Some are weighed. The rest change nothing — however worthwhile.',
})}

<section class="section section--tight">
  <div class="wrap">
    <div class="board">
      ${groups.map(
        (g) => html`<section class="board__col" data-relevance="${g.relevance}" aria-labelledby="board-${g.relevance}">
          <header class="board__head">
            <span class="board__count">${byRelevance(g.relevance).length}</span>
            <h2 id="board-${g.relevance}">${g.short}</h2>
            <p>${g.line}</p>
          </header>
          <ol class="board__list">
            ${byRelevance(g.relevance).map((a) => html`<li><a href="#${idOf(a)}">${a.goal}</a></li>`)}
          </ol>
        </section>`
      )}
    </div>
    <p class="board__bottom"><strong>If you remember one thing:</strong> your subject levels decide what you can
      apply for; your grades decide how you do against everyone else who qualifies.</p>
  </div>
</section>

<section class="section section--tinted section--rule">
  <div class="wrap">
    ${crumbs([{ label: 'Preparing' }])}
    <div class="layout-aside">
      <div class="prose">
        ${groups.map((g) => {
          const actions = byRelevance(g.relevance);
          if (!actions.length) return '';
          return html`
          <h2 id="${g.relevance}">${g.title}</h2>
          ${actions.map((a) =>
            preparationPath({
              id: idOf(a),
              goal: a.goal,
              relevance: a.relevance,
              timing: a.timing,
              why: a.why,
              evidence: a.evidence || [],
              scope: scopeOf(a.appliesTo, site),
            })
          )}`;
        })}

        ${topic({
          id: 'exceptions',
          title: 'Where "changes nothing" stops being true',
          short: 'The US, Canada and the UK read essays, references and activities. Denmark\'s quota 2 reads documented work.',
          body: html`<p>If your list is mostly in those places, the third column is not optional for you in the way
            it is for someone applying to the Netherlands or Germany. Every item on this page says where it
            applies.</p>
            <p>None of that is a reason to do less. It is a reason to do the things that matter for the right
            reasons: an Extended Essay because it tells you whether you like a subject, CAS because it is
            interesting. The worst outcome is a student who spent two years building an application portfolio for
            a system that was never going to read it — or one who assumed nobody reads it and applied to five
            places that do.</p>
            ${md(data.framing)}`,
          more: 'The longer version',
        })}

        ${topic({
          id: 'sources',
          title: 'Where the required items come from',
          short: 'Everything marked required or weighed rests on a page an admissions authority published.',
          body: evidenceBlock({
            claim: 'The official requirements and selection factors on this page.',
            records: site.graph
              ? resolveEvidence(site.graph, [...new Set(data.actions.flatMap((a) => a.evidence || []))])
              : [],
            summary: 'Open each one and check it still says what we say it says.',
          }),
          more: 'The sources',
        })}
      </div>

      <aside class="layout-aside__side stack">
        ${stamp(data.dataAsOf)}
        ${note(
          `Start from your subjects, not from a country. A missing subject level is the gap that closes doors, and
          it is the same gap almost everywhere.`,
          { kind: 'ok', title: 'Where to start' }
        )}
        <a class="btn btn--primary" href="${url('/planner/')}" style="width:100%;justify-content:center">Check my subjects</a>
        <a class="btn btn--quiet" href="${url('/timeline/')}" style="width:100%;justify-content:center">See the calendar</a>
      </aside>
    </div>
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
