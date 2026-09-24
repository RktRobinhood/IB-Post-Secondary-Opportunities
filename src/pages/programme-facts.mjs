import { note } from '../lib/components.mjs';
import { entryAward, ENTRY_AWARD } from '../lib/eligibility.mjs';

/* Small facts about programmes and institutions, said the same way on every page that says them. */

/* What each of the three entry-award states is called where a student reads it.
 *
 * "Not established" is a real answer with a label of its own, not an empty
 * string and not a missing chip. It is the state 3 of the 53 Opportunities are
 * in, and the whole point of naming it is that a student can see it, filter to
 * it, and know to ask — rather than meeting it as a silence that looks like
 * permission. */
export const AWARD_LABEL = {
  [ENTRY_AWARD.DIPLOMA_REQUIRED]: 'Asks for the full Diploma',
  [ENTRY_AWARD.COURSE_RESULTS_ACCEPTED]: 'Reachable on Course Results',
  [ENTRY_AWARD.NOT_ESTABLISHED]: 'Not established either way',
};

/**
 * Which IB award opens one Opportunity, said on the Opportunity's own page.
 *
 * The subject requirements above this block are a comparison a student can lose
 * on and still apply. This one is not: if the award they will hold is not the
 * award the source asks for, nothing else on the page matters, which is why it
 * gets a block of its own rather than a line in a list.
 *
 * All three states produce a block. The third is the one worth arguing about —
 * an Opportunity we have established nothing for renders a paragraph saying so,
 * rather than the nothing that would let a Course candidate read the silence as
 * a yes. That is the same discipline as every other gap on this site, applied
 * where it costs the most to get wrong.
 */
export function awardBlock(opp) {
  if (!opp) return '';
  const award = entryAward(opp);
  const rule = (opp.requirements || [])
    .filter((r) => r.mandatory !== false)
    .find((r) => r.kind === 'ib-diploma' || r.kind === 'ib-course-results');
  const tail = [rule?.alternativeRoute, rule?.note].filter(Boolean).map((t) => `\n\n${t}`).join('');

  if (award === ENTRY_AWARD.DIPLOMA_REQUIRED) {
    return note(
      `This asks for the **full IB Diploma**. DP Course Results — what the IB awards for individual Diploma
      Programme subjects where the Diploma itself is not — do not satisfy it on their own.${tail}`,
      { title: 'Which IB award this asks for' }
    );
  }

  if (award === ENTRY_AWARD.COURSE_RESULTS_ACCEPTED) {
    const asks = [
      rule?.minSubjects != null ? `${rule.minSubjects} graded subjects` : null,
      rule?.minHigherLevelSubjects != null ? `${rule.minHigherLevelSubjects} of them at HL` : null,
      rule?.minGrade != null ? `at least ${rule.minGrade} in every subject` : null,
      rule?.minPoints != null ? `${rule.minPoints} points in total` : null,
    ].filter(Boolean);
    return note(
      `**DP Course Results** are accepted here — you do not need to have been awarded the full Diploma.${
        asks.length ? ` The source asks for ${asks.slice(0, -1).join(', ')}${asks.length > 1 ? ' and ' : ''}${asks.at(-1)}.` : ''
      }${tail}`,
      { kind: 'ok', title: 'Which IB award this asks for' }
    );
  }

  return note(
    `Whether **DP Course Results** are accepted here, or whether the full IB Diploma is required, is **not
    established**. No source recorded for this programme says either way, and an absence is not a yes — if you
    will not hold the full Diploma, ask the institution in writing before the application deadline rather than
    reading this page as permission.`,
    { kind: 'warn', title: 'Which IB award this asks for' }
  );
}

/**
 * The Destination a record belongs to, or a usable stand-in.
 *
 * Every page below used to open with `{ href: '/denmark/', label: 'Denmark' }`
 * written out by hand, which was true of all thirteen Institutions until five
 * of them were Dutch and then was true of eight. The Destination now travels on
 * the record, so the only thing left to decide is what to do when it does not —
 * and the answer is to render the page without a Destination crumb rather than
 * to fall back to a country, because falling back to a country is how every
 * Dutch page came to be filed under Denmark in the first place.
 */
export function destinationOf(record) {
  return record?.destination || null;
}

/**
 * A published cut-off, said the way the record actually holds it.
 *
 * Eleven of the thirty-two recorded cut-offs are not numbers. SDU publishes
 * "All qualified applicants accepted" and AAU publishes "All admitted", which
 * are outcomes of the competition rather than scores in it, and the template
 * used to read every one of them as a figure: "a Danish average of **All
 * qualified applicants accepted**". Naming a grade scale beside that sentence
 * would have made it worse rather than better, so the scale is attached only to
 * something measured on it.
 *
 * `quota` and `scale` come off the record and the Recognition Scheme. Neither
 * is this file's to assume — "quota 1" is the name of one country's machinery.
 */
export function cutoffSentence(cutoff, scaleName) {
  if (!cutoff?.value) return null;
  const quota = cutoff.quota ? `${cutoff.quota.toLowerCase()} ` : '';
  const when = cutoff.intake ? ` for the ${cutoff.intake}` : '';
  const numeric = /^\d+([.,]\d+)?$/.test(String(cutoff.value).trim());
  return numeric
    ? `The most recently published ${quota}cut-off was **${cutoff.value}**${scaleName ? ` on the ${scaleName}` : ''}${when}. Cut-offs move every year, so treat any published figure as a floor rather than a target.`
    : `The most recently published ${quota}outcome${when} was "${cutoff.value}" rather than a cut-off figure. That is last year's result, not a promise about this one — where a programme fills up, a figure appears.`;
}

/** An ISO date as a person writes it. Unparseable dates print as they are. */
export function prettyDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
