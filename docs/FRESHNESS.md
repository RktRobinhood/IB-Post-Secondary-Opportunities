# Keeping the data true

A wrong deadline can cost a student a year. That is the whole reason this
document exists, and the reason the tooling is as blunt as it is.

## The four states

They are separated because they call for different responses.

| State | What it means | What happens |
| --- | --- | --- |
| **verified** | A person read the source and signed the claim off. | Shown normally. |
| **needs-review** | A source was read and recorded, but nobody has checked it. | Shown, with a visible caveat. |
| **stale** | Past the review interval for its claim type, or past its own `reviewBy`. | The eligibility engine refuses to answer; the page says so. |
| **superseded / unavailable / conflicting** | The claim is wrong, gone, or contested. | Same refusal, and the build reports it. |

`needs-review` not gating the result is a deliberate choice, and worth defending.
Gating on it would turn every result to "Needs review" the moment new research
landed, and a warning that is always on is a warning nobody reads. The one label
that must keep its meaning is the one that tells a student *we genuinely do not
know*.

**A conflict is never resolved by preferring the more permissive source.** Both
claims are kept, `conflictsWith` links them, and the public result is held at
Needs review until a person decides. Silently picking the friendlier reading is
how a student ends up ineligible on results day.

## Review intervals

In `data/freshness-policy.json`, set by consequence rather than by convenience:

| Claim type | Interval | Why |
| --- | --- | --- |
| Application deadline | 90 days | Getting this wrong means a student misses the only round. |
| Grade conversion | 120 days | Denmark republishes its IB table by 1 March; every result shifts with it. |
| Entry requirement | 180 days | Subject and grade rules change between admission years. |
| Tuition | 180 days | Published per academic year. A figure with no year attached is not usable. |
| Programme availability | 180 days | Programmes close and switch language. UTokyo's PEAK closed after the 2026 intake. |
| Immigration | 180 days | Work routes change mid-cycle. The UK Graduate Route is the live example. |
| Funding | 180 days | Rates are annual. Danish SU changes on 1 January 2027, for this cohort. |
| Living cost | 365 days | A budget out by a margin is annoying, not dangerous. |
| Institution description | 730 days | Prose ages slowly. |

Some claims carry a **hard stop** no interval can override — a deadline must be
re-verified before its own application window opens, whatever the clock says.

## The tools

```bash
npm run freshness            # what can no longer be trusted, and why
npm run freshness -- --rollover   # every date-bound claim for the next intake
npm run watch:sources        # which source pages changed since last read
npm run build                # prints the evidence state on every build
```

`scripts/freshness.mjs` exits non-zero only for **conflicting** or
**unavailable** evidence, because those are wrong *now*. Stale and incomplete
are debt, and failing a build on debt teaches people to ignore the build.

`scripts/watch-sources.mjs` fingerprints each source page with the chrome
stripped out — scripts, navigation, cookie banners, cache-busting hashes — so a
flagged change is worth reading. When a page changes it names every claim resting
on it and stops. **It never edits a requirement and never re-verifies anything.**
Automation finds drift; people resolve it. That line is the point of the whole
design: a machine may discover that something moved, but a machine signing off a
consequential admissions rule is exactly the failure this product cannot afford.

## Provisional dates

A date inherited from a previous cycle is marked `provisional: true` and is
**never normalised into a confirmed current-cycle value**. It renders with a
"provisional" marker, and the page says the authority has not yet republished it.

Two are live right now, both Danish: the portal opening date and the deadline to
accept a place. The day and month have been stable for years; the year has not
been confirmed.

## The annual rollover

Runs each September, moving the site from one IB session to the next. It is a
checklist, not a script, because almost every step needs a person to read a page
and make a judgement.

1. Bump `targetIntake` on every Destination and create the new intake's
   Opportunities. Opportunity ids carry the intake, so the previous cycle's
   records stay intact and comparable.
2. Re-verify every Application Milestone. Anything carried over is `provisional`
   until the authority republishes it.
3. Re-verify every entry requirement against the programme's own page.
4. Re-fetch the grade conversion table — Denmark publishes the new one by 1 March.
5. Re-check tuition for the new academic year. Remove any figure whose year
   cannot be established.
6. Confirm each English-taught programme is still running and still in English.
7. `npm run freshness -- --rollover` to list every date-bound claim untouched.
8. `npm run watch:sources` to find pages that changed.
9. Archive the previous cycle's `dist/data.json`, so a student who acted on it
   can still see what they saw.

## Where it stands

At the last build: **6 verified, 100 awaiting review, 0 stale, 0 superseded,
0 unavailable, 0 conflicting**, across 103 distinct sources all currently
reachable.

That ratio is honest rather than flattering. The six verified records are the
Danish national rules, which were read page by page. The hundred awaiting review
were generated by the migration from research that did read the official pages,
but no person has signed them off one at a time. Raising that number is ordinary
editorial work, and it is the single most valuable thing anyone can do to this
repository.
