/* Phone (390 x 844, DPR 2, touch): rest views, a tap on a list entry dives to street level, the close map's gestures, scrolling past. */
import { launch, sleep } from './cdp.mjs';
import { record } from './rec.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9366 });
const R = {};
const PH = { width: 390, height: 844, mobile: true, dpr: 2 };
const state = () => b.g('return { alt: +g.view.alt.toFixed(4), close: g.close.active, zoom: g.close.zoom && +g.close.zoom.toFixed(2), sy: Math.round(scrollY), card: document.querySelector(".world__card:not([hidden]) h3")?.textContent || null, engaged: document.querySelector(".world__stage").dataset.engaged || null, hint: document.querySelector(".world__hint:not([hidden])")?.textContent || null };');
const swipe = async (x, y, dx, dy, steps = 10, fingers = 1) => {
  const pts = (k) => Array.from({ length: fingers }, (_, i) => ({ x: x + i * 60 + (dx * k) / steps, y: y + (dy * k) / steps, id: i }));
  await b.touch('touchStart', pts(0));
  for (let k = 1; k <= steps; k++) { await b.touch('touchMove', pts(k)); await sleep(16); }
  await b.touch('touchEnd', []);
};

for (const [route, name] of [['/programmes/', 's4-phone-programmes'], ['/world/', 's4-phone-world'], ['/destinations/nl/', 's4-phone-nl']]) {
  await b.open(route, PH);
  await b.globeReady(); await sleep(1000);
  R[route] = { rest: await b.g('return { ...g.rest };'), stage: await b.stageRect(), pins: await b.evaluate(`[...document.querySelectorAll('.world__pin:not([hidden])')].length`), clusters: await b.evaluate(`[...document.querySelectorAll('.world__cluster:not([hidden])')].map(c => c.textContent)`) };
  await b.shot(name);
}

/* On the NL page: a thumb swiping up over the untouched globe scrolls the page */
{
  const st = await b.stageRect();
  const s0 = await state();
  await swipe(st.x + st.w / 2, st.y + st.h * 0.7, 0, -250);
  await sleep(600);
  const s1 = await state();
  R.swipeUntouched = { scrolled: s1.sy - s0.sy, altChanged: s1.alt !== s0.alt };
}
/* Tap a list entry (TU Delft): the dive to street level on a phone */
{
  const p = await b.evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => /TU Delft/.test(a.textContent)); a.scrollIntoView({ block: 'center' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  const r = await record(b, 's4b-phone-nl-delft', 8000, async () => { await b.tap(p.x, p.y); }, { sheet: 8, cols: 4, clipStage: false });
  R.phoneDive = { fs: r.frameStats, firstCloseMs: r.firstCloseMs, maxZ: r.maxZ, hints: r.hints, kb: r.bytes.totalKB, end: await state() };
  R.phoneDive.layout = await b.evaluate(`(() => { const s = document.querySelector('.world__stage').getBoundingClientRect(); const c = document.querySelector('.world__card:not([hidden])'); const pin = document.querySelector('.world__pin[data-place="nl-tudelft"] .world__pin-dot') || document.querySelector('.world__pin:not([hidden]) .world__pin-dot');
    const cr = c?.getBoundingClientRect(); const pr = pin?.getBoundingClientRect();
    return { stageTop: Math.round(s.top), stageBottom: Math.round(s.bottom), vh: innerHeight, card: cr && { top: Math.round(cr.top), bottom: Math.round(cr.bottom), h: Math.round(cr.height), scrolls: c.scrollHeight > c.clientHeight + 1 }, pinY: pr && Math.round(pr.top), pinAboveCard: pr && cr ? pr.bottom < cr.top : null }; })()`);
  await b.shot('s4b-phone-nl-delft-street');
}
/* In the close map: one finger up the page scrolls it (cooperative gestures); a one-finger sideways drag? two fingers pan. */
{
  const st = await b.stageRect();
  await b.evaluate(`scrollTo(0, document.querySelector('.world__stage').getBoundingClientRect().top + scrollY - 80)`); await sleep(400);
  const st2 = await b.stageRect();
  const s0 = await state();
  await swipe(st2.x + st2.w * 0.5, st2.y + st2.h * 0.75, 0, -200);
  await sleep(700);
  const s1 = await state();
  R.closeOneFinger = { scrolled: s1.sy - s0.sy, zoomBefore: s0.zoom, zoomAfter: s1.zoom, coopNotice: await b.evaluate(`document.querySelector('.maplibregl-cooperative-gesture-screen')?.className || null`) };
  await b.shot('s4c-phone-close-one-finger');
  /* Pinch out with two fingers */
  const cx = st2.x + st2.w / 2, cy = st2.y + st2.h / 2;
  await b.evaluate(`scrollTo(0, document.querySelector('.world__stage').getBoundingClientRect().top + scrollY - 80)`); await sleep(400);
  const s2 = await state();
  await b.touch('touchStart', [{ x: cx - 80, y: cy, id: 0 }, { x: cx + 80, y: cy, id: 1 }]);
  for (let k = 1; k <= 12; k++) { await b.touch('touchMove', [{ x: cx - 80 + k * 5, y: cy, id: 0 }, { x: cx + 80 - k * 5, y: cy, id: 1 }]); await sleep(16); }
  await b.touch('touchEnd', []);
  await sleep(1200);
  const s3 = await state();
  R.closePinch = { zoomBefore: s2.zoom, zoomAfter: s3.zoom, sy: [s2.sy, s3.sy] };
}
/* Reset from the phone */
{
  await b.evaluate(`document.querySelector('.world__controls button:last-child').click()`);
  await sleep(3000);
  R.afterReset = await state();
  await b.shot('s4d-phone-after-reset');
}
/* Tap a group on /programmes/ */
await b.open('/programmes/', PH);
await b.globeReady(); await sleep(1000);
{
  const cl = await b.evaluate(`(() => { const c = [...document.querySelectorAll('.world__cluster:not([hidden])')].sort((a, b) => (b._members?.length || 0) - (a._members?.length || 0))[0]; const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, n: c.textContent }; })()`);
  const r = await record(b, 's4e-phone-programmes-group', 7000, async () => { await b.tap(cl.x, cl.y); }, { sheet: 8, cols: 4, clipStage: false });
  R.phoneGroup = { cl, fs: r.frameStats, end: await state(), clusters: await b.evaluate(`[...document.querySelectorAll('.world__cluster:not([hidden])')].map(c => c.textContent)`), pins: await b.evaluate(`[...document.querySelectorAll('.world__pin:not([hidden])')].map(p => p.textContent)`) };
  await b.shot('s4e-phone-programmes-group-after');
  await sleep(4500);
  R.phoneGroup.releasedAfter4s = await b.evaluate(`document.querySelector('.world__stage').dataset.engaged !== 'true'`);
}
R.logs = b.logs.filter((l) => !/READ-usage|Expected value to be of type number/.test(l));
await fs.writeFile(new URL('./s4-phone.json', import.meta.url), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
b.close(); process.exit(0);
