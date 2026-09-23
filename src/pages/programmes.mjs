import { html, raw, md, plural, truncate, listSentence } from '../lib/html.mjs';
import { page, url, SITE } from '../lib/layout.mjs';
import {
  hero, card, note, stats, facts, sources, crumbs, sectionHead,
  stamp, dataTable, emptyState, pager, tags, requirementLine, freshness,
} from '../lib/components.mjs';
import { picture } from '../lib/data.mjs';
import { evidenceStatus, resolveEvidence } from '../lib/canonical.mjs';
import { evidenceBlock, preparationPath, filterQuestion, deadlineList, worldWindow } from '../lib/primitives.mjs';
import { allEvents } from '../lib/calendar.mjs';

/* --- A Danish institution -------------------------------------------------- */

/**
 * Further pictures of a university: its own programme pages' photographs.
 *
 * These are worth more than four more shots of the same facade — a university
 * publishes a different picture for Chemical Engineering than for European
 * Studies, and between them they say what the place is actually like to study
 * at. Free, too: the programme pages already carry them.
 */
function universitySlides(site, inst, max = 4) {
  const own = picture(site, inst.id);
  const out = [];

  // Further photographs of the institution itself, where they were collected:
  // a different building, a different season, the same place from the other
  // side. These come first because they are of the university, not of one
  // department's marketing.
  const key = inst.id.replace(/^[a-z]{2}-/, '');
  for (const g of site.images?.[key]?.gallery || site.images?.[inst.id]?.gallery || []) {
    if (out.length >= max) break;
    if (g.review?.state === 'rejected') continue;
    out.push({
      rawSrc: g.src,
      src: url(g.src),
      caption: inst.shortName || inst.name,
      credit: { text: `${g.author || 'Unknown'} · ${g.licence || 'Wikimedia Commons'}`, url: g.page },
    });
  }

  for (const p of inst.programmes) {
    if (out.length >= max) break;
    const pic = picture(site, p.id);
    if (!pic?.src || pic.src === own?.src) continue;
    if (out.some((s) => s.rawSrc === pic.src)) continue;
    out.push({
      rawSrc: pic.src,
      src: pic.external ? pic.src : url(pic.src),
      caption: p.name,
      credit: pic.credit || null,
    });
  }
  return out.map(({ rawSrc, ...slide }) => slide);
}

