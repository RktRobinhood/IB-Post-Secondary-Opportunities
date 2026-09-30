# Country pipeline

One repeatable path from "a country nobody has researched" to "its pages look
like Denmark's". Every country goes through the same stages, in order. The
templates are already shared (`docs/PAGE_TEMPLATES.md`), so a thin country is
a **data and asset gap**, never a design task. Our job is to be the informed,
curated middle step: the student reads what the programme is, what it asks and
how places are decided here, and only then is handed to the university's own
page.

The benchmark is a Danish page. When in doubt, open `/denmark/`, a Danish
university and a Danish programme page next to the country you are working on.

## The stages

| # | Stage | Output | Brief | Done when |
|---|---|---|---|---|
| 0 | Leads | `docs/research/schools/leads/<cc>.md` | `leads/README.md` | Every institution in `manifest.json` for the country has candidate official URLs |
| 1 | School records | `data/schools/<key>.json`, scope `listed` / `catalogue` / `none` | [`research/schools/BRIEF.md`](research/schools/BRIEF.md) | Every institution has a record; every `listed` list is exhaustive; every `none` has affirmative evidence |
| 2 | Programme detail | `about`, `selection`, `selectionNote`, `needs`, `points`, `cutoff`, `places`, `requirementsUrl` on each listed programme | [`research/schools/ENRICH_BRIEF.md`](research/schools/ENRICH_BRIEF.md) | Coverage shows 100% programme detail for the country |
| 3 | Degree photos | `docs/research/programme-images/schools-<cc>.jsonl` | ENRICH_BRIEF, "Degree photos" | A proposal for every programme a good photo exists for |
| 4 | Fetch, unsigned | stored crops in `src/assets/img/programmes/school-<cc>-*` | below | `node scripts/import-programme-images.mjs --only=<cc> --unsigned` reports 0 failed |
| 5 | Photo critic | `docs/research/qa/degree-photos/<cc>/critique-round-N.md` | [`QA_CRITIC_LOOP.md`](QA_CRITIC_LOOP.md) | 8/10 or more; rejects removed, not argued with |
| 6 | Sign and gate | signed records; all gate checks pass on a clean copy of `main` | below | `All N checks pass.` |
| 7 | Ship | one commit per country, pushed | [`PARALLEL_WORK.md`](PARALLEL_WORK.md) | Live on the site; STATUS and the issue say so |

**Degree photos come from Commons first, then the university itself.** Where
Commons has nothing honest for a subject (business, economics, computing and
data in every country so far: Portugal found 5 photos for 24 degrees), the
brief's ladder goes to the programme's own page, the press bank and official
Flickr, and uses social media only to find a picture the institution also
serves itself. Official photos are linked, not copied, and pass the same
critic (ENRICH_BRIEF, "When Commons is dry").

Stages 2 and 3 can run in one agent (one country, its own files). The owner
cares most about how the cards look, so an agent that has to choose does the
photo proposals first.

Catalogue countries (UK, Ireland, US, …) skip degree-by-degree photos: their
stage 2 is flagships and faculties (BRIEF.md, "Catalogue schools").

## Running it

**Agents.** One agent per country (or per ~100 programmes). Hand it
`ENRICH_BRIEF.md` plus one paragraph naming its files and the country's
admission quirks. It writes only its own files, one school at a time, runs no
git, and builds into its own folder (`DIST_DIR=D:/ibp-tmp/<cc>/dist`). An
agent that stops has lost nothing: re-run the brief on the unfinished schools.

**Pace.** On 30 September eight agents used about 3% of the 5-hour window a
minute, and three used about 1%. Run three or four at once; check
`get_usage` before starting more, and pause (TaskStop) a few points below the
owner's ceiling.

**One photo file per country.** The importer reads only
`schools-<two letters>.jsonl`. A country split across agents shares that one
file, each agent appending lines for its own schools only.

**Fetch one country at a time.** `--only=<cc>` reads just that country's
`schools-<cc>.jsonl`. Without it the importer reads every batch file and would
re-add, and on a signing run approve, lines another country's critic rejected.

**Contact sheet for the critic.**

```sh
node scripts/programme-photo-sheet.mjs <cc> docs/research/qa/degree-photos/<cc>/contact-sheet-round-1.jpg
```

Give the critic the sheet, the `.jsonl` (why each was chosen), the last
country's critique for calibration, and the brief in ENRICH_BRIEF. Round 1
scores around 6 are normal.

