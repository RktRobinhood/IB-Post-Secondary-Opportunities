# Round 6: closing issue #42 (progress log)

Worktree `D:\ibp-tmp\w42`, branch `fix-42-planner`, cut from main at 8ddcb51.
This log is written as the work happens, so it survives if the session ends.

## Scope, as established from the record

Sources read: issue #42 and its two comments, `docs/STATUS.md`,
`critique-round-5.md`, `round-5/fixes.md`, `verification-2-after-round-5.md`
and `NOTES.md`. The body checklist (round 4, seven fixes) shipped in d0d4ec0;
310565b, 64a2c28 and 6472c59 fixed the round-5 critique and two verifications.
No third verification report is in the repo.

Items still to verify against the current code and build:
1. The two-course cap labelled as the site's own rule.
2. Phone reading order (legend ~26,000 px down).
3. Gap lines that run to paragraphs.
4. AU/SDU/CBS/ITU rules cited to landing pages without the quoted sentence.
5. Round-4 small items (SEA English, finder "No Mathematics A", "Last cut-off
   Restricted", AAU Chem 21 < 24, "Also accepted … no IB route", test route
   printed 2-3 times, non-EU actions at SDU).

## Log

### 29 Sep: sources found (web research agent, WebFetch on 2026-09-29)

WebFetch summarises pages, so each quote below is as the fetch tool returned it.

- **AU**: https://bachelor.au.dk/en/international-applicants/moreinfo/supplementary-subject-levels
  ("Supplementary Subject Levels"). Contains: "You can take as many supplementary
  courses as you need to if they are completed before 5 July."; "It is only
  possible to take 2 supplementary courses if they are completed after 5 July.";
  conditional admission with documentation "no later than 5 September"; AP and
  A level count as A level. Also: "Grades from supplementary courses completed
  after 5 July cannot be used in the calculation of your quota 2 GPA."
- **SDU**: https://www.sdu.dk/en/uddannelse/bachelor/bachelor-admission/special-conditions/supplementary-courses
  Contains: "…any offer of admission to SDU will be conditional on you passing the
  supplementary course(s) by 31 August." and "If you are from a country outside of
  the EU/EEA, you must have finished your supplementary courses before 5 July…".
  No general count after 5 July (one level in one subject only for Medicine,
  Clinical Biomechanics, Psychology), so the cautious 1 for EU/EEA stays.
- **CBS (Cambridge)**: https://www.cbs.dk/en/study-programmes/bachelor-programmes/application-and-admission
  contains the "fulfil both … English level B with a min. grade of 6.0 and the
  language requirement English level A" sentence. The existing Evidence record
  is the right page; its automated excerpt just did not capture the sentence.
- **CBS (no summer supplementation)**: https://www.ug.dk/artikel/sommersupplering-og-betinget-optagelse
  (found via search, ug.dk/videregaaendeuddannelse/supplering/sommersupplering-og-betinget-optagelse
  redirects there): "Copenhagen Business School (CBS) CBS accepterer ikke sommersupplering."
  CBS's own pages saying so returned 403; CBS's English page says only that all
  specific requirements must be documented by 5 July at 12:00.
  Lead, not acted on: the same ug.dk list says DTU, ITU, RUC, SDU, AAU and AU
  accept summer supplementation on all programmes. Using it would turn some
  "Needs review" cards greener, so it needs a person to read the page and
  confirm the year before any verdict changes.
- **ITU**: https://en.itu.dk/Programmes/BSc-Programmes/Applying-to-a-BSc-programme/English-language-requirements-and-supplementary-courses
  contains the Danish A sentence, "this is only an opportunity for applicants
  exempted from paying tuition fee", 5 July 12:00 / 1 September, and the Maths
  routes (VUC, University of Amsterdam, International A level grade C).
  ITU's BSc overview https://en.itu.dk/Programmes/BSc-Programmes contains
  "only the programme in Data Science is open to international students".

