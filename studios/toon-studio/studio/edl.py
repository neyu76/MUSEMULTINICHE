"""What an episode's gen_edl.py imports:  from studio.edl import *
Re-exports the channel kit (setup, block, eyes, png, text, icon, FT, HOLD, POP, NONE, LAND, CHEW, bites, IDLE, split_long,
grid_crop) and adds the helpers proven on ATE01-004 plus finish(), which applies the channel's build settings.

    kit.setup(eye={...}, shadow={...}, lids={...}, no_gain=(...))
    SHOTS = [(T, 'plate/REEF_b', HOLD(0.5, 0.5, 1.04), 'cut', block('OC0', T, ...) + [text(...), prop(...)]), ...]
    SFX = [S(0.28, 'sx_plop', -13), ...]
    finish(SHOTS, END, SFX, kicks=[20.87], keep=(66.67,))

All times are narration seconds (words.json); a visual lands ~0.05 s before its word, its SFX on the same time."""
import json, os, sys
from . import cfg

if cfg.STYLE not in sys.path: sys.path.insert(0, cfg.STYLE)
import kit                                                                     # noqa: E402
from kit import (FT, HOLD, POP, NONE, LAND, CHEW, IDLE, block, eyes, icon, png, text, bites,   # noqa: E402,F401
                 split_long, grid_crop)

B = cfg.CHANNEL.get('build', {})
IDLE.update(B.get('idle', {}))
YEL, BLU, RED, ORA, CYA, WHT, GRN = '#ffd200', '#3aa0ff', '#ff3b30', '#ff9a3c', '#5ad8ff', '#ffffff', '#3ad16b'
S = lambda t, f, db=-14: (t, f, db)          # SFX cue: (time, file in audio/ without .mp3, dB)

def setup(**kw): kit.setup(**kw)

def prop(pid, src, t0, t1, x, y, w, keys=(), pop=True, rot=0.0, **kw):
    """A prop / diagram as its own keyframed cut-out block (props/<src>.png)."""
    return dict(type='cutout', id=pid, src=f'props/{src}.png', x=x, y=y, w=w, rot=rot, t0=t0, t1=t1, keys=list(keys),
                **({'in': 'pop'} if pop else NONE), **kw)

def swap(pid, frames, t0, t1, x, y, w, per=0.3):
    """Diagram frames swapped in place (pulses, segments lighting up, 2-frame loops of props)."""
    out, t, k = [], t0, 0
    while t < t1 - 1e-6:
        e = min(t1, t + per)
        out.append(prop(f'{pid}{k}', frames[k % len(frames)], t, e, x, y, w, pop=(k == 0))); t = e; k += 1
    return out

def bubble(text_, t0, t1, x, y, w, kind='thought', texts=None, tail='bl', **kw):
    """Thought / speech bubble; texts=[[t, 'NEW WORDS'], ...] changes the words on later beats."""
    L = dict(type='bubble', kind=kind, text=text_, t0=t0, t1=t1, x=x, y=y, w=w, tail=tail, **POP, **kw)
    if texts: L['texts'] = texts
    return L

def fly(src, t0, n, dt, dst, t1, start=(1.25, 0.35), w=0.11, spread=(0.012, -0.006)):
    """n copies of a prop fly in one after another from off-screen and pile up at dst (notes, requests, coins...)."""
    return [png(src, t0 + i * dt, t1, start[0], start[1], w, rot=-20 + 9 * i, **NONE,
                keys=[{'t': t0 + i * dt + 0.25, 'x': dst[0] + spread[0] * (i % 3), 'y': dst[1] + spread[1] * i, 'rot': -6 + 4 * (i % 3), 'ease': 'out'}])
            for i in range(n)]

def loop2(plate, cam, t0, t1, imgs, x0, x1, per=0.22, eye_keys=None):
    """2-frame action loop (crawl, paddle, run): two pose pictures swapped every `per` s while the block drifts x0 -> x1.
    Returns SHOT tuples (hard cuts) to splice into SHOTS."""
    out, n = [], max(2, round((t1 - t0) / per)); step = (t1 - t0) / n
    for i in range(n):
        T = t0 + i * step
        a, b = x0 + (x1 - x0) * i / n, x0 + (x1 - x0) * (i + 1) / n
        lay = block(imgs[i % len(imgs)], T, x=a, keys=[{'t': T + step, 'x': b, 'ease': 'linear'}],
                    eye_keys=[(T, dict(eye_keys or {'look': [0.8, 0], 'brow': 'up'}))], jitter=False)
        out.append((round(T, 3), plate, cam, 'cut', lay))
    return out

def finish(SHOTS, END, SFX=(), kicks=(), keep=(), out=None, **over):
    """split_long reframes + write_edl with the channel's build settings (channel.json "build"), soft move attack,
    soft kicks. keep = shot starts that stay whole (final hold, boards)."""
    b = dict(B, **over)
    pieces = [(T, src, dict(cam, ease='inout') if cam.get('ease') == 'out' else cam, tr, lay)
              for T, src, cam, tr, lay in split_long(SHOTS, max_shot=b.get('max_shot', 1.6), piece=b.get('piece', 1.15), keep=keep)]
    out = out or cfg.out_names(os.getcwd())['render']
    kit.write_edl(pieces, END, 'edl.json', out, sfx=SFX, kicks=kicks, cam_gain=b.get('cam_gain', 1.0),
                  handheld=b.get('handheld', 0.0), bed_db=b.get('bed_db', -10), grade=b.get('grade'))
    E = json.load(open('edl.json'))
    for k in E['kicks']: k['amp'] = b.get('kick_amp', 0.008)
    missing = sorted({s['src'] for s in E['shots'] if not os.path.exists(s['src'])} |
                     {L['src'] for s in E['shots'] for L in s.get('layers', []) if L.get('src') and not os.path.exists(L['src'])} |
                     {x['src'] for x in E['audio']['sfx'] if not os.path.exists(x['src'])})
    json.dump(E, open('edl.json', 'w'), indent=1)
    if missing: print('MISSING FILES:', *missing, sep='\n  '); raise SystemExit(1)
    return E
