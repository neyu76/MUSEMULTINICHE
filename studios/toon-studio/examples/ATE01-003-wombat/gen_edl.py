"""ATE01-003 · How a Wombat's Soft Gut Makes Cubes — animal-toon-eyes recipe (keyframed cut-out blocks over plates, props
as blocks, toon eyes on every wombat pose and on the researcher, one eye in profile, expressions on the beats). Script =
Notion S01-v1, verbatim. Beat board B1-B7 from Notion. The cube factory is a fictional gag; the material is always a clean
brown block / shape (never realistic droppings); the gut, ring and tube are schematics from make_overlays.py.
All times = narration seconds (words.json).
OLDER STYLE (before studio.edl): calls kit directly; still runs via `studio build`. Note: this episode put toon eyes on the
researcher — the recipe now forbids that (people get a replaced cartoon head, see examples/ATE01-004-octopus)."""
import sys
from studio.cfg import STYLE
sys.path.insert(0, STYLE)
import kit
from kit import FT, HOLD, POP, NONE, LAND, block, eyes, icon, png, text

END = 72.95
kit.setup(
    eye={'WB0': dict(l=(0.258, 0.516), r=(0.395, 0.515), size=0.062), 'WB1': dict(l=(0.438, 0.425), r=(0.576, 0.425), size=0.062),
         'WB2': dict(l=(0.852, 0.525), size=0.045, single='l'), 'WB3': dict(l=(0.348, 0.509), r=(0.678, 0.509), size=0.15),
         'WB4': dict(l=(0.416, 0.502), r=(0.532, 0.488), size=0.05), 'WB5': dict(l=(0.856, 0.528), size=0.045, single='l'),
         'WB6': dict(l=(0.4175, 0.44), r=(0.579, 0.438), size=0.07), 'WB7': dict(l=(0.246, 0.612), r=(0.385, 0.612), size=0.062),
         'RS0': dict(l=(0.47, 0.3016), r=(0.5637, 0.300), size=0.04), 'RS1': dict(l=(0.481, 0.302), r=(0.5747, 0.302), size=0.04),
         'RS2': dict(l=(0.53, 0.349), r=(0.618, 0.348), size=0.04)},
    shadow={'WB0': (0.55, 0.69, 0.6), 'WB1': (0.52, 0.685, 0.5), 'WB2': (0.5, 0.675, 0.8), 'WB4': (0.52, 0.69, 0.6),
            'WB5': (0.5, 0.675, 0.8), 'WB6': (0.55, 0.71, 0.5), 'WB7': (0.55, 0.69, 0.6)},
    lids={'WB': '#7d7064', 'RS': '#c9937a'}, no_gain=('WB3',))
kit.IDLE.update(breathe=0.014, sway=0.9)   # wombats rock gently on their feet

BUSH, BUSHB, FAC = 'plate/BUSH', 'plate/BUSH_b', 'plate/FAC_b'
YEL, BLU, RED, ORA, CYA = '#ffd200', '#3aa0ff', '#ff3b30', '#ff9a3c', '#5ad8ff'
GUT = dict(final=(0.2063, 0.5559), block=(0.1966, 0.5548), exit=(0.0902, 0.5488))

def prop(pid, src, t0, t1, x, y, w, keys=(), pop=True, rot=0.0, **kw):
    return dict(type='cutout', id=pid, src=f'props/{src}.png', x=x, y=y, w=w, rot=rot, t0=t0, t1=t1, keys=list(keys),
                **({'in': 'pop'} if pop else NONE), **kw)

def hat(pid, bw, head, t0, t1, rel=0.2):
    """Yellow hard hat riding on a wombat block (head = top of the head in sprite fractions)."""
    return png('hardhat', t0, t1, head[0], head[1], rel * bw, parent=pid, **{'in': 'slide_top'})

def xray_on(blk, t0, t1, keys=(), alpha=1.0):
    """Gut schematic over the profile block, under its eye (the eye stays readable)."""
    X = prop('xr', 'gut_WB2', t0, t1, 0.5, 0.5, 1.0, keys, pop=False, alpha=alpha)
    return blk[:1] + [X] + blk[1:]

