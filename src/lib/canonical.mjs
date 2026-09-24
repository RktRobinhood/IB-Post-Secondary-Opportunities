/**
 * Loads the canonical entity records and assembles them into the shapes the
 * templates use.
 *
 * Two audiences, one source:
 *   - `graph` is the entity graph itself — destinations, places, institutions,
 *     programmes, opportunities, routes, evidence — which the map, the
 *     eligibility engine and the public export read directly.
 *   - `institutions` is a convenience projection matching the older nested
 *     shape, so the institution and Programme pages keep rendering while the
 *     rest of the site migrates. It is a view, never a second source of truth.
 *
 * The nested shape was designed when every record in it was Danish, and it read
 * that way: no `destination`, a `danishName`, a `quota1Cutoff`. Five Dutch
 * Institutions later, the projection is what decides whether a page can tell
 * the truth about a record, so it now carries the Destination itself.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { statusFor } from './evidence-policy.mjs';
import { buildSubjectIndex, ibTermsFor } from './eligibility.mjs';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const DATA = path.join(ROOT, 'data');

/**
 * What a caller gets instead of a graph that is quietly missing things.
 *
 * The loader used to warn and carry on. A `console.warn` in a build that prints
 * hundreds of lines and then says "wrote 125 pages" is not a failure anybody
 * sees, so a Destination could disappear because its file had a trailing comma
 * and the build would still report success. For a repository whose records
 * decide eligibility, deadlines and Evidence, "missing because the JSON did not
 * parse" cannot be a successful load.
 *
 * Every diagnostic is collected before this is thrown, so one run names every
 * problem rather than only the first.
 */
export class CanonicalIntegrityError extends Error {
  constructor(diagnostics) {
    const errors = diagnostics.filter((d) => d.level === 'error');
    super(
      `canonical data is not loadable (${errors.length} error${errors.length === 1 ? '' : 's'}):\n` +
        errors.map((d) => `  ${d.message}`).join('\n')
    );
    this.name = 'CanonicalIntegrityError';
    this.diagnostics = diagnostics;
  }
}

/**
 * Read one directory of records, keeping each record's file with it.
 *
 * The file travels with the record because the only useful thing to say about a
 * duplicate id is which two files claim it, and by the time the records are in
 * a Map that information is gone.
 *
 * An absent directory and a malformed one are different answers. An optional
 * directory legitimately may not exist; a directory that fails to open for any
 * other reason is a fault. Only ENOENT is read as absence.
 */
async function readDir(dir, diagnostics) {
  const rel = path.relative(ROOT, dir).split(path.sep).join('/');
  let files;
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json')).sort();
  } catch (err) {
    if (err.code === 'ENOENT') {
      diagnostics.push({ level: 'absent', dir: rel, message: `${rel}/: not present` });
      return [];
    }
    diagnostics.push({ level: 'error', dir: rel, message: `${rel}/: ${err.message}` });
    return [];
  }
  const out = [];
  for (const f of files) {
    const file = `${rel}/${f}`;
    try {
      out.push({ record: JSON.parse(await fs.readFile(path.join(dir, f), 'utf8')), file });
    } catch (err) {
      diagnostics.push({ level: 'error', file, message: `${file}: ${err.message}` });
    }
  }
  return out;
}

/**
 * Load the canonical graph, or refuse to.
 *
 * `strict` is the default because a caller that has not asked for diagnostics
 * must not be handed a partial graph. The validator and the tests pass
 * `strict: false` precisely because reporting every problem is their job.
 */
