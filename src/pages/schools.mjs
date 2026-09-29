import { html, plural, truncate, firstSentence } from '../lib/html.mjs';
import { page } from '../lib/layout.mjs';
import { universityTemplate, statementShort } from '../templates/university.mjs';
import { picture } from '../lib/data.mjs';
import { hostOf, isHomepage, displayName, AFTER_DIPLOMA } from '../lib/schools.mjs';
import { datesPanel, isBinding } from '../lib/school-dates.mjs';
import { deadlineOf } from '../lib/programme-deadline.mjs';
import { schoolCardGroups } from '../lib/families.mjs';
import { pathsBlock } from '../lib/paths.mjs';
import { renderProgrammeCard } from '../lib/programme-card.mjs';

/**
 * A school page: one institution from a country profile (issue #43).
 *
 * The same shape as a canonical institution's page (institutions.mjs), in the
 * same order: the place, then what you could study there, then when and what
 * it asks of you, then one targeted link on to the institution's own site.
 *
 * What is in the programme section depends only on the record's `scope`
 * (schemas/school.schema.json), never on the country:
 *   - listed: a card per English-taught degree, each linking to its page here
 *     (school-programme.mjs), which hands on to the programme's own page;
 *   - catalogue: nearly everything is taught in English, so one way into the
 *     course search instead of a list nobody could keep true;
 *   - none: nothing in English, said plainly;
 *   - no record yet: the profile's one-line answer, and the admissions page.
 *
 * Every sentence written here is under twelve words: it appears on hundreds
 * of pages, and the text-walls guard counts repeated sentences of twelve or
 * more as boilerplate.
 */

