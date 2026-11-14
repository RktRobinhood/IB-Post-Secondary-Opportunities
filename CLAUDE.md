# Working in this repository

Read [docs/WORKER_CARD.md](docs/WORKER_CARD.md) before university data work. It is
the only required data-work brief. For the simplification project, read GitHub
issue #83 and the issue you are implementing; its owner decisions take priority.

Read only files needed for the named task. Do not open `docs/research/`, queue
files or `docs/CHANGELOG.md` unless the task names them. `CONTEXT.md` is an
optional glossary; long specifications are optional background. Record student
facts and source links in data, with a checked date; Git history holds work notes.

The six-command interface being introduced by #75 and #76 is:

| Command | Purpose / current availability |
|---|---|
| `npm run build` | Generate the site. |
| `npm run dev` | Preview and rebuild. |
| `npm run check` | Currently checks built output; becomes the full gate in #75. |
| `npm run university:new -- <key>` | Scaffold a record; not available until #75. |
| `npm run refresh` | Annual source comparison; not available until #76. |
| `npm run check:links` | Check built output and outbound links. |

Until #75, use `npm test` (or `node scripts/qa.mjs`) for the full gate and
`node scripts/qa.mjs --stage data` for the quick data checks. CI runs the full
gate. Work one issue per branch/PR and follow #83 for review and merging.
