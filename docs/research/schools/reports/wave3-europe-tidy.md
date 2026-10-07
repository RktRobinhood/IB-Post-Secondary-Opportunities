# Wave 3 Europe tidy: findings log (7 Oct 2026)

Agent: europe-tidy. Scope: programme detail for the last Europe gaps, pt-uminho, DkIT.

## Iceland
- `is-hi` (2 degrees): about, selection, selectionNote added. International Studies in Education: 60 places, 30 in the international period; if oversubscribed, ranked on education work experience and personal statement (page wording: "Work experience in the field of education"). English Studies: no cap or ranking stated, entry is matriculation or equivalent plus English C1 -> `open`. EU/EEA: free apart from ISK 100,000 registration fee (fees page: tuition only for non-EEA/EFTA from autumn 2027).
- `is-lhi` (1 degree): about, selection (audition, interview) added. Page: grades, arts education, experience weighed together; committee decision final. No place count published.
## Luxembourg
- `lu-uni-lu` (2): Computer Science: 90 places, scored on cover letter, maths and science grades, overall grade, diploma type, English level, CV (page: "limited to 90 places"); 2026 round shown, 2027 not yet published. Music Education: audition/interview in July, motivation letter, CV, 2-4 minute video. uni.lu returns an AWS WAF challenge to curl/WebFetch; read in the browser tab (text from the DOM). The music pages were briefly rate-limited (403) and read on retry.
- `lu-lunex` (5): about, selection (online Application Day test in English and/or science sets direct entry or a foundation year; applications any time), tuition kept. No place counts or IB grade rule published; "where invited" because the page says "if applicable".

## Ireland
- `ie-rcsi` (5): EU route read from each entry-requirements page (EU IB section, not the non-EU one): 3 HL at 5 and 3 SL at 4, English/Maths/second language, lab science; Medicine and Dentistry need HL Chemistry 5 (+ HL Physics/Biology) for the five-year track. IB-to-CAO table applied by RCSI. 2026 cut-offs recorded as published (Medicine 734 combined with HPAT, random draw at 734; Dentistry 613; Pharmacy 578; Physiotherapy 555; ATT 498), with RCSI's own IB equivalents in the value text. `points: 35` on Medicine = the 480-point minimum (table row 35 IB = 481). EU places (Medicine 90, Dentistry 35, Pharmacy 90, Physiotherapy 68, ATT 60) and Free Fees totals (2025/26 guideline, 2026/27 "published once available") from each fees-and-funding page. Medicine formula changes in 2027 (HPAT out of 150, points unmoderated), so 2026's 734 is not comparable; said in selectionNote.
- `ie-dkit`: still blocked. curl 403 with `cf-mitigated: challenge`; WebFetch 403; own browser tab sat on "Just a moment..." for 30+ s (interactive Cloudflare challenge; not bypassed). The web.archive.org copy of dkit.ie/courses does load, which is how the earlier record was sourced. Record untouched (0 flagships, 0 faculties); building flagships and faculties from archive copies is possible if wanted.

## Latvia
- `lv-tsi` (7): `selection: ["interview"]` and a new selectionNote. Basis: admission rules 4.6-4.7 (foreign applicants send diploma + B2 proof; "online interviews with a video recording with all foreign applicants" to establish motivation); ranking on CE averages is for Latvian-schooled applicants. No place counts or IB rule exist. The interview sentence sits in the non-EU paragraph but says "all foreign applicants": worth a second look if a student reports otherwise. Cloudflare did not block the PDF.

## Malta
- `mt-mcast` (2): `selection: ["open"]` with a note that no selection method is stated and courses can fill (apply page: courses "oversubscribed after closure of Main Call"). Weakest `open` of the batch: nothing says everyone eligible is admitted.

## Single gaps
- `at-jku` Transformation Studies: 2027 procedure still unpublished (JKU and Angewandte pages: details "in autumn 2026"). Recorded the latest published procedure (2025 PDF): written assignment (400-500 words), CV, motivation letter, then online interview. Source added.
- `fi-laurea` Service Experience Management: Studyinfo's admission-criteria page (hakukohde ...99026) now says "The International UAS Exam selection method is used for this degree programme" for spring 2027 (earlier "to be announced"). Set `entrance-exam`, places 30 already recorded. Other criteria still "to be announced".
- `fr-edhec` International Business Analytics and Management BSc: IB entry from King's (38 points, Maths HL 6 AA/AI; contextual 35), UCAS personal statement; no test or interview listed. EDHEC's page linked a preview.kcl URL; the live kcl.ac.uk entry-requirements page was used instead.
- `lt-ktu` Public Policy and Administration: not in KTU's 2026 admission rules and the page lists no entry subjects; recorded `grades` from the page's "Minimum average grade (CGPA) >60% in each entry subject" and said weights are unpublished and the programme needs ministry approval.

## pt-uminho
- File was untracked; passes validate and check-schools. Re-checked the `none` call: EEG page says "language of instruction in most of the course units is English" for International Business, but UMinho's own international booklet says "part of the teaching will take place in English", DGES (UMinho code 1000) marks no UMinho course "ensino em inglês" (U.Porto's two FEP degrees are marked), and UMinho's international contest excludes EU citizens. Kept `none`. Changes: retrieved date, note reworded to "taught partly in English", booklet added as a source. Judgement call: if the owner prefers to list International Business (60 places 2026/27, Maths A + one other exam, national contest), it is a one-programme `listed` record.

## Numbers
Before (COVERAGE.md at start): is 0/3, lu 0/7, ie 42/47, lv 45/52, mt 26/28, at 37/38, fi 100/101, fr 26/27, lt 183/184; Europe overall 1631/1659 with detail, 307/451 records.
After: all those countries 100%; 1686/1686 (other agents added records meanwhile).