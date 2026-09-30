# Poland degree photos: photo editor, round 1, 3/10 (30 Sep 2026)

I judged `contact-sheet-round-1.jpg` (19 photos) and read all 19 lines in
`docs/research/programme-images/schools-pl.jsonl`. I opened every doubtful crop at
720 px (`src/assets/img/programmes/school-pl-*-720.webp`). I checked the repeats
side by side with the stored crops of the accepted cards they resemble:

- `school-de-tum-aerospace`
- `school-de-constructor-robotics-and-intelligent-systems`
- `school-it-sapienza-medicine-and-surgery-f`
- `school-fi-metropolia-laboratory-science`

I searched every other `schools-*.jsonl` and `data/programme-images.json` for the
subjects of this batch.

## Score: 3/10

Only three cards are strong: 1 rubber dam on a phantom, 5 surgeon's headlight and
16 NMR tubes. Twelve break a hard rule or show no degree being done:

- **A child in frame, at an event.** 3 is a rescue drill, and the casualty in the
  foil and body bag reads as a small child.
- **Legible text naming another university.** On 10, "PUT" (Poznan University of
  Technology) is painted on the fuselage, on a Warsaw card.
- **Straight repeats of accepted subjects.** 8 is Germany's CubeSat, 9 is Germany's
  Mars rover and 6 is Italy's pathology microscope.
- **No discipline being done.** 13 is a postcard, 12 is a cave wall, 2 is a still
  life of tools, 18 is a 1910s factory plate and 19 is an electrician at a box.
- **The generic wide lab shot.** 17 is also from the wrong university: Wroclaw
  University of Science and Technology, not the University of Wroclaw.
- **A face as the subject.** In 4, the US Army medic's profile fills the frame and
  the suturing is small in the corner.

Warsaw University of Technology (PW) loses all four of its cards.

**With the 12 rejects below removed, the remaining 7 score 7/10. They score 8/10
once 14 is recropped as described.**

## Every photo

