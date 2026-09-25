import { launch, sleep } from './cdp.mjs';
const b = await launch({ port: 9370 });
await b.open('/destinations/nl/', { width: 390, height: 844, mobile: true, dpr: 2 });
await b.globeReady();
for (let i = 0; i < 40; i++) { if (await b.g('return g.close.active;')) break; await sleep(250); }
await sleep(1500);
console.log(JSON.stringify(await b.evaluate(`(() => { const btns = [...document.querySelectorAll('.maplibregl-ctrl-attrib-button')]; const at = document.querySelector('.maplibregl-ctrl-attrib'); const s = document.querySelector('.world__stage').getBoundingClientRect(); const ar = at.getBoundingClientRect();
  return { buttons: btns.length, closeMaps: document.querySelectorAll('.world__close').length, cls: at.className, attribShareOfStage: +((ar.width * ar.height) / (s.width * s.height)).toFixed(2), btn: btns.map(b => { const c = getComputedStyle(b); return { w: c.width, h: c.height, minW: c.minWidth, repeat: c.backgroundRepeat, bgSize: c.backgroundSize }; }) }; })()`), null, 1));
b.close(); process.exit(0);
