/**
 * The eligibility engine.
 *
 * Given a Student Profile and an Opportunity, decide one of four outcomes and
 * explain it. This module is pure and dependency-free so the same code runs at
 * build time, in tests, and in the browser — there is exactly one implementation
 * of the rules, and a displayed result is never hand-edited.
 *
 * What it will not do:
 *   - predict whether an offer will be made;
 *   - treat a historical cut-off as a requirement;
 *   - resolve a missing or stale rule in the student's favour.
 *
 * The last one matters most. Silence in the data means "we do not know", and the
 * honest answer to "do I qualify?" when we do not know is NEEDS_REVIEW, not yes.
 *
 * ---------------------------------------------------------------------------
 *
 * There are exactly two ways a requirement can be written, and the difference
 * between them is the whole shape of this file.
 *
 *   1. In IB terms — `ibSubject` + `ibLevel` + `minGrade`. Nothing is
 *      translated, because there is nothing to translate: the source said HL
 *      and the student has HL. This path needs no tables of any kind and is
 *      what a jurisdiction we hold nothing else about gets.
 *
 *   2. On a local scale — `levelScale` naming the scale, plus a `level` valid
 *      on it. The engine looks that scale up in a Recognition Scheme, converts
 *      the Student Profile into it, and compares there.
 *
 * The second path is a translation, and a translation is allowed to become a
 * claim only if the student can see it happen. So every sentence produced on
 * that path says what was converted into what; every sentence produced on the
 * first path says the requirement was already in the student's own units.
 *
 * Nothing in this file knows the name of any country, scale or institution.
 * Every difference between one jurisdiction and another is a difference in the
 * records. `scripts/test-eligibility.mjs` reads this file back off disk and
 * fails if a destination's code, name or vocabulary appears in it.
 * See docs/adr/0002-the-ib-scale-is-the-lingua-franca.md.
 */

export const OUTCOME = {
  MEETS: 'meets',
  POSSIBLE: 'possible-with-action',
  DOES_NOT_MEET: 'does-not-currently-meet',
  NEEDS_REVIEW: 'needs-review',
  /* Every published requirement is met, but the student is below a floor that
     decides one admission route, so only another route is open to them — at
     SDU the entrance test, at AU an assessment on subjects and application.
     Not a green "yes": which route, and what it asks, is the whole answer. */
  OTHER_ROUTE: 'other-route-only',
};

export const OUTCOME_LABEL = {
  [OUTCOME.MEETS]: 'Meets published requirements',
  [OUTCOME.POSSIBLE]: 'Possible with action',
  [OUTCOME.DOES_NOT_MEET]: 'Does not currently meet',
  [OUTCOME.NEEDS_REVIEW]: 'Needs review',
  [OUTCOME.OTHER_ROUTE]: 'Another admission route only',
};

/**
 * Which IB award a published rule says opens an Opportunity.
 *
 * Three states, and the third one is the reason this is an enumeration rather
 * than a boolean. A record that requires the full Diploma and a record that
 * accepts Course Results both say something; a record that says neither says
 * nothing, and the overwhelming majority of records say nothing. Collapsing
 * "nothing is recorded" into "Course Results are fine" would be the single most
 * harmful thing this file could do — a Course candidate reads a door as open,
 * applies, and is refused — so the absence has a name of its own and is carried
 * through to the student as an absence.
 */
export const ENTRY_AWARD = {
  DIPLOMA_REQUIRED: 'diploma-required',
  COURSE_RESULTS_ACCEPTED: 'course-results-accepted',
  NOT_ESTABLISHED: 'not-established',
};

/**
 * Read that state off an Opportunity's own rules. Nothing is inferred from one
 * Opportunity to another, from an institution, or from a jurisdiction: if this
 * record does not carry the rule, this record does not know.
 */
export function entryAward(opportunity) {
  const rules = (opportunity?.requirements || []).filter((r) => r.mandatory !== false);
  if (rules.some((r) => r.kind === 'ib-course-results')) return ENTRY_AWARD.COURSE_RESULTS_ACCEPTED;
  if (rules.some((r) => r.kind === 'ib-diploma')) return ENTRY_AWARD.DIPLOMA_REQUIRED;
  return ENTRY_AWARD.NOT_ESTABLISHED;
}

/** The IB's own two levels. This is the one scale the engine is allowed to hold. */
const IB_LEVEL_RANK = { SL: 1, HL: 2 };

function normalise(s) {
  return String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : -Infinity;
}

/* --- The subject catalogue and the schemes that translate out of it --------- */

/**
 * Index the IB subject catalogue so a profile can name a subject by id or by
 * name, and prepare whatever Recognition Schemes came with it.
 *
 * Accepts either a bare array of IB subjects — the catalogue alone, which is
 * all the IB-terms path needs — or `{ subjects, schemes }`. Both are real
 * inputs: a caller that holds no scheme is not a degraded caller, it is the
 * default case working.
 *
 * The returned value is a Map from id-or-name to a catalogue entry, with the
 * prepared schemes hung off it. It is one object because it is one thing a
 * caller passes around, and because `buildSubjectIndex(subjects)` predates the
 * schemes and still has to mean what it meant.
 */
export function buildSubjectIndex(input = []) {
  const subjects = Array.isArray(input) ? input : input?.subjects || [];
  const schemeRecords = Array.isArray(input) ? [] : input?.schemes || [];
  const institutionRecords = Array.isArray(input) ? [] : input?.institutions || [];

  const index = new Map();
  for (const subject of subjects) {
    const entry = {
      id: subject.id,
      name: subject.name,
      group: subject.group,
      levels: subject.levels || ['HL', 'SL'],
      /* How the subject is written when several courses of one family are
         named together — "Maths HL (AA or AI)". Optional: without them the
         subject's own name is used. */
      short: subject.short || null,
      family: subject.family || null,
      course: subject.course || null,
      /* The subjects a student thinks of as one — every English, both Maths
         courses. When a rule accepts all of them a page says "Any IB English". */
      area: subject.area || null,
    };
    index.set(subject.id, entry);
    index.set(normalise(subject.name), entry);
  }

  /* Every catalogue subject in each area, so "does this rule accept all of
     them?" is a question about the catalogue rather than about a list here. */
  const areas = new Map();
  for (const subject of subjects) {
    if (!subject.area) continue;
    if (!areas.has(subject.area)) areas.set(subject.area, new Set());
    areas.get(subject.area).add(subject.id);
  }
  index.areas = areas;

  /* How many catalogue courses each family has, so a rule that accepts every
     one of them is written as the family alone: "English A", not "English A
     (Literature or Lang & Lit)". */
  const families = new Map();
  for (const subject of subjects) if (subject.family) families.set(subject.family, (families.get(subject.family) || 0) + 1);
  index.families = families;

  const schemes = new Map();
  for (const record of schemeRecords) {
    const scheme = prepareScheme(record);
    if (scheme) schemes.set(scheme.scale, scheme);
  }
  index.schemes = schemes;

  /* An institution's own published additions to a scheme — "Global Politics
     HL: Recognised as Social Science B". They are read before the national
     table's silence, and only for that institution's Opportunities. */
  const institutionRoutes = new Map();
  for (const inst of institutionRecords) {
    const rows = inst?.ibEquivalences || [];
    const quotas = inst?.admissionRoutes || [];
    const raise = prepareRaise(inst?.levelRaise, inst?.shortName || inst?.name || inst?.id);
    if (!inst?.id || (!rows.length && !quotas.length && !raise)) continue;
    institutionRoutes.set(inst.id, { name: inst.name || inst.shortName || inst.id, rows, quotas, raise });
  }
  index.institutionRoutes = institutionRoutes;

  /* The lowest total an IB Diploma is awarded at — IB vocabulary, from the
     catalogue — so a cut-off or floor below it can be said as "any Diploma". */
  index.diplomaMinimumPoints = Array.isArray(input) ? null : input?.diplomaMinimumPoints ?? null;

  /* Asking "what do my subjects count as locally?" without naming a scale is
   * only answerable while exactly one scale is loaded. With two it is a
   * question about a jurisdiction nobody named, and the engine will not pick
   * one — an unnamed scale must never be guessed at, because guessing wrong
   * produces a sentence that looks like a translation and is not one. */
  index.soleScale = schemes.size === 1 ? [...schemes.keys()][0] : null;
  return index;
}

/** Turn a Recognition Scheme record into the lookups the engine wants. */
function prepareScheme(record) {
  const scale = record?.subjectScale?.id;
  if (!scale) return null;

  const rank = new Map();
  for (const level of record.subjectScale.levels || []) rank.set(level.code, level.rank);

  const equivalence = new Map();
  for (const row of record.subjectEquivalence || []) equivalence.set(row.ibSubject, row);

  const withoutEquivalence = new Map();
  const withoutEquivalenceAction = new Map();
  for (const row of record.subjectsWithoutEquivalence || []) {
    withoutEquivalence.set(normalise(row.subject), row.reason);
    if (row.action) withoutEquivalenceAction.set(normalise(row.subject), row.action);
  }

  return {
    id: record.id,
    scale,
    scaleName: record.subjectScale.name || scale,
    gradeScale: record.gradeScale?.id || null,
    /* What a student-facing sentence calls this scheme. The engine has no words
     * of its own for any jurisdiction, so if this is missing the sentence says
     * "the published rules" rather than inventing a nationality. */
    label: record.label || record.name || 'the published rules',
    rank,
    equivalence,
    withoutEquivalence,
    withoutEquivalenceAction,
    /* How a student raises a subject to a level they do not hold, as the
       scheme's authority publishes it. An institution may add its own. */
    // Nobody is named as its owner: the scheme is the table, not the authority that words the route.
    levelRaise: prepareRaise(record.levelRaise, null),
    noEquivalenceNote: record.noEquivalenceNote || 'No equivalent is published.',
    /* The words and the link a page uses when it shows a requirement in this
       scheme's own vocabulary beside its IB translation. Data, because the
       engine has no name for any jurisdiction. */
    requirementLabel: record.display?.requirementLabel || 'As published',
    explainedAt: record.display?.explainedAt || null,
    localOnlyNoun: record.display?.localOnlyNoun || null,
    /* How the grade scale writes its grades, where the scheme says ("02"
       rather than 2). A grade the scale does not list is printed as a number. */
    gradeLabels: new Map((record.gradeScale?.grades || []).map((g) => [Number(g.value), g.label])),
    single: record.gradeConversion?.single?.table || [],
    average: record.gradeConversion?.average?.table || [],
  };
}

/**
 * How a subject level is raised, as one publisher writes it: a default that
 * names no subject, a text per subject where the publisher words it per
 * subject ("You complete a supplementary course in [the language] level A"), the
 * timing that applies to everyone, a timing per applicant group, and what
 * the publisher says about taking more than one. Every part is optional.
 *
 * The parts are kept apart because the round-4 critic found one publisher's
 * Maths sentence attached to every subject: a student missing a language at
 * A level was told to take an online Mathematics course.
 */
function prepareRaise(record, whose = null) {
  if (!record) return null;
  const subjects = new Map();
  for (const s of record.subjects || []) if (s?.subject && s.text) subjects.set(normalise(s.subject), s.text);
  const out = {
    whose,
    text: record.text || null,
    timing: record.timing || null,
    subjects,
    groups: (record.groups || []).filter((g) => g?.applicantGroup &&
      (g.timing || g.text || g.multiple || 'afterResults' in g || g.unknownAfterResults)),
    multiple: record.multiple || null,
    /* How many supplementary courses may be finished after the IB results
       arrive and still count for this intake. Three states: a number the
       publisher is recorded as allowing; null, recorded as not known (the
       national rule allows one "where the programme accepts it", and nobody
       has recorded that VIA does); and absent, which defers to the scheme. */
    afterResults: 'afterResults' in record ? (Number.isInteger(record.afterResults) ? record.afterResults : null) : undefined,
    // The count that would apply if the unrecorded permission were given.
    afterResultsIfAccepted: Number.isInteger(record.afterResultsIfAccepted) ? record.afterResultsIfAccepted : undefined,
    // What a card says where the count is not known.
    unknownAfterResults: record.unknownAfterResults || undefined,
    // Whether the after-results route is recorded as applying in quota 2, and what to ask where it is not.
    quota2AfterResults: record.quota2AfterResults === true,
    quota2Question: record.quota2Question || undefined,
  };
  return out.text || subjects.size ? out : null;
}

