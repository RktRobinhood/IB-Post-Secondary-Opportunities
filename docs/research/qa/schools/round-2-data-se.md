# School records, Sweden (#43): admissions counsellor, round 2

Under review: the 14 records `data/schools/se-*.json` as they stand after the "Round-1 fixes (SE, NO)" in `docs/research/schools/progress.md`. I checked them on 26 September 2026 against University Admissions (universityadmissions.se), antagning.se and the institutions' own pages. I used only WebFetch and WebSearch; no browser.

## Score: 8/10. Accepted.

**All six round-1 errors are fixed, and the fixes are right.** Every Swedish card now does three things:

- It labels the January round as being for students who already hold the Diploma.
- It calls the April round "the round for May 2027 IB candidates (EU/EEA)".
- Where no April 2027 occasion is published (LTU, LiU, UmU Life Science and Business), it says "as a May 2027 IB candidate you cannot apply yet".

I re-read the sources behind each fix and they say what the records say. **No deadline is wrong**: 41 date entries in 7 records match the official pages.

One new error remains, on a single programme. **UmU Industrial Design's exception** sends a May-2027 IB candidate into the January round, but it doesn't mention that the eligibility deadline falls two weeks before IB results come out (E1). Fixing it takes one sentence. The rest are smaller points of consistency.

## Round-1 errors: verified

| # | Record | Status | Evidence |
|---|---|---|---|
| E1 | se-ltu | **Fixed** | LTU's Game Development page shows one occasion: "Autumn 2027, LTU-87460, Last day for application 2027-01-15". It also says: "If you are in your final year of upper secondary school, you must apply in the second admission round (March–April)". The Music page shows LTU-80984/-80000/-80001, all on 2027-01-15. Note 0 now says no LTU programme has an April 2027 round, "you cannot apply yet". The January dates are labelled "not for final-year IB students". Note 1 (April round in 2026) is supported by a search hit: Game Development autumn 2026 had an "EU/EEA students" code, LTU-87456. |
| E2 | se-umu | **Fixed** | UmU's key-dates page lists "Programmes in Second Round Only … Architecture Programme", with 15 March–15 April 2027. It lists no second-round bachelor's occasion for Life Science or IBE. Note 0 says "you cannot apply yet to Life Science or Business", and the two programme `ib` lines say the same. (New issue on Industrial Design: E1 below.) |
| E3 | se-liu | **Fixed** | mgmb2 shows "National Admissions Round, Autumn 2026, LIU-50307", "International Admissions Round, Autumn 2026, LIU-51300", and "International Admissions Round, Autumn 2027, LIU-51300, Application period not open". There is no 2027 national occasion. Note 0 and the programme `ib` line both say so. |
| E4 | se-mau | **Fixed** | Malmö: "We recommend international students apply in the first admission round". Note 2 now calls this advice "for diploma holders" and sends the student to the April round. The January dates are labelled. (Smaller point 2 is about how the April round is labelled.) |
| E5 | se-slu | **Fixed** | Forest and Landscape: "Application deadline for international students: 2027-01-15" (code 91003); "Application deadline for Swedish students: 2027-04-15" (code 91104); "SLU strongly encourage all international students to apply in this first admission round". Note 2 and the 15 April label now put the IB caveat right next to that advice. |
| E6 | se-uu | **Fixed** | The Swedish pages show the April round for 2026: Speldesign och programmering "Hösten 2026, UU-P5370, 15 april 2026"; Egyptologi "UU-P5010, 15 april 2026". Neither shows any 2027 occasion. The April 2027 date reads "if a programme runs it", and note 1 says that no 2027 round of either kind is published yet. The fixer read the evidence better than round 1 did, and the card is now honest. |

