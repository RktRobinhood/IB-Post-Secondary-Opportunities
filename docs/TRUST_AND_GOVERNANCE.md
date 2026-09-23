# Trust, safety, and governance

This product may influence expensive, time-sensitive decisions made by students who are often under 18. Trust needs operational rules: who can change a claim, how it was verified, how a mistake is corrected, and what commercial or automated systems influenced what the student sees.

## Editorial independence

- Institutions, agents, advertisers, or sponsors cannot buy ranking, eligibility, map prominence, or inclusion in a filtered result.
- Sponsored editorial content, if it ever exists, must be labelled at the point of display and kept outside calculated fit and recommendation logic.
- Affiliate links must never replace the official application or evidence link and must be disclosed before a student follows them.
- Gifts, partnerships, data access, and other potential conflicts should be recorded publicly.

## Claim lifecycle

Every consequential claim has an owner or review queue and moves through explicit states:

1. **Discovered:** a possible claim and source have been identified.
2. **Structured:** the claim has been entered with applicability and Evidence.
3. **Attested:** whoever wrote the record opened the source and read it, and captured the wording that supports the claim. First-hand, single-pass, self-reported.
4. **Verified:** a *second party* read the record back against the source and agreed. Not the party that wrote it — see below.
5. **Published:** the claim is visible for a specified Intake or effective period.
6. **Needs review:** the review interval elapsed, the source changed, or a conflict appeared. A freshly researched record sits here, attested but unreviewed, and that is the normal state rather than a deficiency.
7. **Superseded or unavailable:** the old claim remains traceable but is no longer used as current evidence.

High-consequence changes to eligibility, deadlines, fees, immigration, accreditation, or professional recognition should require a second check before publication when staffing permits.

## AI-assisted research

Automation can discover pages, extract candidate facts, compare versions, and flag changes. It cannot be the final authority for consequential admissions advice.

- Store the Official Source and the exact applicability context, not merely an AI-generated summary.
- Require human verification before a new or changed consequential claim becomes verified.
- Preserve conflicting or ambiguous evidence for review instead of asking a model to choose silently.
- Record the tool or process that produced imported data when useful for auditing.
- Never fabricate a missing field from patterns in other institutions or previous Intakes.
- A secondary source may never be the sole basis for a consequential claim. See **What a source is allowed to establish** below; it is enforced by the validator rather than left to judgement.

## What a source is allowed to establish

Denmark was researched almost entirely from rule-owners. The Agency publishes the conversion tables; each university publishes its own entry requirements; both are the final word on their own subject. That situation does not survive contact with the rest of the world.

Most of the genuinely useful writing about applying to Italy, or Japan, or Hungary comes from people who are accurate, culturally informed, and **not authoritative** — other IB schools' counselling pages, government promotion agencies, counsellor association briefings. Refusing to use those sources would mean writing nothing outside Denmark. Using them carelessly would mean publishing rumour with the same typography as law.

So every Evidence record carries a `sourceClass`, and the classes differ in what they are permitted to establish.

| Class | Authoritative? | May establish |
|---|---|---|
| The body that sets the rule | yes | anything |
| The authority that runs the process | yes | anything |
| Qualification recognition body | yes | anything |
| An institution's own guidance | yes | anything about itself |
| Government study-promotion agency | no | procedure, description, culture |
| Another school's counselling guidance | no | procedure, culture |
| Counsellor professional body | no | procedure, culture |
| Encyclopaedic reference | no | description only |
| Commercial course aggregator | no | description only |

**A secondary source may establish context, may point us at the official page, and may never on its own make a consequential claim verified.** A consequential claim is anything that decides an application: entry requirements, deadlines, fees, quotas, qualification conversion.

Three properties of this rule matter more than the table:

**It is mechanical, not editorial.** `npm run validate` fails. It is not a paragraph in this document that a tired person can forget at midnight, and it does not depend on anyone remembering that StudyinDenmark is a promotion agency rather than the ministry.