/**
 * The action that closes a missing or too-low subject level: the
 * institution's own where it publishes one for this subject (or for every
 * subject), otherwise the Recognition Scheme authority's. Null when neither
 * publishes one, and then nothing is claimed.
 *
 * `text` names the subject asked for or no subject at all, never another one:
 * scripts/test-eligibility.mjs reads every rule in the catalogue through this
 * and fails if it does.
 */
export function levelRaiseFor(rule, subjectIndex, institutionId = null, profile = null) {
  if (!rule?.subject) return null;
  const scheme = rule.levelScale ? subjectIndex?.schemes?.get(rule.levelScale) || null : null;
  const own = institutionId ? subjectIndex?.institutionRoutes?.get(institutionId)?.raise || null : null;
  const key = normalise(rule.subject);
  const groups = Array.isArray(profile?.applicantGroups) && profile.applicantGroups.length
    ? profile.applicantGroups
    : profile?.applicantGroup ? [profile.applicantGroup] : [];

  for (const raise of [own, scheme?.levelRaise]) {
    if (!raise) continue;
    const base = raise.subjects.get(key) || raise.text;
    if (!base) continue;
    /* The first group the profile belongs to that the publisher words its own
       way — "from outside the EU/EEA you must have finished before 5 July". */
    const g = raise.groups.find((x) => groups.includes(x.applicantGroup)) || null;
    const text = [g?.text || base, g?.timing || raise.timing].filter(Boolean).join(' ');
    /* The sentence about more than one course, and the count behind it, are
       chosen for the student's group exactly as the timing is: round 5 found
       SDU's non-EU students told "only one subject … after 5 July" under a
       gap line that said every course must be finished before it. A group's
       own words win; then the publisher's; then the scheme's. */
    const national = raise === own ? scheme?.levelRaise : null;
    const pick = (field) => g?.[field] ?? raise[field] ?? national?.[field] ?? null;
    // Null is an answer here ("not recorded"), so it is not passed over.
    const count = [g, raise, national].find((x) => x && x.afterResults !== undefined && ('afterResults' in x));
    const afterResults = count ? (Number.isInteger(count.afterResults) ? count.afterResults : null) : null;
    return {
      text,
      whose: raise.whose,
      multiple: pick('multiple'),
      afterResults,
      afterResultsIfAccepted: afterResults == null ? pick('afterResultsIfAccepted') ?? 0 : afterResults,
      unknownAfterResults: afterResults == null
        ? pick('unknownAfterResults') || 'Whether this programme lets you finish a course after the IB results is not recorded here — ask the institution; otherwise it has to be passed before your results.'
        : null,
      timing: g?.timing || raise.timing || null,
      quota2AfterResults: raise.quota2AfterResults === true,
      quota2Question: raise.quota2Question || null,
      group: g?.applicantGroup || null,
    };
  }
  return null;
}

function lookupSubject(subjectIndex, name) {
  if (!subjectIndex || !name) return null;
  return subjectIndex.get(name) || subjectIndex.get(normalise(name)) || null;
}

/* --- The profile, in the IB's own units ------------------------------------ */

/**
 * The IB subjects a profile holds, keeping the highest level reached in each
 * and the best grade at that level. No table is consulted and none exists to
 * consult: this is the student's result as the IB awarded it.
 */
export function ibProfile(profile, subjectIndex) {
  const held = new Map();
  const unknownSubjects = [];

  for (const entry of profile?.subjects || []) {
    if (!entry?.subject) continue;
    const found = lookupSubject(subjectIndex, entry.subject);
    if (!found) {
      unknownSubjects.push(entry.subject);
      continue;
    }
    const level = entry.level || found.levels[0];
    const rank = IB_LEVEL_RANK[level] || 0;
    const existing = held.get(found.id);
    if (!existing || rank > existing.rank) {
      held.set(found.id, { id: found.id, name: found.name, level, rank, grade: entry.grade ?? null });
    } else if (rank === existing.rank && num(entry.grade) > num(existing.grade)) {
      existing.grade = entry.grade;
    }
  }

  return { held, unknownSubjects };
}

/* --- The profile, translated onto one local scale --------------------------- */

/**
 * The local-scale subjects a profile counts as under one Recognition Scheme,
 * keeping the highest level reached in each and the best grade at that level.
 *
 * A subject the scheme publishes no equivalent for is not silently dropped — it
 * comes back in `unmappedSubjects` so the interface can say so. That is the
 * difference between a gap recorded as a gap and a gap that looks like an
 * absence of a requirement.
 *
 * `scale` may be omitted, in which case the index's sole scale is used; see
 * buildSubjectIndex for why that is only defined while there is exactly one.
 */
export function convertProfile(profile, subjectIndex, scale = null) {
  const wanted = scale || subjectIndex?.soleScale || null;
  const scheme = wanted ? subjectIndex?.schemes?.get(wanted) || null : null;

  const held = new Map();
  const unknownSubjects = [];
  const unmappedSubjects = [];

  for (const entry of profile?.subjects || []) {
    if (!entry?.subject) continue;
    const found = lookupSubject(subjectIndex, entry.subject);
    if (!found) {
      unknownSubjects.push(entry.subject);
      continue;
    }
    if (!scheme) continue;

    const level = entry.level || found.levels[0];
    const row = scheme.equivalence.get(found.id) || null;
    const targets = row?.maps?.[level] || [];
    if (!targets.length) {
      unmappedSubjects.push({
        name: found.name,
        level,
        scheme: scheme.label,
        reason: row?.unmapped || scheme.noEquivalenceNote,
      });
      continue;
    }

    // A mapping the scheme qualifies at this level ("formally counts as B …").
    const caution = row?.caution && (row.caution.levels || []).includes(level) ? row.caution.text : null;
    for (const target of targets) {
      const rank = scheme.rank.get(target.level) ?? 0;
      const existing = held.get(target.subject);
      if (!existing || rank > existing.rank) {
        held.set(target.subject, {
          level: target.level,
          rank,
          ibId: found.id,
          ibLevel: level,
          ibSubject: `${found.name} ${level}`,
          grade: entry.grade ?? null,
          note: row?.note || null,
          caution,
        });
      } else if (rank === existing.rank && num(entry.grade) > num(existing.grade)) {
        existing.grade = entry.grade;
        existing.ibSubject = `${found.name} ${level}`;
        existing.ibId = found.id;
        existing.ibLevel = level;
        existing.caution = caution;
      }
    }
  }

  return { held, unknownSubjects, unmappedSubjects, scheme, scale: wanted };
}

/**
 * Every applicant group a profile belongs to: its own and every group that
 * contains it, following `within` in data/applicant-groups.json. The engine
 * names no group; the table says that a Nordic citizen is an EU/EEA citizen.
 */
export function applicantGroupsOf(id, groups = []) {
  if (!id) return [];
  const byId = new Map(groups.map((g) => [g.id, g]));
  const out = [];
  const visit = (g) => {
    if (!g || out.includes(g)) return;
    out.push(g);
    for (const parent of byId.get(g)?.within || []) visit(parent);
  };
  visit(id);
  return out;
}

/** An IB subject grade on a Recognition Scheme's single-grade table. */
export function convertGrade(ibGrade, table = []) {
  const row = table.find((r) => r.ib === Number(ibGrade));
  return row ? row.local : null;
}

/**
 * The lowest IB total whose converted average reaches a local average — what a
 * cut-off published on a scheme's grade scale means in IB points. Null when the
 * table does not reach it. `gradeScale` names the scale the figure is on; a
 * figure on a scale no loaded scheme converts is not guessed at.
 */
export function ibPointsFor(value, gradeScale, subjectIndex) {
  const v = Number(String(value ?? '').replace(',', '.'));
  if (!Number.isFinite(v) || !gradeScale) return null;
  for (const scheme of subjectIndex?.schemes?.values() || []) {
    if (scheme.gradeScale !== gradeScale || !scheme.average.length) continue;
    const reaching = scheme.average.filter((r) => Number(r.local) >= v).map((r) => Number(r.ib));
    return reaching.length ? Math.min(...reaching) : null;
  }
  return null;
}

/**
 * A published cut-off beside a student's own total, in IB points. Where even
 * the lowest total a Diploma is awarded at converts above the cut-off, the
 * figure is not printed as points — "last cut-off: 21" brought back a
 * sub-Diploma total (round 4, AAU Chemical Engineering) — and the line says
 * any IB Diploma clears it. A cut-off that is not a figure ("All admitted")
 * has no points and no comparison.
 */
export function cutoffComparison(cutoff, total, subjectIndex) {
  const pts = ibPointsFor(cutoff?.value, cutoff?.scale, subjectIndex);
  const floor = subjectIndex?.diplomaMinimumPoints ?? null;
  const anyDiploma = pts != null && floor != null && pts <= floor;
  const you = total == null || pts == null
    ? null
    : anyDiploma ? `You: ${total} · any IB Diploma clears it` : `You: ${total} · last cut-off: ${pts}`;
  return { points: anyDiploma ? null : pts, anyDiploma, you };
}

/** The scheme whose grade scale a figure is on. */
function schemeForGrade(gradeScale, subjectIndex) {
  for (const scheme of subjectIndex?.schemes?.values() || []) if (scheme.gradeScale === gradeScale) return scheme;
  return null;
}

/**
 * A minimum average — overall, or across named subjects — in IB terms.
 *
 * Overall: the lowest IB total whose converted average reaches it ("at least
 * 28 IB points"), or "any IB Diploma" where even the Diploma's minimum does.
 * One subject: the lowest IB grade that converts to it, in that subject's IB
 * terms ("a 5 in Maths HL (AA or AI)"). Several: the converted grades must
 * average it, and the grade that is enough in each is named.
 */
export function floorTerms(rule, subjectIndex) {
  if (rule?.kind !== 'minimum-average' || rule.minAverage == null) return null;
  const scheme = schemeForGrade(rule.gradeScale, subjectIndex);
  const min = Number(rule.minAverage);
  // An average is written to one decimal ("7.0"), as the institutions write it.
  const label = min.toFixed(1);
  const subjects = rule.averageOf || [];
  const out = { quota: rule.quota || null, min, label, ibText: null, localText: null, ibPoints: null, minIbGrade: null };

  if (!subjects.length) {
    out.localText = `an average of ${label}`;
    const pts = ibPointsFor(min, rule.gradeScale, subjectIndex);
    out.ibPoints = pts;
    const floor = subjectIndex?.diplomaMinimumPoints;
    out.ibText = pts == null
      ? null
      : floor != null && pts <= floor
      ? 'any IB Diploma'
      : `at least ${pts} IB points`;
    return out;
  }

  const reaching = (scheme?.single || []).filter((r) => Number(r.local) >= min).map((r) => Number(r.ib));
  out.minIbGrade = reaching.length ? Math.min(...reaching) : null;
  const names = subjects.map((x) => (x.level ? `${x.subject} ${x.level}` : x.subject));
  out.localText = `${label} in ${orList(names).replace(/ or ([^ ]+)$/, ' and $1')}`;
  if (subjects.length === 1) {
    const terms = subjects[0].level
      ? ibTermsFor({ subject: subjects[0].subject, level: subjects[0].level, levelScale: subjects[0].levelScale }, subjectIndex)
      : null;
    const what = terms?.phrase || subjects[0].subject;
    out.ibText = out.minIbGrade != null ? `a ${out.minIbGrade} in ${what}` : null;
  } else {
    const list = subjects.map((x) => x.subject);
    const joined = `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`;
    out.ibText = out.minIbGrade != null
      ? `${joined} averaging ${label} once converted (a ${out.minIbGrade} in each is enough)`
      : null;
  }
  return out;
}

