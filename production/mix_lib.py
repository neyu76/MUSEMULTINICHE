"""Đặt SFX từ events.json bằng thư viện EditorNghiepDu (sfxlib/map.json), thiếu cue thì tổng hợp bằng audio_kit.
Chạy trong thư mục audio của tập: python3 mix_lib.py <thời lượng s> [--kit /đường/dẫn/RickClips_KIT] -> sfx_lib.wav + sfx_lib_log.json"""
import json, sys, os, numpy as np, scipy.io.wavfile as wf
KIT = sys.argv[sys.argv.index('--kit') + 1] if '--kit' in sys.argv else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
sys.path.insert(0, os.path.join(KIT, 'production')); import audio_kit as ak
SR = 48000; DUR = float(sys.argv[1])
CAP = {'whoosh': 1.1, 'whoosh_fast': 0.6, 'thump': 0.6, 'paper': 0.8, 'pop': 0.45, 'flipclick': 0.32, 'sparkle': 1.1, 'boing': 0.9, 'ting': 1.4, 'bell': 2.4, 'coins': 1.4, 'riser': 1.4, 'boom': 2.2, 'wind': 2.5, 'flash': 0.7, 'crickets': 2.6}
LIB = json.load(open('sfxlib/map.json')); cache = {}; use = {}
def load(p):
    if p not in cache: sr, x = wf.read(p); x = x.astype(np.float32) / (32768 if x.dtype == np.int16 else 1); cache[p] = x
    return cache[p]
buf = np.zeros(int(SR * DUR)); log = []
for ev in json.load(open('events.json')):
    n = ev['name']
    if n in LIB:
        vs = LIB[n]; i = use.get(n, 0); use[n] = i + 1; p = 'sfxlib/' + vs[i % len(vs)]
        cap = ev.get('args', {}).get('d', CAP[n]) if n == 'wind' else CAP[n]
        x = load(p)[: int(SR * cap)].copy(); f = min(len(x), int(SR * 0.06)); x[-f:] *= np.linspace(1, 0, f)
        x = x / (np.abs(x).max() + 1e-9) * 0.9; src = os.path.basename(p)
    else:
        x = ak.SFX[n](**ev.get('args', {})); src = 'synth'
    ak.place(buf, x, ev['t'], ev.get('gain', 0.6)); log.append((ev['t'], n, src))
wf.write('sfx_lib.wav', SR, (np.clip(buf / max(1, np.abs(buf).max() / 0.9), -1, 1) * 32767).astype(np.int16))
json.dump(log, open('sfx_lib_log.json', 'w'), indent=0); print('events', len(log), 'library', sum(1 for l in log if l[2] != 'synth'))
