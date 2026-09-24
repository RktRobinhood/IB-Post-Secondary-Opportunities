# Country audit (world and Southern Europe, 15 destinations): fixes after critic round 2

Editor pass, 2026-09-24, answering `round-2.md` (score 7/10). Scope: es, it, pt, gr, mt, us, ca, au, nz, ae, jp, kr, cn, hk, sg.

- Files edited: `data/countries/<cc>.json`, `data/application-routes/<cc>-*.json`, one new record in `data/evidence/cn.json`, and `scripts/test-deadline-labels.mjs`.
- Not touched: `src/`, the photo files, and every `meta` block.
- This log is written as the fixes are made, one section per fix.

## 1. Portugal: Nova SBE is public and closed to direct EU application (top fix 1)

Sources, both fetched 2026-09-24 with curl:
- https://www.novasbe.unl.pt/en/programs/apply/bachelors/international-students: international student status does not apply to anyone "Being a national from a Member-State of the European Union or a State Party of the Agreement on the European Economic Area (EEA)". The IB rows ("Minimum 36 points", "Mathematics: minimum 6", HL; "Minimum 34 points" for Ocean Studies) sit under the criteria for applying "directly to Nova SBE" as an international student.
- https://www.novasbe.unl.pt/en/programs/apply/bachelors/national-call: "As a Public University, the application process to the Bachelor's Degrees is managed by the Portuguese Ministry of Higher Education (DGES …)"; "Candidates with a non-Portuguese high school system (e.g., European Union candidates) will have to request an equivalence".
- The critic's quote "must instead apply through Portugal's National Call" is not verbatim on the international-students page. The national-call page above says the same thing in its own words, so it is cited instead.

Changes, all in `data/countries/pt.json`:
- `ibRecognition.subjectLevelRule`: "Individual private institutions set their own HL rules — Nova SBE asks for at least 36 IB points with Mathematics at 6 or better for Economics and Management, and 34 points for Ocean Studies." → "Private institutions such as Católica set their own IB rules. Nova SBE's 36 points (Mathematics HL at 6 or better) for Economics and Management, and 34 for Ocean Studies, are the rules of its international route, which is closed to EU citizens."
- `ibRecognition.notes[4]`: "Private institutions such as Nova SBE and Católica accept the IB directly…" → "Private institutions such as Católica accept the IB directly…"
- `steps[6]`: "…or apply directly to a private institution such as Católica or Nova SBE." → "…or apply directly to a private institution such as Católica Lisbon."
- Checked and left alone: `destinations/pt.json` already says "Nova SBE is public: an EU applicant reaches it through the national contest, not its international route."

## 2. Two badges that contradicted their notes, and the guard widened (top fix 2)

### The guard

`scripts/test-deadline-labels.mjs` now fails on two more shapes. It names no country and no institution.
- `SAYS_NO_SINGLE_DATE` = `no single deadline|each (embassy|university|college|institution) sets its own`: fails a `hard` card whose note says this.
- `SAYS_MONEY_ONLY` = `costs money|rather than a place`: fails a `priority` card whose note says this.

Run on the old data, the widened guard **failed on 3 cards**:
- China: "Chinese Government Scholarship (CGS/CSC) — and its old official portal no longer works" is marked hard, note says "each university sets its own".
- Australia: "Early-bird processing charge ends" is marked priority, note says "costs money".
- **South Korea: "University Track application, 2027 GKS-U" (30 November 2026)**, marked hard, note says "each university sets its own". The critic did not name this one; the new pattern found it. It is the route round in `application-routes/kr-gks-university-2027.json`, whose note says "The dates here bound the published range and are not any one university's deadline."

After the three fixes below, it passes: 756 events, "every label agrees with its note".

### The cards

- `data/countries/cn.json`, the CGS card:
  - `label`: "Chinese Government Scholarship (CGS/CSC) — and its old official portal no longer works" → "Chinese Government Scholarship (CGS/CSC): each embassy and university sets its own date". The dead-portal warning stays in the note.
  - `dateState`: `not-yet-announced` → `varies-by-institution`; `consequence`: `hard` → `indicative`.
- `data/application-routes/au-uac-2027.json`, `ms-earlybird` "Early-bird processing charge ends": `consequence`: `priority` → `indicative`. UAC says nothing about the order of consideration; the charge is the only consequence.
- `data/application-routes/kr-gks-university-2027.json`, round `rd-gks-university-2027`: `consequence`: `hard` → `indicative`. No text changed. Each university's own deadline falls inside the range, so the 30 November end of the range is not a date a student can plan to.

