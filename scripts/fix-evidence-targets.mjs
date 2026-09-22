/**
 * A one-off correction: six evidence records pointed at the wrong claim.
 *
 *   node scripts/fix-evidence-targets.mjs [--write]
 *
 * WHAT WENT WRONG
 *
 * The Denmark migration attached every institution-level page it found to that
 * institution's `about` field. So a tuition-fee table, an IB recognition page
 * and a key-figures report all ended up recorded as evidence for a paragraph of
 * descriptive prose they have nothing to do with.
 *
 * Nothing published to students was wrong because of this — the fee facts and
 * the IB rules were recorded correctly elsewhere. What was wrong was the
 * TRACEABILITY: click through from a claim to "its" source and you landed on a
 * page that did not discuss it. That is the thing this repository promises not
 * to do, so it is worth fixing properly rather than leaving as a known quirk.
 *
 * Each correction below is written out individually with its reason, because a
 * clever rule that re-points evidence automatically is precisely how you get a
 * second, quieter version of the same bug.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const FILE = path.join(ROOT, 'data', 'evidence', 'dk.json');
const WRITE = process.argv.includes('--write');

/**
 * `supports` replaces the record's targets outright.
 * `role: 'reference'` means: a page consulted about this institution, not
 * evidence for a single published sentence. It is still checked — it must stay
 * live and stay about that institution — but it is not matched word by word.
 */
const CORRECTIONS = [
  {
    id: 'ev-en-aau-dk-qoypcd',
    was: 'dk-aau.about',
    supports: [{ entity: 'dk-aau', field: 'links.ibPage' }],
    claim: 'Aalborg University publishes a dedicated page on how it treats the International Baccalaureate.',
    why: 'The URL is character-for-character the value stored in dk-aau.links.ibPage. It is evidence for that link, not for the prose describing the university.',
  },
  {
    id: 'ev-en-aau-dk-1mkufzz',
    was: 'dk-aau.about',
    supports: [{ entity: 'dk', field: 'feeContext' }],
    claim: 'Aalborg University states who pays tuition and who does not.',
    why: 'A finance-and-fees page is evidence about fees. Fee status in this data model is a Danish national rule held on the destination, not an institutional one.',
  },
  {
    id: 'ev-bachelor-au-dk-c8758',
    was: 'dk-au.about',
    supports: [{ entity: 'dk', field: 'feeContext' }],
    claim: 'Aarhus University publishes its bachelor tuition fees for 2026–2027.',
    why: 'A tuition-fee table is evidence about fees. It is also a PDF, so it can only ever be confirmed by a person reading it.',
  },
  {
    id: 'ev-sdu-dk-toh5we',
    was: 'dk-sdu.about',
    supports: [{ entity: 'dk', field: 'feeContext' }],
    claim: 'The University of Southern Denmark states its bachelor tuition fees and who is exempt.',
    why: 'Same as the other two fee pages.',
  },
  {
    id: 'ev-sdu-dk-1i6w2t0',
    was: 'dk-sdu.about',
    role: 'reference',
    why: 'SDU\'s central admission-requirements page is a hub consulted while building SDU\'s entries. It backs no single sentence, and pretending otherwise would mean inventing a claim to justify the citation.',
  },
  {
    id: 'ev-cbs-dk-1enokji',
    was: 'dk-cbs.about',
    role: 'reference',
    why: 'CBS reports and key figures genuinely informed the description of CBS, but as background reading rather than as the source of a specific statement.',
  },
];

async function main() {
  const doc = JSON.parse(await fs.readFile(FILE, 'utf8'));
  const records = doc.records || doc;
  const byId = new Map(records.map((r) => [r.id, r]));

  let applied = 0;
  for (const fix of CORRECTIONS) {
    const rec = byId.get(fix.id);
    if (!rec) {
      console.log(`  ?  ${fix.id} is not in the file — already renamed or removed`);
      continue;
    }
    const before = (rec.supports || []).map((s) => `${s.entity}.${s.field}`).join(', ');
    console.log(`\n  ${fix.id}`);
    console.log(`     was:  ${before}`);
    if (fix.supports) {
      console.log(`     now:  ${fix.supports.map((s) => `${s.entity}.${s.field}`).join(', ')}`);
      rec.supports = fix.supports;
    }
    if (fix.claim) rec.claim = fix.claim;
    if (fix.role) {
      console.log(`     now:  ${before} (kept), marked role: reference`);
      rec.role = fix.role;
    }
    console.log(`     why:  ${fix.why}`);
    // The correction changes what this record asserts, so any previous check of
    // it describes a different claim and must not be carried forward.
    delete rec.sourceCheck;
    applied++;
  }

  if (WRITE) {
    await fs.writeFile(FILE, JSON.stringify(doc, null, 2) + '\n');
    console.log(`\n${applied} record(s) corrected and written.`);
    console.log('Re-run `npm run verify:write` so their source checks describe the corrected claims.\n');
  } else {
    console.log(`\n${applied} record(s) would change. Re-run with --write to apply.\n`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
