/**
 * The seven decision dimensions.
 *
 * Meeting the entry requirements does not make a degree affordable, reachable,
 * survivable or right. `docs/DECISION_FRAMEWORK.md` names seven separate things
 * a student is actually weighing, and the rule here is that they stay separate.
 *
 * There is deliberately **no overall score**. A composite number would encode
 * our weighting of money against distance against teaching style, present it as
 * arithmetic, and hide the judgement inside it. The weighting belongs to the
 * student.
 *
 * Every dimension reports its own `coverage`, because "we have no data" and
 * "this is fine" must never look the same. A missing figure is never rendered
 * as a positive.
 */
import { money } from './data.mjs';

export const COVERAGE = {
  FULL: 'full',      // we have what a student needs to judge this
  PARTIAL: 'partial',// something useful, with a stated gap
  NONE: 'none',      // nothing recorded — say so plainly
};

/**
 * Each dimension is a pure function of a destination (and, where available, an
 * opportunity). Adding a dimension is adding an entry here; no page changes.
 */
export const DIMENSIONS = [
  {
    key: 'academic',
    label: 'Academic eligibility',
    note: 'Whether you can apply at all. Kept apart from everything else on purpose.',
    forDestination(c) {
      const ib = c.ibRecognition;
      if (!ib) return absent('No IB recognition rules recorded.');
      const bits = [];
      if (ib.minimumPoints) bits.push(ib.minimumPoints);
      if (ib.subjectLevelRule) bits.push(ib.subjectLevelRule);
      if (!bits.length) return absent('Recognition is recorded but without a minimum or subject rule.');
      return {
        value: bits.join(' '),
        coverage: bits.length > 1 ? COVERAGE.FULL : COVERAGE.PARTIAL,
        uncertainty: ib.accepted === false ? 'This system does not straightforwardly accept an IB Diploma.' : null,
        evidence: ib.evidence || [],
      };
    },
  },

  {
    key: 'financial',
    label: 'What it costs you',
    note: 'Tuition at your fee status, plus what living there actually takes.',
    forDestination(c) {
      const eu = money(c.costs?.tuitionEuEea);
      const living = money(c.costs?.livingCostMonthly);
      if (!eu && !living) return absent('Neither tuition nor living costs are recorded.');

      const parts = [];
      if (eu) parts.push(`Tuition: ${eu.value}${eu.year ? ` (${eu.year})` : ''}`);
      if (living) parts.push(`Living: ${living.value}${living.year ? ` (${living.year})` : ''}`);

      const gaps = [];
      if (!eu) gaps.push('tuition');
      if (!living) gaps.push('living costs');
      if (eu && !eu.year) gaps.push('the year the tuition figure belongs to');

      return {
        value: parts.join(' · '),
        coverage: gaps.length ? COVERAGE.PARTIAL : COVERAGE.FULL,
        uncertainty: gaps.length ? `Not recorded: ${gaps.join(', ')}.` : null,
        evidence: [],
      };
    },
  },

  {
    key: 'practical',
    label: 'Can you actually get there',
    note: 'Visas, residence, housing and the paperwork between you and a bed.',
    forDestination(c) {
      const bits = [c.residency, c.housing].filter(Boolean);
      if (!bits.length) return absent('Residence and housing are not recorded.');
      const housingHard = /shortage|difficult|hard|crisis|competitive|waiting/i.test(c.housing || '');
      return {
        value: bits.map((b) => firstSentence(b)).join(' '),
        coverage: bits.length === 2 ? COVERAGE.FULL : COVERAGE.PARTIAL,
        uncertainty: housingHard ? 'Housing is recorded as genuinely difficult here.' : null,
        evidence: [],
      };
    },
  },

  {
    key: 'learning',
    label: 'How you would be taught',
    note: 'Language of instruction and how much is genuinely available in English.',
    forDestination(c) {
      const offer = c.language?.englishTaughtBachelors;
      if (!offer) return absent('English-taught provision is not recorded.');
      const thin = /none|no english|zero|exactly one|very limited|limited|thin|scarce|rare|few/i.test(offer);
      return {
        value: offer,
        coverage: COVERAGE.FULL,
        uncertainty: thin ? 'The English-taught offer here is narrow. Check that a specific programme exists before planning around this country.' : null,
        evidence: [],
      };
    },
  },

  {
    key: 'support',
    label: 'Money and support while you study',
    note: 'Grants, loans and the right to work — what keeps you there once you arrive.',
    forDestination(c) {
      const funding = (c.funding || []).filter(Boolean);
      const work = c.workRights;
      if (!funding.length && !work) return absent('Funding and work rights are not recorded.');
      const parts = [];
      if (funding.length) parts.push(firstSentence(funding[0]));
      if (work) parts.push(firstSentence(work));
      return {
        value: parts.join(' '),
        coverage: funding.length && work ? COVERAGE.FULL : COVERAGE.PARTIAL,
        uncertainty: !funding.length ? 'No funding route is recorded for this country.' : null,
        evidence: [],
      };
    },
  },

  {
    key: 'future',
    label: 'What it leads to',
    note: 'Whether the qualification is recognised, and whether you can stay and work.',
    forDestination(c) {
      const watch = (c.watchOuts || []).find((w) =>
        /recognis|recogniz|licen|authoris|authoriz|graduate route|post-study|work permit|practise/i.test(w)
      );
      const work = /graduate route|post-study|job.?seeking|stay/i.test(c.workRights || '') ? c.workRights : null;
      if (!watch && !work) return absent('Professional recognition and post-study routes are not recorded.');
      return {
        value: firstSentence(watch || work),
        coverage: COVERAGE.PARTIAL,
        uncertainty: 'Recognition of a foreign degree for professional practice is the thing most often assumed and least often checked. Confirm it before you commit.',
        evidence: [],
      };
    },
  },

  {
    key: 'preference',
    label: 'What it is like to be there',
    note: 'Distance, scale and character. Entirely yours to weigh.',
    forDestination(c) {
      const bits = [];
      if (c.region) bits.push(c.region);
      if (c.membership?.nordic || /Nordics/i.test(c.region || '')) bits.push('Nordic — a short trip from Denmark, extra rights for Nordic citizens, and Nordic terms for Danish SU if you can claim it');
      else if (c.eu || c.membership?.eu) bits.push('EU — freedom of movement, no visa');
      else bits.push('Outside the EU — a visa and international fees');
      if (c.capital) bits.push(`Capital: ${c.capital}`);
      return {
        value: bits.join(' · '),
        coverage: COVERAGE.PARTIAL,
        uncertainty: 'This is the dimension no tool should weigh for you.',
        evidence: [],
      };
    },
  },
];

function absent(reason) {
  return { value: null, coverage: COVERAGE.NONE, uncertainty: reason, evidence: [] };
}

function firstSentence(text) {
  const s = String(text || '').trim();
  const m = s.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : s).trim();
}

/** Assess one destination across every dimension. */
export function assessDestination(c) {
  return DIMENSIONS.map((d) => ({
    key: d.key,
    label: d.label,
    note: d.note,
    ...d.forDestination(c),
  }));
}

/**
 * How much of the picture we actually have, per destination.
 *
 * Reported as coverage, never as a quality score — a country with thin data is
 * not a worse country, it is one we know less about.
 */
export function coverageSummary(assessment) {
  const counts = { full: 0, partial: 0, none: 0 };
  for (const d of assessment) counts[d.coverage]++;
  return {
    ...counts,
    total: assessment.length,
    label: `${counts.full} of ${assessment.length} dimensions fully recorded`,
  };
}
