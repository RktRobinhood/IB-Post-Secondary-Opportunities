import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  CONSEQUENCE,
  DATE_STATES,
  allEvents,
  eventsForDestination,
  formatWhen,
  fromCountryDeadline,
  isActionable,
  isClosed,
  READER_ACCESS,
  identityWords,
  initialismOf,
  nameMatch,
  sameOccasion,
  sortKey,
  standing,
} from '../src/lib/calendar.mjs';
import { deadlineList } from '../src/lib/primitives.mjs';
import { toString } from '../src/lib/html.mjs';
import { load } from '../src/lib/data.mjs';
import { datesFor, datesPanel, leadOrder, isBinding, leadsFor, nextDeadlineEvent } from '../src/lib/school-dates.mjs';
import { freshness } from '../src/lib/components.mjs';
import { currentRecords } from '../src/lib/current-records.mjs';
import { loadRecords } from '../src/lib/records.mjs';
import { carryRecord } from './lib/annual-refresh.mjs';
import { homeOrder } from '../src/lib/home-order.mjs';
import { deadlineOf } from '../src/lib/programme-deadline.mjs';
import { schoolPage } from '../src/pages/schools.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const REPORT = process.argv.includes('--report');

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message}`);
  }
};

console.log('\nCalendar model\n');

const homeSetting = Object.freeze({ country: 'dk', subjects: 'mixed', deadlines: 'soonest' });
const homeEntries = Object.freeze([
  { title: 'Accounting', inst: 'business-school', field: 'Business', dest: 'dk', closes: '2027-03-15' },
  { title: 'Applied Finance', inst: 'business-school', field: 'Business', dest: 'dk', closes: '2027-03-15' },
  { title: 'Design', inst: 'design-school', field: 'Arts', dest: 'dk', closes: '2027-03-15' },
  { title: 'Engineering', inst: 'technical-school', field: 'Engineering', dest: 'dk', closes: '2027-03-15' },
  { title: 'Zoology', inst: 'science-school', field: 'Science', dest: 'dk', closes: '2027-02-01' },
  { title: 'No published date', inst: 'another-school', field: 'Arts', dest: 'dk', closes: null },
  { title: 'Earlier abroad', inst: 'abroad-school', field: 'Business', dest: 'nl', closes: '2027-01-15' },
].map(Object.freeze));

check('home starts in the configured country and keeps upcoming dates chronological before unknown dates', () => {
  const ordered = homeOrder(homeEntries, homeSetting);
  assert.equal(ordered[0].title, 'Zoology');
  assert.deepEqual(ordered.slice(0, 6).map((entry) => entry.dest), Array(6).fill('dk'));
  assert.deepEqual(ordered.slice(0, 6).map((entry) => entry.closes), [
    '2027-02-01', '2027-03-15', '2027-03-15', '2027-03-15', '2027-03-15', null,
  ]);
  assert.equal(ordered.at(-1).title, 'Earlier abroad');
  assert.equal(homeOrder(homeEntries, { ...homeSetting, country: 'nl' })[0].title, 'Earlier abroad');
});

check('equal-deadline home cards mix subjects without changing or losing any card', () => {
  const ordered = homeOrder(homeEntries, homeSetting);
  assert.equal(new Set(ordered.slice(0, 4).map((entry) => entry.field)).size, 4);
  assert.equal(new Set(ordered).size, homeEntries.length);
  assert.ok(ordered.every((entry) => homeEntries.includes(entry)));
  assert.deepEqual(homeOrder([...homeEntries].reverse(), homeSetting), ordered);
  assert.equal(homeEntries[0].title, 'Accounting');
});

check('home order settings can disable mixing or deadline priority and malformed dates stay unknown', () => {
  const equalDates = homeEntries.filter((entry) => entry.closes === '2027-03-15');
  assert.deepEqual(homeOrder(equalDates, { ...homeSetting, subjects: null }), equalDates);
  assert.equal(homeOrder(homeEntries, { ...homeSetting, subjects: null, deadlines: null })[0].title, 'Accounting');
  const dated = { title: 'Z valid', dest: 'dk', closes: '2027-03-15' };
  const malformed = { title: 'A invalid', dest: 'dk', closes: '2027-02-30' };
  assert.equal(homeOrder([malformed, dated], homeSetting)[0], dated);
});

const at = (o) => ({ label: 'x', consequence: 'hard', ...o });

// Publication changes with the day, while the authored facts stay identical.
const expiryCountries = [{ code: 'xx', name: 'Example', routes: [{
  id: 'xx-route', destination: 'xx', intake: '2027-autumn',
  milestones: [{ id: 'xx-close', label: 'Final application deadline', type: 'submit',
    date: '2027-03-15', consequence: 'hard' }],
}], application: { deadlines: [{ label: 'Example deadline', date: '2027-03-15', consequence: 'hard' }] } }];
const expirySchools = [{ key: 'xx-school', institution: 'xx-school', country: 'xx', name: 'Example School', scope: 'listed',
  programmes: [{ id: 'xx-degree', name: 'Example Degree', intakes: [{ id: 'xx-intake', intake: '2027-autumn', applicationRoutes: ['xx-route'] }],
    admission: { historicalCutoffs: [{ year: 2025, value: 30 }] } },
  { id: 'xx-unknown', name: 'Unknown Deadline' }] }];

check('a deadline remains on its closing day and disappears the following day without a data edit', () => {
  const original = JSON.stringify([expiryCountries, expirySchools]);
  const on = currentRecords(expiryCountries, expirySchools, '2027-03-15');
  const after = currentRecords(expiryCountries, expirySchools, '2027-03-16');
  const render = current => toString(deadlineList(allEvents({ countries: current.countries,
    graph: { applicationRoutes: new Map(current.countries.flatMap(c => c.routes).map(r => [r.id, r])) } })));
  assert.match(render(on), /Final application deadline/);
  assert.doesNotMatch(render(after), /Final application deadline|Example deadline/);
  assert.deepEqual(on.schools[0].programmes.map(p => p.id), ['xx-degree', 'xx-unknown']);
  assert.deepEqual(after.schools[0].programmes.map(p => p.id), ['xx-unknown']);
  assert.equal(JSON.stringify([expiryCountries, expirySchools]), original);
});

check('later rounds, unknown dates and carried dates prevent an intake from being retired early', () => {
  const withRound = structuredClone(expiryCountries);
  withRound[0].routes[0].rounds = [{ label: 'Later round', closes: '2027-06-01', consequence: 'hard' }];
  assert.equal(currentRecords(withRound, expirySchools, '2027-03-16').schools[0].programmes.length, 2);
  withRound[0].routes[0].rounds = [{ label: 'Later round', closes: null, consequence: 'hard' }];
  assert.equal(currentRecords(withRound, expirySchools, '2027-03-16').schools[0].programmes.length, 2);
  withRound[0].routes[0].rounds = [{ label: 'Last year’s round', closes: '2027-03-15', consequence: 'hard', carriedForwardFrom: '2027-autumn' }];
  assert.equal(currentRecords(withRound, expirySchools, '2027-03-16').schools[0].programmes.length, 2);
  assert.equal(expirySchools[0].programmes[0].admission.historicalCutoffs[0].year, 2025);
});

check('a carried school intake survives an unchanged route ID whose country rules still describe the previous intake', () => {
  const school = carryRecord(expirySchools[0], { currentIntake: '2027-autumn', nextIntake: '2028-autumn', today: '2027-09-01' });
  school.programmes = school.programmes.slice(0, 1);
  assert.equal(school.programmes[0].intakes[0].intake, '2028-autumn');
  assert.deepEqual(school.programmes[0].intakes[0].applicationRoutes, ['xx-route']);
  assert.equal(currentRecords(expiryCountries, [school], '2027-09-01').schools[0].programmes.length, 1);
  const general = structuredClone(expiryCountries);
  general[0].routes[0].milestones[0].everySchool = true;
  delete school.programmes[0].intakes[0].applicationRoutes;
  // The opportunity's intake, even without a school-level intake, governs a
  // generic country's date. Neither an old link nor a general date can close it.
  assert.equal(school.intake, undefined);
  assert.equal(currentRecords(general, [school], '2027-09-01').schools[0].programmes.length, 1);
  general[0].routes[0].intake = '2028-autumn';
  assert.equal(currentRecords(general, [school], '2027-09-01').schools[0].programmes.length, 0);
});

check('retiring one same-name path cannot change the remaining path’s URL', () => {
  const school = { ...expirySchools[0], programmes: [
    { name: 'Shared Degree', credential: 'BA', closes: '2027-03-15' },
    { name: 'Shared Degree', credential: 'BSc', closes: '2027-06-01' },
  ] };
  const before = currentRecords([], [school], '2027-03-15').schools[0].programmes[1];
  const after = currentRecords([], [school], '2027-03-16').schools[0].programmes[0];
  assert.equal(after.slug, before.slug);
  assert.equal(after.href, before.href);
});

check('a reply or document date neither extends nor establishes an application window', () => {
  const country = structuredClone(expiryCountries[0]);
  const route = country.routes[0];
  route.milestones.push({ id: 'reply', type: 'reply', label: 'Reply to your offer', date: '2027-08-01', consequence: 'hard' });
  assert.equal(currentRecords([country], expirySchools, '2027-03-16').schools[0].programmes.length, 1);
  route.milestones = [{ id: 'document', type: 'document', label: 'Documents deadline', date: '2027-03-15', consequence: 'hard' }];
  assert.equal(currentRecords([country], expirySchools, '2027-03-16').schools[0].programmes.length, 2);
});

check('visa-only, closed-reader and exempt application routes cannot retire an EU IB option', () => {
  const school = { ...expirySchools[0], dates: [{ kind: 'closes', label: 'Visa deadline', date: '2027-03-15', who: 'non-eu' }] };
  assert.equal(currentRecords([], [school], '2027-07-01').schools[0].programmes.length, 2);
  const country = structuredClone(expiryCountries[0]);
  country.routes[0].applicantGroup = 'non-eu';
  assert.equal(currentRecords([country], expirySchools, '2027-07-01').schools[0].programmes.length, 2);
  country.routes[0].applicantGroup = 'eu-eea-ch';
  country.routes[0].readerAccess = { state: 'closed', reason: 'Not this applicant route' };
  assert.equal(currentRecords([country], expirySchools, '2027-07-01').schools[0].programmes.length, 2);
  delete country.routes[0].readerAccess;
  country.routes[0].milestones[0].forDiplomaHolders = true;
  assert.equal(currentRecords([country], expirySchools, '2027-07-01').schools[0].programmes.length, 2);
  const exempt = { ...expirySchools[0], noDeadline: 'Enrol directly with an IB Diploma', dates: [{ kind: 'closes', date: '2027-03-15', who: 'any' }] };
  assert.equal(currentRecords(expiryCountries, [exempt], '2027-07-01').schools[0].programmes.length, 2);
});

check('programme selection and named rounds override a school’s general closing dates', () => {
  const school = { ...expirySchools[0], dates: [
    { kind: 'closes', label: 'Winter round closes', date: '2027-03-15' },
    { kind: 'closes', label: 'Summer round closes', date: '2027-07-01' },
  ], programmes: [
    { name: 'Separate selection', ownDeadline: true },
    { name: 'Winter degree', round: 'Winter round' },
    { name: 'Summer degree', round: 'Summer round' },
  ] };
  assert.deepEqual(currentRecords([], [school], '2027-03-16').schools[0].programmes.map(p => p.name), ['Separate selection', 'Summer degree']);
  const exemption = { ...school, noDeadline: 'Enrol directly', programmes: [{ name: 'Own close', ownDeadline: true, closes: '2027-03-15' }] };
  assert.equal(currentRecords([], [exemption], '2027-03-16').schools[0].programmes.length, 0);
});

check('an exact written day retires after that day while ambiguous or impossible dates stay unknown', () => {
  const country = { ...expiryCountries[0], routes: [], application: { deadlines: [
    { label: 'Exact day', date: '15 January 2027' },
    { label: 'Not a day', date: 'Mid-January 2027' },
    { label: 'Impossible day', date: '2027-02-30' },
  ] } };
  const after = currentRecords([country], [], '2027-03-16').countries[0];
  assert.deepEqual(after.application.deadlines.map(d => d.label), ['Not a day', 'Impossible day']);
  assert.doesNotMatch(toString(deadlineList(allEvents({ countries: [after] }))), /Exact day/);
});

{
  const [july, march] = await Promise.all([
    loadRecords({ retirePassed: true, today: '2027-07-01' }),
    loadRecords({ retirePassed: true, today: '2027-03-16' }),
  ]);
  check('the fixed July public view keeps Belgian IB exemptions and March closes AU despite later document/reply dates', () => {
    assert.equal(july.schools.get('be-thomas-more').programmes.length, 9);
    assert.equal(july.schools.get('be-uantwerpen').programmes.length, 2);
    assert.equal(march.schools.get('dk-au').programmes.length, 0);
    assert.equal([...march.graph.opportunities.values()].filter(i => i.institution === 'dk-au').length, 0);
  });
}

{
  await fs.mkdir(path.join(ROOT, '.cache'), { recursive: true });
  const fixture = await fs.mkdtemp(path.join(ROOT, '.cache', 'calendar-expiry-'));
  try {
    await fs.mkdir(path.join(fixture, 'countries'));
    await fs.mkdir(path.join(fixture, 'schools'));
    await fs.writeFile(path.join(fixture, 'countries', 'xx.json'), JSON.stringify(expiryCountries[0]));
    await fs.writeFile(path.join(fixture, 'schools', 'xx-school.json'), JSON.stringify(expirySchools[0]));
    const before = await loadRecords({ dataDir: fixture, retirePassed: true, today: '2027-03-15' });
    const after = await loadRecords({ dataDir: fixture, retirePassed: true, today: '2027-03-16' });
    const authored = await loadRecords({ dataDir: fixture, today: '2027-03-16' });
    check('retired intakes leave public indexes and programme filters while original facts remain available for validation', () => {
      assert.equal(before.graph.opportunities.size, 1);
      assert.equal(before.programmes.length, 1);
      assert.equal(after.graph.opportunities.size, 0);
      assert.equal(after.programmes.length, 0);
      assert.equal(after.graph.programmes.has('xx-degree'), false);
      assert.equal(after.graph.programmes.has('xx-unknown'), true);
      assert.equal(authored.graph.opportunities.size, 1);
      assert.equal(authored.schools.get('xx-school').programmes[0].admission.historicalCutoffs[0].year, 2025);
    });
  } finally {
    const relative = path.relative(path.join(ROOT, '.cache'), fixture);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Unsafe fixture cleanup');
    await fs.rm(fixture, { recursive: true, force: true });
  }
}

check('a single day reads as a day', () =>
  assert.equal(formatWhen(at({ date: '2027-01-13' })), '13 January 2027'));

check('a window inside one year does not repeat the year', () =>
  assert.equal(formatWhen(at({ date: '2026-07-20', endDate: '2026-08-06' })), '20 July to 6 August 2026'));

check('a window across a year boundary keeps both years', () =>
  assert.equal(formatWhen(at({ date: '2026-11-01', endDate: '2027-03-01' })), '1 November 2026 to 1 March 2027'));

check('a time of day survives, because 12:00 and 23:59 are different promises', () =>
  assert.equal(
    formatWhen(at({ date: '2027-01-13', timeOfDay: '18:00', timeZone: 'UK time' })),
    '13 January 2027, 18:00 UK time'
  ));

check('an end date equal to the start is not rendered as a range', () =>
  assert.equal(formatWhen(at({ date: '2027-03-15', endDate: '2027-03-15' })), '15 March 2027'));

check('no date reads as the declared state, not as a blank', () =>
  assert.equal(formatWhen(at({ date: null, dateState: 'no-central-deadline' })), 'No central deadline'));

check('an undeclared absence still says something rather than nothing', () =>
  assert.equal(formatWhen(at({ date: null })), 'Date not published'));

check('a prose date is not accepted as a date', () => {
  const e = fromCountryDeadline({ code: 'xx', name: 'X' }, { label: 'x', date: 'Mid-January 2027' }, 0);
  assert.equal(e.date, null, 'prose was read as a date');
  assert.equal(e.legacyDate, 'Mid-January 2027', 'the published wording was lost');
});

check('a sentence in a date field is not sorted as though it were a day', () => {
  const e = fromCountryDeadline({ code: 'xx', name: 'X' }, { label: 'x', date: 'No central deadline' }, 0);
  assert.equal(sortKey(e), '9999-99-99');
});

check('an unknown consequence falls back to indicative rather than inventing a promise', () => {
  const e = fromCountryDeadline({ code: 'xx', name: 'X' }, { label: 'x', consequence: 'absolutely-final' }, 0);
  assert.equal(e.consequence, 'indicative');
});

check('an unknown dateState is not passed through as a label', () => {
  const e = fromCountryDeadline({ code: 'xx', name: 'X' }, { label: 'x', dateState: 'soon-ish' }, 0);
  assert.notEqual(e.dateState, 'soon-ish');
});

check('a date in the past is past', () =>
  assert.equal(standing(at({ date: '2020-01-01' }), '2026-09-23'), 'past'));
check('a window containing today is open', () =>
  assert.equal(standing(at({ date: '2026-09-01', endDate: '2026-10-01' }), '2026-09-23'), 'open'));
check('a date inside a month is soon', () =>
  assert.equal(standing(at({ date: '2026-10-10' }), '2026-09-23'), 'soon'));
check('a date beyond a month is ahead', () =>
  assert.equal(standing(at({ date: '2027-03-15' }), '2026-09-23'), 'ahead'));
check('an undated event has no standing rather than a wrong one', () =>
  assert.equal(standing(at({ date: null }), '2026-09-23'), 'undated'));

const site = await load({ today: '2026-09-01' });

const schoolDeadlineFixture = (country, key, view = site) => {
  const c = view.countries.find((x) => x.code === country);
  const i = c.institutions.find((x) => x.key === key);
  return { c, i, inst: { ...i, id: i.key, destination: c.code } };
};
const deadlineFact = (c, i) => String(schoolPage(site, i, c, {}))
  .match(/<div [^>]*data-fact="deadline"[^>]*>[\s\S]*?<\/div>/)?.[0] || '';

check('school and programme retain the sourced conditional RIT dates without a hard close', () => {
  const { c, i, inst } = schoolDeadlineFixture('ae', 'ae-rit-dubai');
  const dates = datesFor(site, inst).filter((e) => e.schoolOwn && e.date);
  assert.deepEqual(dates.map(({ date, consequence, provisional }) => [date, consequence, provisional]), [
    ['2027-01-15', 'priority', true], ['2027-05-31', 'priority', true], ['2027-08-22', 'equal-consideration', true],
  ]);
  assert.ok(dates.every((e) => e.sources.includes('https://www.rit.edu/dubai/undergraduate-admissions')));
  assert.match(deadlineFact(c, i), /<time datetime="2027-01-15">15 Jan 2027<\/time><\/a><small>Early phase · Provisional<\/small>/);
  assert.equal(nextDeadlineEvent(site, inst, { today: '2027-01-16' }).due, '2027-05-31');
  assert.equal(nextDeadlineEvent(site, inst, { today: '2027-08-22' }).provisional, true);
  assert.equal(nextDeadlineEvent(site, inst, { today: '2027-08-23' }), null);
  const p = i.school.programmes.find((x) => x.slug === 'industrial-engineering');
  const active = deadlineOf(site, inst, c, p, '2026-11-26');
  assert.equal(active.tile.value, '22 August 2027');
  assert.match(active.tile.note, /Not yet confirmed for 2027.*Later applications depend on places.*15 Jan \(provisional\)/);
  assert.equal(deadlineOf(site, inst, c, p, '2027-08-22').tile.value, '22 August 2027');
  for (const day of ['2027-08-23', '2027-08-31']) {
    const late = deadlineOf(site, inst, c, p, day);
    assert.equal(late.tile.value, 'Later if places remain', day);
    assert.match(late.tile.note, /Confirm dates and availability/);
  }
  for (const day of ['2027-09-01', '2027-12-01', '2028-02-01']) {
    const stale = deadlineOf(site, inst, c, p, day);
    assert.equal(stale.tile.value, 'Ask the university', day);
    assert.match(stale.tile.note, /current intake/);
    assert.equal(stale.closes, null);
  }
});

check('shared school deadline keeps genuine hard closes and an honest no-date fallback', () => {
  const itu = schoolDeadlineFixture('dk', 'dk-itu');
  const next = nextDeadlineEvent(site, itu.inst, { today: '2026-11-26' });
  assert.equal(next.due, '2027-03-15');
  assert.equal(next.consequence, 'hard');
  const dated = toString(datesPanel(site, itu.inst, { today: '2026-11-26' }));
  assert.match(dated, /data-date="2027-03-15"[^>]*data-hard="true"/);
  const p = itu.i.school.programmes.find((x) => x.slug === 'data-science');
  assert.equal(deadlineOf(site, itu.inst, itu.c, p, '2027-08-23').tile.value, 'Closed');
  const hw = schoolDeadlineFixture('ae', 'ae-heriot-watt-dubai');
  assert.equal(nextDeadlineEvent(site, hw.inst, { today: '2026-11-26' }), null);
  assert.match(deadlineFact(hw.c, hw.i), /Ask the university/);
  assert.doesNotMatch(deadlineFact(hw.c, hw.i), /<time|Date not yet confirmed/);
  const mech = hw.i.school.programmes.find((x) => x.slug === 'mechanical-engineering');
  assert.equal(deadlineOf(site, hw.inst, hw.c, mech, '2026-11-26').tile.value, 'Not published yet');
});

const datedViews = new Map(await Promise.all([
  '2027-03-15', '2027-03-16', '2027-08-22', '2027-08-23', '2027-08-31', '2027-09-01', '2028-02-01',
].map(async today => [today, await load({ today })])));

check('full publication retains only sourced RIT late-window programmes, then retires the intake', () => {
  for (const day of ['2027-08-22', '2027-08-23', '2027-08-31']) {
    const view = datedViews.get(day);
    const { c, i, inst } = schoolDeadlineFixture('ae', 'ae-rit-dubai', view);
    assert.equal(i.school.programmes.length, 3, day);
    assert.equal(i.school.dates.find(d => d.date === '2027-08-22')?.lateIfSpace, true, day);
    const p = i.school.programmes.find(x => x.slug === 'industrial-engineering');
    assert.equal(deadlineOf(view, inst, c, p, day).tile.value, day === '2027-08-22' ? '22 August 2027' : 'Later if places remain', day);
    if (day > '2027-08-22') {
      assert.equal(nextDeadlineEvent(view, inst), null, day);
      assert.doesNotMatch(toString(datesPanel(view, inst, { today: day })), /data-date="2027-08-22"/);
    }
  }
  for (const day of ['2027-09-01', '2028-02-01']) {
    const { i } = schoolDeadlineFixture('ae', 'ae-rit-dubai', datedViews.get(day));
    assert.ok(i.href, day + ': profile still exists');
    assert.equal(i.school.programmes.length, 0, day);
    assert.equal(i.school.dates.length, 0, day);
  }
});

check('publication preserves hard ITU dates, Heriot-Watt without dates and Oxford UCAS filtering', () => {
  const get = (cc, key, day) => schoolDeadlineFixture(cc, key, datedViews.get(day));
  assert.equal(get('dk', 'dk-itu', '2027-03-15').i.school.programmes.length, 2);
  assert.equal(get('dk', 'dk-itu', '2027-03-16').i.school.programmes.length, 0);
  for (const [day, view] of datedViews) {
    const hw = get('ae', 'ae-heriot-watt-dubai', day);
    assert.equal(hw.i.school.programmes.length, 3, day);
    assert.equal(hw.i.school.dates.length, 0, day);
    assert.equal(nextDeadlineEvent(view, hw.inst), null, day);
    const ox = get('gb', 'gb-oxford', day);
    assert.equal(ox.i.school.programmes.length, 0, day + ': missed UCAS October intake');
  }
});

check('a naked equal-consideration date, missing month or historical prior cycle cannot give late entry', () => {
  const raw = { country:'xx', institution:'xx-school', intake:'2027-autumn', starts:'September',
    programmes:[{ name:'Example degree', slug:'example-degree' }],
    dates:[{ label:'Applications close', kind:'closes', consequence:'equal-consideration', date:'2027-08-22', lateIfSpace:true }],
  };
  const kept = x => currentRecords([], [x], '2027-08-23').schools[0].programmes.length;
  assert.equal(kept(raw), 1);
  assert.equal(kept({ ...raw, starts:null }), 0);
  assert.equal(kept({ ...raw, dates:raw.dates.map(x => ({ ...x, lateIfSpace:undefined })) }), 0);
  assert.equal(kept({ ...raw, dates:raw.dates.map(x => ({ ...x, consequence:'hard' })) }), 0);
  assert.equal(kept({ ...raw, intake:'2028-autumn' }), 0);
});

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED = new Set([
  'id', 'label', 'date', 'endDate', 'timeOfDay', 'timeZone', 'dateState', 'consequence',
  'audience', 'provisional', 'year', 'notes', 'note', 'source', 'sources', 'evidence',
  'route', 'jurisdiction',
  'ibCalendar',
  'readerAccess',
  'institutions',
  'institutionsWithoutPage',
  'institutionsExcept',
  'numerusFixusOnly',
  'yearUnpublished',
  'institutionTypes',
  'taughtIn',
  'everySchool',
  'via',
]);

const problems = [];
for (const c of site.countries) {
  for (const [i, d] of (c.application?.deadlines || []).entries()) {
    const where = `${c.code}.deadlines[${i}] "${String(d.label || '').slice(0, 40)}"`;
    for (const key of Object.keys(d)) {
      if (!ALLOWED.has(key)) problems.push(`${where}: unknown field "${key}"`);
    }
    if (d.date != null && typeof d.date === 'string' && d.date && !ISO.test(d.date) && d.dateState) {
      problems.push(`${where}: has both a prose date and a dateState — pick one`);
    }
    if (d.endDate && !ISO.test(d.endDate)) problems.push(`${where}: endDate "${d.endDate}" is not ISO`);
    if (d.dateState && !DATE_STATES[d.dateState]) problems.push(`${where}: dateState "${d.dateState}" is not one of ${Object.keys(DATE_STATES).join(', ')}`);
    if (d.consequence && !CONSEQUENCE[d.consequence]) problems.push(`${where}: consequence "${d.consequence}" is not one of ${Object.keys(CONSEQUENCE).join(', ')}`);
    if (d.timeOfDay && !/^[0-2][0-9]:[0-5][0-9]$/.test(d.timeOfDay)) problems.push(`${where}: timeOfDay "${d.timeOfDay}" is not HH:MM`);
    if (ISO.test(String(d.date)) && d.endDate && d.endDate < d.date) problems.push(`${where}: endDate is before date`);
    if (d.date == null && !d.dateState) problems.push(`${where}: no date and no dateState — say which of the five it is`);
    if (d.readerAccess) problems.push(...accessProblems(where, d.readerAccess));
  }
}
for (const r of site.graph.applicationRoutes.values()) {
  const all = [['', r], ...(r.rounds || []).map((x) => [`.rounds ${x.id}`, x]), ...(r.milestones || []).map((x) => [`.milestones ${x.id}`, x])];
  for (const [at, x] of all) if (x.readerAccess) problems.push(...accessProblems(`${r.id}${at}`, x.readerAccess));
}

function accessProblems(where, a) {
  const out = [];
  if (!READER_ACCESS[a.state]) out.push(`${where}: readerAccess.state "${a.state}" is not one of ${Object.keys(READER_ACCESS).join(', ')}`);
  if (typeof a.reason !== 'string' || a.reason.trim().length < 10) out.push(`${where}: readerAccess has no reason — it is rendered first, so it must say why`);
  if (typeof a.reason === 'string' && a.reason.length > 240) out.push(`${where}: readerAccess.reason is ${a.reason.length} characters — one sentence, please`);
  if (!Array.isArray(a.evidence) || !a.evidence.length) out.push(`${where}: readerAccess cites no evidence`);
  for (const k of Object.keys(a)) if (!['state', 'reason', 'evidence', 'sources'].includes(k)) out.push(`${where}: readerAccess has unknown field "${k}"`);
  return out;
}

check('every deadline record is the shape it says it is', () => {
  if (problems.length) throw new Error(`${problems.length} problems\n          ${problems.slice(0, 20).join('\n          ')}`);
});

check('every consequence says what actually happens if the date is missed', () => {
  for (const [id, spec] of Object.entries(CONSEQUENCE)) {
    assert.ok(spec.label, `${id} has no label`);
    assert.ok(spec.note && spec.note.length > 20, `${id} does not say what missing it costs`);
  }
});

check('a route milestone supersedes the profile deadline it was migrated from', () => {
  const graph = {
    applicationRoutes: new Map([
      ['r', { id: 'r', destination: 'xx', intake: '2027-autumn', milestones: [{ id: 'm', type: 'submit', label: 'Apply', date: '2027-03-15', consequence: 'hard' }] }],
    ]),
  };
  const country = { code: 'xx', name: 'X', application: { deadlines: [{ label: 'Apply', date: '2027-03-15' }, { label: 'Something else', date: '2027-04-01' }] } };
  const events = eventsForDestination(country, graph);
  assert.equal(events.length, 2, 'the migrated deadline was counted twice');
  assert.equal(events.find((e) => e.label === 'Apply').origin, 'route');
});

check('a Destination whose dates live only in a route still reaches the calendar', () => {
  const all = allEvents(site);
  const reached = new Set(all.map((e) => e.destination));
  const missing = [...site.graph.destinations.values()]
    .filter((d) => {
      const routes = [...site.graph.applicationRoutes.values()].filter((r) => r.destination === d.id);
      return routes.some((r) => (r.milestones || []).length || (r.rounds || []).length);
    })
    .filter((d) => !reached.has(d.id))
    .map((d) => d.name);
  if (missing.length) throw new Error(`Destinations with dated routes that never reach the calendar: ${missing.join(', ')}`);
});

check('a round and its own closing milestone are not two things to do', () => {
  const graph = {
    applicationRoutes: new Map([
      ['r', {
        id: 'r', destination: 'xx', intake: '2027-autumn',
        rounds: [{ id: 'rd', label: 'The only round', closes: '2027-03-15', consequence: 'hard' }],
        milestones: [{ id: 'm', type: 'submit', label: 'Applications close', date: '2027-03-15', consequence: 'hard' }],
      }],
    ]),
  };
  const events = eventsForDestination({ code: 'xx', name: 'X' }, graph);
  assert.equal(events.length, 1, 'the same day was listed twice');
  assert.equal(events[0].label, 'Applications close', 'the round won, but the milestone is the one that says what closes');
});

const flatLabel = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
function sameEvent(a, b) {
  if (!sameOccasion(a, b)) return false;
  const fa = flatLabel(a.label);
  const fb = flatLabel(b.label);
  if (fa.startsWith(fb) || fb.startsWith(fa)) return 'one label is the other with words added';
  const wa = identityWords(a.label);
  const wb = identityWords(b.label);
  const within = (x, y) => [...x].every((w) => y.has(w));
  if (within(wa, wb) && within(wb, wa)) return 'both labels name the same things';
  if (a.origin !== b.origin && ((wa.size && within(wa, wb)) || (wb.size && within(wb, wa)))) return 'the profile and the route name the same thing';
  return false;
}
function twinsIn(events) {
  const dated = events.filter((e) => e.date && isActionable(e));
  const out = [];
  for (let i = 0; i < dated.length; i++)
    for (let j = i + 1; j < dated.length; j++) {
      const why = dated[i].destination === dated[j].destination && sameEvent(dated[i], dated[j]);
      if (why) out.push(`${dated[i].destination} ${dated[i].date}: "${dated[i].label}" and "${dated[j].label}" (${why})`);
    }
  return out;
}

const twinGraph = (milestones) => ({
  applicationRoutes: new Map([['r', { id: 'r', destination: 'xx', intake: '2027-autumn', label: 'Applying to Xland', milestones }]]),
});

const panelRows = (second = {}) => {
  const inst = { id: 'xx-alpha', name: 'Alpha University', destination: 'xx' };
  const common = { date: '2027-08-01', timeOfDay: '23:59', timeZone: 'Europe/Copenhagen', consequence: 'hard', institutions: [inst.id] };
  const graph = twinGraph([
    { ...common, id: 'reply', type: 'reply', label: 'Accept the study place' },
    { ...common, id: 'vacancy', type: 'submit', label: 'Apply for a vacant place', ...second },
  ]);
  graph.institutions = new Map([[inst.id, inst]]);
  const fixture = { countries: [{ code: 'xx', name: 'Xland' }], graph };
  return toString(datesPanel(fixture, inst, { today: '2027-07-01' })).match(/<li class="dates-panel__item"[\s\S]*?<\/li>/g) || [];
};

check('each same-day deadline keeps its own time in the rendered panel', () => {
  const rows = panelRows({ timeOfDay: '12:00' });
  assert.equal(rows.length, 2);
  assert.match(rows.find((row) => row.includes('Apply for a vacant place')), /1 August 2027, 12:00 Copenhagen time/);
  assert.match(rows.find((row) => row.includes('Accept the study place')), /1 August 2027, 23:59 Copenhagen time/);
});

check('steps with identical timing and scope still share a compact heading', () => {
  const rows = panelRows();
  assert.equal(rows.length, 1);
  assert.match(rows[0], /Accept the study place/);
  assert.match(rows[0], /Apply for a vacant place/);
});

check('provisional annual and prior-cycle dates stay unconfirmed without inventing a prior intake', () => {
  for (const yearUnpublished of [true, false]) {
    const panel = panelRows({ provisional: true, yearUnpublished }).join('');
    assert.match(panel, /not yet confirmed/i);
    assert.doesNotMatch(panel, /last year/i);
  }
  const warning = toString(freshness({ level: 'stale', provisional: 1, intake: '2027-autumn' }));
  assert.match(warning, /check before relying/i);
  assert.doesNotMatch(warning, /last year/i);
  const carried = panelRows({ provisional: true, carriedForwardFrom: '2025-autumn' }).join('');
  assert.match(carried, /Date from the 2025 intake — confirm with the university/);
  assert.doesNotMatch(carried, /last year/i, 'a date carried for several cycles must identify its actual origin');
});

check('unknown times, different zones and applicant conditions cannot borrow a heading', () => {
  for (const scope of [
    { timeOfDay: null },
    { timeZone: 'UK time' },
    { audience: 'eu' },
    { forDiplomaHolders: true },
    { readerAccess: { state: 'conditional', reason: 'Only if places remain.' } },
  ]) assert.equal(panelRows(scope).length, 2, JSON.stringify(scope));
});

check('a deadline worded differently in the profile and the route is one card, with both sources and the stricter consequence', () => {
  const graph = twinGraph([{ id: 'm', type: 'submit', label: 'Alpha University first round closes', date: '2026-11-25', consequence: 'priority', note: 'Results in March.' }]);
  const country = { code: 'xx', name: 'X', application: { deadlines: [
    { label: 'Alpha University — first round', date: '2026-11-25', timeOfDay: '12:00', consequence: 'hard', source: 'https://alpha.example/dates', notes: 'Results in March. Fee 50 EUR.' },
  ] } };
  const events = eventsForDestination(country, graph);
  assert.equal(events.length, 1, `the same deadline printed ${events.length} cards`);
  const [e] = events;
  assert.deepEqual(e.sources, ['https://alpha.example/dates'], 'the profile source was lost in the merge');
  assert.equal(e.consequence, 'hard', 'the merge kept the weaker consequence');
  assert.equal(e.timeOfDay, '12:00', 'the time of day recorded only in the profile was lost');
  assert.equal(e.note, 'Results in March. Fee 50 EUR.', 'the notes were repeated or lost rather than joined once');
});

check('two institutions on one day each keep their own card, and each finds its own twin', () => {
  const graph = twinGraph([
    { id: 'a', type: 'submit', label: 'ABC first round closes', date: '2026-11-25', consequence: 'priority' },
    { id: 'b', type: 'submit', label: 'ABCD priority round closes', date: '2026-11-25', consequence: 'priority' },
  ]);
  const country = { code: 'xx', name: 'X', application: { deadlines: [
    { label: 'ABCD — priority round', date: '2026-11-25', consequence: 'priority', source: 'https://abcd.example' },
    { label: 'ABC — first round', date: '2026-11-25', consequence: 'priority', source: 'https://abc.example' },
    { label: 'Omega College — applications close', date: '2026-11-25', consequence: 'priority' },
  ] } };
  const events = eventsForDestination(country, graph);
  assert.equal(events.length, 3, `expected ABC, ABCD and Omega; got ${events.map((e) => e.label).join(' / ')}`);
  assert.deepEqual(events.find((e) => e.id === 'a').sources, ['https://abc.example'], 'ABC took the wrong twin');
  assert.deepEqual(events.find((e) => e.id === 'b').sources, ['https://abcd.example'], 'ABCD took the wrong twin');
});

check('an exam and the application it belongs to are two things on one day', () => {
  const graph = twinGraph([{ id: 'm', type: 'submit', label: 'Alpha University applications close', date: '2026-10-15', consequence: 'hard' }]);
  const country = { code: 'xx', name: 'X', application: { deadlines: [{ label: 'Alpha University admissions test', date: '2026-10-15', consequence: 'hard' }] } };
  assert.equal(eventsForDestination(country, graph).length, 2);
});

check('a window restating an opening and a closing adds no card, and loses neither day', () => {
  const graph = twinGraph([
    { id: 'o', type: 'open', label: 'Beta University applications open', date: '2026-10-15', consequence: 'indicative' },
    { id: 'c', type: 'submit', label: 'Beta University applications close', date: '2027-03-19', consequence: 'hard' },
  ]);
  const country = { code: 'xx', name: 'X', application: { deadlines: [
    { label: 'Beta University — application window', date: '2026-10-15', endDate: '2027-03-19', consequence: 'hard', source: 'https://beta.example' },
  ] } };
  const events = eventsForDestination(country, graph);
  assert.deepEqual(events.map((e) => e.id), ['o', 'c']);
  assert.ok(events.every((e) => e.sources.includes('https://beta.example')), 'the window’s source did not reach both days');
});

const rawEvents = [...site.countries].flatMap((c) => eventsForDestination(c, site.graph, { fold: false }));
const foldedEvents = [...site.countries].flatMap((c) => eventsForDestination(c, site.graph));

check(`no two cards on the site are the same event (${rawEvents.length} records → ${foldedEvents.length} cards on country pages)`, () => {
  assert.ok(twinsIn(rawEvents).length > 0, 'the detector finds no twins in the unfolded records, so it would pass on anything');
  const found = [...twinsIn(allEvents(site)), ...twinsIn(foldedEvents)];
  if (found.length) throw new Error([...new Set(found)].join('\n          '));
});

check('folding twins loses no date, no source and no note', () => {
  const problems = [];
  for (const c of site.countries) {
    const raw = eventsForDestination(c, site.graph, { fold: false });
    const folded = eventsForDestination(c, site.graph);
    const days = new Set(folded.flatMap((e) => [e.date, e.endDate]).filter(Boolean));
    const sources = new Set(folded.flatMap((e) => e.sources));
    const notes = folded.map((e) => flatLabel(e.note));
    for (const e of raw) {
      for (const d of [e.date, e.endDate].filter(Boolean)) if (!days.has(d)) problems.push(`${c.code} lost ${d} ("${e.label}")`);
      for (const s of e.sources) if (!sources.has(s)) problems.push(`${c.code} lost the source ${s}`);
      if (e.note && !notes.some((n) => n.includes(flatLabel(e.note)))) problems.push(`${c.code} lost the note on "${e.label}"`);
    }
  }
  if (problems.length) throw new Error(problems.join('\n          '));
});

function actionableMarks(markup) {
  assert.ok(markup.includes('<li'), 'the renderer produced no list item, so this guard would pass on nothing');
  return ['data-date=', 'data-consequence=', 'timeline__badge', 'data-countdown'].filter((m) => markup.includes(m));
}

check('the actionable-markup detector sees an ordinary hard deadline', () => {
  const markup = toString(deadlineList([{ id: 'a', label: 'Apply', date: '2027-03-15', consequence: 'hard', sources: [], access: null }]));
  assert.ok(actionableMarks(markup).includes('data-date='), 'the detector cannot see a date, so it cannot see a closed one rendered as one');
});

const CLOSED = { state: 'closed', reason: 'The reader is not eligible for this route at all.', evidence: ['ev-x'] };

check('a closed route is one line, after every date a student acts on, with no standing', () => {
  const graph = {
    applicationRoutes: new Map([
      ['shut', {
        id: 'shut', destination: 'xx', intake: '2027-autumn', label: 'The closed route', readerAccess: CLOSED,
        rounds: [{ id: 'rd', label: 'Window', opens: '2026-09-01', closes: '2026-09-30', consequence: 'hard' }],
        milestones: [{ id: 'm1', type: 'result', label: 'Result', date: '2026-10-16', consequence: 'indicative' }],
      }],
      ['open', {
        id: 'open', destination: 'xx', intake: '2027-autumn', label: 'The open route',
        milestones: [{ id: 'm2', type: 'submit', label: 'Apply', date: '2027-03-15', consequence: 'hard' }],
      }],
    ]),
  };
  const country = { code: 'xx', name: 'X', application: { deadlines: [{ label: 'Profile copy of the window', date: '2026-09-30', consequence: 'hard', route: 'shut' }] } };
  const events = eventsForDestination(country, graph);
  const shut = events.filter(isClosed);
  assert.equal(shut.length, 1, `a closed route printed ${shut.length} entries — its milestones, or the profile entry pointing at it, leaked out`);
  assert.equal(events.at(-1).id, 'shut', 'a closed route was sorted among the dates to act on');
  assert.equal(standing(shut[0], '2026-09-23'), 'closed');
});

check('a closed milestone on an open route keeps its date but loses its place and its badge', () => {
  const graph = {
    applicationRoutes: new Map([
      ['r', {
        id: 'r', destination: 'xx', intake: '2027-autumn',
        milestones: [
          { id: 'early', type: 'submit', label: 'Round for others', date: '2026-10-01', consequence: 'hard', readerAccess: CLOSED },
          { id: 'late', type: 'submit', label: 'Apply', date: '2027-03-15', consequence: 'hard' },
        ],
      }],
    ]),
  };
  const events = eventsForDestination({ code: 'xx', name: 'X' }, graph);
  assert.deepEqual(events.map((e) => e.id), ['late', 'early'], 'the closed round was sorted by its date');
  const markup = toString(deadlineList(events.filter(isClosed)));
  assert.deepEqual(actionableMarks(markup), [], 'a closed milestone rendered as a date to act on');
  assert.ok(markup.indexOf(READER_ACCESS.closed.label) < markup.indexOf('Round for others'), 'the exclusion is not stated first');
});

check('no closed entry anywhere on the site renders as actionable, or sorts among those that do', () => {
  const all = allEvents(site);
  const firstClosed = all.findIndex(isClosed);
  if (firstClosed >= 0 && all.slice(firstClosed).some(isActionable)) throw new Error('a closed entry is sorted among the actionable ones');
  const offenders = [];
  for (const e of all.filter(isClosed)) {
    const marks = actionableMarks(toString(deadlineList([e])));
    if (marks.length) offenders.push(`${e.destination} "${e.label}": ${marks.join(', ')}`);
  }
  if (offenders.length) throw new Error(offenders.join('\n          '));
});

check('a route closed to every reader is closed in a field, not in a sentence', () => {
  for (const id of ['kr-gks-embassy-2027', 'kr-gks-university-2027']) {
  const route = site.graph.applicationRoutes.get(id);
  assert.ok(route, `${id} is gone`);
  assert.equal(route.readerAccess?.state, 'closed', `${id} is not declared closed`);
  assert.match(route.readerAccess.reason, /31 December 2026/, `${id} should say why it is closed to everyone: the graduation-certificate date`);
  const events = allEvents(site).filter((e) => e.routeId === id);
  assert.ok(events.length >= 1, `${id} no longer reaches the calendar at all — it should be shown, not hidden`);
  assert.ok(events.every(isClosed), `${id} still produces an actionable entry`);
  }
});

check('a route closed only to some nationalities is conditional, not closed', () => {
  const id = 'jp-mext-embassy-2028';
  const route = site.graph.applicationRoutes.get(id);
  assert.ok(route, `${id} is gone`);
  assert.equal(route.readerAccess?.state, 'conditional', `${id} should be conditional on nationality`);
  assert.match(route.readerAccess.reason, /nationality/i, `${id} should name the condition`);
  const events = allEvents(site).filter((e) => e.routeId === id);
  assert.ok(events.length >= 1, `${id} no longer reaches the calendar`);
  assert.ok(events.every((e) => !isClosed(e)), `${id} still renders as closed to everyone`);
});

const { timeline, NEXT_UP } = await import('../src/pages/timeline.mjs');
const { defaultView } = await import('./lib/page-measure.mjs');

for (const today of ['2026-09-25', '2027-02-01']) {
  check(`the Deadlines page, as of ${today}, shows no past date before the first upcoming one`, () => {
    const out = timeline(site, { today });
    const pageHtml = typeof out === 'string' ? out : toString(out);
    const view = defaultView(pageHtml);
    const shown = [...view.matchAll(/<li\b[^>]*\sdata-date="([^"]+)"(?:[^>]*\sdata-end="([^"]+)")?/g)].map((m) => ({ date: m[1], end: m[2] || m[1] }));
    assert.ok(shown.length > 0 && shown.length <= NEXT_UP, `the default view shows ${shown.length} dates; it should open on at most ${NEXT_UP}`);
    const pastFirst = shown.filter((d) => d.end < today);
    assert.deepEqual(pastFirst, [], `past dates in the default view: ${pastFirst.map((d) => d.date).join(', ')}`);
    const sorted = shown.map((d) => d.date).slice().sort();
    assert.deepEqual(shown.map((d) => d.date), sorted, 'the dates shown first are not in date order');
    // Nothing dropped: every dated, actionable event is still on the page (the
    // "next up" dates appear twice there, once in the full list).
    const all = new Set([...pageHtml.matchAll(/<li\b[^>]*\sdata-date="([^"]+)"/g)].map((m) => m[1]));
    const missing = allEvents(site).filter((e) => e.date && isActionable(e) && !all.has(e.date));
    assert.deepEqual(missing.map((e) => e.id), [], 'dated events missing from the page');
  });
}

const schoolPages = site.countries.flatMap(c => c.institutions.map(i => ({id:i.key,dest:c.code,inst:i})));
const pageIds = new Map(schoolPages.map((p) => [p.id, p.dest]));
for (const c of site.countries) for (const i of c.institutions) for(const alias of i.aliases || []) pageIds.set(alias, c.code);

check('every date tied to schools names schools that have a page, in its own country', () => {
  const bad = [];
  const look = (where, dest, ids) => {
    if (ids === undefined) return;
    if (!Array.isArray(ids) || !ids.length) return bad.push(`${where}: institutions must be a non-empty list`);
    for (const id of ids) if (pageIds.get(id) !== dest) bad.push(`${where}: "${id}" is not a school page in ${dest}`);
  };
  for (const r of site.graph.applicationRoutes.values()) {
    for (const x of [...(r.rounds || []), ...(r.milestones || [])]) {
      look(`${r.id}/${x.id}`, r.destination, x.institutions);
      look(`${r.id}/${x.id} (except)`, r.destination, x.institutionsExcept);
    }
  }
  for (const c of site.countries) (c.application?.deadlines || []).forEach((d, i) => {
    look(`${c.code}.deadlines[${i}]`, c.code, d.institutions);
    look(`${c.code}.deadlines[${i}] (except)`, c.code, d.institutionsExcept);
  });
  if (bad.length) throw new Error(`${bad.length} bad ties\n          ${bad.slice(0, 20).join('\n          ')}`);
});

check('every date a school says it replaces is a real route date', () => {
  const refs = new Set([...site.graph.applicationRoutes.values()].flatMap((r) => [...(r.milestones || []), ...(r.rounds || [])].map((m) => `${r.id}/${m.id}`)));
  const bad = [];
  for (const r of site.graph.applicationRoutes.values()) for (const m of r.milestones || []) if (m.supersedes && !refs.has(m.supersedes)) bad.push(`${r.id}/${m.id} → ${m.supersedes}`);
  for (const c of site.countries) for (const i of c.institutions) for (const d of i.school?.dates || []) if (d.supersedes && !refs.has(d.supersedes)) bad.push(`${i.key} "${d.label}" → ${d.supersedes}`);
  if (bad.length) throw new Error(`${bad.length} dangling supersedes\n          ${bad.join('\n          ')}`);
});

const fold = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, "'");
const escRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const namesOfPage = (r) =>
  [r.name, r.shortName, r.localName].filter(Boolean)
    .flatMap((n) => { const m = n.match(/^(.*?)\s*\(([^)]+)\)\s*$/); return m ? [m[1], m[2]] : [n]; })
    .filter((n) => n.length >= 3);
const mentions = (label, n) => {
  const N = fold(n);
  return new RegExp(`(^|[^A-Za-z0-9])${escRe(N)}($|[^A-Za-z0-9])`, /\s/.test(N.trim()) ? 'i' : '').test(fold(label));
};
const byDest = new Map();
for (const p of schoolPages) byDest.set(p.dest, [...(byDest.get(p.dest) || []), p]);

const pagelessByDest = new Map();
{
  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return null; } };
  const urlsOf = (r) => [r.website, r.admissionsUrl, ...Object.values(r.links || {})].filter((u) => typeof u === 'string');
  const add = (dest, n, ev = null) => {
    const name = String(n || '').split(/\s+[—–-]\s+|,\s|\s\(/)[0].trim();
    if (name.length < 4 || !/\s/.test(name)) return;
    const pages = byDest.get(dest) || [];
    const size = identityWords(name).size;
    const h = ev && host(ev.sourceUrl);
    const about = (ev?.supports || []).map((x) => site.graph.opportunities.get(x.entity)?.institution || x.entity);
    if (pages.some((q) =>
      namesOfPage(q.inst).some((qn) => mentions(n, qn) || mentions(qn, name) || nameMatch(name, qn) >= size) ||
      (h && urlsOf(q.inst).map(host).some((qh) => qh && (qh === h || h.endsWith(`.${qh}`) || qh.endsWith(`.${h}`)))) ||
      about.includes(q.id)
    )) return;
    if (!pagelessByDest.has(dest)) pagelessByDest.set(dest, new Set());
    pagelessByDest.get(dest).add(name);
  };
  for (const e of allEvents(site)) for (const n of e.institutionsWithoutPage || []) add(e.destination, n);
  for (const ev of site.graph.evidence.values()) {
    if (ev.publisherType !== 'institution') continue;
    for (const s of ev.supports || []) {
      const dest = String(s.entity || '').split('-')[0];
      if (byDest.has(dest)) add(dest, ev.publisher, ev);
    }
  }
}
const pagelessNamed = (dest, label) => [...(pagelessByDest.get(dest) || [])].filter((n) => mentions(label, n));

const schoolToday = new Date().toISOString().slice(0, 10);
const wrongSchool = [];
const guessed = [];
const pagelessShown = [];
const fixusShown = [];
let panelsChecked = 0;
const notForShown = [];
function notForPage(p, shown) {
  const own = namesOfPage(p.inst);
  const out = [];
  for (const e of shown) {
    const m = String(e.note || '').match(/not (?:available|applicable|open) (?:for|to) ([^.;]+)/i);
    if (m && own.some((n) => mentions(m[1], n))) out.push(`${p.id}: "${e.label}" says "${m[0]}"`);
  }
  return out;
}
const bindingLate = [];
function scanPage(p, shown) {
  const out = { wrong: [], guessed: [], pageless: [] };
  const own = namesOfPage(p.inst);
  const others = byDest.get(p.dest).filter((q) => q !== p);
  for (const e of shown) {
    if ((e.institutions || []).length) continue;
    if ((e.institutionsWithoutPage || []).length) out.pageless.push(`${p.id}: "${e.label}" is ${e.institutionsWithoutPage.join(', ')}'s, which has no page`);
    if (own.some((n) => mentions(e.label, n))) continue;
    if (!e.routeId && e.origin !== 'school') out.guessed.push(`${p.id}: "${e.label}" names no school on this page and has no tie`);
    let named = others.filter((q) => namesOfPage(q.inst).some((n) => mentions(e.label, n)));
    named = named.filter((q) => !named.some((o) => o !== q && namesOfPage(o.inst).some((on) => namesOfPage(q.inst).some((qn) => on !== qn && fold(on).includes(fold(qn)) && mentions(e.label, on)))));
    const pageless = pagelessNamed(p.dest, e.label);
    if (named.length || pageless.length) out.wrong.push(`${p.id}: "${e.label}" is ${[...named.map((q) => q.id), ...pageless].join(', ')}'s`);
  }
  return out;
}
for (const p of schoolPages) {
  const shown = datesFor(site, p.inst).filter((e) => e.date && (e.endDate || e.date) >= schoolToday);
  panelsChecked++;
  const found = scanPage(p, shown);
  wrongSchool.push(...found.wrong);
  guessed.push(...found.guessed);
  pagelessShown.push(...found.pageless);
  notForShown.push(...notForPage(p, shown));
  for (const prog of p.inst.programmes || []) {
    const opp = site.graph.opportunities.get(prog.opportunityId || prog.id);
    if (opp?.admission?.numerusFixus !== false) continue;
    for (const e of datesFor(site, p.inst, { programme: prog }).filter((e) => e.date && (e.endDate || e.date) >= schoolToday)) {
      if (e.numerusFixusOnly) fixusShown.push(`${prog.id || prog.name}: "${e.label}"`);
    }
  }
  const order = leadOrder(shown);
  const firstSoft = order.findIndex((e) => !leadsFor(e));
  if (firstSoft >= 0 && order.slice(firstSoft).some(leadsFor)) bindingLate.push(p.id);
}
check(`no school page shows another institution's date, with a page or without (${panelsChecked} pages, ${[...pagelessByDest.values()].reduce((n, s) => n + s.size, 0)} institutions without a page known)`, () => {
  assert.ok(pagelessByDest.get('is')?.has('Reykjavik University'), 'the institutions without a page were not collected: Reykjavik University is missing');
  if (wrongSchool.length) throw new Error(`${wrongSchool.length} dates on the wrong page\n          ${wrongSchool.slice(0, 25).join('\n          ')}`);
});
check('the scan catches the round-3 faults: Reykjavik and Akureyri on Iceland pages, UAT-UK on UAL', () => {
  const page = (id) => schoolPages.find((p) => p.id === id);
  const reykjavik = { label: 'Reykjavik University, EU/EEA residents, autumn', date: '2027-04-30', routeId: 'is-direct-2027', origin: 'route' };
  const akureyri = { label: 'University of Akureyri: EU/EEA applicants', date: '2027-06-05', routeId: 'is-direct-2027', origin: 'route' };
  const uat = { label: 'UAT-UK admissions tests (ESAT, TMUA, TARA) - October sitting', date: '2026-10-12', routeId: null, origin: 'profile' };
  for (const id of ['is-hi', 'is-lhi']) {
    const found = scanPage(page(id), [reykjavik, akureyri]);
    assert.equal(found.wrong.length, 2, `${id}: the scan missed the dates of institutions without a page`);
  }
  assert.equal(scanPage(page('gb-ual'), [uat]).guessed.length, 1, 'gb-ual: the scan missed UAT-UK read as University of the Arts');
});
check('a date whose note says it is not for a school never reaches that school', () => {
  const oxford = schoolPages.find((p) => p.id === 'gb-oxford');
  const planted = { label: 'Test sitting', date: '2027-01-04', note: 'Not available for Oxford or Cambridge applicants.' };
  assert.equal(notForPage(oxford, [planted]).length, 1, 'the scan missed a note that excludes this school');
  if (notForShown.length) throw new Error(notForShown.join('\n          '));
});
check('UCAS 13 January, Extra, Clearing and the final date stay off Oxford and Cambridge, where every course closes 15 October', () => {
  for (const id of ['gb-oxford', 'gb-cambridge']) {
    const p = schoolPages.find((q) => q.id === id);
    const shown = datesFor(site, p.inst);
    const ids = new Set(shown.map((e) => e.routeId && `${e.routeId}/${e.id}`).filter(Boolean));
    for (const ref of ['gb-ucas-2027/ms-main', 'gb-ucas-2027/ms-extra', 'gb-ucas-2027/ms-clearing', 'gb-ucas-2027/ms-final']) assert.ok(!ids.has(ref), `${id} shows ${ref}`);
    assert.ok(shown.some((e) => e.date === '2026-10-15' && isBinding(e)), `${id} lost its 15 October deadline`);
  }
});
check('a date for an institution without a page reaches no school page', () => {
  if (pagelessShown.length) throw new Error(pagelessShown.join('\n          '));
});
check('a date on no route reaches a school page by its name or a tie, never a guessed initialism', () => {
  if (guessed.length) throw new Error(`${guessed.length} guessed\n          ${guessed.slice(0, 25).join('\n          ')}`);
});
check('a programme recorded as not numerus fixus shows no numerus fixus date', () => {
  if (fixusShown.length) throw new Error(fixusShown.join('\n          '));
});
check('an initialism names a whole name or its closing words, never a phrase inside it', () => {
  assert.equal(initialismOf('UAT-UK admissions tests', 'University of the Arts London', { toEnd: true }), null, 'UAT read as University of the Arts London');
  assert.equal(initialismOf('UAT-UK admissions tests', 'Iceland University of the Arts', { toEnd: true }), null, 'UAT read as University of the Arts (T from inside "Arts")');
  assert.equal(initialismOf('UBC applications close', 'University of British Columbia', { toEnd: true }), 'UBC');
  assert.equal(initialismOf('International UAS Exam', 'Laurea University of Applied Sciences', { toEnd: true }), 'UAS');
  assert.equal(initialismOf('XJTLU closes', "Xi'an Jiaotong-Liverpool University", { toEnd: true }), 'XJTLU');
});

