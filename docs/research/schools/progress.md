# School pages research: progress

## Finland (fi): 14 of 14 done, retrieved 2026-09-25

- Scope: 13 listed (101 programmes), 0 catalogue, 1 none (fi-aa, every bachelor's taught in Swedish).
- Method: programme lists checked against Studyinfo's own data (konfo-backend: every English bachelor's with a 2027 application round), then each programme page opened on the institution's site.
- Contradicts fi.json: Aalto's 22 January 2027 close is correct. Aalto runs its own separate application on Studyinfo, not the joint one, and Studyinfo itself shows 7 Jan 08:00 to 22 Jan 15:00.
- Contradicts fi.json: UEF has 8 English bachelor's for 2027, not "at least one". Some keep a small certificate-based group for IB holders; the rest select by SAT, an entrance exam course or an interview.
- Contradicts fi.json: TAMK does not use certificate-based selection for Media and Arts or Team Entrepreneurship; both use a pre-task and interview. In January, IB grades count at none of TAMK's programmes; they count only in its engineering rolling admission (English 5, HL Maths 5).
- Contradicts fi.json: TAMK has 9 English bachelor's for 2027, including the new Business in Finland and Early Childhood Education and Care.
- Contradicts fi.json: Laurea's Safety, Security and Risk Management is "not available in January 2027"; Laurea has 6 for 2027, and Cyber Security and Developing Digital Services run online only.
- Contradicts fi.json: Haaga-Helia's joint application is certificate-based only (no UAS Exam or SAT); its rolling admission (30 Oct 2026 to 12 May 2027) needs an SAT for IB holders, per its FAQ. It has 6 English bachelor's for 2027, not 8: Strategic Hospitality Management (online) and Hospitality Operations Management (blended, needs Finnish A1.3) have no autumn 2027 first-year round.
- Contradicts fi.json: Tampere now has Socially Sustainable Societies among its 11; Turku's count of 2 is confirmed (the ICT 3+2 is its own programme).
- Contradicts fi.json: Metropolia has 21 English bachelor's open to school leavers in the January 2027 round (top-ups excluded). Automotive Electrics takes only Open UAS and Edunation pathway students for 2027; EBA, XR Design, Industrial Management and Construction IT have no 2027 round.
- Contradicts fi.json: LUT's non-HEBUT Software and Systems Engineering is a Sathyabama partnership (apply through your home university), so it is excluded. Industrial Engineering and Management (Lahti) is in, keeping LUT at 15.
- Could not verify: programme-level 2027 admission criteria on Studyinfo (valintaperuste) are not yet public for JYU, Metropolia, Laurea and others. Per-programme IB thresholds and selection methods are recorded only where the university's own page states them.
- Could not verify: Turku's 2027 IB predicted-grades deadline (its page still shows 31 March 2026). Haaga-Helia's rolling page lists the IB among accepted certificates but its FAQ says IB holders need an SAT; I recorded the FAQ.
- Could not verify: Laurea's selection method for Service Experience Management (Studyinfo lists no exam). uef.fi sits behind a Cloudflare check; I read it in the user's browser, where it loaded without a challenge.

## United Kingdom (gb): 22 of 22 done, retrieved 2026-09-25

- Scope: 0 listed, 22 catalogue, 0 none. Every record hands off to the university's own undergraduate course search or A–Z; `apply` is UCAS for all (St Andrews also names Common App and its direct application).
- Dates checked on UCAS (15 Oct 2026 and 13 Jan 2027, both 18:00 UK time), UAT-UK, LNAT and UCAT, and on each university's page where it publishes them (Oxford, Cambridge, Imperial, UCL, LSE, KCL, Edinburgh, Glasgow, St Andrews, Bristol, Leeds, Birmingham, QMUL, Nottingham, City St George's).
- Adds to gb.json: Glasgow's 2027 degree pages give international students until 30 June 2027 (13 January is for UK applicants). Bristol also takes international applications until 30 June 2027.
- Adds to gb.json: St Andrews lets overseas-fee applicants apply direct (£50) or through the Common App instead of UCAS. It still counts as one of the five UK choices.
- Adds to gb.json: Cambridge asks 41–42 points with 776 at HL, and needs My Cambridge Application by 22 Oct 2026. You cannot apply to Oxford and Cambridge in the same year. Oxford asks 38–40 including core.
- Adds to gb.json: QMUL teaches a five-year MBBS in Malta, applied for directly, with a 1 March 2027 deadline.
- Contradicts gb.json (Imperial note): HL Maths AA is not always required. Imperial Mathematics accepts AA or AI (AA preferred). Warwick Economics also accepts either; only Warwick Mathematics insists on AA.
- Contradicts gb.json (Edinburgh): its £1,546 a month living-cost estimate is labelled for 2027 on the degree pages, not 2026/27.
- Could not verify: 2027/28 international fees at Imperial, Manchester, Birmingham, Warwick, St Andrews and UAL (not yet published); those records give the latest published figure and say so.
- Could not verify: UAL's 2027 course pages (its pages still show 2026 entry). Its course finder did not load results in either browser, so the hand-off is the subjects page.
- Could not verify: gb.json claims not re-tested here: City St George's founding year (2024), UAL "six colleges", and Loughborough's "a few points lower than Russell Group".
- Could not verify: citystgeorges.ac.uk and arts.ac.uk sit behind Cloudflare checks. I read them in the user's Chrome, where they loaded without a challenge.
- Could not verify: most UK course pages put their IB offer inside JavaScript tabs, so `ib` quotes worked examples from named course pages plus the university's general IB rule.

