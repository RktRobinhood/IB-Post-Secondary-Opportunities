# Round 5: fixes for the round-4 critique (issue #42, scored 7/10)

These fixes answer `critique-round-4.md`. Each numbered fix below lists what
changed, the guard that now fails if it regresses, and any fact that still
needs a source.

No admissions fact was fetched this round, because outbound access to the
universities' sites is blocked. Every rule that changed uses a quotation
already in the repository. Most of these quotations come from the round-4
critique, which read the pages in a browser on 25 September 2026. Others come
from NOTES.md (rounds 2 and 3) or from existing Evidence.

Gate: `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs`
passes 35/35 with exit 0. `freshness` is advisory only.
- eligibility: 202 scenarios, up from 143;
- ib-terms: 811 checks, up from 736.

## What the evidence shows

The planner was run with the critic's nine profiles
(`round-4/planner-profiles.json`) on a local build:
- `planner-verdicts.txt` has every non-green verdict, with each ✗, ? and !
  line and the new "To do" summary (`>>`);
- the JPEGs are the same cards the critic shot, with the same numbering;
- `text-shots.json` holds each shot's visible text.

Phone captures show the sticky header over the content. That comes from
full-length capture, as in round 4, and is not a site bug.

| Profile | Round 4 (live) | Round 5 (local) |
|---|---|---|
| P1 English B SL 5, Maths AI SL, no Physics | 23 · 31 · 5 · 14 | 23 meet · 27 possible · 5 review · 18 not met |
| P4 27 pts | 40 · 15 quota 2 · 8 · 9 · 1 | 40 · 15 quota 2 · 3 · 9 · 6 |
| P5 English B SL 4 | 48 · 9 · 9 · 7 | 48 · 10 · 9 · 6 |
| P6 Course Results, no total | **0** · 46 · 23 · 4 | **17** · 31 · 6 · 19 |
| P8 24 pts | 21 · 3 · 26 · 7 · 16 | 21 · 3 · 21 · 7 · 21 |
| P9 Danish A Lit SL | 28 · 21 · 10 · 14 | 29 · 21 · 9 · 14 |

"Possible with action" fell where it had named no action. "Not met" rose by
the same cards:
- Dutch programmes that asked for an IB subject the student lacks;
- Dutch Course Results routes that wait until age 21;
- RUC below its hard minimum;
- three-course gaps.

## 1. The action is keyed to the missing subject (ITU Danish A)

**What changed**
- `levelRaise` on an Institution can now hold several parts, and the schema
  says which is which:
  - `text`, which names no subject;
  - `subjects[]`, a text per subject;
  - `timing`;
  - `groups[]`, a timing or text per applicant group;
  - `multiple`, what the source says about taking more than one course.
- The Recognition Scheme's `levelRaise` also gained `multiple`.
- The engine picks the text through `levelRaiseFor(rule, index, institution,
  profile)`, which is exported.
- ITU:
  - Mathematics keeps ITU's Maths routes;
  - Danish now quotes ITU: "You complete a supplementary course in Danish
    level A. In Denmark, supplementary courses are offered by VUC."
- "(it corresponds to Danish A)" became "(it counts as Mathematics A)".
- AU's "as Danish A level" became "as A level".

See `10c-planner-p1-itu-gbi.jpg`.

**Guards** (`scripts/test-eligibility.mjs`, "round 4")
- P1 at ITU GBI names ITU's Danish A course, and its action says nothing
  about Mathematics.
