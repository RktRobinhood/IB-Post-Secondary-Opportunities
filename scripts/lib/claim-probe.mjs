/**
 * Turning a published claim into something you can look for on a page.
 *
 * A requirement in this repository is structured — `{subject: "Mathematics",
 * level: "A", minGrade: 4}`. The page it came from says "Matematik A" or
 * "Mathematics A (minimum grade 4)" or, on a bilingual site, both. Verification
 * is the job of deciding whether those are the same statement.
 *
 * Two rules shape everything here:
 *
 *   A MATCH IS EVIDENCE, A MISS IS A QUESTION. Finding "Matematik A" on the
 *   cited page is a good reason to believe we recorded it correctly. NOT finding
 *   it is not a reason to believe we recorded it wrongly — the page may have
 *   been restructured, or the requirement may live one click away. So a miss is
 *   reported for a person to look at, never acted on automatically.
 *
 *   NEVER MATCH LOOSELY ON A LEVEL. "Mathematics" appearing near "A" is not
 *   "Mathematics A", and the difference between Mathematics A and Mathematics B
 *   is the single most consequential distinction on this site. Level matching is
 *   exact or it does not count.
 */

/** Danish names for the Danish upper-secondary subjects our requirements use. */
export const SUBJECT_NAMES = {
  Mathematics: ['Mathematics', 'Matematik', 'Maths', 'Math'],
  English: ['English', 'Engelsk'],
  Danish: ['Danish', 'Dansk'],
  Physics: ['Physics', 'Fysik'],
  Chemistry: ['Chemistry', 'Kemi'],
  Biology: ['Biology', 'Biologi'],
  Biotechnology: ['Biotechnology', 'Bioteknologi'],
  Geoscience: ['Geoscience', 'Naturgeografi', 'Geovidenskab'],
  History: ['History', 'Historie'],
  'Contemporary History': ['Contemporary History', 'Samtidshistorie'],
  'History of Ideas': ['History of Ideas', 'Idéhistorie', 'Idehistorie'],
  'Social Studies': ['Social Studies', 'Samfundsfag'],
  'International Economics': ['International Economics', 'International økonomi', 'International Okonomi'],
  'Second Foreign Language': [
    'Second Foreign Language', '2nd foreign language', 'Andet fremmedsprog', 'fremmedsprog',
    'German', 'Tysk', 'French', 'Fransk', 'Spanish', 'Spansk',
  ],
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Normalise for comparison without destroying Danish letters. */
export const norm = (s) =>
  (s || '')
    .replace(/[   ]/g, ' ')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Probes for one `ib-subject` requirement.
 * `must` probes decide the verdict; `support` probes only enrich the excerpt.
 */
/**
 * A probe built from the source's own wording, when we kept it.
 *
 * This is the strongest check available, and the only one that is not a guess
 * about phrasing: `officialWording` is verbatim from the page, so if it is not
 * there any more, the page genuinely changed. It also rescues the cases where
 * our structured shape legitimately differs from the source's — Roskilde writes
 * "either beginner's language at A-level or advanced language at B-level" where
 * we record one B-level requirement, and no amount of subject-and-level
 * matching will ever reconcile those two sentences.
 *
 * Tolerant about the things that differ between a page and a stored string —
 * runs of whitespace, which dash was used, straight versus curly apostrophes —
 * and about nothing else.
 */
export function officialWordingProbe(req) {
  const raw = norm(req?.officialWording?.text || '');
  if (raw.length < 25) return null;
  const pattern = raw
    .split(/\s+/)
    .map((word) => esc(word).replace(/[–—-]/g, '[–—-]').replace(/'/g, "['’]"))
    .join('\\s+');
  return {
    kind: 'must',
    label: 'the source\'s own wording',
    re: new RegExp(pattern, 'i'),
  };
}

export function subjectProbes(req, subjectCatalogue = null) {
  const out = [];

  // Tried first, because a verbatim match is worth more than any inference.
  const official = officialWordingProbe(req);
  if (official) out.push(official);

  /* Two requirement shapes, and the newer one arrived after this file.
   *
   * ADR 0002 moved requirements into the IB's own units — `ibSubject` holding
   * a catalogue id like "mathematics-aa", and `ibLevel` holding HL or SL — and
   * every one of the 201 migrated records now uses it. This function still
   * expected `subject` + `level`, so it called esc(undefined) and brought the
   * whole run down at record 207.
   *
   * Both are handled, and they need different probes, because they are written
   * in different languages: a local-scale requirement is matched against a page
   * that says "Matematik A", and an IB-terms requirement against one that says
   * "Mathematics HL". Where the record kept the source's own wording, that is
   * tried before either and is worth more than both. */
  if (req.ibSubject) return [...out, ...ibTermProbes(req, subjectCatalogue)];

  const names = SUBJECT_NAMES[req.subject] || (req.subject ? [req.subject] : []);
  if (!names.length) return out;
  const lvl = req.level ? esc(req.level) : null;

  for (const name of names) {
    const n = esc(name);
    if (lvl) {
      // "Matematik A", "Mathematics A", "Mathematics at A level", "Matematik på A-niveau"
      out.push({
        kind: 'must',
        label: `${name} ${req.level}`,
        re: new RegExp(`\\b${n}\\b[\\s:,–-]*(?:at\\s+)?(?:på\\s+)?${lvl}\\b(?![+\\w])`, 'i'),
      });
      out.push({
        kind: 'must',
        label: `${name} at ${req.level} level`,
        re: new RegExp(`\\b${n}\\b[^.\\n]{0,40}?\\b${lvl}[\\s-]*(?:level|niveau)\\b`, 'i'),
      });
      // "Mathematics level A" / "Matematik niveau A" — subject, the word, then
      // the letter. SDU writes every requirement this way, so a matcher that
      // misses it reports an entire university as unsourced.
      out.push({
        kind: 'must',
        label: `${name} level ${req.level}`,
        re: new RegExp(`\\b${n}\\b[\\s:,–-]*(?:level|niveau)[\\s:-]*${lvl}\\b(?![+\\w])`, 'i'),
      });
      // Table layout: the subject is in one cell and its level in the next, so
      // they arrive on separate lines. CBS publishes every requirement this way.
      // Deliberately narrow — at most two short intervening lines — because the
      // looser version happily matches a "Mathematics" heading against a "B"
      // three paragraphs later, which is worse than no match at all.
      out.push({
        kind: 'must',
        weak: true,
        label: `${name} / ${req.level} (adjacent table cells)`,
        re: new RegExp(`\\b${n}\\b[ \\t]*\\n(?:[^\\n]{0,70}\\n){0,2}?[ \\t]*(?:[^\\n]{0,45}?\\b)?${lvl}\\b(?![+\\w])`, 'i'),
      });
    } else {
      out.push({ kind: 'must', label: name, re: new RegExp(`\\b${n}\\b`, 'i') });
    }
  }

  if (req.minGrade != null) {
    const g = esc(String(req.minGrade));
    out.push({
      kind: 'support',
      label: `minimum grade ${req.minGrade}`,
      re: new RegExp(`(?:minimum|mindst|at least|karakter(?:en)?|grade)[^.\\n]{0,30}\\b${g}(?:[.,]0)?\\b`, 'i'),
    });
  }
  return out;
}

/**
 * Probes for a requirement written in the IB's own units.
 *
 * The record says `{ ibSubject: "mathematics-aa", ibLevel: "HL" }`. The page
 * might say "Mathematics: Analysis and Approaches at Higher Level", or
 * "Mathematics AA HL", or — if it is a Danish page — "Matematik A", which is a
 * translation this file is deliberately not equipped to make. That last case is
 * what `officialWording` exists for, and it is why the wording probe runs
 * first.
 *
 * So these probes look for what an IB-terms requirement can honestly be
 * expected to appear as: the subject's catalogue name or its id read as words,
 * next to HL, SL, or the level spelled out.
 *
 * A catalogue is optional. Without one the id is read as words —
 * "mathematics-aa" becomes "mathematics aa" — which matches a surprising
 * amount and is better than crashing, which is what this replaced.
 */
function ibTermProbes(req, catalogue) {
  const id = String(req.ibSubject || '');
  if (!id) return [];

  const entry = catalogue?.get?.(id) || null;
  const fromId = id.replace(/-/g, ' ').trim();
  const names = [...new Set([entry?.name, fromId].filter(Boolean))];

  const level = String(req.ibLevel || '').toUpperCase();
  const levelWords =
    level === 'HL' ? '(?:HL|Higher\\s+Level)' : level === 'SL' ? '(?:SL|Standard\\s+Level)' : null;

  const out = [];
  for (const name of names) {
    // The catalogue name carries punctuation a page will not reproduce —
    // "Mathematics: Analysis and Approaches" — so the separators are loosened
    // rather than escaped literally.
    const loose = name
      .split(/[^A-Za-z0-9\u00c0-\u024f]+/)
      .filter(Boolean)
      .map((w) => esc(w))
      .join('[^A-Za-z0-9]{0,3}');
    if (!loose) continue;

    if (levelWords) {
      out.push({
        kind: 'must',
        label: `${name} at ${level}`,
        re: new RegExp(`\\b${loose}\\b[^.\\n]{0,40}?\\b${levelWords}\\b`, 'i'),
      });
      out.push({
        kind: 'must',
        weak: true,
        label: `${name} / ${level} (adjacent lines)`,
        re: new RegExp(`\\b${loose}\\b[ \\t]*\\n(?:[^\\n]{0,70}\\n){0,2}?[^\\n]{0,40}?\\b${levelWords}\\b`, 'i'),
      });
    } else {
      out.push({ kind: 'must', label: name, re: new RegExp(`\\b${loose}\\b`, 'i') });
    }
  }

  if (req.minGrade != null) {
    const g = esc(String(req.minGrade));
    out.push({
      kind: 'support',
      label: `minimum grade ${req.minGrade}`,
      re: new RegExp(`(?:minimum|mindst|at least|grade|karakter(?:en)?)[^.\\n]{0,30}\\b${g}\\b`, 'i'),
    });
  }

  return out;
}

export function languageProbes(req) {
  const text = norm(req.label || '');
  const out = [];
  if (/english/i.test(text)) {
    out.push({
      kind: 'must',
      label: 'English language requirement',
      re: /\b(?:english (?:language )?(?:proficiency|requirements?|qualifications?)|ielts|toefl|engelsk\s*[abc]\b)/i,
    });
  }
  if (/danish|dansk/i.test(text)) {
    out.push({ kind: 'must', label: 'Danish language requirement', re: /\b(?:danish|dansk)\b[^.\n]{0,40}\b(?:a\b|level|niveau|studieprøven)/i });
  }
  return out;
}

/** Free text — an `about` or `summary` claim. Matched by content words, not shape. */
export function textProbes(claim) {
  const words = norm(claim)
    .toLowerCase()
    .replace(/[^a-z0-9æøå\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
  const unique = [...new Set(words)];
  return unique.slice(0, 12).map((w) => ({
    kind: 'support',
    label: w,
    re: new RegExp(`\\b${esc(w)}`, 'i'),
  }));
}

const STOP = new Set([
  'this', 'that', 'with', 'from', 'they', 'their', 'have', 'been', 'will', 'your', 'about',
  'which', 'these', 'those', 'there', 'where', 'while', 'also', 'more', 'than', 'into',
  'offered', 'offers', 'programme', 'program', 'published', 'entry', 'requirements',
  'university', 'bachelor', 'degree', 'students', 'student', 'denmark', 'danish',
]);

/** Collect every probe for an opportunity's mandatory requirements. */
export function probesForRequirements(requirements, subjectCatalogue = null) {
  const groups = [];
  const walk = (rules, role) => {
    for (const r of rules || []) {
      if (r.mandatory === false) continue;
      if (r.kind === 'subject-combination') {
        // "One of these combinations" — finding ANY alternative confirms the
        // page still talks in these terms. Requiring all of them would fail by
        // construction, since the student only needs one.
        for (const alt of r.alternatives || []) walk(alt, 'one-of');
      } else if (r.kind === 'ib-subject' || r.kind === 'local-equivalency') {
        /* Three kinds reach here, not one.
         *
         * `ib-subject` is a requirement in the IB's own units — ibSubject,
         * ibLevel. `local-equivalency` is one on a local scale — subject
         * "English", levelScale "dk-abc", level "B" — which is the shape this
         * file was originally written for, under its old name.
         *
         * Only `ib-subject` was listed here, so every Danish requirement
         * produced no probes at all and each record reported "0 of 0
         * requirements found" — which reads as a soft pass and was in fact a
         * check that never ran. Denmark is the deepest data on the site and it
         * was the least verified. */
        const probes = subjectProbes(r, subjectCatalogue);
        // A requirement nothing can be looked for is not a passed check, and
        // silently dropping it would let a record report "all requirements
        // found" having looked for none of them.
        if (probes.length) {
          groups.push({ requirement: r.label || r.ibSubject || r.subject, role, probes });
        }
      } else if (r.kind === 'language-general') {
        const probes = languageProbes(r);
        if (probes.length) groups.push({ requirement: r.label || 'Language', role, probes });
      }
    }
  };
  walk(requirements, 'required');
  return groups;
}

/**
 * Run probes against page text.
 * @returns {{found: boolean, label: string|null, index: number, length: number}}
 */
export function runProbes(probes, text) {
  // Strong probes first, across every name spelling, before falling back to the
  // table-layout ones. A clean "Matematik A" should always win over a weak
  // match on a different spelling, so the quoted excerpt is the clearest one.
  const must = probes.filter((p) => p.kind === 'must');
  for (const set of [must.filter((p) => !p.weak), must.filter((p) => p.weak)]) {
    for (const p of set) {
      const m = p.re.exec(text);
      if (m) return { found: true, label: p.label, weak: !!p.weak, index: m.index, length: m[0].length };
    }
  }
  return { found: false, label: null, weak: false, index: -1, length: 0 };
}

/** How many of a set of soft probes hit — used to judge free-text claims. */
export function probeCoverage(probes, text) {
  const hits = probes.filter((p) => p.re.test(text));
  return { hit: hits.length, total: probes.length, first: hits[0] || null };
}

/* --- deadlines -------------------------------------------------------------
 *
 * A date is the one kind of claim on this site that can be checked properly
 * rather than approximately, and it is also the one that costs a student a year
 * when it is wrong. So deadlines get their own probes instead of being thrown
 * at the word counter with everything else.
 *
 * Only the day and month are matched, never the year: the cited page usually
 * describes the current cycle while our record targets a future intake, and
 * demanding "2027" would fail every correct deadline we hold.
 */

const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_DA = ['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december'];

export function milestoneProbes(milestone) {
  const out = [];
  if (!milestone?.date) return out;
  const [, mm, dd] = milestone.date.split('-');
  const day = String(Number(dd));
  const en = MONTHS_EN[Number(mm) - 1];
  const da = MONTHS_DA[Number(mm) - 1];
  if (!en) return out;

  const d = esc(day);
  out.push({
    kind: 'must',
    label: `${day} ${en}`,
    // The ordinal suffix is not decoration. CAO writes "1st February", UCAS
    // writes "15 Oct", and a matcher that knows only the second reported the
    // Irish and German calendars as having no source behind them — seven and
    // five milestones respectively, all of them present on the page and all of
    // them read by a person before being recorded. A confident false negative
    // about a deadline is the most expensive thing this tool can produce.
    re: new RegExp(
      `(?:\\b${d}(?:st|nd|rd|th)?\\.?\\s*(?:${en}|${da})\\b` +
        `|\\b(?:${en}|${da})\\s*${d}(?:st|nd|rd|th)?\\b(?!\\d)` +
        `|\\b${d}[./]${esc(String(Number(mm)))}\\b)`,
      'i'
    ),
  });

  if (milestone.timeOfDay) {
    const [h] = milestone.timeOfDay.split(':');
    const hh = esc(String(Number(h)));
    out.push({
      kind: 'support',
      label: `at ${milestone.timeOfDay}`,
      // "12:00", "12.00", "12 noon", "kl. 12" — and noon itself, which is how
      // most English-language Danish pages write it.
      re: new RegExp(
        `(?:\\b${hh}[:.]00\\b|\\b${hh}\\s*(?:noon|o'clock)\\b|\\bkl\\.?\\s*${hh}\\b` +
          `${Number(h) === 12 ? '|\\bnoon\\b|\\bmidday\\b' : ''})`,
        'i'
      ),
    });
  }
  return out;
}

/** One probe group per milestone, hardest consequence first. */
export function probesForMilestones(milestones) {
  const rank = { hard: 0, soft: 1, indicative: 2, personal: 3 };
  return (milestones || [])
    .filter((m) => m.date)
    .sort((a, b) => (rank[a.consequence] ?? 9) - (rank[b.consequence] ?? 9))
    .map((m) => ({
      requirement: `${m.label} — ${m.date}${m.timeOfDay ? ` ${m.timeOfDay}` : ''}`,
      // A provisional or purely personal milestone is one we already flag as
      // unconfirmed on the page, so not finding it on the source is expected
      // and must not be reported as a failure. It is informational: checked and
      // shown, but it neither proves nor disproves the record.
      role:
        m.provisional || m.consequence === 'personal' || m.consequence === 'indicative'
          ? 'informational'
          : 'required',
      probes: milestoneProbes(m),
    }))
    .filter((g) => g.probes.length);
}
