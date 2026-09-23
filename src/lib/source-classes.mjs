/**
 * What a source is allowed to establish.
 *
 * Denmark was researched almost entirely from rule-owners: the Agency publishes
 * the conversion tables, the university publishes its own entry requirements,
 * and both are the final word on their own subject. That does not survive
 * contact with the rest of the world. Most of the genuinely useful material
 * about applying to Italy or Japan is written by people who are accurate,
 * culturally informed, and not authoritative — other IB schools' counselling
 * pages, promotion agencies, counsellor associations.
 *
 * Those sources are worth using. The danger is that once a fact is in a JSON
 * field it looks exactly as solid as every other fact in that field, and the
 * distinction between "the ministry says so" and "a school's guidance page says
 * so" disappears at precisely the moment a student relies on it.
 *
 * So the class is recorded on the Evidence, and the rules below are mechanical
 * rather than advisory. `scripts/validate.mjs` enforces them; they are not a
 * paragraph in a document that a tired person can forget at midnight.
 *
 * THE RULE THAT MATTERS: a secondary source may establish context, may point us
 * at the official page, and may never on its own make a consequential
 * Requirement `verified`. Not "should not". Cannot: the validator fails.
 */

/**
 * @typedef {object} SourceClass
 * @property {string} label       What to call it on the page.
 * @property {boolean} authoritative  May it alone support a consequential rule?
 * @property {string[]} mayEstablish  Claim kinds this class can carry alone.
 * @property {string} description For the governance page and the research brief.
 * @property {string} caution     What goes wrong if this class is over-trusted.
 */

/** The kinds of claim a source can be cited for. */
export const CLAIM_KIND = {
  /** Entry requirements, deadlines, fees, quotas — anything that decides an application. */
  CONSEQUENTIAL: 'consequential',
  /** How a system works in general terms: what quota 2 is, how numerus fixus works. */
  PROCEDURAL: 'procedural',
  /** Descriptive facts: where a campus is, what a programme covers, how big it is. */
  DESCRIPTIVE: 'descriptive',
  /** How a place actually behaves, which is not written in any rulebook. */
  CULTURAL: 'cultural',
};

const ALL = Object.values(CLAIM_KIND);

/**
 * Ordered from most to least authoritative. The order is used for display and
 * for choosing which of several sources to lead with, so it is not arbitrary.
 */
export const SOURCE_CLASSES = {
  'official-rule-owner': {
    label: 'The body that sets the rule',
    authoritative: true,
    mayEstablish: ALL,
    description:
      'The organisation with the power to change the rule: a ministry or national agency for national rules, and the institution itself for its own entry requirements. If this source is wrong, the rule is wrong.',
    caution:
      'Authoritative about its own rules and no further. A university is the rule-owner for its entry requirements and is not the rule-owner for the national conversion table, even when it reprints one — and several reprint it wrongly.',
  },

  'admissions-authority': {
    label: 'The authority that runs the process',
    authoritative: true,
    mayEstablish: ALL,
    description:
      'The body operating the application itself — optagelse.dk, UCAS, Studielink. Authoritative for deadlines, procedure, documentation and what the portal will accept.',
    caution:
      'Authoritative about the process, not about who qualifies. A portal accepting your application is not the same as an institution admitting you.',
  },

  'recognition-body': {
    label: 'Qualification recognition body',
    authoritative: true,
    mayEstablish: ALL,
    description:
      'The body that maps a foreign qualification onto the local framework — the Danish Agency, NARIC and ENIC centres, and the IB organisation for its own diploma. Authoritative for how the IB converts.',
    caution:
      'Recognition is not admission. A qualification being recognised at a level says nothing about whether any given programme will take it.',
  },

  'institutional-guidance': {
    label: "An institution's own guidance",
    authoritative: true,
    mayEstablish: ALL,
    description:
      "A university's explanatory pages about its own admissions — how it treats the IB, what it expects, how it selects. Authoritative about itself.",
    caution:
      'Institutional pages go stale and contradict each other between departments. When an institution disagrees with itself, that is a conflict to record, not a choice to make.',
  },

  'promotion-agency': {
    label: 'Government study-promotion agency',
    authoritative: false,
    mayEstablish: [CLAIM_KIND.PROCEDURAL, CLAIM_KIND.DESCRIPTIVE, CLAIM_KIND.CULTURAL],
    description:
      'Official "study in our country" services — StudyinDenmark, Campus France, Study in Japan. Government-run, generally accurate, and written to attract rather than to govern.',
    caution:
      'Being government-run makes these look authoritative, and for consequential rules they are not. StudyinDenmark\'s own programme catalogue is missing several Danish universities outright. Excellent for orientation and for finding the official page; never the final word on a requirement.',
  },

  'school-guidance': {
    label: "Another school's counselling guidance",
    authoritative: false,
    mayEstablish: [CLAIM_KIND.PROCEDURAL, CLAIM_KIND.CULTURAL],
    description:
      'University-guidance pages and counselling handbooks published by other IB schools. Often the best available writing on what an application to a given system is actually like, because it is written by people who have watched students go through it.',
    caution:
      'Written for that school\'s own cohort, and frequently still true for them while being wrong for us — a school in a country with a bilateral agreement, or whose students hold a different passport, faces different rules. Check whose situation is being described.',
  },

  'counselling-body': {
    label: 'Counsellor professional body',
    authoritative: false,
    mayEstablish: [CLAIM_KIND.PROCEDURAL, CLAIM_KIND.CULTURAL],
    description:
      'Guidance and briefings from counsellor associations and conference material. Strong on how systems behave in practice and on what changed this year.',
    caution:
      'Conference material is a snapshot of a moment and is rarely revised afterwards. Date it carefully.',
  },

  'encyclopaedic': {
    label: 'Encyclopaedic reference',
    authoritative: false,
    mayEstablish: [CLAIM_KIND.DESCRIPTIVE],
    description:
      'Wikipedia, Wikidata and similar. Used here for founding dates, coordinates and freely licensed photographs — facts that are stable, checkable and carry no consequence if slightly off.',
    caution:
      'Never for anything a student acts on. A wrong founding year is a curiosity; a wrong deadline is a lost year.',
  },

  aggregator: {
    label: 'Commercial course aggregator',
    authoritative: false,
    mayEstablish: [CLAIM_KIND.DESCRIPTIVE],
    description:
      'Course-listing and study-abroad portals. Useful only for discovering that a programme exists.',
    caution:
      'Many are paid placement, and none is accountable for being wrong. Use to find the official page, then cite the official page. If a claim rests on an aggregator alone, it is not ready to publish.',
  },
};

