# Japan (jp) audit: May 2027 IB session, autumn 2027 entry

Audit date: 2026-09-24. Files: `data/countries/jp.json`, `data/destinations/jp.json`,
`data/evidence/jp.json`, `data/application-routes/jp-direct-2027.json`,
`data/application-routes/jp-mext-embassy-2028.json`, `data/application-systems/jp-mext-embassy.json`.
No `jp-*` context notes exist.

**Main findings.** Two English-taught programmes on the page have closed: Tohoku's Future Global Leadership
(FGL) courses took their last students in 2026 (Gateway College replaces them from 2027), and Sophia's
Green Science and Green Engineering courses took their last intake in autumn 2026. The UTokyo College
of Design publishes an IB expectation (38/42 + 2 core points, "not cut off scores") and accepts
predicted grades with a conditional offer, final results due 16 August 2027. The destination record
(which wins over the profile) still said the College of Design deadline had "closed", advertised MEXT
as a reason to consider Japan and said the embassy's pages could not be read. All three corrected.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| UTokyo College of Design: 100 places, 50 on Route B; opens 15 Oct 2026 09:00, closes 5 Nov 2026 17:00 JST; video 13–16 Nov; first result 22 Dec; final 20 Feb 2027 | CONFIRMED | design.adm.u-tokyo.ac.jp admissions-overview-2027 |
| UTokyo College of Design: IB expectation (previously "not established") | **CORRECTED** (38/42 + 2 core, not a cut-off) | same |
| UTokyo College of Design: predicted grades, conditional offer, finals by 16 Aug 2027 | **CORRECTED** (added; new milestone) | same |
| English tests at UTokyo CoD: TOEFL iBT 80, IELTS 6.0, Duolingo 110, Cambridge 169 | **CORRECTED** (profile said "IB English A or B is normally accepted") | same |
| Tense of CoD and Keio dates ("Opened 15 October 2026", "Periods I and II closed", destination "closed on 5 November 2026") | **CORRECTED** (these are future dates on 2026-09-24) | same; keio.ac.jp PEARL |
| Keio PEARL: three periods to 7 Apr 2027 15:00, results 25 Jan / 4 Mar / 24 May, ~100 places, entry 22 Sep 2027, IB or predicted, TOEFL/IELTS | CONFIRMED | keio.ac.jp/en/admissions/undergraduate/pearl/ |
| Application fee (was null) | **CORRECTED** (Keio PEARL JPY 35,000; others not read) | same |
| Waseda: six English-based schools; only window published is 8 Jan–10 Feb 2026 (Sept 2026 entry); IB incl. predicted accepted | CONFIRMED (2027 window still unannounced) | waseda.jp/inst/admission/en/undergraduate/english/ |
| Kyoto iUP: 2 Nov–3 Dec 2026 17:00 JST | CONFIRMED; **CORRECTED** in the route, which still said "not read" | iup.kyoto-u.ac.jp/apply/ |
| Kyushu October 2027 application window | **CORRECTED** (added: 7–11 Dec 2026) | kyushu-u.ac.jp …/foreign10/ |
| Tohoku FGL as a live programme | **CORRECTED** (closed; Gateway College, 15 Dec 2026–14 Jan 2027) | insc.tohoku.ac.jp; admissions.tohoku.ac.jp |
| Sophia Green Science/Engineering as a live programme | **CORRECTED** (closed after autumn 2026) | adm.sophia.ac.jp …/en_ug/ |
| MEXT undergraduate: not offered to Danish nationals by the Copenhagen embassy | CONFIRMED (re-read in a browser; page dated 2020/12/3) | dk.emb-japan.go.jp/itpr_en/study.html |
| Destination whyConsider: "MEXT's undergraduate scholarship is genuinely large" | **CORRECTED** (replaced; misleading for a Danish reader) | same |
| Destination/route/system: embassy pages "refused every request" | **CORRECTED** (readable in a browser) | same |
| MEXT recruitment April–May of year before arrival | CONFIRMED | studyinjapan.go.jp …applications-undergraduate |
| UTokyo fees ¥282,000 admission + ¥642,960 tuition, no year stated | CONFIRMED (still no price year) | u-tokyo.ac.jp …/tuition_fees.html |
| Work: 28 hours a week with permission | CONFIRMED (ISA page) — longer holiday hours not re-read | moj.go.jp/isa …nyuukokukanri07_00045 |
| No EU/non-EU fee split | CONFIRMED (no split on the UTokyo page; general rule not re-read nationally) | u-tokyo.ac.jp |
| Living costs | UNVERIFIABLE (no official figure found; left null) | — |
| JASSO Honors Scholarship amount, APU reduction levels, university-recommendation MEXT | UNVERIFIABLE (left as written) | — |
| Residence (Certificate of Eligibility, visa, 14-day municipal registration), NHI | UNVERIFIABLE in this pass (left as written) | — |
| Danish SU abroad | UNVERIFIABLE here (left as written) | — |

