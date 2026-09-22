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

async function readDir(dir) {
  try {
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json')).sort();
    const out = [];
    for (const f of files) {
      try {
        out.push(JSON.parse(await fs.readFile(path.join(dir, f), 'utf8')));
      } catch (err) {
        console.warn(`  ! ${path.relative(ROOT, path.join(dir, f))}: ${err.message}`);
      }
    }
    return out;
  } catch {
    return [];
  }
}

export async function loadCanonical() {
  const [destinations, places, institutions, programmes, opportunities, systems, routes, contextNotes, evidenceFiles] =
    await Promise.all([
      readDir(path.join(DATA, 'destinations')),
      readDir(path.join(DATA, 'places')),
      readDir(path.join(DATA, 'institutions')),
      readDir(path.join(DATA, 'programmes')),
      readDir(path.join(DATA, 'opportunities')),
      readDir(path.join(DATA, 'application-systems')),
      readDir(path.join(DATA, 'application-routes')),
      readDir(path.join(DATA, 'context-notes')),
      readDir(path.join(DATA, 'evidence')),
    ]);

  const evidence = new Map();
  for (const file of evidenceFiles) {
    for (const ev of Array.isArray(file) ? file : Object.values(file)) {
      if (ev?.id) evidence.set(ev.id, ev);
    }
  }

  const graph = {
    destinations: index(destinations),
    places: index(places),
    institutions: index(institutions),
    programmes: index(programmes),
    opportunities: index(opportunities),
    applicationSystems: index(systems),
    applicationRoutes: index(routes),
    contextNotes: index(contextNotes),
    evidence,
  };

  return { graph, ...project(graph) };
}

function index(list) {
  return new Map(list.map((r) => [r.id, r]));
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

function project(graph) {
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
        entryRequirements: denormalise(opp.requirements),
        requirements: opp.requirements || [],
        extraRequirements: (opp.requirements || [])
          .filter((r) => ['essay', 'test', 'portfolio', 'interview', 'audition', 'other'].includes(r.kind))
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
function denormalise(requirements) {
  if (!requirements?.length) return null;
  const all = [];
  let oneOf = null;

  for (const r of requirements) {
    if (r.kind === 'ib-subject' && r.subject && r.level) {
      all.push({ subject: r.subject, level: r.level, ...(r.minGrade ? { minGrade: r.minGrade } : {}) });
    } else if (r.kind === 'subject-combination' && r.alternatives?.length) {
      oneOf = r.alternatives.map((group) =>
        group
          .filter((x) => x.subject && x.level)
          .map((x) => ({ subject: x.subject, level: x.level, ...(x.minGrade ? { minGrade: x.minGrade } : {}) }))
      );
    }
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
