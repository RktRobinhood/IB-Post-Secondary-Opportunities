import sys,os,re
from PIL import Image,ImageDraw
d,out,t0,t1,crop,cols,tw=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]),tuple(map(int,sys.argv[5].split(','))),int(sys.argv[6]),int(sys.argv[7])
fs=sorted(os.listdir(d)); sel=[]
for f in fs:
  t=int(re.search(r'_(-?\d+)ms',f).group(1))
  if t0<=t<=t1: sel.append((t,f))
n=int(sys.argv[8]) if len(sys.argv)>8 else len(sel)
if len(sel)>n: sel=[sel[round(i*(len(sel)-1)/(n-1))] for i in range(n)]
ims=[]
for t,f in sel:
  im=Image.open(os.path.join(d,f)).convert('RGB'); sx=im.width/int(os.environ.get('VW','1280'))
  c=tuple(int(v*sx) for v in crop); im=im.crop(c); th=int(tw*im.height/im.width); ims.append((t,im.resize((tw,th))))
th=ims[0][1].height; R=(len(ims)+cols-1)//cols
s=Image.new('RGB',(cols*tw,R*(th+18)),'black'); dr=ImageDraw.Draw(s)
for i,(t,im) in enumerate(ims):
  x,y=(i%cols)*tw,(i//cols)*(th+18); s.paste(im,(x,y+18)); dr.text((x+4,y+3),f'{t/1000:.2f} s',fill='white')
s.save(out,quality=85)
