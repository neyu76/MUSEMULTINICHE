"""Assemble a video from an EDL (edl.json): stills/clips/colour cards with camera moves, transitions,
grade, captions and a mixed soundtrack. Deterministic; no editor needed.

EDL (paths relative to the EDL file):
{
  "out": "out/final.mp4", "w": 1080, "h": 1920, "fps": 30,
  "shots": [
    {"src": "art/01.png", "dur": 3.0, "move": "push", "amount": 0.12, "focus": [0.5, 0.45], "ease": "inout",
     "trans": {"kind": "dissolve", "dur": 0.23}},            # transition INTO this shot
    {"src": "clips/02.mp4", "in": 1.0, "dur": 2.5, "move": "none", "rate": 1.0},
    {"color": "#000000", "dur": 0.8},
    {"src": "art/04.png", "dur": 2, "from": [0.3, 0.5, 1.0], "to": [0.6, 0.5, 1.2]}   # explicit (cx, cy, zoom)
  ],
  "moves": push | pull | pan_left | pan_right | tilt_up | tilt_down | drift | handheld | none
  any shot may add "handheld": 0.004 (float amplitude, frame fraction) on top of its move
  "transitions": cut | dissolve | fade (via black) | flash (via white) | whip_left/right/up/down | zoom (push-through)
  "motion_blur": true,                                          # sub-frame blur on fast moves/whips
  "creep": 0.03,                       # zoom per second on "move": "none" shots so no hold freezes (shot "creep": 0 turns it off)
  "kicks": [{"t": 4.2, "amp": 0.012, "frames": 7}],             # impact shake: offset flips sign every frame, decays over N frames
  shot "layers": [...]                 # animated eyes / props / icons / text on the picture (see layers.py)
  "grade": {"saturation": 1.0, "contrast": 1.0, "brightness": 0.0, "gamma": 1.0, "temperature": 6500, "vignette": 0.0},
  "overlays": [{"src": "logo.png", "t0": 0, "t1": 5, "x": 0.5, "y": 0.1, "w": 0.3}],
  "captions": {"ass": "captions.ass"} | {"words": "words.json", "style": "styles/x", "offset": 0.1},
  "audio": {"voice": "voice.mp3", "voice_offset": 0.1, "voice_lufs": -16,
            "music": "music.mp3", "bed_db": -13, "duck_db": 0, "music_fade_out": 1.5,
            "sfx": [{"src": "sfx/hit.mp3", "t": 1.2, "db": -6}], "lufs": -14, "true_peak": -1.5, "mono": true}
}
"""
import os, json, subprocess, numpy as np, cv2
from .common import probe, load

def _hex(c):
    c = c.lstrip('#'); return np.array([int(c[4:6], 16), int(c[2:4], 16), int(c[0:2], 16)], np.uint8)

def _ease(p, kind):
    p = min(1.0, max(0.0, p))
    if kind == 'linear': return p
    if kind == 'out': return 1 - (1 - p) ** 2
    if kind == 'in': return p * p
    return p * p * (3 - 2 * p)  # inout (smoothstep)

PRESET = {  # (from, to) as (cx, cy, zoom); amount scales the move
    'none': lambda a, f: ((f[0], f[1], 1.0), (f[0], f[1], 1.0)),
    'push': lambda a, f: ((0.5, 0.5, 1.0), (f[0], f[1], 1.0 + a)),
    'pull': lambda a, f: ((f[0], f[1], 1.0 + a), (0.5, 0.5, 1.0)),
    'pan_left': lambda a, f: ((0.5 + a, f[1], 1.0 + 2 * a), (0.5 - a, f[1], 1.0 + 2 * a)),
    'pan_right': lambda a, f: ((0.5 - a, f[1], 1.0 + 2 * a), (0.5 + a, f[1], 1.0 + 2 * a)),
    'tilt_up': lambda a, f: ((f[0], 0.5 + a, 1.0 + 2 * a), (f[0], 0.5 - a, 1.0 + 2 * a)),
    'tilt_down': lambda a, f: ((f[0], 0.5 - a, 1.0 + 2 * a), (f[0], 0.5 + a, 1.0 + 2 * a)),
    'drift': lambda a, f: ((0.5 - a / 3, 0.5, 1.0 + a / 2), (0.5 + a / 3, 0.5, 1.0 + a)),
    'handheld': lambda a, f: ((0.5, 0.5, 1.06), (0.5, 0.5, 1.06)),
}

