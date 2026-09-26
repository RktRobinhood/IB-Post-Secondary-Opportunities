import { launch, sleep } from './cdp.mjs';
const b = await launch({ gpu: true, port: 9406 });
for (const [n, o] of [['desk', { width: 1280, height: 800 }], ['phone', { width: 390, height: 844, mobile: true, dpr: 2 }]]) {
  await b.open('/', o); await sleep(2500);
  await b.evaluate(`(() => { const d = document.querySelector('.world__how'); d.open = true; scrollTo(0, d.getBoundingClientRect().top + scrollY - innerHeight + 260); })()`); await sleep(600);
  console.log(n, await b.evaluate(`document.querySelector('.world__caption').innerText`));
  await b.shot(`how-${n}`, { fmt: 'jpeg' });
}
b.close(); process.exit(0);
