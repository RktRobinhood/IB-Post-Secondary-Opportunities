# The image standard

Every photograph this repository hosts is stored in one shape. Not because
uniformity is pretty, but because the alternative was 316 files averaging
694 kB, five of which were PNGs wearing a `.jpg` extension, and one of which
was a 5 MB portrait that the CSS cropped down to a letterbox before anyone
saw it.

This document is normative. If you are adding pictures, follow it. If you are
writing a script that downloads pictures, make it produce this automatically —
a standard that depends on remembering to run a tool is not a standard.

## Two halves, and this used to be one of them

This document used to govern bytes and dimensions only, and said so in its
scope note. That was a deliberate limit and it was the wrong one.

The reason it was wrong is visible in what shipped underneath it. Canada's
hero was an aerial photograph of the Britannia Yacht Club in Ottawa, annotated
with red arrows labelling Mud Lake. A Luxembourg university was represented by
a total solar eclipse. A Methodist seminary in Tallinn was represented by a
portrait captioned "Abikaasa Maire Lilleorg" — Estonian for *spouse*. Every one
of those files was 16:10, 1600 px, WebP, under the byte ceiling, correctly
attributed and correctly licensed. Every one passed `npm run check` silently.
None of them was an error state; they were successful runs of a pipeline that
was never asked what the picture was of.

A standard that certifies the container and says nothing about the contents
does not just fail to catch this. It actively conceals it, because "the image
standard passes" sounds like an answer to "is this picture all right?" and is
not one. So the scope is now two halves:

| | Governs | Enforced by |
|---|---|---|
| **The shape** | container, width, ratio, bytes, metadata | `npm run check` |
| **The subject** | what the picture is of, and who says so | `npm run test:images` |

