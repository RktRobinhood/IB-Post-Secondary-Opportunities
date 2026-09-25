# Programme cards round 2 (#46) and home round 1 (#44): fixes

Built into `D:/ibp-tmp/dist-cards` (gate) and `D:/ibp-tmp/dist-cards-local` (served on :4370 for shots). The gate result: **all 35 checks pass**.

The shots are in `fixes/`. `before-*` is the build before this pass and `after-*` is this build. The measurements are in `before-measure.json` and `after-measure.json`. The harness is `fixes/tools/shoot.mjs` with `tools/cdp.mjs`, run as `ORIGIN=http://localhost:4370 BASEPATH= TAG=after node shoot.mjs`.

## What each critic item became

### Cards: one line per block (both critics' top ask)
- **The Needs line** (`requirementSummary`, components.mjs) is now one line on every card at every width. The units are taken in reading order: each requirement, each "one of" option (or its union), then each quota floor. Units are added while they fit about two lines (72 characters), and the rest is counted as **"+n more"**. The whole card links to the programme page.
- **Removed from cards:** the Danish-requirement line (`.req__local`), the "What this means in IB terms" orphan (bug 8), the "As published:" quote, the "(and 1 Danish-only option)" notes and the separate quota paragraph. The programme page keeps all of them (`requirementDetail` is unchanged).
- **One tag per card** (`cardTag`, paths.mjs). The priority is a numeric cut-off, then open admission, then the IB award, then "Restricted admission". A family card shows a tag only when every path shares it. The tag sits on the photograph's top-left corner as an opaque pill, so it no longer takes a line of text.
- **Cut-off tags are in IB terms only.** "Last cut-off 32 IB points" replaces "… (Danish 7.6)". The programme page keeps the Danish figure.
- **The veil starts lower.** `--card-headroom` is now 8.5rem, which is about 60% of the 16:10 photograph at card width. The veil stays at `--veil-top` until 72% of the headroom and reaches `--veil-text` where the text starts.
- **The phone seam (bug 3) is gone.** The photograph masks itself to transparent over its lower third, so it ends in paper at any width.
- **Card heights at 1280 px:** 292 px with a one-line title, 315 px with a two-line title. Before: 420–611 px at 1280 px and 367–520 px at 390 px (`before-measure.json`).
- **Card heights at 390 px:** 271–315 px.

### Never drop the degree from a family card
- `familyCard()` builds the line from every path. Distinct degrees are joined with "or", the years become a range (`yearsRange`), and distinct campuses are joined with "or". Results:
  - "BSc or BEng · 3–3½ yrs · Sønderborg"
  - "BSc · 3 yrs · Aarhus or Herning"
  - "BEng · 3½ yrs · Horsens or Viborg"
- Each path row is one line: the path link, then what differs about it in short form ("full Diploma · at least 31 IB points"). The full wording is in the row's `title`.
- **Degree wording (bug 6), in `degreeShort()`:**
  - A title made only of English degree names takes the standard abbreviations. "Bachelor of Arts or Bachelor of Science" becomes "BA or BSc". This is a convention of English, not a rule for any one country.
  - Any other title is set in sentence case, so "Professional bachelor" and "Academy profession degree" now match.
- **No broken credential lines.** Each fact is a `nowrap` span. The separator belongs to the fact after it and sits in a clipped margin, so no line breaks inside "3 yrs" and no "·" is left hanging at a line end.
- **New guard** (`scripts/test-programme-images.mjs`, section 5). Every programme card on the home page and on every institution page must meet these rules:
  - its `.card__cred` names a degree;
  - its credential line is not broken;
  - it has at most one Needs line and at most one tag;
  - it shows no published or local form and no "As published".

  The guard also checks that the home page's first 12 titles are distinct and that "Show all" counts cards. It self-tests on the old Electronics card.
- **Updated guard** (`test-requirement-translation.mjs`). A card must no longer show the published form. Every IB phrase it shows must come from the model, and any phrase it leaves out must be counted in "+n more". The self-tests cover both cases.

### Merge the near-duplicates
- **CBS "Business Administration and …" ×3 stay apart.** They are three distinct degrees: Digital Management, Service Management and Sociology. `docs/research/variants/design.md` records that decision. They have different Needs lines, different cut-offs (38, 37 and 38 IB points) and different photos. The home order no longer puts them side by side: they now sit at positions 12, 20 and 28.
- **Architectural Technology in Horsens and Næstved stay apart.** They are offered by two different institutions (VIA and Zealand). The owner's rule is "if a *university* offers one course with some distinction, it gets one card", and `families.mjs` requires one institution per family. The two cards now differ at a glance:
  - campus and institution;
  - "at least a 3" appears only on the VIA card;
  - their tags differ;
  - they sit at positions 2 and 59 on the home page.