export function university(site, inst, { prev, next }) {
  const pic = picture(site, inst.id);
  const byField = new Map();
  for (const p of inst.programmes) {
    const f = p.field || 'Other';
    if (!byField.has(f)) byField.set(f, []);
    byField.get(f).push(p);
  }

  const body = html`
${hero({
  eyebrow: `${inst.city}${inst.type ? ` · ${inst.type}` : ''}`,
  title: inst.name,
  lede: inst.about,
  image: pic ? { src: pic.src, alt: pic.alt, credit: pic.credit, focal: '50% 45%' } : null,
  slides: pic ? universitySlides(site, inst) : [],
  variant: pic ? undefined : 'panel',
})}

<section class="section">
  <div class="wrap">
    ${crumbs([
      { href: '/denmark/', label: 'Denmark' },
      { href: '/universities/', label: 'Universities' },
      { label: inst.shortName || inst.name },
    ])}

    <div class="layout-aside">
      <div class="prose">
        ${inst.programmes.length === 0
          ? note(
              `No fully English-taught bachelor programmes are listed here for 2027 entry. That does not
              mean you cannot study here — it means you would need Danish at A level, or the Studieprøven
              language test, and would apply to the Danish-taught programmes instead.`,
              { kind: 'warn', title: 'Nothing in English' }
            )
          : ''}

        ${(inst.ibNotes || []).length
          ? html`<h2 id="ib">What this institution asks of IB students</h2>
              <ul>${inst.ibNotes.map((n) => html`<li>${n}</li>`)}</ul>`
          : ''}

        ${inst.quotaNotes
          ? html`<h2 id="quota">How it runs quota 2</h2>${md(inst.quotaNotes)}`
          : ''}

        ${(inst.notes || []).length
          ? html`<h2 id="notes">Worth knowing</h2>
              <ul>${inst.notes.map((n) => html`<li>${n}</li>`)}</ul>`
          : ''}

        ${inst.programmes.length
          ? html`<h2 id="programmes">English-taught programmes</h2>
              ${[...byField.entries()]
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(
                  ([field, list]) => html`
                  <h3>${field}</h3>
                  <ul class="prog-list">
                    ${list
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((p) => programmeRow(p))}
                  </ul>`
                )}`
          : ''}

        ${sources(inst.sources)}
      </div>

      <aside class="layout-aside__side stack">
        ${stamp(inst.dataAsOf)}
        ${facts([
          { label: 'City', value: inst.city },
          { label: 'Campuses', value: (inst.campuses || []).join(', ') || null },
          { label: 'Founded', value: inst.founded ? String(inst.founded) : null },
          { label: 'Students', value: inst.students ? inst.students.toLocaleString('en-GB') : null },
          { label: 'IB results code', value: inst.ibisCode },
          { label: 'Tuition, non-EU', value: inst.tuitionNonEu },
          {
            label: 'Links',
            value: html`<ul style="list-style:none;padding:0;margin:0">
              ${inst.website ? html`<li><a href="${inst.website}" rel="noopener nofollow">Main site</a></li>` : ''}
              ${inst.admissionsUrl ? html`<li><a href="${inst.admissionsUrl}" rel="noopener nofollow">Admissions</a></li>` : ''}
              ${inst.ibPageUrl ? html`<li><a href="${inst.ibPageUrl}" rel="noopener nofollow">Its IB page</a></li>` : ''}
            </ul>`,
          },
        ])}
        ${(inst.knownFor || []).length ? html`<div><p class="eyebrow eyebrow--plain">Known for</p>${tags(inst.knownFor, 'tag--brand')}</div>` : ''}
        ${(inst.deadlines || []).length
          ? html`<div><p class="eyebrow eyebrow--plain">Deadlines</p>
              <ul style="list-style:none;padding:0;margin:0;font-size:.875rem;line-height:1.8">
                ${inst.deadlines.map((d) => html`<li><strong>${d.date}</strong>${d.time ? ` ${d.time}` : ''} — ${d.label}</li>`)}
              </ul></div>`
          : ''}
      </aside>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">${pager({ prev, next })}</div>
</section>`;

  return page({
    title: inst.name,
    description: truncate(inst.about || `${inst.name} — English-taught bachelor programmes and entry requirements for IB students.`, 155),
    path: inst.href,
    section: '/denmark/',
    body,
  });
}

function programmeRow(p) {
  const req = requirementLine(p.entryRequirements) || p.requirementsText;
  return html`<li class="prog">
    <div>
      <h4 class="prog__name"><a href="${url(p.href)}">${p.name}</a></h4>
      <p class="prog__meta">
        ${[p.degree, p.ects ? `${p.ects} ECTS` : null, p.years ? `${p.years} years` : null, p.campus]
          .filter(Boolean)
          .map((m) => html`<span>${m}</span>`)}
      </p>
      ${p.summary ? html`<p class="prog__req">${truncate(p.summary, 180)}</p>` : ''}
    </div>
    <div class="prog__side">
      ${req ? html`<p class="prog__req"><strong>Requires:</strong> ${truncate(req, 150)}</p>` : ''}
      ${p.restrictedAdmission ? html`<p>${tags(['Restricted admission'], 'tag--warn')}</p>` : ''}
      ${p.quota1Cutoff?.gpa ? html`<p><small>Quota 1 cut-off ${p.quota1Cutoff.gpa}${p.quota1Cutoff.year ? ` (${p.quota1Cutoff.year})` : ''}</small></p>` : ''}
    </div>
  </li>`;
}

/* --- Universities index ---------------------------------------------------- */

