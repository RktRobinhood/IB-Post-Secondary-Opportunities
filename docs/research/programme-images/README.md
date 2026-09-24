# Programme card images: proposal

Research only. Nothing here is wired into the site. Nothing in `data/images.json` or `src/` has been touched.

Researched on 24 September 2026 by Claude (automated visual review, delegated by the site owner).

## Files

- `proposal.jsonl` has one line per scope. The fields are `scope`, `commonsFile`, `commonsPage`, `licence`, `author`, `width`, `height`, `why` and `cropNote`.
  - `field:<value>` is the fallback for a `field.primary`.
  - `programme:<id>` is a programme-specific override.
- `contact-sheet.jpg` shows each of the 49 distinct photographs three ways:
  - the 16:10 centre crop;
  - a light-mode card with the paper overlay;
  - a dark-mode card with the ink overlay.

  Where several scopes share one photograph, the caption bar lists all of them.

## Coverage

| | Count |
|---|---|
| Field fallbacks | **20 of 21** vocabulary values. Every `field.primary` used by the 73 records is covered (11 values), plus the 9 unused ones (law, languages, education, health, medicine, veterinary, agriculture-environment, sport, mathematics). |
| Programme-specific images | **35 of 73** programmes |
| Distinct photographs | 49. Six programme pairs or triples share one photograph because they are the same discipline (see below). |
| Lines in `proposal.jsonl` | 55 |

**Not covered:** `other`. Point it at the `interdisciplinary` image rather than looking for a picture of "other".

**Shared on purpose:**
- SDU Mechanical Engineering, SDU Mechanical Engineering BEng and VIA Mechanical Engineering share the milling-machine picture.
- SDU Electronics and its BEng share one picture.
- SDU Mechatronics and its BEng share one picture.
- BAAA and SEA Multimedia Design share one picture.
- VIA and Zealand Architectural Technology and Construction Management share one picture.

**No specific image (the field fallback applies), 38 programmes:**
- 15 computing programmes: CS, data science, AI, software engineering, IT product development, Interactive Technology Engineering. Code, data and AI have no subject a photo can show beyond "a person at a screen", and the field image already is that.
- 13 business programmes, including CBS, AU, SDU and AAU Economics and Business Administration, and Creative Business.
- 3 general engineering programmes: DTU General Engineering, SDU Engineering Innovation and Business, VIA Global Business Engineering.
- The three RUC international bachelors, SDU European Studies, SDU Market and Management Anthropology, Erasmus Economics, and University College Maastricht. UCM is the only interdisciplinary record, so its tutorial-group picture is the `interdisciplinary` fallback.

**Follow-up worth doing:** on `/programmes/`, 15 computing cards and 13 business cards would show the same photograph. The rules above allow that, but a list page will look repetitive. A cheap fix is a second image variant per crowded field, chosen by a stable hash of the programme id. Good candidates were seen for computing (`Hackathon participants at Wikimania 2024.jpg`, CC BY 4.0, a round table of people coding) and business. They are not in the proposal.

## How candidates were judged

The rules are the ones in `docs/research/qa/photos/round-2/iteration.md`, plus the card use.

- **Source.** Wikimedia Commons only. Every candidate came from the Commons API: full-text search with `filetype:bitmap filew:>1199`, or category members.
- **Licence.** CC0, public domain, CC BY or CC BY-SA only. Anything with NC, ND, a bare GFDL or fair use was filtered out before download. Licences in the set: CC0, PD, CC BY 2.0/2.5/4.0, CC BY-SA 2.0/3.0/4.0.
- **Width.** At least 1200 px at source. The smallest is 1200 (hospitality). Four are under 1600 and will store at their own width, per the "never enlarge" rule:
  - business: 1280;
  - character animation: 1288;
  - computing: 1404;
  - mathematics: 1536.
- **Viewing.** Every candidate was downloaded as a 960 px thumbnail and viewed three ways:
  1. as a 16:10 centre crop;
  2. as a mock 360×220 card with the paper overlay and dark serif text;
  3. as a top band about 104 px high, plus the dark-mode card.

  Roughly 1,100 candidates were looked at across about 90 searches.
- **Subject.** Each picture shows the discipline being done: hands, tools, instruments or the studio. It is never a campus building, a skyline or stock "people with laptops".
- **Rejected as a subject:** cars, signs, banners, logos, events, maps. Rejected in practice:
  - cyber-defence exercise photos (military, banners);
  - hackathon group shots with banners;
  - every hotel lobby without a person in it;
  - trading floors and stock tickers for economics;
  - museum displays of stop-motion sets;
  - diagrams, storyboard scans and screenshots.
- **Tolerated incidentals** of about 2% or less are named in each `cropNote`. Examples:
  - a small NASA logo on a T-shirt (mechanical);
  - agency marks on hi-vis vests (construction);
  - treadmill brand text (sport);
  - the scope maker's name (industrial electronics).

## Things a critic should look at first