check('every dated label that names an institution without a page carries institutionsWithoutPage or a tie', () => {
  const bad = allEvents(site)
    .filter((e) => e.date && isActionable(e) && !(e.institutions || []).length && !(e.institutionsWithoutPage || []).length)
    .filter((e) => pagelessNamed(e.destination, e.label).length)
    .map((e) => `${e.destination} "${e.label}" names ${pagelessNamed(e.destination, e.label).join(', ')}`);
  if (bad.length) throw new Error(bad.join('\n          '));
});

check('a date whose source gives no year is provisional, and says so in a field', () => {
  const noYear = /\b(no|without a|without any|with no calendar|carries no|gives no|give no) year\b|published with no year|year here is inferred|years here are inferred/i;
  const bad = [];
  const look = (where, x) => {
    if (!x || !(x.date || x.closes || x.opens)) return;
    if (x.yearUnpublished && !x.provisional) bad.push(`${where}: yearUnpublished but not provisional`);
    const text = [x.note, x.notes, x.year].filter(Boolean).join(' ');
    if (noYear.test(text) && x.yearUnpublished === undefined) bad.push(`${where}: its note says the source gives no year, but yearUnpublished is not set`);
  };
  for (const r of site.graph.applicationRoutes.values()) for (const x of [...(r.rounds || []), ...(r.milestones || [])]) look(`${r.id}/${x.id} "${String(x.label).slice(0, 50)}"`, x);
  for (const c of site.countries) (c.application?.deadlines || []).forEach((d, i) => look(`${c.code}.deadlines[${i}] "${String(d.label).slice(0, 50)}"`, d));
  if (bad.length) throw new Error(`${bad.length}\n          ${bad.join('\n          ')}`);
});
check('every binding date comes before any soft one on a school page, and none only for Diploma holders leads', () => {
  if (bindingLate.length) throw new Error(`soft before binding on ${bindingLate.join(', ')}`);
});

