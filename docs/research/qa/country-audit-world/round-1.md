# Country audit (world and Southern Europe, 15 destinations): critic round 1

Critic: **Admissions counsellor**, under `docs/QA_CRITIC_LOOP.md`. Date: 2026-09-24.
Scope: es, it, pt, gr, mt, us, ca, au, nz, ae, jp, kr, cn, hk, sg.

**What I did:**
- Read `docs/research/audit/<cc>.md` for the 15 codes, `round-0-editor.md`, and the European loop (rounds 1 to 5) for calibration.
- Ran `node src/build.mjs`, then reduced `dist/destinations/<cc>/index.html` to its visible text.
- Ran both guards.
- Ran the European research-log regex (rounds 2, 3 and 4 plus the round-4 editor terms), a wider one of my own, and the superlative list over that text.
- Read the US, SG, ES and NZ pages start to finish, and the calendars on CA, AU, KR and JP.
- Checked facts against the live official pages. I used WebFetch, used curl plus a text grep where the fetch summary was doubtful (UBC), and read CityU and NUS in the browser pane because they return nothing to a fetch.
- Ran git read-only. I edited nothing in `data/`, `src/` or `scripts/`.

## SCORE: 7 / 10: not yet

**The research is strong.**
- I checked 35 changed or consequential facts, covering all 15 destinations.
- **33 are confirmed.** One could only be confirmed from secondary sources (the Australian visa figures, because Home Affairs returns 403).
- **One claim is wrong**, and it is not a date or a fee. Spain says the PCE exams "fall inside the May IB exam session". They do not: the 2026 IB session ended on 20 May, and the PCE ran 25–29 May.
- Every deadline and fee I checked matches its official page, so **the cap of 6 does not apply**. That includes:
  - UBC's corrected document and transcript dates;
  - all of Toronto's rows;
  - the four US cost figures;
  - Tohoku Gateway College and the Sophia closures;
  - Yonsei UIC's English rule;
  - KAIST's two rounds;
  - CityU, NUS, NTU and HKU.

**What holds this at 7 is the class of fault that held Europe at 7 in rounds 3 and 4: card labels contradicting their own notes.** It shows up in three ways:

1. **19 cards say "Hard deadline. After this the door closes." but have no date.** Many are "Set by each institution" explanations. Four are *announcements*, for example "Zayed University confirms its undergraduate application dates", "Khalifa University publishes its Fall 2027 application timeline" and "Yonsei UIC 2nd Round opens".
   - The guard passes them because it only looks for "set by each" in the *label*.
   - Here the phrase comes from `dateState: "varies-by-institution"`, or the card is a `type: "open"` milestone.
2. **29 calendar cards on HK (13), SG (10), AE (3), CN (2) and CA (1) print "Applies to: non-eu".**
   - This is the route's internal `applicantGroup` code, rendered raw.
   - A Danish student reads it as "not me", on CUHK's, CityU's, PolyU's, NTU's and NUS's main deadlines. **That points a student the unsafe way.**
   - The HK route's own note says "EU status plays no part".
3. **One consequential card, UBC 15 November, is mislabelled.**
   - The label reads "the date for international applicants" and the audience line "international applicants".
   - The card's own note and UBC's page both say the date is only for International Scholars award applicants; everyone else has until 15 January.

A small number of ranking claims and research-log phrases remain as well (sections 4 and 5). None of them is serious by itself, but they are the kind the European loop had to take out one at a time.

## 1. Guards

- `node scripts/test-deadline-labels.mjs`: **ok**. 756 events read, and it reports every label agrees with its note. It misses the 19 cards in section 3a: its third rule tests `EXPLANATION_LABEL` against `e.label` only.
- `node scripts/test-page-budget.mjs`: **ok**. 35 Destination pages are inside the budget. The 15 pages run from mt 706 to ca 1,345 words in the default view.
- **The European research-log regex** (rounds 2, 3 and 4 plus the round-4 editor terms), run case-insensitively over the tag-stripped text of the 15 pages, finds **0** true hits.
- **My wider regex** (`page read|re-read|could not be|this profile|not established|not verified|this site|fetch|Cloudflare|403…`) finds about 40 matches.
  - Most are legitimate gap-marking: "…is set by that college and is not established here. Ask before you accept."
  - The residue is listed in section 5.

