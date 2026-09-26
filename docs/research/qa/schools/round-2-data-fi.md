# School records, Finland (#43): admissions counsellor, round 2

Under review: the 14 records `data/schools/fi-*.json` as they stand after the round-1 fixes, and the two Finland sections of `docs/research/schools/progress.md`. I checked them on 26 September 2026 against the institutions' own pages and Studyinfo's public data (`opintopolku.fi/konfo-backend/toteutus|hakukohde|haku/<oid>`), using WebFetch and WebSearch only. I did not use a browser.

## Score: 8/10. Accepted, on condition that N1 and N2 are fixed before commit.

**No wrong deadline.** I re-checked 65 of the 72 date entries against their sources, and every one is right, including times. All 15 round-1 errors are fixed, and each fix matches the official page, not just the researcher's report. The two new problems below are omissions, not false statements. Each is a one-line fix and does not need another round of review. Until they are fixed, though, two programmes' cards leave out something a student must do or could use:

- **N1.** Metropolia's own programme pages give IB holders a certificate-based quota. The record says selection is by the UAS Exam only.
- **N2.** Haaga-Helia's Sports Coaching card leaves out a compulsory advance assignment, due with the application on 21 January.

I would repeat everything else to a student.

## Round-1 errors: all fixed

| Round 1 | Now in the record | Checked against | Verdict |
|---|---|---|---|
| E1 Haaga-Helia rolling "needs SAT" | Note 1: "the IB route needs 28 points, CAS, and an English IB or English at 4; predicted grades count" | haaga-helia.fi rolling certificate-based page: "A minimum of 28 total points…", "4 or higher in English A HL/SL or English B HL/SL", CAS, predicted grades for spring 2027 | Fixed |
| E2 Haaga-Helia "every place" | `ib`: "most places… Sports Coaching and blended International Business use entrance exams". International Business `ib` names the Pasila exam, 8–11 or 15–18 March 2027 | haaga-helia.fi/en/apply/joint-application, word for word | Fixed |
| E3 Laurea Social Services hides Finnish | "Requires Finnish at B1 and English at B2" | laurea.fi Social Services: "basic Finnish skills (level B1) and English skills (level B2)" | Fixed |
| E4 LUT "every bachelor's in English" | "15 English bachelor's with published IB criteria" | LUT IB page and rolling page | Fixed |
| E5 Turku "second-largest" | No ranking | n/a | Fixed |
| E6 Laurea methods as 2027 fact | "as listed on Studyinfo; 2027 criteria not yet published" | Studyinfo hakukohde `…99021` (International UAS entrance exam, `julkinen:false`); `…99056` Social Services: "Entrance exam… Information for spring 2027 to be announced" | Fixed |
| E7 Metropolia cities | IT in Espoo; Electronics, Mechanical, Robotics, Smart Automation, Laboratory Science in Vantaa | Studyinfo toteutus `…1427` (Karamalmi, Espoo); Metropolia pages for Mechanical and Laboratory Science (Myyrmäki, Vantaa) | Fixed (see smaller point 3) |
| E8 Oulu IBM | 10 January places on certificates; 20 separate SAT/ACT rolling places | oulu.fi IBM page: "20 in Rolling Admissions", "10 in Joint Application"; rolling 1 Oct 2026 08:00 – 25 Feb 2027 15:00 | Fixed (see smaller point 4) |
| E9 Åbo Danish-route inference | "The Danish route needs Dansk A on a Danish upper-secondary degree; for the IB, only Swedish A or B counts." | abo.fi Swedish language requirements | Fixed: now says only what the page says |
| E10 Helsinki "central" | "Science at Kumpula and Liberal Arts across three campuses" | Studyinfo toteutus `…39770` | Fixed |
| E11 UEF HPH 10 places | Labelled draft: 5 of 10 certificate places for spring-2027 graduates, no waiting list | Studyinfo hakukohde `…95448`: 30 places, criteria `julkinen:false` | Fixed as a labelled draft. I could not see the draft split myself. |
| E12 Arcada maths in Finnish grades | "grade 2 in AA (SL or HL) or AI HL, or grade 4 in AI SL" | Arcada IT/MSE pages ("A in advanced math or C in basic math") × uasinfo.fi ("IB 7 = L… 4 = C… 2 = A"; AA SL/HL and AI HL advanced, AI SL basic) | Fixed, and the conversion is right |
| E13 LUT AA SL conflict | Every engineering `ib` flags that the page also lists AA SL and Maths SL | LUT IB page: table "Higher 4"; acceptable maths list includes "analysis and approaches HL/SL… mathematics HL/SL" | Fixed |
| E14 JYU "strongest" | Removed | n/a | Fixed |
| E15 Metropolia `ib.url` and flags | `ib.url` is a Metropolia page; 3D Game Art "Offered in English for the first time in 2027" | Metropolia 3D Game Art: "for the first time this programme is available also in English!"; Game Design "brand new"; pre-assignment "by 21 January 2027 3:00 p.m." | Fixed |

