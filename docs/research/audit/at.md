# Austria audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/at.json`, `data/destinations/at.json`, `data/evidence/at.json`,
`data/application-routes/at-direct-2027.json` (checked, unchanged). `npm run validate`: all records valid.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| A properly acquired IB Diploma gives general university entrance; three routes for foreign certificates | CONFIRMED | BMFWF Universitätsreife page |
| No national points threshold or subject rule; degree-level supplementary exams set by universities | CONFIRMED (ministry page silent on Ergänzungsprüfung, as the record already says) | BMFWF |
| University of Vienna WS 2026/27: 22 June–5 Sept (EU), 22 June–3 Aug (third-country), admission 13 July–31 Oct; entrance-exam bachelor's 2 March–4 May 2026; SS 2027 16 Nov 2026–5 Feb 2027 (7 Jan third-country) | CONFIRMED; 2027/28 still unpublished, route dates stay provisional | univie application periods |
| Study in Austria: 5 September general close; entrance-exam deadlines up to 6 months before semester | CONFIRMED (not re-read word for word; unchanged record) | studyinaustria.at |
| MedAT 2026: registration and fee 2–31 March 2026, test 3 July 2026; 2027 unpublished | CONFIRMED | medizinstudieren.at Basic-Infos |
| EU tuition 0 within standard duration + 2 semesters, then 363.36 EUR; ÖH 26.20 EUR | CONFIRMED | univie Studienbeitrag |
| Non-EU 726.72 EUR + ÖH = 752.92 EUR per semester | CONFIRMED | univie Studienbeitrag |
| Living cost about 1,300 EUR/month (Sozialerhebung 2025) | CONFIRMED | Study in Austria |
| "Public universities teach bachelor's degrees in German" | CORRECTED (Klagenfurt 6, JKU 1, WU 1 in English) | AAU, JKU, WU pages |
| Non-EU work limit "not verified" | CORRECTED (20 hours/week with a work permit) | OeAD |
| Student self-insurance premium "not verified" | CORRECTED (78.84 EUR/month in 2026) | ÖGK |
| Private/FH fees "not verified" | CORRECTED for IMC Krems and MCI; MODUL and Webster UNVERIFIABLE | IMC, MCI pages |
| EU residence (Anmeldebescheinigung + Meldezettel) | UNVERIFIABLE this pass (not re-read) | — |
| Funding lines | UNVERIFIABLE this pass (not re-read) | — |

## Corrections

### 1. English-taught bachelor's at public universities
- Old (country summary): "Public universities teach bachelor's degrees in German and expect you to prove it, so an IB student without solid German is pushed towards a handful of private universities and Fachhochschulen." Destination: "public-university bachelor's degrees are taught in German".
- New: "almost all" in German, naming Klagenfurt, JKU Linz and WU Vienna as the exceptions; `language.englishTaughtBachelors` in both files updated.
- Sources:
  - https://www.aau.at/en/international/international-profile/degree-programmes-in-english/ — six bachelor's in English, e.g. "Robotics & Artificial Intelligence".
  - https://www.jku.at/en/degree-programs/types-of-degree-programs/bachelors-and-diploma-degree-programs/ba-artificial-intelligence/ — "Language: English (Level B2)".
  - https://www.wu.ac.at/en/programs/bachelors-programs/business-and-economics/overview/selection-procedure-bbe-1 — "In the winter semester 2026/27 we will accept 240 students".

### 2. Non-EU work rights
- Old: "the specific limit for bachelor students was not verified from an official page".
- New: up to 20 hours a week with a work permit, granted without labour-market check; the employer applies.
- Source: https://oead.at/en/to-austria/entry-and-residence/residence-permit-student-no-mobility-programme
- Quote: "will be able to get a work permit for working for up to 20 hours/week"

### 3. Student health self-insurance
- Old: "The current student self-insurance premium was not verified from an official page in this research - check oegk.at."
- New: "Student self-insurance with the OeGK costs 78.84 EUR a month in 2026."
- Source: https://www.oegk.at/cdscontent/?contentid=10007.868713&portal=oegkportal
- Quote: "EUR 78,84" (monthly, 2026)

### 4. Fachhochschule and private fees
- Old: "Private universities set their own fees and they are substantial. These were not verified from official pages in this research."
- New: IMC Krems non-EU 6,900 or 9,500 EUR per semester, MCI 8,250 EUR; both charge EU students 363.36 EUR per semester. MODUL and Webster fees still not established.
- Sources: https://www.imc.ac.at/en/study/application/study-fees/ — "363.36 EUR per semester"; https://www.mci.edu/en/study-at-mci/application-admission — "8,250 euros tuition per semester".

### Evidence
- Re-read and bumped to 2026-09-24: `ev-at-bmfwf-ib-universitaetsreife`, `ev-at-univie-studienbeitrag`, `ev-at-univie-application-periods`, `ev-at-studyinaustria-application`.
- Added `ev-at-aau-english-bachelors` and `ev-at-wu-bbe-selection` (`needs-review`, `read-source`).

## Institutions

All 15 `website` and `admissionsUrl` links resolve to the right place. IMC Krems returned 404 once and 200 on retry (transient). None removed.

| Institution | Check | Change |
|---|---|---|
| Uni Wien | Bachelor's in German | none |
| TU Wien | Bachelor's in German | none |
| WU Vienna | English BBE, selection with spring registration and a June exam | `englishBachelors` filled; note gives the selection timing (was null / generic) |
| Uni Graz | All bachelor's in German | note says so |
| TU Graz | Even Information & Computer Engineering is German-taught with some English courses | none |
| Uni Innsbruck | English and American Studies taught German/English; no English bachelor's found | none |
| JKU | Artificial Intelligence in English, no German needed; Computer Science German | `englishBachelors` filled; note made specific (was "check… some are taught in English") |
| PLUS Salzburg | All bachelor's in German | note says so |
| AAU Klagenfurt | Six English bachelor's | `englishBachelors` filled; note updated |
| BOKU | No English bachelor's found | none |
| MedUni Wien | MedAT route, German | none |
| MODUL | All English; IB 24 points plus maths minimum; fall deadlines 15 Jan / 15 Mar / 15 Aug (EU) | `englishBachelors` and note made specific |
| Webster Vienna | Four English BA/BSc; EU deadline 31 July for fall 2026 | `englishBachelors` made specific |
| IMC Krems | Nine English bachelor's; health degrees in German | `englishBachelors` corrected (health was wrongly implied English) |
| MCI | Two full-time English bachelor's plus one online; engineering German | `englishBachelors` corrected (was "mostly in management and engineering") |

## New institutions

None. `IB_DISCOVERY.md` lists no Austrian university with 300 or more transcripts.

## Not verified

- MODUL and Webster Vienna tuition (not on the admissions pages read).
- 2027/28 University of Vienna windows and the MedAT 2027 dates. Neither is published yet, and the route stays provisional.
- EU residence and funding text (not re-read).
