# Is it systemic? Repetition a student sees

Audit of 25 September 2026. The owner asked "I'm wondering if it's systemic". The
answer is yes. Repetition comes from three mechanisms, and each is fixable at
its source:

1. **Two records for one thing**: variant programmes, and calendar twins.
2. **A shared fallback**: field pictures, and template sentences.
3. **The same explanation pasted into every record**: national-rule notes.

Each finding has a count, an owner and a fix. Status says what Phase A did.

| # | Finding | Count | Mechanism | Status |
|---|---|---|---|---|
| 1 | Programme variants as separate identical cards | 6 families, 12 cards → 6 | two records, one programme | **Data done** (`family`), render in Phase B |
| 2 | Programme-card photographs repeated | 73 cards on 39 photos; 28 cards repeat one | shared field fallback | **Fixed in data + resolver**; guard added |
| 3 | Institution share image repeated | 2 SDU hero URLs, each on a BSc and its BEng | two records, one programme | Resolved by 1 (same family, one card) |
| 4 | Place photos, gallery slides, country heroes | 511 hosted slots, 0 repeats by bytes | none | Guarded from now on |
| 5 | Calendar twins: the same deadline from the country file and the route | **~90 profile cards** with a same-day route twin across 25 destinations (CA 13, FR 7, GB 6, SG 6, SE 6, IE 5, CN 5, US 5, …); HK "17 dated events" for about 11 | two records, one fact | Proposal (template), below |
| 6 | Template sentences repeated on 11–73 pages | 5 sentences (the text-walls list) | shared template | Proposal (template), below |
| 7 | The national Course Results rule, pasted into each Danish requirement note | 54 opportunities, in **two different wordings** (34 + 20) | pasted explanation | Proposal (conversion agent's files) |
| 8 | Institution-level fee note pasted into each SDU opportunity | 15 records | pasted explanation | Not rendered today; noted only |
| 9 | AU Herning quota-1 floor: the record contradicts itself | 1 | two statements of one fact | Flagged to the conversion agent |

## 1. Variant programmes: done in data

See `groups.md` and `design.md`. The detector (`suspectedVariants` in
`src/lib/families.mjs`) now runs in `npm run validate`, so a seventh pair fails
the gate instead of shipping as a second card.

## 2. Programme-card photographs: fixed

- **Before:** 73 cards on 39 photographs. The four worst photographs covered 8,
  7, 7 and 6 cards. 34 cards showed a photograph another card also showed. The
  critic's round-1 finding: SDU's grid showed 7 distinct photographs across 15
  cards.
- **Why:** the resolver shared a field's one or two pictures across every card
  in that field (`i mod n`). The pool could never be big enough. The rule itself
  allowed repetition.
- **Fix:** the resolver is now one picture per card (`src/lib/programme-imagery.mjs`),
  family-aware, with deterministic unique assignment. New programme-specific
  photographs close the gap. `scripts/test-unique-images.mjs` fails on any repeat,
  by bytes, on cards, on built pages and in the finder and planner data.
- **After:** 67 cards, 67 photographs, 0 repeats. 32 new Commons photographs
  were added and 3 weak ones repinned (the NASA T-shirt, the wastewater sludge
  and the hackathon round table). Contact sheet: `contact-sheet.jpg`.

## 5. Calendar twins: proposal

`eventsForDestination()` in `src/lib/calendar.mjs` drops a profile deadline
only when its **label** matches a route event exactly (`normaliseLabel`). Twins
survive because the two records word the same deadline differently:

- "HKUST — priority round" vs "HKUST priority round closes";
- "Ontario — University of Toronto applications close" vs "University of
  Toronto - applications close";
- "NYU Shanghai — Early Decision I, and it is binding" vs "NYU Shanghai Early
  Decision I (binding)".

Script: `cal-dups.mjs` in the session scratchpad. Method: same destination,
same date, and at least two shared content words once generic words are
removed. That finds 91 profile cards with a route twin. A handful are false
pairs, for example the LNAT test date against the Oxbridge close.

**Proposed fix (template):**

- The route is the migrated record, so a profile deadline **on the same date as
  a route event of the same destination** that names the same institution or
  system becomes one card.
- Merge by carrying the profile's `sources` onto the route card. Round 4 noted
  that route cards lack a one-tap source, so the merge also closes that gap.
- A deadline that is not really a twin can say so in data with
  `"route": null`, or name the route event it is NOT.

This is a `src/lib/calendar.mjs` change, so it is not done here. Deleting ~90
profile entries by hand instead would lose their source links. A data-only fix
is available per destination, though: point each profile twin at its route
with `route: "<route id>"`, then retire it once the merge lands.

## 6. Template sentences: proposal

From `scripts/lib/text-walls-known.json`. Every one of them comes from code,
not from data:

| Sentence | Pages | Source | Proposed fix |
|---|---|---|---|
| "# dates on this page are carried over from the previous cycle because the authority has not yet published this one." | 73 | `data/freshness-policy.json` wording, rendered per page | A single "carried over" chip with a tooltip that links to /trust/ |
| "See them on the calendar, alongside anywhere else you are looking at." | 35 | `src/pages/destinations.mjs` | Cut it; the calendar link is enough |
| "Where to apply: directly to each university — there is no central portal." | 23 | `src/pages/destinations.mjs` | A "Direct to university" chip in the facts row |
| "Where no grade is shown, no minimum grade is recorded for that subject." | 22 | `src/lib/components.mjs` | A legend line once per page, or a tooltip on the grade column |
| "Admission is governed at the level below the country, and the route follows the jurisdiction." | 11 | `src/lib/jurisdictions.mjs` | A "Set by region" chip with a tooltip |

These are the IA agent's surfaces (destination pages and components), so they
are listed for that agent rather than edited here.

## 7. The national Course Results rule, pasted 54 times: proposal

- **What repeats:** the requirement note that begins "The rule is national
  rather than this university's…". It is on 34 Danish opportunities, and a
  second wording, "The rule is national, not this institution's…", is on 20
  more.
- **Why it matters:** a student reading two programmes meets the same
  paragraph twice, in two versions. The two versions are not identical, so they
  can drift into a contradiction.
- **Proposed fix:**
  - one Context Note or `/denmark/ib-conversion/` section that holds the rule
    once;
  - the requirement shows a one-line chip ("National rule: how Course Results
    count") that links to it;
  - the per-record note keeps only what is specific to that programme.
- **Owner:** the conversion agent (`data/opportunities`, `src/lib/eligibility.mjs`).
  Not edited here.

## 8. SDU fee note

The same paragraph ("Non-EU tuition at institution level: …") sits in
`meta.notes` of every SDU opportunity. It is not rendered today (checked on a
built programme page). If it ever is, it belongs on the institution record,
which already has it.

## 9. AU Herning quota-1 floor

- `data/opportunities/dk-au-economics-and-business-administration-herning-2027-autumn.json`
  has requirement `req-quota1-average` ("Quota 1: an average of at least 6.0").
- Its `admission.selection[0]` says "No 6.0 quota 1 GPA floor is stated for this
  programme".
- The Herning page, read 2026-09-25, states no floor. It shows "Quota 1 2026:
  6,9 (Standby: 6)".
- The requirement changes eligibility, so this is for the conversion agent to
  settle.
