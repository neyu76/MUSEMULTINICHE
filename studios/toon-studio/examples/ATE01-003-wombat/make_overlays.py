"""Procedural schematics for ATE01-003 (Notion boards B3-B7). Clean graphics, never realistic droppings: the material is a
smooth chocolate-brown shape. All schematic, labelled as a model in the EDL.
- gut_WB2.png   X-ray style view aligned to art/WB2.png (profile, nose right): simplified gut tube looping through the belly,
                the final section (near the rump, left) highlighted, a block already formed inside it, exit arrow after it.
- ring_0/1/2    cross-section of the model tube: 4 stiff sections (dark blue, thick) and 4 soft sections (orange, thin);
                0 relaxed + round material, 1 contracting, 2 contracted + flat sides / corners. Swapped as contractions.
- tube_side.png side view of a simplified tube, thick / thin wall sections, force arrows inward.
- mat_0/1/2     material states: round -> softer corners -> cube-like (superellipse n = 2, 3.5, 7).
- blueprint.png square-opening blueprint card (B2) - the WRONG MODEL stamp is a text layer.
- circle_red.png, arrow_out.png, frame_red.png
"""
import math, sys
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter

BROWN, BROWN_D, BROWN_L = (123, 74, 44), (78, 44, 24), (168, 112, 72)
STIFF, SOFT = (28, 70, 160), (255, 150, 60)
CYAN = (90, 225, 255)

def superellipse(cx, cy, rx, ry, n, rot=0.0, k=180):
    pts = []
    for i in range(k):
        t = 2 * math.pi * i / k; c, s = math.cos(t), math.sin(t)
        x = rx * math.copysign(abs(c) ** (2 / n), c); y = ry * math.copysign(abs(s) ** (2 / n), s)
        cr, sr = math.cos(rot), math.sin(rot)
        pts.append((cx + x * cr - y * sr, cy + x * sr + y * cr))
    return pts