## 3. Australia: future dates in the past tense (item 6)

Source: https://www.uac.edu.au/key-dates, fetched 2026-09-24: early bird "September 30, 2026, 11:59 pm"; semester 1 2027 final closing "February 5, 2027, 11:59 pm"; no 2027-28 cycle dates published.

`data/application-routes/au-uac-2027.json`:
- `ms-earlybird` note: "In the 2026-27 cycle the cut-off was 23:59 Sydney time on 30 September 2026. The 2027-28 date had not been published as of September 2026." → "In the 2026-27 cycle the cut-off is 23:59 Sydney time on 30 September 2026. The 2027-28 date is not yet published."
- The closing-date milestone note: "The 2026-27 cycle closed at 23:59 on 5 February 2027…" → "The 2026-27 cycle closes at 23:59 on 5 February 2027…"

## 4. China: BNBU's dates shown as earlier cycles' pattern (top fix 3)

Sources, both fetched 2026-09-24 with curl:
- https://ido.bnbu.edu.cn/en/info/1006/1019.htm (the page the card cited): headed "What is the application period for International Student Application for 2025 entry?", answered "Application Period I: September 1st to December 31st. Application Period II: February 10th to May 15th."
- **https://admission.bnbu.edu.cn/ido/faqs.htm, a newer FAQ found while checking:** "What is the application period for International Student Application for 2026 entry? … Application deadline is May 15th." It gives no Period I at all.
- Neither page, nor a site search of bnbu.edu.cn, gives dates for 2027 entry.

So the critic's fix was not quite enough: marking both periods as the 2025 pattern would still have shown a Period I that BNBU's 2026-entry page no longer mentions. The two cards are merged into one.

The shape used is the one other routes already use for a date known only from an earlier cycle: `dateState: "not-yet-announced"`, no `date`, and the precedent in the note (for example `be-fwb-direct-2027.json`, "In 2026 registration ran 18 May to 5 July").

`data/application-routes/cn-joint-direct-2027.json`:
- Before: `ms-cn-jv-bnbu-p1` "BNBU application period I", 2026-09-01 to 2026-12-31, priority, provisional; and `ms-cn-jv-bnbu-p2` "BNBU application period II", 2027-02-10 to 2027-05-15, hard, provisional.
- After: one milestone, `ms-cn-jv-bnbu` "BNBU applications close", `dateState: "not-yet-announced"`, `consequence: "hard"` (one real deadline whose day is not out). Note: "For 2026 entry BNBU gave one deadline, 15 May. For 2025 entry it ran two periods, 1 September to 31 December and 10 February to 15 May. It has not published its dates for 2027 entry."
- Nothing else referenced the two old ids.

`data/evidence/cn.json`: new record `ev-cn-bnbu-deadline-2026` for the admission.bnbu.edu.cn FAQ (read-source, needs-review), cited by the milestone and the route beside the existing `ev-cn-bnbu-periods`. `npm run validate`, `test-sourcing` and `test-evidence-policy` pass.

`data/countries/cn.json` watchOuts: "Deadlines are given for Duke Kunshan, NYU Shanghai, XJTLU, BNBU and (for 2026) Zhejiang; ask the others directly." → "Deadlines are given for Duke Kunshan, NYU Shanghai and XJTLU; for BNBU (2025 entry) and Zhejiang (2026) only last cycle's dates are published; ask the others directly."

## 5. "See tuitionNonEu." removed (top fix 4)

`money.tuitionEu.value` in six files ended with the raw field name. The same text also renders on `/compare/`, where there is no "below" to point to, so the sentence is cut rather than reworded. The non-EU tuition row follows it on each country page anyway.

- `data/countries/ae.json`: "…federal institutions prioritise or subsidise Emirati nationals. See tuitionNonEu." → "…Emirati nationals."
- `data/countries/cn.json`: "…joint-venture universities charge a single fee to everyone. See tuitionNonEu." → "…to everyone."
- `data/countries/hk.json`: "…a Danish student is non-local. See tuitionNonEu." → "…is non-local."
- `data/countries/jp.json`: "…there is no EU/non-EU split. See tuitionNonEu." → "…split."
- `data/countries/kr.json`: "…at most universities. See tuitionNonEu." → "…at most universities."
- `data/countries/sg.json`: "…A Danish student is an International Student. See tuitionNonEu." → "…an International Student."
- `grep "tuitionNonEu." data/` now finds nothing.

