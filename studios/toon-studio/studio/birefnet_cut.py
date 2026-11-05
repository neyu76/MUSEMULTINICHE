"""Pose pictures -> full-frame RGBA cut-outs with BiRefNet (rembg 'birefnet-general'), same size as the picture, so a block at
x = y = 0.5, w = 1 sits exactly where the animal / person was. Also writes the upscaled art/NAME.png (1080 wide, Lanczos +
light unsharp). Standalone on purpose: runs in the rembg venv (local.json "birefnet_python"), not the main one.
usage (cwd = episode): python birefnet_cut.py NAME [NAME ...]     (art/NAME.jpg|png -> art/NAME.png + cut/NAME.png)"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter

W = 1080

def up(im):
    if im.size[0] == W: return im
    h = round(im.size[1] * W / im.size[0])
    return im.resize((W, h), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2))

def src(n):
    for ext in ('.jpg', '.jpeg', '.webp', '.png'):
        if os.path.exists(f'art/{n}{ext}'): return f'art/{n}{ext}'
    raise SystemExit(f'art/{n}.* not found')

if __name__ == '__main__':
    from rembg import new_session, remove
    S = new_session('birefnet-general')
    os.makedirs('cut', exist_ok=True)
    for n in sys.argv[1:]:
        im = up(Image.open(src(n)).convert('RGB')); im.save(f'art/{n}.png')
        a = np.array(remove(im, session=S, only_mask=True).convert('L')).astype(np.float32)
        a = np.clip((a - 20) * 255 / 215, 0, 255).astype(np.uint8)       # firmer edge, drop faint haze
        Image.fromarray(np.dstack([np.array(im), a]), 'RGBA').save(f'cut/{n}.png')
        ys, xs = np.where(a > 128)
        bb = (xs.min() / im.size[0], ys.min() / im.size[1], xs.max() / im.size[0], ys.max() / im.size[1]) if len(xs) else None
        print(n, im.size, 'bbox', tuple(round(v, 3) for v in bb) if bb else 'EMPTY MASK', flush=True)
