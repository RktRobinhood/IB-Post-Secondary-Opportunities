# Country audit (world and Southern Europe, 15 destinations): critic round 3

Critic: a fresh **admissions counsellor**, working under `docs/QA_CRITIC_LOOP.md`. Date: 2026-09-24.
Scope: es, it, pt, gr, mt, us, ca, au, nz, ae, jp, kr, cn, hk, sg.
I edited nothing in `data/`, `src/` or `scripts/`, and ran no git.

## SCORE: 7 / 10 (not yet)

**Every round-2 fix landed, and I checked each one on the built pages.**
- Nova SBE is no longer called private or open to direct application.
- The CGS, UAC early-bird and GKS-U cards no longer carry a badge their note contradicts.
- BNBU shows one "not yet announced" card with the 2025 and 2026 patterns in the note.
- "See tuitionNonEu." is gone from all six pages.
- The Hong Kong total, the Portugal and Australia tense, the Singapore SUSS/SIM lines, the Concordia audience, the Malta TOEFL 1–6 scale and the superlatives are fixed as logged.

**I checked 31 facts that rounds 1 and 2 did not, across 13 countries. I also checked Australia but did not count it.**
- **28 are confirmed** against the official page.
- 1 could not be re-checked (the IMAT 2026 date).
- Two more checked facts are not counted: the Universities NZ IB rule, and two of the four UNSW rates.
- **2 are wrong, and both are on the Athens English-taught MD**, the medicine route a Danish student is most likely to act on.

**This stays at 7 for the same reason round 2 did: one wrong entry requirement, stated four times, that points the unsafe way.**
- Greece says, in four places, that the Athens MD "requires UCAT or MCAT on top of your IB".
- The programme's own requirements page lists UCAT/MCAT as **one alternative** among several ("at least one of the following"). The IB at 36 points is another alternative, and the application page for final-year students asks for predicted IB grades *or* a UCAT score.
- A Danish student reading this page on 24 September 2026 would find that UCAT booking closed on 16 September (the UK page says so) and cross Athens off for 2027. The route is still open to them.

The same card also says "the programme publishes no application deadline on any of its three admissions pages". The programme has an **Important Dates** page: 18 December 2025 to 30 April 2026 for 2026-27. That is the precedent a student needs.

Fix the Athens MD cluster in `data/countries/gr.json` (top fix 1) and I would score this 8. Everything else I found is small.

## 1. Guards and build

- `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs`: **all 28 checks pass**, 1 advisory (freshness). That includes `labels`, `sourcing`, `evidence-policy`, `calendar`, `build`, `check`, `page-budget` and `release`.
- `node src/build.mjs`: the first run hit EBUSY on `dist/destinations/ch/index.html` because another agent was writing. The retry wrote 152 pages.
- I extracted all **334 calendar cards** from the 15 built pages: the date, consequence, badge, heading and note.
  - No `hard` card has a note saying "no single deadline" or "each … sets its own".
  - No `priority` card has a note saying "costs money" or "rather than a place".
  - The widened guard holds on the built output.
- **Research-log scan** over the tag-stripped text of the 15 pages ("this profile", "could not be", "fetch", "403", "curl", "as indexed", "not established" and similar):
  - 0 hits for "this profile", "could not be checked" or "not establishable".
  - What remains is legitimate gap-marking: SG Tuition Grant eligibility "is not established", KR "not established here — ask, in writing", US MIT waiver "not established here", and CN campuschina.org "did not resolve on 23 or 24 September 2026". The last is dated and useful.
- **Stale past tense on future dates.** Three are left, on pages rounds 1–2 did not scan for this (section 3.3).

## 2. Round-2 fixes, checked on the built pages

