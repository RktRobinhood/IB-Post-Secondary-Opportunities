# School records, Switzerland (#43): admissions counsellor, round 1

Under review: the 15 records `data/schools/ch-*.json` and `docs/research/schools/reports/batch-ch.md`.
I checked them on 26 September 2026 against the institutions' own pages, their admission PDFs and
swissuniversities' IB page, using WebFetch and WebSearch only. I did not use a browser.

Pages I could not open:
- **uzh.ch** still returns HTTP 502 to every request (deadlines, bachelor admission, language
  requirements). web.archive.org is blocked to my fetcher. The only live evidence I have is uzh.ch's
  own search snippet for the deadlines page.
- **unisg.ch** pages load their text by script, so WebFetch sees only the navigation. I used the HSG
  IB guideline PDF and unisg.ch search snippets instead.
- **unibas.ch**: the IB and deadlines pages returned only navigation. I used the search snippet for
  the IB page.

None of this is counted against the records.

## Score: 8/10. Accepted, on condition that E1 is fixed before commit.

**No wrong deadline.** I confirmed 31 of the 36 date entries in 10 records against the official
page, including the years and times. Every one is right.

- The records avoid the classic Swiss traps. None of them tells an IB student they have until 31 July at
  UZH, which is for Swiss certificates only. Fribourg's opening date, which the university says can move,
  is left out. Year-labelled 2026 dates at Basel, Bern and UNIGE are kept as labelled notes, not dates.
- One gap would make me correct the card in a meeting (E1). Five `ib` lines say "six subjects in the
  swissuniversities pattern" but do not say that Psychology, ESS, Visual Arts, Global Politics and similar
  subjects do not count. At a school in Denmark, many IB students take one of these as their sixth subject.
  The UNIGE, UNIL and HSG records already say so. The other five need one clause each, and no further
  round of review.

## Errors

| # | Record | Field | What it says | What the official page says | Source |
|---|---|---|---|---|---|
| E1 | `ch-uzh`, `ch-unibe`, `ch-unifr`, `ch-unilu`, `ch-usi` | `ib.text` | e.g. UZH: "32/42 (2026/27), six subjects, three at HL including maths or a science." Bern and Lucerne: "six subjects in the swissuniversities pattern / general curriculum". No excluded subjects are named. | swissuniversities (2026/27) lists six categories and the only recognised subjects: "All languages; Economics or business management; Geography; History; Philosophy; Biology; Chemistry; Physics; Mathematics: applications and interpretation … analysis and approaches …; Computer science". Computer science and philosophy "can only be chosen as a sixth subject". Bern's PDF (5.8.1) and Lucerne's guidelines (§ 21) tie the IB to their general-subject lists (5.4.2 and § 19). HSG's guideline names what falls outside: "Environmental Systems and Societies … Global Politics … Psychology, Visual Arts, Music oder Theatre werden nicht als allgemein bildende Fächer anerkannt". | https://www.swissuniversities.ch/en/themen/zulassung/zulassung-universitaere-hochschulen/international-baccalaureate · https://www.unibe.ch/unibe/portal/content/e1006/e15237/e1466586/Zulassungbedingungen_e_26-27_eng.pdf · https://www.unilu.ch/fileadmin/universitaet/dienste/sd/dok/Admission_Guidelines_for_the_Academic_Year_2026_2027.pdf |

Why E1 matters: a student with HL Psychology or SL ESS reads these five cards as "met" and is not
eligible. The fix is one clause on each card: "one subject from each group: two languages, maths, a
science, a humanity (history, geography, economics or business) and a sixth from those groups, CS or
philosophy; Psychology, ESS, Visual Arts, Global Politics and other arts don't count." Shorten to fit
220 characters, for example "Psychology, ESS and the arts don't count." Leave Basel alone. Its own
page lets Psychology or Music be the sixth subject, and the record already says so.

## Smaller points (fix when convenient, not blocking)