export async function loadCanonical({ dataDir = DATA, strict = true } = {}) {
  const diagnostics = [];
  const [destinations, places, institutions, programmes, opportunities, systems, routes, contextNotes, evidenceFiles] =
    await Promise.all([
      readDir(path.join(dataDir, 'destinations'), diagnostics),
      readDir(path.join(dataDir, 'places'), diagnostics),
      readDir(path.join(dataDir, 'institutions'), diagnostics),
      readDir(path.join(dataDir, 'programmes'), diagnostics),
      readDir(path.join(dataDir, 'opportunities'), diagnostics),
      readDir(path.join(dataDir, 'application-systems'), diagnostics),
      readDir(path.join(dataDir, 'application-routes'), diagnostics),
      readDir(path.join(dataDir, 'context-notes'), diagnostics),
      readDir(path.join(dataDir, 'evidence'), diagnostics),
    ]);

  /* The IB subject catalogue, so a requirement written in IB terms can be
     rendered with the subject's published name rather than its id. It is the
     one lookup the projection needs and it belongs to no Destination. */
  let ibSubjectNames = new Map();
  let ibCatalogue = [];
  try {
    const cat = JSON.parse(await fs.readFile(path.join(dataDir, 'ib-subjects.json'), 'utf8'));
    ibCatalogue = cat.subjects || [];
    ibSubjectNames = new Map(ibCatalogue.map((x) => [x.id, x.name]));
  } catch {
    /* A missing catalogue degrades to showing the id, which is ugly and true. */
  }
  /* The Recognition Schemes, so a requirement published on a local scale can be
     projected with its IB translation beside it. The translation is the
     engine's (ibTermsFor), read off the same rows it grades on; this only
     carries it to the pages. A Destination with no scheme contributes nothing. */
  const schemeFiles = await readDir(path.join(dataDir, 'recognition'), []);
  const subjectIndex = buildSubjectIndex({ subjects: ibCatalogue, schemes: schemeFiles.map((f) => f.record) });

  /* Evidence is indexed across files, not within them. One id used in two
     Destinations' files is the duplicate most likely to happen, and the one a
     per-file check would miss. */
  const evidence = index(
    evidenceFiles.flatMap(({ record, file }) =>
      (Array.isArray(record) ? record : Object.values(record)).map((ev) => ({ record: ev, file }))
    ),
    'evidence',
    diagnostics
  );

  const graph = {
    destinations: index(destinations, 'destination', diagnostics),
    places: index(places, 'place', diagnostics),
    institutions: index(institutions, 'institution', diagnostics),
    programmes: index(programmes, 'programme', diagnostics),
    opportunities: index(opportunities, 'opportunity', diagnostics),
    applicationSystems: index(systems, 'application system', diagnostics),
    applicationRoutes: index(routes, 'application route', diagnostics),
    contextNotes: index(contextNotes, 'context note', diagnostics),
    evidence,
  };

  if (strict && diagnostics.some((d) => d.level === 'error')) throw new CanonicalIntegrityError(diagnostics);

  return { graph, diagnostics, ...project(graph, ibSubjectNames, subjectIndex) };
}

/**
 * Index records by id, and refuse to let one silently replace another.
 *
 * `new Map(list.map(...))` keeps the last of any repeated key. That is the
 * quietest possible way to lose a record: nothing is missing from disk, the
 * count in the build log is right, and one Opportunity is simply somebody
 * else's. Both files are named, because knowing that an id is duplicated is not
 * actionable without knowing where.
 */
function index(list, kind, diagnostics) {
  const map = new Map();
  const from = new Map();
  for (const { record, file } of list) {
    const id = record?.id;
    if (!id) {
      diagnostics.push({ level: 'error', file, message: `${file}: a ${kind} record has no id` });
      continue;
    }
    if (map.has(id)) {
      diagnostics.push({
        level: 'error',
        file,
        message: `duplicate ${kind} id "${id}": ${from.get(id)} and ${file}`,
      });
      continue;
    }
    map.set(id, record);
    from.set(id, file);
  }
  return map;
}

/** Follow an evidence reference list to the records themselves. */
export function resolveEvidence(graph, refs) {
  return (refs || []).map((r) => graph.evidence.get(r)).filter(Boolean);
}

/**
 * How much weight a claim can carry.
 *
 * `conflicting`, `unavailable`, `superseded`, `stale` and `none` all mean the
 * product should decline to state the claim — and in particular a conflict is
 * never resolved by quietly preferring the more permissive source.
 *
 * `needs-review` is weaker: a source was read and recorded, but no person has
 * signed it off. That is worth showing beside the claim, not worth refusing to
 * show the claim at all.
 */
export function evidenceStatus(graph, refs) {
  return statusFor(resolveEvidence(graph, refs));
}

/* --- Destination identity, carried into the projection --------------------- */

/**
 * Destinations that have a hand-written section of their own rather than a
 * generated destination page.
 *
 * A table and not a branch. Denmark is in it because it was the pilot and got
 * four bespoke pages under `/denmark/` before generated destination pages
 * existed — nothing about Denmark makes it special to this function. The day a
 * second Destination earns a section of its own it is one line here, rather
 * than a condition in three page modules that each have to remember it.
 */
const DESTINATION_HUBS = { dk: '/denmark/' };

