# Slovenia audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/si.json`, `data/destinations/si.json`, `data/evidence/si.json`,
`data/application-routes/si-evs-2027.json` (checked, unchanged). `npm run validate`: all records valid.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| 2027/28 joint call not yet published; one call covers Ljubljana, Maribor, Primorska, Nova Gorica and concession-holding institutions | CONFIRMED | gov.si Vpis v visokošolski študij |
| 2026 precedent dates (18 Feb–18 March first period; 10 July evidence cut-off for the 24 July decision; enrolment by 14 August; second period 20–27 August; up to three ranked choices) | CONFIRMED | UL VPIS leaflet 2026 (PDF read in full) |
| IB Diploma equivalent to the matura, no recognition procedure (UL leaflet); IB certificates need recognition | CONFIRMED | UL VPIS leaflet |
| UL's English Business and Economics bachelor is selectable only in non-EU rounds and by Slovenes abroad | CONFIRMED, and CORRECTED where the country page still presented it as UL's option for EU students | UL VPIS leaflet |
| English-taught bachelor count: "around sixteen", Primorska 9 | CORRECTED (17; Primorska 10) | Study in Slovenia programmes in English |
| Free full-time tuition for EU/EEA/Swiss | CONFIRMED | UL tuition page; UP; UNG |
| Non-EU fees: UP €2,400–3,750 (labelled 2021/22); UNG €2,800–3,500 (2025/26) | CONFIRMED as published (both pages still carry those labels) | upr.si, ung.si |
| UP registration fee about €50 a year | CONFIRMED | upr.si |
| Living cost €400–650; dorm €120–250; meals €2.63 subsidy, up to €4.37; transport | CONFIRMED | Study in Slovenia cost of living |
| Student work €7.21 minimum, 15.5 % deduction, 22.5 % tax prepayment | CONFIRMED (page gives no year) | Study in Slovenia working |
| EU residence registration: €494.09 a month means; fees €9.10 / €4.50 / €12.32 | CONFIRMED | Study in Slovenia visa and residence |
| Non-EU health insurance €126.33 a month | CONFIRMED | Study in Slovenia health insurance |
| IB-specific points or conversion | UNVERIFIABLE (none published; record already says so) | — |
| Funding lines | UNVERIFIABLE this pass (not re-read) | — |

## Corrections

### 1. University of Ljubljana's English bachelor's is not open to EU applicants in the EU round
- Old (institution): "One confirmed: Business and Economics, at the School of Economics and Business". Summary: "the University of Ljubljana has just one".
- New: `englishBachelors` says the 2026/2027 call let it be chosen only in the non-EU rounds and by Slovenes abroad; note tells an EU applicant to ask the faculty first; summary and watch-out updated.
- Source: https://www.uni-lj.si/assets/Visokosolska-prijavno-informacijska-sluzba/2026/2027-slo/2026_zlozenka_A5-EU_slo.pdf
- Quote: "izbira je mogoča na prijavnih rokih za državljane držav članic ne-EU ter za Slovence v zamejstvu in po svetu"

### 2. English-taught programme count
- Old: "around sixteen … University of Primorska 9 (… plus Wood Innovation for Sustainability)"; watch-out "9 at Primorska".
- New: about 17 at the public universities (Primorska 10, Maribor 5, Nova Gorica 1, Ljubljana 1), plus about fifteen at colleges and private institutions (Alma Mater Europaea eight, College of Management Bled, Academy of Visual Arts, NOA, GEA).
- Source: https://studyinslovenia.si/study/programmes-in-english/ (national list; includes "Wood Innovation for Sustainability" and "Tourism Destination Management" under Primorska)

### 3. Summary shortened
- Dropped "extremely good-looking" and stated the EU-round limit on Ljubljana's programme.

### Evidence
- Bumped after re-reading: `ev-uni-lj-ib-no-recognition-needed`, `ev-gov-si-joint-call-evs`, `ev-uni-lj-tuition-eu` (attestation notes appended, original attester kept).
- Added `ev-si-english-programmes-list` (promotion agency, `needs-review`, `read-source`).

## Institutions

Links: all resolve. Alma Mater Europaea's enrolment page returned 404 to a bare user agent and 200 to a browser one, so it was left unchanged.

**Removed (five), none of which teaches a bachelor's in English:**

| Institution | Why |
|---|---|
| IEDC-Bled School of Management | No bachelor's degrees at all (executive MBA, DBA, master's). Its own record already said "listed here so you know not to apply" |
| DOBA Business School | Bachelor's taught in Slovene; its 2026/27 English offer is master's and doctoral only (en.doba.si/enrolment) |
| Faculty of Information Studies Novo Mesto | All programmes in Slovene |
| Academy of Fine Arts and Design (ALUO), University of Ljubljana | Not on the national list of English-taught programmes; its nine BA programmes state no English teaching; the record had no admissions link and its website pointed at the parent university |
| Academy of Music (AG), University of Ljubljana | Not on the national list; the record itself said "assume Slovene at bachelor level"; no admissions link |

Note: an earlier pass kept IEDC and DOBA on purpose ("so you know not to apply"). This audit removed them under the rule that listed institutions must admit undergraduates in English, and replaced the destination meta note that recorded the earlier decision. Revert here if that decision should stand.

**Clean-up needed outside this pass's files:** `data/images.json` still has keys `si-fis` and `si-ag`, and `data/official-images.json` has `si-doba`, `si-fis`, `si-aluo` and `si-ag`. `data/places/si-bled.json` is now used by no institution. No `data/ib-statements.json` entries existed for the five.

**Kept but flagged:**
- ISSBS (Celje). Its two bachelor's are not on the national English list and its page states no teaching language. `englishBachelors` now says "Not established". A candidate for removal once someone confirms the teaching language with the school.
- GEA College. Entrepreneurship is on the national list; no change.

**Checked, changed:**
- UL: `englishBachelors` and note (correction 1).
- UP: `englishBachelors` now says ten rather than "nine or ten".

## New institutions

None. `IB_DISCOVERY.md` lists no Slovenian institution with 300 or more transcripts.

## Not verified

- The 2027/28 joint call and all its dates. Expected end of January 2027.
- ISSBS teaching language.
- IB points or conversion for capped programmes (not published anywhere read).
- Funding text.
