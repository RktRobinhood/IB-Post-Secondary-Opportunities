# Country audit (world and Southern Europe, 15 destinations): critic round 4

Critic: a fresh **admissions counsellor**, working under `docs/QA_CRITIC_LOOP.md`. Date: 2026-09-24.
Scope: es, it, pt, gr, mt, us, ca, au, nz, ae, jp, kr, cn, hk, sg.
I edited nothing in `data/`, `src/` or `scripts/`, and ran no git. The only file I wrote in the repo is this one.

Audience, per `docs/PRODUCT_VISION.md` "Who it is for": an EU/EEA citizen at an IB school in Denmark, usually not Danish. I judged every fact against that reader.

## SCORE: 8 / 10 (accepted)

**Every round-3 fix landed. I checked each one on the built pages.**
- The Athens MD cluster now says the IB qualifies on its own and that UCAT/MCAT is an alternative. It quotes the 18 December 2025 – 30 April 2026 window as the precedent and points final-year students to the application page's section for predicted grades.
- The tense, "four environments", "Only if: Only if", Italian and Portuguese badge, Korean and UAE sourcing, Kyushu, MEXT, Bocconi and New Zealand fixes are all in `dist/`.

**I checked 31 facts that rounds 1–3 did not, across all 15 countries.**
- Every one matches its official page.
- Two need a small caveat: Zhejiang's window and SMU's English rule for Law applicants.
- I checked five "not yet published" claims, the class of claim that held round 3 at 7: Waseda, SMU, SUTD, Khalifa and the University of Malta for 2027. All five are still true today.
- I also closed two things round 3 left open: the UNSW Design and Accounting rates, and the CityU fee.

**No deadline, fee or entry requirement I checked is wrong.** I would repeat these pages to a student in a meeting. What is left is not wrong enough to hold the round:
- the reason given on two "Not open to you" scholarship cards;
- the lack of an inline source on 80 hard-deadline cards (a template issue);
- the Danish framing that the separate audience pass will remove.

## 1. Guards and build

- `$env:SITE_BASE='/IB-Post-Secondary-Opportunities'; node scripts/qa.mjs` (PowerShell):
  - **First run:** `check`, `page-budget` and `release` failed because `/programmes/index.html` and `/planner/index.html` were missing. Another agent was rebuilding `dist/` at the same moment.
  - **Second run, straight after: 27 of 28 checks pass.** `freshness` is advisory. That includes `validate`, `labels`, `sourcing`, `evidence-policy`, `calendar`, `destinations`, `build`, `check`, `page-budget` and `release`.
  - **The one failure is `image-records`, with 7 problems:**
    - `at-jku`, `ch-unige`, `nl-uva`, `hk-hkbu` and `kr-skku` have a replacement image that was "never fetched";
    - `sdu` and `ucph` have a verdict that is "not applied".
    - This is the photo agent's in-progress work, and not scored here.
- `node src/build.mjs` with SITE_BASE unset: 152 pages, no EBUSY this time. It gave one warning, that `dk-ucph` has no programmes, which is out of scope.
- **Card extraction.** I parsed all **332 calendar cards** on the 15 built pages, reading the date, consequence, date cell, heading and note.
  - Round 3 counted 334; the Athens MD card was merged.
  - The five Portuguese non-EU cards and the Italian visa card are `indicative`.
  - No card with a "not for EU" heading carries a hard badge.
- **Research-log scan** for "this profile", "curl", "403", "as indexed", "fetched", "could not be", "Imperva": 0 hits.
  - What remains is honest gap-marking ("not established here", "behind a login").

## 2. Round-3 fixes, checked on the built pages