export function universitiesIndex(site) {
  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Denmark',
  title: 'Danish institutions',
  lede: 'Every institution on this site that teaches at least some of its undergraduate degrees in English — and the ones that do not, so you know.',
})}
<section class="section">
  <div class="wrap">
    ${crumbs([{ href: '/denmark/', label: 'Denmark' }, { label: 'Universities' }])}
    ${site.dkInstitutions.length
      ? html`<div class="grid grid--3">
          ${site.dkInstitutions
            .slice()
            .sort((a, b) => b.programmes.length - a.programmes.length || a.name.localeCompare(b.name))
            .map((i) => {
              const p = picture(site, i.id);
              return card({
                href: i.href,
                title: i.shortName ? `${i.shortName} — ${i.name}` : i.name,
                text: i.about,
                image: p ? { src: p.src, alt: p.alt } : null,
                placeholder: i.shortName || i.name,
                meta: [i.city, plural(i.programmes.length, 'English-taught programme')],
              });
            })}
        </div>`
      : emptyState('Institution data has not been built yet.')}
  </div>
</section>`;

  return page({
    title: 'Danish institutions',
    description: 'Danish universities, university colleges and academies with English-taught undergraduate programmes.',
    path: '/universities/',
    section: '/denmark/',
    body,
  });
}

/* --- A single programme ---------------------------------------------------- */

export function programme(site, p, inst) {
  const pic = picture(site, p.id) || picture(site, inst.id);
  const req = p.entryRequirements;
  const opp = site.graph?.opportunities?.get(p.opportunityId || p.id);
  const ev = site.graph ? evidenceStatus(site.graph, opp?.evidence) : null;
  const route = site.graph?.applicationRoutes?.get((opp?.applicationRoutes || [])[0]);
  const provisionalDates = (route?.milestones || []).filter((m) => m.provisional).length;

  const body = html`
${hero({
  variant: 'compact',
  eyebrow: `${inst.shortName || inst.name}${p.campus ? ` · ${p.campus}` : ''}`,
  title: p.name,
  lede: p.summary,
  image: pic ? { src: pic.src, alt: pic.alt, credit: pic.credit } : null,
})}

