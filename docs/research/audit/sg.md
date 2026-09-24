# Singapore (sg) audit: May 2027 IB session, autumn 2027 entry

Audit date: 2026-09-24. Files: `data/countries/sg.json`, `data/destinations/sg.json`,
`data/evidence/sg.json`, `data/application-routes/sg-autonomous-2027.json`, `sg-arts-2027.json`,
`sg-private-2027.json`, `data/application-systems/sg-joint-acceptance.json`. No `sg-*` context notes exist.

**Main findings.** The Singapore record was carefully built and its dates held up. Three things were added or
corrected: **NUS tuition** can be read (AY2026/2027 PDF) and was recorded as unverifiable; **NUS, like NTU, makes
it mandatory to authorise the IB to release your transcript** (institute code 000690) and requires English as an IB
subject; and **SMU's pages** (blocked on 23 September) open in an ordinary browser — they show only the 2026 cycle,
and say SAT/IELTS/TOEFL are not required from IB Diploma holders. The claim "IB English A or B is normally accepted"
was unsupported and was replaced by what each university actually says.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| NTU IB window 15 Oct 2026–19 Mar 2027; documents 22 Mar; ADM portfolio 19 Mar; photo/appraisal 26 Mar; offers Mar–May; actual results within 3 days of July release; IBO transcript access mandatory; excluded programmes | CONFIRMED | ntu.edu.sg …/international-baccalaureate-diploma |
| NTU application fee (was null) | **CORRECTED** (SGD 25 for international applicants) | same |
| NUS IB window 16 Dec 2026–17 Feb 2027, stamped "[Closed]"; May 2027 IB candidates hear by 3rd week of July; JAP windows TBC | CONFIRMED (browser) | nus.edu.sg/oam/admissions/important-dates |
| NUS: English must be an IB subject; transcript release to NUS (000690) mandatory | **CORRECTED** (added) | nus.edu.sg/oam/admissions/ib-diploma (browser) |
| NUS tuition "could not be verified" | **CORRECTED** (AY2026/27: SGD 21,400 with grant in most faculties; 33,400–39,700 without; AY2027/28 published Feb–Apr 2027) | NUS Registrar ugtuitioncurrent.pdf |
| NTU tuition for 2026 entrants (21,400–21,800 with grant; 36,350–40,600 without) | CONFIRMED as recorded 2026-09-22 (NTU's newest table is still 2026; not re-read line by line) | ntu.edu.sg tuition-fees |
| SMU "could not be read" (CAPTCHA) | **CORRECTED** (read in a browser; AY2026-27 cycle only: 17 Nov 2025–19 Mar 2026; 2027 not published) | admissions.smu.edu.sg …/ib-diploma |
| SMU: IB Diploma holders need no SAT/IELTS/TOEFL | **CORRECTED** (added) | admissions.smu.edu.sg …/international-and-other-qualifications |
| "IB English A or B is normally accepted as proof of English" | **CORRECTED** (unsupported; replaced with NUS/SMU/NTU specifics) | as above |
| LASALLE: opens 1 Oct 2026, apply by 1 Nov 2026, outcomes 23 Dec 2026; Music 28 Feb 2027 (outcomes 20 Apr / 2 Apr) | CONFIRMED | lasalle.edu.sg/admissions |
| SUTD shows 2026 windows only (other qualifications 2 Jan–2 Mar 2026) | CONFIRMED | sutd.edu.sg/admissions/undergraduate/ |
| SIT shows 2026 cycle only | UNVERIFIABLE today (page returned no content to a fetcher; left as recorded 2026-09-23) | singaporetech.edu.sg |
| SUSS, JCU Singapore | UNVERIFIABLE (Cloudflare challenge in the browser too; not bypassed) | — |
| Work: 16 hours a week in term, unrestricted in vacations | CONFIRMED (was "not re-verified") | mom.gov.sg work-pass-exemption-for-foreign-students |
| Tuition Grant bond, sureties, liquidated damages | CONFIRMED as recorded (MOE PDFs; not re-read) | file.go.gov.sg PDFs |
| Living costs, Student's Pass via SOLAR, healthcare, Danish SU | UNVERIFIABLE in this pass (left as written) | — |
| Route milestone `ms-sg-au-nus-window` labelled "applications close" but dated on the opening day (with an endDate) | **CORRECTED** (label "application window") | — |

## Corrections

### NUS tuition
- Old: "NUS, SMU and SUTD figures could not be verified."
- New: AY2026/2027 entrants, non-ASEAN international: SGD 21,400 with the Tuition Grant (computing, engineering, humanities and sciences), 22,200 business, 30,450 law; without the grant SGD 33,400–39,700 (44,450 law); AY2027/2028 figures due February–April 2027.
- Source: https://www.nus.edu.sg/registrar/docs/info/administrative-policies-procedures/ugtuitioncurrent.pdf — "Tuition Fees Per Annum (applicable for Academic Year 2026/2027)"; row "Computing 8,300 11,600 18,050 21,400 39,700".
- Evidence: new `ev-sg-nus-fees-2026` (read-pdf).

### NUS IB requirements
- Old: only NTU's transcript authorisation was recorded.
- New: NUS requires English among the IB subjects and mandatory transcript release to NUS, institute code 000690 (route submission item and watch-outs).
- Source: https://www.nus.edu.sg/oam/admissions/ib-diploma — "It is mandatory for all applicants to authorise the International Baccalaureate (IB) to release their IB transcripts".
- Evidence: new `ev-sg-nus-ib-requirements` (read-browser).

### SMU
- Old: "Every attempt to read SMU's admissions pages returned an Imperva bot-detection challenge asking for a CAPTCHA."
- New: read in a browser; shows AY2026-27 only (17 Nov 2025–19 Mar 2026; predicted scores by 31 Mar 2026; acceptance 25 May 2026); 2027 not yet published; IB holders need no SAT or English test. admissionsUrl moved to SMU's IB Diploma page.
- Source: https://admissions.smu.edu.sg/admissions-requirements/ib-diploma — "AY2026-27 application closing date: 19 March 2026"; international page — "SAT /ACT/ IELTS / TOEFL … are not required for applicants with IB Diploma".
- Evidence: new `ev-sg-smu-ib-2026`; `ev-sg-smu-unreadable` set to `superseded`.

### English proof
- Old: "IB English A or B is normally accepted; some universities may still ask for IELTS or TOEFL. Not verified."
- New: NUS — English must be an IB subject; SMU — no English test for IB Diploma holders; NTU — no separate English test on its IB page.

### Application fee and work rights
- Old: applicationFee `null`; work rights "Not re-verified".
- New: NTU SGD 25; 16 hours a week in term, no limit in vacations.
- Sources: NTU IB page — "SGD25 for international applicants"; MOM — "It is for a maximum of 16 hours a week".
- Evidence: new `ev-sg-mom-student-work`.

### Summaries
- Both summaries shortened (profile ~85 words, destination 88, from 160); the tagline is unchanged.

## Institutions

| Institution | Check | Change |
|---|---|---|
| NUS | confirmed | note (fees now known) |
| NTU | confirmed | none |
| SMU | read in a browser | admissionsUrl → IB Diploma page; note (bot-block text removed) |
| SUTD | confirmed | none |
| SIT | resolves | none |
| SUSS | Cloudflare challenge | none; UNVERIFIABLE |
| LASALLE | confirmed | none |
| NAFA | resolves | none |
| James Cook University Singapore | Cloudflare challenge | none; UNVERIFIABLE |
| Curtin Singapore | admission-criteria page resolves (timed out to curl, loads for a fetcher) | none |
| DigiPen Singapore | resolves | none |
| SIM Global Education | resolves | none |
| ESSEC Asia-Pacific | resolves | none |

Removed: none.

## New institutions

None. `docs/research/IB_DISCOVERY.md` lists no Singapore institution with 150+ transcripts that is not already on the site.

## Not verified

- 2027 dates at SMU, SUTD, SIT, SUSS, NAFA and the private institutions.
- AY2027/2028 tuition anywhere; SMU and SUTD tuition; living costs.
- Whether the Tuition Grant reaches international students at LASALLE or NAFA.
