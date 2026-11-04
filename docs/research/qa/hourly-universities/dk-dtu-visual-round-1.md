# DTU independent imagery and shared-format review — round 1

Run: `c5373ead-1163-4ee5-b801-f08c91da0950`. Reviewer: Codex automated photo editor/art director, independent of the DTU researcher. Reviewed 4 November 2026. Scope: canonical `dk-dtu` institution and its single General Engineering programme/opportunity. This is an automated review, not a claim of human verification.

## Status

Fresh source inspection, the first twelve clean captures and the second sixteen clean captures are complete. Final visual acceptance on the second clean snapshot: **imagery 8/10; shared format 8/10 for the safe slice**. Full information parity remains incomplete under issue #71. No prior approval metadata is being treated as this review.

Final candidate: **`15b40a42e44d240c703284ccef43d60d233ebb7e`**. Its three actual built HTML files were rechecked after the final build. The sixteen screenshots reviewed on `5aed224144834dd50b3765e8c2ed432c8d134706` apply to this final candidate's unchanged visual presentation: the only runtime delta is canonical IB evidence placed first for the results-release source link, with no image, CSS, layout or visible-text change. **Scores remain imagery 8/10 and shared format 8/10.** Final release-gate summary is dispatcher-owned and is not implied by these visual scores.

Read: `docs/QA_CRITIC_LOOP.md`, `docs/HOURLY_UNIVERSITY_WORKFLOW.md`, ADR 0008, `docs/PAGE_TEMPLATES.md`, `docs/research/schools/PARITY.md`, `docs/EXPERIENCE_PRINCIPLES.md`, and `docs/IMAGE_STANDARD.md`.

## Initial actual-pixel inspection

All four local originals below were opened through the image viewer. Paths are relative to the repository.

