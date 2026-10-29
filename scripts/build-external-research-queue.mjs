/** Rebuild the copyable external research queue from local records; no network or data edits. */
import fs from 'node:fs';
import path from 'node:path';
import { schoolKey, hostOf } from '../src/lib/schools.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const files = dir => fs.readdirSync(path.join(root, dir)).filter(f => f.endsWith('.json')).sort();
const exists = p => fs.existsSync(path.join(root, p));
const outDir = 'docs/research/external';
const asOf = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf || '')) throw new Error('Supply the local audit date: node scripts/build-external-research-queue.mjs YYYY-MM-DD');
const canonical = files('data/institutions').map(f => read(`data/institutions/${f}`));
const byHost = new Map(canonical.map(i => [hostOf(i.links?.website), i]));
const templateGaps = read('scripts/lib/template-gaps.json');
const pending = new Map();
for (const f of fs.readdirSync(path.join(root, 'docs/research/overviews')).filter(f => /^batch-\d+\.results\.jsonl$/.test(f)).sort()) {
  for (const line of fs.readFileSync(path.join(root, 'docs/research/overviews', f), 'utf8').split('\n').filter(s => s.trim())) {
    const r = JSON.parse(line);
    if (r.overview) {
      const key = `${r.key}\0${r.name}`;
      if (!pending.has(key)) pending.set(key, []);
      pending.get(key).push({ ...r, file: f });
    }
  }
}
const rows = [], pendingRows = [], excluded = [], canonicalSeen = new Set();
let profileCount = 0, recordCount = 0, missingOverviews = 0;
const programmeSeed = p => ({ name: p.name, credential: p.credential, ...(p.city ? { campus: p.city } : {}), url: p.url });
for (const f of files('data/countries')) {
  const c = read(`data/countries/${f}`);
  for (const i of c.institutions || []) {
    profileCount++;
    const key = schoolKey(c.code, i);
    const twin = byHost.get(hostOf(i.website));
    if (twin) { canonicalSeen.add(twin.id); continue; }
    const r = exists(`data/schools/${key}.json`) ? read(`data/schools/${key}.json`) : null;
    const seed = { institution_key: key, name: i.name, country: c.name, country_code: c.code,
      website: i.website || null, admissions_url: i.admissionsUrl || null, ib_url: i.ibPageUrl || null };
    if (!r) {
      rows.push({ priority: 1, country: c.name, ...seed, mode: 'full', gaps: ['full'],
        existing: { state: c.outline ? 'outline country profile only' : 'country profile only',
          english_taught_hint_unverified: i.englishBachelors || null, city_hint_unverified: i.city || null },
        targets: [] });
      continue;
    }
    recordCount++;
    if (r.scope === 'none') { excluded.push({ institution_key: key, name: i.name, reason: 'Researched scope none; no automatic re-research task.' }); continue; }
    const gaps = [], overviewTargets = [], detailTargets = [];
    if (r.scope === 'catalogue' && (r.programmes || []).length < 2) gaps.push('flagships');
    if (r.scope === 'catalogue' && !(r.faculties || []).length) gaps.push('faculties');
    if (r.scope === 'listed' && !(r.programmes || []).length) gaps.push('programme-list');
    if (!r.ib?.text || templateGaps[`universities/${key}`]?.includes('#ib')) gaps.push('ib-diploma');
    if (!r.sources?.length || templateGaps[`universities/${key}`]?.includes('#sources')) gaps.push('sources');
    for (const p of r.programmes || []) {
      if (!p.about || !p.selection?.length) detailTargets.push(programmeSeed(p));
      if (p.overview) continue;
      missingOverviews++;
      const candidates = pending.get(`${key}\0${p.name}`) || [];
      // Identical titles at different campuses may have different overviews.
      const candidatesForName = (r.programmes || []).filter(x => x.name === p.name);
      const prior = candidates.find(x => (x.sources || []).includes(p.url)) || (candidatesForName.length === 1 ? candidates[0] : null);
      if (prior) pendingRows.push({ institution_key: key, ...programmeSeed(p), file: prior.file });
      else overviewTargets.push(programmeSeed(p));
    }
    if (detailTargets.length) gaps.push('programme-detail');
    if (overviewTargets.length) gaps.push('overviews');
    if (!gaps.length) continue;
    const priority = gaps.some(g => g !== 'overviews') ? 2 : 3;
    rows.push({ priority, ...seed, mode: priority === 3 ? 'overview' : 'enrich', gaps,
      existing: { scope: r.scope, retrieved: r.retrieved || null, programme_count: r.programmes.length,
        faculty_count: r.faculties?.length || 0, programmes: priority === 2 ? r.programmes.map(programmeSeed) : [],
        handoff_url: r.handoff?.url || null, ib_summary_unverified: r.ib?.text || null },
      targets: [...new Map([...overviewTargets, ...detailTargets].map(p => [JSON.stringify(p), p])).values()] });
  }
}
// Denmark and the five Dutch canonical records have a different storage model.
// Queue only explicit missing IB sections, not a missing school-shaped file.
for (const i of canonical) {
  if (!templateGaps[`universities/${i.id}`]?.includes('#ib')) continue;
  const programmes = files('data/programmes').map(f => read(`data/programmes/${f}`)).filter(p => p.institution === i.id);
  rows.push({ priority: 2, institution_key: i.id, name: i.name,
    country: i.destination === 'dk' ? 'Denmark' : 'Netherlands', country_code: i.destination,
    website: i.links?.website || null, admissions_url: i.links?.admissions || null, ib_url: i.links?.ibPage || null,
    mode: 'enrich', gaps: ['ib-diploma'],
    existing: { state: 'canonical institution and programme records', programmes: programmes.map(p => ({ name: p.name, credential: p.credential?.abbreviation || p.credential?.localTitleEn || null, url: p.links?.official || null })) }, targets: [] });
}
rows.sort((a, b) => a.priority - b.priority || a.country.localeCompare(b.country) || a.name.localeCompare(b.name));
if (new Set(rows.map(r => r.institution_key)).size !== rows.length) throw new Error('Duplicate institution assignment');
const uniqueInstitutions = profileCount - canonicalSeen.size + canonical.length;
const totals = { as_of: asOf, unique_institutions: uniqueInstitutions, profile_institutions: profileCount,
  canonical_institutions: canonical.length, canonical_twins_in_profiles: canonicalSeen.size, dedicated_records: recordCount,
  full_research: rows.filter(r => r.priority === 1).length, partial_research: rows.filter(r => r.priority === 2).length,
  overview_only: rows.filter(r => r.priority === 3).length, assignments: rows.length,
  programme_overviews_missing_in_records: missingOverviews, programme_overviews_already_collected: pendingRows.length,
  programme_overviews_to_research: rows.reduce((n, r) => n + r.targets.filter(t => r.gaps.includes('overviews')).length, 0),
  researched_exclusions: excluded.length };