/** Evaluate a minimum average against a profile, leading with the IB terms. */
function minimumAverageRule(rule, ctx) {
  const terms = floorTerms(rule, ctx.subjectIndex);
  const scheme = schemeForGrade(rule.gradeScale, ctx.subjectIndex);
  if (!terms?.ibText || !scheme) {
    return unsure(`${rule.label || 'A minimum average'} is on a grade scale no Recognition Scheme recorded here converts, so it cannot be checked.`);
  }
  const asked = `As published: ${terms.localText}`;
  const subjects = rule.averageOf || [];

  if (!subjects.length) {
    const pts = ctx.profile.totalPoints;
    /* A Course candidate has no Diploma total to add, and the table converts
       Diploma totals: how Course Results are averaged is not recorded here. */
    if (pts == null && ctx.profile.holdsDiploma === false) {
      return unsure(`Needs ${terms.ibText}. The table converts Diploma totals, and how Course Results are averaged is not recorded here: ask the institution. (${asked}.)`);
    }
    if (pts == null) return unsure(`Needs ${terms.ibText}. Add your predicted total to check. (${asked}.)`, true);
    const avg = convertAverage(pts, scheme.average);
    if (avg == null) return unsure(`${scheme.label} publishes no conversion for ${pts} points, so this cannot be checked.`);
    /* Below a minimum average there is nothing to do before the deadline: it
       is a gap without an action (RUC: "you will receive a rejection letter"). */
    if (avg < terms.min) {
      return unmet(`Needs ${terms.ibText}: your ${pts} points convert to ${avg.toFixed(1)}, below ${terms.label}. (${asked}.)`);
    }
    return met(`Needs ${terms.ibText}: your ${pts} points convert to ${avg.toFixed(1)}. (${asked}.)`);
  }

  const grades = [];
  for (const x of subjects) {
    const have = ctx.converted(x.levelScale).held.get(x.subject);
    const rank = x.level ? scheme && ctx.converted(x.levelScale).scheme?.rank.get(x.level) : null;
    if (!have || (rank != null && have.rank < rank)) {
      return unmet(`Needs ${terms.ibText}, and your profile has no IB subject that counts as ${x.subject}${x.level ? ` ${x.level}` : ''}. (${asked}.)`);
    }
    if (have.grade == null) return unsure(`Needs ${terms.ibText}. Add your grade for ${have.ibSubject} to check. (${asked}.)`, true);
    const c = convertGrade(have.grade, scheme.single);
    if (c == null) return unsure(`${scheme.label} publishes no conversion for an IB grade of ${have.grade}.`);
    grades.push({ name: have.ibSubject, grade: have.grade, local: c });
  }
  const avg = grades.reduce((a, g) => a + g.local, 0) / grades.length;
  // One grade is written as its scale writes it ("02"); an average to one decimal.
  const shown = grades.length === 1 ? gradeLabel(scheme, avg) : avg.toFixed(1);
  const said = grades.map((g) => `${g.name} at ${g.grade}`).join(' and ');
  return avg >= terms.min
    ? met(`Needs ${terms.ibText}: your ${said} convert${grades.length === 1 ? 's' : ''} to ${shown}. (${asked}.)`)
    : unmet(`Needs ${terms.ibText}: your ${said} convert${grades.length === 1 ? 's' : ''} to ${shown}, below ${terms.label}. (${asked}.)`);
}

/** An IB total on a Recognition Scheme's grade-average table. */
export function convertAverage(points, table = []) {
  const row = table.find((r) => r.ib === Number(points));
  return row ? row.local : null;
}

/* --- A local requirement, read back into IB terms ---------------------------- */

/** The IB's levels, lowest first. Read off the one scale the engine holds. */
const IB_LEVELS = Object.keys(IB_LEVEL_RANK).sort((a, b) => IB_LEVEL_RANK[a] - IB_LEVEL_RANK[b]);

/** "a, b or c". */
function orList(parts) {
  if (parts.length <= 1) return parts[0] || '';
  return `${parts.slice(0, -1).join(', ')} or ${parts.at(-1)}`;
}

/**
 * What a requirement published on a local scale asks of an IB student, in the
 * IB's own words.
 *
 * This is the scheme's subject table read backwards. `convertProfile` asks
 * "what does my Physics HL count as locally?"; this asks "which IB subjects,
 * at which level, count as the local level this rule names?" — and it answers
 * from the same rows, so a page that says "Maths HL (AA or AI)" and the engine
 * that grades the student against "Mathematics A" cannot disagree.
 *
 * A higher level covers a lower one, exactly as the engine compares: an IB
 * subject qualifies when the scheme maps it to the named subject at a level
 * whose rank is at least the one required. English B SL maps to B and English
 * B HL to A, so both meet a B requirement; only the second meets an A.
 *
 * A subject the scheme maps nothing onto comes back with `none` set to the
 * scheme's own reason, never with an empty list that reads as "nothing asked".
 *
 * Returns null for a rule that is not written on a local scale: a rule already
 * in IB terms has nothing to translate.
 */
export function ibTermsFor(rule, subjectIndex, institutionId = null) {
  if (!rule?.levelScale || !rule.subject || !rule.level) return null;
  const scheme = subjectIndex?.schemes?.get(rule.levelScale) || null;
  const out = {
    subject: rule.subject,
    level: rule.level,
    local: `${rule.subject} ${rule.level}`,
    localMinGrade: rule.minGrade ?? null,
    localMinGradeLabel: rule.minGrade != null ? gradeLabel(scheme, rule.minGrade) : null,
    scale: rule.levelScale,
    requirementLabel: scheme?.requirementLabel || 'As published',
    explainedAt: scheme?.explainedAt || null,
    localOnlyNoun: scheme?.localOnlyNoun || null,
    schemeLabel: scheme?.label || null,
    options: [],
    schemePhrase: null,
    phrase: null,
    none: null,
    /* The scheme's own "no equivalent", kept when an institution route
       replaces it, so a page can say whose rule it is. */
    nationalNone: null,
    institution: null,
    waiver: null,
    minIbGrade: null,
    gradeNote: null,
    // Met outright by holding the IB Diploma, where the institution says so.
    diplomaExempt: (rule.satisfiedBy || []).map(normalise).includes('ib-diploma'),
  };
  if (!scheme) {
    out.none = 'No Recognition Scheme recorded here covers the scale this is published on, so it cannot be put in IB terms. Check the official page.';
    return out;
  }
  const wantRank = scheme.rank.get(rule.level);
  if (wantRank == null) {
    out.none = `${scheme.scaleName} defines no level called ${rule.level}, so this cannot be put in IB terms.`;
    return out;
  }

  for (const [ibId, row] of scheme.equivalence) {
    const reaches = (lvl) =>
      (row.maps?.[lvl] || []).filter((t) => t.subject === rule.subject).map((t) => scheme.rank.get(t.level) ?? -1);
    const levels = IB_LEVELS.filter((lvl) => reaches(lvl).some((r) => r >= wantRank));
    if (!levels.length) continue;
    const found = lookupSubject(subjectIndex, ibId);
    out.options.push({
      id: ibId,
      name: found?.short || found?.name || ibId,
      family: found?.family || null,
      course: found?.course || null,
      area: found?.area || null,
      levels,
      // The lowest local level it reaches. The option that meets the rule
      // most narrowly is listed first, because it answers "what is the least
      // I need?" — English B before English A for an English B requirement.
      floor: Math.min(...levels.flatMap((lvl) => reaches(lvl).filter((r) => r >= wantRank))),
      note: row.note || null,
      // A mapping the handbook qualifies at some levels ("normally accepted").
      caution: row.caution && levels.some((l) => row.caution.levels.includes(l)) ? row.caution.text : null,
    });
  }
  out.options.sort((a, b) => a.floor - b.floor);

  out.levelRank = wantRank;
  if (out.options.length) out.schemePhrase = ibTermsPhrase(out.options, subjectIndex);
  out.cautions = [...new Set(out.options.map((o) => o.caution).filter(Boolean))];

  const inst = institutionId ? subjectIndex?.institutionRoutes?.get(institutionId) : null;
  const row = (inst?.rows || []).find(
    (r) => r.levelScale === rule.levelScale && r.subject === rule.subject && (scheme.rank.get(r.level) ?? -1) >= wantRank
  );
  if (row) {
    const routes = (row.accepts || []).map((group) =>
      group.map((x) => ({ id: x.ibSubject, name: lookupSubject(subjectIndex, x.ibSubject)?.short || lookupSubject(subjectIndex, x.ibSubject)?.name || x.ibSubject, level: x.ibLevel }))
    );
    out.institution = { name: inst.name, routes, phrase: routesPhrase(routes), note: row.note || null };
  }

  out.phrase = [out.schemePhrase, out.institution?.phrase].filter(Boolean).join('; or ') || null;
  if (!out.phrase) out.none = scheme.withoutEquivalence.get(normalise(rule.subject)) || scheme.noEquivalenceNote;
  else if (!out.schemePhrase) out.nationalNone = scheme.withoutEquivalence.get(normalise(rule.subject)) || scheme.noEquivalenceNote;

  /* "No grade requirement if [the subject] at A-level is passed": which of the
     IB options carry the minimum, and which are free of it. */
  const waiverRank = rule.minGradeWaivedAtLevel != null ? scheme.rank.get(rule.minGradeWaivedAtLevel) : null;
  if (rule.minGrade != null && waiverRank != null && out.options.length) {
    const graded = [];
    for (const o of out.options) {
      const row2 = scheme.equivalence.get(o.id);
      const below = o.levels.filter((lvl) =>
        (row2?.maps?.[lvl] || []).some((t) => t.subject === rule.subject && (scheme.rank.get(t.level) ?? -1) < waiverRank)
      );
      if (below.length) graded.push({ ...o, levels: below });
    }
    out.waiver = {
      level: rule.minGradeWaivedAtLevel,
      rank: waiverRank,
      gradedPhrase: graded.length ? ibTermsPhrase(graded, subjectIndex) : null,
    };
  }

  if (rule.minGrade != null && out.phrase) {
    if (rule.gradeScale && scheme.gradeScale && rule.gradeScale !== scheme.gradeScale) {
      out.gradeNote = `The minimum grade is on a scale ${scheme.label} does not convert, so it cannot be put in IB terms.`;
    } else {
      const reaching = scheme.single.filter((r) => Number(r.local) >= Number(rule.minGrade)).map((r) => Number(r.ib));
      out.minIbGrade = reaching.length ? Math.min(...reaching) : null;
      out.gradeNote = out.minIbGrade != null
        ? `an IB ${out.minIbGrade} converts to ${gradeLabel(scheme, convertGrade(out.minIbGrade, scheme.single))}, the lowest that reaches ${out.localMinGradeLabel}`
        : `${scheme.label} publishes no IB grade that converts to ${out.localMinGradeLabel} or above.`;
    }
  }
  return out;
}

/**
 * What an institution's own routes accept, as a line: single subjects at the
 * same level grouped ("Business Management, Economics or History (SL or HL)"),
 * a combination joined ("Global Politics SL with Economics (SL or HL)").
 */
export function routesPhrase(routes = []) {
  const lv = (level) => (level === 'HL' ? ['HL'] : IB_LEVELS);
  const clauses = [];
  const singles = new Map();
  for (const group of routes) {
    if (group.length === 1) {
      const key = group[0].level;
      if (!singles.has(key)) {
        singles.set(key, []);
        clauses.push({ key });
      }
      singles.get(key).push(group[0].name);
    } else {
      // "Global Politics SL with Economics": the first subject at the lowest level
      // that counts, the ones it is combined with at any level unless only HL does.
      clauses.push({
        text: group.map((x, i) => (x.level === 'HL' || i === 0 ? `${x.name} ${x.level}` : x.name)).join(' with '),
      });
    }
  }
  const out = clauses.map((c) =>
    c.text || (c.key === 'HL' ? orList(singles.get(c.key).map((n) => `${n} HL`)) : withLevels(orList(singles.get(c.key)), lv(c.key)))
  );
  if (out.length <= 1) return out[0] || '';
  return `${out.slice(0, -1).join(', ')}, or ${out.at(-1)}`;
}

