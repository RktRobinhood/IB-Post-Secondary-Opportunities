# Country audit (Europe, 20 destinations): critic round 1

Critic: **Admissions counsellor** (per `docs/QA_CRITIC_LOOP.md`). Date: 2026-09-24.
Scope: the uncommitted audit pass over fi, is, no, se, ee, lv, lt, pl, cz, hu, gb, ie, nl, be, lu, de, at, ch, fr, si
(es, gr, it, pt, mt excluded). Read: `docs/research/audit/<cc>.md` and
`git diff -- data/countries data/destinations data/application-routes data/application-systems data/context-notes data/evidence`.
Every item below was checked by me against the live official page (WebFetch, or curl + text grep where the
fetch model misread a table), not against the audit report.

## SCORE: 7 / 10: not yet

**The deadlines and fees are right.** I checked 25 consequential corrections in 15 countries: every deadline,
fee and IB rule matched its official page. That includes the parts most likely to go wrong: the Swedish
round-2 reversal, all the CAO 2027 dates, the UCAS £34.50 fee and the Norwegian conversion table. No wrong
deadline or fee is presented as fact, so the cap of 6 does not apply.

**What stops me shipping it is the new-institution notes.** I checked 9 of the 14 new institutions. All of
them really do teach full bachelor's degrees in English, and all of them really do draw IB students. But in 3
of the 9 the one-line note makes a superlative the data contradicts. Each one comes from misreading
`IB_DISCOVERY.md`: that file ranks universities *not yet on the site*, and the agents read "top of the
discovery list" as "top in the country". I would have repeated "Queen Mary is the UK university IB students
send the most transcripts to" in a meeting, and I would have been wrong. KCL, Manchester, UCL, Edinburgh and
Warwick all have more. The same mistake appears in the NL and PL files, so it is a pattern, not a slip.

Smaller issues:

- One claim in the Iceland profile now contradicts itself.
- Some date notes in the Ireland file still read like the research log.
- Country summaries run 70–114 words, which is not "one line of copy per block". Sweden's got longer in this pass.

## Sampled corrections (25 items, 15 countries)

