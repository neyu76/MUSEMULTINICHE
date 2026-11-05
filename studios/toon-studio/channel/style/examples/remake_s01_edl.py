"""Reference build for animal-toon-eyes (accepted by the user 2026-11-03): our own 18 s script about pandas, laid out on
the STRUCTURE of sample S01's first 20 s (beats, poses, devices) — no sample text, pictures, music or voice.
Run it inside the project folder (art/, cut/, plate/, props/, audio/, voice/, words.json made as recipe.md describes):
    python <repo>/styles/animal-toon-eyes/examples/remake_s01_edl.py && bin/vidclone assemble edl.json
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import kit
from kit import FT, HOLD, POP, NONE, LAND, CHEW, block, eyes, icon, png, text

END = 18.35
# eye centres / size in SPRITE fractions (full-frame cuts = picture fractions), jaw parts, contact shadows — read off
# kit.grid_crop() crops of each picture
EYE = {
    'P0': dict(l=(0.475, 0.546), r=(0.569, 0.546), size=0.056), 'P1': dict(l=(0.4575, 0.421), r=(0.55, 0.421), size=0.056),
    'P2': dict(l=(0.47, 0.463), r=(0.563, 0.456), size=0.055), 'P3': dict(l=(0.399, 0.454), r=(0.634, 0.453), size=0.125),
    'P4': dict(l=(0.4375, 0.6395), r=(0.604, 0.636), size=0.095), 'P6': dict(l=(0.469, 0.4055), r=(0.5625, 0.4055), size=0.056),
    'D0': dict(l=(0.64, 0.497), r=(0.781, 0.505), size=0.05), 'D1': dict(l=(0.4925, 0.408), r=(0.674, 0.408), size=0.065),
    'D2': dict(l=(0.629, 0.4557), r=(0.792, 0.459), size=0.058),
    'B0': dict(l=(0.5906, 0.540), size=0.052, single='l'), 'B1': dict(l=(0.589, 0.509), size=0.052, single='l'),
    'B2': dict(r=(0.55, 0.4937), size=0.058, single='r'), 'B3': dict(l=(0.4975, 0.3035), r=(0.682, 0.305), size=0.075),
    'deer': dict(l=(0.651, 0.323), r=(0.773, 0.32), size=0.075), 'hippo': dict(l=(0.638, 0.2375), r=(0.934, 0.2375), size=0.085),
    'frog': dict(l=(0.34, 0.118), r=(0.664, 0.118), size=0.16), 'bird': dict(l=(0.875, 0.59), size=0.11, single='l'),
}
JAW = {  # lower jaw lifted off the block: ellipse (x, y, rx, ry; rx/ry in sprite widths), tilt, hinge
    'P1': dict(ellipse=[0.504, 0.489, 0.031, 0.0143], pivot=[0.504, 0.481]),
    'P6': dict(ellipse=[0.5156, 0.4704, 0.028, 0.0135], pivot=[0.5156, 0.4612]),
    'D0': dict(ellipse=[0.69, 0.57, 0.075, 0.024], erot=10, pivot=[0.62, 0.555], hole='#3a1c1c'),
    'B0': dict(ellipse=[0.62, 0.68, 0.065, 0.022], erot=20, pivot=[0.565, 0.66]),
    'B1': dict(ellipse=[0.555, 0.672, 0.05, 0.018], erot=10, pivot=[0.52, 0.655]),
}
SHADOW = {'P0': (0.47, 0.75, 0.5), 'P1': (0.47, 0.77, 0.55), 'P2': (0.5, 0.79, 0.55), 'D0': (0.4, 0.69, 0.5),
          'D1': (0.42, 0.75, 0.45), 'D2': (0.42, 0.75, 0.45), 'deer': (0.45, 0.98, 0.6), 'hippo': (0.5, 0.97, 0.75),
          'frog': (0.5, 0.96, 0.85)}
kit.setup(eye=EYE, jaw=JAW, shadow=SHADOW, lids={'P': '#a39c92', 'D': '#5a524c'}, no_gain=('P3', 'P4'))

def ferns(t0, t1, y=0.9): return png('ferns', t0, t1, 0.5, y, 1.25, **NONE)
def bush(t0, t1, x=0.5, y=0.93, w=1.15): return png('grass_bush', t0, t1, x, y, w, **NONE)

# (T, background picture, camera, transition, layers)
SHOTS = [
    # "Everyone says pandas are vegetarians, right?"
    (0.00, 'plate/P_b', HOLD(0.5, 0.55, 1.08), 'cut',
     block('P0', 0, x=0.24, y=0.62, w=1.45, keys=[{'t': 0.8, 'x': 0.5, 'y': 0.5, 'w': 1.0, 'ease': 'out', 'hop': 0.018, 'hops': 3}],
           pose=LAND(0.8, 0.04), eye_keys=[(0, dict(look=[0.5, -0.2], brow='neutral')), (0.3, dict(look=[-0.5, -0.1], brow='up')),
                                            (0.6, dict(look=[0, 0], brow='up', scale=1.1))], jitter=False) + [
         png('leaf', 0, 0.6, 0.12, 0.32, 0.6, **NONE, keys=[{'t': 0.5, 'x': -0.4, 'y': 0.28, 'ease': 'in'}]),
         png('bamboo_bitten', 0, 0.92, 0.86, 0.8, 0.12, **NONE, rot=8)]),
    (0.92, 'plate/P_b', HOLD(0.5, 0.52, 1.1), 'cut',
     block('P1', 0.92, y=0.45, keys=[{'t': 1.06, 'y': 0.5, 'ease': 'in'}], pose=LAND(1.06),
           eye_keys=[(0.92, dict(look=[0, 0], brow='up', scale=1.15)), (1.1, dict(mood='happy', brow='up')),
                     (1.45, dict(mood=None, brow='smug', open=0.6, low=0.25))], jitter=False) + [
         png('bamboo_bitten', 0.92, 1.73, 0.86, 0.8, 0.12, **NONE, rot=8)]),
    (1.73, 'plate/P_b', HOLD(0.5, 0.48, 1.2), 'cut',
     block('P2', 1.73, rot=-5, w=0.97, keys=[{'t': 1.9, 'rot': 0, 'w': 1.02, 'ease': 'back'}],
           eye_keys=[(1.73, dict(look=[-0.6, -0.9], brow='worried', low=0.2)), (1.95, dict(look=[0.6, -0.9], brow='worried', low=0.2))],
           jitter=False) + [icon('question', 1.76, 2.07, 0.76, 0.28, 0.1, wobble=8, **POP)]),
    # "Hmm, not quite."  close-up: the bird block (with its own eye) flies an arc across, then the hand pats the head
    (2.07, 'art/P3', FT((0.5, 0.45, 1.05), (0.5, 0.42, 1.12)), 'cut', [
        dict(type='cutout', id='bird', src='props/bird.png', x=-0.1, y=0.16, w=0.22, t0=2.07, **NONE,
             keys=[{'t': 2.3, 'x': 0.5, 'y': 0.06, 'ease': 'linear'}, {'t': 2.5, 'x': 1.1, 'y': 0.12, 'ease': 'linear'}],
             pose=[{'t': 2.07 + i * 0.1, 'squash': (0.08 if i % 2 else -0.08), 'dur': 0.05} for i in range(5)]),
        eyes('bird', [(2.07, dict(look=[1, 0.6], brow='none'))], jitter=False, parent='bird'),
        eyes('P3', [(2.07, dict(look=[-1, -0.8], brow='up')), (2.28, dict(look=[0, -1], brow='up', scale=1.1)),
                    (2.42, dict(look=[1, -0.8], brow='worried'))], jitter=False)]),
    (2.52, 'art/P4', FT((0.5, 0.45, 1.08), (0.5, 0.47, 1.0), 'out'), 'cut', [
        png('hand', 2.5, 3.17, 1.2, 0.2, 0.75, **NONE,
            keys=[{'t': 2.6, 'x': 0.68, 'y': 0.24, 'ease': 'out'}, {'t': 2.72, 'y': 0.29}, {'t': 2.84, 'y': 0.24},
                  {'t': 2.96, 'y': 0.29}, {'t': 3.15, 'x': 1.2, 'y': 0.18, 'ease': 'in'}]),
        eyes('P4', [(2.52, dict(mood='shock', brow='up')), (2.66, dict(mood=None, brow='sad', open=0.5, low=0.3)),
                    (2.9, dict(brow='worried', open=0.65, low=0.2, look=[0, -0.6]))], jitter=False)]),
    # "So why all the bamboo?"  the hand offers a bamboo stalk; the panda leans toward it, delighted
    (3.17, 'plate/P_b', HOLD(0.48, 0.47, 1.25), 'cut',
     block('P1', 3.17, keys=[{'t': 3.85, 'rot': 0}, {'t': 4.05, 'rot': -6, 'x': 0.47, 'ease': 'back'}],
           eye_keys=[(3.17, dict(look=[0, 0], brow='worried')), (3.62, dict(look=[-1, 0.4], brow='up', scale=1.15)),
                     (3.95, dict(mood='happy', brow='up'))], jitter=False) + [
         png('hand_bamboo', 3.62, 4.25, -0.35, 0.47, 0.6, **NONE, keys=[{'t': 3.95, 'x': 0.25, 'ease': 'out'}]),
         icon('question', 4.0, 4.25, 0.78, 0.3, 0.09, **POP)]),
    # "For years, researchers watched pandas munch bamboo nonstop and figured:"
    (4.25, 'plate/R1_b', HOLD(0.5, 0.5, 1.05), 'cut',
     block('R1', 4.2, y=1.05, keys=[{'t': 4.8, 'y': 0.5, 'ease': 'back'}], breathe=0.01) + [ferns(4.2, 5.2), bush(4.2, 5.2, 0.1, 0.95, 0.7)]),
    (5.12, 'plate/R1_b', HOLD(0.5, 0.42, 1.2), 'cut',
     block('R1', 5.12, keys=[{'t': 5.8, 'w': 1.16, 'y': 0.56, 'ease': 'inout'}], breathe=0.01) + [
         ferns(5.1, 5.95), icon('spark', 5.5, 5.9, 0.3, 0.2, 0.08)]),
    # eating, like the sample: stalk to the mouth on every bite, jaw chewing, leaf bits, bitten stalk in the other paw
    (5.9, 'plate/P_b', HOLD(0.5, 0.47, 1.3), 'cut',
     block('P1', 5.9, chew=CHEW(5.9, 6.62, hz=3.6), eye_keys=[(5.9, dict(mood='happy', brow='up')), (6.25, dict(mood=None, brow='smug', open=0.6, low=0.3)),
                                                     (6.45, dict(mood='happy', brow='up'))], jitter=False)
     + kit.bites(5.9, 6.6, ('bamboo_held', 0.24), rest=(0.42, 0.59, -24), bite=(0.435, 0.56, -27), mouth=(0.515, 0.5)) + [png('bamboo_bitten', 5.9, 6.62, 0.63, 0.6, 0.09, **NONE, rot=6)]),
    (6.6, 'plate/P_b', HOLD(0.5, 0.44, 1.3), 'cut',
     block('P6', 6.6, chew=CHEW(6.6, 7.4, hz=3.0, dy=0.018), keys=[{'t': 7.3, 'x': 0.52, 'w': 1.04, 'ease': 'linear'}],
           eye_keys=[(6.6, dict(brow='smug', open=0.6, low=0.3, look=[0, 0.3])), (6.95, dict(mood='happy', brow='up')),
                     (7.2, dict(mood=None, brow='up', look=[0.4, 0]))], jitter=False) + [
         png('leaf_bits', 6.75, 7.05, 0.53, 0.48, 0.08, **POP, out='pop'), png('leaf_bits', 7.1, 7.38, 0.5, 0.485, 0.07, **POP, out='pop', rot=30)]),
    # "you become what you eat."
    (7.38, 'plate/R1_b', HOLD(0.5, 0.5, 1.02), 'dis',
     block('R2', 7.36, x=1.3, keys=[{'t': 7.62, 'x': 0.62, 'ease': 'back'}], breathe=0.01) + [ferns(7.3, 8.9), bush(7.3, 8.9, 0.92, 0.95, 0.6)] + [
         text(w, t, 8.82, 0.2, 0.2 + 0.065 * i, 0.06, w=0.34, rot=-6, **POP)
         for i, (w, t) in enumerate([('YOU', 7.8), ('BECOME', 7.97), ('WHAT', 8.18), ('YOU', 8.32), ('EAT', 8.43)])]),
    # "But try that logic on other animals and it falls apart fast."  group rebuilt from separate blocks
    (8.82, 'plate/G_b', FT((0.5, 0.55, 1.25), (0.5, 0.56, 1.0), 'out'), 'cut',
     block('deer', 8.8, x=-0.25, y=0.5, w=0.46, src='props/deer.png', keys=[{'t': 9.4, 'x': 0.2, 'ease': 'out', 'hop': 0.012, 'hops': 3}],
           pose=LAND(9.4, 0.03), eye_keys=[(8.82, dict(look=[1, 0], brow='neutral')), (9.95, dict(mood='shock', brow='up'))])
     + block('R2', 8.8, x=0.5, y=0.6, w=0.52, bid='R2g', breathe=0.01)
     + block('hippo', 8.8, x=1.3, y=0.66, w=0.46, src='props/hippo.png', keys=[{'t': 9.55, 'x': 0.8, 'ease': 'back'}],
             eye_keys=[(8.82, dict(look=[-1, 0], brow='smug', open=0.6)), (10.05, dict(brow='angry', open=0.7, look=[-0.6, -0.4]))])
     + block('frog', 9.3, x=0.3, y=1.05, w=0.2, src='props/frog.png',
             keys=[{'t': 9.6, 'x': 0.32, 'y': 0.83, 'ease': 'out', 'hop': 0.05, 'hops': 1}, {'t': 9.95, 'x': 0.36, 'y': 0.85, 'hop': 0.03, 'hops': 1}],
             pose=LAND(9.95, 0.08), eye_keys=[(9.3, dict(look=[0, -0.4], brow='up')), (10.15, dict(mood='shock', brow='up'))], jitter=False)
     + [bush(8.8, 10.6, 0.5, 0.97, 1.2),
        icon('question', 9.95, 10.52, 0.2, 0.22, 0.09, wobble=8, **POP), icon('question', 10.05, 10.52, 0.84, 0.42, 0.09, wobble=8, **POP),
        icon('question', 10.15, 10.52, 0.42, 0.74, 0.08, wobble=8, **POP)]),
    ('LOOP', 10.52, 11.65, ['R3', 'R4'], 0.19, ((0.55, 0.5, 1.0), (0.55, 0.5, 1.04)), 'plate/R1_b', HOLD(0.52, 0.42, 1.3)),
    # "Dogs chew grass just to throw it back up,"  dog block walks in to the grass tuft and chews; jaw keyframed
    (11.65, 'plate/D_b', HOLD(0.52, 0.55, 1.1), 'cut',
     block('D0', 11.63, x=-0.2, keys=[{'t': 12.1, 'x': 0.5, 'ease': 'out', 'hop': 0.014, 'hops': 4}], pose=LAND(12.1, 0.03),
           chew=CHEW(12.1, 12.44, hz=3.0, dy=0.008, rot=8),
           eye_keys=[(11.65, dict(look=[0.6, 0.6], brow='up')), (12.12, dict(brow='smug', open=0.55, low=0.3, look=[0.2, 1]))], jitter=False)
     + [png('grass_tuft', 11.6, 12.44, 0.7, 0.68, 0.3, **NONE,
            keys=[{'t': 12.17, 'rot': 4}, {'t': 12.27, 'rot': -3}, {'t': 12.37, 'rot': 3}])]),
    (12.42, 'plate/D_b', HOLD(0.5, 0.45, 1.2), 'cut',
     block('D1', 12.42, keys=[{'t': 12.56, 'y': 0.46, 'ease': 'out'}, {'t': 12.7, 'y': 0.5, 'ease': 'in'}], pose=LAND(12.7),
           eye_keys=[(12.42, dict(look=[0, 0], brow='up', scale=1.1)), (12.72, dict(mood='shock', brow='worried'))], jitter=False) + [
         png('grass_tuft', 12.4, 13.02, 0.6, 0.68, 0.3, **NONE),   # at the feet, in front of the front leg (like the sample)
         png('grass_blades', 12.42, 13.02, 0.585, 0.5, 0.11, **NONE, bob=0.004, bob_hz=3),
         icon('sweat', 12.6, 13.0, 0.72, 0.28, 0.05, **{'in': 'slide_top'})]),
    (13.0, 'plate/D_b', HOLD(0.52, 0.52, 1.2), 'cut',
     block('D2', 13.0, keys=[{'t': 13.12, 'w': 1.09, 'y': 0.54, 'ease': 'back'}, {'t': 13.5, 'w': 1.04, 'y': 0.52}],
           eye_keys=[(13.0, dict(brow='sad', open=0.5, low=0.35)), (13.3, dict(brow='worried', open=0.35, low=0.3, look=[0, 0.8]))],
           jitter=False) + [png('grass_tuft', 12.98, 13.75, 0.6, 0.69, 0.3, **NONE), png('splat', 13.05, 13.73, 0.66, 0.76, 0.34, **POP)]),
    # "and polar bears will snack on berries and seaweed when seals are hard to find."
    (13.73, 'plate/BT_b', HOLD(0.48, 0.55, 1.12), 'cut',
     block('B0', 13.7, x=0.12, keys=[{'t': 14.15, 'x': 0.5, 'ease': 'out'}], pivot=(0.0, 0.55),
           pose=[{'t': 14.75, 'sway': 6, 'dur': 0.2}, {'t': 15.0, 'sway': -6, 'dur': 0.15}], chew=CHEW(14.2, 15.17, hz=2.6, dy=0.007, rot=10),
           eye_keys=[(13.73, dict(look=[1, 0.6], brow='up')), (14.2, dict(mood='happy', brow='up')),
                     (14.7, dict(mood=None, brow='smug', open=0.6, low=0.3, look=[1, 1]))], jitter=False) + [
         png('berries', 14.15, 15.17, 0.69, 0.71, 0.13, **POP, wobble=6)]),
    (15.17, 'plate/BS_b', HOLD(0.5, 0.6, 1.12), 'cut',
     block('B1', 15.15, x=0.2, keys=[{'t': 15.42, 'x': 0.5, 'ease': 'out'}], pivot=(0.0, 0.6), chew=CHEW(15.4, 15.72, hz=2.8, dy=0.007, rot=9),
           eye_keys=[(15.17, dict(brow='smug', open=0.6, low=0.25, look=[0.6, 1])), (15.5, dict(brow='up', look=[1, 0]))], jitter=False)),
    (15.7, 'plate/BS_b', HOLD(0.5, 0.52, 1.1), 'cut',
     block('B2', 15.68, x=0.78, keys=[{'t': 15.92, 'x': 0.5, 'ease': 'back'}], pivot=(1.0, 0.7), pose=[{'t': 16.08, 'sway': -4, 'dur': 0.25}],
           eye_keys=[(15.7, dict(look=[-0.6, -0.8], brow='up')), (15.95, dict(brow='sad', open=0.8, look=[-0.8, -1])),
                     (16.3, dict(brow='worried', open=0.6, low=0.2, look=[-0.8, -1]))], jitter=False) + [
         png('bubble_seal', 15.95, 16.73, 0.38, 0.22, 0.5, wobble=3, **POP), icon('tear', 16.25, 16.73, 0.56, 0.53, 0.035, **{'in': 'slide_top'})]),
    # "Are they vegetarians too?"
    (16.73, 'plate/BT_b', HOLD(0.5, 0.42, 1.12), 'cut',
     block('B3', 16.7, y=0.9, keys=[{'t': 16.98, 'y': 0.5, 'ease': 'back'}], pose=LAND(16.98, 0.04),
           eye_keys=[(16.73, dict(mood='shock', brow='up')), (17.0, dict(mood=None, brow='up', pupil=1.25, scale=1.1)),
                     (17.45, dict(brow='smug', open=0.6, low=0.25, pupil=1.0))], jitter=False) + [
         icon('question', 17.0, END, 0.78, 0.18, 0.11, wobble=8, **POP)]),
]
SFX = [(0.05, 'sfx_whoosh', -15), (0.8, 'sfx_thud', -15), (1.06, 'sfx_thud', -13), (1.74, 'sfx_pop', -13), (2.1, 'sfx_whoosh', -14),
       (2.6, 'sfx_thud', -11), (2.75, 'sfx_thud', -15), (3.62, 'sfx_slide', -13), (3.95, 'sfx_ding', -15), (4.3, 'sfx_whoosh', -13),
       (4.8, 'sfx_pop', -15), (5.5, 'sfx_sparkle', -15), (6.09, 'sfx_pop', -17), (6.64, 'sfx_pop', -17), (7.4, 'sfx_whoosh', -13),
       (7.8, 'sfx_pop', -14), (7.97, 'sfx_pop', -14), (8.18, 'sfx_pop', -14), (8.32, 'sfx_pop', -14), (8.43, 'sfx_ding', -13),
       (8.85, 'sfx_whoosh', -15), (9.4, 'sfx_thud', -16), (9.55, 'sfx_slide', -15), (9.6, 'sfx_pop', -15), (9.95, 'sfx_pop', -14),
       (10.05, 'sfx_pop', -14), (10.15, 'sfx_pop', -14), (10.58, 'sfx_buzz', -13), (11.66, 'sfx_whoosh', -14), (12.6, 'sfx_stretch', -14),
       (12.7, 'sfx_thud', -15), (13.05, 'sfx_thud', -11), (13.73, 'sfx_whoosh', -14), (14.15, 'sfx_pop', -16), (15.17, 'sfx_slide', -14),
       (15.7, 'sfx_whoosh', -14), (15.95, 'sfx_pop', -13), (16.25, 'sfx_stretch', -16), (16.75, 'sfx_whoosh', -14), (16.98, 'sfx_thud', -14),
       (17.0, 'sfx_pop', -13)]
KICKS = [2.6, 13.05]

def expand(shots):
    """The ranger's confused loop: R3 / R4 swapped every 0.19 s, block rocks, deer + hippo peek in at the edges like the sample."""
    out = []
    for s in shots:
        if s[0] != 'LOOP': out.append(s); continue
        _, t0, t1, imgs, per, (a, b), plate, cam = s
        n = max(2, round((t1 - t0) / per)); step = (t1 - t0) / n
        at = lambda u: [a[j] + (b[j] - a[j]) * u for j in range(3)]
        for i in range(n):
            T = t0 + i * step; img = imgs[i % len(imgs)]
            (x0, y0, w0), (x1, y1, w1) = at(i / n), at((i + 1) / n)
            lay = block('deer', T, x=0.02, y=0.34, w=0.62, src='props/deer.png', breathe=0.0,
                        eye_keys=[(T, dict(look=[1, 0.2], brow='smug', open=0.6))], jitter=False, bid=f'deer{i}')
            lay += block('hippo', T, x=1.0, y=0.84, w=0.5, src='props/hippo.png', breathe=0.0,
                         eye_keys=[(T, dict(look=[-1, -0.6], brow='up'))], jitter=False, bid=f'hippo{i}')
            lay += block(img, T, x=x0, y=y0, w=w0, rot=(1.5 if i % 2 else -1.5),
                         keys=[{'t': T + step, 'x': x1, 'y': y1, 'w': w1, 'ease': 'linear'}])
            lay += [ferns(T - 0.05, T + step + 0.05),
                    png('bubble_scribble', 10.58, 11.65, 0.75, 0.16, 0.36, wobble=5, **({'in': 'pop'} if i == 0 else NONE))]
            out.append((round(T, 3), plate, cam, 'cut' if i else 'dis', lay))
    return out


kit.write_edl(expand(SHOTS), END, 'edl.json', 'out/REMAKE-S01_panda.mp4', sfx=SFX, kicks=KICKS)
