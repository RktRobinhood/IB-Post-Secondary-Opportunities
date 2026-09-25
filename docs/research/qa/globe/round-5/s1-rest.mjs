import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9371 });
const out = {};
const cfgs = [
  ['desk', { width: 1280, height: 800 }],
  ['desk-dark', { width: 1280, height: 800, dark: true }],
  ['phone', { width: 390, height: 844, mobile: true, dpr: 2 }],
  ['phone-dark', { width: 390, height: 844, mobile: true, dpr: 2, dark: true }],
];
for (const route of ['/', '/countries/', '/destinations/nl/']) {
  for (const [name, o] of cfgs) {
    const key = `${route}|${name}`;
    try {
      await b.open(route, o);
      if (o.dark) await b.evaluate(`document.documentElement.setAttribute('data-theme','dark')`);
      const st = await b.globeReady();
      await sleep(1500);
      await b.startFrames(); await sleep(2500);
      const fr = await b.stopFrames();
      const info = await b.g(`return { view: {...g.view}, rest: g.rest, desk: getComputedStyle(document.querySelector('.world__desk')).display, deskOp: document.querySelector('.world__desk').style.opacity };`);
      const st2 = await b.stageRect();
      out[key] = { globe: st, fr, info, stage: st2 };
      const slug = (route === '/' ? 'home' : route.replace(/\//g, '-').replace(/^-|-$/g, ''));
      await b.shot(`s1-${slug}-${name}-stage`);
      await b.evaluate('scrollTo(0,0)'); await sleep(500);
      await b.shot(`s1-${slug}-${name}-top`);
    } catch (e) { out[key] = { error: String(e) }; }
  }
}
out.logs = b.logs.filter(l => !/READ-usage/.test(l)).slice(0, 60);
await fs.writeFile(new URL('./s1-rest.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1).slice(0, 6000));
b.close(); process.exit(0);
