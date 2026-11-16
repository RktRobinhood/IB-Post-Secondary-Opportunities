/** Stored photo files and their student-facing attribution, without review bookkeeping. */
import fs from 'node:fs';
import path from 'node:path';
import { probeWebp, conforms } from './lib/image-standard.mjs';
import { localImage } from './lib/built-images.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const problems = [];
let pictures = 0;
for (const manifest of ['images', 'programme-images']) {
  const records = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', `${manifest}.json`), 'utf8'));
  for (const [key, record] of Object.entries(records)) {
    for (const [index, r] of [record, ...(record.gallery || [])].entries()) {
      const at = `${manifest}/${key}${index ? ` gallery ${index}` : ''}`;
      pictures++;
      if (!localImage(r.src)) problems.push(`${at}: no stored local file`);
      if (!/^https?:\/\//.test(r.page || '')) problems.push(`${at}: no source URL`);
      if (!String(r.author || '').trim() || !String(r.licence || '').trim()) problems.push(`${at}: missing author or licence`);
      if (!String(r.description || r.subject || '').trim()) problems.push(`${at}: missing short photo description`);
      for (const field of ['review', 'score', 'scorer', 'fetched', 'pin', 'candidates', 'placeCheck']) if (field in r) problems.push(`${at}: obsolete ${field} metadata`);
      for (const v of [r, ...(r.variants || [])]) {
        if (!localImage(v.src)) { problems.push(`${at}: invalid image file ${v.src}`); continue; }
        const disk = path.join(ROOT, 'src', v.src);
        if (!fs.existsSync(disk)) { problems.push(`${at}: ${v.src} is missing`); continue; }
        const buf = fs.readFileSync(disk);
        const dimensions = probeWebp(buf);
        if (!dimensions) { problems.push(`${at}: ${v.src} is not a WebP`); continue; }
        if (v.width != null && (v.width !== dimensions.width || v.height !== dimensions.height)) problems.push(`${at}: ${v.src} dimensions differ from record`);
        if (v.bytes != null && v.bytes !== buf.length) problems.push(`${at}: ${v.src} byte length differs from record`);
        for (const issue of conforms({ file: v.src, ...dimensions, bytes: buf.length })) problems.push(`${at}: ${v.src} ${issue.message}`);
      }
    }
  }
}
if (problems.length) {
  console.error(`${problems.length} photo record problem(s):\n${problems.slice(0, 60).join('\n')}`);
  process.exit(1);
}
console.log(`All ${pictures} stored photos retain source, author, licence and valid WebP files.`);
