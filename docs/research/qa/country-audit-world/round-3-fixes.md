# Country audit (world and Southern Europe, 15 destinations): fixes after critic round 3

Editor pass, 2026-09-24, answering `round-3.md` (score 7/10). Scope: es, it, pt, gr, mt, us, ca, au, nz, ae, jp, kr, cn, hk, sg.

- Files edited: `data/countries/<cc>.json`, `data/application-routes/<cc>-*.json`, `data/evidence/<cc>.json`.
- Not touched: `src/`, the photo files, the map, and every `meta` block. No git.
- New audience rule (`docs/PRODUCT_VISION.md`, "Who it is for"): every line touched here is written for an EU/EEA student living in Denmark, not for "a Dane".
- This log is written as the fixes are made, one section per fix.

## 1. Greece: the Athens English-taught MD (top fix 1)

Sources, all fetched 2026-09-24 with curl (pages saved and tag-stripped before quoting):
- https://medicen.uoa.gr/admission-requirements/ (WordPress `dateModified` 2026-05-28): "Eligible applicants should have obtained or expect to obtain at least one of the following:". The IB criterion ("Applicants must have achieved (or be predicted to achieve) at least 36 points overall, including three higher-level subjects (two of them should be selected from Physics, Chemistry, and Biology)") and "Admission Tests" ("University Clinical Aptitude Test (UCAT)", "Medical College Admissions Test (MCAT)") are separate items on that list. Clause A still reads "should have obtained a high school diploma (July 2025 or earlier)".
- https://medicen.uoa.gr/application-process/ (`dateModified` 2026-01-08): a section headed "Applicants who are in the final high school grade", item V: "At least one of the following: Predicted grades of International Baccalaureate (IB) … UCAT (score report)". Step 4: "If selected, you will be invited to participate in an online interview." The same page tells final-year applicants to send documents to "md.admissions@uoa.gr".
- https://medicen.uoa.gr/important-dates/ (`dateModified` 2025-12-18): "The application platform for the academic year 2026–2027 will remain open from December 18th, 2025 until April 30th, 2026." It gives no 2027–2028 dates. It names "md.admissions@uoa.gr" as the contact.

So UCAT/MCAT is one alternative to the IB, not an extra requirement; the programme does publish an application window; and its own application page settles most of the doubt about final-year IB candidates.

Changes in `data/countries/gr.json`:
- `watchOuts[..]`: "The English-taught MD at Athens costs EUR 17,000 a year for six years and requires UCAT or MCAT on top of your IB" → "The English-taught MD at Athens costs EUR 17,000 a year for six years. An IB of 36 points (three HL, two of them from Physics, Chemistry and Biology) qualifies you on its own; UCAT or MCAT is an alternative route, not an extra requirement".
- `watchOuts[..]`: "The Athens MD's own admission page contradicts itself about whether a current-year IB candidate may apply at all - get an answer in writing from medicen@uoa.gr before you plan around it" → "Clause A of the Athens MD's requirements page asks for a diploma from July 2025 or earlier, but its application page has a section for final-year students with predicted IB grades. Confirm with md.admissions@uoa.gr".
  - The address changes from medicen@uoa.gr to md.admissions@uoa.gr: that is the address both the important-dates page and the application page give for admissions. medicen@uoa.gr is the programme's general address.
- The MD calendar card:
  - `label`: "University of Athens MD in English - no deadline published, and the page disagrees with itself about whether you can apply at all" → "University of Athens MD in English: 2027 dates not yet published".
  - `dateState`: `not-published` → `not-yet-announced` (the programme publishes a window each cycle; the 2027-28 one is not out). `consequence` stays `hard`.
  - `notes` rewritten. Gone: "publishes no application deadline on any of its three admissions pages", the "30/04/2026 document cut-off" inference, "if it is wrong, it costs a year", and "plus UCAT or MCAT". New note: the 18 December 2025 – 30 April 2026 window quoted as the precedent, "The 2027-28 dates are not yet published"; the IB on its own qualifies (36 points, three HL, two from Physics, Chemistry and Biology); UCAT/MCAT one of several alternatives ("at least one of the following"); the application page's final-year section quoted; clause A kept beside it with "confirm with md.admissions@uoa.gr"; English (IELTS 7.5 / 6.5 each, TOEFL 80, FCE B2) and the online interview.
  - `source`: admission-requirements → important-dates; `sources`: admission-requirements and application-process.
