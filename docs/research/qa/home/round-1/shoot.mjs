/* Home round-1 art-director critic: captures of the discovery surface at `/`.
   Run: ORIGIN=http://localhost:4350 BASEPATH= node shoot.mjs [only-prefix] */
import fs from 'node:fs/promises';
import path from 'node:path';
import { launch, sleep, OUT } from './cdp.mjs';

const only = process.argv[2] || '';
const b = await launch({ gpu: true, port: 9371 });
const { send, evaluate, open, shot, click, logs } = b;
const notes = {};

const VP = {
  desk: { width: 1280, height: 800 },
  phone: { width: 390, height: 844, mobile: true, dpr: 2 },
};

async function page(vp, theme, query = '') {
  await open('/', { ...VP[vp], dark: theme === 'dark', query });
  await evaluate(`localStorage.setItem('ibp-theme', '${theme}'); 1`);
  await open('/', { ...VP[vp], dark: theme === 'dark', query });
  await evaluate(`(async () => { const f = document.querySelector('.world'); for (let i = 0; i < 80 && f && f.dataset.globe !== 'on' && f.dataset.globe !== 'off'; i++) await new Promise(r => setTimeout(r, 100)); await new Promise(r => setTimeout(r, 1200)); return f?.dataset.globe; })()`);
}
const full = async (name, scale = 1) => {
  await b.settle(400);
  const { contentSize } = await send('Page.getLayoutMetrics');
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70, captureBeyondViewport: true, clip: { x: 0, y: 0, width: contentSize.width, height: Math.min(contentSize.height, 14000), scale } });
  await fs.writeFile(path.join(OUT, `${name}.jpg`), Buffer.from(r.data, 'base64'));
  console.log(`  ${name} (${Math.round(contentSize.height)}px)`);
};
const rect = (sel) => evaluate(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; })()`);
const clickSel = async (sel) => { const r = await evaluate(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); if (!r) return false; await click(r.x, r.y); return true; };
const toTop = () => evaluate('scrollTo(0,0); 1');
const toResults = () => evaluate(`(() => { const e = document.getElementById('prog-count'); scrollTo(0, e.getBoundingClientRect().top + scrollY - 70); return 1; })()`);
const state = () => evaluate(`({ url: location.search, count: document.getElementById('prog-count')?.textContent, pressed: [...document.querySelectorAll('.preset[aria-pressed=true]')].map(b => b.dataset.scope), active: [...document.querySelectorAll('#prog-active li')].map(l => l.textContent.trim()), scrollY, more: document.getElementById('discover-more')?.open })`);
const key = async (k, code, shift = false) => {
  const mods = shift ? 8 : 0;
  const map = { Tab: 9, Enter: 13, Escape: 27, ' ': 32, ArrowDown: 40, ArrowUp: 38 };
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k, code, windowsVirtualKeyCode: map[k], modifiers: mods });
  if (k === 'Enter' || k === ' ') await send('Input.dispatchKeyEvent', { type: 'char', text: k === 'Enter' ? '\r' : ' ', modifiers: mods });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: map[k], modifiers: mods });
  await sleep(120);
};
const focused = () => evaluate(`(() => { const e = document.activeElement; if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { tag: e.tagName, id: e.id, cls: String(e.className).slice(0, 40), text: (e.getAttribute('aria-label') || e.textContent || e.value || '').trim().replace(/\\s+/g, ' ').slice(0, 40), y: Math.round(r.top), vis: r.width > 0 && r.top >= 0 && r.bottom <= innerHeight, outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, shadow: cs.boxShadow.slice(0, 40) }; })()`);

for (const vp of ['desk', 'phone']) {
  for (const theme of ['light', 'dark']) {
    const t = `${vp}-${theme}`;
    if (only && !t.startsWith(only)) continue;
    console.log(t);
    await page(vp, theme);
    await shot(`${t}-01-first`);
    await full(`${t}-02-full`, vp === 'phone' ? 0.5 : 1);
    notes[`${t}-metrics`] = await evaluate(`({ h: document.documentElement.scrollHeight, hScroll: document.documentElement.scrollWidth > innerWidth, heroH: document.querySelector('.discover__hero')?.offsetHeight, cardsTop: Math.round(document.getElementById('discover-results').getBoundingClientRect().top + scrollY), firstCardH: document.querySelector('.discover__card')?.offsetHeight })`);

    for (const scope of ['here', 'nearby', 'far']) {
      await page(vp, theme);
      await clickSel(`.preset[data-scope="${scope}"]`);
      await sleep(2500);
      await toTop();
      await shot(`${t}-03-door-${scope}`);
      await toResults();
      await shot(`${t}-04-door-${scope}-results`);
      notes[`${t}-door-${scope}`] = await state();
      if (theme === 'dark') break; // one door is enough in dark
    }

    // Subject filter
    await page(vp, theme);
    if (vp === 'phone') { await clickSel('#f-sheet-open'); await sleep(600); await shot(`${t}-05-sheet-open`); }
    const fieldOpt = await evaluate(`(() => { const s = document.getElementById('f-field'); const o = [...s.options].find(o => /engineer/i.test(o.textContent)) || s.options[2]; s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true })); return o.value; })()`);
    await sleep(500);
    if (vp === 'phone') { await shot(`${t}-05b-sheet-chosen`); await clickSel('[data-show]'); await sleep(800); }
    await toResults();
    await shot(`${t}-06-subject-${fieldOpt.replace(/\W+/g, '-')}`);
    notes[`${t}-subject`] = await state();
    await fs.writeFile(path.join(OUT, `notes-${t}.json`), JSON.stringify(notes, null, 1));
    if (theme === 'dark') continue;

    // Search, no result
    await page(vp, theme);
    await clickSel('#f-q');
    await send('Input.insertText', { text: 'zzqx astrophysics' });
    await sleep(600);
    await shot(`${t}-07-search-none-top`);
    await toResults();
    await shot(`${t}-07-search-none`);
    notes[`${t}-search`] = await state();

    // Show all
    await page(vp, theme);
    await clickSel('#discover-more > summary');
    await sleep(600);
    await evaluate(`(() => { const s = document.querySelector('#discover-more > summary'); scrollTo(0, s.getBoundingClientRect().top + scrollY - 200); return 1; })()`);
    await shot(`${t}-08-show-all`);
    notes[`${t}-showall`] = await evaluate(`({ openCards: document.querySelectorAll('#discover-more .discover__card:not([hidden])').length, h: document.documentElement.scrollHeight })`);

    // Card up close
    await page(vp, theme);
    for (const i of [0, 3]) {
      const r = await rect(`.discover__card:nth-child(${i + 1})`);
      await sleep(300);
      const r2 = await evaluate(`(() => { const r = document.querySelector('.discover__card:nth-child(${i + 1})').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; })()`);
      if (r) await shot(`${t}-09-card-${i + 1}`, { clip: { x: Math.max(0, r2.x - 8), y: Math.max(0, r2.y - 8), width: r2.width + 16, height: Math.min(r2.height + 16, VP[vp].height) } });
    }
    notes[`${t}-cardtext`] = await evaluate(`[...document.querySelectorAll('#discover-results .discover__card')].slice(0, 12).map(c => c.innerText.replace(/\\n+/g, ' | ').slice(0, 260))`);
    notes[`${t}-cardimgs`] = await evaluate(`[...document.querySelectorAll('#discover-results .discover__card')].map(c => { const i = c.querySelector('img'); const bg = c.querySelector('[style*=background]'); return i ? i.currentSrc.split('/').pop() : bg ? 'bg:' + bg.getAttribute('style').slice(0, 80) : 'NONE'; })`);

    // Keyboard walk from the top
    await page(vp, theme);
    await toTop();
    await evaluate('document.activeElement?.blur(); document.body.focus(); 1');
    const walk = [];
    for (let i = 0; i < 26; i++) { await key('Tab', 'Tab'); walk.push(await focused()); }
    notes[`${t}-tabwalk`] = walk;
    // focus a preset with keyboard and press it; screenshot focus ring
    await evaluate(`document.querySelector('.preset[data-scope=nearby]').focus(); 1`);
    await shot(`${t}-10-focus-preset`);
    await key(' ', 'Space');
    await sleep(1500);
    notes[`${t}-kbd-preset`] = await state();
    await evaluate(`document.getElementById('f-award')?.focus(); 1`);
    await shot(`${t}-10-focus-chip`);
    await key('Enter', 'Enter');
    await sleep(500);
    notes[`${t}-kbd-chip`] = await state();

    // Back after choices: door -> subject -> chip, then Back x3
    await page(vp, theme);
    const seq = [];
    await clickSel('.preset[data-scope="here"]'); await sleep(1500); seq.push(['door here', await state()]);
    await evaluate(`(() => { const s = document.getElementById('f-field'); s.value = s.options[1].value; s.dispatchEvent(new Event('change', { bubbles: true })); return 1; })()`); await sleep(400); seq.push(['field', await state()]);
    await evaluate(`scrollTo(0, 1400); 1`); await sleep(200);
    await evaluate(`document.getElementById('f-nomath')?.click(); 1`); await sleep(400); seq.push(['nomath', await state()]);
    for (let i = 0; i < 4; i++) { await evaluate('history.back(); 1'); await sleep(1200); seq.push([`back ${i + 1}`, { ...(await state()), path: await evaluate('location.pathname') }]); }
    notes[`${t}-back`] = seq;
    await shot(`${t}-11-after-back`);
  }
  await fs.writeFile(path.join(OUT, `notes-${vp}${only ? '-' + only : ''}.json`), JSON.stringify(notes, null, 1));
}
notes.logs = logs.filter((l) => !/favicon/.test(l)).slice(0, 60);
await fs.writeFile(path.join(OUT, `notes${only ? '-' + only : ''}.json`), JSON.stringify(notes, null, 1));
b.close();
console.log('done');
