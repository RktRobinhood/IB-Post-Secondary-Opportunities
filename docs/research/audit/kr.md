# South Korea (kr) audit: May 2027 IB session, autumn 2027 entry

Audit date: 2026-09-24. Files: `data/countries/kr.json`, `data/destinations/kr.json`,
`data/evidence/kr.json`, `data/application-routes/kr-direct-2027.json`, `kr-direct-2028-spring.json`,
`kr-gks-embassy-2027.json`, `kr-gks-university-2027.json`, `data/application-systems/kr-gks.json`.
No `kr-*` context notes exist.

**Main findings.** (1) Yonsei UIC's English-proof rule was misreported: the site said an English-medium IB
does not exempt a Danish applicant, but UIC lists **IB DP English A** among accepted proofs (no minimum
score) and also accepts a Medium of Instruction certificate. (2) The route `kr-direct-2027` carried
KAIST's Early Admissions round as "Fall 2027 entry" that had "Closed" on 22 October 2026 — a future date,
and a round that leads to a **February 2027** start. Removed from the autumn-2027 route. (3) POSTECH now
admits international undergraduates to a 100% English-taught curriculum (since Fall 2026); two
admissions URLs (POSTECH, UNIST) did not resolve at all.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| KAIST Regular: 10 Nov 2026–14 Jan 2027 18:00 KST; letter 21 Jan; interview 3 Mar; result 25 Mar; year begins end Aug 2027 | CONFIRMED | admission.kaist.ac.kr …/ApplicationTimeline |
| KAIST Early Admissions as a Fall 2027 round that "closed" 22 Oct 2026 | **CORRECTED** (closes 22 Oct 2026, leads to end-Feb 2027 start; removed from autumn route) | same |
| Yonsei UIC: 1st round (Spring 2027) closed 22 Sep 2026; 2nd round (Fall 2027) "March, 2027", interview/notification June 2027 | CONFIRMED | uic.yonsei.ac.kr admission m04_02_02 |
| UIC English proof: "exempts only sole-English-official-language countries; Denmark not one" | **CORRECTED** (IB English A accepted, no minimum; MOI certificate accepted) | same |
| UIC application fee (was not collected) | **CORRECTED** (KRW 150,000; USD 150 via Common App) | same |
| UIC 16 majors, ~3,000 students, 70+ countries, Songdo/Sinchon | CONFIRMED | uic.yonsei.ac.kr about m01_01_01 |
| Korea University Spring 2027 3–31 Aug 2026; Fall 2027 "March, 2027 (TBA)", results June, registration July; Uwayapply | CONFIRMED | oia.korea.ac.kr Admission-Guide |
| SNU admits internationals in spring and fall; only Spring 2027 guideline posted | CONFIRMED | en.snu.ac.kr admission |
| GKS 2027: Embassy Track 15 Sep 11:00–30 Sep 2026 18:00 KST; 74 countries, Denmark absent; UIC Program open to all, 100 places, 13 institutions; graduation by 31 Dec 2026 | CONFIRMED | GKS-U 2027 guidelines PDF |
| KAIST tuition 3,433,000 KRW/semester, NHI 458,340, housing 664,000; no year stated | CONFIRMED (still no price year) | admission.kaist.ac.kr …/coa |
| KAIST Scholarship: 8 semesters tuition, 350,000 KRW/month, insurance, no separate form, GPA > 2.7/4.3 | CONFIRMED | …/scholarships/kaist |
| No nationality-based tuition split | UNVERIFIABLE nationally (KAIST page shows a single rate) | — |
| SNU application fee 70,000 KRW (Spring 2027) | UNVERIFIABLE in this pass (not re-read; left) | — |
| D-2 work hours | UNVERIFIABLE (only secondary sources found, and they disagree; left as "not established") | — |
| Living costs, residence (D-2 visa, ARC within 90 days), NHI | UNVERIFIABLE in this pass (left as written) | — |
| Danish SU abroad | UNVERIFIABLE here | — |

## Corrections

### Yonsei UIC English proficiency
- Old: "its test exemption is written by country rather than by language of instruction — Denmark is not on the list. Do not assume an English-medium IB exempts you anywhere."
- New: IB DP English A (Language and Literature, or Literature) accepted with no minimum score; or TOEFL/IELTS/CEFR; or a Medium of Instruction certificate; English B not listed.
- Source: https://uic.yonsei.ac.kr/admission.php?mid=m04_02_02 — "IB DP English A: Language and Literature or English A: Literature […] (No minimum scores)".
- Evidence: `ev-kr-uic-english-2027` claim and excerpt rewritten.

### KAIST Early Admissions
- Old (route `rd-kaist-early-2027`): "KAIST Early Admissions, Fall 2027 entry … Closed at 18:00 KST on 22 October 2026." Evidence claim: "both for Fall 2027 entry".
- New: round removed from the autumn-2027 route (it would have shown a 22 October 2026 deadline on the autumn timeline); mentioned in the Regular round note as a February 2027 start. Evidence claim corrected.
- Source: https://admission.kaist.ac.kr/intl-undergraduate/application/ApplicationGuide/ApplicationTimeline — "September 22 ~ October 22, 2026, 6:00 PM (KST) … Academic Year Begins: End of February, 2027".

### Application fee
- Old: `null` in the profile. New: UIC KRW 150,000 / USD 150 (Common App); SNU KRW 70,000 (as already in the route).
- Source: UIC page — "KRW 150,000 (about USD 150)".

### POSTECH
- Old: "Undergraduate teaching is substantially in English, but the programme is small and international undergraduate intake is limited." admissionsUrl `https://admission.postech.ac.kr/` (DNS does not resolve).
- New: international freshmen since Fall 2026, 100% English-taught curriculum, same tuition waiver; admissionsUrl `https://adm-iu.postech.ac.kr/`.
- Source: https://postech.ac.kr/eng/news-center/university_news.do?mode=view&articleNo=23959 — "International students will benefit from a 100% English-taught curriculum".
- Evidence: new `ev-kr-postech-intl-ug`.

### Summaries
- Profile and destination summaries shortened (destination 157 → 94 words) and extended to POSTECH, UNIST and GIST; destination English-taught list updated.

## Institutions

| Institution | Check | Change |
|---|---|---|
| Yonsei UIC | confirmed | none |
| KAIST | confirmed | none |
| Seoul National | admissions site resolves; international section present | none |
| Korea University | confirmed | none |
| Sungkyunkwan | admissions resolves (Korean domestic landing page) | none; English-taught claims not verified |
| Ewha | DIS in Scranton College taught in English | englishBachelors, note ("Scranton Honors Program" dropped — not confirmed as English-taught) |
| Hanyang | resolves | none; claims not verified |
| POSTECH | admission.postech.ac.kr does not resolve | admissionsUrl, englishBachelors, note |
| Sogang | resolves (Korean landing page) | none; claims not verified |
| Kyung Hee | resolves | none; claims not verified |
| UNIST | admission.unist.ac.kr does not resolve; Fall 2027 guidelines published at admu-intl | admissionsUrl, englishBachelors |
| GIST | 2027 international guidelines published 18 Aug 2026 | none |
| Handong | resolves | none; claims not verified |
| Chung-Ang | resolves | none; claims not verified |

Removed: none.

## New institutions

None. `docs/research/IB_DISCOVERY.md` lists no Korean institution with 150+ transcripts that is not already on the site.

## Not verified

- Fall 2027 dates for UIC and Korea University (not yet published), and all dates for the ten institutions not read.
- D-2 part-time work hours; living costs; SNU application fee (not re-read); Danish SU.
