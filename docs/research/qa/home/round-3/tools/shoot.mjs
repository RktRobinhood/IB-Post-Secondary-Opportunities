/* Home round-3 / cards round-4 critic shots. ORIGIN=http://localhost:4380 BASEPATH= OUT=D:/ibp-tmp/crit-r3 node shoot.mjs [only,...] */
import fs from 'node:fs';
import { launch, sleep } from './cdp.mjs';
const only = (process.argv[2] || '').split(',').filter(Boolean);
const want = (k) => !only.length || only.includes(k);
const b = await launch({ gpu: true, port: 9431 });
const DESK = { width: 1280, height: 800 };
const PHONE = { width: 390, height: 844, mobile: true, dpr: 2 };
const notes = {};
const waitImgs = () => b.evaluate(`Promise.all([...document.images].filter(i => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).map(i => { i.loading = 'eager'; return i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 4000); }); }))`);
const noSmooth = () => b.evaluate(`document.documentElement.style.scrollBehavior = 'auto'`);
const to = async (sel, pad = 12) => { await noSmooth(); return b.evaluate(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return false; scrollTo(0, e.getBoundingClientRect().top + scrollY - ${pad}); return true; })()`); };
const shot = async (name) => { await sleep(700); await waitImgs(); await sleep(200); await b.shot(name, { fmt: 'jpeg' }); };
const type = (q) => b.evaluate(`(() => { const i = document.getElementById('f-q'); i.value = ${JSON.stringify(q)}; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); })()`);
const fold = () => b.evaluate(`JSON.stringify((() => {
  const im = [...document.querySelectorAll('.card__backdrop')].map(i => i.getBoundingClientRect()).filter(r => r.width > 0 && r.height > 0);
  const firstPhoto = im.length ? Math.round(Math.min(...im.map(r => r.top + scrollY))) : null;
  const c = document.getElementById('prog-count'); const p = document.querySelector('.discover__pill:not([hidden])');
  return { firstPhotoTop: firstPhoto, count: c && c.textContent.trim(), countTop: c && Math.round(c.getBoundingClientRect().top), pill: p && p.textContent.trim(),
    empty: document.getElementById('discover-empty-line')?.offsetParent ? document.getElementById('discover-empty-line').textContent.trim() : null,
    ways: [...document.querySelectorAll('#discover-empty-ways a, #discover-empty-ways button')].filter(e => e.offsetParent).map(e => e.textContent.trim()),
    places: document.getElementById('discover-places-line')?.offsetParent ? document.getElementById('discover-places-line').textContent.trim() : null,
    tiles: [...document.querySelectorAll('#discover-places-tiles > *')].filter(e => e.offsetParent).length,
    visibleCards: [...document.querySelectorAll('.discover__card')].filter(e => e.offsetParent).map(e => e.querySelector('.card__title')?.textContent.trim()) };
})())`).then(JSON.parse);
const cards = () => b.evaluate(`JSON.stringify([...document.querySelectorAll('article.card--backdrop')].filter(a => a.offsetParent).map(a => ({
  t: a.querySelector('.card__title')?.textContent.trim(), img: a.querySelector('.card__backdrop')?.dataset.backdrop,
  tag: a.querySelector('.card__tag')?.textContent.trim(), cred: a.querySelector('.card__cred')?.textContent.replace(/\\s+/g, ' ').trim(),
  needs: a.querySelector('.req')?.textContent.replace(/\\s+/g, ' ').trim(), foot: a.querySelector('.card__foot')?.textContent.trim(), h: Math.round(a.getBoundingClientRect().height) })))`).then(JSON.parse);

for (const [dev, o] of [['desk', DESK], ['phone', PHONE]]) {
  for (const dark of [false, true]) {
    const t = `${dev}-${dark ? 'dark' : 'light'}`;
    if (want('home')) {
      await b.open('/', { ...o, dark }); await sleep(3000);
      await shot(`home-${t}-first`); notes[`first-${t}`] = await fold();
      await b.evaluate(`scrollBy(0, innerHeight - 100)`); await shot(`home-${t}-scroll1`);
    }
    if (want('door')) {
      for (const d of dark ? ['nearby'] : ['here', 'nearby', 'far']) {
        await b.open('/', { ...o, dark }); await sleep(2500);
        await b.evaluate(`document.querySelector('.preset[data-scope="${d}"]').click()`); await sleep(3000);
        await shot(`door-${d}-${t}`); notes[`door-${d}-${t}`] = await fold();
        if (d !== 'here' && !dark) { await to('#discover-places', dev === 'desk' ? 80 : 70); await shot(`door-${d}-${t}-tiles`); }
        if (dev === 'phone' && d === 'nearby' && !dark) { await noSmooth(); await b.evaluate(`scrollTo(0, 2600)`); await sleep(900); notes[`pill-${t}`] = await b.evaluate(`(() => { const p = document.querySelector('.discover__pill:not([hidden])'); if (!p) return null; const r = p.getBoundingClientRect(); return { text: p.textContent.trim(), top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) }; })()`); await shot(`pill-${t}`); }
      }
    }
    if (want('search') && !dark) {
      for (const q of ['psychology', 'law']) {
        await b.open('/', { ...o, dark }); await sleep(2000);
        await type(q); await sleep(1200);
        notes[`q-${q}-${t}`] = await fold();
        await to('#prog-count', dev === 'desk' ? 80 : 70); await shot(`search-${q}-${t}`);
      }
    }
    if (want('sheet')) {
      await b.open('/', { ...o, dark }); await sleep(1500);
      await b.evaluate(`document.getElementById('f-sheet-open').click()`); await sleep(900);
      await shot(`filters-sheet-${t}`);
    }
    if (want('inst')) {
      for (const inst of ['dk-sdu', 'dk-cbs']) {
        await b.open(`/universities/${inst}/`, { ...o, dark }); await sleep(1500);
        await shot(`${inst}-${t}-top`);
        await to('.card--backdrop', dev === 'desk' ? 90 : 76); await shot(`${inst}-${t}-cards`);
        if (!dark && dev === 'desk') notes[`${inst}-cards`] = await cards();
      }
    }
    if (want('paths') && dev === 'phone') {
      await b.open('/programmes/dk-sdu-electronics-sonderborg-2027-autumn/', { ...o, dark }); await sleep(1500);
      await to('.paths', 70); await shot(`paths-${t}`);
      await b.evaluate(`scrollBy(0, innerHeight - 120)`); await shot(`paths-${t}-2`);
    }
  }
}
if (want('all')) {
  await b.open('/', { ...DESK }); await sleep(2000);
  await b.evaluate(`(() => { const d = document.querySelector('#discover-more'); const s = d && (d.tagName === 'DETAILS' ? d.querySelector('summary') : d.querySelector('summary, button')); s && s.click(); })()`); await sleep(1200);
  notes.all = await cards();
  const srcs = notes.all.map(c => c.img); notes.dupImgs = srcs.filter((s, i) => srcs.indexOf(s) !== i);
  const tt = notes.all.map(c => c.t); notes.dupTitles = tt.filter((s, i) => tt.indexOf(s) !== i);
  notes.tagKinds = [...new Set(notes.all.map(c => c.tag))];
  notes.noDegree = notes.all.filter(c => !/\b(BSc|BA|BEng|LLB|Bachelor|MSc|MA|B\.|BBA|Professional|AP|Academy|BFA|BMus|BDes|Diploma)/.test(c.cred || ''));
  /* Contact sheet: every visible card photo in page order, drawn in-page. */
  await b.evaluate(`(() => { const L = [...document.querySelectorAll('article.card--backdrop')].filter(a => a.offsetParent).map((a, i) => [a.querySelector('.card__backdrop').currentSrc || a.querySelector('.card__backdrop').src, (i + 1) + '. ' + a.querySelector('.card__title').textContent.trim()]);
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.innerHTML = '<div id=cs style="display:grid;grid-template-columns:repeat(8,156px);gap:3px;background:#444;padding:3px;width:max-content">' + L.map(([s, t]) => '<figure style="margin:0;background:#222;color:#fff;font:10px Arial"><img src="' + s + '" style="width:156px;height:98px;object-fit:cover;display:block"><figcaption style="padding:2px 3px;white-space:nowrap;overflow:hidden">' + t.replace(/</g, '&lt;') + '</figcaption></figure>').join('') + '</div>';
    document.body.style.margin = 0; scrollTo(0, 0); })()`);
  await sleep(2500);
  const h = await b.evaluate(`document.getElementById('cs').offsetHeight`);
  await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: h + 6, deviceScaleFactor: 1, mobile: false }); await sleep(1500);
  await b.evaluate(`Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 5000); })))`);
  await b.shot('home-photo-sheet', { fmt: 'jpeg' });
}
fs.writeFileSync((process.env.OUT || '.') + `/notes-${only.join('_') || 'all'}.json`, JSON.stringify(notes, null, 1));
console.log(b.logs.filter((l) => /exception|error/i.test(l)).slice(0, 10));
b.close(); process.exit(0);
