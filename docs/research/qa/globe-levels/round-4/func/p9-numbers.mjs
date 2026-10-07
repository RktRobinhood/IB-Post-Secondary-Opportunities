/* P9: do the numbers agree? continent = sum of its countries; country node = its pins = its card; the place tiles and the list below. */
import { setup, open, DESK, state, still, sleep, ev, send, g } from './lib.mjs';
await setup(DESK, { reduced: true });
await send('Page.navigate', { url: 'about:blank' }); await sleep(300);
await open('/?map=globe');
const regions = await g(`return [...g.regions.values()].map(r => ({ id: r.id, name: r.name, members: r.members.map(m => m.country) }));`);
const tiles = await ev(`[...document.querySelectorAll('#discover-places a, [data-place-tile], .place-tile')].map(a => a.textContent.replace(/\\s+/g,' ').trim()).slice(0,60)`);
const list = await ev(`[...document.querySelectorAll('.world a')].map(a => a.textContent.replace(/\\s+/g,' ').trim()).filter(t => /\\d+$/.test(t))`);
console.log('TILES', JSON.stringify(tiles));
console.log('LIST', JSON.stringify(list));
const world = await state();
console.log('WORLD nodes', JSON.stringify(world.nodes.map(n => `${n.region}:${n.n}`)));
const problems = [];
for (const r of regions) {
  await g(`g.goToRegion('${r.id}'); return true;`); await still(); await sleep(300);
  const s = await state();
  const cn = s.nodes.filter((n) => n.kind === 'country');
  const sum = cn.reduce((a, n) => a + (+n.n || 0), 0);
  const worldN = await g(`const r = g.regions.get('${r.id}'); return r.members.reduce((n, m) => n + (m.count || 0), 0);`);
  console.log(`REGION ${r.id}: bubble ${worldN}, country nodes on stage ${cn.length}/${r.members.length}, their sum ${sum}`);
  if (cn.length === r.members.length && sum !== worldN) problems.push(`${r.id}: bubble ${worldN} != sum ${sum}`);
  for (const code of r.members) {
    const node = cn.find((n) => n.nation === code);
    await g(`const c = g.country('${code}') || { id: '${code}', name: '${code}', rings: [], start: 0, count: 0, frame: g.places.filter(p => p.country === '${code}').flatMap(p => [p.xyz, ...p.subs.map(q => q.xyz)]) }; g.goToCountry(c); return true;`); await still(); await sleep(250);
    const c = await state();
    const subs = await g(`return g.places.filter(p => p.country === '${code}').reduce((n, p) => n + p.subs.length, 0);`);
    const metaN = +((c.cardMeta || '').match(/(\d+) universit/) || [])[1] || null;
    const tile = tiles.find((t) => t.toLowerCase().includes((c.card || '').split(' — ')[0].toLowerCase()));
    const tileN = tile ? +((tile.match(/(\d+) universit/) || [])[1] || 0) : null;
    const line = `  ${code}: node ${node ? node.n : '(off stage)'} | pins visible ${c.pins} of ${subs} | card "${c.cardMeta}"${tile ? ` | tile "${tile.slice(-60)}"` : ''}`;
    console.log(line);
    if ((node && +node.n !== c.pins) || (metaN !== null && metaN !== c.pins) || (subs !== c.pins) || (tileN && metaN && tileN !== metaN)) problems.push(line.trim());
  }
}
console.log('\nPROBLEMS');
for (const p of problems) console.log(' ', p);
