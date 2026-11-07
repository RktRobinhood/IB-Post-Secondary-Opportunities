/** Study delivery is separate from the provider's postal location. */
export function deliveryModeOf(programme = {}) {
  if (['on-campus', 'online', 'hybrid'].includes(programme.deliveryMode)) return programme.deliveryMode;
  // Preserve the legacy import convention without guessing from descriptions.
  if (/\b(online|distance)\b/i.test(programme.city || '')) return 'online';
  return null;
}

export function studyLocation(programme, providerCity = null) {
  const mode = deliveryModeOf(programme);
  if (mode === 'online') return 'Online';
  const city = programme.campus || programme.city || (mode === 'hybrid' ? null : providerCity) || null;
  return mode === 'hybrid' ? ['Hybrid', city].filter(Boolean).join(' · ') : city;
}

/** A suffix for a degree description; never places an online student on campus. */
export function studyLocationClause(programme, providerCity = null) {
  if (deliveryModeOf(programme) === 'online') return ' online';
  const city = programme.campus || programme.city || (deliveryModeOf(programme) === 'hybrid' ? null : providerCity);
  const mode = deliveryModeOf(programme) === 'hybrid' ? ' through online and on-campus study' : '';
  return mode + (city ? ` in ${city}` : '');
}