def blob(size, n, rot=0.0, shade=True):
    """Smooth brown block with a soft top-left highlight (clean graphic)."""
    W = size; im = Image.new('RGBA', (W, W), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    r = W * 0.4
    d.polygon(superellipse(W / 2, W / 2, r + 10, r + 10, n, rot), fill=(30, 16, 8, 255))
    d.polygon(superellipse(W / 2, W / 2, r, r, n, rot), fill=BROWN + (255,))
    if shade:
        hl = Image.new('RGBA', (W, W), (0, 0, 0, 0)); h = ImageDraw.Draw(hl)
        h.polygon(superellipse(W * 0.44, W * 0.42, r * 0.62, r * 0.5, n, rot), fill=BROWN_L + (150,))
        hl = hl.filter(ImageFilter.GaussianBlur(W / 25))
        mask = Image.new('L', (W, W), 0); ImageDraw.Draw(mask).polygon(superellipse(W / 2, W / 2, r, r, n, rot), fill=255)
        im.paste(Image.alpha_composite(im, hl), (0, 0), mask)
    return im

def ring(state, W=1100):
    """Cross-section of the model tube. state 0 relaxed (round), 1 contracting, 2 contracted (flatter sides, corners)."""
    im = Image.new('RGBA', (W, W), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    c = W / 2
    d.ellipse([20, 20, W - 20, W - 20], fill=(14, 30, 70, 235), outline=CYAN + (255,), width=8)   # card
    n_mat = (2.0, 3.6, 7.0)[state]; R = (300, 280, 262)[state]
    # wall: 8 sections; soft ones (faces) give and bow in when contracting, stiff ones (corners) hold
    k = 240; inner, outer = [], []
    for i in range(k + 1):
        t = 2 * math.pi * i / k
        sec = int(((t + math.pi / 8) % (2 * math.pi)) / (math.pi / 4))   # 0..7, even = soft face (0, 90, 180, 270 deg)
        soft = sec % 2 == 0
        local = ((t + math.pi / 8) % (math.pi / 4)) / (math.pi / 4)    # 0..1 across the section
        bow = math.sin(local * math.pi) if soft else 0.0
        squeeze = (0, 18, 34)[state] * bow                                # soft faces pushed inward
        ri = R + 40 - squeeze; ro = ri + (22 if soft else 70)
        inner.append((c + ri * math.cos(t), c + ri * math.sin(t), soft)); outer.append((c + ro * math.cos(t), c + ro * math.sin(t)))
    for i in range(k):
        a, b = inner[i], inner[i + 1]; oa, ob = outer[i], outer[i + 1]
        col = SOFT if a[2] else STIFF
        d.polygon([a[:2], b[:2], ob, oa], fill=col + (255,))
    # material inside: round -> flatter faces + corners (corners point at the stiff sections, 45 deg)
    mat = superellipse(c, c, R * 0.92, R * 0.92, n_mat, rot=math.pi / 4 if False else 0.0)
    d.polygon(superellipse(c, c, R * 0.92 + 8, R * 0.92 + 8, n_mat), fill=(30, 16, 8, 255))
    d.polygon(mat, fill=BROWN + (255,))
    # force arrows on the soft faces when contracting
    if state:
        for ang in (0, 90, 180, 270):
            t = math.radians(ang); L = (70, 95)[state - 1]
            r0 = R + 150; r1 = r0 - L
            x0, y0 = c + r0 * math.cos(t), c + r0 * math.sin(t); x1, y1 = c + r1 * math.cos(t), c + r1 * math.sin(t)
            d.line([(x0, y0), (x1, y1)], fill=(255, 255, 255, 255), width=18)
            px, py = -math.sin(t), math.cos(t)
            d.polygon([(x1 - 22 * math.cos(t) + 0, y1 - 22 * math.sin(t)), (x1 + 30 * px, y1 + 30 * py), (x1 - 30 * px, y1 - 30 * py)],
                      fill=(255, 255, 255, 255))
    return im

def tube_side(W=1400, H=700):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([10, 10, W - 10, H - 10], radius=60, fill=(14, 30, 70, 235), outline=CYAN + (255,), width=8)
    y0, y1 = 210, 490; xs = np.linspace(90, W - 90, 9)
    for i, (a, b) in enumerate(zip(xs, xs[1:])):
        soft = i % 2 == 1; t = 18 if soft else 46; col = SOFT if soft else STIFF
        d.rectangle([a, y0 - t, b, y0], fill=col + (255,)); d.rectangle([a, y1, b, y1 + t], fill=col + (255,))
        if soft:   # contraction arrows on the soft sections
            m = (a + b) / 2
            for yy, s in ((y0 - 130, 1), (y1 + 130, -1)):
                d.line([(m, yy), (m, yy + s * 80)], fill=(255, 255, 255, 255), width=16)
                d.polygon([(m - 26, yy + s * 70), (m + 26, yy + s * 70), (m, yy + s * 110)], fill=(255, 255, 255, 255))
    # material moving through: round (left) -> flatter (right)
    for x, n in ((300, 2.0), (700, 3.6), (1100, 7.0)):
        d.polygon(superellipse(x, (y0 + y1) / 2, 118, 112, n), fill=(30, 16, 8, 255))
        d.polygon(superellipse(x, (y0 + y1) / 2, 110, 104, n), fill=BROWN + (255,))
    d.polygon([(W - 70, (y0 + y1) / 2), (W - 140, (y0 + y1) / 2 - 50), (W - 140, (y0 + y1) / 2 + 50)], fill=CYAN + (255,))
    return im

def blueprint(W=1100, H=900):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, W, H], radius=30, fill=(22, 72, 150, 255), outline=(230, 240, 255, 255), width=10)
    for x in range(40, W, 50): d.line([(x, 20), (x, H - 20)], fill=(70, 120, 200, 255), width=2)
    for y in range(40, H, 50): d.line([(20, y), (W - 20, y)], fill=(70, 120, 200, 255), width=2)
    # a square exit nozzle drawn as a technical sketch, material pushed through, block coming out
    w = (235, 245, 255, 255)
    d.rectangle([180, 300, 520, 600], outline=w, width=8)                       # housing
    d.rectangle([520, 380, 640, 520], outline=w, width=8)                       # square opening
    for i in range(3): d.line([(220 + 90 * i, 340), (300 + 90 * i, 450)], fill=w, width=4)   # hatching
    d.rectangle([700, 380, 840, 520], outline=w, width=8)                       # block out
    d.line([(650, 450), (690, 450)], fill=w, width=6); d.polygon([(690, 430), (690, 470), (712, 450)], fill=w)
    d.line([(520, 640), (640, 640)], fill=w, width=4)                           # dimension line
    for x in (520, 640): d.line([(x, 620), (x, 660)], fill=w, width=4)
    return im

def circle_red(W=900, H=900, col=(235, 35, 40)):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.ellipse([20, 20, W - 20, H - 20], outline=(0, 0, 0, 255), width=34)
    d.ellipse([20, 20, W - 20, H - 20], outline=col + (255,), width=20)
    return im

def frame(w=520, h=300, col=(235, 35, 40)):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([10, 10, w - 10, h - 10], radius=40, outline=(0, 0, 0, 255), width=26)
    d.rounded_rectangle([10, 10, w - 10, h - 10], radius=40, outline=col + (255,), width=16)
    return im

