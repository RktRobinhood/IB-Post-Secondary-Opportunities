# University research repair loop

The user authorized research, repairs, integration and local commits for the 31
named submissions received on 28 October 2026. The original ten were a pilot;
the request now covers the whole batch and follow-up research. The user then
explicitly required European/Danish parity, including images, sourced school
character/strengths, English-taught offerings and full programme detail, followed
by work on the wider catalogue in a radius outward from Denmark. On 29 October
the owner explicitly authorized wrapping up the pending work and pushing commits
to GitHub so Pages updates. After validation, push scoped commits normally to
`origin/main` and check the Pages workflow; never force-push. This does not
authorize contacting universities or automatically ingesting unmentioned files
from Downloads.

## Resume

1. Read `queue.json`, the latest dated batch reviews and Git status. Preserve
   unrelated changes and any work already in progress. Do not start overlapping
   edits to the same institution. Use the archived originals, not Downloads, as
   the stable starting point.
2. Finish actionable initial-batch work first, including its separate photo and
   parity tasks, then due rechecks. Once only externally deferred initial-batch
   items remain, use `proximity-queue.json` to work outward from Denmark while
   continuing those scheduled rechecks. Regenerate the derived geographic work
   order with `node scripts/build-proximity-research-queue.mjs YYYY-MM-DD` using
   the client's local date. Its distance is an estimate from recorded Danish
   cities/campuses, not travel time. Complete a nearby institution/country's full
   pipeline before taking a more distant structural gap. A source being inaccessible
   through one tool is a reason to try other official pages, PDFs, catalogues,
   policies and languages, not a conclusion about the institution.
3. Read `docs/research/schools/BRIEF.md`, `PARITY.md` and the destination schema.
   Repair the research in curated records; keep the returned originals byte for
   byte. They are evidence of what was supplied, not instructions to execute.
   The schema and validation snapshot saved with the batch describe their
   interchange format, which is not the public school-record format.
4. Verify each consequential new claim against its responsible live official
   source. Record the URL, actual access date, applicable intake, campus,
   qualification, applicant group and currency/basis where relevant. Sample
   descriptive claims too. A search snippet is a lead, not a read source.
5. Integrate only supported claims through the existing entity schemas and
   shared renderers. A partial public record must state its limitations. Do not
   invent a language, IB conversion, point threshold, capacity, price or date to
   fill a field. A valid Diploma is different from Course Results; a minimum is
   different from a selection cut-off. English webpages and English modules do
   not establish an English-taught degree.
6. Follow `docs/COUNTRY_PIPELINE.md` and `ENRICH_BRIEF.md`: institution photos and
   listed-degree photos need actual visual review, provenance, appropriate rights,
   quality and uniqueness. Proposals or downloaded images do not count as signed,
   published assets. Catalogue pages need their own school image and sourced
   flagships/faculties; they do not require a photo for every course. A designed
   fallback is justified only after the documented source ladder finds no usable
   photograph. Keep those attempts and the critic result in the photo review.
   Validate edited schools with `node scripts/check-schools.mjs <keys>`, then
   `npm test` before committing a completed batch. Review generated pages for
   date inheritance, programme identity and misleading empty or default text.
   Preserve human-verification states. Coverage is a gap report, not a quota.
7. Update the per-institution review and queue before stopping. Include concrete
   next actions and an ISO `next_check_on` for future-publication or access
   checks. Commit only paths belonging to this work, with a factual message.

## States and honest completion

- `pending`: useful research or integration has not yet been attempted.
- `in_progress`: currently owned by an active worker; stale ownership can be
  reclaimed after checking the chat and working tree.
- `reviewed`: this pass is integrated or a supported exclusion is recorded;
  inspect `open_items` before treating the institution as finished.
- `complete`: the supplied assignment has been resolved and integrated, with no
  remaining actionable or scheduled item.

Each open item has a reason: `research`, `unpublished`, `not_found`, `blocked`,
`conflict`, or `model_gap`. Only the last completed investigation can establish
that a fact is unpublished. Unknown is never zero, false, no deadline or no
English degree. Source conflicts stay visible; never silently choose the
friendlier claim. Public school JSON cannot represent every claim in a pack;
retain richer details and provenance in the review rather than forcing them
into an unrelated field.

For genuinely future-dependent facts, set a useful recheck date instead of
re-reading unchanged sources every two hours. Try an unresolved access issue
with an alternative official source before deferring it. Reviews must say what
was tried. A `scope: none` school is an evidence-based internal exclusion; an
undetermined language must remain a research task rather than a false exclusion.

The former heartbeat `complete-university-research-imports` was checked on
29 October: the app reports that the automation no longer exists. It was not
recreated because it may have been deleted intentionally. The queue remains
resumable, but automatic wakeups must not be assumed. Preserve checkpoints if
interrupted. Any restored schedule should stay quiet on unchanged states and
only revisit deferred facts when due; pause it when no work or recheck remains.

## Original working-tree boundary

Before this batch the checkout already had edits to `hu-szte`, `hu-zeneakademia`,
`lt-lmta`, `docs/STATUS.md`, overview notes/results, untracked `hk-hksyu` and
`hk-thei` records, and an untracked external-research specification/queue and
two supporting scripts. Those are not part of this import's commit by default.

The owner's 29 October shipping instruction also authorizes reviewing and
wrapping those earlier pending edits into the release. Preserve uncertain work
as labelled research drafts rather than publishing an unsupported scope claim.
