#!/bin/bash
# stills.sh name t1,t2,...  -> /tmp/rc_stills/<name>.png (lưới ảnh tĩnh, vạch đỏ = vị trí phụ đề). SS=1 mặc định (xem nhanh)
cd "$(dirname "$0")"; export SS=${SS:-1}; rm -rf ${ST:-/tmp/rc_stills}/$1; timeout 900 node render.js ${ST:-/tmp/rc_stills}/$1 0 0 30 $2 2>&1 | grep -E "err|done" | tail -5
python3 - "$1" <<'PY'
import sys,glob
from PIL import Image, ImageDraw
n=sys.argv[1]; fs=sorted(glob.glob(f'/tmp/rc_stills/{n}/still_*.jpg'),key=lambda f:float(f.split('_')[-1][:-4]))
cols=min(6,len(fs)); rows=(len(fs)+cols-1)//cols; o=Image.new('RGB',(cols*300,rows*533)); d=ImageDraw.Draw(o)
for i,f in enumerate(fs):
  im=Image.open(f).resize((300,533)); o.paste(im,((i%cols)*300,(i//cols)*533)); d.text(((i%cols)*300+6,(i//cols)*533+6),f.split('_')[-1][:-4],fill='yellow')
  d.line([((i%cols)*300,(i//cols)*533+382),((i%cols)*300+300,(i//cols)*533+382)],fill=(255,0,0))
o.save(f'/tmp/rc_stills/{n}.png')
PY
