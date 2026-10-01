import os, glob
from PIL import Image
for p in glob.glob('public/images/*/*'):
    if p.endswith('.webp'): continue
    im = Image.open(p).convert('RGB')
    w,h = im.size
    im = im.crop((0,0,w,int(h*0.92)))
    if im.width>1920: im = im.resize((1920, round(im.height*1920/im.width)), Image.LANCZOS)
    out = os.path.splitext(p)[0]+'.webp'
    for q in (82,76,70,64,58,50,42):
        im.save(out,'WEBP',quality=q,method=6)
        if os.path.getsize(out)<=320_000: break
    print(out, im.size, os.path.getsize(out)//1024,'KB q',q)
