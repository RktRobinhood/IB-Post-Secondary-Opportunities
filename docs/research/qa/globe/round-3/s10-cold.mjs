/* A first-time student: fresh profile, one list click, recorded in real time. Bytes at rest and for the dive.
   node s10-cold.mjs <route> <entryRegex> <name> [phone] */
import { launch, sleep } from './cdp.mjs';
import { record } from './rec.mjs';
import fs from 'node:fs/promises';
const [route, re, name, phone] = process.argv.slice(2);
const port = 9380 + Math.floor(Math.random() * 50);
const b = await launch({ port });
await b.send('Network.setCacheDisabled', { cacheDisabled: false });
const PH = { width: 390, height: 844, mobile: true, dpr: 2 };
await b.open(route, phone ? PH : {});
await b.globeReady(); await sleep(4000);
const rest = b.bytes();
const restGlobe = Object.fromEntries(Object.entries(rest.by).filter(([k]) => /globe|geo\/|js\/(map|globe)|vendor|maplibre|openfreemap|eox/.test(k)));
const p = await b.evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => ${re}.test(a.textContent)); a.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
await sleep(300);
/* A real reader's pointer travels to the entry: hover it for 300 ms first (desktop only) */
if (!phone) { await b.mouse('mouseMoved', p.x - 40, p.y, { button: 'none' }); await sleep(150); await b.mouse('mouseMoved', p.x, p.y, { button: 'none' }); await sleep(300); }
const r = await record(b, name, 9000, async () => { if (phone) await b.tap(p.x, p.y); else await b.click(p.x, p.y); }, { sheet: 16, clipStage: !phone });
const out = { route, name, phone: !!phone, restTotalKB: rest.totalKB, restGlobe, dive: { totalKB: r.bytes.totalKB, by: r.bytes.by }, frameStats: r.frameStats, firstCloseMs: r.firstCloseMs, maxZ: r.maxZ, hints: r.hints, loadingWaitMs: r.loadingWaitMs,
  end: await b.g('return { alt: g.view.alt, close: g.close.active, zoom: g.close.zoom, card: document.querySelector(".world__card:not([hidden]) h3")?.textContent || null };') };
await b.shot(`${name}-end`);
out.logs = b.logs.filter((l) => !/READ-usage|Expected value to be of type number/.test(l));
await fs.writeFile(new URL(`./${name}-summary.json`, import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ ...out, dive: { totalKB: out.dive.totalKB } }, null, 1));
b.close(); process.exit(0);