class Source:
    """One shot's pixels at output size for a camera (cx, cy, zoom) — image, clip or colour."""
    def __init__(self, shot, W, H, fps, base):
        self.W, self.H, self.fps, self.base = W, H, fps, base
        self.kind ='color' if 'color' in shot else 'video' if os.path.splitext(shot['src'])[1].lower() in ('.mp4', '.mov', '.webm', '.mkv', '.gif') else 'image'
        self.zmax = 1.0
        if self.kind == 'color':
            self.img = np.zeros((H, W, 3), np.uint8); self.img[:] = _hex(shot['color']); return
        self.path = os.path.join(base, shot['src'])
        if self.kind == 'image':
            im = cv2.imread(self.path, cv2.IMREAD_UNCHANGED)
            if im is None: raise SystemExit(f'cannot read {self.path}')
            if im.ndim == 2: im = cv2.cvtColor(im, cv2.COLOR_GRAY2BGR)
            if im.shape[2] == 4: im = im[..., :3]
            self.img = im
        else:
            info = probe(self.path)
            rate = shot.get('rate', 1.0)
            s = max(W / info['w'], H / info['h']) * 1.6  # decode with headroom for push-ins
            dw, dh = int(info['w'] * s) // 2 * 2, int(info['h'] * s) // 2 * 2
            vf = f'setpts=PTS/{rate},fps={fps},scale={dw}:{dh}:flags=lanczos'
            self.p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', str(shot.get('in', 0)), '-i', self.path, '-vf', vf,
                                       '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], stdout=subprocess.PIPE)
            self.dw, self.dh, self.idx, self.cur = dw, dh, -1, None

    def frame_at(self, i):
        if self.kind != 'video': return self.img
        while self.idx < i:
            b = self.p.stdout.read(self.dw * self.dh * 3)
            if len(b) < self.dw * self.dh * 3: break  # clip ended: hold last frame
            self.cur = np.frombuffer(b, np.uint8).reshape(self.dh, self.dw, 3); self.idx += 1
        return self.cur

    def render(self, i, cx, cy, z, shift=(0, 0), layers=None, t=0.0):
        src = self.frame_at(i)
        if self.kind == 'color': return src
        if layers:  # animated layers live on the picture, so the camera move carries them
            from . import layers as L
            src = L.draw(src.astype(np.float32), layers, t, self.base)
        sh, sw = src.shape[:2]
        cover = max(self.W / sw, self.H / sh)
        s = cover * z
        # keep the view inside the picture: clamp centre so the crop never leaves the source
        half_w, half_h = self.W / s / 2, self.H / s / 2
        px = min(max(cx * sw, half_w), sw - half_w); py = min(max(cy * sh, half_h), sh - half_h)
        M = np.array([[s, 0, self.W / 2 - s * px + shift[0]], [0, s, self.H / 2 - s * py + shift[1]]], np.float32)
        if s < 0.5:  # big source: shrink first so the warp does not alias
            k = 1 / (2 * s); small = cv2.resize(src, (int(sw / k), int(sh / k)), interpolation=cv2.INTER_AREA)
            M[:, :2] *= k; src = small
        return cv2.warpAffine(src, M, (self.W, self.H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)

    def close(self):
        if self.kind == 'video': self.p.kill()

def _cam(shot, u):
    """camera (cx, cy, zoom) at progress u in [0, 1]."""
    a = shot.get('amount', 0.1); f = shot.get('focus', [0.5, 0.5])
    fr, to = (shot['from'], shot['to']) if 'from' in shot else PRESET[shot.get('move', 'push')](a, f)
    e = _ease(u, shot.get('ease', 'inout' if 'from' in shot else 'linear'))
    c = [fr[k] + (to[k] - fr[k]) * e for k in range(3)]
    if shot.get('move') == 'handheld' or shot.get('handheld'):   # "handheld": amplitude on any shot = light float
        t = u * shot['dur']; amp = shot.get('handheld') or shot.get('amount', 0.1) * 0.05
        c[0] += amp * (np.sin(t * 2.1) * 0.6 + np.sin(t * 5.3 + 1) * 0.4) / 5
        c[1] += amp * (np.sin(t * 1.7 + 2) * 0.6 + np.sin(t * 4.1) * 0.4) / 5
    return c

def run(edl_path):
    E = load(edl_path); base = os.path.dirname(os.path.abspath(edl_path))
    W, H, fps = E.get('w', 1080), E.get('h', 1920), E.get('fps', 30)
    shots = E['shots']
    starts, t = [], 0.0
    for k, s in enumerate(shots):
        tr = s.get('trans', {'kind': 'cut'})
        ov = 0.0 if k == 0 or tr['kind'] == 'cut' else tr.get('dur', 0.23)
        t -= ov; starts.append(t); t += s['dur']
    total = t
    N = int(round(total * fps))
    out = os.path.join(base, E.get('out', 'out/final.mp4')); os.makedirs(os.path.dirname(out), exist_ok=True)
    raw = out[:-4] + '_raw.mp4'
    enc = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(fps),
                            '-i', '-', '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', '-pix_fmt', 'yuv420p', raw], stdin=subprocess.PIPE)
    srcs = {}
    blur = E.get('motion_blur', True)
    overl = [(o, cv2.imread(os.path.join(base, o['src']), cv2.IMREAD_UNCHANGED)) for o in E.get('overlays', [])]
    creep, kicks = E.get('creep', 0.0), E.get('kicks', [])

    def shot_px(k, tt, shift=(0, 0), extra_zoom=1.0):
        s = shots[k]
        if k not in srcs: srcs[k] = Source(s, W, H, fps, base)
        u = (tt - starts[k]) / s['dur']
        cx, cy, z = _cam(s, u)
        if s.get('move', 'push') == 'none' and 'from' not in s:
            z *= 1 + s.get('creep', creep) * (tt - starts[k])
        return srcs[k].render(int((tt - starts[k]) * fps), cx, cy, z * extra_zoom, shift,
                              s.get('layers'), tt - starts[k]).astype(np.float32)

    def kick_at(fi):
        dy = 0.0
        for kk in kicks:
            j = fi - int(round(kk['t'] * fps)); n = kk.get('frames', 7)
            if 0 <= j < n: dy += kk.get('amp', 0.012) * H * (1 - j / n) * (-1) ** j
        return dy

    for fi in range(N):
        tt = fi / fps
        act = [k for k in range(len(shots)) if starts[k] <= tt < starts[k] + shots[k]['dur']]
        if not act: act = [len(shots) - 1]
        for k in list(srcs):  # free finished sources
            if k < act[0]: srcs.pop(k).close()
        if len(act) == 1:
            img = shot_px(act[0], tt)
        else:
            a, b = act[0], act[-1]
            tr = shots[b]['trans']; d = tr.get('dur', 0.23); p = (tt - starts[b]) / d; kind = tr['kind']
            if kind == 'dissolve':
                img = shot_px(a, tt) * (1 - p) + shot_px(b, tt) * p
            elif kind in ('fade', 'flash'):
                c = 0.0 if kind == 'fade' else 255.0
                img = shot_px(a, tt) * (1 - 2 * p) + c * 2 * p if p < 0.5 else shot_px(b, tt) * (2 * p - 1) + c * (2 - 2 * p)
            elif kind.startswith('whip'):
                dx, dy = {'whip_left': (-1, 0), 'whip_right': (1, 0), 'whip_up': (0, -1), 'whip_down': (0, 1)}.get(kind, (-1, 0))
                e = _ease(p, 'inout'); L = W if dx else H
                A = shot_px(a, tt, (dx * e * L, dy * e * L)); B = shot_px(b, tt, (dx * (e - 1) * L, dy * (e - 1) * L))
                m = np.clip((p - 0.35) / 0.3, 0, 1); img = A * (1 - m) + B * m
                if blur:
                    sp = int(min(80, 4 + 140 * (1 - abs(2 * p - 1))))  # widest blur mid-whip
                    img = cv2.blur(img, (sp, 1) if dx else (1, sp))
            elif kind == 'zoom':  # push through A into B
                e = _ease(p, 'in')
                img = shot_px(a, tt, extra_zoom=1 + 1.5 * e) * (1 - p) + shot_px(b, tt, extra_zoom=1.3 - 0.3 * p) * p
                if blur: img = (img + cv2.GaussianBlur(img, (0, 0), 1 + 6 * (1 - abs(2 * p - 1)))) / 2
            else:
                img = shot_px(b, tt)
        for o, im in overl:
            if im is None or not (o['t0'] <= tt < o['t1']): continue
            w = int(o.get('w', 0.3) * W); h = int(w * im.shape[0] / im.shape[1])
            r = cv2.resize(im, (w, h), interpolation=cv2.INTER_AREA)
            x0 = int(o.get('x', 0.5) * W - w / 2); y0 = int(o.get('y', 0.1) * H - h / 2)
            x0, y0 = max(0, min(W - w, x0)), max(0, min(H - h, y0))
            al = (r[..., 3:4] / 255.0) if r.shape[2] == 4 else 1.0
            img[y0:y0 + h, x0:x0 + w] = img[y0:y0 + h, x0:x0 + w] * (1 - al) + r[..., :3] * al
        dy = kick_at(fi) if kicks else 0.0
        if dy:  # shake the whole picture, scaled up a little so no edge shows
            z = 1 + 2.2 * abs(dy) / H
            M = np.array([[z, 0, W / 2 * (1 - z) + dy * 0.4], [0, z, H / 2 * (1 - z) + dy]], np.float32)
            img = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        enc.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
        if fi % (fps * 5) == 0: print(f'  frame {fi}/{N}', flush=True)
    enc.stdin.close(); enc.wait()
    for s in srcs.values(): s.close()

    # ---- soundtrack
    A = E.get('audio')
    mix = None
    if A:
        from . import mixer
        mix = mixer.mix(A, base, total, out[:-4] + '_mix.wav')

    # ---- grade + captions + mux
    g = E.get('grade', {})
    vf = []
    if any(k in g for k in ('saturation', 'contrast', 'brightness', 'gamma')):
        vf.append(f"eq=saturation={g.get('saturation', 1)}:contrast={g.get('contrast', 1)}:brightness={g.get('brightness', 0)}:gamma={g.get('gamma', 1)}")
    if g.get('temperature') and g['temperature'] != 6500: vf.append(f"colortemperature=temperature={g['temperature']}")
    if g.get('vignette'): vf.append(f"vignette=angle={g['vignette']}")
    if g.get('sharpen'): vf.append(f"unsharp=5:5:{g['sharpen']}:5:5:0")
    C = E.get('captions')
    if C:
        from . import captions
        ass = os.path.join(base, C['ass']) if 'ass' in C else out[:-4] + '.ass'
        if 'words' in C:
            st = C.get('style'); st = os.path.join(base, st) if st and not os.path.isabs(st) else st
            captions.write(os.path.join(base, C['words']), ass, W, H, st, offset=C.get('offset', 0.0))
        fd = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'fonts'))
        esc = lambda p: p.replace('\\', '/').replace(':', r'\:').replace("'", r"\'")
        vf.append(f"subtitles='{esc(ass)}':fontsdir='{esc(fd)}'")
    cmd = ['ffmpeg', '-y', '-v', 'error', '-i', raw]
    if mix: cmd += ['-i', mix]
    if vf: cmd += ['-vf', ','.join(vf)]
    cmd += ['-c:v', 'libx264', '-crf', str(E.get('crf', 17)), '-preset', 'slow', '-pix_fmt', 'yuv420p', '-r', str(fps)]
    if mix: cmd += ['-c:a', 'aac', '-b:a', '192k', '-shortest']
    cmd += ['-movflags', '+faststart', out]
    subprocess.run(cmd, check=True)
    if not E.get('keep_raw'): os.remove(raw)
    print(json.dumps({'out': out, 'dur': round(total, 3), 'frames': N, 'shots': len(shots)}))
    return out
