# School research queue (#43), 26 September 2026

Missing data, in priority order. European destinations first, because most readers are EU/EEA
citizens; then the rest of the world. A batch is done when every key has a `data/schools/<key>.json`.
Reports go to `reports/batch-<name>.md`; the coordinator folds them into `progress.md`.

| Wave | Batch | Schools | State |
|---|---|---|---|
| 0 | fi, gb | 36 | **accepted 8/10 (round 2), live on main** |
| 1 | nl-fontys, de ×5, lu, is | 10 | done: nl 17/17, de 14/14, lu 2/2, is 2/2 (`reports/batch-nl-de-lu-is.md`) |
| 1 | se ×5, no ×4 | 9 | done: se 14/14, no 14/14 (report `reports/batch-se-no.md`) |
| 1 | ie | 14 | 11/14; stopped at the usage ceiling. Re-run the batch to finish (TU Dublin was next) |
| 1 | be | 14 | done (`reports/batch-be.md`) |
| 1 | at | 15 | done (`reports/batch-at.md`) |
| 1 | ch | 15 | done (report `reports/batch-ch.md`). Critic: check the dates labelled "(standing date)" (no year on the page) against the brief's rule |
| 2 | es, it, fr, pt | 50 | queued; leads in `leads/es.md`, `leads/it.md`, `leads/fr.md`, `leads/pt.md` (web-search discovery, 26 Sep; unverified — see `leads/README.md`) |
| 2 | pl, cz, hu | 41 | queued; leads in `leads/pl.md`, `leads/cz.md`, `leads/hu.md` (web-search discovery, 26 Sep; unverified — see `leads/README.md`) |
| 2 | ee, lv, lt, si, mt, gr | 58 | queued; leads in `leads/ee.md`, `leads/lv.md`, `leads/lt.md`, `leads/si.md`, `leads/mt.md`, `leads/gr.md` (web-search discovery, 26 Sep; unverified — see `leads/README.md`) |
| 3 | us, ca, au, nz | 61 | queued; leads in `leads/us.md` (14/14), `leads/ca.md` (20/20), `leads/au.md` (14 of 17 searched; UTAS, Griffith, Curtin not). **nz: no leads yet** — the 26 Sep leads session ran out of web searches |
| 3 | sg, hk, jp, kr, cn, ae | 83 | queued; **no leads yet** (26 Sep leads session ran out of web searches before reaching them; re-run the leads task for nz, sg, hk, jp, kr, cn, ae and au-utas/-griffith/-curtin) |

Accepted countries (critic 8+) are merged to `main`; the rest stay on `feat-43-school-pages`.
A stopped run resumes by re-running its batch: researchers skip files that exist.

Next for each done country: an admissions-counsellor critic (round 1), fixes, then move to `main`.
