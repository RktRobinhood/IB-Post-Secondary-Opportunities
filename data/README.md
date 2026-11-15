# Authoring data

Read [the worker card](../docs/WORKER_CARD.md) for university data work.

- `schools/<key>.json` owns one institution and all its programmes and detailed intakes.
- `countries/<code>.json` owns shared country context, application systems, routes and dates.
- `country-guides/` holds optional longer student guidance; recognition, funding and places stay shared.
- Sources and checked dates stay beside facts. Unknown means unknown; use the school schema for unfamiliar fields.
- Photographs and original source/credit/usage records stay local. Live image inputs are under `image-inputs/`.

Use [the six commands](../docs/COMMANDS.md) for scaffolding, checking and annual
source refresh. The intake/session is set in `site-config.json`. The annual
comparison baseline, link report and country work lists stay in ignored
`.cache/refresh/`; preserve the reviewed baseline between years.

Runtime eligibility/calendar indexes in `src/lib/records.mjs` are derived,
never a second authoring format. Passed dates and intakes are retired from the
public build without erasing their original sourced records.
