# One card, several paths: the design

Owner's rule, 25 September 2026: if a university offers one course with some
distinction, it gets one card. Clicking the card shows the paths. A different
card is only right when the text itself is different, for example different
admission requirements. Redundant things are cut.

This page says how that works in the data (done in Phase A) and how it should
render (Phase B, which waits until the card and page files are free).

## 1. Data: an explicit `family`, checked against the records

A programme joins a family with a block on its own record in
`data/programmes/`:

```json
"family": {
  "id": "dk-sdu-electronics-family",
  "name": "Electronics",
  "axis": "credential",
  "admission": "differs",
  "path": "Bachelor of Engineering (BEng)",
  "differs": "3½ years with a six-month internship, aimed at industry; a master's stays open. Quota 1 needs 5.0; DP Course Results count as they stand.",
  "order": 2,
  "primary": false,
  "evidence": ["ev-sdu-beng-vs-bsc", "ev-sdu-dk-piqvgq"]
}
```

| Field | Meaning | Checked by `src/lib/families.mjs` |
|---|---|---|
| `id` | Shared by every member; not a programme id | at least 2 members, one institution |
| `name` | The card title | the same on every member |
| `axis` | What the paths differ on: `credential`, `campus` or `specialisation` | a campus family really spans campuses; a credential family really awards different credentials |
| `admission` | `same` or `differs` | **computed** from the members' Opportunity requirements (`admissionSignature`: kinds, subjects, levels, grades, averages, alternatives as sets; wording, notes, evidence and order ignored) and must agree |
| `path` | This path's label, 40 characters or fewer | present |
| `differs` | One line, 160 characters or fewer: what is different about this path | one line; no two paths share it |
| `order`, `primary` | Path order; the card links to the primary member and uses its picture | distinct orders; exactly one primary |

`separateFrom: [{ programme, reason }]` is the other half. It records a
deliberate "these look alike but are two cards" decision.
`suspectedVariants()` fails `npm run validate` whenever two programmes at one
institution reduce to the same subject name (`nameStem`) and neither share a
family nor say `separateFrom`. A new near-duplicate therefore cannot arrive as a
second identical card.

### Why an explicit field and not a grouping rule

A rule such as "same institution plus same stem" found all six families. It
also found nothing else, and it could never tell a merge from a keep-separate.
That call needs a person: SDU's BSc and BEng are one card, and CBS's three
"Business Administration and ..." degrees are three. So the rule is the
*detector* and the field is the *decision*.

No code names a programme, an institution or a country. Every difference is in
the records, in line with the repository rule.

### Why on the Programme and not the Opportunity

The paths differ in credential (a Programme property) or in campus (an
Opportunity property). Today every Programme has exactly one Opportunity, and
the campus variants are already separate Programme records. A family of
Programmes covers both cases. If one Programme ever gets two campus
Opportunities, its Opportunities are its paths. The renderer should treat "a
Programme with more than one Opportunity" and "a family" the same way: one card
with paths.

## 2. URLs and navigation: every member keeps its page

**Proposal: keep `/programmes/<id>/` for every member. No redirects. The card
links to the primary member, and every member page carries the same "Paths"
block.**

- **Nothing breaks.** Saved plans (keyed by Opportunity id), compare links,
  evidence `supports`, sitemap entries and links from outside all keep working.
- **Back does what a student expects.** Card → primary page is one history
  entry. Choosing the other path is an ordinary link to the sibling page, and
  Back returns to the path they came from. Neither `location.replace` nor
  meta-refresh stubs appear anywhere, so none of them can trap the Back button.
- **Each path keeps its own detail.** The members have different summaries,
  evidence, requirements and cut-offs. One merged page would have to interleave
  all of that, which is the wall of text the site is trying to avoid.
- **Rejected alternative:** one page per family, with `#path` anchors and the
  old URLs as redirect stubs. A static host has no server redirects. Stubs
  either break Back (meta refresh) or need script. The long requirement blocks
  of two paths would share one page.

## 3. Rendering (Phase B)

**Card** (institution grids, the A to Z finder, country lists): one per
`cardKey(programme)`.

