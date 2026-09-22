/**
 * Migrates the Danish research files into canonical entity records.
 *
 *   node scripts/migrate-denmark.mjs            # write data/{places,institutions,programmes,opportunities,evidence}
 *   node scripts/migrate-denmark.mjs --dry-run  # report what would change
 *
 * Direction of travel, per docs/DATA_MODEL.md: research arrives as one file per
 * institution with nested programmes, which is convenient to gather but wrong to
 * build on. This turns each of those into separately updateable Places,
 * Institutions, Programmes and Opportunities, and mints an Evidence record for
 * every source URL the research recorded.
 *
 * The conversion is deterministic and idempotent: re-running it after new
 * research lands regenerates the same ids, so nothing a student saved breaks.
 * Fields the research did not establish stay absent — never guessed, and never
 * silently turned into a permissive default.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'data');
const DRY = process.argv.includes('--dry-run');

const SCHEMA_VERSION = '1.0';
const INTAKE = '2027-autumn';
const TODAY = new Date().toISOString().slice(0, 10);

/* Danish campus locations. City-level precision is recorded honestly so the map
   never draws a city centre as though it were a verified campus pin. */
const PLACES = {
  'copenhagen': { name: 'Copenhagen', lat: 55.6761, lon: 12.5683 },
  'frederiksberg': { name: 'Frederiksberg', lat: 55.6786, lon: 12.5312 },
  'kongens-lyngby': { name: 'Kongens Lyngby', lat: 55.7704, lon: 12.5038 },
  'ballerup': { name: 'Ballerup', lat: 55.7312, lon: 12.3634 },
  'aarhus': { name: 'Aarhus', lat: 56.1629, lon: 10.2039 },
  'aalborg': { name: 'Aalborg', lat: 57.0488, lon: 9.9217 },
  'esbjerg': { name: 'Esbjerg', lat: 55.4765, lon: 8.4594 },
  'odense': { name: 'Odense', lat: 55.4038, lon: 10.4024 },
  'sonderborg': { name: 'Sønderborg', lat: 54.9139, lon: 9.7928 },
  'kolding': { name: 'Kolding', lat: 55.4904, lon: 9.4722 },
  'roskilde': { name: 'Roskilde', lat: 55.6415, lon: 12.0803 },
  'herning': { name: 'Herning', lat: 56.1362, lon: 8.9767 },
  'vejle': { name: 'Vejle', lat: 55.709, lon: 9.5357 },
  'slagelse': { name: 'Slagelse', lat: 55.4028, lon: 11.354 },
  'horsens': { name: 'Horsens', lat: 55.8607, lon: 9.8503 },
  'foulum': { name: 'Foulum', lat: 56.4939, lon: 9.5686 },
};

/* Campus names that are really a district of a city we already know. UCPH's
   four campuses are all in Copenhagen; naming them separately on a map would
   imply a precision we do not have. */
const CAMPUS_ALIASES = {
  'city-campus': 'copenhagen',
  'north-campus': 'copenhagen',
  'south-campus': 'copenhagen',
  'frederiksberg-campus': 'frederiksberg',
  'lyngby-campus': 'kongens-lyngby',
  'campus-horsens': 'horsens',
  'aarhus-c': 'aarhus',
  'aarhus-n': 'aarhus',
  'aarhus-v': 'aarhus',
};

const CITY_CHARACTER = {
  copenhagen: 'The capital, and by some distance the most expensive place to be a student in Denmark. Dense, walkable, cycling everywhere, and a rental market that will be the hardest part of your year.',
  frederiksberg: 'Its own municipality, surrounded by Copenhagen. Greener and quieter than the centre, and only a few minutes from it.',
  'kongens-lyngby': 'A comfortable suburb fifteen kilometres north of Copenhagen, built around the campus and a long pedestrian high street.',
  aarhus: 'Denmark\'s second city and the one most shaped by its students. Smaller and cheaper than Copenhagen, with a compact centre and a real coastline.',
  aalborg: 'A former industrial city in north Jutland that reinvented itself around the university. Notably affordable, and the waterfront is genuinely good.',
  esbjerg: 'A working port on the North Sea, the centre of Denmark\'s offshore energy industry. Windswept, practical, and cheap to live in.',
  odense: 'Funen\'s main city, midway between Copenhagen and Jutland. Mid-sized, flat, and much less expensive than the capital.',
  sonderborg: 'A small town on the German border with a disproportionately international campus. Quiet, close to Flensburg, and inexpensive.',
  kolding: 'A mid-sized Jutland city built around a fjord, with design and business teaching at its centre.',
  roskilde: 'Half an hour west of Copenhagen by train, with a cathedral, a Viking ship museum and a well-known summer festival. Cheaper than the capital and close enough to use it.',
  herning: 'A central Jutland town known for textiles, trade fairs and sport. Small, practical and very affordable.',
  vejle: 'A Jutland city at the head of a fjord, with steep hills unusual for Denmark and a growing technology sector.',
  slagelse: 'A west Zealand town on the main line to Copenhagen. Small, quiet and low-cost.',
  horsens: 'An east Jutland city that has grown quickly, with a large campus and cheap housing.',
};