The round-1 gaps are closed too. IB document dates have been added for TAMK (Studyinfo hakukohde `…92833`: predicted grades "by 1 April 2027 at 3 pm", final certificates "by 13 July 2027 at 3 pm") and for Haaga-Helia (Sports hakukohde `…98048`, labelled honestly as stated only there; I confirmed the International Business hakukohde `…97734` does not state them). Laurea, Metropolia and Helsinki now carry a note that their IB dates are unpublished. Helsinki's is right: "The application instructions and admission criteria will be updated by the end of October 2026". The 28 January attachment deadline has been added for Laurea, UEF and Haaga-Helia.

## New errors

### Material: would mislead a student

**N1. `fi-metropolia` › `ib.text` (and the programme cards for the programmes below)**
- The record says: "On Studyinfo the 18 programmes outside culture list the International UAS Exam… Full 2027 criteria are not yet published." No programme card mentions any other route, so a student reads Metropolia as exam-only for the IB.
- Metropolia's own pages for International Business and Analytics, International Business and Logistics, Social Services and Construction Site Management say: "Those applying with a matriculation examination (Finnish or EB, IB and RP/DIA diploma) or vocational upper secondary qualification have a specific study place quota which varies between study programmes available for application." Applied Gerontology's page lists "the International UAS Exam and certificate-based selection" for the joint application.
- Other pages do not have this sentence: Nursing, Mechanical Engineering, Physiotherapy and Civil Engineering. There the UAS Exam reading stands.
- URLs: https://www.metropolia.fi/en/study-at-metropolia/bachelors-degrees/international-business-and-analytics · …/international-business-and-logistics · …/social-services · …/construction-site-management · …/applied-gerontology
- Why it matters: the record under-sells Metropolia to IB students on exactly the point they care about, whether their grades count. Studyinfo lists the UAS Exam as a *valintakoe* (exam), and a certificate quota never shows up as an exam there. That is why the Studyinfo reading missed it.
- Fix: in `ib.text`, say that some programmes also keep a certificate-based quota for IB holders, with the size not yet published. On those five programmes, add "UAS Exam, plus a certificate-based quota for IB holders (size not yet published)."

**N2. `fi-haaga-helia` › `programmes[Sports Coaching and Management].ib`**
- The record says: "Joint application only, with an online entrance exam on 22–25 March 2027."
- The page says: "Advance assignment will be published on Haaga-Helia website on 7 January 2027." "Attach your Advance assignment to your application by 21 January 2027 15:00 Finnish time." "The online interview will be held from 22 to 25 March 2027."
- URL: https://www.haaga-helia.fi/en/bachelor/degree-programme-sports-coaching-and-management
- Why it matters: this is a compulsory submission due on the day applications close. A student who plans from our card would miss it. (The joint-application page calls the March stage an "online entrance exam", the programme page calls it an "online interview", so either word is defensible.)
- Fix: "Joint application only: advance assignment (published 7 Jan) due with your application by 21 Jan 2027, 15:00; online entrance interview 22–25 March."

