# School records, Finland (#43): admissions counsellor, round 1

Under review: the 14 records `data/schools/fi-*.json` (13 listed, 101 programmes; 1 none) and the Finland section of `docs/research/schools/progress.md`. Checked on 25 September 2026 against the institutions' own pages and Studyinfo.fi. For Studyinfo I used its public data service (`opintopolku.fi/konfo-backend/haku/<oid>`, `/toteutus/<oid>`, `/hakukohde/<oid>`), which is the data behind the Studyinfo pages.

## Score: 7/10. Not accepted.

**No wrong deadline.** I checked every date in all 14 records (63 entries) against its source. Every one I could open is right, including times and rounds. The programme lists are complete: every English bachelor's in the 2027 joint application, Aalto's round A/B, LUT's rolling round and Helsinki's two programmes is in a record, and nothing extra is. Top-ups, master's and programmes closed for 2027 are correctly left out. Every programme URL I could reach (93 of 101) opens that programme's own page.

It still fails the counsellor test, for these reasons:

- **One claim would cost a student a route.** The Haaga-Helia record tells IB holders they need an SAT for rolling admission. Haaga-Helia's own rolling-admission page takes the IB with 28 points.
- **Two headline summaries are false.** LUT's says "every bachelor's is in English", and Turku's says "second-largest".
- **One programme hides a language requirement.** Laurea's Social Services leaves out that Finnish at B1 is required.
- **Several `ib` lines are overstated or unsourced.**

Each is a small fix. Together they mean I could not read these pages to a student without checking them first.

## What I checked

| Check | Scope | Result |
|---|---|---|
| Dates | All 63 date entries in 14 records | 61 confirmed on the cited page or on Studyinfo. 2 at UEF could not be opened (Cloudflare; see below). 0 wrong. |
| Application windows | Joint application 7 Jan 08:00 – 21 Jan 15:00 (haku `…92075`) · Aalto 7–22 Jan (haku `…93700`, `…93702`) · Helsinki group 2 9–23 Mar, group 1 5–19 Jan · Åbo second joint application 9–23 Mar · LUT 1 Sep 2026 – 30 Apr 2027 23:59 · Arcada separate 30 Oct – 19 Apr · Haaga-Helia rolling 30 Oct – 12 May · TAMK rolling 15 Nov – 28 Feb · Oulu IBM rolling 1 Oct – 25 Feb · Metropolia separate 1 Dec – 31 Mar | All correct |
| IB document dates | Predicted grades 1 Apr, final grades 13 Jul (Aalto, Arcada, JYU, TAU, Oulu) · Aalto ID 29 Jan · results dates (Aalto 28 May, Arcada 31 May, TAU 31 May) · UAS Exam 23 Mar 12:00, pre-identification 10–12 Mar, results 14 Apr · LUT 31 Aug · Turku 15 Aug · Haaga-Helia 19 May | All correct |
| Programme lists | All 13 listed schools, including Aalto, Metropolia (21), TAMK (9), Laurea (6), Haaga-Helia (6) and Arcada (3), checked against every hakukohde in the 2027 rounds on Studyinfo and the schools' own lists | Complete; no extras. The exclusions in progress.md are right: Arcada Nursing TopUp, Laurea SSRM (the page says "Not available in January 2027"), Haaga-Helia's two hospitality variants, and LUT's non-HEBUT Software. |
| Credentials, durations, cities | All LUT cities; all Metropolia durations and campuses; spot checks elsewhere | LUT all right. Metropolia is missing its cities (E7). CSM at 3.5 years matches Metropolia's page; Studyinfo says 4. |
| Programme URLs | 93 of 101 fetched; the 8 UEF URLs are behind Cloudflare | All 93 open the named programme's own page (title and H1 match). |
| `ib` statements | All 14 institution lines; about 30 programme lines | Errors below |
| `summary` lines | All 14 | 2 false, 2 soft (below) |
| `fi-aa` none verdict | Studyinfo first joint application; ÅA application guide | **Correct.** All 12 ÅA options in the English round are master's, and the guide says "all bachelor's degree programmes at ÅAU are taught in Swedish". |

