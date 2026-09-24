# Photo round 1: photo editor's critique

**SCORE: 7 / 10.** Not yet. The critic loop (`docs/QA_CRITIC_LOOP.md`) needs a fix-and-recritique round before this is accepted.

Critic: photo editor (Claude, round 1 of the photo loop), 24 September 2026.
Judged: the automated review of Denmark, Central Europe, Southern Europe and the rest of the world
(`docs/research/photo-review/{denmark,central,south,world}-verdicts.jsonl`), the 90 pinned replacements
in `data/images.json` (contact sheets `replaced-1..3.jpg`), the rejected official share images, and the built pages
`dist/destinations/{de,es,jp}/index.html`.

## Verdict in one paragraph

This round is a clear improvement, and it fixed real errors. Several of the old photos showed the wrong
institution: NOVA Lisboa had a canteen belonging to the *University of Lisbon*, THEi had an HKDI open-day booth,
JCU Singapore had a car park in Townsville, and Alma Mater Europaea had a Salzburg photo. The new ones show the
right place. The best of the new set is ready to publish: ETH from the Polyterrasse, LMU's fountain, Heidelberg's
Old University, Coimbra's Paço das Escolas, Ca' Foscari on the Grand Canal, Stanford Memorial Church, Yale Old
Campus, Hokkaido's ginkgo avenue, ICU's cherry-blossom "runway" and Yonsei's Underwood Hall. **None of my 27
spot-checks found a clearly wrong institution.** So the cap of 6 does not apply.

