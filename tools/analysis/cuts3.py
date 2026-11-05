#!/usr/bin/env python3
"""cuts3.py <workdir>  — hard-cut detector, verified frame-by-frame on 18 samples (2026-10-29).
A hard cut = one frame whose mean abs RGB difference (72x128, caption band y>=62% removed) is >22
and >2.2x both neighbours.  Writes <workdir>/cuts3.json {cuts:[t,...], candidates_loose:[...]}.
Loose candidates (>18, >1.6x) must be checked by eye with frames.py; in the samples none of them were cuts."""
import sys, json, subprocess, numpy as np
w = sys.argv[1]; W, H = 72, 128
raw = subprocess.run(['ffmpeg','-nostdin','-v','error','-i',f'{w}/v.mp4','-vf',f'fps=30,scale={W}:{H}','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.float32)[:, :79]
d = np.abs(F[1:] - F[:-1]).mean((1, 2, 3))
pick = lambda a, r: [round((k + 1) / 30, 2) for k in range(1, len(d) - 1) if d[k] > a and d[k] > r * max(d[k - 1], d[k + 1])]
cuts = pick(22, 2.2); loose = [t for t in pick(18, 1.6) if t not in cuts]
json.dump(dict(cuts=cuts, candidates_loose=loose), open(f'{w}/cuts3.json', 'w'))
print('cuts', cuts, 'loose candidates (check by eye)', loose)
