import { cardKey } from './families.mjs';
import { plural } from './html.mjs';

/** A future intake can remain visible while its teaching language is unsettled.
 * Omission preserves the listed-language behaviour of existing records. */
export const intakeLanguageUnconfirmed = (p) =>
  (typeof p?.language === 'object' ? p.language?.intakeStatus : p?.languageIntakeStatus) === 'unconfirmed';

export function intakeLanguageWarning(p) {
  if (!intakeLanguageUnconfirmed(p)) return null;
  const year = String(p.intake || '').match(/^\d{4}/)?.[0];
  return `${year ? `${year} teaching` : 'Teaching'} language unconfirmed`;
}

/** Count choices as programme families, never their duplicate campus offerings.
 * A family with a confirmed English path counts once as confirmed; a pending
 * family has only unconfirmed English paths. Its card still warns about any
 * unsettled path, even where a confirmed sibling exists. */
export function englishProgrammeCounts(graph, programmes = []) {
  const groups = new Map();
  for (const p of programmes) {
    const instruction = typeof p.language === 'object' ? p.language?.instruction : p.language;
    if (instruction && !/^English$/i.test(instruction)) continue;
    const rec = graph?.programmes?.get(p.programmeId || p.programme || p.id);
    const key = cardKey(rec) || p.programmeId || p.programme || p.id;
    const confirmed = !intakeLanguageUnconfirmed(p);
    groups.set(key, (groups.get(key) || false) || confirmed);
  }
  const confirmed = [...groups.values()].filter(Boolean).length;
  return { confirmed, pending: groups.size - confirmed };
}

export function englishProgrammeCountText(counts, noun = 'English-taught programme') {
  return `${plural(counts.confirmed, noun)}${counts.pending ? ` · ${counts.pending} awaiting language confirmation` : ''}`;
}
