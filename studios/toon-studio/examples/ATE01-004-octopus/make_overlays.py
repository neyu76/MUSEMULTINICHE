"""Procedural schematics for ATE01-004 (Notion boards B3-B7, claims C1/C2). Our own drawings, schematic and species-appropriate:
- octo_*.png   top-down octopus schematic: mantle + head with two eyes, EIGHT tapered arms; central brain = ring around the
               oesophagus between the eyes; an axial nerve cord runs along every arm with repeating ganglia (segments), linked
               near the arm bases by a ring (interbrachial commissure). Never eight little brains, never faces in the arms.
    octo_rope    WRONG MODEL: the arms drawn as plain ropes hanging from the brain (one-way arrows down)
    octo_net_k   the network: nodes along every arm, links between neighbours near the base, two-way traffic; k = pulse phase
                 (each arm has its own rhythm, B6)
    octo_glow_k  control machinery extending from the centre through the arms (k = 0..3, more of every arm lit)
- arm_*.png    one arm side view: two rows of suckers, axial nerve cord, segment bands, a small ganglion over every sucker
    arm_plain    one featureless unit (grey tube, nothing inside)  ·  arm_seg_k  segments lighting one after another
    arm_pulse_k  signals running along the arm and out to the suckers
- bar_arms / bar_brain   neuron comparison bars (no numbers: C2 only says the arms together have more than the brain)
- card_local / card_nine cards for B5; circle_red, arrow_cyan, queue_line
"""
import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from studio.cfg import FONT
NAVY, CYAN, ORANGE, PINK = (14, 30, 70, 235), (90, 225, 255), (255, 150, 60), (255, 120, 150)
SKIN, SKIN_D = (196, 104, 74), (120, 52, 36)
WHITE = (255, 255, 255)

def font(px): return ImageFont.truetype(FONT, px)

def card(W, H, r=60):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([8, 8, W - 8, H - 8], radius=r, fill=NAVY, outline=CYAN + (255,), width=8)
    return im, d

# ---------- top-down octopus schematic ----------
ANG = [-62, -28, 28, 62, 118, 152, 208, 242]          # arm directions (deg, 0 = right, y down) - mantle points up (-90)

def brain(d, c):
    """Central brain: a ring around the oesophagus, between / just behind the eyes (schematic)."""
    d.ellipse([c[0] - 48, c[1] - 58, c[0] + 48, c[1] - 6], outline=PINK + (255,), width=16)
    d.ellipse([c[0] - 48, c[1] - 58, c[0] + 48, c[1] - 6], outline=WHITE + (255,), width=3)

def arm_path(c, a, L=330, curl=0.9, n=60):
    """Tapered arm centre line from the body outward, curling at the tip."""
    pts = []
    for i in range(n + 1):
        u = i / n
        ang = math.radians(a) + curl * (u ** 3) * (1 if a % 360 < 180 else -1) * 1.4
        r = 120 + L * u
        pts.append((c[0] + r * math.cos(math.radians(a) + curl * 0.35 * u ** 3), c[1] + r * math.sin(math.radians(a) + curl * 0.35 * u ** 3)))
    return pts

def thick(d, pts, w0, w1, col):
    n = len(pts) - 1
    for i, (x, y) in enumerate(pts):
        r = w0 + (w1 - w0) * i / n
        d.ellipse([x - r, y - r, x + r, y + r], fill=col)

