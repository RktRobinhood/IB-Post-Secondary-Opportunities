# Researching a destination

This is the brief a per-country research pass runs against. It exists because
fan-out research without a defined shape returns prose nobody can ingest and
nobody can trust, and because the interesting failures in this repository have
all come from the same place: a fact that was *nearly* right, recorded in a
field that implied it was certain.

Denmark took weeks and produced 37 programmes. That pace does not scale to
thirty countries, and it does not have to, because the value added here is not
discovering these facts — thousands of students solve this problem every year
and several kinds of organisation publish their working. The value is
collating, dating, reconciling and presenting it in one place. That argues for a
broad pass across many destinations, which in turn argues for this document.

## The rule that shapes everything else

**A secondary source may establish context, may point you at the official page,
and may never on its own make a consequential claim verified.**

You will be reading a great deal of material written by people who are accurate,
culturally informed and not authoritative. Use it. Record it as what it is. The
classes and what each may establish are in
[TRUST_AND_GOVERNANCE.md](TRUST_AND_GOVERNANCE.md#what-a-source-is-allowed-to-establish),
and `npm run validate` enforces them, so a mistake here fails the build rather
than reaching a student.

## Order of work

Do these in order. Each stage answers questions the next one depends on, and
the ordering is also cheapest-first: stages 1–3 can rule a destination out
before anyone spends a day on programme-level research.

### 1. Does the IB get you in at all?

| Question | Acceptable sources |
|---|---|
| Is a full IB Diploma recognised as a qualifying secondary education? | recognition body, official rule-owner |
| Is there a minimum total-points requirement? | recognition body, official rule-owner |
| How do IB grades convert to the local scale, if they do? | recognition body only |
| Are DP Course Results treated differently from the full Diploma? | recognition body, official rule-owner |
| Does the IB need legalisation, apostille or translation? | admissions authority, official rule-owner |

If the conversion table is published, capture it in full and verbatim. Do not
summarise a conversion table. Denmark's is the single most valuable artefact in
this repository and no university reproduces it correctly — several publish
wrong versions, which is exactly why the recognition body is the only
permitted source for this row.

### 2. Can they afford it, and may they stay?

| Question | Acceptable sources |
|---|---|
| Tuition for an EU/EEA citizen; for everyone else | official rule-owner, admissions authority |
| Is the fee per year or per programme, and can it rise mid-degree? | official rule-owner |
| Residence permit or registration requirements, and cost | official rule-owner |
| Proof-of-funds threshold, if any | official rule-owner |
| Realistic monthly living cost, and in which cities | promotion agency, official rule-owner |
| Work rights during study | official rule-owner |

Record the price year with every figure. A fee with no year attached is worse
than no fee at all, because it looks current.

### 3. How does applying actually work?

| Question | Acceptable sources |
|---|---|
| Central portal or direct to institution? | admissions authority |
| Deadlines, with time of day and time zone | admissions authority, official rule-owner |
| How many choices, and are they ranked? | admissions authority |
| What happens between applying and results | admissions authority |
| How results arrive when the IB publishes in July | admissions authority, official rule-owner |
| Selection mechanism where demand exceeds places | official rule-owner |

The July problem is the one to get right and the one most often skated over.
Most European deadlines fall months before the IB releases results on 6 July,
and every system has a different answer — conditional offers, predicted grades,
a results service, or a late round. Find that answer explicitly.

### 4. What is the sector actually made of?

Fill `sectorLandscape` on the Destination. Use local names. This is the only
place non-university routes get named, and most IB students are never told they
exist.

Ask specifically: what is the institution type nobody mentions to foreigners?
Denmark's answer was the erhvervsakademi — two years rather than four, topping
up to a full degree later. Nearly every country has one.

Mark `ibAccessible: "unknown"` and say so rather than guessing. A route recorded
as existing and unresearched is useful; a route confidently mis-described is
not, and a route omitted is invisible.

### 5. Cultural context

Only now, and only as context notes. This is where second-hand sources earn
their place: the things people who have watched students go through it tend to
say. See the type's rules — always attributed, confidence stated, never phrased
as an obligation.

Good prompts: what do foreign applicants reliably get wrong here? What is the
interview or test actually for? What does "selection" mean in practice? Where do
people apply who did not get their first choice?

### 6. Programmes, last

Only for destinations that survived stages 1–3. Programme-level research is the
most expensive stage and the fastest to go stale, so it is not where a pass
starts.

For each: entry requirements with the official wording kept, the language of
instruction, the campus, the intake, and the source page for each requirement.

## You may not verify your own work

This is the rule the brief was missing, and its absence produced 150 records
claiming a confidence nobody had given them.

When you open the official page, read it and write the record, you have
**attested** it. Record that, in full:

```json
"verificationState": "needs-review",
"attestation": {
  "by": "the Ireland research pass",
  "at": "2026-09-23",
  "method": "read-source",
  "note": "The page carries two conversion tables and they disagree; this is the second."
},
"excerpt": "the sentence that carries the claim, quoted"
```

- `by` names **who**, not what was done. "Read from the source page" describes
  the act; 108 records described the act and none named a party, so nothing
  could be checked against them.
- `method` is one of `read-source`, `read-browser`, `read-pdf`,
  `read-secondary`, `derived`. Use `read-browser` when a plain fetch returns
  nothing — that is a finding, and it tells the automated checker why it will
  never confirm this record.
- `note` is for what the reading turned up that the excerpt cannot carry: two
  tables that disagree, a page stamped with its own update date, a figure you
  had to sum yourself.

**Do not set `verificationState: "verified"`.** That state means a second
party read your record back against its source and agreed, and it carries a
`review` block naming them. `scripts/test-sourcing.mjs` fails a record that
claims it without one, or that names the same party twice.

**And the party has to be a person.** `scripts/test-attestation.mjs` fails a
`verified` record whose `verifiedBy` describes a machine — "automated", "the
research pass that wrote this record", a script's filename. This is not a
formality. Eight records once carried `verifiedBy: "automated"` while a
`review.by` two fields down said, in as many words, "not a person", and
`/trust/` counted all eight under the heading "The honest number". The records
were honest; the state on them was not, and the state is what gets counted.

If you have read a page carefully and quoted it accurately, `needs-review`
with a full attestation is what your work is. Writing `verified` does not
promote it — it just makes the site claim something about a person who does
not exist.

`needs-review` with a full attestation is not a lesser outcome. It is the
correct and expected state of good research, and the site reports attested and
reviewed as two separate numbers so neither has to stand in for the other.

### Record what could not be read, as a finding

A page that 403s, times out, or renders its content in JavaScript is a fact
worth keeping, not a gap to leave blank:

- say so in `attestation.method` and `attestation.note`
- if the host blocks automation generally, add it to
  `scripts/lib/link-policy.json` with the reason
- **do not** set `verificationState: "unavailable"`. That means the page is
  *gone* — a 404 or 410. A host that refuses robots is still serving a page a
  counsellor can open, and marking those unavailable blocked the release gate
  over a dozen live pages.

## Use the real vocabulary

Many fields are controlled vocabularies, and guessing at them is the single most
likely way to produce output that needs hand-repair. Print them:

```bash
npm run vocab                 # all 39
npm run vocab -- feeStatus    # one field
```

They are generated from `schemas/`, so they cannot drift out of date the way a
list copied into this document would.

This section exists because the first destination researched against this brief
produced nine schema errors, and every one was an invented enum value — "most"
where the schema wanted "partial", "several" where it wanted "many", "reduced"
where it wanted "eu-eea-rate". The research was sound; the vocabulary was made
up, because the brief said what to find out and never said what the permitted
answers were.

A related rule: **where the honest answer is that something does not exist,
leave the field out rather than filling it with a sentence saying so.** The
Netherlands has no IB-to-Dutch conversion table, and `conversionTable` is
absent for that reason, with the explanation in the recognition record and a
context note. A field whose value is the string "None" validates, reads badly,
and is invisible to anything counting what is missing.

## Output shape

Records go in `data/`, one file per record, named after its id:

- `destinations/<iso2>.json` — including `sectorLandscape`
- `places/<iso2>-<city>.json`
- `institutions/<id>.json`
- `programmes/<id>.json` — with the cross-country `credential` model
- `opportunities/<programme>-<intake>.json`
- `application-systems/` and `application-routes/`
- `context-notes/<id>.json`
- `evidence/<iso2>.json` — an array, every record carrying `sourceClass`

**Output must validate without hand-editing.** If it does not, the brief or the
schema is wrong, and fixing the output by hand hides which.

Run, in order:

```bash
npm run validate
npm run verify -- --file <iso2>.json
npm test
```

## Recording what you could not find

This matters more than it sounds. A gap recorded as a gap is useful; a gap that
looks like an absence of a requirement is dangerous, because a reader cannot
tell "this country has no subject requirements" from "we did not check".

So: leave the field empty, and say in `watchOuts` or a context note what was not
established and why. Never infer a missing figure from a neighbouring country,
from another institution, or from a previous intake.

If a page is JavaScript-rendered, a PDF, or in a language nobody on the project
reads, that is a finding. Record it. Several of this repository's most useful
notes are of exactly that form.

## The floor you are aiming at

`researchDepth()` says how thin a page is. The **publication floor** says when it
is finished, and it is checked mechanically by `npm run floor`.

A Destination counts as *published* the moment someone writes its canonical
record in `data/destinations/`. From that moment `scripts/test-floor.mjs` holds
it to all five checks and `npm test` fails until it meets them. This is
deliberate: the cost of a half-finished Destination is a failing test, not a
page that quietly looks as authoritative as Denmark's. **Do not write the
canonical record first.** Write it last, when the other four are already true.

| Check | What it means |
|---|---|
| `sector` | The canonical record carries a `sectorLandscape` naming every route, in the local vocabulary |
| `evidence` | At least one Evidence record in the Destination's namespace, none pointing at a dead source |
| `route` | Every institution listed resolves to an Application Route |
| `dates` | Every deadline carries an ISO date or one of the six declared date states |
| `institutions` | Every institution listed is backed by a source at its own registrable domain |

`npm run floor -- --report` prints the outstanding work per Destination, and the
queue worst-first. Start from that, not from a guess.

### Dates

The `date` field takes ISO and nothing else. Where there is no date, say which
of these it is — and choose deliberately, because the difference between the
first two is the difference between research you owe and research you did:

- `not-published` — you opened the official page and the date was not on it
- `no-central-deadline` — there is no such date, and that is the finding
- `varies-by-institution` — set by each institution rather than centrally
- `rolling` — considered as they arrive
- `not-yet-announced` — not published for this intake yet
- `withdrawn` — no longer offered at all

A year you inferred from a bare recurring date is `provisional: true`. A
provisional date must never be shown as a confirmed one.

`consequence` says what missing the date actually costs: `hard`,
`equal-consideration`, `priority`, `rolling`, `indicative`, `personal`. Getting
this wrong in either direction does real damage — an equal-consideration date
rendered as a deadline frightens a student off applying at all, and a hard
deadline rendered as indicative costs them the place.

## When the country is not the unit

Outside Europe especially, a country is often several Application Jurisdictions.
Canada has at least three application routes; the United States has fifty-odd
admissions environments and several shared systems across them; Switzerland,
Germany, Belgium and Spain all vary below the national level.

`CONTEXT.md` defines the term. The model is in `src/lib/jurisdictions.mjs` and
it is entirely data-driven — **there is no code anywhere that knows the name of
a country, and adding one must not introduce any.**

Where a Destination divides:

1. The canonical record declares `institutionGrouping` and lists its
   `jurisdictions[]` — each with an `id`, a `name` as the student will meet it,
   a `kind`, optionally the `applicationRoute` it uses, and `variations[]` for
   what differs there in cost, health cover or deadlines.
2. Every institution in the country profile declares its `jurisdiction`.
3. Every Application Route declares the `jurisdiction` it serves, where it
   serves only part of the Destination.

Two distinctions the model will hold you to:

- **Declaring one group is a finding; declaring nothing is not.** A country that
  is genuinely one system should say `"institutionGrouping": "none"`.
- **"Apply directly" is a route.** It gets an Application Route record with
  `"channel": "direct"`, not an empty field. Having no route recorded means
  nobody has looked.

Per-jurisdiction variation belongs in `variations[]`, not in a prose note the
reader has to disentangle. If health cover depends on the province, that is a
row, not a sentence.

## Definition of done

- Stages 1–3 answered, or the destination explicitly parked with the reason.
- Every consequential claim carries an authoritative source.
- Every record you wrote carries an `attestation` naming you, and none claims `verified`.
- `sectorLandscape` names every route, including the ones we cannot yet advise on.
- `npm run validate` and `npm test` pass with no hand-editing of generated output.
- `npm run verify` reports the new evidence as supported, or the exceptions are
  understood and written down.
- `npm run floor` passes, or the canonical Destination record has deliberately
  not been written yet and the report says exactly what is still owed.