Three things keep it below 8:
1. **Photos were approved on the promise of a crop that never happened.** The notes for `hk-thei` ("crop parked
   cars at bottom"), `sg-jcu-singapore` ("crop bus-window railing") and `hk-cityu` ("crop watermark") assume a
   crop. `scripts/apply-photo-review.mjs` has no crop step, and the published WebPs are plain centre crops.
   `hk-thei` is now mostly car park. `sg-jcu-singapore` is shot through a moving bus window, with a
   motion-blurred rail across the foreground.
2. **About a dozen replacements are the right place but not a photo a 17-year-old stops for.** Some carry a
   big sign or banner (Bard, Otago Polytechnic). Some are dominated by a fence (Bocconi, Trento), cars (Zealand)
   or an empty car park (Zayed). Others are grim or generic: NOVA's chapel, a Maribor café corner for AMEU, a
   business-district skyline for IE, a rooftop aerial for AUTh.
3. **The "verified against the institution's own site" claim is not true across the board.** All 18
   Central Europe replacements (de/ch/cz/hu/pl/si) have `checkedAgainst: []`, including the uncertain ones
   (si-ameu, hu-oe, hu-sze). Most world replacements were checked only against a Commons category, not an
   official site. Denmark and Southern Europe were done properly.

## Spot-checks: replacements (27, all four regions)

Method: I checked each Commons file's categories, description, geotag and date through the Commons API. Where it
was in doubt I also checked the institution's own site or an official source, and I looked at the published
1600 px WebP in `dist/assets/img/places/`.

| Key | File | Place | Look | Verdict |
|---|---|---|---|---|
| zealand | Zealand - Sjællands Erhvervsakademi.jpg | Næstved, Femøvej (geotag 55.224, 11.757) ✓ | Road and two parked cars fill the bottom third; car-park signage | **WEAK** (cars) |
| sea | Erhvervsakademi Sydvest, Esbjerg.jpg | Esbjerg, cat. Erhvervsakademi SydVest ✓ | Bright red building, path, big "EA" wordmark on facade | OK (wordmark is architectural, acceptable) |
| royal-danish-academy | KADK campus - bust.jpg | Holmen (geotag 55.6816, 12.6040) ✓ | Sunny courtyard, 2009, busy | OK |
| de-bcb | Bard College Berlin Campus.jpg | Pankow, cat. Bard College Berlin ✓ | Students on stairs, but a large red "Bard College Berlin" banner takes a quarter of the frame | **WEAK** (banner/logo) |
| cz-vsb-tuo | VŠB-TU Ostrava, rektorát, Ostrava-Poruba.jpg | cat. Rectorate, VŠB-TU ✓ | Sunny plaza, sculpture | OK |
| hu-sze | Győr, Széchenyi István Egyetem, 9.jpg | cat. Széchenyi István University ✓ (not checked against sze.hu) | Serviceable, parked cars left, students walking | OK, borderline |
| hu-mome | MOMEfotoThalerTamas1.jpg | cat. MOME Master ✓ | Clean white portico under blue sky | OK |
| hu-oe | Óbuda University, Faculty of Economics, 2016 Józsefváros.jpg | cat. Óbuda University at Tavaszmező Street ✓ | Flat brick street facade | OK, dull |
| pl-put | Rektorat Politechniki Poznańskiej 03.JPG | pl. Skłodowskiej-Curie 5 (PUT rectorate) ✓ | Sunny red brick, a chimney | OK |
| si-ameu | Alma Mater Europaea, European Centre Maribor, Slovenia.JPG | AMEU's official address is Slovenska ulica 17, Maribor (almamater.si). The photo (2011) shows the corner with "Velika kavarna in slaščičarna", so plausible, but not confirmed | Reads as a café terrace in an old town, not a university | **WEAK**, place unconfirmed |
| es-ie | CTBA y Caleido en primer término 03.jpg | cat. Torre Caleido (IE Tower) ✓ | Five skyscrapers, and it is unclear which one is IE. Reads as "Madrid business district" | **WEAK** |
| es-upc | …Campus Norte - Edificio Vèrtex 2.jpg | cat. Vèrtex (UPC) ✓ | Orange monolith, steps, small UPC emblem, 2048 px | OK |
| pt-nova | Faculdade de Economia (Universidade Nova de Lisboa) 01.jpg | cat. chapel of the former Colégio de Campolide (NOVA's Campolide campus) ✓ | Weathered chapel behind a blank wall in the foreground. Also, the Faculdade de Economia left Campolide for Carcavelos in 2018 | **WEAK** |
| it-unitn | University of Trento (3).jpg | Povo science faculty ✓ | A blue fence fills the lower half | **WEAK** (fence) |
| it-bocconi | Nuovo Campus SANAA Milano 3.jpg | Bocconi SANAA campus ✓ | Seen through a perimeter fence, gravel foreground | **WEAK** (fence) |
| gr-uoi | Uoi entry-sculpture.jpg | cat. University of Ioannina ✓ | Entrance sculpture, hills, pleasant | OK |
| mt-gcm | Smart City, Malta.JPG | GCM's official address is "SmartCity Malta, SCM01, Ricasoli" (gcm.edu.mt) ✓ | Office block at dusk, pale | OK, dull |
| hk-thei | Thei Chai Wan Campus 2018.jpg | THEi Chai Wan twin towers ✓ (worldgbc.org, thei.edu.hk) | **About 40% of the frame is a car park of vans and MPVs.** The promised crop was never made | **WEAK: car park** |
| hk-cityu | 香港城市大学 … panoramio (1).jpg | Kowloon Tong ✓ | Cramped facade detail, scaffolding under the deck | **WEAK** |
| sg-jcu-singapore | 20241226 JCU SG campus.jpg | JCU Singapore, JCU banners visible ✓ | Shot from a bus: motion-blurred rail across the foreground, grey sky. The promised crop was never made | **WEAK** |
| cn-unnc | 2023-07-17 Trent Building, UNNC 08.jpg | geotag 29.806, 121.557 (Ningbo, not the UK Trent Building) ✓ | Clock tower over the lake | OK |
| us-asu | 2021 ASU, Tempe Campus, Old Main.jpg | Old Main, Tempe (geotag) ✓ | Handsome | OK |
| us-bowdoin | Bowdoin College Chapel … IMG 7793.JPG | cat. Bowdoin College Chapel ✓ | Granite spires, blue sky | OK |
| kr-yonsei-uic | Underwood Hall Front.jpg | Sinchon (geotag 37.566, 126.939). UIC teaches in Sinchon and Songdo ✓ | Ivy and formal garden | OK (strong) |
| ae-zu | ZU Dubai Campus.jpg | Only file in cat. Zayed University, Dubai Academic City ✓ | Hazy aerial with an empty car park across the whole bottom edge | **WEAK** (car park) |
| nz-otago-polytechnic | CORP campus CampusBuildings 009.jpg | Dunedin ✓ | A large blue "OTAGO POLYTECHNIC" sign in the left third | **WEAK** (sign) |
| kr-gist | GIST Student Union Building 2.jpg | Uploader's description says GIST; file is uncategorised | Brown winter lawn | OK, dull |

Totals: 0 WRONG PLACE, 12 WEAK, 15 OK. The contact sheets show the same pattern elsewhere. `gr-auth` is a
rooftop view over the city and the campus hardly reads. `ca-uvic` is a fountain that could be anywhere.
`kr-snu` is the gate seen across a road with a bus.

## Spot-checks: rejections (14, including 9 official share images)

| Key | Target | Rejection reason | My verdict |
|---|---|---|---|
| ch-usi | official | Motion-blurred people, giant USI lettering | **Right**: the lettering is the subject |
| de-mannheim | official | Posed portrait in a corridor | **Right** (the Commons palace photo is far better) |
| jp-tsukuba | official | Slogan overlay | **Right**: "IMAGINE THE FUTURE" plus a paragraph of text |
| es-comillas | official | Logo overlay | **Right**, narrowly. It is a good photo with a white logo in the middle |
| hu-univet | official | Seal over an aerial | **Right** |
| jp-aiu | official | Logo overlay on library | **Right** |
| jp-keio | official | Logo and name over building | **Right** |
| si-aluo | official | University of Ljubljana rectorate, not ALUO | **Right**: shared rectorate share image, wrong building |
| kr-yonsei-uic | official | 600×400, too small | **Right**, and a pity, because it is a lovely aerial |
| gr-unipi | commons | Panteion's old building, not Piraeus | **Right** |
| si-ag | commons | Academy of Music, *Zagreb* | **Right** |
| mt-mdx-malta | commons | Middlesex Hendon, London | **Right** |
| cn-nyu-shanghai | commons | Lujiazui building, vacated 2023 | **Right** |
| dtu | gallery:2 | Exam hall | **Right** |

The rejections are the strongest part of this round. I found no wrong rejection.

One inconsistency: **the reviewer approved `jp-handai`'s official image** (osaka-u.ac.jp, a close-up of blurred
cherry blossom and people, with no building in it). It rejected `si-um`, `si-gea` and `de-mannheim` for being
"not recognisably" the institution. By that rule, Osaka's image should be rejected too.

## Built pages

The dist pages are current: the new Heidelberg alt text is live.

**`dist/destinations/de/index.html`** (14 images): de.webp (Berlin skyline), de-tum, de-rwth, de-lmu, de-heidelberg,
de-hsrw, de-constructor, de-mannheim, de-fu-berlin, TU Berlin official (dusk aerial, good), de-bcb,
Frankfurt School official, WHU official, de-leuphana.
- `de-bcb`: banner (see above).
- `de-whu`: the official image beats the approved Commons "Vallendar Marienburg 86.JPG". It shows a glass
  wall printed with the words "COURAGE … COMMUNITY", which is marketing text. **WEAK.**
- `de-hsrw` (grey sky over canal) and `de-leuphana` (white overcast sky): **WEAK** but acceptable.

**`dist/destinations/es/index.html`** (13 images): es.webp, es-uc3m, es-upf, es-uab, es-uam, es-ub, es-ucm,
es-upc, es-ie, es-unav, es-esade, es-deusto, es-comillas.
- `es-esade` ("ESADE Building 1 in Barcelona.jpg"): the big ESADE name board fills a third of the card. It was
  approved "with its name sign". **WEAK (logo)**.
- `es-ie`: the business-district skyline (above).
- `es-upf`: a flat street facade, dull.
- Deusto, Comillas (Commons), UCM and UC3M look good.

**`dist/destinations/jp/index.html`** (15 images): jp.webp (Fuji over Shinjuku, excellent), jp-utokyo, jp-kyoto-u,
jp-waseda, jp-keio, jp-sophia, jp-tohoku, jp-icu, jp-apu, jp-aiu, jp-kyudai, jp-tsukuba, jp-hokudai, jp-meidai,
Osaka official.
- The strongest page of the three.
- Weak: Osaka's blurred-blossom official image, `jp-tohoku` (steps plus a name sign), `jp-meidai` (a bus in
  front) and `jp-kyudai` (a road with cars in the foreground).

