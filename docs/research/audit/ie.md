# Ireland (ie) audit: May 2027 IB session, autumn 2027 entry

Audit date: 2026-09-24. Files: `data/countries/ie.json`, `data/destinations/ie.json`,
`data/evidence/ie.json`, `data/application-routes/ie-cao-2027.json`,
`data/application-systems/ie-cao.json`, `data/context-notes/ie-*.json`.

**Main finding: CAO has published its Handbook 2027** (https://www2.cao.ie/handbook/handbook2027/hb.pdf).
The Timetable of Events web page still shows the 2026 cycle, but the handbook gives the 2027 dates and fees. Every CAO date that had been "rolled forward from 2026 and provisional" is now confirmed for 2027. The one exception is Change of Mind opening, which the handbook calls an "expected date".

## Summary

| Fact | Verdict | Source |
|---|---|---|
| CAO opens 5 Nov 2026 12:00 | CONFIRMED (now also in the 2027 handbook) | CAO Handbook 2027 |
| Discounted fee EUR 35 to 20 Jan 2027 17:00 | **CORRECTED** (provisional → confirmed 2027) | CAO Handbook 2027, Table 1.1 |
| Normal closing 1 Feb 2027 17:00, EUR 50 | **CORRECTED** (provisional → confirmed) | same |
| Amend course choices 5 Feb 12:00 to 1 Mar 17:00, EUR 10 | **CORRECTED** (provisional → confirmed) | same |
| Late applications 5 Mar 12:00 to 1 May 17:00, EUR 65 | **CORRECTED** (provisional → confirmed) | same |
| Change of Mind opens 5 May 12:00 | CONFIRMED, stays provisional ("expected date") | same |
| Change of Mind closes 1 Jul 2027 17:00 | **CORRECTED** (provisional → confirmed) | same |
| Application fee field ("standard and late fees were not confirmed") | **CORRECTED** (EUR 35 / 50 / 65, amend EUR 10) | same |
| Which offer round an IB applicant is in (destination: "not yet established") | **CORRECTED** (Round One, date TBC) | CAO Handbook 2027, Table 1.5 |
| Round One 26 Aug (route) | UNVERIFIABLE for 2027 ("TBC"), kept as the 2026 date, provisional | same |
| IB coordinator must list CAO; give IB candidate number | CONFIRMED (and repeated for May 2027) | CAO Handbook 2027 p.12 |
| Results to CAO by 1 August | CONFIRMED for 2026; 2027 booklet not yet published; the 12-day rule is confirmed in the 2027 handbook | CAO EU/EFTA/UK 2026 booklet; Handbook 2027 |
| IB minimum (24 + Diploma, 2 H5 / 3 H5 routes), HL/SL grade table, points table 45=600 … 24=350, HL maths bonus 25, single sitting, English minima, maths AA/AI note, IBCC max 390 | CONFIRMED (2026-entry booklet; no 2027 edition yet, 404 at the 2027 URL) | Guidelines-EU-EFTA-UK-2026.pdf pp. 92-93 |
| HPAT 2027 registration and window | UNVERIFIABLE (ACER still shows 2026: 16 Jan, late 26 Jan, 13-22 Feb, EUR 164). Left as "not yet announced" | hpat-ireland.acer.org/registration |
| Student contribution EUR 2,500 (2026/27) | CONFIRMED (Citizens Information: "maximum rate ... is now €2,500") | citizensinformation.ie |
| Free Fees: 3 of 5 years resident in EU/EEA/CH/UK | CONFIRMED | hea.ie course-fees |
| Non-EU tuition (was null) | **CORRECTED** (filled: TCD 2026/27 EUR 22,580 arts/business, EUR 29,570 science) | tcd.ie/courses/undergraduate/fees |
| Living cost (was null) | **CORRECTED** (filled: TCD EUR 19,937-29,050 per undergraduate year incl. accommodation) | tcd.ie cost-of-living |
| Stamp 2 work: 20 h term, 40 h in Jun-Sep and 15 Dec-15 Jan | CONFIRMED (dropped the "verify" hedge) | irishimmigration.ie FAQ for students |
| CAO system: points figure "set by the lowest-scoring applicant admitted the previous year" | **CORRECTED** (it is that year's last offer; last year's figure is a guide), matching the context note | editorial consistency |
| Danish SU abroad, SUSI, scholarships | UNVERIFIABLE here (left as written) | n/a |
| Destination tagline and profile summary: "the only English-speaking country left in the EU" | **CORRECTED**: English is also an official language of Malta (on this site as `mt`). Now "English-speaking, inside the EU, and your IB score becomes a number" | editorial |

## Corrections

### CAO dates for 2027 (country profile deadlines and `ie-cao-2027` route)
- Old: dates "rolled forward by one year and marked provisional until CAO publishes the 2027 timetable".
- New: `provisional: false`, year "2027 entry", notes cite the CAO Handbook 2027. Change of Mind opening stays provisional.
- Source: https://www2.cao.ie/handbook/handbook2027/hb.pdf — "Normal online 50 1 February 2027 at 5pm"; "Online Change of Mind (free) facility becomes available on 5 May at 12:00 noon (expected date)".
- Evidence: new `ev-cao-handbook-2027` (read-pdf). `ev-cao-timetable` re-labelled `appliesToIntake: 2026-autumn` because that page is the 2026 timetable.

### Application fee
- Old: "35 EUR if you apply online by 20 January (discounted rate for 2026 entry) ... the standard and late fees were not confirmed on an official page."
- New: 35 / 50 / 65 EUR by 20 Jan / 1 Feb / 1 May 2027, Change of Mind free, amend EUR 10.
- Source: CAO Handbook 2027 Table 1.1 — "Early online 35 20 January 2027 at 5pm ... Late online application 65 1 May 2027 at 5pm".

### Offer round for IB applicants (destination watchOuts and meta, route ms-ib)
- Old: "Which offer round an IB applicant falls into is not yet established here."
- New: an IB applicant straight from school competes in Round One (late August, date TBC).
- Source: CAO Handbook 2027 p.28 — "Applicants applying on the basis of school leaving examination results/grades, regardless of the year completed, will compete for an offer in Round One."

### Non-EU tuition and living costs
- Old: `tuitionNonEu` and `livingCostMonthly` null.
- New: TCD 2026/27 year-1 non-EU EUR 22,580 (arts, humanities, business) and EUR 29,570 (science). TCD living estimate EUR 19,937-29,050 per undergraduate year including accommodation. This is annual; the page gives no monthly figure.
- Sources: https://www.tcd.ie/courses/undergraduate/fees/ — "2026/27 Trinity Business School Business, Economic and Social Studies ... €22,580.00"; https://www.tcd.ie/study/international/welcome/cost-of-living/ — "Undergraduate €19,937 – €29,050".
- Evidence: new `ev-tcd-fees-2026`, which backs the destination's non-EU feeContext.

### Student contribution label
- Old year label: "the HEA page still lists 2,500 EUR for 2025/26".
- New: "2,500 EUR is the maximum student contribution for 2026/27 after the permanent 500 EUR cut in Budget 2026; 2027/28 not announced".
- Source: https://www.citizensinformation.ie/en/education/third-level-education/fees-and-supports-for-third-level-education/fees/ — "The maximum rate of the student contribution is now €2,500." New evidence `ev-citinfo-student-contribution`.

### Destination ibRecognition evidence
- Old: rested on `ev-cao-timetable` (a dates page that says nothing about the IB).
- New: `ev-cao-eu-ib-2026` (the CAO EU/EFTA/UK booklet, IB section).

### Work rights
- Removed "Verify the current non-EU rules ..." hedge after reading the source. Source: https://www.irishimmigration.ie/coming-to-study-in-ireland/frequently-asked-questions-for-students/ — "you can work up to 20 hours per week during term time".

## Institutions

Checked all 14. Every website and admissionsUrl resolves, apart from DkIT.
- **DkIT**: www.dkit.ie is behind a Cloudflare bot check, which did not clear in a browser. UNVERIFIABLE. Left unchanged; nothing suggests it closed.
- **SETU**: blocks scripts but loads in a browser ("SETU | Courses").
- **ATU note** softened: "the cheapest student living costs in the country" had no source. It now reads "lower living costs than Dublin and easier entry points".
- Every Irish institution teaches its bachelor's degrees in English. Removed: none.

## New institutions

None. IB_DISCOVERY.md lists no Irish institution with 300+ IB transcripts that is not already on the site.