| Round-2 fix | Status | Evidence in `dist/` text |
|---|---|---|
| 1. Nova SBE public, closed to EU direct entry | **LANDED** | PT: "Private institutions such as Católica set their own IB rules. Nova SBE's 36 points … are the rules of its international route, which is closed to EU citizens." Step 7: "…apply directly to a private institution such as Católica Lisbon." No "Católica or Nova SBE". |
| 2. CGS badge | **LANDED** | CN card `indicative`, no badge, date cell "Set by each institution", label "…each embassy and university sets its own date". |
| 2. UAC early-bird badge | **LANDED** | AU card `data-consequence="indicative"`, no badge, note in the present tense. |
| 2. KR GKS-U round (found by the widened guard) | **LANDED** | KR 30 November 2026 card `indicative`, no badge. |
| 3. BNBU | **LANDED** | One card, "BNBU applications close", "Not yet announced for this intake", note: "For 2026 entry BNBU gave one deadline, 15 May … It has not published its dates for 2027 entry." |
| 4. "See tuitionNonEu." | **LANDED** | 0 occurrences on the 15 pages. |
| 5. HK total and unsourced lines | **LANDED** | "roughly HK$0.9–1.1 million … about DKK 770,000 to 940,000"; no "big three", "competitively worse", "best programmes" or "smaller field". "The five universities covered here are all in one small territory". |
| 6. AU tense | **LANDED** | "In the 2026-27 cycle the cut-off is 23:59 … The 2027-28 date is not yet published." |
| 6. PT "Context, not a milestone" | **LANDED** | "The places for the third phase are announced the day before it opens (9 October in 2026)." |
| 6. SG SUSS / SIM | **LANDED** | "Singapore University of Social Sciences — July 2027 intake"; "SUSS says applications for the July 2027 intake open in November 2026." |
| 6. US / CN "this profile" | **LANDED** | 0 occurrences. The US sentence now reads "Twelve of the fourteen institutions here, spread across all ten states covered here". "Here" twice in one sentence is clumsy but not wrong. |
| 6. Concordia | **LANDED** | "Applies to: Canadian applicants (US and international applicants: 1 February)". |
| 6. Malta TOEFL | **LANDED** | "TOEFL iBT 4 overall with writing 4.5 on the 1–6 scale used since January 2026 (80 with writing 20 on the older scale)". |
| 6. UPC, GKS "flagship", SG healthcare | **LANDED** | None of these phrases appear. "Public flagship" remains only as the US category name, which round 2 accepted. |
| Deferred: duplicate cards; AU/NZ "2027 autumn intake" header | **Still present (template)** | HK still has "HKU — first round" beside "HKU first round closes", and so on. I note this only, per the brief. |

## 3. Findings

### 3.1 Greece: the Athens English-taught MD (the reason this is 7)

**What the page says** (`data/countries/gr.json`):
- watchOuts (line 24): "The English-taught MD at Athens costs EUR 17,000 a year for six years and **requires UCAT or MCAT on top of your IB**".
- MD card note (line 90): "Entry is 36 points including three higher-level subjects … **plus UCAT or MCAT** and IELTS 7.5".
- steps (line 113): "Prepare English proof and, **for medicine, an admissions test**. The Athens MD accepts UCAT or MCAT…".
- selection note (line 118): "The English-taught programmes select on your IB result, English proof and, **for medicine, an admissions test**".

**What the official pages say** (fetched 2026-09-24):
- https://medicen.uoa.gr/admission-requirements/: "Eligible applicants should have obtained or expect to obtain **at least one of the following**:". The list is IB (36 points…), French Baccalaureate, European Baccalaureate, A-Levels, "Admission Tests" (UCAT, MCAT), AP & SAT, a cognate BSc, or a pre-med programme.
- https://medicen.uoa.gr/application-process/, under "Applicants who are in the final high school grade": "At least one of the following: Predicted grades of International Baccalaureate (IB) … UCAT (score report)".

**So UCAT/MCAT is an alternative to the IB, not an addition.** Stated as an extra requirement, it makes a Danish student think:
- that they need a UK test whose 2026 booking the site's own UK page says closed on 16 September 2026; or
- that they must pay for and sit an exam they do not need.

Either way it removes, or makes harder, a route that is open to them. That is the unsafe direction.

**Second fault, on the same card.**
- Label: "University of Athens MD in English - no deadline published…". Note: "The programme publishes no application deadline on any of its three admissions pages … the only date the programme published for the 2026 cycle was a document cut-off … 30/04/2026".
- https://medicen.uoa.gr/important-dates/ says: "The application platform for the academic year 2026–2027 will remain open from December 18th, 2025 until April 30th, 2026."
- The date the page calls unpublished is published. The page's own inference, that "the cycle closes in spring", happens to be right, but a student should be given the real precedent: December to 30 April.