The rest of this document is the first half, unchanged. [The subject](#the-subject)
is the second, and it is where the rules that were missing now live.

## The shape

| Property | Value |
|---|---|
| Container | WebP |
| Extension | `.webp` |
| Maximum width | 1600 px (smaller if the byte ceiling demands it) |
| Aspect ratio | 16:10 |
| Byte ceiling | 300 kB |
| Metadata | stripped |
| Colour profile | sRGB |

`scripts/lib/image-standard.mjs` is the single source of truth for these
numbers. Import the constants; do not retype them.

### Why 16:10

`.card__media` is `aspect-ratio: 16 / 10` with `object-fit: cover`
(`src/assets/css/site.css`). Every picture is already cropped to 16:10 by the
browser. Storing another ratio means shipping pixels down the wire for the
sole purpose of discarding them. Cropping at rest is the same picture, minus
the waste.

The crop is centred, which is exactly what `object-fit: cover` does, so
normalising an existing image does not change how it looks on the page.

### Why 1600 px

The templates declare `width="800"`. 1600 is precisely 2×, which is sharp on
a retina display and pointless to exceed.

**Never enlarge.** An image smaller than the target keeps its own size and is
only cropped to ratio. Upscaling invents detail that was never photographed
and costs bytes to store the invention. The effective width is:

```
min(1600, sourceWidth, round(sourceHeight × 1.6))
```

The third term matters for wide-but-short sources: a 1400×642 image cropped
to 16:10 at full width would need 875 px of height it does not have.

### Why a byte ceiling rather than a fixed quality

Quality 78 is the starting point, not the rule. A busy photograph at q78 can
still land at 676 kB, and one enormous file undoes the savings of fifty small
ones. So the ceiling is the rule and the encoder settles beneath it.

The ladder walks **width outer, quality inner**: 1600 → 1400 → 1200 → 1024 →
896 → 768 px, and within each width 78 → 70 → 62. The first combination under
300 kB wins.

Width moves before quality drops because a slightly smaller sharp photograph
reads better than a full-width mushy one. That is measured, not assumed.
Extending quality down to 48 instead was tried and is worse on every picture
where the two disagree:

| | width-first, q≥62 | quality-first, q≥48 |
|---|---|---|
| `us-yale` | 1024px q78, **273 kB** | 1200px q48, 284 kB |
| `si-um` | 1200px q78, **267 kB** | 1400px q55, 291 kB |
| `nz-auckland` | 1200px q78, **281 kB** | 1400px q55, 288 kB |

Smaller files *and* a much higher quality setting. With the width steps running
down to 768 px, no photograph in the catalogue exhausts the ladder.

### When the ladder runs out anyway

`normalise()` returns its smallest candidate flagged `overBudget` rather than
throwing. This matters more than it looks: on a throw the caller keeps the
**original**, which is invariably larger than the WebP just declined — so a
rule meant to hold page weight down would make the page heavier and leave
behind a format the checker fails on.

So the file is written, `npm run images:optimize` reports it and exits
non-zero, and `npm run check` warns. It is deliberately *not* a build failure:
the converter has already tried everything, no tool can clear it, and a gate
nobody can clear is a gate someone eventually switches off. The fix is a human
choosing a less punishing photograph.

The manifest records what was actually stored, so a picture that settled at
1200 px is described as 1200 px. A width below 1600 is normal, not a defect.

### Why WebP and not AVIF

AVIF is roughly 30% smaller again, and it is the right destination
eventually. It is not the right destination now, because it needs a
`<picture>` element with a fallback source for older Safari, which means
touching all three `<img>` call sites, doubling the manifest, and carrying two
files per photograph.

WebP is universally supported, needs one `src`, one file, and one manifest
entry, and captures the large majority of the available saving. Revisit when
bandwidth is the binding constraint. It is not; storage was.

### Programme card backgrounds

The faded discipline photographs behind programme cards live in their own manifest,
`data/programme-images.json`. The record shape and review fields are the same as
`data/images.json`, and they go through the same fetcher:

```bash
npm run images -- --manifest=programmes
```

Every record there is pinned to a Commons file a reviewer chose, and it carries a
`scope` (`programme:<id>` or `field:<value>`) that `src/lib/programme-imagery.mjs`
resolves each card by.

Two things differ, and both follow from the use:

- **They are stored at 960 px, not 1600.** A card is at most about 400 CSS px wide,
  so 960 is its 2× width. The ratio, the format, the byte ceiling and "never enlarge"
  are unchanged.
- **Each has a 480 px copy beside it** (`x-480.webp`, listed on the record as
  `variants`) for the card's `srcset`. A copy has no credit or review of its own,
  because it is the same photograph.

`scripts/import-programme-images.mjs` turns the research in
`docs/research/programme-images/` into these records and signs the reviews.
`scripts/test-programme-images.mjs` checks the credit, the review, the files, and the
text contrast over the veil.

## What the shape rules do not cover

**Official institution images are hotlinked, not hosted.**
`scripts/fetch-official-images.mjs` records a URL served by the institution's
own server (`data/official-images.json`) and `picture()` in `src/lib/data.mjs`
prefers it. Those bytes are not ours, their dimensions are not ours, and we
cannot normalise them. That is an accepted trade: a university's own Open
Graph image is the picture it publishes of itself for exactly this purpose.

The subject-matter rules below *do* reach them, with one carve-out: the score
floor does not, because an official image was never scored. It was not chosen
from a pool of candidates by a heuristic — it is the picture the institution
attached to its own page — so there is no number for a floor to measure. A
person can still reject one, and the rejection works exactly as it does for a
Commons photograph.

**SVG assets** — icons, the social card, the touch icon — are vector, already
small, and out of scope of both halves.

## How to comply

### Downloading new pictures

`npm run images` already conforms. `scripts/fetch-images.mjs` normalises
through `scripts/lib/image-standard.mjs` before anything touches the disk, and
records the post-normalisation width, height and byte count in
`data/images.json`. You do not need to do anything extra, and you should not
add a separate optimisation pass afterwards.

If you write a new fetcher, call `normalise()` from that module between the
download and the write. Never write a response body straight to
`src/assets/img/`.

### Converting existing pictures

```bash
npm run images:optimize          # convert anything non-conforming in place
npm run images:optimize -- --dry  # report what would change, touch nothing
```

Idempotent: a file already meeting the standard is left alone, so it is safe
to run at any time.

### Verifying

`npm run check` fails the build if any hosted image is not WebP, exceeds
1600 px, or is off-ratio by more than a rounding pixel — all three are cleared
by re-running the converter. Breaking the byte ceiling is a warning instead,
for the reason given above.

The check parses WebP headers directly and has no dependencies, so it runs in
CI exactly as it runs locally.

## The subject

`src/lib/imagery.mjs` is the single source of truth for everything in this
section, exactly as `scripts/lib/image-standard.mjs` is for the shape. Import
the constants; do not retype them.

### What a picture is for

A Destination hero should say something true about studying there. That is a
higher bar than "a photograph of the right country", and most of the failures
cleared the lower bar comfortably: Berne at dusk is a photograph of
Switzerland, a Sentinel-2 pass is a photograph of Amsterdam, a yacht club is a
photograph of Ottawa. None of them is a photograph of anywhere a seventeen-year-old
could go and study.

In rough order of preference:

1. **The institution's own published image.** `scripts/fetch-official-images.mjs`
   collects these and `picture()` prefers them. A university's Open Graph image
   is what it chose to show of itself; widening its coverage is the cheapest
   available improvement to the imagery as a whole.
2. **A building students would recognise**, in daylight, at eye level, with
   people or without.
3. **The city**, if nothing of the institution exists — but a recognisable
   part of it, not a skyline that could be anywhere.
4. **Nothing**, and the page renders its empty state. This is a real option and
   it is often the right one.

### What a picture is not

Each of these has shipped. They are penalties in `scripts/fetch-images.mjs`
rather than rules here, because a rule in a document is a rule someone has to
remember at midnight, and each carries the name it reports under so a low score
arrives with its argument attached:

| Not this | Because |
|---|---|
| A portrait | A photograph of a person is a photograph of a person, however well composed |
| A sign | The nameplate outside is not the place |
| Satellite or survey imagery | A student wants eye level, not orbit — this is a hard rejection, not a penalty |
| A scan from an archive | Archives digitise freely, so they dominate any search, and a scanned poster reads to a scorer as a nice wide photograph |
| Event photography | An event happens at a place; the room is incidental and the composition is about people looking at each other |
| An aerial that names something else | An aerial naming the subject is often the best picture available. One naming a marina is a picture of a marina |
| A street address | A door photographed to document a location rather than to show it |
| A floor plan or a direction sign | It names the institution, it is wide, and it is a map |

### Approval

Every entry in `data/images.json` is in one of three states, and the build knows
which:

```json
"review": {
  "state": "approved",
  "by":    "who looked at it",
  "at":    "2026-09-23",
  "file":  "the Commons filename this judgement was about",
  "note":  "why"
}
```

- **Approved.** A person opened it, looked, and said yes. It publishes whatever
  it scored.
- **Rejected.** A person looked and said no. It does not publish however well it
  scored, and the page falls back to its empty state.
- **Neither.** A machine pick. It publishes if it clears the floor and not
  otherwise.

`by` and `at` are not decoration, and a review missing either is ignored rather
than half-honoured. An approval is an accountability record — it is the thing
that makes *what we show is checked* a true sentence rather than a claim — and
an approval nobody signed and nobody dated establishes nothing at all.

`file` is what stops an approval drifting onto a different photograph. The
judgement was about one picture, not about a slot on a page, so if the fetcher
ever replaces the file the approval does not come with it and the new picture is
an ordinary machine pick again.

Nothing in the fetcher can write a review. The only review it ever touches is
one it carries forward, through `carryReview()`, and only onto the same file; a
decided entry is skipped by a bare `--refresh` exactly as a pinned one is, so
the ordinary way a judgement gets lost — somebody re-running the fetcher across
all 471 entries on a Tuesday — cannot happen. `scripts/test-images.mjs` reads
the fetcher's source back to keep it that way. An approval a script could forge
would not be worth recording.

### Who reviews

**Since 24 September 2026 the site owner has delegated photo review to an
automated visual check**, and no human sign-off is required. The reviewer looks
at every picture, and where it is unsure a Commons photograph really shows the
institution it triangulates — against the institution's own website and share
image first, and its social media second. The institution is the source of
truth for what it looks like.

Its judgements are recorded exactly like a person's: a `review` with `state`,
`by`, `at`, the `file` it judged and a `note` saying why and what it was checked
against. `by` names the reviewer honestly — "Claude (automated visual review,
delegated by the site owner)" — so an automated approval can never be mistaken
for a person's. Verdicts are written to `docs/research/photo-review/*-verdicts.jsonl`
and applied by `node scripts/apply-photo-review.mjs`, which also re-fetches
proposed replacements through the ordinary fetcher. What follows about "a
person" still describes the mechanism; the owner has decided who that may be.