## 2. Sampled facts (35 facts, 15 destinations)

| # | Country | Claim on the page | Verdict | Evidence (URL, short quote) |
|---|---|---|---|---|
| 1 | CA | UBC: documents from high-school applicants outside Canada due 15 Mar 2027 (International Scholars applicants 31 Jan; ELAS 15 Feb) | CONFIRMED | you.ubc.ca/applying-ubc/dates-deadlines/ (curl): "March 15, 2027 … High school applicants from outside Canada: Deadline to submit required documents" |
| 2 | CA | UBC final transcript 25 Jul 2027 for out-of-country applicants; 30 Jun is for US applicants | CONFIRMED | same page: "July 25, 2027 … Out-of-country applicants (except US and A-Level applicants): Deadline to submit your final transcript" |
| 3 | CA | UBC: 15 Nov 2026 23:59 PST for International Scholars; general deadline 15 Jan 2027 23:59 PST | CONFIRMED (fact). **Country card mislabelled** (section 3c) | same page: "Deadline to apply to UBC and submit an award application if you're an international student and you wish to be considered for the UBC International Scholars Program awards" |
| 4 | CA | UBC application fee CAD 173.25 on a study permit | CONFIRMED | vancouver.calendar.ubc.ca/fees/application-and-administrative-fees: "Applicants who will be studying on a Study Permit … $173.25" |
| 5 | CA | Toronto 2027: early date 7 Nov; early documents 1 Dec; deadline 15 Jan; documents 1 Feb (15 Jan for Engineering and Music); MRS closes 1 Feb | CONFIRMED | future.utoronto.ca/deadlines: "Recommended early application date: November 7 … Early document submission date: December 1" |
| 6 | US | Harvard 2026-27: billed 91,634; total 95,134–100,134; insurance 4,954 | CONFIRMED | college.harvard.edu/financial-aid/how-aid-works/cost-attendance: "$91,634"; "$4,954" |
| 7 | US | Illinois international 2026-27: tuition and fees 42,248–53,078; total cost 62,146–72,976 | CONFIRMED | admissions.illinois.edu/tuition/: "$42,248–$53,078"; "$62,146–$72,976" |
| 8 | US | ASU international 2026-27: total 69,906 (base tuition 39,062) | CONFIRMED | admission.asu.edu/cost-aid/international: "Base tuition: $39,062 … $69,906" |
| 9 | US | UC 2027-28: tuition 16,278 resident / 57,300 nonresident; total 49,078 / 90,100 | CONFIRMED | admission.universityofcalifornia.edu/tuition-financial-aid/tuition-cost-of-attendance/: "$57,300"; "$90,100" |
| 10 | JP | Tohoku Gateway College, October 2027: apply 15 Dec–14 Jan; results 24 Mar; about 90 places; predicted IB accepted; TOEFL iBT 80 / IELTS 6.0 | CONFIRMED (the page prints no year) | admissions.tohoku.ac.jp/en/admissions/undergraduate/gateway_college/: "December 15-January 14"; "*Predicted scores are accepted" |
| 11 | JP | Tohoku FGL closed | CONFIRMED | insc.tohoku.ac.jp/english/degree/undergraduate-english/: "Admissions to the FGL Program undergraduate courses ended in 2026." |
| 12 | JP | Sophia Green Science and Green Engineering closed after autumn 2026; SPSF and DGTech remain | CONFIRMED | adm.sophia.ac.jp/eng/admissions/ug_p/en_ug/: "the Green Science and Green Engineering Programs are no longer accepting new applications" |
| 13 | JP | UTokyo College of Design: 15 Oct–5 Nov 2026 17:00 JST; expects 38/42 + 2; final results by 16 Aug 2027; a five-year combined bachelor's/master's | CONFIRMED | design.adm.u-tokyo.ac.jp/admissions/admissions-overview-2027/: "A total of 38 points out of 42"; "August 16, 2027" |
| 14 | JP | Keio PEARL: three periods closing 2 Dec 2026, 27 Jan and 7 Apr 2027 (15:00 JST); results 25 Jan / 4 Mar / 24 May; JPY 35,000 | CONFIRMED | keio.ac.jp/en/admissions/undergraduate/pearl/: "3:00 p.m. on April 7, 2027 (JST)"; "JPY 35,000 by credit card" |
| 15 | KR | Yonsei UIC: from the 2027 intake, English proof required; IB DP English A accepted, no minimum; MOI certificate accepted; English B not listed | CONFIRMED | uic.yonsei.ac.kr/admission.php?mid=m04_02_02: "From AY 2027 intake … IB DP English A: Language and Literature or English A: Literature" |
| 16 | KR | UIC fee KRW 150,000 (USD 150 via Common App); 2nd Round "March, 2027", interview and result June | CONFIRMED | same page: "2nd Round (TBD) … March, 2027 … June, 2027" |
| 17 | KR | KAIST Early (22 Sep–22 Oct 2026) leads to an end-February 2027 start; Regular 10 Nov 2026–14 Jan 2027 18:00 KST, results 25 Mar, start end of August 2027 | CONFIRMED on the route. **WRONG in `destinations/kr.json`** (section 3e) | admission.kaist.ac.kr/…/ApplicationTimeline: Early "Academic Year Begins: End of February, 2027" |
| 18 | AU | UAC AUD 82 early-bird to 23:59 30 Sep 2026, then AUD 215 to 5 Feb 2027 | CONFIRMED (uac.edu.au pages via search index; the international Year 12 page itself: "save $133 … Wednesday 30 September") | uac.edu.au/future-applicants/international-year-12-students |
| 19 | AU | Subclass 500: from AUD 2,500; AUD 29,710 living costs | UNSUPPORTED by me (Home Affairs returns 403). Consistent secondary sources agree, so not counted as wrong | immi.homeaffairs.gov.au/…/student-500 (not readable) |
| 20 | NZ | Auckland Semester Two 2027: international 8 Jun, domestic 4 Jul 2027; MBChB, Optometry, Pharmacy, Medical Imaging 1 Jul 2027 for 2028; no general Semester One 2028 date | CONFIRMED | auckland.ac.nz/…/how-to-apply/undergraduate-application-closing-dates.html |
| 21 | NZ | Fee Paying Student Visa: from NZD 850; NZD 20,000 a year; 25 h/week; 80% within 8 weeks; apply 3 months ahead; October–March busiest | CONFIRMED | immigration.govt.nz/visas/fee-paying-student-visa/: "From NZD $850"; "80% within 8 weeks" |
| 22 | ES | New: CEU San Pablo teaches Dentistry and Physiotherapy in English | CONFIRMED. A full English track: Dentistry is a five-year grado offered "in English or Spanish" | uspceu.com/en/students/schools/medicine/the-school: "the Degrees Dentistry and Physiotherapy are taught in English" |
| 23 | ES | "the ordinary PCE exams (25–29 May in 2026) fall inside the May IB exam session"; the calendar card is titled "…the window that collides with your IB exams" | **WRONG** | The IB May 2026 schedule runs "Friday 24 April 2026 to Wednesday 20 May 2026" (ibo.org exam-schedule PDF as indexed; ibo.org blocks a direct read behind a Cloudflare check). The PCE fell the following week. The dates are right; the collision is not. |
| 24 | IT | New: Cattolica has nine English-taught three-year bachelor's plus English Medicine in Rome and Bolzano; 2027/28 applications open in autumn 2026 | CONFIRMED (nine distinct titles; Business and Finance runs in Milan and Brescia) | international.unicatt.it/ucscinternational-undergraduate-programmes: "Applications for Academic Year 2027/2028 will open in Autumn 2026." |
| 25 | IT | Bocconi Early 2–29 Sep 2026, Winter 25 Nov 2026–26 Jan 2027, 15:00; no spring session | CONFIRMED | unibocconi.it/…/admissions: "There are two selection sessions available for the admission to the 2027-28 AY: Early and Winter" |
| 26 | HK | HKU: opens 23 Sep 2026; first round 25 Nov noon; grades and documents by 1 Dec 2026; closes 25 Aug 2027 noon | CONFIRMED | admissions.hku.hk/apply/international-qualifications: "By 1 Dec 2026 - Input predicted and/or actual grades" |
| 27 | HK | CityU: opens 24 Sep 2026; Early Round 15 Nov 2026; Main Round 15 Jan 2027 | CONFIRMED (browser pane) | cityu.edu.hk/admo/admissions/international-admissions: "15 Nov 2026 Early Round Application Deadline … 15 Jan 2027 Main Round Application Deadline" |
| 28 | SG | NTU IB window 15 Oct 2026–19 Mar 2027; documents 22 Mar; SGD 25; results within 3 days of July release | CONFIRMED | ntu.edu.sg/…/international-baccalaureate-diploma: "SGD25 for international applicants" |
| 29 | SG | NUS IB window 16 Dec 2026–17 Feb 2027; May 2027 candidates hear by 3rd week of July | CONFIRMED (browser pane) | nus.edu.sg/oam/admissions/important-dates: "IB Diploma Application Period 16 December 2026 to 17 February 2027" |
| 30 | AE | NYUAD 2026-27: tuition 68,574; direct costs 84,520; total 90,434 | CONFIRMED | nyuad.nyu.edu/en/apply/undergraduate/scholarships-and-financial-aid/cost-of-attendance.html |
| 31 | MT | UM application fee €35 for local qualifications (IB), €75 late; €100 / €200 overseas | CONFIRMED | um.edu.mt/study/feesfunding/: "EUR 35 until the first deadline" |
| 32 | PT | Católica Lisbon: €780/month EU, €858 non-EU; €180 application fee | CONFIRMED (curl) | clsbe.lisboa.ucp.pt/…/fees-and-scholarships: "Monthly tuition fee for Portuguese and European Union students: €780*" |
| 33 | CN | NYU Shanghai US$85; ED I 1 Nov, ED II 1 Jan, RD 5 Jan, 11:59 p.m. EST | CONFIRMED | shanghai.nyu.edu/undergraduate-admissions/how-to-apply: "$85.00 application fee" |
| 34 | CN | Duke Kunshan ED 2 Nov 2026, RD 4 Jan 2027, 11:59 pm ET; no application fee | CONFIRMED | admissions.dukekunshan.edu.cn/en/how-to-apply/: "There is no application fee" |
| 35 | GR | Athens English-taught MD €17,000 for 2026-27, EU and non-EU | CONFIRMED | medicen.uoa.gr/tuition-fees/: "Tuition fees for the academic year 2026-2027 for EU and non-EU citizens are €17.000" |

