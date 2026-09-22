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
 */

export const OUTCOME = {
  MEETS: 'meets',
  POSSIBLE: 'possible-with-action',
  DOES_NOT_MEET: 'does-not-currently-meet',
  NEEDS_REVIEW: 'needs-review',
};

export const OUTCOME_LABEL = {
  [OUTCOME.MEETS]: 'Meets published requirements',
  [OUTCOME.POSSIBLE]: 'Possible with action',
  [OUTCOME.DOES_NOT_MEET]: 'Does not currently meet',
  [OUTCOME.NEEDS_REVIEW]: 'Needs review',
};

const LEVEL_RANK = { A: 3, B: 2, C: 1 };

/* --- Converting an IB profile into destination levels ---------------------- */

/**
 * Index the IB subject catalogue (data/ib-subjects.json) by id and by name, so
 * a profile can name a subject either way.
 */
export function buildSubjectIndex(subjects = []) {
  const index = new Map();
  for (const subject of subjects) {
    const entry = {
      id: subject.id,
      name: subject.name,
      group: subject.group,
      levels: subject.levels || ['HL', 'SL'],
      maps: subject.maps || {},
      note: subject.note || null,
      unmapped: subject.unmapped || null,
    };
    index.set(subject.id, entry);
    index.set(normalise(subject.name), entry);
  }
  return index;
}

/** Subjects a programme can ask for that the official table does not map. */
export const UNMAPPED = {
  'Social Studies':
    'Denmark publishes no fixed equivalence for Social Studies. Global Politics is assessed institution by institution — Copenhagen has accepted Global Politics HL, Aarhus only in combination with Economics. Ask the admissions office in writing before 15 March.',
  Geoscience:
    'The official handbook leaves the IB column blank for Geoscience A. IB Geography HL is not automatically accepted; you would normally need a Danish supplementary course.',
};

/**
 * Some Danish requirement names group several school subjects that the
 * conversion table lists under one heading.
 */
const ALIASES = {
  'Business and economics subjects': [
    'International Economics', 'Business Economics', 'Economics', 'Marketing', 'Afsætning',
  ],
  'Computing / IT / programming': ['Information Technology', 'Communication and IT', 'Computer Science'],
  'Danish as a second language': ['Danish'],
};

