# External research kit

`RESEARCH_SPEC.md` and one assignment from `ASSIGNMENTS.md` are the material to
give an external researcher. The schema and read-only validator check structure
and internal evidence links; they do not establish source accuracy.

`ASSIGNMENTS.md` and `audit.json` preserve the **19 October 2026** assignment
snapshot used for the returned files. They are not the current acceptance queue.
Reviewed records and remaining work are tracked in `../imports/queue.json`.
Regenerating assignments changes the requested modes/gaps, so retain the original
assignment when comparing an older return with its contract.

The generator is `scripts/build-external-research-queue.mjs YYYY-MM-DD`. The
validator is `python scripts/validate-external-research.py <file-or-directory>`
and requires the Python `jsonschema` package. Neither publishes records.
