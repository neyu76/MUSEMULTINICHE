"""Animated layers drawn on a shot's picture (image coordinates, before the camera move), so they stick to the scene.

A shot may carry "layers": [...]; times are seconds from the shot start, positions 0..1 of the picture.
  {"type": "eyes", "l": [x, y], "r": [x, y], "size": 0.09,          # eye diameter / picture width
   "keys": [{"t": 0, "look": [0, 0], "brow": "neutral", "open": 1, "scale": 1}, ...],   # held until the next key
   "blink": true, "lid": "#7a7f8a" | null}                           # lid colour (default: sampled around the eye)
     brow: neutral | up | angry | sad | worried | smug | none;  open: 1 open, 0.5 half lid, 0 closed (arc)
  {"type": "png", "src": "props/hand.png", "t0": 0.4, "t1": 2.0, "x": 0.5, "y": 0.3, "w": 0.4, "rot": 0, "alpha": 1,
   "in": "pop|slide_left|slide_right|slide_top|slide_bottom|fade|none", "in_dur": 0.2, "out": "...", "out_dur": 0.15,
   "keys": [{"t": 0.6, "x": .., "y": .., "w": .., "rot": .., "ease": "inout|linear|in|out|back", "hop": 0.02, "hops": 3}],
   "wobble": 4, "flip": false}       # keys = keyframed block animation (missing fields hold); hop = bounces on the way
  {"type": "icon", "name": "question|exclaim|x|check|sweat|tear|zzz|spark|lines|arrow_down", ...same placement/animation as png}
  {"type": "lens", "src": "art/zoomed.png", "crop": [cx, cy, width_frac], ...}  # magnifier showing another picture
  {"type": "warp", "t0": 0, "t1": 9, "handles": [                    # puppet warp = cut-out part animation, no holes
     {"x": .5, "y": .3, "r": .12 | "rx": .., "ry": .., "hard": 1-3,     # region (gaussian; hard > 1 = flatter plateau)
      "move": "chew|bob|breathe|wag|nod|sway|jiggle|shake", "amp": 0.01, "hz": 2.5, "dir": [0, 1], "rot": 6,
      "pivot": [x, y], "phase": 0, "t0": .., "t1": .., "keys": [{"t": 1.2, "dx": 0, "dy": -0.02, "rot": 0, "s": 0, "dur": 0.2}]}]}
     eyes (and layers with "follow": true) ride on the warp at their position
  {"type": "cutout", "id": "g", "src": "cut/B1.png", "x": .5, "y": .5, "w": 1,   # character on its own layer over a clean plate
   "breathe": 0.012, "breathe_hz": 0.8, "sway": 1.5, "sway_hz": 0.6, "pivot": [0.5, 1.0],   # pivot in sprite fractions
   "pose": [{"t": 3.0, "sway": -6, "squash": 0.04, "dur": 0.2}], "keys": [...], "in": "slide_bottom",
   "warp": [handles in sprite fractions — jaw chew, head bob, tail wag, foot lift],
   "parts": [{"ellipse": [x, y, rx, ry], "erot": 0, "pivot": [x, y], "hole": "#2b1714",     # jaw / paw lifted off the block
              "keys": [{"t": .., "rot": 12, "dy": 0.01, "dur": 0.12, "ease": ".."}], "chew": {"t0", "t1", "hz", "rot", "dy"}}],
   "shadow": {"x": 0.5, "y": 0.95, "w": 0.5, "h": 0.05, "alpha": 0.35}}                   # contact shadow (sprite fractions)
  eyes: + "single": "l"|"r" (profile: one eye), "rim": true, "brow_w": 0.2; keys add "pupil": 0.6, "low": 0.3 (lower lid),
        "mood": "happy" (closed ^ arcs) | "shock" (small pupils, bigger eyes)
  children: {"type": "eyes", "parent": "g", "l": [x, y], "r": [x, y], "size": .., ...}  # coords + size in parent fractions
  {"type": "text", "text": "RIGHT?", "font": "Anton-Regular.ttf", "size": 0.12, "fill": "#ffffff", "edge": "#000000",
   "in": "bounce_letters|pop|...", "texts": [[t, "MAY"], [t2, "JUN"]] (string changes: calendars, counters), ...}
  icons also: skull | heart | clock | halo | fire | zap | note
  {"type": "meter", "style": "battery|bar", "level": 1, "levels": [[t, 1.0], [t2, 0.1]], "fill": null, ...placement}
  {"type": "bubble", "kind": "thought|speech", "text": "Obey", "texts": [[t, "go rogue"]], "tail": "bl|br", ...placement}
  {"type": "tint", "color": "#0a1030", "alpha": 0.4, "levels": [[t, 0.6], [t2, 0.0]], "t0": .., "t1": ..}   # colour wash
  cutout also: "fill": {"color": "#101010", "level_color": "#f2d21b", "levels": [[t, 0.8], [t2, 0.1]]}  # silhouette gauge
               "glow": {"color": "#ff3b5c", "alpha": 0.7, "r": 0.015, "hz": 1.5}                        # pulsing halo
  keys may carry "alpha" (fade a block in / out, ghosts). layers.shift_times(layers, dt) moves every time field.
"""
import math, os, zlib, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

FONTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts')
_cache = {}

def _hex(c):
    c = c.lstrip('#'); return (int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16))

def _ease_out_back(p, s=1.9):
    p = min(1.0, max(0.0, p)) - 1; return 1 + (s + 1) * p ** 3 + s * p ** 2

def _ease(p, kind='inout'):
    p = min(1.0, max(0.0, p))
    if kind == 'linear': return p
    if kind == 'in': return p * p
    if kind == 'out': return 1 - (1 - p) ** 2
    if kind == 'back': return _ease_out_back(p)      # overshoot and settle (landing, snapping into place)
    return p * p * (3 - 2 * p)

def level(pts, t, default=0.0):
    """Value of a [[t, v], ...] curve at t: linear between points, held before / after."""
    if not pts: return default
    if t <= pts[0][0]: return pts[0][1]
    for (t0, v0), (t1, v1) in zip(pts, pts[1:]):
        if t < t1: return v0 + (v1 - v0) * (t - t0) / max(1e-6, t1 - t0)
    return pts[-1][1]

def current_text(L, t):
    """"texts": [[t, "MAY"], [t2, "JUN"], ...] switches the string (calendars, counters, bubbles that change their words)."""
    s = L.get('text', '')
    for k in L.get('texts', []):
        if t >= k[0]: s = k[1]
    return s