if (REPORT) {
  const rows = site.countries
    .map((c) => {
      const ds = c.application?.deadlines || [];
      const iso = ds.filter((d) => ISO.test(String(d.date))).length;
      const declared = ds.filter((d) => !ISO.test(String(d.date)) && DATE_STATES[d.dateState]).length;
      return { code: c.code, name: c.name, total: ds.length, done: iso + declared };
    })
    .sort((a, b) => a.done / (a.total || 1) - b.done / (b.total || 1) || b.total - a.total);

  console.log('\n\nDeadline migration — least migrated first\n');
  for (const r of rows) {
    const bar = r.total ? '█'.repeat(Math.round((r.done / r.total) * 20)).padEnd(20, '·') : ''.padEnd(20, ' ');
    console.log(`  ${r.code}  ${bar}  ${String(r.done).padStart(3)} of ${String(r.total).padEnd(3)}  ${r.name}`);
  }
  const all = allEvents(site);
  const dated = all.filter((e) => e.date).length;
  console.log(`\n  ${dated} of ${all.length} events across the site carry a sortable date.\n`);
}

console.log(failures ? `\n${failures} failing\n` : '\nAll calendar guards pass\n');
if (failures) process.exit(1);

// IB calendar: canonical dates, source links and honest provisional status
{
const { default: assert } = await import('node:assert/strict');
const { default: fs } = await import('node:fs/promises');
const { default: path } = await import('node:path');
const {
  DATE_STATES,
  IB_DATE_BASIS,
  IB_RESULTS_EVENT,
  claimsIbRelease,
  ibSessionEvent,
} = await import('../src/lib/calendar.mjs');
const { isRealDate } = await import('../src/lib/publication-floor.mjs');

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'data');

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message}`);
  }
};
const checkAsync = async (name, fn) => {
  try {
    await fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message}`);
  }
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function auditCalendar(calendar) {
  const problems = [];
  const sessions = calendar?.sessions || [];
  if (!sessions.length) problems.push('data/ib-calendar.json holds no sessions');

  const cycles = sessions.filter((s) => s.isTheCycleThisSiteCovers);
  if (cycles.length !== 1) {
    problems.push(
      `${cycles.length} session(s) claim to be the cycle this site covers. Exactly one may: it is what a record with no pointer of its own falls back to.`
    );
  }

  for (const session of sessions) {
    const seen = new Map();
    for (const [id, event] of Object.entries(session.events || {})) {
      const at = `${session.id}/${id}`;
      if (!IB_DATE_BASIS[event.basis]) {
        problems.push(`${at}: basis "${event.basis}" is not one of ${Object.keys(IB_DATE_BASIS).join(', ')}`);
      }
      if (event.date != null && !isRealDate(event.date)) {
        problems.push(`${at}: date "${event.date}" is not ISO`);
      }
      if (event.date == null && !DATE_STATES[event.dateState]) {
        problems.push(`${at}: no date and no dateState — say which of the ${Object.keys(DATE_STATES).length} it is`);
      }
      if (event.basis === 'published' && !(event.sources || []).some((s) => s.url)) {
        problems.push(`${at}: claims basis "published" and cites no source. Published dates need a source link and checked date.`);
      }
      if (isRealDate(event.date)) {
        if (seen.has(event.date)) {
          problems.push(
            `${at} and ${session.id}/${seen.get(event.date)} are both on ${event.date}. Two IB events on one day is how the distinction between them gets lost.`
          );
        }
        seen.set(event.date, id);
      }
    }
  }
  return problems;
}

