"""Frame-by-frame check of a finished video (every frame at 30 fps): black frames, unplanned white frames, frozen holds and
pops (single-frame jumps), with a sheet of every problem frame between its neighbours. Planned frames — shot starts,
transitions, flashes, overlay in/out — come from the EDL when given, else from the measured transitions.
Idea adapted from short_qa.py in mromidev/claude-animated-shorts (MIT).
"""
import os, subprocess, numpy as np
from PIL import Image, ImageDraw

FPS = 30
W, H = 180, 320

def _frames(video):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', video, '-vf', f'fps={FPS},scale={W}:{H}:flags=area',
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)

def motion(video, k=2.0, floor=4.0):
    """Picture changes per minute: every cut, in-place pose swap or big block move, counted with a detector that tolerates
    camera motion (a frame counts when its change is > k x the median of its neighbours ±2..9 frames and > floor).
    Character / pose-swap styles read 30-110 / min; stills with camera moves read 10-20."""
    F = _frames(video).astype(np.int16)
    d = np.abs(np.diff(F, axis=0)).mean(axis=(1, 2, 3))
    hits = []
    for i in range(len(d)):
        nb = np.r_[d[max(0, i - 9):max(0, i - 1)], d[i + 2:i + 10]]
        if len(nb) and d[i] > max(floor, k * float(np.median(nb))) and (not hits or i - hits[-1] > 3): hits.append(i + 1)
    dur = len(F) / FPS
    return {'changes': len(hits), 'changes_per_min': round(len(hits) / max(dur, 1e-6) * 60, 1),
            'median_frame_diff': round(float(np.median(d)), 2) if len(d) else 0.0, 'change_frames': hits[:400]}

def planned_from_edl(E):
    """Frame numbers where a jump is intended: every shot start (±1), every transition span, overlay edges."""
    fps = E.get('fps', 30); k = FPS / fps
    P, t = set(), 0.0
    for i, s in enumerate(E['shots']):
        tr = s.get('trans', {'kind': 'cut'})
        ov = 0.0 if i == 0 or tr['kind'] == 'cut' else tr.get('dur', 0.23)
        t -= ov
        a = int(round(t * FPS)); P.update(range(a - 1, a + int(round(ov * FPS)) + 2))
        t += s['dur']
    for o in E.get('overlays', []):
        for x in (o['t0'], o['t1']):
            f = int(round(x * FPS)); P.update((f - 1, f, f + 1))
    for kk in E.get('kicks', []):
        f = int(round(kk['t'] * FPS)); P.update(range(f - 1, f + kk.get('frames', 7) + 1))
    return P

def planned_from_transitions(trans):
    P = set()
    for x in trans:
        a = int(round(x['t'] * FPS)); n = max(1, int(round(x.get('dur', 0) * FPS)))
        P.update(range(a - n - 2, a + n + 3))
    return P

def check(video, out_dir, planned=(), max_frozen_s=0.4):
    F = _frames(video); n = len(F)
    planned = set(planned)
    f32 = F.astype(np.float32) / 255
    luma = (f32 @ np.array([0.2126, 0.7152, 0.0722], np.float32)).reshape(n, -1)
    mean = luma.mean(1)
    diff = np.abs(np.diff(F.astype(np.int16), axis=0)).mean(axis=(1, 2, 3))   # diff[i] = frame i → i+1
    med = np.array([np.median(diff[max(0, i - 8):i + 9]) for i in range(len(diff))])
    pops = [i + 1 for i in range(len(diff)) if diff[i] > 3 * med[i] + 1.0 and (i + 1) not in planned]
    black = [i for i in range(n) if mean[i] < 0.04]
    white = [i for i in range(n) if mean[i] > 0.93 and i not in planned]
    frozen, start, min_run = [], None, int(round(max_frozen_s * FPS))
    for i in range(len(diff) + 1):
        still = i < len(diff) and diff[i] < 0.02
        if still and start is None: start = i
        if not still and start is not None:
            if i - start >= min_run: frozen.append([start, i])
            start = None
    rep = {'frames': n, 'black': black, 'white_unplanned': white, 'frozen': frozen,
           'frozen_s': round(sum(b - a for a, b in frozen) / FPS, 2), 'pops_unplanned': pops,
           'held_share': round(float((diff < 0.3).mean()), 3) if len(diff) else 0.0, 'max_frozen_s': max_frozen_s,
           'ok': not black and not white and not frozen}
    # problem sheet: prev | frame | next for each problem frame (up to 24), frame numbers burned in
    probs = [(f, 'black') for f in black[:6]] + [(f, 'white') for f in white[:6]] + [(a, 'frozen') for a, _ in frozen[:6]] + \
            [(f, 'pop') for f in pops[:12]]
    if probs:
        os.makedirs(out_dir, exist_ok=True)
        cw, ch = W, H
        S = Image.new('RGB', (cw * 3 * 2 + 12, (ch + 4) * ((len(probs) + 1) // 2)), (40, 40, 40)); d = ImageDraw.Draw(S)
        for j, (f, kind) in enumerate(probs):
            x0, y0 = (j % 2) * (cw * 3 + 12), (j // 2) * (ch + 4)
            for c, g in enumerate((f - 1, f, f + 1)):
                g = min(max(g, 0), n - 1)
                S.paste(Image.fromarray(F[g]), (x0 + c * cw, y0))
                d.rectangle([x0 + c * cw, y0, x0 + c * cw + 96, y0 + 12], fill=(0, 0, 0))
                d.text((x0 + c * cw + 2, y0 + 1), f'{g} {g / FPS:.2f}s' + (f' {kind}' if c == 1 else ''), fill=(255, 255, 0))
        rep['sheet'] = f'{out_dir}/problems.jpg'; S.save(rep['sheet'], quality=85)
    return rep
