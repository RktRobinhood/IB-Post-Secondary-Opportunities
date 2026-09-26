# Batch report: France, fr-* (issue #43)

Researched 2026-09-26 in the user's Chrome (own tab; same-origin fetch for hidden accordion text). One line per point.

## fr-sciences-po (listed, 11 programmes: BA English track on 3 campuses + 8 dual degrees)
- Route: IB applicants use Sciences Po's own international pathway, not Parcoursup: "what matters in the choice of the pathway is the type of secondary school diploma, not the candidate's nationality".
- 2027 calendar quoted: "if you apply no later than 4 November 2026 … results mid-January 2027; if you apply by 13 January 2027 … beginning of April 2027; if you apply before March 1, 2027, you will have the results in early May 2027"; "Deadlines always refer to Paris time (11.59pm)". Recorded 1 March 2027 as the final close (dual-degree line: "set on 1 March 2027"); "before March 1" is ambiguous, flag for reviewer.
- Page also says "International admissions are open on a rolling basis … to 10 March 2026" — an obvious stale year; not used.
- Interviews: "from 8 December 2026 until 18 December 2026; from 8 March 2027 until 19 March 2027; from 13 April 2027 until 23 April 2027".
- English tracks (language-requirements page): Le Havre "taught in English"; Menton English track; Reims North America minor and "Reims campus, Africa minor, English track". Dijon, Nancy, Poitiers are "taught in French" (B1 French + C1 English allows one English semester) — excluded. Paris "only available to candidates who have completed French secondary education".
- IB: "There are no specific subject requirements. For example, IB candidates whose 6 subjects … do not contain any science subjects are not in any way disadvantaged."
- Dual degrees included: Keio ("entirely taught in English"), HKU (Le Havre/Menton/Reims), ESCP PEM ("taught entirely in English", Reims) via Sciences Po's platform by 1 March 2027; Columbia, NUS, UBC, Berkeley, Sydney via the partner's own portal (ownDeadline). Excluded: FU Berlin (Nancy, French), FGV (Poitiers, multilingual, French B1), Luiss ("entirely taught in Italian" at Luiss), UCL (Poitiers/Menton/Nancy/Dijon, mostly French campuses; via UCAS) and the French-university duals.
- Fees 2026-27: EEA tax residents "from €0 to €14,900" by household resources.
- data/countries/fr.json says "Several English-track undergraduate programmes across the regional campuses": broadly right; it is one BA with English tracks on three campuses.
- Hand-off: international undergraduate admissions page (bachelor only).

## fr-l-x (listed, 1 programme)
- Route: own portal or Parcoursup: "Candidates can only apply once per academic year to the Bachelor Program, either via Parcoursup or via Ecole Polytechnique's online application system."
- Rounds (table headed "You can find 2026 intakes right below", but dated for autumn 2027): "Round 1 September 17, 2026 to October 20, 2026 at 11:59 PM (CEST)"; "Round 2 October 21, 2026 to January 6, 2027 at 11:59 PM (CET)"; "Round 3 January 7, 2027 to February 8, 2027 at 2 PM (CET)". Matches data/countries/fr.json.
- IB (FAQ): "Mathematics Higher Level (preferably 'Analysis and Approaches') and at least one other science course should be Higher Level"; "there are no minimum grades required".
- Fees: FAQ "Annual tuition fees for 2027 intake are €15,900 for EU (including EEA) students and €19,600 for non-EU"; the BSc page still says non-EU "€19,200 / year" (pages disagree on the non-EU figure only).
- Hand-off: admissions criteria page (bachelor only; one programme).

