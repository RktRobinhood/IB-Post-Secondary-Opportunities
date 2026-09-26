/* Home round 2 + programme cards round 3 critic shots.
   ORIGIN=http://localhost:4350 BASEPATH= OUT=<dir> ONLY=home,inst,paths node shoot.mjs */
import fs from 'node:fs/promises';
import path from 'node:path';
import { launch, sleep } from './cdp.mjs';

const HOME = path.resolve(import.meta.dirname, '..');
const CARDS = path.resolve(import.meta.dirname, '../../../programme-cards/round-3');
const only = (process.env.ONLY || '').split(',').filter(Boolean);
const want = (k) => !only.length || only.includes(k);
const b = await launch({ gpu: true, port: 9391 });
const notes = {};

async function jpg(dir, name, { full = false, q = 72 } = {}) {
  await b.settle(400);
  let params = { format: 'jpeg', quality: q };
  if (full) {
    const m = await b.send('Page.getLayoutMetrics');
    const s = m.cssContentSize || m.contentSize;
    params = { ...params, captureBeyondViewport: true, clip: { x: 0, y: 0, width: s.width, height: Math.min(s.height, 16000), scale: 1 } };
  }
  const r = await b.send('Page.captureScreenshot', params);
  await fs.writeFile(path.join(dir, `${name}.jpg`), Buffer.from(r.data, 'base64'));
  console.log('  ', name);
}
const ev = (s) => b.evaluate(s);
const scrollToSel = (sel, pad = 8) => ev(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return false; scrollTo(0, e.getBoundingClientRect().top + scrollY - ${pad}); return true; })()`);
const waitImgs = () => ev(`Promise.all([...document.images].filter(i => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 4000); })))`);
const eager = () => ev(`Promise.all([...document.images].map(i => { i.loading = 'eager'; return i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 6000); }); }))`);
const center = (sel) => ev(`(() => { const d = document.querySelector(${JSON.stringify(sel)}); if (!d) return null; const r = d.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, vis: r.top >= 0 && r.bottom <= innerHeight }; })()`);
const state = () => ev(`(() => { const c = document.getElementById('prog-count'); const cr = c.getBoundingClientRect(); const p = document.querySelector('.discover__pill');
  const cards = [...document.querySelectorAll('#discover-results > li:not([hidden]) .card, #discover-more li:not([hidden]) .card')];
  const vis = cards.filter(x => x.offsetParent);
  return { count: c.textContent.trim(), active: document.getElementById('prog-active')?.textContent.trim(), countOnScreen: cr.top >= 0 && cr.bottom <= innerHeight,
    pill: p && !p.hidden && getComputedStyle(p).display !== 'none' ? p.textContent.trim() : null,
    visibleCards: vis.length, first: vis.slice(0, 12).map(x => x.querySelector('.card__title')?.textContent.trim() + ' | ' + x.querySelector('.card__cred')?.textContent.replace(/\\s+/g,' ').trim() + ' | ' + (x.querySelector('.req__ib')?.textContent.replace(/\\s+/g,' ').trim() || '') + ' | ' + (x.querySelector('.card__tag, .tag')?.textContent.trim() || '')),
    empty: document.getElementById('discover-empty')?.hidden === false ? document.getElementById('discover-empty').innerText : null,
    places: document.getElementById('discover-places')?.hidden === false ? document.querySelectorAll('#discover-places .tile').length : 0,
    url: location.pathname + location.search, docH: document.documentElement.scrollHeight, sx: document.scrollingElement.scrollWidth - innerWidth }; })()`);

const views = [
  { k: 'desk', o: { width: 1280, height: 800 } },
  { k: 'phone', o: { width: 390, height: 844, mobile: true, dpr: 2 } },
];

if (want('home')) for (const v of views) for (const dark of [false, true]) {
  const t = `${v.k}-${dark ? 'dark' : 'light'}`;
  const o = { ...v.o, dark };
  const phone = v.k === 'phone';
  const act = async (x, y) => (phone ? b.tap(x, y) : b.click(x, y));
  const N = (notes[t] = {});
  await b.open('/', o); await sleep(2500);
  await jpg(HOME, `${t}-01-first`);
  N.first = await state();
  if (!dark) {
    await eager(); await sleep(500);
    await jpg(HOME, `${t}-02-full`, { full: true, q: 50 });
    await ev('scrollTo(0,0)');
  }
  for (const door of ['here', 'nearby', 'far']) {
    await b.open('/', o); await sleep(2000);
    const c = await center(`.preset[data-scope="${door}"]`);
    if (!c.vis) { await ev(`document.querySelector('.preset[data-scope="${door}"]').scrollIntoView({block:'center'})`); await sleep(300); }
    const c2 = await center(`.preset[data-scope="${door}"]`);
    await act(c2.x, c2.y); await sleep(3500);
    N[`door-${door}`] = await state();
    await jpg(HOME, `${t}-03-door-${door}`);
    if (phone && door === 'here') {
      const p = await center('.discover__pill');
      if (p && N[`door-${door}`].pill) { await act(p.x, p.y); await sleep(1500); await waitImgs(); N.afterPill = await state(); N.afterPillGeom = await ev(`(() => { const c = document.getElementById('prog-count').getBoundingClientRect(); const f = document.querySelector('#discover-results > li:not([hidden]) .card')?.getBoundingClientRect(); return { countTop: Math.round(c.top), firstCardTop: f && Math.round(f.top) }; })()`); await jpg(HOME, `${t}-04-after-pill`); }
    }
    if (!phone || door === 'far') { await scrollToSel('#prog-count', 8); await sleep(600); await waitImgs(); await jpg(HOME, `${t}-04-door-${door}-results`); }
  }
  // Subject filter: Engineering.
  await b.open('/', o); await sleep(1500);
  await ev(`(() => { const s = document.getElementById('f-field'); s.value = 'Engineering'; s.dispatchEvent(new Event('input', {bubbles:true})); s.dispatchEvent(new Event('change', {bubbles:true})); })()`);
  await sleep(2500); N.subject = await state();
  await jpg(HOME, `${t}-05-subject`);
  await scrollToSel('#prog-count', 8); await sleep(500); await waitImgs(); await jpg(HOME, `${t}-05-subject-results`);
  // Search: medicine, typed.
  await b.open('/', o); await sleep(1500);
  const q = await center('#f-q'); if (!q.vis) { await ev(`document.getElementById('f-q').scrollIntoView({block:'center'})`); await sleep(300); }
  const q2 = await center('#f-q'); await act(q2.x, q2.y); await sleep(200);
  await b.send('Input.insertText', { text: 'medicine' }); await sleep(2500);
  N.medicine = await state();
  await jpg(HOME, `${t}-06-medicine`);
  await scrollToSel('#prog-count', 8); await sleep(500); await jpg(HOME, `${t}-06-medicine-results`);
  // Another plausible word: law, psychology.
  for (const w of ['psychology', 'law']) {
    await b.open('/?q=' + w, o); await sleep(2000); N['q-' + w] = await state();
  }
  // Show all.
  await b.open('/', o); await sleep(1500);
  await scrollToSel('#discover-more', 200); await sleep(400);
  N.beforeShowAll = await state();
  const sa = await center('#discover-more > summary');
  if (sa) { await act(sa.x, sa.y); await sleep(1500); N.showAll = await state(); N.showAllSummary = await ev(`(() => { const s = document.querySelector('#discover-more > summary'); return s ? { text: s.textContent.trim(), shown: s.offsetParent !== null, open: s.parentElement.open } : null; })()`); await waitImgs(); await jpg(HOME, `${t}-07-show-all`); }
  if (phone) {
    // Filter sheet.
    await b.open('/', o); await sleep(1500);
    const f = await center('#f-sheet-open'); if (!f.vis) { await ev(`document.getElementById('f-sheet-open').scrollIntoView({block:'center'})`); await sleep(300); }
    const f2 = await center('#f-sheet-open'); await act(f2.x, f2.y); await sleep(1000);
    await jpg(HOME, `${t}-08-sheet`);
    const chip = await center('#f-nomath'); if (chip) { await act(chip.x, chip.y); await sleep(800); }
    N.sheet = await ev(`(() => { const s = document.querySelector('[data-show]'); return { show: s?.textContent.trim(), sheetOpen: getComputedStyle(document.getElementById('f-sheet')).display }; })()`);
    await jpg(HOME, `${t}-08-sheet-chip`);
    const sh = await center('[data-show]'); if (sh) { await act(sh.x, sh.y); await sleep(1500); N.afterSheet = await state(); await jpg(HOME, `${t}-08-after-sheet`); }
  }
}

if (want('inst')) for (const v of views) for (const dark of [false, true]) {
  const t = `${v.k}-${dark ? 'dark' : 'light'}`;
  const o = { ...v.o, dark };
  for (const inst of ['dk-sdu', 'dk-cbs']) {
    await b.open(`/universities/${inst}/`, o); await sleep(1500);
    await eager();
    const info = await ev(`(() => { const cards = [...document.querySelectorAll('.card')].filter(c => c.querySelector('.card__cred'));
      return { n: cards.length, docH: document.documentElement.scrollHeight, sx: document.scrollingElement.scrollWidth - innerWidth,
        cards: cards.map(c => ({ title: c.querySelector('.card__title')?.textContent.trim(), cred: c.querySelector('.card__cred')?.textContent.replace(/\\s+/g,' ').trim(), needs: c.querySelector('.req__ib')?.textContent.replace(/\\s+/g,' ').trim(), tag: c.querySelector('.card__tag')?.textContent.trim(), paths: [...c.querySelectorAll('.card__path')].map(p => p.textContent.replace(/\\s+/g,' ').trim()), h: Math.round(c.getBoundingClientRect().height), img: (c.querySelector('img')?.currentSrc || c.querySelector('[data-backdrop]')?.dataset.backdrop || '').split('/').pop() })) }; })()`);
    notes[`${inst}-${t}`] = info;
    await jpg(CARDS, `${inst}-${t}-first`);
    const firstCard = await ev(`(() => { const c = [...document.querySelectorAll('.card')].find(c => c.querySelector('.card__cred')); if (!c) return false; scrollTo(0, c.getBoundingClientRect().top + scrollY - 70); return true; })()`);
    if (firstCard) { await sleep(500); await jpg(CARDS, `${inst}-${t}-cards`); await ev('scrollBy(0, innerHeight - 80)'); await sleep(400); await jpg(CARDS, `${inst}-${t}-cards-2`); }
    if (inst === 'dk-sdu') {
      const fam = await ev(`(() => { const c = [...document.querySelectorAll('.card')].find(c => c.querySelector('.card__path')); if (!c) return false; scrollTo(0, c.getBoundingClientRect().top + scrollY - 20); return true; })()`);
      if (fam) { await sleep(500); await jpg(CARDS, `${inst}-${t}-family`); }
    }
  }
  // Member programme: Paths table.
  await b.open('/programmes/dk-sdu-electronics-sonderborg-2027-autumn/', o); await sleep(1500);
  if (await scrollToSel('#paths-title', 8)) {
    await sleep(500);
    notes[`paths-${t}`] = await ev(`({ sx: document.scrollingElement.scrollWidth - innerWidth, text: document.getElementById('paths-title').closest('section')?.innerText.slice(0, 1500) })`);
    await jpg(CARDS, `paths-${t}`);
    await ev('scrollBy(0, innerHeight - 100)'); await sleep(300); await jpg(CARDS, `paths-${t}-2`);
  }
}

if (want('audit')) {
  // Every card photo on /, and every institution page, for repeats.
  await b.open('/', { width: 1280, height: 800 }); await sleep(1500);
  notes.homePhotos = await ev(`[...document.querySelectorAll('#discover .card')].map(c => ({ title: c.querySelector('.card__title')?.textContent.trim(), inst: c.querySelector('.card__foot')?.textContent.replace(/\\s+/g,' ').trim(), img: (c.querySelector('img')?.getAttribute('src') || c.querySelector('[data-backdrop]')?.dataset.backdrop || '') }))`);
}

await fs.writeFile(path.join(HOME, `notes-${only.join('-') || 'all'}.json`), JSON.stringify(notes, null, 1));
if (b.logs.length) console.log('logs:', b.logs.filter((l) => !/favicon/.test(l)).slice(0, 20));
b.close();
process.exit(0);
