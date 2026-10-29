# Hourly universities — independent maintainer review, round 2

2026-10-29. **Maintainer: 9/10 — accepted.**

Read the revised finish protocol and regression tests. Reran
`node scripts/test-hourly-universities.mjs`: passed. Independently repeated the
original round-1 interleaving in a separate temporary fixture: one finish pauses
in commit verification, another finishes its run and reserves the next
institution, then the old finish resumes. The stale finish is rejected; the
successor's ledger, owner file, reservation directory and cache directory listing
remain byte for byte unchanged. The successor subsequently finishes successfully.

The original blocker is resolved. Ownership is checked again after potentially
slow validation. The exclusive finishing guard is a per-run sibling directory,
outside the reusable reservation directory. A further owner/ledger check occurs
after guard acquisition, and `finally` removes only the guard this caller
successfully created. A stale finisher cannot insert its marker into its
successor's reservation. The added injected-read-failure regression also verifies
guard cleanup without altering the valid reservation and permits a later retry.

The accepted behavior from round 1 remains: deterministic Denmark → other
Nordics → Europe → world tiers, distance ordering within tiers, seed precedence
over optional discovery candidates, explicit identity/accreditation/scope work
for discoveries, future failed/deferred rechecks, and exclusive reservation
ownership. Invalid input preserves state. Completion still requires an accepted
institution-specific report and a real local commit; publication/CI checks are
the dispatcher's documented responsibility. Exhaustion does not assert worldwide
coverage.

No remaining blocking finding in this scoped review. Tests and independent
reproduction used named temporary directories only. The production AAU
reservation, ledger and lock were untouched. No implementation edits, Git
operations or builds were performed.
