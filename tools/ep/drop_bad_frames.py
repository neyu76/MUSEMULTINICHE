"""Delete rendered frames that are unreadable, wrong-sized, or all-black/flat (a killed or context-lost worker can leave a valid
JPEG that is just black — T015 had two such 1-frame black flashes at 14.0 s and 18.7 s). usage: python3 -I drop_bad_frames.py <frames_dir>"""
import glob, os, sys
import numpy as np
from PIL import Image
fs = sorted(glob.glob(os.path.join(sys.argv[1], 'f_*.jpg'))); size = None; bad = 0
for f in fs:
    try:
        im = Image.open(f); im.load(); size = size or im.size
        if im.size != size: raise ValueError('size')
        g = np.asarray(im.convert('L').resize((180, 320)))[:210]
        if g.std() < 3: raise ValueError('flat')
    except Exception: os.remove(f); bad += 1
print(f'checked {len(fs)}, dropped bad frames: {bad}')
