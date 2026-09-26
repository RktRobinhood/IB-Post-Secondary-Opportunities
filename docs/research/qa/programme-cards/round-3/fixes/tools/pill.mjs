import { launch, sleep } from './cdp.mjs';
const b = await launch({ gpu: true, port: 9405 });
const pill = () => b.evaluate(`JSON.stringify((() => { const p = document.querySelector('.discover__pill:not([hidden])'); if (!p) return null; const r = p.getBoundingClientRect(); const e = document.querySelector('.discover__eyebrow').getBoundingClientRect(); return { text: p.textContent, low: p.classList.contains('discover__pill--low'), top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width), eyebrow: [Math.round(e.top), Math.round(e.bottom)] }; })())`);
// A short phone: the count is below the fold after a door.
await b.open('/', { width: 360, height: 640, mobile: true, dpr: 2 }); await sleep(2000);
await b.evaluate(`document.querySelector('.preset[data-scope="far"]').click()`); await sleep(800);
console.log('short phone, door', await pill());
await b.shot('pill-short-phone-door', { fmt: 'jpeg' });
// Scrolled to the globe, a country chosen on it.
await b.open('/', { width: 390, height: 844, mobile: true, dpr: 2 }); await sleep(2000);
await b.evaluate(`scrollTo(0, document.querySelector('.world__stage').getBoundingClientRect().top + scrollY - 70)`); await sleep(500);
await b.evaluate(`document.querySelector('.world').dispatchEvent(new CustomEvent('world:choose', { detail: { kind: 'country', id: 'nl' } }))`); await sleep(800);
console.log('phone, globe choice', await pill());
await b.shot('pill-phone-globe', { fmt: 'jpeg' });
b.close(); process.exit(0);
