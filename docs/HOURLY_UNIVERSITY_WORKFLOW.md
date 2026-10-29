# One university every hour

The owner authorized this workflow on 29 October 2026: at **:00 every hour**, a
fresh agent takes **one** university from research through data, imagery, review
and publication on `main`. This replaces the former five-hour continuation.
The native automation is `uni-project`; it returns to the coordinating chat.
The dispatcher spawns a fresh **subagent**, not another user-owned chat.

## Geographic order and what counts as missing

1. Complete and audit Denmark first. Existing data is not proof of full coverage.
2. Complete Norway, Sweden, Finland and Iceland, in increasing distance from Denmark.
3. Complete the rest of Europe, in increasing distance.
4. Work outward across the rest of the world.

The distance is the existing minimum great-circle distance to a recorded
metropolitan Danish city/campus. It is a work order, not travel distance.
Unknown coordinates sort last within a phase. The Nordic phase deliberately
comes before the rest of Europe, even where a German city is closer.

An existing incomplete entry is a completion job, not a new duplicate. A
canonical Danish entry is audited through its canonical records; never add a
second school JSON merely to satisfy this pipeline. A verified absence of
English-taught first-year study is an internal supported exclusion, not a
student-facing empty university card.

`proximity-queue.json` is the **seed inventory**, currently 603 institutions.
`discovery-candidates.json` adds internal national-catalogue identity leads.
Neither proves full Danish or global coverage. A catalogue lead can be a renamed,
merged, duplicate, historical or locally taught institution. Resolve identity
before adding public records. Preserve explicit links to the old identity.

Before declaring a country's phase covered, reconcile its responsible national
institution register and English-programme catalogue against our pool, including
universities, applied-sciences institutions and relevant arts institutions.
Use the IB discovery harvest and national catalogues as leads; use an official
recognition/accreditation source for a newly discovered institution. ROR alone
does not establish accreditation or an English-taught degree.

When the known eligible queue is exhausted, discover **one** genuinely missing
institution in the nearest uncovered jurisdiction, record its identity lead and
source in `discovery-candidates.json`, and reserve it. Do not pause this worldwide
goal merely because the current finite queue is exhausted. If all nearby gaps
are genuinely deferred, proceed to the next eligible unit while keeping their
recheck dates. Never describe deferred gaps as completed coverage.

## Dispatcher: one reservation, one worker, one outcome

Start in the repository's primary checkout. Read Git status and
`docs/CENTRAL_SOURCE_PROGRESS.json`, then inspect/reserve:

```sh
node scripts/hourly-universities.mjs --next
node scripts/hourly-universities.mjs --reserve
```

`--next` is read-only. `--reserve` atomically acquires
`.cache/hourly-university.lock` and records the unique run ID in
`docs/research/imports/hourly-state.json`. A running job blocks another job.
The on-the-hour trigger does not authorize overlapping a slow previous job.

If a reservation already exists, inspect the live agents, report and working
tree. Continue its existing worker or start a fresh recovery worker for that
**same** reserved university if the old agent is gone. Never steal a lock based
only on age, delete the state to make the command succeed, or start a second
university beside it. Invalid finish must leave the current owner intact.

Spawn with `collaboration.spawn_agent`, a unique task name, and
`fork_turns: "none"`. Pass the **worker brief below**, absolute repository path,
reserved institution row and run ID. The fresh worker should not inherit the
entire coordinator conversation or repeat the central-provider survey.

The dispatcher does not do the research instead of spawning the worker. It
coordinates ownership, independent review, checks, Git and publication. Exactly
one university work unit is taken per scheduled wakeup. An immediate manual
trial is allowed when setting up or repairing the workflow.

Every actual university job ends in a scoped commit and push, including a useful
research/recheck report when blocked. An idle tick blocked by an existing worker
does not invent another job or an empty commit. Once accepted and published,
lock the entry for that intake: reopen only for a due recheck, intake change or
a demonstrated error, rather than repeated cosmetic passes.

## Worker brief