## 6. Hong Kong: the four-year total and the unsourced claims (top fix 5, section 5)

Sources, fetched 2026-09-24:
- https://admissions.hku.hk/fees-and-scholarships/tuition-and-living-expenses: 2027/28 non-local tuition "HK$ 280,000" (STEM), "HK$ 250,000" (non-STEM), "HK$ 590,000" (MBBS and BDS).
- CUHK HK$230,000 for 2027/28 was confirmed by the critic (round 2, fact 16). The other figures are the page's own `tuitionNonEu` row, unchanged.
- Exchange rate: Danmarks Nationalbank, https://www.nationalbanken.dk/api/currencyratesxml?lang=en, rates for 2026-09-24: HKD 83.86 per 100 (so HK$920,000 ≈ DKK 771,500 and HK$1,120,000 ≈ DKK 939,000).

Arithmetic: 4 × HK$230,000 (CUHK) = HK$920,000; 4 × HK$280,000 (HKU STEM) = HK$1,120,000. Medicine and dentistry (HK$590,000) are outside the range and now say so.

`data/countries/hk.json`:
- watchOuts: "Over a four-year degree that is roughly HK$1.0–1.3 million in tuition alone — about DKK 900,000 to 1.1 million at recent rates." → "Four years of tuition alone comes to roughly HK$0.9–1.1 million at 2027/28 fees (medicine and dentistry excepted) — about DKK 770,000 to 940,000 at September 2026 exchange rates."
- watchOuts: "The first rounds are the ones that matter: CUHK closes 12 November 2026, CityU 15 November, PolyU 17 November, HKU and HKUST 25 November. Offers and the good scholarships go out from December. Applying later is possible at most of them but competitively worse." → "The first rounds close in November: CUHK on 12 November 2026, CityU 15 November, PolyU 17 November, HKU and HKUST 25 November." The dates are unchanged; the two unsourced sentences are cut.
- HKU final-deadline card note: "…so a late application is possible — but the best programmes and scholarships will already be allocated. HKU also warns…" → "…so a late application is possible. HKU also warns…"
- `selectionNotes`: the last sentence, "Because the non-local pool is separate from the JUPAS pool, a good IB student is competing in a smaller field than the raw rankings suggest.", is cut. It was the site's reasoning, not HKU's.
- `money.notes[0]`: "…roughly HK$292,000 a year — the cheapest of the big three." → "…roughly HK$292,000 a year, and its tuition is lower than HKU's and HKUST's." From the page's own figures: CUHK HK$230,000 against HKU HK$250,000–280,000 and HKUST HK$260,000.
- whyConsider: "Five universities in a small territory, all research-intensive, all internationally ranked, all reachable by metro." → "The five universities covered here are all in one small territory, all reachable by metro." (section 5: there are eight UGC universities; "research-intensive" and "internationally ranked" had no source).

## 7. Portugal: "Context, not a milestone" and future dates in the past tense (item 6)

Source: https://wwwcdn.dges.gov.pt/en/node/3685 (the calendar the cards cite), fetched 2026-09-24 with curl: "Divulgação das vagas a que se refere o n.º5 do artigo 44.º …" 01 de setembro; "Divulgação das vagas a que se refere o n.º 3 do artigo 49.º …" 9 de outubro, before the third phase's 10–12 de outubro; "Decisão sobre as reclamações referentes à 3.ª fase …" 16 de novembro.

`data/countries/pt.json`:
- 2nd-phase applications card, note: "Context, not a milestone: the vacancies left for the second phase were announced on 1 September 2026, which is information appearing rather than anything a candidate has to do. The date you act on is the closing date of this window." → "DGES publishes the places left for this phase while the window is open (on 1 September in 2026); you do not have to do anything then. The date you act on is the closing date."
- 3rd-phase applications card, note: "A three-day window. Context, not milestones: vacancies for this phase were announced on 9 October 2026, and DGES must decide any final complaints by 16 November 2026, which is a deadline binding on the administration rather than on you." → "A three-day window. The places for the third phase are announced the day before it opens (9 October in 2026). DGES must decide any complaints about its results by 16 November 2026; that deadline binds DGES, not you."

## 8. Singapore: SUSS and SIM research-log lines (item 6), and one date corrected

