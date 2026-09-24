# Malta audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/mt.json`, `data/destinations/mt.json`, `data/evidence/mt.json`,
`data/application-routes/mt-direct-2027.json`. Malta has no application-system or context-note files.

`npm run validate`: all records valid after the edits.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| UM IB entry: Diploma with 28 points, 3+ in a language, a science and a humanistic subject | CONFIRMED (page last updated 21 April 2026) | https://www.um.edu.mt/study/admissionsadvice/international/comparingib/ |
| HL = MATSEC Advanced, SL = Intermediate; IB 7–3 = A–E; ab initio does not count | CONFIRMED | same |
| SEC Maths, English and Maltese "how applied to an IB applicant was not stated" | CORRECTED: IB subjects can satisfy them if comparable; a non-Maltese applicant educated abroad may offer another language instead of Maltese, with Admissions Board approval | same; https://www.um.edu.mt/study/admissionsadvice/admissionsfaqs/ |
| IB is a "local" qualification; choose "Local Qualifications" | CONFIRMED | https://www.um.edu.mt/study/admissionsadvice/local/ |
| 2026 precedents: main 22 July 2026 14:00; late 15 September 2026 14:00 (not for M.D. or capped courses); non-EU visa 1 July 2026 | CONFIRMED | admissions FAQs; https://www.um.edu.mt/study/datesdeadlines/ |
| M.D. 16 March 2026 deadline "for IB holders" | CORRECTED: it applies to local-qualification (IB, EB, Matriculation) applicants who present the Medical Maltese Proficiency Certificate instead of SEC Maltese; every non-Maltese M.D. entrant must pass that exam | dates page; admissions FAQs |
| Applications open "the November before" (was flagged as unverified) | CONFIRMED | dates page: "you can apply online from the previous November" |
| October 2027 deadlines | UNVERIFIABLE (not published on 24 September 2026) | dates page |
| First semester 2027-28 from 4 October 2027 (first years) | CONFIRMED | https://www.um.edu.mt/study/datesdeadlines/importantdates/ |
| Application fee (was null) | CORRECTED: €35 for local qualifications (IB), €75 late; €100 / €200 for overseas qualifications | https://www.um.edu.mt/study/feesfunding/ |
| Tuition "published course by course", EU and non-EU null | CORRECTED: EU/EEA "No fees apply" on the four 2026-7 bachelor's pages read; non-EU €8,500 (BA, business/IT), €10,800 (Computing Science), €26,000 (M.D.) per year | UM course pages (below) |
| English proof: SELT needed; "whether IB English counts was not stated" | CORRECTED: IB English A (HL or SL) 4+, English B HL 4+ or English Literature and Performance SL 4+ exempts; SELT otherwise due by 30 September for the October intake; IELTS undergraduate 6.0 | https://www.um.edu.mt/study/admissionsadvice/international/exemptions/ ; English requirements page |
| Living costs (shared €550–700, single €800–1,600, food €450 …) | CONFIRMED (undated) | https://www.um.edu.mt/international/students/livingcosts/ |
| EU residence: register with Identità after 3 months | CONFIRMED, detail added (UM/MCAST/ITS students need no insurance for it) | https://identita.gov.mt/expatriates-unit-main-page/eu-nationals/eresidence-document-application/study/ |
| Work rights (was null) | CORRECTED: non-EU students with an e-residence permit, max 20 hours a week | https://www.um.edu.mt/international/students/workinginmalta/ |
| Funding for EU undergraduates | UNVERIFIABLE (none found; unchanged) | https://www.um.edu.mt/study/feesfunding/ |
| MCAST teaches in English; free for EU | CONFIRMED / ADDED | https://mcast.edu.mt/key-information-for-full-time-programmes/ |
| Middlesex University Malta listed | CORRECTED: removed, closed September 2022 | https://www.mdx.ac.uk/about-us/malta-campus/ |
| ITS in "Smart City, Kalkara" | CORRECTED: Aviation Park, Luqa (plus Gozo) | https://its.edu.mt/programmes?mqf=6 |

## Corrections

### M.D. deadline for IB applicants (country deadline entry, watchOuts, steps; destination watchOuts)
- Old: "Doctor of Medicine and Surgery - the deadline for applicants presenting an IB Diploma"; the quotation elided the condition with "...".
- New: the 16 March 2026 deadline is for local-qualification applicants "who shall be presenting the Medical Maltese Proficiency Certificate instead of a SEC pass in Maltese" — in practice every non-Maltese IB applicant. Added a watch-out that non-Maltese M.D. applicants must pass the Medical Maltese exam or are not admitted.
- Sources: https://www.um.edu.mt/study/datesdeadlines/ — "who shall be presenting the Medical Maltese Proficiency Certificate instead of a SEC pass in Maltese"; admissions FAQs — "Applicants who are not successful in the examination will not be admitted to the M.D. course". Evidence `ev-mt-um-md-deadline-2026`, `ev-mt-um-maltese-requirement`.

### SEC Maltese, English and Maths for an IB applicant (ibRecognition.notes, language.notes, watchOuts)
- Old: "how that Maltese requirement is applied to an IB applicant was not stated on the pages read and should be confirmed with Admissions."
- New: IB subjects can satisfy the SEC passes if comparable; a non-Maltese applicant educated abroad may offer another language instead of Maltese with Admissions Board approval.
- Sources: comparingib — "may also be satisfied through the subjects presented in the IB Diploma if such subjects are deemed comparable"; FAQs — "may be allowed to offer another language instead of Maltese, as approved by the Admissions Board".