/**
 * One requirement as a student reads it in IB terms, grade included: "Maths HL
 * (AA or AI), at least a 4"; "Any IB English: at least a 5 in English B SL,
 * any grade otherwise". `phrase` replaces the subject part where a page has
 * narrowed it (a card drops routes a sibling option already names).
 */
export function ibTermsLine(t, phrase = t?.phrase) {
  if (!t || !phrase) return null;
  if (t.minIbGrade == null) return phrase;
  if (t.waiver) {
    return t.waiver.gradedPhrase
      ? `${phrase}: at least a ${t.minIbGrade} in ${t.waiver.gradedPhrase}, any grade otherwise`
      : phrase;
  }
  return `${phrase}, at least a ${t.minIbGrade}`;
}

/**
 * The IB subjects that meet any one of several single-subject options, as one
 * phrase — for a card, where "History / Economics or Business Management /
 * Global Politics, Geography HL or Anthropology HL" is one choice, not three.
 * Takes the translations of the options (scheme options and an institution's
 * single-subject routes); a combined route ("Global Politics SL with
 * Economics") stays its own clause. Null when an option cannot be flattened.
 */
export function unionPhrase(translations, subjectIndex) {
  const opts = new Map();
  const combos = [];
  const add = (o) => {
    const had = opts.get(o.id);
    if (!had) opts.set(o.id, { ...o, levels: [...o.levels] });
    else for (const l of o.levels) if (!had.levels.includes(l)) had.levels.push(l);
  };
  for (const t of translations) {
    if (!t?.phrase || t.minIbGrade != null || t.diplomaExempt) return null;
    for (const x of t.options || []) add(x);
    for (const g of t.institution?.routes || []) {
      if (g.length === 1) {
        const found = lookupSubject(subjectIndex, g[0].id);
        add({ id: g[0].id, name: g[0].name, family: found?.family || null, course: found?.course || null, area: found?.area || null, levels: g[0].level === 'HL' ? ['HL'] : [...IB_LEVELS] });
      } else combos.push(routesPhrase([g]));
    }
  }
  for (const o of opts.values()) o.levels.sort((a, b) => IB_LEVEL_RANK[a] - IB_LEVEL_RANK[b]);
  /* A combined route closes the list with ", or": a slash inside a list of
     subjects was hard to parse (round 4, AU cards). */
  const parts = [ibTermsPhrase([...opts.values()], subjectIndex), ...combos].filter(Boolean);
  return parts.length <= 1 ? parts[0] || '' : `${parts.slice(0, -1).join(', ')}, or ${parts.at(-1)}`;
}

/** A grade as its scale writes it, or as a number where the scale does not say. */
function gradeLabel(scheme, value) {
  if (value == null) return null;
  return scheme?.gradeLabels?.get(Number(value)) ?? String(value);
}

/** "History (SL or HL)", "Biology HL", "English A (Literature or Lang & Lit), SL or HL". */
function withLevels(name, levels) {
  if (levels.length === 1) return `${name} ${levels[0]}`;
  const both = levels.join(' or ');
  return name.endsWith(')') ? `${name}, ${both}` : `${name} (${both})`;
}

/**
 * The options from `ibTermsFor` as one line a student can scan.
 *
 * Collapsed first: when a rule accepts every catalogue subject in an area at
 * the same levels, the area is named rather than its courses — "Any IB
 * English", "Any IB Maths", or "Maths HL (AA or AI)" where only HL counts.
 * Whether that is true is read off the catalogue's `area`, never decided here.
 * What is left is grouped by level, courses of one family folded together:
 * "History (SL or HL)", "Economics or Business Management (SL or HL)".
 */