function auditRecords(calendar, entries) {
  const problems = [];

  for (const e of entries) {
    const claims = claimsIbRelease(e.label);

    if (claims && !e.ibCalendar) {
      problems.push(
        `${e.where}: "${e.label}" states an IB results date (${e.date ?? '—'}) on its own authority. ` +
          `Point it at data/ib-calendar.json with ibCalendar and copy the referenced event date into this record.`
      );
      continue;
    }
    if (!e.ibCalendar) continue;

    const event = ibSessionEvent(calendar, e.ibCalendar);
    if (!event) {
      problems.push(`${e.where}: ibCalendar "${e.ibCalendar}" resolves to nothing in data/ib-calendar.json`);
      continue;
    }

    if (claims && event.eventId !== IB_RESULTS_EVENT) {
      problems.push(
        `${e.where}: "${e.label}" claims the IB released results and points at ${e.ibCalendar}, which is "${event.label}". ` +
          `They are different events and a student reading this would take the wrong day.`
      );
    }

    if (isRealDate(event.date)) {
      if (e.date !== event.date) {
        problems.push(
          `${e.where}: "${e.label}" says ${e.date ?? '—'} where ${e.ibCalendar} says ${event.date}. ` +
            `Update this date from its data/ib-calendar.json reference.`
        );
      }
      if (event.basis !== 'published' && e.provisional !== true) {
        problems.push(
          `${e.where}: "${e.label}" takes a date whose basis is "${event.basis}" and is not marked provisional, ` +
            `so an inference renders as a published date.`
        );
      }
    } else if (e.date != null) {
      problems.push(`${e.where}: "${e.label}" carries ${e.date} where ${e.ibCalendar} has no date at all`);
    }

    const cited = (e.sources || []).map((s) => typeof s === 'string' ? s : s.url);
    const missing = (event.sources || []).map((s) => s.url).filter((url) => !cited.includes(url));
    if (missing.length) {
      problems.push(`${e.where}: "${e.label}" does not cite ${missing.join(', ')}, which ${e.ibCalendar} is held on`);
    }
  }

  return problems;
}