- `steps`: "Prepare English proof and, for medicine, an admissions test. The Athens MD accepts UCAT or MCAT and requires IELTS 7.5…" → "Prepare English proof. The Athens MD requires IELTS 7.5…".
- `selectionNotes`: "The English-taught programmes select on your IB result, English proof and, for medicine, an admissions test, and each sets its own deadline - or none." → "The English-taught programmes select on your IB result and English proof, and the Athens MD adds an online interview. Each sets its own deadline." ("or none" referred to the MD, which does publish a window.)
- `sources`: added "NKUA - MD Programme in English, application process" and "…, important dates", both retrieved 2026-09-24.
- Checked and kept (confirmed on the requirements page): 36 points with three HL, two from Physics, Chemistry and Biology; IELTS 7.5 with 6.5 each; TOEFL 80; FCE B2.

`data/evidence/gr.json`, two new records (read-source, needs-review):
- `ev-gr-uoa-md-dates-2026` for https://medicen.uoa.gr/important-dates/ (the 2026-27 window as the precedent; supports `gr` deadlines and watchOuts).
- `ev-gr-uoa-md-application-2026` for https://medicen.uoa.gr/application-process/ (final-year applicants on predicted IB grades; UCAT/MCAT as an alternative; online interview; supports `gr` deadlines, watchOuts and ibRecognition).
- `node scripts/validate.mjs` (891 evidence records, all valid), `test-evidence-policy` and `test-sourcing` pass.

## 2. Future dates in the past tense (top fix 2)

Tense only; no date changed. Today is 24 September 2026, so each date below is still ahead (or, for NTU, running now).
- `data/application-routes/ae-branch-campus-direct-2027.json`, Birmingham Dubai visa milestone: "The 2026 equivalents were 24 August 2026 … and 14 December 2026 for January 2027" → "are". (`data/countries/ae.json` already used the present-neutral form.)
- `data/application-routes/nz-direct-2027.json`: "Auckland's equivalent date for February 2027 was 8 December 2026" → "is".
- `data/countries/nz.json`: "its Semester One 2027 equivalent was 8 December 2026" → "is"; and a second instance the critic did not name, in the Victoria card: "the University of Auckland's Semester One 2027 equivalent was the same day, 8 December" → "is the same day, 8 December 2026".
- `data/countries/sg.json` (Tuition Grant card) and `data/application-routes/sg-autonomous-2027.json`: "NTU's 2026 window … ran 19 September to 18 October 2026" → "runs".
- A regex scan of the 15 countries' country, route and destination files for "was / were / ran / closed / opened / fell" followed by an October–December 2026 or any 2027 date now finds nothing.

## 3. Small consistency fixes (top fix 3)

### UAE: three or four environments
- `data/countries/ae.json`, the application-system name: "The UAE has three admissions environments and which one you are in decides everything…" → "four". The sentence goes on to list four (federal, private, branch campuses, NYU Abu Dhabi), and the page says "four" everywhere else.

### Greece: "Only if: Only if"
- `data/application-routes/gr-minedu-foreign-2027.json` `readerAccess.reason`: "Only if at least one parent is not of Greek descent, and you cannot enrol without a B2 Greek certificate." → "At least one parent is not of Greek descent. You also need a B2 Greek certificate to enrol." The template (`src/lib/calendar.mjs`, `READER_ACCESS.conditional.label`) already prints "Only if". Both facts rest on the existing `ev-gr-minedu-enrolment-2026` (ministry circular Φ.152/117735/Α5).
- Not changed: "IB results released" inheriting the route's condition is template behaviour (the critic noted it only).