export function ibTermsPhrase(options = [], subjectIndex = null) {
  const clauses = [];
  // Per clause, its names one by one — for the flat "a, b or c" form.
  const bare = [];
  const plain = [];
  let rest = options;

  const areas = subjectIndex?.areas || new Map();
  for (const [area, members] of areas) {
    if (members.size < 2) continue;
    const inArea = rest.filter((o) => o.area === area);
    if (inArea.length !== members.size) continue;
    const levels = inArea[0].levels.join(' or ');
    if (!inArea.every((o) => o.levels.join(' or ') === levels)) continue;

    if (inArea[0].levels.length === IB_LEVELS.length) {
      bare.push(clauses.length);
      plain[clauses.length] = [`Any IB ${area}`];
      clauses.push(`Any IB ${area}`);
    } else {
      const families = new Set(inArea.map((o) => o.family));
      const courses = inArea.map((o) => o.course);
      const text = families.size === 1 && courses.every(Boolean) ? `${area} ${levels} (${orList(courses)})` : `${area} ${levels}`;
      plain[clauses.length] = [text];
      clauses.push(text);
    }
    rest = rest.filter((o) => o.area !== area);
  }

  const byLevels = new Map();
  for (const o of rest) {
    const key = o.levels.join('|');
    if (!byLevels.has(key)) byLevels.set(key, []);
    byLevels.get(key).push(o);
  }

  for (const group of byLevels.values()) {
    const levels = group[0].levels;
    const named = [];
    const families = new Map();
    for (const o of group) {
      if (o.family && o.course) {
        if (!families.has(o.family)) {
          families.set(o.family, []);
          named.push({ family: o.family });
        }
        families.get(o.family).push(o.course);
      } else {
        named.push({ name: o.name });
      }
    }
    for (const n of named) {
      if (!n.family) continue;
      const courses = families.get(n.family);
      const whole = courses.length > 1 && subjectIndex?.families?.get(n.family) === courses.length;
      n.name = courses.length === 1 ? `${n.family} ${courses[0]}` : whole ? n.family : `${n.family} (${orList(courses)})`;
      n.whole = whole;
      n.courses = courses;
    }

    // Each name on its own, for a flat list: bare at every level, else with
    // its level — "Geography HL", never "Geography or Anthropology HL".
    plain[clauses.length] = named.map((n) => (levels.length === IB_LEVELS.length ? n.name : `${n.name} ${levels.join(' or ')}`));
    if (levels.length === IB_LEVELS.length) bare.push(clauses.length);
    if (named.length === 1 && named[0].courses?.length > 1 && !named[0].whole && levels.length === 1) {
      clauses.push(`${named[0].family} ${levels[0]} (${orList(named[0].courses)})`);
    } else {
      clauses.push(withLevels(orList(named.map((n) => n.name)), levels));
    }
  }
  if (clauses.length <= 1) return clauses[0] || '';
  /* "English A or English B HL": beside a clause that names a level, a clause
     at every level needs none. */
  /* Several clauses read as one flat list, with the names that need a level
     first so no level can seem to belong to the whole list: "Global Politics
     HL or History", "English B HL or English A". */
  if (bare.length && plain.length === clauses.length && plain.every(Boolean)) {
    const names = plain.flat();
    const levelled = names.filter((n) => / (SL|HL)( \(|$)/.test(n) && !/^Any IB/.test(n));
    return orList([...levelled, ...names.filter((n) => !levelled.includes(n))]);
  }
  return `${clauses.slice(0, -1).join('; ')}; or ${clauses.at(-1)}`;
}

/* --- Evaluating one rule ---------------------------------------------------- */

const met = (message) => ({ status: 'met', message });
/* `extra` carries what the outcome is decided on besides the words: the
   `actions` that would close the gap (each a step a student can name), and
   the `shared` passages a page may say once for many results. */
const unmet = (message, actionable = false, extra = {}) => ({ status: 'unmet', message, actionable, ...extra });
const unsure = (message, actionable = false, extra = {}) => ({ status: 'unknown', message, actionable, ...extra });

/**
 * A step that closes a gap. `kind` is 'raise' (a subject taken to a level as
 * a supplementary course), 'test' (a test the source accepts in its place) or
 * 'route' (another published route, as the source words it). `alsoMeets`
 * names other requirements the same step satisfies, on the source's word —
 * CBS: a Cambridge C1 185 "fulfil[s] both" English B at 6.0 and English A.
 */
const step = (kind, key, text, extra = {}) => ({ kind, key, text, ...extra });

/* More supplementary courses than this in one summer are not treated as a
   plausible action, whatever the publisher allows: a product rule, so that
   "Possible with action" never stands for a year of extra schooling. */
const MAX_RAISES = 2;

/** The sentence of a note that carries a dated deadline ("CBS must have the
    result by 5 July, 12:00"), so a one-line step can keep its date. */
function deadlineOf(text) {
  const m = String(text || '').match(/[^.;]*\b(?:by|on) \d{1,2} [A-Z][a-z]+(?:, \d{1,2}[:.]\d{2})?[^.;]*/);
  if (!m) return null;
  const t = m[0].trim();
  // "The test may be …" reads as a clause after a dash; "CBS must …" keeps its capitals.
  return /^[A-Z][a-z]/.test(t) ? `${t.charAt(0).toLowerCase()}${t.slice(1)}` : t;
}

/** The first sentence of a passage, for a line that points at the rest. */
function firstSentenceOf(text) {
  const m = String(text).match(/^.*?[.!?](?=\s+[A-Z]|$)/);
  return (m ? m[0] : String(text)).trim();
}

/** "a, b and c" — a list a person can read aloud. */
function listOf(parts) {
  if (parts.length <= 1) return parts[0] || '';
  return `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;
}

/** "HL", or "either level" where the source accepts both. */
function ibLevelPhrase(level) {
  return !level || level === 'any' ? 'either level' : level;
}

/**
 * A requirement the source published in IB terms.
 *
 * Nothing is converted here, and the explanation says so, because the value of
 * this path to a student is precisely that no inference of ours sits between
 * the institution's sentence and their transcript.
 */
function ibSubjectRule(rule, ctx) {
  const want = rule.ibSubject;
  if (!want) {
    return unsure('A subject requirement is recorded in IB terms without naming an IB subject.');
  }
  const found = lookupSubject(ctx.subjectIndex, want);
  const label = found?.name || want;
  const wantLevel = rule.ibLevel || 'any';
  const phrase = ibLevelPhrase(wantLevel);
  const have = found ? ctx.ib.held.get(found.id) : null;

  /* An IB subject a student does not hold cannot be added after the fact.
     Only a route the source itself publishes (a deficiency course, a test)
     makes the gap one with an action; without one it is a plain gap. */
  const route = rule.alternativeRoute || null;
  const closeIt = route ? ` To close it: ${route}` : '';
  const gap = (message) => route
    ? unmet(`${message}${closeIt}`, true, { actions: [step('route', `route:${route}`, route)] })
    : unmet(message);

  if (!have) {
    return gap(`You do not have ${label} at any level.`);
  }
  if (wantLevel !== 'any' && have.rank < (IB_LEVEL_RANK[wantLevel] || 0)) {
    return gap(`${label}: this asks for ${phrase} and your profile records ${have.level}.`);
  }

  if (rule.minGrade != null) {
    if (have.grade == null) {
      return unsure(`${label} ${phrase} needs an IB grade of at least ${rule.minGrade}. Add your grade for ${label} to check.`);
    }
    if (num(have.grade) < Number(rule.minGrade)) {
      return gap(
        `${label} ${have.level}: this asks for at least ${rule.minGrade} and your profile records ${have.grade}. Both are IB grades, so nothing is converted.`
      );
    }
    return met(
      `Your ${label} ${have.level} at grade ${have.grade} meets ${phrase} at ${rule.minGrade}. This requirement is published in IB terms, so nothing is converted.`
    );
  }

  return met(
    `Your ${label} ${have.level} meets ${phrase}. This requirement is published in IB terms, so nothing is converted.`
  );
}

/**
 * A requirement the source published in its own vocabulary.
 *
 * Every sentence here names both halves of the translation — what the student
 * holds and what the scheme says it counts as — so that "you meet this" is
 * auditable against the handbook the institution actually follows.
 */
function localEquivalencyRule(rule, ctx) {
  if (!rule.subject || !rule.level) {
    return unsure('A subject requirement is recorded without a subject or level.');
  }
  const named = rule.label || `${rule.subject} ${rule.level}`;
  if (!rule.levelScale) {
    return unsure(`${named} is recorded without naming the scale that level is measured on, so it cannot be checked. A level with no scale is a number with no unit.`);
  }

  const conv = ctx.converted(rule.levelScale);
  const scheme = conv.scheme;
  if (!scheme) {
    return unsure(`${named} is published on a local subject scale that no Recognition Scheme recorded here covers, so your IB subjects cannot be compared with it. Check the official page.`);
  }

  const wantRank = scheme.rank.get(rule.level);
  if (wantRank == null) {
    return unsure(`${named} names a level that ${scheme.scaleName} does not define, so it cannot be checked.`);
  }

  /* Every sentence leads with what the rule means in IB terms and ends with
     the rule as published, so a student reads their own units first and can
     still match the original on the institution's page. */
  const terms = ibTermsFor(rule, ctx.subjectIndex, ctx.institution);
  const asked = `${terms.requirementLabel}: ${terms.local}${rule.minGrade != null ? `, minimum ${terms.localMinGradeLabel}` : ''}${
    terms.waiver ? ` unless held at ${terms.waiver.level} level` : ''
  }`;
  const wanted = ibTermsLine(terms);

  /* The institution exempts IB Diploma holders from this one (SEA: "an
     International Baccalaureate exam … exempt from the requirement"). */
  if (terms.diplomaExempt) {
    if (ctx.profile.holdsDiploma === true) return met(`IB Diploma holders are exempt from this requirement. (${asked}.)`);
    if (ctx.profile.holdsDiploma == null) return unsure(`IB Diploma holders are exempt from this; with Course Results it applies as ${wanted || terms.local}. (${asked}.)`);
  }

  const have = conv.held.get(rule.subject);

  /* The action that closes a missing or too-low level: the institution's own
     where it publishes one, then the scheme authority's. None recorded means
     none is claimed — the gap is then not "possible with action". */
  const raiseFor = levelRaiseFor(rule, ctx.subjectIndex, ctx.institution, ctx.profile);
  const raise = raiseFor ? `${raiseFor.text.charAt(0).toUpperCase()}${raiseFor.text.slice(1)}` : null;
  // Inside a "one of" whose other option is the action (a test), the gap is
  // said without one: the combination names the way in.
  const closeIt = ctx.quiet ? '' : raise ? ` To close it: ${raise}` : ' No published way to close this gap is recorded here.';
  /* The step, keyed by the subject it raises: two gaps are two courses. The
     passage is shared so a page can say it once above many results. */
  const raiseExtra = (phrase) => raise
    ? {
        actions: [step('raise', `raise:${rule.levelScale}:${rule.subject}`, raise, {
          // A supplementary course is taken at a level, so the step names it
          // that way ("Mathematics at A level"); the gap line gives the IB terms.
          subject: rule.subject, level: rule.level, phrase, course: `${rule.subject} at ${rule.level} level`,
          whose: raiseFor.whose, multiple: raiseFor.multiple, afterResults: raiseFor.afterResults,
          afterResultsIfAccepted: raiseFor.afterResultsIfAccepted, unknownAfterResults: raiseFor.unknownAfterResults,
          timing: raiseFor.timing,
          quota2AfterResults: raiseFor.quota2AfterResults, quota2Question: raiseFor.quota2Question,
        })],
        shared: ctx.quiet ? [] : [{ key: `raise:${raise}`, text: raise, short: 'a supplementary course', whose: raiseFor.whose }],
      }
    : {};
  /* A test the source accepts in place of this rule, where the student holds
     the subject but not the grade (CBS: Cambridge C1 185 meets English B at
     6.0 and English A both). */
  const alt = rule.alternativeTest || null;
  const altExtra = alt
    ? { actions: [step('test', `test:${alt.label}`, alt.label, {
        alsoMeets: alt.alsoMeets || [],
        short: [alt.label, deadlineOf(alt.note)].filter(Boolean).join(' — '),
      })] }
    : {};
  const altSaid = alt ? ` The other published way in: ${[alt.label, alt.note].filter(Boolean).join('. ').replace(/\.?$/, '.')}` : '';
  // What the source says of an applicant without it (ITU GBI: "only the programme in Data Science is open to international students").
  const consequence = rule.consequence && !ctx.quiet ? ` ${rule.consequence}` : '';

  /* A subject the student holds at no level, asked for above the scale's
     lowest level (a language at A, a second foreign language at B, from nothing), is
     not counted as one supplementary course: the national rule speaks of "ét
     fag på ét niveau", and nothing recorded says a subject never taken can
     reach B or A in one course. It is counted as at least one course, so a
     plan that does not fit even then is "not met" for this intake; one that
     would fit is a question, never "possible" (round 5). */
  const lowest = Math.min(...scheme.rank.values());
  const fromNothing = (lead) => {
    const x = raiseExtra(wanted || terms.local);
    for (const a of x.actions || []) {
      a.uncertain = true;
      if (rule.consequence) a.consequence = rule.consequence;
    }
    return unmet(
      `${lead} From no ${rule.subject} to ${rule.level} level: whether that can be done as one supplementary course is not recorded here — ask the institution.${consequence} (${asked}.)`,
      true,
      { actions: x.actions, fromNothing: true }
    );
  };

  /* A mapping the scheme itself qualifies at this level ("formally counts as
     B … confirm with the university") is a rule a person must judge, not a
     tick — unless the institution's own record confirms it (round 5: P9's
     language A Literature SL was green at ITU). */
  const confirmedByInstitution = (h) => {
    const rows = ctx.subjectIndex?.institutionRoutes?.get(ctx.institution)?.rows || [];
    return rows.some((r) => r.levelScale === rule.levelScale && r.subject === rule.subject &&
      (r.accepts || []).some((g) => g.length === 1 && g[0].ibSubject === h.ibId && (g[0].ibLevel === h.ibLevel || g[0].ibLevel === 'SL')));
  };
  /* The caution leads, never the permissive half (verification after round
     5: "your [language] A: Literature SL counts as [language] at A level" was the
     line a phone showed). */
  const metOrAsk = (message, h) => (h?.caution && !confirmedByInstitution(h)
    ? unsure(`${h.ibSubject} for ${wanted || terms.local}: ${h.caution.charAt(0).toLowerCase()}${h.caution.slice(1)} (${asked}.)`, false, { caution: true })
    : met(message));

  /* The institution's own route, where the scheme's does not reach. */
  const viaInstitution = () => {
    const routes = terms.institution?.routes || [];
    for (const group of routes) {
      const held = group.map((x) => ctx.ib.held.get(x.id));
      if (held.every((h, i) => h && h.rank >= (IB_LEVEL_RANK[group[i].level] || 0))) return held;
    }
    return null;
  };
  if (terms.institution && (!have || have.rank < wantRank)) {
    const held = viaInstitution();
    const whose = `${terms.institution.name}'s own rule`;
    if (!held) {
      if (!have && wantRank > lowest && raise) return fromNothing(`This needs ${wanted} (${whose}), and your profile has none of these.`);
      return unmet(`This needs ${wanted} (${whose}), and your profile has none of these.${closeIt} (${asked}.)`, !!raise, raiseExtra(wanted));
    }
    const names = held.map((h) => `${h.name} ${h.level}`).join(' with ');
    if (rule.minGrade != null) {
      const grade = held[0].grade;
      if (grade == null) return unsure(`This needs ${wanted}. Add your grade for ${held[0].name} to check. (${asked}.)`);
      const converted = convertGrade(grade, scheme.single);
      if (converted == null || converted < Number(rule.minGrade)) {
        return unmet(`This needs ${wanted}. Your ${held[0].name} at ${grade} converts to ${gradeLabel(scheme, converted)}, below the ${terms.localMinGradeLabel} asked for. (${asked}.)`);
      }
    }
    return met(`Needs ${wanted}: your ${names} meets it under ${whose}. (${asked}.)`);
  }

  if (!have) {
    const reason = scheme.withoutEquivalence.get(normalise(rule.subject));
    const action = scheme.withoutEquivalenceAction.get(normalise(rule.subject));
    /* No IB subject reaches it. With a published question to ask (Social
       Studies: "ask the admissions office"), that is a question; without one
       it is not a way in for an IB student at all (Geoscience A), and a "one
       of" must not let it hide the option that is (round 4: a missing
       Physics was shown as a Geoscience "?"). */
    if (reason) return unsure(`No IB subject is equivalent to ${terms.local}. ${action || reason} (${asked}.)`, false, action ? {} : { noIbRoute: true, local: terms.local });
    if (!wanted) return unmet(`No IB subject is equivalent to ${terms.local}: ${terms.none} (${asked}.)`, false, { noIbRoute: true, local: terms.local });
    if (wantRank > lowest && raise) return fromNothing(`This needs ${wanted}, and your profile has none.`);
    return unmet(`This needs ${wanted}, and your profile has none.${closeIt}${consequence} (${asked}.)`, !!raise, raiseExtra(wanted));
  }
  if (have.rank < wantRank) {
    return unmet(
      `This needs ${wanted || terms.local}. Your ${have.ibSubject} counts only as ${rule.subject} at ${have.level} level.${closeIt} (${asked}.)`,
      !!raise,
      raiseExtra(wanted || terms.local)
    );
  }
  // The scheme's own qualification of this mapping, said where it is used.
  const caution = have.caution ? ` ${have.caution}` : '';

  if (rule.minGrade != null && terms.waiver && have.rank >= terms.waiver.rank) {
    return metOrAsk(
      `Needs ${wanted}: your ${have.ibSubject} counts as ${rule.subject} at ${have.level} level, where no minimum grade applies.${caution} (${asked}.)`,
      have
    );
  }

  if (rule.minGrade != null) {
    if (have.grade == null) {
      return unsure(
        `This needs ${wanted || terms.local}. Add your grade for ${have.ibSubject} to check. (${asked}.)`
      );
    }
    const converted = convertGrade(have.grade, scheme.single);
    if (converted == null) {
      return unsure(`${scheme.label} publishes no conversion for an IB grade of ${have.grade}, so this cannot be checked.`);
    }
    if (converted < Number(rule.minGrade)) {
      const said = `This needs ${wanted || terms.local}. Your ${have.ibSubject} at ${have.grade} converts to ${gradeLabel(scheme, converted)}, below the ${terms.localMinGradeLabel} asked for.`;
      if (alt && !ctx.quiet) return unmet(`${said}${altSaid} (${asked}.)`, true, altExtra);
      return unmet(
        `${said}${ctx.quiet ? '' : ' Nothing recorded here replaces this grade: it has to come from your Diploma.'} (${asked}.)`,
        false
      );
    }
    return metOrAsk(
      `Needs ${wanted || terms.local}: your ${have.ibSubject} at ${have.grade} counts as ${rule.subject} at ${have.level} level and the grade converts to ${gradeLabel(scheme, converted)}, at or above ${terms.localMinGradeLabel}.${caution} (${asked}.)`,
      have
    );
  }

  return metOrAsk(
    `Needs ${wanted || terms.local}: your ${have.ibSubject} counts as ${rule.subject} at ${have.level} level${have.level !== rule.level ? `, which covers ${rule.level}` : ''}.${caution} (${asked}.)`,
    have
  );
}

/**
 * @returns {{status:'met'|'unmet'|'unknown', message:string, actionable?:boolean}}
 */
