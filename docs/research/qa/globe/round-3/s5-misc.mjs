/* Flat fallback, software GL, dark theme at street level, reduced motion, card link opens a new tab. */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const R = {};
{
  const b = await launch({ port: 9368 });
  await b.open('/programmes/', { query: '?map=flat' });
  R.flat = await b.globeReady();
  await b.shot('s5-flat');
  /* Dark theme, a dive to street level */
  await b.open('/destinations/nl/', { dark: true });
  await b.evaluate(`document.documentElement.setAttribute('data-theme','dark')`);
  await b.globeReady(); await sleep(1500);
  await b.shot('s5-dark-nl-rest');
  const p = await b.evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => /Leiden/.test(a.textContent)); a.scrollIntoView({ block: 'nearest', behavior: 'instant' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await sleep(300);
  await b.click(p.x, p.y);
  for (let i = 0; i < 60; i++) { const z = await b.g('return g.close.active && g.close.zoom;'); if (z > 14.7) break; await sleep(200); }
  await sleep(2500);
  await b.shot('s5-dark-leiden-street');
  /* The card's action: a real click opens a new tab and leaves this page */
  const before = (await (await fetch('http://127.0.0.1:9368/json/list')).json()).filter((t) => t.type === 'page').length;
  const go = await b.evaluate(`(() => { const a = document.querySelector('.world__card:not([hidden]) a'); if (!a) return null; const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, href: a.href, target: a.target }; })()`);
  const url0 = await b.evaluate('location.href');
  if (go) { await b.click(go.x, go.y); await sleep(1500); }
  const after = (await (await fetch('http://127.0.0.1:9368/json/list')).json()).filter((t) => t.type === 'page');
  R.cardLink = { go, newTabs: after.length - before, stayed: (await b.evaluate('location.href')) === url0, tabs: after.map((t) => t.url).slice(0, 4) };
  /* Reduced motion on /europe/: a list click lands at once */
  await b.open('/europe/', { reduced: true });
  await b.globeReady(); await sleep(800);
  const q = await b.evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => /Greece/.test(a.textContent)); a.scrollIntoView({ block: 'nearest', behavior: 'instant' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await sleep(200);
  const v0 = await b.g('return { ...g.view };');
  await b.click(q.x, q.y);
  await sleep(120);
  R.reduced = { before: v0, after120ms: await b.g('return { ...g.view };'), card: await b.evaluate(`document.querySelector('.world__card:not([hidden]) h3')?.textContent || null`) };
  await b.shot('s5-reduced-greece');
  R.logs = b.logs.filter((l) => !/READ-usage|Expected value to be of type number/.test(l));
  b.close();
}
{
  /* Software GL: the flat map should take over */
  const b = await launch({ port: 9369, gpu: false });
  await b.open('/europe/');
  R.software = { globe: await b.globeReady(), why: await b.evaluate(`document.querySelector('.world').dataset.globeOff || null`) };
  b.close();
}
await fs.writeFile(new URL('./s5-misc.json', import.meta.url), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
process.exit(0);
