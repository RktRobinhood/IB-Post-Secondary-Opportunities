# Hourly universities — independent maintainer review, round 1

2026-10-29. **Maintainer: 7/10 — not yet accepted.**

Reviewed `scripts/hourly-universities.mjs`, its library and focused tests. Ran
`node scripts/test-hourly-universities.mjs` successfully. All review mutations
used named temporary fixtures; the production reservation and ledger were not
changed. No builds or Git operations were run.

The tier ordering is explicit and deterministic: Denmark, other Nordics,
Europe, world, then distance and institution key. Unknown distances sort last.
Seed rows win over optional discovery candidates. Discovery receives a distinct
identity/accreditation/scope action. Future failed/deferred rechecks are skipped
and due records reenter geographic order. Completion requires a real local commit
and an accepted, institution-specific scored report; publication and CI remain
dispatcher responsibilities, as documented. Finite exhaustion never claims world
coverage. Reservation acquisition is exclusive and orphan locks fail safely.

**Blocking finding: a stale finish can poison the next reservation's lock.**
In `finish()`, commit verification occurs after reading the old reservation but
before creating the shared `finishing` directory. Another process can finish that
run and reserve the next institution during this interval. The stale process
then creates `finishing` inside the new reservation's lock, detects the changed
ledger and throws, leaving the marker behind. The new valid owner cannot finish.

Reproduced deterministically in a temporary fixture using the injectable commit
verifier to interleave completion and the next reservation. Result: `dk-two`
remains `in_progress`, its lock contains `owner.json` **and `finishing`**, and the
stale call throws “Reservation changed before finish”.

Make finishing ownership specific to its run, revalidate ownership around marker
acquisition, and remove only the marker created by the rejected caller when that
validation fails. Add a regression for an old finish crossing completion plus a
new reservation. Preserve the new owner's ledger and lock byte for byte.
