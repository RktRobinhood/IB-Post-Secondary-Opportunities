/**
 * Loads the canonical entity records and assembles them into the shapes the
 * templates use.
 *
 * Two audiences, one source:
 *   - `graph` is the entity graph itself — destinations, places, institutions,
 *     programmes, opportunities, routes, evidence — which the map, the
 *     eligibility engine and the public export read directly.
 *   - `institutions` is a convenience projection matching the older nested
 *     shape, so the existing Denmark pages keep rendering while the rest of the
 *     site migrates. It is a view, never a second source of truth.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

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
  try {
    const cat = JSON.parse(await fs.readFile(path.join(dataDir, 'ib-subjects.json'), 'utf8'));
    ibSubjectNames = new Map((cat.subjects || []).map((x) => [x.id, x.name]));
  } catch {
    /* A missing catalogue degrades to showing the id, which is ugly and true. */
  }

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

  return { graph, diagnostics, ...project(graph, ibSubjectNames) };
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
  const records = resolveEvidence(graph, refs);
  if (!records.length) return { level: 'none', label: 'No source recorded', records };

  const hasConflict = records.some((r) => (r.conflictsWith || []).length);
  if (hasConflict) return { level: 'conflicting', label: 'Sources disagree', records };

  const states = new Set(records.map((r) => r.verificationState));
  if (states.has('unavailable')) return { level: 'unavailable', label: 'Source unavailable', records };
  if (states.has('superseded')) return { level: 'superseded', label: 'Superseded', records };

  const newest = records.map((r) => r.retrievedAt).filter(Boolean).sort().at(-1);

  // Past its own review date is stale, whatever its verification state says.
  const today = new Date().toISOString().slice(0, 10);
  if (records.some((r) => r.meta?.reviewBy && r.meta.reviewBy < today)) {
    return { level: 'stale', label: 'Past its review date', checkedAt: newest, records };
  }

  if (states.has('needs-review')) {
    return { level: 'needs-review', label: 'Not yet checked by a person', checkedAt: newest, records };
  }
  return { level: 'verified', label: 'Verified', checkedAt: newest, records };
}

/* --- Projection into the shape the current templates expect ---------------- */

function project(graph, ibSubjectNames = new Map()) {
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
        entryRequirements: denormalise(opp.requirements, ibSubjectNames),
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
        restrictedAdmission: !!opp.admission?.restricted,
        quota1Cutoff: opp.admission?.historicalCutoffs?.[0]
          ? {
              gpa: opp.admission.historicalCutoffs[0].value,
              year: `${opp.admission.historicalCutoffs[0].intake.split('-')[0]} intake`,
            }
          : null,
        startMonth: opp.startMonth || null,
        feeStatus: cost?.feeStatus || null,
        verified: opp.meta?.dataAsOf || null,
        evidence: opp.evidence || [],
        institutionId: inst.id,
        institutionName: inst.shortName || inst.name,
        href: `/programmes/${opp.id}/`,
      };
    });

    const places = (inst.places || []).map((p) => graph.places.get(p)).filter(Boolean);

    return {
      id: inst.id,
      legacyId: inst.id.replace(/^dk-/, ''),
      name: inst.name,
      shortName: inst.shortName || null,
      danishName: inst.localName || null,
      type: typeLabel(inst.type),
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
      ibNotes: inst.meta?.notes || [],
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
function subjectOf(r, ibSubjectNames) {
  if (r.kind === 'ib-subject' && r.ibSubject) {
    return {
      subject: ibSubjectNames.get(r.ibSubject) || r.ibSubject,
      level: r.ibLevel === 'any' ? 'HL or SL' : r.ibLevel || '',
      ...(r.minGrade ? { minGrade: r.minGrade } : {}),
    };
  }
  if (r.subject && r.level) {
    return { subject: r.subject, level: r.level, ...(r.minGrade ? { minGrade: r.minGrade } : {}) };
  }
  return null;
}

function denormalise(requirements, ibSubjectNames = new Map()) {
  if (!requirements?.length) return null;
  const all = [];
  let oneOf = null;

  for (const r of requirements) {
    if (r.kind === 'subject-combination' && r.alternatives?.length) {
      oneOf = r.alternatives.map((group) => group.map((x) => subjectOf(x, ibSubjectNames)).filter(Boolean));
      continue;
    }
    /* A Selection Factor is `mandatory: false` — used in ranking, not in
       eligibility. Listing one here would tell a student they do not qualify
       when they merely are not top of a queue. */
    if (r.mandatory === false) continue;
    const projected = subjectOf(r, ibSubjectNames);
    if (projected) all.push(projected);
  }
  if (!all.length && !oneOf) return null;
  return { ...(all.length ? { all } : {}), ...(oneOf ? { oneOf } : {}) };
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
