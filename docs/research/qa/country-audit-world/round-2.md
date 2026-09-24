# Country audit (world and Southern Europe, 15 destinations): critic round 2

Critic: a fresh **admissions counsellor**, working under `docs/QA_CRITIC_LOOP.md`. Date: 2026-09-24.
Scope: es, it, pt, gr, mt, us, ca, au, nz, ae, jp, kr, cn, hk, sg.

## SCORE: 7 / 10 (not yet)

**Round 1's fixes all landed, and I checked each one on the built pages.**
- "Applies to: non-eu" is gone from all 15 pages. The audience lines that remain are in plain English.
- The 19 undated explanation and announcement cards no longer carry a hard badge.
- The UBC, PCE, KAIST, Pamplona, US and Singapore corrections render as described.
- UC's new window, 1 October to 30 November 2026, matches UC's first-year page.
- I checked 19 facts that round 1 did not, across 11 countries. **17 are confirmed and 1 has only secondary support.** The last one is an unconfirmed date. It is not proven wrong, but it is shown as though it were confirmed (finding 3).

**This is still 7 because reading four pages end to end turned up a wrong statement about which route a student can use.**
- **Portugal tells a Danish student, in three places, that Nova SBE is a *private* school they can apply to directly.** It also says this is the fallback if the national contest fails.
- Nova SBE is a public school (part of Universidade NOVA). Its own page says an EU/EEA national cannot use its international route and must go through the national contest. The Portugal page says the same thing on its own Nova SBE calendar cards, so the page contradicts itself.
- This is not a date or a fee, so the cap of 6 does not apply. But it points the unsafe way: a student could plan around a fallback that does not exist. I would not want a student to repeat it in a meeting.

Round 1 flagged cards whose label contradicts their note, and **that pattern also survives on two cards the widened guard still misses**:
- China's Government Scholarship card: "Hard deadline" over a note saying "there is no single deadline".
- Australia's UAC early-bird card: "Later applications are considered after these" over a note saying "costs money rather than a place".

Fix those three and the BNBU dates and I would score this 8.

## 1. Guards and build

- `node src/build.mjs` wrote 152 pages.
- `node scripts/test-deadline-labels.mjs`: **ok**, 756 events, "every label agrees with its note". It passes the two cards in finding 2, because neither matches its patterns.
- `node scripts/test-page-budget.mjs`: **ok**, 35 Destination pages are inside the budget. The 15 in scope run from mt 706 to ca 1,345 words.
- **The European research-log regex**, combined from rounds 2, 3 and 4 plus the round-4 editor terms, finds **0** matches in the tag-stripped text of the 15 pages.
- **My wider regex** (`page read|re-read|could not be|this profile|fetch|Cloudflare|403|not established|at this level|as indexed|curl…`) finds these leftovers:
  - **Round 1's lower-priority lines, still present:**
    - US "all ten states in this profile";
    - CN "the one this profile covers";
    - SG "SUSS's 2027 dates could not be checked, which does not mean SUSS has published nothing";
    - SG "Not established, and probably not establishable at this level".
  - Every other "not established here" hit is legitimate gap-marking.
- **A new raw-code leak:** "See tuitionNonEu." is printed in the EU tuition row on **6 pages** (ae, cn, hk, jp, kr, sg). `tuitionNonEu` is a field name. A student reads it as a typo.
- **The superlative scan** finds nothing serious. What remains is listed in section 5.

## 2. Round-1 fixes, checked on the built pages