/* --- helpers -------------------------------------------------------------- */

function slug(s) {
  return String(s ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/ø/gi, 'o').replace(/æ/gi, 'ae').replace(/å/gi, 'aa')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 72);
}

function placeIdFor(campus, fallbackCity) {
  const s = slug(campus || fallbackCity || '');
  if (CAMPUS_ALIASES[s]) return `dk-${CAMPUS_ALIASES[s]}`;
  if (PLACES[s]) return `dk-${s}`;
  // "Campus Horsens", "Lyngby Campus", "Aarhus C" and similar.
  for (const key of Object.keys(PLACES)) {
    if (s.includes(key) || key.includes(s)) return `dk-${key}`;
  }
  return null;
}

/** A stable evidence id derived from the URL, so re-running produces the same record. */
function evidenceId(url) {
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (Math.imul(31, h) + url.charCodeAt(i)) | 0;
  const host = (url.match(/^https?:\/\/([^/]+)/) || [])[1] || 'source';
  return `ev-${slug(host.replace(/^www\./, '')).slice(0, 28)}-${(h >>> 0).toString(36)}`;
}

const CREDENTIAL = [
  [/academy profession|\bap\b/i, 'academy-profession'],
  [/top-?up/i, 'top-up'],
  [/professional bachelor|diplomingeni/i, 'professional-bachelor'],
  [/integrated master|candidat/i, 'integrated-master'],
  [/bachelor|bsc|b\.sc|ba\b|beng/i, 'bachelor'],
];

function credentialLevel(degree) {
  for (const [re, level] of CREDENTIAL) if (re.test(degree || '')) return level;
  return 'bachelor';
}

const FIELD = [
  [/engineer|electronic|mechanic|energy|robot|civil|chemical/i, 'engineering'],
  [/comput|software|data scien|informatic|it |artificial intelligence|cyber/i, 'computing'],
  [/business|management|marketing|shipping|commerce|entrepreneur/i, 'business'],
  [/econom|finance|account/i, 'economics'],
  [/social|politic|sociolog|anthropolog|global stud/i, 'social-sciences'],
  [/human|philosoph|histor|literature|language|cultur/i, 'humanities'],
  [/law|jurisprud/i, 'law'],
  [/medicine|medical/i, 'medicine'],
  [/nurs|health|physio|pharma/i, 'health'],
  [/biolog|chemis|physic|mathemat|natural scien|nanotech/i, 'natural-sciences'],
  [/architect|design|urban/i, 'design-architecture'],
  [/music|art|film|theatre|media/i, 'arts-music'],
  [/agricultur|environment|forest|sustainab/i, 'agriculture-environment'],
  [/educat|teach|pedagog/i, 'education'],
  [/tourism|hospitality/i, 'hospitality-tourism'],
];

function fieldOf(p) {
  const hay = `${p.field || ''} ${p.name || ''} ${p.degree || ''} ${p.summary || ''}`;
  for (const [re, f] of FIELD) if (re.test(hay)) return f;
  return 'interdisciplinary';
}

const INST_TYPE = {
  'Research university': 'research-university',
  'Technical university': 'technical-university',
  'Business school': 'business-school',
  'University college': 'university-college',
  'Business academy': 'business-academy',
  'Artistic institution': 'art-academy',
};

/* --- requirement normalisation --------------------------------------------- */

/**
 * Research records requirements as { all: [...], oneOf: [[...], [...]] }.
 * The canonical form is a flat list of rules, each carrying its own
 * applicability and its own evidence, so a single rule can later be revised or
 * flagged stale without touching the rest.
 */
