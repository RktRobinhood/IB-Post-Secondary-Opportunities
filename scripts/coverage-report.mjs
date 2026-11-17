/** Country and school coverage from the single authoring model.
 * node scripts/coverage-report.mjs [--stdout] [--handoff <country>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { load, picture } from '../src/lib/data.mjs';
import { isEnglishStudyOption } from '../src/lib/schools.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const at = process.argv.indexOf('--handoff');
const handoffCode = at >= 0 && !process.argv[at + 1]?.startsWith('--') ? process.argv[at + 1]?.toLowerCase() : null;
if (at >= 0 && !handoffCode) {
  console.error('Missing country code after --handoff. Example: --handoff fr');
  process.exit(2);
}
const site = await load();
const hasDetail = (p) => Boolean(p.about?.trim() && (p.selection?.length || p.selectionNote || p.selectionFactors?.length || p.cutoff?.ibPoints || p.restrictedAdmission === false));
// The loader assigns the photographs the published cards actually use. A
// discipline-pool image is useful coverage, but is not a programme's own photo.
const hasOwnPhoto = (p) => Boolean(p.backdrop?.src && /^(programme|school):/.test(p.backdrop.scope || ''));
const countries = site.destinations.filter((c) => c.institutions?.length).map((country) => {
  const rows = country.institutions.map((inst) => {
    const rec = inst.school;
    const photo = Boolean(picture(site, inst.key));
    if (!rec) return { key: inst.key, state: 'no record', photo, degrees: 0, detailed: 0, ownPhoto: 0, gaps: ['no record'] };
    const programmes = rec.programmes || [];
    const detailed = programmes.filter(hasDetail).length;
    const ownPhoto = programmes.filter(hasOwnPhoto).length;
    const assignedPhoto = programmes.filter((p) => p.backdrop?.src).length;
    const gaps = [];
    if (!rec.scope) gaps.push('outline only: programme coverage and admissions need research');
    if (rec.scope === 'listed' && !programmes.length) gaps.push('listed but no degrees');
    if (detailed < programmes.length) gaps.push(`${programmes.length - detailed} of ${programmes.length} degrees lack a description or selection explanation`);
    if (ownPhoto < programmes.length) gaps.push(`${programmes.length - ownPhoto} of ${programmes.length} degrees have no photo of their own`);
    if (rec.scope === 'catalogue' && !programmes.length) gaps.push('no flagships yet');
    if (rec.scope === 'catalogue' && !rec.faculties?.length) gaps.push('no faculties yet');
    if (assignedPhoto < programmes.length) gaps.push(`${programmes.length - assignedPhoto} degrees have no assigned local photo`);
    if (!photo && rec.scope !== 'none') gaps.push('no school photo');
    return { key: inst.key, state: rec.scope || 'outline', published: isEnglishStudyOption(inst), photo, degrees: programmes.length, detailed, ownPhoto, assignedPhoto, gaps };
  });
  const sum = (field) => rows.reduce((n, r) => n + Number(r[field] || 0), 0);
  return { cc: country.code, name: country.name, rows, institutions: rows.length,
    records: rows.filter((r) => r.state !== 'no record').length,
    published: rows.filter((r) => r.published).length,
    scopes: Object.fromEntries(['listed', 'catalogue', 'none', 'outline'].map((scope) => [scope, rows.filter((r) => r.state === scope).length])),
    degrees: sum('degrees'), detailed: sum('detailed'), ownPhoto: sum('ownPhoto'), assignedPhoto: sum('assignedPhoto'), schoolPhoto: sum('photo') };
}).sort((a, b) => a.cc.localeCompare(b.cc));
const sum = (field) => countries.reduce((n, c) => n + c[field], 0);
const pct = (a, b) => b ? `${Math.round(a * 100 / b)}%` : '–';
const out = [
  '# Degree catalogue coverage', '',
  `Generated from data/schools/ on ${new Date().toISOString().slice(0, 10)}. Re-run after a country batch.`, '',
  'Every country uses the same school records. Research, programme detail and imagery are separate counts; none establishes admission eligibility or country completeness.', '',
  '## Totals', '',
  `- Institutions with a record: **${sum('records')} of ${sum('institutions')}**.`,
  `- Published institutions: **${sum('published')}**; outline-only records still needing research: **${countries.reduce((n, c) => n + c.scopes.outline, 0)}**. An existing file does not establish research completeness.`,
  `- Degrees listed: **${sum('degrees')}**; with about and selection: **${sum('detailed')}** (${pct(sum('detailed'), sum('degrees'))}).`,
  `- Degrees with a photograph of their own: **${sum('ownPhoto')}**.`,
  `- Degrees with an assigned local photograph, including discipline pools: **${sum('assignedPhoto')} of ${sum('degrees')}**.`,
  `- Institutions with a school photo: **${sum('schoolPhoto')} of ${sum('institutions')}**.`, '',
  '## By country', '',
  '| Country | Records | Published | Listed / catalogue / none / outline | Degrees | Programme detail | Own / assigned photo | School photo |',
  '|---|---|---|---|---|---|---|---|',
  ...countries.map((c) => `| ${c.name} (${c.cc}) | ${c.records}/${c.institutions} | ${c.published} | ${c.scopes.listed} / ${c.scopes.catalogue} / ${c.scopes.none} / ${c.scopes.outline} | ${c.degrees} | ${c.detailed} (${pct(c.detailed, c.degrees)}) | ${c.ownPhoto} / ${c.assignedPhoto} | ${c.schoolPhoto}/${c.institutions} |`),
  '', '## By institution', '', 'Only institutions with a gap are listed.',
];
for (const c of countries) {
  const missing = c.rows.filter((r) => r.gaps.length);
  if (missing.length) out.push('', `### ${c.name}`, '', ...missing.map((r) => `- \`${r.key}\` (${r.state}, ${r.degrees} degrees): ${r.gaps.join('; ')}`));
}
const handoff = handoffCode ? countries.find((c) => c.cc === handoffCode) : null;
if (handoffCode && !handoff) {
  console.error(`Unknown country code "${handoffCode}". Use a country with institutions in data/schools/.`);
  process.exit(2);
}
const handoffText = handoff ? [
  `## Country handoff: ${handoff.name} (\`${handoff.cc}\`)`, '',
  `- Records: **${handoff.records}/${handoff.institutions} institutions**; ${handoff.institutions - handoff.records} missing records; ${handoff.scopes.listed} listed, ${handoff.scopes.catalogue} catalogue, ${handoff.scopes.none} none, ${handoff.scopes.outline} outline-only. ${handoff.published} institutions are published.`,
  `- Programme detail: **${handoff.detailed}/${handoff.degrees} listed paths** have a description and an explanation of selection; ${handoff.degrees - handoff.detailed} missing detail.`,
  `- Programme photos: **${handoff.ownPhoto}/${handoff.degrees} listed paths** have their own photo; **${handoff.assignedPhoto}/${handoff.degrees}** have an assigned local photograph, including discipline pools.`,
  `- Institution photos: **${handoff.schoolPhoto}/${handoff.institutions} institutions** publish a photo; ${handoff.institutions - handoff.schoolPhoto} use the designed empty state.`,
  `- Queue: **${handoff.rows.filter((r) => r.gaps.length).length} institutions** have detail or photo gaps in \`.cache/coverage.md\`.`,
].join('\n') : null;
if (process.argv.includes('--stdout')) process.stdout.write(handoffText || `${out.join('\n')}\n`);
else {
  fs.mkdirSync(path.join(ROOT, '.cache'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, '.cache/coverage.md'), `${out.join('\n')}\n`);
  console.log(`Wrote .cache/coverage.md: ${sum('records')}/${sum('institutions')} records, ${sum('degrees')} degrees.`);
  if (handoffText) console.log(`\n${handoffText}`);
}