### The floor

`IMAGE_SCORE_FLOOR` is **40**. An unreviewed machine pick scoring below it is
not published at all.

It was taken from the distribution rather than chosen for how it sounds. Of the
495 stored pictures, 489 carry a score; sorted, they are dense — the largest gap
between adjacent distinct scores anywhere above 40 is four points — with exactly
one discontinuity in the whole range:

```
8   12   14   24  ··············  40   44   47   48   50   52 …
                 16 points, empty
```

That gap is the only place a line can be drawn that is a fact about the data
rather than an opinion about quality. Below it sit an eclipse, a street address,
a photograph of a sign and two near-square snapshots — categorically different
from everything above. Above it the scores run continuously, so any cut there
would split pictures two points apart into published and withheld and would be
argued about forever.

So the floor answers a narrow question: *is the scorer's verdict here worth
anything at all?* It does not answer *is this picture good?*, which no scorer
can. `scripts/test-images.mjs` asserts the floor still sits in a gap, so moving
it on a hunch fails a test.

A second number, `REVIEW_THRESHOLD` (65), withholds nothing. It is the size of
the queue — what a person should look at, in the order they should look at it.

### The empty state

A Destination or institution with no acceptable image renders something
deliberate. There is one mechanism, not two:

- a hero with no publishable picture renders `hero({ variant: 'plain' })` —
  ruled paper, the destination's own pattern layer, and the words doing the work
  the photograph would have done;
