# United States (us) audit: May 2027 IB session, autumn 2027 entry

Audit date: 2026-09-24. Files: `data/countries/us.json`, `data/destinations/us.json`,
`data/evidence/us.json`, `data/application-routes/us-*.json`, `data/application-systems/us-*.json`
(no US context notes exist). Pages were read with a plain fetch; Michigan, Colby and Amherst refuse
bots and were read in a browser. NYU (human-verification page), travel.state.gov and the US Embassy
Copenhagen (Cloudflare / 403) could not be read at all.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| No national IB minimum, no national conversion | CONFIRMED | (structural; no rule owner exists) |
| UC IB credit: diploma 30+ = 6 quarter units; HL 5-7 = 8 quarter units each, usually 24 | CONFIRMED | admission.universityofcalifornia.edu/.../ib-credits.html |
| UC fall 2027: opens 1 Aug 2026, file 1-30 Nov 2026, SIR 1 May, transcript 1 Jul, IB results 15 Jul 2027 | CONFIRMED | admission.universityofcalifornia.edu/.../dates-and-deadlines.html |
| UC fee 80 USD per campus domestic, 95 USD international; no letters of recommendation | CONFIRMED | admission.universityofcalifornia.edu/apply-now.html |
| UC 2027-28 tuition 16,278 resident / 57,300 nonresident; COA 49,078 / 90,100 | CONFIRMED | admission.universityofcalifornia.edu/tuition-financial-aid/tuition-cost-of-attendance/ |
| Berkeley 2026-27: tuition and fees 18,214, NRST 39,270, residence hall 16,640, meal plan 7,000, SHIP 5,066 (2,533/semester), off-campus housing 14,386 | CONFIRMED | financialaid.berkeley.edu/cost-of-attendance/; uhs.berkeley.edu |
| Berkeley transport allowance "0-5,000 USD" | **CORRECTED** (754-1,238 USD local transport) | financialaid.berkeley.edu/cost-of-attendance/ |
| Harvard cost of attendance (2025-26: 86,926 billed, insurance 4,308) | **CORRECTED** to 2026-27: 91,634 billed, 95,134-100,134 total, insurance 4,954 | college.harvard.edu/.../cost-attendance |
| Harvard: fee 95 USD, SAT/ACT required with IB only "in exceptional cases", REA 1 Nov, RD 1 Jan | CONFIRMED | college.harvard.edu/admissions/apply/first-year-applicants |
| Harvard: internationals same aid, need-blind, <100k pays nothing, <200k tuition covered | CONFIRMED | college.harvard.edu/financial-aid/how-aid-works |
| Yale: SAT/ACT required, AP/IB supplementary only; SCEA 1 Nov, RD 2 Jan | CONFIRMED | admissions.yale.edu/standardized-testing; /apply |
| MIT: EA 1 Nov, RA 4 Jan, aid 30 Nov / 15 Feb, SAT/ACT required, fee 75 | CONFIRMED | mitadmissions.org/apply/firstyear/deadlines-requirements/ |
| Stanford: testing and need-aware status "could not verify" | **CORRECTED** (SAT/ACT required; fee 100 USD; "limited amount of financial aid for international students"; REA 1 Nov, RD 5 Jan) | admission.stanford.edu/apply/first-year/; financialaid.stanford.edu |
| Need-blind list "not fully verified" | **CORRECTED** (Yale, MIT, Amherst, Bowdoin confirmed on own pages; Princeton, Dartmouth, Brown, Notre Dame, W&L still unchecked) | see corrections |
| Amherst ED 9 Nov 2026, RD 5 Jan 2027, reply 1 May 2027, fee 75, test-optional | CONFIRMED | amherst.edu/admission/apply/firstyear (browser) |
| Bowdoin ED I 15 Nov, ED II 5 Jan, RD 5 Jan; aid 15 Nov / 5 Jan / 1 Feb | CONFIRMED on the dates page (the existing conflict with another Bowdoin page left unresolved on purpose) | bowdoin.edu/admissions/apply/dates-deadlines/ |
| Grinnell ED I 15 Nov, ED II 5 Jan, RD 15 Jan; aid forms by deadline; need-aware, 100% need; merit for internationals; no fee | CONFIRMED | grinnell.edu/admission/apply/international |
| Macalester ED I/EA 1 Nov, ED II 1 Jan, RD 15 Jan; CSS or ISAFA; no aid after admission | CONFIRMED | macalester.edu/admissions/international/first-year/ |
| Illinois EA 1 Nov (materials 7 Nov), RD 5 Jan (materials 11 Jan) | CONFIRMED | admissions.illinois.edu/apply/freshman/dates |
| Non-resident costs at Michigan, Illinois, ASU "not established" | **CORRECTED** (now recorded, 2026-27) | see corrections |
| ASU: fee 90 USD international; fall 2027 priority date not yet published | CONFIRMED | admission.asu.edu/apply/international/first-year |
| SAT 2026-27 dates: 7 Nov (reg. 23 Oct), 5 Dec (reg. 20 Nov), then 6 Mar 2027 | CONFIRMED | satsuite.collegeboard.org/sat/registration/dates-deadlines |
| ACT 2026-27 dates | UNVERIFIABLE (act.org registration page still shows 2024 dates) | act.org |
| Common App 2026-27 opened 31 July 2026 | CONFIRMED | commonapp.org blog |
| SEVIS I-901 fee 350 USD | CONFIRMED | ice.gov/sevis/i901 |
| MRV visa fee 185 USD; 250 USD Visa Integrity Fee | UNVERIFIABLE (travel.state.gov and dk.usembassy.gov blocked) | left flagged in the record |
| Summary cost range "roughly 40,000 USD a year at a public university" | **CORRECTED** (2026-27 full-year totals run ~62,000 USD at Illinois to 95,000-100,000 at Harvard) | Illinois, Harvard pages |
| Watch-out "Early Action and Early Decision close 1 November ... most RD 1 January" | **CORRECTED** (early rounds 1-15 Nov, RD 1-15 Jan) | institution pages above |
| Colby: website/admissions URL; size | **CORRECTED** (admissions now afa.colby.edu; 2,400 students, 48 majors) | afa.colby.edu (browser) |
| Colby IB credit ("reported" year of credit for a strong diploma) | UNVERIFIABLE (catalogue pages render empty in automation) | left as "reported" |
| Michigan "19 schools" | **CORRECTED** (280+ programmes in 15 undergraduate schools and colleges) | admissions.umich.edu (browser) |
| NYU facts | UNVERIFIABLE (human-verification wall) | — |
| Danish SU for a US degree | UNVERIFIABLE from a US source (left as written) | — |

