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
npm run verify               # re-read every cited source, report what it found
npm run verify:write         # the same, recording the findings on each record
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

`scripts/verify-evidence.mjs` re-fetches every cited page and looks for the
claim it is supposed to support. Where it finds one, it quotes the supporting
sentence onto the record.

It **cannot** mark anything verified, and this is deliberate rather than a
limitation waiting to be lifted. An automated check can confirm that "Matematik
A" is still printed on the page it was taken from; it cannot notice that the
page now means something different by it. What it does instead is put the
quotation next to the claim, which turns a reviewer's job from opening a hundred
tabs into reading a hundred sentences. That is the difference between a review
that happens and one that does not.

Three outcomes, and the middle one is the useful one:

| Outcome | Meaning |
|---|---|
| `supported` | Every consequential part of the claim was found, and the wording is now on the record. |
| `partial` | Some of it was found, or the source cannot be read automatically — a PDF, for instance. Usually a restructured page rather than a wrong claim, but it needs eyes. |
| `unsupported` | Nothing was found, or the page is gone. **This is the list that matters**: live claims with nothing currently behind them. |

A miss is never acted on automatically. Nothing in this script downgrades,
rewrites or removes a claim; it records what it saw and stops. The one exception
is a source that cannot be reached at all, which sets `unavailable` — that is a
fact about the source rather than a judgement about the claim, and the engine
must gate on it.

### What it matches on

In descending order of how much a match is worth:

1. **The source's own wording**, where a requirement kept `officialWording`.
   The only probe that is not a guess about phrasing, and the only one that can
   reconcile a case where our structured shape legitimately differs from the
   source's sentence.
2. **Subject and level**, in English and Danish, across the four phrasings Danish
   universities actually use — "Matematik A", "Mathematics at A level",
   "Mathematics level A", and subject and level in adjacent table cells.
3. **Dates**, for deadlines. Day and month only: insisting on the year would
   fail every correct claim about a future intake. Provisional dates are checked
   and reported but cannot fail a record, since the site already labels them as
   unconfirmed.
4. **Content words**, for descriptive prose — and only to answer the narrow
   question it is good for, which is "did we cite the wrong page". Scoring a
   paraphrase by word overlap measures how much we rewrote, not whether we were
   right, so it is never allowed to call a record unsupported on its own.

### Two numbers, not one

Verification state and source checking are **separate axes**, and the site
reports them separately. A record can be unreviewed by a person and still have
had its page re-read this morning with the supporting sentence quoted onto it.
Merging the two into a single "checked" figure would flatter the weaker one,
which is the opposite of what this document is for.

### The failure mode to watch for

Three of the first findings were bugs in the checker, not in the data: a
phrasing it did not know, soft hyphens inside words, and newlines it had
flattened. Each one reported correct data as unsourced, and each looked exactly
like a real finding.

**Before acting on a miss, confirm it by opening the page.** `--id <ev-id>
--verbose` prints the excerpt it matched or the requirements it could not find.
`scripts/test-probes.mjs` guards the class of bug that caused all three — a
regex built in a template literal with single backslashes silently becomes
something else, matches nothing, and throws nothing.

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

At the last build: **7 verified, 99 awaiting review, 0 stale, 0 superseded,
0 unavailable, 0 conflicting**, across 103 distinct sources all currently
reachable.

Separately, on the other axis: **99 records have had their source re-read**, of
which 98 carry the supporting wording and 1 is partial — a tuition-fee PDF, which
nothing automated can read.

That first ratio is honest rather than flattering. The verified records are the
Danish national rules, read page by page. The rest were generated by the
migration from research that did read the official pages, but no person has
signed them off one at a time. Raising that number is ordinary editorial work,
and it is the single most valuable thing anyone can do to this repository — and
it is now much cheaper than it was, because the quotation a reviewer needs is
already sitting on the record.

### What the first full pass found

Worth recording, because each one is a pattern rather than an incident:

- **An exemption buried in a label.** DTU General Engineering requires a
  documented English test and exempts IB Diploma holders from it. The exemption
  was prose inside the requirement's label, so the engine could not act on it and
  answered "unknown" — showing "Needs review" to every student this site serves,
  on a programme they are explicitly excused from. Exemptions now use
  `satisfiedBy`, which the engine understands.
- **A note filed as a mandatory requirement.** An explanatory paragraph about
  grade conversion on a CBS programme downgraded qualifying students from "Meets"
  to "Needs review". `npm run release-check` now blocks on any requirement whose
  label reads like prose. This was the second occurrence; the first was capacity
  facts like "24 study places in 2026" recorded as entry requirements.
- **Six records citing the wrong thing.** The migration attached every
  institution-level page to that institution's `about` field, so fee tables were
  recorded as evidence for descriptive prose. Nothing published was wrong, but
  the traceability was, which is the thing this repository promises.
- **A claim no automated check could ever confirm.** The Danish student budget
  range is our arithmetic on a line-by-line table; the total does not appear on
  the page. Re-done by hand, it sums exactly, and the derivation is now written
  into the record so the next reviewer does not have to redo it.
