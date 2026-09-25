// Injected by cdp.mjs into each page: rendered word counts, fold words, prose runs, heading outline.
(() => {
  const main = document.querySelector('main');
  if (!main) return { error: 'no main' };
  const vh = innerHeight;
  const docH = document.documentElement.scrollHeight;
  const SKIP = 'script,style,svg,noscript,template,nav';
  const wc = (s) => (s.trim() ? s.trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length : 0);
  const vis = (el) => el && el.checkVisibility ? el.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true }) : true;
  // Visible text nodes, with page Y.
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) {
    const p = n.parentElement;
    if (!p || p.closest(SKIP)) continue;
    const w = wc(n.nodeValue);
    if (!w) continue;
    if (!vis(p)) continue;
    const r = document.createRange();
    r.selectNodeContents(n);
    const rect = r.getBoundingClientRect();
    if (!rect.width && !rect.height) continue;
    nodes.push({ n, w, y: rect.top + scrollY });
  }
  const total = nodes.reduce((a, b) => a + b.w, 0);
  const foldWords = nodes.filter((x) => x.y < vh).reduce((a, b) => a + b.w, 0);
  const wordsBefore = (el) => nodes.filter((x) => el.compareDocumentPosition(x.n) & Node.DOCUMENT_POSITION_PRECEDING).reduce((a, b) => a + b.w, 0);

  const CONTROL = 'input:not([type=hidden]),select,textarea,button,summary,canvas,[role=slider],[role=tab]';
  const VISUAL = 'img,picture,canvas,video,figure,svg';
  const firstOf = (sel, minSize = 24) => {
    for (const el of main.querySelectorAll(sel)) {
      if (el.closest('nav')) continue;
      const r = el.getBoundingClientRect();
      if (r.width < minSize || r.height < minSize / 2) continue;
      if (!vis(el)) continue;
      return { tag: el.tagName.toLowerCase(), cls: (el.className?.baseVal ?? el.className ?? '').toString().slice(0, 60), y: Math.round(r.top + scrollY), screens: +((r.top + scrollY) / vh).toFixed(2), wordsBefore: wordsBefore(el) };
    }
    return null;
  };

  // Prose runs: consecutive long paragraphs with no picture/control/card between.
  const BREAK_SEL = 'img,picture,canvas,video,iframe,input,select,textarea,button,summary,table,figure,[class*=card],[class*=tile],[class*=door],[class*=reel],[class*=chip],[class*=glance]';
  let cur = { paras: 0, words: 0, first: '', y: 0 }, best = { paras: 0, words: 0, first: '', y: 0 }, bestW = { ...best };
  const flush = () => {
    if (cur.paras > best.paras || (cur.paras === best.paras && cur.words > best.words)) best = cur;
    if (cur.words > bestW.words) bestW = cur;
    cur = { paras: 0, words: 0, first: '', y: 0 };
  };
  const all = main.querySelectorAll('*');
  let skipUntil = null;
  let longParas = 0;
  for (const el of all) {
    if (skipUntil && skipUntil.contains(el)) continue;
    skipUntil = null;
    if (el.closest(SKIP)) continue;
    const tag = el.tagName.toLowerCase();
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    if (el.matches(BREAK_SEL) && rect.width >= 24 && rect.height >= 12) { flush(); skipUntil = el; continue; }
    if (/^(p|li|dd|blockquote|h[1-6])$/.test(tag)) {
      if (el.querySelector(BREAK_SEL)) continue; // descend
      const w = wc(el.innerText || '');
      skipUntil = el;
      if (/^h/.test(tag)) { cur.words += w; continue; }
      if (w >= 15) { cur.paras++; cur.words += w; longParas++; if (!cur.first) { cur.first = (el.innerText || '').slice(0, 100); cur.y = Math.round(rect.top + scrollY); } }
      else if (tag === 'li') flush();
      else cur.words += w;
    }
  }
  flush();

  // Outline: headings with position and words until the next heading.
  const heads = [...main.querySelectorAll('h1,h2,h3,summary')].filter((h) => vis(h) && h.getBoundingClientRect().height);
  const outline = heads.map((h, i) => {
    const next = heads[i + 1];
    const words = nodes.filter((x) => (h.compareDocumentPosition(x.n) & Node.DOCUMENT_POSITION_FOLLOWING) && (!next || (next.compareDocumentPosition(x.n) & Node.DOCUMENT_POSITION_PRECEDING))).reduce((a, b) => a + b.w, 0);
    return { tag: h.tagName.toLowerCase(), text: (h.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 80), y: Math.round(h.getBoundingClientRect().top + scrollY), screens: +((h.getBoundingClientRect().top + scrollY) / vh).toFixed(1), words };
  });

  const detailsCount = main.querySelectorAll('details').length;
  const openDetails = main.querySelectorAll('details[open]').length;
  return {
    vw: innerWidth, vh, docH, screens: +(docH / vh).toFixed(1),
    totalWords: total, foldWords,
    firstControl: firstOf(CONTROL),
    firstVisual: firstOf(VISUAL, 60),
    maxRun: best, maxRunByWords: bestW, longParas,
    detailsCount, openDetails,
    outline,
  };
})()