**Third, lesser.** The card title and a watch-out say the programme "disagrees with itself about whether you can apply at all" as a current-year IB candidate.
- Clause A on the requirements page does say "(July 2025 or earlier)".
- But the same page says "(or be predicted to achieve) at least 36 points". The application-process page has a whole section for "Applicants who are in the final high school grade", asking for "Predicted grades of International Baccalaureate (IB)".
- Advising the student to email medicen@uoa.gr is harmless. The note's "if it is wrong, it costs a year" framing overstates a doubt that the programme's own process page settles.

Confirmed on the same pages, so keep them: 36 points with three HL, two from Physics, Chemistry and Biology; IELTS 7.5 with 6.5 in each component; TOEFL 80; FCE B2.

### 3.2 Minor inconsistencies a student would notice

1. **UAE, three or four environments.** The page says "four admissions environments" three times. The "Where to apply" step says "The UAE has three admissions environments" and then lists four. Make it four (`data/countries/ae.json`).
2. **Greece, "Only if: Only if …".** Three GR cards on the ministry route render "Only if: Only if at least one parent is not of Greek descent, and you cannot enrol without a B2 Greek certificate." The template prints "Only if:" and the data's `reason` starts with "Only if" again.
   - Also, the second clause is a consequence, not a condition.
   - Fix in `data/application-routes/gr-minedu-foreign-2027.json` `reason`: "At least one parent is not of Greek descent. You also need a B2 Greek certificate to enrol."
3. **Greece, "IB results released"** carries the ministry route's "Only if" condition. The results date applies to everyone. This comes from the template; I note it only.
4. **Italy, "Visa application for 2027/28 … (non-EU only)"** is badged "Hard deadline". The note ends "None of it applies to a Danish citizen … Listed for completeness only."
   - Portugal's Nova SBE non-EU cards have the same shape.
   - A hard badge on a date that the card itself says is not the student's is the label/note fault in a milder form. `indicative` would be honest.

### 3.3 Stale past tense on future dates

- **AE** (`data/application-routes/ae-branch-campus-direct-2027.json`): "The 2026 equivalents **were** 24 August 2026 … and **14 December 2026** for January 2027". Make it "are".
- **NZ** (`data/application-routes/nz-direct-2027.json`, `data/countries/nz.json`): "Auckland's equivalent date for February 2027 **was** 8 December 2026" and "its Semester One 2027 equivalent **was** 8 December 2026". Make both "is". The date is ten weeks away.
- **SG** (`data/application-routes/sg-autonomous-2027.json`, `data/countries/sg.json`): "NTU's 2026 window **ran** 19 September to 18 October 2026". The window is open today. Make it "runs".

### 3.4 Claims with no source

- **KR** (`data/countries/kr.json`): "Because the applicant pool is small and separate, strong IB students are often competitive at universities that would be unreachable through the domestic route."
  - This is the same reasoning round 2 had cut from Hong Kong ("a smaller field than the raw rankings suggest").
  - Cut it, or keep only "The international track is a separate, smaller pool."
- **AE** (`data/countries/ae.json`): "NYU Abu Dhabi is very selective — admission rates are in the low single digits". No source is cited. Either cite NYUAD's class profile or cut the figure.
- **AU**: "Most Australian universities charge either no application fee or AUD 100-150 for international direct applications". This is a generalisation with no source, but it is hedged ("check each university's own fee"). Low priority.
- **IT**: "Bocconi does not price EU and non-EU differently". Bocconi's fees page gives a single €17,000 figure and never mentions EU status. The claim is probably true but is inferred.
  - Bocconi does run need-based **tuition waivers** of 100/80/60/40/20% ("a full or partial tuition waiver, based on the student's and family's economic needs", `unibocconi.it/…/funding`).
  - The page mentions Bocconi's need-based scholarships under funding, so a student is not misled. Low priority.

