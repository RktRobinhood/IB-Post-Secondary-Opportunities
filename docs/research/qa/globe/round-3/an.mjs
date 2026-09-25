import fs from 'node:fs';
const names = process.argv.slice(2);
for (const n of names) {
  const j = JSON.parse(fs.readFileSync(n + '.json'));
  let fr = [];
  try { fr = fs.readdirSync(n + '-frames').map(f => +f.split('_')[1].replace('ms.jpg', '')).sort((a, b) => a - b); } catch {}
  const gaps = fr.slice(1).map((t, i) => ({ at: fr[i], gap: t - fr[i] })).filter(g => g.at > 0).sort((a, b) => b.gap - a.gap).slice(0, 4);
  const s = j.samples;
  const trans = s.filter((x, i) => i && s[i - 1].close !== x.close).map(x => `${x.t}ms close=${x.close} alt=${x.alt} z=${x.z}`);
  const hitZ = s.find(x => x.z && x.z >= (j.maxZ - 0.05));
  console.log(`\n== ${n}: frames ${j.frames} lastFrame ${fr.at(-1)}ms; rAF p50/p95/p99/max ${j.frameStats.p50}/${j.frameStats.p95}/${j.frameStats.p99}/${j.frameStats.max} over50=${j.frameStats.over50}`);
  console.log(' long tasks', JSON.stringify(j.frameStats.long));
  console.log(' biggest screencast gaps', JSON.stringify(gaps));
  console.log(' firstClose', j.firstCloseMs, 'minAlt', j.minAlt, 'maxZ', j.maxZ, 'reach maxZ at', hitZ?.t, 'hints', JSON.stringify(j.hints), 'loadingWait', j.loadingWaitMs);
  console.log(' transitions', trans.join(' | '));
  console.log(' bytes', j.bytes.totalKB, 'kB', JSON.stringify(j.bytes.by).slice(0, 600));
}
