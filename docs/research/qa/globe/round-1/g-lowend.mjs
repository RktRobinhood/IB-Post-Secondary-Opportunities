/* A pessimistic school laptop: software GL (SwiftShader) and a 4x slower CPU. */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9349, gpu: false });
const { evaluate, mouse, G } = b;
const R = {};
R.renderer = await evaluate(`(() => { const c = document.createElement('canvas').getContext('webgl'); const d = c.getExtension('WEBGL_debug_renderer_info'); return c.getParameter(d.UNMASKED_RENDERER_WEBGL); })()`);
await b.send('Emulation.setCPUThrottlingRate', { rate: 4 });
const probe = (ms) => evaluate(`new Promise(r => { const t = []; const t0 = performance.now(); (function f(n) { t.push(n); if (n - t0 < ${ms}) requestAnimationFrame(f); else { const d = t.slice(1).map((x, i) => x - t[i]).sort((a, b) => a - b); r({ frames: d.length, p50: +d[Math.floor(d.length * .5)].toFixed(1), p95: +d[Math.floor(d.length * .95)].toFixed(1), max: +d[d.length - 1].toFixed(1) }); } })(t0); })`);
await b.open('/europe/');
R.navToGlobeOn = await evaluate(`(async () => { const f = document.querySelector('.world'); const s = f.querySelector('.world__stage'); scrollTo(0, s.getBoundingClientRect().top + scrollY - 90); for (let i = 0; i < 1000 && f.dataset.globe !== 'on'; i++) await new Promise(r => setTimeout(r, 20)); return Math.round(performance.now()); })()`);
await sleep(500);
R.idleSpin = await probe(2000);
R.drawMsIdle = await evaluate(`(async () => (${G}).drawMs)()`);
const st = await b.stageRect();
// dive into Portugal via its list entry
R.divePortugal = await evaluate(`(async () => { const g = ${G}; const p = g.places.find(p => p.id === 'pt'); g.goToPlace(p); return 1; })()`).then(() => probe(3000));
R.drawMsDive = await evaluate(`(async () => (${G}).drawMs)()`);
// drag spin
const mx = st.x + st.w / 2, my = st.y + st.h / 2;
await mouse('mouseMoved', mx, my, { button: 'none' }); await mouse('mousePressed', mx, my);
const dragP = probe(900);
for (let i = 1; i <= 25; i++) { await mouse('mouseMoved', mx - i * 12, my); await sleep(16); }
await mouse('mouseReleased', mx - 300, my);
R.drag = await dragP;
R.heapMB = await evaluate(`Math.round(performance.memory.usedJSHeapSize / 1048576)`);
// time the 50m borders parse + build
R.fineBuild = await evaluate(`(async () => { const t0 = performance.now(); const d = await (await fetch('/assets/geo/borders-50m.json')).json(); const t1 = performance.now(); return { fetchParseMs: Math.round(t1 - t0), countries: d.countries?.length }; })()`);
R.logs = b.logs;
console.log(JSON.stringify(R, null, 1));
await fs.writeFile(new URL('./g-lowend.json', import.meta.url), JSON.stringify(R, null, 1));
b.close(); process.exit(0);
