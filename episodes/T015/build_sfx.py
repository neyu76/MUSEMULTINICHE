"""T015 demo SFX track: kit synth cues (audio_kit) + ElevenLabs water cues (looped to length, 60 ms fades).
usage: python3 -I build_sfx.py <kit_production_dir> <episode_win_dir> <out.wav> <dur>"""
import sys, json, subprocess, importlib.util, numpy as np
kitp, ep, out, dur = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
spec = importlib.util.spec_from_file_location('audio_kit', kitp + '/audio_kit.py'); ak = importlib.util.module_from_spec(spec); spec.loader.exec_module(ak)
SR = ak.SR
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).astype(float); return x / (np.abs(x).max() + 1e-9) * 0.9
EL = {k: load(f'{ep}/audio/sfx_el/{k}.mp3') for k in ('pour', 'drain', 'glug')}
def span(x, d, f=0.06):  # loop x to length d with short crossfades, fade in/out
    n = int(d * SR); xf = int(0.08 * SR); y = x.copy()
    while len(y) < n: y = np.concatenate([y[:-xf], y[-xf:] * np.linspace(1, 0, xf) + x[:xf] * np.linspace(0, 1, xf), x[xf:]])
    y = y[:n]; k = int(f * SR); y[:k] *= np.linspace(0, 1, k); y[-k:] *= np.linspace(1, 0, k); return y
# t, name, gain, [dur for water cues]   (≈1 cue / 1.5 s, space left around the payoff line)
EV = [(0.10, 'pour', 0.45, 0.9), (0.55, 'drain', 0.42, 2.6), (1.95, 'boing', 0.32), (2.92, 'whoosh', 0.28),
      (5.0, 'pour', 0.42, 0.75), (7.9, 'sparkle', 0.38), (10.75, 'pour', 0.42, 3.7), (12.15, 'drain', 0.5, 6.9), (12.2, 'thump', 0.5),
      (12.6, 'crowd_laugh', 0.22), (19.1, 'whoosh', 0.38), (20.95, 'ting', 0.42), (21.7, 'sparkle', 0.28), (22.9, 'pop', 0.32), (24.8, 'pop', 0.28),
      (26.0, 'pour', 0.35, 3.6), (29.4, 'whoosh_fast', 0.25), (30.3, 'drain', 0.32, 6.9), (36.4, 'glug', 0.55, 1.2), (39.7, 'whoosh', 0.28),
      (44.7, 'sparkle', 0.28), (45.2, 'crickets', 0.35)]
buf = np.zeros(int(SR * dur))
for e in EV:
    t, name, g = e[:3]
    x = span(EL[name], e[3]) if name in EL else ak.SFX[name]()
    ak.place(buf, x, t, g)
ak.write(out, ak.norm(buf, 0.9) if np.abs(buf).max() > 0.9 else buf)
json.dump([{'t': e[0], 'name': e[1], 'gain': e[2], **({'dur': e[3]} if len(e) > 3 else {})} for e in EV], open(out.replace('.wav', '_events.json'), 'w'), indent=0)
print(len(EV), 'cues ->', out)
