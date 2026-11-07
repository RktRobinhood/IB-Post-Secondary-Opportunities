# IBA — photo editor and art director critique, round 1

Run: `fe8ee962-a593-4652-8c75-1f7f5fb0c6ea` · 7 November 2026.

Reviewer: Codex, independent photo editor/art director agent
`/root/iba_visual_maintainer`.
Scope: one IBA institution and its online first-year BA (Hons) International
Business Management, using the established shared university/programme templates.

## Status

**Final: institution source/crop 8.5/10; online BA source/crop 8/10;
rendered imagery and student experience 8.2/10; shared format 8.4/10 — accepted
for the bounded online BA improvement.** Full institution public information
parity remains separately deferred at 6.4/10 in the admissions review.

Metadata, a worker's description, or a successful image/schema check cannot stand
in for opening the actual photographs and rendered crops. The final verdict will
record the precise files inspected, distinguish source quality from crop/rendered
quality, and check that the online programme does not visually promise attendance
at IBA's Kolding campus.

## Review basis

Read `docs/QA_CRITIC_LOOP.md`, `docs/adr/0008-shared-templates-define-information-quality.md`,
`docs/PAGE_TEMPLATES.md`, root `CONTEXT.md`, and `docs/IMAGE_STANDARD.md`.
Opened IBA's official campus-premises page and the exact online BA source page on
7 November 2026. Final source verification must associate each selected image
with the real source page, credit and official linked-image usage basis.

The acceptance threshold is 8/10 separately for source-image choice and rendered
student experience. Full institution information parity is a distinct verdict;
this image/template review cannot declare the remaining portfolio complete.

## Actual source pixels inspected

Opened `D:/ibp-tmp/iba/campus-sunrise.jpg` (1600×1045) and
`D:/ibp-tmp/iba/online.jpg` (913×720) through the image viewer on 7 November.

- **Institution candidate: 8.5/10.** The red-brown modern IBA building, bridge,
  stream and reflected lights form a convincing real place. The building is
  large enough to read, with an attractive relation to the water and trees.
  Exposure is dark but deliberate; this is not a logo, sign, car park or event.
  [Official image](https://iba.dk/wp-content/uploads/2024/03/solopgang-iba-5-1600x1045.jpg),
  published on IBA's [premises page](https://iba.dk/international/the-ibas-new-premises/).
- **Online BA choice: 8/10, accepted at source and centre crop.** The sharp landscape shows a woman with a headset behind
  office monitors. Her face and headset read clearly; a peripheral monitor brand
  is minor. It conveys remote professional work, not documentary evidence of
  teaching. Its use is acceptable under the explicit official degree-image
  policy, with an accurate caption; a BSc campus/social photograph would be a
  worse description of an entirely online BA. [Official image](https://iba.dk/wp-content/uploads/2026/06/camilla-juler-5-web-aspect-ratio-913-720.jpg),
  published on the [exact online BA page](https://iba.dk/international/online-programmes/bachelor-honours-international-business-management-e-ba/).

Independently opened the worker's actual 480×300 centre-crop files
`D:/ibp-tmp/iba/online-crop.jpg` and `D:/ibp-tmp/iba/campus-crop.jpg`. The campus
building/bridge/reflection stay legible. The BA face, headset and hand gesture
survive; the monitors frame the scene rather than obscure it. Both selections
are accepted, subject to their actual rendered use below.

Read the current `scripts/lib/official-image.mjs`: `MIN_WIDTH` is **720**, with the
documented owner decision dated 1 October. The earlier report's 960px constraint
was stale. The original 913×720 BA source passes the current floor without
enlargement. A final official linked-image record must name IBA's credit and
source page without claiming a free licence or permission to host the bytes.
No photographer is credited in the evidence seen.

## Final rendered review

Inspected the final clean snapshot `cbb6464ac5c2459ebf97c40c2bd977d51579c76d`
after its release gate completed exit 0, all 43 checks passing. The release
output reviewed is `D:/ibp-tmp/absalon-release-20261030/dist`. Opened all twelve
actual screenshot files below, then inspected them with `view_image` detail
`original` and explicit original-detail image forwarding. Desktop width is 1280px;
phone width is 390px; both themes are represented.

| View | University | Programme | Expanded official credits filtered to IBA |
|---|---|---|---|
| Desktop light | [image](iba-shots-20261107/university--desktop-light.jpg) | [image](iba-shots-20261107/programme--desktop-light.jpg) | [image](iba-credits-20261107/credits--desktop-light.jpg) |
| Desktop dark | [image](iba-shots-20261107/university--desktop-dark.jpg) | [image](iba-shots-20261107/programme--desktop-dark.jpg) | [image](iba-credits-20261107/credits--desktop-dark.jpg) |
| Phone light | [image](iba-shots-20261107/university--phone-light.jpg) | [image](iba-shots-20261107/programme--phone-light.jpg) | [image](iba-credits-20261107/credits--phone-light.jpg) |
| Phone dark | [image](iba-shots-20261107/university--phone-dark.jpg) | [image](iba-shots-20261107/programme--phone-dark.jpg) | [image](iba-credits-20261107/credits--phone-dark.jpg) |

The university opens with an appealing, real campus setting. The building stays
recognisable behind the large, readable title on phone and desktop; the dark
exposure and shared veil leave adequate separation for the white copy. The BA
card keeps the face/headset readable and explicitly says Online. Its own page
opens with entirely-online delivery, Leeds Beckett award and the 3–6-year range;
the Where fact remains Online at phone width. Kolding is retained at institution
level without becoming degree attendance. Both page levels use the established
fact bands, disclosure rows, deadline panel and evidence treatment.

The programme hero's wide desktop crop sacrifices some upper face, and the phone
headline crosses the portrait. These limit the image score rather than fail it:
the headset/office scene is still recognisable and the copy remains legible.
If the provider publishes a wider remote-learning scene later, review it as a
possible improvement; do not invent a campus-study image or upscale this source.

The credits screenshots expose the actual official-image table, not a discipline
pool. Both IBA image rows have an institution-owned source-page link and the
linked-not-copied usage basis. The campus row honestly says photographer not
named; the BA row names IBA. Hero captions also name IBA. No freely licensed or
hosted-image claim is made. Tables stack legibly on phone in both themes.
The browser `.images.json` evidence records both actual natural dimensions
(campus 1600×1045; BA 913×720) and `complete: true`; the actual screenshots also
show the loaded photographs rather than a placeholder.

An initial resized multi-image preview appeared to omit several dark-mode hero
titles. I raised that concern, then withdrew it after reopening the same original
files with explicit original detail: the full title/lede pixels are intact.
No recapture, source change or fictional screenshot fix was made. Final scoring
is based on the originals, not that misleading preview.

The useful next improvements are a wider official BA image if one becomes
available, shorter qualification prose once the source conflicts are resolved,
and completion of the remaining institution portfolio. They are not visual
blockers for this supported partial slice. The admissions review's **8.3/10 safe
slice / 6.4/10 full parity**, with recheck **15 January 2027**, remains separate.
