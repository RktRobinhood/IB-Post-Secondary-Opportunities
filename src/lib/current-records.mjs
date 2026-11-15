/** The public view of an intake, calculated at build time without editing data. */
import { programmePaths, programmeDates } from './schools.mjs';
const ISO_DAY = /^\d{4}-\d{2}-\d{2}(?:T.*)?$/;
const HARD = new Set(['hard', 'equal-consideration']);
const READER = new Set(['any', 'eu-eea-ch']);
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
function dayOf(value) {
  if (typeof value !== 'string') return null;
  let day = ISO_DAY.test(value) ? value.slice(0, 10) : null;
  if (!day) {
    const exact = value.trim().match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i);
    const month = exact && MONTHS.findIndex(m => m === exact[2].toLowerCase());
    if (month >= 0 && exact) day = `${exact[3]}-${String(month + 1).padStart(2, '0')}-${exact[1].padStart(2, '0')}`;
  }
  const parsed = day && new Date(`${day}T00:00:00Z`);
  return parsed && !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === day ? day : null;
}
const lastDay = value => dayOf(value?.endDate || value?.closes || value?.date);

/** A carried date is historical guidance for the new intake, never its expiry. */
export function isPassedDate(value, today) {
  const day = lastDay(value);
  return Boolean(day && day < today && !value.carriedForwardFrom);
}

function applies(value, school, programme, intake) {
  if (!READER.has(value.who || value.audience || 'any') || value.readerAccess?.state === 'closed') return false;
  if (value.forDiplomaHolders && !programme.closesForDiplomaHolders) return false;
  if (value.institutions?.length && !value.institutions.includes(school.institution)) return false;
  if (value.institutionsExcept?.includes(school.institution)) return false;
  if (value.programmes?.length && !value.programmes.some(id => [programme.slug, programme.id, intake?.id].includes(id))) return false;
  if (value.institutionTypes?.length && !value.institutionTypes.includes(school.type)) return false;
  if (value.taughtIn?.length && !value.taughtIn.includes(programme.language || 'English')) return false;
  if (value.numerusFixusOnly && !(programme.admission?.numerusFixus || intake?.admission?.numerusFixus)) return false;
  return true;
}

function expired(programme, intake, school, routes, today) {
  // A visa timetable or a general application route cannot close an exempt IB route.
  if (school.noDeadline && !programme.ownDeadline && !programme.closes) return false;
  // An unresolved date or a carried-forward date cannot establish closure.
  const own = programmeDates(school, programme).filter(d => d.kind === 'closes' && applies(d, school, programme, intake));
  if (own.length) return own.every(d => lastDay(d) && !d.carriedForwardFrom) && own.map(lastDay).sort().at(-1) < today;
  // Own selection/round dates that have not been published stay unknown.
  if (programme.ownDeadline || programme.round) return false;
  const routeIds = new Set(intake?.applicationRoutes || []);
  const targetIntake = intake?.intake || school.intake;
  // Schools and country rules may refresh independently; an older route cannot
  // close a carried intake merely because its stable route ID is still linked.
  const sameIntake = route => !targetIntake || !route.intake || route.intake === targetIntake;
  const matching = routes.filter(route => sameIntake(route) && (
    routeIds.has(route.id) || (intake && route.appliesTo?.includes(intake.id))));
  const closingDates = route => route.readerAccess?.state === 'closed' || !READER.has(route.applicantGroup || 'any') ? [] : [
    ...(route.rounds || []).filter(d => HARD.has(d.consequence)),
    ...(route.milestones || []).filter(d => d.type === 'submit' && HARD.has(d.consequence)),
  ].map(d => ({ ...d, audience: d.audience || route.applicantGroup || 'any' }))
    .filter(d => !school.ownDeadline || d.institutions?.includes(school.institution));
  const scoped = matching.flatMap(closingDates);
  const general = routes.filter(route => route.destination === school.country &&
    sameIntake(route) && !route.appliesTo?.length)
    .flatMap(closingDates)
    .filter(d => d.institutions?.includes(school.institution) ||
      (d.everySchool && !programme.ownDeadline && !school.ownDeadline));
  const bound = (scoped.length ? scoped : general)
    .filter(d => applies(d, school, programme, intake));
  if (!bound.length || bound.some(d => !lastDay(d) || d.carriedForwardFrom)) return false;
  return bound.map(lastDay).sort().at(-1) < today;
}

/** Only the public projection uses this; schemas and source checks read originals. */
export function currentRecords(countries, schools, today) {
  const routes = countries.flatMap(c => c.routes || []);
  const currentSchools = schools.map(school => {
    const programmes = programmePaths(school.key || school.institution, school.programmes || []).flatMap(programme => {
      if (programme.intakes?.length) {
        const intakes = programme.intakes.filter(intake => !expired(programme, intake, school, routes, today));
        return intakes.length ? [{ ...programme, intakes }] : [];
      }
      return expired(programme, null, school, routes, today) ? [] : [programme];
    });
    return { ...school, programmes, dates: school.dates?.filter(d => !isPassedDate(d, today)),
      retiredProgrammes: (school.programmes || []).length - programmes.length };
  });
  const currentCountries = countries.map(country => ({
    ...country,
    ...(country.application ? { application: { ...country.application,
      deadlines: country.application.deadlines?.filter(d => !isPassedDate(d, today)) } } : {}),
    routes: (country.routes || []).map(route => ({ ...route,
      milestones: route.milestones?.filter(d => !isPassedDate(d, today)),
      rounds: route.rounds?.filter(d => !isPassedDate(d, today)),
    })),
  }));
  return { countries: currentCountries, schools: currentSchools };
}