## Errors

Each entry gives the record, the field, what it says, what the official page says, and the URL.

### Material: would mislead a student

**E1. `fi-haaga-helia` › `notes[0]`** (also `progress.md`, the Haaga-Helia line and "Could not verify")
- Says: "Haaga-Helia says IB holders need an SAT score for that route."
- The page says: rolling admission has certificate-based selection groups, and the International Baccalaureate is in the European group. The requirement is "IB diploma completed in English OR 4 or higher in English A HL/SL or English B HL/SL; a minimum of 28 total points…; successful completion of CAS". Predicted grades are accepted for spring 2027.
- URLs: https://www.haaga-helia.fi/en/apply/rolling-admission-certificate-based-student-selection and https://www.haaga-helia.fi/en/apply/rolling-admission-bachelors-studies. Both list "International Baccalaureate" under certificate-based groups.
- The FAQ the researcher relied on is not in `sources`. I found no Haaga-Helia FAQ that says this.
- Effect: an IB student with 28+ points would skip a route open to them from 30 October.

**E2. `fi-haaga-helia` › `ib.text`**
- Says: "In the January joint application every bachelor's place is filled by certificate-based selection, so your IB grades decide."
- The page says two programmes are exceptions: "Sports Coaching and Management: online entrance exam 22.-25.3.2027" and "International Business, blended learning: entrance examination in Pasila campus 8.-11.3.2027 and 15.-18.3.2027". Studyinfo also shows IB blended as "Interview and work experience".
- URL: https://www.haaga-helia.fi/en/apply/joint-application
- The Sports programme entry mentions its exam, so it is half-mitigated. But "every" is false, and the International Business entry does not separate the blended variant.

**E3. `fi-laurea` › `programmes[Social Services].ib`**
- Says: "Laurea's own entrance exam. Blended learning at Tikkurila."
- The page says: "All applicants for the Degree Programme in Social Services are required to have basic Finnish skills (level B1) and English skills (level B2)."
- URL: https://www.laurea.fi/en/degree-programmes/social-services/
- Nursing's entry records the same rule; Social Services drops it. A student without Finnish would apply and be ineligible.

**E4. `fi-lut` › `summary`**
- Says: "Energy-and-tech university in Lappeenranta and Lahti where every bachelor's is in English…"
- The facts: LUT also teaches bachelor's degrees in Finnish. For example, Studyinfo lists *Tuotantotalous, Lappeenranta, tekniikan kandidaatti ja diplomi-insinööri (3 v + 2 v)*, language Finnish, in the 2026 Finnish/Swedish joint application.
- URL: https://opintopolku.fi/konfo/fi/toteutus/1.2.246.562.17.00000000000000009372
- Fix: "every **English** bachelor's is open on published criteria", or name the count ("15 English bachelor's").

**E5. `fi-utu` › `summary`**
- Says: "Finland's second-largest university, in its oldest city…"
- The facts: Turku gives its size as "an active academic community of 25,000 students and personnel". Tampere University gives 23,200 students. The ranking is unsourced, and on these figures it is probably wrong. The schema forbids "a ranking claim unless sourced".
- URLs: https://www.utu.fi/en/university · https://www.tuni.fi/en/about-us/tampere-university

### Overstated, unsourced or unhelpful

**E6. `fi-laurea` › `ib.text` and the programme `ib` lines** ("International UAS Exam" / "Laurea's own entrance exam")
- None of the cited Laurea pages states the 2027 selection method. On Studyinfo, the criteria for all six Laurea programmes read "To be announced" (not public).
- These are plausible carry-overs from 2026, presented as 2027 fact. Mark them as a gap, or say "in 2026 …".

