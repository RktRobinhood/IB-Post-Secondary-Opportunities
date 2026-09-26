/* Deadlines round-1 critic captures. ORIGIN=http://localhost:4350 BASEPATH= node shoot.mjs */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const b = await launch({ gpu: false, port: 9371 });
const DESK = { width: 1280, height: 800 };
const PHONE = { width: 390, height: 844, mobile: true, dpr: 1 };
const pages = [
  ['dk-sdu', '/universities/dk-sdu/'],
  ['dk-prog', '/programmes/dk-sdu-computer-science-2027-autumn/'],
  ['nl-tudelft', '/universities/nl-tudelft/'],
  ['nl-maastricht', '/universities/nl-maastricht/'],
  ['nl-leiden', '/universities/nl-leiden/'],
  ['gb-ucl', '/universities/gb-ucl/'],
  ['fi-aalto', '/universities/fi-aalto/'],
  ['timeline', '/timeline/'],
  ['timeline-dk', '/timeline/?destinations=dk'],
  ['timeline-nl', '/timeline/?destinations=nl'],
];
const report = {};
const T = (pr, ms = 20000, what = '') => Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout ' + what)), ms))]);
const shot = async (name) => { await sleep(500); const r = await T(b.send('Page.captureScreenshot', { format: 'jpeg', quality: 80 }), 20000, name); await fs.writeFile(new URL('./' + name + '.jpg', import.meta.url), Buffer.from(r.data, 'base64')); console.log(' ', name); };
const only = process.argv[2] ? process.argv[2].split(',') : null;
const probe = `(() => {
  const p = document.querySelector('.dates-panel');
  const r = p?.getBoundingClientRect();
  const main = document.querySelector('main');
  const h1 = document.querySelector('h1')?.getBoundingClientRect();
  return {
    overflowX: document.documentElement.scrollWidth - innerWidth,
    docH: document.documentElement.scrollHeight,
    panel: p ? { tag: p.tagName, top: Math.round(r.top + scrollY), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height),
      text: p.innerText.split(String.fromCharCode(10)).filter(Boolean).join(' | ').slice(0, 1600),
      items: p.querySelectorAll('li').length,
      head: p.querySelectorAll('[data-dates-head] li').length } : null,
    h1Top: h1 ? Math.round(h1.top + scrollY) : null,
    cards: document.querySelectorAll('.timeline__item, .tl-card, [data-event], .timeline li').length,
    mainText: (document.querySelector('main')?.innerText || '').slice(0, 1400).split(String.fromCharCode(10)).filter(Boolean).join(' | '),
    small: [...document.querySelectorAll('.dates-panel summary, .dates-panel a')].map(a => { const q = a.getBoundingClientRect(); return [a.textContent.trim().slice(0,30), Math.round(q.width), Math.round(q.height)]; }).filter(x => x[2] && x[2] < 24).slice(0, 12),
  };
})()`;
for (const [name, route] of pages) {
  if (only && !only.includes(name)) continue;
  try {
  for (const [vp, opt] of [['desk', DESK], ['phone', PHONE]]) {
    await T(b.open(route, opt), 15000, 'open ' + name).catch((e) => console.log(e.message)); await sleep(900);
    report[`${name}-${vp}`] = await b.evaluate(probe);
    await shot(`${name}-${vp}-top`);
    const has = await b.evaluate(`!!document.querySelector('.dates-panel')`);
    if (has) {
      await b.evaluate(`(() => { const p = document.querySelector('.dates-panel'); scrollTo(0, p.getBoundingClientRect().top + scrollY - 12); })()`);
      await shot(`${name}-${vp}-panel`);
      /* open everything */
      await b.evaluate(`document.querySelectorAll('.dates-panel details').forEach(d => d.open = true)`);
      await b.evaluate(`(() => { const p = document.querySelector('.dates-panel'); scrollTo(0, p.getBoundingClientRect().top + scrollY - 12); })()`);
      await shot(`${name}-${vp}-open`);
    }
  }
  } catch (e) { console.log('FAIL', name, e.message); }
}
await fs.writeFile(new URL('./probe' + (only ? '-' + only.join('_') : '') + '.json', import.meta.url), JSON.stringify({ report, logs: b.logs }, null, 1));
b.close(); process.exit(0);