**Removing rejects** is one command with the keys the critic names:

```sh
node scripts/remove-programme-images.mjs <key> [<key> …]
```

It deletes the research line, the manifest record and the stored files, and
refuses a signed record. The card falls back to its school's photograph,
which is the honest state until a better picture is found. Re-sheet and send
the survivors to the same critic for round 2.

Ask the critic in round 1 for "the score with your rejects removed". When the
batch only lost photos (nothing added or recropped), that score stands as
round 2: Germany and Sweden's separate round 2s only confirmed it. Any new or
replacement photo means a real round 2. Round 1 has scored 5–6 for
every country so far (Germany 10 of 35 rejected, Sweden 18 of 40); removing
the rejects has reached 8 each time.

**Signing** (only after 8+):

```sh
REVIEWER="Claude (photo-editor critic, 8/10 round N, docs/research/qa/degree-photos/<cc>/)" \
  node scripts/import-programme-images.mjs --only=<cc>
```

**Gate on a clean copy.** Keep one worktree for it (`D:/ibp-tmp/gate`, with
`node_modules` as a junction: `New-Item -ItemType Junction`). Creating a
worktree from the OneDrive checkout takes several minutes, so reuse it: reset
with `git checkout -- . && git clean -fdq -e node_modules && git checkout
--detach main`, copy in the country's files, then
`SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs`.

**Commit only what was gated.** When another country's unsigned photos sit
in the working `data/programme-images.json`, commit the gate copy's manifest
instead: `git update-index --cacheinfo 100644,$(git hash-object -w
D:/ibp-tmp/gate/data/programme-images.json),data/programme-images.json`.

**Commit without the repack.** Git's automatic repack runs after a commit
and stalls for many minutes on OneDrive. Commit and push with
`git -c gc.auto=0 -c maintenance.auto=false …`.

## What fails, and how to avoid it

These cost a round-trip on 30 September; the brief now tells agents to avoid
them.

| Gate check | Cause | Avoid by |
|---|---|---|
| `school-pages` | a source or link is a bare homepage | cite the page that states the fact |
| `school-pages` | an `ib` line names a date earlier than the Apply-by (a scholarship date, "1 Feb in 2026") | keep other dates out of `ib`; say "apply early" |
| `check-schools` | an `ib` line over 180 characters | one sentence; detail goes in `selectionNote` |
| `superlatives` | a summary ranks the place ("Sweden's largest", "the oldest Nordic") | say what makes it worth a look: a founding year, a count, a setting |
| `research-log` | page text says "verified", "critic", "we checked" | write what the student should do, not how we researched it |

| Photo critic rejects | Instead |
|---|---|
| readable text or formulae at 480 px | a photo with no legible words |
| a logo or brand badge (product shots) | hands using the tool |
| event or crowd photography, children in frame | the discipline being done |
| the generic person-at-a-monitor or code-screen shot | a subject a camera can see |
| the sixth lab bench in one country | vary the setting: field, studio, workshop, outdoors |
| two degrees at one school that look alike | a different subject for each |

## Admissions facts that recur

Record them the same way in every country:

- **Unpublished 2027 criteria:** record 2026's and say "2026 criteria; 2027
  not yet published" in `selectionNote`.
- **Grade conversions:** only from an official table or formula, cited in
  `sources`, applied exactly as its rule says (Germany's KMK keeps one decimal
  and does not round: 38 IB points = 1.6).
- **Local-language conditions** (German A2, Dutch NT2, Danish B) go in `ib`,
  never softened; `needs` holds IB subjects only.
- **EU fees:** "for foreigners" pages are often the non-EU price. Establish
  which route and fee an EU citizen has (Poland, #41), per university.
- **National admission statistics** give cut-offs where universities do
  not: Sweden's UHR results pages (lowest admitted merit value in the BI
  grades group, by application code and term), Norway's Samordna opptak
  poenggrenser. Record the group and year with the number; do not convert
  to IB points unless an official table does.
- **Conflicting official pages:** keep the stricter reading, name both in
  `meta.notes` or the programme's note, and list it in `progress.md` for the
  release check.

## After a country ships

- `npm run coverage -- --handoff <cc>` and paste the block into the issue.
- A line in `docs/STATUS.md`; weak-but-kept photos and data questions stay in
  the critique and `progress.md` for the next pass.
- Anything this country taught us that the next one needs goes into this file
  or ENRICH_BRIEF, not into a chat.
