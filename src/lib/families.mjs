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
const NOT_A_CONDITION = new Set(['id', 'evidence', 'note', 'notes', 'officialWording', 'label', 'labelLocal', 'applicability', 'alternativeRoute', 'description', 'meta', 'explanation']);

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

/** Credential abbreviations and campus suffixes that do not make a different subject. */
const CREDENTIAL_WORDS = new Set(['bsc', 'beng', 'ba', 'bba', 'ap', 'pba', 'msc', 'bachelor', 'of']);

/** A programme name reduced to its subject: no brackets, no dash suffix, no credential words. */
export function nameStem(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s[–—-]\s.*$/, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((w) => w && !CREDENTIAL_WORDS.has(w))
    .join(' ');
}

/**
 * Pairs of programmes at one institution whose names reduce to the same stem
 * and which neither share a family nor declare themselves separate.
 */
export function suspectedVariants(programmes) {
  const out = [];
  const byKey = new Map();
  for (const p of programmes) {
    const k = `${p.institution}|${nameStem(p.name)}`;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k).push(p);
  }
  const declared = (a, b) => (a.separateFrom || []).some((s) => s.programme === b.id) || (b.separateFrom || []).some((s) => s.programme === a.id);
  for (const list of byKey.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const [a, b] = [list[i], list[j]];
        if (a.family?.id && a.family.id === b.family?.id) continue;
        if (declared(a, b)) continue;
        out.push([a.id, b.id]);
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

  for (const [a, b] of suspectedVariants(programmes)) {
    problems.push(`${a} and ${b}: same subject at one institution but neither in one family nor declared separate (separateFrom)`);
  }
  for (const p of programmes) {
    for (const s of p.separateFrom || []) {
      if (!programmes.some((q) => q.id === s.programme)) problems.push(`${p.id}: separateFrom names ${s.programme}, which is not a programme`);
    }
  }
  return problems;
}