def octo(mode='plain', k=0, W=1000, H=1000):
    im, d = card(W, H)
    c = (W / 2, H * 0.56)
    body = Image.new('RGBA', (W, H), (0, 0, 0, 0)); b = ImageDraw.Draw(body)
    paths = [arm_path(c, a) for a in ANG]
    if mode == 'rope':
        for a in ANG:   # ropes: straight, uniform, braided look, hanging from the brain
            x1, y1 = c[0] + 480 * math.cos(math.radians(a)), c[1] + 480 * math.sin(math.radians(a))
            for off, col in ((0, (150, 110, 60, 255)), (6, (205, 165, 100, 255))):
                d.line([(c[0], c[1]), (x1, y1)], fill=col, width=26 - off * 2)
            for s in np.linspace(0.25, 0.95, 9):   # braid marks
                x, y = c[0] + (x1 - c[0]) * s, c[1] + (y1 - c[1]) * s
                d.line([(x - 8, y - 8), (x + 8, y + 8)], fill=(120, 85, 45, 255), width=4)
            d.ellipse([x1 - 22, y1 - 22, x1 + 22, y1 + 22], outline=(205, 165, 100, 255), width=8)   # pull ring
            for s in (0.45, 0.75):   # one-way arrows: every rope only pulled in by the brain
                x, y = c[0] + (x1 - c[0]) * s, c[1] + (y1 - c[1]) * s
                ux, uy = -math.cos(math.radians(a)), -math.sin(math.radians(a)); px, py = -uy, ux
                d.polygon([(x + 30 * ux, y + 30 * uy), (x - 10 * ux + 20 * px, y - 10 * uy + 20 * py), (x - 10 * ux - 20 * px, y - 10 * uy - 20 * py)], fill=WHITE + (255,))
        b.ellipse([c[0] - 120, c[1] - 330, c[0] + 120, c[1] - 40], fill=SKIN + (255,), outline=SKIN_D + (255,), width=8)
        b.ellipse([c[0] - 125, c[1] - 90, c[0] + 125, c[1] + 110], fill=SKIN + (255,), outline=SKIN_D + (255,), width=8)
        im.alpha_composite(body)
        brain(d, c)
        return im
    # arms
    for p in paths: thick(b, p, 52, 10, SKIN_D + (255,))
    for p in paths: thick(b, p, 44, 6, SKIN + (255,))
    b.ellipse([c[0] - 120, c[1] - 330, c[0] + 120, c[1] - 40], fill=SKIN + (255,), outline=SKIN_D + (255,), width=8)   # mantle
    b.ellipse([c[0] - 125, c[1] - 90, c[0] + 125, c[1] + 110], fill=SKIN + (255,), outline=SKIN_D + (255,), width=8)  # head
    for ex in (-70, 70):
        b.ellipse([c[0] + ex - 26, c[1] - 52, c[0] + ex + 26, c[1] - 4], fill=(250, 240, 200, 255), outline=SKIN_D + (255,), width=5)
        b.rectangle([c[0] + ex - 16, c[1] - 32, c[0] + ex + 16, c[1] - 24], fill=(20, 20, 20, 255))
    im.alpha_composite(body)
    if mode == 'plain': return im
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); o = ImageDraw.Draw(ov)
    base = [p[8] for p in paths]
    # cords + ganglia
    for ai, p in enumerate(paths):
        cord = p[4:-3]
        lit = 1.0
        if mode == 'glow': lit = (k + 1) / 4
        nl = int(len(cord) * lit)
        o.line(cord, fill=(60, 110, 150, 255), width=8)
        if nl > 1: o.line(cord[:nl], fill=CYAN + (255,), width=10)
        for gi, idx in enumerate(range(4, len(cord), 7)):
            x, y = cord[idx]; on = idx < nl
            if mode == 'net':
                phase = (ai * 3 + k) % 4; on = (gi % 4) == phase
            r = 11 if on else 8
            o.ellipse([x - r, y - r, x + r, y + r], fill=(ORANGE if on else (200, 120, 60)) + (255,), outline=WHITE + (255,) if on else None, width=3)
    # ring linking neighbouring arm cords + brain
    o.line(base + [base[0]], fill=CYAN + (255,), width=6)
    for bp in base: o.line([(c[0], c[1] - 32), bp], fill=(60, 110, 150, 255), width=6)
    brain(o, c)
    if mode == 'net':   # two-way traffic between brain and arms
        for ai, p in enumerate(paths):
            (ax, ay), (bx, by) = p[12], p[16]
            ux, uy = bx - ax, by - ay; L = math.hypot(ux, uy); ux, uy = ux / L, uy / L
            m = ((ax + bx) / 2, (ay + by) / 2); px, py = -uy, ux
            for s, sh in ((1, 9), (-1, -9)):
                x, y = m[0] + px * sh, m[1] + py * sh
                o.polygon([(x + s * 16 * ux, y + s * 16 * uy), (x - s * 6 * ux + 8 * px, y - s * 6 * uy + 8 * py), (x - s * 6 * ux - 8 * px, y - s * 6 * uy - 8 * py)], fill=WHITE + (255,))
    glow = ov.filter(ImageFilter.GaussianBlur(6))
    im.alpha_composite(glow); im.alpha_composite(ov)
    return im

