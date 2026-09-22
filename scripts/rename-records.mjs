/**
 * Rename records and every reference to them, atomically.
 *
 *   node scripts/rename-records.mjs            # report
 *   node scripts/rename-records.mjs --write    # do it
 *
 * WHY THIS EXISTS
 *
 * Four SDU programmes carried ids ending `-2`. That suffix was not a decision;
 * it was a uniqueness fallback firing because the migration's degree classifier
 * was silently broken — a regex whose `\b` escapes had been eaten, so every
 * degree classified as plain "bachelor" and BSc and BEng versions of the same
 * programme collided. The fallback did its job and kept the records distinct,
 * which is exactly why nobody noticed the cause for so long.
 *
 * With the classifier repaired, those ids can say what they mean. A programme
 * id ends up in a URL that a counsellor pastes into an email, and
 * `-mechatronics-2` tells the person receiving it nothing, while
 * `-mechatronics-beng` tells them which of the two degrees is meant — which is
 * precisely the distinction a Danish applicant has to get right.
 *
 * Renaming by hand is how dangling references happen, so this rewrites every
 * reference in the data directory and refuses to write anything if the new id
 * already exists.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'data');
const WRITE = process.argv.includes('--write');

/**
 * Each rename is written out with its reason. A general "strip the -2" rule
 * would be shorter and would quietly do the wrong thing the first time a `-2`
 * meant something else.
 */
const RENAMES = [
  {
    from: 'dk-sdu-electronics-2',
    to: 'dk-sdu-electronics-beng',
    why: 'The BEng (diplomingeniør) version of Electronics — 210 ECTS over 3.5 years, alongside the 180 ECTS BSc.',
  },
  {
    from: 'dk-sdu-mechanical-engineering-2',
    to: 'dk-sdu-mechanical-engineering-beng',
    why: 'The BEng version of Mechanical Engineering.',
  },
  {
    from: 'dk-sdu-mechatronics-2',
    to: 'dk-sdu-mechatronics-beng',
    why: 'The BEng version of Mechatronics.',
  },
  {
    from: 'dk-sdu-software-engineering-2',
    to: 'dk-sdu-software-engineering-sonderborg',
    why: 'Not a different degree but a different campus: SDU teaches Software Engineering in both Vejle and Sønderborg, with a different emphasis in each, so these are two Programmes rather than one with two Opportunities.',
  },
];

/** Every id that derives from a renamed one, e.g. its Opportunity. */
function derivedRenames(renames, ids) {
  const out = [];
  for (const r of renames) {
    for (const id of ids) {
      if (id !== r.from && id.startsWith(`${r.from}-`)) {
        out.push({ from: id, to: `${r.to}${id.slice(r.from.length)}`, why: `follows ${r.from}` });
      }
    }
  }
  return out;
}

async function allJsonFiles(dir, out = []) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await allJsonFiles(p, out);
    else if (e.name.endsWith('.json')) out.push(p);
  }
  return out;
}

async function main() {
  const files = await allJsonFiles(DATA);

  /* Collect every id that exists, so derived renames can be found and so a
     collision can be refused rather than discovered afterwards. */
  const existing = new Set();
  for (const f of files) {
    const doc = JSON.parse(await fs.readFile(f, 'utf8'));
    for (const rec of [doc].flat()) {
      if (rec?.id) existing.add(rec.id);
      for (const r of rec?.records || []) if (r?.id) existing.add(r.id);
    }
  }

  const all = [...RENAMES, ...derivedRenames(RENAMES, existing)];

  for (const r of all) {
    const fromGone = !existing.has(r.from);
    const toExists = existing.has(r.to);

    // Already done. Re-running a rename has to be safe, because the alternative
    // is someone deciding mid-cleanup whether it is safe to run it again.
    if (fromGone && toExists) {
      r.skip = true;
      continue;
    }
    if (fromGone) {
      console.log(`  ?  ${r.from} does not exist, and neither does ${r.to}. Nothing to rename.`);
      r.skip = true;
      continue;
    }
    if (toExists) {
      console.error(
        `  ✗ Both ${r.from} and ${r.to} exist. Renaming would merge two records into one, ` +
          `so nothing has been written. Work out which is current first.`
      );
      process.exit(1);
    }
  }

  const todo = all.filter((r) => !r.skip);
  const map = new Map(todo.map((r) => [r.from, r.to]));

  console.log(`\n${todo.length} rename(s):\n`);
  for (const r of todo) console.log(`  ${r.from}\n    -> ${r.to}\n     ${r.why}\n`);

  /* Rewrite references everywhere. Done on parsed JSON, never with a regex
     across the text — a careless regex over this data directory has already
     destroyed it once. */
  let touched = 0;
  let refsRewritten = 0;

  const rewrite = (node) => {
    if (Array.isArray(node)) return node.map(rewrite);
    if (node && typeof node === 'object') {
      for (const k of Object.keys(node)) node[k] = rewrite(node[k]);
      return node;
    }
    if (typeof node === 'string' && map.has(node)) {
      refsRewritten++;
      return map.get(node);
    }
    return node;
  };

  for (const f of files) {
    const before = await fs.readFile(f, 'utf8');
    const seenBefore = refsRewritten;
    const doc = rewrite(JSON.parse(before));
    if (refsRewritten === seenBefore) continue;

    // Only files that actually contained a renamed reference get rewritten.
    // Comparing serialised output instead would rewrite every file in the data
    // directory, because re-serialising flattens the hand formatting — the
    // blank lines between sections and the short inline arrays that make a
    // curated file readable. A rename is not a licence to reformat the repo.
    touched++;
    if (WRITE) await fs.writeFile(f, JSON.stringify(doc, null, 2) + '\n');
  }

  /* Then the filenames, which are derived from the ids by convention. */
  let renamedFiles = 0;
  for (const r of todo) {
    for (const dir of ['programmes', 'opportunities']) {
      const oldPath = path.join(DATA, dir, `${r.from}.json`);
      const newPath = path.join(DATA, dir, `${r.to}.json`);
      try {
        await fs.access(oldPath);
      } catch {
        continue;
      }
      renamedFiles++;
      if (WRITE) await fs.rename(oldPath, newPath);
    }
  }

  console.log(
    WRITE
      ? `Rewrote ${refsRewritten} reference(s) across ${touched} file(s) and renamed ${renamedFiles} file(s).\nRun npm run validate to confirm nothing dangles.\n`
      : `Would rewrite ${refsRewritten} reference(s) across ${touched} file(s) and rename ${renamedFiles} file(s).\nRe-run with --write.\n`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