| Round-3 fix | Status | Evidence in `dist/` text |
|---|---|---|
| 1. Athens MD watch-out | **LANDED** | GR: "An IB of 36 points (three HL, two of them from Physics, Chemistry and Biology) qualifies you on its own; UCAT or MCAT is an alternative route, not an extra requirement". |
| 1. Athens MD card | **LANDED** | Heading "University of Athens MD in English: 2027 dates not yet published". Note: "For 2026-27 the programme's application platform was open from 18 December 2025 to 30 April 2026 … The 2027-28 dates are not yet published"; "UCAT or MCAT is one of several alternative qualifications … not an extra requirement"; "Final-year students apply on predicted grades"; clause A kept beside it with md.admissions@uoa.gr. 0 hits for "on top of your IB", "for medicine, an admissions test", "disagrees with itself", "no application deadline on any". |
| 2. Past tense on future dates | **LANDED** | AE: 0 hits for "were 24 August". NZ: "Auckland's equivalent date for February 2027 is 8 December 2026" and "its Semester One 2027 equivalent is 8 December 2026". SG: "NTU's 2026 window runs 19 September to 18 October 2026" (twice). |
| 3. AE "three environments" | **LANDED** | 0 hits. |
| 3. GR "Only if: Only if" | **LANDED** | Three cards: "Only if: At least one parent is not of Greek descent. You also need a B2 Greek certificate to enrol." |
| 3. IT visa card | **LANDED** | `data-consequence="indicative"`, heading "…(not for EU/EEA or Swiss citizens)". |
| 3. PT, same shape (extra) | **LANDED** | Five cards `indicative`: U.Porto phases 1–3 "(not for EU citizens)", Nova SBE autumn and spring "(not for EU/EEA citizens)". 0 hits for "Danish citizen is NOT". |
| 4. KR unsourced comparison | **LANDED** | "The international track is a separate pool from the domestic route. UIC, KAIST and SNU are selective." |
| 4. AE "low single digits" | **LANDED** | "NYU's own figures for autumn 2022 entry show it admitted 5% of more than 18,700 applicants". The one remaining "low single digits" is on the US page, as a general line about the most selective colleges. It is outside this fix. |
| 5. JP Kyushu window | **LANDED** | The route card now says "A five-day window: the online system is open only from 7 to 11 December, so do not plan to start the form on the 11th." |
| 5. JP embassy dated; wording firmed | **LANDED** | "…Study in Japan page (dated 3 December 2020)"; 0 hits for "does not appear to run". |
| 5. IT Bocconi waivers | **LANDED** | Money row: "Bocconi also cuts that fee by 100%, 80%, 60%, 40% or 20% on need, through one "Bocconi4Access to Education" application." 0 hits for "does not price EU and non-EU". |
| 5. NZ 24 points sourced | **LANDED** | "…University of Auckland's own IB page ("you must achieve a minimum of 24 points") … in a document dated 2010." |
| Deferred template items | **Still present** | Duplicate cards (for example HK "HKU — first round" beside "HKU first round closes"). The "Describes the 2027 autumn intake" header sits on the KR, AU and NZ pages. "IB results released" still inherits the Greek route's "Only if". |

## 3. Findings

### 3.1 Two "Not open to you" cards give a Danish reason to every reader (KR, JP)

