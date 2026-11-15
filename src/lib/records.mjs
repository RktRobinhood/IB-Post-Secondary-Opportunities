/** School records are the sole institution/programme source. Graphs below are
 * runtime indexes for eligibility, calendars and exports, never another format. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { statusFor } from './evidence-policy.mjs';
import { buildSubjectIndex, floorTerms, ibPointsFor, ibTermsFor, ibTermsPhrase, unionPhrase } from './eligibility.mjs';
import { programmePaths } from './schools.mjs';
import { currentRecords } from './current-records.mjs';
const DATA = path.resolve(import.meta.dirname, '..', '..', 'data');
export class RecordsIntegrityError extends Error {
  constructor(diagnostics) { super(diagnostics.filter(d => d.level === 'error').map(d => d.message).join('\n')); this.name = 'RecordsIntegrityError'; this.diagnostics = diagnostics; }
}
async function readDir(dir, diagnostics = []) {
  let names;
  try { names = (await fs.readdir(dir)).filter(f => f.endsWith('.json')).sort(); }
  catch (err) { if (err.code === 'ENOENT') return []; throw err; }
  const records = [];
  for (const name of names) {
    try { records.push({ key: name.slice(0, -5), ...JSON.parse(await fs.readFile(path.join(dir, name), 'utf8')) }); }
    catch (err) { diagnostics.push({ level: 'error', file: path.join(dir, name), message: path.join(dir, name) + ': ' + err.message }); }
  }
  return records;
}
/** Add transient evidence references to the source links stored beside facts. */
export function indexSources(value, evidence, inheritedDate = null) {
  if (Array.isArray(value)) return value.map(x => indexSources(x, evidence, inheritedDate));
  if (!value || typeof value !== 'object') return value;
  const checked = value.retrieved || value.dataAsOf || value.retrievedAt || inheritedDate;
  const out = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, indexSources(v, evidence, checked)]));
  const refs = [];
  for (const source of Array.isArray(out.sources) ? out.sources : []) {
    if (!source || typeof source !== 'object' || !source.url) continue;
    if (!source.retrieved && checked) source.retrieved = checked;
    const id = 'source-' + createHash('sha256').update(JSON.stringify([source.url, source.title, source.retrieved])).digest('hex').slice(0, 20);
    evidence.set(id, { id, sourceUrl: source.url, claim: source.title || null, excerpt: source.quote || null, publisher: source.title || new URL(source.url).hostname, retrievedAt: source.retrieved || null, verificationState: 'needs-review' });
    refs.push(id);
  }
  if (refs.length) out.evidence = refs;
  return out;
}
export async function loadRecords({ dataDir = DATA, strict = true, retirePassed = false, today = new Date().toISOString().slice(0, 10) } = {}) {
  const diagnostics = [];
  const [countryRecords, schoolRecords, places, schemes] = await Promise.all([
    readDir(path.join(dataDir, 'countries'), diagnostics), readDir(path.join(dataDir, 'schools'), diagnostics),
    readDir(path.join(dataDir, 'places'), diagnostics), readDir(path.join(dataDir, 'recognition'), diagnostics),
  ]);
  const graph = Object.fromEntries(['destinations', 'places', 'institutions', 'programmes', 'opportunities', 'applicationSystems', 'applicationRoutes', 'contextNotes', 'evidence'].map(k => [k, new Map()]));
  const current = retirePassed ? currentRecords(countryRecords, schoolRecords, today) : { countries: countryRecords, schools: schoolRecords };
  const countries = current.countries.map(x => indexSources(x, graph.evidence));
  const schools = new Map(current.schools.map(x => [x.key, indexSources(x, graph.evidence)]));
  const add = (map, record, kind) => { if (!record?.id) { diagnostics.push({level:'error',message:kind+' has no id'}); return; } if (map.has(record.id)) diagnostics.push({level:'error',message:'duplicate '+kind+' id '+record.id}); else map.set(record.id, record); };
  for (const c of countries) {
    const d = { ...c, id: c.code, meta: { dataAsOf: c.dataAsOf || c.retrieved } };
    graph.destinations.set(c.code, d);
    for (const r of c.routes || []) add(graph.applicationRoutes, { ...r, meta: { dataAsOf: r.retrieved, notes: r.notes || [] } }, 'route');
    for (const s of c.systems || []) { if (!graph.applicationSystems.has(s.id)) graph.applicationSystems.set(s.id, s); for (const n of s.contextNotes || []) graph.contextNotes.set(n.id, n); }
    for (const n of c.contextNotes || []) graph.contextNotes.set(n.id, n);
  }
  for (const p of places) graph.places.set(p.id, p);
  for (const [key, rec] of schools) {
    if ((rec.id && rec.id !== key) || rec.institution !== key) diagnostics.push({level:'error', message:'schools/' + key + '.json: identity must match filename'});
    if (!graph.destinations.has(rec.country)) diagnostics.push({level:'error', message:'schools/' + key + '.json: unknown country ' + rec.country});
    const inst = { ...rec, id: key, destination: rec.country, places: rec.places || (rec.place ? [rec.place] : []), links: { website: rec.website, admissions: rec.admissionsUrl, ibPage: rec.ibPageUrl, wikipedia: rec.wikipedia, ...rec.links }, meta: { dataAsOf: rec.retrieved || null, notes: rec.notes || [] } };
    add(graph.institutions, inst, 'school');
    for (const note of rec.contextNotes || []) graph.contextNotes.set(note.id, note);
    for (const p of programmePaths(key, rec.programmes || [])) {
      const id = p.id || key + '-' + p.slug;
      const prog = { ...p, separateFrom: (p.separateFrom || []).map(x => ({ ...x, programme: x.programme || rec.programmes.find(sibling => sibling.name === x.name)?.id })), id, institution: key, meta: { dataAsOf: p.retrieved, notes: p.notes || [] }, credential: p.qualification || { title: p.credential, abbreviation: p.credential, years: p.years }, field: { primary: p.field, ...p.subjectTags }, summary: p.about, links: { official: p.url, admissions: p.requirementsUrl || p.url, ...p.links } };
      add(graph.programmes, prog, 'programme');
      for (const intake of p.intakes || []) add(graph.opportunities, { ...intake, meta: { dataAsOf: intake.retrieved, notes: intake.notes || [] }, programme: id, institution: key, destination: intake.destination || rec.country }, 'intake');
    }
  }
  for (const c of countries) for (const key of c.institutions || []) {
    const school = schools.get(key);
    if (!school) diagnostics.push({level:'error', message:'countries/' + c.code + '.json: missing school ' + key});
    else if (school.country !== c.code) diagnostics.push({level:'error', message:key + ': country differs from country listing'});
  }
  for (const intake of graph.opportunities.values()) for (const route of intake.applicationRoutes || []) if (!graph.applicationRoutes.has(route)) diagnostics.push({level:'error', message:intake.id + ': missing application route ' + route});
  let catalogue = { subjects: [] };
  try { catalogue = JSON.parse(await fs.readFile(path.join(dataDir, 'ib-subjects.json'), 'utf8')); } catch {}
  const recognitionSchemes = schemes.map(x => indexSources(x, graph.evidence));
  const subjectIndex = buildSubjectIndex({ subjects: catalogue.subjects, schemes: recognitionSchemes, institutions: [...graph.institutions.values()], diplomaMinimumPoints: catalogue.diplomaMinimumPoints });
  if (strict && diagnostics.some(d => d.level === 'error')) throw new RecordsIntegrityError(diagnostics);
  return { graph, countries, schools, recognitionSchemes, diagnostics, ...project(graph, new Map(catalogue.subjects.map(x => [x.id, x.name])), subjectIndex) };
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
  const hub = d?.href || null;
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
      const place = opp.deliveryMode === 'online' ? null : graph.places.get(opp.place);
      const cost = (opp.cost || []).find((c) => c.applicantGroup === 'eu-eea-ch');
      return {
        id: opp.id,
        opportunityId: opp.id,
        programmeId: prog.id,
        deliveryMode: opp.deliveryMode || null,
        name: prog.name || opp.id,
        degree: prog.credential?.title || null,
        ects: prog.credential?.ects || null,
        years: prog.credential?.years || null,
        field: fieldLabel(prog.field?.primary),
        campus: place?.name || null,
        placeId: place?.id || null,
        language: opp.language?.instruction || 'English',
        languageIntakeStatus: opp.language?.intakeStatus || null,
        languageNote: opp.language?.note || null,
        intake: opp.intake,
        url: prog.links?.official || null,
        source: prog.links?.admissions || prog.links?.official || null,
        summary: prog.summary || null,
        requirementsText: opp.officialRequirementsText?.[0]?.text || null,
        requirementsOfficial: opp.officialRequirementsText?.[0]?.official === true,
        entryRequirements: denormalise(opp.requirements, ibSubjectNames, subjectIndex, opp.institution),
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
              /* The lowest IB total whose converted average reaches it, from the
                 scheme that defines the scale. Null where no scheme does. */
              ibPoints: ibPointsFor(
                opp.admission.historicalCutoffs[0].value,
                opp.admission.historicalCutoffs[0].scale,
                subjectIndex
              ),
              /* A cut-off the Diploma's own minimum already reaches: "21 IB
                 points" would suggest a total no Diploma is awarded at. */
              anyDiploma: (() => {
                const pts = ibPointsFor(opp.admission.historicalCutoffs[0].value, opp.admission.historicalCutoffs[0].scale, subjectIndex);
                const floor = subjectIndex?.diplomaMinimumPoints;
                return pts != null && floor != null && pts <= floor;
              })(),
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
/** A requirement published in IB terms, as an option the phrase-maker reads.
    Also how a school record's `needs` are named (src/pages/school-programme.mjs). */
export function ibOption(r, subjectIndex) {
  const found = subjectIndex?.get(r.ibSubject);
  return {
    id: r.ibSubject,
    name: found?.name || r.ibSubject,
    family: found?.family || null,
    course: found?.course || null,
    area: found?.area || null,
    // SL is the lowest level that counts: HL meets it too, as the engine grades.
    levels: r.ibLevel === 'HL' ? ['HL'] : ['SL', 'HL'],
  };
}

function subjectOf(r, ibSubjectNames, subjectIndex = null, institution = null) {
  if (r.kind === 'ib-subject' && r.ibSubject) {
    return {
      subject: ibSubjectNames.get(r.ibSubject) || r.ibSubject,
      level: r.ibLevel === 'any' ? 'HL or SL' : r.ibLevel || '',
      ...(r.minGrade ? { minGrade: r.minGrade } : {}),
      /* Published in IB terms: nothing to translate and no "as published" line
         of its own, but still written the way every other requirement is —
         "Any IB Maths", "Physics HL". */
      ibNative: true,
      option: ibOption(r, subjectIndex),
      ibPhrase: subjectIndex ? ibTermsPhrase([ibOption(r, subjectIndex)], subjectIndex) : null,
    };
  }
  if (r.kind === 'minimum-average') {
    const terms = floorTerms(r, subjectIndex);
    return terms?.ibText ? { floor: true, quota: terms.quota, ibText: terms.ibText, localText: terms.localText } : null;
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
      /* A test the source accepts in place of the grade (CBS's Cambridge
         route), carried so the card and the page name it beside the grade. */
      ...(r.alternativeTest ? { alternativeTest: { label: r.alternativeTest.label, shortLabel: r.alternativeTest.shortLabel || null, note: r.alternativeTest.note || null } } : {}),
      translation: ibTermsFor(r, subjectIndex, institution),
    };
  }
  return null;
}

/**
 * An alternative in a "one of" that is not a subject at all — "an accepted
 * English test instead (for example IELTS Academic 6.5)". Dropping it left a
 * trailing "/" and an empty "as published" line on nine programmes; it is part
 * of the choice and is shown as written.
 */
function otherOf(r) {
  return r?.label ? { other: true, kind: r.kind, label: r.label, ...(r.shortLabel ? { shortLabel: r.shortLabel } : {}) } : null;
}

function denormalise(requirements, ibSubjectNames = new Map(), subjectIndex = null, institution = null) {
  if (!requirements?.length) return null;
  const all = [];
  /* Every "one of" a record carries. This held one, and a second overwrote the
     first: VIA's Mechanical Engineering asks for Physics B or Geoscience A AND
     for Chemistry C or Biotechnology A, and its pages showed only the second.
     `oneOf` stays the first set for the readers that know only one;
     `oneOfSets` is all of them. */
  const oneOfSets = [];
  const quotaFloors = [];

  for (const r of requirements) {
    if (r.kind === 'subject-combination' && r.alternatives?.length) {
      if (r.mandatory === false) continue;
      let set = r.alternatives.map((group) => group.map((x) => subjectOf(x, ibSubjectNames, subjectIndex, institution) || otherOf(x)).filter(Boolean));
      /* A "one of" published in IB terms, one subject per option, is one
         requirement: Zealand's "Mathematics: AI SL / Mathematics: AA SL" is
         "Any IB Maths". */
      if (set.length > 1 && set.every((g) => g.length === 1 && g[0].ibNative && !g[0].minGrade) && subjectIndex) {
        const phrase = ibTermsPhrase(set.map((g) => g[0].option), subjectIndex);
        all.push({ ...set[0][0], subject: phrase, level: '', ibPhrase: phrase });
        continue;
      }
      /* For a card: the options that are each one translated subject, as one
         list of IB subjects (unionPhrase). Carried beside the set. */
      const routed = set.filter((g) => g.length === 1 && g[0].translation?.phrase);
      if (routed.length > 1 && set.every((g) => g.length === 1 && g[0].translation)) {
        const u = unionPhrase(routed.map((g) => g[0].translation), subjectIndex);
        if (u) set.union = u;
      }
      oneOfSets.push(set);
      continue;
    }
    /* A minimum average scoped to one quota is not an entry requirement: it
       decides whether you are ranked in that quota. It travels separately. */
    if (r.kind === 'minimum-average' && r.quota) {
      const f = subjectOf(r, ibSubjectNames, subjectIndex, institution);
      const routes = subjectIndex?.institutionRoutes?.get(institution)?.quotas || [];
      if (f) quotaFloors.push({ ...f, otherRoute: routes.find((q) => q.quota !== r.quota) || null });
      continue;
    }
    /* A Selection Factor is `mandatory: false` — used in ranking, not in
       eligibility. Listing one here would tell a student they do not qualify
       when they merely are not top of a queue. */
    if (r.mandatory === false) continue;
    const projected = subjectOf(r, ibSubjectNames, subjectIndex, institution);
    if (projected) all.push(projected);
  }
  if (!all.length && !oneOfSets.length && !quotaFloors.length) return null;
  return {
    ...(quotaFloors.length ? { quotaFloors } : {}),
    ...(all.length ? { all } : {}),
    ...(oneOfSets.length ? { oneOf: oneOfSets[0], oneOfSets } : {}),
  };
}

export const FIELD_LABELS = {
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

/**
 * Each field's look, for the designed backdrop of a programme with no
 * photograph (src/lib/designed-backdrop.mjs, #67): a hue in degrees, a
 * saturation in per cent, and a family of three motifs. A reader should know
 * the field from the card before reading it (round 2, fix 3), so the hues are
 * spread round the wheel, about twenty degrees apart, with the catch-alls in
 * warm greys, and each field keeps to its own motifs: a grid for engineering,
 * tiles for computing, rays for the sciences, dots for health, arcs for the
 * humanities, weave for the social sciences, and so on; the second and
 * third motifs keep neighbouring cards of one field apart. site.css sets the
 * lightness for each theme.
 */
export const FIELD_TONES = {
  'social-sciences': { hue: 8, sat: 46, motifs: ['weave', 'rings', 'dots'] },
  'hospitality-tourism': { hue: 20, sat: 54, motifs: ['waves', 'contour', 'rays'] },
  humanities: { hue: 32, sat: 30, motifs: ['arcs', 'contour', 'hatch'] },
  business: { hue: 44, sat: 54, motifs: ['chevrons', 'steps', 'grid'] },
  economics: { hue: 58, sat: 46, motifs: ['steps', 'weave', 'chevrons'] },
  education: { hue: 74, sat: 40, motifs: ['hatch', 'dots', 'steps'] },
  'agriculture-environment': { hue: 94, sat: 38, motifs: ['contour', 'waves', 'dots'] },
  veterinary: { hue: 118, sat: 30, motifs: ['contour', 'dots', 'rings'] },
  health: { hue: 148, sat: 36, motifs: ['dots', 'waves', 'rings'] },
  'natural-sciences': { hue: 172, sat: 42, motifs: ['rays', 'rings', 'contour'] },
  sport: { hue: 190, sat: 52, motifs: ['chevrons', 'rays', 'waves'] },
  'design-architecture': { hue: 200, sat: 14, motifs: ['grid', 'chevrons', 'tiles'] },
  engineering: { hue: 212, sat: 48, motifs: ['grid', 'hatch', 'steps'] },
  mathematics: { hue: 236, sat: 38, motifs: ['arcs', 'rings', 'tiles'] },
  computing: { hue: 262, sat: 42, motifs: ['tiles', 'steps', 'grid'] },
  'arts-music': { hue: 290, sat: 34, motifs: ['waves', 'rays', 'arcs'] },
  languages: { hue: 314, sat: 34, motifs: ['waves', 'arcs', 'weave'] },
  law: { hue: 336, sat: 34, motifs: ['hatch', 'arcs', 'grid'] },
  medicine: { hue: 356, sat: 46, motifs: ['rings', 'dots', 'waves'] },
  interdisciplinary: { hue: 40, sat: 12, motifs: ['rings', 'tiles', 'weave'] },
  other: { hue: 48, sat: 6, motifs: ['hatch', 'tiles', 'dots'] },
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
  return TYPE_LABELS[key] || key || 'Institution';
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
