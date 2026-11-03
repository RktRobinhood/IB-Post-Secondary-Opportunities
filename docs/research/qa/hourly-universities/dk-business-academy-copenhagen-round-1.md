# EK discovery audit — independent critique, round 1

Reviewed on **3 November 2026** for `dk-business-academy-copenhagen`, run
`2b3b7370-87bc-47d3-a681-43280a5cdc7c`. Roles: independent admissions
counsellor, photo editor and shared-information-format critic.

**Accepted for publication as an internal current-scope exclusion and deferred
recheck: admissions 9/10; imagery/publication treatment 9/10; shared format 9/10.**
This is editorial acceptance of the bounded evidence, not completed autumn 2027
admissions coverage. Retain **deferred**, with next check **2027-02-01**, or
earlier upon a new English first-year announcement. No public institution,
programme or photograph is approved by this review.

## Actual artifacts inspected

- Read the complete final worker report:
  `docs/research/imports/hourly/2026-11-03-dk-business-academy-copenhagen.md`,
  including the amended recognition-access account, applicability table, image
  assessment, exact exchange URL and proposed deferred disposition.
- Read the actual diff and final parsed row in
  `docs/research/imports/discovery-candidates.json`. There is one EK row, seven
  source URLs, existing `scope: "none"`, a researched-exclusion disposition,
  explicit future-intake uncertainty and a February recheck. The original
  national-catalogue lead is retained. The only other JSON changes are the
  inventory's date and explanation that assessed and unassessed leads coexist.
- Read `docs/research/DK_COVERAGE.md:121`, which already records the exclusion,
  and the exact Creative Branding unmatched lead in
  `docs/research/DENMARK_CATALOGUE_COMPARISON.json`. Searched canonical `data/`
  for the current identity and predecessor names; no matching entity was found.
- Read `docs/QA_CRITIC_LOOP.md`, `docs/HOURLY_UNIVERSITY_WORKFLOW.md`, ADR 0008
  and `docs/PAGE_TEMPLATES.md` as the acceptance contract.
- Opened the actual pixels of both temporary photographs listed below and
  checked their SHA-256 hashes against the report. These are review inputs
  outside the repository, not changed published assets.

## Admissions — 9/10

I would repeat the bounded conclusion to a student: EK currently says its full
degrees are Danish-only; this English catalogue lead is an exchange semester
requiring previous higher education. A new English school-leaver opportunity
has not been established. The evidence does not promise what EK will offer in
autumn 2027.

Independent official-source sampling on **3 November 2026**:

