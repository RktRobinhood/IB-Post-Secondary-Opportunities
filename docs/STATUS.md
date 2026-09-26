# Project status

**Last updated 26 September 2026.** Live site: https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities/

This page says where the work stands, so the next session (human or agent) starts from facts rather than from memory. Update it at the end of every work session.

## How work is accepted

- A separate critic agent scores each piece 0–10, and 8 or more is accepted (`docs/QA_CRITIC_LOOP.md`).
- Every commit is pushed at once, because the owner reviews the live site, not local files.
- Before a push, the changed files are copied onto a clean worktree of `main` and the full gate is run there: `node scripts/qa.mjs` with `SITE_BASE=/IB-Post-Secondary-Opportunities`, currently 33 checks.

## Owner's standing rules (from this session)

- **Readers:** IB students at a school in Denmark. About a fifth are Danish; most are EU/EEA citizens from elsewhere. Write for them (`docs/PRODUCT_VISION.md`, "Who it is for"). The `audience` guard enforces it.
- **No text walls:** one line per block, details on demand. The `text-walls` guard enforces it, with a shrink-only grandfather list.
- **New tabs:** only links that leave the site open a new tab. Every deliberate choice on a page must be undoable with Back (`pushState`).
- **No repetition:** no image used twice anywhere (the `unique-images` guard compares bytes). Near-identical programmes are one card with its paths inside.
- **Clarity at a glance:** every programme card shows its degree type, for example "BSc · 3 yrs · Odense".
- **Deadlines live with each school:** a side panel of deadlines and sessions on institution and programme pages. The Deadlines page is filter-first and never shows one combined list.
- **The home page is the discovery surface:** a globe hero, filters, and cards below that react to the globe. `/programmes/` folds into it.
- **Globe:** it floats on a transparent background, is "a bit cartoony, lean into fun", and moving between places shows a dotted route with a little plane, train or bus ("Where in the World is Carmen Sandiego"). The owner capped it at 5 critic rounds; round 5 ships whatever the score.
- **Desk globe (25 September, evening):** the base is a globe held in its arms — a brass meridian ring on a stand, axis tipped 23.4° — that turns left and right only; choosing a place turns it to face you and leans in. Routes, vehicles and clouds are "eye candy, nice to have". The globe is a visual element (it may sit in a horizontal band), not a full-page simulation. Two ChatGPT prototypes were shared as inspiration only.
- **Usage ceiling:** no new agents or tasks once the **5-hour** plan window reaches 80% (not the weekly total).
- **Ship to `main` (26 September, afternoon):** work of acceptable quality (critic 8+) or a clear improvement on what is live goes to `main` at once, so students, counsellors and the owner see it on the live site. Nothing good waits for a later release. A branch is only for work in flight, is meant to merge whole into `main`, and is closed afterwards. Close an issue when its acceptance criteria are live.

## Done and live

| Piece | Critic | Notes |
|---|---|---|
| Worldwide country audit (15 destinations) | **8/10, accepted** | `docs/research/qa/country-audit-world/round-4.md` |
| Photos (three review rounds, ~350 re-judged) | **8/10, accepted** | `docs/research/qa/photos/round-4/critique.md`. The official-site place checks are an open issue |
| Audience rewrite (EU/EEA readers, `ownCitizens` on every EU/EEA/EFTA destination, shared SU record) | 7/10 in round 2; round-2 fixes are live, no round-3 critic has run | `docs/research/audience/` |
| Danish levels in IB terms, cut-offs and floors in IB points, "Quota 2 only", named actions | 7/10 (round 4) | Remaining fixes: issue #42 |
| Globe as a **desk globe** (ring and stand, 23.4° axis, turn-then-lean-in, pastel political colours) over the WebGL globe, cloud dive and MapLibre street level | **8/10, accepted (round 5 of 5)** | `docs/research/qa/globe/round-5/critique.md`; the polish it listed is an open issue |
| Programme card photos: 67 cards, 67 photographs | 6/10 (round 1, before uniqueness) | The crop fix and credential line are in progress |
| Four-item menu (ADR 0006), `/countries/` with distance doors, redirects | not critiqued | `docs/research/ia/progress.md` |
| Text walls: Deadlines, the Denmark pages, Trust, Credits, Glossary, About, Counsellors, Compare | `text-walls` guard | Only `/programmes/` and `/planner/` are left on the grandfather list |
| Programme families in data (6 families, 73 → 67 cards) | validator | Rendering is in progress |

## In progress: #43, a page for every institution (branch `feat-43-school-pages`)

