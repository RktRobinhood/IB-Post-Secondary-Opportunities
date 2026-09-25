/* Close shots of single home cards by title. ORIGIN=http://localhost:4380 BASEPATH= OUT=D:/ibp-tmp/crit-r3 node cards.mjs */
import { launch, sleep } from './cdp.mjs';
const b = await launch({ gpu: true, port: 9433 });
await b.open('/', { width: 1280, height: 800 }); await sleep(2500);
await b.evaluate(`document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('#discover-more summary').click()`); await sleep(1000);
for (const [name, t, nth] of [['card-twente-creative-tech', 'Creative Technology', 0], ['card-aarhus-cs', 'Computer Science', 0], ['card-multimedia-1', 'Multimedia Design', 0], ['card-multimedia-2', 'Multimedia Design', 1]]) {
  const r = await b.evaluate(`(() => { const a = [...document.querySelectorAll('article.card--backdrop')].filter(a => a.querySelector('.card__title').textContent.trim() === ${JSON.stringify(t)})[${nth}]; a.scrollIntoView({ block: 'center' }); const r = a.getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; })()`);
  await sleep(1200);
  await b.evaluate(`Promise.all([...document.images].filter(i => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 4000); })))`);
  const r2 = await b.evaluate(`(() => { const a = [...document.querySelectorAll('article.card--backdrop')].filter(a => a.querySelector('.card__title').textContent.trim() === ${JSON.stringify(t)})[${nth}]; const r = a.getBoundingClientRect(); return { x: r.left - 4, y: r.top - 4, width: r.width + 8, height: r.height + 8 }; })()`);
  await b.shot(name, { clip: r2, fmt: 'jpeg' });
}
b.close(); process.exit(0);
