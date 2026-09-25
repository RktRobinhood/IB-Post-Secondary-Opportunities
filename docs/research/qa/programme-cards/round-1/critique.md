# Programme card images: round 1 critique

Critic: art director, a fresh agent that did not build this. Judged on the **live site** on
2026-09-25. Owner's ask: "The cards for each programme are great but plain. If there's an image
specific to that discipline or bachelor's, put that as the background."

**SCORE: 6 / 10.** Not accepted.

## Verdict

The engineering is careful and the picture research is mostly good. But on the surface the owner
was talking about, the "What you could study here" grid, the photograph mostly **does not
read**. At card size it looks like a beige or brown wash with ghost shapes. The grids that need
variety most (SDU, CBS, the A to Z finder) repeat the same picture side by side. The finder and
planner rows work; the institution cards and the phone view do not yet. One text colour on every
card fails AA in OS dark mode.

What is right, and should be kept:

- **The pictures chosen for specific programmes are strong.** The oscilloscope, wind tunnel,
  soldering tweezers, EEG cap, glass furnace, mocap suit, pen display, rebar ties, cleanroom and
  microscope screen are all specific, and none is a campus, a skyline or stock "laptops".
- **Wide rows work.** On the finder and planner rows the picture has a 16:10-ish box, so the
  subject survives. The oscilloscope on *Applied Industrial Electronics* and the wind-tunnel model
  on *Aerospace Engineering* read immediately (`finder-list-desktop-*.jpg`, `planner-*.jpg`). Dark
  mode there looks moody and intentional.
- **The plumbing is right.** Every backdrop is `loading="lazy"`, `decoding="async"` and
  `alt=""`, with `width`/`height` set. CLS on institution pages is at most 0.024 (DTU desktop) and
  is 0 on phones. There is a 480/960 `srcset`. All 51 photographs are credited on /credits/
  (checked by URL: 51 of 51, 0 missing). Body text contrast holds everywhere I measured (below).

## Findings

### 1. On institution cards, the photograph is cropped to its top strip and the subject disappears

`.card__backdrop` fills the whole card (`inset:0; height:100%; object-fit:cover`). A programme card
is taller than 16:10: about 375×445 on desktop and 360×450+ on a phone. So `cover` scales the
photograph to the card's **height** and crops it **left and right**, and `object-position`'s 35%
vertical value has no effect. The only unveiled area is the 4.5rem headroom band (72 px). That band
shows the top 16% of the photograph, and in most of these photographs that is the ceiling, a
wall, a whiteboard edge or the top of a monitor. The subject sits in the middle of the frame,
under an 84–94% veil.

What a student actually sees in the band (`aarhus-au-desktop-light.jpg`, `sdu-desktop-light.jpg`,
`via-desktop-light.jpg`):

- *Economics and Business Administration*: the Finnish word "HEIKKOUDET" (weaknesses),
  handwritten on a whiteboard;
- *Computer Science*, *AI*, *IT Product Development*, *Interactive Technology Engineering*: the
  top of a wall and a monitor;
- *European Studies* and *Market and Management Anthropology*: a window grille;
- *Climate and Supply Engineering*: a bald head against the sky;
- *Global Business Engineering*: a green T-shirt;
- *Electronics*: a pale green tint that makes the card look mint-coloured rather than showing a
  circuit board.

The phone view is worse, because the card is narrower and taller (`aarhus-au-phone-*.jpg`,
`via-phone-*.jpg`). TU Delft's short cards are the exception: they are close to 16:10, so the
wind tunnel, the quarry and the microscope all read (`tudelft-desktop-light.jpg`). That is the
proof that the pictures are fine and the crop is the problem.

**Evidence that a fix exists: `mock-toptrip-*.jpg`.** I injected CSS into the live pages, and
nothing in the repository changed. The photograph is anchored to the card top at its own 16:10
ratio, the band is 9rem, the veil is 8–18% across the band and reaches `--veil-text` (0.84)
exactly where the title starts, and the rest of the card is plain paper.

- **Result:** every VIA and SDU card names its discipline at a glance, in both themes and on a
  phone.
- **Cost:** cards are about 72 px taller than now.
- **Contrast:** unchanged, because text starts at the same veil value.

### 2. Repetition: the alternation only works on paper

| Page | Cards | Distinct photos | Identical neighbours |
|---|---|---|---|
| SDU (`sdu-desktop-*.jpg`) | 15 | 7 | The iMac photo on AI, Interactive Technology Engineering and Software Engineering (Sønderborg), where the last two sit side by side. Electronics next to Electronics, Mechanical next to Mechanical, Mechatronics next to Mechatronics, and European Studies next to Market and Management Anthropology. |
| CBS (`cbs-desktop-*.jpg`) | 6 | 3 | Business alternates SWOT, workshop, SWOT, workshop, SWOT. |
| AU | 6 | 4 | The iMac photo on both Computer Science and IT Product Development. |
| /programmes/ (A to Z) | 73 | 51 | **11 runs** of the same photo in adjacent rows, including the hackathon three rows in a row (rows 19–21) and the NASA milling photo three in a row (rows 59–61). Within any 3 rows, 21 repeats. |

