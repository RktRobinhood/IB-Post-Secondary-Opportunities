# School records, Austria (#43): admissions counsellor, round 1

Under review: the 15 records `data/schools/at-*.json` and the researcher's report
`docs/research/schools/reports/batch-at.md`. I checked them on 26 September 2026 against the institutions' own
pages and the ministry's ENIC NARIC sheet, "Zulassung zum Studium, Internationales Bakkalaureat, Anerkennung
(IB-Information)", which OeAD hosts and which I read with `pdftotext`. I used WebFetch and WebSearch, plus
`curl` to check programme URLs, redirects and the IMC fact boxes. I did not use a browser. Every page I
needed opened.

## Score: 8/10. Accepted, on condition that A1 and A2 are fixed before commit.

**No deadline is wrong.** I checked all 13 entries in `dates` (MCI, IMC, JKU, MODUL) and the dated notes in
11 records against their pages, and every one is right. The four MCI rounds for 2027/28 are right, as are
IMC's 1 Dec 2026 opening and 27 Nov Info Day, and every "for 2026 entry…" precedent (Uni Wien, WU, AAU, TU
Wien, MedAT, Webster, IMC).

Six dates come from pages that give no year: JKU's two and MODUL's four. Both pages are standing tables that
repeat every year. Every label says so ("standing date, no year given"), and JKU's 5 September is the
statutory end of Austria's general admission period. I would tell a student these dates as written, so they
pass. MODUL's labels should use plain words (smaller point 1).

Two things stop me repeating two records as they stand, and each is a one-line fix:

- **A1.** TU Graz's `ib` line turns "maths and a foreign language among your six subjects" into maths and a
  foreign language at HL.
- **A2.** JKU's hand-off now redirects to JKU's list of all ~100 programmes at every level.

## Errors

| # | Record | Field | What it says | What the official page says | Source |
|---|---|---|---|---|---|
| A1 | `at-tu-graz` | `ib.text` | "IB Diploma with 24+ points (not an IB Certificate), three subjects at HL, including a foreign language and maths." | "You have to have at least 24 points out of six subjects." "**One foreign language and mathematics need to be among the subjects.**" "3 of the 6 subjects need to have been passed in Higher Level (HL), the rest in Standard Level (SL)." Maths and a foreign language must be among the six subjects, and **any** three subjects may be HL. The record reads as HL Maths plus an HL language. | https://www.tugraz.at/en/studying-and-teaching/studying-at-tu-graz/prospective-students/registration-and-admission/admission-of-international-degree-programme-applicants/international-baccalaureate-ib |
| A2 | `at-jku` | `handoff.url` | `…/types-of-degree-programs/bachelors-and-diploma-degree-programs/` ("Bachelor's and diploma degree programs"; the report counted 27) | The URL now returns `307 Temporary Redirect` to `/en/degree-programs/academic-degree-programs/`: "Here you can find all bachelor's, diploma, master's, and doctoral degree programs as well as postgraduate programs" (~100 programmes, no English filter). That fails the bachelor's-only rule. | Checked with `curl -I` and WebFetch |

**Why A1 matters.** A student with Maths AA SL reads our line and crosses TU Graz off. The page admits them.
The brief says never to resolve a reading towards telling a student they can't. The damage is small, because
TU Graz also needs German C1, but it is a false rule on the page that exists to state the rules.

**Fixes.**
- **A1:** "IB Diploma with 24+ points (not an IB Certificate); maths and a foreign language among your six
  subjects; three subjects at HL. German C1 is required; German as Language A in the IB counts as proof."
- **A2:** Point the hand-off at the six English programmes. If JKU has no filtered list, use one programme's
  admission page, or the MyAdmission registration page already in `apply`. Say in the label that the page
  lists all degree levels only if no alternative exists (see AAU below).

## Smaller points (fix when convenient, not blocking)

1. **`at-modul` › date labels.** "(standing date)" is our jargon, and a 17-year-old will not read it as "the
   page gives no year". Use JKU's wording: "(MODUL's yearly date; the page gives no year)". Also, the Super
   Early Bird and Early Bird deadlines apply to every applicant group on the page, not only `eu-eea-ch`. Use
   `who: "any"` or add a second entry.
2. **National IB rule missing from six records.** AAU, JKU, Innsbruck, BOKU, TU Wien and Salzburg say "No IB
   rule is published". The ministry's IB-Information sheet says an IB Diploma counts as a foreign
   school-leaving certificate for "einer österreichischen öffentlichen Universität, Privathochschule,
   Fachhochschule beziehungsweise Pädagogischen Hochschule", and "Die Gleichwertigkeit mit einem
   österreichischen Reifezeugnis ist nicht zu überprüfen". That answers the student's first question with a
   yes, so say it: "Austria accepts the IB Diploma nationally without an equivalence check (ministry
   IB-Information); [institution] publishes no further IB rule." It belongs on `data/countries/at.json`
   too, whose `subjectLevelRule: None published` the researcher already flagged.
