/* Round 5: zoom out to the desk on /countries/ and /destinations/nl/, reduced-motion phone group, layout checks. */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9377 });
const out = {};
const cam = () => b.g('return { lat: +g.view.lat.toFixed(2), lon: +g.view.lon.toFixed(2), alt: +g.view.alt.toFixed(3), close: g.close.active, desk: document.querySelector(".world__desk").style.display === "none" ? 0 : +(document.querySelector(".world__desk").style.opacity||1) };');
const btn = (re) => b.evaluate(`(() => { const n = [...document.querySelectorAll('.world__btn')].find(n => ${re}.test(n.textContent.trim()) || ${re}.test(n.getAttribute('aria-label')||'')); if (!n) return null; const r = n.getBoundingClientRect(); return { x: r.left + r.width/2, y: r.top + r.height/2, disabled: n.disabled || n.getAttribute('aria-disabled') === 'true' }; })()`);
const D = { width: 1280, height: 800 }, P = { width: 390, height: 844, mobile: true, dpr: 2 };
for (const [route, slug] of [['/destinations/nl/', 'nl'], ['/countries/', 'countries']]) {
  for (const [dev, o] of [['d', D], ['p', P]]) {
    const k = `${slug}-${dev}`; out[k] = {};
    await b.open(route, o); await b.globeReady(); await sleep(800);
    out[k].rest = await cam();
    const press = async (re) => { const p = await btn(re); if (!p) return 'nobtn'; if (dev === 'p') await b.tap(p.x, p.y); else await b.click(p.x, p.y); return p.disabled; };
    out[k].minus = [];
    for (let i = 0; i < 6; i++) { out[k].minus.push({ disabledBefore: await press(/^(−|-)$|zoom out/i) }); await sleep(1400); out[k].minus[i].cam = await cam(); if (i === 0) await b.shot(`s4-${k}-minus1`); }
    await b.shot(`s4-${k}-zoomed-out`);
    out[k].minusBtn = await btn(/^(−|-)$|zoom out/i);
    await press(/reset/i); await sleep(3000); out[k].afterReset = await cam(); await b.shot(`s4-${k}-after-reset`);
    /* controls vs ring overlap */
    out[k].overlap = await b.evaluate(`(() => { const c = document.querySelector('.world__controls')?.getBoundingClientRect(); const ring = document.querySelector('.world__desk')?.getBoundingClientRect(); return { controls: c && { l: c.left, t: c.top, r: c.right, b: c.bottom }, desk: ring && { l: ring.left, t: ring.top, r: ring.right, b: ring.bottom } }; })()`);
  }
}
/* phone home: summary gutter + legend */
await b.open('/', P); await b.globeReady(); await sleep(500);
out.phoneLegend = await b.evaluate(`(() => { const s = document.querySelector('.world summary, .world__list summary, details summary'); const r = s?.getBoundingClientRect(); return { text: s?.textContent.trim().slice(0,60), left: r?.left, cls: s?.parentElement?.className }; })()`);
/* reduced phone group */
await b.open('/', { ...P, reduced: true }); await b.globeReady(); await sleep(600);
const gg = await b.evaluate(`(() => { const c = [...document.querySelectorAll('.world__cluster')].filter(n => !n.hidden && n.style.opacity !== '0').map(n => { const r = n.getBoundingClientRect(); return { n: +n.textContent.replace(/\D/g,''), x: r.left + r.width/2, y: r.top + r.height/2 }; }).sort((a,b) => b.n - a.n); return c[0] || null; })()`);
await b.tap(gg.x, gg.y); await sleep(300); out.reducedPhoneGroup = { gg, at300: await cam() }; await sleep(1500); out.reducedPhoneGroup.end = await cam();
await b.shot('s4-reduced-phone-group');
await b.evaluate('history.back()'); await sleep(1000); out.reducedPhoneGroup.back = await cam(); await b.shot('s4-reduced-phone-back');
out.logs = b.logs.filter(l => !/READ-usage/.test(l)).slice(0, 40);
await fs.writeFile(new URL('./s4-zoom.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
b.close(); process.exit(0);