function evaluateRule(rule, ctx) {
  const { profile } = ctx;

  switch (rule.kind) {
    /* The two rules about which IB award opens the door.
     *
     * The unmet sentence used to name one jurisdiction's supplementary-subject
     * route in the code. It was accurate where it came from and false
     * everywhere else, and it was shown on every Opportunity that asked for the
     * Diploma, including ones whose own source says in as many words that
     * Course Results are not accepted at all. The route a source publishes is
     * now carried by the record that published it, and this says only what is
     * true of every such rule: the award asked for is the Diploma. */
    case 'ib-diploma':
      if (profile.holdsDiploma === true) return met('You expect to hold the full IB Diploma, which this asks for.');
      if (profile.holdsDiploma === false) {
        /* A route counts as an action only where the record says it opens
           before 21 (`reachesAtEighteen`): a colloquium doctum at 21 is a
           route, not a step before this intake's deadline. The words are said
           either way. The long passage is shared, so a page can say it once. */
        const route = rule.alternativeRoute || null;
        const soon = !!route && rule.alternativeRouteSummary?.reachesAtEighteen === true;
        return unmet(
          `This asks for the full IB Diploma, and Course Results on their own do not satisfy it.${
            route ? ` ${route}` : ' No other route to this one is recorded here, so ask the institution what it will accept before you rule it out.'
          }`,
          soon,
          route
            ? {
                ...(soon ? { actions: [step('route', `route:${route}`, rule.alternativeRouteSummary.short, {
                  /* A Course Results route to a university bachelor that needs
                     further raises after the results arrive is a later intake: only a record that
                     says it can be done for this intake makes it a step for it. */
                  withinIntake: rule.alternativeRouteSummary.withinIntake === true,
                })] } : {}),
                shared: [{ key: `route:${route}`, text: route, short: rule.alternativeRouteSummary?.short || firstSentenceOf(route), whose: null }],
              }
            : {}
        );
      }
      return unsure('Whether you will hold the full Diploma or Course Results is not recorded in your profile. Answer that question and this becomes a yes or a no.');

    /* The positive half, and the only thing in the model that can say Course
     * Results reach something. A source that accepts them almost always
     * attaches conditions — how many subjects, how many at HL, a floor under
     * every grade, a floor under the total — because Course Results have no
     * fixed shape the way a Diploma does. Those conditions are checked, and
     * where the profile cannot answer one the rule says so rather than passing:
     * "Course Results are accepted here" is exactly the sentence that must not
     * be said on a guess. */
    case 'ib-course-results': {
      if (profile.holdsDiploma === true) {
        return met('You expect to hold the full IB Diploma, which clears this.');
      }
      if (profile.holdsDiploma !== false) {
        return unsure('Whether you will hold the full Diploma or Course Results is not recorded in your profile. Answer that question and this becomes a yes or a no.');
      }

      const held = [...ctx.ib.held.values()];
      const conditions = [];
      const shortfalls = [];
      const missing = [];

      if (rule.minSubjects != null) {
        conditions.push(`${rule.minSubjects} graded subjects`);
        if (held.length < rule.minSubjects) {
          shortfalls.push(`it counts ${rule.minSubjects} graded subjects and your profile records ${held.length}`);
        }
      }
      if (rule.minHigherLevelSubjects != null) {
        const higher = held.filter((s) => s.level === 'HL').length;
        conditions.push(`${rule.minHigherLevelSubjects} of them at HL`);
        if (higher < rule.minHigherLevelSubjects) {
          shortfalls.push(`it asks for ${rule.minHigherLevelSubjects} subjects at HL and your profile records ${higher}`);
        }
      }
      if (rule.minGrade != null) {
        conditions.push(`at least ${rule.minGrade} in every subject`);
        const below = held.filter((s) => s.grade != null && num(s.grade) < Number(rule.minGrade));
        const ungraded = held.filter((s) => s.grade == null);
        if (below.length) {
          shortfalls.push(
            `every subject must reach ${rule.minGrade} and your profile records ${below
              .map((s) => `${s.name} at ${s.grade}`)
              .join(', ')}`
          );
        } else if (ungraded.length) {
          missing.push(`a grade for ${ungraded.map((s) => s.name).join(', ')}`);
        }
      }
      /* Course Results carry no Diploma total and no bonus points: their
         points are the subject grades added up. Six graded subjects answer
         the question, so the student is not asked for a "predicted total"
         they will never be awarded (round 4). */
      const graded = held.filter((s) => s.grade != null);
      const needed = rule.minSubjects ?? 6;
      const summed = held.length >= needed && graded.length === held.length
        ? graded.reduce((n, s) => n + num(s.grade), 0)
        : null;
      const points = profile.totalPoints ?? summed;
      const whose = profile.totalPoints != null ? 'your profile says' : `your ${held.length} grades add up to`;
      if (rule.minPoints != null) {
        conditions.push(`${rule.minPoints} points in total`);
        if (points == null) missing.push(held.length < needed ? `all ${needed} subjects with their grades` : 'your grades');
        else if (points < Number(rule.minPoints)) {
          shortfalls.push(`it needs ${rule.minPoints} points and ${whose} ${points}`);
        }
      }

      const asks = conditions.length ? ` It asks for ${listOf(conditions)}.` : '';
      if (shortfalls.length) {
        // A shortfall in awarded grades is not something a step before the deadline changes.
        return unmet(`Course Results are accepted here, but not as your profile stands: ${listOf(shortfalls)}.`);
      }
      if (missing.length) {
        return unsure(`Course Results are accepted here.${asks} Add ${listOf(missing)} to check that you clear it.`);
      }
      return met(`Course Results are accepted here and your profile clears the conditions${
        summed != null && profile.totalPoints == null ? ` (your ${held.length} grades add up to ${summed})` : ''
      }.${asks}`);
    }

    case 'ib-total-points': {
      const need = rule.minPoints;
      if (need == null) return unsure('A points requirement is recorded without a threshold.');
      if (profile.totalPoints == null) {
        return unsure(`This needs at least ${need} points. Add your predicted total to check.`);
      }
      /* A total below the minimum names no step: predicted points are not an
         action. Only a route the source publishes makes it one. */
      if (profile.totalPoints >= need) return met(`${profile.totalPoints} points meets the minimum of ${need}.`);
      return rule.alternativeRoute
        ? unmet(`This needs at least ${need} points and your profile says ${profile.totalPoints}. To close it: ${rule.alternativeRoute}`, true,
          { actions: [step('route', `route:${rule.alternativeRoute}`, rule.alternativeRoute)] })
        : unmet(`This needs at least ${need} points and your profile says ${profile.totalPoints}.`);
    }

    case 'ib-subject':
      return ibSubjectRule(rule, ctx);

    case 'local-equivalency':
      return localEquivalencyRule(rule, ctx);

    case 'minimum-average':
      return minimumAverageRule(rule, ctx);

    case 'subject-combination': {
      const groups = rule.alternatives || [];
      if (!groups.length) return unsure('A combination requirement is recorded without alternatives.');

      /* Every option, scored: a gap counts 10, a question 1. An option no IB
         subject can reach (Geoscience A) is not a question but a closed door,
         so it counts as a gap too — and on a tie the option whose gaps each
         have a step wins, so a missing Physics is named rather than hidden
         behind a Geoscience "?" (round 4). */
      const scored = groups.map((group) => {
        const results = group.map((r) => evaluateRule(r, ctx));
        const unmetOnes = results.filter((r) => r.status === 'unmet');
        const closed = results.filter((r) => r.status === 'unknown' && r.noIbRoute);
        const unknown = results.filter((r) => r.status === 'unknown' && !r.noIbRoute);
        const stuck = unmetOnes.filter((r) => !r.actionable).length + closed.length;
        return { score: (unmetOnes.length + closed.length) * 10 + unknown.length, stuck, unmet: unmetOnes, closed, unknown, group, results };
      });
      const best = [...scored].sort((a, b) => a.score - b.score || a.stuck - b.stuck)[0];
      if (best.score === 0) {
        /* The option that met it leads; "one of n" follows (verification
           after round 5: "One of the 5 accepted options is met." said nothing). */
        return met(`${best.results.map((r) => r.message).join(' ')} (One of the ${groups.length} accepted options.)`);
      }
      /* What is left is a test the student can go and take (CBS: English B at
         6.0 plus IELTS 7.0; ITU: an approved test in place of the grade). That
         is a gap with an action, not a question we cannot answer. Every
         option that is only a test away is named. */
      const testOnly = (o) => o.unmet.length === 0 && o.closed.length === 0 &&
        o.results.every((r, i) => r.status === 'met' || o.group[i].kind === 'test');
      if (best.unmet.length === 0 && best.closed.length === 0) {
        const tests = scored.filter((o) => testOnly(o) && o.score === best.score);
        if (tests.length && groups.length > 1) {
          // What the subject route lacks, in IB terms, then the published test.
          let closest = null;
          for (const group of groups) {
            if (tests.some((o) => o.group === group)) continue;
            const results = group.map((r) => evaluateRule(r, { ...ctx, quiet: true })).filter((r) => r.status === 'unmet');
            if (results.length && (!closest || results.length < closest.length)) closest = results;
          }
          const lacking = closest ? `${closest.map((r) => r.message).join(' ')} ` : '';
          const named = tests.map((o) => o.group.filter((r) => r.kind === 'test').map((r) => [r.label, r.note].filter(Boolean).join('. ')).join(' and '));
          const key = tests.map((o) => o.group.filter((r) => r.kind === 'test').map((r) => r.label).join(' + ')).join(' / ');
          return unmet(
            `${lacking}The other published way${named.length > 1 ? 's' : ''} in: ${named.join('; or ')}`.replace(/\.?$/, '.'),
            true,
            { actions: [step('test', `test:${key}`, named.join('; or '), {
              short: tests.map((o) => o.group.filter((r) => r.kind === 'test').map((r) => [r.label, deadlineOf(r.note)].filter(Boolean).join(' — ')).join(' and ')).join('; or '),
            })] }
          );
        }
        return unsure(best.unknown.map((r) => r.message).join(' '));
      }
      if (best.unmet.length === 0) {
        // Every option is a door no IB subject opens.
        return unsure([...best.closed, ...best.unknown].map((r) => r.message).join(' '));
      }
      /* The gap, named. Options no IB subject can reach are said after it, as
         what they are, rather than standing in for it. */
      const actionable = best.unmet.every((r) => r.actionable);
      const others = scored.filter((o) => o !== best);
      const closedOthers = others.filter((o) => o.unmet.length === 0 && o.closed.length && !o.unknown.length);
      /* The gap first, so its first sentence is the line a phone shows; which
         combination it is comes after (round 5: "The closest needs: Needs …"). */
      const lead = others.length && closedOthers.length === others.length
        ? ''
        : ` (None of the ${groups.length} accepted combinations is complete; this is the closest.)`;
      const closedSaid = closedOthers.length && !lead
        ? ` The other option${closedOthers.length > 1 ? 's' : ''}, ${orList(closedOthers.flatMap((o) => o.closed.map((r) => r.local || 'one with no IB subject')))}, ${closedOthers.length > 1 ? 'have' : 'has'} no IB equivalent, so ${closedOthers.length > 1 ? 'they are' : 'it is'} not a way in.`
        : '';
      const consequence = !actionable && rule.consequence ? ` The published rule: "${rule.consequence}"` : '';
      return unmet(
        `${best.unmet.map((r) => r.message).join(' ')}${lead}${closedSaid}${consequence}`,
        actionable,
        actionable
          ? { actions: best.unmet.flatMap((r) => r.actions || []), shared: best.unmet.flatMap((r) => r.shared || []), fromNothing: best.unmet.some((r) => r.fromNothing) }
          : { shared: best.unmet.flatMap((r) => r.shared || []) }
      );
    }

    case 'language-general':
    case 'language-programme': {
      const languages = (profile.languages || []).map(normalise);

      /* Exemptions, before anything else.
       *
       * Most English-taught degrees in Europe require a documented English test
       * and then exempt IB Diploma holders from it. Recording only the test is
       * technically true and practically a lie for this site's entire audience:
       * the engine cannot evaluate "documented IELTS 6.5", so it answers
       * "unknown", and a student who is explicitly exempt is shown Needs review
       * on a programme they qualify for. One general engineering programme did
       * exactly that until this was added.
       *
       * `satisfiedBy` is the schema's existing field for "named alternative
       * ways to meet it", which is precisely what an exemption is. */
      const satisfiedBy = (rule.satisfiedBy || []).map(normalise);
      if (satisfiedBy.includes('ib-diploma')) {
        if (profile.holdsDiploma === true) {
          return met('Holders of a full IB Diploma are exempt from this requirement.');
        }
        if (profile.holdsDiploma === false) {
          /* Where the record says the exemption's reach is an open question
             (SEA exempts "an International Baccalaureate exam"), the question
             is what the student is told. */
          if (rule.openQuestion) return unsure(`${rule.label || 'A language requirement'} — ${rule.openQuestion}`);
          return unsure(
            `${rule.label || 'A language requirement'} — the exemption is for full IB Diploma holders, so with Course Results you would need to meet it directly. Check the official page.`
          );
        }
      }

      /* A language requirement may be pinned to a subject. If it names a local
       * scale it is read on that scale like any other rule; if it names an IB
       * subject it is read directly; otherwise it is documentation we cannot
       * see and the honest answer is that we cannot see it. */
      if (rule.subject && rule.levelScale) {
        const conv = ctx.converted(rule.levelScale);
        const have = conv.held.get(rule.subject);
        const want = rule.level ? conv.scheme?.rank.get(rule.level) : null;
        if (conv.scheme && have && (want == null || have.rank >= want)) {
          const said = `${rule.subject}${rule.level ? ` ${rule.level}` : ''} is covered by your ${have.ibSubject}.`;
          // A mapping the scheme qualifies is a question, not a tick (round 5).
          if (have.caution) return unsure(`${said} ${have.caution}`, false, { caution: true });
          return met(said);
        }
      } else if (rule.ibSubject) {
        const found = lookupSubject(ctx.subjectIndex, rule.ibSubject);
        if (found && ctx.ib.held.has(found.id)) {
          return met(`${found.name} is covered by your IB subjects.`);
        }
      }
      if (rule.label && languages.some((l) => normalise(rule.label).includes(l))) {
        return met(`Your profile records ${rule.label}.`);
      }
      /* A rule whose basis the record says it could not quote (Maastricht's
         English exemption "rests on a pattern rather than on a quoted
         sentence") is the question the record asks, never a tick. */
      if (rule.openQuestion) return unsure(`${rule.label || 'A language requirement'} — ${rule.openQuestion}`);
      return unsure(
        `${rule.label || 'A language requirement'} — this depends on documentation the profile does not hold. Check the official page.`
      );
    }

    case 'citizenship':
    case 'residency': {
      if (!profile.applicantGroup) {
        return unsure(`${rule.label || 'An applicant-status requirement'} — your fee status is not recorded.`);
      }
      const group = rule.applicability?.applicantGroup;
      /* A Nordic citizen is also an EU/EEA citizen. Which group contains which
         is data (data/applicant-groups.json), expanded by the caller into
         `applicantGroups`; without it the profile belongs to its one group. */
      const mine = Array.isArray(profile.applicantGroups) && profile.applicantGroups.length
        ? profile.applicantGroups
        : [profile.applicantGroup];
      if (!group || group === 'any' || mine.includes(group)) {
        return met(`${rule.label || 'Applicant status'} applies to you.`);
      }
      return unmet(`${rule.label || 'This rule'} applies to ${group} applicants, and your profile says ${profile.applicantGroup}.`);
    }

    case 'test':
    case 'portfolio':
    case 'audition':
    case 'interview':
    case 'essay':
    case 'reference':
    case 'work-sample':
    case 'activity':
      return unsure(
        `${rule.label || rule.kind} — this is assessed by the institution and cannot be checked from your subjects alone.`,
        true
      );

    default:
      return unsure(
        rule.label ? `${rule.label} — not something this tool can check.` : 'A requirement of an unrecognised kind.'
      );
  }
}

