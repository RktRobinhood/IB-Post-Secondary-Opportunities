# Photographs

Use [WORKER_CARD.md](WORKER_CARD.md) for university work. The image records in
`data/images.json` (places) and `data/programme-images.json` (disciplines) are
shared by all country, university and programme adapters.

Every programme card and every university and country header uses a photograph
stored under `src/assets/img/`. The build never loads an image from another
host. Prefer a suitable stored photo, then a freely licensed source such as
Wikimedia Commons, then the university's own photograph with its usage basis
recorded. A generated filler is the last resort and must be marked illustrative.
Never use a logo, map or event banner as a photograph.

Inspect the local photograph and describe its actual subject briefly. A photo
of a discipline at another university is illustrative, not a claim to show the
named campus. Keep the local file (`src`), source URL (`page`), author and
licence. Description, caption, scope and technical dimensions/variants support
rendering; no review rounds, verdicts, scores or place-check records are needed.
Show the credit beside the photo and on `/credits/`.

A photograph may be reused on different pages. Do not show the same photograph
twice on one page, including a different resolution of it. Discovery and planner
results use bounded pages so reusable discipline pools can serve the catalogue.

Store WebP files cropped to 16:10 with metadata removed and an sRGB profile.
Programme photos use 480/720/960-pixel variants where the source is large enough;
place photographs may be up to 1600 pixels wide. Never enlarge a small source.
Keep each file under 300 kB. `scripts/lib/image-standard.mjs` defines the limits
and provides `normalise()`; `scripts/optimize-images.mjs` can update older files.
The build itself uses Node's standard library only; `sharp` is an authoring tool.

`npm run check` validates credit records, local files, responsive variants,
programme coverage, visible credits, photo reuse and card-text contrast. Its
built-page check also rejects remote images in deferred slides, card chunks and
client data. `npm run check -- --full` is the release gate.