<section class="section">
  <div class="wrap">
    ${crumbs([
      { href: '/denmark/', label: 'Denmark' },
      { href: '/programmes/', label: 'Programmes' },
      { href: inst.href, label: inst.shortName || inst.name },
      { label: p.name },
    ])}

    <div class="layout-aside">
      <div class="prose">
        ${ev
          ? freshness({
              intake: opp?.intake,
              checkedAt: ev.checkedAt || opp?.meta?.dataAsOf,
              level: ev.level,
              provisional: provisionalDates,
            })
          : ''}

        <h2 id="requirements">Entry requirements</h2>
        ${req
          ? html`
            ${req.all?.length
              ? html`<h3>You need all of these</h3>
                  <ul class="ticks">
                    ${req.all.map(
                      (r) => html`<li><strong>${r.subject} ${r.level}</strong>${r.minGrade ? ` — minimum Danish grade ${r.minGrade}` : ''}</li>`
                    )}
                  </ul>`
              : ''}
            ${req.oneOf?.length
              ? html`<h3>And one of these combinations</h3>
                  <ul>
                    ${req.oneOf.map(
                      (group) => html`<li>${group.map((r, n) => html`${n ? ' + ' : ''}<strong>${r.subject} ${r.level}</strong>${r.minGrade ? ` (min ${r.minGrade})` : ''}`)}</li>`
                    )}
                  </ul>`
              : ''}`
          : ''}
        ${p.requirementsText
          ? note(p.requirementsText, { title: 'In the university\'s own words' })
          : req
            ? ''
            : emptyState('No entry requirements have been recorded for this programme yet.')}

        ${(p.extraRequirements || []).length
          ? html`<h3>On top of the subjects</h3>
              <ul>${p.extraRequirements.map((x) => html`<li>${x}</li>`)}</ul>`
          : ''}

        ${p.restrictedAdmission
          ? note(
              `This programme has restricted admission, so meeting the requirements does not guarantee a place.
              ${p.quota1Cutoff?.gpa ? `The most recently published quota 1 cut-off was a Danish average of **${p.quota1Cutoff.gpa}**${p.quota1Cutoff.year ? ` for ${p.quota1Cutoff.year}` : ''}.` : ''}
              Cut-offs move every year and the national policy is cutting intake, so treat any published figure
              as a floor rather than a target.`,
              { kind: 'warn', title: 'Restricted admission' }
            )
          : note(
              `As recorded here, this programme does not have restricted admission — everyone who meets the
              entry requirements is admitted. Confirm on the university's own page before you rely on it.`,
              { kind: 'ok', title: 'Open admission' }
            )}

        <h2 id="what">What it is</h2>
        ${p.summary ? md(p.summary) : ''}
        ${facts([
          { label: 'Degree', value: p.degree },
          { label: 'Length', value: p.years ? `${p.years} years${p.ects ? `, ${p.ects} ECTS` : ''}` : p.ects ? `${p.ects} ECTS` : null },
          { label: 'Taught in', value: p.language || 'English' },
          { label: 'Campus', value: p.campus },
          { label: 'Starts', value: p.startMonth },
          { label: 'Field', value: p.field },
        ])}

        ${route?.milestones?.length
          ? html`<h2 id="deadlines">Deadlines for this intake</h2>
              <ul class="timeline">
                ${route.milestones
                  .filter((m) => ['submit', 'signature', 'document', 'result', 'reply'].includes(m.type))
                  .map(
                    (m) => html`<li data-date="${m.date || ''}"${m.provisional ? raw(' data-provisional="true"') : ''}>
                      <div class="timeline__when">${m.date || 'Date not published'}${m.timeOfDay ? html`<br>${m.timeOfDay} ${m.timeZone || ''}` : ''}</div>
                      <div class="timeline__what">
                        <h4>${m.label}</h4>
                        ${m.note ? md(m.note) : ''}
                        ${m.consequence === 'hard' ? html`<p><small>Missing this closes the door for this intake.</small></p>` : ''}
                      </div>
                    </li>`
                  )}
              </ul>`
          : ''}

        ${evidenceBlock({
          claim: `Entry requirements and admission rules for ${p.name}.`,
          records: site.graph ? resolveEvidence(site.graph, opp?.evidence) : [],
          summary: 'Open this to see the exact page each rule came from, when it was read, and whether a person has checked it.',
        })}

        <h2 id="check">Does your IB fit?</h2>
        <p>The subject checker converts your six IB subjects into Danish levels and tells you whether they
        satisfy this programme, and if not, exactly what is missing.</p>
        <p><a class="btn btn--primary" href="${url('/planner/')}">Check my subjects</a></p>

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
          { label: 'Apply by', value: '15 March 2027, 12:00 CET' },
          { label: 'Apply at', value: '[optagelse.dk](https://www.optagelse.dk)' },
        ])}
        ${note(
          `Requirements change between admission years. Before you apply, open the official page and check that
          what it says still matches what you see here.`,
          { kind: 'warn', title: 'Always verify' }
        )}
      </aside>
    </div>
  </div>
