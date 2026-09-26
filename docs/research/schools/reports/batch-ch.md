# Batch report: Switzerland, ch-* (issue #43)

Researched 2026-09-26 with WebFetch/WebSearch and curl (no browser: the pane is shared). Hand-off checks are
fetch-based; where a table loads by JavaScript, the underlying JSON was read instead and is named below.

## ch-eth (none, German)
- Scope none: "The main teaching language in all Bachelor's degree programmes is German" (admission-prerequisites page).
- 2027 dates are published, with years, in JSON tables behind the dates page (`.../dates/_jcr_content/par/table_83420306_copy_.tableComp.json`): "Application period 01.12.2026 - 31.03.2027"; "Submission of German language certificate until 31.03.2027 at the latest"; "Submission of upper secondary school-leaving certificate immediately upon receipt, until 31.08.2027 at the latest"; "Start of the study 20.09.2027".
- Improves on data/countries/ch.json, which marks the 1 Dec–31 Mar period "provisional" and "published with no year": the dates page gives the years.
- Exam route: the autumn-2027 table for "Admission with entrance examination" (`table_1322192949_cop_1566530997`) says applying 01.12.2026–31.03.2027 leads to "Entrance exam 17.01.2028 - 27.01.2028" and "Start of the study programme 18.09.2028" — matches ch.json's framing.
- IB rule is from the country list PDF headed "Academic Year 2026/27"; the 2027/28 list is not out. ETH says "changes to the entry requirements for all Bachelor's degree programmes from the autumn semester 2028 onwards … Further details will be available on our website from spring 2027."
- Could not verify: the application fee amount ("An application fee is charged", no figure).
- Hand-off: the non-Swiss-certificate bachelor's application page (a hub, not a list; bachelor's only).