| # | Country | Claim as now recorded | Verdict | Evidence (URL — short quote) |
|---|---|---|---|---|
| 1 | SE | May 2027 IB candidates should not use round 1; apply in round 2 (15 Apr 2027) | CONFIRMED | universityadmissions.se/en/apply-to-bachelors/provide-application-documents-bachelors/ib-studies/: "If you haven't yet completed your IB Diploma programme, do not apply to the first admissions round." |
| 2 | SE | Round 2: fee exemption 23 Apr, documents 21 Jun, IB/EB completion 5 Jul, results 9 Jul, reply 16 Jul 2027 | CONFIRMED | universityadmissions.se/en/key-dates-and-deadlines/autumn-semester-dates/: "you have until 5 July to submit documentation of your completed upper secondary studies" |
| 3 | SE | Many English-taught programmes are closed in round 2 | CONFIRMED | same page: "many courses and programmes taught in English are no longer available for application" |
| 4 | SE | Recipient code "UHR" in the IB Result Service | CONFIRMED | ib-studies page: "use recipient code 'UHR'" |
| 5 | SE | SSE admits on predicted grades; deadline 15 Jan 2027; 31 points minimum, 39+ usual | CONFIRMED | hhs.se/…/international-applicant/: "January 15, 2027 - International application deadline"; "SSE does indeed accept predicted grades" |
| 6 | SE | Chalmers: every bachelor's programme taught in Swedish, 5th semester in English | CONFIRMED | chalmers.se/en/education/programmes-and-courses/bachelors-studies/: "The fifth semester of the bachelor's programmes is conducted in English" |
| 7 | SE | Stockholm University: seven English-taught bachelor's | CONFIRMED | su.se/…/our-courses-and-programmes: "There are seven Bachelor's programmes offered in English" |
| 8 | IE | CAO 2027: opens 5 Nov 12:00; €35 by 20 Jan; €50 by 1 Feb 17:00; amend 5 Feb–1 Mar (€10); late 5 Mar–1 May (€65); CoM 5 May (expected)–1 Jul 17:00; Round One TBC | CONFIRMED | www2.cao.ie/handbook/handbook2027/hb.pdf, Table 1.1: "Early online 35 20 January 2027 at 5pm … Late online application 65 1 May 2027 at 5pm"; timetable: "Round One offers (date to be confirmed)" |
| 9 | IE | IB candidates are considered in Round One; ask the coordinator to add CAO and give CAO your IB candidate number | CONFIRMED | CAO Handbook 2027 p.12–13: "considered in Round One and subsequent rounds"; "provide your IB Candidate Number" |
| 10 | IE | Student contribution capped at €2,500 (2026/27); TCD non-EU year 1 €22,580 / €29,570 | CONFIRMED | citizensinformation.ie: "The maximum rate of the student contribution is now €2,500"; tcd.ie/courses/undergraduate/fees/ table rows €22,580.00 / €29,570.00 |
| 11 | GB | UCAS fee for the 2027 cycle is £34.50 | CONFIRMED | ucas.com/faqs/what-is-the-application-fee-for-the-2027-cycle: "the undergraduate and conservatoires application fee is £34.50" |
| 12 | GB | Glasgow international 2027/28: £28,275 arts/social sciences, £33,708 science/engineering; MBChB/BDS TBC | CONFIRMED | gla.ac.uk/undergraduate/fees/intlfees/ (both bands; clinical programmes "TBC") |
| 13 | LV | Liepāja University removed: merged into RTU on 1 Mar 2024 | CONFIRMED | eng.lsm.lv/…/liepaja-university-to-become-rtu-liepaja-academy: "will become part of Rīga Technical University (RTU) on March 1". The RTU news page and apply.rtu.lv "RTU Liepaja Academy" agree. |
| 14 | NL | No DigiD needed without a Dutch address; ID scan instead | CONFIRMED | info.studielink.nl/…/verification-personal-details-studielink: "upload a scan or photo of your ID in Studielink" |
| 15 | NL | Maximum two numerus fixus programmes; medicine/dentistry/dental hygiene/physiotherapy one application per programme; 15 Jan 23:59 | CONFIRMED | studyinnl.org/plan-your-stay/how-to-apply: "you can only submit one application per programme per academic year" |
| 16 | NL | Statutory fee €2,694 for 2026-27; 2027-28 not published | CONFIRMED | duo.nl/particulier/tuition-fees.jsp: "the statutory tuition fees are €2.694,-" |
| 17 | NO | IB→karakterpoeng table (43–45 = 60.0, 42 = 59.3 … 20 = 26.0), set by the ministry | CONFIRMED (raw HTML; WebFetch's summary misread it) | samordnaopptak.no/…/ib/poengberegning.html: "43 - 45 60,0 … 42 59,3"; "fastsatt av Kunnskapsdepartementet" |
| 18 | NO | Danish A (HL/SL) at grade 3+ meets the Norwegian requirement | CONFIRMED | samordnaopptak.no/…/land/ib/: "Swedish A på higher eller standard level eller Danish A på higher eller standard level" |
| 19 | NO | Current-year IB students use the Request for Results Service instead of uploading by 1 July | CONFIRMED | samordnaopptak.no/…/ib/laste-opp.html: "vil du ikke rekke å laste opp diplomet ditt innen innsendingsfristen 1. juli" |
| 20 | DE | DoSV allows 12 study offers (was 6); uni-assist €75 + €30 per further programme | CONFIRMED | hochschulstart / arbeitsagentur.de: "Up to 12 study programs"; uni-assist.de/en/how-to-apply/pay-all-fees/handling-fees/: "EUR 75.00 … EUR 30.00" |
| 21 | FI | Joint application 7 Jan 2027 08:00 – 21 Jan 2027 15:00 (UTC+2) | CONFIRMED | tuni.fi/en/tau/bachelors-programmes/applying: "7 January 2027 at 8.00 UTC+2 and end 21 January 2027 at 15.00 UTC+2". Aalto's page says "7 to 22 January"; the record flags this and uses the earlier date, which is correct. |
| 22 | CH | HSG: fee CHF 268, 1 Oct–30 Apr, places for foreigners limited by law | CONFIRMED | unisg.ch/…/admission-to-a-bachelors-degree-programme/: "The application fee is CHF 268. Application period: 1 October - 30 April"; "limited by law" |
| 23 | FR | Non-EU differentiated fees €2,902 licence / €3,950 master, decree 2026-385 of 19 May 2026 | CONFIRMED | univ-lyon1.fr/…/droits-dinscription-differencies-et-exonerations (decree n° 2026-385 du 19 mai 2026) |
| 24 | FR | Polytechnique Bachelor round 1: 17 Sep – 20 Oct 2026 23:59 CEST; fee €105 | CONFIRMED | programmes.polytechnique.edu/…/admissions-criteria-and-procedure: "Round 1 September 17, 2026 to October 20, 2026 at 11:59 PM (CEST)"; "application fee of €105" |
| 25 | AT | WU BBE selection 2026: registration 2 Mar–19 May, exam 30 Jun; 2027/28 details mid-November | CONFIRMED | wu.ac.at/…/selection-procedure-bbe-1: "Details on the 2027/28 selection procedure will become available in mid-November." |

Also confirmed:

- **PL:** Warsaw University of Technology charges EU citizens nothing for four English engineering BScs (Electrical, Mechatronics, Aerospace, Power). Source: students.pw.edu.pl/Studies-Offer/B.Sc.-offer, "EU: no charge".
- **HU:** Corvinus application fee €100; non-EEA tuition €6,600–7,000. Source: uni-corvinus.hu fees page.
- **BE:** students can work 650 hours a year at reduced contributions, since 1 Jan 2025. Source: studentatwork.be, "Since January 1, 2025 this package contains 650 hours".
- **EE:** 27 entries at ten institutions on the national list. I counted them myself from studyinestonia.ee/study/programmes/bachelors-programmes. Commercial Aviation Management is marked "no intake for 2026/2027".
- **AT:** ÖGK student self-insurance €78.84 a month in 2026. Confirmed only by a secondary search result; I could not read the official ÖGK page.

## New institutions (9 checked)

| Institution | Full English bachelor's? | Where IB students go? | Note accurate? |
|---|---|---|---|
| Queen Mary University of London (GB) | Yes | Yes, 1,815 transcripts | **WRONG.** The note says it is "the UK university that received the most IB transcripts in the last five years". `data/ib-statements.json` gives KCL 4,457, Manchester 4,143, UCL 3,424, Edinburgh 3,002 and Warwick 2,980. QMUL only tops the *discovery* list of universities not yet on the site (`docs/research/IB_DISCOVERY.md` §United Kingdom). |
| University of Birmingham (GB) | Yes | Yes, 1,771 | Fine |
| City St George's (GB) | Yes | Yes, 1,360 (as City) | Fine. The 2024 merger is stated correctly. |
| University of the Arts London (GB) | Yes | Yes, 1,329 | Fine |
| The Hague UAS (NL) | Yes, about 17 | Yes, 932 | **WRONG.** The note says it is "the Dutch institution that received the most IB transcripts in the last five years". UvA has 9,396, Groningen 4,937, Maastricht 4,739, Erasmus 3,477 and Leiden 3,353. |
| Rotterdam UAS (NL) | Yes, but only 3 | Yes, 458 | Fine. It honestly says there are only three. |
| University College Roosevelt (NL) | Yes | Yes, 379 | Fine |
| SWPS University (PL) | Yes. The Psychology BA is "conducted entirely in English", 3 years, €7,400 (english.swps.pl), and IB holders are exempt from entrance exams | Yes, 307 | **WRONG.** The note says "IB students apply to more than any other in Poland". University of Warsaw has 573, Medical University of Gdańsk 409 and Medical University of Warsaw 382. The wording "apply" also breaks the `IB_STATEMENTS.md` rule that a transcript is "sent", not an application. |
| EU Business School Geneva (CH) | Yes. CHF 15,400 per semester and CHF 200 fee, confirmed at euruni.edu/en/Programs/Tuition-Fees.html | Yes, 400 | Good. It says honestly that the school is not state-accredited. |

Removals I checked are justified:

- **Liepāja (LV):** now part of RTU.
- **Reykjavik University (IS):** its undergraduate degrees are taught in Icelandic.
- **Chalmers (SE):** not removed, but it is now honestly marked "None".
- **Estonian Academy of Arts and Tartu Applied Health Sciences University (EE):** the audit quotes their own pages. I did not re-fetch them.

## Other findings from the diff

1. **Iceland contradicts itself.**
   - `data/countries/is.json` → University of Iceland `note` still says "It is also the only place in the country with a verified English-taught bachelor's degree".
   - The same pass added the Iceland University of the Arts' Contemporary Dance Practices BA as English-taught. The summary also says "two".
2. **Ireland date notes read like the research log.** `data/countries/ie.json` calendar notes:
   - They quote the 2026 wording ("20th January 2026 (17:00) …") directly above "2027 entry".
   - They still contain process history: "Promoted out of a note so that it can be sorted and counted", and "The IB-side cut-off was missing from this record until … 23 September 2026".
   - A student would read that and ask which year it is.
3. **Summaries are not one line.**
   - Country summaries now run 70–114 words: HU 114, NL 112, BE 105, AT 103, CZ 101, LU 101, IE 100.
   - Sweden's summary grew in this pass to fit the round-2 point. That point belongs in watch-outs, where it already is.
   - The taglines are fine: short and true. Several lead with the catch ("Barely any…", "almost entirely in Norwegian"), but they are honest.
4. **Gaps are marked as gaps.** This is well done throughout: Round One "TBC", Norway's calendar carried from 2026 and marked provisional, Parcoursup 2027 not yet published, BME "fees and 2027 deadlines were not verified". I found nothing invented in the deadline or fee fields.

## Top fixes (the ones that raise the score most)

1. **`data/countries/gb.json`, Queen Mary University of London → `note`.** Replace with: "A large Russell Group university in east London, with law, medicine and dentistry among its strengths." Drop the superlative. The transcript count (1,815) comes from the IB statement link and should not be restated as a ranking. Source: `data/ib-statements.json` (KCL 4,457 > QMUL 1,815).
2. **`data/countries/nl.json`, The Hague University of Applied Sciences → `note`.** Replace with: "A large hogeschool in the city of international courts and organisations, with about 17 bachelor's taught in English." Source: `data/ib-statements.json` (UvA 9,396 > THUAS 932).
3. **`data/countries/pl.json`, SWPS University → `note`.** Replace with: "A private non-profit university in Warsaw. IB holders skip its entrance exams; Psychology costs EUR 7,400 a year in 2026/27." Sources: english.swps.pl/academics/warsaw/ba-programs/psychology; `data/ib-statements.json` (UW 573 > SWPS 307).
4. **`data/countries/is.json`, University of Iceland → `note`.** Delete the sentence "It is also the only place in the country with a verified English-taught bachelor's degree." Or change it to "one of two places in the country with an English-taught bachelor's". Source: lhi.is/en/althjoda-cooperation/incoming-exchange/ (Contemporary Dance BA run completely in English).
5. **`data/countries/ie.json`, calendar `notes` for 20 Jan, 1 Feb, 5 Feb, 1 Mar, 1 May, 5 May, 1 Jul and the IB-results entry.**
   - Quote the 2027 handbook instead of the 2026 timetable. For example: "CAO Handbook 2027, Table 1.1: 'Early online 35 20 January 2027 at 5pm'."
   - Delete the process history ("Promoted out of a note…", "was missing from this record until…").
   - Source: www2.cao.ie/handbook/handbook2027/hb.pdf.
6. **Guard the pattern, not just these three.** Any new-institution note that ranks an institution by IB transcripts must be checked against `data/ib-statements.json` for the whole country, not against `IB_DISCOVERY.md`. The simplest rule is that notes never state a transcript ranking at all.
7. **Summaries (copy, lower priority).** Bring `summary` in se, nl, hu, be, at, cz, lu, ie down to one or two sentences. The detail already lives in watchOuts and the calendar. For Sweden, drop the round-2 sentence from both summaries, because the watchOuts already carry it.

Fixes 1–5 are small text edits. With them in place and the pattern check in fix 6 run over all 14 new institutions, I would expect this to pass at 8 or above.