**SUSS was read this time.** Its pages return 403 to curl and WebFetch, but loaded in the browser pane with no challenge to complete.
- Source: https://www.suss.edu.sg/admissions/application-process/how-to-apply/full-time-undergraduate-application-guide, read 2026-09-24: "Application for full-time undergraduate programme July 2026 intake has closed!" and "Application for the July 2027 intake will begin in November 2026."
- **This corrects a month.** The card said "August 2027 intake". SUSS calls it the July 2027 intake.

Changes:
- `data/countries/sg.json`, the SUSS card:
  - `label`: "Singapore University of Social Sciences — August 2027 intake" → "Singapore University of Social Sciences — July 2027 intake"
  - `year`: "August 2027" → "July 2027"
  - `dateState`: `not-published` → `not-yet-announced` (SUSS has said when it opens). It stays `hard`: one real deadline whose day is not out.
  - `notes`: "Not confirmed here. SUSS's 2027 dates could not be checked, which does not mean SUSS has published nothing. Open suss.edu.sg yourself." → "SUSS says applications for the July 2027 intake open in November 2026. The closing date is not out yet."
  - `source`: suss.edu.sg/full-time-undergraduate → the application-guide URL above.
- `data/countries/sg.json` watchOuts: "The 2027 dates of SUSS and James Cook University Singapore are not confirmed here. That does not mean they have published nothing: check their admissions pages yourself." → "SUSS opens applications for its July 2027 intake in November 2026. James Cook University Singapore's 2027 dates are not given here: check its admissions page." (JCU was not read; nothing about it is added.)
- `data/destinations/sg.json`, the autonomous-universities deadline summary: "SUSS's dates are not confirmed here." → "SUSS opens for its July 2027 intake in November 2026."
- `data/application-routes/sg-autonomous-2027.json` supplementary step: "SUSS's pages could not be read, so nothing about its 2027 dates is claimed here in either direction." → "SUSS says applications for its July 2027 intake open in November 2026, with no dates yet."
- `data/countries/sg.json`, the SIM card:
  - `notes`: "Not established, and probably not establishable at this level. SIM delivers partner universities' degrees and each partner runs its own intakes, so there is unlikely ever to be one SIM date. Check the specific partner degree rather than SIM." → "SIM delivers partner universities' degrees and each partner runs its own intakes, so there is no one SIM date. Check the dates for the specific partner degree."
  - `dateState`: `not-published` → `varies-by-institution`, which is what the note describes. It was already `indicative`.

## 9. US and China: "this profile" (item 6)

"This profile" is research-log wording; round 1 made the same change for Berkeley in `destinations/us.json`.
- `data/countries/cn.json`, the "no central system" card note: "…the one this profile covers…" → "…the one this page covers…"
- `data/destinations/us.json`:
  - watchOuts: "Among the fourteen institutions in this profile the regular round…" → "…covered here…"
  - Common App jurisdiction summary: "…spread across all ten states in this profile, on one form." → "…all ten states covered here…"
  - "…because none of the fourteen institutions in this profile uses one." → "…covered here uses one."
- `data/application-routes/us-direct-2027.json`: "MIT is the only institution in this profile on it;" → "MIT is the only institution covered here that uses it;"
- `data/application-routes/us-uc-2027.json`: "UC Berkeley is the campus in this profile, but…" → "UC Berkeley is the campus covered here, but…"

## 10. Canada: the Concordia double negative (item 6)

Source: https://www.concordia.ca/admissions/undergraduate/apply.html, fetched 2026-09-24 with curl: "FALL ENTRY (September) Deadline: March 1"; "U.S. and international applicants: Apply no later than February 1".

`data/countries/ca.json`, "Quebec — Concordia University, fall entry, general deadline", `audience`: "applicants who are not applying from outside Canada" → "Canadian applicants (US and international applicants: 1 February)". Concordia names US applicants alongside international ones, so the audience does too.

## 11. Malta: TOEFL on the 1–6 scale (item 6)

Source: https://www.um.edu.mt/study/admissionsadvice/international/englishlanguagerequirements/, fetched 2026-09-24 with curl: "effective January 2026, the TOEFL iBT's grading system has been revised. Consequently, both the previous and the updated grading systems are accepted." Undergraduate Course row: pre-January 2026 overall 80, writing 20; January 2026 onwards overall 4, writing 4.5. The IELTS row (6.0, writing 6.0, other bands 5.5) matches the page as it was.

