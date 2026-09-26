/* One shot of the "Show all" control, whose count is programmes (73) while the grid shows cards (67). */
import fs from 'node:fs/promises'; import path from 'node:path';
import { launch, OUT, sleep } from './cdp.mjs';
const b = await launch({ gpu: false, port: 9399 });
await b.open('/', { width: 1280, height: 800 }); await sleep(800);
const r = await b.evaluate(`(()=>{const s=document.querySelector('#discover-more > summary'); const r=s.getBoundingClientRect(); return {x:0,y:r.top+scrollY-260,width:1280,height:360, n:document.querySelectorAll('.discover .card').length, t:s.textContent.trim()}})()`);
console.log(r.t, r.n);
await b.evaluate(`document.querySelectorAll('.discover .card img').forEach(i=>i.loading='eager')`); await sleep(1500);
const s = await b.send('Page.captureScreenshot', { format: 'jpeg', quality: 85, captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.width, height: r.height, scale: 1 } });
await fs.writeFile(path.join(OUT, 'bug-showall-count.jpg'), Buffer.from(s.data, 'base64'));
b.close(); process.exit(0);
