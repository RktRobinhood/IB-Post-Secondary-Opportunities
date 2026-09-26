# School research queue (#43), 26 September 2026

Missing data, in priority order. European destinations first, because most readers are EU/EEA
citizens; then the rest of the world. A batch is done when every key has a `data/schools/<key>.json`.
Reports go to `reports/batch-<name>.md`; the coordinator folds them into `progress.md`.

| Wave | Batch | Schools | State |
|---|---|---|---|
| 0 | fi, gb | 36 | researched; round-1 critic 7/10 each, fixes in; round-2 critics running |
| 1 | nl-fontys, de ×5, lu, is | 10 | running |
| 1 | se ×5, no ×4 | 9 | done: se 14/14, no 14/14 (report `reports/batch-se-no.md`) |
| 1 | ie | 14 | running |
| 1 | be | 14 | running |
| 1 | at | 15 | running |
| 1 | ch | 15 | done (report `reports/batch-ch.md`). Critic: check the dates labelled "(standing date)" (no year on the page) against the brief's rule |
| 2 | es, it, fr, pt | 50 | queued |
| 2 | pl, cz, hu | 41 | queued |
| 2 | ee, lv, lt, si, mt, gr | 58 | queued |
| 3 | us, ca, au, nz | 61 | queued |
| 3 | sg, hk, jp, kr, cn, ae | 83 | queued |

Accepted countries (critic 8+) are merged to `main`; the rest stay on `feat-43-school-pages`.
A stopped run resumes by re-running its batch: researchers skip files that exist.