**New institutions:**
- **CEU San Pablo** (ES): Dentistry and Physiotherapy are genuinely taught in English. The card is accurate, describing Dentistry and Physiotherapy as English-taught and the others as bilingual.
- **Cattolica** (IT): nine English-taught bachelor's. Accurate.
- **Canada's six** (York, TMU, Carleton, Manitoba, Guelph, Saskatchewan) and **Australia's three** (Tasmania, Griffith, Curtin) are English-language universities.
  - Their first lines state admission facts and rank nothing.
  - Tasmania's card rightly shows no transcript count, since its count probably reflects Australian IB candidates.

## 3. Internal contradictions (the reason this is 7)

**a. Undated or announcement cards marked "Hard deadline. After this the door closes."** There are 19 on the 15 pages, and the guard misses every one.

| Page | Card label | Why hard is wrong |
|---|---|---|
| AE (route `ae-federal-direct-2027`, `ms-ae-fed-zu-dates`, `type: open`) | "Zayed University confirms its undergraduate application dates" | An announcement, not a closing date. The note says "No date." |
| AE (same route) | "UAEU announces an application period" | Same fault |
| AE (`ae-private-direct-2027`) | "Khalifa University publishes its Fall 2027 application timeline" | Same fault. The note says "Watch the page from autumn 2026." |
| KR (`kr-direct-2027`) | "Yonsei UIC 2nd Round opens for Fall 2027" | An opening, labelled "the door closes" |
| NZ (`countries/nz.json`, `dateState: varies-by-institution`) | "Semester 2 2027, the mid-year intake…"; "Semester 1 2028, the main intake…"; "Programmes with early closing dates…" | These are explanations. The Semester 1 card also contains Victoria's 8 December date, which the page itself marks "Equal consideration". |
| US | "Applications close — and there is no American closing date…"; "Financial aid forms are due with the application…" | The first card's own label says there is no date that could close. |
| CA | "Ontario — accept the offer and pay the deposit"; "British Columbia — University of Victoria applications close"; "Alberta — University of Alberta and University of Calgary applications close" | Undated, set by each institution |
| ES, IT, GR, MT, HK, CN (×2) | "Each private university's own admission rounds", "Each university's own application round", "Other English-taught programmes", "MCAST, ITS and the private institutions", "Other universities", "UNNC, CUHK-Shenzhen and Wenzhou-Kean", "University application windows" | Undated explanation cards |

