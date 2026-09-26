import re, html, json, urllib.request, concurrent.futures as cf
sm = urllib.request.urlopen('http://localhost:4380/sitemap.xml').read().decode()
locs = [re.sub(r'https://[^/]+', '', l) for l in re.findall(r'<loc>([^<]*)</loc>', sm)]
locs = [l for l in locs if l.startswith('/universities/') and l.count('/')==3 or l.startswith('/programmes/') and l.count('/')==3]
def txt(x): return html.unescape(re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',x))).strip()
def get(p):
    s = urllib.request.urlopen('http://localhost:4380'+p).read().decode('utf8','replace')
    h1 = txt((re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S) or [None,''])[1])
    m = re.search(r'<(?:section|aside)[^>]*class="dates-panel".*?</(?:section|aside)>', s, re.S)
    panel = m.group(0) if m else ''
    title = txt((re.search(r'dates-panel__title[^>]*>(.*?)</', panel, re.S) or [None,''])[1])
    items = []
    for it in re.finditer(r'<li class="dates-panel__item"([^>]*)>(.*?)</li>', panel, re.S):
        a, b = it.groups()
        g = lambda c: txt((re.search(r'class="'+c+r'"[^>]*>(.*?)</(?:p|span)>', b, re.S) or [None,''])[1])
        items.append(dict(date=(re.search(r'data-date="([^"]*)"',a) or [None,''])[1], binding=(re.search(r'data-binding="([^"]*)"',a) or [None,''])[1],
          when=g('dates-panel__when'), what=g('dates-panel__what'), badge=txt((re.search(r'timeline__badge[^>]*>(.*?)</span>',b,re.S) or [None,''])[1]),
          cons=(re.search(r'data-consequence="([^"]*)"',b) or [None,''])[1], prov='provisional' in b.lower(),
          src=(re.search(r'dates-panel__src" href="([^"]*)"',b) or [None,''])[1], raw=txt(b)[:900]))
    links = re.findall(r'href="([^"]*)"', panel)
    return p, dict(h1=h1, title=title, items=items, panelText=txt(panel)[-400:], hasPanel=bool(m))
with cf.ThreadPoolExecutor(12) as ex: res = dict(ex.map(get, locs))
json.dump(res, open('D:/ibp-tmp/r3-crawl.json','w',encoding='utf8'), ensure_ascii=False, indent=0)
print(len(res), sum(1 for v in res.values() if not v['hasPanel']), sum(1 for v in res.values() if not v['items']))