## Smaller points (fix when convenient, not blocking)

1. **`fi-tamk` › `dates`: no UAS Exam pre-identification date.** Laurea and Metropolia both record "pre-identification closes 12 Mar 2027, 15:00" (uasinfo.fi: "from 10 March 2027 at 8:00… to 12 March 2027 at 15:00"). TAMK sends five of its nine programmes through the exam and records only the exam date. A student who skips pre-identification cannot sit the exam. The record is at the schema's 8-date limit, so add a sentence to the Rolling/UAS `ib` lines or swap out the "Joint application opens" row. Also, `progress.md` says the 14 April results date was added for TAMK. It wasn't.
2. **`fi-utu` › ICT `ib`**: "advanced maths at a grade comparable to C in the Finnish exam" is still a local grade (round-1 systemic point 6). On the national conversion table (IB 4 = C), it is "grade 4 in AA SL/HL or AI HL". The 40% certificate share, which round 1 could not verify, is right: utu.fi ICT gives "Admission group I (60 %)" to SAT, which leaves 40% on certificates.
3. **`fi-metropolia` › Information Technology `city`**: the programme page says "For the time being, IT studies are held at Metropolia's Karamalmi and Myllypuro campus" (Myllypuro is in Helsinki). It says the reorganisation may move them to "Karamalmi and Myyrmäki". Studyinfo says Karamalmi, Espoo. "Espoo" is defensible; "Espoo (and Helsinki for now)" would be exact.
4. **`fi-uoulu` › IBM**: the Oulu page says "10 in Joint Application", but Studyinfo hakukohde `…92985` gives 13 starting places (round 1 read the draft as 10 certificate plus 3 Talousguru). "10 places on certificates such as the IB" is the useful and correct fact. "Just 10 places in the January round" should read "10 of the 13 January places".
5. **`fi-tamk` › engineering `ib`, "English 5, HL Maths 5"**: I could not find these thresholds on any cited page. The Software, Textile and Environmental Engineering pages and the how-to-apply page (as fetched) say only "grades achieved in the previous education"; the eligibility sections are collapsed. Add the page that states them to `sources`, or quote the sentence in `progress.md`.
6. **`fi-metropolia` › `ib.url`** points to the Information Technology page, which is not a page about the institution-wide rule. When N1 is fixed, the joint-application page or one of the certificate-quota pages would fit better.

## What I checked and found right

