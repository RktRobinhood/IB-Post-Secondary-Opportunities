# The image standard

Every photograph this repository hosts is stored in one shape. Not because
uniformity is pretty, but because the alternative was 316 files averaging
694 kB, five of which were PNGs wearing a `.jpg` extension, and one of which
was a 5 MB portrait that the CSS cropped down to a letterbox before anyone
saw it.

This document is normative. If you are adding pictures, follow it. If you are
writing a script that downloads pictures, make it produce this automatically —
a standard that depends on remembering to run a tool is not a standard.

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

## What this does not cover

**Official institution images are hotlinked, not hosted.**
`scripts/fetch-official-images.mjs` records a URL served by the institution's
own server (`data/official-images.json`) and `picture()` in `src/lib/data.mjs`
prefers it. Those bytes are not ours, their dimensions are not ours, and we
cannot normalise them. That is an accepted trade: a university's own Open
Graph image is the picture it publishes of itself for exactly this purpose.

**SVG assets** — icons, the social card, the touch icon — are vector, already
small, and out of scope.

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

## The one dependency

`sharp` is a **devDependency**, used only by the local image scripts. The
build, the validator and the checker all run on Node's standard library alone,
which is why CI has no `npm ci` step and no lockfile is required for it.

Do not import `sharp` from anything under `src/`. If CI ever needs to install
a dependency to build the site, this constraint has been broken.