## Corrections

### Summary cost range
- Old: "from roughly 40,000 USD a year at a public university to over 95,000 USD a year at a private one."
- New: "for 2026-27 a full year runs from about 62,000 USD for an international student at Illinois to 95,000-100,000 USD at Harvard before health insurance."
- Sources: https://www.admissions.illinois.edu/tuition/ — "Estimated Total Cost of Attendance $62,146–$72,976"; Harvard page below.

### Harvard cost of attendance
- Old: 2025-26 billed 86,926 USD (59,320 / 5,476 / 13,532 / 8,598), total 90,426-95,426, insurance 4,308; housing and food 22,130.
- New: 2026-27 billed 91,634 USD (62,226 / 6,216 / 14,250 / 8,942), total 95,134-100,134, insurance 4,954; housing and food 23,192. Also in `destinations/us.json` feeContext and the Common App costs variation.
- Source: https://college.harvard.edu/financial-aid/how-aid-works/cost-attendance — "2026-2027 … Tuition $62,226 … health insurance is required at a cost of $4,954."
- Evidence: `ev-harvard-cost-of-attendance` updated (retrievedAt 2026-09-24; old automated sourceCheck dropped since the claim changed).

### Public-university non-resident costs (previously "not established")
- New (2026-27): Michigan 67,096 USD tuition and fees, lower-division LSA non-resident, total budget 88,394; Illinois 42,248-53,078 international tuition and fees, total 62,146-72,976; ASU international total 69,906 (tuition and fees up to 42,609).
- Sources: https://admissions.umich.edu/costs-aid/costs — "Nonresidents (Out-of-State) Lower Division LSA … $67,096 … $88,394"; https://www.admissions.illinois.edu/tuition/ — "Tuition & Fees $42,248–$53,078"; https://admission.asu.edu/cost-aid/international — "Base tuition: $39,062 … Total $69,906".
- Evidence: new `ev-umich-costs-2026-27`, `ev-illinois-tuition-2026-27`, `ev-asu-international-cost-2026-27`.