def walk(t0, t1, a, b, per=0.19):
    out = []
    n = max(2, round((t1 - t0) / per)); step = (t1 - t0) / n
    at = lambda u: [a[j] + (b[j] - a[j]) * u for j in range(3)]
    for i in range(n):
        T = t0 + i * step; img = ('WB2', 'WB5')[i % 2]
        (x0, y0, w0), (x1, y1, w1) = at(i / n), at((i + 1) / n)
        lay = block(img, T, x=x0, y=y0, w=w0, keys=[{'t': T + step, 'x': x1, 'y': y1, 'w': w1, 'ease': 'linear'}],
                    eye_keys=[(T, dict(look=[0.6, 0], brow='up'))], jitter=False)
        lay.append(png('grass', T - 0.05, T + step + 0.05, 0.12, 0.9, 0.3, **NONE))
        out.append((round(T, 3), BUSH, HOLD(0.5, 0.52, 1.08), 'cut', lay))
    return out

def cubes_row(t, y=0.84, xs=(0.22, 0.47, 0.72), w=0.15, t1=None, dt=0.16):
    return [prop(f'cb{i}', 'cube', t + i * dt, t1, x, y, w, pose=LAND(t + i * dt + 0.05, 0.08)) for i, x in enumerate(xs)]

def ring_swap(t0, t1, seq, x=0.5, y=0.45, w=0.85, per=0.3):
    """Cross-section cards swapped in place (contractions): seq = ring indices, cycled every per seconds."""
    out, t, k = [], t0, 0
    while t < t1 - 1e-6:
        e = min(t1, t + per)
        out.append(prop(f'rg{k}', f'ring_{seq[k % len(seq)]}', t, e, x, y, w, pop=False)); t = e; k += 1
    return out

RING_CORNERS = lambda cx, cy, w: [(round(cx + sx * 0.198 * w, 4), round(cy + sy * 0.198 * w * 1080 / 1920, 4)) for sx in (-1, 1) for sy in (-1, 1)]

