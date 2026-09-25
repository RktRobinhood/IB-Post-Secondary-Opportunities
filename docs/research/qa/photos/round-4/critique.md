# Photo round 4: photo editor's critique

**SCORE: 8 / 10.** Accepted. Under `docs/QA_CRITIC_LOOP.md` this can be committed. The fixes below are follow-ups, not conditions.

Critic: photo editor (Claude, round 4 of the photo loop, fresh agent), 24 September 2026.

What I judged:
- `round-3/critique.md` (7/10), `round-3/iteration.md`, `docs/research/photo-review/iteration-4-verdicts.jsonl` (357 lines), and the round-3 contact sheets `applied-1..4.jpg`, which I looked at as images;
- my own build, `node src/build.mjs` with `SITE_BASE` unset (152 pages, no EBUSY);
- `node scripts/test-image-records.mjs`, which reports: ok, 511 pictures in 492 records agree with their Commons page, file on disk and review; 523 verdicts applied;
- the stored WebPs in `src/assets/img/places/`, viewed at the served crops. My sheets are in this folder:
  - `sample-1.jpg` … `sample-5.jpg`: the random sample, at 16:10;
  - `home-doors-9x11.jpg`, `home-doors-as-served.jpg` and `home-reel-4x5.jpg`: the home page;
  - `panel-candidates.jpg`: Commons options for some of the new panels.

## Verdict in one paragraph

Round 3 asked for four things, and all four are done properly:
- the two rule-breaks it named are gone;
- the false claim of a human approval is withdrawn everywhere it appeared;
- the four sample failures are replaced, and each is checked against the institution's own site;
- the long tail has been swept: 350 pictures, 77 rule-breaks found, 68 replaced and 19 retired to panels.

The sweep worked. In a fresh random sample of 56 live photos that no critic had named, **1 breaks a rule outright (1.8%; round 3 found 8%)** and 8 are borderline (14%; round 3 found 19%). Every one of my 9 place checks against an official site matched. The replacements are mostly the kind of picture a 17-year-old would stop for. Examples: Wills Memorial from below, the Maughan Library towers, the Palazzo Bo courtyard, Castello del Valentino, Hof van Liere, Johnson Chapel, UCPH's Frue Plads, and REC over the Nieuwe Achtergracht. What keeps this from a 9 is a thin layer of weak-but-legal photos, and one sweep approval that says something untrue.

## 1. Round 3's top fixes

| Fix | Status | Evidence |
|---|---|---|
| `at-jku` car park | **Done** | Now *JKU Campus Buildings.jpg*: lawn, the Gigant sculpture, the Keplergebäude. No cars. jku.at confirms the Keplergebäude is on the campus pond. |
| `ucph` gallery Pride banner | **Done** | `images.json` has it `rejected`. `dist/universities/dk-ucph/` serves only `ucph`, `ucph-2` and `ucph-4`, and contains no "Pride". |
| False "previously approved by human review" | **Done** | Neither `data/images.json` nor any verdict file contains the phrase. `denmark-verdicts.jsonl:26` now says the claim was removed. The new reject note says so openly. |
| `ch-unige` | **Done** | *Uni Bastions 01.jpg* (CC0). unige.ch: Uni Bastions, 1868–71, in the park, Faculty of Letters. |
| `kr-skku` | **Done** | Bicheondang in front of the 600th Anniversary Hall. |
| `hk-hkbu` | **Done** | The AAB, now the Dr. Wu Yee Sun Building. The iteration found that it is on Baptist University Road Campus, not Ho Sin Hang, which is a correction the round-3 critic missed. The facade lettering is part of the building. |
| `nl-uva` | **Done, and better than asked** | Commons did have a clean Roeterseiland file. It shows the REC bridge building over the canal in summer. uva.nl lists REC B/C/D at Nieuwe Achtergracht 166. |
| The sweep | **Done** | 15 sheets. My sample below is the test of it. |
| `at-wu-vienna` in the reel | **Done** | The Library & Learning Center over a flowerbed. No handrails at 4:5. |
| `au-utas` note | **Done** | Corrected to 6–7%. |
| Official-site issue | **Drafted** | `round-3/issue-official-site-checks.md`. Not yet filed. |