### Italy: the non-EU visa card, and the same shape in Portugal
Source: https://universitaly-private.cineca.it/uploads/universitaly-pubblico/Circolare_2026-2027_studenti_internazionali.pdf, fetched 2026-09-24 with curl, text extracted: "Per l'anno accademico 2027/2028, invece, il termine ultimo per la presentazione delle domande di visto è fissato al 31 ottobre 2027", and the visa procedures "non si applicano: d) ai cittadini appartenenti ai Paesi dell'Unione Europea, nonché a quelli provenienti da Norvegia, Islanda, Lichtenstein e alla Confederazione Elvetica…".

`data/countries/it.json`, the visa card:
- `label`: "…must precede (non-EU only)" → "…must precede (not for EU/EEA or Swiss citizens)".
- `consequence`: `hard` → `indicative`.
- `notes`: "None of it applies to a Danish citizen:" → "The visa procedure does not apply to EU/EEA or Swiss citizens:" (the quote that follows is unchanged, and it exempts only the visa procedure, so "none of it" was also slightly too wide).

The critic noted that Portugal's non-EU cards have the same shape. Sources, fetched 2026-09-24 with curl:
- https://www.up.pt/portal/en/study/international-students/special-call-for-applications/: the call is for "applicants who do not have Portuguese nationality or the nationality of another member state of the European Union"; "You can apply … if you are a non-EU national". The page does not mention the EEA, so the Porto cards say "EU", not "EU/EEA".
- https://www.novasbe.unl.pt/en/programs/apply/bachelors/international-students: international student status does not apply to anyone "Being a national from a Member-State of the European Union or a State Party of the Agreement on the European Economic Area (EEA)".

`data/countries/pt.json`, five cards, each `consequence`: `hard` → `indicative`:
- University of Porto special contest, phases 1, 2 and 3: label "(non-EU only)" → "(not for EU citizens)". Phase 1 note: "Listed for completeness. A Danish citizen is NOT eligible for this route." → "Listed for completeness. EU citizens cannot use this route: U.Porto runs it for applicants \"who do not have Portuguese nationality or the nationality of another member state of the European Union\"." Phases 2 and 3: "A Danish citizen is NOT eligible for this route." → "Not open to EU citizens; see phase 1."
- Nova SBE international admission, autumn and spring intakes: label "(non-EU only)" → "(not for EU/EEA citizens)". Notes: "A Danish citizen may NOT use this route." → "EU/EEA citizens cannot use this route."; "…so a Danish citizen cannot use this route." → "…so EU/EEA citizens cannot use this route."

### The guard
`scripts/test-deadline-labels.mjs`, new shape 6: a `hard` card whose label or note says the date is not the reader's (`non-EU only`, `not for EU`, `not open to EU`, `EU(/EEA) citizens cannot use`, `listed for completeness`). The reader is an EU/EEA student, so such a date cannot be "the door closes" for them. It names no country.
- With the six cards temporarily set back to `hard`, it **fails on all six** (5 PT, 1 IT). Restored, it passes: 755 events, "every label agrees with its note".
- A first version also matched "does not apply to a Danish"; that caught Iceland's Reykjavik EU/EEA card, whose note is about a *sibling* non-EU cycle. That phrase was dropped from the pattern rather than special-casing Iceland.

## 4. Unsourced lines (top fix 4)

### Korea: cut
- `data/countries/kr.json` `selectionNotes`: "Because the applicant pool is small and separate, strong IB students are often competitive at universities that would be unreachable through the domestic route. UIC, KAIST and SNU are nonetheless genuinely selective." → "The international track is a separate pool from the domestic route. UIC, KAIST and SNU are selective." The comparative claim had no source; the separate track is what the page's own sources describe.