</section>`;

  return page({
    title: `${p.name} — ${inst.shortName || inst.name}`,
    description: truncate(p.summary || `${p.name} at ${inst.name}: entry requirements for IB students, taught in English.`, 155),
    path: p.href,
    section: '/denmark/',
    body,
  });
}

/* --- Programme explorer ---------------------------------------------------- */

export function programmesIndex(site) {
  const fields = [...new Set(site.programmes.map((p) => p.field).filter(Boolean))].sort();
  const institutions = site.dkInstitutions
    .filter((i) => i.programmes.length)
    .map((i) => ({ id: i.id, name: i.shortName || i.name }));
  const campuses = [...new Set(site.programmes.map((p) => p.campus).filter(Boolean))].sort();

  // Places the map can light up, joined to the programmes that sit there.
  const placeIndex = {};
  for (const p of site.programmes) {
    if (!p.placeId) continue;
    const place = site.graph?.places?.get(p.placeId);
    if (!place) continue;
    placeIndex[p.placeId] ||= {
      id: place.id,
      name: place.name,
      lat: place.coordinates.lat,
      lon: place.coordinates.lon,
      precision: place.coordinatePrecision,
      character: place.character || null,
    };
  }

  const index = site.programmes.map((p) => ({
    id: p.id,
    name: p.name,
    href: p.href,
    institutionId: p.institutionId,
    institution: p.institutionName,
    field: p.field || 'Other',
    campus: p.campus || '',
    placeId: p.placeId || '',
    degree: p.degree || '',
    ects: p.ects || null,
    restricted: !!p.restrictedAdmission,
    cutoff: p.quota1Cutoff?.gpa || null,
    summary: truncate(p.summary || '', 170),
    requirements: requirementLine(p.entryRequirements) || truncate(p.requirementsText || '', 150),
    entry: p.entryRequirements || null,
    search: [p.name, p.institutionName, p.field, p.campus, p.degree, p.summary].filter(Boolean).join(' ').toLowerCase(),
  }));

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Denmark',
  title: 'Every English-taught programme',
  lede: `${plural(site.programmes.length, 'undergraduate degree')} you can take in English in Denmark. Filter them, or follow the map — both show the same set.`,
})}

<section class="section section--tight">
  <div class="wrap wrap--wide">
    ${crumbs([{ href: '/denmark/', label: 'Denmark' }, { label: 'Programmes' }])}

    <div id="prog-map">
      ${worldWindow({
        places: Object.values(placeIndex).map((p) => ({
          ...p,
          href: '#prog-results',
          count: site.programmes.filter((x) => x.placeId === p.id).length,
        })),
        id: 'explorer-map',
        activeLayer: 'Places with matching programmes',
        caption: 'Choose a place to filter to it. The list below is the same set either way.',
      })}
    </div>

    <form class="filters" id="prog-filters" role="search" aria-label="Filter programmes">
      <div class="filters__row">
        <div class="field filter-q" data-field="q">
          <label for="f-q">Search for anything</label>
          <input type="search" id="f-q" data-filter="q" placeholder="engineering, Odense, data…" autocomplete="off">
        </div>
        ${filterQuestion({
          id: 'f-field',
          question: 'What do you want to study?',
          field: 'field',
          options: fields.map((f) => ({ value: f, label: f })),
        })}
        ${filterQuestion({
          id: 'f-inst',
          question: 'Anywhere in particular?',
          field: 'inst',
          options: institutions.map((i) => ({ value: i.id, label: i.name })),
        })}
        ${filterQuestion({
          id: 'f-campus',
          question: 'Which city?',
          field: 'campus',
          options: campuses.map((c) => ({ value: c, label: c })),
        })}
      </div>
      <div class="chips">
        <button type="button" class="chip" id="f-open" aria-pressed="false">Open admission only</button>
        <button type="button" class="chip" id="f-nomath" aria-pressed="false">No Mathematics A</button>
        <button type="button" class="chip" id="f-reset">Clear filters</button>
      </div>
    </form>

    <div class="shell__bar">
      <p class="result-count" id="prog-count" role="status" aria-live="polite" style="margin:0"></p>
      <ul class="shell__active" id="prog-active" aria-label="Active filters"></ul>
    </div>

    <ul class="prog-list" id="prog-results"></ul>
    <noscript>
      <p class="empty">Filtering needs JavaScript. Every programme is also listed on its institution's page —
      see <a href="${url('/universities/')}">Danish institutions</a>.</p>
    </noscript>
  </div>
</section>

<script type="application/json" id="programme-data">${raw(JSON.stringify(index))}</script>
<script type="application/json" id="place-data">${raw(JSON.stringify(placeIndex))}</script>`;

  return page({
    title: 'Find a degree in Denmark',
    description: 'Search every English-taught undergraduate programme in Denmark by field, institution, city and entry requirements.',
    path: '/programmes/',
    section: '/programmes/',
    body,
    scripts: ['explorer.js'],
  });
}

/* --- Subject planner -------------------------------------------------------- */