## Corrections

### UTokyo College of Design: IB expectation and predicted grades
- Old: "Whether any programme publishes a minimum point score was not established"; "Minimum point scores were not published on any page we could read."
- New: expectation 38/42 plus at least 2 TOK/EE points, "not cut off scores"; predicted scores accepted when exams fall after the deadline, offer conditional, final results by 16 August 2027 (new route milestone `ms-cod-final-results`).
- Source: https://design.adm.u-tokyo.ac.jp/admissions/admissions-overview-2027/ — "A total of 38 points out of 42 for the six subjects and at least 2 points for combined TOK and EE." / "Expectations are not cut off scores/grades."
- Evidence: new `ev-jp-utokyo-cod-ib-2027`.

### English proof
- Old (profile): "IB English A or B is normally accepted … specific scores were not verified."
- New: UTokyo CoD and Tohoku Gateway College: TOEFL iBT 80, IELTS 6.0, Duolingo 110, Cambridge 169; Keio: TOEFL iBT or IELTS Academic. Whether IB English substitutes: not established.
- Source: UTokyo CoD page — "Applicants must submit the result of one of the English proficiency tests designated by the University of Tokyo".

### Tohoku: FGL closed, Gateway College opens
- Old: "Future Global Leadership (FGL) — three English-taught undergraduate courses …"
- New: Gateway College, English-taught, Humanities & Social Sciences and STEM tracks, ~90 October / 88 April places; October 2027 applications 15 Dec 2026–14 Jan 2027, results 24 Mar 2027; IB with predicted scores. Added as a deadline and a route round.
- Sources: https://www.insc.tohoku.ac.jp/english/degree/undergraduate-english/ — "Admissions to the FGL Program undergraduate courses ended in 2026." https://admissions.tohoku.ac.jp/en/admissions/undergraduate/gateway_college/ — "December 15-January 14"; "*Predicted scores are accepted".
- Evidence: new `ev-jp-tohoku-gateway-2027`.

### Sophia: Green Science/Engineering closed
- Old: "Faculty of Liberal Arts (FLA), plus English-taught science and engineering and Sustainable Development programmes. Programme list not verified."
- New: FLA; Sophia Program for Sustainable Futures (seven BAs); Bachelor of Engineering in Digital Green Technology. admissionsUrl moved to the English-taught admissions page.
- Source: https://adm.sophia.ac.jp/eng/admissions/ug_p/en_ug/ — "the Green Science and Green Engineering Programs are no longer accepting new applications."
- Evidence: new `ev-jp-sophia-english-programmes`.

### Kyoto iUP route round
- Old (route): "the closing date is inside the guidelines document … not read in this pass."
- New: opens 2 Nov, closes 3 Dec 2026 17:00 JST (the profile already had this).
- Source: https://www.iup.kyoto-u.ac.jp/apply/ — "from November 2 until December 3, 2026 (5 p.m. Japan Standard Time)".
- Evidence: new `ev-jp-kyoto-iup-apply-2027`.

