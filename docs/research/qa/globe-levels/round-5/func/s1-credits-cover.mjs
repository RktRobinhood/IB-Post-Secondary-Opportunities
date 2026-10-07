/* Round 5: which pins (dot or name) sit under a link or furniture inside the stage, e.g. the credits link? */
import { setup, open, DESK, PHONE, still, sleep, ev, send, g } from './lib.mjs';
const codes = (process.argv[2] || 'dk,nl,gb,se,hk,fr,ch,it,de,us,jp,au').split(',');
for (const [name, dev] of [['phone', PHONE], ['desk', DESK]]) {
  await setup(dev, { reduced: true });
  await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe');
  if (name === 'phone') console.log('credits link:', JSON.stringify(await ev(`[...document.querySelectorAll('.world a')].filter(a => a.offsetParent).map(a => { const r = a.getBoundingClientRect(); return a.getAttribute('href') + ' ' + [r.left, r.top, r.width, r.height].map(Math.round).join(','); })`)));
  for (const code of codes) {
    const ok = await g(`const c = g.country('${code}'); if (!c) return false; g.goToCountry(c); return true;`);
    if (!ok) { console.log(name, code, 'no country'); continue; }
    await still(); await sleep(500);
    const r = await ev(`(() => { const out = []; for (const p of document.querySelectorAll('.world__pin')) { if (p.hidden || !p.offsetParent || getComputedStyle(p).opacity < 0.05) continue;
      for (const part of ['.world__pin-dot', '.world__pin-label']) { const e = p.querySelector(part); if (!e) continue; const b = e.getBoundingClientRect(); if (!b.width) continue; const x = b.left + b.width / 2, y = b.top + b.height / 2; if (y < 0 || y > innerHeight) continue; const t = document.elementFromPoint(x, y); if (!t || p.contains(t)) continue; const a = t.closest('a, button, .world__card, .world__trail, .world__controls'); if (a) out.push(p.dataset.place + part.replace('.world__pin', '') + ' under ' + (a.getAttribute('href') || a.className || a.tagName)); } } return out; })()`);
    console.log(name, code, r.length ? r.join(' | ') : 'clean');
  }
}
