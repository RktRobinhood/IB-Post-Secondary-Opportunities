# The IB scale is the lingua franca; a local scale is an optional translation

## What forced the decision

Issue #15 calls extending Opportunity coverage past Denmark "the largest piece
of work in the repo". All 37 Opportunity records are `dk-*`, and the reason is
not that nobody has done the research yet. **The requirement model cannot
currently express a non-Danish entry requirement at all.**

Three places where Denmark is not data but structure:

1. `schemas/opportunity.schema.json` types a requirement's `level` as
   `common.schema.json#/$defs/danishLevel` — the enum `A`, `B`, `C`. There is
   no other subject level a requirement can have.
2. `data/ib-subjects.json` holds one subject-equivalence table with no name and
   no owner. Each subject maps `HL` and `SL` to `{ subject, level }` pairs that
   are silently Danish.
3. `src/lib/eligibility.mjs` reports a gap as *"No Danish equivalent is
   published"* — because there is one equivalence table and it is Denmark's.

So a Dutch Opportunity has two options today, and both are wrong. Express
"IB Mathematics HL at grade 5" as a Danish `Matematik A`, which is a translation
nobody asked for into a vocabulary the Dutch source never used; or add a branch
for the Netherlands, which is the thing this repository refuses to do and has
three separate guards against.

## The decision

**The IB's own vocabulary is the default, and it needs no translation.**

A requirement expressed as `ibSubject` + `ibLevel` (`HL`/`SL`) + `minGrade`
(1–7) is complete, universal, and is *already* how most systems outside Denmark
publish their rules. UCAS: "36 points including HL Mathematics at 6". A Dutch
programme: "IB with Mathematics A or B at HL". No mapping table is consulted,
because there is nothing to map — the source said HL and the student has HL.

**A local scale is an optional, named, per-Destination translation layer.**

A Destination that publishes its rules in its own vocabulary — Denmark's A/B/C,
the Netherlands' VWO profiles, Germany's Leistungskurse — gets a **Recognition
Scheme** record naming its subject scale, its grade scale, and its equivalence
table, with the authority that publishes it. A requirement written in that
vocabulary declares which scale it is on. The engine translates a Student
Profile into that scale before comparing.

Denmark's Recognition Scheme is the *Eksamenshåndbogen*, published by the
Danish Agency, and it becomes one record among several rather than the shape of
the schema.

## Why this way round

The tempting alternative is a universal internal scale that every Destination
maps into and out of. It is worse for the reason this whole product exists:
every translation is a place a claim can quietly become a different claim, and
a student who is told "you meet this" is entitled to see the sentence the
institution actually published. Translating a Dutch HL requirement into an
internal level and back out again puts two of our inferences between the source
and the student, where today there should be none.

Defaulting to IB removes the translation entirely for most of the world and
confines it to the jurisdictions that genuinely have one. It also puts the cost
where the complexity is: Denmark is the country with an official conversion
handbook, so Denmark is the country that pays for a conversion table.

## What this costs

The Danish Opportunity records are currently written as `kind: "ib-subject"`
carrying `subject: "Mathematics", level: "A"` — which is not an IB subject
requirement at all. It is a local-equivalency requirement wearing the wrong
label, and it has to be migrated. That migration is mechanical but it touches
every one of the 37 records and the eligibility tests that pin their wording.

`danishLevel` stays in `common.schema.json`, because it is a real scale and the
name is accurate. What changes is that nothing generic refers to it.

## How it is enforced

The rule that makes this hold is the one already used elsewhere in the
repository: a guard reads the engine back off disk and fails if a country code
appears in it. `scripts/test-eligibility.mjs` gains the same check that
`scripts/test-credentials.mjs`, `scripts/test-floor.mjs`,
`scripts/test-calendar.mjs` and `scripts/test-jurisdictions.mjs` already carry.

A Destination with no Recognition Scheme must still work end to end. That is
the test that proves the default is real rather than a fallback nobody
exercises.
