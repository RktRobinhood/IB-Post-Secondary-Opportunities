# Canada (ca) audit: May 2027 IB session, autumn 2027 entry

Audit date: 2026-09-24. Files: `data/countries/ca.json`, `data/destinations/ca.json`,
`data/evidence/ca.json`, `data/application-routes/ca-*.json`, `data/application-systems/ca-*.json`
(no Canadian context notes exist). The OUAC and York's requirements page were read in a browser (the OUAC
returns 403 to plain requests). The UBC IB page loads its requirements by script and could not be
re-read.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| Study permit cap 2026: 309,670 PAL/TAL application spaces; ON 104,780, QC 93,069, BC 32,596, AB 32,271, NS 8,480, PEI 1,376; master's/doctoral at public DLIs exempt | CONFIRMED (2027 allocation still unpublished) | canada.ca 2026 allocations notice |
| Proof of funds CAD 23,448 for a single applicant outside Quebec, from 1 Sep 2026 | CONFIRMED | canada.ca financial-support page |
| PGWP: apply within 180 days; no field-of-study rule for degrees; CLB 7 | CONFIRMED | canada.ca PGWP eligibility |
| OUAC: CAD 159 for three choices, CAD 51 each further; Group B has no OUAC deadline; document evaluation fees (Toronto 98, Western 125, Queen's/Waterloo/McMaster 95, Ottawa 93) | CONFIRMED | ouac.on.ca/guide/undergrad-fees/ (browser) |
| Toronto 2027: early date 7 Nov, early documents 1 Dec, deadline 15 Jan, documents 1 Feb; MRS 1 Feb; IB excluding bonus points; IBCP not accepted; results from IBO | CONFIRMED | future.utoronto.ca/deadlines; /requirements-international-high-schools |
| OUAC route: Toronto early documents "by 2 December" | **CORRECTED** (1 December) | future.utoronto.ca/deadlines |
| UBC 2027: opens early Oct 2026; Scholars 15 Nov 2026; deadline 15 Jan 2027 23:59 PST; housing 1 May 2027; accept 1 May or 1 June | CONFIRMED | you.ubc.ca/applying-ubc/dates-deadlines/ |
| UBC documents deadline 31 Jan 2027 for "international applicants" | **CORRECTED** (31 Jan is for International Scholars applicants; high-school applicants from outside Canada have until 15 Mar 2027) | same |
| UBC final transcript 30 Jun 2027 and an "IB timing problem nobody resolves" | **CORRECTED** (25 Jul 2027 for out-of-country applicants except US and A-Level; 30 Jun is for US applicants) | same |
| UBC 2026/27 international tuition (Arts 51,530.40; Science 53,082.00; Engineering 66,199.66; Commerce 66,678.30), 3% cap for 4 years | CONFIRMED | students.ubc.ca undergraduate tuition fees |
| UBC application fee "not established" | **CORRECTED** (CAD 173.25 on a study permit) | vancouver.calendar.ubc.ca application fees |
| SFU Fall 2027: opens 1 Oct, scholarship 15 Dec 2026, apply 31 Jan 2027, Beedie/SCA 7 Feb, documents 28 Feb, accept 1 May | CONFIRMED | sfu.ca fall-term dates |
| UVic fee CAD 184.00 with transcripts from outside Canada; deadlines per programme | CONFIRMED | uvic.ca how-to-apply |
| McGill 15 Jan 2027 deadline; 5+ in every subject; Math AI SL not a maths prerequisite; up to 30 credits | CONFIRMED | mcgill.ca important dates; IB page |
| Concordia 1 Feb (international) / 1 Mar | CONFIRMED (still without a year, so still provisional) | concordia.ca apply |
| Alberta CAD 150 fee | CONFIRMED (via ualberta.ca search result; the fee page itself was not reopened) | ualberta.ca |
| Dalhousie 2027 dates "not yet announced" | **CORRECTED** (published: 15 Feb 2027 health programmes and scholarships, 1 Mar Architecture, rolling otherwise, accept by 1 May 2027) | dal.ca/admissions/dates-and-deadlines.html |
| Summary "tuition typically runs 40,000-70,000 CAD" | **CORRECTED** (about CAD 28,000 at Manitoba to CAD 66,678 for UBC Commerce, 2026/27) | Manitoba, UBC pages |
| Minimum IB points "high 20s to low 30s ... not verified" | **CORRECTED** to the published minimums (24 UBC/Manitoba, 26 Dalhousie, 28 York/TMU/Carleton/Guelph) | institution pages |
| U of T "highest international tuition in the country" | **CORRECTED** (removed as unverified; replaced with the fee-timing fact) | ev-utoronto-fee-timing |
| UBC IB rules (24 points incl. bonus, three HL, Math AI SL exclusions) | UNVERIFIABLE this pass (page renders by script); left as recorded 2026-09-23 | you.ubc.ca IB page |
| English proof thresholds | UNVERIFIABLE nationally (left as written) | — |
| Danish SU for a Canadian degree | UNVERIFIABLE from a Canadian source (left as written) | — |

## Corrections

### UBC document deadline
- Old: 31 Jan 2027, audience "international applicants", "sixteen days after the application to meet the English Language Admission Standard ... and to submit the documents".
- New: 15 Mar 2027 for high-school applicants from outside Canada; 31 Jan applies to International Scholars applicants; ELAS evidence 15 Feb 2027.
- Source: https://you.ubc.ca/applying-ubc/dates-deadlines/ — "High school applicants from outside Canada: Deadline to submit required documents to UBC." (15 March 2027)

### UBC final transcript
- Old: 30 Jun 2027, "the IB timing problem nobody resolves" (results arrive 6 July, after the deadline).
- New: 25 Jul 2027. Added as a milestone to `ca-epbc-2027`; `ev-ubc-dates-2027` claim and excerpt updated.
- Source: same page — "Out-of-country applicants (except US and A-Level applicants): Deadline to submit your final transcript to confirm your offer of admission."

### Dalhousie 2027 dates
- Old: `dateState: not-yet-announced`, 2026 dates as precedent.
- New: 15 Feb 2027 (Nursing, Health Sciences, Medical Sciences, Social Work; scholarships), 1 Mar 2027 Architecture, rolling otherwise, accept by 1 May 2027. Profile deadline, `ca-ns` jurisdiction variation and a new `ca-apply-direct-2027` milestone updated. New `ev-dalhousie-dates-2027`; `ev-dalhousie-dates-2026` set to `superseded`.
- Source: https://www.dal.ca/admissions/dates-and-deadlines.html — "September 2027 entry - Program specific deadlines".

### Application fees
- Added UBC CAD 173.25 (study permit); OUAC document evaluation fees York 90, TMU 90, Carleton 85, Guelph 95.
- Sources: https://vancouver.calendar.ubc.ca/fees/application-and-administrative-fees — "Applicants who will be studying on a Study Permit ... $173.25"; https://www.ouac.on.ca/guide/undergrad-fees/ — "Carleton University $85 ... York University $90".
- Evidence: new `ev-ubc-application-fee`; `ev-ouac-fees-2027` extended.

### Toronto early documents (OUAC route)
- Old: "complete the next steps by 2 December". New: "by 1 December".
- Source: https://future.utoronto.ca/deadlines — "Early document submission date: December 1".

### Tuition range (summary)
- Old: "international undergraduate tuition typically runs 40,000-70,000 CAD a year".
- New: "from about CAD 28,000 a year at Manitoba to CAD 66,678 for Commerce at UBC (2026/27)". The destination summary now also names Saskatchewan's CAD 39,007 BA.
- Sources: https://umanitoba.ca/explore/student-experience/tuition-and-financial-supports/international — "$28,000 Average first year international student tuition and fees (CAD)" (no year stated); https://news.usask.ca/...usask-202627-tuition-rates... — "$39,007 ($1,128 increase)".

### Minimum IB points
- Old: "a typical competitive threshold ... high 20s to low 30s ... not verified programme by programme".
- New: the published minimums, by university. Sources are the six new institutions' IB pages below, plus the existing UBC and Dalhousie evidence.

### Alberta URLs
- `https://www.ualberta.ca/` now redirects to `https://www.ualberta.ca/en/index.html`, and `/admissions/` to `/en/admissions/index.html`. Updated.

## Institutions

Checked (14): Toronto, UBC, McGill, Waterloo, Queen's, McMaster, Western, Alberta, Calgary, SFU, UVic, Dalhousie, Ottawa, Concordia. All teach full bachelor's degrees in English (uOttawa is bilingual, Concordia and McGill are English-language universities in Montreal). All URLs resolve. www.utoronto.ca returns 403 to scripts and is the correct address.

- Fixed: Alberta website and admissions URL (redirects). Toronto note (unverified superlative removed).
- Removed: none.

## New institutions

From `IB_DISCOVERY.md`, Canada, 300+ transcripts, the top six. Each checked on its own site for English-taught bachelor's degrees and an IB rule:

| Institution | Transcripts | Jurisdiction | IB rule found | Source |
|---|---|---|---|---|
| York University (Toronto) | 1,456 | ca-on (OUAC) | 28 points for most programmes; HL 5+ up to 30 credits | futurestudents.yorku.ca/requirements/international (browser) |
| Toronto Metropolitan University | 1,135 | ca-on (OUAC) | 28 points, 4+ in 3 HL and 3 SL; bonus points not counted on predictions | torontomu.ca/admissions/undergraduate/requirements/international/ |
| Carleton University (Ottawa) | 966 | ca-on (OUAC or Carleton 360) | full Diploma, 28 points; HL 5+ up to 3.0 credits | admissions.carleton.ca/applicant-type/international-baccalaureate-students/ |
| University of Manitoba (Winnipeg) | 896 | **ca-mb (new)**, apply direct | 3 HL + 3 SL, 24 points | umanitoba.ca/explore/undergraduate-admissions/requirements/ib-requirements |
| University of Guelph | 733 | ca-on (OUAC) | 28 points (many programmes more); HL 5+ up to 2.0 credits | uoguelph.ca/admission/undergraduate/requirements/ib-ap/ |
| University of Saskatchewan (Saskatoon) | 523 | **ca-sk (new)**, apply direct | total out of 45 converted to a percentage (30 = 87%) | admissions.usask.ca/requirements/ib.php |

Not added (cap of six reached): Wilfrid Laurier 518, Windsor 445, MacEwan 388, Trent 330, Winnipeg 328.

Structural changes needed for the two new provinces: jurisdictions `ca-mb` and `ca-sk` added to `data/destinations/ca.json` (with the 2026 PAL allocations, Manitoba 11,196 and Saskatchewan 11,349, and a tuition row each), and both added to `ca-apply-direct-2027`'s jurisdiction list. `node scripts/test-floor.mjs` reports Canada meets the floor. None of the six has coordinates or photographs yet.