# ---------- one arm, side view ----------
def arm(mode='full', k=0, W=1200, H=520):
    im, d = card(W, H, r=50)
    x0, x1, yc = 70, W - 70, H * 0.44
    top = lambda x: yc - (95 - 70 * (x - x0) / (x1 - x0))
    bot = lambda x: yc + (95 - 70 * (x - x0) / (x1 - x0))
    xs = np.linspace(x0, x1, 120)
    poly = [(x, top(x)) for x in xs] + [(x, bot(x)) for x in xs[::-1]]
    if mode == 'plain':
        d.polygon(poly, fill=(150, 150, 160, 255), outline=(90, 90, 100, 255))
        return im
    d.polygon(poly, fill=SKIN + (255,), outline=SKIN_D + (255,))
    suck = [x for x in np.linspace(x0 + 45, x1 - 40, 16)]
    for i, x in enumerate(suck):   # two rows of suckers along the underside
        r = 26 - 15 * (x - x0) / (x1 - x0)
        for row, dy in ((0, 0), (1, 0.55)):
            xx = x + row * (suck[1] - suck[0]) * 0.5
            y = bot(xx) + r * 0.6 + dy * r * 1.6
            d.ellipse([xx - r, y - r, xx + r, y + r], fill=(240, 210, 190, 255), outline=SKIN_D + (255,), width=3)
            d.ellipse([xx - r * 0.45, y - r * 0.45, xx + r * 0.45, y + r * 0.45], fill=(200, 150, 130, 255))
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); o = ImageDraw.Draw(ov)
    o.line([(x0 + 10, yc), (x1 - 15, yc)], fill=CYAN + (255,), width=10)   # axial nerve cord
    segs = list(zip(suck[:-1], suck[1:]))
    for i, (a, b) in enumerate(segs):
        lit = (mode == 'seg' and i <= k * 3 + 2) or mode in ('full', 'pulse')
        if mode == 'seg': lit = i // 3 <= k
        col = ORANGE if lit else (120, 80, 50)
        o.rounded_rectangle([a + 6, yc - 22, b - 6, yc + 22], radius=10, outline=col + (255,), width=6)   # repeating segment
        mx = (a + b) / 2
        o.line([(mx, yc + 22), (mx, bot(mx) + 4)], fill=col + (255,), width=4)          # branch to the sucker
        o.ellipse([mx - 7, bot(mx) - 4, mx + 7, bot(mx) + 10], fill=col + (255,))         # small sucker ganglion
    if mode == 'pulse':   # signals running both ways along the arm and out to the suckers
        for j in range(3):
            px = x0 + 40 + ((k * 0.25 + j / 3) % 1.0) * (x1 - x0 - 80)
            o.ellipse([px - 18, yc - 18, px + 18, yc + 18], fill=WHITE + (255,))
            qx = x1 - 40 - ((k * 0.25 + j / 3 + 0.15) % 1.0) * (x1 - x0 - 80)
            o.ellipse([qx - 13, yc - 13, qx + 13, yc + 13], fill=(255, 230, 120, 255))
    glow = ov.filter(ImageFilter.GaussianBlur(7)); im.alpha_composite(glow); im.alpha_composite(ov)
    return im