Also note AE "American University of Sharjah — Fall 2027 application closing date", which is undated and marked hard. The audit (`docs/research/audit/ae.md`) found that AUS publishes no Fall closing date at all. The card's note is honest ("ask AUS"), but a hard badge on a date nobody has set is the same fault.

**b. "Applies to: non-eu" on 29 cards.**
- `src/lib/primitives.mjs:904` renders `e.audience`. For route milestones that value comes from the route's `applicantGroup: "non-eu"`.
- On HK the cards affected are the CUHK Advance Offer Round, CityU Early Round, PolyU Early Round and more (13 in all). On SG they include "NTU applications open" and the NUS window (10). The route file `hk-direct-2027.json` itself says the group is non-eu only "because Hong Kong's categories are local and non-local. A Danish student is non-local, and EU status plays no part."
- A 17-year-old Dane reads "Applies to: non-eu" as "this deadline is not for me".
- The same code shows on the UBC International Scholars route card on CA.

**c. UBC 15 November (country card, `data/countries/ca.json`, the deadline with `label` "British Columbia — UBC, the date for international applicants and for the International Scholars Program awards").**
- Its `audience` reads "international applicants, and anyone seeking a UBC International Scholars Program award".
- The note underneath says "the general admission route stays open until 15 January". UBC's page says the same (item 3).
- The error points the safe way, towards applying earlier. But a student who misses 15 November may conclude that UBC is closed to them.

