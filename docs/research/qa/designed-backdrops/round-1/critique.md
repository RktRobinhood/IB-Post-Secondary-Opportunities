# Designed backdrops and uniform cards: art director, round 1, 6/10 (30 Sep 2026)

I judged every screenshot in this folder, in light and dark:

- `constructor-mixed`, `ucp`, `fontys`, `lut-same-field`, `rug-27-cards` and `home` at
  1280 px;
- `programme-designed-hero` at 1280 px;
- `phone-390-rug` and `phone-390-programme-hero` at 390 px;
- both contact sheets of backdrops.

## Score: 6/10

The idea is right and most of it is already working:

- **Every grid now reads as one set.** Cards are one size and share one hierarchy: pill,
  image band, serif title, meta line, note, rule, field or school. The two-column
  school grid, the home grid and the phone column all hold that.
- **A photo-less card no longer looks dead or second-class.** In light theme at
  Constructor, a designed card beside a photo card reads as a sibling. Photo and design
  share the same fade into paper, the same title position and the same weight.
- **The backdrop vocabulary suits the site.** Arcs, rays, contours, dots, hatch, waves
  and tiles, with one band or disc, in muted paper-and-ink colours. At its best
  (Applied Mathematics, Data Science and Society, Economics and Business Economics,
  Chemistry) it looks like a printed endpaper: intentional and calm.
- **The designed programme hero looks finished** in both themes. Wave lines, one
  diagonal band, the same veil and type as a photo hero, and it holds on the phone.

But three things fail the brief outright, and one of them breaks the phone:

1. **The phone layout overflows at 390 px.** Text and cards are cut off at the right
   edge.
2. **Designed cards repeat within a page.** This happens on three of the five pages
   shot.
3. **The field is not readable from the design.** The colour differences between
   fields are too small, and the motif carries no meaning.

## Must change before shipping

