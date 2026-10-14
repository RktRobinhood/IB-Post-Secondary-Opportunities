# Photo pass (October 2026)

The owner, 14 October 2026: be aggressive about every university having a
real photograph — ideally from the university's own website, otherwise
branch out — and certify each picture before it is used. Be economical.

On 14 October 194 of 550 university pages and 42 of 78 country pages had no
photograph. The automated share-image fetcher
(`scripts/fetch-official-images.mjs`) found candidates for 37 universities;
they wait for a look in `review-candidates.json`. The other 157 are split
across `batch-1.txt` … `batch-6.txt`; the countries are in `countries.txt`.

## Rules for a picture

- **The right place.** The university's own campus, buildings, or students
  on its campus. Not a logo, a crest, a map, a poster, a stock photo of
  laptops, a graduation crowd shot from far away, a car park, or an event
  banner with text. For a country: a city, landscape or street that says
  "this is where you would live" — never a university.
- **Worth stopping for.** Landscape, sharp, at least ~1200 px wide, under
  2 MB. Would a 17-year-old stop scrolling for it?
- **Where from, in order:**
  1. The university's own website (any page: campus, about, admissions,
     news, press/media). Prefer its Open Graph image or a campus photo in
     a page. These are hot-linked, never copied.
  2. Wikimedia Commons, a freely licensed photo of the campus. These are
     self-hosted by the pipeline, so record the Commons file name, not a URL
     to hot-link.
  3. Nothing that is neither: a picture whose source and licence you cannot
     name is not certified.

## How to record one (persist each as you go — the session can end)

Official image (route 1):

    node scripts/stage-image.mjs look <key> <imageUrl> <pageItIsOn>
    # Read the preview it writes to D:/ibp-tmp/img-review/<key>-preview.jpg
    node scripts/stage-image.mjs approve <key> "<University name>" "<what it shows, one line>"
    # or: node scripts/stage-image.mjs reject <key> "<why>"

Each decision is its own file in `data/official-images.staged/`, so batches
never collide. The coordinating session merges them.

Commons photo (route 2): look at it (download the 800px thumbnail to
D:/ibp-tmp/img-review/ and Read it), then append one line to your batch's
results file, `batch-N.results.jsonl`:

    {"key":"<key>","kind":"commons","file":"File:Example campus.jpg","subject":"<University name>","note":"<what it shows>"}

No picture found: append `{"key":"<key>","kind":"none","tried":"<where you looked>"}`.

While on the university's site, if you see its **admissions page for
international / undergraduate applicants** (not the homepage), add
`"admissionsUrl":"…"` to that key's results line — it gives sparse pages a way on.

## Who does what

Agents write files only; the coordinating session runs git, merges staged
decisions (`node scripts/stage-image.mjs merge`), pins Commons picks and runs
the build and checks.
