# Commands

Use Node 20 or newer. Install the image-check dependency once with
`npm install --no-package-lock`. Reports and temporary files belong in ignored
`.cache/`.

| Command | Purpose |
|---|---|
| `npm run build` | Generate the complete site in `dist/`. |
| `npm run dev` | Serve `dist/` at http://localhost:4321 and rebuild on edits. |
| `npm run check` | Run the data and page checks. Selects the quick path below when safe. |
| `npm run university:new -- <key>` | Create a school draft, refusing to overwrite an existing record. |
| `npm run refresh` | Compare source pages, carry unchanged records to the next intake and write country work lists and a link report in `.cache/refresh/`. |
| `npm run check:links` | Check existing built pages and their outbound links. Needs the network. |

## Checking an edit

After a full build, an edit confined to one `data/schools/<key>.json` runs all
data checks, rebuilds that university and its programme pages, and checks their
structure and internal links against the existing site. Removed programme pages
are cleared. It recognizes staged, new and committed school changes, and tracks
the actual files from full and quick builds so reverted edits cannot leave stale
university pages behind. Shared indexes, the calendar and `data.json` wait for the
full build; use `npm run build` to preview those changes.

Other changes, a missing baseline, a different site base/origin, and CI run the
full gate. `npm run check -- --full` always runs it. A quick check does not qualify
a build for deployment: pull requests and pushes to main run the full gate in CI.

`npm run check -- --stage data` checks data without building. Use
`npm run check -- --list` to see the checks, or `--only eligibility,calendar` to
diagnose a named check. Network failures are reported by `check:links`, outside
the offline gate.

## Filling a draft

The scaffold exposes every schema field, including example programme, intake,
requirement and source objects. `null` means unknown; an empty scalar list also
means unknown. The key identifies the institution; no country, scope, date, fee
or requirement is guessed. Fill the researched fields and remove unused example
objects before running the gate. A draft is intentionally incomplete and cannot
be published until its required identity and source fields are filled.

Photo records keep local files, source URLs, authors and licences. See
[IMAGE_STANDARD.md](IMAGE_STANDARD.md) when replacing a photo. The six commands
above are the supported entry points.

## Annual refresh

The intake and IB session are configured once in `data/site-config.json` under
`cycle`. Refresh derives the next year, or uses an explicit `cycle.nextIntake`.

1. Run `npm run build`, then `npm run refresh -- --dry-run`. It fetches every
   recorded source and built outbound link, compares stable page content with the
   reviewed baseline, and prints unchanged/changed/broken record counts per
   country plus the share of source pages changed. A first-seen source, robot
   wall, timeout or unreadable page always goes to the work list.
2. Review `.cache/refresh/countries/<country>.md` or `.json` in country batches.
   Each contains changed/broken records only, with old facts beside current
   source text; JSON also keeps the previous source text and complete old record.
   Fix facts and source links manually. Every broken or unverified URL, by record
   and field and by built page, is in `.cache/refresh/links.md` and `.json`.
3. Run `npm run refresh` to carry records whose sources all match the baseline.
   Only intake fields and checked metadata change; requirements, fees, dates,
   historical cut-offs, IDs and prose retain their values. Dates get a visible
   previous-cycle warning until a person confirms them against the new intake.
   After reviewing the batch, update the site's `cycle`, then run the full gate.
4. After reading and updating the sources, save that reviewed comparison point
   with `npm run refresh -- --baseline`. It fetches again and saves readable
   sources without changing records. A comparison run never accepts changed
   pages as a new baseline automatically. Keep `.cache/refresh/baseline.json`
   between annual runs (copy it to another machine when moving the job).

On the first run there is no reliable baseline: all readable sources need review,
then `--baseline` establishes it. `--country=dk,nl` limits a country batch; the
unfiltered command also audits all built links. Dry runs write ignored reports
only, leaving authoring records and the baseline untouched. PDFs compare their
bytes conservatively; changes require reading the document. Passed hard dates
are retired at build time, so run a full build to update dates/counts/calendar
even when no data file changed. Network findings are outside the offline gate.
If a run is interrupted, add `--resume` to reuse completed fetches from that day
and fingerprint version. An ordinary run always fetches sources again.
