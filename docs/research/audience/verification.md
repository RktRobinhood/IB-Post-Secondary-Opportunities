# Audience correction — verifications (phase 2a)

Checked 2026-09-24 against official sources, recorded as each was read. Each
section ends with **What changes in the plan**.

## 1. Danish SU for EU/EEA citizens who are not Danish

Sources:
- [su.dk — Foreign citizen](https://www.su.dk/foreign-citizen/gb-foreign-citizen)
- [su.dk — EU rules](https://www.su.dk/foreign-citizen/gb-foreign-citizen/eu-rules), and its sub-pages [you work in Denmark](https://www.su.dk/foreign-citizen/gb-foreign-citizen/eu-rules/you-work-in-denmark), [you are the child of an EU/EEA citizen who is a worker in Denmark](https://www.su.dk/foreign-citizen/gb-foreign-citizen/eu-rules/you-are-the-child-of-an-eu/eea-citizen-who-is-a-worker-in-denmark-under-eu-law) and [you have resided in Denmark for at least 5 years](https://www.su.dk/foreign-citizen/gb-foreign-citizen/eu-rules/you-have-resided-in-denmark-for-at-least-5-years)
- [su.dk — Danish rules](https://www.su.dk/foreign-citizen/gb-foreign-citizen/danish-rules)
- [su.dk — Betingelser for at få SU … til en hel uddannelse i udlandet](https://www.su.dk/su-i-udlandet/su-til-en-hel-uddannelse-i-udlandet-/betingelser-for-at-faa-su-og-tillaeg-til-en-hel-uddannelse-i-udlandet)
- [su.dk — Krav om tilknytning … uddannelse i EU/EØS-land](https://www.su.dk/su-i-udlandet/su-til-en-hel-uddannelse-i-udlandet-/betingelser-for-at-faa-su-og-tillaeg-til-en-hel-uddannelse-i-udlandet/krav-om-tilknytning-til-danmark/krav-om-tilknytning-til-danmark-ved-ansoegning-om-su-til-uddannelse-i-eueoes-land-uden-for-danmark)

The pages show no date. They were read on 2026-09-24.

**Routes to equal status under EU rules**, for EU, EEA and Swiss citizens:

| Route | Conditions as su.dk states them |
|---|---|
| Your own work | "at least 10–12 hours per week", "for a continuous period of at least 10 weeks", and you must "continue working throughout the entire period you receive SU". |
| **Child of an EU/EEA worker in Denmark** | Your parent is "a worker or self-employed person in Denmark under EU law". You "must have moved to Denmark before the age of 21". Under 21 you must be dependent; over 21 you need "a genuine and effective need for being supported". It is "a derived right from your parent's status … you lose the right to SU if your parent loses his/her status", though you "retain this right as long as you remain in Denmark even though your parent has left Denmark". Documentation: the parent's employment contract and payslips. |
| Spouse, or parent, of an EU/EEA worker | Also listed. |
| **Five years' residence** | An "EU, EEA or Swiss citizen" with "the right of permanent residence" who has "resided in Denmark for a continuous period of at least 5 years". The folkeregister is the evidence. Absences totalling up to 6 months a year are disregarded, plus one absence of up to 12 months for weighty reasons. |
| A family member's five years' residence | Also listed. |

**Routes under Danish rules**: "came to Denmark together with your parents", 2 years' work, 5 years' residence, and others. These give SU **in Denmark only**. su.dk: "If you have been granted equal status according to Danish rules, you cannot receive SU for a whole study programme abroad."

**SU for a full degree abroad:**
- Equal status under EU rules "permits SU applications for studies in Denmark AND abroad". Equal status under Danish rules does not.
- Everyone, Danish citizens included, must also meet the **ties-to-Denmark requirement**. su.dk: Danish citizenship "is in itself not enough". The requirement is one of seven, including:
  1. two years' continuous residence in Denmark within the last 10 years;
  2. being a family member of an EU/EEA citizen who has worked in Denmark for 5+ years;
  3. "having gone to school in Denmark for a substantial period";
  4. family, economic or work ties, or a near-miss on these combined with substantial Danish.
- The programme must be SU-approved or on the Fast Track list.
- Degrees outside the EU/EEA require a separate ties form. The detailed page returned 404 on the day, so the rules for non-EU degrees are **not verified**.

**What changes in the plan:**
1. The copy said the realistic route for non-Danes was work of 10–12 hours a week. **For this readership, the parent route and the five-year route are the ones to lead with.** Most non-Danish students at an IB school in Denmark moved here with a parent who works here, and many have lived here five years. The Denmark pages and the glossary name all three routes, parent first.
2. **SU abroad is not "Danish citizens only"**, and it is not automatic for Danish citizens either. The correct label everywhere is: *"if you can claim Danish SU — Danish citizens and EU/EEA citizens with equal status under EU rules — and you meet the ties-to-Denmark requirement (for example two years living here in the last ten)"*. The reviewers' wording "EU/EEA citizens with sufficient ties to Denmark" is half right: it leaves out equal status, and it wrongly implies Danes are exempt.
3. The rule is written once, in the shared record `data/funding/dk-su.json` (see below). The ~50 destination funding lines in the busy files should reference it rather than restate it.

## 2. MEXT embassy-recommended undergraduate scholarship (Japan)

Source: [Application Guidelines, Japanese Government (MEXT) Scholarship for 2027 (Undergraduate Students) (Embassy Recommendation)](https://www.studyinjapan.go.jp/en/_mt/2026/04/2027_Guidelines_Undergraduate_E.pdf), pp. 2–3, read 2026-09-24.

- 5(1) Nationality: "Applicants must have the nationality of a country that has diplomatic relations with Japan … The First Screening must be conducted at the Japanese diplomatic mission in the country whose citizenship the applicant chooses."
- 3(2)①: the First Screening is "conducted at the Japanese Embassy or Consulate … in the country of the applicant's nationality".
- Academic background: 12 years of schooling completed by March 2027, or by August 2027 for autumn direct placement.

**What changes in the plan:** confirmed. **The embassy is chosen by nationality, not by where you live.** A German student in Denmark applies through the Japanese embassy in Germany, and what that embassy offers is that country's decision. The finding that the Copenhagen embassy offers Danish nationals no undergraduate call is true for Danish citizens only. `readerAccess` becomes `conditional`, with the reason "Depends on your nationality: you apply through the Japanese embassy in your country of citizenship, and each decides what it offers. The embassy in Copenhagen offers Danish nationals no undergraduate call." (The busy file `data/application-routes/jp-mext-embassy-2028.json` is phase 2b.)

## 3. Global Korea Scholarship, Embassy Track (Korea)

Sources:
- The repo's own evidence records `ev-kr-gks-2027-countries` and `ev-kr-gks-2027-eligibility` in `data/evidence/kr.json`, read by a researcher on 2026-09-23 from the 2027 GKS-U guidelines.
- The [Study in Korea notice of 2026-09-09](https://www.studyinkorea.go.kr/ko/plan/gksNoticeRead.do?bbsId=BBSMSTR_000000000461&nttId=4522). Its English PDF link returned 404 on 2026-09-24, so the full country table was not re-read.

Findings:
- "All applicants must hold citizenship of NIIED designated countries" — 74 countries, and Sweden is in the recorded excerpt. Denmark is not on the list. "UIC Program is open to all countries around the world."
- **Eligibility:** applicants "expected to graduate … must submit a graduation certificate … by December 31, 2026."

**What changes in the plan:** a correction to phase 1. **The 2027 Embassy Track is closed to *every* reader, whatever their nationality**, because a May 2027 IB candidate cannot graduate by 31 December 2026. So `kr-gks-embassy-2027` **stays `closed`**, but its reason should cite the graduation date, not Danish nationality. Nationality matters only from the 2028 round (a gap-year applicant), and there the label is "depends on your nationality — Denmark is not on the 2027 list; Sweden is; check yours". The full list of European countries remains unverified until the PDF is reachable.

## 4. Hungary: Stipendium Hungaricum and bilateral state scholarships

Sources:
- [Stipendium Hungaricum — partners](https://stipendiumhungaricum.hu/partners/), read 2026-09-24.
- [Tempus Public Foundation — Bilateral State Scholarships](https://en.tka.hu/bilateral_state_scholarships), read 2026-09-24. It gives no country list on the page.

Findings:
- **Stipendium Hungaricum:** the European partners are all outside the EU (Albania, Armenia, Azerbaijan, Belarus, Bosnia and Herzegovina, Georgia, Kosovo, Moldova, Montenegro, North Macedonia, Russia, Serbia, Ukraine). **No EU member state is on the list**, so the programme is effectively closed to every EU citizen — that is, to all readers except any holding a second, non-EU nationality.
- **Bilateral state scholarships:** eligibility follows government-to-government agreements. The official pages read do not list countries. A secondary summary lists many EU/EEA states for full-degree study, including the Czech Republic, Germany, Norway, Sweden and Poland, but not Denmark.

**What changes in the plan:**
- Stipendium Hungaricum: say "closed to EU citizens", not "closed to Danes".
- Bilateral scholarships: the phase-1 rewrite ("depend on your nationality … check whether your country is") is right, and matters more than expected, since several readers' countries may be eligible where Denmark is not. Keep `needsVerification` until the Tempus call for 2027/28 is read.

## 5. Aarhus University and ITU wording

Sources: AU [Computer Science](https://bachelor.au.dk/en/computer-science), [IT Product Development](https://bachelor.au.dk/en/it-product-development) and [Data Science](https://bachelor.au.dk/en/data-science); ITU [Global Business Informatics](https://en.itu.dk/programmes/bsc-programmes/global-business-informatics). All read 2026-09-24.

- **AU Computer Science and IT Product Development** literally say: "we recommend that **Danish applicants** also apply for the corresponding Danish-taught programme … as their second priority."
- **AU Data Science** says: "For Danish applicants: … intended for international students. **Applicants with Danish A** are therefore advised to apply for the corresponding Danish-taught programme".
- **ITU Global Business Informatics** is taught in English, and "Danish at A level is a requirement. No required mark but the subject must be passed (note that this is a new requirement)."

**What changes in the plan:**
- AU: the phase-1 edit "AU advises applicants with Danish A" would put words in AU's mouth for two of the three programmes. Instead, quote AU and gloss it with AU's own Data Science wording: *AU recommends that "Danish applicants" — on its Data Science page, applicants with Danish A — also apply for …*
- ITU: the phase-1 rewrite stands. The requirement is Danish A, not Danish schooling, so going to school in Denmark does not qualify you.

## 6. EUR rate table

Source: [ECB euro foreign exchange reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html), **reference date 24 September 2026**. Units per 1 EUR:

| USD | JPY | CZK | DKK | GBP | HUF | PLN | SEK | CHF |
|---|---|---|---|---|---|---|---|---|
| 1.1367 | 180.57 | 24.399 | 7.4756 | 0.85986 | 366.15 | 4.3823 | 11.2645 | 0.9409 |

| ISK | NOK | AUD | CAD | CNY | HKD | KRW | NZD | SGD |
|---|---|---|---|---|---|---|---|---|
| 138.00 | 10.7895 | 1.6177 | 1.6047 | 7.6302 | 8.9148 | 1555.69 | 2.0049 | 1.4549 |

The ECB does not publish AED. The dirham is pegged at 3.6725 per USD, so 1 EUR ≈ 4.17 AED (derived, not an ECB rate).

The table is stored once as data, in `data/site-config.json` → `currency` (below). Every EUR figure is recomputed from it, and the text cites "ECB, 24 September 2026".

**What changes in the plan:** the reviewers' assumed rates were several per cent off:

| Currency | Reviewers assumed | ECB, 24 Sep 2026 | Effect |
|---|---|---|---|
| USD | €0.86 per USD | €0.88 | EUR figures ~2% too low |
| GBP | €1.15 per GBP | €1.163 | ~1% too low |
| CHF | €1.07 per CHF | €1.063 | ~0.7% too high |
| JPY | 172 per EUR | 180.6 | EUR figures ~5% too high |
| KRW | 1,620 per EUR | 1,556 | EUR figures ~4% too low |
| NOK | 11.7 per EUR | 10.79 | EUR figures ~8% too low |
| HKD | €0.11 per HKD | €0.112 | ~2% too low |

Worked examples:
- NOK 15,488 ≈ **€1,435**, not the €1,300 in my own phase-1 proposal.
- DKK 8,450–13,700 ≈ €1,130–1,833.
- Hong Kong HK$0.9–1.1 million ≈ €101,000–123,000.

In phase 2b, every EUR figure in the busy files is recomputed from the table, not taken from the reviewers' text.

## 7. Coordinator decision on MEXT and GKS, and one conflict to resolve

The coordinator ruled (phase 2) that the MEXT embassy route and the GKS Embassy
Track must not tell every reader "Not open to you". Both should become
nationality-conditional, and `scripts/test-calendar.mjs`, which currently
forces both to `closed`, should be updated. This happens in the busy-file
batch.

- **MEXT (`jp-mext-embassy-2028`):** agree, and the guidelines confirm it
  (section 2). The route is for arrival in 2028, so a May 2027 IB graduate
  meets the schooling condition. Whether it is open depends on nationality.
- **GKS (`kr-gks-embassy-2027`): conflict.** For the *2027* round, the
  graduation-certificate deadline of 31 December 2026 closes the Embassy
  Track to every May 2027 IB candidate, whatever their passport (section 3).
  Making it `conditional` on nationality would suggest a German or Swedish
  reader can use it this year, and they cannot. Recommendation:
  - keep `kr-gks-embassy-2027` `closed`, with the reason rewritten to cite the
    graduation date, not Danish nationality;
  - if a 2028 Embassy Track route is recorded (the gap-year case), make that
    one `conditional` on nationality.

  **Needs the coordinator's decision before phase 2b.**

The round-3 country fixer has already rewritten some Portugal, Italy and MEXT
lines. `build-inventory.mjs` reports every `find` that is no longer present,
and phase 2b re-validates the inventory against the current text before
applying anything.

**Decision (coordinator, 2026-09-24):** follow the evidence.
- `kr-gks-embassy-2027` **stays `closed`**. Its reason becomes the
  graduation-certificate requirement: certified by 31 December 2026, which
  closes the track to every May 2027 IB candidate regardless of passport.
  Only a future round would be nationality-conditional.
- `jp-mext-embassy-2028` becomes **`conditional`** ("Only if"), as planned.
- `scripts/test-calendar.mjs` is updated to match: MEXT is no longer forced
  closed, and GKS stays closed.
- The busy-file batch is **on hold** until the coordinator confirms that the
  country and photo agents are done.

## 8. SU klip for a degree in another Nordic country (critic round 1, fix 4)

Source: [su.dk — SU til en hel uddannelse i udlandet: Hvad kan du få](https://www.su.dk/su-i-udlandet/su-til-en-hel-uddannelse-i-udlandet-/hvad-kan-du-faa), read 2026-09-24.

- Nordic: "kan du få SU og lån, som hvis du læser i Danmark". That is, you
  get SU and loans as if you studied in Denmark.
- Outside the Nordics: "kan du maksimalt få SU i fire år (48 klip)". That is,
  four years at most.
- Both cases: "Der er en overordnet ramme på 70 SU-klip til videregående
  uddannelse i udlandet. Det vil sige, at du i højst kan få 70 måneders SU til
  en eller flere videregående uddannelser." That is, there is an overall frame
  of 70 SU klip for higher education abroad, so at most 70 months of SU for one
  or more degrees.

**Settled:** Nordic study **does use SU klip**, within the same 70-klip frame
that governs all higher education abroad.
- The FAQ's "does not consume your Danish higher-education klippekort" is not
  supported, and is removed.
- Norway's "draws on the same SU-klip as a Danish degree" goes further than
  the page does. The page says "as if you studied in Denmark" and names the
  70-klip frame, not "the same card". It is replaced with su.dk's own wording.
- The page does not say whether the 2027 reform's 58-portion frame replaces
  the 70 for study abroad. The record says so and points to su.dk rather than
  asserting either figure.

## 9. Tuition in Denmark for displaced persons from Ukraine (critic round 1, fix 6)

Sources, read 2026-09-24:
- [Aarhus University — Tuition fees and application fee (bachelor)](https://bachelor.au.dk/en/international-applicants/moreinfo/tuition-fees-and-application-fee), exempt if you "Hold a temporary residence permit in Denmark according to Law no. 324 of 16 March 2022 regarding persons who have been displaced from Ukraine."
- [Royal Danish Academy — Ukraine](https://royaldanishacademy.com/en/ukraine): "Ukrainian nationals are exempt from paying tuition fee at Danish higher education institutions provided they have a residence permit in Denmark as a displaced national of Ukraine." It cites Act no. 324 of 16 March 2022 and Ministerial Order no. 474 of 24 April 2022.
- [University of Copenhagen — tuition fees (master's)](https://www.ku.dk/studies/masters/application-and-admission/tuition-fees) lists the same permit.

**What changes:** one labelled line on `/denmark/` and `/denmark/money/`.
SU eligibility for this group was **not** verified, so the line says nothing
about SU.
