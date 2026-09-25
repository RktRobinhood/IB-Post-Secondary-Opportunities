/* Follow-up probes for the round-1 critique: Show all, lazy card photos, lights in Nearby. */
import { launch, sleep } from './cdp.mjs';
const b = await launch({ gpu: true, port: 9372 });
const { evaluate, open, shot, click } = b;
const out = {};
await open('/', { width: 1280, height: 800 });
await sleep(1500);
const r = await evaluate(`(() => { const s = document.querySelector('#discover-more > summary'); s.scrollIntoView({ block: 'center' }); const r = s.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, hit: document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.outerHTML.slice(0, 120) }; })()`);
out.summaryHit = r.hit;
await click(r.x, r.y);
await sleep(800);
out.afterClick = await evaluate(`({ open: document.getElementById('discover-more').open, h: document.documentElement.scrollHeight, url: location.search, summary: document.querySelector('#discover-more > summary').textContent })`);
await evaluate(`scrollTo(0, document.querySelector('#discover-more > summary').getBoundingClientRect().top + scrollY - 300); 1`);
await shot('probe-show-all-after-click');
// CBS card photos: scroll into view, wait, shoot
await open('/', { width: 1280, height: 800 });
await evaluate(`document.querySelector('.discover__card:nth-child(10)').scrollIntoView({ block: 'center' }); 1`);
await sleep(2500);
await shot('probe-row4-cbs');
out.cbsImg = await evaluate(`[10,11,12].map(n => { const c = document.querySelector('.discover__card:nth-child(' + n + ')'); const i = c.querySelector('img'); return i ? { src: i.currentSrc, complete: i.complete, nw: i.naturalWidth, loading: i.loading, opacity: getComputedStyle(i).opacity } : c.innerHTML.slice(0, 300); })`);
// Phone card 1 up close, after a real scroll
await open('/', { width: 390, height: 844, mobile: true, dpr: 2 });
await evaluate(`document.querySelector('.discover__card').scrollIntoView({ block: 'start' }); scrollBy(0, -70); 1`);
await sleep(2000);
await shot('probe-phone-card-1');
out.phoneCard = await evaluate(`(() => { const c = document.querySelector('.discover__card'); const cs = getComputedStyle(c.firstElementChild); return { opacity: cs.opacity, transform: cs.transform, cls: c.firstElementChild.className, h: c.offsetHeight }; })()`);
out.phoneMetrics = await evaluate(`({ h: document.documentElement.scrollHeight, cardsTop: Math.round(document.getElementById('discover-results').getBoundingClientRect().top + scrollY), countTop: Math.round(document.getElementById('prog-count').getBoundingClientRect().top + scrollY), searchTop: Math.round(document.getElementById('f-q').getBoundingClientRect().top + scrollY), eyebrowRule: (() => { const e = document.querySelector('.discover__eyebrow'); return getComputedStyle(e, '::after').content + ' ' + getComputedStyle(e).display; })() })`);
// Dark Filters button contrast on phone
await open('/', { width: 390, height: 844, mobile: true, dark: true });
await evaluate(`localStorage.setItem('ibp-theme','dark'); 1`);
await open('/', { width: 390, height: 844, mobile: true, dark: true });
out.filtersBtnDark = await evaluate(`(() => { const s = getComputedStyle(document.getElementById('f-sheet-open')); return { bg: s.backgroundColor, color: s.color }; })()`);
// Nearby: which lights, and what the numbers count
await open('/?scope=nearby', { width: 1280, height: 800 });
await sleep(4000);
out.lights = await evaluate(`[...document.querySelectorAll('.world [data-count], .world .world__light, .world [class*=marker]')].slice(0, 30).map(e => (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 80))`);
out.lightsData = await evaluate(`(() => { const d = JSON.parse(document.getElementById('discover-data').textContent).lights; return Object.fromEntries(Object.entries(d).filter(([, v]) => v.s === 'nearby')); })()`);
console.log(JSON.stringify(out, null, 1));
b.close();