## 4. Sampled facts (31 facts across 13 countries that rounds 1–2 did not check; Australia checked but not counted)

| # | Country | Claim on the page | Verdict | Evidence (URL, short quote) |
|---|---|---|---|---|
| 1 | GR | Athens MD "requires UCAT or MCAT on top of your IB" | **WRONG** | medicen.uoa.gr/admission-requirements/: "at least one of the following"; the IB and "Admission Tests" are separate alternatives. /application-process/: "Predicted grades of International Baccalaureate (IB) … UCAT (score report)" |
| 2 | GR | Athens MD: "no application deadline on any of its three admissions pages" | **WRONG** | medicen.uoa.gr/important-dates/: "open from December 18th, 2025 until April 30th, 2026" |
| 3 | GR | Athens MD: 36 points, three HL with two from Physics, Chemistry, Biology; clause A "July 2025 or earlier"; IELTS 7.5 (6.5 each), TOEFL 80, FCE B2 | CONFIRMED | medicen.uoa.gr/admission-requirements/: "at least 36 points overall, including three higher-level subjects" |
| 4 | GR | NKUA BA Ancient Greece: 1 August deadline for 2026-27; €6,000 in two instalments; 70%; TOEFL 88 / IELTS 6.5 | CONFIRMED | baag.uoa.gr/admission-fees/: "€ 6000 / academic year"; "(indicative average grade: 70% or equivalent)" |
| 5 | GR | AUEB International Business and Technology €6,000 a year | CONFIRMED | ibt.aueb.gr/faq/: "Students are required to pay 6.000 EUR per year of study." |
| 6 | IT | Bocconi €17,000 for 2026-27; 2027-28 not set | CONFIRMED | unibocconi.it/…/bachelor-and-law-programs/fees: "set at € 17,000 per year"; "will be defined soon" |
| 7 | IT | PoliMi 2026/27: first instalment €880.04; second €0–€3,003; maximum about €3,943; reduction below ISEE €27,740 | CONFIRMED (curl) | polimi.it/…/laurea-laurea-magistrale-and-single-cycle-programmes: "up to a maximum of € 3,943.04"; "ranges from €0 to €3,003" |
| 8 | IT | IMAT 2026 on 29 September 2026 (Bologna notice) | NOT RE-CHECKED | The notice was not found on unibo.it's English notice board. Not counted either way. |
| 9 | JP | Kyoto iUP: 2 Nov–3 Dec 2026, 17:00 JST | CONFIRMED | iup.kyoto-u.ac.jp/apply/: "November 2 until December 3, 2026 (5 p.m. Japan Standard Time)" |
| 10 | JP | Kyushu English-taught programmes, October 2027: closes 11 Dec 2026 | CONFIRMED | kyushu-u.ac.jp/en/admission/faculty/foreign/foreign10/: "(December 7, 2026 - December 11, 2026". The window is only five days, which the page does not say. |
| 11 | JP | UTokyo admission fee ¥282,000; tuition ¥642,960 | CONFIRMED | u-tokyo.ac.jp/en/prospective-students/tuition_fees.html: "Admission fee ¥282,000"; "Tuition fee (annual) ¥642,960" |
| 12 | JP | Keio PEARL: three periods share about 100 places | CONFIRMED | keio.ac.jp/en/admissions/undergraduate/pearl/: "Approximately 100 students through all three application periods" |
| 13 | JP | MEXT for Danish nationals: only Japanese Studies and Research Student | CONFIRMED (browser pane) | dk.emb-japan.go.jp/itpr_en/study.html: "two types of Japanese Government (MEXT) Scholarship Program for Danish nationals". The page is dated 2020/12/3; the site does not say so. |
| 14 | AE | RIT Dubai: Early to 15 Jan, Regular to 31 May, deadline 22 Aug; IB 28 engineering / 24 others; Maths, Physics and Chemistry or Biology at 4 | CONFIRMED | rit.edu/dubai/undergraduate-admissions: "Application deadline: August 22"; "Minimum 28 points" |
| 15 | AE | Khalifa: full Diploma, 4 in each of six subjects, total 24; AED 2,500 per credit hour, about AED 81,250 a year; in-person test; video | CONFIRMED | ku.ac.ae/undergraduate-admissions: "Minimum score of 4 in each subject – with a total of 24 points." The test is for shortlisted applicants only. |
| 16 | AE | AUS opens Fall 2027 on 19 Oct 2026; Early File Completion 5 Jul 2027; no Fall closing date | CONFIRMED | aus.edu/…/deadlines-and-important-dates…: "October 19, 2026 Accepting applications for Fall 2027"; "July 5, 2027 Early File Completion" |
| 17 | AE | NYUAD ED I 1 Nov, ED II 1 Jan, RD 5 Jan; CSS Profile 10 Nov / 10 Jan / 1 Feb | CONFIRMED | nyuad.nyu.edu/en/apply/undergraduate/apply/key-dates-and-deadlines.html: "Regular Decision January 5 April 1" |
| 18 | ES | Deusto: applications for 2027–28 only 2–30 November 2026 | CONFIRMED (browser pane; curl 403) | deusto.es/en/home/study/admissions/undergraduate: "will be open from 2 to 30 November 2026" |
| 19 | ES | IE 2027-28: 18 Sep, 6 Nov 2026, 15 Jan, 5 Mar 2027; from May if places remain | CONFIRMED (curl) | ie.edu/university/admission/admission-process/admissions-rounds/: "Round 2 Application deadline: January 15, 2027"; "Round 3 … March 5, 2027" |
| 20 | CA | SFU Fall 2027: opens 1 Oct 2026; closes 31 Jan 2027; Undergraduate Scholars 15 Dec 2026; admission documents 28 Feb; Beedie/Contemporary Arts 7 Feb; accept by 1 May | CONFIRMED | sfu.ca/…/high-school/fall-term.html: "Applications open: October 1, 2026 / Application deadline: January 31, 2027" |
| 21 | CA | McGill: 15 Jan 2027 (outside Canada); documents 1 Mar; Major Entrance Scholarship 21 Jan | CONFIRMED | mcgill.ca/importantdates/…370820: "Friday, January 15, 2027"; …/international/ib: "Major Entrance Scholarship application & documents January 21" |
| 22 | US | MIT EA 1 Nov; RA 4 Jan; aid 30 Nov (EA) / 15 Feb (RA) | CONFIRMED | mitadmissions.org/apply/firstyear/deadlines-requirements/: "Regular Action (RA) applications are due January 4" |
| 23 | US | SAT: 7 Nov 2026 (register by 23 Oct); 5 Dec 2026 (by 20 Nov); then 6 Mar, 1 May, 5 Jun 2027 | CONFIRMED | satsuite.collegeboard.org/sat/registration/dates-deadlines: "Dec. 5, 2026 / Nov. 20, 2026" |
| 24 | US | UC: final transcripts 1 July; official IB results 15 July | CONFIRMED | admission.universityofcalifornia.edu/…/dates-and-deadlines.html: "Deadline for official AP and IB examination results to be postmarked or electronically submitted" (July 15) |
| 25 | HK | PolyU: Early Round 17 Nov 2026; Main Round 11 Feb 2027; rolling to 14 May 2027 | CONFIRMED (the key-dates image, read by eye) | polyu.edu.hk/…/international-other-qualifications-key-dates, image "KeyDates_International_2027-28": "17 NOV 2026"; "11 FEB 2027"; "rolling basis till 14 May 2027" |
| 26 | HK | HKUST: priority 25 Nov 2026, rolling from 26 Nov; closes 30 Jun 2027 | CONFIRMED | join.hkust.edu.hk/…/application-procedures: "Deadline for Priority Round Applications 25 Nov 2026"; "Application Closes 30 Jun 2027" |
| 27 | SG | LASALLE: opens 1 Oct, apply by 1 Nov 2026, outcomes by 23 Dec; Music 28 Feb 2027 | CONFIRMED | lasalle.edu.sg/study/admissions/: "Opens on 1 Oct 2026 / Apply by 1 Nov 2026" |
| 28 | CN | XJTLU closes 31 May 2027 for most programmes | CONFIRMED | xjtlu.edu.cn/en/admissions/global/how-to-apply: "the closing date for September 2027 entry is 31 May 2027" |
| 29 | NZ | Victoria: Trimester 1 closes 8 Dec, Trimester 2 closes 1 May, no year given; later applications "case-by-case" | CONFIRMED | wgtn.ac.nz/international/applying/dates-and-deadlines: "Trimester 1 (February)—application deadline 8 December" |
| 30 | MT | UM general entry: IB 28 points with 3 in a language, a science and a humanistic subject; M.D. non-EU €26,000 | CONFIRMED | um.edu.mt/…/comparingib/: "at least 28 points, and with passes at 3 points or better in a language, a science and a humanistic subject"; …/umdft-2026-7-o/: "Fee per academic year: Eur 26,000" |
| 31 | KR | SNU Spring 2027 round ran 6–9 July 2026; fee KRW 70,000 | CONFIRMED | en.snu.ac.kr/…/Admissions_for_Undergraduate_Spring_2027.pdf p. 4: "2026. 7. 6.(월) 10:00 ~ 2026. 7. 9.(목) 17:00"; "전형료(70,000원)" |

