# Places for the 52 unplaced English-study institutions — log

Written as the work happens (6 October 2026). One line per institution:
`key → place id, lat, lon, precision, source`. Wikipedia coordinates were read
through the MediaWiki API (`prop=coordinates`, the article's primary/infobox
coordinates); Wikidata coordinates are the item's P625 (coordinate location).

## Resolved

- ae-sorbonne-abu-dhabi → ae-sorbonne-abu-dhabi, 24.4889, 54.4122, institution, https://en.wikipedia.org/wiki/Sorbonne_University_Abu_Dhabi
- au-utas → au-hobart-sandy-bay, -42.9047, 147.3228, institution, https://en.wikipedia.org/wiki/University_of_Tasmania
- au-griffith → au-griffith-nathan, -27.5526, 153.0539, institution, https://en.wikipedia.org/wiki/Griffith_University
- au-curtin → au-curtin-bentley, -32.0049, 115.8937, institution, https://en.wikipedia.org/wiki/Curtin_University
- be-uclouvain → be-louvain-la-neuve, 50.6696, 4.6123, institution, https://en.wikipedia.org/wiki/UCLouvain
- ca-york → ca-york-keele, 43.7731, -79.5036, institution, https://en.wikipedia.org/wiki/York_University
- ca-tmu → ca-tmu, 43.6577, -79.3802, institution, https://en.wikipedia.org/wiki/Toronto_Metropolitan_University
- ca-carleton → ca-carleton, 45.3831, -75.6976, institution, https://en.wikipedia.org/wiki/Carleton_University
- ca-manitoba → ca-winnipeg-manitoba, 49.8094, -97.1328, institution, https://en.wikipedia.org/wiki/University_of_Manitoba (primary "edu" coordinate)
- ca-guelph → ca-guelph-ontario, 43.5333, -80.2236, institution, https://en.wikipedia.org/wiki/University_of_Guelph
- ca-usask → ca-saskatoon-saskatchewan, 52.1297, -106.6328, institution, https://en.wikipedia.org/wiki/University_of_Saskatchewan
- cn-xjtlu → cn-suzhou-jiangsu, 31.2748, 120.7381, institution, https://en.wikipedia.org/wiki/Xi'an_Jiaotong%E2%80%93Liverpool_University (primary "edu" coordinate)
- cn-cuhk-shenzhen → cn-shenzhen-longgang, 22.6900, 114.2081, institution, https://en.wikipedia.org/wiki/Chinese_University_of_Hong_Kong,_Shenzhen
- cn-uic-zhuhai → cn-zhuhai-guangdong, 22.3531, 113.5161, institution, https://en.wikipedia.org/wiki/Beijing_Normal%E2%80%93Hong_Kong_Baptist_University
- cn-wku → cn-wenzhou-zhejiang, 27.9161, 120.6548, institution, https://en.wikipedia.org/wiki/Wenzhou%E2%80%93Kean_University
- de-leuphana → de-luneburg, 53.2289, 10.4011, institution, https://en.wikipedia.org/wiki/Leuphana_University_of_L%C3%BCneburg
- es-ceu → es-madrid-moncloa, 40.4430, -3.7163, institution, https://en.wikipedia.org/wiki/Universidad_CEU_San_Pablo
- fr-l-x → fr-palaiseau, 48.7125, 2.2100, institution, https://en.wikipedia.org/wiki/%C3%89cole_polytechnique
- gb-qmul → gb-london-mile-end, 51.5230, -0.0400, institution, https://en.wikipedia.org/wiki/Queen_Mary_University_of_London
- gb-birmingham → gb-birmingham-edgbaston, 52.4506, -1.9306, institution, https://en.wikipedia.org/wiki/University_of_Birmingham
- gb-leeds → gb-leeds, 53.8072, -1.5517, institution, https://en.wikipedia.org/wiki/University_of_Leeds
- gb-city-st-george-s → gb-london-clerkenwell, 51.5278, -0.1023, institution, https://en.wikipedia.org/wiki/City_St_George's,_University_of_London
- gb-nottingham → gb-nottingham-university-park, 52.9390, -1.1970, institution, https://en.wikipedia.org/wiki/University_of_Nottingham
- gb-ual → gb-london-holborn-ual, 51.5178, -0.1164, institution, https://en.wikipedia.org/wiki/University_of_the_Arts_London
- hk-lingnan → hk-tuen-mun-new-territories, 22.4100, 113.9830, institution, https://en.wikipedia.org/wiki/Lingnan_University
- it-cattolica → it-milan-cattolica, 45.4631, 9.1767, institution, https://en.wikipedia.org/wiki/Universit%C3%A0_Cattolica_del_Sacro_Cuore
- jp-handai → jp-suita-osaka, 34.8192, 135.5267, institution, https://en.wikipedia.org/wiki/University_of_Osaka
- lv-lbtu → lv-jelgava, 56.6669, 23.7603, institution, https://en.wikipedia.org/wiki/Latvia_University_of_Life_Sciences_and_Technologies (Jelgava Palace, the university's seat)
- nl-thuas → nl-the-hague, 52.0675, 4.3242, institution, https://en.wikipedia.org/wiki/The_Hague_University_of_Applied_Sciences
- nl-auc → nl-amsterdam-science-park, 52.3554, 4.9518, institution, https://en.wikipedia.org/wiki/Amsterdam_University_College
- nl-ucu → nl-utrecht-kromme-rijn, 52.0833, 5.1478, institution, https://en.wikipedia.org/wiki/University_College_Utrecht
- nl-ucr → nl-middelburg, 51.4992, 3.6108, institution, https://en.wikipedia.org/wiki/University_College_Roosevelt
- pl-swps → pl-warsaw-praga, 52.2483, 21.0669, institution, https://en.wikipedia.org/wiki/SWPS_University
- pt-uac → pt-ponta-delgada-azores, 37.7458, -25.6636, institution, https://en.wikipedia.org/wiki/University_of_the_Azores (Ponta Delgada, the seat)
- sg-lasalle → sg-singapore-rochor, 1.3031, 103.8519, institution, https://en.wikipedia.org/wiki/Lasalle_College_of_the_Arts
- nl-wur → nl-wageningen-campus, 51.9853, 5.6637, institution, https://www.wikidata.org/wiki/Q422208 (P625; agrees with OSM's Wageningen Campus, https://www.openstreetmap.org/relation/13994344, 51.9854, 5.6632 — the Wikipedia article's own coordinate, 51.9671, 5.6586, sits in the town south of the campus, so not used)
- no-inn → no-lillehammer, 61.1501, 10.4225, institution, https://en.wikipedia.org/wiki/University_of_Inland_Norway (campus location map, point labelled "Lillehammer"; the first city in our record and the article's "biggest" campus)
- ee-euas → ee-tallinn-ulemiste, 59.4227, 24.7979, institution, https://en.wikipedia.org/wiki/Estonian_Entrepreneurship_University_of_Applied_Sciences (matches the official footer address "Suur-Sõjamäe 10a", https://euas.eu/en, and OSM https://www.openstreetmap.org/way/220608572)
- cn-nyu-shanghai → cn-shanghai-qiantan, 31.1508, 121.4770, institution, https://www.wikidata.org/wiki/Q13652966 (P625) = OSM https://www.openstreetmap.org/way/1065990056 "567 West Yangsi Road", the New Bund campus address on https://shanghai.nyu.edu/about/directions (Wikipedia's 31.2254, 121.5344 is the former Century Avenue building, not used)
- fr-emlyon → fr-lyon-gerland, 45.7414, 4.8378, institution, OSM https://www.openstreetmap.org/way/1046618901 (emlyon business school, Avenue Jean Jaurès, Gerland) for the official address "144 avenue Jean Jaurès 69007 Lyon" on https://em-lyon.com/en/campus/lyon; Wikidata Q1795504 agrees (45.7415, 4.8394). Wikipedia's 45.7861, 4.7639 is the former Écully campus, not used
- ae-birmingham-dubai → ae-dubai-academic-city-birmingham, 25.1319, 55.4226, institution, OSM https://www.openstreetmap.org/way/1133600372 ("University of Birmingham Dubai", Academic City) for the official address "Dubai International Academic City" on https://www.birmingham.ac.uk/dubai
- ae-rit-dubai → ae-dubai-silicon-oasis, 25.1303, 55.3897, institution, OSM https://www.openstreetmap.org/way/1296597443 ("Rochester Institute of Technology, Dubai", Dubai Silicon Oasis) for the official address "Dubai Silicon Oasis" on https://www.rit.edu/dubai/
- ae-sp-jain-dubai → ae-dubai-academic-city-sp-jain, 25.1243, 55.4115, institution, the Google Maps pin (3d25.1243356, 4d55.4114956) linked from the official campus page https://www.spjain.org/global-campus/dubai ("Block 5, Dubai International Academic City")
- be-thomas-more → be-mechelen, 51.0237, 4.4881, institution, OSM https://www.openstreetmap.org/way/50447286 (Zandpoortvest 60) for the registered address "Thomas More Mechelen-Antwerpen vzw, Zandpoortvest 60, 2800 Mechelen" on https://www.thomasmore.be/nl/contact
- be-howest → be-kortrijk, 50.8219, 3.2506, institution, OSM https://www.openstreetmap.org/way/668477553 (Marksesteenweg 58) for the head-office address "Marksesteenweg 58, 8500 Kortrijk" on https://www.howest.be/en/contact
- ch-eu-business-school → ch-geneva-lancy-pont-rouge, 46.1871, 6.1269, institution, the first "EU Geneva" map marker (Esplanade de Pont-Rouge 2, 1212 Lancy) in the page source of https://www.euruni.edu/en/Campuses/Geneva.html (a second marker, Route des Acacias 43, is at 46.1901, 6.1311)
- nl-rotterdam-uas → nl-rotterdam-museumpark, 51.9132, 4.4686, institution, OSM https://www.openstreetmap.org/way/404317974 ("Hogeschool Rotterdam, Museumpark") for the Museumpark 40 location on https://www.rotterdamuas.com/about/locations/museumpark/ (its central location of many)
- nl-fontys → nl-eindhoven-rachelsmolen, 51.4517, 5.4808, institution, OSM https://www.openstreetmap.org/way/150553268 ("Fontys Hogeschool Eindhoven, Rachelsmolen") for "Rachelsmolen 1, 5612 MA Eindhoven" on https://www.fontys.nl/en/Programmes/Associate-degree-ICT-ad-full-time/Our-campus.htm
- ee-baltic-methodist-theological-seminary → ee-tallinn-kadriorg, 59.4398, 24.7758, institution, OSM https://www.openstreetmap.org/way/26889130 (Tallinn Methodist Church, Narva mnt 51) for the address "Narva mnt 51, Tallinn" in the footer of https://emkts.ee/index.php/en/ (the record has no city; left as is)
- mt-its → mt-luqa, 35.8519, 14.4918, institution, OSM https://www.openstreetmap.org/node/12000506691 ("Institute of Tourism Studies", Ħal Luqa) for "ITS Malta, Aviation Park, Aviation Avenue, Ħal Luqa" on https://its.edu.mt/contact-us
- mt-st-martin-s → mt-hamrun, 35.8884, 14.4925, institution, OSM https://www.openstreetmap.org/way/739055923 ("Saint Martin's Institute", Triq Joe Sciberras) for "116, Triq Joe Sciberras, Il-Hamrun" on https://www.stmartins.edu
- mt-gcm → mt-kalkara-smartcity, 35.8908, 14.5403, institution, https://en.wikipedia.org/wiki/SmartCity_Malta for the address "SmartCity Malta, SCM01, Ricasoli" on https://gcm.edu.mt/contact (the point is the SmartCity development the college sits in; no closer map point for the college itself was found)
