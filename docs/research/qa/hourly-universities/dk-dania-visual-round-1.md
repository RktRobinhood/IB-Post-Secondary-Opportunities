# Dania Academy — independent imagery and shared-format review, round 1

Run: `9d2ea2ec-47fd-4901-abf4-da2477d8205c` (dispatcher supplied).
Reviewer: independent automated photo editor / art director, 4 November 2026. This is not human verification.

**Final: imagery 8.1/10; shared format / art direction 8.0/10 — safe improvements accepted.** These scores follow actual inspection of both clean-build HTML pages, credits and all eight replacement screenshots for corrected runtime tree `916d339dac08b22e9f74f708b2bc536f5dad7d03`. Complete information parity remains unaccepted and deferred to 1 December 2026 with issue 71 open. The initial format score of 7.8 below is retained as a rejected historical checkpoint; its false prior-year copy and rejected-image credit findings are resolved. No score claims human verification or publication.

## Contract and scope

Read `QA_CRITIC_LOOP.md`, `HOURLY_UNIVERSITY_WORKFLOW.md`, ADR 0008, `PAGE_TEMPLATES.md`, school `PARITY.md`, `EXPERIENCE_PRINCIPLES.md` and `IMAGE_STANDARD.md`. Scope is the canonical Dania Academy institution and Cyber Security autumn 2027 programme. This reviewer owns only this report; no data, build, runtime, Git or template edits are made.

Acceptance means the safe reviewed improvements can ship to students. It does not mean all relevant information categories are complete. The contract requires possibility/photo first, short answers with depth one tap beneath, correct scoped evidence, phone quality, honest gaps and the common Denmark/Europe/world context. A missing relevant answer must remain completion work; no institution-specific layout is justified.

## Preliminary source and image observations (historical baseline)

These observations describe the initial state and will be superseded where the worker replaces or corrects it.