**E7. `fi-metropolia` › programmes: `city` missing**
- The brief says to give `city` when it differs from the institution's (Helsinki). Studyinfo puts these programmes outside Helsinki:
  - Information Technology: Karamalmi, **Espoo**
  - Electronics, Mechanical Engineering, Robotics Engineering, Smart Automation and Laboratory Science: Myyrmäki, **Vantaa**
- The summary says "across Helsinki, Espoo and Vantaa", but no card says which.
- Metropolia's IT page also warns that the campus may move during the 2026 reorganisation.

**E8. `fi-uoulu` › `notes[1]`**
- Says: "International Business Management also has an SAT/ACT rolling admission from 1 October 2026 that can fill its 20 places before 25 February 2027."
- The facts: the 20 places belong to rolling admission ("20 in Rolling Admissions"). The January joint application has its own 13: **10 certificate-based (IB)** and 3 Talousguru.
- URLs: https://www.oulu.fi/en/apply/bachelors-international-business-management and the Studyinfo draft criteria for IBM (toteutus `1.2.246.562.17.00000000000000008820`).
- The note implies rolling can crowd out the IB route. It cannot. The useful fact, that there are only 10 IB places, is missing.

**E9. `fi-aa` › `notes[1]`**
- Says: "An IB taken in Denmark does not count as the Danish route; the Nordic route needs a Danish upper secondary degree with Dansk A."
- The page lists the IB route (Swedish A ≥ 2 or Swedish B ≥ 5) and, separately, "upper secondary school degree from Denmark… Passing grade in Dansk niveau A". It does not say a Danish-school IB is excluded.
- The inference is probably right, but it is stated as the university's rule. Write what the page says: "The Danish route needs Dansk A on a Danish upper-secondary degree; for the IB, only Swedish counts."
- URL: https://www.abo.fi/en/study/apply/swedish-language-requirements/

**E10. `fi-uh` › `summary`**
- Says: "two broad English bachelor's degrees in central Helsinki".
- The facts: the Bachelor's Programme in Science belongs to the Faculty of Science (Studyinfo organiser), which is on the Kumpula campus, not in the city centre. Only Liberal Arts and Sciences is central.
- The brief's own example summary makes the same claim (see Systemic 2).

**E11. `fi-uef` › `programmes[Human and Planetary Health].ib`**
- Says: "10 of 30 places go to certificate-based (IB) applicants."
- The draft criteria on Studyinfo split the 10 into "5 for applicants who have graduated" and "5 for applicants who will graduate in spring 2027". That leaves 5 for our students, with no waiting list. The draft is not yet public, so treat this as a watch item.

**E12. `fi-arcada` › `programmes[IT, Mechanical].ib`**
- Says: "advanced maths at Finnish A or basic at C equivalent".
- This is faithful to Arcada's page ("A in advanced math or C in basic math"), but an IB student cannot read it. Either give the IB grade from the UAS IB table or say "a maths threshold; ask Arcada for the IB equivalent".

**E13. `fi-lut` › programme `ib`, "HL Maths at 4 (AI SL not accepted)"**
- LUT's IB page is internally inconsistent. The table says "Higher 4". The list of acceptable maths courses for engineering includes "analysis and approaches SL" and "mathematics SL".
- The record picks one reading without flagging the conflict. Note it ("LUT's page is unclear whether AA SL counts; ask") rather than resolving it silently.

**E14. `fi-jyu` › `summary`**
- "strongest in education" is an unsourced superlative. Replace it with a fact.

**E15. `fi-metropolia` › `ib.url`**
- Links uasinfo.fi's general certificate-selection page rather than a Metropolia page.
- The "pre-assignment and own entrance exam" lines for 3D Game Art and Game Design are right per Studyinfo's *draft* criteria (`julkinen: false`), but no public page says so yet. For the same reason as E6, mark them provisional.
- The record flags Game Design and Sustainable Fashion as "New in 2027". 3D Game Art is also new in English ("for the first time this programme is available also in English").

### Could not verify