### Kyushu deadline
- Old: none. New: 7–11 December 2026 for October 2027 entry (closing time not stated).
- Source: https://www.kyushu-u.ac.jp/en/admission/faculty/foreign/foreign10/ — "December 7, 2026 - December 11, 2026".
- Evidence: new `ev-jp-kyushu-iup-2027`.

### Application fee
- Old: `null` / "Figures not collected in this pass."
- New: Keio PEARL JPY 35,000 (September 2027 entry); others not read.
- Source: https://www.keio.ac.jp/en/admissions/undergraduate/pearl/ — "JPY 35,000 by credit card".

### Work rights
- Old: "normally capped at 28 hours a week … Not re-verified from an official page."
- New: 28 hours a week with blanket permission, cited to the Immigration Services Agency.
- Source: https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri07_00045.html — "1週について２８時間以内".
- Evidence: new `ev-jp-isa-work-hours`.

### MEXT and the Copenhagen embassy (destination, route, system)
- Old (destination): whyConsider "MEXT's undergraduate scholarship is genuinely large…"; watchOut "the exact Danish dates belong to the Embassy … whose own web pages refused every request". Route/system notes said the same.
- New: the embassy lists only Japanese Studies and Research Student types for Danish nationals; MEXT undergraduate is recorded as closed to this reader. `ev-jp-embassy-denmark-unreadable` set to `superseded`.
- Source: https://www.dk.emb-japan.go.jp/itpr_en/study.html (read in a browser; plain fetch 403) — "There are two types of Japanese Government (MEXT) Scholarship Program for Danish nationals".

### Summaries
- Both summaries shortened and brought up to date (Gateway College instead of FGL; Sophia without Green Science).

## Institutions

All 15 websites resolve (HTTP 200) except APU admissions and Nagoya G30, which time out to curl but load for a fetcher; kept.

| Institution | Check | Change |
|---|---|---|
| University of Tokyo | CoD page confirmed | englishBachelors: IB expectation added |
| Kyoto University | iUP site and Apply page confirmed | none |
| Waseda | confirmed six schools | none |
| Keio | PEARL confirmed | none (GIGA not read) |
| Sophia | Green Science/Engineering closed | englishBachelors, notableFields, admissionsUrl → adm.sophia.ac.jp …/en_ug/ |
| Tohoku | FGL closed; Gateway College | englishBachelors, note, notableFields, admissionsUrl → Gateway College admissions |
| ICU | 31 majors, declared before third year confirmed | none (admissions URL is a combined page showing graduate content first; kept) |
| APU | admissions hub resolves | none (programme list and reduction levels not re-read) |
| Akita International University | courses are Global Business, Global Studies, Global Connectivity; April and September; year abroad | englishBachelors ("Japan Studies (Global Connectivity)" was wrong), notableFields, admissionsUrl → admission.aiu.ac.jp/en/ug/ |
| Kyushu | engineering + Bioresource and Bioenvironment, October entry | englishBachelors, admissionsUrl → the English-taught admissions page |
| Tsukuba | BPGI confirmed; "Interdisciplinary Global Studies" not on the page | englishBachelors (Interdisciplinary Engineering instead) |
| Temple University Japan | IB welcomed; resolves | none |
| Hokkaido | two programmes: ISP and MJSP | englishBachelors (was muddled), admissionsUrl → undergraduate admissions overview |
| Nagoya | G30: six programmes, one is Social Science (law and economics), not "Economics" | englishBachelors |
| Osaka | English name now "The University of Osaka"; programmes are HUS International and IUPS (CBCMP closed after 2019) | name, englishBachelors, note |

Removed: none. (Tohoku and Sophia remain because they still admit to English-taught bachelor's degrees.)

## New institutions

None. `docs/research/IB_DISCOVERY.md` lists one Japanese candidate, Ritsumeikan University (241 transcripts), below the 300 threshold.

## Not verified

- Waseda's September 2027 window (not yet published; re-check November 2026).
- Keio GIGA; APU, ICU, AIU, TUJ, Hokkaido, Nagoya, Tsukuba and Osaka 2027 deadlines.
- Living costs, JASSO amount, residence procedure details, Danish SU rules.