3. **Where the ministry and the universities disagree on German, say so.** The same sheet says: "Wenn der
   Gegenstand Deutsch (ausgenommen German ab initio SL) im IB Diploma aufscheint, ist diese Kenntnis damit
   nachgewiesen." The universities set a higher bar. Uni Wien says IB German counts only as A2 ("does not
   replace the proof… at level C1"). Uni Graz needs German at HL. WU needs German A HL 6, A SL 7 or B HL 7.
   The records rightly follow each university's own page, because the university admits you. Per the brief
   ("cite both, and say they disagree"), add to the country record that the ministry sheet is more generous,
   so a student with German B SL knows to ask.
4. **`at-uni-graz` › "no grade below 3".** The page says it, and the record quotes it. The ministry sheet
   cited as a source adds: "unter besonderen Umständen kann eine Note 2 in einem SL akzeptiert werden, wenn
   die anderen beiden SL-Unterrichtsgegenstände gemeinsam 7 Punkte haben". A student with a 2 at SL should
   not read Graz as closed. Add "(the ministry allows one SL grade 2 in some cases; ask Graz)".
5. **`at-tu-graz` › note 1** lists four programmes that need English proof, taken from the FAQ. The IB page
   lists five: it adds "Acoustics, Music, and Information Engineering". Use the longer list and cite both.
6. **`at-jku` and `at-webster-vienna` › summaries count programmes that are not yet approved.** JKU says "six
   English-taught bachelor's… and a new quantum degree", but Quantum Science "is supposed to start in autumn
   2027. Its establishment is subject to the approval by the JKU Senate." Webster says "six… law", but the
   LLB is "Pending AQ Austria and Higher Learning Commission approval". Both cards carry the caveat. The
   summaries, the first thing a student reads, state them as certain. Write "five… plus a quantum degree
   planned for 2027", and likewise for Webster.
7. **`at-mci` › Entrepreneurship, Tourism & Leisure Business `credential`.** The record says "Bachelor of
   Arts in Business". The page says: "Bachelor of Arts in Social Sciences, in short BA or B.A." Business &
   Management and Business Administration Online are "Bachelor of Arts in Business" (right).
8. **`at-webster-vienna` › Computer Science `ib`.** "e.g. IB Maths HL at 5". The page says "IB Mathematics HL
   requires a score of 5; IB Mathematics SL requires a 6". Name both, so an SL student doesn't count
   themselves out. The 4-year durations for Psychology and CS/AI are still by analogy; neither page states
   one.
9. **`at-modul` › `ib`.** "IB Certificates need a foundation semester". The page says "completion of the
   one-semester Foundation Program plus an entrance exam". Add the exam.
10. **`at-imc-krems` › note 2.** "for 2026 entry every bachelor's closed on 15 April 2026, for EU and non-EU
    applicants alike". The deadlines page says EU citizens may get "extended application deadlines for
    selected degree programmes" once the regular one passes. Drop "every", or add "(EU applicants sometimes
    get an extension)".
11. **`at-aau` › hand-off.** The page lists 6 bachelor's but also 11 master's and 4 doctoral programmes. The
    researcher says so, and AAU has no bachelor's-only English list. This is an acceptable compromise, but
    the label should say "(bachelor's listed first)".

## What I checked and found right