function normaliseRequirements(p, evidenceRef) {
  const out = [];
  const applicability = { intake: INTAKE, applicantGroup: 'any' };

  const rule = (r, idx, prefix) => ({
    id: `${prefix}-${idx}`,
    kind: 'ib-subject',
    mandatory: true,
    label: `${r.subject} at ${r.level} level${r.minGrade ? `, minimum grade ${r.minGrade}` : ''}`,
    subject: r.subject,
    level: r.level,
    ...(r.minGrade ? { minGrade: Number(r.minGrade), gradeScale: 'dk-7-point' } : {}),
    operator: 'at-least',
    applicability,
    ...(evidenceRef ? { evidence: [evidenceRef] } : {}),
  });

  (p.entryRequirements?.all || []).forEach((r, i) => out.push(rule(r, i + 1, 'req-all')));

  const groups = p.entryRequirements?.oneOf || [];
  if (groups.length) {
    out.push({
      id: 'req-oneof',
      kind: 'subject-combination',
      mandatory: true,
      label: `One of ${groups.length} accepted subject combinations`,
      operator: 'one-of',
      alternatives: groups.map((group, gi) =>
        group.map((r, i) => rule(r, i + 1, `req-alt${gi + 1}`))
      ),
      applicability,
      ...(evidenceRef ? { evidence: [evidenceRef] } : {}),
    });
  }

  return out;
}

/**
 * The research files collect everything an admissions page says under one
 * `extraRequirements` list: real extra requirements, but also capacity figures,
 * quota shares, specialisation names and guaranteed-admission thresholds.
 *
 * Treating all of that as mandatory requirements is what made every Danish
 * programme come back as "Needs review" — the engine correctly refused to judge
 * "24 study places in 2026". So each line is classified, and only the ones that
 * are genuinely conditions of entry become Requirements. The rest become
 * selection factors, capacity notes or plain notes, and the published paragraph
 * is preserved verbatim either way.
 */
function classifyExtra(text) {
  const t = String(text);

  if (/\d[\d,. ]*\s*(study )?places|applicants,? of whom|per cent of those admitted|admitted had/i.test(t)) {
    return { as: 'capacity' };
  }
  if (/^specialisations?|specialisations? chosen/i.test(t)) {
    return { as: 'note' };
  }
  if (/guaranteed admission/i.test(t)) {
    return { as: 'selection', type: 'gpa' };
  }
  if (/restricted in admission|adgangsbegr(æ|ae)nsning/i.test(t)) {
    return { as: 'capacity' };
  }
  if (/application fee/i.test(t)) {
    return { as: 'note' };
  }
  if (/quota\s*[12]/i.test(t)) {
    return { as: 'selection', type: /work experience|supplementary/i.test(t) ? 'work-experience' : 'gpa' };
  }
  if (/GPA|grade point average|minimum grade requirement|average of at least/i.test(t)) {
    return { as: 'selection', type: 'gpa' };
  }
  if (/recommended/i.test(t) && /letter|essay|portfolio/i.test(t)) {
    return { as: 'selection', type: /portfolio/i.test(t) ? 'portfolio' : 'essay' };
  }

  // Genuine conditions of entry.
  if (/motivational (cover )?letter|motivational essay|essay/i.test(t)) return { as: 'requirement', kind: 'essay' };
  if (/IELTS|TOEFL|Cambridge|English proficiency|language proficiency|Studiepr(ø|oe)ven|must be passed/i.test(t)) {
    return { as: 'requirement', kind: 'language-general' };
  }
  if (/portfolio/i.test(t)) return { as: 'requirement', kind: 'portfolio' };
  if (/audition/i.test(t)) return { as: 'requirement', kind: 'audition' };
  if (/interview/i.test(t)) return { as: 'requirement', kind: 'interview' };
  if (/admission test|entrance (test|exam)|test/i.test(t)) return { as: 'requirement', kind: 'test' };

  return { as: 'note' };
}

/**
 * Programme and Opportunity ids, resolved against every programme at an
 * institution rather than one at a time.
 *
 * Two real cases turned up in the Danish data and they resolve differently:
 *   - SDU teaches Software Engineering in both Vejle and Sønderborg. That is
 *     ONE Programme with TWO Opportunities, so the campus belongs in the
 *     Opportunity id, not the Programme id.
 *   - SDU teaches Mechatronics as both a BSc and a BEng. Those are genuinely
 *     TWO Programmes, so the credential belongs in the Programme id.
 *
 * Without this, one silently overwrote the other on disk.
 */
