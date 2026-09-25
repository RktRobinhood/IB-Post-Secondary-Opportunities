# Programme variants: which cards are one programme

Researched 25 September 2026. Machine-readable twin: `groups.json`. The data now
carries the result: a `family` block on each member's record in `data/programmes/`,
checked by `src/lib/families.mjs` from `npm run validate`.

## How the groups were found

1. Every pair of programmes at one institution whose names reduce to the same
   subject once brackets, dash suffixes and credential words are dropped
   (`nameStem`). That rule found six pairs and nothing else. It now runs in
   `validate`, so a seventh pair cannot arrive unnoticed.
2. A read of every institution's list for programmes that share a stem loosely
   (CBS "Business Administration and ...", SDU's Vejle computing trio, VIA's
   Viborg animation trio). None is one programme; see the bottom of this page.
3. Each pair diffed on every field a student sees: credential, years, ECTS,
   campus, start month, language, requirements, quota-1 floor, cut-offs, fees,
   summary. Then the difference was checked on the institution's own pages.

## The result: 73 programmes, 6 families, 67 cards

All six are **MERGE**: one card, two paths. None is KEEP SEPARATE. Three of the
six still differ in admission, and the family says so (`admission: "differs"`).
The validator checks that value against the requirements, so a merged card
cannot hide an admission difference. The path table on the programme page has
to show it.

| Family | Paths | Axis | Admission | What actually differs (verified) |
|---|---|---|---|---|
| SDU Electronics | BSc in Engineering · Bachelor of Engineering | credential | **differs** | BSc: 3 yrs, 180 ECTS, research-based first half of the 5-year MSc, no internship, quota-1 floor **7.0**. BEng: 3½ yrs, 210 ECTS, vocational, six-month internship in semester 6, MSc still open, quota-1 floor **5.0**, and DP Course Results count as they stand (the BSc needs two supplementary subjects). Subjects identical. |
| SDU Mechanical Engineering | BSc · BEng | credential | **differs** | As Electronics. The BEng also accepts a fourth science pairing (Geoscience A + Biotechnology A). |
| SDU Mechatronics | BSc · BEng | credential | **differs** | As Electronics. Subjects identical. |
| SDU Software Engineering | Sønderborg · Vejle | campus | same | Same BSc, same requirements (7.0 floor). Sønderborg leans to embedded, distributed systems and security, with 120 places. Vejle leans to user-facing software and AI, with 30 places. |
| AU Economics and Business Administration | Aarhus · Herning | campus | same | AU: "The programme is the same as the one offered in Aarhus. You will earn the same Bachelor's degree." Herning is small and does company projects from day one. 2026 quota-1 cut-off 9.2 vs 6.9. |
| VIA Software Technology Engineering | Horsens · XR specialisation, Viborg | specialisation | same | VIA's own title for Viborg is "Software Technology Engineering - specialised in XR". Same BEng, requirements, 3½ years and 20-week internship. XR from day one vs a later specialisation. Starts August vs September. |

### Sources checked

- SDU, "Bachelor of Engineering or a Master of Science in Engineering?":
  https://www.sdu.dk/en/om-sdu/fakulteterne/teknik/uddannelse/civilellerdiplomingenior.
  It says the BEng "includes half a year's internship in Denmark or abroad" and
  is vocational, and that it still qualifies you for an MSc. It is stored as
  evidence `ev-sdu-beng-vs-bsc` in `data/evidence/variants.json`.
- The quota-1 floors were read on both SDU Electronics adgangskrav pages
  (BEng 5.0, BSc 7.0). The internship semester was read on the BEng Electronics
  page ("in the sixth semester you will complete a six-month internship").
- The Course Results split is on SDU's IB page. The BEng records already quote
  it (`req-entry-award` note).
- AU Herning: https://bachelor.au.dk/en/economics-and-business-administration-auhe
- VIA XR: https://en.via.dk/programmes/bachelor/software-xr

### Why the three SDU credential pairs merge even though admission differs

The owner's rule has two halves. Different admission requirements get a
different card. A course offered with a distinction gets one card with paths.
The SDU pairs sit on the line. What a student sees first is the same: subject,
campus, subject requirements and fees. The owner named Electronics and
Mechanical Engineering as the duplicates to remove.

What differs is a choice made inside the programme: 3 years and research, or
3½ years and industry. The quota-1 floor and the Course Results rule follow
from that choice. So the recommendation is **one card, with the admission
difference on the path rows**:

- "Quota 1 needs 7.0" on one row and "Quota 1 needs 5.0; DP Course Results
  count as they stand" on the other;
- eligibility assessed per path;
- the card's badge shows the best path.

If the owner would rather keep them apart, the escape hatch is data only:
drop the three `family` blocks and add `separateFrom` with the reason.

## Checked and not variants

| Institution | Programmes | Why separate |
|---|---|---|
| AU | Computer Science, Data Science, IT Product Development | Different subjects and requirements |
| CBS | BA and Digital Management / Service Management / Sociology | Separate degrees with their own second discipline |
| CBS | International Business, International Business and Politics | Different degrees and requirements |
| SDU | Computer Science, Artificial Intelligence, Software Engineering (Vejle) | Three BSc subjects on one campus |
| VIA | Character Animation, Computer Graphic Arts, Graphic Storytelling | Three professional bachelors with their own portfolios |
| RUC | Global Humanities, Natural Sciences, Social Sciences | Three faculties |
| BAAA + SEA | Multimedia Design (AP) | Two institutions, so two cards. They did share a photograph, now fixed (`systemic.md`) |
| VIA + Zealand | Architectural Technology and Construction Management | Two institutions, so two cards. They did share a photograph, now fixed |

## Found on the way (not variant questions)

- **AU Herning quota-1 floor conflict.** The Herning opportunity has a
  requirement "Quota 1: an average of at least 6.0" (`req-quota1-average`,
  quoting AU's general sentence). Its own `admission.selection[0]` says "No 6.0
  quota 1 GPA floor is stated for this programme". The Herning page read on
  2026-09-25 states no floor. One of the two is wrong, and it changes
  eligibility. This is left for the conversion agent, who owns
  `data/opportunities` requirement lines. It is recorded in `systemic.md`.