`data/countries/mt.json` `englishProof`: "…for a bachelor's: TOEFL iBT 80 (writing 20), Academic IELTS…" → "…for a bachelor's: TOEFL iBT 4 overall with writing 4.5 on the 1–6 scale used since January 2026 (80 with writing 20 on the older scale), Academic IELTS…"

## 12. Unsourced superlatives left from round 1 (section 5)

No new facts; each cut removes a claim with no source.
- `data/countries/es.json`, UPC institution note: "Catalonia's main technical university, and the usual route into engineering in Barcelona." → "Catalonia's main technical university."
- `data/countries/kr.json`, financial aid: "…GKS, run by NIIED — the flagship government scholarship for undergraduate degrees, and smaller than it looks from Denmark." → "…the Korean government's scholarship for undergraduate degrees, and smaller than it looks from Denmark."
- `data/countries/sg.json` `healthcare`: "Singapore's healthcare is excellent but not free at the point of use" → "Singapore's healthcare is not free at the point of use".

## Checks after the edits

- **The widened guard fails on the old data and passes on the new.** Before the card fixes, `node scripts/test-deadline-labels.mjs` failed on 3 cards (CN CGS, AU early bird, KR GKS-U round; section 2). After them: "ok, every label agrees with its note", 756 events.
  - Note for the record: the first version of the edit wrote backspace characters where `\b` belonged, so the new patterns silently matched nothing and the guard passed the old data. That was caught because the guard was run before the data was fixed; the `\b`s were restored and the guard then failed as it should.
- `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs`: **all 28 checks pass**, 1 advisory (freshness), including `validate`, `labels`, `sourcing`, `evidence-policy`, `calendar`, `build`, `check`, `page-budget` and `release`.
- The built pages (`dist/`) no longer contain "tuitionNonEu.", "competitively worse", "big three", "Católica or Nova SBE", "could not be checked" or "not applying from outside" on any of the 15 pages. "BNBU applications close", "July 2027 intake" and "TOEFL iBT 4 overall" render.

## Deferred

Template-level, in `src/`, left for the coordinator:
- **AU and NZ headers say "Describes the 2027 autumn intake."** and every card prints the raw window tag "2027-autumn" (round 2, 3.4 item 4). Korea explains the wording in its own text; AU and NZ do not.
- **Duplicate country/route cards** (3.4 item 6): HK (HKU first round, HKUST priority and close, HKU close vs "HKU — final deadline"), CN (NYU ED I/II, DKU ED/RD, XJTLU), CA (UBC ×4), SG (Joint Acceptance Exercise, Tuition Grant agreement), AE (Birmingham Dubai visa, AUS Fall 2027 opening), PT (CNAES list, substitution deadline). HK's header count ("17 dated events" for about 11 distinct ones) follows from this. It is a template decision: which record owns a date.

Data items noted by the critic but not scored, left as they are:
- CN "Sit the CSCA before you apply" (`application-routes/cn-national-direct-2027.json`): hard and undated, with five sittings a year. It is a requirement rather than a date; the critic did not ask for a change.
- US "Early Decision is binding — applying early is a commitment, not an early submission": an explanation card badged Priority.
- The CN Tsinghua note's closing sentences about the research ("That FAQ is in Chinese only, … dated to the 2017 cycle"): honest but long.
- PT: 15 of 23 cards are 2026-cycle dates badged "Hard deadline" while the header calls carried-over dates indicative. A site-wide pattern the European loop accepted.

Found during this pass, outside the brief, for the coordinator:
- **`data/destinations/sg.json`**, the autonomous-universities summary, says "one August intake". SUSS's intake is July (section 8). Not changed: the other five universities' intake months were not re-read.
- **`data/countries/pt.json` `englishProof`** still reads "Nova SBE and Católica accept standard English evidence". The English list on Nova SBE's page belongs to its international route; an EU applicant reaching Nova SBE through the national contest meets the contest's provas instead. Not changed because the critic did not raise it and the national-call page was not read for English rules.
- **"the year here is inferred from the intake this profile covers"** appears in 13 calendar notes on the timeline, from the European country files (`data/countries/{hu,ie,is,lt,lv,no,se}.json` contain "this profile"). Same research-log wording as section 9, out of this pass's scope.
- `data/evidence/us.json` `ev-uc-dates-fall-2027` and `data/destinations/us.json` `meta.notes[0]`, left over from round 1, were not checked in this pass.
