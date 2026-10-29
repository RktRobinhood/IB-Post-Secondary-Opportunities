# External university data dependencies

The site can consume an established database without calling it from a student's
browser. Fetch a dated snapshot, select the records relevant to institutions we
already track, and build from that snapshot. An upstream outage leaves the last
good site working. A feed supplies only the fields its owner actually publishes.

The provider comparison and access terms are in
[UNIVERSITY_AGGREGATORS.md](research/UNIVERSITY_AGGREGATORS.md).

## Studyinfo: working Finnish integration

```bash
npm run import:studyinfo
npm test
```

The default is autumn 2027. For another intake:

```bash
npm run import:studyinfo -- --year 2028 --season autumn
```

`scripts/fetch-studyinfo.mjs` reads the official Konfo **External** API,
matches existing Finnish institutions by exact normalized English name, and
writes `data/external/studyinfo.json`. It cannot add universities to the site.
An explicit alias handles LUT University's longer official name, confirmed by
[LUT itself](https://www.lut.fi/en/about-us/introducing-university).
Provider institution and offering identifiers are retained for future joins.
Names are never matched by token overlap or a best-scoring search result.

The source is operated by the Finnish National Agency for Education. Its
[external API guidance](https://wiki.eduuni.fi/spaces/ophPPK/pages/190612447)
explicitly describes retrieving published course offerings to display on other
websites. Its required `Caller-Id` defaults to `ib-pathways.studyinfo-import`;
override it with `STUDYINFO_CALLER_ID` if deploying for another organization.
[Caller-Id instructions](https://wiki.eduuni.fi/x/0MeKCg) allow an organization
name when it has no organization OID. No blanket data licence was identified;
this integration publishes structured names, identifiers and source links,
rather than copying descriptions, images or admissions policies.

For a listing to appear, its detailed record must be:

- Published, with the matched institution's identifier.
- A degree containing an EQF level 6 award, including combined bachelor/master degrees.
- Taught solely in English according to the structured teaching-language field.
- Associated with a published application option for the target year and season
  that lists IB qualification code `pohjakoulutusvaatimuskouta_112`, general
  university eligibility (`123`), or general UAS eligibility (`100`). The latter
  two establish first-year catalogue availability, not an IB recognition claim.

An English interface is not evidence of English teaching. A master's-only
course, bilingual course, prior-intake IB route, transfer-only route or unknown
intake cannot enter through this filter. The provider's inferred start date is
used only to select a season, not presented as an exact first day of teaching.

These conservative rules leave real gaps. A route accepting foreign secondary
qualifications can admit IB students without listing one of these codes.
Unpublished 2027 applications also stay out. Empty results mean **no matching
listings in this filtered feed**, not that an institution teaches nothing in
English or rejects the IB. Existing researched programmes remain intact.

The first harvest on 2026-10-29 read 188 education records nationally and 184
offerings at our tracked institutions. The resulting snapshot contains:

| Institution | Matching course listings |
| --- | ---: |
| University of Helsinki | 2 |
| Aalto University | 10 |
| LUT University | 15 |
| Haaga-Helia University of Applied Sciences | 5 |
| Arcada University of Applied Sciences | 3 |
| **Total** | **35** |

All 14 Finnish institutions have a coverage record, including exclusions and
unmatched institutions. Counts are offering records, not deduplicated subjects
or a claim of complete national coverage.

The follow-up reused the same raw harvest and broadened catalogue discovery to
general university/UAS first-year qualification codes, increasing this to **99
listings at 13 institutions** without new requests. The snapshot is schema v2;
each application records its qualification codes and a separate boolean saying
whether IB is explicitly named. The original 35-listing count above is the
initial, IB-code-only pilot, not the current total.

## What students see

The shared university template adds an expandable **Studyinfo course listings**
panel below the existing degree cards. It shows the target intake, retrieval
date, course names, cities where supplied in English, and links to official
Studyinfo listings. It credits EDUFI and leaves each listing's entry conditions
at source. The shared country template also shows national catalogue links and
groups imported listings by institution. Existing programme pages can show
awards, complete-study-path ECTS and planned duration when their official
offering or application identifier matches exactly. Combined bachelor/master
totals are labelled as the complete path rather than bachelor-only totals.
No live requests are made by the browser or by the normal build.

The snapshot never changes the curated programme list, eligibility calculations,
fees, deadlines or evidence verification states. Importing those fields later
requires matching each application option to the correct intake and applicant
route, plus the project's normal evidence review. An institutional recognition
statement alone is insufficient for programme eligibility.

## Refresh, reproduce and review

The complete raw harvest is kept in ignored `.cache/studyinfo-harvest.json`.
To reproduce the snapshot offline using the original retrieval date:

```bash
npm run import:studyinfo -- --cached
```

The fetcher checks pagination, rejects missing or malformed detail responses,
and replaces the public snapshot only after every requested read succeeds.
API errors fail the refresh instead of publishing a partial catalogue.
Commit the small selected snapshot with the code; the large raw response cache
is optional and never deployed. Review the diff before publishing a refresh.
The `uni-project` heartbeat now dispatches one fresh university worker at minute
zero every hour, following `docs/HOURLY_UNIVERSITY_WORKFLOW.md`. It reuses fresh snapshots, works through unfinished units and
only refreshes a source when due; a wakeup is not a request to refetch every
university. `docs/CENTRAL_SOURCE_PROGRESS.json` holds its durable checkpoint.
`npm run coverage:sources` recomputes source coverage offline.

`npm run test:studyinfo` covers teaching-language confusion, wrong institutions,
master's-only courses, intake mismatch, transfer routes, rendering safety and
the snapshot's references. It is also part of `npm test`.

## Extending coverage

Study in Denmark now has an offline discovery comparison:
`npm run compare:denmark`. Its dated index-only collection uses three requests
for the current 464-record catalogue, avoiding individual detail requests.
See [the discrepancy report](research/DENMARK_CATALOGUE_COMPARISON.md). It
compares Bachelor/AP records with current English opportunities, excludes
top-ups, preserves unmatched and ambiguous names, and never changes admissions
facts. `npm run test:denmark-catalogue` exercises incomplete pagination,
institution/credential boundaries, intake/language filtering and held conflicts.

The next useful integration is the Dutch Studiekeuzedatabase: its operator
explicitly supports apps and supplies REST JSON V1 and whole-database exports
after a free signed agreement. UCAS also has a licensed course-data API.
These need access arranged before implementation. Studyportals is worth a
coverage/licensing discussion for a global catalogue, but no unrestricted
public feed was established. ROR can provide open institution identifiers and
crosswalks; it cannot supply programme or IB entry requirements.

The project already has the IB recognition snapshot/importer and a Study in
Denmark catalogue fetcher. The latter is useful for discovery, but its provider
currently warns that the overview is being revised. These sources and their
limitations are documented in the research note, rather than treated as a new
reason to crawl every university again.
