/**
 * A context note may not speak like a rule.
 *
 * The whole value of giving cultural observations their own record type is that
 * a student can tell at a glance whether they are reading policy or someone's
 * impression. That distinction collapses the moment a note says "you must": the
 * typography still says context, the sentence says requirement, and the
 * sentence is what gets remembered and acted on.
 *
 * If the honest phrasing really is "you must", then it is a rule, and it belongs
 * in `requirements` with an authoritative source behind it — which is a higher
 * bar, deliberately.
 *
 * Note what is NOT caught here. Advice is fine: "check the quota 2 page of the
 * programme you want" tells a student what to do without asserting policy. The
 * target is narrower — language that claims an obligation or entitlement exists.
 */

/** Phrases that assert an obligation rather than describe a tendency. */
export const RULE_VOICE =
  /\byou must\b|\byou are required\b|\bis required\b|\bare required\b|\byou need to have\b|\bthe requirement is\b|\bmandatory\b|\bmust be passed\b|\bdoes not qualify\b/i;

/**
 * @returns {{ok: boolean, phrase: string|null}}
 */
export function checkVoice(text) {
  const hit = RULE_VOICE.exec(text || '');
  return { ok: !hit, phrase: hit ? hit[0] : null };
}

/**
 * Every problem with one context note.
 * @returns {string[]} human-readable problems, empty when the note is sound
 */
export function checkContextNote(note) {
  const problems = [];
  if (!note?.id) return ['a context note with no id'];

  const voice = checkVoice(note.text);
  if (!voice.ok) {
    problems.push(
      `${note.id}: phrased as a rule ("${voice.phrase}"). If it is a rule, record it as a requirement with an authoritative source; if it is an observation, say it as one.`
    );
  }

  // A disagreement shown from one side only is worse than not showing it: the
  // reader gets the confidence of a contested label with none of the substance.
  if (note.confidence === 'contested' && !note.counterpoint) {
    problems.push(`${note.id}: marked contested but records no counterpoint.`);
  }

  // Attribution is not optional. A context note without a visible source is a
  // rumour with good typography, and it will be repeated by a counsellor.
  if (!note.attribution || note.attribution.length < 4) {
    problems.push(`${note.id}: no attribution. Every context note says who says so.`);
  }

  if (!(note.evidence || []).length) {
    problems.push(`${note.id}: no evidence. Secondary sources are expected here; none at all is not.`);
  }

  return problems;
}