| Round-1 fix | Status | Evidence in `dist/` text |
|---|---|---|
| 1. "Applies to: non-eu" | **LANDED** | 0 occurrences. HK and SG cards now show no audience line. CA shows "international applicants", "US and international applicants" and similar. |
| 2. 19 undated cards marked hard | **LANDED** | All 19 are now `indicative` with no badge. See my card-by-card extraction below. |
| 2b. Widen the guard | **PARTLY** | It still misses the CGS card (CN) and a money-only card badged Priority (AU). See section 3. |
| 3. UBC 15 November | **LANDED** | "UBC International Scholars Program: apply and submit the award application", with the audience "international applicants who want an International Scholars award". The route card adds "If you are not applying for the award, your date is 15 January." |
| 4. Spain PCE timing | **LANDED** | "the week straight after your IB exams". There is no "collides" and no "inside the May". UNED gives the 2026 PCE as 25–29 May; the IB session ended 20 May. |
| 5. KAIST sector note; Pamplona | **LANDED** | "The Early round (closes 22 October 2026) starts at the end of February 2027; only the Regular round … leads to the September intake." Pamplona now appears only for housing and on its campus card. |
| 6. US and SG overclaims | **LANDED** | No "five weeks before everyone else", "halves", "high 30s", "first of the autonomous", "longest window", "does not intend", "rare in Europe" or "outside the top 20". |
| UC window (editor's own correction) | **CONFIRMED** | UC's first-year page (curl, raw HTML): "Application filing periods Fall quarter/semester: October 1–November 30". |
| 7. Lower priority | **NOT DONE** | AU still says "the cut-off *was* 23:59 … on 30 September 2026" and "The 2026-27 cycle *closed* at 23:59 on 5 February 2027", both future dates. The SG/US/CN research-log lines remain, as do UPC "the usual route into engineering in Barcelona", HK "the cheapest of the big three" and KR GKS "the flagship government scholarship". |

**How I checked the badges:** I extracted all 335 calendar cards from the 15 built pages: the date cell, the heading, the badge and the note. I then listed every `hard` card with no concrete date (41 of them).
- Almost all of the 41 are single real deadlines whose day is not out yet. That is the shape the brief asks for. Examples are "Khalifa University — Fall 2027 application deadline", "Korea University Fall 2027 application" and "University of Malta: main application deadline".
- The exceptions are in section 3.

## 3. Findings

### 3.1 Portugal: Nova SBE is called private and open to direct application (the reason this is 7)

`data/countries/pt.json` says:
- `ibRecognition` subjects (line 31): "Individual **private** institutions set their own HL rules — Nova SBE asks for at least 36 IB points with Mathematics at 6…"
- `ibRecognition.notes` (line 38): "**Private** institutions such as Nova SBE and Católica accept the IB directly with their own minimum scores and do not depend on this machinery."
- `steps` (line 216): "If you miss out, use the second or third phase, or **apply directly to a private institution such as Católica or Nova SBE**."

**What the official page says.** Nova SBE's international-students page (`novasbe.unl.pt/en/programs/apply/bachelors/international-students`, fetched 2026-09-24):
- It excludes applicants for "Being a national from a Member-State of the European Union or a State Party of the Agreement on the European Economic Area".
- It says EU/EEA nationals must apply through the National Call.
- The 36-point / Mathematics 6 rule, and the 34 points for Ocean Studies, are the *international-route* requirements, which a Dane cannot use.

**What the same page says elsewhere.**
- It lists Nova SBE among the 10 institutions "you apply through … the national contest".
- It gives three Nova SBE calendar cards marked "(non-EU only)" and saying "A Danish citizen may NOT use this route".
- A counsellor reading the page end to end sees both statements. A student reading only "How applying actually works" sees only the wrong one.

**The fix:**
- Remove Nova SBE from the three "private / apply directly" sentences. Católica is the only direct option.
- Present the 36/34-point figures, if they are kept at all, as the international route's rule that does not apply to an EU applicant.

### 3.2 The label/note contradictions round 1 named, on two cards the guard misses

| Page | Card | Badge and consequence line | Note | Fix |
|---|---|---|---|---|
| CN (`data/countries/cn.json`) | "Chinese Government Scholarship (CGS/CSC) — and its old official portal no longer works" | **Hard deadline.** "After this the door closes." | "…three routes with three different calendars … Each embassy and each university sets its own closing date, so **there is no single deadline**." | `consequence: indicative`, `dateState: varies-by-institution`. Label: "Chinese Government Scholarship (CGS/CSC): each embassy and university sets its own date". |
| AU (`data/application-routes/au-uac-2027.json`) | "Early-bird processing charge ends" | **Priority.** "Later applications are considered after these." | "Missing this **costs money rather than a place**: AUD 82 becomes AUD 215." | `consequence: indicative` (or `personal`). Priority promises something about the order of consideration that UAC does not say. |

Weaker cases of the same fault, which I note but do not score:
- **CN "Sit the CSCA before you apply":** hard, undated, with five sittings a year. The real hard point is the last sitting before each university's window, so the label is "a requirement", not a date.
- **US "Early Decision is binding — applying early is a commitment, not an early submission":** "Set by each institution", badged Priority. It is an explanation card.

Widen `scripts/test-deadline-labels.mjs` in two ways:
- Fail a `hard` card whose note matches `no single deadline|each (embassy|university|college) sets its own`.
- Fail a `priority` card whose note matches `costs money|rather than a place`.

### 3.3 China: BNBU's dates come from a page for 2025 entry, but are shown as confirmed 2026-27 windows

- The calendar shows "1 September to 31 December 2026, BNBU application period I" (Priority) and "10 February to 15 May 2027, BNBU application period II" (**Hard deadline**).
- The label says "2027-autumn", as a confirmed date would. The carried-over marker that Portugal's precedent dates carry is missing.
- The note admits "BNBU prints its periods without a year, on a page that still refers to 2025 entry".
- BNBU's page (`ido.bnbu.edu.cn/en/info/1006/1019.htm`, fetched 2026-09-24) is headed "What is the application period for International Student Application for 2025 entry?" and gives "September 1st to December 31st" and "February 10th to May 15th".
- The dates may well recur, but nothing supports them for 2027 entry.
- **Fix:** in `data/application-routes/cn-joint-direct-2027.json`, mark both milestones as precedent (`not-yet-announced`, or the carried-over state the site uses elsewhere), so the date cell reads "2025 entry pattern; 2027 not published".

### 3.4 Smaller faults a student would notice

1. **"See tuitionNonEu."** is a raw field name on 6 pages (ae, cn, hk, jp, kr, sg): `countries/<cc>.json` `money.tuitionEu.value`. Replace it with "See 'Tuition, non-EU' below", or cut it.
2. **Hong Kong's four-year tuition total overstates the page's own figures.**
   - It says "roughly HK$1.0–1.3 million in tuition alone — about DKK 900,000 to 1.1 million" (`countries/hk.json`, watch-outs).
   - The page's own 2027/28 figures give 4 × HK$230,000 to 4 × HK$280,000 = **HK$0.92–1.12 million**. Even with CUHK's 3% cap on increases, the total stays under HK$1 million at the low end.
   - Every fee on the page is right (CUHK HK$230,000 and HK$292,000 are confirmed below). Only the sum is wrong, and it errs on the safe side, so it does not trigger the cap. It is the number a parent will quote back to you, though.
3. **Hong Kong claims with no source** (`countries/hk.json`):
   - "the best programmes and scholarships will already be allocated" (HKU final-deadline note);
   - "Offers and the good scholarships go out from December. Applying later is possible at most of them but competitively worse";
   - "Because the non-local pool is separate from the JUPAS pool, a good IB student is competing in a smaller field than the raw rankings suggest". This is the site's own reasoning, not HKU's.
   - "the cheapest of the big three" is still there.
4. **Australia and New Zealand headers say "Describes the 2027 autumn intake."**
   - The AU summary says three lines later that finishing the IB in May 2027 "does not lead to an 'autumn 2027' start".
   - Every AU and NZ card also prints the raw window tag "2027-autumn", including "UAC applications close for the February intake".
   - Korea explains the same template wording in its own text ("Elsewhere on this site it means a European autumn start…"). AU and NZ do not.
   - This is template-level (`src/`), so I note it rather than score it.
5. **Portugal describes future dates in the past tense, with research-log framing.**
   - "Context, not a milestone: the vacancies left for the second phase were announced on 1 September 2026."
   - "Context, not milestones: vacancies for this phase **were announced on 9 October 2026**, and DGES must decide any final complaints by 16 November 2026." 9 October is two weeks away.
   - Make it: "Vacancies for the third phase are announced the day before it opens (9 October in 2026)".
6. **Duplicate cards.** The same deadline often appears twice, once from the country file and once from the route, with different wording:
   - HK: HKU first round, HKUST priority, HKUST close, HKU close. The pair "HKU applications close" and "HKU — final deadline" is the clearest.
   - CN: NYU ED I, ED II, DKU ED, DKU RD, XJTLU.
   - CA: UBC ×4.
   - SG: the Joint Acceptance Exercise and the Tuition Grant agreement, each twice.
   - AE: Birmingham Dubai visa sponsorship; AUS Fall 2027 opening.
   - PT: the CNAES list and the substitution deadline.
   - HK's header says "17 dated events", but there are about 11 distinct ones. No duplicate pair disagrees, so this is clutter rather than error, but a student counting deadlines is misled about how many there are.
7. **Canada, Concordia:** "Applies to: applicants who are not applying from outside Canada" is a double negative. Make it "Canadian applicants (international: 1 February)".
8. **Malta, TOEFL:** UM now lists TOEFL iBT on the new 1–6 scale ("4 overall with 4.5 writing", from January 2026) beside the old 80/20. The page gives only 80/20. A Dane sitting TOEFL in 2026-27 will receive a 1–6 score.

## 4. Sampled facts (19 facts across 11 countries that round 1 did not check)

| # | Country | Claim on the page | Verdict | Evidence (URL, short quote) |
|---|---|---|---|---|
| 1 | PT | Concurso Nacional 2026: foreign-exam substitution group 20–29 Jul; others to 6 Aug; 1st-phase results 23 Aug; enrolment 24–27 Aug; 2nd phase 24 Aug–20 Sep, results 30 Sep; 3rd phase 10–12 Oct, results 18 Oct; Despacho n.º 9359-A/2026 of 23 July | **CONFIRMED** | dges.gov.pt/pt/pagina/calendario-concurso-nacional-de-acesso-0: "Despacho n.º 9359-A/2026, de 23 de julho"; "20 de julho" to "29 de julho". It superseded a 1 June despacho, so "usually in July" is fair for 2026. |
| 2 | PT | Propina cap €697 for 2025/26 | **CONFIRMED** | dges.gov.pt/pt/pagina/propinas: "remaining thus in 697€" (2025-2026) |
| 3 | PT | "Private institutions such as Nova SBE … accept the IB directly"; the 36-point rule presented as the IB requirement | **WRONG** (a route claim, not a date or fee) | novasbe.unl.pt/…/international-students: EU/EEA nationals excluded; "must instead apply through Portugal's National Call". See 3.1. |
| 4 | AU | UAC whole-score schedule for offers from August 2026: 24→64.60, 30→79.30, 35→90.75, 40→96.85, 45→99.95 | **CONFIRMED** | uac.edu.au/future-applicants/admission-criteria/ib-applicants: "offers made from August 2026" |
| 5 | AU | UAC 2026-27: early bird to 23:59 Wed 30 Sep 2026 (save AUD 133); semester 1 2027 closes 5 Feb 2027 | **CONFIRMED** (uac.edu.au key-dates PDFs as indexed) | "Apply by 11.59pm Wednesday 30 September to save $133"; "final closing date … semester 1, 2027 is 5 February 2027" |
| 6 | AU | Subclass 500: AUD 29,710 living costs; parental income route AUD 87,856 | **CONSISTENT, secondary sources only** (Home Affairs blocks fetches, as in round 1) | Several migration-law sources agree on both figures. |
| 7 | NZ | Auckland Nursing (International) 1 Nov 2026 for Feb 2027, "five weeks before the general 8 December date"; no 2028 equivalent | **CONFIRMED** | auckland.ac.nz/…/undergraduate-application-closing-dates.html: "1 November 2026" and "8 December 2026"; 2028 lists only the four health programmes (1 July 2027) |
| 8 | NZ | Otago international: 1 May–15 November for semester 1; closes 30 April for semester 2 | **CONFIRMED** (otago.ac.nz as indexed) | "The main international student application period is 1 May–15 November"; "1 May–30 April for … semester 2" |
| 9 | MT | 2026 cycle: M.D. for local-qualification (IB) applicants with Medical Maltese 16 Mar 14:00; non-EU visa applicants 1 Jul 14:00; late applications to 15 Sep 14:00 | **CONFIRMED** | um.edu.mt/study/datesdeadlines/: "16 March 2026 at 14:00"; "1 July 2026 at 14:00"; "15 September 2026 at 14:00" |
| 10 | MT | SELT exemption: English A HL/SL ≥4, English B HL ≥4, English Literature and Performance SL ≥4 | **CONFIRMED** | um.edu.mt/study/admissionsadvice/international/exemptions/: "IB Diploma English B - Language HL at 4 points or better" |
| 11 | MT | First semester begins 4 October 2027 for first-year students | **CONFIRMED** | um.edu.mt/study/datesdeadlines/importantdates/: "Monday 4 October 2027 … For first year students" |
| 12 | GR | Ministry route for foreign nationals, 2026: online 2–9 July; courier postmark 10 July; announced a day before | **CONFIRMED** (minedu.gov.gr announcement "01-07-26 Υποβολή ηλεκτρονικής αίτησης…" as indexed; the ministry page closed the socket to a direct fetch) | "from Thursday 2 July to Thursday 9 July 2026"; "Friday 10 July 2026" |
| 13 | CN | From 2026/27 every bachelor's applicant must sit the CSCA; five sittings (Jan, Mar, Apr, Jun, Dec) | **CONFIRMED** | Embassy notice (mn.china-embassy.gov.cn/eng/zytz/202510/t20251030_11743700.htm): "applicants for bachelor's degree studies in China must take … CSCA before submitting their application"; "five times a year" |
| 14 | CN | campuschina.org no longer resolves | **CONFIRMED** | DNS lookup: "Non-existent domain" (2026-09-24) |
| 15 | CN | BNBU periods 1 Sep–31 Dec 2026 and 10 Feb–15 May 2027 | **UNCONFIRMED for this cycle** | The page is headed "…for 2025 entry". See 3.3. |
| 16 | HK | CUHK: opens 2 Oct 2026; Advance Offer Round 12 Nov 2026; Regular Round 7 Jan 2027; 2027-28 tuition HK$230,000; total about HK$292,000 | **CONFIRMED** | admission.cuhk.edu.hk/…/important-dates/: "12 Nov 2026 Application Deadline for Advance Offer Round"; …/fees/: "HK$230,000 per annum"; "approximately HK$292,000" |
| 17 | AE | Canadian University Dubai 2026-27: Fall 21 Aug (international) / 27 Aug (domestic), Spring 3 Jan 2027; nothing for Fall 2027. Sorbonne Abu Dhabi: 21 Aug 2026 for Sep 2026, 2027 not published | **CONFIRMED** | cud.ac.ae/…/deadline-for-admission: "August 21, 2026"; sorbonne.ae/…/undergraduate: "by 21 August 2026" |
| 18 | KR | Korea University Spring 2027 ran 3–31 Aug 2026; Fall 2027 TBA | **CONFIRMED** | oia.korea.ac.kr/oia2026/Admission-Guide.do: "August 3 (10:00) - August 31, 2026 (17:00)"; Fall 2027 "March, 2027 (TBA)" |
| 19 | SG | NTU Tuition Grant: chosen on the application form; accept with or without it by 17 Jul 2026; sign online 19 Sep–18 Oct 2026; two sureties; three-year bond | **CONFIRMED** | ntu.edu.sg/…/tuition-grants: "indicate that they are opting for TG in their online admission application form"; "19 September 2026 - 18 October 2026" |
| 20 | ES | UNED: the 2026/27 public-university admission deadline for international students 7 Jul 2026; pending documents to 31 Jul; grade-changing documents to 31 Oct; PCE registration 16 Mar–28 Apr and 1–22 Jul 2026 | **CONFIRMED** | unedasiss.uned.es/fechas_clave: "La fecha límite para solicitar la admisión en las universidades públicas … es el 7 de julio de 2026" |

I also re-checked UC's changed opening date (1 October), listed in section 2. Weighting as briefed:
- The sample covers PT, AU, NZ, MT, GR, CN and HK heavily, plus AE, KR, SG and ES.
- Of the cards whose label changed, it covers UBC, UC, the NZ cards and the AE cards.
- **Every deadline and fee I checked matches its official page.** The one wrong claim is about eligibility for a route.

## 5. Ranking and unsupported claims left

Most are gone. These remain:
- **HK:** the four lines in 3.4 item 3.
- **HK:** "Five universities in a small territory, all research-intensive, all internationally ranked". There are eight UGC universities, and the page lists thirteen institutions.
- **SG:** "Singapore's healthcare is excellent but not free at the point of use". Keep the second half.
- **ES:** UPC "the usual route into engineering in Barcelona". **KR:** GKS "the flagship government scholarship". Both are carried over from round 1.
- **The superlatives that are true or harmless stay:** oldest (Sydney, Otago, HKU, Keio as oldest private, Athens 1837), NZ's only vet school, and "public flagship" as the US category name.

## 6. Pages read end to end, as a student and as a counsellor

- **Australia.** It is honest about the hemisphere problem.
  - It gets the admissions-centre map exactly right: UAC open to you; VTAC, SATAC and TISC closed; QTAC unresolved and marked as unresolved.
  - The IB conversion values match UAC to the hundredth. The warning to "read the right table" (IBAS against whole-number) is the kind of trap-spotting a counsellor values.
  - Against it:
    - the early-bird card's badge (3.2);
    - two future dates written in the past tense;
    - "Describes the 2027 autumn intake" at the top of a page arguing that there is no such intake.
  - I would repeat the substance in a meeting.
- **Portugal.** The calendar is accurate to the day against DGES, and the despacho number and date check out.
  - The central insight is right and well put: EU citizens are shut out of the easy international route and must use the national contest.
  - That is exactly why the Nova SBE error (3.1) matters. The page's "what if you miss out" step sends a Dane to a door the page itself says is closed to them.
  - It also carries a lot of the previous cycle: 15 of 23 cards are 2026-cycle dates, most badged "Hard deadline", some still in the future. The header tells students to treat carried-over dates as indicative, and the badges tell them the opposite. That is a site-wide pattern the European loop accepted, so I note it only.
- **Hong Kong.** This is the most useful page for a family deciding whether they can afford it: every 2027/28 fee is exact, and CUHK's round dates are right.
  - It is let down by editorial lines about competitiveness (3.4 item 3), a four-year total that overshoots its own figures, and four pairs of duplicate cards.
- **China.** The split is right and clearly made: English-taught joint ventures on the American calendar against Chinese universities with HSK and the new CSCA.
  - The CSCA warning is current and correctly sourced.
  - The DKU note, that the Chinese-language site's January and February rounds "are not your dates", is excellent.
  - Against it:
    - the CGS card (3.2);
    - BNBU's 2025 dates presented as 2026-27 dates (3.3);
    - "the one this profile covers";
    - a Tsinghua note whose closing sentences describe the research ("That FAQ is in Chinese only, … dated to the 2017 cycle"). It is honest but long.

## Top fixes, in order of how much they raise the score

1. **Portugal: Nova SBE is public and closed to direct EU application.**
   - File: `data/countries/pt.json`.
   - In `ibRecognition` (the "Individual private institutions…" sentence), change it to "Private institutions such as Católica set their own IB rules". Move the Nova SBE 36/34-point rule, if kept, to a note saying it applies to the international route only.
   - In `ibRecognition.notes`, change "Private institutions such as Nova SBE and Católica…" to "Private institutions such as Católica…".
   - In `steps` (the last step), change "…apply directly to a private institution such as Católica or Nova SBE" to "…apply directly to a private institution such as Católica Lisbon".
   - Source: novasbe.unl.pt/en/programs/apply/bachelors/international-students (EU/EEA nationals "must instead apply through Portugal's National Call").
2. **Fix the two badges and widen the guard.**
   - `data/countries/cn.json`, the CGS card: `consequence: indicative`, `dateState: varies-by-institution`.
   - `data/application-routes/au-uac-2027.json`, "Early-bird processing charge ends": `consequence: indicative`.
   - Add the two note patterns in 3.2 to `scripts/test-deadline-labels.mjs`.
3. **Mark BNBU's dates as the 2025-entry pattern.**
   - File: `data/application-routes/cn-joint-direct-2027.json`, both BNBU milestones.
   - Use `not-yet-announced`, with the precedent in the note, so the card shows no 2026/2027 date as confirmed.
   - Source: ido.bnbu.edu.cn/en/info/1006/1019.htm ("…for 2025 entry").
4. **Remove "See tuitionNonEu."** from `money.tuitionEu.value` in `countries/{ae,cn,hk,jp,kr,sg}.json`.
5. **Hong Kong.**
   - Change the four-year total to "roughly HK$0.9–1.1 million in tuition alone (about DKK 0.8–0.95 million)".
   - Cut "the best programmes and scholarships will already be allocated", "competitively worse", "a smaller field than the raw rankings suggest" and "the cheapest of the big three" (make it "cheaper than HKU and HKUST").
   - File: `data/countries/hk.json`.
6. **Lower priority:**
   - the AU past tense ("the cut-off was", "closed at 23:59");
   - the PT "Context, not a milestone" framing and the future dates in the past tense;
   - SG SUSS/SIM, US "in this profile", CN "this profile covers";
   - the Concordia audience line;
   - the Malta TOEFL 1–6 scale;
   - removing duplicate country/route cards. That is a template decision, and it would make the HK and CN calendars much easier to read.

With fixes 1 to 3 done, I would score this 8. Round 1's work held up: every deadline and fee I sampled matches its official page, now 17 of 19 new facts plus the corrected UC window. What stands between these pages and a student is one wrong route in Portugal and two cards whose badge still contradicts their note.