| Check | Scope | Result |
|---|---|---|
| Dates in `dates` | All 13: MCI 5, IMC 2, JKU 2, MODUL 4 | **All right.** MCI: "Application Deadlines 2027/2028 Date 1: November 8, 2026 · Date 2: February 7, 2027 · Date 3: April 11, 2027 · Date 4: May 30, 2027"; info sessions "October 20 & 21, 2026"; each round has its own interview window, e.g. 23–25 Nov 2026 for round 1. IMC: "Application for the next study year possible from 01/12/2026"; "Info Event 27.11.2026 · IMC Info Day". JKU, no year: EU/EEA general admission "early July" to "September 5"; non-EU "To begin studies in winter semester… February 6 – March 31". MODUL, no year: Fall Super Early Bird January 15, Early Bird March 15, EU/EEA final August 15, visa final April 1 |
| Dated notes ("for 2026 entry…", "not yet published") | Uni Wien, WU, AAU, TU Wien, MedUni Wien, Webster, IMC, BOKU, Uni Graz, TU Graz, Innsbruck | **All right**, and none presented as 2027. Uni Wien MFDS "2 March to 4 May 2026", test "15 July 2026", nothing for 2027/28. WU "March 2 through May 19, 2026", exam "June 30, 2026", 240 places, "Details on the 2027/28 selection procedure will become available in mid-November", no deferral. AAU IBE "12 January 2026 to 23 February 2026", exam "22 April 2026", 50 places. TU Wien "April 1 to May 4, 2026", tests 10 July (Architecture, Spatial Planning) and 13 July (Informatics). MedAT "02.03.2026 bis 31.03.2026" on medizinstudieren.at; 2027 not published there (aggregators say "voraussichtlich" only, so leaving it out is right). Webster 2026-27 "Non-EU/EEA: March 31, 2026 · EU/EEA/Austria: July 31, 2026". IMC "15/04/2026" for EU and non-EU on the programme page |
| `ib` lines and Austria's HL conditions | All 15 institution lines; all programme lines at Uni Wien, WU, JKU, MODUL, Webster, AAU | Right apart from A1. Uni Wien: "minimum of 24 points (an admission with an IB Certificate is not possible)", "a foreign language (also possibly German)" and "mathematics", "at least three subjects… 'Higher Level'"; IB German "at level A2… does not replace… C1"; GIB counts as C1; Switzerland in u:space. Uni Graz, word for word: three HL "total score of at least 12", "at least 24", "No less than 3 points", subject groups, German HL suffices. MODUL: 24 points; AA or AI SL 4 / HL 3. JKU English: B2 "Language A with a minimum grade of 4 or Language B with a minimum grade of 5 (HL) or 6 (SL)", C1 "A… 6 or B… 7 (HL)"; IBA "English (Level C1)", second language "entry level B1", semester abroad compulsory. Webster: English "HL English A: 4; HL English B: 5; SL English A: 5; SL English B: 6", GPA 2.5/4. WU BBE: English B2 via a school-leaving English pass, and so on. MFDS: English only, 50% pass mark, test in English |
| German-language rules (`none` records) | TU Wien, TU Graz, Uni Graz, Innsbruck, Salzburg, BOKU, MedUni Wien | Each record has `language: German` and a way in. TU Wien: "All bachelor programmes offered at TU Wien are taught in German"; A2 to apply, C1 for admission, supplementary exam. Innsbruck: A2 to apply, B2 at admission. Salzburg: B2, or A2 plus VPLUS. BOKU: C1. MedUni: C1, preparation route, Latin supplementary exam. Uni Graz: German HL, else C1 |
| Programme completeness | AAU (6), MCI (3), IMC (8), Webster (6), Uni Wien (1), JKU (6) | Complete, and nothing extra. AAU's English page lists exactly the six. MCI's own bachelor page, under "English… held entirely in English", lists Business Administration (Online), Business & Management (FT) and Entrepreneurship, Tourism & Leisure Business (FT). "Business & Management for Professionals" is German, so it is rightly excluded. IMC Sustainability Management: "It is currently not possible to apply", so it is rightly excluded. Webster's undergraduate page lists six. Uni Wien: one "taught completely in English"; Economics, Physics and ILS require German, so they are rightly excluded. JKU Quantum and Webster LLB carry their approval caveat on the card (see smaller point 6) |
| Programme URLs | All 38 | All return 200 and open the named programme. AAU's "Worlds of English" URL redirects to `bachelor-worlds-of-english` and opens it |
| Credentials | All 38 | Standard or full titles, none invented, except smaller point 7. IMC and MCI use the page's full titles ("Bachelor of Science in Engineering", "Bachelor of Arts in Business"); MODUL BSc/BA/BBA as titled; JKU's Biological Chemistry double degree is described, not abbreviated |
| Summaries | All 15 | All 150 characters or fewer (two at exactly 150). "all" at Salzburg, TU Wien and Uni Graz quotes each university ("The language of instruction for all bachelor's degree programmes is German"; "All bachelor programmes offered at TU Wien are taught in German"; "all of the Bachelor's/Diploma courses are"). No ranking or superlative |
| Hand-offs | All 15 | Bachelor's-only or bachelor's admission pages, except A2 and AAU (smaller point 11) |
| Fee status | All notes | No country fee-status sentences. MODUL's early-application discount and Webster's €1,000 deposit are particular to those schools |

## For the brief (carry to the next countries)

- **"Among the subjects" is not "at HL".** When a page lists required subjects and an HL count in separate
  sentences, keep them separate in `ib`.
- **Re-check each hand-off's HTTP status just before commit.** JKU's was a 307 to an all-levels page on the
  day of review, and the report counted 27 programmes. A temporary redirect can change the answer between
  research and commit.

## Summary

- Score: **8/10, accepted** on condition that A1 and A2 are fixed before commit (one line each; no further
  round needed).
- Errors: **0 wrong deadlines**, **1 misread subject rule** (A1, TU Graz HL), **1 hand-off** that now lists
  every level (A2, JKU), plus 11 smaller points.
- Most important fix: **A1**. TU Graz does not require HL Maths or an HL language, and the record says it
  does.