function auditProse(calendar, texts) {
  const problems = [];
  const parts = (iso) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? { year: +m[1], month: +m[2], day: +m[3] } : null;
  };

  const ranges = [];
  const days = [];
  for (const session of calendar?.sessions || []) {
    const dated = Object.entries(session.events || {})
      .map(([id, ev]) => ({ id, ev, p: parts(ev.date) }))
      .filter((x) => x.p);
    for (const { id, ev, p } of dated) {
      days.push({ ref: `${session.id}/${id}`, label: ev.label, ...p, isResults: id === IB_RESULTS_EVENT });
    }
    for (const a of dated) {
      for (const b of dated) {
        if (a.id === b.id || a.p.month !== b.p.month || a.p.year !== b.p.year || a.p.day >= b.p.day) continue;
        ranges.push({
          a: a.id,
          b: b.id,
          re: new RegExp(`\\b${a.p.day}\\s*(?:[-–—]|to)\\s*${b.p.day}\\s+${MONTHS[a.p.month - 1]}\\b`, 'i'),
        });
      }
    }
  }

  const MENTIONS_IB = /\bIB\b[^.]{0,40}?\b(?:results?|releases?|publishes)\b/i;

  const DAY = `\\b(\\d{1,2})\\s+(${MONTHS.join('|')})\\b`;
  const RELEASED = `(?:released?|release|publish(?:ed|es)?|issued?|comes? out|came out|arrives?|are out)`;
  const SAYS_RELEASE = [
    new RegExp(`\\bIB\\b[^.;]{0,25}?\\bresults?\\b[^.;]{0,50}?${RELEASED}[^.;]{0,45}?${DAY}`, 'gi'),
    new RegExp(`\\bIB\\b[^.;]{0,15}?\\b(?:releases?|publishes)\\b[^.;]{0,45}?${DAY}`, 'gi'),
  ];

  for (const { where, text } of texts) {
    if (!MENTIONS_IB.test(text)) continue;

    for (const r of ranges) {
      if (r.re.test(text)) {
        problems.push(
          `${where}: describes IB results as spanning ${r.a} and ${r.b}. They are two different IB events one day apart, ` +
            `and a student reading a range takes the earlier day.`
        );
      }
    }

    for (const m of SAYS_RELEASE.flatMap((re) => [...text.matchAll(re)])) {
      const day = Number(m[1]);
      const month = MONTHS.indexOf(m[2].replace(/^./, (c) => c.toUpperCase())) + 1;
      const hit = days.find((d) => d.day === day && d.month === month);
      if (hit && !hit.isResults) {
        problems.push(
          `${where}: names IB results and then ${day} ${m[2]}, which is ${hit.ref} — "${hit.label}" — and not results day.`
        );
      }
      const results = days.find((d) => d.isResults && d.month === month);
      if (results && !hit && day !== results.day) {
        problems.push(
          `${where}: names IB results and then ${day} ${m[2]}, where ${results.ref} says ${results.day} ${m[2]}.`
        );
      }
    }
  }

  return problems;
}

