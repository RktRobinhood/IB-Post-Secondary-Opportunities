/**
 * Outline countries from the IB Recognition Statements Database (owner, 9
 * October 2026: "superficial, quick, just so we can have the base … pins on
 * maps; the full fleshing out will come later").
 *
 * Reads data/harvests/ib-world-2026-10-09.tsv (every statement in a country
 * the site did not list, read in a browser) and the cities that
 * scripts/geocode-ib-world.mjs found for each. Writes, per country, an outline
 * profile in data/countries/<cc>.json (no Destination record, so it is not
 * held to the publication floor), a place per city, and the institution's IB
 * statement with its Evidence record. A country this script wrote carries
 * `"outline": "ib-world-2026-10"`; re-running rewrites only those, so a
 * country that has since been researched by hand is never overwritten.
 *
 *   node scripts/import-ib-world.mjs
 */
import fs from 'node:fs';
import { slugify } from '../src/lib/html.mjs';

const TSV = 'data/harvests/ib-world-2026-10-09.tsv';
const CITIES = 'data/harvests/ib-world-cities.json';
const TAG = 'ib-world-2026-10';
const ASOF = '2026-10-09';

/* code, adjective, region (data/geo/continents.json vocabulary), capital, currency */
const COUNTRIES = {
  'Argentina': ['ar', 'Argentine', 'South America', 'Buenos Aires', 'ARS'],
  'Armenia': ['am', 'Armenian', 'Caucasus', 'Yerevan', 'AMD'],
  'Azerbaijan': ['az', 'Azerbaijani', 'Caucasus', 'Baku', 'AZN'],
  'Bahrain': ['bh', 'Bahraini', 'Gulf', 'Manama', 'BHD'],
  'Barbados': ['bb', 'Barbadian', 'Caribbean', 'Bridgetown', 'BBD'],
  'Brazil': ['br', 'Brazilian', 'South America', 'Brasília', 'BRL'],
  'Bulgaria': ['bg', 'Bulgarian', 'Southeast Europe', 'Sofia', 'BGN'],
  'Cambodia': ['kh', 'Cambodian', 'Southeast Asia', 'Phnom Penh', 'KHR'],
  'Chile': ['cl', 'Chilean', 'South America', 'Santiago', 'CLP'],
  'Colombia': ['co', 'Colombian', 'South America', 'Bogotá', 'COP'],
  'Costa Rica': ['cr', 'Costa Rican', 'Central America', 'San José', 'CRC'],
  'Cyprus': ['cy', 'Cypriot', 'Southern Europe', 'Nicosia', 'EUR'],
  'Ecuador': ['ec', 'Ecuadorian', 'South America', 'Quito', 'USD'],
  'Egypt': ['eg', 'Egyptian', 'North Africa', 'Cairo', 'EGP'],
  'Ghana': ['gh', 'Ghanaian', 'West Africa', 'Accra', 'GHS'],
  'Grenada': ['gd', 'Grenadian', 'Caribbean', "St George's", 'XCD'],
  'Guyana': ['gy', 'Guyanese', 'South America', 'Georgetown', 'GYD'],
  'India': ['in', 'Indian', 'South Asia', 'New Delhi', 'INR'],
  'Indonesia': ['id', 'Indonesian', 'Southeast Asia', 'Jakarta', 'IDR'],
  'Israel': ['il', 'Israeli', 'Middle East', 'Jerusalem', 'ILS'],
  'Jamaica': ['jm', 'Jamaican', 'Caribbean', 'Kingston', 'JMD'],
  'Jordan': ['jo', 'Jordanian', 'Middle East', 'Amman', 'JOD'],
  'Kazakhstan': ['kz', 'Kazakh', 'Central Asia', 'Astana', 'KZT'],
  'Kuwait': ['kw', 'Kuwaiti', 'Gulf', 'Kuwait City', 'KWD'],
  'Lebanon': ['lb', 'Lebanese', 'Middle East', 'Beirut', 'LBP'],
  'Macao': ['mo', 'Macanese', 'East Asia', 'Macao', 'MOP'],
  'Malaysia': ['my', 'Malaysian', 'Southeast Asia', 'Kuala Lumpur', 'MYR'],
  'Mexico': ['mx', 'Mexican', 'North America', 'Mexico City', 'MXN'],
  'Monaco': ['mc', 'Monégasque', 'Western Europe', 'Monaco', 'EUR'],
  'Nepal': ['np', 'Nepali', 'South Asia', 'Kathmandu', 'NPR'],
  'Nigeria': ['ng', 'Nigerian', 'West Africa', 'Abuja', 'NGN'],
  'Oman': ['om', 'Omani', 'Gulf', 'Muscat', 'OMR'],
  'Pakistan': ['pk', 'Pakistani', 'South Asia', 'Islamabad', 'PKR'],
  'Panama': ['pa', 'Panamanian', 'Central America', 'Panama City', 'USD'],
  'Peru': ['pe', 'Peruvian', 'South America', 'Lima', 'PEN'],
  'Philippines': ['ph', 'Filipino', 'Southeast Asia', 'Manila', 'PHP'],
  'Qatar': ['qa', 'Qatari', 'Gulf', 'Doha', 'QAR'],
  'Saudi Arabia': ['sa', 'Saudi', 'Gulf', 'Riyadh', 'SAR'],
  'South Africa': ['za', 'South African', 'Southern Africa', 'Pretoria', 'ZAR'],
  'Thailand': ['th', 'Thai', 'Southeast Asia', 'Bangkok', 'THB'],
  'Trinidad and Tobago': ['tt', 'Trinidadian', 'Caribbean', 'Port of Spain', 'TTD'],
  'Türkiye': ['tr', 'Turkish', 'Southeast Europe', 'Ankara', 'TRY'],
  'Uganda': ['ug', 'Ugandan', 'East Africa', 'Kampala', 'UGX'],
  'Uzbekistan': ['uz', 'Uzbek', 'Central Asia', 'Tashkent', 'UZS'],
  'Venezuela': ['ve', 'Venezuelan', 'South America', 'Caracas', 'VES'],
  'Vietnam': ['vn', 'Vietnamese', 'Southeast Asia', 'Hanoi', 'VND'],
  'Virgin Islands (U.S.)': ['vi', 'Virgin Islander', 'Caribbean', 'Charlotte Amalie', 'USD'],
};
const EUROPE = new Set(['bg', 'cy', 'mc', 'tr']);

