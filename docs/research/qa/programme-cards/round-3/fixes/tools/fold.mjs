import { launch, sleep } from './cdp.mjs';
const b = await launch({ gpu: true, port: 9407 });
const s = () => b.evaluate(`JSON.stringify({ first: document.getElementById('discover-results').children.length, fold: document.querySelector('#discover-more .discover__cards').children.length, open: document.getElementById('discover-more').open, summary: getComputedStyle(document.querySelector('#discover-more > summary')).display, q: location.search })`);
await b.open('/', { width: 1280, height: 800 }); await sleep(1500);
console.log('start', await s());
await b.evaluate(`document.querySelector('.preset[data-scope="nearby"]').click()`); await sleep(400);
console.log('nearby', await s());
await b.evaluate(`history.back()`); await sleep(600);
console.log('back', await s());
await b.evaluate(`history.forward()`); await sleep(600);
console.log('forward', await s());
await b.evaluate(`document.querySelector('#prog-active [data-clear]').click()`); await sleep(400);
console.log('clear chip', await s());
// No script: the page as built.
await b.send('Emulation.setScriptExecutionDisabled', { value: true });
await b.open('/', { width: 390, height: 844, mobile: true, dpr: 2 }); await sleep(800);
await b.shot('noscript-phone', { fmt: 'jpeg' });
b.close(); process.exit(0);