Checked but not counted:
- **AU, UNSW 2026 international rates:** Arts AUD 985, Architecture AUD 1,090 and 48 UOC per year are confirmed ("ARTS Arts $985"; "48 UOC is the standard full-time load", unsw.edu.au/student/managing-your-studies/fees/international). Design AUD 1,000 and Accounting AUD 1,180 were past the readable part of the page.
- **NZ, "24 points … the national University Entrance equivalence threshold":** universitiesnz.ac.nz/international-students/am-i-eligible says nothing about the IB, and its "Entrance Level Qualifications 2023" PDF is encrypted. Not shown wrong, but the page's source for it should be the university's own IB page.

**The weighting:** about two thirds of the rows are deadlines. The rest are fees (Bocconi, PoliMi, UTokyo, Khalifa, AUEB, NKUA BA, UM, SNU), IB requirements (Athens MD, RIT Dubai, Khalifa, UM) and routes (MEXT, Athens MD eligibility).

**Every deadline and fee I checked is right.** The two wrong facts are an entry requirement and a "not published" claim, both on one card.

## 5. Ranking and unsupported claims left

- The four in 3.4: KR "often competitive … unreachable through the domestic route", AE "low single digits", AU application-fee range, IT Bocconi EU/non-EU.
- The rest is accepted as in round 2: "oldest" (Bologna 1088, Athens 1837), "Russell Group" (Birmingham, a fact), and JP "its first new undergraduate faculty in about seventy years".
  - I did not check the last one. It is UTokyo's own announcement wording, but no source is cited beside it. Low priority.

