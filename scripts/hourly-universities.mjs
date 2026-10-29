#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HourlyUniversities } from './lib/hourly-universities.mjs';

const HELP = `One institution per run, ordered Denmark → Norway/Sweden/Finland/Iceland → Europe → world,
then radial distance within each tier (unknown distance last, institution key breaks ties).

  node scripts/hourly-universities.mjs --next [--date YYYY-MM-DD]
  node scripts/hourly-universities.mjs --reserve [--date YYYY-MM-DD]
  node scripts/hourly-universities.mjs --finish RUN-ID --state complete --review FILE --commit FULL-SHA
  node scripts/hourly-universities.mjs --finish RUN-ID --state deferred --review FILE --reason TEXT --next-check-on YYYY-MM-DD [--commit FULL-SHA]
  node scripts/hourly-universities.mjs --finish RUN-ID --state failed --review FILE --reason TEXT [--next-check-on YYYY-MM-DD] [--commit FULL-SHA]

--next is read-only. --reserve creates docs/research/imports/hourly-state.json and
holds .cache/hourly-university.lock until exact-run finish. Existing/stale locks
require inspection, never automatic reclamation. Dates default to Copenhagen today.
Existing records are audited, never duplicated. Future deferrals and supported
scope:none exclusions are skipped until an explicit recheck date is due.
Optional docs/research/imports/discovery-candidates.json institutions are merged
by institution_key; existing seed rows win. A discovery-candidate must resolve
aliases/duplicates and establish accreditation/English scope before any promotion.

Complete requires a nonempty JSON acceptance report within the repository:
{ "institution_key": "dk-aau", "accepted": true, "reviewer": "reviewer name",
  "evidence": ["https://official.example/admissions"],
  "scores": { "admissions": 8, "imagery": 8, "format": 8 },
  "validation": { "fullGate": true, "cleanRelease": true } }
Scores must be 8–10 and evidence must contain official source URLs. accepted means
editorial acceptance, never human evidence verification. The commit must be a full
real local commit SHA; dispatcher verifies publication and CI before finishing.
Deferred/failed outcomes require a nonempty review file and reason; deferrals need
a future date. An optional --commit on either outcome records a verified real local
commit for partial publication; the outcome remains deferred or failed. Failed runs
may also set a future recheck date to avoid repeated
broken-source retries. Invalid finish leaves the reservation intact. Exhausting this finite
queue never establishes country, Europe, or world coverage. JSON is printed to stdout.
`;

try {
  const args = process.argv.slice(2);
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) { console.log(HELP); process.exit(0); }
  const values = {};
  const flags = new Set(['--next', '--reserve']);
  const named = new Set(['--finish', '--state', '--review', '--commit', '--reason', '--next-check-on', '--date']);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((!flags.has(arg) && !named.has(arg)) || Object.hasOwn(values, arg)) throw new Error(`Unknown or duplicate argument: ${arg}`);
    if (flags.has(arg)) values[arg] = true;
    else {
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing value for ${arg}`);
      values[arg] = args[++i];
    }
  }
  const commands = ['--next', '--reserve', '--finish'].filter((arg) => values[arg]);
  if (commands.length !== 1) throw new Error('Choose exactly one of --next, --reserve, --finish (see --help)');
  if (commands[0] !== '--finish' && Object.keys(values).some((key) => named.has(key) && key !== '--date')) throw new Error('Finish arguments require --finish');
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const worker = new HourlyUniversities(root, values['--date'] ? { today: values['--date'] } : {});
  const result = commands[0] === '--next' ? worker.next() : commands[0] === '--reserve' ? worker.reserve() : worker.finish({ runId: values['--finish'], state: values['--state'], review: values['--review'], commit: values['--commit'], reason: values['--reason'], nextCheckOn: values['--next-check-on'] });
  console.log(JSON.stringify(result, null, 2));
  if (result.status === 'needs-attention') process.exitCode = 3;
} catch (error) {
  console.error(`hourly-universities: ${error.message}`);
  process.exitCode = 2;
}