## Top fixes (in order of impact)

1. **`hk-thei`: replace.** The current image is mostly a car park, and the crop in the note was never
   applied. Use the October 2025 twin-tower photos in Category:2025 in THEI, Chai Wan, for example
   https://commons.wikimedia.org/wiki/File:HK_柴灣_Chai_Wan_永泰路_Wing_Tai_Road_October_2025_N13P_13.jpg
   (4080 px, blue sky, towers only). It has a small "REDMI NOTE 13 PRO" camera stamp bottom-left, which needs
   cropping, which needs fix 2.
2. **Add a real crop to the pipeline, or stop approving on "crop X".** `apply-photo-review.mjs` has no crop or
   focal step. Either add a `crop`/`focus` field to the review (e.g. keep the top 70%) that `image-standard.mjs`
   honours, or treat every "crop …" note as a rejection. Keys affected now:
   - `hk-thei`
   - `sg-jcu-singapore`: with a crop that drops the bottom 35%, the JCU building and screens remain. With no
     crop, go back to the official image. Commons has nothing better: "SPRING building, James Cook University,
     Singapore.jpg" is only 480 px.
   - `hk-cityu`
3. **`es-ie`: use the tower itself, not the skyline.**
   https://commons.wikimedia.org/wiki/File:Caleido-IE-31102022.jpg (4032 px). IE Tower from its plaza, with
   the sculpture and terraces; this is clearly the campus.
