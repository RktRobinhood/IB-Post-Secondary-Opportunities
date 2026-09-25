# Issue #47 deadlines per school: round-2 fixes

Written 26 Sep 2026, in reply to `critique.md` (6/10). Each source below was fetched on 26 Sep 2026. No date was moved. What changed is which page a date reaches, one consequence type, three "replaces" links and one label.

## 1. Wrong-school dates

**The rule now.** A date that belongs to one school, or a few, says so in its record: `institutions: [ids]`. The id is the one the school's page uses, either a canonical id (`dk-sdu`) or a profile key (`ca-ubc`). A school page shows a tied date only if the page's id is on the list. `institutions` is defined in `schemas/common.schema.json` (`institutionRefs`) and allowed on route rounds and milestones (`schemas/application-route.schema.json`) and on profile deadlines (the `test-calendar.mjs` field list). `calendar.mjs` passes it through, and `mergeTwins` joins the lists of two merged records.

**Ties added:** 367, across 57 files (31 route files and 26 country profiles). They were proposed by reading every label for a school's full or short name as whole words, and then checked by hand. Every label that names a single school got a tie. Labels that name several schools were tied only where the date is theirs alone: EPFL + UZH, Alberta + Calgary, Peking + Fudan + SJTU, the LNAT groups, and the "Other Swiss universities" list, which is tied to the eight it names that have pages. Four shared rules were left without a tie on purpose: UCAS "Oxford, Cambridge, medicine…", its profile twin, Malta's "MCAST, ITS and the private institutions", and "UNNC, CUHK-Shenzhen and Wenzhou-Kean" (Wenzhou-Kean has no page). Hand-added ties: MIT's two rounds (their labels do not name MIT), and Studyinfo's three "(Jyväskylä's date)" milestones → `fi-jyu`.

**The name fallback, for dates with no tie** (`src/lib/school-dates.mjs`, generic, no country in code):
- A heading that names a place is removed before matching. The places are the Destination's own names and its jurisdictions' names, read from `data/destinations/*.json`. "British Columbia — Simon Fraser…" is read as "Simon Fraser…", so it no longer completes "University of *British Columbia*". A heading that is not a place ("UBC - accept…") stays.
- A word that appears in three or more of a country's school names ("Hong", "Kong", "Dubai", "Applied", "Sciences") never names a school by itself.
- An initialism is claimed first by a school that has those letters as a word of its own name. "LUT" is LUT University, not Laurea (L-U-T was read off "Laurea University of Technology…"), and "CUHK" is not City University of Hong Kong. When no school has the letters as a word, "UAS" still names every university of applied sciences.
- Whether a label names this school is decided among all the country's schools at once, never for this school alone.
- `nameMatch` treats "one label starts with the other" as a whole-word test (`calendar.mjs`). "HKUST applications close" had matched "HKU", so HKUST's dates reached every Hong Kong page.

**The scan.** For each of the 470 school pages, it looks at every date shown and flags any date whose label names one *other* school of the same country (full or short name, whole words) but not this one. It is now a guard in `scripts/test-calendar.mjs`: "no school page shows another school's date (470 pages)". Two more guards sit beside it: every `institutions` id must resolve to a page in that country, and every `supersedes` must point to a real route date.

| | Before | After |
|---|---|---|
| Pages checked | 470 | 470 |
| Dates naming one other school (offenders) | **99** on 19 pages | **0** |
| Dates naming several other schools | 33 | 20. All 20 are UCAS "Oxford, Cambridge, medicine…" on other UK pages, a shared rule that stays |