export function planner(site) {
  const subjects = site.ibSubjects || [];

  const groups = [];
  for (const subject of subjects) {
    let g = groups.find((x) => x.name === subject.group);
    if (!g) { g = { name: subject.group, items: [] }; groups.push(g); }
    g.items.push(subject);
  }

  // The engine runs in the browser against the same canonical records the build
  // uses, so a result shown to a student is never a second implementation.
  const opportunities = [...(site.graph?.opportunities?.values() || [])].map((o) => {
    const prog = site.graph.programmes.get(o.programme) || {};
    const inst = site.graph.institutions.get(o.institution) || {};
    const place = site.graph.places.get(o.place);
    return {
      id: o.id,
      destination: o.destination,
      intake: o.intake,
      meta: o.meta,
      evidence: o.evidence || [],
      requirements: o.requirements || [],
      admission: o.admission || {},
      officialRequirementsText: o.officialRequirementsText || [],
      display: {
        name: prog.name || o.id,
        href: `/programmes/${o.id}/`,
        institution: inst.shortName || inst.name || '',
        institutionHref: `/universities/${inst.id}/`,
        campus: place?.name || '',
        field: prog.field?.primary || 'other',
        degree: prog.credential?.title || '',
        official: prog.links?.official || null,
      },
    };
  });

  /* The Recognition Schemes the catalogue on this page actually needs. A
     requirement written in IB terms consults none of them; one written on a
     local scale names that scale and is translated through the scheme that
     defines it. Where the whole catalogue sits behind a single scheme, its
     grade tables also drive the "your total converts to" panel — with two, that
     panel is asking about a jurisdiction nobody named and is left empty rather
     than guessing one. */
  const destinations = new Set(opportunities.map((o) => o.destination).filter(Boolean));
  const schemes = (site.recognitionSchemes || []).filter((s) => destinations.has(s.destination));
  const soleScheme = schemes.length === 1 ? schemes[0] : null;

  const evidenceIndex = Object.fromEntries(
    [...(site.graph?.evidence?.values() || [])].map((e) => [
      e.id,
      { state: e.verificationState, retrievedAt: e.retrievedAt, reviewBy: e.meta?.reviewBy || null, url: e.sourceUrl, publisher: e.publisher, conflicts: (e.conflictsWith || []).length },
    ])
  );

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: 'Tool',
  title: 'Will my subjects get me in?',
  lede: 'Enter the six subjects on your IB Diploma and the level you are taking each at. This converts them using the Danish Agency\'s official table, then checks them against every English-taught programme in Denmark — and shows its reasoning for each one.',
})}