- **No other near-duplicate exists within one institution.** Every same-title pair inside one institution is already a family, and `suspectedVariants()` in `validate` keeps it that way.

### Paths table on phones
- Every cell carries `data-label`. At 52rem and below, each path is a bordered block in this order:
  - the path's name, with "You are here" on the current path;
  - "What is different", as one line;
  - "Length: 3 yrs · 180 ECTS";
  - "Quota 1 needs: at least 31 IB points an average of 7.0";
  - "DP Course Results: Full Diploma needed".
- Measured at 390 px: page scroll-x 0 and table overflow 0 (`after-paths-phone-*.png`).
- Also fixed: the cut-off column's regex (`/^Last cut-off:?s*/` became `\s*`) and a stray border under the last row header on desktop.

### Home first screen
- **`variedOrder()`** (discover.mjs) picks each next card as the one least like the cards just placed. It penalises:
  - a title already shown;
  - the same institution in the last four cards;
  - the same field in the last two;
  - the same country as the previous card.

  Ties break alphabetically, and no card is picked by name. The first 12 cards cover 6 fields, 9 institutions, both countries and 12 distinct titles.
- **The fold now reads "Show all 67 cards (73 degrees)"** and hides once it is open.

### Home: the coordinator's unbuilt changes, verified
- **Worldwide:** `frame()` in discover.js had no `camera` branch, so the door did nothing to the globe. It now calls `g.show({ camera })`. The globe turns to the Americas, the count reads "10 countries researched" and the 10 tiles show (`after-desktop-door-far*.png`).
- **Pill (390×844):** after "Right here", the pill "57 of 73 degrees ↓" shows. Tapping it puts the count at y=88 and the first card at y=156, both on screen.
  - The pill moved to the top, under the masthead. At the bottom it covered the globe's place card.
  - It is now eyebrow gold, because a dark pill vanished on the night hero.
- **"medicine" with no match:** the no-match state offers the medicine guide as an arrow link on its own line, not a wrapped chip, plus "Without “medicine”".
- Disabled zero chips, the phone Filters button and the eyebrow rule all render as intended.

## Record gaps (for the data owner; nothing was invented)
1. `data/programmes/dk-absalon-biotechnology-beng.json` has no `credential.years` and no `ects`. It renders "BEng · Kalundborg". Its sibling, Robot Systems, records 3.5 years.
2. `data/programmes/nl-maastricht-university-college-maastricht.json` has no `credential.abbreviation`. It now renders "BA or BSc" from its English title. An explicit abbreviation would still be cleaner.
3. **Photos that look alike at card size** (round 2, bug 7; home, bug 10). These are in `data/programme-images.json`:
   - the `field-business-*` pool;
   - Creative Business;
   - Global Business Informatics;
   - CBS Digital Management's Kanban sticky-note photo.

   They are all sticky-note or whiteboard workshops. They need different photographs; code cannot fix this.
4. The families need no data change. If the owner wants the two Architectural Technology programmes as one card, that is a new cross-institution concept. `families.mjs` refuses it by design, so it needs an owner decision first.

## Files changed
- `src/lib/components.mjs`: `requirementSummary` (one line, "+n more"), `card()` (tag on the photo, `credLine`).
- `src/lib/paths.mjs`: `degreeShort`, `yearsRange`, `familyCard`, `cardTag`, `pathsBlock`, `pathsTable` (data-label), `cutoffLabel`, `admissionOf`.
- `src/pages/discover.mjs`: `variedOrder`, one tag, `awardOnlyReq` without the quote, the "Show all" label.
- `src/assets/js/discover.js`: the `camera` branch in `frame()`, and the guide link in the no-match state.
- `src/assets/css/site.css`: the veil and mask, the card spacing, the credential facts, the photo tag, the path rows, the phone Paths blocks, the pill, and the no-match guide.
- `scripts/test-programme-images.mjs` and `scripts/test-requirement-translation.mjs`: the guards above.
- `scripts/check.mjs`, `release-check.mjs`, `serve.mjs`, `test-page-budget.mjs`, `test-programme-images.mjs`, `test-requirement-translation.mjs` and `test-unique-images.mjs` now honour `DIST_DIR`. Before this, they read `dist/` whatever `DIST_DIR` said, so a gate run into another folder silently checked a different build.