| # | Key | Verdict | Reason |
|---|---|---|---|
| 1 | `school-pl-pums-dentistry` | keep | A rubber dam stretched over a phantom's teeth with a clamp on the molar. It is specific, tactile and textless, and new to the catalogue (ES has a chair, IT a wax crown). |
| 2 | `school-pl-wum-dentistry` | **reject** | A still life of pliers and a petri dish on a tray, soft and grey. Nothing is being done, and at 480 px it could be a jeweller's bench. It is also close to ES CEU's instrument tray. |
| 3 | `school-pl-mug-doctor-of-medicine` | **reject** | Event photography (the Ustka rescue manoeuvres) with a figure that reads as a child laid in a black body bag. There is also a toy dog on a mat and a box marked "PIES". It is lifeguard first aid, not a medical degree, and it would be distressing on a card. |
| 4 | `school-pl-pums-medicine` | **reject** | The medic's face in profile is the subject. The needle and the pig's foot are small at the lower left, and an "ARMY" shirt shows. At 1800 × 1200 there is no 16:10 crop that holds the hands and drops the face at card resolution. |
| 5 | `school-pl-uj-medicine-program-in-english` | keep | A masked surgeon's headlight and loupes, filling the frame: operative medicine, unmistakable at card size. The eye is cropped and not identifiable, the loupe lettering is illegible, and it is dark enough to hold the veil. |
| 6 | `school-pl-wum-medicine` | **reject** | A repeat of IT Sapienza medicine (a pathology microscope and slide). It is also an NIH studio pose on seamless blue, not medicine being done. |
| 7 | `school-pl-mug-bachelor-of-nursing` | keep, with reservation | A bright simulation ward with manikins in the beds. It clearly says nursing, but it is an empty room with no hands at work. It is the weakest keep. |
| 8 | `school-pl-agh-space-engineering` | **reject** | A repeat: DE TUM aerospace is already CubeSats being built. This is a beautiful frame, and the PW-Sat is Polish, but it is the same object. By Austria, a subject already used had become the main reason for rejection. |
| 9 | `school-pl-pw-mechatronics` | **reject** | A repeat of DE Constructor robotics: a student Mars rover with an arm on red terrain. The shot is also from the Utah desert, and "FedEx" and "KNR" badges sit on the chassis. |
| 10 | `school-pl-pw-aerospace-engineering` | **reject** | "PUT" and "04" are painted large and legible at 480 px, so the card names Poznan on a Warsaw degree. It is a static exhibit at the ILA Berlin air show, with crowd barriers across the top third. |
| 11 | `school-pl-put-automatic-control-and-robotics` | keep, with reservation | Students kneeling in the grass commissioning a multirotor under a storm sky. The discipline is being done and the subject is new. But it is PW's Absolute Edge team at Droniada, shown on a Poznan card, four faces are visible, and the drone itself is small. It would be more honest on a PW card (see directions). |
| 12 | `school-pl-agh-geology-of-natural-resources` | **reject** | A salt-crust cave wall in a show mine. There is no geologist, sample or tool, and at card size it reads as "a cave". The brief asks for the discipline being done; a texture is not that. |
| 13 | `school-pl-uj-earth-sciences-in-a-changing-world` | **reject** | A snowy Tatra ridge: a postcard landscape with nothing being studied. It would head a ski resort as well as a degree. |
| 14 | `school-pl-uwr-biotechnology` | **rescue by crop** | Plant callus in jars at a hood is a good, new subject. But the stored crop centres on the woman's face and hair and a yellow-cast wall, so it reads as "woman in a lab". Recrop from the 2475 × 3155 source to the lower-left: her hands, the jar and callus, and the jars along the hood floor, with the head out of frame. That still gives ~1500 px of width. Correct the yellow cast. |
| 15 | `school-pl-uwr-genetics-and-experimental-biology` | keep, with reservation | A tray of pink and violet stained sections. It is graphic and textless at 480 px (the "PFAL-16xx" labels are a few pixels). Histology is a loose fit for genetics, but the programme names it. A yellow sticky note at the top right should be cropped out if the file is ever recut. |
| 16 | `school-pl-amu-chemistry` | keep | Coloured NMR tubes against a dark ground: vivid and textless, and it survives both veils. FI Metropolia also has test tubes, but those are empty grey glass in soft focus. The two do not read alike, but no country should add a third tube rack. |
| 17 | `school-pl-uwr-chemistry` | **reject** | The generic wide lab shot, a man in a coat reaching for a shelf, with no hands at work. The file is "Doktorant Politechnika Wroclawska", a different university from UWr. On UWr's page it would also look like 14, a second person-in-a-lab card. |
| 18 | `school-pl-pw-power-engineering` | **reject** | An archival black-and-white Allis-Chalmers plate of a US turbine being assembled. It shows 1910s manufacturing, not power engineering a student would study now, and it goes flat grey under the veil next to colour cards. |
| 19 | `school-pl-pw-electrical-engineering` | **reject** | An electrician's back at a green cabinet, with a ladder, a paper notice and a legible "HV" plate. This is installation trade work, not an electrical engineering degree, and the frame is cluttered with the worker small. |

## Rejects (12)

- `school-pl-wum-dentistry`
- `school-pl-mug-doctor-of-medicine`
- `school-pl-pums-medicine`
- `school-pl-wum-medicine`
- `school-pl-agh-space-engineering`
- `school-pl-pw-mechatronics`
- `school-pl-pw-aerospace-engineering`
- `school-pl-agh-geology-of-natural-resources`
- `school-pl-uj-earth-sciences-in-a-changing-world`
- `school-pl-uwr-chemistry`
- `school-pl-pw-power-engineering`
- `school-pl-pw-electrical-engineering`

**Rescue by crop (1):** `school-pl-uwr-biotechnology`. It needs a recrop, not a new
photo.

## With the rejects removed: 7/10

The seven left are 1, 5, 7, 11, 14, 15 and 16:

- Three strong frames (1, 5, 16), none repeating another country.
- Two acceptable ones (11, 15).
- Two weak ones: 7 (an empty ward) and 14 as stored.

Recropping 14 to the hands lifts the set to **8/10**. No two kept cards at one school
look alike: at UWr, 14 recropped (hands at a hood) and 15 (slides on a tray) are
distinct.

## Directions for replacements (candidates, not prescriptions)

Four medicine cards and two dentistry cards must stay distinct from each other and
from what is used already:

- the phantom (PL 1) and headlight (PL 5);
- an ophthalmoscope on a manikin (DK), a blood draw (IT), a teaching microscope (IT);
- a dental chair (ES) and a wax crown (IT).