/* Where a statement names the wrong website (a fault in the database itself,
   like the ULB statement that links to VUB). */
const WEBSITE_FIX = {
  'Bogazici University (Boğaziçi Üniversitesi)': 'https://bogazici.edu.tr/en',
};

/* Positions the statement does not give and a name search missed or got
   wrong (Universidad Austral is in Pilar, not Patagonia), to city level. */
const POSITION_FIX = {
  'American Academy - Brazil': [-25.45, -49.25, 'Curitiba'],
  'American University of Madaba': [31.72, 35.79, 'Madaba'],
  'Artmed School of Psychology (APSY)': [-30.03, -51.22, 'Porto Alegre'],
  'Euro University of Bahrain': [26.21, 50.55, 'Manama'],
  'Faculdade Israelita de Ciências da Saúde Albert Einstein (FICSAE)': [-23.60, -46.71, 'São Paulo'],
  'Faculdade Sírio-Libanês': [-23.56, -46.65, 'São Paulo'],
  'FDV - Faculdade de Direito de Vitória': [-20.30, -40.30, 'Vitória'],
  'FIA Business School (Fundação Instituto de Administração)': [-23.57, -46.69, 'São Paulo'],
  'INATEL - Instituto Nacional de Telecomunicações': [-22.26, -45.70, 'Santa Rita do Sapucaí'],
  'Instituto Brasileiro de Ensino, Desenvolvimento e Pesquisa (IDP)': [-15.83, -47.92, 'Brasília'],
  'Instituto de Educação Médica (IDOMED)': [-22.90, -43.20, 'Rio de Janeiro'],
  'Saint Joseph University of Beirut (Université Saint-Joseph de Beyrouth)': [33.89, 35.52, 'Beirut'],
  "St. George's University - Grenada": [12.00, -61.77, "St George's"],
  'Unisinos - Universidade do Vale do Rio dos Sinos': [-29.79, -51.15, 'São Leopoldo'],
  'Universidad Argentina de la Empresa': [-34.617, -58.383, 'Buenos Aires'],
  'Universidad Austral': [-34.45, -58.91, 'Pilar'],
  'Pontificia Universidad Católica Argentina': [-34.61, -58.36, 'Buenos Aires'],
  'Universidad del Desarrollo': [-33.39, -70.50, 'Santiago'],
};
/* District names a reverse lookup returns for a city a student would know. */
const CITY_NAME = { 'Tariq El Jedeedeh': 'Beirut', 'Precinct 5': 'Putrajaya', 'Karachi Division': 'Karachi', 'Bojacá': 'Chía', 'Barranco': 'Lima', 'San Borja': 'Lima', 'Jesús María': 'Lima', 'Hreisheh': 'Koura',
  'Saint Michael': 'Bridgetown', 'Plano Piloto': 'Brasília', 'Bogota, Capital': 'Bogotá', 'Bogota': 'Bogotá', 'Conocoto': 'Quito',
  'Adenta Municipal': 'Accra', 'Eccles - Ramsburg': 'Georgetown', 'Bandung City': 'Bandung', 'Special Capital Region of Jakarta': 'Jakarta',
  'Anekal': 'Bengaluru', 'Bhubaneswar Municipal Corporation': 'Bhubaneswar', 'Chengalpattu': 'Chennai', 'Dadri': 'Greater Noida',
  'Haveli Subdistrict': 'Pune', 'Karjat Taluka': 'Karjat', 'SabarmatiTaluka': 'Ahmedabad', 'Sanganer Tehsil': 'Jaipur',
  'Surajgarh Tehsil': 'Pilani', 'Vikasnagar': 'Dehradun', 'Saint Andrew': 'Kingston', "Al-Jami'ah Sub-District": 'Amman',
  'Al Jaameah': 'Beirut', 'Khan Russey Keo': 'Phnom Penh', '嘉模堂區 Nossa Senhora do Carmo': 'Taipa', 'Macau': 'Macao',
  'Subang Jaya City Council': 'Subang Jaya', 'Ibeju Lekki': 'Lagos', 'Seeb': 'Muscat', 'Ancón': 'Panama City',
  'La Molina': 'Lima', 'San Miguel': 'Lima', 'Santiago de Surco': 'Lima', 'Tunapuna-Piarco': 'St Augustine',
  'Ndlambe Local': 'Port Alfred', 'La Lagunita': 'Caracas', 'Beşiktaş': 'Istanbul', 'Sarıyer': 'Istanbul', 'Eyüpsultan': 'Istanbul',
  'Tuzla': 'Istanbul', 'Çankaya': 'Ankara', 'Etimesgut': 'Ankara', 'Kocasinan': 'Kayseri', '6th of October': '6th of October City',
  'New Cairo City': 'New Cairo', 'Al Rayyan': 'Doha', 'Santa Catarina': 'Monterrey', 'San Andrés Cholula': 'Puebla' };