/**
 * Whether every gap can be closed by a named step in time for this intake,
 * and what the steps are. Null when a gap names no step at all.
 *
 *   - every gap must carry a step (a gap that is only "actionable" names
 *     nothing, and "Possible with action" has to say what the action is);
 *   - a step the source says also meets another requirement closes that one
 *     too (CBS's Cambridge C1 185: English B at 6.0 and English A);
 *   - one test or route is possible, unless the record does not say the route
 *     can be completed for this intake (`withinIntake`);
 *   - supplementary courses are possible only as many as the publisher lets
 *     this student's applicant group finish after the IB results arrive
 *     (`afterResults`), and never more than MAX_RAISES, which is this site's
 *     own limit. The student is in DP2: a course that must be passed before
 *     the results is not a step for this intake (round 5).
 *
 * Returns { possible, lead, summary }: `lead` is what the planner prints
 * before the summary — "To do" when possible, "For 2027" or "Our limit" when
 * the steps exist but do not fit.
 */
function planSteps(gaps) {
  if (!gaps.length || !gaps.every((g) => g.actionable && g.actions?.length)) return null;
  const covered = new Set();
  for (const g of gaps) {
    for (const a of g.actions) {
      for (const id of a.alsoMeets || []) if (gaps.some((x) => x !== g && x.id === id)) covered.add(id);
    }
  }
  const steps = new Map();
  for (const g of gaps.filter((x) => !covered.has(x.id))) for (const a of g.actions) if (!steps.has(a.key)) steps.set(a.key, a);
  const list = [...steps.values()];
  const raises = list.filter((a) => a.kind === 'raise');
  const others = list.filter((a) => a.kind !== 'raise');

  if (others.some((a) => a.withinIntake === false)) {
    return {
      possible: false,
      lead: 'For 2027',
      summary: 'Nothing recorded here says this route can be completed in time for the 2027 intake, so it counts toward a later one.',
    };
  }
  if (others.length && raises.length) return null;
  if (others.length > 1) return null;
  if (others.length === 1) {
    /* Every "possible" card says its step in one line, single steps too
       (verification after round 5: a collapsed card showed none). */
    const said = others[0].short || others[0].text;
    return {
      possible: true,
      lead: 'To do',
      summary: covered.size
        ? `One step closes ${gaps.length === 2 ? 'both' : `all ${gaps.length}`}: ${said}`.replace(/\.?$/, '.')
        : `${said}`.replace(/\.?$/, '.'),
    };
  }

  const n = raises.length;
  const courses = `${n} supplementary course${n === 1 ? '' : 's'}: ${listOf(raises.map((a) => a.course || a.phrase))}.`;
  const multiple = raises.find((a) => a.multiple)?.multiple || null;
  /* A count the publisher is recorded as allowing, or — where it is not
     recorded — the count that would apply if it were: a plan that fits only
     then is a question ("To check"), never "possible". */
  const known = raises.every((a) => Number.isInteger(a.afterResults));
  const allowed = Math.min(...raises.map((a) => (Number.isInteger(a.afterResults) ? a.afterResults : a.afterResultsIfAccepted ?? 0)));
  const unknownSaid = [...new Set(raises.filter((a) => !Number.isInteger(a.afterResults)).map((a) => a.unknownAfterResults).filter(Boolean))].join(' ');
  /* A subject from nothing is counted as one course, but that it is one is
     not established: a plan that fits only on that count is a question. */
  const uncertain = raises.some((a) => a.uncertain);
  if (n <= allowed && n > MAX_RAISES) {
    /* Only where the publisher would allow more: our cap is then the reason, and it says so. */
    return {
      possible: false,
      lead: 'Our limit',
      summary: `${courses} That is more than one intake allows: this site counts at most ${MAX_RAISES} supplementary courses as "possible with action". It is our limit, not the university's.`,
    };
  }
  if (n <= allowed) {
    const fromNothing = raises.filter((a) => a.uncertain).map((a) => a.subject);
    /* What the institution itself says of a student without the subject
       leads (ITU GBI: "only the programme in Data Science is open to
       international students"), before any course count. */
    const said = [...new Set(raises.filter((a) => a.uncertain && a.consequence).map((a) => a.consequence.trim()))];
    if (said.length) {
      return { possible: true, uncertain: true, lead: 'To check', summary: said.join(' '), raises };
    }
    const questions = [
      fromNothing.length ? `Whether ${fromNothing.join(' and ')} from nothing can be done in one course is not recorded here.` : '',
      known ? '' : unknownSaid,
    ].filter(Boolean).join(' ');
    return {
      possible: true,
      raises,
      uncertain: uncertain || !known,
      lead: uncertain || !known ? 'To check' : 'To do',
      summary: questions
        ? `${courses} ${questions}`
        : n === 1 ? `${raises[0].course || raises[0].phrase} as a supplementary course.${raises[0].timing ? ` ${raises[0].timing}` : ''}` : `${courses} ${multiple || ''}`.trim(),
    };
  }
  const before = n - allowed;
  /* Where the count is not recorded, "1 of them" would state a permission
     nobody has recorded: it is "at least" that many, and all of them unless
     the programme lets a course be finished after the results
     (verification 2 after round 5). */
  const who = before === n
    ? (n === 1 ? 'It has' : 'All of them have')
    : known
      ? `${before} of them ${before === 1 ? 'has' : 'have'}`
      : `At least ${before} of them (all of them, unless the programme lets you finish courses after the results) ${before === 1 ? 'has' : 'have'}`;
  return {
    possible: false,
    lead: 'For 2027',
    summary: `${courses} ${who} to be passed before your IB results arrive — in practice during DP2, or by applying for 2028.${known && multiple ? ` ${multiple}` : ''}`,
  };
}

/* The one line a collapsed card shows under its badge. A "possible" card
   says its step; a card whose plan depends on an open question says the
   question (once — verification 2: Maastricht's deadline was said twice);
   every other "Needs review" card says the first thing to check, so no
   collapsed card hides the reason for its verdict. */
function summaryOf(outcome, plan, unknowns, dataIssues, floors) {
  const blocking = unknowns.filter((u) => u.blocksPlan).map((u) => u.message);
  if (plan?.summary && outcome === OUTCOME.POSSIBLE) return plan.summary;
  if (plan?.summary && outcome === OUTCOME.DOES_NOT_MEET && !plan.possible) return plan.summary;
  if (outcome === OUTCOME.NEEDS_REVIEW) {
    if (plan?.possible && !plan.uncertain && blocking.length) return blocking.join(' ');
    if (plan?.possible && plan.summary) return plan.summary;
    const first = dataIssues[0] || unknowns[0]?.message || floors.find((f) => f.status === 'unknown')?.message || null;
    // The question itself, without the published form in brackets that closes it.
    return first ? first.replace(/\s*\((?:[A-Z][^()]*requirement|As published)[^()]*\)\.?\s*$/, '').trim() : null;
  }
  return null;
}
function leadOf(outcome, plan, unknowns) {
  if (outcome === OUTCOME.NEEDS_REVIEW) return 'To check';
  if (outcome === OUTCOME.POSSIBLE) return plan?.lead || 'To do';
  if (outcome === OUTCOME.DOES_NOT_MEET && plan && !plan.possible) return plan.lead;
  return null;
}

/* --- Evaluating an Opportunity ---------------------------------------------- */

/**
 * @param {object} profile  { subjects:[{subject,level,grade}], totalPoints, holdsDiploma, applicantGroup, languages }
 * @param {object} opportunity  a canonical Opportunity record
 * @param {object} options  { subjectIndex, evidenceStatus, dataVersion }
 */
