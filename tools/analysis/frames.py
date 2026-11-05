#!/usr/bin/env python3
# frames.py v.mp4 out.jpg t : 12 consecutive native frames from t-0.2 s with per-frame diff — use to confirm a cut (one jump, no blend) vs dissolve (blended frames).
# fr.py v.mp4 out.jpg t  -> 12 consecutive frames at native 30fps starting t-0.2, plus per-frame mean abs diff (upper 62%)
import sys, subprocess, numpy as np
from PIL import Image, ImageDraw
src,out,t=sys.argv[1],sys.argv[2],float(sys.argv[3])
tw,th=120,213
raw=subprocess.run(['ffmpeg','-nostdin','-v','error','-ss',f'{max(0,t-0.2):.3f}','-i',src,'-frames:v','12','-vf',f'scale={tw}:{th}','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
fr=np.frombuffer(raw,np.uint8).reshape(-1,th,tw,3)
img=Image.new('RGB',(tw*len(fr),th+14),'black');d=ImageDraw.Draw(img)
for k,f in enumerate(fr):
    img.paste(Image.fromarray(f),(k*tw,14))
    if k: d.text((k*tw+2,1),f'{np.abs(f[:132].astype(int)-fr[k-1][:132].astype(int)).mean():.0f}',fill='yellow')
img.save(out)
