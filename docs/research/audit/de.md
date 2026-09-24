# Germany audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/de.json`, `data/destinations/de.json`, `data/evidence/de.json`,
`data/application-routes/de-hochschulstart-2027.json`, `data/application-systems/de-hochschulstart.json`,
`data/context-notes/de-*.json`. `npm run validate`: all records valid after the edits.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| IB Diploma: 24 points, each of six subjects at least 4, one 3 compensable by a 5 at same or higher level | CONFIRMED | KMK agreement PDF (read in full) |
| Subject rule: two languages, science, maths, social science; sixth from list | CORRECTED (Philosophy missing from social sciences) | KMK agreement PDF |
| Section 1b: one HL must be a language, maths or science, from 2025 exams | CONFIRMED | KMK agreement PDF, footnote 9 |
| Maths SL footnote 3 (subject-restricted access outside STEM) | CONFIRMED | KMK agreement PDF |
| Annex 1: Ikast-Brande 004672 from May 2022; Grenaa 001488 from May 2025 (Stand 26.03.2026) | CONFIRMED | KMK agreement PDF, Annex 1 |
| Conversion N = 1 + 3(Pmax-P)/(Pmax-Pmin), Pmax 42, Pmin 24, 42-45 = 1.0; worked examples | CONFIRMED | KMK agreement PDF, section 3 |
| 12 ascending school years; Studienkolleg / one year of study fallback; German citizens' German proof (1e) | CONFIRMED | KMK agreement PDF |
| KMK agreement is still the version of 15.06.2023 with annexes 26.03.2026 / 22.05.2026 | CONFIRMED | KMK ZAB Hochschulzugang page |
| hochschulstart WS 2026/27 dates (27.04, 31.05, 15.06, 15.07, 16.07, 20.07, 22.07, 22-24.08, 25.08-27.08, 30.09) carried forward as provisional 2027 | CONFIRMED (no 2027/28 table yet) | hochschulstart Termine |
| DoSV choice limit | CORRECTED (6 → 12) | hochschulstart "Bewerbung" |
| uni-assist: 15 July "often" the winter deadline; 4-6 weeks; Western Europe 3-4 weeks; apply 8 weeks early | CONFIRMED | uni-assist deadlines page |
| uni-assist handling fee | CORRECTED (was "could not be confirmed"; now 75 EUR + 30 EUR per further programme) | uni-assist handling fees |
| Non-EU tuition: BW 1,500 EUR per semester | CONFIRMED | MWK Baden-Württemberg |
| Non-EU tuition "free except BW" | CORRECTED (TUM charges non-EU students since WS 2024/25) | TUM tuition page |
| "No tuition for everyone, regardless of nationality" (destination whyConsider) | CORRECTED | TUM, MWK BW |
| Semester contribution Hamburg 402 EUR WS 2026/27 | CONFIRMED | Universität Hamburg |
| Semester contribution range "roughly 70-430 EUR" | UNVERIFIABLE (no official national figure; Hamburg is inside it) | — |
| Living cost 876 EUR/month (2023 survey); blocked account 992 EUR/month from 1 Jan 2025 | CONFIRMED | DAAD finances page |
| Non-EU work: 140 days a year or 20 h/week in lecture period | CONFIRMED | AufenthG §16b |
| Student health insurance 120-140 EUR/month | CORRECTED (2026: about 137-161 EUR) | AOK 2026 figures |
| EU residence (Anmeldung, no permit) | UNVERIFIABLE this pass (not re-read; standard EU free-movement rule) | — |
| Funding lines (SU abroad, Deutschlandstipendium, BAföG for some EU citizens) | UNVERIFIABLE this pass (not re-read) | — |
| English-taught bachelor's are a minority | CONFIRMED | institution pages below |

## Corrections

### 1. KMK social sciences list left out Philosophy
- Old: "(4) a social science (History, Geography, Economics, Psychology, Social Anthropology, Business and Management or Global Politics)"
- New: adds **Philosophy** to the list (`countries/de.json` → `ibRecognition.subjectLevelRule`).
- Source: https://www.kmk.org/zab/fileadmin/Dateien/pdf/ZAB/Hochschulzugang_Beschluesse_der_KMK/aktuell/283_Vereinb_Anerkenn_Int_Baccalaureate_Diploma-2023-06-15_Liste1__2026-03-26_Liste2-2026-05-22.pdf
- Quote: "ein gesellschaftswissenschaftliches Fach (History, Geography, Economics, Psychology, Philosophy, Social Anthropology, Business and Management, Global Politics)"

### 2. DoSV choice limit 6 → 12
- Old: `choiceLimit: 6` (route) and `choiceRules.limit: 6` (application system).
- New: 12; the system note now says a medicine-group application may name any number of locations and counts as one.
- Source: https://hochschulstart.de/bewerben-beobachten/bewerbung
- Quote: "Sie können sich auf bis zu 12 verschiedene „Studienangebote" bewerben."