**The question is asked per claim, not per record.** A promotion agency cited *alongside* the rule-owner is useful, and is often the clearer explanation of the two. A promotion agency cited *alone* for who pays tuition is the problem. The classes behind each claim are pooled, and one authoritative source is enough while ten secondary ones are not.

**The claim kind is derived from the field, never hand-labelled.** A label someone must remember to set correctly is a label that will be wrong on exactly the records where it matters most. `requirements` is consequential whatever anyone types.

`src/lib/source-classes.mjs` holds the matrix, including what goes wrong when each class is over-trusted. Those cautions are drawn from things that have actually happened here rather than written in the abstract — the promotion-agency caution exists because StudyinDenmark is government-run, looks authoritative, and its programme catalogue is missing several Danish universities outright.

### When two secondary sources disagree

Do not resolve it. Two schools' guidance pages disagreeing about how a system behaves is normal, and it usually means the honest answer is "it depends", or that the two schools' students are in genuinely different situations — a different passport, a bilateral agreement, a different qualification.

Record it as a context note with `confidence: "contested"` and both readings, or do not publish it. Picking the more encouraging side is the single most tempting failure available here, and the validator refuses a contested note that shows only one side.

### Context is not a lower grade of rule

A cultural observation gets its own record type rather than a weaker requirement. It always shows its attribution, it states its confidence in words, and it may not be phrased as an obligation — the validator rejects "you must" in a context note. If the honest phrasing really is "you must", it is a rule, and it belongs in `requirements` behind an authoritative source, which is a higher bar on purpose.



## Attestation is not review

This section exists because the model got it wrong and the wrongness was
invisible from the site.

152 evidence records were marked `verified`. Two of them had been checked by a
second party. The rest were written by research passes that opened the official
page, quoted it, wrote the record, and set `verified` on their own work in the
same breath — across 108 free-text spellings of "Read, 2026-09-23". Records
written by the session that built this model were among them, so this is not a
criticism of any particular pass. `verified` was the obvious thing to write
once you had genuinely read the page, and nothing said who was allowed to write
it.

**The line that carries the weight is independence, not species.** The first
instinct is to say `verified` means a human, and that fails in both directions:
a human who writes a record from a page has not been checked either, and an
agent that opened the official page and quoted the sentence has done something
real that "unverified" throws away.

Reading a page and writing a record from it is *transcription*. Reading the
record back against the source is *review*. The second is a check on the first,
and the first cannot check itself — whoever performed it.

So an Evidence record carries two separate things:

| Field | Means | Who may write it |
|---|---|---|
| `attestation` | I opened the source and read it, and here is the wording | whoever wrote the record |
| `review` | I read this record back against its source and agree | anyone *except* the attester |

`verificationState: "verified"` requires a `review`, and
`scripts/test-sourcing.mjs` fails a record that claims it without one or that
names the same party twice. It is a test rather than a paragraph, because a
paragraph is what failed the first time.

### Why attestation is not its own verificationState

It was going to be, and `evidenceStatus()` in `src/lib/canonical.mjs` falls
through to `verified` for any state it does not recognise. Adding `attested`
to the enum would have rendered all 150 as "Verified" on the page — precisely
backwards, in a file the pass making the change did not own.

So the enum is untouched and a self-attested record sits at `needs-review`,
whose existing label is already exactly right: *"Not yet checked by a person."*
The attestation records that the source was genuinely read, so the work is kept,
and the state stays honest. Prefer the design that fails safe in the files you
cannot see.

### What the site says

Three numbers, never merged:

- **attested** — someone read the source and quoted it
- **independently reviewed** — a second party checked the record against it
- **machine-checked** — `npm run verify` re-fetched the page and found the wording

At the time of writing the middle number is **zero**. That is not a regression;
it is the number that was always true, and it is now visible.

### A source that refuses robots is not a missing source

`unavailable` means the page is gone: a 404 or a 410. A 403, a 405, a timeout
or a JavaScript-rendered page means the host will not serve *us*, and a
counsellor clicking the link very often sees it perfectly well.