- The guard reads the action for every subject rule in the catalogue, for
  every applicant group (1,028 actions). It fails if an action names another
  subject:
  - a subject written with a level ("Danish A", "Danish level A", "Danish at A
    level") counts as named;
  - so does a bare subject name that is not also a Destination adjective.
- A planted copy of the round-4 ITU text on a Danish gap is caught.
- The national sentence's adjectival "Danish" is not caught.

**Needs a source**
- There is no Evidence record for ITU's
  `…/English-language-requirements-and-supplementary-courses` page. The
  critique quotes it but elides the full URL. The Danish sentence cites
  ITU's general-admission Evidence until someone records the page. This is
  logged in `dk-itu.json` `meta.notes`.

## 2. A missing Physics is named, and two courses count as two

**What changed**
- In a "one of", an option that no IB subject can reach now counts as a
  closed door, not a question. Geoscience A is the example: it has a scheme
  reason and no action. On a tie, the option whose gaps have actions wins.
  - So P1 at AAU Applied Industrial Electronics shows "✗ This needs Physics
    (SL or HL), and your profile has none. To close it: …".
  - The line ends "The other option, Geoscience A, has no IB equivalent, so it
    is not a way in."
- Every gap now carries `actions`. `planSteps()` in the engine decides the
  outcome:
  - one step means Possible with action;
  - several steps mean Possible only if all of them are supplementary courses,
    there are at most `MAX_RAISES` (2), and a publisher's `multiple` sentence
    is recorded;
  - otherwise the result is Does not currently meet.
- The result carries `actionSummary`. The planner shows it as "To do":
  > 2 supplementary courses: Mathematics at A level and Physics at B level.
  > Only one subject can be taken as summer supplementation after 5 July, so
  > any other has to be passed by 5 July.

  See `10d-planner-p1-aau-aie.jpg`.
- The `multiple` sentences come from these sources:
  - National, from ug.dk as quoted in the scheme's `levelRaise.source`: "Du
    kan som udgangspunkt kun tage ét fag på ét niveau via sommersupplering."
  - AU, from its supplementary page as quoted in NOTES round 3: "You can take
    as many supplementary courses as you need to if they are completed before
    5 July" and "It is only possible to take 2 supplementary courses if they
    are completed after 5 July".
  - CBS, from ug.dk as quoted in NOTES round 3: "CBS accepterer ikke
    sommersupplering".
- SDU has no `multiple` of its own, so the national sentence applies.

**Guards**
- P1 at AAU AIE:
  - is Possible with action;
  - names Physics as a gap;
  - shows no Geoscience "?";
  - has a summary that names both courses and the 5 July limit.
- For P1, no programme in the catalogue shows a "Geoscience" unknown.
- One missing subject gives a single step and no summary.
- Synthetic records:
  - three supplementary courses give Does not currently meet;
  - two give Possible;
  - two with no `multiple` sentence recorded give Does not currently meet.

**Needs a source**
- SDU's own limit after 5 July. The critic says SDU allows one, but the only
  SDU quotation in the repo says "course(s) by 31 August". The engine falls
  back to the national sentence.
- `MAX_RAISES = 2` is a product rule, not a published one. AU allows any
  number before 5 July. Two was the critic's line.

## 3. CBS: Cambridge C1 185+ / C2 200+ meets English B 6.0 and English A

**What changed**
- A new requirement field, `alternativeTest`, is in the schema. It has
  `label`, `shortLabel`, `note`, `alsoMeets` and `evidence`.
- The English-B-at-6.0 rule on all six CBS programmes now carries CBS's
  Cambridge route with `alsoMeets: ["req-english-language"]`. The source is
  the critic's quotation of cbs.dk application-and-admission: "if you have
  passed one of the above Cambridge exams with the required minimum score, you
  fulfil both the specific entry requirement of English level B with a min.
  grade of 6.0 and the language requirement English level A". The same fact is
  in NOTES round 2 and in the record's own note.
- A grade below the minimum is now actionable only where such a test is
  recorded. `planSteps` counts a step that `alsoMeets` another gap as one
  step.
- P5 at every CBS programme is now Possible with action: "To do: One step
  closes both: Cambridge C1 Advanced, passed at grade C with an overall score
  of 185 or more, or C2 Proficiency at grade C with 200 or more." See
  `14b-planner-p5-cbs-phone.jpg`.
- The page's English line reads "English B HL or English A — or English B SL
  5+ with IELTS 7.0 — or Cambridge C1 185+". See
  `20-cbs-ib-what-you-need-phone.jpg`.

**Guards**
- There are six CBS programmes. For P5, each is Possible, and its summary
  names Cambridge.
- P1 at CBS still names IELTS.
- With `alternativeTest` removed, P5 at CBS is Does not currently meet again.
  This shows the rule comes from the data.
- ib-terms checks that CBS International Business names "Cambridge C1 185+"
  beside the English grade.

## 4. Course Results: the six grades are the total, and the long route is said once

**What changed**
- For a Course candidate with no total, `ib-course-results` adds up the
  grades. It says "(your 6 grades add up to 33)" and never asks for a
  "predicted total".
  - P6 at SEA, Dania, BAAA, VIA and the BEng programmes now shows Meets. P6
    went from 0 meets to 17.
  - P6's grades add up to 33, not the 34 the critique gives.
- A quota floor for a Course candidate now says: "The table converts Diploma
  totals, and how Course Results are averaged is not recorded here: ask the
  institution." It no longer asks for a total.
- Gaps carry `shared` passages. The planner prints any passage found on two
  or more visible cards once, in a new "How to close a gap" box above the
  results:
  - a card then says what the passage is and links up, as in "…a
    supplementary course (how: see above)";
  - the national supplementary sentence and each institution's text are shown
    whole in the box;
  - a Course Results route shows its one-line `alternativeRouteSummary.short`,
    with the full text one tap down.
  - See `p1-how-to-close-a-gap.jpg`, `p6-how-to-close-a-gap.jpg` and
    `15-planner-p6-au-cs.jpg`.

**Guards**
- P6 at SEA Computer Science Meets, and "add up to 33" is said.
- For P6, no result in the catalogue mentions a "predicted total".
- The Agency route is marked as a shared passage.
- The unit scenarios were rewritten:
  - six grades are summed;
  - six 3s make 18, which clears the minimum;
  - a missing grade is a question, and asks for the grades rather than a
    total.

## 5. The outcomes say what the planner does

**What changed**
- **Legend.** "What the four outcomes mean" keeps EXPERIENCE_PRINCIPLES' four
  outcomes. "Quota 2 only" is described as a form of Meets, and each
  definition now matches `planSteps`. The old "one rule is not met … more than
  one rule is unmet" is gone. See `19-planner-legend.jpg`.
- **Chip.** The chip label now comes from the institutions' `admissionRoutes`,
  so it reads "Quota 2 only", as the count line does. See `p1-count.jpg`.
- **RUC.** Below RUC's minimum is now Does not currently meet. The rule has a
  new `consequence` field quoting RUC: "you will receive a rejection letter,
  regardless of whether there are fewer applicants than the number of study
  places". This quotation comes from the record's own `officialWording`. See
  `17b-planner-p8-ruc.jpg`.
- **No actionless "possible".** A gap is actionable only if it names its step:
  - a minimum average, a total, or an IB-terms grade or subject that is short
    names no step;
  - an IB-terms rule is actionable only with the record's `alternativeRoute`;
  - a Course Results route is actionable only where
    `alternativeRouteSummary.reachesAtEighteen` is true. The Dutch colloquium
    doctum waits until 21, and the records already said so.
  - Maastricht Data Science's maths rule gained an `alternativeRoute` from its
    own note (the deficiency route, deadline 1 June 2027). See
    `10f-planner-p1-maastricht-dsai.jpg`.
  - TU Delft Computer Science for P1 is Does not currently meet. See
    `10e-planner-p1-tudelft-cse.jpg`.
- **Faded cards.** A "not met" card now dims only its badge and picture, not
  its words.

**Guards**
- P8 at RUC Social Sciences is Does not currently meet, and the rejection-letter
  sentence is quoted.
- P1 at TU Delft CSE is Does not currently meet.
- P1 at Maastricht DSAI is Possible, naming the deficiency route.
- All nine round-4 profiles are run against every Opportunity, Dutch ones
  included. Each gap of each "possible" must carry an action with text, and
  its message must say "To close it:", "The other published way" or "It does
  not close this one to you".
- In ib-terms, the planner page must:
  - define every OUTCOME_LABEL in the legend;
  - name the other-route chip as the count names it;
  - no longer contain the stale definition.
- Unit scenarios updated with reasons: a 30-vs-32 total and a grade one short
  are Does not currently meet unless a route is published, and a route that
  opens only at 21 is not Possible.

## 6. Holding Danish A is not reported as lacking it

**What changed**
- ITU GBI carried the Danish A rule twice. The second copy, `req-extra-2`,
  was a `language-general` rule labelled "Danish A must be passed even though
  teaching is in English", and the engine could not check it. It was removed,
  and its sentence was folded into `req-all-3`'s note.
- A met rule now carries the scheme's `caution` for the level held. P9 reads
  "…your Danish A: Literature SL counts as Danish at A level. At SL the
  handbook formally counts this as Danish B; universities normally accept it…
  Confirm with the university…". See `18-planner-p9-itu-gbi.jpg`.
- A `language-general` rule that names a subject now checks its level too.

**Guards**
- P9 at ITU GBI:
  - Meets;
  - shows no "documentation the profile does not hold" line;
  - carries the SL caution.
- No `language-general` rule in the catalogue names a local subject at a level
  without `subject` and `levelScale`, since that is the shape of this bug.

## 7. Small items

| Item | Done | Guard |
|---|---|---|
| SEA: IB exempts the English *test*, not English B | `satisfiedBy: ["ib-diploma"]` removed from SEA CS and Multimedia Design. The card and page now read "Any IB English". The note quotes both SEA sentences (`23-sea-cs-english-phone.jpg`). The critic's "(no English test needed)" wording was not added, because the test exemption for Course Results holders is not established. | eligibility: SEA English is not Diploma-exempt |
| Finder "No Mathematics A" | Already "No Maths HL needed" on this branch (`src/pages/discover.mjs`). | ib-terms: the finder never says "No Mathematics A" |
| Glance "Last cut-off Restricted" | Already "Admission: Limited places" on this branch (commit 40fdfb8, `24-dania-glance-phone.jpg`). | ib-terms: every glance "Last cut-off" is a figure or "Any IB Diploma", with a planted "Restricted" caught |
| AAU Chemical Eng "last cut-off: 21" | New engine `cutoffComparison()`, used by the planner. It gives "You: 27 · any IB Diploma clears it" (`13f-planner-p4-aau-chem.jpg`). The "All admitted" outcome now reads "every qualified applicant got a place ("All admitted")". | eligibility: AAU Chem 3.3 at 27 points, and a 10.7 comparison |
| "Also accepted … with no IB route" | Now "Not open with IB: 3 Danish-only options" (`22-sdu-mech-beng-not-open-with-ib-phone.jpg`). | ib-terms: no page says "Also accepted … no IB route" |
| Test route printed 2–3 times (CBS, ITU pages) | The published line under a folded English card no longer repeats the tests, which are written out once above it (`20-…`, `21-itu-gbi-what-you-need-phone.jpg`). | ib-terms: no test is written twice in one card; CBS writes the IELTS scores once |
| Non-EU actions | SDU non-EU: "From outside the EU/EEA you must have finished them before 5 July" (critic's quotation of SDU). ITU non-EU: "Conditional admission is for fee-exempt applicants only, so without fee exemption the course has to be passed before you are admitted." See `16-…`, `16b-…`. | eligibility: P7 at SDU says 5 July and not 31 August; EU still gets 31 August; P7 at ITU is told conditional admission is not open |
| AU card slash | `unionPhrase` joins a combined route with ", or" (`26-au-card-grid.jpg`). | covered by ib-terms' phrase checks |
| "whether **your** Global Politics counts" | The scheme's Social Studies action now reads "whether Global Politics or another social science subject counts". | none (wording) |
| CBS "not re-read" | Removed from `dk-cbs.json`'s Social Studies note. The critic's word-for-word confirmation of 25 September 2026 is now quoted there. | none (data note) |

**Needs a source**
- ITU for non-fee-exempt applicants: the date by which a supplementary course
  must be passed. The repo says only that conditional admission is for
  fee-exempt applicants. No date is claimed.
- SEA: whether its IB exemption from the English test covers Course Results.
  The page says "an International Baccalaureate exam".

## Not done

- **CBS "To do" line.** The date is not in the summary. It appears in the ✗
  line just above. The Cambridge note carries the date, but the one-line
  summary uses the label only.
- **RUC quota 2 route for P4 (English + Maths averaging 4.0).** This is still
  not named on the P4 card. The critic marked it ◐, and it was outside this
  issue's seven fixes.
- **Card separators.** The critic's "Any IB Maths — one of" was not found on
  the current cards: the cards were redesigned on this branch and now use "·"
  throughout.
- **CBS 15-points-below warning at 27 points.** Not done. The critic accepted
  the current comparison.

## Files

Engine and pages:
- `src/lib/eligibility.mjs`;
- `src/lib/canonical.mjs`;
- `src/lib/components.mjs`;
- `src/assets/js/planner.js`;
- `src/pages/planner.mjs`;
- `src/assets/css/site.css`.

Schemas: `institution`, `opportunity` and `recognition-scheme`.

Data:
- `data/institutions/`: `dk-itu`, `dk-au`, `dk-sdu` and `dk-cbs`;
- `data/recognition/dk.json`;
- `data/opportunities/`:
  - `dk-cbs-*` (all six);
  - `dk-itu-global-business-informatics`;
  - `dk-ruc-international-bachelor-in-social-sciences`;
  - `dk-sea-computer-science-ap` and `dk-sea-multimedia-design-ap`;
  - `nl-maastricht-data-science-and-artificial-intelligence`.

Guards:
- `scripts/test-eligibility.mjs`;
- `scripts/test-requirement-translation.mjs`;
- the README scenario count (143 → 202) and its outcomes paragraph.

Shooter: `docs/research/qa/conversion/shoot.mjs` now reads `PROFILE_ROOT`,
`DEVTOOLS_PORT` and `BASE_URL` from the environment, with the old values as
defaults. Its fixed shot list does not drive planner profiles. The round-5
profile shots were taken with a scratch driver outside the repository, using
the same DevTools approach. It was run against `PORT=4412 node
scripts/serve.mjs` with the round-4 `planner-profiles.json`.

## Post-round-5 bug fixes (critique-round-5.md, scored 6/10)

The round-5 critic found:
- one wrong rule: the SDU non-EU "To do" line allowed a course after 5 July;
- two verdicts greener than the sources support: SEA for Course Results, and
  Danish A SL at ITU;
- one planning fault: two-course plans were counted as "possible for 2027"
  when one course had to come before the IB results.

Changes 1 and 2 are done in full. Most of change 3 is done.

Gate: `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs` passes
35/35 with exit 0.
- eligibility: 232 scenarios; the README count is updated;
- ib-terms: 813 checks;
- text-walls: `/planner/` now passes every budget, so it was taken off
  `scripts/lib/text-walls-known.json`.

Phone shots of P1, P5, P7 and P9 are in `after-fixes/`:
- `*-phone-default.jpg` shows the planner as a student first sees it;
- the card shots have "Why this result" open;
- `p1-meaning-open-phone.jpg` and `p1-how-open-phone.jpg` show the two
  disclosures opened;
- `planner-verdicts.txt` covers all nine profiles.

### 1. The plan depends on the applicant group and on timing

The engine now counts how many courses each student may finish after the IB
results, per publisher and per applicant group:
- `levelRaise.afterResults` on the Recognition Scheme and the Institution;
- `groups[].afterResults` and `groups[].multiple` per applicant group;
- `levelRaiseFor` picks the count and the "more than one course" sentence for
  the student's group, exactly as it picks the timing.

| Publisher | afterResults | Quotation in the repo |
|---|---|---|
| National (ug.dk) | 1 | "Du kan som udgangspunkt kun tage ét fag på ét niveau via sommersupplering" (scheme `levelRaise.source`) |
| AU | 2 | "It is only possible to take 2 supplementary courses if they are completed after 5 July" (NOTES round 3) |
| SDU, EU/EEA | 1, the national fallback | Cautious value. SDU's only quotation says "course(s) by 31 August" and gives no number |
| SDU, outside the EU/EEA | 0 | "If you are from a country outside of the EU/EEA, you must have finished your supplementary courses before 5 July" (critique round 4) |
| CBS | 0 | "CBS accepterer ikke sommersupplering" (ug.dk, NOTES round 3) |
| ITU, without fee exemption | 0 | Conditional admission is "only an opportunity for applicants exempted from paying tuition fee" (critique round 4) |
| ITU, fee-exempt | 1, the national fallback | Cautious value. ITU gives no number |

**How `planSteps` decides.** Supplementary courses are "Possible with action"
only when their number is at or below the student's count and at most
`MAX_RAISES` (2).
- If more courses are needed than the count allows, the result is "Does not
  currently meet". The card says "For 2027: n supplementary courses: … k of
  them has/have to be passed before your IB results arrive — in practice
  during DP2, or by applying for 2028", followed by the publisher's sentence
  for that group.
- Only where a publisher would allow more than two does the cap decide. The
  card then says "Our limit: … It is our limit, not the university's." A
  synthetic scenario covers this.

**The Course Results route.** A route that needs further study after the
results is now a later intake. It becomes a step only where
`alternativeRouteSummary.withinIntake` is true, and no record says that. P6
at Danish universities now reads "For 2027: Nothing recorded here says this
route can be completed in time for the 2027 intake…".

**A subject from nothing.** A subject the student holds at no level, required
above the scale's lowest level (Physics B, Danish A, a second foreign language
B), is counted as at least one course. The line says "whether that can be done
as one supplementary course is not recorded here — ask the institution".
- If the plan would fit only on that count, the result is "Needs review" with
  "To check: …". It is never "possible".
- If the plan cannot fit even at one course each, the result is "Does not
  currently meet".
- ITU GBI's Danish A gap quotes ITU: "only the programme in Data Science is
  open to international students". This uses the new `consequence` field on
  `req-all-3`.

**Legend.** The legend now reads "…supplementary courses no more than the
university lets you finish after your results, and at most two (our limit).
Does not currently meet: a gap with no recorded step, or steps that do not fit
this intake."

**Guards** (`scripts/test-eligibility.mjs`):
- P7 at SDU Electronics (both), EIB, ITE, Mechatronics (both) and CS: no line,
  including the summary, says anything about "after 5 July".
- Across nine profiles and every Opportunity, no summary says "after 5 July"
  where a gap line says a course must be finished before it.
- P1 at AAU AIE is "Does not currently meet", with "1 of them has to be passed
  before your IB results".
- P1 at ITU GBI is "Needs review" and quotes ITU.
- P7 at ITU GBI is "Does not currently meet".
- Synthetic scenarios: AU with two courses is Possible; the national rule with
  two is not, and with one is. SDU non-EU with one course is not Possible, and
  neither is CBS. A scheme with no count allows none, and the "our limit" case
  is covered.
- A Course Results route not recorded as completable for this intake is
  "Does not currently meet", with a "For 2027" line.

### 2. No green verdict where the record has an open question

- **SEA CS and SEA MMD.** A `language-general` rule "English documented with a
  test" was added. `satisfiedBy: ib-diploma` covers Diploma holders.
  - The rule has a new `openQuestion` field: "SEA exempts 'an International
    Baccalaureate exam'; whether that includes DP Course Results is not
    published. Ask SEA before you rely on it."
  - P6 is now "Needs review" at both, with that "?". A Diploma holder still
    meets it.
- **Danish A at SL.** A mapping the scheme qualifies (`caution`, "formally
  counts this as Danish B … Confirm with the university") is now a "?" and not
  a tick. The only exception is an institution whose own `ibEquivalences`
  confirm it, and none do. P9 at ITU GBI is "Needs review". Danish A HL meets.
- **Guards:**
  - no Meets result, across nine profiles and every Opportunity, contains
    "Confirm with" or "formally";
  - P6 at SEA is "Needs review" with the open question;
  - P9 at ITU GBI is "Needs review";
  - Danish A HL meets.

### 3. Phone reading order (mostly done)

Done:
- "What these results mean, and what they cannot tell you" is one collapsed
  line under the count and chips. It holds the legend and the caveat.
- "How to close a gap" is collapsed by default, and its heading now reads
  "How to close a gap".
- Each number in the count line stays with its label (`white-space:nowrap`).
- The evidence line reads "Source read 23 Sep 2026 · not yet reviewed by a
  person."
- "Not met" cards dim only the picture, not the badge.
- Each reason shows its first sentence, with the rest one tap down (▸). The
  list bullet is gone; one glyph per line remains.
- A combination gap leads with the gap, then "(None of the n accepted
  combinations is complete; this is the closest.)", so "The closest needs:
  Needs …" no longer stutters.
- Cards below a quota 1 floor that are not "Quota 2 only" say "Below the
  quota 1 floor, your way in is quota 2: …" with the 15 March date. This
  covers P8 at SDU CS and AU CS.

Not done:
- Lead lines are the first sentence, not a rewritten "Missing: X — see above"
  line of 15 words or fewer. Some leads are still long, for example the Maths
  line with its grade conversion.
- The national sentence "Take the level as…" is still used where there is no
  level to take. From-nothing gaps no longer show it, but it can still
  appear inside the "How to close a gap" box.

### Sourcing gap (recorded, not fixed)

The AU, SDU, CBS and ITU supplementary-course rules that decide these verdicts
are quoted in markdown: NOTES rounds 2–3 and critiques 4–5. The Evidence
records they cite are mostly landing pages whose excerpts do not contain the
sentence:
- `ev-bachelor-au-dk-sq8b48` is bachelor.au.dk/en;
- `ev-sdu-dk-1cc7woa` is SDU's bachelor list;
- `ev-cbs-dk-jtk0jr` is CBS's application page, whose excerpt lacks the
  Cambridge and summer-supplementation sentences;
- `ev-en-itu-dk-zf4fun` is ITU's general admission page.

ITU's supplementary-courses page has no Evidence record at all. A student who
taps "Check the official page" will not find these sentences. Each needs an
Evidence record for the page that holds the sentence, with the sentence as its
excerpt. That needs web access, so nothing was faked here.

### Still needs a source

- SDU's own number of courses after 5 July for EU/EEA applicants. The cautious
  national 1 is used.
- ITU's number for fee-exempt applicants. The cautious national 1 is used.
- Whether the national one-subject summer supplementation, and AU's two, apply
  to applicants from outside the EU/EEA. They are applied as published, with
  no group split. P7 is still "Possible" at AU CS, AU DS, AU ITPD and VIA GBE.
- Maastricht's deficiency deadline for non-EU applicants. Only the EU/EEA date,
  1 June 2027, is recorded.
- Whether a subject taken from nothing (Physics B, Danish A) is one
  supplementary course. The cautious reading is used: counted as at least
  one, and never "possible".

### Editor fixes (university pages)

- ITU: the research-log note about the Danish A sentence's sourcing was
  removed from `meta.notes`. The sourcing gap is recorded above instead.
- ITU `about`: the "roughly 2,900 students" clause was removed, since the Editor
  found it twice on the page. The built ITU page no longer shows "2,900" at all.
- SDU: the "student total … pages checked … left blank" note was removed, and
  the quoted "Denmark's newest IT campus" was removed. This was done in both
  `data/institutions/` and `data/dk/`.
- Reworded to drop research-log words:
  - CBS's Social Studies note;
  - the SEA English notes;
  - ITU GBI's Danish note.
- Guard (ib-terms): no university or programme page shows "critic",
  "critique", "round-N", "docs/research", "Evidence record", "levelRaise" or
  "ibEquivalences". A planted sample is caught.
- Not mine and left alone: UCPH still says "not published on the
  English-language pages checked" in `data/institutions/dk-ucph.json` and
  `data/dk/ucph.json`.
