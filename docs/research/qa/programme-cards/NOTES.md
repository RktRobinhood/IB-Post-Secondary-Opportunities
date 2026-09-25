# Programme card images: build notes

Owner's ask: "The cards for each programme are great but they're plain. If there's an image specific
to that discipline or bachelor's, put that as the background."

Built from `docs/research/programme-images/` (README, proposal.jsonl, contact sheet). Decisions are
logged here as they are made, newest last.

## Decisions

- **2026-09-25: Records live in a new file, `data/programme-images.json`.** Same record shape and review
  fields as `data/images.json`. They are kept out of that file so a photo critic working on
  `images.json` never collides with these. Keys are `programme-<programme id>`, `field-<value>` and
  `field-<value>-2`. Each record carries `scope` (`programme:<id>` or `field:<value>`), which is what the
  resolver reads.
- **2026-09-25: Second images for the two crowded fields.** I looked at 12 computing and 9 business
  candidates from Commons at 16:10. The shortlist is kept outside the repo.
  - **Computing:** `Hackathon participants at Wikimania 2024.jpg` (CC BY 4.0, Tulipasylvestris,
    4032 px). The README named this one. People at a round table coding on laptops. The only incidental
    is a small QR-code notice on the wall, with no banner or stage. It differs from the first computing
    image, which shows one programmer at an iMac.
  - **Business:** `SWOT-analysis at Wikimedia Suomi strategy workshop 2018 01.jpg` (CC BY-SA 4.0,
    Olimar, 4634 px). A hand places dot-votes on sticky notes in a SWOT grid. SWOT is a textbook
    business-strategy tool, and the handwriting is Finnish and illegible at card size. It shares
    sticky notes with the first business image, `Team workshop.jpg`, but the frame is different:
    a close-up of a hand on a grid, where the first shows three people at a wall.
  - **Rejected:**
    - Coding da Vinci hackathon frames: all portraits, signage or a balloon over Berlin.
    - The UFV business tours: a drill press, and people in a factory.
    - The ZERO-Ko presentation: a stage and cameras.
    - The Formula Student business-plan pitch: a competition with a logo on screen.
- **How the variant is chosen.** For a field with *n* images, take the programmes whose image falls
  back to that field and sort them by programme id. The programme at position *i* gets image
  `i mod n`. The order is stable and comes from the data. On an institution page, where cards are
  sorted by field and then name, neighbouring cards in a crowded field alternate. A hash would split
  50/50 overall, but neighbours would often match.
- **Pipeline.**
  - `scripts/fetch-images.mjs --manifest=programmes` is the same fetcher as before, pointed at the
    new file. Everything else is shared: credit, the 16:10 WebP normalisation and `carryReview`.
  - Each picture is stored at 960 px, with a 480 px copy for `srcset`. A card is at most about
    400 CSS px wide, so a 1600 px master would never be downloaded. `normalise()` gained an optional
    `maxWidth`. Its default behaviour is unchanged.
  - Programmes that share a photograph share one file on disk.
  - Totals: 102 files, 4.1 MB. That is 51 distinct photographs across 57 records.
- **Reviews.** `scripts/import-programme-images.mjs` turns `proposal.jsonl` and `additions.jsonl`
  into records, runs the fetcher, and signs an approval for each record whose file landed. The note
  is the research's cropNote plus its "why". The fetcher still cannot sign anything, so the
  `test-images` guard is untouched.
- **Resolution.** `src/lib/programme-imagery.mjs` resolves each card in this order:
  1. `programme:<id>`;
  2. `field:<field.primary>`;
  3. `field:interdisciplinary`.

  Records are keyed by Programme id, not Opportunity id, because the Opportunity id carries the
  intake. Coverage: 73 of 73 programmes resolve. 35 have their own picture, and 38 use a field
  picture: computing splits 8 and 7, business 7 and 6.
