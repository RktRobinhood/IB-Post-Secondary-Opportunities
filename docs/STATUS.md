# Project status

**Last updated 30 September 2026 (afternoon).** Live site: https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities/

This page says where the work stands, so the next session (human or agent) starts from facts rather than from memory. Update it at the end of every work session.

## How work is accepted

- A separate critic agent scores each piece 0–10, and 8 or more is accepted (`docs/QA_CRITIC_LOOP.md`).
- Every commit is pushed at once, because the owner reviews the live site, not local files.
- Before a push, the changed files are copied onto a clean worktree of `main` and the full gate is run there: `node scripts/qa.mjs` with `SITE_BASE=/IB-Post-Secondary-Opportunities`, currently 39 checks.

## 30 September (afternoon): paused at the 5-hour ceiling mid-batch

Weekly usage 39% (owner's project ceiling: 50%). Paused at 70% of the
5-hour window (resets 15:00 UTC). Nothing below is committed yet.

- **Poland:** all 14 `data/schools/pl-*.json` written (listed), every
  programme has detail. Photos not started (`schools-pl.jsonl` absent).
  Next: run the photo pass (ENRICH_BRIEF), then check, gate, ship.
- **Czechia:** 11 of 13 written with detail (missing `cz-vsb-tuo`,
  `cz-czu`; `cz-uct-prague` and `cz-ctu` were being finished — re-check
  them). Country-record fixes pending in `data/countries/cz.json`, listed
  in `docs/research/schools/progress.md` (AMU fees, UPOL IB, UWB fee and
  A2 language, USB deadline, LF2 2027 dates). Photos not started.
- **Designed fallback backdrop (#67, owner-approved):** half-built in the
  working tree — `src/lib/designed-backdrop.mjs` (new), edits in
  programme-card, components, site.css, data, programme pages and the
  image guards. Resume the agent brief (in this session's history: seeded
  SVG pattern per programme, field palette, same veil, unique per page and
  site-wide, hero too; screenshots to docs/research/qa/designed-backdrops/).
- **Flagship cards for catalogue schools:** half-built — schema,
  check-schools, schools.mjs, templates/university.mjs, school-programme,
  BRIEF; example `data/schools/gb-edinburgh.json`. Catalogue pages say
  every degree is taught in English, then 2–4 "best known for" cards from
  the university's own strengths pages, then the course search.
- `scripts/lib/long-titles.json`: adds "Sustainability in Marketing and
  Media Communication" (Charles University's official name).
- Lessons added to COUNTRY_PIPELINE: one browser tab per agent; **an agent
  that spawns its own helpers multiplies usage** (Czechia's five helpers +
  six others took the 5-hour window from 0 to 70% in 35 minutes) — tell
  country agents not to fan out.

## 30 September (day): nine countries through the pipeline

- Degrees with programme detail: 337 → **781 of 799**; with their own photo:
  179 → **353**. Shipped country by country through `docs/COUNTRY_PIPELINE.md`
  (detail + photos → critic → sign → 40-check gate on a clean copy → push):
  DE (60 detail / 25 photos), SE (59 / 22), BE (38 / 13), AT (38 / 14),
  NO (21 / 8), CH (14 / 2), NL (215 / 59), IT (photos only, 31).
  Critic round 1 scored 5–7 each time; removing its rejects reached 8.
- **Official degree photos** (1e34d11): where Commons has nothing, a
  programme page's own image is linked from the institution's server and
  credited to it; the importer checks it appears on that page. The ladder
  is in ENRICH_BRIEF, "When Commons is dry".
- **In flight at the usage ceiling (64%):** Portugal. Its 5 Commons lines
  plus an official-photo pass for its 19 business/computing degrees are in
  `docs/research/programme-images/schools-pt.jsonl` (not yet imported).
  Next: `import-programme-images.mjs --only=pt --unsigned`, sheet, critic,
  sign, gate. The Pelamis line must change (Italy holds the MOSE look).
- **Portugal official-photo pilot:** 1 of 19 (an ISEG class; business-school
  sites are stock and events). The gap for business/economics/computing cards
  is a design question — a designed no-photo card (#67) — for the owner.
- **Owner decision (30 Sep, late):** cards with no photo get a generated,
  unique designed backdrop (field colour + a pattern seeded per programme,
  full-bleed under the veil). Generic admissions photos are not used as degree
  photos. First job after the reset; critic loop to accept (#67).
- **Next after that:** the official-photo ladder for the business,
  economics and computing degrees every country skipped (Italy 49, NL 156,
  DE 35, SE 37, …), country by country; each critic's
  `critique-round-1.md` names the replacements it wants for its rejects.
- Open data questions per country are in `docs/research/schools/progress.md`
  (e.g. RUG Information Science Dutch B2, AMSIB 1 May vs 31 Aug, UiA places).

## 30 September (early): content over polish

- The owner, looking at the live site: the templates are right, the gap is
  assets and data. Germany's degree cards have no photos and no detail, so
  they read as bare text boxes next to Denmark's. Priority now: country by
  country, collect degree photos and programme detail into the shared
  templates. Small #67 polish only when it falls out of that work.
- Coverage on 30 Sep (`npm run coverage`): DE 60 degrees, SE 59, AT 38, BE 38,
  NO 21, CH 14, NL 215 (school records) — all 0 detail, 0 degree photos.
  Italy 87 and Portugal 24 have detail but no photos.
- The process is now written down: `docs/COUNTRY_PIPELINE.md` (stages,
  commands, pace, what fails) and `docs/research/schools/ENRICH_BRIEF.md`
  (the agent brief). Germany shipped through it (311753e): 60/60 degrees
  detailed, 25 degree photos (critic 6 → 8).
- Running/paused at the usage ceiling: DE, SE and PL (#41) running; NL (two
  batches), NO+CH, AT and BE paused mid-way — their files are written per
  school, so resume by re-running the brief on the unfinished schools.
- Globe (#53): flags no longer sit under every bubble; a country's flag shows
  in its label only while hovered or chosen; a bubble a filter empties is a
  faded dot, not a grey "0".
- Small fixes: country pages grouped public/private now say "depends on the
  kind of institution" (the sentence follows the groups' declared `kind`);
  home globe place counts are cards, as the filter's are (Sønderborg 7, not 10).

## 29 September (evening): one template per level (#55)

- The owner: the site has three levels — country, university, programme —
  and every page at a level must be the same template with different data;
  a section with no data is left out, never redesigned; after the programme
  page the site hands off to the university's own page. The cause of the
  repeated parity fixes was two renderers per level (Danish records vs
  country school records).
- Now: `src/templates/country.mjs`, `university.mjs`, `programme.mjs` draw
  every page; `src/pages/{denmark,destinations,institutions,schools,programme,school-programme}.mjs`
  are adapters only. `docs/PAGE_TEMPLATES.md` has the table.
- Gate check `templates` (`scripts/test-templates.mjs`) reads every built
  page back: 36 country, 430 university, 872 programme pages carry their
  template's mark and slots in order. A future change to how a level looks
  goes into its template once.
- Country pages now open like Denmark's (two ways on, four numbers counted
  from records, Denmark-style cards); university pages share one side rail
  and fixed topic headings; programme pages share "What you need → How places
  are decided → What it is → More at … → Sources" and the official-page button.
- Parity critiques: 6 → 7 → 7 (`docs/research/qa/parity/round-{1,2,3}/`).
  After round 3: phones show possibilities before dates; IE's 11 dual
  degrees are paths inside their partner subject's card (27 → 16); one
  sources block and a captioned hand-off on programme pages. Everything
  left is in #67 (template items, data gaps, one owner decision on the
  phone order of the dates panel).
- Also landed tonight: #42 closed (planner round 6, 313 scenarios); #62
  closed and #53 advanced (SVG flags, per-country bubbles, hover outlines,
  globe as filter); #49 ten dead links fixed from a 6,283-URL sweep; #66
  ULisboa and NOVA published, UMinho still blocked (draft untracked).
- Spain degree photos (#54): 54 of 93 paths signed after three photo-editor
  rounds (5 → 6 → 7; every flagged photo removed). The other 39 show a plain
  text card; a designed no-photo card is on #67.
- Student-eyes QA pass (late): 18 of 20 findings fixed (open windows shown
  as past, IE rounds, Sweden, Parcoursup, MedAT, counts across pages, raw
  ids in text, empty date panels, trust wording, Dutch award wall, planner
  Danish B). The rest are on #67.
- Old branches `design-40` and `feat-43-school-pages` have no commits off
  `main`; their worktrees' uncommitted edits are saved in
  `D:\ibp-tmprchive\`. Awaiting the owner's word to delete them.

## 29 September: two admissions follow-ups closed (#41)

- LSMU's extra July admission round does not name the programmes it covers, so
  Medicine applicants are now told to treat 5 July as their last submission
  day rather than relying on that round.
- University of Warsaw resolution 315 was checked against resolution 278. It
  changes only the foreign-qualification recognition clause; the 2 February
  and 30 September 2027 admissions bounds remain unchanged and the amendment
  is now recorded as evidence.

## 29 September: parity coverage in every country handoff (#60)

- `npm run coverage -- --handoff <country-code>` now regenerates the durable
  coverage report and prints a paste-ready country snapshot with research,
  programme detail, programme photos, institution photos and the remaining
  queue kept separate.
- The school research brief, parity contract and parallel-work instructions
  require that snapshot at the end of every country batch. It is explicitly
  observability, not a 100% release threshold.
- A gate check protects the handoff shape and its arithmetic without failing a
  country for honest missing coverage.

## 29 September: programme-card clarity follow-up (#46)

- A card whose admission chip already gives last year's IB-points cut-off no
  longer repeats a second points floor in its Needs line. The page retains the
  full requirement; the card keeps one actionable number.
- The programme-card guard now rejects that competing-number regression on
  every generated card.
- Compound requirements now read “Physics and Chemistry” rather than using a
  symbolic plus sign; the card guard distinguishes that from the useful “+N
  more” disclosure count.
- Absalon Biotechnology now shows its officially published 3½-year length and
  210 ECTS; the supporting Absalon programme PDF is recorded as evidence.

## 29 September: one programme-card and page system (#63)

- The visual mismatch was real even though the renderer had no country-code
  branch: canonical Danish programmes and country school-record programmes
  fed different props and modifiers into the broad `card()` primitive.
- The Danish treatment is now the programme-card contract. Both data models
  pass through `renderProgrammeCard`: full-bleed 16:10 image and veil, then
  title, credential/length/place, one concise requirement or selection line,
  optional paths, one admission chip and page-context meta.
- The school-only subject-colour band, separate subtitle/prose layout,
  deadline chip and fee chip are removed. Deadlines remain in the adjacent
  dates panel; fees remain in the section summary and programme page.
- The programme-card guard now reads both canonical and school-record pages,
  so a second country-style card cannot return unnoticed.
- School-record programme pages now use the same compact hero grammar as the
  canonical Danish pages, with the same institution, credential, length and
  place eyebrow. Missing degree photos no longer trigger a separate coloured
  subject-family panel; the compact layout remains stable with or without an
  image. A site-wide build guard rejects the retired country-specific hero
  modifiers. Breadcrumbs now follow the facts strip and the official-page
  action sits in the side rail in both renderers, rather than switching to a
  separate school-record closing panel.

## 28 September: France degree-photo batch ready

- **France now has a distinct, licensed photograph for all 24 listed programme
  paths** across EDHEC, emlyon, ESCP, ESSEC, École Polytechnique, PSL and
  Sciences Po. Every image was fetched through the shared country-agnostic
  pipeline, normalized without enlargement, credited and signed only after the
  stored crop was reviewed.
- The importer now has an explicit `--unsigned` first pass. A country batch can
  fetch and normalize its candidates for visual QA without manufacturing an
  approval, then sign only the files that actually landed after review.
- The rendered France cards and the smallest source (the 517 px ESCP Paris
  photograph) were checked in light and dark mode. The focused programme-image,
  unique-image and imagery guards pass after a fresh 1,410-page build.
- The unrelated Spain and Portugal research remains uncommitted and outside
  this release.

## 28 September: institution-photo gaps audited

- The reported **13 institutions without a Commons record** were not 13 visible empty states: Birmingham Dubai and SIM already had approved official images; Sorbonne Abu Dhabi, EMTA and DigiPen Singapore had rejected generic/graphic share images; eight had no image record at all.
- **Ten fixes are ready to ship:** reviewed official campus/student photographs for Khalifa, Sorbonne Abu Dhabi, Middlesex Dubai, RIT Dubai, University College Freiburg, EMTA, Hanze, DigiPen Singapore and Nova Gorica, plus a normalized, credited CC BY-SA 4.0 Commons photograph of the University of Malta gateway.
- **One intentional empty state remains:** St Martin's Institute of Higher Education. Its site exposes promotional graphics rather than an honest campus/student photograph, and Commons has no verified match.
- The coverage report now counts images through the same publication decision as the renderer. After these fixes, **399 of 450** institutions have a photograph students can actually see; the other 51 have missing, rejected or below-floor records and correctly render the designed panel. The broader recovery/place-verification queue belongs to #48, not #58.

## 27 September: Finland degree-photo pilot shipped

- **Live candidate on `main` (`e9a60b8`):** all 101 Finnish programme cards and programme-page heroes now have their own credited, reviewed photograph, with 303 responsive WebP variants. The resolver is scoped by school and works for every country without country-specific rendering branches.
- **Consistency guards:** the gate now requires every published programme image to be credited and reviewed, rejects byte-identical reuse across decorative image slots, and verifies image records against their files.
- **Visual review:** representative Aalto, Metropolia, LUT, Tampere, Quantum Technology and Paramedic Nursing pages were checked on desktop and phone, in light and dark modes. Card treatment, crops, contrast and programme heroes match the Danish interaction pattern.
- **Release proof:** a clean detached worktree at `e9a60b8` passed all 38 checks with `SITE_BASE=/IB-Post-Secondary-Opportunities`; freshness remained advisory only.
- **Still in flight and intentionally uncommitted:** 13 Spanish and 12 Portuguese school records plus their coverage-report updates. They still need their admissions reviews before shipping.

## 26 September (midday): local session with Chrome

- **Done:** the cloud branch's coverage report is on `main`; GitHub now has only `main` (deleted `feat-43-school-pages`, `globe-desk`, `wip/agents-2026-09-25`, `claude/upbeat-rubin-hnw28y`, `claude/vigilant-clarke-04w3my`, all merged first). Local worktrees `globe-desk` and `w37` removed (their folders may linger, locked by OneDrive); `design-40` and `w43` kept, they hold uncommitted edits.
- **Live:** #41 lead checks (Lithuania's LAMA BPO route, Ljubljana's English degree open to EU applicants, Malta, Nova SBE; `docs/research/qa/issue-41-leads/findings.md`); **France** 12 records (critic 6 → **8**, `docs/research/qa/schools/fr/`); **Italy** 13 records (critic **8** in round 1, `docs/research/qa/schools/it/`). Bocconi's Early session closes 29 Sep 2026.
- **Researched, not yet critiqued (files in the working tree, not committed):** **Spain** 13 (`data/schools/es-*.json`, `reports/batch-es.md`) and **Portugal** 12 (`pt-*.json`, `reports/batch-pt.md`). Each needs an admissions critic (8+), then the gate; expect long-title and text-wall fixes like France's.
- **#54 Finland degree photos shipped (`e9a60b8`):** 101 of 101 degrees have their own Commons photo (`data/programme-images.json`, 303 WebP files `src/assets/img/programmes/school-fi-*`, log `docs/research/qa/degree-photos/fi/progress.md`), wired for every country with no country branch. Representative cards and programme heroes were reviewed on desktop and phone in both colour modes; a clean detached checkout passed all 38 gates.
- **Owner questions from Spain:** should a joint degree sit on every partner's record, and should English groups inside Spanish-language degrees be listed?
- **Subagents cannot write report files in `docs/research/qa/`**: critics return the critique as their report and the coordinator saves it.
- **Next:** ES and PT critics; the BE/IE/FI admissions critics; then wave 2b (PL, CZ, HU) and the next degree-photo batch chosen by #59.

## 26 September (afternoon): cloud session, and the clean-state rule

The owner: `main` is the product; branches and worktrees are temporary and always return to `main` (`docs/PARALLEL_WORK.md`, "`main` is the product"). **Usage ceiling for cloud runs: at 92% of the 5-hour window, stop every agent and update this section.**

### Live on `main`
- **#53 globe, rounds 1–3:** flat map removed; floats; the card is the link and appears once (no "Open …" line, no two-step flash); stays a sphere; phone controls above and card below the globe; schools on zoom with readable names and photos; a still while it loads; a clean arrival on a chosen country (US numbers add up).
- **#41, rounds 1–5:** unsourced rankings and research-log wording out of student text; `superlatives` and `research-log` guards read every student page; evidence disclosure shows the site's own verification label.
- **#42 planner:** round-4 fixes plus three rounds of verification fixes (courses after results per applicant group; no Possible on an unrecorded permission or a quota-2 route no record joins; open questions shown as "?"; phone order badge → step → why). 302 eligibility scenarios.
- **Research leads** (`docs/research/schools/leads/`): official URLs found by web search for ES, IT, FR, PT, PL, CZ, HU, EE, LV, LT, SI, MT, GR, US, CA, AU (discovery, not facts). Possible errors in live country pages they suggest are on issue #41.
- **Owner rules:** ship to `main`; catalogue schools get flagship programme pages and a faculties list (`docs/research/schools/BRIEF.md`).

### Critic scores
| Piece | Rounds | State |
|---|---|---|
| #53 globe (owner notes) | 7, 7.5, 7 | round 4 in progress: Back restores the globe; European countries land on their schools with numbers that add up; desktop lean-in |
| #41 | 7, 7, 7, 7 | round 5 (last) critic running |
| #42 planner | 6, 6, 7, 7, 6 (cap), then verifications 7, 7 | third verification running |
| #43 programme pages | 6, 6, 5, 5, (5 not scored) | live; round 5 fixed the 11 pages whose Apply-by was later than their own deadline, guarded site-wide. Next: photos for 68 ruled-hero pages (Hanze first), a sweep of "What you need" for non-requirement text |
| #52 one card per programme | 6, 7 | live; round 3 to do: counts on /denmark/ and /universities/ are cards too; the Laurea pair; Fontys Marketing Management; "each path is a separate application" line (`docs/research/qa/campuses-52/round-2/critique.md`) |

### Branches
`main` holds everything. `claude/upbeat-rubin-hnw28y` equals `main` (51bb9df) and is finished; delete it with the three dead branches (`feat-43-school-pages`, `globe-desk`, `wip/agents-2026-09-25`) from a local session. The programme pages (#43), one card per programme (#52), the BE and IE school records and the FI enrichment went live together on 26 September once no programme page showed an Apply-by later than its own deadline (rule 11 of `test-school-pages.mjs`). **Not yet reviewed by an admissions critic:** Belgium round 2, Ireland, the Finland enrichment, and programme pages round 5.

### To resume
1. #52 round 3 (critique above), then an admissions critic on programme pages round 5 and the BE/IE/FI data.
2. Globe round 4 → critic (round 5 is the cap).
3. Build flagships + faculties for catalogue schools (schema, page, guard) after #43 lands.
4. With web access (a local machine): turn leads into `data/schools/<key>.json` records per BRIEF.md, wave 2 first; check the #41 lead items (Lithuania LAMA BPO, Portugal access route, Ljubljana, Malta); #54 degree photos; the BE/IE/FI admissions critics.
5. Leads still missing: NZ, SG, HK, JP, KR, CN, AE (an agent was running them; check `docs/research/schools/QUEUE.md`).

### Blocked in the cloud
University sites, Wikipedia and Wikimedia are not reachable from this environment; only GitHub and web search are. Branch deletion and tag pushes are refused by the proxy.

## For the next session on a local machine (not the cloud)

- **Delete the dead branches** on GitHub: `git push origin --delete feat-43-school-pages globe-desk wip/agents-2026-09-25` (the cloud proxy refuses deletions). Nothing is lost: all three are ancestors of `claude/upbeat-rubin-hnw28y` (check with `git merge-base --is-ancestor origin/<branch> origin/claude/upbeat-rubin-hnw28y`), and that branch merges into `main`. Delete `claude/upbeat-rubin-hnw28y` too once it is in `main`.
- Remove old local worktrees under `.claude/worktrees/` (`w43`, `globe-desk`) once `main` has their work.

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
- **Catalogue schools (26 September, afternoon):** for English-language universities open as a whole, no full course list; instead a full programme page for each flagship (what the school is known for and excels in) and a list of its faculties, each with one line on what it looks for and a link to the faculty (`docs/research/schools/BRIEF.md`, "Catalogue schools").
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