**d. US: the UC group heading "One window, five weeks before everyone else"** (`data/destinations/us.json`, jurisdiction label).
- Harvard, Yale, Stanford, MIT, Illinois and Macalester all close early rounds on 1 November, before UC's 30 November.
- The editor removed exactly this claim ("earliest", "earlier than all of them") from `countries/us.json` in round 0, but this copy survives.

**e. KR: the sector note on 과학기술원** (`data/destinations/kr.json`, `sectorLandscape`, the science-and-technology-institute entry, `note`).
- It says "KAIST runs an Early and a Regular round **both aimed at the September intake**".
- The audit's own correction, and KAIST's page, say that the Early round leads to an end-February 2027 start. The route was fixed; this note was not. It predates the pass, but it is now wrong against the page's own calendar.

**f. ES: "Strong English-taught options in Madrid and Barcelona, plus real alternatives in Pamplona, Bilbao and Segovia"** (`data/countries/es.json`, `whyConsider[4]`).
- The same page's Navarra card now says "No fully English-taught…". That is the audit's correction.
- Pamplona is no longer an English-taught alternative.

**g. SG: NTU "The first of the autonomous universities to open"** (`sg-autonomous-2027.json`, milestone note) and **"The longest window of the six autonomous universities"** (`countries/sg.json`, NTU deadline note).
- SMU, SUTD, SIT and SUSS have not published 2027 dates. The page says so in its own watch-outs.
- Keep "two months before NUS", which is true (15 Oct against 16 Dec). Drop the claims about the other four.

**h. AU: UAC cards describe future dates in the past tense.**
- "the cut-off was 23:59 Sydney time on 30 September 2026" (six days from today).
- "The 2026-27 cycle closed at 23:59 on 5 February 2027".
- The Japan audit corrected the same tense error ("Opened 15 October 2026").