| Source | What I verified and its date limits |
|---|---|
| [UFSN English business-academy list](https://ufsn.dk/english/education/the-higher-education-system/business-academies/) and [Danish list](https://ufsn.dk/uddannelse/de-videregaaende-uddannelsesinstitutioner/erhvervsakademier/) | Both accessible lists identify current EK and link to its domain. They establish the institution's recognised system/sector context; they are not a programme accreditation decision or English-language admission rule. No publication/effective date was visible in the inspected text. |
| [Recognition entry 407](https://hei.ciriusintra.dk/Detail.aspx?aIdInst=407) | Independently retrieved indexed text identifies current Erhvervsakademi København / Business Academy Copenhagen / EK, recognised from 1 July 2025, and both predecessors. The index said crawled last month. My direct web open returned 502 and PowerShell failed DNS resolution. I did not obtain fresh raw register HTML. The amended report honestly distinguishes index-assisted reading from direct access. |
| [About EK](https://www.ek.dk/english/about-us) and [merger announcement](https://www.ek.dk/om-os/nyheder/velkommen-til-ek-erhvervsakademi-koebenhavn) | The about page states the merger effective 1 July 2025. The announcement is visibly dated 1 July 2025 and names KEA and Cphbusiness. Guldbergsgade is a campus of the merged institution, not a separate institution. |
| [Programmes at EK](https://www.ek.dk/english/about-us/programmes-at-ek) | Affirmative institution-wide Danish-only full-degree statement, repeated for AP and bachelor provision. The top-up section distinguishes entry after an AP degree. This current, undated language statement supports today's exclusion, not a separately published autumn 2027 guarantee. |
| [Study in Denmark institution profile](https://studyindenmark.dk/portal/portal/business-academy-copenhagen) | The exact double-`portal` URL works and says current English provision is exchange only. Government study-promotion corroboration supports the institution's own declaration. |
| [Original catalogue lead](https://studyindenmark.dk/portal/business-academy-copenhagen/ek-guldbergsgade/creative-branding-design-and-business) and [exact official exchange destination](https://www.ek.dk/english/exchange/creative-branding-design-and-business) | Catalogue: one semester, 30 ECTS. Official destination: minimum two completed years in a related field and partner-university nomination. Its spring 2027 start and 1 November 2026 deadline are exchange facts. The report keeps them out of autumn 2027 first-year requirements/calendar. |
| [Danish Creative Branding top-up](https://www.ek.dk/videregaaende-uddannelser/creative-branding-design-og-business) | 1.5 years / 90 ECTS, eligible AP qualification and admissions test, with summer 2027 advertised as the last intake. This is a higher-entry route; English entry conditions on an exchange page do not establish an English first-year route. |

The report makes IB Diploma/Course Results, fees, document timing and first-year
deadlines explicitly unestablished/inapplicable to this exclusion. It invents
neither rejection nor acceptance, zero tuition nor an IB English waiver. There
is no wrong first-year deadline to fail this round. The remaining point below
full marks is intentional future-intake uncertainty, preserved as recheck work.

## Imagery and publication treatment — 9/10

I visually inspected the two actual **1200 × 630** JPEG files:

- `D:/ibp-tmp/dk-business-academy-copenhagen/ek-institution-share.jpg`:
  smiling person against brickwork; clear, well-lit portrait, no text/logo,
  no identifiable campus panorama. SHA-256
  `25380514ab36e63751038c59d155ac57f425732e19874117f895db9d4f329637`.
- `D:/ibp-tmp/dk-business-academy-copenhagen/ek-creative-branding-share.jpg`:
  person seated on an outdoor bench, with architecture behind; clear portrait,
  no course-specific activity or visible branding tools. SHA-256
  `b00e5be57dafee9c96b0fd9cb185fabb8a0602216673e1f6ef8c1b5a8a9ededc`.

These observations agree with the worker's visual account. Official hosting
does not establish an open licence, photographer credit or hosting permission.
The report records those limits and does not publish either image. Neither
portrait establishes a campus identity or school-leaver opportunity. This score
accepts the careful nonpublication decision and honest review; it does not
certify image rights or approve the photographs for future use.

Desktop/phone screenshots and crop review are **not applicable**: no public
page, layout, crop or asset changes. Creating an empty university portrait or a
fallback image would misrepresent an out-of-scope lead. If a qualifying offering
appears, programme/campus imagery and its rights need a fresh publication review.

## Shared format — 9/10

The result uses the existing internal discovery-row shape and shared research
report convention. It introduces no institution-specific JSON field, private
page, template branch, schema change or duplicate entity. The applicability
table addresses the common information contract with supported findings or
bounded gaps rather than filling irrelevant public slots. The existing national
exclusion is reused and reconciled with the exact catalogue lead.

`scope: "none"` is explicitly current scope, while `structural_gaps`, `caution`
and the report retain unresolved autumn 2027 provision. This respects ADR 0008:
no student-facing institution projection is warranted for a supported exclusion.
It does not claim that schemas alone establish information parity, or resolve
the separately recorded programme-description/structure projection gap.

## Corrections resolved and remaining work

Before final acceptance I found that the provisional short exchange URL
`/english/exchange/creative-branding` returned **404**. The coordinator replaced
it with the exact working destination linked by the national catalogue. I
rechecked the final parsed row: the invalid short URL is absent. The report's
recognition-access wording was also corrected and accessible agency sources
added. These corrections are resolved within this round.

No further correction is required for this bounded result. The highest-value
next work is the retained February check for newly announced English first-year
provision; if found, collect all relevant common-schema admission categories
and review the resulting public projections and imagery before publication.

This critic edited only this review file. JSON parsing, scoped reads, source
sampling, pixel inspection and hash comparison were performed. No full release
gate, build, state/queue mutation, Git mutation or publication was performed
by this critic. Dispatcher validation and publication remain separate.