### 29 Sep: status of each remaining item, checked against the code

1. **Two-course cap labelled as ours** — already fixed (310565b/64a2c28):
   legend "at most two (our limit)"; a card the cap alone decides says "Our
   limit: … It is our limit, not the university's." (`planSteps`); synthetic
   scenario "three courses where the publisher allows five" guards it. Cards
   with too many courses for the intake say "For 2027" with the reason.
2. **Phone reading order** — already fixed (310565b): "What these results
   mean, and what they cannot tell you" is one collapsed line directly under
   the count and chips (`src/pages/planner.mjs`); actionable cards first.
3. **Gap lines as paragraphs** — fixed now:
   - a "one of" missing two subjects is two ✗ lines (`parts`, engine; the
     planner renders `reasonParts`); AAU Chemical Engineering P1 was one
     paragraph with two "This needs";
   - the lead a phone shows is `splitLead` (exported by the engine, used by
     planner.js and the test), and long leads were split: ✓ lines now lead
     "Needs X: your Y meets it." with the conversion one tap down; the AU
     floor, the portfolio/test lines, open questions and the Danish A SL
     caution lead with a short sentence;
   - P5 at CBS: the English A gap now names the Cambridge step that closes
     both before the IELTS route that needs English B at 5.
   Guards (test-eligibility, "Round 6"): ✗ leads ≤ 20 words, others ≤ 28;
   no line with two "This needs"; AAU Chem two lines; CBS P5 order; P1 at
   CBS still offered IELTS.
4. **Citations** — fixed now: seven Evidence records (read from the page
   source, excerpt = the sentence) and AU/SDU/CBS/ITU `levelRaise.evidence`,
   the six CBS Cambridge `alternativeTest.evidence` and ITU GBI's
   "only Data Science" rule repointed. Guard: every levelRaise and
   alternativeTest cites a person-read excerpt holding each date it states;
   a planted AU landing-page citation is caught.
5. **Small items** — all already fixed in round 5 (d0d4ec0), verified on the
   build: no "No Mathematics A", no "Last cut-off … Restricted", AAU Chem
   reads "Any IB Diploma / Danish 3.3", no "Also accepted … no IB route",
   CBS/ITU "What you need" print each test once in full, P7 at SDU says
   "every course must be passed by 5 July"; SEA English B is not
   Diploma-exempt and the Course Results test question is a "?". Their
   guards are in test-eligibility and test-requirement-translation.

Eligibility scenarios: 302 → 313 (README updated).

### 29 Sep: verified

- Verdicts: all nine round-4 profiles against every Opportunity give the same
  outcome on every card before and after this round (wording only changed).
- Gate: `MSYS_NO_PATHCONV=1 SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs`
  → "All 39 checks pass." exit 0 (freshness advisory). Eligibility 313
  scenarios; ib-terms 772 checks.
- Shots (root-based build served on 4461, `round-6/shoot-planner.mjs`, text in
  `shots.json`): `p1-phone-top`, `p1-phone-meaning-open`,
  `p1-phone-aau-chem-why` (Physics and Chemistry as two ✗ lines),
  `p1-phone-au-cs-why` (short ✓ leads), `p1-desktop-top`,
  `p1-desktop-aau-chem-why`, `p5-phone-cbs-ib-why` and `p5-desktop-cbs-ib-why`
  (the Cambridge step that closes both is named before the IELTS route).

### Left open, on purpose

- The ug.dk list (2026 information) says AAU, DTU, RUC and SEA accept summer
  supplementation on all programmes. That would answer the first "Still needs
  a source" item for those, but it would make cards greener on a list stamped
  for 2026, so it waits for a person to confirm the 2027 position.
- The national sentence "Take the level as a Danish supplementary course" can
  still appear in the "How to close a gap" box, which describes the gaps that
  have a level to raise; from-nothing gaps no longer print it.
- Each card's side block (cut-off, source, link) is still about 200 px on a
  phone.