const CAL = {
  sessions: [
    {
      id: '2027-05',
      isTheCycleThisSiteCovers: true,
      events: {
        'results-day': {
          label: 'IB results released',
          date: '2027-07-06',
          basis: 'inferred-from-precedent',
          sources: [{ url: 'https://example.test/results', retrieved: '2026-09-23' }],
        },
        'transcript-request-cutoff': {
          label: 'Transcript requests stop being free',
          date: '2027-07-05',
          basis: 'published',
          sources: [{ url: 'https://example.test/transcripts', retrieved: '2026-09-23' }],
        },
      },
    },
  ],
};

const entry = (o) => ({ where: 'fixture', label: 'IB results released', sources: [{ url: 'https://example.test/results', retrieved: '2026-09-23' }], provisional: true, ...o });

console.log('\nIB session calendar guards\n');

check('a record may not state an IB results date on its own authority', () => {
  const problems = auditRecords(CAL, [entry({ date: '2027-07-06', ibCalendar: undefined })]);
  assert.equal(problems.length, 1, `expected one refusal, got: ${problems.join(' | ')}`);
  assert.match(problems[0], /on its own authority/);
});

check('and the refusal does not depend on the date being wrong', () => {
  // The regression this whole issue is about: a new record copying today's
  // correct date is exactly as bad as one copying a stale one, because the
  // next change to the canonical record will not reach it.
  const problems = auditRecords(CAL, [entry({ date: '2027-07-06' }), entry({ date: '2027-08-30' })]);
  assert.equal(problems.length, 2);
});

