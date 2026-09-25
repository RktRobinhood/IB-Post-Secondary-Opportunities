import { html, plural } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import { hero } from '../lib/components.mjs';
import { entryAward, ENTRY_AWARD } from '../lib/eligibility.mjs';

/**
 * /guides/course-results/: what DP Course Results open, country by country and
 * programme by programme.
 *
 * Everything here is read from the records. Each Destination contributes its
 * `ibRecognition.courseResults` sentence and, where the country offers one to
 * everybody, its `nationalRoute`. Each Opportunity contributes its award state
 * (`entryAward`) and the one-sentence `alternativeRouteSummary` of its route
 * without the Diploma. Programmes whose routes read the same share one line.
 * The long route text stays on each programme's own page, where it applies.
 * A Destination with Opportunities and no sentence still gets its list; one
 * with no Opportunities is not here.
 */

/** The rule a source writes about the Diploma or Course Results, if any. */
export const awardRule = (p) =>
  (p.requirements || []).filter((r) => r.mandatory !== false).find((r) => r.kind === 'ib-diploma' || r.kind === 'ib-course-results');

/**
 * What a list of many programmes says about one programme's award, in a few
 * words. "Diploma, or another route" only where the record says a route
 * without the Diploma is open without waiting for an age.
 */
export function awardLabel(p) {
  const award = entryAward(p);
  if (award === ENTRY_AWARD.COURSE_RESULTS_ACCEPTED) return { label: 'Accepts Course Results', cls: 'tag--ok' };
  if (award === ENTRY_AWARD.NOT_ESTABLISHED) return { label: 'Award not established', cls: 'tag--warn' };
  return awardRule(p)?.alternativeRouteSummary?.reachesAtEighteen
    ? { label: 'Diploma, or another route', cls: 'tag--sand' }
    : { label: 'Asks for the full Diploma', cls: '' };
}

export function courseResultsGuide(site) {
  const instById = new Map(site.institutionCatalogue.all.map((i) => [i.id, i]));
  const code = (p) => (typeof p.destination === 'object' ? p.destination?.code : p.destination) || '';
  const instName = (p) => instById.get(p.institutionId)?.name || p.institutionName;

  const sections = (site.destinations || [])
    .map((c) => {
      const programmes = site.programmes.filter((p) => code(p) === c.code);
      if (!programmes.length) return null;
      const byInst = new Map();
      for (const p of [...programmes].sort((a, b) => instName(a).localeCompare(instName(b)) || a.name.localeCompare(b.name))) {
        byInst.set(instName(p), [...(byInst.get(instName(p)) || []), p]);
      }
      const routes = new Map();
      for (const p of programmes) {
        const s = awardRule(p)?.alternativeRouteSummary?.short;
        if (s) routes.set(s, [...(routes.get(s) || []), p]);
      }
      const accepted = programmes.filter((p) => entryAward(p) === ENTRY_AWARD.COURSE_RESULTS_ACCEPTED).length;
      return { c, programmes, byInst, routes, accepted };
    })
    .filter(Boolean)
    .sort((a, b) => b.programmes.length - a.programmes.length);

  const total = sections.reduce((n, s) => n + s.programmes.length, 0);
  const accepted = sections.reduce((n, s) => n + s.accepted, 0);

  /* "Aalborg University (4)", or the degree's own name when it is the only one. */
  const who = (list) => {
    const insts = [...new Set(list.map(instName))];
    return list.length === 1 ? `${list[0].name}, ${insts[0]}` : insts.length === 1 ? `${insts[0]}, ${plural(list.length, 'degree')}` : `${plural(list.length, 'degree')} at ${plural(insts.length, 'institution')}`;
  };

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Guide',
  title: 'DP Course Results',
  lede: 'What the IB awards for separate subjects when you do not get the full Diploma, and which degrees here take it.',
})}

<section class="section section--tight">
  <div class="wrap">
    <p class="cr__sum">${accepted} of ${plural(total, 'degree')} on this site accept Course Results.
      <a href="${url(`/?award=${ENTRY_AWARD.COURSE_RESULTS_ACCEPTED}#discover`)}">Show them in Find a degree</a>.</p>

    ${sections.map(
      (s) => html`<section class="cr" aria-labelledby="cr-${s.c.code}">
        <h2 id="cr-${s.c.code}">${s.c.name}</h2>
        ${s.c.ibRecognition?.courseResults?.short ? html`<p class="cr__short">${s.c.ibRecognition.courseResults.short}</p>` : ''}
        ${s.c.ibRecognition?.courseResults?.nationalRoute ? html`<p class="cr__national">${s.c.ibRecognition.courseResults.nationalRoute}</p>` : ''}
        ${s.routes.size
          ? html`<details class="cr__routes">
              <summary>Without the Diploma: what ${plural([...s.routes.values()].flat().length, 'degree')} say</summary>
              <ul class="cr__route-list">
                ${[...s.routes.entries()].map(
                  ([short, list]) => html`<li><strong>${who(list)}.</strong> ${short}
                    <span class="cr__applies">${list.map((p, i) => html`${i ? ', ' : ''}<a href="${url(p.href)}#fine-print">${p.name}</a>`)}</span></li>`
                )}
              </ul>
            </details>`
          : ''}
        <div class="table-scroll">
          <table class="data cr__table">
            <caption>${s.accepted} of ${s.programmes.length} accept Course Results</caption>
            <thead><tr><th scope="col">Degree</th><th scope="col">IB award</th></tr></thead>
            ${[...s.byInst.entries()].map(([name, list]) => html`<tbody>
              <tr class="cr__inst"><th scope="colgroup" colspan="2">${name}</th></tr>
              ${list.map((p) => {
                const b = awardLabel(p);
                return html`<tr><td><a href="${url(p.href)}">${p.name}</a>${p.degree ? html` <span class="cr__degree">${p.degree}</span>` : ''}</td><td><span class="tag ${b.cls}">${b.label}</span></td></tr>`;
              })}
            </tbody>`)}
          </table>
        </div>
      </section>`
    )}
  </div>
</section>`;

  return page({
    title: 'DP Course Results: which degrees accept them',
    description: `Which English-taught degrees accept IB DP Course Results instead of the full Diploma, country by country.`,
    path: '/guides/course-results/',
    section: '/prepare/',
    body,
  });
}