| Actual image | Actual display resolution | Pixel judgement | Source and attribution inspection |
|---|---|---|---|
| `src/assets/img/places/dtu.webp` | 1200 × 750 | Warm yellow-brick Building 321 in summer daylight, framed by mature trees. Recognisable campus fabric; a small building number is incidental. No car park, logo, map or event. The dark upper foliage gives text room, though the narrow phone crop must be checked in the page. Suitable existing institution image. | [Commons source](https://commons.wikimedia.org/wiki/File:Building_321,_Technical_University_of_Denmark,_2016-07-20.jpg) identifies Building 321, with 324 behind, at DTU; own work by Finn Årup Nielsen, CC BY-SA 4.0; original 5098 × 3328. Manifest matches. |
| `src/assets/img/places/dtu-2.webp` | 1600 × 1000 | Students sitting on a sunny campus lawn with sculpture and low campus architecture behind. Informal everyday student-life scene, not visibly an organised event. Attractive and appropriate gallery image; central groups should remain meaningful at phone crop. | [Commons source](https://commons.wikimedia.org/wiki/File:180904_studenter_vid_DTU_8361_(44186358965).jpg), independently read via Commons imageinfo API after the web reader failed. Original 3936 × 2624. API licence CC BY 2.0 and Artist News Oresund match manifest; description explicitly credits News Øresund – Anna Palmehag and mentions CC BY 3.0. Worker advised to retain the photographer's name in the credit and explain the source metadata discrepancy rather than invent rights. |
| `src/assets/img/places/dtu-3.webp` | 1600 × 1000 | Clean contemporary Building 202, blue sky, trees and pedestrian paving. Architecture is dominant; bollards are incidental. Good campus gallery counterpoint to 321. | [Commons source](https://commons.wikimedia.org/wiki/File:DTU,_bygning_202,_2026_(1).jpg) identifies Building 202, National Food Institute, own work by Toxophilus, CC BY-SA 4.0; original 4032 × 3024. Manifest matches. |
| `src/assets/img/places/dtu-4.webp` | 1600 × 1000 | Exam hall full of desks and laptops. Uninviting for the opening discovery experience. Existing rejected verdict remains correct; must not resolve into hero/gallery/credits. | Manifest rejection inspected; no fresh approval. |

At initial inspection there was no `programme:dk-dtu-general-engineering` image record. Programme resolution must be checked after the worker's stable changes; an unrelated engineering-pool card image is not evidence of programme-specific visual coverage.

### Programme choice and shared credit finding

The live `load()` result initially resolved the programme opportunity `dk-dtu-general-engineering-2027-autumn` to `field-engineering.webp` (960 × 600), an Engineering Fabrication Laboratory/student shop photograph from UC Davis. This actual asset was opened: goggles, mechanical parts and students at a workshop bench. It is a plausible field illustration, but not DTU-specific.

The worker requested a narrow independent comparison with DTU's own programme-page image. [General Engineering's official page](https://www.dtu.dk/english/education/undergraduate/general-engineering) explicitly embeds the photograph under “Engineers with an international outlook”, with alt “Programming ©Mikkel Adsbøl”. Its [actual image URL](https://www.dtu.dk/english/-/media/dtudk/uddannelse/bachelor/uddannelser/general-engineering/bachelor_general-engineering.jpg?hash=93A704D096F6ED8B3D581F55D76233DB&rh=0&rw=960) was downloaded only to `C:/Users/BlackBox/AppData/Local/Temp/dtu-official-programming-review.jpg` for viewing, not to a hosted repository asset. Actual viewed pixels: **1920 × 1080 JPEG, 444712 bytes**, despite the URL's `rw=960` query.

It shows students collaborating around a table of laptops, circuits, wires and small design-build devices, photographed from above. The learning activity is legible and enticing; no map, logo, car park or event staging dominates. The centre retains tangible engineering objects even if side faces crop out. This is materially stronger for this degree than the generic UC Davis field photograph. **Source-photo judgement: 8.5/10, provisional until actual card/hero crops and credit projection are inspected.** Recommended standard `programme:dk-dtu-general-engineering` official hotlink record, photographer Mikkel Adsbøl, and linked-use wording; no open licence was inferred.

Common credit issue reported to dispatcher before any private runtime fix: `src/lib/data.mjs` `creditOf()` emits only “Image: institution” for external official programme images, and `src/pages/meta.mjs`'s official-image table renders only Subject and Published on. Both omit a recorded photographer. Because DTU names © Mikkel Adsbøl explicitly, a correct `author` field alone is insufficient student-facing credit. Proposed shared solution is to project author where present and expose the recorded usage basis in the shared credits surface, retaining the official source link. This reviewer owns no runtime edits.

## Final acceptance evidence

### Clean capture iteration 1 — not accepted

Dispatcher clean tree `f67caa0a36b37678963c4edd98d207df34720964`, successful SSG reported as 59.0 seconds. Actual built HTML inspected directly under `D:/ibp-tmp/absalon-release-20261030/dist` (the dated directory name is reused; inspection was of this newly reported DTU snapshot, not old SDMK output):

- `universities/dk-dtu/index.html`: main local image `/IB-Post-Secondary-Opportunities/assets/img/places/dtu.webp`, accurate Building 321/324 alt, Finn Årup Nielsen/CC BY-SA 4.0 credit linked to source. Exactly the two accepted gallery images resolve, with News Øresund – Anna Palmehag/CC BY 2.0 and Toxophilus/CC BY-SA 4.0 credits. Rejected `dtu-4.webp` absent.
- `programmes/dk-dtu-general-engineering-2027-autumn/index.html`: exact official registered URL, accurate collaboration alt, visible `Image: Mikkel Adsbøl` linked to programme source. Rejected exam image absent.
- `credits/index.html`: actual General Engineering row contains Mikkel Adsbøl, the honest linked-use/copyright basis and the official course-page link. The shared correction uses existing data fields, with no DTU layout branch.

All twelve actual screenshot files were opened. Directory: `docs/research/qa/hourly-universities/dk-dtu-shots/`.

| Surface | Desktop light | Desktop dark | Phone light | Phone dark |
|---|---|---|---|---|
| Institution | `universities__dk-dtu--desktop-light.jpg` | `universities__dk-dtu--desktop-dark.jpg` | `universities__dk-dtu--phone-light.jpg` | `universities__dk-dtu--phone-dark.jpg` |
| Programme | `programmes__dk-dtu-general-engineering-2027-autumn--desktop-light.jpg` | `programmes__dk-dtu-general-engineering-2027-autumn--desktop-dark.jpg` | `programmes__dk-dtu-general-engineering-2027-autumn--phone-light.jpg` | `programmes__dk-dtu-general-engineering-2027-autumn--phone-dark.jpg` |
| Credits, institutional disclosure open and filtered to Mikkel Adsbøl | `credits--desktop-light.jpg` | `credits--desktop-dark.jpg` | `credits--phone-light.jpg` | `credits--phone-dark.jpg` |

Actual desktop captures are 1280 px wide; phone captures are 390 px wide. Phone dark screenshots were additionally opened at original resolution for text/credit inspection.

**Rendered imagery: 6/10 — not accepted.** Institution hero correctly shows the yellow-brick campus and remains attractive at narrow crop. But the official image is visibly broken in all four programme screenshots, showing a grey/black gradient and broken image icon/alt text. The institution's General Engineering card also has a broken image strip. Correct HTML and a successful independent download do not prove browser delivery. Source-photo quality remains 8.5/10, but it cannot substitute for rendered pixels.

**Shared format and credits: 8/10 for the safe structural slice, pending image resolution.** Institution opens with place, then glance facts and its degree. Programme opens with concise degree identity and then short answers, requirements and closed details. Both themes are readable at phone width; no institution-specific branch is visible. Named photographer and linked-use basis are now actually visible on the credits surface and hero. Credits on phone stack the row into readable labelled values. Its long source link is bounded by the table's scroll/clipping treatment rather than wrapping fully, and the table caption is unnecessarily narrow; these are polish opportunities, not a reason to claim missing attribution.

Changes with highest value:

1. Diagnose actual browser image failure and recapture with the remote photograph genuinely loaded (`naturalWidth > 0`), or retain a publishable robust image and mark the asset gap. Do not certify a grey placeholder as the programme photograph.
2. Preserve the shared named-author/usage-basis credit projection verified above.
3. Keep #71's research/projection work explicit. This round accepts neither a full information-parity claim nor a zero-English-offering conclusion: the current source confirms one programme, while the interface clearly marks 2027 language confirmation as pending.

Dispatcher was notified as soon as the first broken-image capture was opened. A new rendered iteration is required before imagery acceptance.

### Recovery source review before clean capture iteration 2

Dispatcher's fresh browser diagnostic of the exact official image returned `net::ERR_BLOCKED_BY_ORB`, zero natural dimensions and a direct 403 `text/html` response (`D:/ibp-tmp/dtu-image-diagnostic.log`). The official source photograph remains attractive but is unsuitable for publication through this unreliable hotlink. No header/security bypass or copied proprietary asset is approved.

The worker proposed a programme-scoped reuse of the existing local `field-engineering.webp` and its 480/720 variants, preserving the Commons file and reserving it through programme specificity before the field-pool assignment. Independent fresh [Commons source inspection](https://commons.wikimedia.org/wiki/File:Engineering_Fabrication_Laboratory_(Student_Shop)_(11422752566).jpg) confirms UC Davis College of Engineering as author, original 5184 × 3456 JPEG, and CC BY 2.0 at `https://creativecommons.org/licenses/by/2.0`; the file page records Flickr licence review in 2019. Existing local file is 960 × 600 WebP, 69692 bytes; variants 480 × 300/20284 bytes and 720 × 450/33184 bytes.

**Recovery source-photo judgement: 8/10 as an explicitly identified engineering subject illustration.** Its student hands, tools, assembled mechanical components and safety glasses clearly express making/testing. It is not a photograph of DTU and must not be presented as one. The proposed alt/description says: “Engineering students assembling components at UC Davis fabrication laboratory; engineering subject illustration, not a DTU scene.” Photographer and CC BY 2.0 credit must remain visible, with source/licence links in the shared credits surface. This trades exact-place specificity for reliable, properly licensed subject imagery. Campus images still establish DTU's actual place. Existing generic approval metadata was not used as the fresh review.

This source judgement does not accept final rendered imagery. The dispatcher must check image uniqueness and produce a separate `dk-dtu-shots-round-2/` capture set; the initial twelve failed captures remain untouched.

### Clean capture iteration 2 — accepted safe visual slice

Dispatcher clean tree `5aed224144834dd50b3765e8c2ed432c8d134706`, successful SSG reported as 86.2 seconds. The actual newly built HTML was read directly from the same clean release directory. DTU institution still has its correct local hero plus the same two gallery sources and full credits; the rejected exam photo is absent. Programme hero now uses local `/IB-Post-Secondary-Opportunities/assets/img/programmes/field-engineering.webp` and credits UC Davis College of Engineering · CC BY 2.0, linking the Commons file. Alt names UC Davis and identifies a subject illustration; the shared 120-character truncation leaves its final “not a DTU scene” clause incomplete, though the location and subject character are already explicit. A shorter future alt would be cleaner. `/credits/` has General Engineering (DTU), the complete UC Davis author, linked CC BY 2.0 licence and Commons file source. Neither the blocked DTU image URL nor a Mikkel credit survives in the current programme/credits output.

All **sixteen** actual screenshots were opened:

- `dk-dtu-shots-round-2/` contains the same twelve exact filenames listed for iteration 1 above, now showing local UC Davis imagery and credits filtered to UC Davis with the programme-card disclosure expanded.
- `dk-dtu-official-credits-round-2/credits--desktop-light.jpg`, `credits--desktop-dark.jpg`, `credits--phone-light.jpg`, `credits--phone-dark.jpg` show the remaining published official records filtered to Aarhus University, with their institutional disclosure open. These verify the generic Credit/Usage basis projection independently of the withheld DTU candidate; this is a shared component check, not a new AU research audit.

The local programme image genuinely loads in the institution card and programme heroes. Its light-mode desktop hero retains the hands, components and faces clearly enough; the phone crop keeps the central making activity. Institution crop and credit remain readable in both modes. The four UC Davis credits captures show an easy-to-scan row with author, licence and file links, stacked with labels on phone. All four remaining-official credits captures show actual Credit and Usage basis values, clear source links and honest unnamed-photographer wording. Mobile captions remain narrowly wrapped but author/usage text is readable.

The first reduced previews of the two tall dark-programme screenshots appeared to omit the hero content, and I provisionally flagged format 7/10 pending investigation. The dispatcher independently reopened those exact files and saw their complete heroes. I then reopened **the same unchanged files** with `detail: "original"`: the complete General Engineering title, one-sentence lede and UC Davis/CC BY 2.0 credit are present and readable over the activity photograph in both desktop and phone dark views. The initial reduced-preview interpretation was wrong; no production or capture defect was established, and no runtime/capture edit was needed. This correction preserves the review history without leaving a false defect in the final judgement.

**Final rendered imagery: 8/10. Final shared format: 8/10 for the safe visual slice.** The image now actually loads, author/licence/source are inspectable, institution imagery is the correct DTU campus, the programme picture is an honestly identified engineering subject illustration, all sixteen final screenshots have been opened, and both themes/widths preserve the intended hierarchy and legibility. The generic official-image attribution improvement was separately checked through the four remaining-published-record credit views. This acceptance does not endorse the failed hotlink and does not claim full information parity.

Further improvements, not release blockers for this safe slice: obtain a reliably delivered, correctly licensed DTU-specific programme photograph; shorten the explicit subject-illustration alt to fit the existing 120-character cap; improve the very narrow mobile table-caption wrapping; complete the tracked common projections below. The source critic subsequently requested a canonical IB-source anchor order correction; the dispatcher owns that fact/evidence ordering change and the final gate, with no expected layout/text change.

### Final candidate HTML verification

For final tree `15b40a42e44d240c703284ccef43d60d233ebb7e`, directly read `universities/dk-dtu/index.html`, `programmes/dk-dtu-general-engineering-2027-autumn/index.html` and `credits/index.html` from the clean build. Institution hero, two gallery URLs/credits, programme local UC Davis hero/credit, alt and Commons licence/file row remain as reviewed. Blocked official image, Mikkel credit and rejected exam image remain absent. Both institution and programme date panels now link the “IB results released” Source control to `https://www.ibo.org/programmes/diploma-programme/assessment-and-exams/`, with the provisional note intact. No new screenshot capture is claimed: all sixteen reviewed pixels belong to the preceding visually identical candidate, and this final check covers the evidence-link-only delta.

## Information parity boundary

A shared shell is not complete information parity. The known issue #71 projection gaps for curriculum/learning pattern, support, applicant-group financial scenario, outcomes, checklists and undated actions remain relevant. Final review will distinguish safe visual publication from full ADR 0008/PAGE_TEMPLATES completion. No institution-specific layout branch is requested or permitted by this review.