def bar(col, W=1000, H=120):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([4, 4, W - 4, H - 4], radius=H // 2 - 4, fill=col + (255,), outline=(0, 0, 0, 255), width=8)
    d.rounded_rectangle([24, 18, W - 24, H // 2 - 6], radius=20, fill=tuple(min(255, c + 60) for c in col) + (110,))
    return im

def text_card(lines, fill, icon, W=900, H=560):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([10, 10, W - 10, H - 10], radius=50, fill=fill + (255,), outline=(0, 0, 0, 255), width=14)
    f = font(120); y = 50
    for s in lines:
        tw = d.textlength(s, font=f); d.text(((W - tw) / 2, y), s, font=f, fill=WHITE, stroke_width=8, stroke_fill=(0, 0, 0)); y += 135
    icon(d, W, H, y)
    return im

def ic_circuit(d, W, H, y):
    cx, cy = W / 2, y + (H - y) / 2 - 10
    pts = [(cx - 220, cy), (cx - 80, cy), (cx - 40, cy - 40), (cx + 60, cy - 40), (cx + 100, cy), (cx + 220, cy)]
    d.line(pts, fill=(255, 255, 255), width=10)
    for x, yy in pts[::2] + [pts[-1]]: d.ellipse([x - 18, yy - 18, x + 18, yy + 18], fill=ORANGE, outline=(0, 0, 0), width=5)

def ic_faces(d, W, H, y):
    for i in range(9):
        cx = W / 2 + (i - 4) * 86; cy = y + (H - y) / 2 - 10; r = 34
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 220, 120), outline=(0, 0, 0), width=5)
        d.ellipse([cx - 14, cy - 10, cx - 6, cy - 2], fill=(0, 0, 0)); d.ellipse([cx + 6, cy - 10, cx + 14, cy - 2], fill=(0, 0, 0))
        mood = i % 3
        if mood == 0: d.arc([cx - 14, cy - 4, cx + 14, cy + 18], 20, 160, fill=(0, 0, 0), width=4)
        elif mood == 1: d.arc([cx - 14, cy + 8, cx + 14, cy + 26], 200, 340, fill=(0, 0, 0), width=4)
        else: d.line([(cx - 12, cy + 12), (cx + 12, cy + 12)], fill=(0, 0, 0), width=4)

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

def split_rope():
    """props/knobrope.png holds a knob and a rope side by side: keep the rope (right part)."""
    im = Image.open('props/knobrope.png'); a = np.array(im)[..., 3]
    cols = np.where(a.max(0) > 20)[0]; gaps = np.where(np.diff(cols) > 20)[0]
    if len(gaps):
        x = cols[gaps[-1] + 1]; r = im.crop((x, 0, im.size[0], im.size[1])); r = r.crop(r.getbbox()); r.save('props/rope.png'); print('rope', r.size)

if __name__ == '__main__':
    os.makedirs('props', exist_ok=True)
    octo('plain').save('props/octo_plain.png'); octo('rope').save('props/octo_rope.png')
    for k in range(4):
        octo('net', k).save(f'props/octo_net_{k}.png'); octo('glow', k).save(f'props/octo_glow_{k}.png')
    arm('plain').save('props/arm_plain.png'); arm('full').save('props/arm_full.png')
    for k in range(5): arm('seg', k).save(f'props/arm_seg_{k}.png')
    for k in range(4): arm('pulse', k).save(f'props/arm_pulse_{k}.png')
    bar((255, 140, 40), W=1000).save('props/bar_arms.png'); bar((60, 140, 255), W=560).save('props/bar_brain.png')   # same height
    text_card(['LOCAL', 'CIRCUITS'], (20, 150, 120), ic_circuit).save('props/card_local.png')
    text_card(['NINE', 'PERSONALITIES'], (150, 60, 160), ic_faces, W=1100).save('props/card_nine.png')
    circle_red().save('props/circle_red.png'); arrow().save('props/arrow_cyan.png')
    if os.path.exists('props/knobrope.png'): split_rope()
    print('overlays written')
