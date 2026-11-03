# SEA / SouthWest selector identity — maintainer review, round 1

Date: 2026-11-03. Role: independent maintainer. **Score: 9/10 — accepted for the selector change.** No required fixes before acceptance of this code scope.

This review concerns the single reserved institution `dk-business-academy-southwest`, resolved to existing `dk-sea`. It does not accept university admissions, accreditation, programme, cost or imagery facts. Those require the separate admissions/image/shared-information review. In particular, resolving an identity is not completing the institution's intake research under ADR 0008.

## Artefacts inspected

- Actual working-tree diff for `scripts/lib/hourly-universities.mjs`, `scripts/test-hourly-universities.mjs`, `docs/HOURLY_UNIVERSITY_WORKFLOW.md`, and the SouthWest row of `docs/research/imports/discovery-candidates.json`.
- Complete current selector/ownership implementation and focused test file, rather than only the change summary.
- `docs/QA_CRITIC_LOOP.md`, `docs/HOURLY_UNIVERSITY_WORKFLOW.md`, and `docs/adr/0008-shared-templates-define-information-quality.md`.
- Current hourly ledger and reservation owner, read only. Both still identify `dk-business-academy-southwest` and run `a0f89352-bbe2-4e3d-ae8e-f06f9864d34c`.

## Why this passes

The change addresses the actual failure: a finished legacy-name audit would otherwise leave the already queued current identity eligible immediately. Confirmed mappings now form one selection unit, while `possible_existing_keys` remains an unconfirmed research lead. The SouthWest row retains its old key, original catalogue URLs and report reference and points directly to `dk-sea`; no second public institution is created by this change.

Selection validates each active mapping against the known inventory, refuses self-links, unknown targets, cross-country mappings and alias chains, then removes only the confirmed alias from the work queue. The current target row supplies distance, country tier, school scope and future reservation key. Filtering the already sorted inventory preserves the geographic ordering of those target rows. There is no Denmark-specific selector branch or public schema/template extension.

The latest timestamped outcome across the current name and its confirmed aliases governs eligibility. A future deferred or failed outcome retains its future recheck date; a complete outcome remains skipped; a due recheck returns under the current key. A published partial outcome is therefore not converted to complete. Original ledger entries and their evidence/history remain intact. The implementation uses timestamps written by the existing ledger rather than migrating or rewriting reservation keys.

Ownership and finish paths are unchanged by the diff. `next()` still refuses selection when any running ledger entry or lock exists; reservation still acquires the atomic directory lock and rechecks the ledger/selection before writing; finish still requires the exact original run/key ownership. The test resolves the identity while the old reservation is held, compares ledger/owner bytes, and finishes under that original key. Existing tests continue to exercise competing reservations, invalid finishes, stale finishers and finish-guard cleanup.

The workflow paragraph describes where next year's editor records a confirmed rename, what constitutes confirmation, how to finish an active run, and when a due recheck uses the current identity. The discovery row still identifies concrete admissions, cost and imagery work as open. That is consistent with ADR 0008's distinction between normalized identity and completed information coverage.

## Verification performed

`node scripts/test-hourly-universities.mjs` passed (exit 0), including its real child-process reservation race. The new tests cover unconfirmed leads, resolution during a reservation, cross-name deferral, due current-key recheck, a newer canonical accepted outcome, retained old-name history and invalid mapping targets/chains. The existing focused ownership and partial-publication checks also passed.

I additionally ran isolated temporary-fixture assertions, without editing source or repository state:

- With an alias at distance 0, its current target at 30, and an unrelated institution at 20, the unrelated institution is selected first. This directly checks that the alias's old geography cannot pull its target forward.
- A newer legacy-name deferral supersedes an older canonical completion, returns the future recheck date, and reopens only the current key when due. This checks the reverse timestamp direction as well as the direction covered in the committed test.

The temporary fixtures were removed. No full gate, default `dist` build, Git mutation, ledger edit or discovery/code edit was performed for this review.

## Changes that would raise the score

These are follow-ups, not acceptance blockers for this valid SEA mapping:

1. Move the two additional assertions above into the focused suite. The current geography assertion checks the returned identity but uses an unrelated institution farther away than both names; a competitor between the two distances would catch accidental reuse of legacy geography. A newer alias deferral after an older canonical completion would also catch a future implementation that always favors accepted canonical state rather than the latest outcome.
2. Consider rejecting an explicitly present empty or non-string `resolved_institution_key`. The current truthiness test treats empty/null/false values as absent. It does not suppress work, and the committed row has a valid nonempty string, but a field-presence/type check would make malformed hand edits easier to diagnose. Keep absence valid.

**Decision:** the selector and its documented identity contract are maintainable and safe to publish with this one-institution unit. University fact/image acceptance and the coordinator's clean release/publication checks remain separate requirements.

## Narrow final recheck — 2026-11-03

**Updated score: 9.5/10 — accepted. No required fixes or remaining findings within this selector scope.**

I inspected the updated actual diff of the selector and focused test file and reran `node scripts/test-hourly-universities.mjs`; it passed with exit 0, including the existing ownership/race checks. Both optional follow-ups above are now addressed in the working files awaiting coordinator publication:

- The regression suite places the legacy lead at distance 0, the current identity at 20, and another institution at 10. It asserts that the institution at 10 is selected, so the test now distinguishes current geography from legacy geography.
- A later legacy-name deferral now follows an earlier current-key completion in the fixture. The suite checks that the deferral suppresses immediate repeat work and returns the current key when its recheck is due.
- Validation checks field presence with `Object.hasOwn`, accepts an absent optional field, and rejects a present empty/non-string value. The suite exercises `''`, `null`, `false`, `0` and `{}` alongside unknown, self, cross-country and chained targets. Target alias detection also uses field presence, preventing a malformed target mapping from qualifying as a non-alias.

These changes preserve the previous outcome grouping and exact reservation ownership behavior. I made no source/state/discovery edits, inspected no additional admissions data, and ran no build or Git mutation. This recheck only updates the maintainer acceptance; admissions, imagery, shared-information and release/publication acceptance remain separate.