- **The veil, and a departure from the README: the text starts below a 4.5rem band.** The README
  mocked text in the lower half of a short card. Real programme cards lead with the title, then the
  requirement lines, tags and a foot. At the 55% top veil, `--ink-soft` over a black pixel is about
  3.5:1, so text cannot start at the top.
  - Programme cards get `--card-headroom: 4.5rem` of top padding. The photograph shows most in
    that band, and no text sits there.
  - The veil reaches `--veil-text` exactly where the title starts, then rises to the foot value.
    Cards are about 56 px taller than before.
  - This is the only design that makes "AA at worst case" provable rather than hoped for.
- **Veil numbers, and why they differ from the README:**
  - light: 0.55, then 0.84 where the text starts, then 0.94 at the foot;
  - dark: 0.60, then 0.86, then 0.93, with the photograph at `brightness(.85)`.

  The minimum under text is 0.84 rather than 0.82 so that the accent links clear 4.5:1 with margin.
- **Colours swapped inside a veiled card.** Worst case is a black pixel in light mode and a dimmed
  white pixel in dark mode. Swaps:
  - `--ink-mute` becomes `--ink-soft`. The palest grey would be about 3:1.
  - `--accent` becomes `--accent-2`, which reaches 4.99:1.
  - `--warn` becomes `--veil-warn`: `#744A10` in light mode, 4.98:1, and the ordinary dark warn in
    dark mode.

  Worst cases: light `--ink` 11.6, `--ink-soft` 6.2; dark `--ink` 11.7, `--ink-soft` 7.5. All are
  computed by `scripts/test-programme-images.mjs` from the numbers in site.css.
- **Finder and planner rows** (`.prog--backdrop`) get the same picture as a faded strip behind a
  boxed row. Text runs across the whole row, so the row veil never drops below `--veil-text`.
  It is lightest on the right. The finder's institution thumbnail, "the place", stays. A row picked
  on the map drops the photograph, so the map's tint still shows.
- **Guard: `scripts/test-programme-images.mjs`** runs in the built stage of the gate. It checks that:
  - every programme resolves a picture, and every card, finder row and planner result carries one;
  - every record is credited, licensed, and has a signed review for its own file;
  - every file and variant is on disk as recorded, in the image standard;
  - every picture is on /credits/;
  - the CSS veil matches `VEIL`, the swaps are in place, and every text colour reaches 4.5:1
    worst case in both themes;
  - no code names a programme, a record or a field value.
- **Top veil lowered after the first look: light 0.55 to 0.40, dark 0.60 to 0.45.** At 0.55 the
  picture in the text-free band read as a grey wash. No text sits in that band, so contrast is
  unaffected. `VEIL` and the CSS tokens moved together, and the guard checks they match.

## Round 0: screenshots (`round-0/`)

The screenshots were taken with headless Edge from a private build (`DIST_DIR` in the scratchpad).
The shared `dist/` was being rebuilt by other agents mid-capture, which produced "Not found" frames.

| File | What it shows |
|---|---|
| `aarhus-au-{light,dark}.png` | The Aarhus University grid. Business alternates SWOT, then team workshop. Computing alternates iMac, hackathon, iMac. Cognitive Science has its own EEG picture. |
| `via-{light,dark}.png` | The VIA grid of 11 cards: the animation, graphic storytelling, construction, climate and mechanical pictures. |
| `finder-{light,dark}.png` | The first rows of /programmes/. |
| `phone-aarhus-au-{light,dark}.png` | 390 px wide at 2x. |
| `phone-finder-{light,dark}.png` | 390 px wide at 2x. |
| `planner-{light,dark}.png` | The /planner/ page. It has no results until subjects are chosen. |
| `contact-sheet-all-cards-{light,dark}.jpg` | Every programme card on every institution page: 19 institutions, 73 cards. |

**Seen in round 0, for the critic:**

- On the finder, some institution thumbnails render as flat panels in the headless captures. These
  are hot-linked official images (for example `aaudxp-cms.aau.dk`), which did not load in time. This
  was the case before this change and is not part of it.
- On a wide finder row, the humanities library picture crops to a dark band and barely shows,
  especially in dark mode. It is legible, but it is the weakest row.
- Cards are about 56 px taller because of the headroom band. That is the price of provable AA
  contrast; see the decision above.
- `field:economics` is still the weakest image (the README says the same). It is used on one
  card only.