def arrow(W=420, H=200, col=CYAN):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for c, g in (((10, 10, 20), 14), (col, 0)):
        d.line([(20 + g // 2, H / 2), (W - 120, H / 2)], fill=c + (255,), width=44 + g)
        d.polygon([(W - 150 - g, H / 2 - 80 - g), (W - 150 - g, H / 2 + 80 + g), (W - 10, H / 2)], fill=c + (255,))
    return im

def gut_xray(cut='cut/WB2.png'):
    """Gut schematic inside the profile body (nose right). Positions are fractions of the body's bounding box."""
    a = np.array(Image.open(cut).convert('RGBA'))[..., 3].astype(np.float32) / 255
    H0, W0 = a.shape; m = (a > 0.5).astype(np.uint8)
    ys, xs = np.where(m); bx0, bx1, by0, by1 = xs.min(), xs.max(), ys.min(), ys.max()
    B = lambda u, v: (bx0 + u * (bx1 - bx0), by0 + v * (by1 - by0))
    body = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 4)
    out = np.zeros((H0, W0, 4), np.float32); out[..., 0], out[..., 1], out[..., 2] = 18, 38, 92; out[..., 3] = body * 0.82 * 255
    edge = cv2.morphologyEx(m, cv2.MORPH_GRADIENT, np.ones((9, 9), np.uint8)).astype(bool); out[edge] = CYAN + (255,)
    im = Image.fromarray(out.astype(np.uint8), 'RGBA'); d = ImageDraw.Draw(im)
    # simplified tube: from the chest (right) looping through the belly, final section running back to the rump (left)
    path = [B(0.72, 0.42), B(0.62, 0.62), B(0.50, 0.52), B(0.42, 0.70), B(0.33, 0.55), B(0.26, 0.62), B(0.16, 0.58), B(0.04, 0.56)]
    P = [path[0]] + path + [path[-1]]; sm = []
    for i in range(1, len(P) - 2):                      # Catmull-Rom spline through the path points
        p0, p1, p2, p3 = (np.array(P[j], float) for j in (i - 1, i, i + 1, i + 2))
        for s in np.linspace(0, 1, 40, endpoint=False):
            sm.append(tuple(0.5 * ((2 * p1) + (-p0 + p2) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s * s + (-p0 + 3 * p1 - 3 * p2 + p3) * s ** 3)))
    sm.append(path[-1])
    tw = int((by1 - by0) * 0.11)
    def stroke(pts, col, r):
        for x, y in pts: d.ellipse([x - r, y - r, x + r, y + r], fill=col)
    stroke(sm, (60, 120, 210, 255), tw / 2 + 9); stroke(sm, (140, 200, 255, 255), tw / 2)
    final = sm[int(len(sm) * 0.68):]                       # final section of the intestine: highlighted
    stroke(final, SOFT + (255,), tw / 2 + 12); stroke(final, (255, 200, 140, 255), tw / 2)
    # the block already formed inside the final section, before the exit
    bx, by = final[int(len(final) * 0.55)]; s = int(tw * 0.9)
    d.polygon(superellipse(bx, by, s + 6, s * 0.8 + 6, 6.0), fill=(30, 16, 8, 255)); d.polygon(superellipse(bx, by, s, s * 0.8, 6.0), fill=BROWN + (255,))
    glow = im.filter(ImageFilter.GaussianBlur(10))
    res = Image.alpha_composite(glow, im)
    info = dict(final_mid=(final[len(final) // 2][0] / W0, final[len(final) // 2][1] / H0), block=(bx / W0, by / H0),
                exit=(sm[-1][0] / W0, sm[-1][1] / H0), body=(bx0 / W0, by0 / H0, bx1 / W0, by1 / H0))
    return res, info

if __name__ == '__main__':
    for i in range(3): ring(i).save(f'props/ring_{i}.png')
    for i, n in enumerate((2.0, 3.6, 7.0)): blob(600, n).save(f'props/mat_{i}.png')
    tube_side().save('props/tube_side.png'); blueprint().save('props/blueprint.png')
    circle_red().save('props/circle_red.png'); frame().save('props/frame_red.png'); arrow().save('props/arrow_out.png')
    try:
        g, info = gut_xray(); g.save('props/gut_WB2.png'); print('gut', {k: tuple(round(v, 4) for v in x) for k, x in info.items()})
    except FileNotFoundError:
        print('no cut/WB2.png yet - gut_WB2 skipped')
    print('overlays written')
    if len(sys.argv) > 1:
        sheet = Image.new('RGB', (2200, 1400), (200, 220, 235))
        for i in range(3): sheet.paste(Image.open(f'props/ring_{i}.png').resize((520, 520)), (20 + i * 540, 20), Image.open(f'props/ring_{i}.png').resize((520, 520)))
        for i in range(3): m = Image.open(f'props/mat_{i}.png').resize((260, 260)); sheet.paste(m, (1650 + (i % 2) * 270, 20 + (i // 2) * 270), m)
        t = Image.open('props/tube_side.png').resize((900, 450)); sheet.paste(t, (20, 580), t)
        b = Image.open('props/blueprint.png').resize((550, 450)); sheet.paste(b, (950, 580), b)
        try:
            g = Image.alpha_composite(Image.open('art/WB2.png').convert('RGBA'), Image.open('props/gut_WB2.png')).resize((420, 752))
            sheet.paste(g.convert('RGB').crop((0, 200, 420, 752)).resize((560, 736)) if False else g.convert('RGB').crop((0, 250, 420, 650)), (1540, 600))
        except FileNotFoundError: pass
        sheet.save(sys.argv[1], quality=85)
