import fs from 'node:fs/promises';
import { launch, sleep } from './cdp.mjs';
const OUTD = 'D:/OneDrive - Ikast/OneDrive - Ikast-Brande Gymnasium/AI Projects/DK Uni Requirments/ib-pathways-europe/.claude/worktrees/globe-desk/docs/research/qa/programme-cards/round-3/';
const b = await launch({ gpu: true, port: 9396 });
const jobs = [
  ['bug-oneof-erasmus-econ-phone', 'nl-erasmus-economics-and-business-economics-2027-autumn', true],
  ['bug-oneof-crafts-glass-desk', 'dk-royal-danish-academy-crafts-in-glass-and-ceramics-2027-autumn', false],
  ['bug-biotech-no-years-desk', 'dk-absalon-biotechnology', false],
];
for (const [name, href, phone] of jobs) {
  await b.open('/', phone ? { width: 390, height: 844, mobile: true, dpr: 2 } : { width: 1280, height: 800 }); await sleep(1500);
  await b.evaluate(`document.getElementById('discover-more').open = true; document.documentElement.style.scrollBehavior = 'auto'`);
  const r = await b.evaluate(`(async () => { const a = [...document.querySelectorAll('#discover .card__title a')].find(a => a.getAttribute('href').includes(${JSON.stringify(href)})); const c = a.closest('.card'); c.scrollIntoView({ block: 'center', behavior: 'instant' }); c.querySelector('img') && (c.querySelector('img').loading = 'eager'); await new Promise(r => setTimeout(r, 1500)); const x = c.getBoundingClientRect(); return { x: x.left, y: x.top + scrollY, w: x.width, h: x.height }; })()`);
  const s = await b.send('Page.captureScreenshot', { format: 'jpeg', quality: 75, clip: { x: r.x - 6, y: r.y - 6, width: r.w + 12, height: r.h + 12, scale: 1 } });
  await fs.writeFile(OUTD + name + '.jpg', Buffer.from(s.data, 'base64')); console.log(name, r);
}
b.close(); process.exit(0);
