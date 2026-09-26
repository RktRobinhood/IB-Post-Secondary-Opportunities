/* Deadlines round-3 critic captures. ORIGIN=http://localhost:4380 BASEPATH= node shoot.mjs [names] */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const b = await launch({ gpu: false, port: 9383 });
const DESK = { width: 1280, height: 800 }, PHONE = { width: 390, height: 844, mobile: true, dpr: 1 };
const pages = [
  ['is-hi', '/universities/is-hi/'], ['is-lhi', '/universities/is-lhi/'], ['gb-ual', '/universities/gb-ual/'],
  ['ch-eth', '/universities/ch-eth/'], ['fi-uh', '/universities/fi-uh/'], ['ca-ubc', '/universities/ca-ubc/'],
  ['us-mit', '/universities/us-mit/'], ['dk-sdu', '/universities/dk-sdu/'], ['nl-tu-e', '/universities/nl-tu-e/'],
  ['us-harvard', '/universities/us-harvard/'], ['it-polimi', '/universities/it-polimi/'],
  ['timeline', '/timeline/'], ['timeline-ch', '/timeline/?destinations=ch'],
];
const only = process.argv[2] ? process.argv[2].split(',') : null;
const report = {};
const T = (pr, ms, w) => Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout ' + w)), ms))]);
const probe = `(() => {
  const p = document.querySelector('.dates-panel'); if (!p) return { none: true, overflowX: document.documentElement.scrollWidth - innerWidth, h1: document.querySelector('h1')?.innerText };
  const r = p.getBoundingClientRect();
  const vis = (el) => { const q = el.getBoundingClientRect(); return q.height > 0 && q.width > 0 && getComputedStyle(el).visibility !== 'hidden' && !el.closest('details:not([open]) > :not(summary)'); };
  const items = [...p.querySelectorAll('li')].filter(vis);
  return { overflowX: document.documentElement.scrollWidth - innerWidth, top: Math.round(r.top + scrollY), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height),
    itemsH: items.map(l => Math.round(l.getBoundingClientRect().height)),
    visible: items.map(l => l.innerText.split(String.fromCharCode(10)).filter(Boolean).slice(0,3).join(' / ').slice(0,150)),
    text: p.innerText.split(String.fromCharCode(10)).filter(Boolean).join(' | ').slice(0, 1500) };
})()`;
for (const [name, route] of pages) {
  if (only && !only.includes(name)) continue;
  for (const [vp, opt] of [['desk', DESK], ['phone', PHONE]]) {
    try {
      await T(b.open(route, opt), 20000, 'open').catch(e => console.log(e.message)); await sleep(900);
      report[`${name}-${vp}`] = await b.evaluate(probe);
      const has = await b.evaluate(`!!document.querySelector('.dates-panel')`);
      if (has) {
        await b.evaluate(`(() => { const p = document.querySelector('.dates-panel'); scrollTo(0, p.getBoundingClientRect().top + scrollY - 8); })()`);
        await b.shot(`${name}-${vp}-panel`, { fmt: 'jpeg' });
      } else await b.shot(`${name}-${vp}-top`, { fmt: 'jpeg' });
    } catch (e) { console.log('FAIL', name, vp, e.message); }
  }
}
await fs.writeFile(new URL('./probe' + (only ? '-' + only.join('_') : '') + '.json', import.meta.url), JSON.stringify({ report, logs: b.logs }, null, 1));
b.close(); process.exit(0);