## 4. Ranking and unsupported claims (after the editor's pass)

The editor removed a great many. What is left:

| Page | Claim | Problem |
|---|---|---|
| SG | "Taking it halves the fee" (`countries/sg.json` step; `sg-autonomous-2027.json` Tuition Grant note "Electing the grant hal…") | The page's own figures do not support it: SGD 33,400–40,600 falls to 21,400–22,200, a cut of about 35–45%. Make it "cuts tuition by roughly a third to almost half". |
| SG | "Competitive applicants to NUS and NTU are generally said to be in the high 30s to low 40s" (`countries/sg.json` `ibRecognition.notes`) | Hearsay with no source, set beside a sentence saying no profile is published. Cut it, or cite a source. |
| US | "Liberal arts colleges… often more generous to internationals than the famous research universities"; "Research, internships and campus jobs… rare in Europe"; "Merit awards… concentrated at universities outside the top 20" | Comparisons with no source. The first is half-supported by the need-blind list. Make it "several (Amherst, Bowdoin) are need-blind for internationals". |
| US | "MIT is its best-known practitioner: it has never joined the Common App and does not intend to" | "Does not intend to" has no source. Keep "MIT uses its own application, not the Common App." |
| ES | UPC: "Catalonia's main technical university, and the usual route into engineering in Barcelona" | A mild ranking. Make it "Catalonia's public technical university". |
| HK | CUHK "the cheapest of the big three" | The arithmetic holds against the page's own figures, but "big three" is editorial. Make it "cheaper than HKU and HKUST". |
| KR | GKS "the flagship government scholarship" | Mild. "The government scholarship" says the same. |

The facts I would repeat are all there. These lines are what a student quotes back to you, and they cannot be defended.

## 5. Research-log residue (small)

- SG: "SUSS's 2027 dates could not be checked, which does not mean SUSS has published nothing." Make it: "SUSS's 2027 dates are not given here; check suss.edu.sg."
- SG: "Not established, and probably not establishable at this level." Make it: "Not given here: SIM's partner universities each set their own."
- US: "all ten states in this profile" and "Berkeley is the campus in this profile". CN: "the one this profile covers". Make each "on this page".
- Template (`src/`): source lists render "Status: needs-review." and "None has been signed off by a person yet". The header renders "Read from the source, not yet checked by a person."
  - This is honest, but it is workflow language on a student page.
  - Europe accepted it at round 5. I note it rather than score it.

## 6. Pages read as a student and as a counsellor

- **US.** Excellent substance.
  - The grouping by application environment (Common App, UC, MIT) is the most useful way I have seen to explain America to a Danish student.
  - The cost figures are current and exact.
  - It is let down by the UC heading ("five weeks before everyone else") and by three unsourced comparisons in "Why it might suit you".
- **SG.** The best-written warning on any page I read: the Tuition Grant bond as a contract with two sureties and liability on withdrawal. A counsellor could read it aloud.
  - Spoiled by "halves the fee", the "high 30s to low 40s" hearsay, 10 "Applies to: non-eu" badges, and the NTU "first/longest" claims.
- **ES.** A clear short version. The UNEDasiss gateway, the 14-point scale and PCE are exactly right.
  - Two problems. The watch-out and the PCE card both say the PCE collides with the IB exams, which it did not in 2026. And "why it might suit you" still sends the student to Pamplona for English-taught degrees.
- **NZ.** A careful calendar.
  - Otago's offshore/onshore split, the arrival-date misprint and Auckland's month-earlier international date are all genuinely useful.
  - Three "Set by each institution" cards are badged "the door closes", one of them over a date the page itself marks equal consideration.
- **CA (calendar)** has good trap-spotting, for example SFU's scholarship six weeks before its deadline and the OUAC Group B note. The UBC 15 November card is the exception (3c).
- **AU (calendar)** reasons soundly about the round: a July 2027 start is three weeks after results, so February 2028 is realistic. NZ's framing agrees.
  - AU's calendar has no dated university closing date at all, only "Each university's own closing date" (undated, hard). A counsellor would want one worked example, as NZ gives with Otago and Auckland.
