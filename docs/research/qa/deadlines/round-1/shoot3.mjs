/* Extra captures: a named item inside an opened panel. */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const b = await launch({ gpu: false, port: 9373 });
const T = (pr, ms = 20000) => Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
const shot = async (name) => { await sleep(500); const r = await T(b.send('Page.captureScreenshot', { format: 'jpeg', quality: 80 })); await fs.writeFile(new URL('./' + name + '.jpg', import.meta.url), Buffer.from(r.data, 'base64')); console.log(name); };
for (const [name, route, text, opt] of [
  ['bug-dk-accept-phone', '/universities/dk-sdu/', 'Accept your place', { width: 390, height: 844, mobile: true }],
  ['bug-nl-maastricht-twins-desk', '/universities/nl-maastricht/', 'ranking number', { width: 1280, height: 800 }],
  ['bug-nl-tudelft-1may-phone', '/universities/nl-tudelft/', 'everything else', { width: 390, height: 844, mobile: true }],
]) {
  await T(b.open(route, opt), 15000).catch(() => {}); await sleep(900);
  await b.evaluate(`(() => { document.querySelectorAll('.dates-panel details.dates-panel__all').forEach(d => d.open = true);
    const li = [...document.querySelectorAll('.dates-panel li')].find(l => l.innerText.includes(${JSON.stringify(text)}));
    scrollTo(0, li.getBoundingClientRect().top + scrollY - 260); })()`);
  await shot(name);
}
b.close(); process.exit(0);
