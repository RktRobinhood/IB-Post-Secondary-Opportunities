import { html, toString, firstSentence, plural } from './html.mjs';
import { dataTable } from './components.mjs';
import { buildSubjectIndex, ibTermsFor } from './eligibility.mjs';

/** Live tables for an optional country recognition handbook. The field names
 * and headings belong to its data, including the local subject vocabulary. */
export function recognitionGuideTokens(site, config) {
  const c = site[config.handbook];
  if (!c) return {};
  const scheme = (site.recognitionSchemes || []).find((x) => x.authority?.name === c.authority?.name);
  const institutions = [...(site.graph?.institutions?.values() || [])].filter((i) => i.ibEquivalences?.length);
  const index = buildSubjectIndex({ subjects: site.ibSubjects || [], schemes: scheme ? [scheme] : [], institutions });
  const subject = (m) => m[config.subjectField];
  const local = (m) => m[config.localSubjectField] || subject(m);
  const asked = new Map();
  const walk = (r, id) => {
    if (r.kind === 'subject-combination') return (r.alternatives || []).flat().forEach((x) => walk(x, id));
    if (r.levelScale !== scheme?.subjectScale?.id || !r.subject || !r.level) return;
    const key = `${r.subject}|${r.level}`;
    if (!asked.has(key)) asked.set(key, new Set());
    asked.get(key).add(id);
  };
  for (const p of site.programmes || []) for (const r of p.requirements || []) walk(r, p.id);
  const rank = new Map((scheme?.subjectScale?.levels || []).map((l) => [l.code, l.rank]));
  const names = new Map(c.subjectLevels.map.map((m) => [`${subject(m)}|${m.level}`, local(m)]));
  const levels = [...asked.keys()].map((k) => k.split('|'))
    .sort((a, b) => a[0].localeCompare(b[0]) || (rank.get(b[1]) ?? 0) - (rank.get(a[1]) ?? 0))
    .map(([name, level]) => {
      const requirement = { subject: name, level, levelScale: scheme.subjectScale.id };
      const t = ibTermsFor(requirement, index);
      const own = names.get(`${name}|${level}`);
      const additions = institutions.map((i) => ({ i, t: ibTermsFor(requirement, index, i.id) })).filter(({ t: x }) => x.institution);
      return [
        html`<strong>${name} ${level}</strong>${own ? html`<br><small lang="${config.language}">${own} ${level}</small>` : ''}`,
        t.phrase
          ? html`<span class="req-ib">${t.phrase}</span>${(t.cautions || []).map((x) => html`<br><small>${x}</small>`)}`
          : html`<span class="req-none">No ${additions.length ? 'national ' : ''}IB equivalent.</span> <small>${firstSentence(t.none, 40)}</small>${additions.map(({ i, t: x }) => html`<br><small><strong>${i.shortName || i.name}:</strong> ${x.institution.phrase}</small>`)}`,
        plural(asked.get(`${name}|${level}`).size, 'programme'),
      ];
    });
  const byCourse = new Map();
  for (const m of c.subjectLevels.map) for (const course of m.ib) {
    if (!byCourse.has(course)) byCourse.set(course, []);
    byCourse.get(course).push({ level: `${subject(m)} ${m.level}`, local: `${local(m)} ${m.level}`, asked: asked.get(`${subject(m)}|${m.level}`)?.size || 0, note: m.note || null });
  }
  const lookup = [...byCourse].map(([course, levels]) => ({ course, levels }));
  for (const s of c.subjectLevels.specialCases) lookup.push({ course: s.subject, verdict: s.verdict });
  lookup.sort((a, b) => a.course.localeCompare(b.course));
  const table = (name, rows, caption) => toString(dataTable({ head: config.headings[name], rows, caption })).match(/<table[\s\S]*<\/table>/)?.[0] || '';
  const tokens = {
    requirements: table('requirements', levels),
    requirementCount: String(levels.length),
    average: table('average', c.gradeAverage.table.map((r) => [String(r.ib), { num: Number(r[config.gradeField]).toFixed(1) }]), c.gradeAverage.appliesTo),
    single: table('single', c.singleGrade.table.map((r) => [String(r.ib), r.descriptor, { num: String(r[config.gradeField]) }]), c.singleGrade.usedFor),
    subjects: table('subjects', c.subjectLevels.map.map((m) => [local(m), m.level, m.ib.length ? html`${m.ib.map((x, n) => html`${n ? html`<br>` : ''}${x}`)}${m.note ? html`<br><small>${m.note}</small>` : ''}${m.warning ? html`<br><small><strong>${m.warning}</strong></small>` : ''}` : html`<em>No IB equivalent listed.</em>${m.warning ? html`<br><small>${m.warning}</small>` : ''}`]), config.subjectCaption),
    access: table('access', c.access.rules.map((r) => [r.situation, r.givesAccessTo, [r.detail, r.note].filter(Boolean).join(' ')]), c.access.summary),
    lookupOptions: toString(html`<option value="">Choose a subject and level</option>${lookup.map((r, n) => html`<option value="${n}">${r.course}</option>`)}`),
    conversionData: JSON.stringify({ average: c.gradeAverage.table, single: c.singleGrade.table, lookup }).replace(/</g, '\\u003c'),
  };
  for (const [key, language] of Object.entries(c.subjectLevels.languages || {})) tokens[`language.${key}`] = table('languages', language.rows.map((r) => [r[config.subjectField], r.ib]), language.applies);
  return tokens;
}
