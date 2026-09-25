/* What blocks the main thread during a first dive? CPU profile of /programmes/ -> Delft (fresh profile), bucketed per 100 ms. */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const route = process.argv[2] || '/programmes/';
const re = process.argv[3] || '/Delft/';
const b = await launch({ port: 9375 });
await b.open(route);
await b.globeReady(); await sleep(3000);
await b.send('Profiler.enable');
await b.send('Profiler.setSamplingInterval', { interval: 500 });
const p = await b.evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => ${re}.test(a.textContent)); a.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
await sleep(300);
await b.mouse('mouseMoved', p.x, p.y, { button: 'none' }); await sleep(300);
await b.startFrames();
await b.send('Profiler.start');
await b.click(p.x, p.y);
await sleep(6000);
const { profile } = await b.send('Profiler.stop');
const fr = await b.stopFrames();
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const parent = new Map();
for (const n of profile.nodes) for (const c of n.children || []) parent.set(c, n.id);
const label = (id) => { const cf = byId.get(id).callFrame; return `${cf.functionName || '(anon)'} ${cf.url.split('/').pop()}:${cf.lineNumber}`; };
/* For each sample, self frame plus the nearest ancestor from our own code (globe.js / globe-close.js) or maplibre */
const own = (id) => { let cur = id; while (cur != null) { const u = byId.get(cur).callFrame.url; if (/globe(-close)?\.js/.test(u)) return label(cur); cur = parent.get(cur); } return null; };
let t = 0; const buckets = new Map();
for (let i = 0; i < profile.samples.length; i++) {
  t += (profile.timeDeltas[i] || 0) / 1000;
  const id = profile.samples[i];
  const l = label(id);
  if (/\(idle\)|\(program\)|\(root\)/.test(l)) continue;
  const k = Math.floor(t / 100) * 100;
  const bk = buckets.get(k) || { busy: 0, fn: new Map() };
  const d = (profile.timeDeltas[i + 1] || 0.5) / 1000;
  bk.busy += d;
  const key = l + (own(id) ? '  <- ' + own(id) : '');
  bk.fn.set(key, (bk.fn.get(key) || 0) + d);
  buckets.set(k, bk);
}
const hot = [...buckets.entries()].filter(([, v]) => v.busy > 60).map(([k, v]) => ({ at: k, busy: Math.round(v.busy), top: [...v.fn.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f, ms]) => `${Math.round(ms)}ms ${f}`) }));
const R = { route, re, long: fr.long, hot };
await fs.writeFile(new URL(`./s12-dive-profile${route.replace(/\//g, '_')}.json`, import.meta.url), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
b.close(); process.exit(0);