<section class="section">
  <div class="wrap wrap--wide">
    <div class="layout-aside layout-aside--left">
      <aside class="layout-aside__side">
        <form class="picker" id="picker" aria-label="Your IB subjects">
          <p class="eyebrow eyebrow--plain">Your six subjects</p>
          ${[1, 2, 3, 4, 5, 6].map(
            (n) => html`
            <div class="picker__slot">
              <span class="picker__num">${n}</span>
              <select aria-label="Subject ${n}" data-slot="${n}" class="p-subject">
                <option value="">Choose a subject…</option>
                ${groups.map(
                  (g) => html`<optgroup label="${g.name}">
                    ${g.items.map((x) => html`<option value="${x.id}">${x.name}</option>`)}
                  </optgroup>`
                )}
              </select>
              <select aria-label="Level for subject ${n}" data-slot="${n}" class="p-level">
                <option value="HL">HL</option>
                <option value="SL">SL</option>
              </select>
              <select aria-label="Grade for subject ${n}" data-slot="${n}" class="p-grade">
                <option value="">Grade</option>
                ${[7, 6, 5, 4, 3, 2, 1].map((g) => html`<option value="${g}">${g}</option>`)}
              </select>
            </div>`
          )}
          <div class="field">
            <label for="p-total">Predicted total, including the TOK and EE bonus</label>
            <input type="number" id="p-total" min="18" max="45" step="1" placeholder="e.g. 34" inputmode="numeric">
          </div>
          <div class="field">
            <label for="p-group">Your fee status</label>
            <select id="p-group">
              <option value="eu-eea-ch">EU, EEA or Swiss citizen</option>
              <option value="non-eu">Outside the EU/EEA</option>
              <option value="">Prefer not to say</option>
            </select>
          </div>
          <div class="chips">
            <button type="button" class="chip" id="p-reset">Clear and start again</button>
          </div>
          <p style="font-size:.8125rem;color:var(--ink-mute);margin:0">
            Nothing here leaves your browser. It is stored on this device only, and the button above erases it.
          </p>
        </form>
        <div class="converted" id="p-converted" role="status" aria-live="polite">
          Your Danish levels will appear here.
        </div>
      </aside>

      <div>
        <p class="result-count" id="p-count" role="status" aria-live="polite">
          Choose at least two subjects to see where you stand.
        </p>
        <div class="chips" style="margin-bottom:var(--s5)">
          <button type="button" class="chip" data-show="meets" aria-pressed="true">Meets requirements</button>
          <button type="button" class="chip" data-show="possible-with-action" aria-pressed="true">Possible with action</button>
          <button type="button" class="chip" data-show="needs-review" aria-pressed="true">Needs review</button>
          <button type="button" class="chip" data-show="does-not-currently-meet" aria-pressed="false">Does not currently meet</button>
        </div>
        <ul class="prog-list" id="p-results"></ul>
        <noscript>
          <p class="state state--empty">The subject checker needs JavaScript, because it runs entirely in your
          browser — that is also why nothing you type is sent anywhere. Without it, every programme and its
          exact entry requirements are still listed under
          <a href="${url('/programmes/')}">Find a degree</a>, and the conversion tables are on the
          <a href="${url('/denmark/ib-conversion/')}">conversion page</a>.</p>
        </noscript>

        ${note(
          `Four outcomes, and they mean exactly what they say. **Meets published requirements** means every
          recorded mandatory rule is satisfied for the 2027 intake. **Possible with action** means one rule is
          not met but could plausibly be before the deadline. **Does not currently meet** means more than one
          rule is unmet. **Needs review** means the data is missing, unverified, or the rule is one no tool can
          check — an essay, an interview, a language document.`,
          { title: 'What the four outcomes mean' }
        )}

        ${note(
          `This checks published requirements. It does not predict whether you will be offered a place — for
          programmes with restricted admission, meeting the requirements is where the competition starts, not
          where it ends. Past cut-offs are shown as context and are never used as a rule.`,
          { kind: 'warn', title: 'What this cannot tell you' }
        )}
      </div>
    </div>
  </div>
</section>

