# Picking degree photos from the university's own pages (14 October 2026)

The owner: "I want to have images for everything… for the program ones,
you freestyle, they can be anything you think is appropriate." Be
aggressive, not precious, where a degree has nothing; be selective only
between several candidates.

`node scripts/harvest-official-photos.mjs <cc>` read every photo-less
degree's own page and kept the photographs that pass the quality floor. For
each country it wrote:

- `official-candidates-<cc>.json`: one entry per degree (`key`, `name`,
  `row`, `candidates: [{n, url, sourcePage, width, height}]`);
- contact sheets `official-candidates-<cc>-<page>.jpg`: one row per degree,
  labelled `<row>.<n>`.

## Your job

For each degree (row), choose **one** candidate, written to
`official-picks-<cc>.jsonl`, one line per degree, appended as you go:

    {"key":"school-nl-rug-physics","pick":2,"why":"students at an optics bench"}

Order of preference: a picture of the subject being done (a lab, a studio,
a stage, a field trip) > students at work > the campus or its buildings >
a generic but real photograph. Pick `null` **only** on a hard failure of
every candidate: a logo, a text slab or poster, a graphic or icon, a broken
or blank image, a face cut-out with no setting. A weak but real photograph
beats nothing. `why`: under 12 words, what it shows.

Read each sheet (it is an image; Read it), match rows to keys in the JSON.
If a row's thumbnails are too small to judge, download the candidate URL to
`D:/ibp-tmp/picks/` and Read it. Before starting a country, read its picks
file if it exists and skip keys already done.

No git; write only `official-picks-<cc>.jsonl` files. Reply with, per
country: picked, null.
