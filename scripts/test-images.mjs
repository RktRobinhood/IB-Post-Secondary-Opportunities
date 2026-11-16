/** Regression fixtures for the no-hotlink gate, including images loaded after first render. */
import assert from 'node:assert/strict';
import { imageElements, localImage, remoteImages } from './lib/built-images.mjs';
import { choosePhoto, photoIdentity } from '../src/assets/js/photo-pools.js';

assert.ok(localImage('/assets/img/lab.webp'));
for (const src of ['https://university.example/lab.jpg', '//university.example/lab.jpg', 'data:image/png;base64,abc', '']) assert.equal(localImage(src), false);
assert.deepEqual(remoteImages('<img src="/assets/img/lab.webp" srcset="/assets/img/lab-480.webp 480w, /assets/img/lab.webp 960w" alt="">'), []);
assert.deepEqual(imageElements('<img src="/assets/img/lab.webp" srcset="/assets/img/lab-480.webp 480w" alt="">')[0].variants, ['/assets/img/lab-480.webp']);
for (const markup of [
  '<img src="https://university.example/lab.jpg" alt="">',
  '<img src="/assets/img/lab.webp" srcset="https://university.example/lab.jpg 960w" alt="">',
  '<source srcset="//university.example/lab.jpg 960w">',
  '<div data-slides="[{&quot;src&quot;:&quot;https://university.example/lab.jpg&quot;}]"></div>',
  '<script type="application/json" id="planner-opportunities">[{"display":{"backdrop":{"src":"https://university.example/lab.jpg"}}}]</script>',
  '<script type="application/json">["<img src=\\"https://university.example/lab.jpg\\" alt=\\"\\">"]</script>',
]) assert.ok(remoteImages(markup).length, `the gate missed ${markup}`);
console.log('Local-image gate catches live img, srcset, picture sources, deferred slides and client data.');

const preferred = { src: '/base/assets/img/chemistry.webp' };
const alternative = { src: '/base/assets/img/lab.webp' };
const pools = { Chemistry: [preferred, alternative] };
assert.equal(choosePhoto(preferred, 'Chemistry', new Set(), pools), preferred);
assert.equal(choosePhoto(preferred, 'Chemistry', new Set([preferred.src]), pools), alternative);
assert.equal(choosePhoto(preferred, 'Chemistry', new Set([preferred.src, alternative.src]), pools), null);
// A different result page may reuse the same photograph.
assert.equal(choosePhoto(preferred, 'Chemistry', new Set(), pools), preferred);
assert.equal(photoIdentity('https://site.example/base/assets/img/chemistry.webp'), preferred.src);
assert.equal(choosePhoto(preferred, 'Chemistry', new Set([photoIdentity('https://site.example/base/assets/img/chemistry.webp')]), pools), alternative);
console.log('Result-page photo selection preserves the preferred photo, avoids same-page repeats, and permits cross-page reuse.');
