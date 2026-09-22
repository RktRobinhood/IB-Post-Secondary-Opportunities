/**
 * Move the Danish programmes onto the cross-country credential model.
 *
 *   node scripts/migrate-credentials.mjs [--write]
 *
 * The old shape said `{ level: "bachelor", title: "BEng", ects: 210 }`. That
 * loses two things a student needs and a Dane would never confuse:
 *
 *   A BEng in Denmark is a *diplomingeniør*, awarded after 210 ECTS over three
 *   and a half years, with a placement semester, and it is a different
 *   qualification from the 180-ECTS BSc in Engineering that leads directly to
 *   the civilingeniør master's. Calling both "bachelor" is true and unhelpful.
 *
 *   The institution type is part of the answer. A professionsbachelor from a
 *   professionshøjskole and a bachelor from a universitet sit at the same level
 *   and are not the same thing.
 *
 * Both are now recorded in Danish, with English beside rather than instead.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'data');
const WRITE = process.argv.includes('--write');

/**
 * Danish awarded titles, keyed by what the old records hold. Written out rather
 * than inferred, because inference is what produced the shape being replaced.
 */
const DANISH = {
  BEng: {
    comparableLevel: 'bachelor',
    structure: 'standard',
    localTitle: 'Diplomingeniør',
    localTitleEn: 'Bachelor of Engineering',
    abbreviation: 'BEng',
    eqf: 6,
    note: 'Three and a half years, 210 ECTS, including a placement semester. Applied in emphasis.',
  },
  'BSc in Engineering': {
    comparableLevel: 'bachelor',
    structure: 'standard',
    localTitle: 'Bachelor i teknisk videnskab',
    localTitleEn: 'BSc in Engineering',
    abbreviation: 'BSc',
    eqf: 6,
    note: 'Three years, 180 ECTS. The route to the civilingeniør master\'s.',
  },
  BSc: {
    comparableLevel: 'bachelor',
    structure: 'standard',
    localTitle: 'Bachelor (BSc)',
    localTitleEn: 'Bachelor of Science',
    abbreviation: 'BSc',
    eqf: 6,
  },
  BA: {
    comparableLevel: 'bachelor',
    structure: 'standard',
    localTitle: 'Bachelor (BA)',
    localTitleEn: 'Bachelor of Arts',
    abbreviation: 'BA',
    eqf: 6,
  },
};

/** Danish institution types, by institution id. */
const SECTORS = {
  'dk-aau': { local: 'universitet', en: 'university', kind: 'research' },
  'dk-au': { local: 'universitet', en: 'university', kind: 'research' },
  'dk-ku': { local: 'universitet', en: 'university', kind: 'research' },
  'dk-ucph': { local: 'universitet', en: 'university', kind: 'research' },
  'dk-sdu': { local: 'universitet', en: 'university', kind: 'research' },
  'dk-dtu': { local: 'universitet', en: 'university', kind: 'research' },
  'dk-ruc': { local: 'universitet', en: 'university', kind: 'research' },
  'dk-itu': { local: 'universitet', en: 'university', kind: 'research' },
  'dk-cbs': { local: 'universitet', en: 'university', kind: 'research' },
};

async function main() {
  const dir = path.join(DATA, 'programmes');
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'));

  let migrated = 0;
  const unknown = new Set();

  for (const f of files) {
    const p = path.join(dir, f);
    const prog = JSON.parse(await fs.readFile(p, 'utf8'));
    const c = prog.credential;
    if (!c || c.comparableLevel) continue;

    const mapping = DANISH[c.title];
    if (!mapping) {
      unknown.add(c.title || '(no title)');
      continue;
    }

    prog.credential = {
      comparableLevel: mapping.comparableLevel,
      structure: mapping.structure,
      localTitle: mapping.localTitle,
      localTitleEn: mapping.localTitleEn,
      abbreviation: mapping.abbreviation,
      ...(SECTORS[prog.institution] ? { sector: SECTORS[prog.institution] } : {}),
      eqf: mapping.eqf,
      ...(c.ects ? { ects: c.ects } : {}),
      ...(c.years ? { years: c.years } : {}),
      // Kept so anything still reading the old field keeps working, and so the
      // change is reversible without re-deriving anything.
      title: c.title,
      level: c.level,
    };
    migrated++;
    if (WRITE) await fs.writeFile(p, JSON.stringify(prog, null, 2) + '\n');
  }

  if (unknown.size) {
    console.log(`\nNo mapping for: ${[...unknown].join(', ')}`);
    console.log('Add it to DANISH above rather than guessing at runtime.\n');
  }
  console.log(
    WRITE
      ? `Migrated ${migrated} programme credential(s).\n`
      : `Would migrate ${migrated} programme credential(s). Re-run with --write.\n`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