- **JP and KR** calendars agree with their summaries and with the official pages. The KAIST sector note (3e) is the one miss.

## Top fixes (in order of how much they raise the score)

1. **Stop printing the `non-eu` applicant-group code as an audience.**
   - File: `src/lib/primitives.mjs:904` (`Applies to: ${e.audience}`), or wherever `allEvents` copies the route's `applicantGroup` into `audience` (`src/lib/calendar.mjs`).
   - Correct value: omit the line when the audience is just the route's applicant group, or render it as "international applicants".
   - Affects 29 cards on HK, SG, AE, CN and CA.
   - Source: `data/application-routes/hk-direct-2027.json`, which states "EU status plays no part".
2. **Relabel the 19 undated or announcement cards, and widen the guard.**
   - Set `consequence` to none (or `personal`) on the four `type: "open"` announcement milestones: AE ZU, UAEU and Khalifa; KR "UIC 2nd Round opens".
   - Do the same on the 15 `dateState: "varies-by-institution"` cards listed in 3a.
   - Change `scripts/test-deadline-labels.mjs` rule 3 so it fails when `!e.date && e.consequence === 'hard' && (e.dateState === 'varies-by-institution' || e.type === 'open' || EXPLANATION_LABEL.test(e.label))`.
3. **UBC 15 November.**
   - File: `data/countries/ca.json`, the 2026-11-15 deadline.
   - `label`: "British Columbia — UBC International Scholars Program: apply and submit the award application".
   - `audience`: "international applicants who want an International Scholars award".
   - In the `ca-epbc-2027.json` `ms-ubc-scholars` milestone, set `audience` to "international applicants seeking an International Scholars award" (not `non-eu`).
   - Source: https://you.ubc.ca/applying-ubc/dates-deadlines/ ("if you're an international student and you wish to be considered for the UBC International Scholars Program awards").
4. **Spain: the PCE/IB timing claim.**
   - Files: `data/countries/es.json` `watchOuts[0]`, the PCE ordinary-call deadline `label` ("the window that collides with your IB exams") and its `notes` ("That is inside the IB May examination session").
   - Correct value: "the ordinary PCE (25–29 May in 2026) falls in the week straight after the May IB exams end (20 May in 2026), so you revise for both at once".
   - Source: the IB May 2026 examination schedule, 24 April–20 May 2026 (ibo.org/programmes/diploma-programme/assessment-and-exams/exam-schedule/).
5. **Correct the two stale facts.**
   - `data/destinations/kr.json`, `sectorLandscape` 과학기술원 `note`: "KAIST runs two international rounds: the Early round (closes 22 October 2026) starts in late February 2027; only the Regular round (closes 14 January 2027) leads to the September intake". Source: https://admission.kaist.ac.kr/intl-undergraduate/application/ApplicationGuide/ApplicationTimeline
   - `data/countries/es.json` `whyConsider[4]`: drop "Pamplona" (Navarra has no fully English-taught bachelor's: en.unav.edu/studies/degrees).
6. **The US and SG overclaims.**
   - `data/destinations/us.json` UC jurisdiction `label` "One window, five weeks before everyone else" → "One window, 1–30 November, and nothing either side".
   - `data/application-routes/sg-autonomous-2027.json` NTU note: "The first of the autonomous universities to open" → "Opens two months before NUS".
   - The NTU deadline note in `data/countries/sg.json`: drop "longest window of the six".
   - SG "halves the fee" → "cuts tuition by roughly a third to almost half".
   - Cut the "high 30s to low 40s" sentence.
   - Cut or source the three US comparisons in section 4.
7. **Lower priority:**
   - the AU UAC past-tense notes (3h);
   - the four research-log lines in section 5;
   - one dated worked example of an Australian university's mid-year international closing date.

With fixes 1 to 5 done, I would score this 8. The facts underneath are the best-verified set I have seen on this site: 33 of 35 confirmed, including every deadline and fee. What stands between it and a student is again what the cards *say about* those dates, not the dates themselves.