/**
 * Everything a page needs to place a record in its Destination and write an
 * honest sentence about it.
 *
 * The projection used to drop `destination` on the floor. That is why
 * `/universities/` was headed "Danish institutions" over a list containing
 * Delft, Maastricht and Twente, and why every Dutch institution page carried a
 * Denmark breadcrumb: the page module could not have corrected the framing if
 * it had wanted to, because by the time a record reached it the only country
 * left in it was the `dk-` or `nl-` at the front of an id.
 *
 * `articleName` is the whole difference between "in the Netherlands" and "in
 * Netherlands", and it is on the record for exactly that reason. So
 * `sentenceName` is what prose uses and `name` is what a label or a breadcrumb
 * uses; a caller that picks the wrong one is visibly wrong rather than subtly
 * wrong.
 */
export function destinationFacet(d, code = d?.id || null) {
  if (!code) return null;
  const hub = DESTINATION_HUBS[code] || null;
  return {
    code,
    /* A dangling destination reference is not an excuse to invent a name. The
       bare code is ugly on a page, which is the point — it reads as the fault
       it is instead of as prose. */
    name: d?.name || code,
    sentenceName: d?.articleName || d?.name || code,
    articleName: d?.articleName || null,
    adjective: d?.adjective || null,
    href: hub || `/destinations/${code}/`,
    /* Which top-level navigation item is current. The same rule the generated
       destination pages apply in destinations.mjs, so an institution page and its own
       Destination's page never highlight two different things. */
    section: hub || ((d?.scope || 'europe') === 'worldwide' ? '/world/' : '/europe/'),
  };
}

/* --- Projection into the shape the current templates expect ---------------- */

