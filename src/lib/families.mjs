/**
 * Programme families: one programme a student sees, offered as more than one path.
 *
 * The owner's rule (25 September 2026): when a university offers one course
 * with some distinction — a 3-year BSc and a 3½-year BEng of the same subject,
 * the same degree on two campuses, a named specialisation of it — that is ONE
 * card. Clicking it shows the paths. Two cards with the same text is
 * repetition, not choice. Where admission differs in a way a student must act
 * on, the paths still share a card, and the path table says so.
 *
 * The grouping is data, never code. A programme record joins a family with
 *
 *   "family": {
 *     "id": "dk-sdu-electronics-family",  // shared by every member
 *     "name": "Electronics",              // the card's title, shared
 *     "axis": "credential",               // what the paths differ on: credential | campus | specialisation
 *     "admission": "differs",             // same | differs — checked against the requirements below
 *     "path": "Bachelor of Engineering",  // this path's short label
 *     "differs": "3½ years with a six-month internship …",  // one line: what is different about THIS path
 *     "order": 2,                         // position in the path list
 *     "primary": false                    // exactly one member is the card's link and picture
 *   }
 *
 * Every member keeps its own record, page and URL (docs/research/variants/design.md).
 *
 * `admission` is not taken on trust. `admissionSignature()` reduces an
 * Opportunity's requirements to what a student has to meet — kinds, subjects,
 * levels, grades, averages, alternatives as sets — and ignores wording, notes,
 * evidence and order. Members whose signatures differ must say "differs"; members
 * whose signatures agree must say "same". A family can therefore never hide an
 * admission difference behind one card.
 *
 * `suspectedVariants()` is the other half: two programmes at one institution
 * whose names reduce to the same stem must either share a family or say, in
 * `separateFrom`, why they are separate. A new near-duplicate cannot slip in as
 * a second card unnoticed.
 *
 * Nothing here names a programme, an institution or a country.
 */

export const FAMILY_AXES = ['credential', 'campus', 'specialisation'];
export const PATH_LABEL_MAX = 40;
export const DIFFERS_MAX = 160;

/** The card a programme belongs to: its family's id, or its own. */
export function cardKey(programme) {
  return programme?.family?.id || programme?.id || null;
}

/**
 * Every family in a catalogue, as `Map(id → { id, name, axis, admission,
 * primary, members })`, members in path order. Programmes without a family are
 * not in the map.
 */
export function families(programmes) {
  const out = new Map();
  for (const p of programmes) {
    const f = p?.family;
    if (!f?.id) continue;
    if (!out.has(f.id)) out.set(f.id, { id: f.id, name: f.name, axis: f.axis, admission: f.admission, primary: null, members: [] });
    const fam = out.get(f.id);
    fam.members.push(p);
    if (f.primary) fam.primary = p;
  }
  for (const fam of out.values()) {
    fam.members.sort((a, b) => (a.family.order ?? 0) - (b.family.order ?? 0) || String(a.id).localeCompare(String(b.id)));
    if (!fam.primary) fam.primary = fam.members[0];
  }
  return out;
}

/* --- What a student has to meet ---------------------------------------- */

/** Keys that are wording, sourcing or bookkeeping rather than a condition. */
const NOT_A_CONDITION = new Set(['id', 'evidence', 'note', 'notes', 'officialWording', 'label', 'labelLocal', 'applicability', 'alternativeRoute', 'alternativeRouteSummary', 'description', 'meta', 'explanation']);

function canonical(node) {
  if (Array.isArray(node)) {
    const items = node.map(canonical);
    /* Order carries no meaning in a list of conditions or of alternatives. */
    return items.map((x) => JSON.stringify(x)).sort().map((s) => JSON.parse(s));
  }
  if (node && typeof node === 'object') {
    const out = {};
    for (const k of Object.keys(node).sort()) {
      if (NOT_A_CONDITION.has(k)) continue;
      out[k] = canonical(node[k]);
    }
    return out;
  }
  return node;
}