1. **"standing date" is our jargon, not a student's.** Seven records put "(standing date)" or "(UZH's
   standing date)" in the label. A 17-year-old will not know what it means. Use "(same date every year;
   2027 not confirmed)" or similar. I judged each standing date against the brief's "don't guess from
   2026". None needs to be dropped. See the table under "What I checked" for the reason in each case.
2. **`ch-hsg` note 3.** The record says "only once per academic year, and not in the year before
   your programme starts". unisg.ch's own snippet says the test "can only be taken once for the chosen
   academic year" and you may "participate in the selection procedure once again next year at the
   earliest". The second clause of the note could be read as forbidding the February 2027 sitting for a
   September 2027 start. Say instead: "You sit it for one intake only; you can't sit it a year early,
   and a retake is possible the following year at the earliest." The exact sentence was not readable to
   me, so quote it in the report.
3. **`ch-hsg` › `ib.text`**: "must pass HSG's online test and video interview". unisg.ch describes
   the interview as depending on the test: "Depending on your test results, you will either be admitted
   to the university directly or required to submit an additional video interview". Say "online test,
   and a video interview if the test calls for it."
4. **`ch-eu-business-school` › `ib.text`, "TOEFL 79"**: the pages disagree. The Business Finance
   programme page says "TOEFL: 79+". The admissions page says "TOEFL score 80/4 (as of Jan 2026)". Per
   the brief, name both, or use 80, the stricter and newer figure.
5. **`ch-uzh`**: all three dates and the German exemption rule come from Internet Archive snapshots
   (the latest is 18 Sep 2026). uzh.ch's own search snippet confirms "the deadline is April 30" and the
   28 February advice for visa applicants. Before publishing, re-open uzh.ch in a browser once it is
   back, and confirm the 1 January opening, which I could not see. Also, `ib.url` points to the language
   page, but the text leads with the IB rule. The bachelor admission page fits better.
6. **`ch-franklin` summary**: "Small" is unsourced. It isn't on the banned list, but it's the kind of
   adjective the brief warns about. Say "US-style liberal arts university in Lugano…".
7. **`ch-hsg` test dates.** I could not open the page text for the four February and June 2027 test
   and interview dates (16, 18 Feb; 8, 10 Jun). They are consistent in every way I could check:
   - each is the weekday the report quotes (Tue, Thu, Tue, Thu in 2027);
   - they fall in calendar weeks 7 and 23, which unisg.ch names as the two sittings;
   - a search for the exact phrase "16 February 2027" returns the HSG selection-procedure page.
   Not counted either way.
8. **`ch-epfl` note 3** ("attest your level when you apply, by 30 April"). The how-to-apply page gives no
   separate date for the French certificate. EPFL's search text says the certificate is uploaded with the
   application form, which "must be validated and paid for on April 30th at the latest". So the note is
   right, but the page to cite is the how-to-apply page, and it is already in `sources`.

## What I checked and found right