### Transport allowance
- Old: "Berkeley allows 0-5,000 USD for transportation and Harvard allows the same range."
- New: Harvard allows 0-5,000 USD; Berkeley's budget covers local transport only (754-1,238 USD).
- Source: https://financialaid.berkeley.edu/cost-of-attendance/ — transportation "$754" (residence hall), "$1,238" (off-campus).

### Application fees
- Old: "Harvard 95 USD; UC 95 ... Most universities charge 50-100 USD".
- New: adds Stanford 100, MIT/Amherst/Michigan 75, ASU 90 (international), Grinnell 0.
- Sources: Stanford "$100 nonrefundable application fee"; MIT "Application fee of $75"; Amherst "$75 Application Fee"; Michigan "Our application fee is $75"; ASU "International nonresidents: $90".

### Stanford note
- Old: "Reported to have reinstated a testing requirement and to be need-aware for internationals - check both ... we could not verify them."
- New: requires SAT or ACT, 100 USD fee, "a limited amount of financial aid for international students"; REA 1 Nov 2026, RD 5 Jan 2027.
- Sources: https://admission.stanford.edu/apply/first-year/ — "ACT or SAT test scores" listed as required; https://financialaid.stanford.edu/undergrad/how/international.html — "Stanford has a limited amount of financial aid for international students."

### Need-blind list (funding)
- Old: "NOT FULLY VERIFIED: ... Yale, Princeton, MIT, Amherst, Bowdoin, Dartmouth, Brown, Notre Dame and Washington and Lee".
- New: Yale, MIT, Amherst, Bowdoin confirmed; the other five still "widely reported, not checked here".
- Sources: https://admissions.yale.edu/financial-aid-international-applicants — "meet 100% of demonstrated need - regardless of a student's citizenship"; https://mitadmissions.org/help/faq/need-blind-admissions/ — "need-blind for all students, foreign and domestic"; https://www.amherst.edu/admission/apply/international — "need-blind admission policy for all students—domestic and international"; https://www.bowdoin.edu/admissions/apply/international-students/index.html — "Bowdoin College is need blind for international students."
- Amherst and Bowdoin institution notes changed from "consistently named / regularly listed" to the stated policy. Amherst's unsourced "About 1,900 students" was dropped.

### Deadline watch-out
- Old: "Early Action and Early Decision close 1 November 2026, most Regular Decision 1 January 2027".
- New: "early rounds close between 1 and 15 November 2026, Regular Decision between 1 and 15 January 2027".
- Source: the per-college dates above (Amherst ED "Nov. 9, 2026"; Grinnell RD "Jan. 15").

### Colby
- Old admissionsUrl `https://www.colby.edu/admission/`; now redirects to `https://afa.colby.edu/`. Old "about 2,200 students"; page says "2,400 students" and "48 majors". Colby dates added to the deadline note: ED I 15 Nov, ED II 4 Jan, RD 4 Jan; `destinations/us.json` meta note updated.
- Source: https://afa.colby.edu/ — "Early Decision II Admissions: January 4 … Regular Decision Admissions: January 4".

### Michigan
- Old: "Four-year degrees across 19 schools". New: "more than 280 programmes in 15 undergraduate schools and colleges"; note gains the 2026-27 non-resident figure.
- Source: https://admissions.umich.edu/ — "280+ IN 15 UNDERGRADUATE SCHOOLS & COLLEGES".

### Illinois admissions URL
- `https://admissions.illinois.edu/` redirects to `https://www.admissions.illinois.edu/`; updated.

### Visa fee note
- Wording only: records that travel.state.gov and the Copenhagen embassy blocked both fetch and browser on 2026-09-24. Figures unchanged and still flagged unverified.

## Institutions

Checked (14): Harvard, Yale, MIT, Stanford, Amherst, Bowdoin, Grinnell, Macalester, Colby, NYU, Michigan, UC Berkeley, Illinois, ASU. All teach full four-year bachelor's degrees in English.

- URLs: all resolve. NYU (405), Michigan (403), Colby (403) and berkeley.edu (403) refuse automated requests. Michigan and Colby were confirmed in a browser. NYU shows a human-verification page that was not bypassed; its URL is unchanged and unverified.
- Fixed: Colby admissionsUrl, Illinois admissionsUrl, and the Stanford, Amherst, Bowdoin, Michigan and Colby notes/descriptions (above).
- Removed: none.

## New institutions

None. `IB_DISCOVERY.md` covers institutions outside the US only, so it gives no US candidates.
