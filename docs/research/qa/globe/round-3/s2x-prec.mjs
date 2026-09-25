import { launch } from './cdp.mjs';
const b = await launch({ port: 9364 });
for (const r of ['/programmes/', '/destinations/nl/', '/europe/']) {
  await b.open(r); await b.globeReady();
  console.log(r, JSON.stringify(await b.g('return g.places.map(p => p.name + ":" + p.precision + ":" + (p.count||0));')));
}
b.close(); process.exit(0);
