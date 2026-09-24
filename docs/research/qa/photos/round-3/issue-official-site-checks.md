<!--
DRAFT GitHub issue. Not filed. Suggested title:
  Photos: confirm the place of ~250 live photos against each institution's own website
Suggested labels: photos, data-quality
-->

# Photos: confirm the place of ~250 live photos against each institution's own website

## The problem

`docs/IMAGE_STANDARD.md` says a photograph is checked against the institution's own website, and that a Commons or Wikipedia page is never the check. For most live photos that check was never done.

The round-3 photo critique (`docs/research/qa/photos/round-3/critique.md`, §5) read the latest verdict of every live main photo, in the apply script's order:

- **271 of 452** have an empty `checkedAgainst`;
- **54** are "checked" only against Commons or Wikipedia, which is circular.

| Region (verdict file) | Empty | Circular | Live main photos |
|---|---|---|---|
| Central | 66 | | 69 |
| Nordic/Baltic | 46 | | 73 |
| West | 45 | | 46 |
| South | 27 | 16 | 49 |
| World | 83 | 32 | 118 |
| **Total** | **267**¹ | **48**¹ | |

¹ The per-region rows are the critic's; they sum to 267 and 48, not 271 and 54, because the critic's totals also count Denmark and pictures last judged in the iteration files. Use the totals as the size of the job.

The West figure counts only the original approvals: photo iteration 2 re-checked the replacements, not these.

## Why it matters

A photo can be beautiful and still show the wrong building. Round 3 found one live example: `nl-uva` showed a UvA-owned canal house that is now let as a jazz bar. No card showed the wrong institution in the critic's sample of nine, but a sample of nine out of 325 is not a check.

## What was done in photo iteration 4 (round 3 → round 4)

- 73 main photos were replaced (5 named by the critic, 68 from a visual sweep of 350 pictures). Every replacement names a page on the institution's own domain in `checkedAgainst`.
- 254 pictures were re-approved on sight in the same sweep. Those lines **carry forward** their earlier `checkedAgainst`; the sweep judged bands and subjects, not places, so it did not add official checks to them.
- `nl-uva` (the jazz-bar building) was replaced with the Roeterseiland campus, checked on uva.nl.

**Where it stands after iteration 4** (live hosted main photos in a fresh build, by the regional file that first judged each key; latest verdict in the apply script's order):

| Region | Empty | Circular (Commons/Wikipedia only) | Official page named | Live main photos |
|---|---|---|---|---|
| World | 62 | 29 | 31 | 122 |
| Central | 46 | 2 | 41 | 89 |
| Nordic/Baltic | 35 | 1 | 32 | 68 |
| West | 33 | 0 | 38 | 71 |
| South | 21 | 13 | 18 | 52 |
| Denmark | 4 | 2 | 5 | 11 |
| First judged in an iteration file | 0 | 0 | 20 | 20 |
| **Total** | **201** | **47** | **185** | **433** |

So **248** live main photos still lack an official-site place check (down from the critic's 325). The region split differs from the critic's table because this one follows each key to the regional file that first judged it, and the live set changed as photos were replaced or rejected. Gallery pictures (the Danish galleries) are not counted.

## What to do

Work region by region, **world first** (the largest and least checked), one verdict file per region pass, applied with `node scripts/apply-photo-review.mjs`:

1. For each live main photo with an empty or circular `checkedAgainst`, find a page on the institution's own domain that names the building or campus shown (a campus page, building page, address, history page). Add its URL to `checkedAgainst` in a new approve line that keeps the earlier reason.
2. If the site blocks fetching, a search restricted to the domain is acceptable; say so in the reason.
3. If the building is not the institution's, or no longer used by it, reject it and propose a Commons replacement under the usual rules (CC0/PD/CC BY/CC BY-SA, at least 1200 px, viewed at 16:10).
4. Record each region's pass in `docs/research/qa/photos/` as it happens.

Done when every live main photo's latest verdict names at least one URL on the institution's own domain. A small script that prints the count by region would let each pass show its progress.
