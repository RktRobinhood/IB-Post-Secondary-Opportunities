# Audience rewrite: critique, round 2

Critic: a fresh agent, playing the **university counsellor** at an IB school in
Denmark. About a fifth of my students are Danish. The rest are German, Czech,
Norwegian, Swedish, Polish, Ukrainian and others. I judged the rewrite against
`docs/PRODUCT_VISION.md` ("Who it is for") and the critic-loop brief
(`docs/QA_CRITIC_LOOP.md`). The test is the same as in round 1: would I repeat
this page to a student in a meeting?

Dates: 2026-09-24 and 2026-09-25. Round 1: `critique-round-1.md` (6/10).
Fixes: `PLAN.md` "Round 1 fixes", `verification.md` §8–9.

**SCORE: 7 / 10.**

## Verdict

Every round-1 fix has landed, and I checked each one in `dist/`:
- The Nordic-only admin steps are now conditional, with the EU/EEA step beside
  them.
- Both 2027 GKS tracks are closed.
- The SU label is correct and conditional on every foreign page.
- The klip contradiction is settled on su.dk.
- Hungary names Ukraine as a partner.
- Displaced Ukrainians have their tuition line.
- The guard's loopholes are closed.

The Denmark hub, the money page and the FAQ's grant answer are now pages I
would hand to any of my students.