function project(graph, ibSubjectNames = new Map(), subjectIndex = null) {
  const facets = new Map();
  const destinationOf = (code) => {
    if (!code) return null;
    if (!facets.has(code)) facets.set(code, destinationFacet(graph.destinations.get(code), code));
    return facets.get(code);
  };

  const byInstitution = new Map();
  for (const opp of graph.opportunities.values()) {
    if (!byInstitution.has(opp.institution)) byInstitution.set(opp.institution, []);
    byInstitution.get(opp.institution).push(opp);
  }

  const institutions = [...graph.institutions.values()].map((inst) => {
    const opps = (byInstitution.get(inst.id) || []).map((opp) => {
      const prog = graph.programmes.get(opp.programme) || {};
      const place = graph.places.get(opp.place);
      const cost = (opp.cost || []).find((c) => c.applicantGroup === 'eu-eea-ch');
      return {
        id: opp.id,
        opportunityId: opp.id,
        programmeId: prog.id,
        name: prog.name || opp.id,
        degree: prog.credential?.title || null,
        ects: prog.credential?.ects || null,
        years: prog.credential?.years || null,
        field: fieldLabel(prog.field?.primary),
        campus: place?.name || null,
        placeId: place?.id || null,
        language: opp.language?.instruction || 'English',
        url: prog.links?.official || null,
        source: prog.links?.admissions || prog.links?.official || null,
        summary: prog.summary || null,
        requirementsText: opp.officialRequirementsText?.[0]?.text || null,
        entryRequirements: denormalise(opp.requirements, ibSubjectNames, subjectIndex),
        requirements: opp.requirements || [],
        /* Things you must also do, and things that decide who gets in among
           those who qualify. They were one list, and on the Dutch pages that
           made "Your grade average — 75 per cent of the selection score" read
           as a hurdle rather than as a ranking. `mandatory: false` is the
           schema's own marker for a Selection Factor and says so in as many
           words; nothing was reading it. */
        extraRequirements: (opp.requirements || [])
          .filter((r) => r.mandatory !== false)
          .filter((r) => ['essay', 'test', 'portfolio', 'interview', 'audition', 'work-sample', 'activity', 'other'].includes(r.kind))
          .map((r) => r.label)
          .filter(Boolean),
        selectionFactors: (opp.requirements || [])
          .filter((r) => r.mandatory === false)
          .map((r) => r.label)
          .filter(Boolean),
        // Three states. A record that does not say is not open admission: it is
        // unrecorded, and the pages say so rather than reading silence as a yes.
        restrictedAdmission: typeof opp.admission?.restricted === 'boolean' ? opp.admission.restricted : null,
        /* This was `quota1Cutoff: { gpa, year }`. Quota 1 is the name of a
           Danish national mechanism and `gpa` is a scale nobody named, so the
           field asserted in its own key what only the record can say: which
           competition the figure came from and what scale the number is on.
           Both are on the record. Carry them, and let the page print what the
           record says rather than what Denmark happens to call it. */
        cutoff: opp.admission?.historicalCutoffs?.[0]
          ? {
              value: opp.admission.historicalCutoffs[0].value,
              quota: opp.admission.historicalCutoffs[0].quota || null,
              scale: opp.admission.historicalCutoffs[0].scale || null,
              intake: opp.admission.historicalCutoffs[0].intake
                ? `${opp.admission.historicalCutoffs[0].intake.split('-')[0]} intake`
                : null,
            }
          : null,
        startMonth: opp.startMonth || null,
        feeStatus: cost?.feeStatus || null,
        verified: opp.meta?.dataAsOf || null,
        evidence: opp.evidence || [],
        institutionId: inst.id,
        institutionName: inst.shortName || inst.name,
        /* The Opportunity's own Destination, not its Institution's. They agree
           today and normally will, but the Opportunity is the record that says
           which admissions jurisdiction applies to it, and a branch campus in
           another country is the case where they come apart. */
        destination: destinationOf(opp.destination || inst.destination),
        href: `/programmes/${opp.id}/`,
      };
    });

    const places = (inst.places || []).map((p) => graph.places.get(p)).filter(Boolean);

    return {
      id: inst.id,
      legacyId: inst.id.replace(/^dk-/, ''),
      /* The Destination is the first thing a page needs about an Institution
         and the last thing this projection used to keep. Everything wrong on
         `/universities/` followed from its absence. */
      destination: destinationOf(inst.destination),
      name: inst.name,
      shortName: inst.shortName || null,
      /* Was `danishName`, which is what the record is called in Danish and what
         the field was called for every Institution, including the five that are
         not Danish. `localName` is what the source record calls it. */
      localName: inst.localName || null,
      type: typeLabel(inst.type),
      /* What it teaches in when it is not teaching in English. The institution
         page needs it to tell a student what the alternative to an
         English-taught degree here actually is, and that is a property of the
         institution rather than of its country — Maastricht and Twente teach
         in English in a Dutch-speaking Destination. */
      teachingLanguage: inst.languageOfInstruction?.primary || null,
      founded: inst.founded || null,
      city: places[0]?.name || null,
      campuses: places.map((p) => p.name),
      placeIds: places.map((p) => p.id),
      website: inst.links?.website || null,
      admissionsUrl: inst.links?.admissions || null,
      ibPageUrl: inst.links?.ibPage || null,
      wikipedia: inst.links?.wikipedia || null,
      ibisCode: inst.codes?.ibResultsService || null,
      about: inst.about || null,
      knownFor: inst.knownFor || [],
      students: inst.students || null,
      /* One list, projected once. Both fields used to carry `meta.notes`, so
         every institution page printed the same list twice — under "What this
         institution asks of IB students" and again under "Worth knowing". The
         canonical record does not separate IB-specific notes from the rest (AAU's
         first note is about which degrees it lists, not about the IB), so it
         goes under the heading that claims no more than the record does. A
         record that one day separates them can fill `ibNotes` from its own field. */
      ibNotes: [],
      notes: inst.meta?.notes || [],
      quotaNotes: null,
      tuitionNonEu: null,
      dataAsOf: inst.meta?.dataAsOf || null,
      sources: resolveEvidence(graph, inst.evidence).map((e) => ({
        title: e.claim || e.publisher,
        url: e.sourceUrl,
        retrieved: e.retrievedAt,
      })),
      evidence: inst.evidence || [],
      deadlines: [],
      programmes: opps.sort((a, b) => a.name.localeCompare(b.name)),
      href: `/universities/${inst.id}/`,
    };
  });

  return {
    institutions: institutions.sort((a, b) => a.name.localeCompare(b.name)),
    programmes: institutions.flatMap((i) => i.programmes),
  };
}

/** Flatten canonical rules back into the {all, oneOf} form the current UI reads. */
/**
 * Project a requirement into the `{ subject, level, minGrade }` shape the page
 * renders, whichever vocabulary it was written in.
 *
 * Two vocabularies, since ADR 0002. A `local-equivalency` requirement names a
 * subject on a declared scale — Denmark's "Mathematics A". An `ib-subject`
 * requirement names an IB subject and HL or SL, which is how most of the world
 * publishes its rules and needs no translation.
 *
 * This function used to handle only the first, and the day the first non-Danish
 * Opportunities landed the consequence was visible on every one of them: TU
 * Delft's Aerospace Engineering rendered a heading and then nothing, because
 * "Mathematics: AA HL + Physics HL" projected to null. A requirement the engine
 * assesses correctly and the page cannot draw is worse than one we never
 * recorded — the student is told there is nothing to meet.
 */
