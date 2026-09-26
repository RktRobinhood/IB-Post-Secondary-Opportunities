/* Extra captures: timeline "Next up" lists. */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const b = await launch({ gpu: false, port: 9372 });
const T = (pr, ms = 20000) => Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
const shot = async (name) => { await sleep(500); const r = await T(b.send('Page.captureScreenshot', { format: 'jpeg', quality: 80 })); await fs.writeFile(new URL('./' + name + '.jpg', import.meta.url), Buffer.from(r.data, 'base64')); console.log(name); };
const out = {};
for (const [name, route] of [['timeline', '/timeline/'], ['timeline-dk', '/timeline/?destinations=dk']]) {
  for (const [vp, opt] of [['desk', { width: 1280, height: 800 }], ['phone', { width: 390, height: 844, mobile: true }]]) {
    await T(b.open(route, opt), 15000).catch(() => {}); await sleep(900);
    await b.evaluate(`(() => { const n = document.getElementById('cal-next'); const h = n.previousElementSibling || n; scrollTo(0, h.getBoundingClientRect().top + scrollY - 80); })()`);
    await shot(`${name}-${vp}-nextup`);
    out[`${name}-${vp}`] = await b.evaluate(`[...document.querySelectorAll('#cal-next li')].map(li => li.innerText.split(String.fromCharCode(10)).filter(Boolean).slice(0,4).join(' / ')).slice(0,10)`);
  }
}
await fs.writeFile(new URL('./probe-nextup.json', import.meta.url), JSON.stringify(out, null, 1));
b.close(); process.exit(0);
