/* Deadlines round-2 critic captures. ORIGIN=http://localhost:4350 BASEPATH= node shoot.mjs [names] */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const b = await launch({ gpu: false, port: 9381 });
const DESK = { width: 1280, height: 800 };
const PHONE = { width: 390, height: 844, mobile: true, dpr: 1 };
const pages = [
  ['dk-sdu', '/universities/dk-sdu/'],
  ['dk-au', '/universities/dk-au/'],
  ['dk-ucph', '/universities/dk-ucph/'],
  ['dk-sdu-cs', '/programmes/dk-sdu-computer-science-2027-autumn/'],
  ['dk-au-cs', '/programmes/dk-au-computer-science-2027-autumn/'],
  ['nl-tudelft', '/universities/nl-tudelft/'],
  ['nl-tudelft-cse', '/programmes/nl-tudelft-computer-science-and-engineering-2027-autumn/'],
  ['nl-utwente', '/universities/nl-utwente/'],
  ['nl-utwente-tcs', '/programmes/nl-utwente-technical-computer-science-2027-autumn/'],
  ['nl-utwente-at', '/programmes/nl-utwente-advanced-technology-2027-autumn/'],
  ['nl-maastricht', '/universities/nl-maastricht/'],
  ['nl-maastricht-dsai', '/programmes/nl-maastricht-data-science-and-artificial-intelligence-2027-autumn/'],
  ['nl-leiden', '/universities/nl-leiden/'],
  ['gb-ucl', '/universities/gb-ucl/'],
  ['gb-oxford', '/universities/gb-oxford/'],
  ['fi-aalto', '/universities/fi-aalto/'],
  ['fi-uh', '/universities/fi-uh/'],
  ['de-tum', '/universities/de-tum/'],
  ['de-heidelberg', '/universities/de-heidelberg/'],
  ['it-bocconi', '/universities/it-bocconi/'],
  ['it-polimi', '/universities/it-polimi/'],
  ['ca-ubc', '/universities/ca-ubc/'],
  ['us-mit', '/universities/us-mit/'],
  ['timeline', '/timeline/'],
  ['timeline-dk', '/timeline/?destinations=dk'],
  ['timeline-ca', '/timeline/?destinations=ca'],
  ['timeline-gb', '/timeline/?destinations=gb'],
];
const report = {};
const T = (pr, ms = 20000, what = '') => Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout ' + what)), ms))]);
const shot = async (name) => { await sleep(500); const r = await T(b.send('Page.captureScreenshot', { format: 'jpeg', quality: 70 }), 20000, name); await fs.writeFile(new URL('./' + name + '.jpg', import.meta.url), Buffer.from(r.data, 'base64')); console.log(' ', name); };
const only = process.argv[2] ? process.argv[2].split(',') : null;
const probe = (opened) => `(() => {
  const p = document.querySelector('.dates-panel');
  const r = p?.getBoundingClientRect();
  const h1 = document.querySelector('h1')?.getBoundingClientRect();
  const vis = (el) => { const q = el.getBoundingClientRect(); return q.height > 0 && q.width > 0 && getComputedStyle(el).visibility !== 'hidden'; };
  return {
    overflowX: document.documentElement.scrollWidth - innerWidth,
    docH: document.documentElement.scrollHeight,
    panel: p ? { top: Math.round(r.top + scrollY), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height),
      text: p.innerText.split(String.fromCharCode(10)).filter(Boolean).join(' | ').slice(0, ${opened ? 6000 : 1600}),
      visibleItems: [...p.querySelectorAll('li')].filter(vis).map(l => l.innerText.split(String.fromCharCode(10)).filter(Boolean).join(' / ').slice(0,160)).slice(0, 8),
      links: [...p.querySelectorAll('a')].map(a => a.href).filter((v,i,s)=>s.indexOf(v)===i).slice(0,40) } : null,
    h1Top: h1 ? Math.round(h1.top + scrollY) : null,
    mainText: (document.querySelector('main')?.innerText || '').slice(0, 2500).split(String.fromCharCode(10)).filter(Boolean).join(' | '),
    small: [...document.querySelectorAll('.dates-panel summary, .dates-panel a, .cal a, .cal button')].filter(vis).map(a => { const q = a.getBoundingClientRect(); return [a.textContent.trim().slice(0,30), Math.round(q.width), Math.round(q.height)]; }).filter(x => x[2] < 24).slice(0, 12),
  };
})()`;
for (const [name, route] of pages) {
  if (only && !only.includes(name)) continue;
  try {
  for (const [vp, opt] of [['desk', DESK], ['phone', PHONE]]) {
    await T(b.open(route, opt), 15000, 'open ' + name).catch((e) => console.log(e.message)); await sleep(1000);
    report[`${name}-${vp}`] = await b.evaluate(probe(false));
    await shot(`${name}-${vp}-top`);
    const has = await b.evaluate(`!!document.querySelector('.dates-panel')`);
    if (has) {
      await b.evaluate(`(() => { const p = document.querySelector('.dates-panel'); scrollTo(0, p.getBoundingClientRect().top + scrollY - 12); })()`);
      await shot(`${name}-${vp}-panel`);
      await b.evaluate(`document.querySelectorAll('.dates-panel details').forEach(d => d.open = true)`);
      report[`${name}-${vp}-open`] = await b.evaluate(probe(true));
      if (vp === 'phone') { await b.evaluate(`(() => { const p = document.querySelector('.dates-panel'); scrollTo(0, p.getBoundingClientRect().top + scrollY - 12); })()`); await shot(`${name}-${vp}-open`); }
    }
  }
  } catch (e) { console.log('FAIL', name, e.message); }
}
await fs.writeFile(new URL('./probe' + (only ? '-' + only.join('_') : '') + '.json', import.meta.url), JSON.stringify({ report, logs: b.logs }, null, 1));
b.close(); process.exit(0);