### UAE: NYU Abu Dhabi's admit rate, now sourced
Source: https://nyuad.nyu.edu/content/dam/nyuad/about/nyuad-at-a-glance/reports-and-publications/class-2026-by-the-numbers-infographic.pdf, fetched 2026-09-24 with curl. One page, "CENSUS HIGHLIGHTS ON FALL 2022 ADMISSIONS AND ENROLLMENT FOR NYU ABU DHABI", "Prepared by NYU Office of Institutional Research & Data Integrity, 11/2/2022": "18,700+ APPS (excluding deferrals from prior year)", "5% ADMIT RATE". The PDF's text layer scrambles the figures (it prints "ADMIT RATE 63%"), so the page was rendered to an image and read by eye: 5% is under ADMIT RATE; 63% is the female share.
- No newer figure was found: NYUAD's facts-and-figures page (https://nyuad.nyu.edu/en/about/facts-and-figures.html) gives yield and graduation rates but no admit rate; the Class of 2029 article renders its figures client-side; the obvious URLs for Class of 2027–2029 sheets return 404.

`data/countries/ae.json`:
- watchOuts: "NYU Abu Dhabi is very selective — admission rates are in the low single digits — and its Early Decision rounds are binding." → "NYU Abu Dhabi is very selective: NYU's own figures for autumn 2022 entry show it admitted 5% of more than 18,700 applicants. Its Early Decision rounds are binding."
- `selectionNotes`: "…and admits in the low single digits." → "…and admitted 5% of applicants for autumn 2022 entry."
- `sources`: added "NYU Abu Dhabi — Class of 2026 By the Numbers (autumn 2022 admissions)".
- `data/evidence/ae.json`: new record `ev-ae-nyuad-admit-rate-2022` (read-pdf, needs-review; supports `ae` watchOuts). It also records the class's IB median of 40 (25th–75th percentile 38–41), which the page does not yet use.

## 5. Lower-priority items (item 5), each verified before it was changed

### Japan: Kyushu's five-day window
Source: https://www.kyushu-u.ac.jp/en/admission/faculty/foreign/foreign10/, fetched 2026-09-24 with curl: "This online application system will only be available during the application period. (December 7, 2026 - December 11, 2026"; "After registering with this system, you will still be required to send all the necessary documents by post."
- `data/countries/jp.json`, Kyushu card `notes`: "Online application 7–11 December 2026, for the English-taught engineering programmes and Bioresource and Bioenvironment. No closing time is stated." → "A five-day window: the online application system is open only from 7 to 11 December 2026, so do not plan to start the form on the 11th. Kyushu then wants \"all the necessary documents by post\" as well. For the English-taught engineering programmes and Bioresource and Bioenvironment. No closing time is stated." The date and badge are unchanged. (The postal deadline is in the programme PDFs, which were not read; nothing is claimed about it.)

### Japan: the embassy page dated, and the MEXT lines written for an EU/EEA reader
Sources:
- https://www.dk.emb-japan.go.jp/itpr_en/study.html, read in the browser pane on 2026-09-24 (curl gets "Access Denied"): dated "2020/12/3"; "There are two types of Japanese Government (MEXT) Scholarship Program for Danish nationals: (1) Japanese Studies … (2) Research Student …". The existing record `ev-jp-embassy-denmark-mext-types` already notes the date.
- MEXT, quoted in the existing record `ev-jp-mext-recruitment-window`: "As the application process and specific schedule differ according to the country of your nationality, please inquire the Japanese Embassy or Consulate General in your country for details."

The embassy page is about Danish nationals, and most readers are not Danish. So the two lines touched here now say that, per the audience rule.
- `data/countries/jp.json` watchOuts: "The MEXT undergraduate scholarship is not open to you from Denmark. The Embassy of Japan in Copenhagen states … Plan Japan's finances around institutional awards and JASSO, not around MEXT, and if MEXT matters to you, write to info@ch.mofa.go.jp…" → "Which embassy handles MEXT depends on your nationality: MEXT tells applicants to ask \"the Japanese Embassy or Consulate General in your country\". If you hold Danish citizenship, the undergraduate scholarship is not open to you. The Embassy of Japan in Denmark's Study in Japan page (dated 3 December 2020) lists two MEXT types for Danish nationals, Japanese Studies and Research Student, both for students already at university. Its 2026 news list carries a single MEXT call, for Research Students 2027. For any other nationality, ask the Japanese embassy in that country whether it runs the undergraduate track. Either way, plan Japan's finances around institutional awards and JASSO, and get the embassy's answer in writing before you build a year around MEXT."
- `data/countries/jp.json` `ibRecognition.notes[2]`: "A Danish gymnasium finishing in June sits between the two. This is now a secondary question, because the Embassy of Japan in Copenhagen does not appear to run the undergraduate embassy track for Danish nationals at all; see the deadline entry for what it publishes." → "An IB Diploma completed in May sits between the two. For Danish nationals this is a secondary question, because the Embassy of Japan in Denmark does not offer them the undergraduate scholarship; for other nationalities it depends on the Japanese embassy in that country." This also matches the watch-out's firmness, as the critic asked ("does not appear to run" → "does not offer").