**Medicine and dentistry**

- **3 MUG medicine:** an ultrasound probe on an abdomen with the screen out of frame,
  or a plaster cast being applied. No event, no manikin, no child.
- **4 PUMS medicine:** hands only, suturing a skin pad (a different source), or
  auscultation with a stethoscope seen from behind the doctor.
- **6 WUM medicine:** ECG electrodes being placed on a chest, or a ward round seen
  from behind. Not a microscope.
- **2 WUM dentistry:** gloved hands pouring a stone cast or taking an alginate
  impression, or a handpiece with water spray on a typodont. Not a phantom head,
  a chair or a tray.

**Engineering**

- **8 AGH space engineering:** anything but a CubeSat. Options: a ground-station dish
  being aligned, a stratospheric balloon launch, or a student rocket on its rail.
- **9 PW mechatronics:** anything but a rover. Options: hands wiring a prosthetic or
  robotic hand, or a desktop robot arm being calibrated (distinct from BE's servo
  arm and DK's saw-sharing cobot). No maker logo.
- **10 PW aerospace:** PW's own student rockets or gliders, or a model in a wind
  tunnel. A simpler fix: move photo 11 (it *is* a PW team) to this key and find
  PUT its own robotics photo, e.g. a line-follower or mobile robot on a test track.
- **18 PW power:** a colour photo of a modern plant in use. Options: engineers in a
  turbine or generator hall, or a thermal camera on pipework. Not a wind nacelle
  (DK) or solar crew (DE).
- **19 PW electrical:** a high-voltage laboratory arc or impulse-generator discharge,
  which PW has. It is dramatic and textless. Not a substation (ES) or an
  oscilloscope (DE).

**Earth sciences and chemistry**

- **12 AGH geology:** drill-core boxes laid out in a core shed, a hand specimen
  under a hand lens, or a geologist with a headlamp sampling a seam underground.
  Not a quarry slab being measured (already used).
- **13 UJ earth sciences:** scientists at work in the Tatra. Options: a snow-pit
  profile being logged, a weather mast being serviced, or a mountain stream being
  gauged. The mountains can stay as the backdrop, not the subject.
- **17 UWr chemistry:** hands at a separatory funnel with two layers, a burette drop,
  or crystals under polarised light. Not a flask rig (already used), flame tests
  (NL) or tubes (PL 16). It must come from UWr, or at least not be credited to
  another university.

## Light and dark

- 5, 16 and 6 are already dark and will read very dark under the dark veil. 5 and 16
  hold on the lamp and the coloured liquid.
- 1 and 7 are bright and survive both veils. 7's white walls go milky under the light
  veil.
- 15 is bright at the top with a black lower-left corner, which helps the title.
- 18 would be the only monochrome card in the country. That is one more reason to
  replace it.

## Round 2: 8/10 (30 Sep 2026)

I judged `contact-sheet-round-2.jpg`, the 5 survivors. The coordinator removed my 12
rejects and two more cards:

- `school-pl-uwr-biotechnology`: its recrop was not possible from the stored crop.
- `school-pl-put-automatic-control-and-robotics`: a Warsaw team on a Poznań card.

Both removals are right. They were the two weakest keeps, so the set improves without
them.

**Score: 8/10. Accept. No further rejects.**

- **Strong: 1, 2 and 5.** The rubber-dam phantom, the surgeon's headlight and the
  NMR tubes. Each is the discipline being done or its unmistakable tool, textless at
  480 px, and new to the catalogue.
- **3 nursing (MUG): kept, but it is the weakest card.** An empty simulation ward
  with no hands at work. It still says nursing at a glance, which ISEG's classroom
  (PT round 1) did not say about management. It is first in line for a better photo
  of hands at a bedside.
- **4 genetics (UWr): kept.** The slides are graphic and the labels illegible at
  card size. The yellow sticky note at the top right is visible; crop it out if the
  file is ever recut.
- **No two cards look alike.** The survivors are all at different schools, and none
  repeats another country's subject. The FI tubes are grey and empty; PL 5's are
  coloured.

**Carried to the next pass:** 12 of 19 Polish programmes (14 counting the two
removals) now fall back to their school's photo. All four Warsaw University of
Technology cards are among them. Replace them using the directions above before
calling Poland's photos done.
