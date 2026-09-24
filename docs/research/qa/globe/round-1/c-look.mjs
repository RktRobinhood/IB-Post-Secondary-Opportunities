/* Looks: the dive as a strip of frames, anisotropic A/B, clouds up close,
   phone, dark, reduced motion, flat, and the list-click scroll. */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9345, gpu: true });
const { evaluate, shot, G, mouse } = b;
const R = {};
const click = async (x, y) => { await mouse('mouseMoved', x, y, { button: 'none' }); await mouse('mousePressed', x, y); await mouse('mouseReleased', x, y); };

// 1. Dive strip: from /programmes/ rest into the Netherlands, stepped.
await b.open('/programmes/');
await b.globeReady();
await evaluate(`(async () => { const g = ${G}; g.goToCountry(g.country('nl')); g.pause(); return 1; })()`);
for (const f of [0.15, 0.35, 0.5, 0.6, 0.7, 0.8, 0.9, 1]) {
  await evaluate(`(async () => { const g = ${G}; g.stepTo(${f}); return 1; })()`);
  await sleep(100);
  const st = await b.stageRect();
  await b.shot(`c-dive-${String(Math.round(f * 100)).padStart(3, '0')}`, { x: st.x, y: st.y, width: st.w, height: st.h });
}
await evaluate(`(async () => { const g = ${G}; g.resume(); return 1; })()`);
// And from /europe/ rest (a far start) into Denmark
await b.open('/europe/');
await b.globeReady();
R.europeDive = await evaluate(`(async () => { const g = ${G}; const from = { ...g.view }; g.goToCountry(g.country('dk')); g.pause(); return { from }; })()`);
for (const f of [0.55, 0.65, 0.75, 0.85]) {
  await evaluate(`(async () => { const g = ${G}; g.stepTo(${f}); return 1; })()`);
  await sleep(100);
  const st = await b.stageRect();
  await b.shot(`c-dive-eu-dk-${String(Math.round(f * 100)).padStart(3, '0')}`, { x: st.x, y: st.y, width: st.w, height: st.h });
}

// 2. Clouds up close at /world/ rest (crop, 1:1)
await b.open('/world/');
await b.globeReady();
await evaluate(`(async () => { const g = ${G}; g.pause(); return 1; })()`);
let st = await b.stageRect();
await b.shot('c-world-clouds-crop', { x: st.x + 350, y: st.y + 150, width: 480, height: 300 });
// At DPR 2 (a retina laptop / phone)
await b.open('/world/', { dpr: 2 });
await b.globeReady();
await evaluate(`(async () => { const g = ${G}; g.pause(); return 1; })()`);
st = await b.stageRect();
await b.shot('c-world-clouds-crop-dpr2', { x: st.x + 350, y: st.y + 150, width: 480, height: 300 });

// 3. Anisotropic filtering A/B: patch texParameteri before the globe loads
for (const aniso of [false, true]) {
  await b.open('/programmes/');
  if (aniso) {
    R.anisoMax = await evaluate(`(() => { const P = WebGLRenderingContext.prototype; const orig = P.texParameteri; let max = 0;
      P.texParameteri = function (t, p, v) { orig.call(this, t, p, v); if (p === this.TEXTURE_MIN_FILTER && v === this.LINEAR_MIPMAP_LINEAR) { const e = this.getExtension('EXT_texture_filter_anisotropic'); if (e) { max = this.getParameter(e.MAX_TEXTURE_MAX_ANISOTROPY_EXT); this.texParameterf(t, e.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max)); } } };
      return 'patched'; })()`);
  }
  await b.globeReady();
  await evaluate(`(async () => { const g = ${G}; g.pause(); return 1; })()`);
  st = await b.stageRect();
  await b.shot(`c-aniso-${aniso ? 'on' : 'off'}`, { x: st.x, y: st.y, width: st.w, height: st.h });
}

