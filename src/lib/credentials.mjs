/**
 * What a qualification is, in a way that works outside one country.
 *
 * The first version of this was Denmark-shaped: an enum reading `bachelor`,
 * `professional-bachelor`, `academy-profession`, `top-up`. Those are real
 * Danish categories and they are useless everywhere else. A German
 * Staatsexamen is not any of them. A French diplôme d'ingénieur from a grande
 * école is not any of them. An American associate degree is not any of them.
 *
 * The temptation is to keep adding enum values until every country fits. That
 * fails in a specific way: it forces one country's vocabulary onto another's
 * system, and then the page has to say "professional bachelor" to a French
 * student who has never heard the phrase and whose own system has a perfectly
 * good name for the thing.
 *
 * So three axes are kept apart, because they answer three different questions:
 *
 *   COMPARABLE LEVEL — "how does this stack up against what I know?" The only
 *   axis that is cross-country, and deliberately coarse. Five values, not
 *   twenty. This is what sorting and filtering use.
 *
 *   LOCAL TITLE — "what will the certificate actually say?" Verbatim, in the
 *   local language, with an English rendering beside it rather than instead of
 *   it. "Diplomingeniør", not "professional bachelor of engineering".
 *
 *   SECTOR — "what kind of institution is this, in its own terms?" A
 *   Fachhochschule is not a university and is not a polytechnic and is not a
 *   college, and flattening it into any of those loses the thing a student
 *   needs to understand.
 *
 * The rule that keeps this honest: presentation code may branch on `structure`
 * and `comparableLevel`, which are finite and cross-country. It may never
 * branch on a country. The moment a template says `if (destination === 'de')`,
 * this model has failed and the fix is here rather than there.
 */

/**
 * Coarse on purpose. A student comparing options across four countries needs to
 * know whether something is "the normal first degree" or "shorter than that" or
 * "the long one that ends with a master's" — not a twenty-value ladder.
 */
export const COMPARABLE_LEVEL = {
  'short-cycle': {
    label: 'Shorter than a bachelor',
    order: 1,
    eqf: 5,
    explain:
      'One and a half to two and a half years, vocational in emphasis, and usually designed so you can continue to a full bachelor afterwards.',
  },
  bachelor: {
    label: "Bachelor's degree",
    order: 2,
    eqf: 6,
    explain: 'The normal first degree. Three to four years, and the usual route on to a master\'s.',
  },
  'integrated-long': {
    label: 'Long degree ending at master\'s level',
    order: 3,
    eqf: 7,
    explain:
      'A single uninterrupted programme of five or six years with no bachelor exit — how medicine, law and engineering are structured in much of Europe. You apply once, at eighteen, for the whole thing.',
  },
  foundation: {
    label: 'Preparatory year',
    order: 0,
    eqf: 4,
    explain:
      'A year before the degree proper, usually for a missing subject or language rather than for a missing qualification.',
  },
  'top-up': {
    label: 'Top-up to a bachelor',
    order: 1.5,
    eqf: 6,
    explain: 'Completes a shorter qualification into a full bachelor. Entry needs the shorter one first.',
  },
};

/**
 * How the programme is structured, which is what actually changes a student's
 * decision — more than the name does.
 */
export const STRUCTURE = {
  standard: 'A normal taught degree.',
  'integrated-long': 'One continuous programme to master\'s level, applied for once.',
  'short-cycle': 'A short vocational qualification, usually continuable.',
  'top-up': 'Builds on a shorter qualification you must already hold.',
  foundation: 'Preparatory year before a degree.',
  apprenticeship: 'Paid employment combined with study, with the employer as co-selector.',
  'audition-or-portfolio': 'Admission decided mainly by audition or portfolio, with grades secondary.',
};

/** What kind of institution, in cross-country terms. The local name is separate. */
export const SECTOR_KIND = {
  research: 'Research university',
  applied: 'University of applied sciences',
  specialist: 'Specialist school — art, music, drama, architecture',
  professional: 'Professional or business school',
  college: 'College offering shorter or transferable qualifications',
};

/**
 * How to name a qualification on a page.
 *
 * Local title first, English in brackets, because the local title is what the
 * certificate says and what the student will be asked for. Where the two are
 * the same, it is not repeated.
 */
export function credentialName(credential) {
  if (!credential) return '';
  const local = credential.localTitle || credential.title || '';
  const english = credential.localTitleEn || '';
  if (!local) return english;
  if (!english || english.toLowerCase() === local.toLowerCase()) return local;
  return `${local} (${english})`;
}

/** How to name the institution type, same principle. */
export function sectorName(sector) {
  if (!sector) return '';
  const local = sector.local || '';
  const english = sector.en || SECTOR_KIND[sector.kind] || '';
  if (!local) return english;
  if (!english || english.toLowerCase() === local.toLowerCase()) return local;
  return `${local} (${english})`;
}

/** A one-line description of what this qualification is, built from the axes. */
export function credentialSummary(credential) {
  if (!credential) return '';
  const level = COMPARABLE_LEVEL[credential.comparableLevel];
  const bits = [];
  if (level) bits.push(level.label);
  if (credential.years) bits.push(`${credential.years} years`);
  if (credential.ects) bits.push(`${credential.ects} ECTS`);
  return bits.join(' · ');
}

/** Sort key, so a list mixing countries still runs shortest to longest. */
export function levelOrder(credential) {
  return COMPARABLE_LEVEL[credential?.comparableLevel]?.order ?? 99;
}

/**
 * Everything a student needs to not be misled by an unfamiliar qualification.
 * Returns null where there is nothing worth saying, so a template can render it
 * unconditionally without producing an empty box.
 */
export function credentialExplainer(credential) {
  const level = COMPARABLE_LEVEL[credential?.comparableLevel];
  if (!level) return null;
  const structure = STRUCTURE[credential.structure];
  // The structural note is only worth showing when it says something the level
  // has not already said.
  const extra = structure && credential.structure !== 'standard' ? structure : null;
  return { label: level.label, explain: level.explain, extra };
}
