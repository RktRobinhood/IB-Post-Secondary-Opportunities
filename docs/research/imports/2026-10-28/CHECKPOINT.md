# Resume checkpoint — 29 October 2026

## Committed research

Commit **a6666aa** on the existing `main` branch contains 18 curated school records,
all 31 exact original packs and their integrity hashes, source reviews, the durable
queue and the wider Denmark-outward work order. The exact staged snapshot at
`D:/ibp-tmp/uni-import-gate-20261028-a` passed **all 40 quality-gate checks**.
Freshness remains advisory. No push or deployment was performed.

The 18 records contain 74 listed programme/path records and 20 catalogue examples.
Thirteen institutions remain held on the specific scope/evidence questions in
their reviews. These are not complete just because a research pass happened.

## Imagery

Eight AUB Mediterraneo degree photographs have now been imported, visually
reviewed as 16:10 crops and light/dark card proofs, and approved with the exact
official image addresses. See the Cyprus photo critique and proposal file.
The imagery follow-up includes the manifest, proposal, review/proofs and updated
coverage. Its clean staged snapshot also passed all 40 quality-gate checks on
29 October; freshness remains advisory. Other photo proposals are preserved as
unapproved research, not published image records.

The proposing agents stopped when workspace credits were exhausted. Do not
restart finished source reviews. Their partial photo work survived:

- `schools-kh.jsonl`: seven AUPP proposals remain **unsigned/unimported**; inspect
  the candidates and actual crops before approval. Some previous candidates are
  text collages and must stay rejected.
- `official-candidates-am.json`, `official-candidates-az.json`,
  `official-candidates-bh.json` and contact sheets: partial degree investigations.
  AUA has banner-heavy programme pages; newsroom alternatives are in
  `official-pages-am.jsonl`. ADA returned access challenges; RCSI simulation
  pages yielded actual clinical photographs. No approvals are implied.
- `official-candidates-br.json` and `official-pages-br.jsonl`: Hayek alternatives;
  some are portraits or hero assets rather than useful degree photographs.
- `photos-institutions-cn.md` is only a preliminary institution-image audit.
  There were 23 publishable candidates among the 31, with four completely missing
  and several rejected records. Actual crop review remains pending. Its probe
  output, downloaded candidates and scripts are under
  `D:/ibp-tmp/institutions-cn/`. Preserve another task's pre-existing staged FDV
  decision; do not merge it incidentally.

The matching photo agents may be resumed when credits are available, or the
coordinator can take a bounded photo batch. Degree proposals for the seven Tongji
and four Tsinghua programmes are not yet finished. Catalogue schools skip a
degree-by-degree photo pass but still need a suitable institution image.

## Validation and coverage

The first full build exposed a stale coverage tool: it used the historical
assignment manifest, so it omitted current countries such as Cyprus. The follow-up
change derives coverage from current country profiles, excludes canonical twins
using their public keys, and counts only programme pictures the renderer actually
publishes. Its handoff regression check includes Cyprus. Regenerate coverage and
proximity output from the clean staged snapshot before committing those reports.

Use the short gate path above. A first attempt under the long OneDrive workspace
path hit Windows filename limits in old QA screenshots; it is not the validated
snapshot. Avoid putting new gate copies under that long path. The short snapshot
uses a dependency junction to the existing `node_modules`.

The original unrelated working-tree changes listed in `WORKFLOW.md` remain
outside these commits. In particular, do not commit the two untracked Hong Kong
records or their template changes merely to make the shared checkout's gate
pass. Run against the clean staged snapshot.

The current global coverage report also correctly exposes ten EUB paths without
established selection detail. The entry minimum is not evidence of how places
are allocated. Keep that investigation open instead of filling `selection`
with an invented ranking method merely to raise the coverage count.

## Work order

Finish initial-batch imagery and currently actionable parity work first. Revisit
source questions only when due, with their review's concrete next action.
Then complete nearby catalogue gaps in the generated `proximity-queue.json`,
working outward from recorded Danish places. Do not confuse this work-order
estimate with travel distance, and do not mark deferred unknown facts as complete.