function subjectOf(r, ibSubjectNames, subjectIndex = null) {
  if (r.kind === 'ib-subject' && r.ibSubject) {
    return {
      subject: ibSubjectNames.get(r.ibSubject) || r.ibSubject,
      level: r.ibLevel === 'any' ? 'HL or SL' : r.ibLevel || '',
      ...(r.minGrade ? { minGrade: r.minGrade } : {}),
    };
  }
  if (r.subject && r.level) {
    /* A local level is never handed to a page on its own: "English B" on a
       local scale is a level, not the IB course, and a student reading it
       bare cannot tell. The IB translation travels with it (null only for a
       rule that names no scale, which the validator refuses). */
    return {
      subject: r.subject,
      level: r.level,
      ...(r.minGrade ? { minGrade: r.minGrade } : {}),
      ...(r.levelScale ? { levelScale: r.levelScale } : {}),
      translation: ibTermsFor(r, subjectIndex),
    };
  }
  return null;
}

function denormalise(requirements, ibSubjectNames = new Map(), subjectIndex = null) {
  if (!requirements?.length) return null;
  const all = [];
  /* Every "one of" a record carries. This held one, and a second overwrote the
     first: VIA's Mechanical Engineering asks for Physics B or Geoscience A AND
     for Chemistry C or Biotechnology A, and its pages showed only the second.
     `oneOf` stays the first set for the readers that know only one;
     `oneOfSets` is all of them. */
  const oneOfSets = [];

  for (const r of requirements) {
    if (r.kind === 'subject-combination' && r.alternatives?.length) {
      if (r.mandatory === false) continue;
      oneOfSets.push(r.alternatives.map((group) => group.map((x) => subjectOf(x, ibSubjectNames, subjectIndex)).filter(Boolean)));
      continue;
    }
    /* A Selection Factor is `mandatory: false` — used in ranking, not in
       eligibility. Listing one here would tell a student they do not qualify
       when they merely are not top of a queue. */
    if (r.mandatory === false) continue;
    const projected = subjectOf(r, ibSubjectNames, subjectIndex);
    if (projected) all.push(projected);
  }
  if (!all.length && !oneOfSets.length) return null;
  return {
    ...(all.length ? { all } : {}),
    ...(oneOfSets.length ? { oneOf: oneOfSets[0], oneOfSets } : {}),
  };
}

const FIELD_LABELS = {
  engineering: 'Engineering',
  computing: 'Computing and IT',
  'natural-sciences': 'Natural sciences',
  mathematics: 'Mathematics',
  business: 'Business',
  economics: 'Economics',
  'social-sciences': 'Social sciences',
  law: 'Law',
  humanities: 'Humanities',
  languages: 'Languages',
  education: 'Education',
  health: 'Health',
  medicine: 'Medicine',
  veterinary: 'Veterinary',
  'agriculture-environment': 'Agriculture and environment',
  'design-architecture': 'Design and architecture',
  'arts-music': 'Arts and music',
  sport: 'Sport',
  'hospitality-tourism': 'Hospitality and tourism',
  interdisciplinary: 'Interdisciplinary',
  other: 'Other',
};

const TYPE_LABELS = {
  'research-university': 'Research university',
  'technical-university': 'Technical university',
  'business-school': 'Business school',
  'university-college': 'University college',
  'business-academy': 'Business academy',
  'art-academy': 'Art academy',
  'music-conservatoire': 'Music conservatoire',
  'liberal-arts-college': 'Liberal arts college',
  'university-of-applied-sciences': 'University of applied sciences',
  other: 'Institution',
};

function fieldLabel(key) {
  return FIELD_LABELS[key] || 'Other';
}
function typeLabel(key) {
  return TYPE_LABELS[key] || 'Institution';
}

/**
 * Every context note attached to a thing.
 *
 * Ordered by how much weight they deserve, so the best-supported observation is
 * read first and a contested one is never the first thing a student sees.
 */
export function contextFor(graph, kind, id) {
  const weight = { 'widely-reported': 0, 'single-source': 1, contested: 2 };
  return [...(graph.contextNotes?.values() || [])]
    .filter((n) => n.appliesTo?.kind === kind && n.appliesTo?.id === id)
    .sort((a, b) => (weight[a.confidence] ?? 9) - (weight[b.confidence] ?? 9));
}