**Not changed, and flagged for the coordinator (see "Found during this pass" below):** the MEXT card and route (`jp-mext-embassy-2028`) are still `readerAccess.state: "closed"` ("Not open to you"), and so is Korea's GKS Embassy Track (`kr-gks-embassy-2027`). Both are pinned closed by `scripts/test-calendar.mjs`.

### Italy: Bocconi's need-based waivers in the Money row, and the EU/non-EU line
Sources, fetched 2026-09-24 with curl:
- https://www.unibocconi.it/en/applying-bocconi/bachelor-and-law-programs/funding: "Each opportunity consists of a full or partial tuition waiver, based on the student's and family's economic needs"; one application, "Bocconi4Access to Education a.y. 2027-28"; "100% Full tuition waiver 80% Partial tuition waiver 60% Partial tuition waiver"; the 40–20% "Boost Your Future" waivers on a linked page.
- https://www.unibocconi.it/en/applying-bocconi/bachelor-and-law-programs/fees: "tuition and fees at Bocconi are set at € 17,000 per year"; "The amount for a.y. 2027-28 will be defined soon". The page does not mention EU, non-EU, the European Union or nationality at all.

`data/countries/it.json`:
- `costs.tuitionEuEea.value`: appended "Bocconi also cuts that fee by 100%, 80%, 60%, 40% or 20% on need, through one \"Bocconi4Access to Education\" application."
- `costs.tuitionNonEu.value`: "Bocconi does not price EU and non-EU differently." (inferred) → "Bocconi's fees page gives one figure, €17,000, with no EU/non-EU split." (what the page shows).
- `sources`: added the Bocconi funding page.
- Not claimed: who counts as an "International candidate" for the waivers. The 2027-28 waiver pages say "International candidates enrolled in the first year…" without defining the term.

### New Zealand: the 24-point rule, sourced
Sources:
- https://www.auckland.ac.nz/en/study/applications-and-admissions/entry-requirements/undergraduate-entry-requirements/new-zealand-secondary-school-applicants/international-baccalaureate.html, read in the browser pane on 2026-09-24 (curl gets a stub): "University Entrance standard for admission in 2027 — You must have been awarded the full IB Diploma. Within this IB diploma, you must achieve a minimum of 24 points."
- https://www.universitiesnz.ac.nz/files/Ent_lvl_quals_10Au.pdf, "Entrance level qualifications for admission ad eundem statum to New Zealand universities", fetched with curl (PDF created 5 August 2010): "International Baccalaureate (IB) A complete diploma of 24 points is required for admission." This is the national list the critic could not open; it is old, so it is cited with its date and beside the universities' current pages.
- Victoria Wellington and AUT are already on record (`ev-…` records in `data/evidence/nz.json`, "the IB Diploma (24 points minimum)").

`data/countries/nz.json`:
- `ibRecognition.minimumPoints`: "24 points with the full IB Diploma awarded - this is the national University Entrance equivalence threshold, not an entry guarantee. Individual programmes require more." → "24 points with the full IB Diploma awarded. This is the University Entrance standard for the IB, stated for 2027 entry on the University of Auckland's own IB page (\"you must achieve a minimum of 24 points\") and by Victoria Wellington and AUT; Universities New Zealand's national list gives the same rule (\"A complete diploma of 24 points is required for admission\"), in a document dated 2010. It is not an entry guarantee: individual programmes require more."
- `sources`: added the Universities New Zealand PDF.
- Found when checking the build: the Kyushu calendar entry renders from the route round, not the country card. `data/application-routes/jp-direct-2027.json`, round `rd-kyushu-iup-2027` `note`: "English-taught engineering programmes and Bioresource and Bioenvironment. No closing time is stated." → "A five-day window: the online system is open only from 7 to 11 December, so do not plan to start the form on the 11th. Documents also go by post. For the English-taught engineering programmes and Bioresource and Bioenvironment. No closing time is stated."

