/**
 * Separate "I read the page" from "someone else checked me".
 *
 *   node scripts/migrate-attestation.mjs            # report
 *   node scripts/migrate-attestation.mjs --write
 *
 * WHAT WENT WRONG
 *
 * 152 evidence records were marked `verified` and two had been checked by a
 * second party. The rest were written by research passes that opened the
 * official page, quoted it, wrote the record, and set `verified` on their own
 * work in the same breath — across 108 free-text spellings of "Read,
 * 2026-09-23". Records written by this session are among them.
 *
 * That is a failure of the model rather than of the passes. `verified` was the
 * obvious thing to write once you had genuinely read the page, and nothing said
 * who was allowed to write it.
 *
 * WHAT THIS DOES
 *
 * It does not throw the work away. An agent that opened the official page and
 * quoted the sentence did something real, and recording it as unread would be
 * its own kind of lie. So the reading is preserved as an `attestation` — named,
 * dated and with its method — and the state drops to `needs-review`, whose
 * existing label is already exactly right: "Not yet checked by a person."
 *
 * `verified` now means a second party read the record back against its source.
 * After this migration the site will report very few of those, possibly none.
 * That number is not a regression; it is the number that was always true.
 *
 * WHAT IT WILL NOT TOUCH
 *
 * data/evidence/dk.json and nl.json, which another pass holds. Changes needed
 * there are printed at the end for whoever owns them.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { methodFromText } from '../src/lib/attestation.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'data', 'evidence');
const WRITE = process.argv.includes('--write');

/**
 * Held by another pass at the time this was written. Reported, never written —
 * unless the holder runs it themselves with --include-held, which is why the
 * flag exists: the remedy for the records this pass cannot touch should be one
 * command for whoever can, not a paragraph of instructions.
 */
const HELD_ELSEWHERE = new Set(['dk.json', 'nl.json']);
const INCLUDE_HELD = process.argv.includes('--include-held');
const NOT_MINE = INCLUDE_HELD ? new Set() : HELD_ELSEWHERE;

/**
 * Who to name as the attester.
 *
 * The free text says what was done ("Read from the source page") and never who
 * did it, so there is no name to recover. Inventing one would be worse than
 * having none: a reviewer checked against a fabricated party is not checked at
 * all. This says exactly what is known and no more, and it differs from any
 * human name, so the independence check works from the first review onward.
 */
const ATTESTER = 'the research pass that wrote this record';

async function main() {
  const files = (await fs.readdir(DIR)).filter((f) => f.endsWith('.json')).sort();

  let migrated = 0;
  let keptVerified = 0;
  const deferred = [];
  const perFile = [];

  for (const file of files) {
    const p = path.join(DIR, file);
    const doc = JSON.parse(await fs.readFile(p, 'utf8'));
    const records = doc.records || doc;
    let touched = 0;

    for (const r of records) {
      if (r.verificationState !== 'verified') continue;

      // A genuine second-party review already recorded: leave it entirely.
      if (r.review?.by) {
        keptVerified++;
        continue;
      }

      if (NOT_MINE.has(file)) {
        deferred.push(`${file}: ${r.id} — ${JSON.stringify((r.verifiedBy || '').slice(0, 60))}`);
        continue;
      }

      const text = r.verifiedBy || '';
      r.attestation = {
        by: ATTESTER,
        at: r.retrievedAt || (r.meta && r.meta.dataAsOf) || '2026-09-23',
        method: methodFromText(text),
        // Keep the original sentence only where it says more than "it was
        // read" — several carry real findings, like a page that stamps its own
        // update date or two conversion tables that disagree.
        ...(text.length > 48 ? { note: text.slice(0, 800) } : {}),
      };
      delete r.verifiedBy;
      r.verificationState = 'needs-review';
      touched++;
      migrated++;
    }

    if (touched) {
      perFile.push(`${file}: ${touched}`);
      if (WRITE) await fs.writeFile(p, JSON.stringify(doc, null, 2) + '\n');
    }
  }

  console.log(`\nSelf-attested records moved from "verified" to "needs-review" with their reading preserved:\n`);
  for (const line of perFile) console.log(`  ${line}`);
  console.log(`\n  ${migrated} migrated`);
  if (keptVerified) console.log(`  ${keptVerified} left verified — they carry a genuine second-party review`);

  if (deferred.length) {
    console.log(`\nHeld by another pass — ${deferred.length} record(s) needing the same change:\n`);
    for (const d of deferred.slice(0, 40)) console.log(`  ${d}`);
    if (deferred.length > 40) console.log(`  … and ${deferred.length - 40} more`);
    console.log(
      `\n  Same treatment: verificationState -> "needs-review", and an attestation of\n` +
        `  { by: ${JSON.stringify(ATTESTER)}, at: <retrievedAt>, method: <from the text> }.\n`
    );
  }

  console.log(WRITE ? 'Written.\n' : 'Nothing written. Re-run with --write.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
