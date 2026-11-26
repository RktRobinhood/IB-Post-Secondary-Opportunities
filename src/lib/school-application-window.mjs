/** A school's explicitly sourced late-application policy, not a route-wide assumption. */
export const acceptsLateIfSpace = (date) =>
  date?.kind === 'closes' && date.consequence === 'equal-consideration' && date.lateIfSpace === true;

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'];

export function inLateApplicationWindow(date, school, programme, today) {
  if (!acceptsLateIfSpace(date) || date.carriedForwardFrom) return false;
  const year = String(school.intake || '').match(/\d{4}/)?.[0];
  const start = String(programme.starts || school.starts || '').trim().toLowerCase();
  const month = MONTHS.indexOf(start) + 1;
  const due = date.endDate || date.date;
  // Stop showing potential availability at the published start month. Its
  // first day is a display bound, not an invented final application date.
  if (!year || !month || !due?.startsWith(year + '-')) return false;
  const bound = `${year}-${String(month).padStart(2, '0')}-01`;
  return today > due && today < bound;
}