It does not reach 8, because the round-1 pattern ("a rule for one group, told
to everyone") has two more instances. Each tells a named nationality at this
school something wrong about itself:

1. **The Poland page tells my Polish students that Polish student support is
   closed to them.** It is written to a foreign EU student and never says what
   changes for a Polish citizen. The law it cites, art. 324 of the Higher
   Education Act, governs *foreigners* (cudzoziemcy) only. The same page calls
   Karta Polaka "irrelevant to you" and says EU citizenship gives "the identical"
   benefit. The statute says otherwise: art. 324(3) pkt 2 opens the
   maintenance grant and the student loan to Karta Polaka holders without the
   worker condition. EU citizens get that access only if they work.
2. **The Denmark "How to apply" page tells my Ukrainian students that Aarhus
   will not take them.** It defines "fee-paying applicant — that is, not an EU,
   EEA or Swiss citizen". But the money page, one click away, says holders of a
   Special Act permit pay no tuition. Aarhus's rule is worded for *paying*
   applicants. Its non-EU documentation deadline is for "non-EU applicants
   without a Danish residence permit". Every non-EU student at a school in
   Denmark holds a Danish residence permit.

Both fixes are small, and neither needs new research beyond what is quoted
below. A third round that fixes these two, plus the four minor items, should
reach 8.

## Gate and build

- `$env:SITE_BASE='/IB-Post-Secondary-Opportunities'; node scripts/qa.mjs`:
  the gate is **all 30 checks pass**, with `freshness` advisory only.
  - The first two runs failed in `build` with `EPERM`/`ENOTEMPTY` on
    `dist/`. That was OneDrive and the parallel agents contending for the
    directory, not a content fault. The third run was green. `audience`,
    `calendar`, `validate` and `release` all pass.
- `node src/build.mjs` (SITE_BASE unset) wrote 152 pages. I rebuilt again on
  2026-09-25 before reading, so the text below is from the current data.
- `node scripts/test-audience.mjs --report`: all fixtures ok; 75,261 strings,
  **0 hits**.

## Round-1 fixes, checked in dist/

| # | Fix | In dist/ | Verdict |
|---|---|---|---|
| 1 | Nordic admin steps conditional, with the EU/EEA step | `/destinations/no/`: "If you are a Nordic citizen, you do not register with the police. Other EU/EEA citizens staying more than three months register with the police within three months of arriving." `/destinations/fi/`: steps, why and residency all start "If you are a Nordic citizen…" and add Migri for others. `/destinations/is/`: the Registers Iceland route for EU/EEA/Swiss is first, and the Nordic track follows. | ✓ |
| 1b | `group-identity` guard rule | Present, built from `applicant-groups.json`; fixtures pass | ✓ (but see the guard section) |
| 2 | GKS 2027 closed on both tracks | `/timeline/` "Not open to you" lists both the Embassy Track and the University Track (UIC), each with "…which a May 2027 IB candidate cannot supply, whatever their passport." `/destinations/kr/` leads with "No May 2027 IB candidate can use the 2027 Global Korea Scholarship, on either track… Plan for 2028." | ✓ |
| 3 | Shared SU label | Foreign pages: "Danish SU, if you can claim it (Danish citizens, or EU/EEA citizens with equal status under EU rules) and meet the ties-to-Denmark requirement." `/denmark/`: "…five years living in Denmark or your own job." No "living here" on any foreign page. | ✓ (the prose is still a fragment; see Prose) |
| 4 | Klip | FAQ: "Either way it uses SU klip, within an overall frame of 70…". Norway: "It uses SU-klip, within the 70-klip frame…". The FAQ now leads with "Often, yes — but which grant depends on your passport." | ✓ |
| 5 | Hungary | "closed to EU citizens … (Ukraine, among other non-EU countries, is)"; "Unless it is, plan to be self-funded"; the tagline is now "usually paid for yourself" | ✓ |
| 6 | Displaced Ukrainians | `/denmark/` and `/denmark/money/` both carry the Act no. 324 line; the lede says "EU, EEA and Swiss citizens" | ✓ (but `/denmark/apply/` contradicts it; see Finding 2) |
| 7 | Guard hygiene | Fixtures for "not Danish-taught", "Since you are…", "Your home country, Denmark", and "home" plus a label; the allowlist reason for `/trust/` has been corrected | ✓ |
| 8 | Housekeeping | The MEXT reason ends "…each decides what it offers."; the Copenhagen note is no longer on every row. Reykjavik fee is ≈ €4,750. | ✓ |

## Findings, by reader

### The Polish student (named in the vision)

`/destinations/pl/` is written entirely to a *foreign* EU citizen. It never has
the "If you hold Polish citizenship…" line that Norway ("Unless you hold
Norwegian citizenship, Lånekassen…") and Germany ("German citizens who did not
take German…") have.

| What they read | Problem |
|---|---|
| "Poland's maintenance grant and student loan are closed to an EU student who is not working in Poland, under article 324(3)… Your funding has to come from outside Poland" (`data/countries/pl.json` L25) | **Wrong for a Polish citizen.** Art. 324 governs foreigners (*cudzoziemiec*); a Polish citizen has the ordinary right to both. |
| "Be clear about what you cannot get. Article 324(3) restricts … an EU student who simply arrives to study cannot claim either." (L553); "…which are otherwise closed to you" (`workRights`, L563) | Same, stated twice more as the reader's own situation. |
| "Karta Polaka is irrelevant to you. It requires Polish ancestry, and EU citizenship already gives you the identical fee exemption for Polish-taught study." (L29) | **Wrong on the law, for everyone.** Art. 324(3) pkt 2 lets a Karta Polaka holder (324(2) pkt 6) apply for *stypendium socjalne* and *kredyt studencki* with no worker condition. An EU citizen can apply for them only as a worker or permanent resident. So it is not "identical". It matters for any student of Polish descent without Polish citizenship, including many Ukrainian families. |
| "Every foreign candidate at Wroclaw Tech must sit a compulsory online maths-with-logic entrance exam" | The page never says whether a Polish citizen with a foreign IB is in the "foreigners" recruitment at all. **A gap, not verified here;** mark it as a gap. |

### The Ukrainian student (outside the EU/EEA, resident in Denmark)

| Page | What they read | Problem |
|---|---|---|
| `/denmark/apply/` "Non-EU applicants" (`src/pages/denmark.mjs` L334) | "If you are a fee-paying applicant — that is, not an EU, EEA or Swiss citizen — the rules are harsher… Aarhus requires your documentation by 15 March and will not accept you at all if you sit the IB in the year you apply." | **Wrong for them.** It equates fee-paying with non-EU citizenship. The money page exempts Special Act permit holders and permanent residents. Aarhus's own wording is "if you are a *paying* applicant, then you cannot apply if you earn your IB exam in the year of application", and its documentation deadline is for "non-EU applicants *without a Danish residence permit*". A Ukrainian at this school reads that Aarhus is closed to them. It is not. |
| `/destinations/pl/` | "Karta Polaka is irrelevant to you" | See above. For a Ukrainian family of Polish descent it is the single most useful fact about Poland. |
| `/planner/` fee status | "Outside the EU/EEA" is the only option | There is no way to say "non-EU, but exempt from Danish tuition (permanent residence or a Special Act permit)". Low priority; flag it for the next pass. |

### The Norwegian (and Swedish, Finnish) student

- `/destinations/no/`, `/destinations/fi/` and `/destinations/is/` now read
  correctly for them, and the planner's Nordic option works.
- **`/denmark/money/`, "The order you have to do things in", has the mirror
  image of round-1 fix 1.**
  - "If you already live in Denmark you will usually have a registration
    certificate… If you are arriving, EU and EEA citizens get an EU
    registration certificate from SIRI within three months."
  - A Nordic citizen has no registration certificate and never needs one.
    lifeindenmark.borger.dk: "if you are a citizen of a Nordic country…You do
    not need an EU residence document."
  - It needs one conditional sentence (`src/pages/denmark.mjs` L707).
- **`/destinations/au/` health cover:** "Denmark has no reciprocal healthcare
  agreement that replaces OSHC for students."
  - That frames the rule by the school's country. The exemption is by
    nationality and national insurance, and the official Australian page says
    "Some exemptions to the requirement to purchase OSHC may apply if you are
    a student from Sweden, Norway, or Belgium."
  - The Norwegians and Swedes at this school should be told to check
    (`data/countries/au.json` L149, `data/destinations/au.json` L108).

### The German student

- The pages read correctly for them: the Netherlands, Austria, Ireland and
  Spain all say "As an EU citizen…".
- `/destinations/de/` still offers BAföG only as "open to some EU citizens…".
  For a German citizen, BAföG, and Auslands-BAföG for a full degree in another
  EU country, is their own system. The "your own country's student finance"
  pointer covers it generically. It is still low priority, but it is now the
  only named-nationality page besides Poland without its own-citizen line.

### The Czech student

- `/destinations/cz/` reads correctly for them: "As an EU citizen living in
  Denmark you have the longer one"; "studying in Czech is free for everyone".
- The page twice sets the IB against "a Danish studentereksamen", as if the
  reader's alternative were a Danish school certificate. That is harmless, but
  it is written for the Danish fifth.

### The Danish student

- Nothing is lost. MEXT, GKS and the SU text are all labelled "If you hold
  Danish citizenship…".

### Remaining "you are Danish (or at a Danish school)" lines

1. `data/countries/pl.json` L20, a "Why it might suit you" reason: "The
   Jagiellonian School of Medicine in English has an explicit Denmark rule: a
   Danish English grade of 7 satisfies its English requirement."
   - That rule is for a Danish school-leaving certificate, not an IB Diploma.
     It is not a reason Poland suits an IB student of any nationality.
   - Move it to the detail, or replace it with what the Jagiellonian accepts
     from the IB.
2. `data/countries/au.json` L29: "…most students go home once a year at most."
   This assumes Denmark is home. Write "fly back once a year".
3. `/destinations/pl/` funding note: "Danish tuition support is decided in
   Denmark too, at su.dk and ufm.dk". There is no Danish tuition support for
   Poland. It reads like a mistranslation of *uddannelsesstøtte*. Cut it.

### Other facts wrong for every reader (found while reading)

- **FAQ, "How many places can I apply to?"** (`src/pages/meta.mjs` L249):
  - It says: "The Netherlands: two if either is numerus fixus."
  - Studielink allows 4 programmes, of which at most 2 are numerus fixus
    (UT FAQ: "a maximum of 4 different programmes in total… a maximum of 2
    Numerus Fixus programmes").
  - The FAQ sentence reads as a cap of two in total.
- **FAQ, "Is it really free?"** (L235) says "Czechia and Poland are free only
  for programmes taught in the local language". The Poland page, correctly,
  says several University of Warsaw English-taught bachelor's are free for EU
  citizens. The two pages contradict each other.
- **Vilnius:** the 2027 dates are now published. admissions.vu.lt: "our next
  major admissions round for the 2027/2028 academic year, which opens on
  1 December 2026", with 1 May (non-EU/EFTA) and 1 July (EU/EFTA and
  visa-free).
  - `/timeline/` still says "The 2027 dates were not published… so no date is
    recorded here."
  - This is freshness, not audience. The "visa-free" clause also puts
    Ukrainians in the July group.

## Guard test: fresh phrasings

I ran these through `problemsIn` with the live config (adjective Danish, groups
[Nordic], grants [SU]):

| Phrase | Caught? |
|---|---|
| "Being Danish, you pay nothing in Denmark." | **no** |
| "As a citizen of Denmark you skip Migri." | **no**: `identity` needs the adjective |
| "With Danish citizenship you pay no tuition and need no permit." | **no** |
| "Like most of your classmates, you hold a Danish passport, so no visa is needed." | **no**: `documents` needs "your/with a/bring a" |
| "Your parents' Danish salaries count in the means test." | **no** |
| "Being a Nordic citizen, you skip Migri entirely." | **no**: `group-identity` needs "as a…" or "you are a…" |
| "Nordic citizens like you do not register with the police." | **no** |
| "You and your Danish classmates apply through optagelse.dk." | **no** |
| "You are Nordic, so you skip Migri." | **no**: needs "a Nordic citizen" |
| "As Danish citizens, you and your friends pay nothing." | **no**: plural |
| "Moving abroad means leaving home in Denmark for the first time." | **no** |
| "Denmark's SU follows you abroad." | yes (`grant`) |

That is 11 of 12 missed.
- The live text is clean, so this does not cost points on its own.
- It does show that the guard stops the exact regressions it was shown, not
  the pattern behind them.
- Cheap additions, all built from the same data:
  - `being (?:an? )?{A|group}`;
  - `(?:a )?citizen of {N}`;
  - `with {A} citizenship` unless preceded by if/unless;
  - `{A|group} citizens like you`;
  - `{A} classmates|friends`;
  - `\bgo(?:ing)? home\b`.
- **The structural gap is the one behind Finding 1.** The guard has no notion
  that the reader may be a citizen of the *destination*. It cannot, from
  regexes.
- A data rule would work instead. For every Destination whose nationals are
  plausible readers (EU/EEA), require one field saying what differs for its
  own citizens, even "nothing". `no` and `de` already have one; `pl`, `se` and
  `cz` do not.
- The guard's code still names no country. **Pass.**

## Prose

1. **The SU line on about 35 pages is still a fragment:** "Danish SU, if you
   can claim it (Danish citizens, or EU/EEA citizens with equal status under
   EU rules) and meet the ties-to-Denmark requirement." It has no verb. Try
   "Danish SU can follow you here if you can claim it (…) and meet the
   ties-to-Denmark requirement."
2. **Finland residency** names the Nordic list twice in one paragraph: "If you
   are a Nordic citizen (Danish, Icelandic, Norwegian or Swedish)… it is the
   correct route for any Danish, Icelandic, Norwegian or Swedish citizen."
3. **Finland "Why it might suit you"** now ends "Other EU/EEA citizens register
   their EU right of residence with Migri as well". Registering with Migri is
   not a reason Finland suits anyone, and "as well" is ambiguous. Keep the
   Nordic line there and put the Migri step in the steps only.
4. **Czech London sitting:** "One of the two dated overseas sittings nearest
   Denmark, with Berlin on 13 July 2027. It falls four days before IB results
   are released on 6 July." The reader has to work out that "it" is London on
   2 July.
5. **Poland:** "Karta Polaka is irrelevant to you." This is also a tone
   problem. It is the only flat dismissal addressed to the reader on the site.

## Verified facts (none checked in round 1)

All read on 2026-09-24/25.

| # | Fact as the site states it | Source | Quote | Result |
|---|---|---|---|---|
| 1 | SU 2026, higher education, living away: DKK 7,426/month before tax | [su.dk satser, udeboende](https://www.su.dk/satser/videregaaende-uddannelser-satser-for-su-til-udeboende) | "Satsen for udeboende på videregående uddannelser er 7.426 kr. pr. måned før skat i 2026." | ✓ |
| 2 | SU reform: from Jan 2027, for those starting on or after 1 July 2025; frame 70 → 58 | [su.dk, SU-reform](https://www.su.dk/su-reform) | "gælder for SU for januar 2027 og frem for studerende, der er begyndt… den 1. juli 2025 eller senere"; "12 færre SU-klip… (70-58=12)" | ✓ |
| 3 | SIRI study permit fee DKK 3,060; funds DKK 7,426/month | [nyidanmark, higher education](https://www.nyidanmark.dk/en-GB/Applying/Study/Higher%20education) | "Processing fee DKK 3,060"; "DKK 7,426 (2026 level) per month" | ✓ |
| 4 | NL statutory fee 2026/27: €2,694, EU/EEA | [DUO, tuition fees](https://duo.nl/particulier/tuition-fees.jsp) | "In the 2026-2027 academic year, the statutory tuition fees are €2.694,-." | ✓ |
| 5 | NL: "two if either is numerus fixus" (FAQ) | [UT, FAQ Studielink](https://www.utwente.nl/en/education/bachelor/how-to-apply/faq-studielink/) | "a maximum of 4 different programmes in total… a maximum of 2 Numerus Fixus programmes" | **✗ misleading** |
| 6 | Aarhus: a non-EU citizen cannot apply in their IB year | [AU, IB page](https://bachelor.au.dk/en/international-applicants/moreinfo/international-baccalaureate-ib); [AU, deadlines](https://bachelor.au.dk/en/international-applicants/deadlines-important-dates) | "if you are a paying applicant, then you cannot apply if you earn your IB exam in the year of application"; "…for non-EU applicants without a Danish residence permit" | **✗ scoped too widely**: the rule is for paying applicants, not non-EU citizens |
| 7 | Poland: grant and loan closed to an EU student who does not work; Karta Polaka gives nothing extra | [Art. 324, Higher Education Act](https://arslege.pl/zwolnienia-cudzoziemcow-z-oplat-za-studia/k1741/a117335/) | "O stypendium socjalne… i o kredyt studencki… może ubiegać się cudzoziemiec, o którym mowa w ust. 2: 1) pkt 1 i 1a: a) będący… pracownikiem… 2) pkt 2–8." pkt 6: "posiadacza Karty Polaka" | ✓ for foreign EU students. **✗ for Polish citizens** (not *cudzoziemcy*) **and for Karta Polaka** (grant and loan open, no worker test) |
| 8 | Norway: Maths AA SL counts as R1+R2; AI SL only as S1+S2 (FAQ) | [Samordna opptak, IB special requirements](https://www.samordnaopptak.no/universitet-og-hogskole/utdanning-fra-utlandet/land/ib/dekke-spesielle-opptakskrav.html) | AA SL and HL, and AI HL, cover R1+R2; AI SL covers S1+S2 | ✓ |
| 9 | Australia: UAC converts IB 24 to 64.60 for candidates sitting outside Australia | [UAC, IB applicants](https://www.uac.edu.au/future-applicants/admission-criteria/ib-applicants) | Combined Rank "based on your whole number overall score out of 45"; 24 → 64.60 | ✓ |
| 10 | Australia: OSHC is compulsory, and Denmark has no agreement | [privatehealth.gov.au, OSHC](https://privatehealth.gov.au/health_insurance/overseas/overseas_student_health_cover.htm) | "Some exemptions to the requirement to purchase OSHC may apply if you are a student from Sweden, Norway, or Belgium." | ✓ as stated. **Omission for the Norwegian and Swedish readers.** |
| 11 | Ireland: student contribution €2,500 from 2026/27 | Citizens Information returned 403. [Citizens Information, Budget 2026](https://www.citizensinformation.ie/en/money-and-tax/budgets/budget-2026/) and [University Times](https://universitytimes.ie/2025/10/budget-2026-permanent-500-euro-fee-decrease-confirmed/) via search | a permanent €500 cut; maximum €2,500 | ✓ (secondary) |
| 12 | Vilnius: 1 May non-EU, 1 July EU/EFTA and visa-free; "2027 dates not published" | [VU admissions](https://admissions.vu.lt/) | "our next major admissions round for the 2027/2028 academic year, which opens on 1 December 2026" | ✓ for the split. **Now published; the timeline is stale.** |
| 13 | Stipendium Hungaricum: no EU partner; European partners include Ukraine | [SH partners](https://stipendiumhungaricum.hu/partners/) | Albania, Armenia, Azerbaijan, Belarus, … Russia, Serbia, Ukraine, Türkiye | ✓ (the site's list omits Azerbaijan, which does not matter) |
| 14 | Denmark: a Nordic citizen does not need a registration certificate | [lifeindenmark, when you arrive](https://lifeindenmark.borger.dk/theme/when-you-arrive) | "if you are a citizen of a Nordic country… You do not need an EU residence document." | **The money page implies they do** |

Not verified today:
- the IB's official 2027 results date. The site's "6 July" matches the
  pattern, and `/destinations/au/` correctly says it is "not yet confirmed by
  the IB for 2027";
- whether a Polish citizen with a foreign IB applies in the foreigners'
  recruitment at Wroclaw Tech.

## Top fixes, ranked

1. **Poland: write for the Polish citizen too, and fix Karta Polaka.**
   Files: `data/countries/pl.json` L25, L29, L553, L563, and the destination
   summary if it repeats this.
   - Add one labelled line: "If you hold Polish citizenship, none of the
     foreigner rules on this page apply to you: Polish-taught study is free,
     and the maintenance grant and loan are open to you on the ordinary
     terms."
   - Make the three "closed to you" lines say "closed to a non-Polish EU
     citizen who is not working in Poland".
   - Replace L29 with: "If you have Polish ancestry but not Polish
     citizenship, Karta Polaka is worth having: it opens the maintenance grant
     and the student loan, which EU citizenship alone does not (art. 324(3)
     pkt 2)."
   - Mark the Wroclaw "foreign candidate" question as a gap for Polish
     citizens.
2. **`/denmark/apply/`: define the harsher group by fee liability and
   residence, not citizenship.** File: `src/pages/denmark.mjs` L334.
   - Suggested: "If you will pay tuition — that is, you are not an EU, EEA or
     Swiss citizen and hold no permit that exempts you (see Money) — the rules
     are harsher… Aarhus: 'if you are a paying applicant, then you cannot apply
     if you earn your IB exam in the year of application'."
   - Cite AU's "without a Danish residence permit" wording.
   - `data/dk/au.json` L37 already quotes AU correctly; only the page
     generalises it.
3. **Nordic readers, in two places.**
   - `src/pages/denmark.mjs` L707: "If you are a Nordic citizen you need no
     registration certificate: you register directly for a CPR number at
     Citizen Service."
   - `data/countries/au.json` L149 and `data/destinations/au.json` L108: "If
     you are a Norwegian or Swedish citizen covered by your own country's
     scheme, you may be exempt from OSHC: check with Home Affairs."
4. **FAQ corrections** in `src/pages/meta.mjs`:
   - L249: "The Netherlands: four, of which at most two numerus fixus (one for
     medicine)."
   - L235: "Czechia is free only in Czech; in Poland Polish-taught study is
     free and some English-taught programmes are too."
5. **Strip the Danish-school framing from the Poland "why" list.**
   - `data/countries/pl.json` L20 (the Jagiellonian "Danish English grade of
     7"): move it to the detail, or restate it as what the Jagiellonian
     accepts from IB English.
   - Cut "Danish tuition support is decided in Denmark too" (pl.json funding
     note).
   - `au.json` L29: "go home" → "fly back".
6. **Guard.**
   - Add the cheap patterns listed under the guard test (`being …`,
     `citizen of {N}`, `with {A} citizenship`, `{group} citizens like you`,
     `go home`) to `scripts/lib/audience.mjs`, with fixtures.
   - Add a data-level check to `scripts/test-audience.mjs`: every EU/EEA
     Destination record states what differs for its own citizens. Poland would
     have failed it.
7. **Prose and freshness.**
   - Give the SU line a verb (`data/funding/dk-su.json` `abroad.label`).
   - De-duplicate the Finland residency list and move the Migri sentence out
     of "why" (`data/countries/fi.json`).
   - Fix the Czech London "it".
   - Record the Vilnius 2027/28 dates now that VU has published them.
