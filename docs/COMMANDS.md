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
| `npm run refresh` | List the annual intake rollover inventory; source comparison and carry-forward arrive in #76. Currently read-only. |
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

Photo import/review helpers remain internal until the bulk photo work in #78
confirms which it needs. The six commands above are the supported entry points.