- **UEF:** `2027-04-01` (IB predicted grades) and `2027-07-13` (final IB grades) on `uef.fi/en/eligibility-for-international-bachelors-degree-programmes`, and the 8 UEF programme URLs. uef.fi showed a Cloudflare check in both browsers available to me; I did not try to get past it. Both dates match the national pattern every other university uses for 2027. Studyinfo confirms UEF's window and its 28 January attachment deadline.
- **Turku:** the ICT 40% certificate share. The draft criteria list two groups, but the split sits outside the text I could read.

## Gaps (not errors, but a student would notice)

- **IB document deadlines are recorded unevenly.** Aalto, Arcada, JYU, TAU and Oulu give the 1 April predicted-grades date. Metropolia, Laurea, TAMK and Haaga-Helia give none. A student comparing pages would think those schools have no such deadline.
- **Missing attachment deadlines.** Laurea omits the 28 January attachment deadline that applies to its programmes (uasinfo.fi); UEF omits it too.
- **Metropolia's 21 programmes carry no selection method** except the three culture ones. Its note says the criteria are not public yet, which is honest, but TAMK's are public and are recorded.

## Changes that would raise the score most

1. **Fix E1–E5.** Rewrite the Haaga-Helia rolling note to "IB route: 28 points, English, CAS; apply 30 Oct – 12 May". Change "every" in the Haaga-Helia `ib` line. Add Finnish B1 to Laurea Social Services. Correct the LUT and Turku summaries.
2. **Make unsourced 2027 selection methods visible as provisional (E6, E15),** and give every `ib` claim a source in `sources`.
3. **Add city to Metropolia's Espoo and Vantaa programmes (E7),** and restate Oulu IBM as "10 IB places in January; a separate 20 by SAT/ACT from 1 October" (E8).

With those done I would expect an 8 or 9.

## Systemic issues to fix in the brief before the next 400 schools

1. **Conflicting official pages.** The brief should say what to do when an institution's pages disagree:
   - Trust the page dedicated to that route (admission criteria, selection groups) over an FAQ or overview.
   - Record the conflict in `progress.md` and cite both pages in `sources`.
   - Never resolve a conflict towards "you can't". E1 happened because a FAQ, not in sources, overrode the criteria page.
2. **Fix the brief's own example summary.** "two English bachelor's, both in Helsinki city centre" is wrong: Science is at Kumpula. The researcher copied it. Also add: **no absolute or superlative claims ("every", "all", "largest", "strongest") in `summary` unless a cited page says exactly that.** E4, E5, E10 and E14 all come from this.
3. **Local-language requirements belong in the programme `ib`.** State it outright: "If a programme requires Finnish/Swedish/Dutch/etc. at any level, say so in `ib`." Bilingual nursing, social-services and ECEC degrees are common across the Nordics and the Netherlands.
4. **Always record the IB document deadlines** (predicted grades, final grades via IBIS, acceptance) when published. If they are not published, write one note saying so. These are the dates IB students miss, and the brief today only asks for "whole-institution" dates.
5. **Draft or unpublished criteria.** Say whether preview data (e.g. Studyinfo criteria with `julkinen: false`) may be used. If it may, it must be labelled as not yet published. Last year's method must never be written as this year's (E6).
6. **Translate national grade thresholds into IB terms,** or say that the equivalence isn't published (E12).
7. **`city` per programme** where an institution teaches in several municipalities. Take it from the programme page or the national portal, not the institution's headline city (E7).
8. **Reproducibility.** When a site sits behind bot protection (uef.fi), a reviewer cannot re-check it. Ask researchers to put the exact sentence each date came from in `progress.md`, so the check can be done from the repository.
9. **A tip for the method, not a flaw.** The researcher's use of the national portal's data (Studyinfo konfo-backend) to enumerate every programme with a 2027 round is why the lists are complete. The brief should suggest the equivalent national source per country (Studielink, Universityadmissions.se, Hochschulkompass, and so on) as the completeness check.
