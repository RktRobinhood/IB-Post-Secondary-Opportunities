/**
 * Home's editorial order, controlled by data/site-config.json.
 * `closes` is the earliest upcoming Apply-by date returned by deadlineOf for
 * any path on a degree card. Unknown dates stay unknown and follow dated cards.
 * Subject variety breaks equal-date ties; it never hides an earlier deadline.
 */
export function homeOrder(entries, setting = {}) {
  const dateKey = (entry) => {
    if (setting.deadlines !== 'soonest') return '';
    const date = entry.closes;
    const parsed = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Date(`${date}T00:00:00Z`) : null;
    return parsed && Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
      ? date : '9999-99-99';
  };
  const countryKey = (entry) => setting.country && entry.dest === setting.country ? 0 : 1;
  const alphabetical = (a, b) => ['title', 'inst', 'dest', 'field']
    .map((key) => String(a[key] || '').localeCompare(String(b[key] || ''), 'en'))
    .find(Boolean) || 0;
  const sorted = [...entries].sort((a, b) => countryKey(a) - countryKey(b)
    || dateKey(a).localeCompare(dateKey(b)) || alphabetical(a, b));
  if (setting.subjects !== 'mixed') return sorted;

  const out = [];
  let start = 0;
  while (start < sorted.length) {
    let end = start + 1;
    while (end < sorted.length && countryKey(sorted[end]) === countryKey(sorted[start])
      && dateKey(sorted[end]) === dateKey(sorted[start])) end++;
    const left = sorted.slice(start, end);
    // Equal dates can otherwise open on a long run of one school's subjects.
    const titles = new Set();
    while (left.length) {
      const score = (entry) => (titles.has(entry.title) ? 1000 : 0)
        + out.slice(-2).reduce((sum, recent, index) => sum
          + (recent.field === entry.field ? (index + 1) * 100 : 0)
          + (entry.inst && recent.inst === entry.inst ? (index + 1) * 20 : 0), 0);
      let best = 0;
      let bestScore = score(left[0]);
      for (let index = 1; index < left.length; index++) {
        const nextScore = score(left[index]);
        if (nextScore < bestScore) { best = index; bestScore = nextScore; }
      }
      const [next] = left.splice(best, 1);
      titles.add(next.title);
      out.push(next);
    }
    start = end;
  }
  return out;
}
