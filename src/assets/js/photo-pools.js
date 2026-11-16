/* Choose locally stored discipline photographs for one mounted result page. */
const original = new WeakMap();
export const photoIdentity = (value) => {
  if (value && typeof value === 'object') value = value.identity || value.credit?.url || value.src;
  try { return new URL(value, 'https://local.invalid').pathname; } catch { return value; }
};

/** A read-only choice: callers reserve the returned source in their current page. */
export function choosePhoto(preferred, field, used, pools = {}) {
  return [preferred, ...(pools[field] || [])].find(photo => photo?.src && !used.has(photoIdentity(photo.src)) && !used.has(photoIdentity(photo))) || null;
}

export function assignPhotos(container, pools = {}) {
  if (!container) return;
  const reserved = new Set([...document.querySelectorAll('img[src]')]
    .filter(img => !container.contains(img)).map(img => photoIdentity(img.getAttribute('src'))));
  for (const img of container.querySelectorAll('img[data-backdrop]')) {
    const item = img.closest('[data-subject]');
    const credit = img.closest('article, li')?.querySelector('.photo-credit');
    if (!original.has(img)) original.set(img, {
      key: img.dataset.backdrop,
      src: img.getAttribute('src'),
      srcset: img.getAttribute('srcset') || '',
      width: img.getAttribute('width'),
      height: img.getAttribute('height'),
      credit: credit ? { text: credit.textContent, url: credit.getAttribute('href') } : null,
    });
    const preferred = original.get(img);
    const selected = choosePhoto(preferred, item?.dataset.subject, reserved, pools);
    if (!selected) continue; // The release check reports an exhausted subject pool.
    reserved.add(photoIdentity(selected.src));
    reserved.add(photoIdentity(selected));
    img.src = selected.src;
    if (selected.srcset) img.setAttribute('srcset', selected.srcset);
    else img.removeAttribute('srcset');
    if (selected.sizes) img.setAttribute('sizes', selected.sizes);
    if (selected.width) img.setAttribute('width', selected.width);
    if (selected.height) img.setAttribute('height', selected.height);
    img.dataset.backdrop = selected.key;
    if (credit && selected.credit) {
      credit.textContent = selected.credit.text;
      if (selected.credit.url) credit.href = selected.credit.url;
    }
  }
}