- Title: `family.name`.
- A chip: "2 paths", or "2 campuses" / "2 specialisations" by `axis`. The path
  labels go in the meta line: "BSc in Engineering · Bachelor of Engineering",
  "Aarhus · Herning".
- Facts that differ show as ranges or lists: "3–3½ years", "Sønderborg ·
  Vejle". Facts that agree show once.
- Eligibility badge: the best across paths. When `admission` is `differs`, the
  badge names the path, for example "Meets the BEng path".
- Picture: the family's one picture (section 4).
- Link: the primary member's page.

**Programme page**: a "Paths" block at the top of every member page:

| Path | Length | Campus | Starts | What differs |
|---|---|---|---|---|
| **BSc in Engineering** (you are here) | 3 years · 180 ECTS | Sønderborg | September | 3 years, research-based … Quota 1 needs a 7.0 average. |
| [Bachelor of Engineering (BEng)](../dk-sdu-electronics-beng/) | 3½ years · 210 ECTS | Sønderborg | September | 3½ years with a six-month internship … |

- The current path is not a link.
- When `admission` is `differs`, each row adds the student's own result for that
  path ("You meet this path"). The difference must be visible without opening
  both pages.

**Finder data** (`#programme-data`): one row per card, with `paths: [{ id,
opportunityId, href, path, differs, years, place, ... }]`. A filter matches a
card when any path matches it (campus, length, credential). The count reads
"67 programmes (73 study options)".

**Planner**: it stays per Opportunity, because a student applies to a specific
optagelse.dk entry. A result card shows the family name with the path label
("Electronics: BEng"). When both paths are eligible, it shows them as one
result with two rows, not as two identical cards.

**Compare**: it stays per Opportunity. Adding a family adds its primary member,
with a switch to the other path.

## 4. Pictures: one per card

`src/lib/programme-imagery.mjs` now resolves by card: every family member gets
the family's one picture. It assigns pictures so that **no Commons file appears
on two cards**:

1. programme-specific pictures, primary member first;
2. the field pool, where each picture is dealt to one card only, in card-key
   order;
3. the interdisciplinary pool;
4. only then a repeat, which `scripts/test-unique-images.mjs` fails and names.

`data/programme-images.json` records may carry `focus` (a CSS object-position,
for example `"50% 70%"`), which the card should apply once fix 1 of the card
critique lands (anchoring the photograph at 16:10).

## 5. Migration notes for Phase B

- `site.programmes` stays one entry per programme. Add `site.cards`: a list of
  `{ key, family, members, primary }` built with `families()` from
  `src/lib/families.mjs`, and render cards from that.
- `test-programme-images.mjs` counts "cards ≥ programmes" on institution pages.
  Change it to count ≥ cards.
- Search and the sitemap keep every member page.

## 6. Campuses, and school records (#52)

Issue #52 asked for one card for "the same programme on several campuses". Campus was already one of the family axes, so there is no second mechanism.

**Card.**
- Where the paths are taught in different places, the credential line gives a count: "BSc · 3 yrs · 2 campuses".
- The rows under it name each campus once, with what differs. This replaces the old "Aarhus or Herning".

**Page.**
- A campus family says it plainly: "The same programme is offered at the Aarhus campus and the Herning campus."
- The table compares degree, length, campus, teaching language, start, Apply-by date, the minimum, DP Course Results and the last cut-off.
- It shows only the columns that differ between the paths.

**School records.** School records (`data/schools/*.json`) list their programmes inline, without ids. A family there is named, not numbered: members share `family.name`, with the same `axis`, `path`, `differs` and `primary`. `separateFrom` takes `[{ name, reason }]`.
- The school page draws one card per family, with rows linking to each path's page.
- Each path's page carries the same kind of Paths table, built from the record's own fields: places, the minimum, subjects, selection, cut-off and fee.
- The "More at …" siblings are cards, and never the page's own family.

**Checks.**
- `checkSchoolFamilies` in `src/lib/families.mjs` holds school families, and runs in `check-schools`.
- `scripts/test-card-names.mjs` checks the built pages.

The sweep and every decision are in [../programme-families/campuses-52.md](../programme-families/campuses-52.md).
