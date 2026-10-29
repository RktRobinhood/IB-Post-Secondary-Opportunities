import { html, plural } from './html.mjs';
import { url } from './layout.mjs';
import { isEnglishStudyOption } from './schools.mjs';

/** A shared country projection: provider access details never enter the UI. */
export function nationalSources(site, country, institutions) {
  const sources = (site.externalSources?.sources || []).filter((s) => s.country === country);
  if (!sources.length) return null;
  const snapshots = site.externalCatalogues || {};
  const imported = sources.flatMap((source) => {
    const snapshot = snapshots[source.id];
    if (!snapshot) return [];
    const visible = new Map(institutions.filter(isEnglishStudyOption).map((i) => [i.key || i.id, i]));
    const groups = Object.entries(snapshot.institutions || {}).flatMap(([key, rec]) => {
      const inst = visible.get(key);
      return inst && rec.programmes?.length ? [{ name: inst.name, href: `${inst.href}#national-catalogue`, count: rec.programmes.length }] : [];
    });
    if (!groups.length) return [];
    return [{ source: source.name, year: snapshot.intakeYear, season: snapshot.season,
      asOf: snapshot.retrievedAt, count: groups.reduce((n, g) => n + g.count, 0), groups }];
  });
  return { sources, imported };
}

export function nationalSourcesPanel(data) {
  if (!data?.sources?.length) return '';
  return html`<details class="topic__more" id="national-catalogues" data-national-sources>
    <summary>National course catalogues</summary>
    <div class="topic__body">
      ${data.sources.map((s) => html`<p><a href="${s.url}" rel="noopener nofollow">${s.name}<span aria-hidden="true"> ↗</span></a>${s.language !== 'English' ? ` · In ${s.language}` : ''}<br>${s.summary}${s.note ? html`<br><small>${s.note}</small>` : ''}<br><small>${s.publisher}</small></p>`)}
      ${data.imported.map((s) => html`<details class="topic__more" data-national-import="${s.source}">
        <summary>${plural(s.count, 'course listing')} · ${s.source} · ${s.season === 'autumn' ? 'Autumn' : 'Spring'} ${s.year}</summary>
        <div class="topic__body"><p>English-taught bachelor's · As of ${s.asOf}</p>
        <ul>${s.groups.map((g) => html`<li><a href="${url(g.href)}">${g.name}</a> · ${g.count}</li>`)}</ul></div>
      </details>`)}
    </div>
  </details>`;
}