/** A string that is equal for two Opportunities exactly when their requirements are. */
export function admissionSignature(opportunity) {
  return JSON.stringify(canonical(opportunity?.requirements || []));
}

/* --- Near-duplicates ---------------------------------------------------- */

/** Degree words that do not make a different subject. */
const CREDENTIAL_WORDS = new Set(['bsc', 'beng', 'ba', 'bba', 'bfa', 'bmus', 'llb', 'ap', 'pba', 'msc', 'tech', 'hons', 'honours', 'bachelor', 'bachelors', 'programme', 'program', 'degree', 'of', 'in']);

/** Accents off and lower case: "Sønderborg" and "sonderborg" are one word. */
const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ø/gi, 'o').replace(/æ/gi, 'ae').replace(/å/gi, 'a').toLowerCase();

/** The words of a list of place names ("Lappeenranta and Lahti", "dk-herning"), for nameStem. */
export function placeWords(places = []) {
  const out = new Set();
  for (const p of places) {
    for (const w of fold(p).replace(/^[a-z]{2}-/, '').split(/[^a-z0-9]+/)) if (w.length > 2 && !['and', 'the'].includes(w)) out.add(w);
  }
  return out;
}

/**
 * A programme name reduced to its subject, for telling "the same programme"
 * apart from a different one (issue #52): no degree prefix ("BSc in",
 * "Bachelor's Programme in"), no brackets ("(Herning)", "(HEBUT double
 * degree)"), no dash suffix, no campus (", Campus Herning", "at Herning", or
 * any word that is one of the institution's `places`), no "with professional
 * experience", no degree words.
 */