def shift_times(layers, dt):
    """Copy of layers with every time field moved by -dt (absolute script seconds -> shot seconds)."""
    import copy
    out = copy.deepcopy(layers)
    def sh(v): return round(v - dt, 3)
    for L in out:
        for k in ('t0', 't1'):
            if k in L: L[k] = sh(L[k])
        for k in L.get('keys', []) + L.get('pose', []): k['t'] = sh(k['t'])
        for f in ('texts', 'levels'):
            if f in L: L[f] = [[sh(a)] + list(b) for a, *b in L[f]]
        if isinstance(L.get('fill'), dict) and 'levels' in L['fill']:
            L['fill']['levels'] = [[sh(a), b] for a, b in L['fill']['levels']]
        for P in L.get('parts', []):
            for k in P.get('keys', []): k['t'] = sh(k['t'])
            if P.get('chew'):
                for kk in ('t0', 't1'):
                    if kk in P['chew']: P['chew'][kk] = sh(P['chew'][kk])
        for h in L.get('warp', []) + L.get('handles', []):
            for kk in ('t0', 't1'):
                if kk in h: h[kk] = sh(h[kk])
            for k in h.get('keys', []): k['t'] = sh(k['t'])
    return out

def _paste(img, rgba, cx, cy, alpha=1.0):
    """Alpha-blend an RGBA (numpy, RGB order) centred at (cx, cy) px onto a BGR float image."""
    h, w = rgba.shape[:2]; H, W = img.shape[:2]
    x0, y0 = int(round(cx - w / 2)), int(round(cy - h / 2))
    sx0, sy0 = max(0, -x0), max(0, -y0); dx0, dy0 = max(0, x0), max(0, y0)
    dx1, dy1 = min(W, x0 + w), min(H, y0 + h)
    if dx1 <= dx0 or dy1 <= dy0: return
    patch = rgba[sy0:sy0 + dy1 - dy0, sx0:sx0 + dx1 - dx0].astype(np.float32)
    a = patch[..., 3:4] / 255.0 * alpha
    img[dy0:dy1, dx0:dx1] = img[dy0:dy1, dx0:dx1] * (1 - a) + patch[..., 2::-1][..., :3] * a  # RGB -> BGR