SHOTS = walk(0.0, 0.66, (0.05, 0.5, 1.0), (0.5, 0.5, 1.0)) + [
    # B1 — "This animal makes cubes inside a soft, round gut."  turns to camera, three blocks drop in a row
    (0.66, BUSH, HOLD(0.5, 0.55, 1.08), 'cut',
     block('WB0', 0.66, eye_keys=[(0.66, dict(mood='shock', brow='up')), (1.2, dict(mood=None, brow='up', look=[0.3, 1])),
                                   (1.9, dict(brow='smug', open=0.6, low=0.25, look=[0, 0]))], jitter=False)
     + cubes_row(0.69, t1=2.7) + [text('SOFT GUT', 1.55, 2.7, 0.5, 0.3, 0.075, w=0.5, fill=ORA, **POP)]),
    # "Wombat droppings can have flat faces and distinct corners,"  big block, red frame on a face, sparks on corners
    (2.68, BUSH, HOLD(0.5, 0.55, 1.05), 'cut',
     block('WB1', 2.68, x=0.38, w=0.9, eye_keys=[(2.68, dict(look=[1, 0.3], brow='up')), (3.6, dict(look=[1, 0.4], brow='worried')),
                                                 (4.7, dict(mood='shock', brow='up'))], jitter=False)
     + [prop('big', 'cube', 2.75, 5.25, 0.76, 0.6, 0.34, pose=LAND(2.8, 0.08)),
        prop('frF', 'frame_red', 3.52, 4.66, 0.76, 0.64, 0.24, pop=True),
        icon('spark', 4.66, 5.25, 0.63, 0.5, 0.08, **POP), icon('spark', 4.76, 5.25, 0.9, 0.5, 0.08, **POP),
        icon('spark', 4.86, 5.25, 0.76, 0.43, 0.08, **POP), text('CORNERS?!', 4.7, 5.25, 0.5, 0.25, 0.07, w=0.5, fill=YEL, **POP)]),
    # "which sounds less like biology and more like somebody installed a tiny packaging machine."  the cube factory gag
    (5.23, FAC, HOLD(0.5, 0.55, 1.0), 'cut',
     block('WB0', 5.23, x=-0.3, y=0.6, w=0.7, keys=[{'t': 5.8, 'x': 0.36, 'hops': 2, 'hop': 0.03, 'ease': 'out'}], pose=LAND(5.8, 0.05),
           eye_keys=[(5.23, dict(look=[1, 0], brow='up')), (6.4, dict(look=[1, 0.2], brow='worried')), (7.4, dict(mood='happy', brow='up'))],
           jitter=False)
     + [hat('WB0', 0.7, (0.33, 0.43), 7.38, 8.9, rel=0.22)]
     + [png('cube', 5.5 + 0.8 * i, 5.5 + 0.8 * i + 1.6, 0.42, 0.585, 0.09, **NONE, keys=[{'t': 5.5 + 0.8 * i + 1.6, 'x': 1.12, 'ease': 'linear'}])
        for i in range(4)]
     + [prop('bx', 'box', 8.05, 8.9, 0.76, 0.5, 0.24), text('FICTIONAL', 7.5, 8.9, 0.5, 0.22, 0.07, w=0.5, rot=-8, fill=RED, **POP)]),
    # "Naturally, the obvious question is: where's the mold?"  close-up, looks around, the square cutter pops up
    (8.88, 'art/WB3', FT((0.5, 0.48, 1.05), (0.5, 0.46, 1.15)), 'cut', [
        eyes('WB3', [(8.88, dict(look=[-0.8, 0], brow='up')), (9.5, dict(look=[0.8, 0])), (10.1, dict(look=[0, 0], brow='worried')),
                     (10.6, dict(look=[0.8, -0.8], brow='up', scale=1.08))], jitter=False),
        icon('question', 9.4, 11.17, 0.2, 0.25, 0.1, wobble=8, **POP),
        prop('mold', 'cutter', 10.6, 11.17, 0.78, 0.25, 0.32), icon('question', 10.85, 11.17, 0.9, 0.16, 0.08, **POP)]),
    # B2 — "Let's investigate our imaginary cube factory."  sniffing with a magnifier, hard hat on
    (11.17, FAC, HOLD(0.5, 0.56, 1.02), 'cut',
     block('WB7', 11.17, y=0.55, w=0.8, eye_keys=[(11.17, dict(look=[-0.6, 0.8], brow='up')), (12.3, dict(brow='smug', open=0.6, low=0.2))],
           jitter=False)
     + [hat('WB7', 0.8, (0.33, 0.5), 11.2, 13.14, rel=0.2),
        png('magnifier', 11.3, 13.14, 0.24, 0.66, 0.3, **POP, keys=[{'t': 12.0, 'x': 0.3, 'y': 0.63}, {'t': 12.7, 'x': 0.22, 'y': 0.67}]),
        text('IMAGINARY', 11.94, 13.14, 0.5, 0.25, 0.075, w=0.55, rot=-8, fill=RED, **POP)]),
    # "A square opening would be a wonderfully simple explanation."  blueprint card drops in
    (13.14, FAC, HOLD(0.5, 0.5, 1.0), 'cut',
     [prop('bp', 'blueprint', 13.14, 15.42, 0.5, -0.3, 0.78, [{'t': 13.5, 'y': 0.4, 'ease': 'back'}], pop=False)]
     + block('WB4', 13.14, x=0.72, y=0.7, w=0.55, eye_keys=[(13.14, dict(look=[-0.6, -0.8], brow='up')),
                                                           (14.46, dict(mood='happy', brow='up'))], jitter=False)
     + [text('SQUARE EXIT?', 13.3, 15.42, 0.5, 0.21, 0.065, w=0.6, fill=YEL, **POP), icon('check', 14.46, 15.42, 0.86, 0.28, 0.09, **POP)]),
    # "Push soft material through the right shape, and out comes a block."  round shape in, block out
    (15.4, FAC, HOLD(0.5, 0.55, 1.05), 'cut',
     [prop('ct', 'cutter', 15.4, 18.04, 0.55, 0.55, 0.3),
      png('mat_0', 15.6, 16.6, -0.1, 0.55, 0.16, **NONE, keys=[{'t': 16.5, 'x': 0.5, 'ease': 'in'}], out='fade', out_dur=0.1),
      png('mat_2', 17.2, 18.04, 0.58, 0.56, 0.16, **POP, keys=[{'t': 17.55, 'x': 0.82, 'ease': 'out'}])]
     + block('WB1', 15.4, x=0.2, y=0.72, w=0.45, eye_keys=[(15.4, dict(look=[1, 0], brow='up')), (17.25, dict(look=[1, 0], mood='shock', brow='up')),
                                                        (17.7, dict(mood='happy', brow='up'))], jitter=False)),
    # "Except researchers found the shape developing before the material even reached the exit."  WRONG MODEL stamp
    (18.02, 'art/RS1', FT((0.5, 0.45, 1.0), (0.5, 0.42, 1.08)), 'cut', [
        eyes('RS1', [(18.02, dict(look=[0, 0], brow='up')), (18.7, dict(brow='angry', look=[0, 0.4]))], jitter=False),
        prop('bp2', 'blueprint', 18.05, 19.42, 0.5, 1.4, 0.6, [{'t': 18.35, 'y': 0.6, 'ease': 'back'}], pop=False),
        text('WRONG MODEL', 18.6, 19.42, 0.5, 0.6, 0.075, w=0.62, rot=-12, fill=RED, edge='#ffffff', **POP)]),
    # "... the shape developing before the material even reached the exit."  X-ray gut, block already formed inside
    (19.4, BUSH, HOLD(0.48, 0.55, 1.05), 'cut',
     xray_on(block('WB2', 19.4, eye_keys=[(19.4, dict(look=[-0.8, 0.3], brow='up')), (20.9, dict(mood='shock', brow='up'))], jitter=False),
             19.4, 21.84, keys=[{'t': 19.85, 'alpha': 1.0}], alpha=0.0)
     + [icon('spark', 19.85, 21.84, *GUT['block'], 0.09, **POP),
        text('BEFORE THE EXIT', 19.8, 21.84, 0.5, 0.28, 0.065, w=0.66, fill=CYA, **POP),
        prop('ar', 'arrow_out', 21.2, 21.84, 0.03, GUT['exit'][1], 0.16, rot=180)]),
    # B3 — "The important machinery is farther inside, in the final section of the intestine."  push in, circle
    (21.82, BUSH, FT((0.5, 0.55, 1.0), (0.32, 0.56, 1.3)), 'cut',
     xray_on(block('WB2', 21.82, eye_keys=[(21.82, dict(look=[-1, 0.3], brow='up')), (23.8, dict(brow='smug', open=0.6, low=0.25))], jitter=False),
             21.82, 24.99)
     + [prop('ci', 'circle_red', 23.8, 24.99, *GUT['final'], 0.3),
        text('FINAL SECTION', 24.0, 24.99, 0.32, 0.36, 0.05, w=0.42, fill=ORA, **POP)]),
    # "That changes the puzzle completely."
    (24.98, 'art/WB3', FT((0.5, 0.48, 1.12), (0.5, 0.48, 1.02), 'out'), 'cut', [
        eyes('WB3', [(24.98, dict(mood='shock', brow='up')), (25.8, dict(mood=None, brow='up', look=[0.7, -0.6]))], jitter=False),
        prop('mold2', 'cutter', 25.0, 26.46, 0.8, 0.24, 0.28), icon('x', 25.5, 26.46, 0.8, 0.24, 0.18, **POP)]),
    # "We're no longer asking how a square doorway makes a square package."
    (26.45, FAC, HOLD(0.5, 0.55, 1.05), 'cut',
     [prop('ct2', 'cutter', 26.5, 29.12, 0.45, 0.56, 0.3), prop('bx2', 'box', 28.55, 29.12, 0.76, 0.54, 0.22),
      icon('x', 28.75, 29.12, 0.58, 0.52, 0.34, **POP)]
     + block('WB4', 26.45, x=0.2, y=0.74, w=0.45, eye_keys=[(26.45, dict(look=[1, -0.4], brow='up')), (28.8, dict(brow='smug', open=0.6, low=0.2))],
             jitter=False)),
    # "We're asking how the walls of a soft tube help produce corners."  side view of the model tube
    (29.11, BUSHB, HOLD(0.5, 0.5, 1.0), 'cut',
     [prop('tb', 'tube_side', 29.11, 31.75, 1.4, 0.45, 0.9, [{'t': 29.45, 'x': 0.5, 'ease': 'back'}], pop=False),
      text('SOFT TUBE', 30.17, 31.75, 0.5, 0.27, 0.07, w=0.5, fill=CYA, **POP)]
     + [icon('spark', 31.28 + 0.05 * i, 31.75, x, y, 0.06, **POP) for i, (x, y) in
        enumerate([(0.687, 0.412), (0.827, 0.412), (0.687, 0.488), (0.827, 0.488)])]
     + block('WB1', 29.11, x=0.5, y=0.82, w=0.5, eye_keys=[(29.11, dict(look=[0, -1], brow='up')), (31.3, dict(mood='happy', brow='up'))],
             jitter=False)),
    # B4 — "Those walls don't have identical mechanical properties all the way around."  cross-section, labels
    (31.74, BUSHB, HOLD(0.5, 0.48, 1.0), 'cut',
     [prop('r0', 'ring_0', 31.74, 34.61, 0.5, 0.45, 0.85, [{'t': 34.6, 'rot': 12}]),
      text('STIFF', 32.95, 34.61, 0.82, 0.27, 0.06, w=0.26, fill=BLU, **POP), text('SOFT', 33.26, 34.61, 0.5, 0.24, 0.06, w=0.22, fill=ORA, **POP),
      text('STIFF', 33.6, 34.61, 0.18, 0.63, 0.06, w=0.26, fill=BLU, **POP)]
     + block('WB6', 31.74, x=0.5, y=0.86, w=0.42, eye_keys=[(31.74, dict(look=[0, -1], brow='up')), (33.5, dict(brow='worried', look=[0.5, -1]))],
             jitter=False)),
    # "Researchers examined differences in the tissue ..."
    (34.6, 'art/RS2', FT((0.5, 0.45, 1.0), (0.5, 0.48, 1.1)), 'cut', [
        eyes('RS2', [(34.6, dict(look=[0, 1], brow='neutral', open=0.55, low=0.2))], jitter=False),
        text('TISSUE', 35.91, 36.44, 0.3, 0.55, 0.07, w=0.36, rot=-6, fill=ORA, **POP), icon('check', 35.4, 36.44, 0.7, 0.62, 0.08, **POP)]),
    # "... and tested models of how varying stiffness, together with contractions, could shape the material passing through."
    (36.43, BUSHB, HOLD(0.5, 0.5, 1.0), 'cut',
     [prop('tb2', 'tube_side', 36.43, 40.87, 0.45, 0.45, 0.85, pose=[{'t': 38.62 + 0.4 * i, 'squash': 0.05 * (-1) ** i, 'dur': 0.2} for i in range(5)]),
      text('MODEL', 36.66, 37.59, 0.45, 0.28, 0.07, w=0.36, fill=YEL, **POP),
      text('STIFFNESS', 37.59, 38.62, 0.45, 0.28, 0.065, w=0.5, fill=BLU, **POP),
      text('CONTRACTIONS', 38.62, 40.87, 0.45, 0.28, 0.06, w=0.6, fill=ORA, **POP)]
     + block('RS0', 36.43, src='cut/RS0.png', x=1.3, y=0.66, w=0.55, keys=[{'t': 36.8, 'x': 0.82, 'ease': 'back'}], breathe=0.006,
             eye_keys=[(36.43, dict(look=[-1, 0.2], brow='up')), (39.2, dict(mood='happy', brow='up'))], jitter=False)),
    # "Different parts of the wall respond differently."  the card above the wombat squeezes
    (40.86, BUSH, HOLD(0.5, 0.52, 1.05), 'cut',
     block('WB1', 40.86, eye_keys=[(40.86, dict(look=[0, -1], brow='up')), (41.7, dict(look=[0.2, -1], brow='worried'))], jitter=False)
     + ring_swap(40.86, 42.53, [0, 0, 1, 2, 1, 2], x=0.5, y=0.2, w=0.42)),
    # B5 — "Picture a simplified tube with some sections that give more easily than others."
    (42.52, BUSHB, HOLD(0.5, 0.48, 1.0), 'cut',
     [prop('r1', 'ring_0', 42.52, 45.67, 0.5, 0.45, 0.85),
      text('GIVES', 44.43, 45.67, 0.5, 0.24, 0.065, w=0.3, fill=ORA, **POP), text('STIFF', 45.11, 45.67, 0.82, 0.27, 0.06, w=0.26, fill=BLU, **POP)]
     + block('WB6', 42.52, x=0.5, y=0.86, w=0.42, eye_keys=[(42.52, dict(look=[0, -1], brow='up')), (44.5, dict(mood='happy', brow='up'))],
             jitter=False)),
    # "When it contracts, the material doesn't have to deform equally in every direction."  contraction loop
    (45.66, BUSHB, FT((0.5, 0.46, 1.0), (0.5, 0.46, 1.1)), 'cut',
     ring_swap(45.66, 48.78, [0, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2])
     + [text('NOT EQUAL', 47.48, 48.78, 0.5, 0.21, 0.065, w=0.5, fill=RED, **POP)]),
    # "The model helps explain how a rounded starting shape can develop flatter sides and more defined edges."
    (48.77, BUSH, HOLD(0.5, 0.55, 1.0), 'cut',
     block('WB6', 48.77, y=0.62, w=0.75, eye_keys=[(48.77, dict(look=[0, -1], brow='up')), (51.3, dict(look=[0, -1], brow='worried')),
                                                  (52.4, dict(mood='happy', brow='up'))], jitter=False)
     + [text('MODEL', 48.92, 49.98, 0.5, 0.22, 0.07, w=0.4, fill=YEL, **POP),
        prop('m0', 'mat_0', 49.98, 51.27, 0.5, 0.38, 0.36), prop('m1', 'mat_1', 51.26, 52.35, 0.5, 0.38, 0.36),
        prop('m2', 'mat_2', 52.34, 53.15, 0.5, 0.38, 0.36),
        text('ROUND', 50.0, 51.27, 0.5, 0.2, 0.065, w=0.36, **POP), text('FLATTER SIDES', 51.28, 52.35, 0.5, 0.2, 0.06, w=0.66, **POP),
        text('EDGES', 52.36, 53.15, 0.5, 0.2, 0.065, w=0.36, fill=YEL, **POP)]
     + [icon('spark', 52.4 + 0.05 * i, 53.15, x, y, 0.06, **POP) for i, (x, y) in
        enumerate([(0.37, 0.31), (0.63, 0.31), (0.37, 0.45), (0.63, 0.45)])]),
    # B6 — "That picture is an explanation, ..."
    (53.14, BUSHB, HOLD(0.5, 0.48, 1.0), 'cut',
     [prop('r2', 'ring_2', 53.14, 54.41, 0.5, 0.45, 0.85), text('EXPLANATION', 53.83, 54.41, 0.5, 0.21, 0.065, w=0.62, fill=YEL, **POP)]),
    # "... not an actual look inside a working wombat."
    (54.4, BUSH, HOLD(0.52, 0.55, 1.05), 'cut',
     block('WB0', 54.4, eye_keys=[(54.4, dict(look=[0.6, 0.6], brow='up')), (55.3, dict(brow='angry', look=[0.6, 0.7]))], jitter=False)
     + [png('magnifier', 54.5, 56.32, 0.62, 0.6, 0.3, **POP, keys=[{'t': 55.2, 'x': 0.55, 'y': 0.58}]),
        icon('x', 54.94, 56.32, 0.55, 0.56, 0.2, **POP), text('NOT A REAL VIEW', 54.6, 56.32, 0.5, 0.28, 0.06, w=0.66, fill=RED, **POP)]),
    # "And it doesn't prove why cube-shaped droppings evolved."
    (56.31, BUSH, HOLD(0.5, 0.55, 1.05), 'cut',
     block('WB4', 56.31, eye_keys=[(56.31, dict(look=[0.5, 0.8], brow='worried')), (57.5, dict(brow='sad', open=0.6, low=0.2))], jitter=False)
     + cubes_row(56.4, t1=58.82) + [text('NOT PROVEN', 56.97, 58.82, 0.5, 0.28, 0.07, w=0.55, fill=RED, **POP),
                                    icon('question', 58.28, 58.82, 0.8, 0.4, 0.09, wobble=8, **POP)]),
    # "The useful discovery here is about the physical process:"
    (58.81, 'art/RS1', FT((0.5, 0.42, 1.08), (0.5, 0.45, 1.0)), 'cut', [
        eyes('RS1', [(58.81, dict(look=[0, 0], brow='up')), (59.7, dict(mood='happy', brow='up'))], jitter=False),
        icon('spark', 59.25, 61.26, 0.34, 0.39, 0.1, **POP),
        text('PHYSICAL PROCESS', 60.31, 61.26, 0.5, 0.83, 0.06, w=0.72, fill=CYA, **POP)]),
    # "the shape is being made inside the gut, rather than stamped on at the end."  the cutter tries the exit and is crossed out
    (61.25, BUSH, HOLD(0.45, 0.55, 1.1), 'cut',
     xray_on(block('WB2', 61.25, eye_keys=[(61.25, dict(look=[-0.8, 0.3], brow='up')), (62.8, dict(brow='smug', open=0.6, low=0.2))], jitter=False),
             61.25, 64.46)
     + [icon('spark', 61.86, 64.46, *GUT['block'], 0.1, **POP), text('MADE INSIDE', 61.9, 64.46, 0.5, 0.3, 0.07, w=0.55, fill=CYA, **POP),
        png('cutter', 63.46, 64.46, -0.25, 0.55, 0.2, **NONE, keys=[{'t': 63.85, 'x': 0.05, 'ease': 'out'}]),
        icon('x', 63.95, 64.46, 0.07, 0.55, 0.18, **POP)]),
    # "So our imaginary factory can throw away its square cookie cutter."
    (64.45, FAC, HOLD(0.5, 0.55, 1.02), 'cut',
     block('WB6', 64.45, y=0.62, w=0.75, eye_keys=[(64.45, dict(look=[0, -0.8], brow='smug', open=0.6, low=0.2)), (65.9, dict(mood='happy', brow='up'))],
           jitter=False)
     + [hat('WB6', 0.75, (0.5, 0.36), 64.5, 67.41, rel=0.22),
        png('cutter', 64.5, 66.6, 0.5, 0.3, 0.3, **POP, keys=[{'t': 65.86}, {'t': 66.5, 'x': 1.4, 'y': -0.15, 'rot': 420, 'ease': 'in'}])]),
    # B7 — "The surprising part isn't just the cube."
    (67.4, 'art/WB3', FT((0.5, 0.48, 1.0), (0.5, 0.48, 1.1)), 'cut', [
        eyes('WB3', [(67.4, dict(look=[0, 0], brow='up')), (68.1, dict(brow='smug', open=0.6, low=0.2, look=[0.7, -0.6]))], jitter=False),
        prop('cbz', 'cube', 68.77, 69.18, 0.8, 0.24, 0.22)]),
    # "It's that differences within a soft tube can help build the corners before anything comes out."  final hold, no cut
    (69.17, BUSH, FT((0.52, 0.5, 1.0), (0.52, 0.5, 1.06)), 'cut',
     block('WB6', 69.17, x=0.3, y=0.56, w=1.0, eye_keys=[(69.17, dict(mood='happy', brow='up')), (70.4, dict(mood=None, brow='smug', open=0.6, low=0.2, look=[1, 0])),
                                                 (71.4, dict(mood='happy', brow='up'))], jitter=False)
     + [prop('rF', 'ring_2', 69.2, END, 0.71, 0.37, 0.42), prop('ciF', 'circle_red', 70.25, END, 0.71, 0.37, 0.47),
        text('SOFT TUBE', 70.3, END, 0.71, 0.22, 0.055, w=0.42, fill=ORA, **POP)]
     + [icon('spark', 71.34 + 0.06 * i, END, x, y, 0.05, **POP) for i, (x, y) in enumerate(RING_CORNERS(0.71, 0.37, 0.42))]),
]
SFX = [(0.05, 'sfx_whoosh', -15), (0.69, 'sfx_pop', -13), (0.85, 'sfx_pop', -14), (1.01, 'sfx_pop', -14), (1.55, 'sfx_ding', -15),
       (2.78, 'sfx_thud', -12), (3.52, 'sfx_pop', -14), (4.66, 'sfx_sparkle', -14), (5.3, 'sfx_whoosh', -15), (5.8, 'sfx_thud', -14),
       (7.38, 'sfx_slide', -13), (8.05, 'sfx_ding', -14), (9.4, 'sfx_pop', -15), (10.6, 'sfx_pop', -13), (11.3, 'sfx_whoosh', -16),
       (11.94, 'sfx_pop', -14), (13.2, 'sfx_whoosh', -14), (14.46, 'sfx_ding', -15), (15.7, 'sfx_slide', -14), (17.2, 'sfx_pop', -13),
       (17.43, 'sfx_ding', -14), (18.1, 'sfx_whoosh', -15), (18.6, 'sfx_thud', -10), (19.85, 'sfx_sparkle', -14), (21.2, 'sfx_whoosh', -15),
       (23.8, 'sfx_pop', -14), (24.98, 'sfx_stretch', -14), (25.5, 'sfx_buzz', -14), (28.55, 'sfx_pop', -14), (28.75, 'sfx_buzz', -14),
       (29.15, 'sfx_whoosh', -14), (31.28, 'sfx_sparkle', -14), (31.8, 'sfx_pop', -14), (32.95, 'sfx_pop', -15), (33.26, 'sfx_pop', -15),
       (35.4, 'sfx_pop', -15), (36.5, 'sfx_whoosh', -14), (37.59, 'sfx_pop', -15), (38.62, 'sfx_stretch', -14), (41.45, 'sfx_stretch', -15),
       (44.43, 'sfx_pop', -15), (45.86, 'sfx_stretch', -14), (47.48, 'sfx_buzz', -15), (49.98, 'sfx_pop', -14), (51.26, 'sfx_pop', -14),
       (52.34, 'sfx_sparkle', -13), (53.83, 'sfx_ding', -15), (54.94, 'sfx_buzz', -14), (56.4, 'sfx_pop', -15), (56.97, 'sfx_thud', -13),
       (59.25, 'sfx_sparkle', -15), (61.86, 'sfx_sparkle', -14), (63.46, 'sfx_whoosh', -14), (63.95, 'sfx_buzz', -14), (64.5, 'sfx_slide', -14),
       (65.9, 'sfx_whoosh', -11), (68.77, 'sfx_pop', -14), (70.25, 'sfx_pop', -14), (71.34, 'sfx_sparkle', -14)]
KICKS = [0.69, 18.6, 28.75, 65.9]

kit.write_edl(kit.split_long(SHOTS, max_shot=1.6, piece=1.15, keep=(69.17,)), END, 'edl.json', 'out/ATE01-003_wombat.mp4', sfx=SFX, kicks=KICKS,
              cam_gain=1.0, handheld=0.0025, bed_db=-10,
              grade={'saturation': 0.82, 'contrast': 1.05, 'brightness': -0.02, 'temperature': 8200})