> Complete only the reserved university in the supplied repository. Read
> `CONTEXT.md`, `docs/COUNTRY_PIPELINE.md`, the research briefs under
> `docs/research/schools/` (BRIEF, ENRICH_BRIEF, PARITY), the relevant entity
> schemas and `docs/TRUST_AND_GOVERNANCE.md`. This is one university, overriding
> the older per-country agent batching suggestion. Respect existing file
> ownership and preserve other working-tree changes.
>
> First resolve whether the institution is already present under another name,
> whether it is recognized, and whether it offers plausible English-taught
> first-year study for the site's configured intake. Do not create a duplicate.
> Use the existing aggregate source notes, caches, IDs and import tools first;
> make narrow live reads of responsible official sources to resolve material
> gaps. Do not repeat broad searches or treat a commercial description as an
> admission rule. Do not silently roll the whole product to another intake.
>
> Complete the institution identity, city/campuses, sourced character and
> strengths, scope, IB Diploma/Course Results distinction, entry/selection
> requirements, language proof, fees by applicant group, dated application
> routes, predicted/final-result documents and timing where published. For a
> bounded `listed` institution, cover every relevant first-year English offering
> with its degree, duration, field, description, selection, official link and
> campus. For a `catalogue` institution, use the standard catalogue handoff,
> faculties and sourced flagships rather than copying hundreds of courses.
>
> Inspect actual institution and published-degree images. Each needs correct
> subject, quality, rights/usage basis, source, author/licence where appropriate,
> and an honest visual-review outcome. A downloaded file or `approved` metadata
> alone is not a visual review. Reuse suitable existing assets; prefer the
> institution's permitted linked image or freely licensed hosted photographs.
> Use a designed fallback only after documenting the source ladder and having
> the fallback accepted. Do not force a weak or unlicensed picture to fill a box.
>
> Write standard data and evidence into the existing model. Keep source URLs,
> actual retrieval dates, intake, campus, qualification and applicant-group
> scope. Preserve old/historical facts as such. Unknown is not zero, rejection,
> no deadline or no English degree. Do not claim human verification. Record
> genuinely unpublished or conflicting details and a useful recheck date.
>
> The university and programme templates stay shared. If a fact genuinely
> cannot be represented, report the model gap with an example and proposed
> shared field before changing a schema/template. No university-specific layout
> branches. Missing research is not a template problem.
>
> Write the per-university report under
> `docs/research/imports/hourly/YYYY-MM-DD-<key>.md`, including exact changed
> paths, sources, image review, validation and open items. Run focused checks.
> Do not run Git or a default `dist` build; the dispatcher owns both. Report when
> the unit is ready for independent acceptance, or explain the specific reason
> and next-check date if it cannot be completed safely. Never contact anyone,
> sign agreements or ingest unrelated files from Downloads.

## Acceptance and publication

Use `docs/QA_CRITIC_LOOP.md`: a **separate** agent checks the actual data and
images, with admissions, imagery and shared-format scores of at least 8/10.
Where a template changes, include desktop and phone visual review and the
maintainer role. One wrong deadline fails acceptance. Fix findings, up to the
documented five-round limit; a persistent unresolved problem becomes a tracked
issue/deferred unit, not an invented fact.

The coordinating session runs focused checks, the country parity handoff and
the full release gate against a clean snapshot of the proposed `main` changes:

```sh
npm run coverage -- --handoff dk  # substitute the reserved country
# In the clean release checkout, with the GitHub Pages base:
npm install --ignore-scripts --no-package-lock
# SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs
```

Use the shell's environment syntax to set `SITE_BASE`. Never rebuild `dist`
while another gate is reading it. Agents must not race the Git index. Stage only
reviewed, owned paths, commit to `main`, and push normally to `origin/main`.
Never force-push. Verify the resulting GitHub Pages workflow. Confirm the
acceptance report and intended university changes are actually in the commit
and the commit is on `origin/main`; merely naming an old real SHA is not proof
of publication. Record CI's result/link in the narrative report/checkpoint.

For a completed unit, save a small JSON acceptance alongside the narrative:

```json
{
  "institution_key": "dk-aau",
  "accepted": true,
  "reviewer": "Independent review agent and report path",
  "evidence": ["https://official-university.example/admissions"],
  "scores": { "admissions": 8, "imagery": 8, "format": 8 },
  "validation": { "fullGate": true, "cleanRelease": true }
}
```

`accepted` means editorial acceptance; it does not change Evidence into
human-verified data. Scores and passing checks must describe work actually
performed. Then finish with the exact run ID and full published commit SHA:

```sh
node scripts/hourly-universities.mjs --finish RUN-ID --state complete --review docs/research/imports/hourly/ACCEPTANCE.json --commit FULL-SHA
```

If material facts/imagery remain unresolved, publish only safe, accepted
improvements and save a deferred outcome with a reason and future date:

```sh
node scripts/hourly-universities.mjs --finish RUN-ID --state deferred --review docs/research/imports/hourly/REVIEW.md --reason "2027 selection criteria not published" --next-check-on YYYY-MM-DD
```

Use `failed` for a failed attempt, with a report/reason and preferably a useful
future retry date. Do not repeatedly hammer an inaccessible source or let one
blocked university prevent all outward progress. A missing retrospective
cutoff for an unfinished intake is not itself a missing current admission rule.

Deferred/failed outcomes may record `--commit FULL-SHA` for the safe improvements
or research report actually published; that SHA does not turn the outcome into
`complete`.

Commit the resulting ledger/checkpoint as a small follow-up if the publication
SHA was not known before the university commit. Do not claim completion until
publication is verified. Leave a clean main checkout when the unit is done.
Notify only on actual publication, material failure or required user input;
ordinary locks, future rechecks and unchanged states stay quiet.

## Availability

These jobs use local files. The computer and desktop app must remain running.
The clock schedules a start, not a guarantee that every university can be
finished within sixty minutes. The reservation keeps long jobs from colliding.
