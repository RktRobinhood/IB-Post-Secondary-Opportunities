/* The round-3 fix shots. ORIGIN=http://localhost:4370 BASEPATH= OUT=<dir> node shoot.mjs [only,...] */
import { launch, sleep } from './cdp.mjs';
const only = (process.argv[2] || '').split(',').filter(Boolean);
const want = (k) => !only.length || only.includes(k);
const b = await launch({ gpu: true, port: 9404 });
const DESK = { width: 1280, height: 800 };
const PHONE = { width: 390, height: 844, mobile: true, dpr: 2 };
const waitImgs = () => b.evaluate(`Promise.all([...document.images].filter(i => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).map(i => { i.loading = 'eager'; return i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 4000); }); }))`);
const to = (sel, pad = 12) => b.evaluate(`(() => { document.documentElement.style.scrollBehavior = 'auto'; const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return false; scrollTo(0, e.getBoundingClientRect().top + scrollY - ${pad}); return true; })()`);
const shot = async (name) => { await sleep(500); await waitImgs(); await b.shot(name, { fmt: 'jpeg' }); };
const type = (q) => b.evaluate(`(() => { const i = document.getElementById('f-q'); i.value = ${JSON.stringify(q)}; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); })()`);

for (const [dev, o] of [['desk', DESK], ['phone', PHONE]]) {
  for (const dark of [false, true]) {
    const t = `${dev}-${dark ? 'dark' : 'light'}`;
    if (want('home')) {
      await b.open('/', { ...o, dark }); await sleep(2500);
      await shot(`home-${t}-first`);
    }
    if (dark) continue;
    if (want('door')) {
      await b.open('/', { ...o, dark }); await sleep(2500);
      await b.evaluate(`document.querySelector('.preset[data-scope="nearby"]').click()`); await sleep(2500);
      await shot(`door-nearby-${t}-first`);
      await to('#discover-places', dev === 'desk' ? 80 : 70); await shot(`door-nearby-${t}-tiles`);
      await b.open('/', { ...o, dark }); await sleep(2500);
      await b.evaluate(`document.querySelector('.preset[data-scope="far"]').click()`); await sleep(3000);
      await shot(`door-far-${t}-first`);
    }
    if (want('search')) {
      await b.open('/', { ...o, dark }); await sleep(2000);
      await type('psychology'); await sleep(800);
      await to('#prog-count', dev === 'desk' ? 80 : 70); await shot(`search-psychology-${t}`);
      await type('law'); await sleep(800);
      await to('#prog-count', dev === 'desk' ? 80 : 70); await shot(`search-law-${t}`);
    }
    if (want('sheet')) {
      await b.open('/', { ...o, dark }); await sleep(1500);
      await b.evaluate(`document.getElementById('f-sheet-open').click()`); await sleep(700);
      await shot(`filters-sheet-${t}`);
    }
    if (want('inst')) {
      for (const inst of ['dk-sdu', 'dk-cbs']) {
        await b.open(`/universities/${inst}/`, { ...o, dark }); await sleep(1500);
        await to('.card--backdrop', dev === 'desk' ? 90 : 76); await shot(`${inst}-${t}-cards`);
        await b.evaluate(`scrollBy(0, innerHeight - 120)`); await shot(`${inst}-${t}-cards-2`);
      }
    }
    if (want('paths')) {
      await b.open('/programmes/dk-sdu-electronics-sonderborg-2027-autumn/', { ...o, dark }); await sleep(1500);
      await to('.paths', 80); await shot(`paths-${t}`);
    }
  }
}
console.log(b.logs.filter((l) => /exception|error/i.test(l)).slice(0, 10));
b.close(); process.exit(0);