const lines = ['# Institution research assignments', '',
  `Local data audit dated ${asOf}. Use [RESEARCH_SPEC.md](RESEARCH_SPEC.md) with one assignment line below.`, '',
  'Copy the whole line inside a code block and attach or paste the spec. Each line requests one JSON file. Work in order: missing records, partial records, then descriptions. The line is JSON so names, punctuation and URLs survive copying.', '',
  `The audit covers **${uniqueInstitutions} distinct institutions**: ${profileCount} country-profile entries plus ${canonical.length} canonical institutions, with ${canonicalSeen.size} overlapping Dutch entries counted once. There are **${totals.full_research} full research tasks**, **${totals.partial_research} partial tasks**, and **${totals.overview_only} description-only tasks** (${rows.length} files in total).`, '',
  'Starting links and existing summaries are leads from local files, not freshly validated facts. A missing record can still have useful country-level research. Confirm the campus, awarding institution, first-year access and teaching language before listing programmes.', '',
  '## What the gap labels mean', '',
  '- `full`: establish scope and collect the complete institution research package.',
  '- `flagships`: fewer than two researched flagships; normally reach two to four, or document why fewer fit.',
  '- `faculties`: no first-year faculty guidance is recorded; a college with no faculty structure can document that.',
  '- `ib-diploma`: the institution IB summary or page section is missing. Research general entry plus material programme exceptions.',
  '- `sources`: the institution source section is missing.',
  '- `programme-list` or `programme-detail`: research the list, or the targeted programmes’ description and selection rules.',
  '- `overviews`: write a sourced paragraph only for the named `targets`; preserve exact names, credentials and campuses.', '',
  '## Audit boundaries', '',
  'This is a structural research queue, not a certification that other records are complete or current. Existing dates, subjects, fees and programme-list exhaustiveness still need verification when used. An absent points threshold, subject rule, cut-off, fee or local deadline does not automatically mean missing research: it may be unpublished, inapplicable or supplied by an application route. Those absences alone do not create tasks.', '',
  `${excluded.length} researched scope-none institutions are excluded from automatic repeat work. Photos, country-guide expansion and live-data integration are separate work. Canonical records are checked for explicit missing IB sections; their richer programme format is not judged using the school-record overview field.`, '',
  `**${pendingRows.length} programme descriptions already exist in local result files but are absent from records.** They are held for local review/integration and omitted from external targets; their presence does not mean they have passed review. The machine audit lists them in audit.json.`, '',
  'Regenerate after research is reviewed or integrated: `node scripts/build-external-research-queue.mjs YYYY-MM-DD`. Returned packs are not automatically subtracted: collection is not acceptance. Mark your own progress beside the relevant entry or keep a list of completed filenames.', ''];
for (const priority of [1, 2, 3]) {
  lines.push(`## Priority ${priority} ${priority === 1 ? 'Missing institution records' : priority === 2 ? 'Partial institution research' : 'Programme descriptions'}`, '');
  let country = '';
  for (const row of rows.filter(r => r.priority === priority)) {
    if (row.country !== country) { country = row.country; lines.push(`### ${country}`, ''); }
    lines.push(`**${row.name}** — \`${row.institution_key}\`; ${row.gaps.join(', ')}.`, '', '```json', JSON.stringify(row), '```', '');
  }
}
fs.mkdirSync(path.join(root, outDir), { recursive: true });
fs.writeFileSync(path.join(root, outDir, 'ASSIGNMENTS.md'), lines.join('\n'));
fs.writeFileSync(path.join(root, outDir, 'audit.json'), JSON.stringify({ totals, assignments: rows, pending_overviews: pendingRows, researched_exclusions: excluded }, null, 2) + '\n');
console.log(JSON.stringify(totals, null, 2));
