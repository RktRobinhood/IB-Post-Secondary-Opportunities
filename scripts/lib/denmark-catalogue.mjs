/** A conservative discovery comparison. A missing match is never a cancellation. */
import { intakeLanguageUnconfirmed } from '../../src/lib/intake-language.mjs';
const normal = (s) => String(s || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const institutionName = (s) => normal(String(s || '').replace(/\s+\([A-Z]{2,8}\)\s*$/, ''));

function courseIdentity(title) {
  let text = String(title || '').trim();
  const prefix = text.match(/^Bachelor of Engineering in\s+/i);
  const suffix = text.match(/(?:,\s*|\s*[-–—]\s*|\s+\()\s*(BSc|BEng|BA|BBA|Bachelor)(?:\s+in\s+[^()]+)?\)?\s*$/i);
  const credential = prefix ? 'beng' : suffix && /^b(sc|eng|a|ba)$/i.test(suffix[1]) ? suffix[1].toLowerCase() : null;
  if (prefix) text = text.slice(prefix[0].length);
  if (suffix) text = text.slice(0, suffix.index);
  text = text.replace(/^Bachelor(?:'s)?\s+(?:programme\s+)?(?:in|of)\s+/i, '');
  return { name: normal(text), credential };
}

export function compareDenmarkCatalogue(items, institutions, programmes, opportunities, intake = '2027-autumn') {
  const listed = opportunities.filter((o) => o.intake === intake && o.language?.instruction === 'English' && o.language?.fullyInLanguage === true);
  const current = new Set(listed.filter((o) => !intakeLanguageUnconfirmed(o)).map((o) => o.programme));
  const pending = new Set(listed.filter((o) => intakeLanguageUnconfirmed(o) && !current.has(o.programme)).map((o) => o.programme));
  const curated = programmes.filter((p) => current.has(p.id));
  const candidates = programmes.filter((p) => current.has(p.id) || pending.has(p.id));
  const matched = new Set();
  const comparisons = [];
  const outOfScope = [];
  const excluded = {};
  for (const item of items) {
    const degree = item.degree_title;
    if (!['Bachelor', 'Academy Profession Degree'].includes(degree)) {
      excluded[degree || 'unclassified'] = (excluded[degree || 'unclassified'] || 0) + 1;
      continue;
    }
    const named = institutions.filter((i) => institutionName(i.name) === institutionName(item.institution_title));
    if (named.length !== 1) {
      outOfScope.push({ name: item.Title || item.title, institution: item.institution_title, url: item['@id'], reason: named.length ? 'ambiguous-institution-name' : 'institution-name-not-matched' });
      continue;
    }
    const institution = named[0];
    const candidate = courseIdentity(item.Title || item.title);
    const pool = candidates.filter((p) => p.institution === institution.id && normal(p.name) === candidate.name &&
      (degree === 'Bachelor' ? p.credential?.comparableLevel === 'bachelor' : p.credential?.comparableLevel === 'short-cycle') &&
      (!candidate.credential || normal(p.credential?.abbreviation).replaceAll(' ', '').startsWith(candidate.credential)));
    const record = { sourceId: item.UID || null, name: item.Title || item.title, institution: institution.id,
      degree, url: item['@id'], sourceModifiedAt: item.ModificationDate || null,
      sourceCampusSlug: String(item['@id'] || '').split('/portal/')[1]?.split('/')[1] || null,
      status: pool.length === 1 ? pending.has(pool[0].id) ? 'intake-language-unconfirmed' : 'matched' : pool.length ? 'ambiguous-programme-name' : 'no-exact-programme-match',
      programmeIds: pool.map((p) => p.id) };
    if (pool.length === 1) {
      if (current.has(pool[0].id)) matched.add(pool[0].id);
      const credits = typeof item.credits === 'number' || /^\d+(?:\.\d+)?$/.test(String(item.credits || '')) ? Number(item.credits) : null;
      const currentCredits = pool[0].credential?.ects;
      if (credits && Number.isFinite(currentCredits) && credits !== currentCredits) record.ectsConflict = { catalogue: credits, curated: currentCredits };
    }
    comparisons.push(record);
  }
  return {
    selection: 'Bachelor and Academy Profession catalogue records only; top-ups, postgraduate and short-term courses excluded. Only exact normalized institution/course names with compatible credentials can match. A programme-name match does not establish campus/offering identity. No new record is published by this report.',
    targetIntake: intake,
    caution: 'The source catalogue is being revised and does not establish this target intake or programme-level IB eligibility. Unmatched titles require review; curated-only degrees are not presumed cancelled.',
    totals: { upstream: items.length, compared: comparisons.length, matched: comparisons.filter((r) => r.status === 'matched').length,
      unresolved: comparisons.filter((r) => r.status !== 'matched').length, outsideMatchedInstitutions: outOfScope.length,
      curatedCurrentEnglish: curated.length, curatedOnly: curated.filter((p) => !matched.has(p.id)).length,
      curatedLanguagePending: pending.size,
      ectsConflicts: comparisons.filter((r) => r.ectsConflict).length },
    excluded, comparisons, outsideMatchedInstitutions: outOfScope,
    curatedLanguagePending: programmes.filter((p) => pending.has(p.id)).map((p) => ({ id: p.id, institution: p.institution, name: p.name, officialUrl: p.links?.official || null })),
    curatedOnly: curated.filter((p) => !matched.has(p.id)).map((p) => ({ id: p.id, institution: p.institution, name: p.name, officialUrl: p.links?.official || null })),
  };
}
