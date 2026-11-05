import json,glob,numpy as np,re
from PIL import Image,ImageFont,ImageDraw,ImageFilter
from scipy import ndimage
caps=json.load(open('caps.json'))
def capmask(fn):
    a=np.asarray(Image.open(fn)).astype(int)
    m=(a.min(2)>215)
    lab,n=ndimage.label(m)
    keep=np.zeros_like(m)
    for i in range(1,n+1):
        ys,xs=np.where(lab==i)
        if len(ys)<15: continue
        if 40<ys.mean()<120 and 60<xs.mean()<660 and ys.max()-ys.min()<70: keep|=lab==i
    ys,xs=np.where(keep)
    if len(ys)==0: return None
    return keep[ys.min():ys.max()+1, xs.min():xs.max()+1]
def norm(m,H=48):
    h,w=m.shape; W=max(1,round(w*H/h))
    return np.asarray(Image.fromarray((m*255).astype(np.uint8)).resize((W,H),Image.BILINEAR))>127
def iou(a,b):
    W=max(a.shape[1],b.shape[1]); A=np.zeros((48,W),bool);B=np.zeros((48,W),bool)
    A[:,:a.shape[1]]=a;B[:,:b.shape[1]]=b
    return (A&B).sum()/max(1,(A|B).sum())
fonts={}
for p in glob.glob('x/*/package/files/*-latin-*-normal.woff'):
    mm=re.search(r'-latin-(\d+)-normal',p)
    if not mm: continue
    w=int(mm.group(1))
    if w<600: continue
    name=re.search(r'files/(.+)-latin',p).group(1)+f'-{w}'
    fonts[name]=p
def render(path,word,erode):
    f=ImageFont.truetype(path,120); bb=f.getbbox(word)
    im=Image.new('L',(bb[2]+20,bb[3]+20),0); ImageDraw.Draw(im).text((10,10),word,font=f,fill=255)
    if erode: im=im.filter(ImageFilter.MinFilter(2*erode+1))
    m=np.asarray(im)>127; ys,xs=np.where(m)
    if len(ys)==0: return None
    return m[ys.min():ys.max()+1,xs.min():xs.max()+1]
samples=[]
for c in caps:
    m=capmask(c['file'])
    if m is None: continue
    samples.append((c,norm(m),m.shape[1]/m.shape[0]))
res={}
if False:
    for name,p in fonts.items():
        sc=[]
        for c,nm,ar in samples:
            best=0
            for e in (0,3,6):
                r=render(p,c['word'],e)
                if r is not None: best=max(best,iou(nm,norm(r)))
            sc.append(best)
        sc=np.array(sc); res[name]=(float(np.median(sc)),float(np.mean(sc)))
#top=sorted(res.items(),key=lambda x:-x[1][0])
#for n,(md,mn) in top[:15]: print(f'{n:30s} median {md:.3f} mean {mn:.3f}')
print('samples',len(samples))
#json.dump(dict(top=top,n=len(samples)),open('font_match.json','w'),indent=0)
# second pass: clean samples only
S={}
for name,p in fonts.items():
    row=[]
    for c,nm,ar in samples:
        best=0
        for e in (0,3,6):
            r=render(p,c['word'],e)
            if r is not None: best=max(best,iou(nm,norm(r)))
        row.append(best)
    S[name]=np.array(row)
M=np.vstack(list(S.values())); good=M.max(0)>0.62
print('clean samples',good.sum())
rk=sorted(((n,float(np.mean(v[good])),float((v[good]>=M[:,good].max(0)-0.02).mean())) for n,v in S.items()),key=lambda x:-x[1])
for n,m,w in rk[:12]: print(f'{n:28s} meanIoU {m:.3f}  near-best share {w:.2f}')
json.dump(dict(rank=rk,clean=int(good.sum()),words=[samples[i][0]['file'] for i in np.where(good)[0]]),open('font_match2.json','w'),indent=0)
