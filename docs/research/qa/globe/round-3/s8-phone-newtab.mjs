/* Does a tap on a map list entry on a phone open a new tab as well as flying? */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9380 });
const R = {};
const PH = { width: 390, height: 844, mobile: true, dpr: 2 };
const tabs = async () => (await (await fetch('http://127.0.0.1:9380/json/list')).json()).filter(t => t.type === 'page').map(t => t.url);
for (const [route, re, mobile] of [['/destinations/nl/', /Leiden/, true], ['/destinations/nl/', /Leiden/, false], ['/programmes/', /Aarhus/, true]]) {
  await b.open(route, mobile ? PH : {});
  await b.globeReady(); await sleep(1200);
  await b.evaluate(`window.__clicks = []; document.addEventListener('click', e => { const a = e.target.closest('a'); window.__clicks.push({ tag: e.target.tagName, href: a && a.href, target: a && a.target, prevented: e.defaultPrevented }); }, false); 1`);
  const p = await b.evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => ${re}.test(a.textContent)); a.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await sleep(300);
  const t0 = await tabs();
  if (mobile) await b.tap(p.x, p.y); else await b.click(p.x, p.y);
  await sleep(2500);
  const t1 = await tabs();
  R[route + (mobile ? ' phone' : ' desktop')] = { pagesBefore: t0.length, pagesAfter: t1.length, clicks: await b.evaluate('window.__clicks'), hash: await b.evaluate('location.hash'), card: await b.evaluate(`document.querySelector('.world__card:not([hidden]) h3')?.textContent || null`) };
}
await fs.writeFile(new URL('./s8-phone-newtab.json', import.meta.url), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
b.close(); process.exit(0);