## fr-escp (listed, 3 programmes)
- No 2027 dates: BSc page "APPLICATIONS FOR THE 2027 INTAKE WILL OPEN SOON"; "The application process operates on a rolling deadline system". Record has `ownDeadline`, no dates.
- Portals: own website, or "APPLY VIA UCAS … Institution Code: E79 Course Code: N200", or Common App; "The candidates must apply through one portal only." Parcoursup only for French-bac holders who want Paris.
- English: "IELTS 6.5 / TOEFL iBT 4.5 / CAE 180"; French "DELF / TCF B1 (Year 2) or C1 (Year 3)" for Paris only. No IB-specific page found.
- Fees for September 2027 (European passport): BSc Management "Total: €20,800" (matches data/countries/fr.json); MST "Total: €21,800".
- New: "Bachelor in Management, Science & Technology (BSc) … The first intake will be launched in September 2027", "Language of instructions English", "Y1 Paris Y2 Turin Y3 London".
- PEM: "Dual degree programme"; "Other degree holders will apply directly through the international pathway on the ScienceS Po website" (Sciences Po deadline 1 March 2027).
- Hand-off: BSc in Management page (bachelor only). ESCP has no bachelor list page; /programmes/bachelor redirects to the BSc.

## fr-essec (listed, 2 programmes)
- Lead URL `/global-bba/global-bba-international/admission/` redirects or 404s; the live page is https://www.essec.edu/en/program/global-bba-international/ (tabs in the DOM).
- Global BBA "Intake 2027" table, "12 PM Paris time (noon)": "Round 1 October 28, 2026 | November 20, 2026 | November 25 to December 1, 2026 | December 7, 2026"; "Round 2 January 12, 2027 | February 3, 2027 | February 10 to 17, 2027 | February 26, 2027"; "Round 3 March 10, 2027 | April 1, 2027 | April 7 to 13, 2027 | April 21, 2027"; "Round 4 April 22, 2027 | May 13, 2027 | May 20 to 26, 2027 | June 2, 2027" (deadline | shortlist | interview | results). The lead hint "15 January–30 April" is wrong.
- English track "(Cergy, Singapore, Rabat)"; French track Rabat only. English minimums: TOEIC 850, IELTS 6.5, TOEFL iBT 90; waived if "the last 2 years of your academic curriculum are taught entirely in English".
- Fees "Applicable for the 2026 intake", EU citizens, Cergy: "Tuition Fee / year €15,400", "Registration Fee / year €2,000", "Service Fee €2,653", "Total cost of the program €72,253". Contradicts data/countries/fr.json ("€15,900 in year one and €18,900 a year after that (2026/27 intake)").
- Added the BSc in AI, Data & Management Sciences (with CentraleSupélec, "100% taught in English"); its round table reads "For 2026 Intake … Round 1 TBD …" — no 2027 dates; fees "Applicable For Intake 2026": EU "€18,300" tuition/year.
- Excluded: Bachelor ACT and HEPTA (French pages), IPBA (Rabat), Global BBA admission parallèle (year-2/3 entry), SESAME/Parcoursup routes (French bac).
- Hand-off: "All our bachelors" list (9 entries, all bachelor level, incl. the routes above).