<script type="application/json" id="planner-subjects">${raw(JSON.stringify({ subjects, schemes }))}</script>
<script type="application/json" id="planner-opportunities">${raw(JSON.stringify(opportunities))}</script>
<script type="application/json" id="planner-evidence">${raw(JSON.stringify(evidenceIndex))}</script>
<script type="application/json" id="planner-conversion">${raw(
    JSON.stringify({
      average: soleScheme?.gradeConversion?.average?.table || [],
      single: soleScheme?.gradeConversion?.single?.table || [],
    })
  )}</script>`;

  return page({
    title: 'Check my subjects',
    description:
      'Enter your IB subjects, levels and grades to see which English-taught Danish degrees you meet the published requirements for — with the reasoning for every rule.',
    path: '/planner/',
    section: '/planner/',
    body,
    scripts: ['planner.js'],
  });
}


/* --- The calendar ----------------------------------------------------------- */

/**
 * Every dated event on the site, scoped by default to what the student is
 * actually interested in.
 *
 * This page used to hold a hard-coded array of eighteen events. Two things were
 * wrong with that, and the second is the worse one (#13).
 *
 * It was **not derived from the data**. Every country record already carried
 * `application.deadlines[]`, the country pages already rendered them, and this
 * page duplicated a hand-picked subset of the same facts in a second place with
 * no source field and no Verification State. It could drift from the country
 * pages and nothing would catch it. It now reads the same model they do, so a
 * date can only be wrong in one place.
 *
 * And it was **shown in full to everyone**. For a student looking at Denmark
 * and the Netherlands, eleven of the eighteen entries were noise; for a student
 * who had chosen nothing, all of it was. A combined calendar is the right thing
 * to have and the wrong thing to make the only view.
 *
 * ## Why the scoping happens in the browser
 *
 * Every event is rendered into the page and the browser hides what is out of
 * scope. That is the opposite of what a server would normally do, and it is
 * deliberate: the signals that decide the scope — the Exploration List, the
 * compare selection, the Student Profile — live in `localStorage` and are never
 * sent anywhere, which is the promise the subject checker makes in as many
 * words. A server that scoped this page would have to be told what a student is
 * interested in.
 *
 * It also means the no-JavaScript fallback is the *complete* calendar rather
 * than an empty one. A student without JavaScript sees more than they need,
 * which is a far better failure than seeing nothing.
 */
export function timeline(site) {
  const events = allEvents(site);
  const dated = events.filter((e) => e.date);
  const undated = events.filter((e) => !e.date);

  /* Destinations that actually have something on the calendar, so the scope
     picker never offers a country with nothing to show. */
  const represented = [...new Set(events.map((e) => e.destination))]
    .map((code) => site.destinations.find((d) => d.code === code))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  const withDates = new Set(dated.map((e) => e.destination)).size;

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: SITE.cycle.label,
  title: 'The calendar',
  lede: 'Every deadline that matters, in order. Some of them close before you have predicted grades, and one of them closes at noon.',
})}

<section class="section">
  <div class="wrap">
    <div class="layout-aside">
      <div class="prose">

        <div class="scope" id="cal-scope" hidden>
          <p class="scope__state" id="cal-scope-state" role="status"></p>
          <div class="scope__actions">
            <button type="button" class="btn btn--ghost btn--sm" id="cal-show-all">Show every deadline</button>
            <button type="button" class="btn btn--ghost btn--sm" id="cal-show-mine" hidden>Back to mine</button>
            <button type="button" class="btn btn--ghost btn--sm" id="cal-share" hidden>Copy a link to this view</button>
          </div>
          <details class="scope__pick">
            <summary>Choose which destinations to show</summary>
            <div class="scope__grid">
              ${represented.map(
                (c) => html`<label class="scope__opt">
                  <input type="checkbox" name="scope" value="${c.code}"> <span>${c.flag} ${c.name}</span>
                </label>`
              )}
            </div>
          </details>
        </div>

        <noscript>
          <p class="state state--empty">This calendar normally shows only the destinations you are looking at.
          That needs JavaScript, because which destinations those are is kept in your browser and is never sent
          anywhere. Without it you get the complete calendar below — more than you need, rather than less.</p>
        </noscript>

        ${deadlineList(dated, { showDestination: true })}

        ${undated.length
          ? html`<h2 id="undated">${plural(undated.length, 'date')} we could not pin down</h2>
              <p>Every one of these was looked for and was not published, or is set by each institution rather
              than centrally. They are here rather than hidden, because "there is no date" is something you can
              act on and a blank is not.</p>
              ${deadlineList(undated, { showDestination: true })}`
          : ''}
      </div>

      <aside class="layout-aside__side stack">
        ${note(
          `Every date here comes from a country record or an Application Route, with the source it was read
          from. Nothing on this page is typed in by hand — if a date is wrong, it is wrong on the destination
          page too, and fixing it there fixes it here.`,
          { title: 'Where these come from' }
        )}
        ${note(
          `Anything marked **provisional** is carried over from the previous cycle because the authority has
          not republished it yet. The day and month have usually been stable for years; the year has not been
          confirmed. Treat a provisional date as a warning to check, not as a date.`,
          { kind: 'warn', title: 'Provisional dates' }
        )}
        ${stats([
          { value: dated.length, label: 'Dated events' },
          { value: withDates, label: 'Destinations with dates' },
        ])}
      </aside>
    </div>
  </div>
</section>`;

  return page({
    title: 'Application calendar',
    description:
      'Every university application deadline for IB students finishing in May 2027, scoped to the destinations you are looking at — in order, from autumn 2026 to results day.',
    path: '/timeline/',
    section: '/timeline/',
    body,
    scripts: ['calendar.js'],
  });
}