| Check | Scope | Result |
|---|---|---|
| Dates with a year on the page | ETH 4, USI 2, EHL 2 | **All correct.** ETH table JSON: "Application period 01.12.2026 - 31.03.2027", German certificate "until 31.03.2027 at the latest", school-leaving certificate "immediately upon receipt, until 31.08.2027 at the latest". The language page adds "fixed and non-negotiable", and school certificates "(even Level C 2)" are "not accepted in place of a language certificate". USI Informatics: "30 April 2027 for international (non-EU/EFTA) candidates", "30 June 2027 for Swiss and European (EU/EFTA) candidates who do not require a visa". EHL: "31st May 2027 (VISA deadline)", "15th June 2027 (Final deadline)", CHF 220 |
| Standing dates (no year on the page) | EPFL 3, UNIL 2, Fribourg 3, Lucerne 4, Franklin 5, HSG 4 of 8, UZH 2 of 3 | **All correct as dates.** EPFL: "validated and paid for on April 30th", "July 10 at the latest (September 30 exceptionally…)", final proof "no later than September 30th". UNIL Directive 3.2, art. 15 (updated 02.12.2025): "30 avril … ni soumises à l'ECUS ni … visa"; "28 février … devant obtenir un visa". Fribourg: "1 February - 30 April", "1 Mai - 31 August", visa "1 February - 28 February". The late window is open to foreign certificates for applicants who "Do not need a visa" and do not sit ECUS, so `who: eu-eea-ch` is right. Lucerne: page "15 February", "April 30", "June 30 … WITH visa", "August 31 … WITHOUT", CHF 150 surcharge, all matching guidelines § 1. Franklin: EA "December 1", decision "by January 15", visa "May 1", non-visa "July 15", deposit "May 15". HSG: "1 October - 30 April" (unisg.ch snippet); predicted grades "fristgerecht bis zum 30. April" (IB guideline); "by 10 January … register by 31 January" (snippet) |
| Whether a standing date misleads | Each of the 7 records above | None does, so none needs dropping. **UNIL:** its enrolment page says autumn 2027/28 bachelor admission is already open, under a directive in force. **EPFL** says its criteria are "valid for the ongoing year", and the cycle about to open is autumn 2027. **HSG:** the IB guideline has been "Gültig … ab dem Herbstsemester 2020". **Fribourg** describes generic periods, and the one date it says can move (opening) is correctly left out. **Lucerne:** the same dates appear in its 2026/27 guidelines and on a yearless live page. The weakest evidence, but the 30 April/31 August pattern is the Swiss norm, and an opening date can't make a student miss anything. **Franklin:** the fall cycle has no year, which is usual for a US-style school. **UZH:** see smaller point 5. The line between these and Bern/Basel/UNIGE (left out) is right. Bern's PDF says "valid for the academic year 2026/2027 only", and Basel's and UNIGE's pages are headed 2026 |
| `ib` lines | All 15 | Right apart from E1. **ETH** matches the 2026/27 PDF exactly: "38 out of 42 points (without bonus points)"; HL "Mathematics: applications and interpretation or … analysis and approaches, b) physics or chemistry or biology, c) 1 language A"; three SL from a fixed list; "Otherwise: Reduced Entrance Examination ETHZ". **EPFL:** HL "mathematics, physics, and chemistry, biology, or computer science", "38 out of 42", maths and physics "at least 6", ranking by points, "B2 … required. Level C1 is highly recommended". **HSG** guideline: 32/42, six groups, HL maths or group-4 science, excluded list as quoted. **UNIGE:** three HL including a science, 32 points, Psychology, ESS, Global Politics and Visual Arts not recognised; French "B2", test "the Monday of the 36th week", narrow fail leads to the "Année propédeutique". **UNIL:** French exam "minimum B1". **Bern:** 32/42, "At least 3 subjects … Higher Level, of which at least 1 in Mathematics or another scientific subject"; German test "approximately three weeks before", registration "by July 31", "Enrollment will only take place after the German language test has been passed". **Lucerne** § 21 and § 33(2): certificate "does not need to be submitted with the application". **Basel** (search snippet of its IB page): "One of the subjects in IB/DP group 4 or 5 must have been taken at Higher Level". **Fribourg:** "B2", "half of the studies … and approximatively half of the final exams" in French or German. **EHL:** "minimum 28/42, priority to 30/42", 30 from September 2029, IB in English meets C1. **Webster:** 24/32, English waivers A HL 4 / B HL 5 / A SL 5 / B SL 6. **Franklin:** TOEFL 90, IELTS 6.5, DET 110 |
| Language rules (`none` scope) | ETH, EPFL, UZH, UNIGE, Basel, Bern, UNIL, Fribourg, Lucerne | Every one names the language and the level: German C1 (ETH, UZH, Bern, Lucerne), advised C1 (Basel, correctly "advises", not required), French B2 (EPFL, UNIGE), French B1 exam (UNIL), French or German B2 (Fribourg). ETH's rule that school certificates don't count is on the card. So is UZH's regional condition. So is Bern's route through its own German test |
| Excluded IB subjects | All 15 | Named at UNIGE, UNIL and HSG, and implied at ETH and EPFL by their fixed subject lists. Missing at UZH, Bern, Fribourg, Lucerne and USI (E1) |
| Programme completeness and URLs | HSG 3, USI 3, EHL 1, EU Business School 7 | **Complete.** USI "at a glance" lists 9 bachelor's. Only "Informatics and … Data Science are taught entirely in English", and Economics has "an English-language track". The Economics structure page confirms the degree can be taken "entirely in English (Bachelor in Economics)". EU Business School's Geneva campus page lists exactly the seven recorded. HSG: the English Assessment Year leads to Economics or International Affairs, and BWL can be studied mainly in English. Law and Law & Economics are in German, and the note says so. URLs opened: HSG BIA (title "Major in International Affairs (BIA)"), USI Data Science ("Bachelor of Science in Data Science", English, joint Informatics/Economics, the two streams as the note says), USI Informatics, USI Economics, EUBS BSc Business Finance (Geneva, 3 years, 240 ECTS, CHF 15,400/semester). All are the programme's own page |
| Credentials | 14 programmes | No invented abbreviations. HSG "BA" (the FAQ says Bachelor of Arts), USI Informatics and Data Science "BSc" (the degree is Bachelor of Science), USI Economics "BA" (USI's study plan is "Bachelor of Arts in Economics"), EHL "BSc" (Bachelor of Science HES-SO), EUBS BBA/BA/BSc as the campus page titles them |
| Fees | USI, EUBS | USI "CHF 10,000 a year (from 2027/28)" matches "a semester fee of CHF 5,000" for non-residents. EU/EEA nationality does not bring the CHF 2,000 rate, so the figure is the right one for our reader. No fee-status sentence appears in any school's notes |
| Summaries | All 15 | All ≤ 150 characters (longest 144, HSG). No "every", "all", "only", "largest", "oldest" or ranking. The report correctly declined ch.json's unsourced "oldest", "largest", "smallest and newest" and "world's best-known". EPFL's "capped at 3,000" is on EPFL's page. Basel's "founded in 1460" is a matter of record |
| Hand-offs | All 15 | Bachelor-only pages for ETH, EPFL, Basel, Bern, UNIL, Fribourg, HSG, USI, EHL, Franklin, Webster and EUBS (bachelor's list filtered by campus). UNIGE's and Lucerne's pages cover all levels. Neither university has a bachelor-only page, and both are the international-admission pages the brief allows for `none`. UZH not openable |
| Notes | All 40 | True as written apart from HSG note 3 (smaller point 2). Checked: EPFL "beginning of August", UNIL week 38 and Pharmacy "transfer to the University of Geneva is therefore compulsory", UNIL "No enrolment possible in bachelor programmes" in spring, Fribourg's no-late-application programmes and Medicine 15 February, Bern's 15 February for Medicine and aptitude test, EHL 30 points from 2029, Franklin's USD 1,000 reduction "depending on residency and enrollment type", Webster's provisional decisions on predicted grades and October/January starts, EUBS's three degrees and decisions "within one week". Fribourg's "apply for the autumn semester of the following year" sits under the ECUS heading, as the report says, and is rightly kept off the page |

## For the brief (carry to the next countries)

- **When a national body sets the IB subject rule, the excluded subjects are part of the rule.** "Six
  subjects in the X pattern" is not something a student can check against their own Diploma. Name the
  subjects that don't count, or at least the common ones (Psychology, ESS, the arts).
- **A standing date needs a student-readable label.** Keep dates that the institution repeats each year
  on a yearless page, but label them in words a student understands.

## Summary

- Score: **8/10, accepted** on condition that E1 is fixed before commit (one clause per record, no
  further round needed).
- Errors: **1 material omission (E1), across 5 records** (UZH, Bern, Fribourg, Lucerne and USI don't
  say that Psychology, ESS and the arts don't count). **0 wrong deadlines**: 31 of 36 dates confirmed in
  10 records. Plus 8 smaller points.
- Standing dates: none needs dropping. Relabel "(standing date)" in words a student understands. Re-check
  UZH live once uzh.ch is back.
- Most important fix: **E1**. Add the excluded IB subjects to the UZH, Bern, Fribourg, Lucerne and USI
  `ib` lines.