const LANG = (s) => s.replace(/, Modern \(1453-\)/g, '').split('/').filter(Boolean);
const ADMISSION = /admis|apply|applic|ingres|admision|vestibular|entry|eligib|requirement|undergrad|bachillerato|baccalaureate|criteria|selec|processo|first-year|policies|graduacao/i;

/* The database's own spelling, corrected where it is a typo or an office. */
const NAME_FIX = {
  'Fundação Getulio Vargas - Central Admission': 'Fundação Getulio Vargas',
  'Universidad de los Andes - Chille': 'Universidad de los Andes - Chile',
  'Centro Universitário Barão de Mauá - Unidade Central': 'Centro Universitário Barão de Mauá',
  'BITS Pilani - Pilani': 'BITS Pilani',
  'Escola Superior de Propaganda e Marketing (ESPM) - Sao Paulo': 'Escola Superior de Propaganda e Marketing',
  'Bogazici University (Boğaziçi Üniversitesi)': 'Boğaziçi University',
  'Mumbai Educational Trust- Institute of International Studies (MET)': 'MET Institute of International Studies',
};
function cleanName(n) {
  if (NAME_FIX[n]) return NAME_FIX[n];
  return n.replace(/\s*\((?:[A-Z][A-Za-z&]*|UoL|JIC|MET|CUT)\)\s*$/, '')        // "(CUT)", "(MET)"
    .replace(/^(.+?)\s*\((.+)\)$/, (m, en, native) => (/[A-Za-z]/.test(en) ? en : native)) // "Bogazici University (Boğaziçi …)"
    .replace(/\s+-\s*/g, ' - ').replace(/\s*:\s*/g, ': ').trim();
}
function typeOf(n) {
  if (/medic|medical|health|rcsi/i.test(n)) return 'Medical school';
  if (/design|arts?\b|fashion|pearl academy/i.test(n)) return 'Art and design school';
  if (/business|management|fgv|insper|espm|cesa|fia\b/i.test(n)) return 'Business school';
  if (/technolog|polytechnic|engineering|itba|inatel|inteli|ITAM|cmkl/i.test(n)) return 'Technical university';
  if (/college|faculdade|escola|institute|instituto/i.test(n)) return 'College';
  return 'University';
}
function taught(langs) {
  const en = langs.includes('English');
  const other = langs.filter((l) => l !== 'English');
  if (en && !other.length) return 'Taught in English.';
  if (en) return `English and ${other.join(' and ')}; check each degree.`;
  return `Taught in ${other.join(' and ')}.`;
}

