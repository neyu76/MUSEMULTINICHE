#!/usr/bin/env python3
"""RickClips audio kit — nhạc nền không nhịp + bộ SFX tổng hợp (không cần file ngoài, không vướng bản quyền).

Chuẩn rút từ đo 18 mẫu (Style Bible §10): nhạc KHÔNG có nhịp trống đều (16/18; độ đều nhịp ≤ 0,11),
giọng thứ (D minor rõ ở 11/18), thảm âm kéo dài + nốt gảy thưa; dải cao (>4 kHz) chỉ thấp hơn dải giọng 6–8,5 dB
(nhiều "không khí"/lấp lánh); dải trầm (<150 Hz) thấp hơn dải giọng 4–7,5 dB.

Lệnh:
  python3 audio_kit.py bed  --mood mystery|playful|tense|warm|pulse --dur 60 [--key D] [--seed 1] --out bed.wav
  python3 audio_kit.py sfx  out_dir                       # xuất toàn bộ SFX mẫu ra WAV để nghe/duyệt
  python3 audio_kit.py events events.json --dur 60 --out sfx.wav
      events.json = [{"t": 1.70, "name": "whoosh", "gain": 0.55, "args": {"d": 0.3}}, ...]
Mix (xem SKILL §9.2): voice −16 LUFS; bed ducked bằng sidechaincompress; SFX thấp hơn voice 6–10 dB.
"""
import argparse, json, os, sys
import numpy as np, scipy.signal as sg, scipy.io.wavfile as wf

SR = 48000
rng = np.random.default_rng(7)
NOTE = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}

def t_(d): return np.arange(int(SR * d)) / SR
def place(buf, x, t0, g=1.0):
    i = int(t0 * SR)
    if i >= len(buf) or i + len(x) <= 0: return
    a = max(0, -i); i = max(0, i); j = min(len(buf), i + len(x) - a)
    buf[i:j] += x[a:a + j - i] * g
def bp(x, lo, hi, o=2): b, a = sg.butter(o, [lo / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], 'band'); return sg.lfilter(b, a, x)
def lp(x, f, o=2): b, a = sg.butter(o, f / (SR / 2)); return sg.lfilter(b, a, x)
def hp(x, f, o=2): b, a = sg.butter(o, f / (SR / 2), 'high'); return sg.lfilter(b, a, x)
def norm(x, peak=0.9): return x / (np.max(np.abs(x)) + 1e-9) * peak
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def fade(x, a=0.3, b=0.3):
    n = len(x); e = np.ones(n); ka, kb = int(SR * a), int(SR * b)
    if ka: e[:ka] = np.linspace(0, 1, ka)
    if kb: e[-kb:] = np.minimum(e[-kb:], np.linspace(1, 0, kb))
    return x * e

# ---------------- instruments ----------------
def ks(freq, dur, bright=0.5):
    """Karplus-Strong pluck (vectorised per period)."""
    n = int(SR * dur); p = max(2, int(SR / freq)); buf = rng.uniform(-1, 1, p) * 0.8; out = np.empty(n)
    for s in range(0, n, p):
        k = min(p, n - s); out[s:s + k] = buf[:k]
        buf = 0.996 * (bright * buf + (1 - bright) * np.roll(buf, -1))
    return out
def mallet(freq, dur=1.6):
    t = t_(dur); x = sum(np.sin(2 * np.pi * freq * r * t) * np.exp(-t * (2.5 + 4 * k)) / (1 + k) for k, r in enumerate((1, 3.99, 9.1)))
    return x * (1 - np.exp(-t * 400))
def pad(freqs, dur, cutoff=1800, det=0.004):
    t = t_(dur); x = np.zeros_like(t)
    for f in freqs:
        for d in (-det, 0, det):
            ph = rng.uniform(0, 6.28)
            x += sg.sawtooth(2 * np.pi * f * (1 + d) * t + ph) * 0.33 + np.sin(2 * np.pi * f * (1 + d) * t + ph) * 0.4
    x = lp(x, cutoff, 2) / max(1, len(freqs))
    att = np.clip(t / min(1.2, dur / 3), 0, 1); rel = np.clip((dur - t) / min(1.2, dur / 3), 0, 1)
    return x * att * rel
def air(dur, lo=5000, hi=12000):
    x = bp(rng.standard_normal(int(SR * dur)), lo, hi); t = t_(dur)
    return x * (0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * t + 1.0))

MOODS = {  # scale degrees (minor), chord roots, pad cutoff, motif density/s, motif instrument, air level, extra
    'mystery': dict(prog=[0, 8, 3, 10], cut=1500, dens=0.55, inst='mallet', air=0.10),
    'playful': dict(prog=[0, 5, 10, 3], cut=2400, dens=1.1, inst='pluck', air=0.08),
    'tense':   dict(prog=[0, 1, 0, 8], cut=1100, dens=0.4, inst='mallet', air=0.12),
    'warm':    dict(prog=[0, 8, 3, 10], cut=2000, dens=0.7, inst='pluck', air=0.07, major=True),
    'pulse':   dict(prog=[0, 8, 3, 10], cut=1700, dens=0.6, inst='pluck', air=0.09, pulse=100),
}
MINOR = [0, 2, 3, 5, 7, 8, 10]; MAJOR = [0, 2, 4, 5, 7, 9, 11]