### 3. uni-assist fee
- Old: `applicationFee: null`; note "The amount could not be confirmed from an official uni-assist page".
- New: 75 EUR first programme, 30 EUR each further one per semester, same for VPD; some universities pay it. WHU's own fee (75 EUR to 31 March 2027, 150 EUR after) given as a private example.
- Source: https://www.uni-assist.de/en/how-to-apply/pay-all-fees/handling-fees/ ; WHU: https://www.whu.edu/en/programs/bachelor-program/bachelor-in-international-business-administration/application-admissions/
- Quote: "The costs are the same for all forms of application, whether standard or VPD procedure"

### 4. Non-EU tuition: TUM as well as Baden-Württemberg
- Old: "Also free at most public universities, with one big exception: Baden-Wurttemberg charges non-EU/EEA students 1,500 EUR per semester … Some other states have debated similar fees." Destination: "No tuition at public universities, for everyone, regardless of nationality".
- New: BW 1,500 EUR per semester and TUM usually 2,000 or 3,000 EUR per semester for new non-EU bachelor's students since WS 2024/25; EU citizens exempt. Watch-out, destination `whyConsider` and `feeContext` updated; meta note "Not established: whether individual federal states charge…" replaced.
- Source: https://www.tum.de/en/studies/fees/tuition
- Quote: "For bachelor's degree programs, tuition fees are usually 2,000 or 3,000 euros per semester."

### 5. Student health insurance cost
- Old: "around 120-140 EUR a month including long-term care insurance"
- New: "in 2026 … about 137-161 EUR a month: 87.38 EUR plus the insurer's own additional contribution, plus 30.78 EUR long-term care insurance (35.91 EUR if 23 or over and childless)". Range derived: 87.38 + 2.18-4.39 % of the 855 EUR base + care insurance.
- Source: https://www.aok.de/pp/rechengroessen/kostenueberblick-studentischen-krankenversicherung/
- Quote: "87,38 Euro pro Monat + Zusatzbeitrag"
- Caveat: the base is the BAföG rate; if that rises for WS 2026/27 the figure moves.

### Evidence
- Updated `ev-kmk-ib-agreement` (excerpt, retrieved 2026-09-24, read in full) and `ev-hochschulstart-termine` (rechecked). Their `attestation` now names this pass; the earlier attester ("the research pass that wrote this record") was replaced on the KMK record.
- Added `ev-hochschulstart-bewerbung`, `ev-uniassist-processing` (now backs the route's uni-assist milestone, which had no evidence), `ev-uniassist-fees`, `ev-tum-non-eu-tuition`, `ev-bw-non-eu-tuition`. All `needs-review`, method `read-source`.

## Institutions

All 14 `website` and `admissionsUrl` links resolve (HTTP 200) to the right place; RWTH refuses scripted requests but loads in a fetcher as the RWTH homepage. No redirects needed updating. None removed.

| Institution | Check | Change |
|---|---|---|
| TUM | English bachelor's: Aerospace (fully English, German A2 required), Management & Data Science and Information Engineering at Campus Heilbronn | `englishBachelors` filled (was null); note now says most bachelor's are German-taught and non-EU students pay tuition |
| RWTH Aachen | Bachelor's in German (even Computer Engineering B.Sc. is German-taught) | none — note confirmed |
| LMU | Bachelor's need German proof even where mostly English (Economics) | none — note confirmed |
| Heidelberg | Only American Studies and English Studies in English, both requiring DSH 2 | note says bachelor's are German-taught |
| UCF Freiburg | LAS still running; 2026 window was 1 June–15 July, 2027 guidelines not yet posted | none |
| Rhine-Waal | About 75 % of bachelor's taught in English | none — confirmed |
| Constructor | All bachelor's in English; fall 2027 Early Action 1 Oct 2026–1 Feb 2027, rolling to 15 July 2027 | none |
| Mannheim | Only CELLS and Culture and Economy: English and American Studies in English, both needing German C1 | note now states language position (dropped the unverified semester-calendar claim) |
| FU Berlin | North American Studies BA taught in English, no German needed | `englishBachelors` filled; note corrected (was "bachelor's teaching is in German") |
| TU Berlin | English bachelor's offer not established (search summary contradictory) | none — UNVERIFIABLE |
| Bard College Berlin | Three English BA tracks, German and US BA | none |
| Frankfurt School | Three bachelor's in English, Business Administration in English and German | `englishBachelors` made specific |
| WHU | BSc IBA in English; 2027 rounds close 31 Jan, 31 Mar, 15 May 2027 | none |
| Leuphana | Seven majors taught entirely in English | `englishBachelors` filled (was null); note adds "public" |

LMU, RWTH, Heidelberg, Mannheim and TU Berlin teach essentially no bachelor's in English. They were kept because they never claimed to and their notes say so, but a later pass may want to decide whether an English-degree site should list them at all.

## New institutions

None. The only German university in `IB_DISCOVERY.md` is Universität Hamburg with 283 transcripts, below the 300 threshold.

## Not verified

- National semester-contribution range "70-430 EUR".
- EU residence, BAföG and SU text (not re-read this pass).
- Whether hochschulstart's WS 2027/28 dates will match 2026/27; everything stays provisional.
- TU Berlin's English bachelor's offer.