The id-order rotation in `src/lib/programme-imagery.mjs` alternates within one institution only
when programme ids happen to interleave. The finder sorts by name, not id, so the rotation does
nothing there. With the photo made visible (fix 1), this repetition becomes the most obvious
thing on the page; see `mock-toptrip-dk-sdu-desktop-dark.jpg`.

### 3. The cut-off / "Restricted admission" chip fails contrast

I measured this on the live page. Text was hidden, the card was screenshotted, and every text box
was compared against the real pixels under it (`contrast.json`, `tools/contrast.mjs`; AU, VIA,
DTU, TU Delft and SDU, both themes, 1,096 text runs).

- **Everything else passes, worst 5th percentile:** titles 11.6:1 in light and 11.7:1 in dark;
  requirement lines 12:1; `--ink-soft` lines 6.5:1 in light and 7.8:1 in dark; "What this means"
  links 5.4:1 in light and 7.0:1 in dark.
- **`.tag--sand`** (cut-off and "Restricted admission", 12 px/600) is **3.05:1 in OS dark mode**
  and 4.34:1 on a veiled light card. The cause is `site.css:954`,
  `.tag--sand { color: #8A6A20 }`. The only dark override is `:root[data-theme="dark"] .tag--sand`
  (line 957), and there is no `prefers-color-scheme` twin, so a student whose phone is in dark
  mode gets the light-mode brown on a dark chip. This is a site-wide bug, but it sits on every
  programme card. `scripts/test-programme-images.mjs` says "every text colour reaches 4.5:1" and
  does not check tags.

### 4. Individual pictures (full contact sheet: `contact-sheet-images.jpg`, 51 photos)

None of them reads as military, an event banner or a logo at card size. The Army and Air Force
sources (veterinary, hospitality, rebar, sport, wastewater) look civilian. The weak ones:

| Record | Problem | Severity |
|---|---|---|
| `field-business-2` (SWOT) | The Finnish headings "HEIKKOUDET" and "UHAT" are legible in the top band on 6 cards | Medium: it puzzles a student |
| `programme-dk-via-climate-and-supply-engineering-beng` | A man hosing sludge at a wastewater plant. It reads as "cleaning", not the building services, heating and energy the programme teaches | Medium |
| `programme-dk-sdu-mechanical-engineering`, `-beng`, `programme-dk-via-mechanical-engineering-beng` | The NASA logo on the T-shirt is prominent, not "small", and the face masks date the photo. Used 3 times | Low–medium |
| `field-computing-2` (hackathon) | People chatting at a round table with a blank whiteboard. At card size it reads as "a meeting", not computing. It is the Data Science, CS and Software Engineering image | Low–medium |
| `field-economics` | A lecturer who is small in front of equations. Used on 1 card (`nl-erasmus-economics-and-business-economics`) | Low; the README already flags it |
| `field-law`, `field-sport` | Event frames (a "086" placard, a booth with signage). Currently used by no programme | Note only |

### 5. Weight

| Page | Backdrop bytes (after full scroll) |
|---|---|
| Institution pages, desktop | 20–229 kB (VIA: 11 cards, 229 kB) |
| Institution pages, phone at 2× | 70–825 kB (VIA: 825 kB) |
| /planner/ (72 results) | 1.34 MB, 19 files |
| /programmes/ | 1.9 MB, 27 files, on a page already carrying about 10–15 MB of hot-linked institution images |

The phone figure is higher because `sizes="…, 100vw"` at 2× always picks the 960 file. That is
defensible once the photo is actually visible (fix 1). A 720w variant would cut phone weight by
about a third. Loading is lazy and nothing loads before scroll on /programmes/ (0 backdrop
requests at first paint).

### 6. Credits

- All 51 photographs are present on /credits/ under "Behind the programme cards".
- Two small gaps:
  - "Used for" repeats bare names, for example "Electronics, Electronics" and "Mechanical
    Engineering, Mechanical Engineering, Mechanical Engineering". Add the institution.
  - There is no statement that the photographs are cropped and tinted. CC BY and CC BY-SA ask
    that changes be indicated. One sentence under the heading covers it.

## Top fixes, ranked

