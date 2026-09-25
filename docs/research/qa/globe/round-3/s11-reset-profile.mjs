/* What is the ~1.3 s long task when Reset is pressed at street level? A CPU profile of the Reset, twice. */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9374 });
const R = { runs: [] };
const st = () => b.g('return { alt: +g.view.alt.toFixed(4), close: g.close.active, zoom: g.close.zoom && +g.close.zoom.toFixed(2) };');
await b.open('/destinations/nl/');
await b.globeReady(); await sleep(800);
await b.send('Profiler.enable');
await b.send('Profiler.setSamplingInterval', { interval: 500 });
for (let run = 0; run < 2; run++) {
  const p = await b.evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => /TU Delft/.test(a.textContent)); a.scrollIntoView({ block: 'nearest', behavior: 'instant' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await sleep(300);
  await b.click(p.x, p.y);
  for (let i = 0; i < 80; i++) { const s = await st(); if (s.close && s.zoom > 14.9) break; await sleep(200); }
  await sleep(3000);
  const reset = await b.evaluate(`(() => { const e = document.querySelector('.world__btn[aria-label="Reset"]') || document.querySelector('.world__controls button:last-child'); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await b.startFrames();
  await b.send('Profiler.start');
  await b.click(reset.x, reset.y);
  await sleep(4000);
  const { profile } = await b.send('Profiler.stop');
  const fr = await b.stopFrames();
  /* self time by function */
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const self = new Map();
  const dt = profile.timeDeltas;
  for (let i = 0; i < profile.samples.length; i++) {
    const n = byId.get(profile.samples[i]);
    const cf = n.callFrame;
    const key = `${cf.functionName || '(anon)'} ${cf.url.split('/').pop()}:${cf.lineNumber}`;
    self.set(key, (self.get(key) || 0) + (dt[i] || 0) / 1000);
  }
  /* inclusive time for maplibre vs globe vs other, per 100 ms bucket around the long task */
  const top = [...self.entries()].filter(([k]) => !/\(idle\)|\(program\)/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 18).map(([k, v]) => `${Math.round(v)} ms  ${k}`);
  const byFile = {};
  for (const [k, v] of self) { const f = k.split(' ').pop().split(':')[0] || '(native)'; byFile[f] = (byFile[f] || 0) + v; }
  R.runs.push({ long: fr.long, max: fr.max, top, byFile: Object.fromEntries(Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => [k, Math.round(v)])), end: await st() });
  await sleep(1500);
}
await fs.writeFile(new URL('./s11-reset-profile.json', import.meta.url), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
b.close(); process.exit(0);
