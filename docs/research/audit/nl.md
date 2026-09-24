# Netherlands (nl) audit: May 2027 IB session, autumn 2027 entry

Audit date: 2026-09-24. Files: `data/countries/nl.json`, `data/destinations/nl.json`,
`data/evidence/nl.json`, `data/application-routes/nl-*.json`, `data/application-systems/nl-studielink.json`,
`data/context-notes/nl-*.json`, and the programme-level `data/institutions|programmes|opportunities/nl-*.json`.
The programme-level records were written on 2026-09-23. They were spot-checked against the live pages rather than rewritten.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| Statutory fee EUR 2,694 (2026-27); conditions; 2027-28 not published | CONFIRMED | duo.nl/particulier/tuition-fees.jsp |
| Non-EU bachelor fee EUR 9,000-20,000; non-EEA application fees EUR 75-100 | CONFIRMED | studyinnl.org/finances/tuition-fees |
| Living costs EUR 1,000-1,500/month; Nibud 2024 breakdown (561 rent, 244 groceries …) | CONFIRMED | studyinnl.org daily expenses |
| Studielink opens 1 Oct 2026 for 2027-28 | CONFIRMED | uva.nl (Psychology application page); maastrichtuniversity.nl UCM |
| Numerus fixus deadline 15 Jan 2027 23:59 | **CORRECTED** (provisional → confirmed for 2027) | uva.nl: "from 1 October 2026 till 15 January 2027" |
| 15 April ranking; accept within two weeks; 1 May for everything else | CONFIRMED | studyinnl.org how-to-apply; vu.nl |
| "Only one if it is medicine, dentistry, dental hygiene, physiotherapy (or midwifery)" | **CORRECTED** (one application *per programme* for those four, i.e. not medicine at two universities; "midwifery" found in no source and dropped) | studyinnl.org; vu.nl |
| Studielink needs a DigiD; how a non-resident gets one "not established" | **CORRECTED** (no DigiD needed: non-residents verify with a passport/ID scan) | info.studielink.nl verification page |
| Bill 36555 (Wet internationalisering in balans) "going through" | CONFIRMED, with its status now stated: still in the Tweede Kamer, committee stage, no vote as of 24 Sep 2026 | tweedekamer.nl; eerstekamer.nl |
| Student housing shortage "about 21,500 rooms in 2025" | **CORRECTED** (precision: 21,500 in the 19 largest student cities, 2024-25, from the 2025 monitor) | Landelijke Monitor Studentenhuisvesting 2025 |
| "Roughly 5,000 new units a year are being built" | **CORRECTED**: removed. Not in the monitor | same |
| "Average room about 550 EUR" | **CORRECTED** to Nuffic's budget of EUR 561 (Nibud 2024) | studyinnl.org |
| IB Diploma comparable to VWO; no national IB conversion; 24-point Diploma floor | CONFIRMED (existing evidence re-used; Nuffic pages passed the automated check on 2026-09-23) | nuffic.nl |
| TU Delft: only Maths AA HL; AE AA HL + Physics HL; CSE AA HL; Nanobiology + Biology HL + Chemistry SL; ECT + Physics HL + Chemistry SL; four English BSc | CONFIRMED | tudelft.nl diploma-with-additional-requirements; tudelft.nl bachelors |
| RSM IBA: 650 places, Studielink 15 Jan, OLAF 31 Jan, 75/25 grades/motivation, 15 April | CONFIRMED (2027-28 page) | rsm.nl IBA admission |
| EUR IBEB: 700 seats (2026-27), top 350 on grades, weighted lottery; maths and English IB routes | CONFIRMED | eur.nl IBEB admission |
| Maastricht UCM: 1 Feb (non-EU) / 1 Apr (EU) 2027, enrolment tasks 31 Aug 2027 | CONFIRMED (2027-28 page) | maastrichtuniversity.nl UCM |
| Maastricht International Business: 15 Jan, 15 Apr, 33/33/33 | CONFIRMED; page still shows the 2026 cycle, so the route's provisional flag stays | maastrichtuniversity.nl IB |
| Twente Advanced Technology: Maths HL + Physics HL, no numerus fixus | CONFIRMED | utwente.nl AT admission |
| BUas 2027-28 selection regulation (1 May Studielink, 4 May 17:00 Hotel, CMGT rounds 27 Nov/15 Jan/5 Mar/15 May, 19 June, 1 July) | CONFIRMED. The regulation for 2027-2028 was adopted 25 Aug 2026. The route keeps `provisional` on purpose because the years are inferred (as its meta says) | buas.nl/documents/selection-procedures-bachelors |
| BUas CMGT maximum 200 students | CONFIRMED (BUas CMGT international admission page, via search) | buas.nl |
| Danish SU, DUO eligibility, scholarships | UNVERIFIABLE here (left as written) | n/a |

## Corrections

