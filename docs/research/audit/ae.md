# United Arab Emirates (ae) audit: May 2027 IB session, autumn 2027 entry

Audit date: 2026-09-24. Files: `data/countries/ae.json`, `data/destinations/ae.json`,
`data/evidence/ae.json`, `data/application-routes/ae-*.json`,
`data/application-systems/ae-nyuad-common-app.json` (no UAE context notes exist). UOWD and Heriot-Watt
Dubai were read in a browser. Zayed University's site did not respond at all, to either a script or
the browser.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| NYUAD rounds: ED I 1 Nov, ED II 1 Jan, RD 5 Jan, 23:59 EST; decisions 15 Dec, 15 Feb, 1 Apr; CSS Profile 10 Nov, 10 Jan, 1 Feb | CONFIRMED (no year printed, so still provisional) | nyuad.nyu.edu key-dates-and-deadlines |
| NYUAD 2026-27 cost: tuition 68,574; housing 6,000; food 5,800; direct 84,520; total USD 90,434 | CONFIRMED (no 2027-28 figures yet) | nyuad.nyu.edu cost-of-attendance |
| NYUAD "meets full demonstrated financial need ... regardless of nationality" (summary, tagline, institution note, destination) | **CORRECTED** (not stated on NYUAD's current pages; they say aid for non-Emiratis is need-based and renewed at the same level) | nyuad.nyu.edu scholarships-and-financial-aid; maintaining-and-renewing-your-aid |
| "a Danish family on an ordinary income would typically pay a fraction of it"; "very few / most admitted non-Emiratis" receive aid | **CORRECTED** (removed; not supported by any source) | — |
| NYUAD need-blind for internationals | UNVERIFIABLE (still not stated on current pages; left flagged) | — |
| Khalifa: Fall 2027 timeline "Stay tuned"; IB 24 points with 4+ in six subjects; AED 2,500 per credit hour (about AED 81,250 a year); housing AED 10,000-20,000 per semester | CONFIRMED | ku.ac.ae/undergraduate-admissions |
| Khalifa subject rule "Mathematics plus one science; excludes Islamic Education" | **CORRECTED** (English, Mathematics and one science required; Islamic Studies excluded) | same |
| Khalifa funding "historically ... could not be verified" | **CORRECTED** (merit scholarships that can cover tuition, textbooks and accommodation, considered from the admission application; terms for internationals not stated) | same |
| AUS Fall 2027: opens 19 Oct 2026; early file completion 5 Jul 2027; no closing date (15 Aug is a welcome session); dates tentative | CONFIRMED | aus.edu deadlines page |
| RIT Dubai: early phase to 15 Jan, regular to 31 May, deadline 22 Aug, late on space; IB 28 engineering / 24 others | CONFIRMED (no year printed, so still provisional) | rit.edu/dubai/undergraduate-admissions |
| CUD: only 2026-27 published (Fall 21/27 Aug 2026; Spring 3/8 Jan 2027; Summer 12/19 May 2027) | CONFIRMED | cud.ac.ae deadline-for-admission |
| Sorbonne Abu Dhabi: 21 Aug 2026 deadline for the 2026/27 intake, 2027 not yet published; AED 200 fee; accept two weeks before the year starts | CONFIRMED | sorbonne.ae undergraduate |
| Sorbonne "some business and economics programmes are taught in English" | **CORRECTED** (the English-taught bachelor's degrees are Physics, Mathematics (Data Science for AI) and Records Management and Archival Science; everything else is in French, B2 required) | same |
| Birmingham Dubai visa deadlines: 24/31 Aug 2026 and 14/21 Dec 2026; September 2027 not published | CONFIRMED | birmingham.ac.uk/dubai/study/apply/faqs |
| Heriot-Watt Dubai: rolling; most apply 6-10 months ahead; up to 3 weeks before the intake | CONFIRMED | hw.ac.uk/dubai/study/apply (browser) |
| UOWD calendar covers Autumn 2026 only | CONFIRMED | uowdubai.ac.ae academic calendar (browser) |
| Regulators: CAA licenses and accredits; KHDA certifies degrees in Dubai; ADEK regulates in Abu Dhabi | CONFIRMED | u.ae higher-education regulatory bodies |
| Ministry of Education equivalency plus attestation | not re-read (left as written) | — |
| Work rights on a student residence visa | UNVERIFIABLE (the MoHRE student-permit pages did not load; left flagged "not verified") | — |
| Zayed University "Application Dates to be confirmed" | UNVERIFIABLE today (site did not respond); left as recorded 2026-09-23 | — |
| Danish SU for a UAE degree | UNVERIFIABLE from a UAE source | — |

## Corrections

### NYU Abu Dhabi and full need (tagline, summary, why-consider, cost note, institution note, destination)
- Old: "meets full demonstrated financial need for admitted students regardless of nationality ... the difference between an impossible option and a free one"; "a Danish family on an ordinary income would typically pay a fraction of it"; "very few international students pay it"; "which most admitted non-Emiratis receive"; tagline "one of the world's most generous aid policies" (destination: "the Gulf's most generous financial aid").
- New: all aid for non-Emiratis is need-based, assessed on the CSS Profile, and renewed at the same level each year. The cost note says NYUAD does not state that it meets full need, and tells the student to ask. Taglines rewritten around the calendar, which is verified: profile "Western degrees in the Gulf, admitted on four calendars months apart"; destination "Four admissions systems, one flag, and calendars months apart".
- Sources: https://nyuad.nyu.edu/en/apply/undergraduate/scholarships-and-financial-aid.html — "All financial aid grants offered by NYUAD (for non-Emirati citizens) are based on financial need."; https://nyuad.nyu.edu/en/apply/undergraduate/scholarships-and-financial-aid/maintaining-and-renewing-your-aid.html — "renewed at the same level that was offered upon admission as long as certain criteria are met."
- Evidence: new `ev-ae-nyuad-aid-renewal`, attached to the NYUAD costs variation.

### Khalifa University
- Subject rule: old "Mathematics ... plus one science ... excludes Islamic Education". New: "English, Mathematics and one science ... excludes Islamic Studies". Source: ku.ac.ae/undergraduate-admissions — "Complete six HL/SL subjects with a minimum grade of 4 in each subject and an overall grade of no less than 24".
- Funding and note: old "historically funded ... could not verify the current policy". New: merit scholarships that can cover tuition, textbooks and accommodation, with "no separate application", and the note gives the points and the per-credit fee. Whether internationals receive them on the same terms is left as not stated.

### Sorbonne University Abu Dhabi
- Old englishBachelors: "Limited ... some business and economics programmes are taught in English."
- New: the three English-taught bachelor's degrees, by name; everything else in French with B2 required. admissionsUrl updated from `/admissions/` to the redirect target `/admissions`. Evidence: new `ev-ae-sorbonne-english-programmes`.
- Source: https://www.sorbonne.ae/education/apply-now/undergraduate — its personal-statement rules list "Bachelor in Physics, Bachelor in Mathematics ... Bachelor in Records Management and Archival Science" as the English-taught programmes.
- Kept, because it teaches at least one full bachelor's degree in English.

## Institutions

Checked (14): NYUAD, Khalifa, AUS, Sorbonne Abu Dhabi, Heriot-Watt Dubai, Birmingham Dubai, UOWD, Middlesex Dubai, RIT Dubai, AUD, UAEU, ZU, CUD, SP Jain Dubai. All URLs resolve except Zayed University (no response on 2026-09-24, URL unchanged, not verified) and UOWD (403 to scripts, loads in a browser).

- Fixed: Sorbonne (English programmes, admissions URL), NYUAD note, Khalifa note.
- Removed: none.

## New institutions

None. The only UAE institution in `IB_DISCOVERY.md` is the University of Sharjah with 212 transcripts, below the 300 threshold.
