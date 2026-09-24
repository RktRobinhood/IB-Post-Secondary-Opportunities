# Hong Kong (hk) audit: May 2027 IB session, autumn 2027 entry

Audit date: 2026-09-24. Files: `data/countries/hk.json`, `data/destinations/hk.json`,
`data/evidence/hk.json`, `data/application-routes/hk-direct-2027.json`. No `hk-*` application systems or context notes exist.

**Main findings.** CityU's pages block plain fetches, but they open in an ordinary browser: CityU's Early Round closes
**15 November 2026** and its Main Round **15 January 2027** (both previously "not established"). HKU has a
second first-round deadline the site did not carry: grades and documents by **1 December 2026**. The summary said
Hong Kong accepts applications "well past the IB results date", and the destination said "several universities" do;
of the five read, only HKU does. Fees for HKUST, CUHK and PolyU (2027/28) and the application fees are now filled.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| HKU: opens 23 Sep 2026; first round 25 Nov 2026 noon; closes 25 Aug 2027 noon HKT | CONFIRMED | admissions.hku.hk/apply/international-qualifications |
| HKU: grades and documents by 1 Dec 2026 | **CORRECTED** (added) | same |
| HKU 2027/28 tuition HK$280,000 STEM / 250,000 non-STEM / 590,000 MBBS-BDS; halls HK$17,290–37,940; off-campus 30,000–50,000; living up to 50,000 | CONFIRMED | admissions.hku.hk …/tuition-and-living-expenses |
| HKU application fee (was null) | **CORRECTED** (HK$780, 2027 intake) | admissions.hku.hk/node/172 |
| HKUST: system opens 2 Oct 2026; priority 25 Nov 2026; rolling; closes 30 Jun 2027 | CONFIRMED (opening date added) | join.hkust.edu.hk …/international-qualifications |
| HKUST 2027/28 tuition HKD 260,000; accommodation 21,000–51,000; living ~60,000 | CONFIRMED | join.hkust.edu.hk/fees-and-scholarships |
| HKUST application fee | **CORRECTED** (HKD 600) | …/application-procedures |
| CUHK: AOR 12 Nov 2026, Regular 7 Jan 2027 | CONFIRMED (not re-read; unchanged) | admission.cuhk.edu.hk important-dates |
| CUHK IB minimum 30/45 | CONFIRMED | admission.cuhk.edu.hk …/requirements/ |
| CUHK English: IB English grade 4 | **CORRECTED** (profile said HKUST "lists the IB among acceptable English qualifications"; CUHK's rule was missing) | same |
| CUHK 2027-28 tuition HK$230,000; increases capped at 3% | CONFIRMED (cap added) | admission.cuhk.edu.hk …/fees/ |
| PolyU: Early 17 Nov 2026, Main 11 Feb 2027, rolling to 14 May 2027 | CONFIRMED (image re-read) | polyu.edu.hk key dates PNG |
| PolyU tuition ("not verified") | **CORRECTED** (HK$240,000, 2027/28) | polyu.edu.hk …/international-other-qualifications-tuition-fees |
| CityU dates ("not established") | **CORRECTED** (opens 24 Sep 2026; Early 15 Nov 2026; Main 15 Jan 2027) | cityu.edu.hk/admo/admissions/international-admissions (browser) |
| CityU fees ("not verified") | **CORRECTED** (application HK$600; 2027/28 tuition TBA; 2026/27 HK$190,000; living HK$50–60k) | cityu.edu.hk/admo/fees-and-scholarships (browser) |
| Summary: "accept applications on a rolling basis well past the IB results date" | **CORRECTED** (only HKU) | the five universities' dates |
| Destination whyConsider: "Several universities keep applications open after IB results day" | **CORRECTED** | same |
| Watch-out: "We could not verify PolyU or CityU fees, requirements or deadlines" | **CORRECTED** | above |
| Work rights ("not re-verified") | **CORRECTED** (20 h/week on campus normally; temporary exemption since 1 Nov 2024, no end date published) | studyinhongkong.edu.hk; info.gov.hk press release |
| Student visa, HKID within 30 days, medical insurance | UNVERIFIABLE in this pass (left as written) | — |
| Scholarships at CUHK/others, Danish SU | UNVERIFIABLE (left as written) | — |

## Corrections

### CityU dates and fees
- Old: "CityU — non-local rounds, 2027 entry: not-published … nothing about CityU's 2027 dates was read."
- New: two dated deadlines (Early Round 15 Nov 2026, priority; Main Round 15 Jan 2027, hard) in the profile and route; fees as above.
- Source: https://www.cityu.edu.hk/admo/admissions/international-admissions — "15 Nov 2026 Early Round Application Deadline … 15 Jan 2027 Main Round Application Deadline". https://www.cityu.edu.hk/admo/fees-and-scholarships — "HK$600 (up to 2 programme choices)".
- Evidence: new `ev-hk-cityu-dates`, `ev-hk-cityu-fees` (read-browser); `ev-hk-cityu-blocked` set to `superseded`.

### HKU grades deadline
- Old: none. New: 1 Dec 2026 milestone (profile and route).
- Source: https://admissions.hku.hk/apply/international-qualifications — "1 Dec 2026 - Input predicted and/or actual grades and submit supporting documents".
- Evidence: `ev-hk-hku-dates` excerpt and claim extended.

### Tuition and application fees
- Old: "PolyU and CityU not verified"; applicationFee `null`.
- New: PolyU HK$240,000; CityU TBA (2026/27 HK$190,000); HKU HK$780, HKUST HKD 600, CityU HK$600 application fees.
- Sources: PolyU — "HK$240,000 (approximately US$30,770) per academic year"; HKU — "The application fee is HK$780 (2027 Admissions Intake)"; HKUST — "Application fee of HKD600 (~USD77)".
- Evidence: new `ev-hk-polyu-fees`, `ev-hk-hkust-fees`, `ev-hk-cuhk-fees`, `ev-hk-hku-app-fee`.

### English proof
- Old: "IB English is normally accepted. HKUST lists the IB among acceptable English language qualifications."
- New: CUHK accepts IB English grade 4; HKUST's page does not say whether IB English alone suffices.
- Source: https://admission.cuhk.edu.hk/application/overseas-other-qualifications-non-local-international-team/requirements/ (IB English minimum 4).
- Evidence: new `ev-hk-cuhk-requirements`.

### Work rights
- Old: "The rules are narrower than in Europe and were not re-verified."
- New: standard 20 h/week on campus and unlimited 1 June–31 August; temporarily exempted since 1 Nov 2024.
- Source: https://www.studyinhongkong.edu.hk/en/employment.php — "With effect from 1 November 2024 … temporarily exempted from the above employment restrictions". Government press release https://www.info.gov.hk/gia/general/202410/18/P2024101800482.htm.
- Evidence: new `ev-hk-work-exemption` (promotion-agency) and `ev-hk-work-exemption-gov` (official).

### Summary
- Profile summary rewritten: rounds close 12 Nov 2026–mid-January 2027; only HKU stays open past results; 2027/28 fee range.

## Institutions

| Institution | Check | Change |
|---|---|---|
| HKU | confirmed | none |
| CUHK | admissionsUrl redirects to …/requirements/ | admissionsUrl updated to the final URL |
| HKUST | confirmed | none |
| PolyU | fees and dates confirmed | admissionsUrl → international key dates page; note (was "Fees and deadlines not verified") |
| CityU | read in a browser | admissionsUrl → international admission page; note |
| HKBU | resolves | none |
| Lingnan | Cloudflare challenge to both plain fetch and browser; not bypassed | none; UNVERIFIABLE |
| EdUHK | website redirects to /en/ | website updated |
| HKAPA | resolves | none |
| HSUHK | resolves | none |
| HKMU | 403 to plain fetch | none; UNVERIFIABLE |
| HKSYU | admission.hksyu.edu does not resolve (DNS) | admissionsUrl → https://uao.hksyu.edu/en/student-admission/non-local_international |
| THEi | website redirects to thei.edu.hk | website updated |

Removed: none.

## New institutions

None. `docs/research/IB_DISCOVERY.md` lists no Hong Kong institution with 150+ transcripts that is not already on the site (HKU SPACE colleges are excluded there by design).

## Not verified

- 2027 dates at HKBU, Lingnan, EdUHK, HKAPA and the self-financing universities.
- CUHK's application fee for 2027 entry (only a 2026-entry figure surfaced, in a search snippet; not recorded).
- Whether IB English alone meets HKUST's, HKU's or PolyU's English requirement.
- Student visa timing, HKID, healthcare, Danish SU.