**Korea.** The card "Global Korea Scholarship, Embassy Track" renders **Not open to you** with the reason "Denmark is not one of the 74 countries invited to the 2027 Embassy Track".
- The 2027 GKS-U guidelines (NIIED PDF, the page's own source, table of invited countries) list among the 74 **"9 Bulgaria"**, **"16 Czech Republic"**, **"50 Poland"** and **"58 Sweden"**.
- The Czech Republic and Sweden are two of the nationalities `PRODUCT_VISION.md` names as typical readers.
- **The card's state is still right for this cohort, for a different reason.** The guidelines say applicants "expected to graduate (as of December 31, 2026)" must submit a graduation certificate "by December 31, 2026". A May 2027 IB candidate cannot, whatever their passport. The page says so elsewhere.
- **What is wrong is the reason.** It tells a Swedish or Czech student that the Embassy Track is closed to them *because of nationality*. The page then says "the round to plan for is 2028", and for them the 2028 Embassy Track may well be open.
- The watch-out ("closed to Danish citizens") and the steps ("On a Danish passport only the University Track's UIC Program is open") are correctly qualified. Only the card is not.

**Japan.** The card "MEXT scholarship, Embassy Recommendation, for arrival in April 2028" renders **Not open to you**, with a reason about Danish nationals.
- The watch-out now correctly says it depends on the embassy of your nationality.
- I spot-checked Germany. The Embassy of Japan in Germany (de.emb-japan.go.jp/itpr_de/austausch_stipendien.html, dated 2026/9/1) offers German nationals "die nachfolgenden zwei Stipendienmöglichkeiten", the research and language scholarships, and no undergraduate track. So the practical answer is probably the same for many EU readers.
- But the card and the watch-out on the same page still disagree.

Round-3-fixes already flagged both routes to the coordinator: they are pinned `closed` by `scripts/test-calendar.mjs`. My view as counsellor: the state can stay closed for the 2027 GKS round, but the **reason** must be one that is true for every reader.
- For GKS: the graduation-certificate rule, and then "the invited-country list is set each year: check it for your nationality".
- For MEXT: `conditional`, with the nationality rule as the condition.

### 3.2 SMU and English A (SG, small, matters for EU readers)

- The page says twice that "SMU does not ask IB Diploma holders for SAT, IELTS or TOEFL". That is confirmed (section 4, row 13).
- But SMU's IB page adds "English Requirements for Law /Computing & Law Applicants: Grade 6 or 7 in English A1 at Higher Level or Standard Level…", with shortfalls "considered on a case-by-case basis".
- Many readers at a school in Denmark take English B. A clause, "(Law and Computing & Law want English A at 6 or 7)", would stop one of them assuming Law is open on English B.

### 3.3 80 hard-deadline cards carry no inline source (template)

- Of the 332 cards, **182 have no "Source" link**, and 80 of those are badged hard.
- Examples:
  - CA: "UBC applications close", "McGill University - applications close for Fall 2027";
  - KR: "KAIST recommendation letter due";
  - JP: "UTokyo College of Design video assignment window";
  - US: "MIT financial aid application, Early Action".
- Most are the country-file twin of a route card that *does* carry a source. This is the duplicate-card issue seen from the other side.
- The evidence exists: for example `ev-jp-utokyo-cod-2027` quotes the video window word for word. But a counsellor checking a date from the card cannot get to it in one tap.
- It is not a data fault, so I note it for the coordinator with the other template items. Retiring the duplicates would fix most of it.

### 3.4 Wording written for a Dane (noted, not scored)

- Across the 15 pages there are about 70 instances of "Danish citizen", "Danish IB", "a Dane", "Danish gymnasium" and similar. The most are in CA, JP and US (9 each) and IT (7).
- **None of the ones I read gives an EU/EEA reader a wrong fact.** "As a Danish citizen you travel on your passport or ID card" (ES, IT) and "As a Dane you pay the international or out-of-state rate everywhere" (US) are true for every EU/EEA citizen; they are only framed for the wrong reader.
- Two exceptions deserve a note for the audience pass:
  - The two "Not open to you" cards (3.1).
  - "Denmark's SU works differently for a full degree outside the EU/EEA" (KR, SG, and elsewhere). SU eligibility for a non-Danish EU citizen in Denmark is its own question, and that line reads as if every reader has SU to lose.

### 3.5 Minor

- **CN, Zhejiang.** "For 2026, Zhejiang ran 1 December 2025 to 28 February 2026" is right. The same guide adds "部分专业截止日期为2026年5月31日" (some majors to 31 May 2026). The page's conclusion, "expect windows to close before IB results", still holds, so this is completeness only.
- **CA, Dalhousie.** The page is right. The same page also says high-school applicants should apply early "to secure guaranteed housing by May 15", which the Dalhousie card could mention the way the UBC card does.
- **AE, NYUAD's IB profile** (median 40, 25th–75th percentile 38–41) is recorded in `ev-ae-nyuad-admit-rate-2022` and still unused. It would tell an IB student more than the admit rate does.

## 4. Sampled facts (31 new facts across all 15 countries, none from rounds 1–3)

| # | Country | Claim on the page | Verdict | Evidence (URL, short quote) |
|---|---|---|---|---|
| 1 | CA | Dalhousie Sept 2027: Nursing, Health Sciences, Medical Sciences, Social Work 15 Feb 2027; Environmental Design Studies 1 Mar; scholarships 15 Feb; accept by 1 May; others "where space is available" | CONFIRMED | dal.ca/admissions/dates-and-deadlines.html: "Feb. 15, 2027"; "March 1, 2027"; "applications can be considered before the start of classes in September" |
| 2 | CA | UBC: first-year housing guarantee 1 May 2027; accept and pay deposit 1 May to 1 June 2027 | CONFIRMED | you.ubc.ca/applying-ubc/dates-deadlines/: "Application deadline for first-year housing guarantee" May 1, 2027; "May 1, 2027 or June 1, 2027" |
| 3 | CA | Math AI SL: Toronto accepts it for Advanced Functions only; McGill will not take it as a prerequisite | CONFIRMED | future.utoronto.ca/requirements-international-high-schools: "will satisfy the Advanced Functions prerequisite (only)"; mcgill.ca/…/international/ib: "(SL Math AI) is not acceptable as a math prerequisite" |
| 4 | AE | AUS Fall 2027: opens 19 Oct 2026; Early File Completion 5 Jul 2027; no closing date; classes 23 Aug 2027 | CONFIRMED | aus.edu/admissions/bachelors-degrees/deadlines-and-important-dates-for-undergraduate-admissions: "August 23, 2027"; no Fall 2027 closing date listed |
| 5 | AE | Heriot-Watt Dubai: rolling; most apply 6–10 months ahead; up to three weeks before the intake | CONFIRMED (curl, text in page JSON) | hw.ac.uk/dubai/study/apply: "We can accept applications up until 3 weeks before the start of each intake"; "Most students apply 6–10 months in advance" |
| 6 | AE | Khalifa: Fall 2026 closed; "Stay tuned for the Fall 2027 application timeline" | CONFIRMED (still unpublished today) | ku.ac.ae/undergraduate-admissions: "Undergraduate admissions for Fall 2026 are closed." |
| 7 | US | The Common App opened its 2026-27 season on 31 July 2026 | CONFIRMED | commonapp.org/blog/common-app-opens-application-launch-2026-27-season/: byline "July 31, 2026" |
| 8 | US | ASU international first-year page shows only fall 2026 (15 Jan 2026) and spring 2027 (1 Nov 2026) priority dates | CONFIRMED | admission.asu.edu/apply/international/first-year: "Jan. 15, 2026"; "Nov. 1, 2026"; nothing for fall 2027 |
| 9 | KR | KAIST recommendation letter due 21 Jan 2027, 18:00 KST | CONFIRMED | admission.kaist.ac.kr/intl-undergraduate/application/ApplicationGuide/ApplicationTimeline: "January 21, 2027, 6:00 PM (KST)" |
| 10 | KR | KAIST interview 3 Mar 2027, only if required; results 25 Mar | CONFIRMED | same page: "Interviews may be conducted if deemed necessary"; "March 25, 2027, 10:00 AM (KST)" |
| 11 | KR | GKS 2027: expected graduates need a graduation certificate by 31 Dec 2026, so a May 2027 IB candidate is ineligible | CONFIRMED | NIIED 2027 GKS-U guidelines (studyinkorea.go.kr PDF, the page's source): "must submit a graduation certificate … by December 31, 2026" |
| 12 | SG | NTU: photograph and appraisal form 26 Mar 2027; IBO transcript access "before July 2027" for May candidates; documents 22 Mar | CONFIRMED | ntu.edu.sg/…/international-baccalaureate-diploma: "by 26 March 2027"; "before July 2027"; "by 22 March 2027" |
| 13 | SG | SMU's IB page shows only AY2026-27 (17 Nov 2025 – 19 Mar 2026; predicted scores 31 Mar 2026); no SAT/IELTS/TOEFL for IB holders | CONFIRMED, with the Law caveat in 3.2 (browser pane) | admissions.smu.edu.sg/…/ib-diploma: "AY2026-27 application closing date: 19 March 2026"; …/international-and-other-qualifications: "are not required for applicants with IB Diploma" |
| 14 | SG | SUTD shows only the 2026 window: IB 2 Jan – 2 Mar 2026 | CONFIRMED (still unpublished today) | sutd.edu.sg/admissions/undergraduate/: "2 January to 2 March 2026" |
| 15 | JP | UTokyo College of Design: video 13–16 Nov 2026; Route B first screening 22 Dec; final 20 Feb 2027; 50 Route B places | CONFIRMED | design.adm.u-tokyo.ac.jp/admissions/admissions-overview-2027/: "From November 13 at 12:00 PM to November 16 at 11:59 PM, 2026 (JST)" |
| 16 | JP | UTokyo PEAK's last intake was September 2026 | CONFIRMED | peak.c.u-tokyo.ac.jp/apply/l3/Vcms3_00000439.html: "will be the last student recruitment for the PEAK" |
| 17 | JP | Waseda English-based: only the Sept 2026 window (8 Jan – 10 Feb 2026) is published | CONFIRMED (still unpublished today) | waseda.jp/inst/admission/en/undergraduate/english/: "10:00 AM, Jan 8, 2026 ～ 5:00 PM, Feb 10, 2026 (JST)" |
| 18 | NZ | Otago semester 2 2027: accommodation deadline 15 May 2027; accommodation opens 1 Apr 2027 | CONFIRMED (browser pane; curl 403) | otago.ac.nz/international/…/key-dates-for-new-international-students: "15 May 2027 Deadline to apply for accommodation for semester 2"; "1 April 2027 Applications open for residential colleges" |
| 19 | ES | UNEDasiss accreditation 4 Feb – 1 Dec each year; at least 6 weeks before registration closes; 3 months legally, usually 3 weeks; post from abroad over 15 working days | CONFIRMED | unedasiss.uned.es/fechas_clave: "se abre el 4 de febrero y se cierra el 1 de diciembre"; "como mínimo, 6 semanas antes"; "superior a 15 días laborales" |
| 20 | PT | Nova SBE spring intake (non-EU route) 10 Nov – 4 Dec 2026, 17:00 Lisbon | CONFIRMED | novasbe.unl.pt/…/international-students: "From November 10 to December 4, 2026, until 5.00 pm Lisbon time" |
| 21 | PT | CNAES republishes the homologous foreign-exam list by 31 May of the application year | CONFIRMED | dges.gov.pt/en/node/172: "A CNAES divulga, anualmente, até 31 maio do ano da candidatura" |
| 22 | IT | Bocconi test cut-offs: Early Session until 24 Sep 2026; Winter Session last test 21 Jan 2027; platform closes days before each deadline | CONFIRMED | unibocconi.it/…/admissions: "until 24 September 2026"; "the last available test date is 21 January 2027" |
| 23 | IT | TOLC: one of the same type a month, February to November, €35 | CONFIRMED | cisiaonline.it/…/home-tolc-generale/: "ogni mese"; "da febbraio a novembre"; "Il TOLC costa 35 euro" |
| 24 | MT | UM main deadline precedent 22 Jul 2026 14:00; late to 15 Sep 14:00, not for M.D. or limited-number courses; fee non-refundable | CONFIRMED | um.edu.mt/study/admissionsadvice/admissionsfaqs/: "up to 22 July 2026 at 14:00"; "Application fees are non-refundable." |
| 25 | MT | MCAST is free for EU candidates | CONFIRMED | mcast.edu.mt/key-information-for-full-time-programmes/: "MCAST course are free for Maltese and EU candidates." |
| 26 | HK | HKU 2027/28 non-local: HK$280,000 STEM, HK$250,000 non-STEM, HK$590,000 MBBS/BDS | CONFIRMED | admissions.hku.hk/fees-and-scholarships/tuition-and-living-expenses: "HK$ 280,000"; "HK$ 590,000" |
| 27 | HK | PolyU 2027/28 HK$240,000; CityU 2027/28 not set, HK$190,000 in 2026/27 | CONFIRMED (CityU in browser pane) | polyu.edu.hk/…/international-other-qualifications-tuition-fees: "HK$240,000"; cityu.edu.hk/admo/fees-and-scholarships: "To be announced in due course … HK$190,000" |
| 28 | CN | Zhejiang 2026 window 1 Dec 2025 – 28 Feb 2026; CSCA required | CONFIRMED, with the note in 3.5 | iczu.zju.edu.cn/…/c68714a2981384/page.htm: "2025年12月1日起至2026年2月28日"; some majors "2026年5月31日" |
| 29 | GR | ACG publishes no Fall 2027 deadline and refers to late admissions | CONFIRMED (browser pane) | acg.edu/admissions/undergraduate-admissions/: no deadline; …/late-admissions/: "Are you late to apply for college?" |
| 30 | AU | UNSW 2026 international: Design AUD 1,000 and Accounting AUD 1,180 per UOC (round 3 could not read these) | CONFIRMED (browser pane) | unsw.edu.au/student/managing-your-studies/fees/international: "SDES Design Studies $1,000"; "ACCT Accounting $1,180" |
| 31 | MT | UM 2027 deadlines "not published on 2026-09-24" | CONFIRMED (still unpublished today) | um.edu.mt/study/datesdeadlines/ gives only the October 2026 intake, with applications "now closed", and nothing for 2027. The other four "not yet published" checks are rows 6, 13, 14 and 17. |

**The weighting:**
- About half the rows are deadlines, a quarter fees, and the rest are requirements and routes: the Math AI rule, the GKS graduation rule, SMU tests, MCAST, ACG and PEAK.
- Five rows test "not yet published" claims, the class of claim that was wrong in round 3.
- Nothing is wrong. There are two caveats: Zhejiang's later closing date for some majors, and SMU Law's English A rule.

## 5. Pages read end to end, as a student and as a counsellor

### South Korea

This page is built around the one thing most likely to go wrong: which intake a date belongs to. It names March 2027 as gone, and September 2027 and March 2028 as the two real doors.
- KAIST is exact: the window, the recommendation letter a week later, a conditional interview, results on 25 March. "Ask your referee in November, not in January" is counsellor advice.
- The GKS graduation-certificate rule is right, and it is the fact that matters most.

Against it:
- the "Not open to you" reason (3.1);
- "an IB Diploma from a Danish gymnasium" (in Denmark the IB is taught at a gymnasium, so the phrase is accurate; it just assumes the reader);
- "Your Danish EHIC does not apply" (true of any EU EHIC).

I would hand this to a family.

### Portugal

Right on the thing EU readers most need to hear: the international-student statute excludes them, and the Concurso Nacional is their door. The page says so in the short version, the watch-outs, the steps and five correctly unbadged non-EU cards.
- It catches the substitution group's earlier deadline (20–29 July against 6 August) and the 31 May CNAES list, and says why they matter.
- It points out that the Concurso runs after IB results, and that makes the late timetable a strength.

Against it:
- the 2026 precedent dates carry hard badges on a page about 2027. They are labelled "2026 entry — 2027 calendar not yet published", and the labels hold;
- the Danish framing in the short version ("a Danish student must use the national one", "EU citizens — including Danes") is true for all EU/EEA readers but written for one.

### Singapore

The best treatment of a money trap on any page I have read in this audit. The Tuition Grant is set out as a contract:
- the two sureties;
- the liquidated damages if you withdraw midway;
- the tick-box as the real decision point.

NTU's calendar is complete, including the photograph form on 26 March and IBO access "before July". The page is right that SUTD, SMU and SIT have not published 2027.

Against it:
- SMU Law's English A requirement (3.2);
- "Denmark's SU" assumes every reader has SU.

A counsellor could run a Singapore meeting from this page.

## 6. Ranking and unsupported claims left

- No new unsourced ranking claims in the sections I read.
- Still unchecked from earlier rounds:
  - JP "its first new undergraduate faculty in about seventy years" (UTokyo);
  - AU "Most Australian universities charge either no application fee or AUD 100-150".
- Both are hedged or low priority.

## Top fixes, in order of how much they raise the score

1. **Give the two "Not open to you" cards a reason that is true for every reader.**
   - Files: `data/application-routes/kr-gks-embassy-2027.json`, `data/application-routes/jp-mext-embassy-2028.json` and the pin in `scripts/test-calendar.mjs`. This is a coordinator decision, already flagged in round-3-fixes.
   - GKS: keep `closed` for the 2027 round, with the reason "The 2027 round needs a graduation certificate by 31 December 2026, which a May 2027 IB candidate cannot supply. The invited-country list is set each year (2027 includes Bulgaria, the Czech Republic, Poland and Sweden, not Denmark); check it for your nationality for 2028." Source: the NIIED 2027 GKS-U guidelines PDF already on record.
   - MEXT: make it `conditional` on nationality, with the watch-out's wording.
2. **SMU Law and English A.** In `data/countries/sg.json`, next to "SMU does not ask IB Diploma holders for SAT, IELTS or TOEFL", add "Law and Computing & Law want English A at grade 6 or 7 (HL or SL); shortfalls are considered case by case." Source: admissions.smu.edu.sg/admissions-requirements/ib-diploma, "English Requirements for Law /Computing & Law Applicants".
3. **Template, for the coordinator:**
   - retire the duplicate country-file cards, or give each card its route's source link, so no hard card is without a one-tap source (80 today);
   - drop the "Describes the 2027 autumn intake" header on KR, AU and NZ;
   - stop "IB results released" inheriting a route's "Only if".
4. **Small completeness:**
   - CN Zhejiang: "(some majors to 31 May 2026)".
   - CA Dalhousie: the 15 May guaranteed-housing date.
   - AE: NYUAD's IB median 40 (38–41), already in `ev-ae-nyuad-admit-rate-2022`.
5. **The audience pass** (separate): about 70 Danish-framed lines on these 15 pages, and the SU lines, which assume Danish SU eligibility.

**Why 8:**
- Four rounds of hard sampling have now found nothing wrong in the deadlines and fees of these 15 pages. This round covered 31 more facts, five of them the "not yet published" kind.
- The one entry requirement that held round 3 back is fixed everywhere it appeared.
- What remains is the reason on two scholarship cards, whose state is right this cycle, a template sourcing gap, and framing.
- I would ship these pages to students today.