## 2. Random sample: 56 live main photos not named in any critique

**Method.**
- Pool: every main photo (`record.src`) referenced from `dist/` whose key appears in none of the round 1–3 critiques. That is 269 of 433 live main photos.
- Order: the pool is sorted by key and then shuffled with a Fisher–Yates shuffle driven by mulberry32, **seed `20260924`**. I took the first 56.
- The sample holds about 13 of this iteration's replacements (cz-usb, cn-xjtlu, it-unipd, pl-pums, at-meduni-wien, nl-wur, cn-fudan, ie-maynooth, fr-paris-saclay, fi-uoulu, pt-u-porto, us-nyu, be-uliege). The rest are pictures the sweep re-approved, so it tests both halves of the iteration.
- Viewed at 16:10 on `sample-1..5.jpg`. Close calls were viewed again at 720 px.

**Clean (47):** se-ju, ca-uottawa, cz-usb, ch-unifr, cn-xjtlu, fr, ca-queen-s, ca-dal, ch-eth, se-mau, hu-semmelweis, lv-sse-riga, lt, au-deakin, hk-hku, cz-uct-prague, nz-waikato, at-plus, no-nord, fr-unistra, hu-szte, ch-unibe, it-unipd, pl-pums, at-meduni-wien, nl-wur, sg-lasalle, ca-york, lt-ku, cn-fudan, kr-handong, nl-tilburg, at-tu-graz, fi-lut, sea, ie-maynooth, fr-paris-saclay, fi-uoulu, gr-aueb, au-macquarie, ae, ca-waterloo, pt-u-porto, us-nyu, ca-mcgill, hu-ud, be-uliege.

Three of those are legal but weak:
- `ae`: a night marina with yachts under the Abu Dhabi towers, which is not much of a study destination for a hero;
- `cn-fudan`: the crop cuts the building in half;
- `cz-usb`: benches and a gravel bed take up the foreground.

**Outright rule break (1):**

