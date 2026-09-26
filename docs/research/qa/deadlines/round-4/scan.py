import json,re,collections,unicodedata
r=json.load(open('crawl.json',encoding='utf8'))
def norm(s): return unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()
GEN=set('university universities of the and college institute institution school technology technical sciences science applied arts art academy national state royal higher polytechnic politecnico universita universidad universite universitat de di del della des la le für fur und u in at for music business economics management medical medicine health studies international european new free central catholic open saint st city metropolitan campus faculty design music theatre'.split())
uni={p:v for p,v in r.items() if p.startswith('/universities/')}
keys={}
for p,v in uni.items():
  h=norm(v['h1']).split(' - ')[0]
  toks=[t for t in re.findall(r'[a-z]+',h) if t not in GEN and len(t)>=4]
  keys[p]=toks
extra=['reykjavik','akureyri','bifrost','athens','lyon','raffaele','higher colleges']
hits=[]
dom=collections.defaultdict(set)
for p,v in uni.items():
  for i in v['items']:
    d=re.sub(r'^https?://(www\d?\.)?','',i['src']).split('/')[0]; dom[d].add(p)
for p,v in uni.items():
  own=set(keys[p]); ownh=norm(v['h1'])
  for i in v['items']:
    w=norm(i['what'])
    wt=set(re.findall(r'[a-z]+',w))
    for q,ks in keys.items():
      if q==p or not ks: continue
      # match if all distinctive tokens of other school appear and not all own tokens appear
      if all(k in wt for k in ks) and not (own and all(k in wt for k in own)) and not any(k in ownh for k in ks):
        hits.append((p,i['when'],i['what'],'names '+uni[q]['h1']))
    for e in extra:
      if e in w and e not in ownh: hits.append((p,i['when'],i['what'],'names '+e))
print('pages',len(uni),'with items',sum(1 for v in uni.values() if v['items']))
for h in hits: print(h)
# source domains used by few pages, where domain appears to be another school's
print('--- rare domains shared by 2-4 school pages')
for d,ps in sorted(dom.items()):
  if 2<=len(ps)<=4: print(d, sorted(x.split('/')[2] for x in ps))