1. **The weakest fallback is `field:economics`.** It is a lecturer in front of projected VECM equations. The subject is correct, since econometrics is what an economics degree is, but it is a lecture, and the lecturer is small at card size. Commons has nothing better for economics that is not a trading floor, a banknote or a chart.
2. **Four pictures come from events.** In each one the frame shows only the activity, with no stage, banner or signage. Judge them against the "event" rule:
   - `field:law`: a moot-court competition round;
   - `programme:dk-zealand-cybersecurity`: a lock-picking session at a conference;
   - `field:sport`: a VO2-max test at a base fitness event;
   - `field:social-sciences`: a focus group at a sanitation workshop.
3. **Six pictures come from the US military** (Army, Air Force, USACE). They were chosen for the activity, and no insignia is legible in the crop, except the small agency marks on the construction vests. Check that none reads as "military" at card size:
   - veterinary;
   - sport;
   - water/climate;
   - rebar construction;
   - ATCM site inspection;
   - hospitality, a culinary class at an Army garrison school.

   Three more are civilian US government works: NASA (aerospace, mechanical) and the Department of Energy (biotechnology).
4. **Two images are the busiest** and need the full overlay:
   - `programme:dk-sdu-electronics` (saturated green PCB);
   - `field:education` (schoolchildren in bright jackets). It was the best of a weak Commons set. Classroom files there are dominated by official visits and ceremonies.
5. **Arts and music shows only art** (ink-brush painting on a studio table). No music photograph passed: rehearsal shots were either dark stage photos or under 1200 px. If a music programme is ever added, it will need its own programme image.
6. **The animation pictures are production artwork, not photographs.** Both come from the Blender Studio short *Sprite Fright* (CC BY 4.0):
   - character animation: pencil pose sketches;
   - computer graphic arts: a rendered 3D character in a set.

   Commons has no usable photo of an animator at work: the light-table photos are military draftsmen, and pen-display photos are used for Graphic Storytelling. If the site wants photographs only, these two fall back to `field:arts-music`.

## Design recommendation

### Use the faded full-bleed background, not a top band

The image sits behind the whole card with a paper-coloured gradient over it. The text sits in the lower half, where the gradient is strongest.

Why not the band:
- A roughly 104 px band on a 360×220 card crops most of these pictures to a strip of shoulders or ceiling. Hospitality, sport, humanities and the VO2-max runner all lose their subject.
- The faded treatment worked for all 49 photographs in the mock-ups. In each one the subject sits in the upper half, where the overlay is lightest.
- It keeps card height unchanged. Programme cards are text-first (title, institution, city, duration, language), and a band would add about 100 px to every card in a long list.

```css
.card--programme { position: relative; isolation: isolate; }
.card--programme .card__bg {
  position: absolute; inset: 0; z-index: -2;
  width: 100%; height: 100%; object-fit: cover; object-position: center;
  filter: saturate(.8) sepia(.06);          /* pulls saturated greens/blues toward the paper palette */
}
.card--programme::before {                   /* the overlay */
  content: ""; position: absolute; inset: 0; z-index: -1;
  background: linear-gradient(to bottom,
    rgb(251 247 240 / .55) 0%,               /* --paper */
    rgb(251 247 240 / .82) 45%,
    rgb(251 247 240 / .94) 100%);
}
@media (prefers-color-scheme: dark) {
  .card--programme .card__bg { filter: saturate(.7) brightness(.85); }
  .card--programme::before {
    background: linear-gradient(to bottom,
      rgb(20 17 14 / .60) 0%,                /* dark --paper #14110E */
      rgb(20 17 14 / .85) 45%,
      rgb(20 17 14 / .93) 100%);
  }
}
```

(Mirror the dark block under the site's explicit `[data-theme="dark"]` selector if it has one.)

**Contrast.** Worst case is a pure black or pure white pixel under the text zone.
- Light mode, at 0.94 over black: `--ink` stays at about 15:1 and `--ink-soft` at about 8:1.
- `--ink-mute` falls to about 4:1, so **do not put `--ink-mute` text over an image**. Use `--ink-soft` for meta lines on image cards.
- Dark mode, at 0.93 over white: `--ink` (#F3ECE0) is about 12:1.

**Hover.** Keep the existing `scale(1.03)` on the image. Do not reduce the overlay on hover, because the text must stay readable.

**Selection order:**
1. `programme:<id>`;
2. `field:<primary>`;
3. `field:interdisciplinary` for `other` or an unknown value.

`field.secondary` is not used for images. Programmes whose secondary matters already have a specific image.

**Accessibility.** The image is decorative (`alt=""`), because the card's text already says what the programme is. Its credit belongs on `/credits/` like every other Commons picture.

### Plugging into the existing pipeline

- These should become ordinary records in `data/images.json` with a new `kind`:
  - key `field-<value>`, `kind: "field"`;
  - key `programme-<id>`, `kind: "programme"`.
- Each record should carry `"pin": true` and the `file` from `proposal.jsonl`. `scripts/fetch-images.mjs` then fetches the named file exactly and normalises it to the 16:10 WebP standard.
- Approval then goes through `npm run images:review` like any other picture. Nothing in this proposal is an approval.
- The `cropNote` fields are written to be pasted into the review note.