Conflating those marked a dozen live pages as unavailable and blocked the
release gate over them, which is both wrong and the kind of wrong that gets a
gate switched off. The distinction is recorded on the `sourceCheck`, and only
a page that is genuinely gone gates anything. `scripts/lib/link-policy.json`
holds the hosts known to behave this way and why.

## Corrections and feedback

Every public page should offer a clear way to report outdated or incorrect information without requiring an account. A correction report should capture the affected page or claim, the concern, and an optional supporting source while collecting as little personal data as possible.

Correction targets:

- acknowledge high-impact reports promptly;
- remove or mark unsafe claims while they are investigated;
- record what changed, why, when, and which Intakes are affected;
- propagate canonical corrections to every derived page and export;
- avoid silently rewriting evidence history.

## Recommendation transparency

The default ordering should be neutral and comprehensible, such as alphabetical, geographic, deadline, or a student-selected factor. When the system personalizes or reorders results, it should show:

- which Student Profile fields and preferences were used;
- whether unknown data affected inclusion or ordering;
- how ties and missing values are handled;
- how to reset personalization;
- why a specific Opportunity is present.

Do not create a universal “best match” score. Do not infer sensitive traits or use proxies for wealth, ethnicity, disability, religion, or other protected or intimate characteristics.

## Privacy and students under 18

- Explore first; do not require an account for core discovery, comparison, or planning.
- Keep Student Profiles and Exploration Lists local by default.
- Do not collect names, school, exact location, contact details, transcripts, or birth dates unless a later feature has a necessary, documented purpose.
- Do not use manipulative urgency, streaks, public comparison, or social-pressure mechanics.
- Provide plain-language explanations suitable for students as well as formal policy text.
- If cloud accounts are introduced, complete a separate data-protection and child-safety review before implementation.

Calendar exports should be generated locally where practical. A downloaded `.ics` file is a user-controlled snapshot and must be labelled as such. Live calendar subscriptions or Google/Microsoft/Apple account connections require a separate security and privacy review, minimal authorization scopes, revocation controls, and explicit consent at connection time.

## Application guidance boundaries

- The product explains and plans; it does not claim that an application, document, fee, result, or reply was received by an external system.
- Every Deadline or Application Milestone identifies the responsible authority, target Intake, applicant group, time zone when relevant, source, and verification date.
- Previous-cycle or provisional dates are visually distinct and never exported as confirmed without a warning.
- Calendar reminders link back to the official source and cannot be presented as authoritative notifications.
- Application Route resolution shows the Student Profile assumptions used and falls back to Needs review when the correct route is ambiguous.
- Changes to exported dates do not silently propagate unless the student deliberately uses a future subscribed-calendar feature.

## Analytics and experimentation

Prefer aggregate, privacy-preserving measurements that answer specific product questions. Do not record the full contents of Student Profiles, eligibility assessments, searches, or saved Opportunities as general-purpose analytics.

Any experiment that changes result inclusion, ordering, warnings, or eligibility language needs an ethical review and must not hide important information from a control group. Performance and layout experiments are lower risk but still need accessibility checks.

## Media, brands, and attribution

- Record the owner, source page, licence or usage basis, retrieval date, and required credit for every hosted image.
- Use institution logos for identification only and follow published brand guidance where available.
- Do not imply endorsement by an institution, the IB, or an admissions authority.
- Remove or replace an asset promptly when its permission or attribution is uncertain.
- Write useful alt text based on the information conveyed, not filenames or marketing captions.

## Launch and annual review gates

Before a public release or Intake rollover, confirm:

- the target IB session and university Intake are visible;
- high-consequence claims have current Evidence or a prominent previous-cycle warning;
- official application links, deadlines, costs, and eligibility rules pass review;
- stale, conflicting, and unavailable data reports have owners;
- privacy, cookie, analytics, accessibility, and correction paths match actual behavior;
- generated data exports carry their schema, data revision, and generation date;
- sponsorship or conflicts are disclosed;
- automated checks, keyboard journeys, reduced motion, mobile performance, and broken links pass.

This document defines product safeguards, not legal advice. Before collecting accounts, sensitive data, payments, or applications, obtain appropriate legal and data-protection review for the jurisdictions served.