- Institution `data/images.json` key `dania` contains a rejected Florida-colleges map. Its review correctly names the wrong subject, and the shared resolver withholds it. The designed institution fallback is preferable to publishing this file. A prior Commons search alone is not proof that no usable campus image can ever be found; the worker is checking official sources and the source ladder.
- Opened the actual local `src/assets/img/programmes/programme-dk-dania-cyber-security.webp`: 960 × 600 crop, showing several technicians and workstations around a curved desk in Architel's network operations centre. People and equipment remain the subject; no logo, map, event or car park dominates. The old office equipment and beige interior weaken student aspiration. This is a subject illustration, not a Dania campus or class.
- Independently opened [Commons file source](https://commons.wikimedia.org/wiki/File:NOC-Architel.jpg). It names Mike Reyher, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0), a 15 June 2007 capture and a 2,560 × 1,920 original. The existing manifest's author/licence match. Its description identifies Architel accurately. Rendered alt and credit still require final HTML review.
- Opened [Dania's historical Viborg study-environment story](https://eadania.com/news-and-press/news/new-study-environment-at-dania-in-viborg/). It identifies the shared Dania/VIA campus on Prinsens Allé and includes an interior/student photograph. This is a lead, not yet an accepted current campus image or a licence claim.

## Shared projection audit, before final HTML

Read the actual canonical projection in `src/lib/canonical.mjs`, canonical institution adapter `src/pages/institutions.mjs` and programme adapter `src/pages/programme.mjs`. The shared institution projection carries identity, locations, about, notes, sources and programme list; programme summary, credentials, requirements, selection factors, dates and limited fee status are carried. This correctly reuses the shared university/programme templates.

The existing common projection does not automatically expose canonical programme `description` / `structure`, institution `support`, full applicant-specific costs, submission checklists or undated actions in corresponding student answers. The final review will identify which of these the Dania worker actually stores and which remain absent from HTML. Stored JSON is not accepted as rendered information parity. Relevant gaps belong to [issue 71](https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities/issues/71), with the work unit deferred where needed.

## Worker candidate: official Viborg classroom image

Independently opened `D:/ibp-tmp/dania-20261104/campus.jpg` and [Dania's Viborg campus page](https://eadania.dk/her-ligger-vi/viborg/). The page identifies Dania's shared campus with VIA at Prinsens Allé 2. The candidate is [the image served by Dania](https://eadania.dk/media/1371/det-store-smil-hos-erhvervsakademi-dania-viborg.jpg?format=jpg), reported and visibly inspected at 810 × 507, 62,900 bytes. A smiling student left of centre faces a classmate, with other students and classroom tables behind. This is a warm, concrete study-environment invitation, with human interaction as its subject. No map, logo, car park or event dominates it. It must be described as a campus classroom/study-environment photograph, not as evidence of a Cyber Security class.

The appropriate usage basis is the repository's permitted official image linked from the institution's own server, credited to its source page; it is not an open-licence claim and no individual photographer is established. The source ladder rejected the logo Open Graph image and found a suitable actual campus photograph; the rejected Florida map stays rejected. The candidate clears the official-image 720-pixel floor without copying or enlarging. Final rendered accessibility description, attribution, network load and desktop/phone crops remain to be checked. In particular, the narrow crop must preserve the left-of-centre face.

## Initial actual artefact review — historical, superseded by corrected recheck

Opened the actual generated HTML in the clean release checkout `D:/ibp-tmp/absalon-release-20261030/dist/universities/dk-dania/index.html` and `dist/programmes/dk-dania-cyber-security-2027-autumn/index.html`, plus its real credits page. Dispatcher supplied runtime tree `f76314982f7d3a9afc418a4e85f8b7bd9366a5bd` on main base `e19ee09`; the HTML's revision meta names the base commit. This review does not infer publication from that marker.

Opened all eight actual JPGs under `docs/research/qa/hourly-universities/dk-dania-shots/`:

| Page | Desktop light | Desktop dark | Phone light | Phone dark |
|---|---|---|---|---|
| University | `universities__dk-dania--desktop-light.jpg` | `universities__dk-dania--desktop-dark.jpg` | `universities__dk-dania--phone-light.jpg` | `universities__dk-dania--phone-dark.jpg` |
| Programme | `programmes__dk-dania-cyber-security-2027-autumn--desktop-light.jpg` | `programmes__dk-dania-cyber-security-2027-autumn--desktop-dark.jpg` | `programmes__dk-dania-cyber-security-2027-autumn--phone-light.jpg` | `programmes__dk-dania-cyber-security-2027-autumn--phone-dark.jpg` |

These are actual 1280-pixel desktop and 390-pixel phone full-page renders. Additional original-resolution views of the desktop-dark programme, phone-light university and phone-dark programme confirmed fine text, hero and crop details without relying on the resized previews.

The university image loads in all four views. On phone, its subject's hair and outer left face are trimmed, but both eyes and the smile remain; the classroom group stays visible and the photograph still reads as student interaction. Desktop has some softness from the modest official resolution, without becoming distracting. White hero type and Dania credit are legible. The programme hero/card retain the NOC workstations and people, including on phone; they do not imply a campus exterior. Hero alt correctly identifies Architel, and the source credit names Mike Reyher / CC BY 2.0. The real credits row supplies the direct licence link. Institution alt is “Students talking in a classroom at Dania Academy’s Viborg campus”; its credit links to the official Viborg source. No unsupported photographer or free licence appears.

Both page levels lead with photographs and concrete options, then glance facts and concise answers. The single degree is a real linked card with credential, duration and place. Required-subject chips and the visible English conflict survive narrow widths. Long requirements, notes and sources use native closed disclosures; official links remain clear. Phone content wraps without horizontal text loss, the programme's secondary glance facts use “More facts”, and the shared horizontal section navigation shows the next-item cue. Light/dark typography and control hierarchy remain coherent. Denmark is the location, while shared navigation/footer retain Europe and Worldwide as common context.

### Initial findings and retained completion work

1. **Historical blocking format copy defect — now resolved:** the initial actual date panel said “Last year’s date, not yet confirmed”, and programme freshness said provisional dates repeat last year's. The recorded rule is an undated annual deadline on a page for a first intake in September 2027; there is no earlier intake date established. Its expanded source note was accurate. The corrected shared components now use neutral provisional-date copy; the numerical deadline's provisional state remains explicit.
2. **Full information parity remains unaccepted under issue 71.** The raw programme now stores curriculum, teaching style, semester-five international option, 30-ECTS internship and AP-exit structure; institutional support stores academic/international/career guidance; the Opportunity stores outcomes and accreditation context; route submission items store transcript, school verification, photo ID, signature and English-proof steps. Full corresponding answers are absent from the actual public HTML. Some curriculum/documents/fee facts occur only in evidence restatements, which does not substitute for their shared student answer. Undated final-diploma/reply actions are absent from the dates panel. Summary/AP exit, subjects, quota-2 factor and dated opening/submission survive correctly. Deliver these through common projections before claiming completeness.
3. **Historical nonblocking credits defect — now resolved:** the initial credits page listed the rejected Florida map under Dania alongside the current official photograph. The common renderer now filters explicitly rejected records without deleting the rejection metadata. A future official or licensed modern programme photograph would still improve on the 2007 office illustration; do not invent a photo, rights claim or institutional layout.

The initial checkpoint scored imagery **8.1** and format **7.8**, rejecting the format until the first defect was corrected and actually rechecked. The 1 December 2026 admissions/fee/curriculum recheck and issue 71 remain necessary after safe-slice acceptance.

## Corrected actual artefact recheck and final acceptance

Dispatcher rebuilt corrected runtime tree `916d339dac08b22e9f74f708b2bc536f5dad7d03` in the same isolated release checkout. Read the actual replacement university and programme HTML and credits. Confirmed both date-panel footnotes/tooltips now say “Date not yet confirmed”, with no false prior-year wording. Programme freshness now says “Provisional dates: check before relying on them.” The detail still explains the undated annual rule on the September 2027 page. The credits HTML no longer contains `Florida_Colleges`, while the current Dania official photograph and Architel / Mike Reyher / CC BY 2.0 attribution remain.

Inspected the source changes in the existing shared `school-dates.mjs`, `components.mjs` and `pages/meta.mjs`, plus focused regressions for annual/prior-cycle provisional dates and accepted/rejected Commons, official and degree-image credits. They are general corrections; no Dania layout or country branch was added. This report records inspected code and actual output, not an independently run full gate.

The replacement capture log records all eight files in the table above. Opened **all eight replacements**, including original-resolution university desktop/phone renders. Each replacement preserves the image, legible credit, hierarchy, required-subject warning, native disclosures and phone wrapping described above; corrected neutral date copy is visible in both themes and widths. The same filenames now contain the corrected screenshots; the earlier set was inspected but superseded, and the historical rejection reasons remain documented here.

| Dimension | Final score | Reason |
|---|---:|---|
| Imagery | **8.1/10** | Warm, verified official Viborg study-environment photograph replaces the fallback responsibly; actual desktop/phone crops keep the student expression. Subject illustration is relevant, correctly identified, sourced and credited, though visibly dated. Source, usage basis, alt, resolutions and actual credit delivery were checked. |
| Shared format / art direction | **8.0/10** | Photo and study possibility lead; concise readable answers and deeper disclosures work in both themes and widths. English uncertainty and provisional dates remain visible without invented prior history. Shared renderer/credits fixes resolve the observed defects, and navigation keeps Denmark within the common Europe/world context. This accepts the safe presentation slice, not missing information parity. |

The three improvements with most remaining value are: deliver the already-stored curriculum/support/cost/documents/outcomes and undated actions through the shared projections under issue 71; resolve the scoped English, tuition and admissions-document questions at the 1 December recheck; seek a suitable modern programme photograph if an official or licensed one becomes available. The institution lede could also foreground the applied study opportunity before accreditation in a future data-copy pass. None is a claim that the current evidence completes the university.