### DigiD
- Old (destination watchOuts, route `ms-digid`, system `identityRequirement`): "Studielink requires a DigiD … How a non-resident applicant obtains one … is not yet established".
- New: with a Dutch address you log in with DigiD. Without one you upload a scan or photo of your passport or EU identity card, which Studielink verifies automatically. The route milestone is renamed "Create your Studielink account" (still personal and provisional).
- Source: https://info.studielink.nl/en/how-to-use-studielink/verification-personal-details-studielink — "you upload a scan or photo of your ID in Studielink. The tool will read this digital copy".
- Evidence: new `ev-studielink-no-digid`.

### Numerus fixus limits
- Old: "only one if it is medicine, dentistry, dental hygiene, physiotherapy or midwifery".
- New: at most two numerus fixus programmes. Medicine, dentistry, dental hygiene and physiotherapy allow one application per programme, so you cannot apply for medicine at two universities.
- Sources: https://www.studyinnl.org/plan-your-stay/how-to-apply — "for these programmes you can only submit one application per programme per academic year"; https://vu.nl/en/education/more-about/selection-procedure-numerus-fixus — "parallel applications may only be made at one institution".
- Evidence: new `ev-vu-numerus-fixus-rules`.

### 15 January 2027
- Old: `provisional: true`, "confirm the 2027 date from October 2026".
- New: `provisional: false`. Source: UvA — "from 1 October 2026 till 15 January 2027".

### Internationalisation bill
- Old: "Check in autumn 2026 …" without a status.
- New: states that on 24 Sep 2026 bill 36555 was still before the Tweede Kamer, not voted on.
- Source: https://www.tweedekamer.nl/kamerstukken/wetsvoorstellen/detail?cfg=wetsvoorsteldetails&qry=wetsvoorstel%3A36555. The process tracker shows preparation done and debate, vote and closure not started. The latest procedure meeting is dated 24 September 2026.

### Housing
- Old: "counted a national shortage of about 21,500 student rooms; roughly 5,000 new units a year are being built"; "average room … about 550 EUR".
- New: "estimated a shortage of about 21,500 student rooms in the 19 largest student cities for 2024-25, only slightly down from 22,800". The 5,000 figure is removed. Rent is now given as Nuffic's EUR 561 budget (Nibud 2024).
- Source: Landelijke Monitor Studentenhuisvesting 2025 (PDF via rijksoverheid.nl) — "het totale tekort aan studentenwoningen geschat op 21.500 woonruimten".

### Institution notes (profile)
Unsourced superlatives were replaced with things that can be checked:
- UU: "Consistently the highest-ranked Dutch university" → broad research university with UCU.
- WUR: "The world's leading university for agriculture" → specialised in agriculture, food, nature and environment.
- UT: "The only true campus university" is now attributed to UT itself ("It calls itself …"), with its 3,000+ rooms on site (utwente.nl campus pages).
- Tilburg: "one of the most transparent" → "numerus fixus selection criteria published in detail".
- EUR: "one of the most applied-to English bachelor's in Europe" → "takes 650 students a year and is selective" (rsm.nl).
- BUas: "almost entirely English-taught" (not established) → lists its English-taught bachelor's.

## Institutions

All 16 profile institutions and the 5 canonical institution records were checked. Websites and admissionsUrls resolve to the right pages. Leiden and BUas block scripts but load in a browser.
- No redirects needed updating.
- TU/e "All bachelor's are taught in English": CONFIRMED (tue.nl: "all lectures, communication and tests are in English").
- Canonical records: TU Delft "four taught fully in English" CONFIRMED; Twente "only campus university" is Twente's own claim (left in `about`, which is outside this pass's reach of change). Maastricht "additional subject requirements" link now shows 2027-2028.
- Removed: none.

## New institutions

From IB_DISCOVERY.md, the six Dutch institutions with 300+ IB transcripts (highest first). Each teaches at least one full bachelor's in English, checked on its own site:

| Institution | shortName | IB transcripts | English bachelor's (verified) | admissionsUrl |
|---|---|---|---|---|
| The Hague University of Applied Sciences | THUAS | 932 | 17 listed (thuas.com/programmes/bachelor) | thuas.com/study-choice/applications-finances-and-moving-here/how-apply |
| Amsterdam University College | AUC | 675 | BA&Sc liberal arts, English | auc.nl/admissions-aid/how-to-apply/how-to-apply.html |
| University College Utrecht | UCU | 612 | liberal arts and sciences, English | uu.nl/en/bachelors/university-college-utrecht/application-and-admission |
| Rotterdam University of Applied Sciences | Rotterdam UAS | 458 | only 3: International Business, Fine Art, Graphic Design | rotterdamuas.com/study-information/enrolment/ |
| Fontys University of Applied Sciences | Fontys | 438 | many (Applied Mathematics, ICT, EEE, Automotive, IDE, Dance, Circus …) | fontys.nl/en/Study-at-Fontys/Practical-information/Application-and-enrolment.htm |
| University College Roosevelt | UCR | 379 | liberal arts and sciences, English | ucr.nl/admissions/ |

These are added only to `data/countries/nl.json`, not as canonical `data/institutions/nl-*.json` records. Founding years are from the linked Wikipedia infoboxes. UCU's `website` is its page on uu.nl because it has no separate domain (ucu.nl does not resolve).