Smaller points from round 1: 1 (JU "keep the points of your predicted grades"), 2 (Chalmers → antagning.se), 3 (SSE summary), 5 (LU Fine Arts) and 7 (5 July entries now `eu-eea-ch`) are all done. Point 4 (the SU hand-off also lists master's) is unchanged, with a reason: no bachelor's-only SU page was found. That's acceptable. For point 6 (UmU "13:00 CET"), the new citation is the Life Science page, whose occasion block is rendered by script. I could not see it, and I don't count it against the record.

## Errors

| # | Record | Field | What the record says | What the official pages say | Source |
|---|---|---|---|---|---|
| E1 | se-umu | `notes[2]` (and programme 0) | "Industrial Design is the exception: you apply in January and may prove general entry later, by the April round's document deadline, but work samples are due 1 February 2027." | The April round's document deadline is **21 June 2027**. University Admissions and UmU's key-dates page give "Supporting documents deadline: 21 June". May-session IB results come out in early July, and University Admissions gives IB students a separate "IB/EU upper secondary results deadline: 5 July" that belongs to the second round. So a May-2027 IB candidate cannot prove general entry by 21 June. The note reads as if the exception is made for them, and it leaves out the date that shows the problem. UmU's Industrial Design admission page also says documents are due 1 February, and adds only that "If you are currently completing your secondary education, specific instructions apply". | https://www.universityadmissions.se/en/key-dates-and-deadlines/autumn-semester-dates/ · https://www.umu.se/en/education/application-and-admission/key-dates-and-deadlines/ · https://www.umu.se/en/umea-institute-of-design/education/programmes/bachelor-programme-in-industrial-design-/admission/ |

**Fix for E1.** Suggested wording: "Industrial Design is the exception: you apply in January and may prove general entry by 21 June 2027. May IB results arrive in early July, so before applying, check with UmU that your results via the IB Result Service (by 5 July) will count." Here asking the university is the right advice. The exception is genuine, but whether it covers the IB is not published. That is different from round 1's "no round exists" cases.

## Smaller points (fix when convenient, not blocking)

1. **se-su: say it as plainly as Uppsala does.** SU is in the same position as UU: no 2027 occasion of either kind is published (SIFPK shows autumn 2026 only). But SU's April date reads "the round for May 2027 IB candidates" with no "if a programme runs it". Note 0 buries the point in a sentence about 2026 criteria. Use UU's wording on the date and in the note.
2. **se-mau: the April-round label.** The dates say "April round opens (EU/EEA): the round for May 2027 IB candidates" with no qualifier. The fixer's own occasion data shows that for 2027 only Interaction Design has two occasions (MAU-72800, MAU-72950), while the other five have one each. For example, International Relations has MAU-71957, against MAU-61804 and MAU-61957 in 2026. At LTU, LiU and UmU, the single early-published occasion turned out to be the international one. Note 2 does say Malmö "has not yet said which programmes run in it", so the card is honest. But add "if a programme runs it" to the date, as for UU, and say that so far only Interaction Design shows a second 2027 occasion. (I could not read which round each code is either: universityadmissions.se search needs a browser.)
3. **se-lu `notes[0]`** says "Lund says its international bachelor's programmes open in both rounds". Lund's page says "**In general**, the international Bachelor's programmes open in both rounds". The Biomedicine and Economy and Society pages show one autumn-2027 occasion ("Will open for applications 16 October"), and their selection criteria mention "the later national admissions round". Keep "in general", or say "Lund says its international bachelor's usually open in both rounds".
4. **April-round results and reply dates are recorded with `who: any`** on GU, KTH, LU, SU, UU and Chalmers (9 July and 16 July). KI, MAU, SLU and UmU record the 16 July reply date as `eu-eea-ch`. This is the same issue as round-1 point 7, applied to two more dates. Make them consistent.
5. **The SSE "unlike most" wording is sourced after all.** SSE's international-applicant page says that applying with predicted grades is possible "while this is not the case with most other Swedish universities". The summary is fine as it now stands. But `progress.md` line 179 calls the se.json claim "unsourced". "Most other" is sourced; "the rest of Sweden" overstates it, because JU Direct also takes predicted grades.

## What I checked and found right

| Check | Scope | Result |
|---|---|---|
| UA rule | IB page, autumn-2027 calendar | "If you haven't yet completed your IB Diploma programme, do not apply to the first admissions round"; "second admissions round only if you're a citizen of an EU/EEA country". Round 1: 16 Oct – 15 Jan, 1 Feb, results 8 Apr. Round 2: 15 Mar – 15 Apr, 23 Apr, 21 June, "IB/EU upper secondary results deadline 5 July", 9 July, reply 16 July. All 14 records use these consistently |
| Dates, KI (8) | KI-D7000 / KI-D8000 | Right: "2027-01-15" and "2027-04-15"; first round 16 Oct – 15 Jan, documents 1 Feb; second round 15 Mar – 15 Apr, documents 21 June, "Extended IB deadline: 5 July 2027". Note 0 matches KI: "If you are an EU/EEA citizen in your final upper secondary school year you can apply to the Second admissions round" |
| Dates, KTH (8) | ICT page | Right: 16 Oct, 15 Jan, 1 Feb, 8 Apr; 15 Mar, 15 Apr, 23 Apr, 21 June, 5 July ("Extended deadline for EU/EEA, Swiss, IB/EB programme applicants"), 9 July, 16 July. "Students in the final year of upper secondary will not be able to submit a complete application in round 1" |
| Dates, SSE (8) | International-applicant page | Right: 16 Oct 2026; SAT 5 Dec, ACT 12 Dec, ITB-Business 14 Jan; 15 Jan; 1 Feb 2027; 8 Apr; reply 9 May. IB: "IB Score of 31", "Passed English B SL", "Passed Applications and interpretation SL", predicted grades accepted |
| Dates, GU (8) | Business and Economics S1EKA | Right: autumn 2027 "16 Oct 2026 – 15 Jan 2027" (GU-81000) and "15 Mar 2027 – 15 Apr 2027" (GU-81001). Note 0 is supported. The music and craft note (1) holds: Classical Music's 2027 occasion is January only (GU-53008), and its results arrive in April/May, before any IB results |
| Dates, JU (3) | How to apply, bachelor's | Right: "Application opens 16 October, 2026", deadline "2 May", documents "15 May". Final-year students "can only apply through the JU Direct Application" |
| Dates, SLU and UmU (spot) | Programme and key-dates pages | Right: SLU 2027-01-15 / 2027-04-15. UmU second round 15 March – 15 April 2027, 23 April, 16 July. UmU's own results date (6 April) is not on the card, and neither is Malmö's 10 July against UA's 9 July. That is correct: conflicting dates are left out |
| IB conversion, SLU Forest and Landscape | Ma 2a/2b/2c, Nk 2, Sh 1b, En 6 | Right. antagning.se: "Betyg 3 i Mathematics: applications and interpretation SL ger Matematik 2a" (so "any IB Maths, AI SL at grade 3 is enough"); Naturkunskap 2 = "Environmental Systems, SL eller två av ämnena Chemistry, Physics och Biology, SL/HL"; Samhällskunskap 1b = "IB-examen" ("The Diploma covers Civics 1b") |
| IB conversion, KTH ICT | Ma 4, Fy 2 | Right. Matematik 4 = "Mathematics: analysis and approaches SL" at 4, and "Betyg 3 i … AI HL och … AA HL ger Matematik 4"; Fysik 2 = "Physics SL/HL", grade 4, or "Betyg 3 … på Higher Level: … Physics" |
| Could not verify | UmU occasion blocks (Industrial Design wording, Life Science 13:00), which MAU 2027 code is which round, LTU Music's eligibility completion date | Pages rendered by script, or the search needs a browser. Not counted against the records |

## Summary

- Score: **8/10, accepted.**
- Errors: **1** (E1, UmU Industrial Design: the "prove general entry later" exception ends 21 June, before IB results come out). **0 wrong deadlines** (41 of 41 sampled). **5 smaller points.** All six round-1 errors (E1–E6) are verified fixed.
- Most important fix: **se-umu note 2**: give the 21 June 2027 date, and tell the IB candidate to check with UmU that results sent through the IB Result Service by 5 July will count.
