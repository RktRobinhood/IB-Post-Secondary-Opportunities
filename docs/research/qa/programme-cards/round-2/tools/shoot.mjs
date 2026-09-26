/* Round-2 art-director shots: card grid on /, SDU family cards, a member page's Paths table, close-ups. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { launch, OUT, sleep } from './cdp.mjs';
let b; let port = 9380;
const VIEWS = [
  ['desktop', { width: 1280, height: 800, dpr: 1, mobile: false }],
  ['phone', { width: 390, height: 844, dpr: 2, mobile: true }],
];
const loadAll = (sel = '.card__backdrop') => b.evaluate(`(async()=>{const h=document.documentElement.scrollHeight;for(let y=0;y<h;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}
  await Promise.all([...document.querySelectorAll('${sel}')].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r;setTimeout(r,6000)})));scrollTo(0,0);return 1})()`);
const rectOf = (sel, i = 0) => b.evaluate(`(()=>{const e=document.querySelectorAll(${JSON.stringify(sel)})[${i}]; if(!e) return null; document.documentElement.style.scrollBehavior='auto'; e.scrollIntoView({block:'start',behavior:'instant'}); scrollBy(0,-12); const r=e.getBoundingClientRect(); return {x:Math.max(0,r.left-8),y:Math.max(0,r.top-8),width:Math.min(innerWidth,r.width+16),height:Math.min(innerHeight*3,r.height+16)}})()`);
async function el(name, sel, i = 0) {
  const r = await b.evaluate(`(()=>{const e=document.querySelectorAll(${JSON.stringify(sel)})[${i}]; if(!e) return null; const r=e.getBoundingClientRect(); return {x:Math.max(0,r.left+scrollX-8),y:Math.max(0,r.top+scrollY-8),width:Math.min(innerWidth,r.width+16),height:Math.min(4000,r.height+16)}})()`);
  if (!r) { console.log('  missing', sel); return; }
  await b.settle();
  const s = await b.send('Page.captureScreenshot', { format: 'jpeg', quality: 85, captureBeyondViewport: true, clip: { ...r, scale: 1 } });
  await fs.writeFile(path.join(OUT, name + '.jpg'), Buffer.from(s.data, 'base64')); console.log('  ' + name);
}
async function full(name, sel, scale) {
  const r = await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(sel)}); const r=e.getBoundingClientRect(); return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height}})()`);
  await b.settle();
  const s = await b.send('Page.captureScreenshot', { format: 'jpeg', quality: 70, captureBeyondViewport: true, clip: { ...r, scale } });
  await fs.writeFile(path.join(OUT, name + '.jpg'), Buffer.from(s.data, 'base64')); console.log('  ' + name, Math.round(r.height) + 'px');
}
const cardIdx = (title) => b.evaluate(`[...document.querySelectorAll('.card')].findIndex(c=>c.querySelector('.card__title')?.textContent.trim()===${JSON.stringify(title)})`);
for (const [vn, v] of VIEWS) for (const scheme of ['light', 'dark']) {
  b = await launch({ gpu: false, port: port++ });
  const dark = scheme === 'dark'; const tag = `${vn}-${scheme}`;
  // Home: first 12, then Show all
  await b.open('/', { ...v, dark }); await sleep(800); console.log('  dark?', await b.evaluate(`matchMedia('(prefers-color-scheme: dark)').matches`));
  await b.evaluate(`document.querySelector('.discover__cards').scrollIntoView({behavior:'instant'})`); await sleep(400); await b.shot(`home-${tag}-first`, { fmt: 'jpeg' });
  await b.evaluate(`document.getElementById('discover-more').open=true`); await loadAll();
  if (vn === 'desktop') await full(`home-${tag}-all`, '.discover', 0.5);
  for (const t of ['Electronics', 'Economics and Business Administration', 'Software Technology Engineering', 'University College Maastricht (Liberal Arts and Sciences)', 'Crafts in Glass and Ceramics', 'Biotechnology']) {
    const i = await cardIdx(t); if (i >= 0) await el(`home-${tag}-card-${t.split(' ')[0].toLowerCase()}`, '.card', i);
  }
  // SDU institution page
  await b.open('/universities/dk-sdu/', { ...v, dark }); await sleep(600); await loadAll();
  if (vn === 'desktop') { const g = await b.evaluate(`!!document.querySelector('.card--backdrop')?.closest('ul,.grid')`); if (g) { await b.evaluate(`document.querySelector('.card--backdrop').closest('ul,.grid').id='__grid'`); await full(`sdu-${tag}-grid`, '#__grid', 0.75); } }
  for (const t of ['Electronics', 'Mechatronics', 'Software Engineering']) { const i = await cardIdx(t); if (i >= 0) await el(`sdu-${tag}-card-${t.split(' ')[0].toLowerCase()}`, '.card', i); }
  // Member programme page: Paths table
  await b.open('/programmes/dk-sdu-electronics-beng-2027-autumn/', { ...v, dark }); await sleep(600);
  await b.shot(`member-${tag}-top`, { fmt: 'jpeg' });
  const hasPaths = await b.evaluate(`!!document.getElementById('paths-title')`);
  if (hasPaths) { await b.evaluate(`document.getElementById('paths-title').closest('section,div').id ||= '__paths'`); const id = await b.evaluate(`document.getElementById('paths-title').closest('section,div').id`); await el(`member-${tag}-paths`, '#' + id); }
  else console.log('  no paths table');
  b.close(); await sleep(500);
}
b = await launch({ gpu: false, port: port++ });
// Other institution grids, desktop light only
for (const inst of ['dk-au', 'nl-tudelft', 'dk-via']) {
  await b.open(`/universities/${inst}/`, { width: 1280, height: 800, dpr: 1 }); await sleep(500); await loadAll();
  await b.evaluate(`(document.querySelector('.card--backdrop')?.closest('ul,.grid')||document.body).id='__grid'`); await full(`${inst}-desktop-light-grid`, '#__grid', 0.75);
}
console.log(b.logs.filter((l) => /error|exception|netfail/i.test(l)).slice(0, 20).join('\n'));
b.close(); process.exit(0);