4. **`de-bcb`: lose the banner.** https://commons.wikimedia.org/wiki/File:ECLA_of_Bard_campus,_2012.jpg
   (1600 px). Two students on the Pankow lawn, green and warm, no signage. As a building-only alternative:
   https://commons.wikimedia.org/wiki/File:Campus_Bard_College_Berlin.jpg (1200 px).
5. **`pt-nova`: swap the grim chapel for the Rectorate.** https://commons.wikimedia.org/wiki/File:Univ_Nova_Lisboa.jpg
   (1045 px). The white Rectorate on the Campolide lawn, with the old Colégio behind, under blue sky.
6. **`it-bocconi`: drop the fence.** https://commons.wikimedia.org/wiki/File:Nuovo_Campus_SANAA_Milano_2.jpg
   (3888 px). Same SANAA buildings over an open lawn. It is portrait, so check the 16:10 centre crop keeps both
   towers. Otherwise use Bocconi's own share image (the reviewer already cited unibocconi.it "ambientate" as a
   source).
7. **Fence, sign and car rejections the reviewer should have made.** For each, prefer the institution's official
   share image, or leave it at the approved previous state if that was better. The rule to record in the
   verdicts is "a sign, fence, car or car park may not take more than about 20% of the frame".
   - `it-unitn`: fence. A cleaner Povo view with the Alps is
     https://commons.wikimedia.org/wiki/File:Trento-university-science-faculty-2010.jpg, but it has a crane,
     so prefer unitn.it.
   - `nz-otago-polytechnic`: sign. No clean Commons alternative; prefer the official image.
   - `zealand`: cars.
   - `ae-zu`: car park. The only Commons file; prefer the official image.
   - `es-esade`: name board.
   - `de-whu`: the official image with slogan text. Switch the site to the approved Commons "Vallendar Marienburg 86.JPG".
8. **`jp-handai`: reject the blurred cherry-blossom official image,** the same rule applied to si-um and
   de-mannheim. Fall back to the Commons record, or better, a Toyonaka or Suita campus building.
9. **Fill in `checkedAgainst` for the 18 Central Europe replacements.** At minimum, check `si-ameu`, `hu-oe` and
   `hu-sze` against almamater.si, uni-obuda.hu and sze.hu. For `si-ameu`, if the pictured building is not
   Slovenska ulica 17, the right answer is no photo rather than a café.

If fixes 1–7 are made, the Top-fix keys stop reading as "right place, wrong moment". I would expect the
next round to score 8.