- a card that shows a photograph when it has one renders `card__media--empty`,
  a typographic panel with the subject's monogram, which keeps it the same
  height as its neighbours in a grid.

Both draw entirely from the design tokens, so both are correct in dark mode
without a second rule. Neither apologises or mentions the review queue: a
student reading about Ljubljana does not need to know about our image pipeline.

A card that never wanted a picture — the three navigation cards on the home
page — is not the same thing as a card that wanted one and has none, so the
caller opts in with `placeholder`. A monogram on a card that was always
typographic would be absurd.

### Working the queue

```bash
npm run images:review                     # the summary and the queue, worst first
npm run images:review -- --heroes         # Destination heroes only
npm run images:review -- --show ie-atu    # everything known about one picture
npm run images:review -- --report         # what the build is currently withholding
npm run images:review -- --approve ie-atu --by "You" --note "what it shows"
npm run images:review -- --reject  lu-lunex --by "You" --note "what is wrong"
```

Gallery photographs are addressed as `key#2`, `key#3` — the slide they become.

Every Destination hero stays in the queue until somebody has decided about it,
whatever it scored; there are 35 and the scores do not help, since Canada's
yacht club scored 60. Everything else is queued when it is withheld or scored
at or below 65. There are 460 of those and no realistic prospect of a human eye
on every one, so the score is used for what it is actually good for: ordering a
queue nobody will finish.

There is deliberately no `--approve-all`, and no flag that takes a score and
approves everything above it. An approval nobody made is worse than an honest
machine pick, because it claims a check that did not happen.

To replace a picture rather than judge the one we have, put a Commons filename
in `data/images.json` with `"pin": true`, run
`npm run images -- --refresh --only=<key>`, and approve the result.

### Verifying the subject

`npm run test:images` is in `npm test`. Its useful assertions are the refusals:
no published image is an unreviewed machine pick below the floor; the floor
cannot be got round by deleting the score it is measured against; an approval
signed by nobody, dated never, or naming a different photograph is not an
approval; the fetcher has no code path that writes one; and no imagery code
branches on a country code or names an institution — the same guard
`scripts/test-credentials.mjs` holds the credential model to. Every difference
between two Destinations is a difference in their records.

## The one dependency

`sharp` is a **devDependency**, used only by the local image scripts. The
build, the validator and the checker all run on Node's standard library alone,
which is why CI has no `npm ci` step and no lockfile is required for it.

Do not import `sharp` from anything under `src/`. If CI ever needs to install
a dependency to build the site, this constraint has been broken.