- **Done on the branch:** all 450 profile institutions have a page at `/universities/<key>/` (`src/pages/schools.mjs`). Country-page cards and map lights link to these pages, not to homepages. The data is `data/schools/<key>.json` (`schemas/school.schema.json`). The guards are `check-schools` and `school-pages`.
- **Research:** `docs/research/schools/BRIEF.md` and `manifest.json`. Researchers write one file per school as they go and skip files that already exist, so a stopped run resumes by being re-run. Their progress notes are in `docs/research/schools/progress.md`.
- **Order of work:** pilots for Finland and the UK, then an admissions-counsellor critic on the data and an art-director critic on the page (`docs/research/qa/schools/`), then the other 32 countries in batches.
- **On `main` and live (25 Sep):** school pages for all 450 institutions, plus 12 Finnish schools' programme lists (merge `be17b64`).
- **On the branch, not yet on `main`:**
  - Finland round-1 fixes: a round-2 critic is running, and round 1 scored 7/10.
  - UK records with round-1 fixes: a round-2 critic is running, and round 1 scored 7/10. The UK fee-status rule now lives once, on the country record.
  - Design rounds 1–3, scored 6, 7 and 7 (`docs/research/qa/schools/round-*-design.md`). Round 4 has not run yet.
  - Research in progress: Sweden, Norway, Germany and the Netherlands.
- **When the owner nears his usage limit (25 Sep):** let running agents finish, and start no new ones except one critic at a time for finished work. For each country:
  1. When its critic scores 8 or more, merge it to `main` through `D:/ibp-ci`.
  2. Hold back only records a critic has flagged.
  3. The remaining 28 countries are researched later, a few at a time, with the brief as it now stands.
- **To resume research:** re-run a country's researcher with the same prompt, which is in this session's history. Any school whose `data/schools/<key>.json` already exists is skipped.
- **Settled with the critic (round 3):** a school's hero photo is the same photo as its card on the country page. That is one image slot, the card being a thumbnail of the page it opens, as for the Danish institutions. It does not count as a repeat under the no-repeated-images rule.
- **Settled with the art director (programme pages, round 1):** a programme page under a school (`/universities/<key>/<slug>/`) shows its school's hero photo; the school's page, card and programme pages are one image slot. `unique-images` holds it: that photo heads no page outside its school.
- **Screenshots:** `node docs/research/qa/schools/shoot.mjs <out> <base> <paths…>`. It writes to `D:/ibp-tmp`, never C:.

## 26 September (late morning): the Danish standard for every country

The owner: "the value is in bringing the other regions as close to our Danish standard as possible." Usage ceiling 70% of the 5-hour window. The owner's globe notes are on #53 (transparent floating globe, pins centred on large countries, zoom to schools, remove the old map that flashes first, whole card links to the country); not started.

