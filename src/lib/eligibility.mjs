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
};

export const OUTCOME_LABEL = {
  [OUTCOME.MEETS]: 'Meets published requirements',
  [OUTCOME.POSSIBLE]: 'Possible with action',
  [OUTCOME.DOES_NOT_MEET]: 'Does not currently meet',
  [OUTCOME.NEEDS_REVIEW]: 'Needs review',
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

  const index = new Map();
  for (const subject of subjects) {
    const entry = {
      id: subject.id,
      name: subject.name,
      group: subject.group,
      levels: subject.levels || ['HL', 'SL'],
    };
    index.set(subject.id, entry);
    index.set(normalise(subject.name), entry);
  }

  const schemes = new Map();
  for (const record of schemeRecords) {
    const scheme = prepareScheme(record);
    if (scheme) schemes.set(scheme.scale, scheme);
  }
  index.schemes = schemes;

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
  for (const row of record.subjectsWithoutEquivalence || []) {
    withoutEquivalence.set(normalise(row.subject), row.reason);
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
    noEquivalenceNote: record.noEquivalenceNote || 'No equivalent is published.',
    single: record.gradeConversion?.single?.table || [],
    average: record.gradeConversion?.average?.table || [],
  };
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

    for (const target of targets) {
      const rank = scheme.rank.get(target.level) ?? 0;
      const existing = held.get(target.subject);
      if (!existing || rank > existing.rank) {
        held.set(target.subject, {
          level: target.level,
          rank,
          ibSubject: `${found.name} ${level}`,
          grade: entry.grade ?? null,
          note: row?.note || null,
        });
      } else if (rank === existing.rank && num(entry.grade) > num(existing.grade)) {
        existing.grade = entry.grade;
        existing.ibSubject = `${found.name} ${level}`;
      }
    }
  }

  return { held, unknownSubjects, unmappedSubjects, scheme, scale: wanted };
}

/** An IB subject grade on a Recognition Scheme's single-grade table. */
export function convertGrade(ibGrade, table = []) {
  const row = table.find((r) => r.ib === Number(ibGrade));
  return row ? row.local : null;
}

/** An IB total on a Recognition Scheme's grade-average table. */
export function convertAverage(points, table = []) {
  const row = table.find((r) => r.ib === Number(points));
  return row ? row.local : null;
}

/* --- Evaluating one rule ---------------------------------------------------- */

