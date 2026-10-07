/* Q4 (round 2): every university of a country, chosen by a real click (desk)
   or a real touch tap (phone) on its dot, and on its name when it shows one.
   Also counts what a student cannot click at all: pins off the stage, under
   the card, the trail or the buttons, and universities with no pin drawn.
   Usage: node q4-pinclicks.mjs desk|phone [codes] */
import { setup, open, DESK, PHONE, click, tap, still, sleep, ev, send, g, shot } from './lib.mjs';
const devName = process.argv[2] || 'desk';
const dev = devName === 'phone' ? PHONE : DESK;
const codes = (process.argv[3] || 'dk,gb,nl,us,jp,au,de,fr,ch,sg,hk,cn,ca,ae,it,es,be,at,se,ie,kr,nz,fi,no,pl,pt,mt,lu').split(',');
await setup(dev, { reduced: true });
await send('Page.navigate', { url: 'about:blank' }); await sleep(300);
await open('/?map=globe');
const press = (x, y) => (devName === 'phone' ? tap(x, y) : click(x, y));
const cardName = () => ev(`document.querySelector('.world__card:not([hidden]) h3')?.textContent.replace(/ —.*$/, '').replace('→', '').trim() || ''`);
const pinNow = (id) => ev(`(() => {
  const p = document.querySelector('.world__pin[data-place="${id}"]'); if (!p || p.hidden || !p.offsetParent || getComputedStyle(p).opacity < 0.05) return null;
  const d = p.querySelector('.world__pin-dot').getBoundingClientRect(); const l = p.querySelector('.world__pin-label');
  const lr = l && getComputedStyle(l).display !== 'none' && getComputedStyle(l).visibility !== 'hidden' && getComputedStyle(l).opacity > 0.05 && l.getBoundingClientRect().width > 0 ? l.getBoundingClientRect() : null;
  const s = document.querySelector('.world__stage').getBoundingClientRect();
  const x = d.left + d.width / 2, y = d.top + d.height / 2;
  const what = (x, y) => { if (x < s.left || x > s.right || y < s.top || y > s.bottom || y < 0 || y > innerHeight) return 'off-stage'; const e = document.elementFromPoint(x, y); return !e ? 'nothing' : e.closest('.world__card') ? 'card' : e.closest('.world__controls') ? 'buttons' : e.closest('.world__trail') ? 'trail' : e.closest('.world__stage') ? 'clear' : 'outside'; };
  return { id: '${id}', name: l?.textContent || '', x, y, at: what(x, y), lx: lr ? lr.left + lr.width / 2 : null, ly: lr ? lr.top + lr.height / 2 : null, lat: lr ? what(lr.left + lr.width / 2, lr.top + lr.height / 2) : null };
})()`);
let T = { pins: 0, clear: 0, wrongDot: 0, labels: 0, wrongLabel: 0, blocked: 0, missing: 0 };
const lines = [];
for (const code of codes) {
  const ok = await g(`const c = g.country('${code}') || (g.places.find(p => p.country === '${code}') && { id: '${code}', name: '${code}', rings: [], start: 0, count: 0, frame: g.places.filter(p => p.country === '${code}').flatMap(p => [p.xyz, ...(p.subs||[]).map(q => q.xyz)]) }); if (!c) return false; g.goToCountry(c); return true;`);
  if (!ok) { lines.push(`${code}: no country`); continue; }
  await still(); await sleep(600);
  const all = await ev(`[...document.querySelectorAll('.world__pin[data-school]')].filter(p => p.dataset.place.startsWith('${code}-') || true).map(p => ({ id: p.dataset.place, shown: !p.hidden && !!p.offsetParent && getComputedStyle(p).opacity > 0.05 }))`);
  const expected = await ev(`(async () => { const g = (await import('/assets/js/map.js')).enhanceWorld(document.querySelector('.world')).globe.debug; return g.places.filter(p => p.country === '${code}').reduce((n, p) => n + ((p.subs && p.subs.length) || 0), 0); })()`);
  const shown = all.filter((p) => p.shown);
  const blocked = [], wrongDot = [], wrongLabel = [];
  let clear = 0, labels = 0;
  /* Coverage measured on the country level as it first opens (the country card up). */
  const first = [];
  for (const p of shown) first.push(await pinNow(p.id));
  for (const p of first) if (p && p.at !== 'clear') blocked.push(`${p.name || p.id} (${p.at})`);
  const reopen = async () => { await g(`const c = g.country('${code}') || (g.places.find(p => p.country === '${code}') && { id: '${code}', name: '${code}', rings: [], start: 0, count: 0, frame: g.places.filter(p => p.country === '${code}').flatMap(p => [p.xyz, ...(p.subs||[]).map(q => q.xyz)]) }); g.goToCountry(c); return true;`); await still(); await sleep(300); };
  const skipped = [];
  for (const p0 of shown) {
    let p = await pinNow(p0.id);
    /* A pin hidden by the last university's card: back to the country, as a student would (trail or Escape). */
    if (!p || p.at !== 'clear') { await reopen(); p = await pinNow(p0.id); }
    if (!p || p.at !== 'clear') { skipped.push(`${p0.id} (${p ? p.at : 'gone'})`); continue; }
    clear++;
    await press(p.x, p.y); await sleep(450);
    const got = await cardName();
    if (got !== p.name) wrongDot.push(`${p.name} -> ${got || '(nothing)'}`);
    /* The name, from the country level with no university chosen (the way a student first meets it). */
    await reopen();
    const q = await pinNow(p0.id);
    if (q && q.lx != null && q.lat === 'clear') {
      labels++;
      await press(q.lx, q.ly); await sleep(450);
      const got2 = await cardName();
      if (got2 !== q.name) wrongLabel.push(`label "${q.name}" -> ${got2 || '(nothing)'}`);
    }
  }
  T.pins += shown.length; T.clear += clear; T.wrongDot += wrongDot.length; T.labels += labels; T.wrongLabel += wrongLabel.length; T.blocked += blocked.length; T.missing += Math.max(0, expected - shown.length);
  lines.push(`${code}: ${expected} universities, ${shown.length} pins shown, ${clear} clickable; wrong at dot ${wrongDot.length}; labels tried ${labels}, wrong ${wrongLabel.length}; blocked at open ${blocked.length}${blocked.length ? ' [' + blocked.join('; ') + ']' : ''}${skipped.length ? '; never clickable ' + skipped.join(', ') : ''}${wrongDot.length ? '\n    DOT ' + wrongDot.join(' | ') : ''}${wrongLabel.length ? '\n    LABEL ' + wrongLabel.join(' | ') : ''}`);
  if ((wrongDot.length || wrongLabel.length || blocked.length) && process.argv[4] === 'shots') { await g(`g.goToCountry(g.country('${code}') || g.goToCountry); return 1;`).catch(() => {}); await still(); await shot(`q4-${devName}-${code}`); }
}
console.log(lines.join('\n'));
console.log(`TOTAL ${devName}:`, JSON.stringify(T));