| Key | Problem |
|---|---|
| `no-uia` (*University of Agder 01.jpg*) | **A road and kerb run across the bottom fifth.** Above it is a grass mound, and the buildings are small, distant and grey. It is a phone snapshot. Its iteration-4 approval says "no road … as a band", which is untrue. **Replacement:** [Hogskolen i Agder Gimlemoen.JPG](https://commons.wikimedia.org/wiki/File:Hogskolen_i_Agder_Gimlemoen.JPG) (public domain, 2816 px). At 16:10 it shows Gimlemoen's brick buildings across a lawn, with a footpath of about 8%. Gimlemoen is today's Campus Kristiansand, but check it against uia.no before pinning. The Grimstad option, *Campus Grimstad Main Building.jpg* (CC BY-SA 4.0, 1558 px), is weaker. |

**Borderline (8):** each has a car, a road, a sign or a flag at about 5–10% of the frame.
- `fr-essec`: a road with dashed markings at the bottom right, about 4%, plus the facade lettering;
- `fi-arcada`: asphalt at about 10%, already named as a tolerance;
- `lt-kaunas-uas`: four flagpoles, one flying the college flag, and a name pylon at the left;
- `lt-ktu`: the forecourt paving has white lines that read as parking bays, and there is a van;
- `hk-eduhk`: a walkway and a railing at the corner, already named;
- `ca-guelph`: an empty paved road or plaza fills about a quarter of the frame;
- `no-uib`: a row of parked cars along the facade (about 4%), a cobbled square and a lamp post;
- `lv-tsi`: three cars and a guard booth, already named.

**Rate: 1 of 56 outright (1.8%) and 9 of 56 weak or failing (16%).** Round 3 had 4 of 48 (8%) and 13 of 48 (27%). Across the ~269 unnamed live photos, that suggests about five outright breaks remain. That is a normal residual, not a pattern.

**One process note.** The sweep appended the same sentence to 254 approvals: "no road, car park, sign, banner, railing, construction or event as a band or the subject". `no-uia` shows the sentence can be false. A sweep note should record what the reviewer saw, as the named-tolerance notes do. A certificate pasted onto every line claims a check that the line does not prove.

## 3. Home page, as served

I served `dist/` myself (built with no base) and measured the images in the browser.
- **The doors are not 9:11 as served.** `.door` has `min-height: clamp(18rem, 42vh, 30rem)` and the image covers it. At 1024 px each door is about 233×250 (roughly square). At 375 px each is 343×240 (about 10:7). The `width="900" height="1100"` attributes, and the iteration's 9:11 check, describe a shape the page never shows.
- All three door photos hold at both real ratios (`home-doors-as-served.jpg`):
  - London at dusk and Fuji over Shinjuku are excellent;
  - the UCPH rooftop still leans. On a phone the text overlay covers the facade and leaves mostly roofs. The yellow "DENMARK" eyebrow is the hardest label to read of the three, against the busy tiles. That is an art-director point, and I would not change the photo for it.
- **Reel, 12 tiles at 4:5** (`home-reel-4x5.jpg`): clean. `gb-kcl`'s Maughan Library earns its tile back. `at-wu-vienna` has no railing. The two weakest are `fi-aalto` and `nl-thuas`, where an empty grey plaza takes the lower third to 40% of the tile. Both are real places and break no rule.
- The hero (TU Delft library) is unchanged and excellent.

## 4. Place: 9 replacements checked against the institution's own site

| Key | Photo | Official source | Result |
|---|---|---|---|
| `au-rmit` | Old Melbourne Gaol gatehouse | rmit.edu.au heritage page: the gaol's entrance gates came to RMIT in 1979, and the site is Building 11 | ✓. An odd choice for a university, but a real RMIT building |
| `nl-uva` | REC over the Nieuwe Achtergracht | uva.nl: REC B/C/D, Nieuwe Achtergracht 166 | ✓ |
| `hk-hksyu` | Research Complex, Braemar Hill | hksyu.edu campus facilities list the Research Complex, which holds 1,000+ residential places | ✓ |
| `jp-kyoto-u` | Kitashirakawa building, 1930 | zinbun.kyoto-u.ac.jp history: Spanish Romanesque, 1930, now the Humanities Informatics centre | ✓ place. It is a research annex, not somewhere an undergraduate studies |
| `gb-kcl` | Maughan Library | kcl.ac.uk: "on the right-hand side as you walk up Chancery Lane" | ✓ |
| `fi-tau` | Pinni B | tuni.fi: Pinni B, Kanslerinrinne 1, City Centre campus | ✓ |
| `at-jku` | Keplergebäude and lawn | jku.at: the Keplergebäude, on the long side of the pond | ✓ |
| `ch-unige` | Uni Bastions | unige.ch: Uni Bastions in the park, Faculty of Letters | ✓ |
| `lv-sse-riga` (sample) | Strēlnieku iela 4a | sseriga.edu: Eisenstein's 1905 blue-and-white Art Nouveau building is the school | ✓ |

**No wrong place found.** Not every place that is right is a good pick, though:
- `jp-kyoto-u` now shows a research annex;
- `hk-hsuhk` shows a student hostel courtyard;
- `hk-hksyu` shows a residential tower.

Each is defensible because every view of the main building has a road or signs, and each verdict says so. The ~248 live photos with no official-site check remain, and are tracked in the drafted issue. Nothing in my 9 checks, or in the round-3 critic's 9, suggests they hide wrong-place photos. They should not block this round.

## 5. Coverage: 44 → 61 panels

The panels from my build:
- all destination pages: **61 of 455**;
- `/denmark/`: 3 of 14 (Zealand, Dania, Absalon);
- worst pages: ae 10/14, **ee 6/10, lv 5/11**, be 4/14, si 3/7, mt 3/6, sg 3/13;
- every other page: 0–2.

**The trade is right.** `IMAGE_STANDARD.md` lists "Nothing" as a real option. A typographic panel says nothing false. A road, a car park or a UHasselt banner says the wrong thing about the place. I tested it by looking myself for clean Commons files for six of the new panels (`panel-candidates.jpg`):

| Key | Best Commons option | Verdict |
|---|---|---|
| `se-sse` | *At Stockholm 2019 305.jpg*: the dome, from the park side | Construction fencing and a soil heap along the bottom. The helper was right. |
| `be-uhasselt` | *Gevangenis Hasselt 17-06-2018 16-36-39.jpg* | A Belgian flag and two UHasselt banners hang at the centre. The helper was right. |
| `lv-rtu` | *Univer.jpg* (Kaļķu 1) | A row of parked cars along the bottom. The helper was right. |
| `ch-unilu` | *Uni-PH-Gebäude Luzern 01/02* | Cars, a van and P and POST signs; or a sign stele. The helper was right. |
| `es-comillas` | *Edificio Biblioteca …* | Snow, bare trees, a van. The Cantabria files are no longer the university's. The helper was right. |
| `kr-hanyang` | [Hanyang University 008.JPG](https://commons.wikimedia.org/wiki/File:Hanyang_University_008.JPG) (CC BY-SA 3.0, 3264 px) | **The one I would reconsider.** It is the green-roofed neoclassical old Main Building under a clear sky, with students walking across a shaded forecourt. People walking to class are not the subject and not a rule break, and the forecourt is campus paving, not a road. The helper held back for two reasons: the people are about 6% of the frame, and the building was not confirmed on hanyang.ac.kr. If hanyang.ac.kr confirms it (the helper thought it was the University History Museum), pin it. |

The helpers' notes (`round-3/replacements-g*.md`) show they looked at these same files and gave the same reasons. That is the evidence that "nothing clean exists" was checked, not assumed.

The cost falls on Estonia and Latvia, where half the cards are now panels. Commons is exhausted there. The next lever is the standard's own first preference: the institution's published image. `data/official-images.json` has no entry for `lv-ba`, `lv-jvlma`, `lv-rtu`, `lt-lmta`, `se-sse`, `fi-haaga-helia`, `hu-metu`, `be-uhasselt`, `be-kdg`, `kr-hanyang`, `gr-asfa`, `at-modul`, `ie-dkit` or `absalon`. The Estonian entries point to a shared DreamApply image and were rightly rejected. Running `fetch-official-images` against each institution's campus or "visit us" page, rather than only its home page, is the cheapest way to fill these.

## 6. Noted in passing

- While I worked, another agent rebuilt `dist/` twice, once with `SITE_BASE=/IB-Post-Secondary-Opportunities`, at 22:17. For a few minutes a local server showed an unstyled site. I rebuilt with no base before taking my browser measurements. The race is harmless to the deploy, but it will keep tripping reviewers.
- The iteration was inconsistent in one place. It overruled `ie-dkit`'s wind-turbine photo for having a strip of building under a big sky, then accepted `ie-ucd`, which is 45% lake with O'Reilly Hall as a thin strip. Neither breaks a rule. `ie-ucd` is weak.

## Top fixes (in order of impact; none blocks acceptance)

1. **Replace `no-uia`.** It has a road and kerb band, and a sweep approval that is untrue. Use [Hogskolen i Agder Gimlemoen.JPG](https://commons.wikimedia.org/wiki/File:Hogskolen_i_Agder_Gimlemoen.JPG) (PD) after checking Gimlemoen on uia.no. Failing that, show a panel.
2. **Stop the boilerplate certificate in sweep notes.** Future sweep approvals should say what the reviewer saw in that frame, not paste the same sentence 254 times. The fastest honest fix is to re-view the ~269 unnamed live photos at 16:10 for the patterns my sample found: road or kerb bands (`no-uia`), parked-car rows (`no-uib`, `lv-tsi`) and flag clusters (`lt-kaunas-uas`). I estimate about five fails and about 35 borderlines.
3. **Fill the Baltic panels from official sources.** ee 6/10 and lv 5/11. Fetch official share images from campus pages for the 14 panel keys that have no official entry (§5), and review them under the same rules.
4. **Reconsider `kr-hanyang`** with *Hanyang University 008.JPG* once hanyang.ac.kr confirms the building.
5. **Correct the door ratio.** The door images are about 1:1 on desktop and about 10:7 on a phone, not 9:11. Fix the `width`/`height` attributes, or at least the review method, so the next door check is made at the shape students see.
6. **File the official-site issue** (`round-3/issue-official-site-checks.md`, ~248 photos) and work it region by region, world first. It is not a blocker. Nothing in 18 checks across two rounds has found a wrong place.