function normalise(s) {
  return String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * The destination-level subjects a profile holds, keeping the highest level
 * reached in each and the best grade at that level.
 *
 * A subject the catalogue has no mapping for is not silently dropped — it is
 * returned in `unmappedSubjects` so the interface can say so.
 */
export function convertProfile(profile, subjectIndex) {
  const held = new Map();
  const unknownSubjects = [];
  const unmappedSubjects = [];

  for (const entry of profile.subjects || []) {
    if (!entry?.subject) continue;
    const found = subjectIndex.get(entry.subject) || subjectIndex.get(normalise(entry.subject));
    if (!found) {
      unknownSubjects.push(entry.subject);
      continue;
    }

    const level = entry.level || found.levels[0];
    const targets = found.maps?.[level] || [];
    if (!targets.length) {
      unmappedSubjects.push({ name: found.name, level, reason: found.unmapped || 'No Danish equivalent is published.' });
      continue;
    }

    for (const target of targets) {
      const rank = LEVEL_RANK[target.level] || 0;
      const existing = held.get(target.subject);
      if (!existing || rank > existing.rank) {
        held.set(target.subject, {
          level: target.level,
          rank,
          ibSubject: `${found.name} ${level}`,
          grade: entry.grade ?? null,
          note: found.note || null,
        });
      } else if (rank === existing.rank && num(entry.grade) > num(existing.grade)) {
        existing.grade = entry.grade;
        existing.ibSubject = `${found.name} ${level}`;
      }
    }
  }

  return { held, unknownSubjects, unmappedSubjects };
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : -Infinity;
}

/** IB subject grade to the destination's single-grade scale. */
export function convertGrade(ibGrade, table = []) {
  const row = table.find((r) => r.ib === Number(ibGrade));
  return row ? row.dk : null;
}

/** IB total points to the destination's grade average. */
export function convertAverage(points, table = []) {
  const row = table.find((r) => r.ib === Number(points));
  return row ? row.dk : null;
}

/* --- Evaluating one rule ---------------------------------------------------- */

/**
 * @returns {{status:'met'|'unmet'|'unknown', message:string, actionable?:boolean}}
 */
function evaluateRule(rule, ctx) {
  const { held, profile, conversion } = ctx;

  switch (rule.kind) {
    case 'ib-diploma':
      if (profile.holdsDiploma === true) return { status: 'met', message: 'You expect to hold a full IB Diploma.' };
      if (profile.holdsDiploma === false) {
        return {
          status: 'unmet',
          message: 'This requires a full IB Diploma. Course Results reach professional bachelor programmes, and university bachelor programmes only with supplementary subjects or a retake.',
          actionable: true,
        };
      }
      return { status: 'unknown', message: 'Whether you will hold a full Diploma is not recorded in your profile.' };

    case 'ib-total-points': {
      const need = rule.minPoints;
      if (need == null) return { status: 'unknown', message: 'A points requirement is recorded without a threshold.' };
      if (profile.totalPoints == null) {
        return { status: 'unknown', message: `This needs at least ${need} points. Add your predicted total to check.` };
      }
      return profile.totalPoints >= need
        ? { status: 'met', message: `${profile.totalPoints} points meets the minimum of ${need}.` }
        : {
            status: 'unmet',
            message: `This needs at least ${need} points and your profile says ${profile.totalPoints}.`,
            actionable: need - profile.totalPoints <= 3,
          };
    }

    case 'ib-subject': {
      if (!rule.subject || !rule.level) {
        return { status: 'unknown', message: 'A subject requirement is recorded without a subject or level.' };
      }
      const have = held.get(rule.subject);

      if (!have) {
        if (UNMAPPED[rule.subject]) {
          return { status: 'unknown', message: `${rule.subject} at ${rule.level} level — ${UNMAPPED[rule.subject]}` };
        }
        return {
          status: 'unmet',
          message: `You do not have ${rule.subject} at any level.`,
          actionable: true,
        };
      }
      if (have.rank < (LEVEL_RANK[rule.level] || 0)) {
        return {
          status: 'unmet',
          message: `${rule.subject}: your ${have.ibSubject} counts as ${have.level} level, and this needs ${rule.level}.`,
          actionable: true,
        };
      }
      if (rule.minGrade != null) {
        if (have.grade == null) {
          return {
            status: 'unknown',
            message: `${rule.subject} ${rule.level} needs a minimum grade of ${rule.minGrade}. Add your grade for ${have.ibSubject} to check.`,
          };
        }
        const converted = convertGrade(have.grade, conversion.single);
        if (converted == null) {
          return { status: 'unknown', message: `No published conversion for an IB grade of ${have.grade}.` };
        }
        if (converted < Number(rule.minGrade)) {
          return {
            status: 'unmet',
            message: `${rule.subject}: your ${have.ibSubject} grade of ${have.grade} converts to ${converted}, below the required ${rule.minGrade}.`,
            actionable: true,
          };
        }
        return {
          status: 'met',
          message: `${have.ibSubject} counts as ${rule.subject} ${have.level}; grade ${have.grade} converts to ${converted}, at or above the required ${rule.minGrade}.`,
        };
      }
      return {
        status: 'met',
        message: `${have.ibSubject} counts as ${rule.subject} ${have.level}${have.level !== rule.level ? `, which covers the required ${rule.level}` : ''}.`,
      };
    }

    case 'subject-combination': {
      const groups = rule.alternatives || [];
      if (!groups.length) return { status: 'unknown', message: 'A combination requirement is recorded without alternatives.' };

      let best = null;
      for (const group of groups) {
        const results = group.map((r) => evaluateRule(r, ctx));
        const unmet = results.filter((r) => r.status === 'unmet');
        const unknown = results.filter((r) => r.status === 'unknown');
        const score = unmet.length * 10 + unknown.length;
        if (!best || score < best.score) best = { score, unmet, unknown, group };
        if (score === 0) break;
      }
      if (best.score === 0) {
        return { status: 'met', message: `You satisfy one of the ${groups.length} accepted subject combinations.` };
      }
      if (best.unmet.length === 0) {
        return { status: 'unknown', message: best.unknown.map((r) => r.message).join(' ') };
      }
      return {
        status: 'unmet',
        message: `None of the ${groups.length} accepted combinations is complete. The closest needs: ${best.unmet.map((r) => r.message).join(' ')}`,
        actionable: best.unmet.length === 1,
      };
    }

    case 'language-general':
    case 'language-programme': {
      const languages = (profile.languages || []).map(normalise);
      if (rule.subject && held.has(rule.subject)) {
        return { status: 'met', message: `${rule.subject} is covered by your IB subjects.` };
      }
      if (rule.label && languages.some((l) => normalise(rule.label).includes(l))) {
        return { status: 'met', message: `Your profile records ${rule.label}.` };
      }
      return {
        status: 'unknown',
        message: `${rule.label || 'A language requirement'} — this depends on documentation the profile does not hold. Check the official page.`,
      };
    }

    case 'citizenship':
    case 'residency': {
      if (!profile.applicantGroup) {
        return { status: 'unknown', message: `${rule.label || 'An applicant-status requirement'} — your fee status is not recorded.` };
      }
      const group = rule.applicability?.applicantGroup;
      if (!group || group === 'any' || group === profile.applicantGroup) {
        return { status: 'met', message: `${rule.label || 'Applicant status'} applies to you.` };
      }
      return { status: 'unmet', message: `${rule.label || 'This rule'} applies to ${group} applicants, and your profile says ${profile.applicantGroup}.` };
    }

    case 'test':
    case 'portfolio':
    case 'audition':
    case 'interview':
    case 'essay':
    case 'reference':
    case 'work-sample':
    case 'activity':
      return {
        status: 'unknown',
        message: `${rule.label || rule.kind} — this is assessed by the institution and cannot be checked from your subjects alone.`,
        actionable: true,
      };

    default:
      return {
        status: 'unknown',
        message: rule.label ? `${rule.label} — not something this tool can check.` : 'A requirement of an unrecognised kind.',
      };
  }
}

/* --- Evaluating an Opportunity ---------------------------------------------- */

/**
 * @param {object} profile  { subjects:[{subject,grade}], totalPoints, holdsDiploma, applicantGroup, languages }
 * @param {object} opportunity  a canonical Opportunity record
 * @param {object} options  { conversion, subjectIndex, evidenceStatus, dataVersion }
 */
export function assess(profile, opportunity, options) {
  const { conversion, subjectIndex, evidenceStatus = () => null, dataVersion = null } = options;
  const { held, unknownSubjects, unmappedSubjects } = convertProfile(profile, subjectIndex);
  const ctx = { held, profile, conversion };

  const mandatory = (opportunity.requirements || []).filter((r) => r.mandatory !== false);
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
      evidence: rule.evidence || [],
      officialWording: rule.officialWording?.text || null,
    };
    if (result.status === 'met') matched.push(entry);
    else if (result.status === 'unmet') gaps.push(entry);
    else unknowns.push(entry);
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

  if (unmappedSubjects.length) {
    caveats.push(
      `${unmappedSubjects.map((u) => `${u.name} ${u.level}`).join(', ')} has no published Danish equivalent, so it was not counted.`
    );
  }

  let outcome;
  if (dataIssues.length) outcome = OUTCOME.NEEDS_REVIEW;
  else if (gaps.length === 0 && unknowns.length === 0) outcome = OUTCOME.MEETS;
  else if (gaps.length === 0) outcome = OUTCOME.NEEDS_REVIEW;
  else if (gaps.length === 1 && gaps[0].actionable) outcome = OUTCOME.POSSIBLE;
  else outcome = OUTCOME.DOES_NOT_MEET;

  return {
    opportunityId: opportunity.id,
    outcome,
    outcomeLabel: OUTCOME_LABEL[outcome],
    matched,
    gaps,
    unknowns,
    dataIssues,
    caveats,
    unknownSubjects,
    unmappedSubjects,

    /* Competitive selection is reported, never folded into the outcome. */
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
    },
  };
}

/** Assess a whole catalogue, most promising first. */
export function assessAll(profile, opportunities, options) {
  const order = { [OUTCOME.MEETS]: 0, [OUTCOME.POSSIBLE]: 1, [OUTCOME.NEEDS_REVIEW]: 2, [OUTCOME.DOES_NOT_MEET]: 3 };
  return opportunities
    .map((o) => ({ opportunity: o, assessment: assess(profile, o, options) }))
    .sort((a, b) => order[a.assessment.outcome] - order[b.assessment.outcome]);
}
