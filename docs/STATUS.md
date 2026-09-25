# Project status

**Last updated 25 September 2026.** Live site: https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities/

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

## Done and live

| Piece | Critic | Notes |
|---|---|---|
| Worldwide country audit (15 destinations) | **8/10, accepted** | `docs/research/qa/country-audit-world/round-4.md` |
| Photos (three review rounds, ~350 re-judged) | **8/10, accepted** | `docs/research/qa/photos/round-4/critique.md`. The official-site place checks are an open issue |
| Audience rewrite (EU/EEA readers, `ownCitizens` on every EU/EEA/EFTA destination, shared SU record) | 7/10 in round 2; round-2 fixes are live, no round-3 critic has run | `docs/research/audience/` |
| Danish levels in IB terms, cut-offs and floors in IB points, "Quota 2 only", named actions | 7/10 (round 4) | Remaining fixes: issue #42 |
| Globe (WebGL, cloud dive, MapLibre street level, Back-able selections) | 7/10 (round 3) | Round-3 fixes and the art direction are in progress (below) |
| Programme card photos: 67 cards, 67 photographs | 6/10 (round 1, before uniqueness) | The crop fix and credential line are in progress |
| Four-item menu (ADR 0006), `/countries/` with distance doors, redirects | not critiqued | `docs/research/ia/progress.md` |
| Text walls: Deadlines, the Denmark pages, Trust, Credits, Glossary, About, Counsellors, Compare | `text-walls` guard | Only `/programmes/` and `/planner/` are left on the grandfather list |
| Programme families in data (6 families, 73 → 67 cards) | validator | Rendering is in progress |

## In progress: #43, a page for every institution (branch `feat-43-school-pages`)

- **Done on the branch:** all 450 profile institutions have a page at `/universities/<key>/` (`src/pages/schools.mjs`). Country-page cards and map lights link to these pages, not to homepages. The data is `data/schools/<key>.json` (`schemas/school.schema.json`). The guards are `check-schools` and `school-pages`.
- **Research:** `docs/research/schools/BRIEF.md` and `manifest.json`. Researchers write one file per school as they go and skip files that already exist, so a stopped run resumes by being re-run. Their progress notes are in `docs/research/schools/progress.md`.
- **Order of work:** pilots for Finland and the UK, then an admissions-counsellor critic on the data and an art-director critic on the page (`docs/research/qa/schools/`), then the other 32 countries in batches.
- **Settled with the critic (round 3):** a school's hero photo is the same photo as its card on the country page. That is one image slot, the card being a thumbnail of the page it opens, as for the Danish institutions. It does not count as a repeat under the no-repeated-images rule.
- **Screenshots:** `node docs/research/qa/schools/shoot.mjs <out> <base> <paths…>`. It writes to `D:/ibp-tmp`, never C:.

## In progress: branch `globe-desk` (25 September, evening)

`globe-desk` (worktree `.claude/worktrees/globe-desk`) is the stopped agents' WIP merged with `main` (#43 school pages included), then brought to a **green gate (32 of 32 checks)**:
the desk globe (`globe.js`: `desk()`, `drawDesk()`, `TILT`, lean-in/sit-back flights; guards in `test-map.mjs`), the home page within its word budget (12 cards then "Show all", opened by any filter; the place list folded; 6,096 → 1,209 words), the dates panel's notes behind "Note", and three guards taught about programme families and `/#discover`. The globe's **round-4 critic** is in progress (`docs/research/qa/globe/round-4/`). Merge to `main` and push once it scores 8, or after round 5 whatever the score.

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
