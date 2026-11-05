"""PIL building blocks for an episode's make_overlays.py (our own schematics / cards; never ask the image model for anatomy).
    from studio.diagrams import *
    card(W, H) -> (im, draw)  navy rounded card with cyan edge     text_card(['LOCAL', 'CIRCUITS'], (20,150,120), icon_fn)
    bar(col, W) comparison bar (same H for every bar)                circle_red() ring to circle a detail, arrow() thick arrow
    label(text, ...) outlined word plate                              thick(draw, pts, w0, w1, col) tapered stroke (limbs, tails)
    save(im, name) -> props/<name>.png
Rules: claims first (brief.md) — draw only what the claims say, no numbers the source does not give, species-correct counts
(8 arms, 6 legs, ...), schematic not photoreal. Keep text inside x 0.15-0.85 and above the caption band when placed."""
import math, os
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from .cfg import FONT

NAVY, CYAN, ORANGE, PINK, YELLOW = (14, 30, 70, 235), (90, 225, 255), (255, 150, 60), (255, 120, 150), (255, 210, 0)
WHITE, BLACK = (255, 255, 255), (0, 0, 0)

def font(px): return ImageFont.truetype(FONT, px)

def card(W, H, r=60, fill=NAVY, edge=CYAN):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([8, 8, W - 8, H - 8], radius=r, fill=fill, outline=edge + (255,), width=8)
    return im, d

def thick(d, pts, w0, w1, col):
    """Tapered stroke along pts (radius w0 -> w1)."""
    n = max(1, len(pts) - 1)
    for i, (x, y) in enumerate(pts):
        r = w0 + (w1 - w0) * i / n
        d.ellipse([x - r, y - r, x + r, y + r], fill=col)

def glow(im, overlay, radius=6):
    """Composite a drawn overlay with a soft glow under it."""
    im.alpha_composite(overlay.filter(ImageFilter.GaussianBlur(radius))); im.alpha_composite(overlay); return im

def bar(col, W=1000, H=120):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([4, 4, W - 4, H - 4], radius=H // 2 - 4, fill=col + (255,), outline=(0, 0, 0, 255), width=8)
    d.rounded_rectangle([24, 18, W - 24, H // 2 - 6], radius=20, fill=tuple(min(255, c + 60) for c in col) + (110,))
    return im

def text_card(lines, fill, icon=None, W=900, H=560, px=120):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([10, 10, W - 10, H - 10], radius=50, fill=fill + (255,), outline=(0, 0, 0, 255), width=14)
    f = font(px); y = 50
    for s in lines:
        tw = d.textlength(s, font=f); d.text(((W - tw) / 2, y), s, font=f, fill=WHITE, stroke_width=8, stroke_fill=BLACK); y += px + 15
    if icon: icon(d, W, H, y)
    return im

def label(s, px=110, fill=ORANGE, pad=30):
    f = font(px); tmp = ImageDraw.Draw(Image.new('RGBA', (1, 1)))
    w = int(tmp.textlength(s, font=f)) + 2 * pad; h = px + 2 * pad
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.text((pad, pad // 2), s, font=f, fill=fill, stroke_width=9, stroke_fill=BLACK)
    return im

def circle_red(W=900, H=900, col=(235, 35, 40)):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.ellipse([20, 20, W - 20, H - 20], outline=(0, 0, 0, 255), width=34); d.ellipse([20, 20, W - 20, H - 20], outline=col + (255,), width=20)
    return im

def arrow(W=420, H=200, col=CYAN):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for c, g in (((10, 10, 20), 14), (col, 0)):
        d.line([(20 + g // 2, H / 2), (W - 120, H / 2)], fill=c + (255,), width=44 + g)
        d.polygon([(W - 150 - g, H / 2 - 80 - g), (W - 150 - g, H / 2 + 80 + g), (W - 10, H / 2)], fill=c + (255,))
    return im

def save(im, name):
    os.makedirs('props', exist_ok=True); im.save(f'props/{name}.png'); return f'props/{name}.png'
