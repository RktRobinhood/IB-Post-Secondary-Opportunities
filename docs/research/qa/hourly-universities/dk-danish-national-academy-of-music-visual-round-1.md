# Danish National Academy of Music — visual and scope critique, round 1

**Final scoped verdict: imagery-publication disposition 9/10; shared internal format 9/10 — accepted for the internal-only exclusion and recheck.** The clean release gate passed all 43 checks. Full-page visual quality and phone/desktop interaction parity: **N/A**, because this unit publishes no page. Complete institution-information parity is not claimed.

Reviewer: Codex independent automated photo editor / publication-scope and shared-format critic, 2026-11-04. This is not human verification. Run: `88dc1caf-acf2-4525-9946-81cf2774c43c`. Reserved unit: `dk-danish-national-academy-of-music`.

## Initial findings preserved before acceptance

The expected safe outcome is an internal supported exclusion from the English full-first-year opportunity set, with a future intake recheck. A recognisable institution photograph or English-language marketing page cannot establish an English-taught degree. No public institution card, route, programme or image should be introduced for this unit on that basis.

I read `docs/QA_CRITIC_LOOP.md`, `docs/HOURLY_UNIVERSITY_WORKFLOW.md`, ADR 0008, `docs/PAGE_TEMPLATES.md`, `docs/research/schools/PARITY.md` and `docs/IMAGE_STANDARD.md`. Final scores are held pending the stable worker report, actual discovery-row disposition, and dispatcher evidence from the clean release gate and public-surface absence check.

## Actual pixels inspected

These are local research-cache files, not published assets. I opened each file with the image viewer on 2026-11-04. I did not judge them from filenames, metadata or a worker summary.

| Opened file | What the pixels show | Pixel/publication assessment |
|---|---|---|
| `D:/ibp-tmp/dnam-20261104/institution-esbjerg.jpg` | An eye-level, daylight red-brick institutional building, framed by trees and shrubs; no logo, map or event. | A plausible place portrait, but the observed 600×337 file is small. Exact official source and subject corroboration still awaited at this initial stage. Withheld for the internal-only unit; this is not a public image approval. |
| `D:/ibp-tmp/dnam-20261104/electronic-ba-share.jpg` | A person working with electronic sound equipment in an installation-like space; layered reflections, red clothing and warm projected light. | Strong discipline atmosphere, but 720×1080 portrait composition. It fails the official degree-photo landscape floor in `IMAGE_STANDARD.md`; do not silently crop or imply an approved landscape hero. Withheld. |
| `D:/ibp-tmp/dnam-20261104/mpu-share.jpg` | Children seen from behind facing music educators and a flute demonstration in a teaching room. | Clear music-pedagogy context, landscape 1023×683. The foreground children dominate and the image is not an institution/place portrait. Its programme-page context could support the discipline subject for a future eligible programme; it does not support English provision. Withheld. |

The cached `electronic-ba-en.html` identifies `https://www.sdmk.dk/fileadmin/user_upload/Fotos/Fotos_2026/Esbjerg/De_ventende-110.jpg` as its Open Graph image. The cached `mpu-en.html` identifies `https://www.sdmk.dk/fileadmin/user_upload/Fotos/MPU.jpg` as its Open Graph image. The latter's canonical page is `https://www.sdmk.dk/en/studies/musician-and-music-educator-ba` and explicitly limits the programme to Danish/Nordic-speaking applicants. These official-server/page associations establish source context, not an open licence or permission to rehost. No photographer or open licence has been verified. No image-manifest review or human sign-off is claimed.

## Scope and shared-format boundary

The cached responsible language page, `https://www.sdmk.dk/en/study/english-speaking-applicants/language-requirements` (`D:/ibp-tmp/dnam-20261104/language-en.html`), says solo lessons can be in English by agreement while group teaching is in Danish. This is material to withholding an unsupported English full-degree offering; it must not be flattened into either a universal English programme claim or a rejection of all foreign applicants.

Initial repository search found no matching public institution/degree/image data or source route for the exact reserved key, SDMK, Danish National Academy of Music or Syddansk Musikkonservatorium. This is only an initial source-tree check, not proof of the final clean build's contents.

There is no proposed student-facing page to rate at phone/desktop widths. Full-page visual quality and interaction parity are **not applicable**, and no screenshots of nonexistent routes are required or claimed. An accepted internal identity/scope report will not establish complete institution information parity under ADR 0008: IB interpretation, selection, fees, dated application steps, documents, student support and other relevant public portrait/programme categories remain outside this bounded exclusion review.

## Final outcome

The scores were deliberately withheld in the initial critique until the stable report, applied row, actual clean build and absence evidence became available. The final scoped scores at the top supersede that initial pending state. The completed clean release gate is recorded below.