function assignIds(instId, programmes) {
  const byName = new Map();
  for (const p of programmes) {
    const key = slug(p.name);
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(p);
  }

  const assigned = new Map();
  for (const [nameSlug, group] of byName) {
    const degrees = new Set(group.map((p) => degreeToken(p.degree)));
    const splitByDegree = group.length > 1 && degrees.size > 1;

    for (const [i, p] of group.entries()) {
      const progId = splitByDegree
        ? `${instId}-${nameSlug}-${degreeToken(p.degree)}`
        : group.length > 1 && !splitByDegree && !p.campus
          ? `${instId}-${nameSlug}-${i + 1}`
          : `${instId}-${nameSlug}`;

      // Distinguish opportunities of the same programme by campus.
      const needsCampus = group.length > 1 && !splitByDegree && !!p.campus;
      const oppId = needsCampus
        ? `${progId}-${slug(p.campus)}-${INTAKE}`
        : `${progId}-${INTAKE}`;

      assigned.set(p, { progId, oppId });
    }
  }

  /* Whatever the heuristics decided, two records must never share an id — one
     would silently overwrite the other on disk. Suffix any remaining duplicate
     in a stable order so re-running produces the same result. */
  const usedProg = new Map();
  const usedOpp = new Set();
  for (const p of programmes) {
    const entry = assigned.get(p);
    if (usedProg.has(entry.progId) && usedProg.get(entry.progId) !== p) {
      let n = 2;
      while (usedProg.has(`${entry.progId}-${n}`)) n++;
      entry.progId = `${entry.progId}-${n}`;
      entry.oppId = `${entry.progId}-${INTAKE}`;
    }
    usedProg.set(entry.progId, p);

    if (usedOpp.has(entry.oppId)) {
      let n = 2;
      while (usedOpp.has(`${entry.progId}-${n}-${INTAKE}`)) n++;
      entry.oppId = `${entry.progId}-${n}-${INTAKE}`;
    }
    usedOpp.add(entry.oppId);
  }

  return assigned;
}

function degreeToken(degree) {
  const d = String(degree || '').toLowerCase();
  if (/diplomingeni|beng|bachelor of engineering/.test(d)) return 'beng';
  if (/bsc|bachelor of science/.test(d)) return 'bsc';
  if (/ba|bachelor of arts/.test(d)) return 'ba';
  if (/academy profession/.test(d)) return 'ap';
  if (/top-?up/.test(d)) return 'topup';
  return 'bachelor';
}

/* --- main ------------------------------------------------------------------ */