| Check | Scope | Result |
|---|---|---|
| Dates | 65 of 72 entries confirmed. Re-fetched: Aalto 6, Arcada 6, JYU 5, Oulu 5, TAMK 8, Haaga-Helia 8, LUT 3, Helsinki 2, Turku 4, Åbo 2, Laurea 6, Metropolia 6. Tampere 4 of 6: window, attachments, 31 May results and 13 July accept | **All correct.** Examples: Aalto 7 Jan 08:00 – 22 Jan 15:00, ID 29 Jan, predicted 1 Apr 15:00, round B results 28 May, final/accept 13 Jul 15:00. LUT haku `…33128` 2026-09-01T08:00 – 2027-04-30T23:59; final documents 31 Aug 23:59. Haaga-Helia rolling 30 Oct – 12 May 15:00, documents 19 May 15:00. Oulu predicted 1 Apr, final/confirm 13 Jul. JYU interviews 17–24 Mar, ISE&AI test 10–11 Feb, certificate results 28 May. TAMK rolling 15 Nov – 28 Feb 15:00. UAS Exam 23 Mar 12:00, results by 14 Apr. Turku 15 Aug. Helsinki group 2 9–23 Mar 15:00. Åbo 9–23 Mar 15:00 |
| Could not verify | Tampere's 1 April predicted-grades date (not in the fetched text of the application-documents page, whose sections are collapsed); UEF's two IB dates and 8 programme pages (uef.fi returns 403) | Not counted against the records. UEF's window (7–21 Jan) and 28 Jan 15:00 attachments are confirmed on Studyinfo `…33254`/`…95448`. The UEF source sentences are now in `progress.md`, as round 1 asked |
| Local-language rules | Every programme where Finnish could plausibly be required: Laurea Nursing and Social Services; TAMK Bilingual Nursing, ECEC and Business in Finland; Metropolia Nursing, Social Services, Applied Gerontology and Physiotherapy; JYU Early Childhood Education | Correct everywhere. Laurea requires B1 and says so. TAMK: "No prior knowledge of Finnish is required", "There is no prerequisite for proficiency in the Finnish language". Metropolia Nursing, Social Services, Gerontology and Physiotherapy need no Finnish at application. JYU ECE requires English only (Finnish is built into the degree) |
| `ib` lines | All 14 institution lines; about 45 programme lines | Right apart from N1, N2 and smaller points 2 and 5. Spot confirmations: Aalto maths 6 for engineering, "advanced mathematics with at least grade 6 or physics with at least grade 6" for Quantum, Economics and Finance "advanced… grade 2 or basic… grade 4", IB "basic or advanced mathematics with at least grade 2", SAT 1200 / ACT 25 optional, "not required to submit a language test result", TBD preliminary assignment "published 17 December 2026", max three options. Arcada 60 points, 25/20, 12/9, 8/6 places. LUT 24 points plus the full science table (CS&AI "Physics required", Chemical "Chemistry required", the rest "Chemistry or physics"). Helsinki English A ≥ 2 / A2 ≥ 5. JYU "no waivers". Turku 30% SSE. Tampere group II, both groups allowed with SAT/ACT. Oulu "in Finland or abroad", no SAT |
| Summaries | All 14 | All ≤ 150 characters (longest 150, UEF). No unsourced superlative or ranking. The "All bachelor's…" claims at Åbo quote the university's own statement |
| Credentials | All 101 | No invented abbreviations. The degree titles match the institutions' or Studyinfo's English titles (e.g. Metropolia "Bachelor of Laboratory Services", "Bachelor of Social Services and Health Care"; TAMK ECEC "Bachelor of Social Services"; JYU "Bachelor of Arts in Education") |
| Programme lists and URLs | Aalto's 11 against haku `…93702` (all 11 hakukohteet match); Tampere's 11 against its list page; Metropolia's culture, health and engineering pages; Haaga-Helia's six | Complete. The Aalto "Mechanical and Civil Engineering" URL has a `computational-engineering` slug but opens the right page (H1 "Mechanical and Civil Engineering…"). Every URL I opened is that programme's own page |
| Notes | All 40 | True as written. Examples: LUT "first place you confirm… is final" (page: "you will be no longer able to confirm yet another place… in Finland"); Helsinki's group 1 is only for applicants without an IB/EB/matriculation/RP by summer 2027, "separate from the Finnish national joint application"; Metropolia's separate application is for "GMAT/GRE test, SAT/ACT test, the Edunation Pathway Diploma…", not the IB; Arcada's separate application "30 October 2026–19 April 2027" takes ACT/OMPT/SAT |

## For the brief (carry to the next countries)

- **A national portal's exam list is not the whole selection method.** Studyinfo shows *valintakokeet* (exams). Certificate quotas appear only in the published criteria. Until those are public, a programme can look exam-only when its own page says otherwise (N1). The rule: when the portal's criteria are unpublished, read the programme page's selection section before writing `ib`.
- **Record every submission a programme demands with the application** (portfolio, advance or pre-assignment, motivation letter, video), with its deadline, in the programme `ib`. The brief asks for exams and auditions but not for these, and N2 is exactly this case.

## Summary

- Score: **8/10, accepted**, on condition that N1 and N2 are fixed before commit (one line each; no further round needed).
- Errors: **2 new material omissions** (N1 Metropolia, N2 Haaga-Helia Sports Coaching) and **0 wrong deadlines**. All 15 round-1 errors are fixed, plus 6 smaller points.
- Most important fix: **N1**. Metropolia's own pages give IB holders a certificate-based quota in at least five programmes, and the record presents Metropolia as UAS Exam only.
