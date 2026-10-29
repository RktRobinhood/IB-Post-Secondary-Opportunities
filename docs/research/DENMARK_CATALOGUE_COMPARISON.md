# Danish national catalogue comparison

The official Study in Denmark listing was downloaded on 2026-10-29 in **three
index requests**, without fetching individual programme pages. The index has
464 records. The source still carries the revision caveat recorded in
[the provider comparison](UNIVERSITY_AGGREGATORS.md#denmark); this pass uses
it for discovery, not as evidence of autumn 2027 admission rules.

The machine-readable result is
[DENMARK_CATALOGUE_COMPARISON.json](DENMARK_CATALOGUE_COMPARISON.json).
It retains source URLs, provider identifiers, source modification dates and the
SHA-256 of the complete cached index.

| Comparison | Records |
| --- | ---: |
| Bachelor/AP listings at exactly matched canonical institutions | 47 |
| Exact programme name and compatible credential matches | 37 |
| Title or credential differences needing review | 8 |
| Ambiguous programme names held for review | 2 |
| Bachelor/AP listings outside exactly matched institutions | 20 |
| Curated autumn 2027 English programmes with no exact catalogue match | 20 |
| Top-up listings excluded | 11 |
| ECTS disagreements among exact matches | 0 |

The two ambiguous rows are Software Engineering (BSc) at SDU. The source has
separate campus records; the comparison deliberately cannot pick a programme
or equate an offering merely from the shared title. Source campus slugs remain
in the report for a later explicit join.

The unmatched groups are a **review queue**. They do not prove that a programme
is new, discontinued, unavailable in English, or unavailable for 2027. National
catalogues can use different names or retain old records. Existing university
and admissions-authority evidence remains in force. No student-facing programme,
fee, requirement, deadline, eligibility calculation or image was changed.

To reproduce the comparison without network access:

```bash
npm run compare:denmark
```

The authoritative pack is `.cache/sid-index-harvest.json`, which keeps its
retrieval date with its payload. If only the older undated `sid-index.json`
exists, explicitly use `npm run compare:denmark -- --cached`; the report then
records an unknown retrieval date rather than inventing one. Refresh only when
due with `node scripts/fetch-studyindenmark.mjs --index-only`.

Next: investigate unresolved candidates in the existing proximity work order,
using their responsible institution's current evidence only where the catalogue
actually exposes a useful discrepancy. Keep the dated catalogue snapshot for
comparison, and do not repeat all 464 rows through a language model.
