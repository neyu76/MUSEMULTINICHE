"""Episode assets: pose cut-outs (BiRefNet), plates (upscaled + blurred copy), green/white-screen props, look sheets, grids."""
import glob, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter
from . import cfg

W = 1080

def _up(im):
    if im.size[0] == W: return im
    h = round(im.size[1] * W / im.size[0])
    return im.resize((W, h), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2))

def _art(n):
    for ext in ('.jpg', '.jpeg', '.webp', '.png'):
        p = f'art/{n}{ext}'
        if os.path.exists(p): return p
    raise SystemExit(f'art/{n}.* not found')

def poses(names):
    """BiRefNet in its own venv; names = picture names in art/ (no extension)."""
    if not names: raise SystemExit('name the poses: studio cut EP poses OC0 OC1 ...')
    py = cfg.BIREFNET_PY
    if not os.path.exists(py): raise SystemExit(f'no rembg/BiRefNet python at {py}: run setup.sh --birefnet or set local.json birefnet_python')
    subprocess.run([py, os.path.join(cfg.REPO, 'studio', 'birefnet_cut.py'), *names], check=True)

def plates(names):
    """art/NAME -> plate/NAME.png (1080 wide) + plate/NAME_b.png (blur radius = width / 300, the recipe's soft plate)."""
    os.makedirs('plate', exist_ok=True)
    for n in names:
        im = _up(Image.open(_art(n)).convert('RGB'))
        im.save(f'plate/{n}.png'); im.filter(ImageFilter.GaussianBlur(W / 300)).save(f'plate/{n}_b.png'); print('plate', n, im.size)

def props(force=False):
    """props/green/NAME.(jpg|png) -> props/NAME.png; a props/green/NAME.white marker file = shot on white (green prop)."""
    os.makedirs('props', exist_ok=True)
    env = dict(os.environ, PYTHONPATH=cfg.REPO)
    for f in sorted(glob.glob('props/green/*.jpg') + glob.glob('props/green/*.png') + glob.glob('props/green/*.webp')):
        n = os.path.splitext(os.path.basename(f))[0]; out = f'props/{n}.png'
        if not force and os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(f): continue
        white = ['--white'] if os.path.exists(f'props/green/{n}.white') else []
        subprocess.run([sys.executable, '-m', 'vidclone.cutout', f, out, *white], check=True, env=env); print('prop', n)

def sheet(out, paths, H=520):
    """Look sheet (labels = file names; RGBA shown on a grey checker)."""
    tiles = []
    for p in paths:
        im = Image.open(p)
        if im.mode == 'RGBA':
            bg = Image.new('RGBA', im.size, (120, 120, 120, 255))
            for y in range(0, im.size[1], 64):
                for x in range((y // 64 % 2) * 64, im.size[0], 128): bg.paste((160, 160, 160, 255), (x, y, x + 64, y + 64))
            im = Image.alpha_composite(bg, im)
        im = im.convert('RGB'); w = int(im.size[0] * H / im.size[1]); im = im.resize((w, H))
        ImageDraw.Draw(im).text((4, 4), os.path.basename(p)[:28], fill=(255, 0, 0)); tiles.append(im)
    cols = min(6, len(tiles)); rows = (len(tiles) + cols - 1) // cols; tw = max(t.size[0] for t in tiles)
    s = Image.new('RGB', (cols * (tw + 4), rows * (H + 4)), (20, 20, 20))
    for i, t in enumerate(tiles): s.paste(t, ((i % cols) * (tw + 4), (i // cols) * (H + 4)))
    s.save(out, quality=85); print(out, s.size)

def grid(out, paths, Wt=480):
    """Pictures side by side with a 0.05 grid (labels every 0.1) - coarse positions."""
    tiles = []
    for p in paths:
        im = Image.open(p).convert('RGB'); H = round(im.size[1] * Wt / im.size[0]); im = im.resize((Wt, H)); d = ImageDraw.Draw(im)
        for i in range(1, 20):
            v = i * 0.05; c = (255, 0, 0) if i % 2 == 0 else (255, 255, 0)
            d.line([(v * Wt, 0), (v * Wt, H)], fill=c, width=1); d.line([(0, v * H), (Wt, v * H)], fill=c, width=1)
            if i % 2 == 0: d.text((v * Wt + 2, 2), f'{v:.1f}', fill=(255, 0, 0)); d.text((2, v * H + 2), f'{v:.1f}', fill=(255, 0, 0))
        d.text((200, H - 14), os.path.basename(p), fill=(255, 255, 255)); tiles.append(im)
    s = Image.new('RGB', (sum(t.size[0] for t in tiles) + 4 * len(tiles), max(t.size[1] for t in tiles)))
    x = 0
    for t in tiles: s.paste(t, (x, 0)); x += t.size[0] + 4
    s.save(out, quality=85); print(out, s.size)

def crops(specs, out='out/crops.jpg'):
    """specs 'NAME:cx:cy[:half]' -> 0.01-grid crops (kit.grid_crop) on one sheet: read eye centres / anchors off them."""
    sys.path.insert(0, cfg.STYLE); import kit
    os.makedirs('out', exist_ok=True); L = []
    for a in specs:
        n, cx, cy, *h = a.split(':')
        p = f'art/{n}.png' if os.path.exists(f'art/{n}.png') else _art(n)
        L.append(kit.grid_crop(p, f'out/crop_{n}.jpg', float(cx), float(cy), float(h[0]) if h else 0.1))
    sheet(out, L)