// 4. Phone: /programmes/ and /world/, a tap, then does the page still scroll with a finger on the globe?
await b.open('/programmes/', { width: 390, height: 844, mobile: true, dpr: 2 });
await b.globeReady();
await sleep(400);
await b.shot('c-phone-programmes');
await b.open('/world/', { width: 390, height: 844, mobile: true, dpr: 2 });
await b.globeReady();
await sleep(400);
await b.shot('c-phone-world');
R.phoneWorld = await evaluate(`(async () => { const g = ${G}; return { view: { ...g.view }, visible: g.places.filter(p => !p.node.hidden).map(p => p.id) }; })()`);
// tap a pin on the phone, then look at the card
const pin = await evaluate(`(() => { const n = [...document.querySelectorAll('.world__pin')].find(n => !n.hidden); const r = n.querySelector('.world__pin-dot').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, id: n.dataset.place }; })()`);
await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pin.x, y: pin.y }] });
await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await sleep(2800);
R.phoneTap = { pin: pin.id, card: await evaluate(`document.querySelector('.world__card:not([hidden]) h3')?.textContent || null`), touchAction: await evaluate(`document.querySelector('.world__stage').style.touchAction`) };
await b.shot('c-phone-world-tap');
R.phoneCardBox = await evaluate(`(() => { const c = document.querySelector('.world__card:not([hidden])'); const s = document.querySelector('.world__stage'); if (!c) return null; const a = c.getBoundingClientRect(), z = s.getBoundingClientRect(); return { card: [Math.round(a.width), Math.round(a.height)], stage: [Math.round(z.width), Math.round(z.height)], coverPct: Math.round(100 * a.width * a.height / (z.width * z.height)) }; })()`);

// 5. Dark theme /europe/
await b.open('/europe/', { dark: true });
await evaluate(`document.documentElement.setAttribute('data-theme', 'dark')`);
await b.globeReady();
await evaluate(`(async () => { const g = ${G}; g.pause(); return 1; })()`);
await b.shot('c-europe-dark');

// 6. Reduced motion: list click is instant, no rush, no idle
await b.open('/europe/', { reduced: true });
await b.globeReady();
R.reduced = await evaluate(`(async () => { const g = ${G}; const v0 = { ...g.view }; await new Promise(r => setTimeout(r, 1000)); const idleMoved = Math.abs(g.view.lon - v0.lon) > 1e-6;
  const a = [...document.querySelectorAll('.world__list a')].find(a => /Greece/.test(a.textContent)); a.click(); await new Promise(r => setTimeout(r, 50));
  return { idleMoved, atGreece: Math.round(g.view.lat) + ',' + Math.round(g.view.lon), card: document.querySelector('.world__card:not([hidden]) h3')?.textContent }; })()`);

// 7. ?map=flat
await b.open('/programmes/?map=flat');
R.flat = await b.globeReady();
await b.shot('c-flat');

// 8. The list-click scroll: from the list, where does the stage end up?
await b.open('/programmes/');
await b.globeReady();
const e = await evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => /Odense/.test(a.textContent)); a.scrollIntoView({ block: 'center' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
await sleep(300);
R.scrollBefore = await evaluate(`(() => { const r = document.querySelector('.world__stage').getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; })()`);
await click(e.x, e.y);
const samples = [];
for (let i = 0; i < 12; i++) { await sleep(250); samples.push(await evaluate(`Math.round(document.querySelector('.world__stage').getBoundingClientRect().top)`)); }
R.scrollAfterListClick = samples;
R.mastheadH = await evaluate(`Math.round(document.querySelector('.masthead')?.getBoundingClientRect().height || 0)`);
R.scrollPadding = await evaluate(`getComputedStyle(document.documentElement).scrollPaddingTop`);
await b.shot('c-list-click-scroll');
R.logs = b.logs;
await fs.writeFile(new URL('./c-look.json', import.meta.url), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
b.close(); process.exit(0);