def _transform(rgba, scale, rot, flip=False):
    if flip: rgba = rgba[:, ::-1]
    h, w = rgba.shape[:2]
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    out = cv2.resize(rgba, (nw, nh), interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_LINEAR)
    if rot:
        d = int(math.hypot(nw, nh)) + 2
        M = cv2.getRotationMatrix2D((nw / 2, nh / 2), -rot, 1.0); M[0, 2] += (d - nw) / 2; M[1, 2] += (d - nh) / 2
        out = cv2.warpAffine(out, M, (d, d), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
    return out

# ---------------------------------------------------------------- sprites (png / icon / text) as RGBA numpy
def _load_png(path):
    if path not in _cache:
        im = Image.open(path).convert('RGBA'); _cache[path] = np.array(im)
    return _cache[path]

def _font(name, px):
    p = os.path.join(FONTS, name or 'Anton-Regular.ttf')
    return ImageFont.truetype(p if os.path.exists(p) else os.path.join(FONTS, 'Anton-Regular.ttf'), px)

def _text_rgba(text, px, fill='#ffffff', edge='#000000', font=None):
    key = ('t', text, px, fill, edge, font)
    if key not in _cache:
        f = _font(font, px); ew = max(2, px // 12)
        x0, y0, x1, y1 = ImageDraw.Draw(Image.new('L', (1, 1))).textbbox((0, 0), text, font=f)
        im = Image.new('RGBA', (x1 - x0 + 4 * ew, y1 - y0 + 4 * ew), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((2 * ew - x0, 2 * ew - y0), text, font=f, fill=fill, stroke_width=ew, stroke_fill=edge)
        _cache[key] = np.array(im)
    return _cache[key]

def icon_rgba(name, px=256):
    """Flat cartoon icons with thick black outlines, drawn at 4x then reduced."""
    key = ('i', name, px)
    if key in _cache: return _cache[key]
    S = px * 4; im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im); k = S / 100
    if name in ('question', 'exclaim'):
        ch = '?' if name == 'question' else '!'
        f = _font('Anton-Regular.ttf', int(S * 0.85))
        x0, y0, x1, y1 = d.textbbox((0, 0), ch, font=f)
        d.text(((S - (x1 - x0)) / 2 - x0, (S - (y1 - y0)) / 2 - y0), ch, font=f, fill=(226, 30, 38, 255), stroke_width=int(6 * k), stroke_fill=(0, 0, 0, 255))
    elif name == 'x':
        for a, b in (((15, 15), (85, 85)), ((85, 15), (15, 85))):
            d.line([(a[0] * k, a[1] * k), (b[0] * k, b[1] * k)], fill=(0, 0, 0, 255), width=int(24 * k))
        for a, b in (((15, 15), (85, 85)), ((85, 15), (15, 85))):
            d.line([(a[0] * k, a[1] * k), (b[0] * k, b[1] * k)], fill=(232, 28, 36, 255), width=int(15 * k))
    elif name == 'check':
        pts = [(12 * k, 52 * k), (40 * k, 80 * k), (88 * k, 20 * k)]
        d.line(pts, fill=(0, 0, 0, 255), width=int(26 * k), joint='curve'); d.line(pts, fill=(40, 200, 60, 255), width=int(16 * k), joint='curve')
    elif name in ('sweat', 'tear'):
        col = (90, 180, 245, 255) if name == 'sweat' else (60, 150, 240, 255)
        poly = [(50 * k + 30 * k * math.sin(a) * (1 - math.cos(a)) / 2 * 1.6, 15 * k + 70 * k * (1 - math.cos(a)) / 2) for a in np.linspace(0, 2 * math.pi, 60)]
        d.polygon(poly, fill=col, outline=(0, 0, 0, 255), width=int(5 * k))
        d.ellipse([42 * k, 50 * k, 50 * k, 62 * k], fill=(255, 255, 255, 220))
    elif name == 'zzz':
        for i, (x, y, s) in enumerate(((55, 10, 40), (30, 45, 30), (10, 72, 22))):
            f = _font('Anton-Regular.ttf', int(s * k)); d.text((x * k, y * k), 'Z', font=f, fill=(255, 255, 255, 255), stroke_width=int(4 * k), stroke_fill=(0, 0, 0, 255))
    elif name == 'spark':
        c = 50 * k
        for a in range(0, 360, 45):
            r1, r2 = (44 if a % 90 == 0 else 28) * k, 10 * k
            ax, ay = math.cos(math.radians(a)), math.sin(math.radians(a))
            d.line([(c + ax * r2, c + ay * r2), (c + ax * r1, c + ay * r1)], fill=(255, 220, 40, 255), width=int(7 * k))
    elif name == 'arrow_down':
        poly = [(35, 4), (65, 4), (65, 58), (86, 58), (50, 96), (14, 58), (35, 58)]
        d.polygon([(x * k, y * k) for x, y in poly], fill=(255, 255, 255, 255), outline=(0, 0, 0, 255), width=int(5 * k))
    elif name == 'lines':  # little strain / surprise lines
        for x0, y0, x1, y1 in ((30, 40, 15, 10), (50, 35, 50, 5), (70, 40, 85, 10)):
            d.line([(x0 * k, y0 * k), (x1 * k, y1 * k)], fill=(0, 0, 0, 255), width=int(8 * k))
    elif name == 'skull':   # poison / death
        B, Wt = (0, 0, 0, 255), (255, 255, 255, 255)
        d.ellipse([16 * k, 8 * k, 84 * k, 70 * k], fill=Wt, outline=B, width=int(5 * k))
        d.rounded_rectangle([30 * k, 55 * k, 70 * k, 90 * k], radius=6 * k, fill=Wt, outline=B, width=int(5 * k))
        d.rectangle([33 * k, 52 * k, 67 * k, 62 * k], fill=Wt)
        for ex in (35, 65): d.ellipse([(ex - 11) * k, 32 * k, (ex + 11) * k, 54 * k], fill=B)
        d.polygon([(50 * k, 56 * k), (45 * k, 66 * k), (55 * k, 66 * k)], fill=B)
        for tx in (40, 50, 60): d.line([(tx * k, 74 * k), (tx * k, 88 * k)], fill=B, width=int(4 * k))
    elif name == 'heart':
        poly = [(50 + 16 * math.sin(a) ** 3 * 2.6, 48 - (13 * math.cos(a) - 5 * math.cos(2 * a) - 2 * math.cos(3 * a) - math.cos(4 * a)) * 2.6)
                for a in np.linspace(0, 2 * math.pi, 80)]
        d.polygon([(x * k, y * k) for x, y in poly], fill=(235, 40, 70, 255), outline=(0, 0, 0, 255), width=int(5 * k))
    elif name == 'clock':   # alarm clock (waiting / time running out)
        B = (0, 0, 0, 255)
        for bx in (22, 78): d.ellipse([(bx - 13) * k, 6 * k, (bx + 13) * k, 30 * k], fill=(230, 60, 50, 255), outline=B, width=int(4 * k))
        d.ellipse([14 * k, 16 * k, 86 * k, 88 * k], fill=(255, 255, 255, 255), outline=B, width=int(6 * k))
        d.line([(50 * k, 52 * k), (50 * k, 28 * k)], fill=B, width=int(5 * k)); d.line([(50 * k, 52 * k), (66 * k, 60 * k)], fill=B, width=int(5 * k))
    elif name == 'halo':    # angel ring (lost / gone)
        d.ellipse([8 * k, 36 * k, 92 * k, 64 * k], outline=(255, 245, 190, 255), width=int(9 * k))
        d.ellipse([8 * k, 36 * k, 92 * k, 64 * k], outline=(255, 255, 255, 255), width=int(4 * k))
    elif name == 'fire':
        outer = [(50, 4), (66, 30), (80, 52), (78, 76), (62, 94), (38, 94), (22, 76), (22, 52), (36, 36), (42, 50)]
        d.polygon([(x * k, y * k) for x, y in outer], fill=(250, 120, 20, 255), outline=(0, 0, 0, 255), width=int(5 * k))
        d.polygon([(x * k, y * k) for x, y in [(50, 46), (62, 66), (60, 86), (40, 86), (38, 68)]], fill=(255, 220, 60, 255))
    elif name == 'zap':     # energy / shock
        poly = [(58, 2), (20, 56), (46, 56), (36, 98), (80, 40), (54, 40), (66, 2)]
        d.polygon([(x * k, y * k) for x, y in poly], fill=(255, 225, 40, 255), outline=(0, 0, 0, 255), width=int(5 * k))
    elif name == 'note':    # music / singing / calling
        B = (0, 0, 0, 255)
        d.ellipse([18 * k, 66 * k, 46 * k, 90 * k], fill=B); d.ellipse([56 * k, 56 * k, 84 * k, 80 * k], fill=B)
        d.line([(44 * k, 78 * k), (44 * k, 16 * k)], fill=B, width=int(6 * k)); d.line([(82 * k, 68 * k), (82 * k, 8 * k)], fill=B, width=int(6 * k))
        d.polygon([(44 * k, 16 * k), (82 * k, 6 * k), (82 * k, 20 * k), (44 * k, 30 * k)], fill=B)
    arr = np.array(im.resize((px, px), Image.LANCZOS)); _cache[key] = arr
    return arr

def meter_rgba(v, style='battery', fill=None, px=400, blink=False):
    """Energy meter: battery (body + nub, fill from the left) or bar; colour follows the level unless "fill" is set;
    blinks red when nearly empty."""
    v = float(min(1, max(0, v)))
    key = ('m', round(v, 3), style, fill, px, blink and v < 0.15)
    if key in _cache: return _cache[key]
    S = 4; w, h = px * S, int(px * 0.5) * S
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im); ow = int(h * 0.09)
    col = _hex(fill) if fill else ((80, 200, 70) if v > 0.6 else (250, 215, 30) if v > 0.25 else (235, 50, 40))
    if blink and v < 0.15: col = (255, 255, 255)
    nub = int(w * 0.07) if style == 'battery' else 0
    body = [ow, ow, w - nub - ow, h - ow]
    d.rounded_rectangle(body, radius=int(h * 0.12), fill=(255, 255, 255, 235), outline=(0, 0, 0, 255), width=ow)
    if nub: d.rounded_rectangle([w - nub - ow * 1.5, h * 0.3, w - ow * 0.5, h * 0.7], radius=int(h * 0.05), fill=(0, 0, 0, 255))
    pad = ow * 2.2; x1 = body[0] + pad + (body[2] - body[0] - 2 * pad) * v
    if v > 0.005: d.rounded_rectangle([body[0] + pad, body[1] + pad, x1, body[3] - pad], radius=int(h * 0.06), fill=col + (255,))
    arr = np.array(im.resize((px, int(px * 0.5)), Image.LANCZOS)); _cache[key] = arr
    return arr

def bubble_rgba(text, kind='thought', tail='bl', font=None, px=600):
    """White cartoon thought (cloud + trailing circles) or speech (oval + pointed tail) bubble with the words inside."""
    key = ('b', text, kind, tail, font, px)
    if key in _cache: return _cache[key]
    S = 3; W_, H_ = px * S, int(px * 0.72) * S
    im = Image.new('RGBA', (W_, H_), (0, 0, 0, 0)); d = ImageDraw.Draw(im); ow = int(W_ * 0.014)
    bx0, by0, bx1, by1 = W_ * 0.08, H_ * 0.05, W_ * 0.92, H_ * 0.7
    B, Wt = (0, 0, 0, 255), (255, 255, 255, 255)
    left = tail == 'bl'
    tx = bx0 + (bx1 - bx0) * (0.28 if left else 0.72)
    if kind == 'thought':
        blobs = []
        cx, cy, rx, ry = (bx0 + bx1) / 2, (by0 + by1) / 2, (bx1 - bx0) / 2, (by1 - by0) / 2
        for a in np.linspace(0, 2 * math.pi, 11)[:-1]:
            blobs.append((cx + math.cos(a) * rx * 0.78, cy + math.sin(a) * ry * 0.72, min(rx, ry) * 0.42))
        for (x, y, r) in blobs: d.ellipse([x - r - ow, y - r - ow, x + r + ow, y + r + ow], fill=B)
        d.ellipse([cx - rx * 0.86 - ow, cy - ry * 0.8 - ow, cx + rx * 0.86 + ow, cy + ry * 0.8 + ow], fill=B)
        for (x, y, r) in blobs: d.ellipse([x - r, y - r, x + r, y + r], fill=Wt)
        d.ellipse([cx - rx * 0.86, cy - ry * 0.8, cx + rx * 0.86, cy + ry * 0.8], fill=Wt)
        for i, r in enumerate((H_ * 0.06, H_ * 0.04)):
            x = tx + (-1 if left else 1) * W_ * 0.05 * (i + 1); y = by1 + H_ * 0.06 + i * H_ * 0.1
            d.ellipse([x - r, y - r, x + r, y + r], fill=Wt, outline=B, width=ow)
    else:
        d.polygon([(tx - W_ * 0.06, by1 - H_ * 0.08), (tx + W_ * 0.06, by1 - H_ * 0.08),
                   (tx + (-1 if left else 1) * W_ * 0.1, by1 + H_ * 0.22)], fill=Wt, outline=B)
        d.line([(tx - W_ * 0.06, by1 - H_ * 0.06), (tx + (-1 if left else 1) * W_ * 0.1, by1 + H_ * 0.22),
                (tx + W_ * 0.06, by1 - H_ * 0.06)], fill=B, width=ow)
        d.ellipse([bx0, by0, bx1, by1], fill=Wt, outline=B, width=ow)
        d.polygon([(tx - W_ * 0.05, by1 - H_ * 0.1), (tx + W_ * 0.05, by1 - H_ * 0.1),
                   (tx + (-1 if left else 1) * W_ * 0.085, by1 + H_ * 0.18)], fill=Wt)
    if text:   # largest size that fits inside the bubble
        size = int(H_ * 0.32)
        while size > 10:
            f = _font(font or 'Anton-Regular.ttf', size); x0, y0, x1, y1 = d.textbbox((0, 0), text, font=f)
            if x1 - x0 < (bx1 - bx0) * 0.72 and y1 - y0 < (by1 - by0) * 0.6: break
            size = int(size * 0.9)
        d.text(((bx0 + bx1) / 2 - (x1 - x0) / 2 - x0, (by0 + by1) / 2 - (y1 - y0) / 2 - y0), text, font=f, fill=B)
    arr = np.array(im.resize((px, int(px * 0.72)), Image.LANCZOS)); _cache[key] = arr
    return arr

# ---------------------------------------------------------------- animation
def _anim(L, t, W, H):
    """(cx, cy, w_px, rot, alpha, visible, prog_in) for a placed layer at shot time t."""
    t0, t1 = L.get('t0', 0.0), L.get('t1', 1e9)
    if t < t0 or t >= t1: return None
    x, y, w, rot, al = L.get('x', 0.5), L.get('y', 0.5), L.get('w', 0.2), L.get('rot', 0.0), L.get('alpha', 1.0)
    keys = L.get('keys') or []
    hop_dy = 0.0
    if keys:  # eased path between keys (first key = the base placement at t0); a key's "ease" shapes the way TO it,
        # "hop": amp (picture-height fraction) + "hops": n bounces on the way (walking / hopping blocks); "alpha" fades
        F = ('x', 'y', 'w', 'rot', 'alpha')
        pts = [dict(t=t0, x=x, y=y, w=w, rot=rot, alpha=al)]
        for k in keys:  # unspecified fields hold the previous key's value
            p0 = pts[-1]; pts.append(dict({f: p0[f] for f in F}, **k))
        for a, b in zip(pts, pts[1:]):
            if t >= b['t']: x, y, w, rot, al = [b[f] for f in F]; continue
            if t >= a['t']:
                u = (t - a['t']) / max(1e-6, b['t'] - a['t'])
                e = _ease(u, b.get('ease', 'inout'))
                x, y, w, rot, al = [a[f] + (b[f] - a[f]) * e for f in F]
                if b.get('hop'): hop_dy = -b['hop'] * abs(math.sin(math.pi * b.get('hops', 2) * u))
            break
    scale, alpha, dx, dy = 1.0, al, 0.0, hop_dy
    kin, din = L.get('in', 'pop'), L.get('in_dur', 0.2)
    p = (t - t0) / din if din else 1.0
    if p < 1:
        if kin == 'pop': scale = max(0.01, _ease_out_back(p))
        elif kin == 'fade': alpha *= p
        elif kin.startswith('slide_'):
            e = 1 - (1 - min(1, p)) ** 3; far = {'slide_left': (-1, 0), 'slide_right': (1, 0), 'slide_top': (0, -1), 'slide_bottom': (0, 1)}[kin]
            dx, dy = far[0] * (1 - e) * 1.1, far[1] * (1 - e) * 1.1
    kout, dout = L.get('out', 'none'), L.get('out_dur', 0.15)
    if t1 < 1e8 and kout != 'none' and t > t1 - dout:
        q = (t1 - t) / dout
        if kout == 'pop': scale *= max(0.01, q)
        elif kout == 'fade': alpha *= q
        elif kout.startswith('slide_'):
            far = {'slide_left': (-1, 0), 'slide_right': (1, 0), 'slide_top': (0, -1), 'slide_bottom': (0, 1)}[kout]
            dx += far[0] * (1 - q) ** 2 * 1.1; dy += far[1] * (1 - q) ** 2 * 1.1
    if L.get('wobble'): rot += L['wobble'] * math.sin((t - t0) * 2 * math.pi * L.get('wobble_hz', 1.6))
    if L.get('bob'): dy += L['bob'] * math.sin((t - t0) * 2 * math.pi * L.get('bob_hz', 3.0))
    return (x + dx) * W, (y + dy) * H, w * W * scale, rot, alpha, p

def lens_rgba(src, crop=(0.5, 0.5, 0.6), px=700):
    """Magnifying glass: circle showing part of another picture (crop = centre x, y and width fraction), silver rim, handle."""
    key = ('lens', src, tuple(crop), px)
    if key in _cache: return _cache[key]
    im = Image.open(src).convert('RGB'); w, h = im.size
    cw = crop[2] * w; box = (crop[0] * w - cw / 2, crop[1] * h - cw / 2, crop[0] * w + cw / 2, crop[1] * h + cw / 2)
    disc = im.crop(tuple(int(v) for v in box)).resize((px, px), Image.LANCZOS)
    S = int(px * 1.55); out = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(out)
    o = int(px * 0.06); c0 = o
    hx0, hy0 = c0 + px * 0.82, c0 + px * 0.82  # handle towards bottom-right
    d.line([(hx0, hy0), (S - o, S - o)], fill=(25, 25, 25, 255), width=int(px * 0.13))
    mask = Image.new('L', (px, px), 0); ImageDraw.Draw(mask).ellipse([0, 0, px - 1, px - 1], fill=255)
    out.paste(disc, (c0, c0), mask)
    d.ellipse([c0 - o * 0.6, c0 - o * 0.6, c0 + px + o * 0.6, c0 + px + o * 0.6], outline=(205, 210, 215, 255), width=int(o * 1.1))
    d.ellipse([c0 - o * 1.1, c0 - o * 1.1, c0 + px + o * 1.1, c0 + px + o * 1.1], outline=(0, 0, 0, 255), width=max(2, int(o * 0.25)))
    d.arc([c0 + px * 0.12, c0 + px * 0.1, c0 + px * 0.6, c0 + px * 0.55], 200, 250, fill=(255, 255, 255, 170), width=int(px * 0.03))
    arr = np.array(out); _cache[key] = arr
    return arr

def _draw_sprite(img, L, t, base_dir):
    W, H = img.shape[1], img.shape[0]
    a = _anim(L, t, W, H)
    if not a: return
    cx, cy, wpx, rot, alpha, p = a
    if L['type'] == 'png': spr = _load_png(os.path.join(base_dir, L['src']))
    elif L['type'] == 'lens': spr = lens_rgba(os.path.join(base_dir, L['src']), L.get('crop', (0.5, 0.5, 0.6)))
    elif L['type'] == 'icon': spr = icon_rgba(L['name'])
    elif L['type'] == 'meter': spr = meter_rgba(level(L.get('levels'), t, L.get('level', 1.0)), L.get('style', 'battery'),
                                                L.get('fill'), blink=(t * 4) % 1 < 0.5)
    elif L['type'] == 'bubble': spr = bubble_rgba(current_text(L, t), L.get('kind', 'thought'), L.get('tail', 'bl'), L.get('font'))
    else:
        txt = current_text(L, t); px = max(8, int(L.get('size', 0.1) * W))
        if L.get('in') == 'bounce_letters':  # letters drop in one by one with a bounce, slight per-letter tilt
            n = len(txt); step = L.get('letter_dt', 0.05); x = cx - sum(_text_rgba(c, px, L.get('fill', '#ffffff'), L.get('edge', '#000000'), L.get('font')).shape[1] * 0.92 for c in txt) / 2
            for i, ch in enumerate(txt):
                s = _text_rgba(ch, px, L.get('fill', '#ffffff'), L.get('edge', '#000000'), L.get('font'))
                q = (t - L.get('t0', 0) - i * step) / 0.18
                if q <= 0: x += s.shape[1] * 0.92; continue
                yy = cy - (1 - _ease_out_back(min(1, q), 2.4)) * px * 0.8
                s2 = _transform(s, 1.0, (i % 2 * 2 - 1) * 6 + L.get('rot', 0))
                _paste(img, s2, x + s.shape[1] / 2, yy, alpha); x += s.shape[1] * 0.92
            return
        spr = _text_rgba(txt, px, L.get('fill', '#ffffff'), L.get('edge', '#000000'), L.get('font'))
        s = _transform(spr, wpx / (L.get('w', 0.2) * W), rot)   # text size comes from "size"; only the animation scales it
        _paste(img, s, cx, cy, alpha); return
    s = _transform(spr, wpx / spr.shape[1], rot, L.get('flip', False))
    _paste(img, s, cx, cy, alpha)

# ---------------------------------------------------------------- procedural cartoon eyes
BROWS = {  # (inner_dy, outer_dy, lift) in eye diameters; inner = towards the nose
    'neutral': (0.0, 0.0, 0.0), 'up': (-0.12, -0.12, -0.18), 'angry': (0.2, -0.14, 0.02), 'sad': (-0.2, 0.08, 0.0),
    'worried': (-0.24, 0.05, -0.08), 'smug': (0.12, -0.02, 0.05)}

def _eye_state(E, t):
    st = {'look': [0, 0], 'brow': 'neutral', 'open': 1.0, 'scale': 1.0, 'pupil': 1.0, 'low': 0.0, 'mood': None}
    for k in E.get('keys', []):
        if t >= k['t']: st.update({kk: v for kk, v in k.items() if kk != 't'}); st['_t'] = k['t']
        else: break
    if st['mood'] == 'shock': st['pupil'] = min(st['pupil'], 0.55); st['scale'] = max(st['scale'], 1.2)
    if E.get('blink', True) and st['open'] > 0.4 and st['mood'] != 'happy':  # blink ~every 1.6-2.6 s for 0.12 s, never right after a key change
        period = 2.1 + (zlib.crc32(str(E.get('l') or E.get('r')).encode()) % 7) * 0.08   # stable across runs (hash() is salted)
        ph = (t + 0.7) % period
        if ph < 0.12 and t - st.get('_t', -9) > 0.35: st['open'] = 0.0
    return st

def _draw_eyes(img, E, t):
    H, W = img.shape[:2]
    st = _eye_state(E, t)
    D = E.get('size', 0.09) * W * st.get('scale', 1.0)
    S = 4  # supersample
    lid_col = _hex(E['lid']) if E.get('lid') else None
    rim = E.get('rim', True)   # sample style: light grey ring inside the outline
    sides = [(-1, 'l'), (1, 'r')]
    if E.get('single'):        # profile / three-quarter view: only the eye that is really visible ("l" or "r")
        sides = [s for s in sides if s[1] == E['single']]
    for side, key in sides:
        if not E.get(key): continue
        cx, cy = E[key][0] * W, E[key][1] * H
        if lid_col is None:  # median colour of a ring around the eye = skin colour for half lids
            r0 = int(D * 0.9); y0, y1, x0, x1 = int(max(0, cy - r0)), int(min(H, cy + r0)), int(max(0, cx - r0)), int(min(W, cx + r0))
            ring = img[y0:y1, x0:x1].reshape(-1, 3); lc = tuple(int(v) for v in np.median(ring, 0)[::-1]) if len(ring) else (120, 120, 120)
        else: lc = lid_col
        pad = int(D * 1.2); size = int(D + 2 * pad)
        im = Image.new('RGBA', (size * S, size * S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        c = size * S / 2; r = D * S / 2; ow = max(2, int(D * S * 0.085))
        box = [c - r, c - r, c + r, c + r]
        if st['mood'] == 'happy':  # closed happy eyes: a white upward band with a black edge (^ ^), readable on dark fur
            hb = [c - r * 0.95, c - r * 0.55, c + r * 0.95, c + r * 1.35]
            d.arc(hb, 195, 345, fill=(30, 30, 30, 255), width=int(ow * 4.2))
            d.arc([hb[0] + ow * 0.9, hb[1] + ow * 0.9, hb[2] - ow * 0.9, hb[3] - ow * 0.9], 197, 343, fill=(255, 255, 255, 255), width=int(ow * 2.4))
        elif st['open'] <= 0.05:  # closed: lid colour disc + a curved black line
            d.ellipse(box, fill=lc + (255,))
            d.arc([c - r * 0.85, c - r * 0.55, c + r * 0.85, c + r * 0.65], 15, 165, fill=(0, 0, 0, 255), width=ow)
        else:
            d.ellipse(box, fill=(255, 255, 255, 255))
            if rim: d.ellipse([c - r * 0.97, c - r * 0.97, c + r * 0.97, c + r * 0.97], outline=(150, 150, 150, 255), width=int(r * 0.16))
            lx, ly = st['look']; pr = r * 0.55 * st['pupil']
            px_, py_ = c + lx * (r - pr) * 0.8, c + ly * (r - pr) * 0.8
            d.ellipse([px_ - pr, py_ - pr, px_ + pr, py_ + pr], fill=(0, 0, 0, 255))
            d.ellipse([px_ - pr * 0.45 + pr * 0.25, py_ - pr * 0.65, px_ - pr * 0.05 + pr * 0.25, py_ - pr * 0.25], fill=(255, 255, 255, 235))
            if st['low'] > 0.02:  # lower lid pushes up (squint / suspicious / smile); always leaves the pupil a band
                low = min(st['low'], max(0.0, st['open'] - 0.38))
                low_y = c + r - 2 * r * low
                mask = Image.new('L', im.size, 0); ImageDraw.Draw(mask).ellipse(box, fill=255)
                lid = Image.new('RGBA', im.size, (0, 0, 0, 0)); ImageDraw.Draw(lid).rectangle([0, low_y, im.size[0], im.size[1]], fill=lc + (255,))
                im.paste(lid, (0, 0), Image.composite(lid, Image.new('RGBA', im.size, (0, 0, 0, 0)), mask).split()[3])
                d = ImageDraw.Draw(im); d.line([(c - r * 0.95, low_y), (c + r * 0.95, low_y)], fill=(0, 0, 0, 255), width=ow)
            if st['open'] < 0.95:  # upper lid covers the top part
                lid_y = c - r + 2 * r * (1 - st['open'])
                mask = Image.new('L', im.size, 0); ImageDraw.Draw(mask).ellipse(box, fill=255)
                lid = Image.new('RGBA', im.size, (0, 0, 0, 0)); ImageDraw.Draw(lid).rectangle([0, 0, im.size[0], lid_y], fill=lc + (255,))
                im.paste(lid, (0, 0), Image.composite(lid, Image.new('RGBA', im.size, (0, 0, 0, 0)), mask).split()[3])
                d = ImageDraw.Draw(im); d.line([(c - r * 0.98, lid_y), (c + r * 0.98, lid_y)], fill=(0, 0, 0, 255), width=ow)
            d.ellipse(box, outline=(30, 30, 30, 255), width=ow)
        b = st.get('brow', 'neutral')
        if b != 'none':
            inner, outer, lift = BROWS.get(b, BROWS['neutral'])
            if b == 'smug' and side == 1: inner, outer, lift = -0.1, -0.12, -0.12   # one brow up
            by = c - r * 1.18 + lift * D * S
            xi, xo = (c + side * -1 * r * 0.15, c + side * r * 1.0)  # inner end near the nose
            yi, yo = by + inner * D * S, by + outer * D * S
            bw = E.get('brow_w', 0.2)   # sample: thick rounded bar
            d.line([(xo, yo), ((xi + xo) / 2, min(yi, yo) - r * 0.12), (xi, yi)], fill=(0, 0, 0, 255), width=int(D * S * bw), joint='curve')
            for (px2, py2) in ((xo, yo), (xi, yi)):
                rr = D * S * bw / 2; d.ellipse([px2 - rr, py2 - rr, px2 + rr, py2 + rr], fill=(0, 0, 0, 255))
        arr = np.array(im.resize((size, size), Image.LANCZOS))
        _paste(img, arr, cx, cy)

# ---------------------------------------------------------------- puppet warp (cut-out style part animation)
def _handle_disp(hd, t, X, Y, W):
    """Displacement field (px) of one handle at time t on grid X, Y (px)."""
    cx, cy = hd['x'] * W, hd['y'] * hd['_H']
    rx = hd.get('rx', hd.get('r', 0.12)) * W; ry = hd.get('ry', hd.get('r', 0.12)) * W
    q = ((X - cx) / rx) ** 2 + ((Y - cy) / ry) ** 2
    wgt = np.exp(-q ** hd.get('hard', 1.0))
    amp = hd.get('amp', 0.01) * W; hz = hd.get('hz', 2.0); ph = hd.get('phase', 0.0)
    t0 = hd.get('t0', 0.0); tt = t - t0
    if tt < 0 or t >= hd.get('t1', 1e9): return 0, 0
    env = min(1.0, tt / 0.15) * (min(1.0, (hd.get('t1', 1e9) - t) / 0.15))    # ease the motion in and out
    mv = hd.get('move', 'bob'); dx = dy = 0.0
    s = np.sin(2 * np.pi * hz * tt + ph)
    px, py = hd.get('pivot', [hd['x'], hd['y']]); px, py = px * W, py * hd['_H']
    ang = 0.0; scl = 0.0
    if mv == 'bob':
        d = hd.get('dir', [0, 1]); dx, dy = d[0] * amp * s, d[1] * amp * s
    elif mv == 'chew':  # open-close, only downwards
        dy = amp * (0.5 - 0.5 * np.cos(2 * np.pi * hz * tt + ph))
    elif mv == 'breathe': scl = hd.get('amp', 0.01) * 2 * s
    elif mv in ('wag', 'nod', 'sway'): ang = np.radians(hd.get('rot', 6)) * s
    elif mv == 'jiggle':
        dx = amp * 0.6 * np.sin(2 * np.pi * 7.3 * tt + ph); dy = amp * np.sin(2 * np.pi * 11.1 * tt + ph * 1.7)
    elif mv == 'shake': dx = amp * np.sin(2 * np.pi * hz * 6 * tt + ph)
    for k in hd.get('keys', []):  # authored offsets, eased in by their own time
        a = _ease((t - k['t']) / k.get('dur', 0.2))
        if t < k['t']: break
        dx += k.get('dx', 0) * W * a; dy += k.get('dy', 0) * W * a; ang += np.radians(k.get('rot', 0)) * a; scl += k.get('s', 0) * a
    ox, oy = X - px, Y - py
    DX = dx + (np.cos(ang) - 1) * ox - np.sin(ang) * oy + scl * (X - cx)
    DY = dy + np.sin(ang) * ox + (np.cos(ang) - 1) * oy + scl * (Y - cy)
    return DX * wgt * env, DY * wgt * env

def _warp_field(warps, t, H, W, step=4):
    h, w = (H + step - 1) // step, (W + step - 1) // step
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32) * step
    DX = np.zeros((h, w), np.float32); DY = np.zeros((h, w), np.float32)
    for L in warps:
        if not (L.get('t0', 0) <= t < L.get('t1', 1e9)): continue
        for hd in L['handles']:
            hd = dict(hd, _H=H); a, b = _handle_disp(hd, t, X, Y, W)
            DX += a; DY += b
    return DX, DY, step

def _apply_warp(img, field, border=cv2.BORDER_REFLECT):
    DX, DY, step = field
    H, W = img.shape[:2]
    if not (np.abs(DX).max() > 0.05 or np.abs(DY).max() > 0.05): return img
    dx = cv2.resize(DX, (W, H), interpolation=cv2.INTER_LINEAR); dy = cv2.resize(DY, (W, H), interpolation=cv2.INTER_LINEAR)
    gx, gy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    return cv2.remap(img, gx - dx, gy - dy, cv2.INTER_LINEAR, borderMode=border, borderValue=0)

def _disp_at(field, x, y):
    DX, DY, step = field
    i, j = int(min(DY.shape[0] - 1, max(0, y / step))), int(min(DX.shape[1] - 1, max(0, x / step)))
    return float(DX[i, j]), float(DY[i, j])

# ---------------------------------------------------------------- cut-out puppets (a PNG character on its own layer)
def _cutout_matrix(L, t, W, H, sw, sh):
    """2x3 affine sprite px -> picture px for a cut-out at shot time t, plus the overall scale.
    Base placement x, y, w (+ keys / in / out like any layer), then breathe (scale anchored at the pivot, more in y)
    and sway (rotation about the pivot). pivot is in sprite fractions (default bottom centre)."""
    a = _anim(dict({'in': 'none'}, **L), t, W, H)   # cut-outs are simply there unless an entrance is asked for
    if not a: return None
    cx, cy, wpx, rot, alpha, _ = a
    k = wpx / sw
    th = np.radians(rot); c, s = np.cos(th), np.sin(th)
    M = np.array([[k * c, -k * s, 0], [k * s, k * c, 0], [0, 0, 1]], np.float64)
    M[0, 2] = cx - (M[0, 0] * sw / 2 + M[0, 1] * sh / 2); M[1, 2] = cy - (M[1, 0] * sw / 2 + M[1, 1] * sh / 2)
    pv = L.get('pivot', [0.5, 1.0]); P = M @ np.array([pv[0] * sw, pv[1] * sh, 1.0])
    tt = t - L.get('t0', 0.0)
    b = L.get('breathe', 0.0) * np.sin(2 * np.pi * L.get('breathe_hz', 0.8) * tt)
    sw_deg = L.get('sway', 0.0) * np.sin(2 * np.pi * L.get('sway_hz', 0.6) * tt + 0.7)
    for kk in L.get('pose', []):  # authored extra sway / squash keys, eased
        if t < kk['t']: break
        e = _ease((t - kk['t']) / kk.get('dur', 0.25)); sw_deg += kk.get('sway', 0) * e; b += kk.get('squash', 0) * e
    ts = np.radians(sw_deg); c2, s2 = np.cos(ts), np.sin(ts)
    R = np.array([[c2, -s2, 0], [s2, c2, 0], [0, 0, 1]]); S = np.diag([1 + 0.5 * b, 1 + b, 1])
    T1 = np.array([[1, 0, -P[0]], [0, 1, -P[1]], [0, 0, 1]]); T2 = np.array([[1, 0, P[0]], [0, 1, P[1]], [0, 0, 1]])
    return T2 @ R @ S @ T1 @ M, k * (1 + 0.75 * b), alpha

def _part_motion(P, t):
    """(rot deg, dx, dy) of a cut-out part at shot time t: eased keys (held between) + periodic chew."""
    rot, dx, dy = P.get('rot', 0.0), P.get('dx', 0.0), P.get('dy', 0.0)
    prev = dict(t=-1e9, rot=rot, dx=dx, dy=dy)
    for k in P.get('keys', []):
        cur = dict(prev, **{kk: k[kk] for kk in ('rot', 'dx', 'dy') if kk in k}, t=k['t'])
        if t >= cur['t']: prev = cur; rot, dx, dy = cur['rot'], cur['dx'], cur['dy']; continue
        d = k.get('dur', 0.12)
        if t > cur['t'] - d:   # a key is reached at its time, moving over "dur" before it
            e = _ease((t - (cur['t'] - d)) / d, k.get('ease', 'inout'))
            rot, dx, dy = [prev[q] + (cur[q] - prev[q]) * e for q in ('rot', 'dx', 'dy')]
        break
    ch = P.get('chew')
    if ch and ch.get('t0', -1e9) <= t < ch.get('t1', 1e9):
        a = (1 - math.cos(2 * math.pi * ch.get('hz', 3.0) * (t - ch.get('t0', 0)))) / 2
        rot += ch.get('rot', 0) * a; dy += ch.get('dy', 0) * a; dx += ch.get('dx', 0) * a
    return rot, dx, dy

def _part_masks(P, sh, sw):
    key = ('pm', tuple(P['ellipse']), P.get('erot', 0), sh, sw)
    if key not in _cache:
        ex, ey, rx, ry = P['ellipse']; er = P.get('erot', 0)
        core = np.zeros((sh, sw), np.float32)
        cv2.ellipse(core, (int(ex * sw), int(ey * sh)), (max(1, int(rx * sw)), max(1, int(ry * sw))), er, 0, 360, 1.0, -1)
        f = max(3, int(min(rx, ry) * sw * 0.25)) | 1
        feather = np.maximum(core, cv2.GaussianBlur(cv2.dilate(core, np.ones((f, f), np.uint8)), (f * 2 + 1, f * 2 + 1), 0))
        soft = cv2.GaussianBlur(core, (5, 5), 0)
        pad = int(max(rx, ry) * sw * 2.2) + f * 2
        x0, x1 = max(0, int(ex * sw) - pad), min(sw, int(ex * sw) + pad)
        y0, y1 = max(0, int(ey * sh) - pad), min(sh, int(ey * sh) + pad)
        _cache[key] = (feather, soft, (x0, y0, x1, y1))
    return _cache[key]

def _apply_parts(spr, parts, t):
    """Cut-out parts (a jaw, a paw): the region is lifted off the sprite, the hole left behind is filled with a dark mouth
    colour, and the part is drawn back rotated about its hinge / shifted — classic cut-out animation, no stretching."""
    out = None
    sh, sw = spr.shape[:2]
    for P in parts:
        rot, dx, dy = _part_motion(P, t)
        if abs(rot) < 0.05 and abs(dx) < 2e-4 and abs(dy) < 2e-4: continue
        if out is None: out = spr.astype(np.float32).copy()
        feather, soft, (x0, y0, x1, y1) = _part_masks(P, sh, sw)
        roi = out[y0:y1, x0:x1]
        part = roi.copy(); part[..., 3] *= feather[y0:y1, x0:x1]
        hole = np.array(_hex(P.get('hole', '#2b1714')), np.float32)
        s = soft[y0:y1, x0:x1][..., None]
        roi[..., :3] = roi[..., :3] * (1 - s) + hole * s
        pv = P.get('pivot', P['ellipse'][:2])
        M = cv2.getRotationMatrix2D((pv[0] * sw - x0, pv[1] * sh - y0), -rot, 1.0); M[0, 2] += dx * sw; M[1, 2] += dy * sw
        wp = cv2.warpAffine(part, M, (x1 - x0, y1 - y0), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
        a = wp[..., 3:4] / 255.0
        roi[..., :3] = roi[..., :3] * (1 - a) + wp[..., :3] * a
        roi[..., 3:4] = np.maximum(roi[..., 3:4], wp[..., 3:4])
    return spr if out is None else out

def _silhouette(spr, F, t):
    """The block as a flat silhouette (energy gauge in the character's shape): "color" body, "level_color" filled from the
    bottom up to "levels" (0..1 of the opaque height)."""
    s = spr.astype(np.float32).copy(); a = s[..., 3]
    ys = np.where(a.max(1) > 20)[0]
    if not len(ys): return s
    y0, y1 = ys.min(), ys.max()
    lv = level(F.get('levels'), t, F.get('level', 0.5))
    cut = int(y1 - (y1 - y0) * lv)
    s[..., :3] = _hex(F.get('color', '#101010'))
    s[cut:, :, :3] = _hex(F.get('level_color', '#f2d21b'))
    return s

def _draw_shadow(img, L, M, k, alpha):
    """Soft contact shadow on the ground under a cut-out (sprite fractions), so blocks sit on the plate."""
    S = L['shadow']; H, W = img.shape[:2]
    sw, sh = L['_sw'], L['_sh']
    q = M @ np.array([S.get('x', 0.5) * sw, S.get('y', 0.95) * sh, 1.0])
    rx, ry = S.get('w', 0.5) * sw * k / 2, S.get('h', 0.05) * sw * k / 2
    pad = int(rx * 0.6) + 4
    x0, x1, y0, y1 = int(max(0, q[0] - rx - pad)), int(min(W, q[0] + rx + pad)), int(max(0, q[1] - ry - pad)), int(min(H, q[1] + ry + pad))
    if x1 <= x0 or y1 <= y0: return
    m = np.zeros((y1 - y0, x1 - x0), np.float32)
    cv2.ellipse(m, (int(q[0] - x0), int(q[1] - y0)), (max(1, int(rx)), max(1, int(ry))), 0, 0, 360, 1.0, -1)
    b = max(3, int(ry * 1.2)) | 1; m = cv2.GaussianBlur(m, (b * 2 + 1, b * 2 + 1), 0)
    img[y0:y1, x0:x1] *= (1 - m * S.get('alpha', 0.35) * alpha)[..., None]

def _draw_cutout(img, L, t, base_dir, ctx):
    H, W = img.shape[:2]
    spr = _load_png(os.path.join(base_dir, L['src']))
    sh, sw = spr.shape[:2]
    r = _cutout_matrix(L, t, W, H, sw, sh)
    if r is None: return
    M, k, alpha = r
    if L.get('shadow'): _draw_shadow(img, dict(L, _sw=sw, _sh=sh), M, k, alpha)
    if L.get('parts'): spr = _apply_parts(spr, L['parts'], t)
    field = None
    if L.get('warp'):
        field = _warp_field([{'handles': L['warp']}], t, sh, sw)
        spr = _apply_warp(spr.astype(np.float32), field, cv2.BORDER_CONSTANT)
    if L.get('fill'): spr = _silhouette(spr, L['fill'], t)
    out = cv2.warpAffine(spr.astype(np.float32), M[:2], (W, H), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
    a = out[..., 3:4] / 255.0 * alpha
    if L.get('glow'):   # coloured halo around the block (the injured one, "this one", danger)
        G = L['glow']; r = max(3, int(G.get('r', 0.015) * W)) | 1
        g = cv2.GaussianBlur(cv2.dilate(out[..., 3], np.ones((r, r), np.uint8)), (r * 2 + 1, r * 2 + 1), 0) / 255.0
        pulse = 0.75 + 0.25 * math.sin(2 * math.pi * G.get('hz', 1.5) * t)
        ga = (g * G.get('alpha', 0.7) * pulse * alpha)[..., None]
        img[:] = img * (1 - ga) + np.array(_hex(G.get('color', '#ff3b5c'))[::-1], np.float32) * ga
    img[:] = img * (1 - a) + out[..., 2::-1][..., :3] * a
    if L.get('id'): ctx[L['id']] = (M, field, sw, sh, k)

def _child_xy(ctx, pid, x, y):
    """A point given in parent-sprite fractions -> picture px, following the parent's warp and transform."""
    M, field, sw, sh, k = ctx[pid]
    px, py = x * sw, y * sh
    if field is not None:
        dx, dy = _disp_at(field, px, py); px += dx; py += dy
    q = M @ np.array([px, py, 1.0]); return q[0], q[1], k

def draw(img, layers, t, base_dir):
    """Draw every layer active at shot time t onto img (BGR float32). Picture warps first; cut-outs ("type": "cutout")
    in list order; layers with "parent": <cutout id> follow that cut-out; eyes and "follow" layers ride on picture warps."""
    H, W = img.shape[:2]
    ctx = {}
    warps = [L for L in layers if L['type'] == 'warp']
    field = None
    if warps:
        field = _warp_field(warps, t, H, W)
        img = _apply_warp(img, field)
    for L in layers:
        if L['type'] == 'warp': continue
        if L['type'] == 'cutout': _draw_cutout(img, L, t, base_dir, ctx); continue
        if L['type'] == 'tint':   # whole-picture colour wash: night -> day, flashback, danger red
            if L.get('t0', -1e9) <= t < L.get('t1', 1e9):
                a = level(L.get('levels'), t, L.get('alpha', 0.3))
                if a > 0.001: img[:] = img * (1 - a) + np.array(_hex(L.get('color', '#0a1030'))[::-1], np.float32) * a
            continue
        if L.get('parent') in ctx:
            L = dict(L)
            if L['type'] == 'eyes':
                for kk in ('l', 'r'):
                    if not L.get(kk): continue   # single (profile) eye
                    X, Y, k = _child_xy(ctx, L['parent'], *L[kk]); L[kk] = [X / W, Y / H]
                M, _, sw, _, k = ctx[L['parent']]; L['size'] = L.get('size', 0.09) * sw * k / W
            else:
                X, Y, k = _child_xy(ctx, L['parent'], L.get('x', 0.5), L.get('y', 0.5)); L['x'], L['y'] = X / W, Y / H
            if L['type'] == 'eyes': _draw_eyes(img, L, t)
            else: _draw_sprite(img, L, t, base_dir)
            continue
        if field is not None and L.get('follow', L['type'] == 'eyes'):
            L = dict(L)
            if L['type'] == 'eyes':
                for k in ('l', 'r'):
                    if not L.get(k): continue
                    dx, dy = _disp_at(field, L[k][0] * W, L[k][1] * H); L[k] = [L[k][0] + dx / W, L[k][1] + dy / H]
            else:
                dx, dy = _disp_at(field, L.get('x', 0.5) * W, L.get('y', 0.5) * H)
                L['x'] = L.get('x', 0.5) + dx / W; L['y'] = L.get('y', 0.5) + dy / H
        if L['type'] == 'eyes': _draw_eyes(img, L, t)
        else: _draw_sprite(img, L, t, base_dir)
    return img