## Finland, round-1 fixes (critique `qa/schools/round-1-data-fi.md`), retrieved 2026-09-25

- Supersedes the Haaga-Helia lines above: its rolling admission takes the IB (28 points, CAS, English IB or English at 4, predicted grades accepted), per its certificate-based rolling page. There is no SAT requirement. I found no FAQ saying otherwise.
- E2: Haaga-Helia `ib` now names the two entrance-exam exceptions. International Business says that its blended variant uses an exam at Pasila.
- E3: Laurea Nursing and Social Services both state Finnish B1 and English B2 in `ib`.
- E4, E5, E10, E14, and all 14 summaries: rewritten to 150 characters or fewer, with no every/all/only/largest/oldest/strongest.
- E10 detail: Science is at Kumpula; Liberal Arts is taught on the City Centre, Kumpula and Viikki campuses (Studyinfo), so neither is "central Helsinki". The brief's example summary still says "one in the centre".
- E6, E15: Laurea and Metropolia selection methods are now sourced to Studyinfo's published 2027 application options and marked "2027 criteria not yet published". Metropolia's `ib.url` is now a Metropolia page. 3D Game Art is flagged as first time in English.
- E7: Metropolia `city` set to Espoo (Information Technology, Karamalmi) and Vantaa (Electronics, Mechanical, Robotics, Smart Automation, Laboratory Science, Myyrmäki).
- E8: Oulu IBM now reads 10 January places on certificates (IB), 20 separate SAT/ACT rolling places. E9: Åbo note now says only what the page says.
- E11: UEF Human and Planetary Health now shows the draft split (5 of the 10 certificate places for spring-2027 graduates; no waiting list), labelled draft.
- E12: Arcada's maths rule is converted with the UAS IB table: grade 2 in AA SL/HL or AI HL, or grade 4 in AI SL. E13: LUT engineering `ib` flags that its IB page also lists AA SL and Maths SL as accepted.
- Credentials: the invented abbreviations are replaced with Studyinfo's English degree titles (Bachelor of Health Care, of Hospitality Management, of Sport Studies, of Social Services, of Construction Management, of Laboratory Services, of Social Services and Health Care, of Culture and Arts, of Administrative Sciences, of Social Sciences, of Health Sciences, of Science (Agriculture and Forestry), of Arts (Education)). The Finnish economics degree is now "BSc (Economics and Business Administration)".
- IB document deadlines added: TAMK (predicted 1 Apr, final 13 Jul) and Haaga-Helia (1 Apr and 13 Jul, stated so far only on Sports Coaching's Studyinfo entry). Notes now say they are unpublished for Laurea, Metropolia and Helsinki (Helsinki publishes its criteria by the end of October 2026). Turku's note already said so.
- Attachment deadline of 28 Jan 2027 added for Laurea (uasinfo.fi), UEF (Studyinfo; Lifelong Learning 23:59) and Haaga-Helia. The UAS Exam results date (14 Apr) is added for Laurea, Metropolia and TAMK.
- UEF source sentences (uef.fi eligibility page; the Cloudflare check cleared by itself in the user's Chrome): "For International Baccalaureate (IB) and European Baccalaureate (EB) diplomas: Predicted grades must be submitted by 1 April 2027. Final grades are due by 13 July 2027." "Applicants receiving an International Baccalaureate (IB) diploma in spring 2027 must apply for a Transcript of Grades from the IB organization to be submitted electronically directly to UEF by 13 July 2027."
- UEF opening date (uef.fi/en/how-to-apply): "The next application period for bachelor's and master's programmes taught in English for the September 2027 intake will be open from 7 January until 21 January 2027". All 8 UEF programme URLs return that programme's own page.
- Could not verify: Turku's 40% ICT certificate share (unchanged); Laurea Service Experience Management's 2027 method (Studyinfo lists no exam yet).
- Outside scope: Studyinfo's 2027 joint application includes Hanken School of Economics' English "Business" bachelor's. Hanken is not in data/countries/fi.json.