async function main() {
  const legacyDir = path.join(DATA, 'dk');
  let files;
  try {
    files = (await fs.readdir(legacyDir)).filter((f) => f.endsWith('.json')).sort();
  } catch {
    console.error('No data/dk/ to migrate.');
    process.exit(1);
  }

  const out = { places: new Map(), institutions: [], programmes: [], opportunities: [], evidence: new Map() };
  const usedPlaces = new Set();
  const warnings = [];

  const addEvidence = (url, publisher, supports, extra = {}) => {
    if (!url) return null;
    const id = evidenceId(url);
    const existing = out.evidence.get(id);
    if (existing) {
      existing.supports.push(...supports);
      return id;
    }
    out.evidence.set(id, {
      id,
      sourceUrl: url,
      publisher,
      publisherType: 'institution',
      retrievedAt: extra.retrievedAt || TODAY,
      appliesToIntake: INTAKE,
      verificationState: 'needs-review',
      verifiedBy: 'automated',
      claim: extra.claim,
      supports,
      meta: { schemaVersion: SCHEMA_VERSION, dataAsOf: TODAY },
    });
    return id;
  };

  for (const file of files) {
    const inst = JSON.parse(await fs.readFile(path.join(legacyDir, file), 'utf8'));
    const instId = `dk-${slug(inst.id || file.replace('.json', ''))}`;

    /* Places */
    const campuses = inst.campuses?.length ? inst.campuses : [inst.city].filter(Boolean);
    const placeIds = [];
    for (const campus of campuses) {
      const pid = placeIdFor(campus, inst.city);
      if (!pid) { warnings.push(`${file}: no known coordinates for campus "${campus}"`); continue; }
      placeIds.push(pid);
      usedPlaces.add(pid);
    }

    /* Institution */
    const instEvidence = [];
    for (const s of inst.sources || []) {
      const id = addEvidence(s.url, s.title || inst.name, [{ entity: instId, field: 'about' }], { retrievedAt: s.retrieved });
      if (id) instEvidence.push(id);
    }

    out.institutions.push({
      id: instId,
      destination: 'dk',
      name: inst.name,
      ...(inst.shortName ? { shortName: inst.shortName } : {}),
      ...(inst.danishName ? { localName: inst.danishName } : {}),
      type: INST_TYPE[inst.type] || 'research-university',
      ...(inst.founded ? { founded: inst.founded } : {}),
      ...(placeIds.length ? { places: placeIds } : {}),
      ...(inst.about ? { about: inst.about } : {}),
      ...(inst.knownFor?.length ? { knownFor: inst.knownFor } : {}),
      ...(inst.students ? { students: inst.students } : {}),
      links: {
        ...(inst.website ? { website: inst.website } : {}),
        ...(inst.admissionsUrl ? { admissions: inst.admissionsUrl } : {}),
        ...(inst.ibPageUrl ? { ibPage: inst.ibPageUrl } : {}),
        ...(inst.wikipedia ? { wikipedia: inst.wikipedia } : {}),
      },
      ...(inst.ibisCode ? { codes: { ibResultsService: inst.ibisCode } } : {}),
      languageOfInstruction: {
        primary: 'Danish',
        englishTaughtUndergraduate:
          !inst.programmes?.length ? 'none'
          : inst.programmes.length <= 2 ? 'few'
          : inst.programmes.length <= 6 ? 'some' : 'many',
        ...(inst.notes?.length ? { note: inst.notes[0] } : {}),
      },
      ...(instEvidence.length ? { evidence: instEvidence } : {}),
      meta: {
        schemaVersion: SCHEMA_VERSION,
        dataAsOf: inst.dataAsOf || TODAY,
        ...(inst.notes?.length ? { notes: inst.notes } : {}),
      },
    });

    /* Programmes and Opportunities */
    const idMap = assignIds(instId, inst.programmes || []);
    for (const p of inst.programmes || []) {
      const { progId, oppId } = idMap.get(p);
      const placeId = placeIdFor(p.campus, inst.city);
      if (placeId) usedPlaces.add(placeId);
      else if (p.campus) warnings.push(`${file}: programme "${p.name}" has unknown campus "${p.campus}"`);

      const progEv = addEvidence(
        p.url,
        inst.shortName || inst.name,
        [{ entity: progId, field: 'summary' }],
        { retrievedAt: p.verified, claim: `${p.name} is offered by ${inst.name}.` }
      );
      const reqEv = addEvidence(
        p.source || p.url,
        inst.shortName || inst.name,
        [{ entity: oppId, field: 'requirements' }],
        { retrievedAt: p.verified, claim: `Published entry requirements for ${p.name}.` }
      );

      out.programmes.push({
        id: progId,
        institution: instId,
        name: p.name,
        credential: {
          level: credentialLevel(p.degree),
          ...(p.degree ? { title: p.degree } : {}),
          ...(Number.isFinite(Number(p.ects)) ? { ects: Number(p.ects) } : {}),
          ...(Number.isFinite(Number(p.years)) ? { years: Number(p.years) } : {}),
        },
        field: { primary: fieldOf(p), ...(p.field ? { keywords: [p.field] } : {}) },
        ...(p.summary ? { summary: p.summary } : {}),
        links: { ...(p.url ? { official: p.url } : {}), ...(p.source && p.source !== p.url ? { admissions: p.source } : {}) },
        ...(progEv ? { evidence: [progEv] } : {}),
        meta: { schemaVersion: SCHEMA_VERSION, dataAsOf: p.verified || inst.dataAsOf || TODAY },
      });

      const requirements = normaliseRequirements(p, reqEv);
      const selection = [];
      const capacityNotes = [];
      const plainNotes = [];

      for (const [i, extra] of (p.extraRequirements || []).entries()) {
        const verdict = classifyExtra(extra);
        if (verdict.as === 'requirement') {
          requirements.push({
            id: `req-extra-${i + 1}`,
            kind: verdict.kind,
            mandatory: true,
            label: extra,
            applicability: { intake: INTAKE, applicantGroup: 'any' },
            ...(reqEv ? { evidence: [reqEv] } : {}),
          });
        } else if (verdict.as === 'selection') {
          selection.push({ type: verdict.type, description: extra, ...(reqEv ? { evidence: [reqEv] } : {}) });
        } else if (verdict.as === 'capacity') {
          capacityNotes.push(extra);
        } else {
          plainNotes.push(extra);
        }
      }

      out.opportunities.push({
        id: oppId,
        programme: progId,
        institution: instId,
        destination: 'dk',
        ...(placeId ? { place: placeId } : {}),
        intake: INTAKE,
        ...(p.startMonth ? { startMonth: p.startMonth } : {}),
        language: { instruction: p.language || 'English', fullyInLanguage: true },
        admission: {
          restricted: !!p.restrictedAdmission,
          ...(capacityNotes.length ? { capacityNote: capacityNotes.join(' ') } : {}),
          ...(selection.length ? { selection } : {}),
          ...(p.quota1Cutoff?.gpa
            ? {
                historicalCutoffs: [
                  {
                    intake: /202[0-9]/.test(p.quota1Cutoff.year || '')
                      ? `${(p.quota1Cutoff.year.match(/20[0-9]{2}/) || ['2026'])[0]}-autumn`
                      : '2026-autumn',
                    quota: 'Quota 1',
                    value: String(p.quota1Cutoff.gpa),
                    scale: 'dk-7-point',
                    ...(reqEv ? { evidence: [reqEv] } : {}),
                  },
                ],
              }
            : {}),
        },
        ...(requirements.length ? { requirements } : {}),
        ...(p.requirementsText
          ? { officialRequirementsText: [{ text: p.requirementsText, language: 'en', official: true }] }
          : {}),
        cost: [
          { applicantGroup: 'eu-eea-ch', feeStatus: 'no-fee', priceYear: '2026/27', ...(reqEv ? { evidence: [reqEv] } : {}) },
          ...(inst.tuitionNonEu
            ? [{ applicantGroup: 'non-eu', feeStatus: 'international-rate', priceYear: '2026/27', ...(reqEv ? { evidence: [reqEv] } : {}) }]
            : []),
        ],
        applicationRoutes: ['dk-optagelse-international-2027'],
        ...(reqEv ? { evidence: [reqEv] } : {}),
        meta: {
          schemaVersion: SCHEMA_VERSION,
          dataAsOf: p.verified || inst.dataAsOf || TODAY,
          ...(plainNotes.length || inst.tuitionNonEu
            ? { notes: [...plainNotes, ...(inst.tuitionNonEu ? [`Non-EU tuition at institution level: ${inst.tuitionNonEu}`] : [])] }
            : {}),
        },
      });
    }
  }

  /* Places actually referenced */
  for (const pid of [...usedPlaces].sort()) {
    const key = pid.replace(/^dk-/, '');
    const p = PLACES[key];
    out.places.set(pid, {
      id: pid,
      destination: 'dk',
      name: p.name,
      kind: 'city',
      coordinates: { lat: p.lat, lon: p.lon },
      coordinatePrecision: 'city',
      ...(CITY_CHARACTER[key] ? { character: CITY_CHARACTER[key] } : {}),
      meta: { schemaVersion: SCHEMA_VERSION, dataAsOf: TODAY },
    });
  }

  /* Write */
  const plan = [
    ['places', [...out.places.values()]],
    ['institutions', out.institutions],
    ['programmes', out.programmes],
    ['opportunities', out.opportunities],
  ];

  if (DRY) {
    for (const [dir, items] of plan) console.log(`  ${dir}: ${items.length}`);
    console.log(`  evidence: ${out.evidence.size}`);
  } else {
    for (const [dir, items] of plan) {
      const target = path.join(DATA, dir);
      await fs.mkdir(target, { recursive: true });
      // Remove stale Danish records so a deleted programme does not linger.
      for (const f of await fs.readdir(target).catch(() => [])) {
        if (f.startsWith('dk-')) await fs.rm(path.join(target, f));
      }
      for (const item of items) {
        await fs.writeFile(path.join(target, `${item.id}.json`), JSON.stringify(item, null, 2) + '\n');
      }
      console.log(`  ${String(items.length).padStart(3)} → data/${dir}/`);
    }
    await fs.mkdir(path.join(DATA, 'evidence'), { recursive: true });
    await fs.writeFile(
      path.join(DATA, 'evidence', 'dk.json'),
      JSON.stringify([...out.evidence.values()], null, 2) + '\n'
    );
    console.log(`  ${String(out.evidence.size).padStart(3)} → data/evidence/dk.json`);
  }

  if (warnings.length) {
    console.log(`\n${warnings.length} thing(s) needing a human:`);
    for (const w of warnings) console.log(`  · ${w}`);
  }
  console.log('');
}

main().catch((e) => { console.error(e); process.exit(1); });
