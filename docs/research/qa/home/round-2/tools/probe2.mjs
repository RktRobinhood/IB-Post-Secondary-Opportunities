import { launch, sleep } from './cdp.mjs';
const b = await launch({ gpu: true, port: 9393 });
for (const o of [{ width: 1280, height: 800 }, { width: 390, height: 844, mobile: true, dpr: 2 }]) {
await b.open('/', o); await sleep(2500);
console.log(await b.evaluate(`(async () => { const d = document.getElementById('discover-more'); const s = d.querySelector('summary'); const r0 = { open: d.open, h: document.documentElement.scrollHeight, inner: d.innerHTML.length, cls: d.className, parent: d.parentElement.className };
  s.click(); await new Promise(r => setTimeout(r, 800)); const r1 = { open: d.open, h: document.documentElement.scrollHeight };
  s.click(); await new Promise(r => setTimeout(r, 800)); const r2 = { open: d.open, h: document.documentElement.scrollHeight };
  d.open = true; await new Promise(r => setTimeout(r, 800)); const r3 = { open: d.open, h: document.documentElement.scrollHeight, summaryShown: !!s.getClientRects().length };
  return JSON.stringify({ r0, r1, r2, r3, head: d.outerHTML.slice(0, 300) }); })()`));
}
b.close(); process.exit(0);
