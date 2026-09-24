# Audience rewrite: critique, round 1

Critic: a fresh agent, playing the **university counsellor** at an IB school in
Denmark. About a fifth of my students are Danish. The rest are German, Czech,
Norwegian, Swedish, Polish, Ukrainian and others. I judged the rewrite against
`docs/PRODUCT_VISION.md` ("Who it is for") and the critic-loop brief
(`docs/QA_CRITIC_LOOP.md`). The test is simple: would I repeat this page to a
student in a meeting?

Date: 2026-09-24. Build: `node src/build.mjs` (SITE_BASE unset), 152 pages.

**SCORE: 6 / 10.**

## Verdict

The rewrite is real work, and most of it is good:
- The home page door now reads "Where you already are".
- The Denmark hub and money page put the parent route and the five-year route
  to SU equal status first. They are the right routes for this school, and I
  checked them on su.dk.
- The planner offers a Nordic option, and group containment is declared in data.
- MEXT is `conditional` on nationality.
- The Iceland deadline is handled carefully.
- The guard catches the obvious regressions, and its code names no country.

It is not ready to ship, for three reasons.

**1. Nordic rules are still stated as the reader's own situation.** The plan
ranked this pattern its **#1 most misleading** item (Finland/Migri). It was
fixed in one field. The same shape survives in two more places in Finland, in
three in Norway and in two in Iceland. On the Norway page it now tells my
German, Czech and Polish students the wrong admin step:

> "No residence permit needed, and as a Nordic citizen you do not register with the police either."

