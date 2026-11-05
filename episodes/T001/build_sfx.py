"""T001 SFX track: kit synth cues (audio_kit) + ElevenLabs foley cues (crate thud, parcel scale, rubber stamp, bricks, train), 60 ms fades.
usage: python3 -I build_sfx.py <kit_production_dir> <episode_win_dir> <out.wav> <dur>"""
import sys, json, subprocess, importlib.util, numpy as np
kitp, ep, out, dur = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
spec = importlib.util.spec_from_file_location('audio_kit', kitp + '/audio_kit.py'); ak = importlib.util.module_from_spec(spec); spec.loader.exec_module(ak)
SR = ak.SR
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).astype(float); return x / (np.abs(x).max() + 1e-9) * 0.9
EL = {k: load(f'{ep}/audio/sfx_el/{k}.mp3') for k in ('crate', 'scale', 'stamp', 'bricks', 'train')}
def span(x, d, f=0.06):  # cut/loop x to length d with short crossfades, fade in/out
    n = int(d * SR); xf = int(0.08 * SR); y = x.copy()
    while len(y) < n: y = np.concatenate([y[:-xf], y[-xf:] * np.linspace(1, 0, xf) + x[:xf] * np.linspace(0, 1, xf), x[xf:]])
    y = y[:n]; k = int(f * SR); y[:k] *= np.linspace(0, 1, k); y[-k:] *= np.linspace(1, 0, k); return y
# t, name, gain, [dur for ElevenLabs cues]   (≈1 cue / 1.3 s on the on-screen actions, space left around the payoff line)
EV = [(0.42, 'crate', 0.5, 1.2), (0.5, 'scale', 0.32, 1.4), (1.1, 'stamp', 0.55, 0.45), (1.45, 'paper', 0.28), (2.22, 'stamp', 0.5, 0.45), (2.75, 'whoosh', 0.28),
      (2.95, 'pop', 0.3), (5.55, 'sparkle', 0.35), (7.3, 'paper', 0.28), (8.45, 'boing', 0.28), (9.25, 'ting', 0.4), (10.3, 'stamp', 0.45, 0.45), (10.7, 'whoosh', 0.3),
      (10.85, 'pop', 0.3), (11.05, 'pop', 0.3), (11.9, 'ting', 0.3), (12.9, 'train', 0.4, 1.8), (14.8, 'pop', 0.22), (16.45, 'whoosh_fast', 0.25), (16.5, 'train', 0.35, 1.0),
      (17.45, 'whoosh', 0.28), (19.36, 'bricks', 0.5, 1.3), (20.6, 'stamp', 0.45, 0.45), (21.5, 'scale', 0.32, 1.0), (22.1, 'ting', 0.35), (22.4, 'whoosh', 0.25),
      (24.4, 'crate', 0.35, 1.0), (25.0, 'crate', 0.3, 1.0), (25.1, 'sparkle', 0.3), (27.3, 'whoosh', 0.2), (27.85, 'crate', 0.4, 1.0), (28.3, 'paper', 0.3),
      (29.49, 'boing', 0.3), (30.45, 'crate', 0.55, 1.2), (30.5, 'crowd_laugh', 0.18), (31.15, 'whoosh', 0.3), (31.3, 'bricks', 0.35, 1.8), (33.0, 'sparkle', 0.3),
      (33.55, 'whoosh', 0.28), (33.9, 'paper', 0.35), (35.55, 'pop', 0.25), (37.1, 'pop', 0.25), (37.75, 'pop', 0.25), (38.66, 'stamp', 0.6, 0.45), (40.45, 'thump', 0.35),
      (42.1, 'whoosh_fast', 0.3), (43.5, 'sparkle', 0.3), (44.2, 'crickets', 0.3)]
EV += [(24.3 + i * 0.075, 'flipclick', 0.22) for i in range(10)]  # digits rolling 10 → 15,000
EV.sort(key=lambda e: e[0])
buf = np.zeros(int(SR * dur))
for e in EV:
    t, name, g = e[:3]
    x = span(EL[name], e[3]) if name in EL else ak.SFX[name]()
    ak.place(buf, x, t, g)
ak.write(out, ak.norm(buf, 0.9) if np.abs(buf).max() > 0.9 else buf)
json.dump([{'t': e[0], 'name': e[1], 'gain': e[2], **({'dur': e[3]} if len(e) > 3 else {})} for e in EV], open(out.replace('.wav', '_events.json'), 'w'), indent=0)
print(len(EV), 'cues ->', out)
