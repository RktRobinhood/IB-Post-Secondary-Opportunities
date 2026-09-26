import { launch, sleep } from './cdp.mjs';
const b = await launch({ gpu: true, port: 9403 });
const state = () => b.evaluate(`JSON.stringify({
  count: document.getElementById('prog-count').textContent,
  cards: [...document.querySelectorAll('[data-card]')].filter(e => !e.hidden).length,
  firstTitles: [...document.querySelectorAll('[data-card]')].filter(e => !e.hidden).slice(0, 4).map(e => e.querySelector('.card__title').textContent.trim()),
  empty: document.getElementById('discover-empty').hidden ? null : document.getElementById('discover-empty').innerText.replace(/\\s+/g, ' ').slice(0, 300),
  places: document.getElementById('discover-places').hidden ? null : { line: document.getElementById('discover-places-line').textContent, tiles: [...document.querySelectorAll('#discover-places li[data-scope]')].filter(e => !e.hidden).length },
  pill: document.querySelector('.discover__pill:not([hidden])')?.textContent || null,
  url: location.search,
})`);
for (const o of [{ width: 1280, height: 800 }, { width: 390, height: 844, mobile: true, dpr: 2 }]) {
  await b.open('/', o); await sleep(1500);
  console.log('initial', await state());
  for (const scope of ['here', 'nearby', 'far']) {
    await b.evaluate(`document.querySelector('.preset[data-scope="${scope}"]').click()`); await sleep(600);
    console.log(scope, await state());
    await b.evaluate(`document.querySelector('.preset[data-scope="${scope}"]').click()`); await sleep(300);
  }
  for (const q of ['psychology', 'law', 'medicine', 'economist', 'zzzz']) {
    await b.evaluate(`(() => { const i = document.getElementById('f-q'); i.value = ${JSON.stringify(q)}; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); })()`); await sleep(400);
    console.log(q, await state());
  }
  await b.evaluate(`history.back()`); await sleep(500);
  console.log('back', await state());
}
console.log(b.logs.filter((l) => /exception|error/i.test(l)).slice(0, 10));
b.close(); process.exit(0);