1. **Phone overflow (390 px).** In `phone-390-rug-*`:
   - the school name is clipped ("University of Gronin…");
   - the subtitle and the right-hand stat column ("IB TRANSCRIPTS") run off-screen;
   - every card is wider than the viewport, so body text is cut mid-word ("…with at
     lea").

   In `phone-390-programme-hero-light` the facts grid is clipped ("15 August 202",
   "€9,000 a seme…") and so is the "Before you apply" text. Something now forces a
   minimum width wider than 390 px. The uniform card size (a fixed or min width on
   `.card` or the grid track) is the likeliest cause. Fix it, then re-shoot at 360 and
   390. No horizontal scroll is allowed on any page.
2. **No two designed cards on one page may share a motif** (and ideally not a motif
   plus palette). Violations seen:
   - **UCP:** Management and Data Science are both *arcs + disc*, side by side at the
     top of a four-card page.
   - **Fontys:** Industrial Engineering & Management and Logistics Engineering are both
     *waves* in the same grey-blue, side by side.
   - **RUG:**
     - *weave* appears three times in the same beige-pink: Media Studies, Religious
       Studies, Global Politics and Sustainability.
     - *dots* appears in Arts, Culture and Media, Biomedical Engineering, Industrial
       Engineering and Management, and Human Geography and Planning.
     - *arcs* appears in American Studies, AI and Chemical Engineering.

   There are about 8 motifs × 2 overlays, which cannot cover RUG's designed cards
   uniquely. Choose each page's backdrops together, not one card at a time:
   - give each card on a page a distinct motif and overlay;
   - vary line angle, scale, density and overlay position;
   - allow a motif to repeat only when both scale and palette also differ, and never
     in adjacent cells.

   A guard should read the rendered page and fail on a repeat.
3. **Dark-theme strokes are too faint on some motifs.** Constructor's Industrial
   Engineering and Management (*tiles*) and Software, Data and Technology (*hatch*) are
   nearly black in dark mode. They read as empty cards beside the photos, which is the
   "dead" look the owner rejected. Raise stroke and overlay opacity in dark mode until
   every motif is as visible as *rays* or *contour*, which are fine.

## Top fixes, ranked

1. **The phone overflow** (above). It blocks shipping.
2. **Unique backdrops per page** (above). This is a brief point, and it fails on
   three of five pages.
3. **Make the field readable at a glance.** Today the field hues are too close:
   computing is lavender, engineering is pale blue, humanities and economics are both
   sand-pink. The motif is chosen at random (the contact sheet shows AI as
   *arcs/disc* at RUG and *contour/lines* at JKU). Two fixes that keep the calm:
   - widen the field palette so that at least computing, engineering, sciences,
     humanities, social sciences, business, arts and health differ in hue, not just in
     tint;
   - tie a motif family to each field and vary the parameters within it. For example:
     - *contour* for earth and environment;
     - *rays* for physics and energy;
     - *waves* for music and media;
     - *hatch* or *grid* for engineering;
     - *dots* for health and life sciences;
     - *tiles* for computing;
     - *arcs* for humanities;
     - *weave* for social sciences.

   Then a student learns "blue grid = engineering", and uniqueness comes from scale,
   angle, overlay and position.
4. **Remove the dead band at the bottom of short cards.** Uniform height is right, but
   cards with no note carry 60–110 px of empty paper under the meta line. Examples are
   Robotics, American Studies, Media Studies and Religious Studies on desktop, and
   AI and Computing Science on the phone. Either:
   - pin the meta line and footer to the bottom so the space sits between title and
     meta;
   - or give the image band a fixed taller share (about 55% of the card) so short
     cards are mostly picture.
5. **Stop the fade from washing out the photos in light theme.** The image band is
   only about 130 px tall, then fades to paper under the title. Photos have lost their
   punch: Fontys's container cranes are nearly invisible, and the circus silks are a
   smear. Parity has been reached partly by dimming the photos down to the designs.
   Start the fade lower (the title can sit on paper just below the image) or shorten
   it. Designs will still hold their own.
6. **Tone down *weave*.** At card size, the herringbone reads as upholstery. The
   variant with pink dashes (the contact sheet's Coach, CU) and the dense one (Law,
   Vesalius) are the closest the set comes to clip-art. Use a sparser, finer weave, or
   retire it for fields where it collides.
7. **The designed programme hero in light theme is muddy.** Olive-brown under a dark
   veil is a murky khaki (MODUL International Management), heavier than the pale card
   that led to it. Keep the dark veil so white type holds, but start from a cleaner,
   more saturated version of the field hue. The card-to-hero continuity should read as
   "the same design, lit for night", not as a different colour.

## Checks against the brief

| Brief point | Verdict |
|---|---|
| Every card in a grid reads as one set (size, hierarchy) | **Pass** at 1280. **Fail** at 390 because of the overflow. |
| Designed cards intentional and calm, paper and ink, not empty or clip-art | **Mostly pass.** Weave is the exception; faint dark-mode motifs read as empty. |
| No two designed cards on a page alike | **Fail:** UCP, Fontys, RUG. |
| Field readable at a glance | **Fail** from the design alone; only section headings and the footer label carry it. |
| Text contrast in both themes | **Pass.** Titles and meta are dark ink on the faded paper in light, and light on the dark fade in dark. The "Open entry" pills hold in both. |
| A designed card beside a photo not second-class | **Pass** in light. **Borderline** in dark where the motif is faint (Constructor). |
| Programme hero with a design looks finished | **Pass.** Light theme is muddy (fix 7). |

## Outside this change, seen in the screenshots

- **Home, both themes.** The search input renders about 200 px tall, with an equally
  tall "Filters" button and a large empty gap above it, which looks broken. The globe
  shows its "cannot draw the globe" fallback: probably the headless capture, but
  confirm on a real browser.
- **LUT:** almost every card has a photo, so it does not exercise the "same-field
  designed" case its filename suggests. Shoot a page where two designed cards share
  a field, to prove fix 3.

Re-shoot the same set, plus 360 px, after fixes 1–3. I expect 8 with those done, and
fixes 4–5 would lift it past that.