## fr-edhec (listed, 3 programmes)
- Calendar (international-admissions page, hidden "Calendar" tab): "Round 1 Application deadline: from 1st October to 3rd November 2026 Online Interview: from 26 November to 8 December 2026 Admission results: Thursday 17 December 2026"; "Round 2 … from 5 November 2026 to 7 January 2027 … 28 January to 9 February 2027 … Thursday 18 February 2027"; "Round 3 … from 12 January to 11 February 2027 … 4 March to 16 March 2027 … Thursday 25 March 2027"; "Round 4 … from 16 February to 1st April 2027 … 26 April to 5 May 2027 … Thursday 20 May 2027"; "Round 5 … from 6 April to 8 June 2027 … 21st June to 27 June 2027 … Thursday 2nd July 2027". Matches fr.json's round 1 (3 Nov); "five admission sessions" (lead hint said four).
- Same page still has stale 2026 lines ("secondary school diploma by July 2026", "retakes in November 2026 will not be accepted") — not used.
- IB: "Only the IB Diploma Programme is considered for admission. IB Certificates and IB Career Related Programme (CP) are not valid". No minimum points.
- Fees: "Business Management track: 15,900€/year* Global Business track: 23,900€/year*" — "Tuition fees applicable for the 2026 intake". Application fee 100€, deposit 5,000€.
- Business Management track: "Delivered in either French or English from the first year" (Lille and Nice). Global Business: Nice → UCLA Extension → NTU Singapore, "Language English".
- Added International Business Analytics and Management BSc (with King's): "Applications must be submitted via the UCAS platform … The standard deadline for applications is 13 January 2027 19:00 (UTC+1 time)"; French/EU: "Year 1 £40,900 … Year 3 € 20,150".
- Excluded: Dual Degree in Digital Engineering & Management with UTC ("Language French and english"); Online Bachelor ("Taught in French").
- Hand-off: International BBA programmes page (bachelor only, 5 entries).

## fr-emlyon (listed, 2 programmes)
- Bachelor list: Global BBA ("2 tracks in French or in English", Lyon) and BSc in Data Science for Responsible Business ("Program taught in English", with Ecole Centrale de Lyon).
- Fees: Global BBA "€15,500 / year for a 1rst year admission (2027–2028 academic year)" (matches fr.json); BSc "€15,500 / year (2027–2028 academic year)".
- No 2027 dates: Global BBA page still says "Admissions sessions are organized from November 2025 to July 2026" (recorded as lastYear 2026); BSc page "Selection sessions for the academic year 2026-2027 are organized from November 2026 to July 2027 (subject to availability)" — no days. Record uses ownDeadline.
- Early-bird: "emlyon waives a discount of 10% of the tuition fees for the admitted international students applying with the first session."
- Selection (Global BBA): online steps "managing messaging", "interactive meetings", "reporting", "deferred video interview"; "if you apply via the web pages in English, your applications as well as the digital tests will be in English."
- Hand-off: Bachelor programs page (2 bachelor programmes only).

## fr-aup (catalogue, 25 majors)
- Scope catalogue: all teaching in English; "choose your area of specialty among AUP's 25 majors" (academics/undergraduate). Flagships/faculties not researched (schema not built yet).
- Rounds, standing dates with no year ("We review completed applications in rounds throughout the year"): "Early Action Admission by 15 November", "Priority Admission by 1 February", "Regular Admission by 15 March", "Late or International Admission after 1 April"; and "accepts applications year round". Recorded as `early` dates labelled "standing date", with `noDeadline`.
- English: waived if "You will complete or have completed the International Baccalaureate Diploma Programme … and will be able to submit your official IB Diploma before the start of the semester". IELTS 6.5 / TOEFL 88 (4.5 new scale) otherwise.
- IB scholarships: "44 or 45 100% full tuition scholarship; 40 to 43 €20,000 per year; 36 to 39 €14,000 per year; 32 to 35 €7,000 per year"; "IB Diploma candidates receive 32 semester credits for a final IB result of 30 or above."
- Tuition "Fall 2026 … Academic Year Tuition €38,080" (2026-27; 2027-28 not published).
- Hand-off: majors-minors page (bachelor level only: majors and minors; a count of 25 majors, minors listed alongside).

## fr-sorbonne (none, French)
- Scope none: "Currently, no undergraduate degrees are offered in English" (Programs in English page; master's only).
- Route: for EU/EEA/Swiss nationals with an "International Baccalaureate" diploma, "You must submit your application via the national platform Parcoursup."; "in the first year of the Bachelor's degree, courses are taught in French across all faculties … A minimum B2 level of French proficiency is required for enrolment."
- Parcoursup calendar page (read in the browser) still shows only 2026: "Du lundi 19 janvier au jeudi 12 mars 2026 : je m'inscris et je formule mes vœux"; "Mercredi 1er avril 2026 : dernier jour pour compléter mon dossier et confirmer mes vœux". Recorded as lastYear only.
- Hand-off: international welcome desk, first-year admission page (bachelor only).

## fr-psl (listed, 2 programmes)
- Bachelor list (psl.eu "Bachelor's degrees at PSL", 18 entries incl. CPES tracks, Dauphine licences, CNSAD, ENSAD, Paris-Malaquais). Teaching language per page: IBSAI "Teaching language(s) English"; I-BE³ "Langue(s) d'enseignement Anglais"; Sustainability Sciences "French, English" ("bilingual … recommended English level B2 / French level C1"); Dauphine double bachelor AI & Organizational Sciences "Teaching language(s) French". Others French.
- IBSAI route: "Selection based on an application file, via the national Parcoursup portal (according to the official calendar)"; Études en France applicants "between October 1 and December 15, 2025" (2026 cycle). Fees "2026/27 (Sept. 2026 intake) … tax residents in an EU member state: … from €0 to €14,900". Maths: "an advanced high school mathematics curriculum" (topics listed; no IB course named, so no `needs`). 2026 criteria.
- I-BE³ (Mines Paris-PSL site): "Session 1 Du 1er octobre 2026 au 11 novembre 2026 Session 2 Du 16 novembre 2026 au 10 janvier 2027 Session 3 Du 16 janvier 2027 au 15 mars 2027"; "Candidatures internationales : les candidatures doivent être remplies via notre système de candidature en ligne"; "un niveau B2 en anglais et A2 en français pour les étudiants non francophones"; EU tax residents "15 000 € par an, frais de scolarité dégressifs en fonction des revenus"; "Pour la rentrée de septembre 2026, 60 étudiants seront recrutés". Campus Sophia Antipolis.
- Contradicts data/countries/fr.json ("One undergraduate programme taught entirely in English"): there are two (I-BE³ launched 2026).
- Hand-off: PSL bachelor's page (bachelor only).

## fr-uga (none, French)
- "Programs in English" (international site, updated 22 Sept 2026), four discipline pages; bachelor-level entries: "Vocational bachelor: Mathematics - Information Technology" (links to the licence informatique international track, years 1–2: "Durée 2 ans", "Langue(s) d'enseignement Anglais, Français", "Une part importante des enseignements scientifiques est dispensée en anglais"); "Bachelor Physics, chemistry and mechanics" (international track, "Durée 2 ans", "Anglais, Français"); "Bachelor in nuclear engineering" ("Niveau d'entrée Bac +3", 1 year); "Bachelor - L3 Managerial economics…", "Bachelor - L3 Management" (year 3); dual language licences English/German, Spanish, Italian, Russian (language degrees). No fully English-taught first-year bachelor's → scope none. data/countries/fr.json ("an international bachelor programme") overstates it.
- Could not verify: UGA's own EU/Parcoursup statement — the "apply" page redirects to a CAS login (not entered), and the international "Application and registration" link points to the site root. Route taken from the ministry DAP page: "Les candidats ressortissants Suisse ou d'un pays de l'Union européenne ou de l'Espace économique européen doivent se connecter à Parcoursup".
- Catalogue URLs are under "catalogue-2021" but show "Programme 2026-2027 / 2027-2028".
- Hand-off: international "Degree programs" page (how to apply as a degree-seeking student; UGA has no bachelor-only English list).

## fr-unistra (none, French)
- Route: "French or European Applicant … International Baccalaureate … Enrolling in a Bachelor's degree: Apply on Parcoursup" (first-year admission page).
- Unistra's "Bachelor's degrees taught in English" page lists 23 entries, but the catalogue's own "Langue(s) d'enseignement" fields for the first-year ones read French plus English/German (checked: Franco-German Life Sciences, Humanities, Philosophy, English studies, CPES European Law, European Law, CPES Science, CPES Economics & Social Sciences). The only English-only one checked, International Economics and Management, is "Niveau d'entrée BAC +2", "Durée 1 an" (year 3) → scope none. The STAPS, LEA and other language licences on that list were not opened one by one.
- Contradicts data/countries/fr.json only mildly ("some English-taught European and international tracks"): they are bilingual/trilingual, not English-taught.
- Hand-off: international first-year admission page (bachelor/licence routes only).