export const FIELD = {
  engineering: 'Engineering', computing: 'Computing', 'natural-sciences': 'Sciences', mathematics: 'Maths',
  business: 'Business', economics: 'Economics', 'social-sciences': 'Social sciences', law: 'Law',
  humanities: 'Humanities', languages: 'Languages', education: 'Education', health: 'Health',
  medicine: 'Medicine', veterinary: 'Veterinary', 'agriculture-environment': 'Environment',
  'design-architecture': 'Design', 'arts-music': 'Arts', sport: 'Sport', 'hospitality-tourism': 'Hospitality',
  interdisciplinary: 'Interdisciplinary', other: 'Other',
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

/** A profile's free-text answer, down to its first clause: "None", "Limited". */
const firstClause = (text, words = 12) =>
  truncate(
    String(text || '')
      .replace(/,?\s*(checked|as of|on)\s+\d{4}-\d{2}-\d{2}/gi, '')
      .split(/[.;:(]| — /)[0]
      .trim()
      .split(/\s+/)
      .slice(0, words)
      .join(' '),
    80
  );

/**
 * The "In English:" answer, whole or not at all. `firstClause` cut at twelve
 * words and at every full stop, so sixteen answers stopped mid-sentence ("…and
 * unusually.", "In English: BA.", "…BA in Game Design,."; #41). This keeps the
 * first clause entire — a full stop only ends it when a space or the end
 * follows and it is not an initial ("B.A."), and a bracket ("BA (Hons) in…")
 * never does — and drops the line rather than cut a clause longer than 30
 * words.
 */
const wholeAnswer = (text) => {
  const clause = String(text || '')
    .replace(/,?\s*(checked|as of|on)\s+\d{4}-\d{2}-\d{2}/gi, '')
    .split(/(?<!\b[A-Z])\.(?=\s|$)|[;:]|\s—\s/)[0]
    .trim()
    .replace(/[\s,.]+$/, '');
  return clause && clause.split(/\s+/).length <= 30 ? clause : null;
};

/**
 * A profile's answer for a fact tile, whole or not at all: its first clause
 * when that is six words or fewer ("All courses in English"), never a clause
 * cut short ("All courses in"). A longer answer is left to the page's text.
 */
const shortClause = (text) => {
  const clause = firstClause(text, 99);
  return clause && clause.split(/\s+/).length <= 6 ? clause : null;
};

/** The one page a student goes on to: the record's hand-off, else admissions. */
function handoffOf(inst) {
  if (inst.school?.handoff) return inst.school.handoff;
  if (inst.admissionsUrl && !isHomepage(inst.admissionsUrl, inst.website)) {
    return { label: 'Its admissions page', url: inst.admissionsUrl };
  }
  return null;
}

/** The EU/EEA fee when every programme shares it, said once instead of per card. */
function sharedTuition(programmes) {
  const fees = new Set(programmes.map((p) => p.tuitionEuEea || null));
  return fees.size === 1 ? [...fees][0] : null;
}

/** A listed school's programmes in the order its page shows them; their own
    pages page through them in the same order. The ones a final-year student
    can apply to come first; a programme whose only round needs the Diploma
    in hand (`closesForDiplomaHolders`) waits after them. */
export const inCardOrder = (programmes) =>
  [...programmes].sort(
    (a, b) =>
      Number(Boolean(a.closesForDiplomaHolders)) - Number(Boolean(b.closesForDiplomaHolders)) ||
      a.field.localeCompare(b.field) ||
      a.name.localeCompare(b.name)
  );

/**
 * A listed school's cards, in card order: one per programme, or one per
 * family of paths — the same programme on several campuses, or as a double
 * degree or a longer version (issues #46 and #52; src/lib/families.mjs).
 */
export const schoolCards = (programmes) => schoolCardGroups(inCardOrder(programmes));

/** "3 years", "3½ years": a length as a path's fact. */
export const yearsText = (y) => `${String(y).replace(/\.5$/, '½')} ${Number(y) === 1 ? 'year' : 'years'}`;
const yrs = (y) => `${String(y).replace(/\.5$/, '½')} yrs`;

/** A credential without the programme name the card's title already says:
    "Bachelor in Architectural Studies" under "Architectural Studies" is "Bachelor". */
const credentialShort = (cred, title) => {
  const at = cred && title ? cred.toLowerCase().indexOf(title.toLowerCase()) : -1;
  if (at < 0) return cred;
  const rest = (cred.slice(0, at) + cred.slice(at + title.length))
    .replace(/\s+(in|of|en)\s*$/i, '').replace(/[\s,(]+$/, '').trim();
  return rest || cred;
};


/**
 * What differs between the paths of a family, fact by fact, for the card's
 * rows: only a fact whose value is not the same on every path, and not one
 * every path's own label already says ("Lahti" in "LUT + HEBUT double
 * degree, Lahti"). Each row is short: "60 places · €8,700 a semester".
 */
function pathRows(inst, members, chipOf) {
  const facts = [
    (p) => p.credential,
    (p) => yearsText(p.years),
    (p) => p.city || inst.city || null,
    (p) => placesText(p),
    (p) => chipOf(p),
    (p) => feeText(p),
  ].filter((f) => new Set(members.map((p) => f(p) ?? '')).size > 1)
    .filter((f) => !members.every((p) => f(p) && String(p.family.path).includes(f(p))));
  return members.map((p) => {
    // The record's own short line first (`cardLine`), then the facts that differ.
    const detail = [p.family.cardLine, ...facts.map((f) => f(p))].filter(Boolean);
    return { href: p.href, label: p.family.path, detail, full: detail };
  });
}

/**
 * Places as this reader meets them: the ones in their route where the record
 * splits them ("35 of 50 places in your route"), else all of them.
 */
export const placesText = (p) =>
  p.routePlaces && p.places ? `${p.routePlaces} of ${p.places} places in your route` : p.places ? plural(p.places, 'place') : null;

/**
 * A fee as a path's fact. A fee by the semester carries the path's number of
 * semesters beside it ("€8,700 a semester · 7 semesters"), because paths of
 * different lengths are not compared on the rate alone; no total is printed,
 * because whether every semester is charged is not recorded.
 */
export const feeText = (p) => {
  const fee = p.tuitionEuEea || null;
  if (!fee || !/\ba semester\b/i.test(fee) || !p.years) return fee;
  return `${fee} · ${Math.round(p.years * 2)} semesters`;
};

/** The sentences every path's `ib` line shares, in the lead's order: said once on the card. */
function sharedSentences(members) {
  const split = (t) => String(t || '').split(/(?<=[.!?])\s+(?=[A-Z])/).filter(Boolean);
  const [first, ...rest] = members.map((p) => split(p.ib));
  return (first || []).filter((sn) => rest.every((r) => r.includes(sn))).join(' ') || null;
}

/**
 * One programme card: a single programme's, or a family's (`group` from
 * schoolCards). A family card carries the family's name, its facts once
 * where every path shares them ("BSc (Tech) · 3 yrs · 2 campuses"), and a
 * short row per path linking to its page, with what differs about it.
 */
export function programmeCard(inst, group, { tuitionOnCard, headed, brief = false, at = null, statusOf = null }) {
  const g = group.members ? group : { family: null, members: [group], lead: group };
  const p = g.lead;
  const members = g.members;
  const fam = g.family && members.length > 1;
  const same = (f) => new Set(members.map((q) => f(q) ?? '')).size === 1;
  const cities = [...new Set(members.map((q) => q.city || inst.city || ''))];
  const where = cities.length > 1 ? `${cities.length} campuses` : p.city && p.city !== inst.city ? p.city : null;
  const years = same((q) => q.years)
    ? yrs(p.years)
    : `${String(Math.min(...members.map((q) => q.years))).replace(/\.5$/, '½')}–${yrs(Math.max(...members.map((q) => q.years)))}`;
  /* The same answer as the programme's own page ("Apply by 15 Apr", "Not
     open yet", "After your Diploma"), from programme-deadline.mjs when the
     caller has the site to ask; else only what the record's own `closes` says. */
  const chipOf = (q) =>
    statusOf ? statusOf(q) : q.closes ? (q.closesForDiplomaHolders ? AFTER_DIPLOMA : `Apply by ${shortDate(q.closes)}`) : null;
  const requirement = brief ? '' : fam ? sharedSentences(members) : p.ib || null;
  return renderProgrammeCard({
    // Its own page on this site (school-programme.mjs), where the link to the
    // programme's page on the institution's site now lives. A family's card
    // opens its primary path; each row opens its own.
    href: p.href,
    /* Its own photograph (#54), when one was chosen for it: a family's card
       shows its lead path's, else the first path's that has one. */
    backdrop: p.backdrop || members.find((q) => q.backdrop)?.backdrop || null,
    // The name without the degree type the line under it already says.
    title: displayName(fam ? g.family.name : p.name),
    // "BSc · 3 yrs · Vaasa": the degree type straight under the name.
    // `at`: the school, on a card that stands for another school's programme.
    // A family whose paths are different degrees (a single degree and a
    // dual one) leaves the credential to each path's row: joined with "or"
    // it read "BBA + Bachelor in or Bachelor in Economics + …".
    line: [same((q) => q.credential) ? credentialShort(p.credential, displayName(fam ? g.family.name : p.name)) : null, years, where].filter(Boolean).join(' · '),
    // School records currently carry their concise IB answer as prose. Put it
    // in the shared requirement slot rather than selecting a different card
    // layout; structured `needs` can deepen this adapter later.
    req: requirement ? html`<div class="req" data-req><p class="req__ib">${firstSentence(requirement, 22)}</p></div>` : '',
    paths: fam ? pathsBlock({ head: `${members.length} ${cities.length > 1 ? 'campuses' : 'paths'}`, rows: pathRows(inst, members, chipOf) }) : '',
    /* The Danish reference card uses its single chip for admission, not for
       a deadline or a fee. Those facts remain in the adjacent dates panel,
       the section lede and the programme page. Only claim open entry when
       every path explicitly records it. */
    tags: [members.every((q) => (q.selection || []).includes('open')) ? { label: 'Open entry', mod: 'ok' } : null].filter(Boolean),
    // At rest, the card says it opens a page.
    meta: [at || (headed ? null : FIELD[p.field])].filter(Boolean),
  });
}



/** What you could study here, as the university template's `study` slot. */
function programmeSection(site, inst, c) {
  const school = inst.school;
  const where = inst.shortName && inst.shortName.length > 4 ? inst.shortName : inst.name;

  if (school?.scope === 'listed') {
    const progs = inCardOrder(school.programmes);
    const fee = sharedTuition(progs);
    /* Each card carries its programme page's Apply-by answer. */
    const statusOf = (q) => deadlineOf(site, inst, c, q).chip;
    /* One card per programme, or per family of paths (#52). */
    const cards = schoolCards(school.programmes).map((g) => ({
      field: FIELD[g.lead.field],
      html: programmeCard(inst, g, { tuitionOnCard: !fee, headed: false, statusOf }),
      headedHtml: programmeCard(inst, g, { tuitionOnCard: !fee, headed: true, statusOf }),
    }));
    const lede = fee ? (fee === 'Free' ? 'Free for EU/EEA citizens.' : `EU/EEA tuition: ${fee}.`) : null;
    return { title: 'What you could study here', lede, cards };
  }

  if (school?.scope === 'catalogue') {
    return {
      title: 'What you could study here',
      handoff: html`<p class="handoff__line">${school.courses
        ? `${school.courses} undergraduate courses, all taught in English.`
        : `Nearly every course at ${where} is taught in English.`}</p>`,
    };
  }

  if (school?.scope === 'none') {
    return {
      title: school.language ? `Taught in ${school.language}` : 'Taught in the local language',
      handoff: html`<p class="handoff__line">${school.ib?.text || "No English-taught bachelor's here for 2027."}</p>`,
    };
  }

  // Not researched yet: the profile's one-line answer, honestly labelled.
  const answer = wholeAnswer(inst.englishBachelors);
  return {
    title: 'What you could study here',
    handoff: html`${answer ? html`<p class="handoff__line">In English: ${answer}.</p>` : ''}
      <p class="handoff__todo">Its programmes are not listed here yet.</p>`,
  };
}

export function schoolPage(site, inst, c, { prev, next }) {
  const school = inst.school;
  const pic = picture(site, inst.key);
  const go = handoffOf(inst);
  const statement = inst.ibRecognitionStatement;
  const apply = school?.apply || null;
  const lede = school?.summary || firstSentence(inst.note, 22);
  /* The same panel as a canonical institution's page (src/lib/school-dates.mjs):
     its own dates and its country's route, first on a phone and beside the
     degrees on a wide screen. */
  /* A school that runs its own selection (`ownDeadline`) is not bound by
     the route's general closing date, so its panel does not lead with it. */
  const dates = datesPanel(site, { ...inst, id: inst.key, destination: c.code }, {
    countryName: c.articleName || c.name,
    keep: school?.ownDeadline ? (e) => e.schoolOwn || !isBinding(e) : null,
  });

  const inEnglish =
    school?.scope === 'listed'
      ? plural(schoolCards(school.programmes).length, 'programme')
      : school?.scope === 'catalogue'
      ? school.courses ? `${school.courses} courses` : 'Nearly everything'
      : school?.scope === 'none'
      ? 'Nothing'
      : shortClause(inst.englishBachelors);

  const ibLink = (u, label) => html`<p><a href="${u}" rel="noopener nofollow">${label}<span aria-hidden="true"> ↗</span></a></p>`;
  const notes = school?.notes?.length ? school.notes : [];
  const links = [
    inst.admissionsUrl && inst.admissionsUrl !== go?.url && !isHomepage(inst.admissionsUrl, inst.website)
      ? { href: inst.admissionsUrl, label: 'Admissions' }
      : null,
    inst.ibPageUrl && !isHomepage(inst.ibPageUrl, inst.website) ? { href: inst.ibPageUrl, label: 'Its IB page' } : null,
  ].filter(Boolean);

  /* A school record as the university template's view model
     (src/templates/university.mjs): the same page as a Danish institution's. */
  return universityTemplate({
    hero: {
      eyebrow: [inst.city, c.name, inst.type].filter(Boolean).join(' · '),
      title: inst.name,
      lede,
      // Some Commons authors wrote a paragraph where their name goes; the line
      // under the photo keeps the name, and /credits/ keeps the rest.
      image: pic && !pic.external
        ? { src: pic.src, alt: pic.alt, credit: pic.credit && { ...pic.credit, text: truncate(pic.credit.text, 80) }, focal: '50% 45%' }
        : null,
      variant: pic && !pic.external ? undefined : 'panel',
    },
    glance: [
      { label: 'In English', value: inEnglish },
      { label: 'City', value: inst.city },
      // "Studyinfo.fi", not "Studyinfo.fi (national joint application)".
      { label: 'Apply via', value: apply ? html`<a href="${apply.url}" rel="noopener nofollow">${apply.via.split(' (')[0]}</a>` : null },
      { label: 'IB transcripts', value: statement?.transcripts5y ? `${statement.transcripts5y.toLocaleString('en-GB')} in 5 yrs` : null },
      { label: 'Students', value: inst.students ? inst.students.toLocaleString('en-GB') : null },
      { label: 'Founded', value: inst.founded ? String(inst.founded) : null },
    ],
    crumbs: [{ href: `${c.href}#institutions`, label: c.name }, { label: inst.shortName || inst.name }],
    dates,
    study: programmeSection(site, inst, c),
    topics: {
      ib: (school?.ib && school.scope !== 'none') || statement
        ? {
            short: (school?.scope !== 'none' && school?.ib?.text) || statementShort(statement),
            body: html`${school?.ib ? ibLink(school.ib.url, school.scope === 'none' ? 'Its language rules' : 'Where it says so') : ''}
              ${statement?.diplomaPolicy ? html`<blockquote><p>${statement.diplomaPolicy}</p></blockquote>` : ''}
              ${statement ? ibLink(statement.url, 'Its IB recognition statement') : ''}`,
            more: 'Where it says so',
          }
        : null,
      admissions: null,
      notes: notes.length
        ? {
            short: firstSentence(notes[0], 30),
            body: notes.length > 1 || firstSentence(notes[0], 30) !== notes[0] ? html`<ul>${notes.map((n) => html`<li>${n}</li>`)}</ul>` : '',
            more: `All ${plural(notes.length, 'note')}`,
          }
        // A profile note that says more than the hero already does.
        : inst.note && firstSentence(inst.note, 60) !== lede && inst.note.trim() !== lede
          ? {
              short: firstSentence(inst.note, 30),
              body: firstSentence(inst.note, 30) !== inst.note.trim() ? html`<p>${inst.note}</p>` : '',
              more: 'In full',
            }
          : null,
      sources: school?.sources || [],
    },
    rail: {
      checked: school?.retrieved,
      // Where nothing is taught in English the next step is another school here.
      action: school?.scope === 'none' || !go
        ? { href: `${c.href}#institutions`, label: `Other schools in ${c.name}` }
        : { href: go.url, label: 'The official page ↗', note: go.label },
      links: [
        ...(school?.scope === 'none' && go ? [{ href: go.url, label: go.label }] : []),
        ...links,
        ...(statement ? [{ href: statement.url, label: 'Its IB statement' }] : []),
      ],
      knownFor: inst.notableFields || [],
    },
    pager: { prev, next },
    page: {
      title: inst.name,
      description: truncate(
        school?.summary || `${inst.name} in ${c.name}: English-taught degrees and what it asks of IB students.`,
        155
      ),
      path: inst.href,
      section: '/countries/',
    },
  });
}