/** The class order, most authoritative first. */
export const CLASS_ORDER = Object.keys(SOURCE_CLASSES);

export const isAuthoritative = (cls) => SOURCE_CLASSES[cls]?.authoritative === true;

/** May this class support this kind of claim on its own? */
export function mayEstablish(cls, claimKind) {
  const spec = SOURCE_CLASSES[cls];
  if (!spec) return false;
  return spec.mayEstablish.includes(claimKind);
}

/**
 * Given every source behind a claim, is the claim adequately sourced?
 *
 * Deliberately permissive about how many sources there are and strict about
 * what they are: one rule-owner is enough, and ten counselling pages are not.
 *
 * @param {string[]} classes  sourceClass of each piece of evidence
 * @param {string} claimKind
 * @returns {{ok: boolean, reason: string|null}}
 */
export function assessSourcing(classes, claimKind) {
  const known = classes.filter((c) => SOURCE_CLASSES[c]);
  if (!known.length) {
    return { ok: false, reason: 'no source with a recorded class' };
  }
  if (known.some((c) => mayEstablish(c, claimKind))) {
    return { ok: true, reason: null };
  }
  const labels = [...new Set(known.map((c) => SOURCE_CLASSES[c].label))].join(', ');
  return {
    ok: false,
    reason:
      claimKind === CLAIM_KIND.CONSEQUENTIAL
        ? `only secondary sources (${labels}). A consequential claim needs the body that sets the rule, the authority that runs the process, a recognition body, or the institution itself.`
        : `no source of a class permitted to establish a ${claimKind} claim (have: ${labels})`,
  };
}

/**
 * Where a publisherType maps, for records written before classes existed.
 * Used once by the backfill script; new records set sourceClass directly.
 */
export const PUBLISHER_TYPE_FALLBACK = {
  institution: 'institutional-guidance',
  'national-agency': 'official-rule-owner',
  ministry: 'official-rule-owner',
  'application-portal': 'admissions-authority',
  'qualification-body': 'recognition-body',
  aggregator: 'aggregator',
};

/**
 * What kind of claim does backing this field amount to?
 *
 * Derived from the field rather than hand-labelled, because a label a person
 * has to remember to set correctly is a label that will be wrong on the records
 * that matter most. A field that decides an application is consequential
 * whatever anyone types.
 */
const CONSEQUENTIAL_FIELDS = [
  'requirements', 'milestones', 'deadline', 'deadlines', 'feeContext', 'fees', 'tuition',
  'quota', 'capacity', 'selection', 'admission', 'applicationRoutes', 'choiceRules',
  'ibRecognition', 'conversionTable', 'gradeConversion', 'minimumPoints', 'subjectLevelRule',
  // Whether the reader may take a route at all (#35) — as consequential as a date.
  'readerAccess',
];
const PROCEDURAL_FIELDS = ['applicationSystems', 'sharedSteps', 'decisionModel', 'replyModel', 'channel', 'watchOuts'];
const CULTURAL_FIELDS = ['culture', 'context', 'whatItIsLike', 'localContext'];

export function claimKindForField(field) {
  const head = String(field || '').split(/[.[]/)[0];
  if (CULTURAL_FIELDS.includes(head)) return CLAIM_KIND.CULTURAL;
  if (CONSEQUENTIAL_FIELDS.includes(head)) return CLAIM_KIND.CONSEQUENTIAL;
  if (PROCEDURAL_FIELDS.includes(head)) return CLAIM_KIND.PROCEDURAL;
  return CLAIM_KIND.DESCRIPTIVE;
}

/** The strongest claim kind among an evidence record's supports. */
export function claimKindForRecord(record) {
  const kinds = (record?.supports || []).map((s) => claimKindForField(s.field));
  const rank = [CLAIM_KIND.CONSEQUENTIAL, CLAIM_KIND.PROCEDURAL, CLAIM_KIND.CULTURAL, CLAIM_KIND.DESCRIPTIVE];
  return rank.find((k) => kinds.includes(k)) || CLAIM_KIND.DESCRIPTIVE;
}