const cities = JSON.parse(fs.readFileSync(CITIES, 'utf8'));
const rows = fs.readFileSync(TSV, 'utf8').trim().split('\n').slice(1).map((l) => {
  const c = l.split('|');
  const g = { ...(cities[c[2]] || {}) };
  const fx = POSITION_FIX[c[1]];
  if (fx) { [g.lat, g.lon, g.city] = fx; c[9] = c[10] = ''; cities[c[2]] = { ...cities[c[2]], city: fx[2] }; }
  return { country: c[0], ibName: c[1], id: c[2], dp: c[4] === 'Yes', langs: LANG(c[5]), transcripts: c[6] === '' ? null : Number(c[6]), website: c[7], link: c[8], lat: c[9] ? Number(c[9]) : g.lat, lon: c[10] ? Number(c[10]) : g.lon };
});

const statementsFile = 'data/ib-statements.json';
const statements = JSON.parse(fs.readFileSync(statementsFile, 'utf8'));
const evidenceFile = 'data/evidence/ib-statements.json';
let evidence = JSON.parse(fs.readFileSync(evidenceFile, 'utf8'));

const byCountry = Map.groupBy(rows, (r) => r.country);
let nInst = 0, nPlaces = 0;
for (const [country, list] of byCountry) {
  const meta = COUNTRIES[country];
  if (!meta) throw new Error(`no country metadata for ${country}`);
  const [cc, adjective, region, capital, currency] = meta;
  const file = `data/countries/${cc}.json`;
  if (fs.existsSync(file) && JSON.parse(fs.readFileSync(file, 'utf8')).outline !== TAG) {
    console.log(`skip ${cc}: researched by hand`);
    continue;
  }
  /* Drop earlier generated statements and evidence for this country. */
  for (const k of Object.keys(statements.statements)) if (k.startsWith(`${cc}-`) && statements.statements[k].retrievedAt === ASOF) delete statements.statements[k];
  evidence = evidence.filter((e) => !(e.id.startsWith(`ev-ibrs-${cc}-`) && e.retrievedAt === ASOF));

  const places = new Map();
  const institutions = [];
  const seen = new Set();
  list.sort((a, b) => (b.transcripts ?? 0) - (a.transcripts ?? 0) || a.ibName.localeCompare(b.ibName));
  for (const r of list) {
    const name = cleanName(r.ibName);
    let key = `${cc}-${slugify(name)}`;
    if (seen.has(key)) continue;
    if (r.lat == null) { console.log(`no position: ${r.ibName}`); continue; }
    seen.add(key);
    const found = (cities[r.id]?.city || capital).replace(/^(Municipality|City) of /, '').replace(/ (Metropolitan )?(Municipality|District|Prefecture|Region|Governorate|Province)$/, '');
    const city = CITY_NAME[found] || found;
    const placeId = `${cc}-${slugify(city)}`;
    if (!places.has(placeId)) places.set(placeId, { id: placeId, destination: cc, name: city, kind: 'city', coordinates: { lat: r.lat, lon: r.lon }, coordinatePrecision: 'institution', meta: { schemaVersion: '1.0', dataAsOf: ASOF } });
    const website = WEBSITE_FIX[r.ibName] || r.website;
    const statementUrl = `https://recognition.ibo.org/en-US/university-statements/?id=${r.id}`;
    const admissions = r.link && ADMISSION.test(r.link) && !WEBSITE_FIX[r.ibName] ? r.link : null;
    institutions.push({
      name, city, type: typeOf(name),
      website,
      admissionsUrl: admissions,
      ibPageUrl: null,
      englishBachelors: taught(r.langs),
      place: placeId,
    });
    statements.statements[key] = {
      ibName: r.ibName, statementUrl,
      recognises: { diploma: r.dp, courseResults: false },
      givesCredit: false,
      transcripts5y: r.transcripts,
      ibLanguageMeetsProficiency: null,
      diplomaPolicy: null,
      links: { website, ibAdmissions: admissions, language: null, scholarships: null },
      match: WEBSITE_FIX[r.ibName] ? 'reviewed' : 'exact', websiteAgrees: !WEBSITE_FIX[r.ibName],
      retrievedAt: ASOF, evidence: `ev-ibrs-${key}`,
    };
    evidence.push({
      id: `ev-ibrs-${key}`, sourceUrl: statementUrl, publisher: name, publisherType: 'institution',
      sourceClass: 'institutional-guidance', retrievedAt: ASOF, verificationState: 'needs-review',
      claim: `${name} has published an IB recognition statement through the IB${r.dp ? ', and says it recognises the IB Diploma' : ''}.`,
      supports: [{ entity: key, field: 'ibStatement' }],
      attestation: { by: "Claude, reading recognition.ibo.org in the desktop app's browser", at: ASOF, method: 'read-browser', note: 'Read from the database index and each statement page in a browser. The institution was added from the statement itself, so the match is the statement.' },
      sourceCheck: { checkedAt: ASOF, outcome: 'partial', reason: 'recognition.ibo.org serves no readable text to automated retrieval, so npm run verify can never confirm this record. That is a property of the host, not a sign that nobody read it.', method: 'not machine-checkable (scripts/lib/link-policy.json)' },
      meta: { schemaVersion: '1.0', dataAsOf: ASOF },
    });
    nInst++;
  }
  for (const p of places.values()) { fs.writeFileSync(`data/places/${p.id}.json`, JSON.stringify(p, null, 2) + '\n'); nPlaces++; }

  const n = institutions.length;
  const english = list.filter((r) => r.langs.includes('English')).length;
  const profile = {
    code: cc, name: country === 'Virgin Islands (U.S.)' ? 'US Virgin Islands' : country, adjective, region,
    ...(EUROPE.has(cc) ? {} : { scope: 'worldwide' }),
    capital, currency, eu: cc === 'cy' || cc === 'bg', eea: cc === 'cy' || cc === 'bg',
    dataAsOf: ASOF, targetIntake: 'Autumn 2027 (May 2027 IB session)',
    outline: TAG,
    tagline: n === 1 ? `One university here has an IB recognition statement` : `${n} universities here have an IB recognition statement`,
    summary: english === n
      ? `Basics only for now: ${n === 1 ? 'one university, teaching' : `${n} universities, all teaching`} in English.`
      : english
        ? `Basics only for now: ${english} of ${n} universities teach in English.`
        : `Basics only for now: ${n === 1 ? 'one university' : `${n} universities`}, teaching in the local language.`,
    whyConsider: [],
    watchOuts: ['Outline only. Check dates and fees with each university.'],
    institutions,
    sources: [{ title: 'IB Recognition Statements Database', url: 'https://recognition.ibo.org/', retrieved: ASOF }],
  };
  fs.writeFileSync(file, JSON.stringify(profile, null, 2) + '\n');
}
fs.writeFileSync(statementsFile, JSON.stringify(statements, null, 2) + '\n');
fs.writeFileSync(evidenceFile, JSON.stringify(evidence, null, 2) + '\n');
console.log(`${byCountry.size} countries, ${nInst} institutions, ${nPlaces} places`);
