import sys
from PIL import Image, ImageDraw
out, crop, w, names = sys.argv[1], tuple(map(int, sys.argv[2].split(','))), int(sys.argv[3]), sys.argv[4:]
ims=[Image.open(n+'.png').convert('RGB').crop(crop) for n in names]
tw=w; th=int(tw*(crop[3]-crop[1])/(crop[2]-crop[0])); ims=[i.resize((tw,th)) for i in ims]
C=4 if len(ims)>4 else len(ims); R=(len(ims)+C-1)//C
s=Image.new('RGB',(tw*C,th*R),'white'); d=ImageDraw.Draw(s)
for i,(im,n) in enumerate(zip(ims,names)):
  x,y=(i%C)*tw,(i//C)*th; s.paste(im,(x,y)); d.rectangle((x,y,x+len(n)*6+6,y+14),fill='white'); d.text((x+3,y+1),n,fill='black')
s.save(out,quality=85)