## ch-epfl (none, French)
- Scope none: "Bachelor: Most courses are given in French. In principle, there is a maximum of one course given in English per semester … From the second year, study plans may include up to 50% of courses given in English." (teaching-languages page).
- Dates are EPFL standing dates, published without a year: "Applications can be submitted from mid-November to the 30th of April to start your studies at EPFL the following September"; "Uploading form to be completed and submitted on July 10 at the latest (September 30 exceptionally for school certificates and diplomas delivered after July 10)"; "must be submitted no later than September 30th. Admission is otherwise canceled." Labelled "(standing date)". Opening day not recorded: "mid-November" gives no day.
- Decision month only ("accepted at the beginning of August within the places available"), so no decision date recorded.
- IB rule agrees with data/countries/ch.json (HL Maths, Physics, and chemistry/biology/CS; 38/42; 6 in Maths and Physics). Page adds: "The general average (or total number of points scored) of the school-leaving certificate will be used to rank and select the applicants." "The criteria are valid for the ongoing year" — 2027 criteria not separately published.
- Hand-off: the bachelor admission criteria page (bachelor's/CMS only).

## ch-unige (none, French)
- Scope none: "As a general rule, French is the language of instruction at the University of Geneva, especially at the Bachelor's level" (French exam page). Some bachelor's are bilingual: the ISBA bachelor lists "Langues d'enseignement Français, Anglais". No fully English-taught bachelor's found; the programme list loads by JavaScript, so a browser re-check of teaching languages across all bachelor's would confirm.
- No dates recorded: the conditions page is "enrollment conditions 2026-27" and the Statute (Art. 55) leaves deadlines to the rector, so 30 April 2027 is not published. 2026-27 wording: "Another deadline is April 30 for candidates who, according to their nationality, are not subject to a visa for entry into Switzerland for more than 90 days"; otherwise "February 28". Kept as a note labelled 2026.
- IB rule (2026-27 conditions): "International Baccalaureate, with 3 exams at the higher level, including one science subject (mathematics, chemistry, biology or physics) … At least 32 points, not including bonus points … the applicant must also pass the French test organized by UNIGE (possible exemptions)." The page lists unrecognised subjects (Psychology, ESS, Global politics, Visual arts, etc.), which data/countries/ch.json does not mention.
- data/countries/ch.json has `ibPageUrl: null` for UNIGE; the conditions page's IB filter is the IB page.
- Hand-off: enrolment conditions page (filterable by diploma; bachelor's and other levels share it — no bachelor-only list exists in English).

## ch-unibas (none, German)
- Scope none: "The language of instruction in bachelor's degree programs, but also in some master's degree programs, is predominantly German" (Language Skills page). BA English is "Language of instruction English" but "English is studied as one of two degree subjects, each worth 75 CP", so it is not a whole English-taught degree.
- No dates: the deadlines page lists "Fall Semester 2026 Sign up until 30 Apr 2026 Late applications until 31 July 2026" and "Spring Semester 2027 … 30 Nov 2026"; autumn 2027 is not yet listed. 2026 pattern kept as a labelled note only.
- Contradicts data/countries/ch.json's summary of the swissuniversities rule ("At least three of the six must be Higher Level"): Basel's own IB page says "One of the subjects in IB/DP group 4 or 5 must have been taken at Higher Level", and its sixth group allows "Computer Science, Music, Philosophy, Psychology, Social Anthropology". Trusted Basel's page.
- German: page says students "are advised to have attained language skills at Level C1"; no certificate is named as an admission requirement. ch.json has no Basel-specific language line.
- ch.json note calls Basel "Switzerland's oldest university"; not used (no Basel page cited says so).
- Hand-off: bachelor's admission with foreign qualifications (bachelor-only page).

## ch-unibe (none, German)
- Scope none: "Candidates who wish to enroll in a bachelor's program at the University of Bern and are not native speakers of German must provide proof of sufficient knowledge of the German language (level C1)" (Admission Requirements 2026/27 PDF, 1.8). No English-taught bachelor's found.
- No dates: the only published deadlines are in the "Academic year 2026/2027" brochure: "Non-medical study programmes … 30 April [regular] 31 August [late]"; "Late applications from candidates who require a visa in order to enter Switzerland are excluded"; Medicine "15 February not possible". Kept as notes labelled 2026/27.
- IB rule (PDF 5.8.1): "The Baccalauréat International is recognised, if the school-leaving certificate shows 32 out of 42 points (without bonus points) and 6 subjects according to chapter 5.4.2. At least 3 subjects must be in the Higher Level, of which at least 1 in Mathematics or another scientific subject" — matches ch.json.
- ch.json has `ibPageUrl: null` for Bern; the IB rule is in the 2026/27 admission PDF.
- Could not verify: whether a school IB German A counts as "language of instruction of the upper secondary school-leaving certificate" for the German exemption.
- Hand-off: international-certificate bachelor's application page (bachelor-only).

## ch-unil (none, French)
- Scope none: country table and conditions assume French; French exam "Required level: minimum B1". No English-taught bachelor's found on UNIL's pages.
- Dates are standing dates from Directive 3.2, art. 15 (adopted, last updated 02.12.2025, no year): "30 avril • Dossier complet de demande d'immatriculation au semestre d'automne (bachelor, master et diplôme de l'EFLE), pour les personnes ni soumises à l'ECUS ni soumises à l'obligation d'obtention d'un visa"; "28 février • Dossier complet de demande d'immatriculation (bachelor, master et diplôme de l'EFLE), pour les candidat·es devant obtenir un visa". UNIL's enrolment page confirms the cycle is live: "Semestre d'automne 2027/2028 L'admission sur dossier en bachelor est ouverte".
- ch.json's `admissionsUrl` for UNIL is the generic enrolment hub; the targeted page is "bachelor-avec-diplome-etranger". Its deadline section still reads "Deadlines for the academic year 2026/2027" (same dates).
- IB rule (2026/2027 country table): "3 exams at High Level and 3 exams at Standard Level … Mathematics or one subject in experimental sciences must be taken at High Level. Required grade: 32 points"; not recognised: "Literature and performance, Global politics, … Psychology, … Visual arts, Environmental systems and societies …". ch.json does not list excluded subjects.
- Not recorded: the 2027 French exam date (2026's was "20 August 2026 (for the autumn semester)").
- Hand-off: bachelor's-with-foreign-diploma page (bachelor-only).

## ch-hsg (listed, 3 programmes)
- Scope listed: "The Assessment Year in Economic Sciences (BWL, VWL, IA, Law and Economics) can be taken either entirely in English or entirely in German" (admission page); Assessment Year page: "English track: in Economics or International Affairs". Majors: BWL "you can study primarily in German or English; however, at least 12 ECTS-Credits must be completed in the 'other' language"; Economics "You can decide for yourself by choosing the respective courses"; BIA "can be predominantly studied in either English or German. However, a minimum of 9 ECTS credits must be completed in the complementary language". Law and Economics: "Implementation in German" — excluded; Law and Computer Science German-only — excluded.
- Programmes are the three majors reached through the English-track Assessment Year (you apply to the Assessment Year, not the major). Credential BA: FAQ says any major leads "to a Bachelor of Arts degree". The BWL page also calls it "(BBA)"; BA used.
- ch.json lists four majors reachable in English ("Business Administration, Economics, International Affairs or Law and Economics"); the English track's specialisations are Economics or International Affairs, and BLE is "Implementation in German". Partial contradiction: BLE is reachable after the English Assessment Year but is taught in German.
- 2027 dates published on the selection-procedure page: "Online aptitude test: Tuesday, 16 February 2027, 2 p.m. – 5 p.m. (CET) Video interview: Thursday, 18 February 2027 … Online aptitude test: Tuesday, 8 June 2027 … Video interview: Thursday, 10 June 2027"; "If you submit your full application by 10 January, you may register by 31 January for the selection procedure in February" (years inferred from the February 2027 sitting).
- Standing dates: "Application period: 1 October - 30 April"; IB guideline: predicted grades and subject combination "fristgerecht bis zum 30. April".
- IB rule (HSG guideline, valid from autumn 2020): 32/42, six groups, three HL with maths or a group-4 science at HL; non-recognised subjects include Psychology, ESS, Global Politics, Visual Arts, Music, Theatre. Agrees with ch.json's 32-point line. ch.json `ibPageUrl: null` — the guideline PDF is the IB page.
- Hand-off: the Assessment Year page (bachelor-only; explains both tracks and the majors they lead to).

## ch-usi (listed, 3 programmes)
- Scope listed: "The Bachelor of Science in Informatics and the Bachelor in Data Science are taught entirely in English. From A.Y. 2024/25, the Bachelor in Economics also offers an English-language track (in parallel with the Italian-language track)" (Bachelor's at a glance). Matches ch.json.
- Economics caveat: same page says "Italian is the official teaching language of the Bachelor's degrees in … Economics"; admission page: "students may choose to take the 'core' courses entirely in Italian … or entirely in English"; English stream needs "an English language certificate of at least B2 … presented at the time of enrollment"; "Students possessing a secondary school leaving certificate from an English-speaking high school are exempt" (whether an IB school counts is not stated — could not verify).
- 2027 dates published on each programme's application page: "Academic Year 2027/28 Autumn Semester 2027 (September) Opening of applications: December 2026. … 30 April 2027 for international (non-EU/EFTA) candidates. 30 June 2027 for Swiss and European (EU/EFTA) candidates who do not require a visa". Opening has no day, so not recorded.
- Contradicts nothing in ch.json, but ch.json has no USI deadline (its "Other Swiss universities" entry says "typically closing 30 April"); for EU/EFTA applicants USI's is 30 June 2027.
- Fees (tuition page): from 2027/28 "a semester fee of CHF 5,000 will apply" for non-resident students; "reduced to CHF 2,000" for residents. Recorded per programme as tuitionEuEea "CHF 10,000 a year"; not in notes (country rule).
- IB: the admission page defers to swissuniversities for "the accepted subjects and the minimum final score"; the ib line cites 32/42 as the 2026/27 swissuniversities figure.
- Excluded: Architecture, Communication (Italian B2), Philosophy (Italian B1), Theology, Italian Language, Medicine (taught in German at Basel/Bern).
- Hand-off: "Bachelor's at a glance" (bachelor-only; names the two English degrees and the English track; 9 bachelor's listed).

## ch-unifr (none, French or German)
- Scope none: "French and German are the teaching languages of the University of Fribourg, apart from specific cases such as language and literature studies and a few Master's study programmes which are taught in English"; bachelor's need "French or German … B2" (language-proficiency page).
- Dates are standing: "Autumn semester General application period: 1 February - 30 April Late application period (specific conditions): 1 Mai - 31 August Application period for candidates requiring a visa: 1 February - 28 February"; "the opening date for online application may be slightly carried forward from year to year", so no opening date recorded. The admissions calendar lists dates only to 31.01.2027 so far.
- IB: Fribourg's per-country list is a Flutter app (admin.unifr.ch/cageo) that could not be read by fetch; IB line relies on swissuniversities' IB page, which lists Fribourg among universities on the 32-point baseline. Could not verify a Fribourg-specific IB page. ch.json `ibPageUrl: null` agrees.
- Possible trap for a reviewer: the foreign-certificate page says "If you will be completing your baccalaureate … during the summer, we strongly recommend you to apply for the autumn semester of the following year" — it sits in the ECUS paragraph, so read as ECUS candidates only; not put on the page.
- Hand-off: bachelor's admission with a foreign certificate (bachelor-only).

## ch-unilu (none, German)
- Scope none: "German is the primary language of instruction at the University of Lucerne … Master's programmes that are entirely taught in English do not require proof of German proficiency" (Admission Guidelines 2026/2027, § 32) — English-only teaching exists at master's level only.
- Standing dates from the live application page (no year): "Registration is possible from 15 February for the autumn semester"; "Autumn semester April 30"; late "June 30 for applications from countries WITH visa requirements. August 31 for applications from countries WITHOUT visa requirements". Same in the 2026/27 guidelines § 1.
- IB (guidelines § 21): "at least 32 out of 42 points (excluding bonus points) … At least three subjects must be completed at Higher Level (including at least one mathematics or science subject)". Matches ch.json.
- German (§ 33): "Proof of sufficient German language proficiency does not need to be submitted with the application; however, it must be provided by the start of the programme."
- ch.json note calls Lucerne "Switzerland's smallest and newest public university"; not used (unsourced). Also calls it "strong in … health policy"; summary sticks to its faculties.
- Hand-off: application and admission page (covers bachelor, master, doctorate — no bachelor-only page exists).

## ch-franklin (catalogue)
- Scope catalogue: all teaching in English; applicants apply to "the bachelor of arts program" and "As students progress, they choose a major field of study". Majors page lists 18 majors plus a Political Science emphasis variant and combined majors; the page gives no count, so `courses` left out.
- Dates are standing (no year) from the admission page: "Early Action Priority Deadline: December 1"; "The Admissions Committee will notify you of the decision by January 15"; "Visa-seeking Students: Regular Application Deadline is May 1"; "Non-Visa Students (including EU/EFTA …): Rolling admissions continue through mid-August, depending on availability. Regular Application deadline is July 15"; deposit "required by May 15 for the Fall Semester".
- IB: no minimum points published; IB is listed under "Advanced Standing". English: "Applicants whose primary language of instruction is not English must provide proof … TOEFL: 90, IELTS – 6.5, and DET – 110". Could not verify whether an English-taught IB Diploma waives the test (page speaks of "primary language of instruction").
- ch.json says "tuition … is not confirmed here"; not researched (fee is a country-record matter).
- Hand-off: majors page (undergraduate-only; 18 majors).

## ch-ehl (listed, 1 programme)
- Scope listed: one bachelor, "our Bachelor program is delivered in English or in French (please note the Preparatory Year is only delivered in English)"; programme H1 "Bachelor in International Hospitality Management", diploma "Bachelor of Science (HES-SO) in Hospitality Management".
- 2027 dates published: "Application deadlines for September 2027 31st May 2027 (VISA deadline) 15th June 2027 (Final deadline)" (admission-procedures page).
- IB: "We only consider full IB Diploma From September 2026 to February 2029 intakes minimum 28/42, priority to 30/42"; subjects are "recommended … priority will be given" until 2029, then required. English: C1, met by studying "one of the following curricula in English: IB".
- ch.json calls EHL "The world's best-known hospitality school" — not used (unsourced superlative). ch.json's englishBachelors line ("Bachelor in International Hospitality Management, taught in English") agrees, though French is also offered.
- Fees not recorded (the fee PDFs linked cover direct entry only).
- Hand-off: bachelor admissions and fees page (bachelor-only).

## ch-webster-geneva (catalogue)
- Scope catalogue: all teaching in English, US-style; "Students do not have to declare their major immediately upon their arrival." Majors page lists 5 BA and 10 BS options (10 programme pages, several with emphases); no count given, so `courses` left out.
- No dates recorded: the undergraduate page still reads "Freshman Application Deadline for August 2025 Term: May 15, 2025" and "Priority Application Deadline for International Students (Fall semester): May 1"; the 2027 freshman deadline is not published. Admission is rolling.
- IB: "IB Diploma with 24 points (32+ for Scholars Program)" — matches ch.json's 24 points. English waiver: "HL English A — min. score 4 HL English B — min. score 5 SL English A — min. score 5 SL English B — min. score 6"; "applicants from an English-based school may also be eligible for waivers".
- ch.json englishBachelors mentions "media"; the current majors page lists no media major (Media Studies is a minor only). Minor contradiction.
- ch.json fee (CHF 17,500 per semester 2026/27) not re-checked here (fee is a country-record matter).
- Hand-off: undergraduate majors and minors page (undergraduate-only; 15 major options).

## ch-eu-business-school (listed, 7 programmes)
- Scope listed: Geneva campus page lists seven bachelor's (BBA; BA International Relations, AI for Business, Sports Management, Digital Business Design & Innovation, Leisure & Tourism Management; BSc Business Finance); each programme page: "Length 3 years Language English Start dates Oct, Feb, Jun & Aug Fee CHF 15,400/semester". All seven URLs checked (HTTP 200, Geneva titles).
- ch.json lists "tourism" among programmes and omits Leisure & Tourism's full name — agrees; it also says "a BBA and bachelor's in business finance, international relations, AI for business, sports management, digital business and tourism" — agrees (7).
- IB: the only IB line on the admissions page is "IB: IB Diploma with minimum of 24 points", printed under the "BA (Hons) in Business" block's accepted-diplomas note; the general "Bachelor's" block names no IB threshold. The ib line says "Its admission page lists…" rather than presenting 24 as a rule for every programme. Matches ch.json's 24 points.
- No dates: rolling admission with four start dates; "You will be informed of the admission decision within one week". No 2027 deadline published.
- Degrees: every Geneva programme page lists "An ACBSP and IACBE accredited bachelor's degree from EU Business School Switzerland, which is institutionally accredited by IQA and certified by eduQua", a UVic-UCC "titulo propio" and "A state-recognized BA (Hons) in Business Management degree from University of Derby, U.K." ch.json's warning that it is "not accredited by the Swiss state as a university" is not contradicted by these pages (none claims Swiss state accreditation).
- Tuition recorded per semester, not per year, because the BBA runs "seven-semester program (240 ECTS)" in three years.
- Hand-off: the Bachelor's programmes page (bachelor-only; 26 entries across Barcelona, Geneva, Munich and Digital; 7 Geneva).

## ch-uzh (none, German)
- Bot/outage note: www.uzh.ch returned HTTP 502 to every request (curl and WebFetch) on 26 Sep 2026. Pages were read from Internet Archive snapshots of the official URLs: deadlines (20260918212034), bachelor admission (20260624084203), language requirements (20260512223402). Exact sentences follow so a reviewer can re-check.
- Scope none: "As a rule, the main language of instruction for the Bachelor's programs, the teaching diploma and the Bachelor's and Master's programs of the Faculty of Medicine and the Vetsuisse Faculty is German." The English-or-German list on that page covers master's programmes only.
- Dates (standing, no year): "Please note that the following deadlines can not be extended. Fall Semester … Bachelor, Master, Teacher's Education Excluding applicants with visa requirements* … 1 January until 30 April"; "Bachelor (ext. deadline) Only possible for applicants with Swiss university entrance qualification at an additional fee of CHF 300 … 1 May until 31 July"; "Applicants with visa requirements … 1 January until 28 February"; "Bachelor Medicine Application requires a registration at swissuniversities until 15 February."
- Agrees with ch.json's UZH deadline entry (1 Jan–30 Apr; 31 July only for Swiss qualifications; 28 Feb with a visa).
- German: "Proof of proficiency at the C1 or a higher level … must be submitted"; exempt with "Completion of the last three years at an upper secondary school in the language of instruction relevant for the studies and in a region where the official language is the same as the language of instruction" — so an IB in Denmark taught in German would not exempt. The ib line states this regional condition.
- IB: the bachelor page sets the six-subject rule and says "a minimum overall grade determined by the University of Zurich may also have to be achieved"; the 32-point figure is swissuniversities' 2026/27 list, which names Zürich.
- ch.json calls UZH "Switzerland's largest university"; not used (unsourced).
- Hand-off: bachelor admission page (bachelor-only).

## Batch summary
- 15 of 15 done: 4 listed (HSG 3, USI 3, EHL 1, EU Business School 7 = 14 programmes), 2 catalogue (Franklin, Webster Geneva), 9 none (ETH, EPFL, UZH, UNIGE, Basel, Bern, UNIL, Fribourg, Lucerne).
- Dates with years published for 2027: ETH (1 Dec 2026 – 31 Mar 2027; diploma by 31 Aug 2027), HSG selection tests (16/18 Feb, 8/10 Jun 2027), USI (30 Jun 2027 EU/EFTA; 30 Apr non-EU), EHL (31 May / 15 Jun 2027). Standing dates (no year on the page) labelled "standing date": EPFL, UNIL, HSG, Fribourg, Lucerne, UZH, Franklin. Year-labelled 2026 pages (UNIGE, Basel, Bern, Webster) → no dates recorded.
- Main contradictions with data/countries/ch.json: Basel's IB rule needs one HL science/maths, not three HL; HSG's English track does not cover Law and Economics (taught in German); USI's EU/EFTA deadline is 30 June 2027, not the "typically 30 April" in ch.json; Webster lists no media major; ETH's 2027 period is published with years (ch.json marks it provisional).
- Could not verify: ETH application fee; Fribourg's IB page (Flutter app); whether an IB school counts as "English-speaking high school" for USI Economics or as "primary language of instruction" for Franklin's English test; Bern's German exemption for IB German A; UZH live pages (502 — read via Internet Archive snapshots).