### English proof (language.englishProof, steps; destination language)
- Old: "Whether IB English A or B counts as an exemption was not stated … IELTS (up to 6.5 depending on level) … PTE (59-71 by level)".
- New: exempt with IB English A (HL or SL) 4+, English B HL 4+ or English Literature and Performance SL 4+; otherwise bachelor's levels TOEFL iBT 80, IELTS 6.0, CAE C, PTE 65; SELT due 30 September for October (1 July for non-EU visa applicants).
- Source: https://www.um.edu.mt/study/admissionsadvice/international/exemptions/ — "IB Diploma English A - HL or SL at 4 points or better". Evidence `ev-mt-um-english-exemptions`; `ev-mt-um-english` updated.

### Tuition (costs.tuitionEuEea, costs.tuitionNonEu, whyConsider, watchOuts; destination feeContext, summary)
- Old: both `value: null`; watch-out "Undergraduate tuition is published course by course … you have to look it up per course"; destination "no feeContext is recorded".
- New: EU/EEA no tuition (2026-27, four UM courses read; MCAST free for EU). Non-EU €8,500 (BA European and Global History and English; BSc Business and IT), €10,800 (BSc Computing Science), €26,000 (M.D.) a year. Two feeContext entries added.
- Sources: https://www.um.edu.mt/courses/overview/ubschicgcft-2026-7-o/ (and ubscbusift, ubaeghengft, umdft) — "Local/EU/EEA Applicants: No fees apply"; "Fee per academic year: Eur 10,800". The fees tab is chosen by a geolocation cookie; both views were fetched. https://mcast.edu.mt/key-information-for-full-time-programmes/ — "MCAST course are free for Maltese and EU candidates." Evidence `ev-mt-um-course-fees-2026`, `ev-mt-mcast-language-fees`.

### Application fee (costs.applicationFee)
- Old: null. New: €35 with local qualifications including the IB (€75 late); €100 / €200 with overseas qualifications; non-refundable.
- Source: https://www.um.edu.mt/study/feesfunding/ — "The application processing fee for applicants holding local qualifications is EUR 35 until the first deadline". Evidence `ev-mt-um-application-fee`.

### Application window opens (deadline entry)
- Old: "could not be found again … left here as an unverified description". New: confirmed.
- Source: dates page — "you can apply online from the previous November for your preferred course." `ev-mt-um-dates-2027` updated.

### Work rights and residence
- workRights: null → non-EU students need an e-residence permit and "must not exceed 20 working hours a week" (https://www.um.edu.mt/international/students/workinginmalta/). EU no permit (EU free movement; not a UM statement).
- residency: added the Identità conditions — over three months, register on a Study basis; acceptance letter and sufficient means; "Students who attend the University of Malta, MCAST or ITS (Institute of Tourism Studies) ONLY do not need to provide insurance"; about 30 working days (https://identita.gov.mt/expatriates-unit-main-page/eu-nationals/eresidence-document-application/study/). No Evidence record added: the destination record has no residence field.

### Capped courses
- Added note: for limited-number courses UM ranks MATSEC C above IB 5, B above 6, A above 7 (comparingib — "MATSEC Grade C is higher than IB 5 points").

## Institutions

| Institution | Website | Admissions URL | Note / English offer |
|---|---|---|---|
| UM | OK | OK | CONFIRMED |
| MCAST | FIXED (www.mcast.edu.mt redirects to https://mcast.edu.mt/) | OK | CORRECTED: English confirmed, free for EU; count still unverified |
| ITS | OK | FIXED (home page → international entry-requirements page) | CORRECTED: city Luqa; three bachelor's listed |
| AUM | OK (single-page app, read in a browser) | OK | CORRECTED: ten bachelor's listed; Psychology dropped from fields (none offered) |
| St Martin's | OK | unchanged (home page; online form linked from it) | CORRECTED: own BSc degrees plus University of London degrees |
| Global College Malta | FIXED: globalcollegemalta.com no longer resolves; gcmalta.com points to https://gcm.edu.mt/ | FIXED: https://gcm.edu.mt/admissions-process/ | CORRECTED: seven BA degrees, MFHEA licence 2012-TC-005; awarding body not stated |

Removed:
- **Middlesex University Malta** — closed. https://www.mdx.ac.uk/about-us/malta-campus/: "Middlesex University Malta closed in September 2022 and ceased to be an educational entity in Malta from the end of March 2023." middlesex.mt no longer resolves. It had no IB statement. Left for central clean-up: its `mt-mdx-malta` entry in `data/images.json` and `data/places/mt-pembroke.json` (no longer used by any institution).

Not verified: MCAST's count of bachelor's and its IB entry rules; AUM's and GCM's accreditation status (mfhea.mt was not read); ITS entry rules for the IB.

## New institutions

None. No Maltese institution appears in docs/research/IB_DISCOVERY.md with 300 or more IB transcripts.

## Could not verify

- October 2027 deadlines (not published; re-check November 2026).
- Tuition beyond the four UM courses sampled; the 2027-8 course pages.
- Funding for EU undergraduates (UM lists scholarships only for specific nationalities and local schemes); Danish SU approval.
- How Theory of Knowledge is treated against Systems of Knowledge.
- Whether the Admissions Board approves another language in place of Maltese as a matter of course.