export function assess(profile, opportunity, options) {
  const { subjectIndex, evidenceStatus = () => null, dataVersion = null } = options;

  /* Each local scale a rule names is converted into once, on demand. An
   * Opportunity whose requirements are all in IB terms converts into nothing,
   * which is the point: the default path consults no table. */
  const conversions = new Map();
  const ctx = {
    profile,
    subjectIndex,
    // Whose own additions to a scheme apply (institutionRoutes, above).
    institution: opportunity.institution || null,
    ib: ibProfile(profile, subjectIndex),
    converted(scale) {
      if (!conversions.has(scale)) conversions.set(scale, convertProfile(profile, subjectIndex, scale));
      return conversions.get(scale);
    },
  };

  /* A floor scoped to one quota ("to be assessed in quota 1") does not decide
     eligibility: below it a student can still be admitted in quota 2. It is
     evaluated, reported in `floors`, and raised as a caveat — never a gap. */
  const scoped = (r) => r.kind === 'minimum-average' && r.quota;
  const mandatory = (opportunity.requirements || []).filter((r) => r.mandatory !== false && !scoped(r));
  const floors = (opportunity.requirements || []).filter(scoped).map((r) => {
    const res = evaluateRule(r, ctx);
    return { id: r.id, quota: r.quota, status: res.status, message: res.message, terms: floorTerms(r, subjectIndex) };
  });
  const selectionFactors = (opportunity.requirements || []).filter((r) => r.mandatory === false);

  const matched = [];
  const gaps = [];
  const unknowns = [];

  for (const rule of mandatory) {
    const result = evaluateRule(rule, ctx);
    const entry = {
      id: rule.id,
      label: rule.label || rule.kind,
      kind: rule.kind,
      message: result.message,
      actionable: !!result.actionable,
      actions: result.actions || [],
      shared: result.shared || [],
      fromNothing: !!result.fromNothing,
      evidence: rule.evidence || [],
      officialWording: rule.officialWording?.text || null,
    };
    if (result.status === 'met') matched.push(entry);
    else if (result.status === 'unmet') gaps.push(entry);
    else unknowns.push(entry);
    /* A question the record leaves open for one applicant group (Maastricht's
       deficiency date for applicants from outside the EU/EEA): said as a "?"
       to that group, and a plan that depends on it is a question too. */
    const groupsOf = Array.isArray(profile.applicantGroups) && profile.applicantGroups.length ? profile.applicantGroups : [profile.applicantGroup];
    for (const q of rule.openFor || []) {
      if (!groupsOf.includes(q.applicantGroup) || result.status === 'unknown') continue;
      if (result.status === 'met' && !q.evenWhenMet) continue;
      unknowns.push({ id: `${rule.id}-open-${q.applicantGroup}`, label: rule.label || rule.kind, kind: rule.kind, message: q.question, actionable: false, blocksPlan: true, evidence: rule.evidence || [], officialWording: null });
    }
  }

  /* A subject floor on a subject the student does not hold yet, where a gap's
     step is the course that will supply it, is not unmet: its grade will be
     the course's. "Your way in is quota 2" there hid the actual step
     (verification after round 5, P1 at AU CS). */
  const raising = new Set(gaps.flatMap((g) => (g.actions || []).filter((a) => a.kind === 'raise').map((a) => a.subject)));
  for (const f of floors) {
    const r = (opportunity.requirements || []).find((x) => x.id === f.id);
    const one = r?.averageOf?.length === 1 ? r.averageOf[0] : null;
    if (f.status !== 'unmet' || !one || !raising.has(one.subject)) continue;
    const conv = ctx.converted(one.levelScale);
    const have = conv.held.get(one.subject);
    const want = one.level ? conv.scheme?.rank.get(one.level) : null;
    if (have && (want == null || have.rank >= want)) continue;
    f.status = 'unknown';
    f.fromCourse = true;
    /* The grade will come from the course, which is graded on the local
       scale, not in IB terms: said in the published unit, with the lowest
       grade on that scale that reaches it (verification 2: "a 5 in Maths HL"
       from a VUC course was the wrong unit). */
    const scheme = schemeForGrade(r.gradeScale, subjectIndex);
    const grades = [...(scheme?.gradeLabels?.keys() || [])].filter((g) => g >= Number(r.minAverage)).sort((a, b) => a - b);
    const lowest = grades.length ? scheme.gradeLabels.get(grades[0]) : null;
    f.message = `Also needs ${f.terms?.localText || r.label}${lowest ? ` — a ${lowest} or better from your course` : ''}; whether this floor is applied to a course passed after 5 July is not recorded.`;
  }

  /* The award nobody recorded.
   *
   * Most Opportunities carry no rule about which IB award opens them. For a
   * student who will hold the Diploma that silence costs nothing — every
   * recognition scheme this site has read treats the Diploma as a qualifying
   * examination. For a Course candidate it is the whole question, and the
   * answer is not in the record.
   *
   * So it is raised as an unknown rather than passed over. An unknown is not a
   * refusal — it is the tool saying which question it could not answer, which
   * is the only honest thing to do with a gap that decides whether someone
   * applies at all. This fires only for a student who has said they expect
   * Course Results: an unanswered profile is not quietly treated as one, and a
   * Diploma holder is not shown a caveat about a question they do not have. */
  if (profile.holdsDiploma === false && entryAward(opportunity) === ENTRY_AWARD.NOT_ESTABLISHED) {
    unknowns.push({
      id: 'entry-award-not-established',
      label: 'Which IB award opens this',
      kind: 'ib-course-results',
      message:
        'Nothing recorded here says whether Course Results are accepted or whether the full Diploma is required. That silence is not permission: ask the institution in writing before you count on this one.',
      actionable: true,
      evidence: [],
      officialWording: null,
    });
  }

  /* Data quality gates.
   *
   * Two different things get confused here, so they are kept apart.
   *
   * Evidence that is ABSENT, STALE, SUPERSEDED, UNAVAILABLE or CONFLICTING is a
   * reason to refuse to answer: we either have nothing, or we have something we
   * know is wrong or contested. Those gate the outcome.
   *
   * Evidence marked NEEDS-REVIEW is different. It means a source was read and
   * recorded but no human has signed it off yet. Gating on that would make every
   * result "Needs review" the moment new research lands, which teaches students
   * to ignore the label — the one outcome that must keep its meaning. So it
   * becomes a visible caveat on the result instead of a refusal to give one.
   */
  const dataIssues = [];
  const caveats = [];

  if (!mandatory.length) {
    dataIssues.push('No entry requirements are recorded for this Opportunity yet.');
  }

  /* The route left open below a floor, from the institution's own record. */
  const quotaRoutes = subjectIndex?.institutionRoutes?.get(opportunity.institution)?.quotas || [];
  const otherRoute = (quota) => quotaRoutes.find((q) => q.quota !== quota) || null;
  for (const f of floors) {
    const other = otherRoute(f.quota);
    f.otherRoute = other;
    if (f.status === 'unmet') {
      caveats.push(`${f.quota}: ${f.message} ${other ? `Your way in is ${other.quota.toLowerCase()}: ${other.text}` : 'Only another admission route is open to you; ask the institution which.'}`);
    } else if (f.status === 'unknown') {
      caveats.push(`${f.quota}: ${f.message}`);
    }
  }

  const evidence = evidenceStatus(opportunity.evidence);
  if (evidence) {
    if (evidence.level === 'conflicting') {
      dataIssues.push('Sources disagree about this Opportunity, so the result is held back until that is resolved.');
    } else if (evidence.level === 'none') {
      dataIssues.push('No source is recorded for these requirements.');
    } else if (evidence.level === 'unavailable') {
      dataIssues.push('The source behind these requirements could not be reached when it was last checked.');
    } else if (evidence.level === 'superseded') {
      dataIssues.push('These requirements have been superseded and not yet replaced.');
    } else if (evidence.level === 'stale') {
      dataIssues.push(`These requirements were last checked on ${evidence.checkedAt} and are past their review date.`);
    } else if (evidence.level === 'needs-review') {
      caveats.push('These requirements were read from the official page but have not yet been checked by a person. Confirm them at the source before you rely on them.');
    }
  }

  /* Only the scales this Opportunity actually used are reported. A subject with
   * no published equivalent somewhere the student is not applying is not a
   * caveat on this result, and listing it would be noise that teaches them to
   * skip the ones that matter. */
  const unmappedSubjects = [];
  for (const conv of conversions.values()) unmappedSubjects.push(...conv.unmappedSubjects);
  const unknownSubjects = ctx.ib.unknownSubjects;

  const bySchemeLabel = new Map();
  for (const u of unmappedSubjects) {
    if (!bySchemeLabel.has(u.scheme)) bySchemeLabel.set(u.scheme, []);
    bySchemeLabel.get(u.scheme).push(`${u.name} ${u.level}`);
  }
  for (const [label, names] of bySchemeLabel) {
    caveats.push(`${names.join(', ')} has no published equivalent in ${label}, so it was not counted.`);
  }

  let plan = planSteps(gaps);
  /* Below a floor that leaves only the other quota open, a plan that relies
     on finishing a course after the IB results is not joined to that quota by
     any record: AU's quota 2 has "everything documented by 15 March", SDU's
     is an entrance test. So it is a question unless the institution records
     that its after-results route applies there (`quota2AfterResults`)
     (verification 2 after round 5, P8 at AU CS). */
  const shutFloors = floors.filter((f) => f.status === 'unmet' && f.otherRoute);
  if (plan?.possible && shutFloors.length && (plan.raises || []).length) {
    const open = plan.raises.every((a) => a.quota2AfterResults === true);
    if (!open) {
      const q = [...new Set(plan.raises.map((a) => a.quota2Question).filter(Boolean))].join(' ')
        || `Whether a course finished after the IB results counts in ${shutFloors[0].otherRoute.quota.toLowerCase()}, the only route open to you here, is not recorded — ask the institution.`;
      plan = { ...plan, uncertain: true, lead: 'To check', summary: `${plan.summary || ''} ${q}`.trim() };
    }
  }
  let outcome;
  if (dataIssues.length) outcome = OUTCOME.NEEDS_REVIEW;
  else if (gaps.length === 0 && unknowns.length === 0) outcome = OUTCOME.MEETS;
  else if (gaps.length === 0) outcome = OUTCOME.NEEDS_REVIEW;
  /* A step we could not count (a subject from nothing) beside the ones we
     can: the plan is not known to be complete, so it is a question. */
  else if (plan?.possible) outcome = plan.uncertain || unknowns.some((u) => u.blocksPlan) ? OUTCOME.NEEDS_REVIEW : OUTCOME.POSSIBLE;
  else outcome = OUTCOME.DOES_NOT_MEET;

  /* Eligible, but below a floor that closes one route: not a plain yes. */
  const shut = floors.find((f) => f.status === 'unmet');
  let outcomeLabel = OUTCOME_LABEL[outcome];
  let route = null;
  if (outcome === OUTCOME.MEETS && shut) {
    outcome = OUTCOME.OTHER_ROUTE;
    route = shut.otherRoute;
    outcomeLabel = route ? `${route.quota} only` : OUTCOME_LABEL[outcome];
  }

  return {
    opportunityId: opportunity.id,
    outcome,
    outcomeLabel,
    route,
    /* What "Possible with action" asks of the student, as one line, where it
       is more than a single gap's own step: "2 supplementary courses: …", or
       "One step closes both: …". Null otherwise. */
    actionSummary: summaryOf(outcome, plan, unknowns, dataIssues, floors),
    actionLead: leadOf(outcome, plan, unknowns),
    matched,
    gaps,
    unknowns,
    dataIssues,
    caveats,
    unknownSubjects,
    unmappedSubjects,

    /* Competitive selection is reported, never folded into the outcome. */
    floors,

    selection: {
      restricted: !!opportunity.admission?.restricted,
      factors: selectionFactors.map((r) => ({ label: r.label || r.kind, kind: r.kind })),
      historicalCutoffs: opportunity.admission?.historicalCutoffs || [],
      note: opportunity.admission?.restricted
        ? 'Meeting the requirements does not secure a place. Past cut-offs show how competitive it has been; they are not a prediction.'
        : 'Recorded as open admission: meeting the requirements is enough.',
    },

    provenance: {
      intake: opportunity.intake,
      dataVersion,
      dataAsOf: opportunity.meta?.dataAsOf || null,
      evidence: evidence || null,
      /* Which Recognition Schemes, if any, stood between the source's sentence
       * and this answer. Empty means none did. */
      translatedThrough: [...conversions.values()]
        .filter((c) => c.scheme)
        .map((c) => ({ scale: c.scale, scheme: c.scheme.id, label: c.scheme.label })),
    },
  };
}

/** Assess a whole catalogue, most promising first. */
export function assessAll(profile, opportunities, options) {
  const order = { [OUTCOME.MEETS]: 0, [OUTCOME.OTHER_ROUTE]: 1, [OUTCOME.POSSIBLE]: 2, [OUTCOME.NEEDS_REVIEW]: 3, [OUTCOME.DOES_NOT_MEET]: 4 };
  return opportunities
    .map((o) => ({ opportunity: o, assessment: assess(profile, o, options) }))
    .sort((a, b) => order[a.assessment.outcome] - order[b.assessment.outcome]);
}
