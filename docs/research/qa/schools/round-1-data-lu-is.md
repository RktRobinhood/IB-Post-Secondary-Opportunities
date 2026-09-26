# School records, Luxembourg and Iceland (#43): admissions counsellor, round 1

Under review: `data/schools/lu-uni-lu.json`, `lu-lunex.json`, `is-hi.json` and `is-lhi.json`, and the
LU and IS sections of `docs/research/schools/reports/batch-nl-de-lu-is.md`. I checked them on
26 September 2026 against uni.lu, lunex.lu, hi.is and lhi.is, using WebFetch and WebSearch only. I did
not use a browser.

uni.lu blocks direct fetches. As the researcher did, I read it through the r.jina.ai reader, a public GET
of the official page. The filtered programme list (the uni.lu hand-off) returned 403 even through the
reader, so I could not recount it. I have not counted that against the record.

## Score: 9/10. Accepted.

**No wrong deadline.** Every date in the four records is confirmed on the official page: 9 of 9,
including every step of LHÍ's audition calendar. The scopes are right. The programme lists are complete as
far as the institutions' own pages allow. Each institution-wide conflict is handled the way the brief asks:
- uni.lu's Computer Science card is tagged "EN", but its page lists DE + EN + FR;
- HÍ's IB page says no English proof, but its ISE page asks for TOEFL or IELTS;
- HÍ's two pages give Nordic citizens different deadlines.
In each case the conflict is cited, and the student is told what to do. Nothing below is a false
statement. The points are about labels and about one question the Iceland record should answer.

## Errors

None. No field in the four records contradicts the official page.

## Smaller points (fix when convenient, not blocking)

1. **`is-hi`: what an IB student sends by 1 February.** The deadline page says "The University must have
   received the applicant's certified academic transcripts and previous degree diplomas no later than
   1 February". The supporting-documents page asks undergraduates for a "matriculation examination
   certificate or its equivalent". An IB student has neither by February 2027. Neither page says whether
   HÍ takes predicted grades or a school statement, and the record doesn't raise the question.
   - Sources: https://english.hi.is/study/apply/application-deadline, https://english.hi.is/study/apply-overview/supporting-documents
   - Fix: add one line to `ib` or the notes: "HÍ doesn't say how it treats IB results still pending on
     1 February; ask admissions before you apply."
   - This is the one thing I'd want settled before sending a non-Nordic student there.
2. **`is-hi` note 1 (Nordic 5 June).** A second HÍ page supports the deadline page's reading. The
   supporting-documents page gives "12 June" as the document deadline for "Domestic and Nordic citizenship
   undergraduate students (Fall)". So 5 June for Nordic citizens is backed by two pages, and the FAQ
   (living in Iceland) is the odd one out.
   - The note's "apply by 1 February to be safe" is prudent, but the brief says never to resolve a conflict
     towards "you can't". Say: "Nordic citizens, Danes included, have until 5 June (documents by 12 June)
     on two HÍ pages; its FAQ is narrower, so confirm."
   - Also add the supporting-documents page to `sources`.
3. **`is-hi` › English Studies `ib`**: "English at C1, e.g. IELTS 7.0." That is the programme's rule
   ("English language proficiency on the C1 level"). But HÍ's IB page says "English proficiency: Not
   required" for IB holders. This is the same conflict the ISE card already flags, so flag it here too, or
   a student may book an IELTS they don't need.
4. **`lu-uni-lu` › programme `ib` lines are 2026/27 criteria.** The Computer Science line gives English B2,
   "limited to 90 places" and the selection criteria. The Music Education line gives C1 and the July
   audition. Both come from admissions pages that still show 2026 windows ("1 Feb 2026 – 15 Jul 2026",
   "01 February 2026 – 03 June 2026"). The admissions page says "The application criteria for the
   2027–2028 academic year are currently under review". Note 3 says this for the institution, but the
   cards don't. Add "(2026 criteria)" to each programme `ib`, as the brief requires.
5. **`lu-uni-lu` › `ib`, equivalence timing.** "It takes weeks" is right, but the page is more specific,
   and the detail matters for an IB student. It says "a minimum of six weeks", and you must already have
   your secondary certificate to request it. With IB results in early July, the equivalence cannot come
   before mid-August. Say "at least six weeks, and only once you hold your Diploma".
6. **`lu-uni-lu` hand-off.** I could not open the filtered list (403). The researcher's count is 2
   bachelor's (Computer Science, Enseignement musical). Re-count it in a browser before publishing, as the
   report itself advises.
7. **`is-lhi` completeness.** The researcher could not find a language statement for the B.Mus
   Classical Artist Program, Music Innovation Technology B.Mus and Composition BA, and left them out.
   That is the right default. LHÍ's own framing is that BA programmes are mainly in Icelandic, which
   supports it. Put one line in the report saying these three are unconfirmed, not checked and excluded.
8. **`is-lhi` summary**: "about 600 students" is right. lhi.is says "~600 students, ~150 employees and
   four buildings". But that page is not in `sources`. Add https://www.lhi.is/en/.
9. **`lu-lunex` fees** come from embedded page data. WebFetch's text view of the Physiotherapy and
   Osteopathy pages shows the fee headings, not the figures, so I could not re-check €10,788, €9,900 or
   €9,000. Nor could I check "rises each year" in note 3. Not counted. Keep the exact fee sentences in the
   report, as the researcher did.

