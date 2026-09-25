import { launch, sleep } from './cdp.mjs';
const b = await launch({ gpu: false, port: 9384 });
for (const [n, r] of [['is-lhi', '/universities/is-lhi/'], ['fi-uh', '/universities/fi-uh/']]) {
  await b.open(r, { width: 1280, height: 800 }); await sleep(900); await b.shot(`${n}-desk-top`, { fmt: 'jpeg' });
}
b.close(); process.exit(0);