const met = (message) => ({ status: 'met', message });
const unmet = (message, actionable = false) => ({ status: 'unmet', message, actionable });
const unsure = (message, actionable = false) => ({ status: 'unknown', message, actionable });

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

  if (!have) {
    return unmet(`You do not have ${label} at any level.`, true);
  }
  if (wantLevel !== 'any' && have.rank < (IB_LEVEL_RANK[wantLevel] || 0)) {
    return unmet(`${label}: this asks for ${phrase} and your profile records ${have.level}.`, true);
  }

  if (rule.minGrade != null) {
    if (have.grade == null) {
      return unsure(`${label} ${phrase} needs an IB grade of at least ${rule.minGrade}. Add your grade for ${label} to check.`);
    }
    if (num(have.grade) < Number(rule.minGrade)) {
      return unmet(
        `${label} ${have.level}: this asks for at least ${rule.minGrade} and your profile records ${have.grade}. Both are IB grades, so nothing is converted.`,
        true
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

  const have = conv.held.get(rule.subject);
  if (!have) {
    const reason = scheme.withoutEquivalence.get(normalise(rule.subject));
    if (reason) return unsure(`${rule.subject} at ${rule.level} level — ${reason}`);
    return unmet(`You do not have ${rule.subject} at any level.`, true);
  }
  if (have.rank < wantRank) {
    return unmet(`${rule.subject}: your ${have.ibSubject} counts as ${have.level} level, and this needs ${rule.level}.`, true);
  }

  if (rule.minGrade != null) {
    if (have.grade == null) {
      return unsure(`${rule.subject} ${rule.level} needs a minimum grade of ${rule.minGrade}. Add your grade for ${have.ibSubject} to check.`);
    }
    const converted = convertGrade(have.grade, scheme.single);
    if (converted == null) {
      return unsure(`${scheme.label} publishes no conversion for an IB grade of ${have.grade}, so this cannot be checked.`);
    }
    if (converted < Number(rule.minGrade)) {
      return unmet(
        `${rule.subject}: your ${have.ibSubject} grade of ${have.grade} converts to ${converted}, below the required ${rule.minGrade}.`,
        true
      );
    }
    return met(
      `${have.ibSubject} counts as ${rule.subject} ${have.level}; grade ${have.grade} converts to ${converted}, at or above the required ${rule.minGrade}.`
    );
  }

  return met(
    `${have.ibSubject} counts as ${rule.subject} ${have.level}${have.level !== rule.level ? `, which covers the required ${rule.level}` : ''}.`
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
        return unmet(
          `This asks for the full IB Diploma, and Course Results on their own do not satisfy it.${
            rule.alternativeRoute ? ` ${rule.alternativeRoute}` : ' No other route to this one is recorded here, so ask the institution what it will accept before you rule it out.'
          }`,
          !!rule.alternativeRoute
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
      if (rule.minPoints != null) {
        conditions.push(`${rule.minPoints} points in total`);
        if (profile.totalPoints == null) missing.push('your predicted total');
        else if (profile.totalPoints < Number(rule.minPoints)) {
          shortfalls.push(`it needs ${rule.minPoints} points and your profile says ${profile.totalPoints}`);
        }
      }

      const asks = conditions.length ? ` It asks for ${listOf(conditions)}.` : '';
      if (shortfalls.length) {
        return unmet(
          `Course Results are accepted here, but not as your profile stands: ${listOf(shortfalls)}.`,
          shortfalls.length === 1
        );
      }
      if (missing.length) {
        return unsure(`Course Results are accepted here.${asks} Add ${listOf(missing)} to check that you clear it.`);
      }
      return met(`Course Results are accepted here and your profile clears the conditions.${asks}`);
    }

    case 'ib-total-points': {
      const need = rule.minPoints;
      if (need == null) return unsure('A points requirement is recorded without a threshold.');
      if (profile.totalPoints == null) {
        return unsure(`This needs at least ${need} points. Add your predicted total to check.`);
      }
      return profile.totalPoints >= need
        ? met(`${profile.totalPoints} points meets the minimum of ${need}.`)
        : unmet(
            `This needs at least ${need} points and your profile says ${profile.totalPoints}.`,
            need - profile.totalPoints <= 3
          );
    }

    case 'ib-subject':
      return ibSubjectRule(rule, ctx);

    case 'local-equivalency':
      return localEquivalencyRule(rule, ctx);

    case 'subject-combination': {
      const groups = rule.alternatives || [];
      if (!groups.length) return unsure('A combination requirement is recorded without alternatives.');

      let best = null;
      for (const group of groups) {
        const results = group.map((r) => evaluateRule(r, ctx));
        const unmetOnes = results.filter((r) => r.status === 'unmet');
        const unknown = results.filter((r) => r.status === 'unknown');
        const score = unmetOnes.length * 10 + unknown.length;
        if (!best || score < best.score) best = { score, unmet: unmetOnes, unknown, group };
        if (score === 0) break;
      }
      if (best.score === 0) {
        return met(`You satisfy one of the ${groups.length} accepted subject combinations.`);
      }
      if (best.unmet.length === 0) {
        return unsure(best.unknown.map((r) => r.message).join(' '));
      }
      return unmet(
        `None of the ${groups.length} accepted combinations is complete. The closest needs: ${best.unmet.map((r) => r.message).join(' ')}`,
        best.unmet.length === 1
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
        if (conv.scheme && conv.held.has(rule.subject)) {
          return met(`${rule.subject} is covered by your IB subjects.`);
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
      if (!group || group === 'any' || group === profile.applicantGroup) {
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
    ib: ibProfile(profile, subjectIndex),
    converted(scale) {
      if (!conversions.has(scale)) conversions.set(scale, convertProfile(profile, subjectIndex, scale));
      return conversions.get(scale);
    },
  };

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
  const order = { [OUTCOME.MEETS]: 0, [OUTCOME.POSSIBLE]: 1, [OUTCOME.NEEDS_REVIEW]: 2, [OUTCOME.DOES_NOT_MEET]: 3 };
  return opportunities
    .map((o) => ({ opportunity: o, assessment: assess(profile, o, options) }))
    .sort((a, b) => order[a.assessment.outcome] - order[b.assessment.outcome]);
}