check('a pointed record whose date disagrees with the canonical one is refused', () => {
  const problems = auditRecords(CAL, [entry({ date: '2027-07-05', ibCalendar: '2027-05/results-day' })]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /says 2027-07-05 where 2027-05\/results-day says 2027-07-06/);
});

check('results day and the transcript cut-off may not be conflated', () => {
  const problems = auditRecords(CAL, [
    entry({ label: 'IB results released', date: '2027-07-05', ibCalendar: '2027-05/transcript-request-cutoff', sources: [{ url: 'https://example.test/transcripts', retrieved: '2026-09-23' }], provisional: undefined }),
  ]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /different events/);
});

check('an inferred date shown without a provisional mark is refused', () => {
  const problems = auditRecords(CAL, [entry({ date: '2027-07-06', ibCalendar: '2027-05/results-day', provisional: false })]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /renders as a published date/);
});

check('a record that drops the calendar date source is refused', () => {
  const problems = auditRecords(CAL, [entry({ date: '2027-07-06', ibCalendar: '2027-05/results-day', sources: [] })]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /does not cite https:/);
});

check('a pointer to a session that no longer exists fails loudly', () => {
  const problems = auditRecords(CAL, [entry({ date: '2027-07-06', ibCalendar: '2028-05/results-day' })]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /resolves to nothing/);
});