## What I checked and found right

| Check | Scope | Result |
|---|---|---|
| Dates | uni.lu 1, HÍ 1, LHÍ 7 (all 9) | **All correct.** uni.lu: "Applications for 2027–2028 will open on February 1, 2027". HÍ: "1 February" for undergraduate international applicants, with "The application period starts around mid December for the school year 2027-2028" on the same page. The year is inferred from that sentence, which is sound, although the page also carries a stale "27 August 2026" arrival date. LHÍ Contemporary Dance: opens "October 5th 2026", deadline "January 25th 2027", step-1 results "by February 12th 2027", assignments "before February 17th 2027", online group assessment "February 19th 2027", in person and interviews "February 20th and February 21st 2027", results "before March 3rd 2027", confirm "March 17th 2027" |
| Dates left out | uni.lu closing, LUNEX | Right to leave out. uni.lu's programme pages still show 2026 windows, and it says 2027 criteria are "under review". LUNEX: "Applying to LUNEX is easy and possible at any time of the year". Its Application Days listed are September 2026 sessions for the current intake |
| `ib` lines | All 4 institutions, 10 programmes | **uni.lu:** Ministry equivalence, "a minimum of six weeks", you may apply before results, €100 "non-refundable but … deducted from the first semester's tuition fees". The IB counts for language if "The main language of instruction of the certificate corresponds to one of the languages of instruction of the chosen programme". CS: "A B2-level certificate in English required"; French or German "No certificate is required … although a B1 level is recommended"; "limited to 90 places". Music Education: "English level C1", audition, "formation musicale" test and interview "in July". **LUNEX:** "B2 level in English", recognition "LUNEX Admission Office will help you", an online test "in English and/or in sciences" decides direct entry or the Pre-Bachelor Foundation Programme. **HÍ:** IB Diploma accepted, "English proficiency: Not required.", "Translation: Not required.", IBCP "does not meet the entry requirements"; ISE "limited to 60, of which 30 … international", TOEFL/IELTS/CAE/PTE on that page. **LHÍ:** matriculation or equivalent, EU/EEA English "assessed during their interview" |
| Local-language rules | All 10 programmes | Right. uni.lu CS: French or German B1 recommended, no certificate, as the card says. Music Education: Luxembourgish/French/German "an advantage", not required. No Icelandic is required for ISE, English Studies or Contemporary Dance |
| Programme completeness | uni.lu 2 of 38, LUNEX 5, HÍ 2, LHÍ 1 | LUNEX's bachelor page lists exactly five, bachelor's only. HÍ's language page says "The primary language of instruction is Icelandic". Its international-programme filter's other BAs are taught in Icelandic or the target language. LHÍ: see smaller point 7. The researcher's uni.lu exclusions each rest on a language rule a non-francophone could not meet (Business Administration "B2 … in French and in English", Mathematics "French: B2", and so on) |
| Programme URLs and credentials | 10 | Opened: uni.lu CS (degree title "Bachelor in Computer Science", 3 years, 6 semesters), uni.lu Music Education admissions, LUNEX Physiotherapy ("Start in April & October", "180 ECTS", "To practice as a physiotherapist, you must have completed a Master in Physiotherapy"), LUNEX Osteopathy ("Bachelor of Health"), HÍ ISE ("All teaching is in English", "Three years - 180 ECTS", "A BA degree does not qualify you to teach in Icelandic schools"), HÍ English Studies ("Language of instruction: English", first year "entirely through distance teaching"), LHÍ CDP ("taught in English"). All are the programme's own page. Credentials are the institutions' own titles, and none is invented. Where a page says only "Bachelor", the full title is used |
| Fees | HÍ, LHÍ, uni.lu | HÍ registration fee "100,000 ISK", tuition from autumn 2027 only for students from outside the EEA/EFTA and Switzerland, so "Free (ISK 100,000 registration fee)" is right for our reader. LHÍ application fee "ISK 5000" non-refundable. uni.lu "400€/ sem." No fee-status sentence appears in any school's notes. LHÍ's non-EEA tuition is correctly left to the country record |
| Summaries | 4 | All ≤ 150 characters (longest 148, LUNEX). No unsourced superlative. The report correctly declined is.json's "Iceland's oldest and largest" and lu.json's "most straightforward". LUNEX "private" is sourced ("a trusted private higher education institution") |
| Hand-offs | 4 | LUNEX: bachelor's only (5). HÍ: the IB admission page. There is no English-only BA list, and the filtered search mixes in BAs taught in Danish, French and other languages, so this is the right targeted page. LHÍ: the one English BA's page. uni.lu: see smaller point 6 |
| Notes | 12 | True as written. uni.lu €100 deducted; LUNEX "Master in Physiotherapy" and April/October starts; HÍ ISE teaching qualification and English Studies distance year; LHÍ fifth semester "international exchange studies or a professional internship", and ISK 5,000 application fee |

## Summary

- Score: **9/10, accepted**.
- Errors: **0**, and **0 wrong deadlines** (9 of 9 dates confirmed, uni.lu 1, HÍ 1, LHÍ 7). Plus 9
  smaller points.
- Most important fix: in `is-hi`, say that HÍ doesn't publish how it treats IB results that are still
  pending at its 1 February documents deadline, and tell the student to ask. Also: Nordic citizens'
  5 June deadline is backed by two HÍ pages, so the note shouldn't steer Danes away from it.
