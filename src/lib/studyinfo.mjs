/** Studyinfo's public external API, projected into a small course catalogue.
 * Names and identifiers only are published. Admissions text stays at source.
 * A catalogue match never changes a Programme or an eligibility assessment.
 */
import { html } from './html.mjs';

export const API = 'https://opintopolku.fi/konfo-backend/external';
export const PUBLIC = 'https://opintopolku.fi/konfo/en';
export const ENGLISH = 'oppilaitoksenopetuskieli_4';
export const IB_DIPLOMA = 'pohjakoulutusvaatimuskouta_112';
const FIRST_YEAR = new Set([IB_DIPLOMA, 'pohjakoulutusvaatimuskouta_123', 'pohjakoulutusvaatimuskouta_100']);
const code = (v) => String(v?.koodiUri || v || '').split('#')[0];
export const identity = (name) => String(name || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const english = (value) => value?.en?.trim() || null;

/** The UI language (`kielivalinta`) is not the language of instruction. */
export function catalogueEntry(detail, institutionOid, year, season) {
  if (detail.tila !== 'julkaistu' || !detail.oppilaitokset?.includes(institutionOid)) return { reason: 'institution-or-status' };
  const qualification = detail.koulutus;
  if (!qualification?.johtaaTutkintoon || !qualification.eqf?.some((q) => code(q) === 'eqf_6')) return { reason: 'not-bachelor' };
  const languages = detail.metadata?.opetus?.opetuskieli?.map(code) || [];
  if (languages.length !== 1 || languages[0] !== ENGLISH) return { reason: 'mixed-or-other-teaching-language' };
  const startMatches = (application) => {
    const start = application.paateltyAlkamisajankohta?.pvm;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start || '') || Number(start.slice(0, 4)) !== year) return false;
    const month = Number(start.slice(5, 7));
    return season === 'autumn' ? month >= 7 : month < 7;
  };
  // The catalogue also includes general university/UAS eligibility routes.
  // Those establish a first-year listing, not IB eligibility: preserve that
  // distinction instead of hiding programmes using a broader national code.
  const applications = (detail.hakukohteet || []).filter((a) =>
    a.tila === 'julkaistu' && startMatches(a) &&
    a.pohjakoulutusvaatimus?.some((q) => FIRST_YEAR.has(code(q)))
  );
  if (!applications.length) return { reason: 'no-target-intake-with-first-year-route' };
  const name = english(detail.nimi);
  if (!name) return { reason: 'no-english-name' };
  return { entry: {
    id: detail.oid,
    educationId: detail.koulutusOid,
    name,
    url: `${PUBLIC}/toteutus/${detail.oid}`,
    cities: [...new Set((detail.tarjoajat || []).map((p) => english(p.paikkakunta?.nimi)).filter(Boolean))],
    teachingLanguages: ['en'],
    qualifications: (qualification.metadata?.tutkintonimike || []).map((q) => english(q.nimi)).filter(Boolean),
    totalEcts: Number.isFinite(qualification.metadata?.opintojenLaajuusNumero) ? qualification.metadata.opintojenLaajuusNumero : null,
    plannedYears: Number.isFinite(detail.metadata?.opetus?.suunniteltuKestoVuodet) ? detail.metadata.opetus.suunniteltuKestoVuodet : null,
    plannedMonths: Number.isFinite(detail.metadata?.opetus?.suunniteltuKestoKuukaudet) ? detail.metadata.opetus.suunniteltuKestoKuukaudet : null,
    modifiedAt: detail.modified || null,
    // These identifiers allow a later, reviewed import to attach the right
    // requirements and dates to the right route, rather than the whole school.
    applications: applications.map((a) => ({
      id: a.oid,
      name: english(a.nimi),
      url: `${PUBLIC}/hakukohde/${a.oid}`,
      intakeStart: a.paateltyAlkamisajankohta.pvm,
      ibQualificationListed: a.pohjakoulutusvaatimus.some((q) => code(q) === IB_DIPLOMA),
      qualificationCodes: a.pohjakoulutusvaatimus.map(code),
    })),
  } };
}

/** Match a curated programme only by an explicit official offering/option ID. */
export function programmeCatalogue(snapshot, institutionKey, programme) {
  const ids = [programme.url, programme.requirementsUrl].flatMap((link) => {
    try {
      const u = new URL(link);
      if (u.hostname !== 'opintopolku.fi') return [];
      const m = u.pathname.match(/\/(toteutus|hakukohde)\/([0-9.]+)(?:\/|$)/);
      return m ? [{ kind: m[1], id: m[2] }] : [];
    } catch { return []; }
  });
  const entries = (snapshot?.institutions?.[institutionKey]?.programmes || []).filter((entry) =>
    ids.some(({ kind, id }) => kind === 'toteutus' ? entry.id === id : entry.applications.some((a) => a.id === id))
  );
  return entries.length === 1 ? { ...entries[0], source: snapshot.source, asOf: snapshot.retrievedAt } : null;
}

export function programmeCataloguePanel(entry) {
  if (!entry) return '';
  const years = entry.plannedYears;
  const months = entry.plannedMonths;
  const length = [years > 0 ? `${years} ${years === 1 ? 'year' : 'years'}` : null,
    months > 0 ? `${months} ${months === 1 ? 'month' : 'months'}` : null].filter(Boolean).join(' ');
  return html`<details class="topic__more" data-programme-catalogue="studyinfo">
    <summary>National catalogue details</summary>
    <div class="topic__body"><p><a href="${entry.url}" rel="noopener nofollow">${entry.name}<span aria-hidden="true"> ↗</span></a></p>
      <dl>${entry.qualifications.length ? html`<dt>Awards</dt><dd>${entry.qualifications.join(' + ')}</dd>` : ''}
        ${entry.totalEcts ? html`<dt>Complete study path</dt><dd>${entry.totalEcts} ECTS${length ? ` · ${length} overall` : ''}</dd>` : ''}</dl>
      <p>${entry.source.publisher} · As of ${entry.asOf}</p>
    </div></details>`;
}

/** A zero-result search means nothing published in this feed, not no degrees. */
export function cataloguePanel(snapshot, key) {
  const institution = snapshot?.institutions?.[key];
  if (!institution?.programmes?.length) return '';
  const date = new Date(`${snapshot.retrievedAt}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Helsinki' });
  const season = snapshot.season === 'autumn' ? 'Autumn' : 'Spring';
  return html`<details class="prog-group__more" id="national-catalogue" data-external-catalogue="studyinfo">
    <summary>Studyinfo course listings · ${institution.programmes.length}</summary>
    <p>${season} ${snapshot.intakeYear} · English-taught bachelor's · As of ${date}</p>
    <ul>${institution.programmes.map((p) => html`<li><a href="${p.url}" rel="noopener nofollow">${p.name}<span aria-hidden="true"> ↗</span></a>${p.cities.length ? ` · ${p.cities.join(', ')}` : ''}</li>`)}</ul>
    <p>Check each listing for its entry conditions and admission routes.</p>
    <p><a href="${snapshot.source.url}" rel="noopener nofollow">Source: ${snapshot.source.publisher} · Studyinfo</a></p>
  </details>`;
}
