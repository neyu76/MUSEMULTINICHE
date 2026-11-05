#!/usr/bin/env python3
# strip.py v.mp4 out.jpg t1 t2 ...  -> each row: frames t-0.4..t+1.6 every 2 frames (11 thumbs), labelled
import sys, subprocess, numpy as np
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]; ts = [float(x) for x in sys.argv[3:]]
tw, th = 96, 170; rows = []
for t in ts:
    s = max(0, t - 0.4)
    raw = subprocess.run(['ffmpeg','-nostdin','-v','error','-ss',f'{s:.3f}','-i',src,'-t','2.0','-vf',f'fps=15,scale={tw}:{th}','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, th, tw, 3)[:30:1]
    row = Image.new('RGB', (60 + tw * 30, th), 'black'); d = ImageDraw.Draw(row); d.text((2, 70), f'{t:.1f}', fill='yellow')
    for k, f in enumerate(fr): row.paste(Image.fromarray(f), (60 + k * tw, 0))
    rows.append(row)
img = Image.new('RGB', (rows[0].width, th * len(rows)))
for r, row in enumerate(rows): img.paste(row, (0, r * th))
img.save(out, quality=80)
