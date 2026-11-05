"""Contact sheets Claude (or a person) reads to describe what the numbers cannot:
per-second grid, and start/middle/end of every shot."""
import os, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont
from .common import stills

def _font(sz):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', os.path.join(os.path.dirname(__file__), '..', 'fonts', 'WorkSans-latin-800.ttf')]:
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()

def _label(im, txt):
    d = ImageDraw.Draw(im); f = _font(max(12, im.width // 14))
    d.rectangle([0, 0, im.width, f.size + 8], fill=(0, 0, 0))
    d.text((4, 3), txt, fill=(255, 255, 0), font=f)
    return im

def grid(images, labels, cols, path, tile_w=216):
    if not images: return
    ims = []
    for p, l in zip(images, labels):
        im = Image.open(p).convert('RGB'); im = im.resize((tile_w, int(tile_w * im.height / im.width)))
        ims.append(_label(im, l))
    th = ims[0].height; rows = (len(ims) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * tile_w + (cols - 1) * 4, rows * th + (rows - 1) * 4), (40, 40, 40))
    for i, im in enumerate(ims):
        sheet.paste(im, ((i % cols) * (tile_w + 4), (i // cols) * (th + 4)))
    sheet.save(path, quality=88)

def seconds(work, out_dir, per_page=30, cols=6, prefix='sec'):
    os.makedirs(out_dir, exist_ok=True)
    fs = stills(work); paths = []
    for k in range(0, len(fs), per_page):
        p = f'{out_dir}/{prefix}_{k // per_page + 1:02d}.jpg'
        grid(fs[k:k + per_page], [f'{i + 0.5:.1f}s' for i in range(k, min(len(fs), k + per_page))], cols, p)
        paths.append(p)
    return paths

def shots(video, shot_list, work, out_dir, per_page=8):
    """3 frames per shot (start+0.1, middle, end-0.1) from the original video."""
    os.makedirs(f'{work}/shotframes', exist_ok=True); os.makedirs(out_dir, exist_ok=True)
    imgs, labs = [], []
    for i, s in enumerate(shot_list):
        for tag, t in (('a', s['start'] + 0.1), ('m', (s['start'] + s['end']) / 2), ('b', max(s['start'], s['end'] - 0.1))):
            p = f'{work}/shotframes/{i:03d}{tag}.jpg'
            if not os.path.exists(p):
                subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{t:.3f}', '-i', video, '-frames:v', '1',
                                '-vf', 'scale=270:-2', '-q:v', '3', p], check=True)
            imgs.append(p); labs.append(f'#{i + 1} {t:.1f}s {s.get("move") or ""}' if tag == 'a' else f'{t:.1f}s')
    paths = []
    step = per_page * 3
    for k in range(0, len(imgs), step):
        p = f'{out_dir}/shots_{k // step + 1:02d}.jpg'
        grid(imgs[k:k + step], labs[k:k + step], 6, p, tile_w=200)
        paths.append(p)
    return paths

def compare(sample_work, out_work, path, n=12):
    """Sample vs output at the same relative positions, side by side (sample left)."""
    a, b = stills(sample_work), stills(out_work)
    if not a or not b: return
    pick = lambda fs: [fs[int(x)] for x in np.linspace(0, len(fs) - 1, n)]
    imgs, labs = [], []
    for i, (x, y) in enumerate(zip(pick(a), pick(b))):
        imgs += [x, y]; labs += [f'sample {i / (n - 1) * 100:.0f}%', 'new']
    grid(imgs, labs, 6, path, tile_w=200)