1. **Anchor the photo to the top of institution cards, at its own ratio.** This is the fix that
   delivers what the owner asked for. Mock: `mock-toptrip-*.jpg`, CSS in `tools/mock.mjs`.
   - `.card--backdrop .card__backdrop { inset: 0 0 auto 0; height: auto; aspect-ratio: 16/10; }`
   - `--card-headroom: 9rem`.
   - Veil: about 0.08 at the top, about 0.18 at 55% of the band, `--veil-text` at the headroom,
     and solid `--paper` by headroom + 6rem.
   - Add an optional per-record `focus` (object-position Y). For it to have an effect, the image
     box must be shorter than 16:10, for example `aspect-ratio: 16/9`. Use it to push
     `field-business-2` down past its Finnish headings (for example `focus: "70%"`).
   - Move `VEIL.light.top` and `VEIL.dark.top` and the guard together.
   - Leave `.prog--backdrop` rows as they are; they already work.
2. **No identical neighbours in any rendered list.** Choose the variant at render time, per list:
   when a field has several pictures, pick the one that differs from the previous card's. Apply
   this to institution grids, the finder in A to Z order, and planner results. Then add pictures
   where the pool is too small. I looked at each of these on Commons (sheets in `candidates/`):
   - **computing, adding 2 to the pool:** `Wocintech (microsoft) - 61 (25926639341).jpg` (CC BY
     2.0, WOCinTech Chat, 6016×4016; over-the-shoulder shot of code on a laptop) and
     `Pair Programming 3.jpg` (CC BY-SA 3.0, Vajrapani666, 3264×2448; two students at terminals
     full of code). Demote `field-computing-2` (hackathon) to last.
   - **`programme:dk-sdu-electronics-beng`:** `Multimeter probes on breadboard.jpg` (CC BY 4.0,
     Zeroping, 4032×3024).
   - **`programme:dk-sdu-mechanical-engineering-beng`:** `Mechanical engineering workshop at
     Arusha Technical College, Tanzania.jpg` (CC0, Hilda Raphael, 4032×3024; students at a row
     of lathes). This also removes one of the three NASA T-shirts.
   - **`programme:dk-sdu-mechatronics-beng`:** `MIREA Laboratory Industry 4.0. Digital robotic
     manufacturing 8.jpg` (CC BY-SA 4.0, 4468×2978; a robot arm cell). Pick 8 over 6, because 6
     shows a large ABB logo.
   - **`programme:dk-sdu-market-and-management-anthropology`:** `PNG Investigation Mission-
     Meeting with Locals in Village and Market (8605590).jpg` (public domain, US Army; a hand
     writing field notes in a notebook). Check the full frame for insignia before pinning.
3. **Fix `.tag--sand`.** Add the missing
   `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .tag--sand { color: var(--sand); } }`.
   Inside `.card--backdrop` and `.prog--backdrop`, set `.tag--sand { color: var(--veil-warn); }`.
   Extend `scripts/test-programme-images.mjs` to compute every `.tag--*` text and background pair
   in both themes, so this cannot pass silently again.
4. **Swap the weak picture:** `programme:dk-via-climate-and-supply-engineering-beng` →
   `Heat Pump Installation (51323299230).jpg` (CC BY 2.0, Vernon Air Conditioning, 4032×3024; a
   technician with refrigerant gauges at an outdoor unit). The maker's badge on the unit is small;
   name it in the cropNote.
5. **Housekeeping:**
   - add a 720w variant, for phones;
   - on /credits/, add the institution to "Used for" and a line saying the photographs are cropped
     and tinted;
   - consider a third business picture so CBS stops alternating two pictures across 5 cards.

Fixes 1 to 3 would take this to an 8. Fix 1 on its own, without fix 2, makes the page worse,
because it makes the repetition visible.

## Files in this round

- **Screenshots** (JPEG): `{aarhus-au,via,dtu,tudelft,utwente}-{desktop,phone}-{light,dark}.jpg`,
  `sdu-desktop-*.jpg`, `cbs-desktop-*.jpg`, `finder-top-*.jpg`, `finder-list-*.jpg` and
  `planner-*.jpg`.
  - Desktop is 1280 px wide at 1×; phone is 390 px wide at 2×.
  - The planner was filled with 6 subjects at grade 6 and 38 points.
- **Mocks** of fix 1: `mock-toptrip-*.jpg`.
- **Contact sheet** of all 51 stored photographs: `contact-sheet-images.jpg`.
- **Metrics:** `report.json` and `report-sdu.json` (bytes, lazy loading, width/height, CLS,
  chosen file per card).
- **Measured contrast:** `contrast.json`.
- **Commons candidates reviewed:** `candidates/cand-*.jpg` and `.json`.
- **Scripts** (headless Chrome over CDP, no dependencies beyond sharp): `tools/shoot.mjs`,
  `tools/contrast.mjs`, `tools/mock.mjs` and `tools/commons.mjs`.
  - They point at the live site.
  - `shoot.mjs` writes PNGs; this round converted them to JPEG to keep the repository small.