def bed(mood='mystery', dur=60.0, key='D', seed=1):
    global rng; rng = np.random.default_rng(seed)
    M = MOODS[mood]; root = 48 + NOTE[key]; scale = MAJOR if M.get('major') else MINOR
    N = int(SR * dur); out = np.zeros(N); mot = np.zeros(N)
    chord_len = 4.0 + rng.uniform(-0.5, 0.5)
    t0 = 0.0; k = 0
    while t0 < dur:
        r = root + M['prog'][k % len(M['prog'])]
        third = 4 if M.get('major') and M['prog'][k % 4] == 0 else 3
        chord = [hz(r - 12), hz(r), hz(r + third + (0 if M.get('major') else 0)), hz(r + 7)]
        place(out, pad(chord, chord_len + 1.2, M['cut']), t0 - 0.6, 0.55)
        t0 += chord_len; k += 1
    # sparse motif, irregular timing (no steady beat)
    t = 0.8
    while t < dur - 0.5:
        deg = rng.choice(len(scale)); octv = rng.choice([12, 24])
        f = hz(root + scale[deg] + octv)
        x = mallet(f, 1.8) if M['inst'] == 'mallet' else ks(f, 1.2, 0.45)
        place(mot, x, t, rng.uniform(0.18, 0.3))
        t += rng.exponential(1 / M['dens']) + 0.15
    out += mot
    if M.get('pulse'):
        beat = 60 / M['pulse']; tb = 0.0
        while tb < dur:
            th = np.sin(2 * np.pi * 62 * t_(0.3) * np.exp(-t_(0.3) * 5)) * np.exp(-t_(0.3) * 14)
            place(out, th, tb, 0.35); tb += beat
    out = lp(out, 9000) + air(dur) * M['air']
    return fade(norm(out, 0.7), 0.4, 0.8)

# ---------------- SFX ----------------
def whoosh(d=0.45, f0=300, f1=2500):
    n = rng.standard_normal(int(SR * d)); out = np.zeros_like(n); seg = 256
    for i in range(0, len(n), seg):
        k = i / len(n); f = f0 + (f1 - f0) * np.sin(np.pi * k)
        out[i:i + seg] = bp(n[max(0, i - 2048):i + seg], f * 0.6, min(f * 1.6, 20000))[-len(n[i:i + seg]):]
    return norm(out * np.sin(np.pi * np.linspace(0, 1, len(n))) ** 2, 0.6)
def clang(d=1.0, base=520):
    t = t_(d); x = sum(np.sin(2 * np.pi * base * p * t + rng.uniform(0, 6)) * np.exp(-t * (3 + p * 1.5)) / (1 + p * 0.4) for p in (1, 2.52, 4.13, 5.81, 7.4))
    return norm(x + hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 60) * 0.6, 0.8)
def ting(d=0.8, f=2600):
    t = t_(d); x = sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (5 + 3 * k)) for k in (1, 1.5, 2.01))
    return norm(x * (1 + 0.3 * np.sin(2 * np.pi * 22 * t)), 0.5)
def sparkle(d=1.0):
    out = np.zeros(int(SR * d))
    for _ in range(9): place(out, ting(0.4, rng.uniform(2500, 5200)), rng.uniform(0, d * 0.5), 0.6)
    return norm(out, 0.5)
def flipclick():
    t = t_(0.06); return norm(bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t * 90) + np.sin(2 * np.pi * 900 * t) * np.exp(-t * 80) * 0.5, 0.6)
def thump(d=0.35, f=60):
    t = t_(d); return norm(np.sin(2 * np.pi * f * t * np.exp(-t * 4)) * np.exp(-t * 12) + lp(rng.standard_normal(len(t)), 300) * np.exp(-t * 40) * 0.3, 0.9)
def boom(d=1.6):
    t = t_(d); return norm(np.sin(2 * np.pi * 45 * t * np.exp(-t * 1.5)) * np.exp(-t * 3) + lp(rng.standard_normal(len(t)), 200) * np.exp(-t * 4) * 0.6, 0.9)
def riser(d=1.2):
    t = t_(d); f = 200 * (12 ** (t / d)); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3 + bp(rng.standard_normal(len(t)), 1500, 9000) * (t / d)
    return norm(x * (t / d) ** 1.5, 0.6)
def pop(f=900):
    t = t_(0.12); return norm(np.sin(2 * np.pi * f * t * (1 + 2 * np.exp(-t * 60))) * np.exp(-t * 35), 0.7)
def boing(d=0.6):
    t = t_(d); f = 220 + 160 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5), 0.6)
def bell(d=2.5, f=880):
    t = t_(d); x = sum(np.sin(2 * np.pi * f * r * t) * np.exp(-t * (1.2 + k)) / (1 + k) for k, r in enumerate((0.5, 1, 1.19, 1.56, 2.0, 2.74)))
    return norm(x, 0.6)