## Stable worker report follow-up

I opened the complete worker report at `docs/research/imports/hourly/2026-11-04-dk-danish-national-academy-of-music.md`. It retains the internal-only boundary, explicitly scopes autumn 2027, recommends a **2026-11-20** recheck before the annual December application pattern, and avoids promoting an undated annual deadline into a 2027 fact. The report distinguishes source evidence, historical catalogue data, current scope and deferred intake work.

I then corroborated the building source against the actual cached `about.html`: the [official about page](https://www.sdmk.dk/om-sdmk/om-sdmk) embeds [this 600×337 derivative](https://www.sdmk.dk/fileadmin/_processed_/8/5/csm_SDMK_Esbjerg_bec3081753.jpg), with alt text identifying SDMK Esbjerg as seen from H.C. Ørsteds Gade. This resolves the initial subject/source question. The file is an honest campus image, but the derivative is below the 720 px official-photo publication floor. No author or open licence is established by the inspected markup; the TYPO3 software copyright notice is not photo permission. The report's descriptions of the three actual images agree with my independent pixel inspection. No image is added to a manifest, approved or hosted.

The report addresses the common information categories as scoped findings or reasons for withholding an English Opportunity rather than adding arbitrary schema fields. It explicitly leaves costs, qualification-specific admissions and documents unimported where no in-scope English route exists. This is good bounded information practice; it remains distinct from a completed public institution portrait or complete English institution-information parity. The actual discovery row was still unmodified when read at this stage, so final acceptance continues to await dispatcher application and clean-release evidence.

## Applied discovery-row check

I subsequently reopened `docs/research/imports/discovery-candidates.json` after the dispatcher edit. The original key and both national-catalogue leads are retained; `scope` is `none`; disposition is `researched-exclusion-current-danish-group-teaching`; sources and retrieval date are recorded; the structural gap is the 2027-announcement recheck on **2026-11-20**. The caution preserves SDMK identity, the solo/group distinction, MPU's Danish/Nordic restriction and the internal-only boundary. Existing place IDs `dk-esbjerg` and `dk-odense` correctly match the named cities in their actual `data/places/` records. No guessed canonical alias target or private public-schema field appears in this row. Clean-release/public-output verification remains pending.

## Clean candidate output and scores

The dispatcher reports an actual successful 54.5-second clean candidate build from base `8891ea757805519b718af961f19bb770317ee4f6`, candidate tree `c9ab65e19903837f0bf646b8fd7eb2febd570ec3`. I opened and independently ran `.cache/check-dnam-absence.mjs` against its clean output at `D:/ibp-tmp/absalon-release-20261030`. It passed: no public SDMK institution/programme/route or HTML, and **43 discovery JSON files** checked. The probe inspects the loaded public graph, both the reserved-key and `dk-sdmk` university route paths, every compiled HTML file, and every discovery JSON file. No public asset changes are proposed. This is direct output evidence; the local directory's older name is not used as a claim about the current build identity.

- **Imagery-publication disposition: 9/10, accepted.** All three real files were opened, useful subject/source findings were preserved, portrait/small-image limitations are explicit, and nothing is published to imply an unsupported English degree. This score assesses honest withholding and evidence, not a claim that all three candidates have 9/10 pixel quality or are approved public assets.
- **Shared internal format: 9/10, accepted.** The bounded outcome uses existing discovery fields, correctly scoped sources/caution, real campus Place IDs and a dated recheck. It follows the shared information contract without introducing bespoke public records or template branches. The unchanged public output agrees with that boundary.
- **Full-page visual quality and public phone/desktop interaction parity: N/A.** There is no new page or card to photograph. No eight-screen screenshot set or other nonexistent surface is invented. Complete English institution-information parity is not established by this internal identity/scope outcome.

No blocking correction remains within this visual/scope review. If English full-first-year provision is later established, the highest-value follow-up is to collect the full shared admissions/institution contract, reopen the source ladder for a landscape institution image at adequate resolution and suitable programme images, and review the real public crops at phone and desktop widths before publication. Recheck the scope on **2026-11-20**, or earlier on a material official announcement.

## Final release evidence

The dispatcher reported clean-gate exit 0 for candidate tree `c9ab65e19903837f0bf646b8fd7eb2febd570ec3`. I independently opened the tail of `D:/ibp-tmp/dnam-gate-v1.log`: it records the 54.5-second build, passing public structure/link checks, templates, images, programme images, unique images, release guard, and the final **“All 43 checks pass.”** Only the existing advisory freshness check is reported. The applied registry row remains that gated version; the remaining review/report edits are documentation only. This confirms the clean gate and absence boundary, not a visual review of a nonexistent public page or publication to `origin/main`. Git/publication verification belongs to the dispatcher.
