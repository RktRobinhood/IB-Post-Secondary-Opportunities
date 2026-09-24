# New Zealand (nz) audit: May 2027 IB session, autumn 2027 entry (July 2027 or February 2028 start)

Audit date: 2026-09-24. Files: `data/countries/nz.json`, `data/destinations/nz.json`,
`data/evidence/nz.json`, `data/application-routes/nz-direct-2027.json` (New Zealand has no
application-system records and no context notes). Otago, AUT and Lincoln refuse plain requests and were
read in a browser.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| No central portal: "Applications should be made direct to the universities" | CONFIRMED | universitiesnz.ac.nz/international-students/next-steps |
| National IB rule: Diploma, 24 points, English A (SL/HL) or HL English B, any mathematics | CONFIRMED (Otago's page states it in full; Auckland, Wellington, Massey restate it) | otago.ac.nz admission-from-international-baccalaureate (browser) |
| Auckland closing dates: Semester Two 2027 8 June (international) / 4 July (domestic); Medicine, Optometry, Pharmacy, Medical Imaging 1 July 2027 for 2028; general Semester One 2028 date not published | CONFIRMED | auckland.ac.nz undergraduate-application-closing-dates |
| Auckland fees: 2026 BA NZD 40,225 to NZD 86,561 (MBChB Year 2+); 2027 BA NZD 42,236.40; Student Services Fee NZD 9.44/point (~1,132.80) | CONFIRMED | auckland.ac.nz undergraduate international fees |
| Otago: semester 2 2027 deadline 30 Apr 2027; accommodation 15 May 2027; orientation 5-9 July; classes 12 July 2027; offshore 15 Nov / onshore 10 Dec (published for 2027 entry); window 1 May-15 Nov | CONFIRMED (the 2028 dates are still carried forward and marked provisional) | otago.ac.nz key dates (browser) |
| Victoria Wellington: T1 8 Dec, T2 1 May, "case-by-case" after; halls open 1 August the year before | CONFIRMED (no year printed, so still provisional) | wgtn.ac.nz dates-and-deadlines |
| Fee Paying Student Visa: from NZD 850; up to 4 years; NZD 20,000 a year; 25 hours a week; 80% within 8 weeks; apply 3 months ahead; October to March busiest | CONFIRMED | immigration.govt.nz/visas/fee-paying-student-visa/ |
| Post Study Work Visa: from NZD 1,670; up to 3 years; NZD 5,000; within 3 months of the student visa end date | CONFIRMED; **URL corrected** (old URL redirects to /visas/post-study-work-visa/) | immigration.govt.nz/visas/post-study-work-visa/ |
| "Te Pukenga was disestablished" on 1 Jan 2026 | **CORRECTED** (renamed NZIST, a transitional body to be disestablished on or before 31 March 2027; ten polytechnics independent from 1 Jan 2026) | education.govt.nz VET redesign page |
| Unitec + MIT merged, standalone, from 1 Jan 2026; IB 24 points for degree entry | CONFIRMED | unitec.ac.nz announcement; IB equivalence page |
| Otago Polytechnic "re-established under its own governance" | **CORRECTED** wording (standalone within the new federation) | education.govt.nz regional polytechnics page |
| destinations meta: Unitec "publishes no IB rule"; closing dates read for only one university | **CORRECTED** (Unitec has an IB page; Otago and Victoria dates were also read) | as above |
| English test thresholds, scholarships, Lincoln "under 3,000 students" | UNVERIFIABLE this pass (left as written; the first two are already flagged) | — |
| Danish SU for a New Zealand degree | UNVERIFIABLE from a New Zealand source | — |

## Corrections

### Te Pūkenga
- Old (profile watch-out, Otago Polytechnic note, destination sector text): restructured on 1 January 2026 "when Te Pukenga was disestablished".
- New: ten regional polytechnics became independent on 1 January 2026, and Te Pukenga, renamed NZIST, is a transitional body due to close by 31 March 2027.
- Source: https://www.education.govt.nz/our-work/strategies-policies-and-programmes/tertiary-and-further-education/redesign-vocational-education-and-training-system — "will act as a transitional entity ... until it is disestablished on or before 31 March 2027."
- The existing evidence record (`data/evidence/nz.json`) already said this correctly; only the prose had drifted.

### Otago Polytechnic status
- Old: "Re-established under its own governance on 1 January 2026 when Te Pukenga was disestablished."
- New: "Independent again since 1 January 2026, standing alone within the new polytechnic federation."
- Source: https://www.education.govt.nz/news/regional-polytechnics-be-re-established-2026 — "Otago Polytechnic – to stand alone within the federation".

### Post Study Work Visa URL
- Old: https://www.immigration.govt.nz/new-zealand-visas/visas/visa/post-study-work-visa (redirects).
- New: https://www.immigration.govt.nz/visas/post-study-work-visa/ in `workRights` and `sources`. Facts unchanged ("Up to 3 years", "From NZD $1670", "at least NZD $5,000").

### Destination meta notes
- Unitec does publish an IB rule: "a minimum total of 24 points in the International Baccalaureate Diploma" (https://www.unitec.ac.nz/application-and-funding/admission-requirements/international-baccalaureate-equivalence/).
- Otago's IB page was read in a browser.
- Closing dates are now read for three universities (Auckland, Otago, Victoria), not one.

## Institutions

Checked (10): Auckland, Otago, Victoria Wellington, Canterbury, Massey, Waikato, AUT, Lincoln, Unitec, Otago Polytechnic. All teach bachelor's degrees in English. All URLs resolve; AUT, Lincoln and Otago return 403 to scripts but load in a browser.

- Fixed: Otago Polytechnic note.
- Removed: none. Unitec is now the merged Unitec/MIT entity, but it still admits degree students under the Unitec name at the same address.

## New institutions

None. `IB_DISCOVERY.md` lists no New Zealand institution with 300 or more IB transcripts.