## 6. Pages read end to end, as a student and as a counsellor

- **Italy.** Clear and honest about the one thing a Danish family most needs, the ISEE parificato: it explains what it is, who issues it, and what happens if you skip it. That is counsellor-grade.
  - The Bocconi calendar is exact.
  - The visa card is a hard-badged "non-EU only" date that the card itself says is not yours (3.2 item 4).
  - "Private universities are flat-rate" is fair, but Bocconi's income-based waivers deserve a clause in the Money row, not only under funding.
  - I would repeat everything else in a meeting.
- **Japan.** The best page of the four. Every date I sampled is right: Kyoto, Kyushu, Keio, UTokyo fees and PEARL's quota.
  - The MEXT warning is correct, and it is the single most useful thing on the page for a Danish student.
  - Two small things:
    - the embassy page it rests on is dated 2020/12/3, and saying so would help a counsellor judge it;
    - "does not appear to run the undergraduate embassy track" in the IB section is softer than the watch-out's "is not open to you", which it should match.
  - Kyushu's window is only 7–11 December. Saying "a five-day window" would stop a student planning to start the form on the 11th.
- **United Arab Emirates.** The four-environment framing is exactly right, and every date and threshold I sampled matches: NYUAD, RIT Dubai, Khalifa and AUS.
  - Against it:
    - the "three admissions environments" slip (3.2 item 1);
    - "low single digits" with no source;
    - one future date in the past tense (3.3).
  - It is a page I would hand to a family.