The 99 were UBC (5 SFU dates), UZH (4 ETH), Laurea (LUT's rolling window), all 13 Hong Kong pages (HKU, CUHK and HKUST dates on each other's and every other school's page), TU/e (a TU Delft date), NTNU (a University of Oslo date) and NUS (3 NTU dates). The 13 EPFL + UZH dates shown on every other Swiss school were in the "several" group and are gone. UBC now shows 7 dates, all UBC's, and SFU shows its own 5. The only pages whose date count changed are those listed here (CA, CH, FI, HK, NO, SG).

## 2. Finland: which schools are in the January joint application

The Studyinfo record the page is built from (`konfo-backend/haku/1.2.246.562.29.00000000000000092075`, "Joint Application to Higher Education, Spring 2027", 7 Jan 08:00 – 21 Jan 2027 15:00) was read again. It lists 440 programmes, grouped here by institution:

| School | In the January joint application? | Own application (source) | Change |
|---|---|---|---|
| Helsinki | **No** | "Both application processes (admission group 1 and admission group 2) are separate from the Finnish national joint application". Group 2 (IB): 9–23 March 2027, 15.00 UTC+2 (helsinki.fi/en/admissions-and-education/apply-bachelors-and-masters-programmes/apply-bachelors-programmes) | Its closing date now `supersedes: fi-studyinfo-2027/ms-joint-application`, and its tied route date `ms-helsinki-group-2` → `fi-uh`. **The page now leads with "23 March 2027, Admission group 2 (IB Diploma holders) closes, 15:00", a hard deadline.** |
| LUT | **No** (0 programmes) | International rolling admission, 1 Sep 2026 – 30 Apr 2027 23:59 UTC+3 (lut.fi/en/studies/apply-lut/applying-bachelors-programmes) | Its rolling close supersedes the joint window. The profile's "LUT rolling admission window" folds into LUT's own two dates. |
| Åbo Akademi | Master's only (12, all master's) | All bachelor's taught in Swedish, in the *second* joint application, 9–23.3.2027, 15.00 Helsinki time (abo.fi/en/study/apply/application-guide-bachelors-level/) | Its closing date supersedes the January window. |
| Aalto | No | Already handled in round 1 | none |
| Tampere University 11, TAMK 9, Oulu 28, Turku 21, Jyväskylä 24, UEF 34, Metropolia 40, Arcada 8, Haaga-Helia 8, Laurea 9 | Yes | none | none: the January window is theirs |

The evidence record `ev-fi-studyinfo-joint-application-2027` (`data/evidence/fi.json`) now carries the 26 Sep reading: which schools are absent, and why. The route note for `ms-joint-application` names Aalto, Helsinki and LUT, and says Åbo Akademi is in March.

## 3. MIT

`us-direct-2027`: `ms-mit-ea` and `round-mit-ea` changed from `priority` to **`hard`**. MIT's table lists "Early Action … November 1" and "Early Action (EA) applications are due November 1". Only recommenders' letters "that arrive later are still accepted" (mitadmissions.org/apply/firstyear/deadlines-requirements/). The other MIT milestones were checked on the same page and kept as `hard`: tests "before November 30 for EA, and before December 31 for RA", aid 30 Nov and 15 Feb, reply 1 May. The EA note now says the deadline is firm and that Early Action is not binding. All MIT dates stay provisional, because MIT gives no year. MIT's page now opens 1 Nov, 30 Nov, 30 Nov, in date order.

## 4. Binding before soft

`leadOrder()` puts **every** binding date (hard or equal-consideration) first, in date order, then the soft ones. The visible slots are the first N in that order, and "All dates" holds the rest in date order (`splitPanel()`). `dates-panel.js` applies the same rule after it removes past dates. With each date now about 90 px, a phone shows **3** dates, not 2. SDU shows 15 Mar close, 15 Mar signature and **20 Mar uniTEST** on both phone and desktop, and "Optagelse.dk opens" moves into "6 more". A guard checks that no soft date comes before a binding one on any school page.

## 5. The panel's name

The panel is called **"Deadlines"** unless the school has sessions. "Deadlines & sessions" appears only where sessions are listed, and `dates-panel.js` renames it if they have all passed. Sessions were not imported. The built site now has 0 pages that say "Deadlines & sessions".

## 6. Phone, /timeline/, wording