check('a deadline that merely mentions IB results keeps its own date', () => {
  // NTU wants actuals within three days; UC wants them by 15 July. Four real
  // deadlines would have moved onto the IB's day under a looser rule.
  const problems = auditRecords(CAL, [
    { where: 'fixture', label: 'NTU actual IB results due', date: '2027-07-09', sources: [] },
    { where: 'fixture', label: 'Official IB examination results to UC', date: '2027-07-15', sources: [] },
  ]);
  assert.deepEqual(problems, []);
});

check('prose describing results day as a two-day range is refused', () => {
  const problems = auditProse(CAL, [{ where: 'fixture', text: 'Because your IB results arrive on 5-6 July 2027, you will apply conditionally.' }]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /two different IB events/);
});

check('prose naming IB results and then the other event’s day is refused', () => {
  const problems = auditProse(CAL, [{ where: 'fixture', text: 'IB results are released on 5 July 2027.' }]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /and not results day/);
});

check('prose naming IB results and a day nobody publishes is refused', () => {
  const problems = auditProse(CAL, [{ where: 'fixture', text: 'IB results come out 9 July.' }]);
  assert.equal(problems.length, 1, problems.join(' | '));
  assert.match(problems[0], /says 6 July/);
});

check('prose that names the right day is left alone', () => {
  assert.deepEqual(
    auditProse(CAL, [{ where: 'fixture', text: 'IB results are released on 6 July 2027, after the Danish documentation deadline.' }]),
    []
  );
});

check('two IB events on one day is refused at the source', () => {
  const collapsed = structuredClone(CAL);
  collapsed.sessions[0].events['transcript-request-cutoff'].date = '2027-07-06';
  const problems = auditCalendar(collapsed);
  assert.ok(problems.some((p) => /Two IB events on one day/.test(p)), problems.join(' | '));
});

check('a session cannot claim "published" with nothing read', () => {
  const unread = structuredClone(CAL);
  unread.sessions[0].events['transcript-request-cutoff'].sources = [];
  const problems = auditCalendar(unread);
  assert.ok(problems.some((p) => /cites no source/.test(p)), problems.join(' | '));
});

check('an invented basis is not accepted as an honesty field', () => {
  const invented = structuredClone(CAL);
  invented.sessions[0].events['results-day'].basis = 'pretty-sure';
  const problems = auditCalendar(invented);
  assert.ok(problems.some((p) => /basis "pretty-sure"/.test(p)), problems.join(' | '));
});

check('a dateless event still has to say why', () => {
  const blank = structuredClone(CAL);
  blank.sessions[0].events['results-day'] = { label: 'IB results released', date: null, basis: 'not-established', sources: [] };
  const problems = auditCalendar(blank);
  assert.ok(problems.some((p) => /no date and no dateState/.test(p)), problems.join(' | '));
});

async function readJson(p) {
  return JSON.parse(await fs.readFile(p, 'utf8'));
}

async function listJson(dir) {
  try {
    return (await fs.readdir(dir)).filter((f) => f.endsWith('.json')).sort();
  } catch {
    return [];
  }
}

function strings(node, out = []) {
  if (typeof node === 'string') out.push(node);
  else if (Array.isArray(node)) for (const v of node) strings(v, out);
  else if (node && typeof node === 'object') for (const [key, value] of Object.entries(node)) if (key !== 'sources' && !key.startsWith('$comment')) strings(value, out);
  return out;
}

const PROSE_DIRS = ['countries', 'topics', 'schools', 'recognition', 'country-guides'];

const calendar = await readJson(path.join(DATA, 'ib-calendar.json'));

const entries = [];
const texts = [];
function datedEntries(node, where) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) return node.forEach((value, i) => datedEntries(value, where + '[' + i + ']'));
  if (node.label && (node.date || node.ibCalendar)) entries.push({ where, ...node });
  for (const [key, value] of Object.entries(node)) if (key !== 'sources') datedEntries(value, where + '.' + key);
}
for (const dir of ['countries', 'schools']) for (const file of await listJson(path.join(DATA, dir))) datedEntries(await readJson(path.join(DATA, dir, file)), dir + '/' + file);
for (const dir of PROSE_DIRS) {
  for (const f of await listJson(path.join(DATA, dir))) {
    const doc = await readJson(path.join(DATA, dir, f));
    for (const text of strings(doc)) texts.push({ where: `${dir}/${f}`, text });
  }
}
await checkAsync('the canonical record is the shape it says it is', async () => {
  assert.deepEqual(auditCalendar(calendar), []);
});

await checkAsync('no record on the site states an IB date on its own authority', async () => {
  const problems = auditRecords(calendar, entries);
  assert.deepEqual(problems, [], `${problems.length} problem(s)\n          ${problems.join('\n          ')}`);
});

await checkAsync('no prose on the site conflates the two IB dates', async () => {
  const problems = auditProse(calendar, texts);
  assert.deepEqual(problems, [], `${problems.length} problem(s)\n          ${problems.join('\n          ')}`);
});

await checkAsync('IB dates keep source links and checked dates', async () => {
  const problems = [];
  for (const session of calendar.sessions || []) for (const [id, event] of Object.entries(session.events || {})) {
    for (const source of event.sources || []) {
      if (!/^https?:\/\//.test(source.url || '')) problems.push(session.id + '/' + id + ': invalid source URL');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(source.retrieved || source.checked || '')) problems.push(session.id + '/' + id + ': no checked date');
    }
  }
  assert.deepEqual(problems, []);
});

await checkAsync('results day reaches the calendar once per route, on the canonical day', async () => {
  const { load } = await import('../src/lib/data.mjs');
  const { allEvents } = await import('../src/lib/calendar.mjs');
  const site = await load();
  const results = allEvents(site).filter((e) => claimsIbRelease(e.label));

  assert.ok(results.length > 0, 'no IB results day reaches the calendar at all');

  const cycle = (calendar.sessions || []).find((s) => s.isTheCycleThisSiteCovers);
  const day = cycle?.events?.[IB_RESULTS_EVENT]?.date;
  assert.deepEqual(
    results.filter((e) => e.date !== day).map((e) => `${e.destination} ${e.date} "${e.label}"`),
    [],
    'an IB results event on the calendar is not on the canonical day'
  );

  const perSource = new Map();
  for (const e of results) {
    const key = `${e.destination}:${e.routeId || e.origin}`;
    perSource.set(key, (perSource.get(key) || 0) + 1);
  }
  assert.deepEqual(
    [...perSource].filter(([, n]) => n > 1).map(([k, n]) => `${k} contributes ${n}`),
    [],
    'one route or profile is putting results day on the calendar more than once'
  );

  const reached = new Set(results.map((e) => e.destination));
  const expected = new Set(
    entries
      .filter((e) => e.ibCalendar === `${cycle.id}/${IB_RESULTS_EVENT}`)
      .map((e) => e.where.replace(/^(?:countries|schools)\//, '').slice(0, 2))
  );
  assert.deepEqual([...expected].filter((code) => !reached.has(code)), []);
});

console.log(failures ? `\n${failures} failing\n` : '\nAll IB calendar guards pass\n');
if (failures) process.exit(1);
}

// A visible deadline badge agrees with its own note
{
const { load } = await import('../src/lib/data.mjs');
const { allEvents } = await import('../src/lib/calendar.mjs');

const SAYS_SOFT =
  /\b(you are not rejected|may still be (read|considered|accepted)|not a (hard )?(barrier|deadline)|can still apply|still (be )?accepted after|is not a closing date|late applications (are|may be) (still )?(considered|accepted))\b/i;
const SAYS_HARD =
  /\b(it is hard|the door closes|no late applications|late applications are not (considered|accepted)|will not be (considered|accepted)|cannot apply after|is final and binding)\b/i;
const SAYS_NO_SINGLE_DATE = /\b(no single deadline|each (embassy|university|college|institution) sets its own)\b/i;
const SAYS_MONEY_ONLY = /\b(costs money|rather than a place)\b/i;
const SAYS_NOT_THE_READERS =
  /\b(non-EU only|not for EU|not open to EU|EU(\/EEA)? citizens cannot use|listed for completeness)\b/i;
const EXPLANATION_LABEL = /\b(set by each|varies by|each institution|depends on the institution)\b/i;
// A card about something being published or opening is not a door closing.
const ANNOUNCEMENT_LABEL = /\b(confirms|publishes|announces|opens|is published|are published)\b/i;

const site = await load();
const events = allEvents(site);

const problems = [];
for (const e of events) {
  const where = `${e.destinationName || e.destination}: "${e.label}"${e.date ? ` (${e.date})` : ''}`;
  const note = e.note || '';
  if (e.consequence === 'hard' && SAYS_SOFT.test(note)) {
    problems.push(`${where} is marked a hard deadline, but its note says: "${note.match(SAYS_SOFT)[0]}"`);
  }
  if (e.consequence !== 'hard' && SAYS_HARD.test(note)) {
    problems.push(`${where} is marked "${e.consequence}", but its note says: "${note.match(SAYS_HARD)[0]}"`);
  }
  if (e.consequence === 'hard' && SAYS_NO_SINGLE_DATE.test(note)) {
    problems.push(`${where} is marked a hard deadline, but its note says: "${note.match(SAYS_NO_SINGLE_DATE)[0]}"`);
  }
  if (e.consequence === 'priority' && SAYS_MONEY_ONLY.test(note)) {
    problems.push(`${where} is marked priority, but its note says missing it: "${note.match(SAYS_MONEY_ONLY)[0]}"`);
  }
  const card = `${e.label} ${note}`;
  if (e.consequence === 'hard' && SAYS_NOT_THE_READERS.test(card)) {
    problems.push(`${where} is marked a hard deadline, but the card says it is not the reader's: "${card.match(SAYS_NOT_THE_READERS)[0]}"`);
  }
  if (
    !e.date &&
    !e.legacyDate &&
    e.consequence === 'hard' &&
    (EXPLANATION_LABEL.test(e.label) || e.dateState === 'varies-by-institution' || e.type === 'open' || ANNOUNCEMENT_LABEL.test(e.label))
  ) {
    problems.push(`${where} has no date and explains or announces rather than closes, yet is marked a hard deadline`);
  }
}

console.log('\nCalendar labels agree with their notes\n');
console.log(`  ${events.length} events read`);
if (problems.length) {
  console.log(`  FAIL  ${problems.length} card(s) contradict themselves:`);
  for (const p of problems) console.log(`        ${p}`);
  process.exit(1);
}
console.log('  ok    every label agrees with its note\n');
}