## Checks after the edits

- `node scripts/validate.mjs`: all records valid (892 evidence records after the three new ones). `test-sourcing`, `test-evidence-policy` and `test-deadline-labels` (755 events) pass.
- The widened label guard fails on the old badges and passes on the new ones (section 3).
- `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs` (PowerShell), final run: **27 of 28 checks pass**, 1 advisory (freshness), including `validate`, `labels`, `sourcing`, `evidence-policy`, `calendar`, `build`, `check`, `page-budget` and `release`.
  - The one failure is `image-records` (6, then 7, problems: `at-jku`, `ch-unige`, `ucph`, `nl-uva`, `hk-hkbu`, `kr-skku`… "replacement … was never fetched"). It is about `data/images.json`, which the photo agent is editing now; nothing in this pass touches it.
  - Two runs hit `ENOTEMPTY` on `dist/assets/img/places` while another agent was writing; the re-runs built 152 pages.
- In the built pages: GR shows "2027 dates not yet published" and "Only if: At least one parent…"; AE "admitted 5%"; NZ "is 8 December" and "document dated 2010"; SG "runs 19 September"; IT "Bocconi4Access" and "not for EU/EEA"; PT "not for EU" ×5. None of "on top of your IB", "for medicine, an admissions test", "Only if: Only if", "three admissions environments", "low single digits", "unreachable through", "were 24 August", "was 8 December", "ran 19 September", "non-EU only" or "Danish citizen is NOT" appears on the eight pages.

## Deferred

- Template items from rounds 2 and 3 (duplicate cards; the AU/NZ "2027 autumn intake" header; "IB results released" inheriting the Greek route's "Only if"): `src/`, for the coordinator.
- AU "Most Australian universities charge either no application fee or AUD 100-150": low priority, hedged, not changed.
- JP "its first new undergraduate faculty in about seventy years" (UTokyo College of Design): not checked.

## Found during this pass, outside the brief, for the coordinator

- **The two "closed" scholarship routes are closed only for Danish nationals, and most readers are not Danish.** `jp-mext-embassy-2028` (MEXT, Embassy Recommendation) and `kr-gks-embassy-2027` (GKS Embassy Track) both carry `readerAccess.state: "closed"`, which renders "Not open to you" and makes the entry non-actionable. The reasons are nationality facts: the Embassy of Japan in Denmark offers Danish nationals only two non-undergraduate types; "Denmark is not one of the 74 countries invited". MEXT itself says the process differs "according to the country of your nationality" and sends applicants to the embassy "in your country". A German, Czech or Norwegian student in Denmark may well be eligible through their own country's embassy. `scripts/test-calendar.mjs` pins both routes as `closed` ("the two established closed routes…"), so changing them is a model decision, not a data edit: possibly `conditional` with a reason that names Danish nationality, plus a rewrite of the Danish-framed lines in `data/destinations/jp.json` (watchOuts, ibRecognition notes, funding) and the route notes. Only the two JP country-file lines touched in section 5 were rewritten here.
- **Danish-reader wording left in lines this pass did not touch**, in the 15 files: e.g. `gr.json` summary ("the realistic route for a Danish IB student"), steps ("For a Danish IB student there are three"), residency ("As a Danish EU citizen"); `jp.json` MEXT card note ("a window a Danish IB candidate cannot use"); `is.json` Reykjavik note ("does not apply to a Danish citizen"). A sweep under the new audience rule is its own pass.
- **NYU Abu Dhabi's published IB profile** (the same 2022 sheet): IB median 40, 25th–75th percentile 38–41. It is recorded in `ev-ae-nyuad-admit-rate-2022` but not used on the page; it would tell a student more than the admit rate does.