- **One compact row per date:** date, label, then a row with the badge, "Note ▸" and "Source". An open note takes its own line under the row. On SDU at 375 px the three items are 96, 115 and 87 px tall; the critique measured about 160 before.
- **/timeline/ chips:** the rule is the same for every country. With no country chosen, the chips are the only thing on the page, so all of them show, wrapped, and Denmark and the Netherlands are on the first screen. Once a country is chosen, the strip is one scrolling row that starts at the chosen chip.
- **Copy:** the status line now reads "Dates for Denmark, from the link you followed." (also "from the countries you are exploring / comparing", "from your profile"). The old "Denmark — the destinations in this link." is gone.
- **One wording for the country link:** "Every date in <country>" on every panel, with the article where the country takes one ("the Netherlands"). Pages that call the panel without a country name (institution and programme pages) now get it from the record. The built site has 0 "Dates in …" and 0 "Every date in this country".
- **UCL fact tile** (`schools.mjs`): the tile shows the first clause of the profile's answer when it is 6 words or fewer ("All courses in English"). It no longer shows a clause cut to 3 words ("All courses in").
- **German label** (`de.json`, 15 July Neuabiturient date, unchanged): "Medicine group closes for this year's school leavers (you)". Binding-first ordering moved this date into the visible slots on 14 pages, and the old 22-word label broke the text-walls budget there.

## Files changed

`src/lib/school-dates.mjs`, `src/lib/calendar.mjs`, `src/pages/schools.mjs`, `src/assets/js/dates-panel.js`, `src/assets/js/calendar.js`, `src/assets/css/primitives.css` (dates panel, chip strip), `schemas/common.schema.json`, `schemas/application-route.schema.json`, `scripts/test-calendar.mjs`, `data/application-routes/*` (31 files: ties; `us-direct-2027` consequence and note; `fi-studyinfo-2027` note), `data/countries/*` (26 files: ties; `de.json` label), `data/schools/fi-uh.json`, `fi-lut.json`, `fi-aa.json` (`supersedes`), `data/evidence/fi.json`.

## Could not verify, or left open

- **166 pages in countries with several routes** (US, CA, AU, BE, KR, PT, GR, ES, CN, AE, SG, JP, LT, FR) still show only "Every date in <country>" when nothing ties a date to them. Their tied dates now show (for example MIT, UBC, SFU, McGill). Harvard still has no date. The records already hold what a generic fix needs: each profile school has a `jurisdiction` (for example `ca-bc`), and each jurisdiction names its `applicationRoute` (`data/destinations/ca.json`). A rule that says "a school takes the route of its jurisdiction" would give BC, Ontario and similar schools their route's general dates. It was not done in this round.
- **Sessions** are still not imported (`docs/research/sessions/shards`). The panel title now tells the truth about that.
- **Years not published:** MIT's days (no year) and SDU's 20 March and 3 August are still marked provisional. Helsinki says its instructions "will be updated by the end of October 2026". Its 9–23 March 2027 dates are published, so they are not provisional.
- **UCAS "Oxford, Cambridge, medicine…"** appears on 20 other UK pages as a shared rule. That is correct for any school with medicine, dentistry or veterinary courses, but loose for a school like UAL. Tying it to schools by subject would need programme data, and that was not done.
- **Åbo Akademi** keeps its Swedish-taught March date, because the page is about that school. It still has no English-taught bachelor's (record `scope: none`).

## Gate

`DIST_DIR=D:/ibp-tmp/dist-dates node src/build.mjs`, then `scripts/qa.mjs` with `SITE_BASE=/IB-Post-Secondary-Opportunities`: **all 35 checks pass**. Freshness is advisory. `node scripts/test-calendar.mjs` passes, including the three new guards. One earlier run failed `chars`, `build` and `ib-terms` while another session was editing `src/lib/components.mjs` and `src/pages/discover.mjs`. Those files are not part of this work, and the final run passed once those edits had settled.