def paper(d=0.5):
    out = np.zeros(int(SR * d))
    for _ in range(40): c = bp(rng.standard_normal(300), 2500, 9000) * np.exp(-np.arange(300) / 60); place(out, c, rng.uniform(0, d * 0.9), rng.uniform(0.2, 1))
    return norm(out, 0.5)
def coins(d=0.9):
    out = np.zeros(int(SR * d))
    for _ in range(14): place(out, ting(0.25, rng.uniform(3500, 6500)), rng.uniform(0, d * 0.7), rng.uniform(0.3, 0.8))
    return norm(out, 0.5)
def crowd_laugh(d=2.0):
    t = t_(d); x = np.zeros_like(t)
    for _ in range(12):
        f0 = rng.uniform(180, 420); rate = rng.uniform(5, 8); ph = rng.uniform(0, 6)
        x += bp(rng.standard_normal(len(t)), f0, f0 * 4) * (np.sin(2 * np.pi * rate * t + ph) > 0.2) * rng.uniform(0.3, 1)
    return norm(lp(x, 3500) * np.clip(t / 0.2, 0, 1) * np.clip((d - t) / 0.6, 0, 1), 0.5)
def crickets(d=2.0):
    t = t_(d); x = np.zeros_like(t)
    for f, r, ph in ((4400, 14, 0), (4700, 17, 1.3), (4150, 12, 2.1)):
        x += np.sin(2 * np.pi * f * t) * lp(((np.sin(2 * np.pi * r * t + ph) > 0.3) * (np.sin(2 * np.pi * 1.1 * t + ph) > -0.2)).astype(float), 200)
    return norm(fade(x, 0.3, 0.3), 0.4)
def wind(d=2.0):
    t = t_(d); return norm(fade(bp(rng.standard_normal(len(t)), 250, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.4 * t)), 0.5, 0.5), 0.4)
def flash(d=0.7):
    return norm(sparkle(d) * 0.6 + riser(d) * 0.4, 0.6)

SFX = dict(whoosh=whoosh, whoosh_fast=lambda: whoosh(0.25, 600, 3500), clang=clang, ting=ting, sparkle=sparkle,
           flipclick=flipclick, thump=thump, boom=boom, riser=riser, pop=pop, boing=boing, bell=bell, paper=paper,
           coins=coins, crowd_laugh=crowd_laugh, crickets=crickets, wind=wind, flash=flash)
USE = {  # hành động → SFX (quy tắc chọn, không phải tên SFX gốc của kênh)
    'cú máy nhanh / chuyển cảnh nhòe': 'whoosh / whoosh_fast', 'lóe sáng vật, ý tưởng': 'ting / sparkle',
    'kim loại va chạm': 'clang', 'nhấn chữ quan trọng, chữ chốt': 'thump', 'sự kiện lớn, sập, động đất': 'boom',
    'leo thang, sắp lật': 'riser', 'vật/nhãn hiện ra': 'pop', 'gag hài': 'boing', 'chuông, điện báo': 'bell',
    'giấy, vé, tài liệu': 'paper', 'tiền, xu': 'coins', 'đám đông cười': 'crowd_laugh', 'đêm': 'crickets',
    'ngoài trời lạnh, trống trải': 'wind', 'lóa trắng / flash chuyển cảnh': 'flash', 'bảng lật số': 'flipclick'}

def write(path, x): wf.write(path, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))

def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = p.add_subparsers(dest='cmd', required=True)
    b = sp.add_parser('bed'); b.add_argument('--mood', default='mystery', choices=list(MOODS)); b.add_argument('--dur', type=float, default=60)
    b.add_argument('--key', default='D', choices=list(NOTE)); b.add_argument('--seed', type=int, default=1); b.add_argument('--out', required=True)
    s = sp.add_parser('sfx'); s.add_argument('out_dir')
    e = sp.add_parser('events'); e.add_argument('events'); e.add_argument('--dur', type=float, required=True); e.add_argument('--out', required=True)
    a = p.parse_args()
    if a.cmd == 'bed':
        write(a.out, bed(a.mood, a.dur, a.key, a.seed)); print('bed', a.mood, a.key, a.dur, '->', a.out)
    elif a.cmd == 'sfx':
        os.makedirs(a.out_dir, exist_ok=True)
        for k, f in SFX.items(): write(os.path.join(a.out_dir, f'{k}.wav'), f())
        json.dump(USE, open(os.path.join(a.out_dir, 'USAGE.json'), 'w'), ensure_ascii=False, indent=1); print(len(SFX), 'sfx ->', a.out_dir)
    elif a.cmd == 'events':
        buf = np.zeros(int(SR * a.dur))
        for ev in json.load(open(a.events)):
            if ev['name'] not in SFX: sys.exit(f"SFX không có: {ev['name']} (có: {', '.join(SFX)})")
            place(buf, SFX[ev['name']](**ev.get('args', {})), ev['t'], ev.get('gain', 0.6))
        write(a.out, norm(buf, 0.9) if np.abs(buf).max() > 0.9 else buf); print('sfx track ->', a.out)

if __name__ == '__main__':
    main()