A German student staying more than three months must register with the police
(UiO: "Students with EU/EEA citizenship need to register with the Oslo Police
within 3 months").

**2. A factual error in Korea that the rewrite reinforced.** The page says that
"for Danish citizens, only the University Track's UIC Program is open". The
calendar also lists the 2027 University Track (closing 30 November 2026) as
"open to every nationality". But the GKS 2027 graduation rule sits in the
guidelines' general eligibility section. It applies to every track, so no
May 2027 candidate can use UIC 2027 either.

**3. The shared SU record drops half of its own rule.** Its `label` is rendered
on about 35 destination pages, and it:
- omits "under EU rules" and the ties-to-Denmark requirement (the Nordic pages
  and Switzerland carry neither in their note);
- says "five years living **here**" on pages about Finland, Japan and the rest.

Beyond those three:
- The FAQ contradicts the Norway page on whether Nordic study uses SU klip.
- One allowlist reason is false.
- The school's non-EU students, notably displaced Ukrainians, are told things
  that are wrong for them. The vision's default reader is EU/EEA, but Ukrainian
  students are in the brief.

These are one wrong admin step, one wrong scholarship window and a drifted
shared rule. Any one of them fails the counsellor's test. Most fixes are small
and mechanical, and a second round should reach 8.

## Gate and build

- `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs`: the
  **`audience` check passes**, along with `validate`, `calendar`, `build` and
  the rest.
- Two checks fail:
  - `image-records`: the photo agent's work, not in scope.
  - `release`: "The README quotes the wrong number of eligibility scenarios. It
    says 103; the engine runs 104." Phase 2a set README to 103, and a later
    change (probably the Danish-level→IB conversion agent) added one scenario.
    Not the audience work's fault, but the gate is red until README.md L113
    and L191 say 104.
- Non-blocking warning, relevant to audience: "2 general page(s) state a Danish
  mechanism without saying so — prepare 'quota 2'; timeline 'optagelse.dk'".
  On `/prepare/` the quota-2 lines are mostly prefixed "Danish" or "Denmark's".
  Acceptable.
- `node scripts/test-audience.mjs --report`: 73,675 strings, 0 hits.

## Findings, by reader

### The German student (EU, not Nordic)

| Page | What they read | Problem |
|---|---|---|
| `/destinations/no/` (3 places) | "As a Nordic citizen you do not register with the police." / "No residence permit needed, and as a Nordic citizen you do not register with the police either." | **Wrong for them.** It is written as the reader's own case ("As a …, you"), and it never says what EU/EEA citizens do. They must register with the police within 3 months (UiO). Source: `data/countries/no.json` L167 (steps) and L212 (`residency`). |
| `/destinations/fi/` "Why it might suit you" | "As a Nordic citizen you skip Migri entirely and just register your details with the population agency (dvv.fi)." | Offered as a reason Finland suits *them*. They must apply for EU registration at Migri. `data/countries/fi.json` L19. |
| `/destinations/fi/` steps | "After you arrive, register … at dvv.fi. As a Nordic citizen you do not deal with Migri at all." | This is the step list, the thing a student follows, and it has no EU/EEA step. `data/countries/fi.json` L171. Only `residency` (L220) was fixed. |
| `/destinations/de/` | "BAfoeg … is open to some EU citizens …; it is not automatic for a newly arrived EU student." | For a German citizen, BAföG *is* their own-country student finance. The page is otherwise careful ("German citizens who did not take German…"), so a one-line "If you hold German citizenship…" would complete it. Low priority. |
| every destination, funding | "Danish SU, if you can claim it — …, or five years living here" | "here" means the destination on that page. |

### The Czech student

| Page | What they read | Problem |
|---|---|---|
| `/destinations/is/` residency | "As a Nordic citizen you have a separate, simpler track with Registers Iceland … rather than the Directorate of Immigration." | Addressed to them as if Nordic, with no line on what EU/EEA citizens do. `data/countries/is.json` L170. |
| `/destinations/hu/` watch-outs | "…Hungary's bilateral state scholarships list 30 countries and Denmark is not one of them. **You are self-funded.**" | The summary was fixed ("check whether your country is"), but this watch-out still ends with an unconditional verdict. The page itself says Norway, Sweden, Finland and Iceland *are* on the list. `data/countries/hu.json` L22. |
| `/europe/` Hungary tagline | "Medicine in English — but you pay for all of it yourself" | The same verdict at the door. Softer, but it contradicts "check whether your country is". |
| `/destinations/kr/` | "on another passport, check whether your country is one of the 74" | The Czech Republic *is* on the 2027 list, so this invites them to plan for the 2027 Embassy Track. Only the *next* bullet says a May 2027 candidate is ineligible for the 2027 round anyway. The graduation rule should lead. `data/countries/kr.json` L26, L143; `data/destinations/kr.json` L29, L77. |
| `/destinations/kr/` calendar | "University Track application, 2027 GKS-U … Via Global Korea Scholarship, University Track — open to every nationality" (30 Nov 2026) | **Wrong for every reader.** The 31 December 2026 graduation rule is in section II "Eligibility", not in the Embassy Track section. `data/application-routes/kr-gks-university-2027.json` has no `readerAccess` and needs `closed` with the same reason as the Embassy Track. |

### The Norwegian student (Nordic)

- **Finland, Iceland and Sweden read well for them:** the Nordic option in the
  planner, the Menntasjóður note ("if you are a Danish, Finnish, Norwegian or
  Swedish citizen"), and the Iceland 5 June caveat.
- **`/destinations/no/`** is their own country. "Unless you hold Norwegian
  citizenship, Lånekassen is realistically closed…" is correctly labelled.
  Good.
- **FAQ vs Norway page, contradicting each other.**
  - The FAQ (`src/pages/meta.mjs` L214) says Nordic study "does not consume
    your Danish higher-education klippekort".
  - The Norway funding note (`data/countries/no.json` L206) says "It draws on
    the same SU-klip as a Danish degree".
  - One of them is wrong. Settle it on su.dk (the SU-abroad pages returned 404
    today) and state it once, in `data/funding/dk-su.json` `abroad.duration`.
- **`/destinations/no/` context note** (`data/context-notes/no-language-is-the-obstacle.json`):
  "…a Danish speaker reads Norwegian from the first day. **Doing so** turns
  Norway from a handful of English-taught programmes into an entire national
  system… A student who **will not** is choosing…". The antecedent of "doing
  so" was lost, and "will not" refers to nothing. The problem predates the
  rewrite, but it is the most-read paragraph on the page.

### The Ukrainian student (outside the EU/EEA; not the vision's default reader, but in the brief)

- **`/denmark/` and `/denmark/money/`** say tuition is "Nothing for EU, EEA and
  Swiss citizens. Everyone else pays roughly €6,000–16,000". The only exception
  named is "a temporary permit that can lead to" permanent residence.
  - Holders of a residence permit under the Special Act for displaced persons
    from Ukraine (Act no. 324 of 16 March 2022) are exempt from tuition. The
    University of Copenhagen's fee page lists that permit as an exemption from
    both the deposit and tuition.
  - For this school that is a material omission. It needs one labelled line
    ("If you hold a residence permit under the Special Act for displaced
    persons from Ukraine, you pay no tuition").
- **`/destinations/hu/`**: "Stipendium Hungaricum is closed to you."
  - Ukraine **is** a Stipendium Hungaricum sending partner.
  - The statement is true for EU citizens, and it should say that: "closed to
    EU citizens (Ukraine, among other non-EU countries, is a partner)".
    `data/countries/hu.json` L22, L292.
- The SU equal-status list covers EU routes only.
  - su.dk also has Danish-rules routes, for example "came to Denmark together
    with your parents". These give SU in Denmark only.
  - The money page mentions them in one sentence. That is adequate. Flag it
    for the next pass, not this one.

### The Danish student

- Their facts are labelled and still present: "If you are a Danish citizen you
  simply apply through minSU", the MEXT Copenhagen note and the GKS Danish list.
  They lose nothing.
- On Japan the Copenhagen note is repeated on every calendar row:
  - It appears 6 times on `/timeline/` and 5 times on `/destinations/jp/`, as
    the tail of the `readerAccess.reason`.
  - That makes the Danish fifth the loudest voice on the MEXT rows.
  - Suggestion: end the reason at "…each decides what it offers." and keep the
    Copenhagen fact once in the watch-outs.

### Nordic vs EU/EEA: the pattern the guard does not see

`grep "As a Nordic citizen"` over `dist/` gives 9 rendered lines on 3 pages.
Of those, only `fi.json residency` also says what other EU/EEA citizens do.
The audience guard builds its patterns only from the school-country adjective,
so "As a Nordic citizen you …" passes. See Top fix 1 for a data-driven rule.

## Guard test (step 4)

I ran each phrase through `scripts/lib/audience.mjs` with the live config
(`problemsIn`):

| Phrase | Caught? |
|---|---|
| "As a Danish citizen you do not apply to Migri." | yes (`identity`) |
| "Free, close to home." / "Cheap and close to home for most students." | yes (`home`) |
| "a Danish family on a normal income" / "Your family's Danish income counts." | yes (`family`) |
| "As a Dane you skip the queue." | yes (`people`) |
| "Danish students pay international fees." / "A Danish student pays no fees." | yes (`reader-noun`) |
| "Danish SU follows you abroad." / "SU follows you abroad for the whole degree." | yes (`grant`) |
| "This route is closed to Danish citizens." | yes (`nationality-closure`) |
| "As a Danish citizen you do not apply to Migri, and the course is **not Danish-taught**." | **no**: the label `(?:without\|not\|non-)\s?{A}\b` matches "not Danish-taught" |
| "Since you are Danish, you pay home fees." / "You are Danish, so you pay nothing." | **no** |
| "Danish nationals do not need a visa, so you can just go." | **no** |
| "Your home country, Denmark, pays SU." | **no** |
| "close to home — and equal status if you have it" | **no**: any label (here "equal status") excuses an A rule in the same sentence, including `home`, where a label is meaningless |
| "As a Nordic citizen you skip Migri entirely." | **no** (see above) |

- **Does the code name the country?** No. A grep of `scripts/test-audience.mjs`
  and `scripts/lib/audience.mjs` for Danish/Denmark/Dane/dk finds nothing, and
  the guard's own last check enforces it. Fixtures use Flatland. **Pass.**
- **Is the allowlist honest?** Nine of ten entries are. The tenth is not:
  - `src/lib/publication-floor.mjs` "Telling a Danish student about" says "A
    developer-facing explanation … never rendered to students".
  - It **is** rendered, on `/trust/`: "Telling a Danish student about
    "colleges", or a French student about "professional bachelors", describes
    nothing they can recognise".
  - The sentence is harmless (a Danish student is one example among others),
    so the entry can stay, but its reason must say what is true.

## Prose (step 5)

Most rewritten lines read naturally. The Denmark money page's three routes are
the best writing in the set. These lines are clunky or legalistic:

1. **The SU label on ~35 pages** (`data/funding/dk-su.json` `label`): "Danish
   SU, if you can claim it — Danish citizens, and EU/EEA citizens with equal
   status (for example through a parent who works in Denmark, or five years
   living here)." It is long, it has a nested parenthesis, and "here" is wrong
   on foreign pages.
2. **Finland, Iceland, Norway, UAE, Singapore, Japan, Korea "why/watch" items:**
   "if you can claim SU (Danish citizens, or EU/EEA citizens with equal status,
   **and in both cases the ties-to-Denmark requirement**) you get…". Legalistic;
   the parenthesis interrupts the promise.
3. **The FAQ, "Will my student grant follow me abroad?"**: "…Citizenship alone
   is not enough. **If you qualify, usually yes** — for a complete degree
   abroad…". The old answer's "usually yes" now dangles after two sentences of
   conditions.
4. **Money page:** "**One of seven ties to Denmark, for example** two years'
   continuous residence…" is a sentence fragment (`dk-su.json`
   `abroad.ties`). Also "the rate for **a student** … living away from **your**
   parents" mixes persons.
5. **Finland:** "If you can claim SU (…) you get SU… **If you are not Danish,**
   check your own country's student finance first". It has just said non-Danes
   with equal status can claim, so this should read "If you cannot claim SU…",
   as the shared `otherwise` does.
6. **`/denmark/money/` subtitle:** "Tuition is free for EU citizens." The body
   correctly says EU, EEA and Swiss.

## Verified facts (step 3)

All read on 2026-09-24.

| # | Fact as the site states it | Source | Quote | Result |
|---|---|---|---|---|
| 1 | Equal status through a parent working in Denmark; moved before 21; kept if the parent leaves while you stay | [su.dk, child of EU/EEA worker](https://www.su.dk/foreign-citizen/gb-foreign-citizen/eu-rules/you-are-the-child-of-an-eu/eea-citizen-who-is-a-worker-in-denmark-under-eu-law) | "You must have moved to Denmark before the age of 21"; "You retain this right as long as you remain in Denmark even though your parent has left Denmark" | ✓ |
| 2 | Five years' residence, EU/EEA/Swiss, absences up to 6 months a year | [su.dk, resided 5 years](https://www.su.dk/foreign-citizen/gb-foreign-citizen/eu-rules/you-have-resided-in-denmark-for-at-least-5-years) | "shorter stays outside of Denmark that do not exceed a total of 6 months a year" | ✓ |
| 3 | Equal status under EU rules covers SU in Denmark and abroad | [su.dk, EU rules](https://www.su.dk/foreign-citizen/gb-foreign-citizen/eu-rules) | "apply for SU for a study programme in Denmark and abroad" | ✓ |
| 4 | Equal status under Danish rules: Denmark only | [su.dk, Danish rules](https://www.su.dk/foreign-citizen/gb-foreign-citizen/danish-rules) | "you cannot receive SU for a whole study programme abroad" | ✓ |
| 5 | MEXT first screening is in the country of nationality | [MEXT 2027 Undergraduate Guidelines](https://www.studyinjapan.go.jp/en/_mt/2026/04/2027_Guidelines_Undergraduate_E.pdf), p. 3, 5(1) | "The First Screening must be conducted at the Japanese diplomatic mission in the country whose citizenship the applicant chooses." | ✓ |
| 6 | GKS 2027: graduation certified by 31 Dec 2026 | [GKS-U 2027 guidelines (NIIED PDF)](https://www.studyinkorea.go.kr/cmm/fms/FileDown.do?atchFileId=FILE_000000000673717&fileSn=1), §II Eligibility | "must submit a graduation certificate … by December 31, 2026" | ✓ for Embassy Track. **The rule is general, so the University Track (UIC) 2027 is closed too. The site shows it open.** |
| 7 | Embassy Track countries: Denmark not; Sweden yes | same PDF, country table | Sweden, Czech Republic, Poland, Bulgaria and Ukraine appear; Denmark, Germany and Norway do not | ✓ (relevant to 4 of my nationalities) |
| 8 | Finland: Nordic citizens skip Migri; others register with Migri | [Migri, EU citizen](https://migri.fi/en/eu-citizen) | "Nordic citizens do not need to apply for EU registration at the Finnish Immigration Service" | ✓. The unconditional "As a Nordic citizen you…" lines mislead. |
| 9 | Norway: Nordic citizens do not register with the police | [UiO, police registration EU/EEA](https://www.uio.no/english/studies/international-students/policeregistration-eu.html) | "Students with EU/EEA citizenship need to register with the Oslo Police within 3 months" / "Nordic citizens do not have to register" | ✓ for Nordics. **The site never tells EU/EEA readers to register.** |
| 10 | Iceland: 5 June for Nordic citizens, 1 Feb for international | [HÍ, application deadline](https://english.hi.is/study/apply/application-deadline) | "Icelandic and Nordic citizens … 5 June"; international "1 February" | ✓. The site's conservative "work to 1 February" is defensible given the FAQ conflict it cites. |
| 11 | Stipendium Hungaricum: no EU member state is a partner | [SH partners](https://stipendiumhungaricum.hu/partners/) | European partners: Albania … Serbia, **Ukraine** | ✓ for EU. **Open to Ukrainian nationals.** |
| 12 | UZH: 30 April ordinary; 28 Feb with visa; July only for Swiss qualifications | [UZH deadlines](https://www.uzh.ch/en/studies/application/deadlines.html) | "1 January until 30 April"; "1 January until 28 February"; "1 May until 31 July" (Swiss qualifications) | ✓ |
| 13 | Swiss: EU/EFTA students get permit B, register with the commune | [SEM FAQ, EU/EFTA](https://www.sem.admin.ch/sem/en/home/themen/fza_schweiz-eu-efta/eu-efta_buerger_schweiz/faq.html) | "Students are issued this permit for one year and are granted yearly renewals"; registration within 14 days | ✓. The site says "within the period they specify"; it could say 14 days. |
| 14 | ECB rates of 24 Sep 2026 | [ECB reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) | USD 1.1367, JPY 180.57, DKK 7.4756, NOK 10.7895, CHF 0.9409, KRW 1555.69 | ✓. Spot-checked: NOK 15,488→€1,435 ✓; CHF 2,190→€2,330 ✓; USD 4,954→€4,360 ✓; SEK 10,656→€945 ✓. **Iceland: ISK 656,000 "about 4,726 euros" implies 138.8; at 138.00 it is €4,754** (`data/countries/is.json` tuition). |
| 15 | Tuition in Denmark: "Everyone else pays" | [KU, tuition fees](https://www.ku.dk/studies/masters/application-and-admission/tuition-fees) | Exempt if you "have been granted a residence permit under the Danish Act on Temporary Residence Permit for Displaced Persons from Ukraine; cf. Danish Act no. 324 of 16 March 2022" | **Omission.** It matters for this school. |

Not verifiable today: the su.dk SU-abroad and Nordic pages returned 404, so I
could not settle the klippekort contradiction.

## Top fixes, ranked

1. **Make every Nordic-only admin fact conditional, and give the EU/EEA line
   next to it.**
   - `data/countries/no.json` L167 and L212: "If you are a Nordic citizen, you
     do not register with the police. Other EU/EEA citizens staying more than
     three months register with the police (via UDI's portal) within three
     months."
   - `data/countries/fi.json` L19: move it out of "why it suits you", or make
     it "If you are a Nordic citizen…".
   - `data/countries/fi.json` L171: add "Other EU/EEA citizens apply for EU
     registration at Migri."
   - `data/countries/is.json` L170: add the EU/EEA route.
   - Then **extend the guard**: build a rule from `data/applicant-groups.json`
     that refuses "as a {group} citizen … you" for any group declared `within`
     the reader group, unless the sentence is conditional ("if you are…"). This
     names no country and would have caught all 9 lines.
2. **Close the 2027 GKS University Track** for May 2027 candidates.
   - Add `readerAccess: closed` to
     `data/application-routes/kr-gks-university-2027.json`, with the same
     graduation-date reason.
   - Rewrite `data/countries/kr.json` L26, L143, L183 and
     `data/destinations/kr.json` L29, L77 to lead with "No May 2027 IB
     candidate can use the 2027 round; plan for 2028", then the nationality
     test for 2028.
   - Pin it in `scripts/test-calendar.mjs`.
3. **Fix the shared SU label once**, in `data/funding/dk-su.json` `label`.
   - Replace "five years living here" with "five years living in Denmark".
   - Add the two missing conditions, briefly: "if you can claim it (Danish
     citizens, or EU/EEA citizens with equal status under EU rules) and meet
     the ties-to-Denmark requirement". That lets the notes in `fi`, `is`, `no`,
     `se` and `ch` stop restating it and fixes the drift in one place.
   - Also fix the fragment in `abroad.ties` and the "a student … your parents"
     person clash in `rate.basis`.
4. **Resolve the klippekort contradiction.**
   - Read su.dk (or ask the Agency).
   - Write the answer once in `dk-su.json` `abroad.duration`.
   - Remove the conflicting clause from `src/pages/meta.mjs` L214 or
     `data/countries/no.json` L206.
   - Rewrite the FAQ answer so "If you qualify, usually yes" is gone: lead with
     the answer, then the conditions.
5. **Hungary.**
   - `data/countries/hu.json` L22: drop "You are self-funded." or make it
     "Unless your country is on it, you are self-funded."
   - L22 and L292: "closed to EU citizens" instead of "closed to you", and add
     "(Ukraine is a partner country)".
   - Soften the tagline in the Hungary destination record.
6. **One labelled line for displaced Ukrainians on Danish tuition**, on
   `/denmark/` and `/denmark/money/` (`src/pages/denmark.mjs`, tuition
   paragraph). Cite Act no. 324 of 16 March 2022 (KU fee page as evidence).
7. **Guard hygiene.**
   - `scripts/lib/audience.mjs`: tighten the `not {A}` label to `not {A}
     citizens?|non-{A} citizens?`, so "not Danish-taught" no longer excuses.
   - Do not let labels excuse the `home` rule.
   - Add "you are {A}" to `identity`.
   - Correct the false reason on the `publication-floor.mjs` entry in
     `data/audience-allowlist.json`. It is rendered on `/trust/`.
8. **Housekeeping.**
   - Shorten the MEXT `readerAccess.reason` in
     `data/application-routes/jp-mext-embassy-2028.json` so the Copenhagen
     note is not repeated on every calendar row.
   - Recompute Reykjavik University's EUR figure in `data/countries/is.json`.
   - Update README.md scenario counts (103 → 104) so the `release` gate goes
     green.