- **Live on `main` (critic 8+):** UK 22, Finland 14, Switzerland 15, Luxembourg 2, Iceland 2, Netherlands 17, Austria 15, Germany 14, Norway 14, Sweden 14 = **129 researched school records**.
- **On `feat-43-school-pages`, not yet accepted:** Belgium 14 (round 1 7/10, fixes in, needs round 2), Ireland 14 (researched, no critic yet; DkIT and SETU rest on archived copies).
- **Programme pages (branch only):** every programme of a `listed` school gets `/universities/<key>/<slug>/`, laid out like the Danish programme page (`src/pages/school-programme.mjs`). Art-director round 1: **6/10**; all round-1 fixes are in (branch gate 35/35, shots in `D:/ibp-tmp/w43/pp-r2/`). **Before round 2:** a school's January date that is only for Diploma holders (Sweden: labelled "only if you already hold your IB Diploma"; KTH's 15 Jan) must not become a final-year student's Apply-by: give school dates a way to say so (e.g. `forDiplomaHolders: true`) and skip them in the tile. Also data: `ie-ncad` Fashion Design `about` starts "CAO code AD211.", and its Product/Interaction Design maths add-on belongs on those programmes. Goes to `main` only after an 8+.
- **Enrichment:** `schemas/school.schema.json` programmes carry `about`, `needs` (IB subject ids, `id@HL` for per-option levels), `points`, `selection`, `cutoff`, `places`, `requirementsUrl`; brief section "Enrichment: the Danish standard". **Finland is enriched (101 programmes, branch only)** and needs an admissions critic before it ships with the programme pages.
- **Degree photos (#54), owner's request:** every degree card of the new countries gets its own photograph, as the Danish cards do (not a shared university photo). Pilot Finland, then NL/CH/AT/DE/NO/SE; photo-editor critic per batch. First job after the usage window resets.
- **Next:** programme pages round 2 → FI enrichment critic → ship both; Sweden/Belgium/Ireland critics; enrich the live countries (NL, DE, AT, CH, NO) one at a time; then wave 2 research (ES/IT/FR/PT…, queue in `docs/research/schools/QUEUE.md`).

## 26 September (morning): the owner's focus is university data

The owner: the globe and the look are in a good place; the priority is the missing background data (universities), then closing open issues. Usage ceiling for that session: **70%** of the 5-hour window.

- **School research (#43):** the queue, in priority order, is `docs/research/schools/QUEUE.md` on branch `feat-43-school-pages` (worktree `.claude/worktrees/w43`). Researchers write `data/schools/<key>.json` one school at a time and their reports to `docs/research/schools/reports/batch-*.md`; a stopped batch resumes by re-running it (existing files are skipped).
- **Live on `main`:** UK (22 records, critic round 2 **8/10, accepted**) and Finland (14 records, round 2 **8/10, accepted**). `gb.json` now states England's fee/loan exceptions (Irish citizens, UK nationals long resident in the EEA) and that Irish citizens need no visa.
- **On the branch, researched in full but not yet critiqued:** NL 17, DE 14, SE 14, NO 14, BE 14, AT 15, CH 15, LU 2, IS 2. **Ireland 11 of 14** (stopped at the ceiling; re-run its batch). 154 of 455 institutions have a record; 301 remain (queue: ES/IT/FR/PT, then PL/CZ/HU, the Baltics/SI/MT/GR, then the rest of the world).
- **Next session:** admissions-counsellor critics for the finished countries (one per country), fixes, move to `main`; then wave 2. Each country needs its admissions-counsellor critic (8+) before it moves to `main`; move it with `git checkout feat-43-school-pages -- data/schools/<cc>-*.json`, then gate.
- **#47:** Oxford and Cambridge no longer show UCAS 13 Jan / Extra / Clearing / 23 Sep. A shared date can now name the schools it is not for (`institutionsExcept`); a guard stops any date whose note says "Not available for X" reaching X.
- **#49:** `node scripts/audit-links.mjs <dist>` opens every outbound link (resumable; report in `docs/research/qa/links/`). First run: 2,619 links, 22 dead (8 fixed; the rest were time-outs or bot walls), 427 Wikimedia rate limits.
- **#50** closed: light-mode photos are visible on every card type.

## Where it stands (26 September, ~00:40): stopped at the usage ceiling

`main` = ed9868d, every push gated 35/35 on a clean worktree (`D:/ibp-tmp/ci2`; preview of it on :4380 via the `preview-ci2` launch config). Work continues on branch `globe-desk` (worktree `.claude/worktrees/globe-desk`), which is level with `main`.

| Piece | Critic rounds | State |
|---|---|---|
| Globe (desk globe) | 7 → **8, accepted** | leftovers: issue #53 |
| Deadlines #47 | 4 → 6 → 6 → 6 | wrong dates and wrong-school dates fixed (99 → 0, guarded); left: UCAS 13 Jan/Extra/Clearing on Oxbridge pages, desktop panel below the fold, 166 link-only pages, weak year citations — issue #47 comment |
| Home #44 | 6 → 7 → 7 | photos on the first screen, doors land on places; left: globe rim ghosts, phone controls on the sphere, thin results — issue #44 comment. The 320-vs-57 bubble count was fixed (c9377d1) after round 3, not re-critiqued |
| Programme cards #46 | 6 → 7 → 7 → 7 | four tag kinds, distinctive Needs line, 9 photos replaced; left: one point figure per card, plain requirement words, a few lookalike photos — issue #46 comment |

Next session: the #47 Oxbridge exception first (a wrong date for real applicants), then critic rounds 5 on #44/#46/#47.

## 26 September (early): critics on the three WIP pieces, fixes live

On `main` (d262c9f), gated on a clean worktree (`D:/ibp-tmp/ci2`, 35/35):
- **Deadlines #47** — round 1 scored **4/10** with three wrong dates live (TU Delft, Twente, SDU accept) plus a split Maastricht date and a missing SDU uniTEST date. All corrected at their sources with evidence (`docs/research/qa/deadlines/round-1/fixes.md`); one `datesPanel` on every `/universities/` page (304 full panels, was 19); next hard deadline first; `/timeline/` filter-first. Round-2 critic running.
- **Programme cards #46** (round 2: 7/10) and **home #44** (round 1: 6/10) — fixed together (`docs/research/qa/programme-cards/round-2/fixes.md`): cards ~300 px, one Needs line, one tag, the degree always named on family cards, a varied first dozen on `/`, the Worldwide door, a no-match way out, a phone count pill. A combined round-2/3 critic is running.
- Record gaps for data work: Absalon Biotechnology has no length; Maastricht University College no abbreviation; business card photos look alike (`field-business-*`, Creative Business, Global Business Informatics, CBS Digital Management).
- Screenshots over 400 kB from critic rounds stay local (not committed).

## Merged to `main` on 25 September (evening): branch `globe-desk`

`globe-desk` (worktree `.claude/worktrees/globe-desk`) is the stopped agents' WIP merged with `main` (#43 school pages included), then brought to a **green gate (32 of 32 checks)**:
the desk globe (`globe.js`: `desk()`, `drawDesk()`, `TILT`, lean-in/sit-back flights; guards in `test-map.mjs`), the home page within its word budget (12 cards then "Show all", opened by any filter; the place list folded; 6,096 → 1,209 words), the dates panel's notes behind "Note", and three guards taught about programme families and `/#discover`. The globe scored 7/10 in round 4 and **8/10 in round 5 (accepted)**; `globe-desk` fast-forwarded `main`. Items 1, 3 and 4 below are live but have not had their own critic rounds yet: that is the next work.

What the stopped agents left, for reference (items 1–4 below now build and pass on `globe-desk`, but none has had its own critic round):

1. **Home page as the discovery surface.** `src/pages/discover.mjs` and `src/assets/js/discover.js` are new; `src/assets/js/explorer.js` is deleted; `src/pages/course-results.mjs` holds the Course Results guide. The agent stopped while writing its styles. Plan: `docs/research/ia/plan.md`. The "My subjects" panel and the `/planner/` redirect come after this.
2. **Globe final round.** This is round 4 of the 5-round cap. Round-3 fixes 1–5 (no cream gaps, no freezes, sharp view at rest, no pop at street level, group fixes). Then the owner's art direction: a floating transparent background, a cartoony shader, and a route line with a vehicle. The agent stopped while writing the route and vehicle CSS. See `docs/research/qa/globe/round-3/critique.md` and `NOTES.md`. After round 5 it ships, and leftovers become an issue.
3. **Programme families, phase B.** The credential line on every card, merged "N paths" cards, a Paths table on member pages, the card photo anchored at 16:10, dark-mode contrast for `.tag--sand`, and 720 px phone images. The agent stopped while adding the chip-contrast guard. See `docs/research/variants/design.md` and `docs/research/qa/programme-cards/round-1/critique.md`.
4. **Deadlines per school.** Calendar twin merge (about 90 duplicate cards), a "Deadlines & sessions" side panel (`src/lib/school-dates.mjs`, `src/assets/js/dates-panel.js`), `schemas/session.schema.json`, and a filter-first Deadlines page. The agent stopped while writing the panel CSS.
5. **Open days and sessions research.** Its **437 records** are on `main` in `docs/research/sessions/shards/`. The shards were never merged and the helper for the rest of Europe was cut off (UK: Imperial, UCL, LSE, KCL onwards). The next steps are to merge them into `sessions.jsonl`, import them into `data/sessions/`, and fill the side panel.

## Open issues

- #42 IB-terms planner: round-4 critic fixes
- #39 Admission sessions: separate autumn, spring and rolling intakes
- #41 European data follow-ups
- #40 The owner's design brief (excitement first). Addressed in part by the new menu, the Countries doors and the home discovery surface (in progress)
- #17 Imagery (photo rounds accepted at 8/10; the place checks are still open)
- #44 Home page as the discovery surface (item 1)
- #45 Globe final round (item 2)
- #46 Programme cards: credential line and merged families (item 3)
- #47 Deadlines per school and session data (items 4–5)
- #48 Photos: official-site place checks
- #43 **The owner's request: curated summary pages for every institution** before any hand-off, with targeted links. Top priority next.

## Environment notes

- Git Bash rewrites `SITE_BASE=/IB-…` into a Windows path. Use `MSYS_NO_PATHCONV=1` or PowerShell, and check the gate's exit code.
- The clean-copy worktree for pre-push gating is `D:/ibp-ci`. **Never write to C:.** It is almost full. Throwaway files (browser profiles, scratch builds) go in `D:/ibp-tmp`, and notes worth keeping go in the repo or its git-ignored `.cache/`. The working folder's `.claude/settings.json` points TEMP there. The owner runs `clean-c-drive.ps1` in the working folder to clear what earlier sessions left.
- Research agents use the shared browser pane. For screenshots, use the headless shooter, not the pane.
- Agents never run git. The coordinating session commits.
