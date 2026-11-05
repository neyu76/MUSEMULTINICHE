"""Check a rebuild against the reference episode from the asset zip ("làm lại giống hệt").
usage: python3 -I compare_ref.py <EP_workdir> <reference_dir>
reference_dir (assets: reference/<EP>/) holds frames_ref/f_NNNNN.jpg (every 60th frame), voice_final.wav, align.json,
captions.ass, final_mix.wav, <NAME>.mp4. Prints per-item verdicts; frames: PSNR ≥ 40 dB = same picture (JPEG/SwiftShader noise),
< 30 dB = something differs (engine overlay, textures, Chromium version)."""
import sys, os, glob, json, hashlib, subprocess, re
import numpy as np
from PIL import Image
EP, REF = sys.argv[1:3]
def psnr(a, b):
    a = np.asarray(Image.open(a).convert('RGB'), float); b = np.asarray(Image.open(b).convert('RGB'), float)
    if a.shape != b.shape: return -1
    m = ((a - b) ** 2).mean(); return 99.0 if m == 0 else 10 * np.log10(255 ** 2 / m)
def lufs(p):
    e = subprocess.run(['ffmpeg', '-nostdin', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', e)[-1])
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()[:12]
ok = True
P = []
for r in sorted(glob.glob(f'{REF}/frames_ref/f_*.jpg')):
    f = f'{EP}/frames/{os.path.basename(r)}'
    if os.path.exists(f): P.append((os.path.basename(r), psnr(f, r)))
if P:
    worst = min(P, key=lambda x: x[1]); print(f'frames: {len(P)} compared, min PSNR {worst[1]:.1f} dB at {worst[0]}, median {np.median([p for _, p in P]):.1f} dB')
    for n, p in P:
        if p < 40: print(f'   differs: {n} {p:.1f} dB'); ok = ok and p >= 30
else: print('frames: none rendered yet (run tools/ep/render.sh)')
for name, rel in [('voice', 'voice/voice_final.wav'), ('mix', 'audio/final_mix.wav')]:
    a, b = f'{EP}/{rel}', f'{REF}/{os.path.basename(rel)}'
    if os.path.exists(a): d1, d2, l1, l2 = dur(a), dur(b), lufs(a), lufs(b); print(f'{name}: {d1:.2f} s / ref {d2:.2f} s, {l1:.1f} / ref {l2:.1f} LUFS'); ok = ok and abs(d1 - d2) < 0.05 and abs(l1 - l2) < 0.3
for rel in ['voice/align.json', 'out/captions.ass']:
    a, b = f'{EP}/{rel}', f'{REF}/{os.path.basename(rel)}'
    if os.path.exists(a):
        same = sha(a) == sha(b)
        if not same and rel.endswith('.json'):
            x, y = json.load(open(a)), json.load(open(b)); md = max(abs(p['start'] - q['start']) for p, q in zip(x, y)) if len(x) == len(y) else 99
            print(f'{rel}: {len(x)} words, max start-time diff {md * 1000:.0f} ms'); ok = ok and md < 0.03
        else: print(f'{rel}: {"identical" if same else "DIFFERS"}'); ok = ok and same
print('RESULT:', 'matches reference' if ok else 'DIFFERS from reference — see lines above')