- **Greece.** The strongest page for a student who wants medicine on the Continent, and it is let down on exactly that programme (3.1).
  - Everything around the MD is right: the BA Ancient Greece (1 August, €6,000, 70%, TOEFL 88), AUEB €6,000, and the ministry window.
  - The MD cluster tells a student three things that are wrong or overstated: that they need UCAT, that no deadline exists, and that they may not be allowed to apply at all.
  - A counsellor reading the programme's own pages would say the opposite of all three.

## Top fixes, in order of how much they raise the score

1. **Greece: the Athens MD.** File: `data/countries/gr.json`.
   - watchOuts line 24: "…costs EUR 17,000 a year for six years and requires UCAT or MCAT on top of your IB" → "…costs EUR 17,000 a year for six years. An IB of 36 points (three HL, two of them from Physics, Chemistry and Biology) qualifies you on its own; UCAT or MCAT is an alternative route, not an extra requirement."
   - The MD card (line ~88–90):
     - label → "University of Athens MD in English: 2027 dates not yet published";
     - note: replace "publishes no application deadline on any of its three admissions pages" and "the only date the programme published for the 2026 cycle was a document cut-off" with "For 2026-27 the application platform was open from 18 December 2025 to 30 April 2026. The 2027-28 dates are not yet published.";
     - remove "plus UCAT or MCAT" from the entry sentence;
     - keep "July 2025 or earlier" only with the application-process page's section for final-year IB candidates beside it, and drop "if it is wrong, it costs a year".
   - The second watch-out (line 25) → "Clause A of the MD's requirements page asks for a diploma from July 2025 or earlier, but its application page has a section for final-year students with predicted IB grades. Confirm with medicen@uoa.gr."
   - Steps line 113: "Prepare English proof and, for medicine, an admissions test. The Athens MD accepts UCAT or MCAT and requires IELTS…" → "Prepare English proof. The Athens MD requires IELTS 7.5 (6.5 in each component), TOEFL 80 or Cambridge FCE at B2…"
   - Line 118: "…select on your IB result, English proof and, for medicine, an admissions test" → "…select on your IB result and English proof, and the Athens MD adds an online interview".
   - Add evidence records for `https://medicen.uoa.gr/important-dates/` and `https://medicen.uoa.gr/application-process/` to `data/evidence/gr.json`.
   - Sources: medicen.uoa.gr/admission-requirements/ ("at least one of the following"); /application-process/ ("Predicted grades of International Baccalaureate (IB) … UCAT (score report)"); /important-dates/ ("open from December 18th, 2025 until April 30th, 2026").
2. **Stale past tense** (3.3):
   - `data/application-routes/ae-branch-campus-direct-2027.json` "were … 14 December 2026" → "are";
   - `data/application-routes/nz-direct-2027.json` and `data/countries/nz.json` "was 8 December 2026" → "is";
   - `data/application-routes/sg-autonomous-2027.json` and `data/countries/sg.json` "ran 19 September to 18 October 2026" → "runs".
3. **Small consistency fixes:**
   - `data/countries/ae.json` "three admissions environments" → "four";
   - `data/application-routes/gr-minedu-foreign-2027.json` `reason`: drop the leading "Only if" and split out the B2 clause;
   - Italy's non-EU visa card, `consequence: indicative`.
4. **Unsourced lines** (3.4):
   - `data/countries/kr.json`: cut "strong IB students are often competitive at universities that would be unreachable through the domestic route";
   - `data/countries/ae.json`: cite or cut "admission rates are in the low single digits".
5. **Lower priority:**
   - JP: say Kyushu's window is 7–11 December, and date the embassy page (2020).
   - IT: a clause on Bocconi's need-based waivers in the Money row.
   - NZ: cite the 24-point UE rule to a page that states it.
   - The template items in section 2 (duplicate cards; the AU/NZ "2027 autumn intake" header) remain for the coordinator.

With fix 1 done I would score this 8. Over three rounds the research has held up to hard sampling:
- 29 of 31 new facts here are right or not shown wrong, and every deadline and fee is exact.
- What stands between these pages and a student is one medicine programme described with a requirement it does not have and a gap it does not have.