export function nameStem(name, places = new Set()) {
  const words = places instanceof Set ? places : placeWords(places);
  return fold(name)
    .replace(/[´’']/g, '')
    .replace(/^international\s+bachelor(?:s)?\b/, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s[–—-]\s.*$/, ' ')
    .replace(/,\s*campus\b.*$/, ' ')
    .replace(/\s+at\s+[^,]*$/, ' ')
    .replace(/\bwith\s+(?:a\s+)?(?:professional|work|practical)\s+experience\b/, ' ')
    .replace(/\bwith\s+(?:a\s+)?(?:year\s+in\s+industry|placement|internship)\b/, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((w) => w && !CREDENTIAL_WORDS.has(w) && !words.has(w))
    .join(' ');
}

const GLUE = new Set(['and', 'the', 'for', 'with', 'a', 'an', 'to', 'on']);

/**
 * Whether two names look like one programme to a student: the same stem, or
 * near it — one stem is the other with words added ("International Business"
 * and "International Business and Politics"), two thirds of their words are
 * shared, or they share the umbrella before a comma ("Sciences, Mathematics"
 * and "Sciences, Physics"). A near pair must be one family or say, in
 * `separateFrom`, why it is two cards. Returns 'same', 'near' or null.
 */
export function namesAlike(a, b, places = new Set()) {
  const sa = nameStem(a, places);
  const sb = nameStem(b, places);
  if (!sa || !sb) return null;
  if (sa === sb) return 'same';
  if (sa.startsWith(`${sb} `) || sb.startsWith(`${sa} `)) return 'near';
  /* Content words, each once: "and" is shared by half the catalogue. */
  const content = (st) => new Set(st.split(' ').filter((w) => !GLUE.has(w)));
  const wa = content(sa);
  const wb = content(sb);
  const shared = [...wa].filter((w) => wb.has(w)).length;
  if (shared && shared / Math.max(wa.size, wb.size) >= 2 / 3) return 'near';
  const umbrella = (n) => (/,/.test(n) ? nameStem(String(n).split(',')[0], places) : null);
  if (umbrella(a) && umbrella(a) === umbrella(b)) return 'near';
  return null;
}

/**
 * Pairs of programmes at one institution whose names are alike (namesAlike)
 * and which neither share a family nor declare themselves separate.
 * `placesOf(p)` gives the place names a programme's campus words come from.
 */
export function suspectedVariants(programmes, placesOf = () => []) {
  const out = [];
  const byInst = new Map();
  for (const p of programmes) {
    if (!byInst.has(p.institution)) byInst.set(p.institution, []);
    byInst.get(p.institution).push(p);
  }
  const declared = (a, b) => (a.separateFrom || []).some((s) => s.programme === b.id) || (b.separateFrom || []).some((s) => s.programme === a.id);
  for (const list of byInst.values()) {
    const places = placeWords(list.flatMap((p) => placesOf(p)));
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const [a, b] = [list[i], list[j]];
        const alike = namesAlike(a.name, b.name, places);
        if (!alike) continue;
        if (a.family?.id && a.family.id === b.family?.id) continue;
        if (declared(a, b)) continue;
        out.push([a.id, b.id, alike]);
      }
    }
  }
  return out;
}

/* --- The checks --------------------------------------------------------- */

/**
 * Problems with the families in a catalogue, as sentences. `opportunities` are
 * the canonical Opportunity records; each member's are compared by signature.
 */
export function checkFamilies(programmes, opportunities) {
  const problems = [];
  const oppsOf = new Map();
  for (const o of opportunities) {
    if (!oppsOf.has(o.programme)) oppsOf.set(o.programme, []);
    oppsOf.get(o.programme).push(o);
  }
  const placesOf = (p) => new Set((oppsOf.get(p.id) || []).map((o) => o.place));
  const credOf = (p) => `${p.credential?.abbreviation || p.credential?.localTitle || ''}|${p.credential?.years ?? ''}|${p.credential?.ects ?? ''}`;

  for (const fam of families(programmes).values()) {
    const at = `family ${fam.id}`;
    const m = fam.members;
    if (m.length < 2) problems.push(`${at}: has one member (${m[0].id}); a family is two or more paths`);
    for (const key of ['name', 'axis', 'admission']) {
      const vals = new Set(m.map((p) => p.family[key]));
      if (vals.size > 1) problems.push(`${at}: members disagree on ${key} (${[...vals].join(' / ')})`);
    }
    if (new Set(m.map((p) => p.institution)).size > 1) problems.push(`${at}: members belong to different institutions`);
    const primaries = m.filter((p) => p.family.primary);
    if (primaries.length !== 1) problems.push(`${at}: ${primaries.length} primary members; exactly one is the card's link`);
    const orders = m.map((p) => p.family.order);
    if (orders.some((o) => o == null) || new Set(orders).size !== orders.length) problems.push(`${at}: path order must be set and distinct (${orders.join(', ')})`);
    const lines = new Set();
    for (const p of m) {
      const f = p.family;
      if (!f.path || f.path.length > PATH_LABEL_MAX) problems.push(`${at}: ${p.id} path label must be 1–${PATH_LABEL_MAX} characters`);
      if (!f.differs || f.differs.length > DIFFERS_MAX || /\n/.test(f.differs)) problems.push(`${at}: ${p.id} "differs" must be one line of at most ${DIFFERS_MAX} characters`);
      if (lines.has(f.differs)) problems.push(`${at}: two paths have the same "differs" line — then they do not differ`);
      lines.add(f.differs);
      if (!(oppsOf.get(p.id) || []).length) problems.push(`${at}: ${p.id} has no Opportunity`);
    }

    /* Admission: declared vs computed. */
    const sigs = new Set(m.flatMap((p) => (oppsOf.get(p.id) || []).map(admissionSignature)));
    const computed = sigs.size > 1 ? 'differs' : 'same';
    if (fam.admission !== computed) {
      problems.push(`${at}: says admission is "${fam.admission}" but the members' requirements are ${computed === 'differs' ? 'different' : 'identical'}`);
    }

    /* Axis: the thing it names must actually vary. */
    const axis = fam.axis;
    if (!FAMILY_AXES.includes(axis)) problems.push(`${at}: axis "${axis}" is not one of ${FAMILY_AXES.join(', ')}`);
    if (axis === 'campus' && new Set(m.map((p) => [...placesOf(p)].sort().join('+'))).size < 2) problems.push(`${at}: axis is campus but every path is on the same campus`);
    if (axis === 'credential' && new Set(m.map(credOf)).size < 2) problems.push(`${at}: axis is credential but every path awards the same credential`);
  }

  for (const [a, b, alike] of suspectedVariants(programmes, (p) => [...placesOf(p)])) {
    problems.push(`${a} and ${b}: ${alike === 'same' ? 'the same subject' : 'near-identical names'} at one institution but neither in one family nor declared separate (separateFrom)`);
  }
  for (const p of programmes) {
    for (const s of p.separateFrom || []) {
      if (!programmes.some((q) => q.id === s.programme)) problems.push(`${p.id}: separateFrom names ${s.programme}, which is not a programme`);
    }
  }

  /* The owner's acceptance line (#52): no two cards at one institution share
     a name. A card is a family (its name) or a programme outside one (its own). */
  const titlesBy = new Map();
  const counted = new Set();
  for (const p of programmes) {
    const key = cardKey(p);
    if (counted.has(key)) continue;
    counted.add(key);
    if (!titlesBy.has(p.institution)) titlesBy.set(p.institution, []);
    titlesBy.get(p.institution).push(p.family?.name || p.name);
  }
  for (const [inst, titles] of titlesBy) {
    const mine = programmes.filter((p) => p.institution === inst);
    const words = placeWords(mine.flatMap((p) => [...placesOf(p)]));
    const separateStems = new Set(mine.filter((p) => p.separateFrom?.length).map((p) => nameStem(p.name, words)));
    for (const [title, n] of nameClashes(titles, (t) => nameStem(t, words), separateStems)) {
      problems.push(`${inst}: ${n} programme cards would be called "${title}"; make them one family, or name them apart`);
    }
  }
  return problems;
}

/* --- The same families in a school record ------------------------------- */

/**
 * A school record (data/schools/<key>.json, schemas/school.schema.json) lists
 * its programmes inline, without ids, so a family there is named rather than
 * numbered: every member carries
 *
 *   "family": { "name": "Electrical Engineering", "axis": "credential",
 *               "path": "LUT + HEBUT double degree", "differs": "…", "primary": false }
 *
 * and the members of one family are the programmes of one record that share
 * `family.name`. It is the same decision as a canonical family — the card's
 * title, what the paths differ on, one line per path saying how — and it is
 * checked the same way. `separateFrom: [{ name, reason }]` records a
 * deliberate "these look alike but are two cards" (issue #52).
 */

/** A school's programmes as cards: `{ key, family, members, lead }`, in the order given. */
export function schoolCardGroups(programmes = []) {
  const groups = new Map();
  for (const [i, p] of programmes.entries()) {
    const key = p.family?.name ? `family:${p.family.name}` : `programme:${p.slug || p.url || i}`;
    if (!groups.has(key)) groups.set(key, { key, family: p.family?.name ? p.family : null, members: [] });
    groups.get(key).members.push(p);
  }
  for (const g of groups.values()) g.lead = g.members.find((p) => p.family?.primary) || g.members[0];
  return [...groups.values()];
}

/** The title a card shows: its family's name, or its programme's. */
export const cardTitle = (group) => group.family?.name || group.lead.name;

/** Two card titles are "the same name" when they match ignoring case, spacing and punctuation. */
export const sameName = (a, b) => normalName(a) === normalName(b);
export function normalName(name) {
  return String(name || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Titles that more than one card of one list shares, as `[title, count]`. */
export function nameClashes(titles, keyOf = normalName, allowed = new Set()) {
  const seen = new Map();
  for (const t of titles) {
    const k = keyOf(t);
    if (allowed.has(k)) continue;
    if (!seen.has(k)) seen.set(k, { title: t, n: 0 });
    seen.get(k).n++;
  }
  return [...seen.values()].filter((x) => x.n > 1).map((x) => [x.title, x.n]);
}

/** Problems with the families of one school record, as sentences. */
export function checkSchoolFamilies(programmes = [], where = 'record', places = []) {
  const problems = [];
  const groups = schoolCardGroups(programmes);
  const cityOf = (p) => p.city || '';
  for (const g of groups) {
    if (!g.family) continue;
    const at = `${where}: family "${g.family.name}"`;
    const m = g.members;
    if (m.length < 2) problems.push(`${at} has one member; a family is two or more paths`);
    if (new Set(m.map((p) => p.family.axis)).size > 1) problems.push(`${at}: members disagree on axis`);
    const axis = m[0].family.axis;
    if (!FAMILY_AXES.includes(axis)) problems.push(`${at}: axis "${axis}" is not one of ${FAMILY_AXES.join(', ')}`);
    if (m.filter((p) => p.family.primary).length !== 1) problems.push(`${at}: exactly one member must be primary (the card's link)`);
    const labels = new Set();
    const lines = new Set();
    for (const p of m) {
      const f = p.family;
      if (!f.path || f.path.length > PATH_LABEL_MAX) problems.push(`${at}: "${p.name}" path label must be 1–${PATH_LABEL_MAX} characters`);
      if (labels.has(f.path)) problems.push(`${at}: two paths are both called "${f.path}"`);
      labels.add(f.path);
      if (!f.differs || f.differs.length > DIFFERS_MAX || /\n/.test(f.differs)) problems.push(`${at}: "${p.name}" "differs" must be one line of at most ${DIFFERS_MAX} characters`);
      if (lines.has(f.differs)) problems.push(`${at}: two paths have the same "differs" line — then they do not differ`);
      lines.add(f.differs);
    }
    if (axis === 'campus' && new Set(m.map(cityOf)).size < 2) problems.push(`${at}: axis is campus but every path is on the same campus`);
    if (axis === 'credential' && new Set(m.map((p) => `${p.credential}|${p.years}`)).size < 2 && new Set(m.map((p) => p.family.path)).size < 2) {
      problems.push(`${at}: axis is credential but every path awards the same credential`);
    }
  }

  /* Alike names (the same stem, or near it): one family, or declared separate. */
  const declared = (a, b) => (a.separateFrom || []).some((s) => s.name === b.name) || (b.separateFrom || []).some((s) => s.name === a.name);
  const words = placeWords([...places, ...programmes.map((p) => p.city).filter(Boolean)]);
  for (let i = 0; i < programmes.length; i++) {
    for (let j = i + 1; j < programmes.length; j++) {
      const [a, b] = [programmes[i], programmes[j]];
      const alike = namesAlike(a.name, b.name, words);
      if (!alike) continue;
      if (a.family?.name && a.family.name === b.family?.name) continue;
      if (declared(a, b)) continue;
      problems.push(`${where}: "${a.name}" and "${b.name}" ${alike === 'same' ? 'are the same subject' : 'have near-identical names'} but are neither one family nor declared separate (separateFrom)`);
    }
  }
  for (const p of programmes) {
    for (const s of p.separateFrom || []) {
      if (!programmes.some((q) => q.name === s.name && q !== p)) problems.push(`${where}: "${p.name}" separateFrom names "${s.name}", which is not a programme of this record`);
    }
  }

  /* The owner's acceptance line (#52): no two cards at one institution share
     a name — or a name once its campus and degree words are set aside, unless
     the two are declared separate. */
  const separateStems = new Set(programmes.filter((p) => p.separateFrom?.length).map((p) => nameStem(p.name, words)));
  for (const [title, n] of nameClashes(groups.map(cardTitle), (t) => nameStem(t, words), separateStems)) {
    problems.push(`${where}: ${n} programme cards would be called "${title}"; make them one family, or name them apart`);
  }
  return problems;
}
