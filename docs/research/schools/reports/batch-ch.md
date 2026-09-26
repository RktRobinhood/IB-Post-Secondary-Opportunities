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
