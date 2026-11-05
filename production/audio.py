import numpy as np, scipy.signal as sg, scipy.io.wavfile as wf, json
SR = 48000; DUR = 21.7; N = int(SR * DUR)
rng = np.random.default_rng(7)
def t_(d): return np.arange(int(SR * d)) / SR
def place(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x));
    if i < len(buf): buf[i:j] += x[:j - i] * g
def bp(x, lo, hi, o=2): b, a = sg.butter(o, [lo / (SR / 2), hi / (SR / 2)], 'band'); return sg.lfilter(b, a, x)
def lp(x, f, o=2): b, a = sg.butter(o, f / (SR / 2)); return sg.lfilter(b, a, x)
def hp(x, f, o=2): b, a = sg.butter(o, f / (SR / 2), 'high'); return sg.lfilter(b, a, x)
def norm(x, peak=0.9): return x / (np.max(np.abs(x)) + 1e-9) * peak

# ---------------- MUSIC: light medieval pluck loop, D dorian, 100 bpm ----------------
bpm = 100; beat = 60 / bpm
def ks(freq, dur, bright=0.5):  # Karplus-Strong pluck
    n = int(SR * dur); p = int(SR / freq); buf = rng.uniform(-1, 1, p) * 0.8; out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; nxt = buf[(i + 1) % p]; buf[i % p] = 0.996 * (bright * buf[i % p] + (1 - bright) * nxt) if True else 0
    return out
def note(m): return 440 * 2 ** ((m - 69) / 12)
music = np.zeros(N); bass = np.zeros(N); perc = np.zeros(N)
# chord progression (D dorian): Dm  C  Dm  Am  per bar (4 beats)
prog = [[50, 57, 62, 65], [48, 55, 60, 64], [50, 57, 62, 65], [45, 52, 57, 60]]
mel = [74, 72, 74, 76, 77, 76, 74, 72, 69, 72, 74, 72, 74, 76, 74, None,
       74, 77, 76, 74, 72, 74, 72, 69, 67, 69, 72, 69, 69, None, 72, 74]
cache = {}
def pl(m, d, br):
    k = (m, round(d, 2), br)
    if k not in cache: cache[k] = ks(note(m), d, br)
    return cache[k]
bar = 4 * beat; nbars = int(DUR / bar) + 1
for b in range(nbars):
    ch = prog[b % 4]; t0 = b * bar
    for k in range(8):  # arpeggio eighths
        m = ch[[0, 1, 2, 3, 2, 1, 2, 3][k]] + 12
        place(music, pl(m, 0.9, 0.45), t0 + k * beat / 2, 0.22)
    place(bass, pl(ch[0] - 12, 1.6, 0.6), t0, 0.5); place(bass, pl(ch[0] - 12 + 7, 1.2, 0.6), t0 + 2 * beat, 0.35)
    for k in range(4):
        thump = np.sin(2 * np.pi * 70 * t_(0.25) * np.exp(-t_(0.25) * 6)) * np.exp(-t_(0.25) * 18)
        tamb = hp(rng.standard_normal(int(SR * 0.08)), 6000) * np.exp(-t_(0.08) * 50)
        place(perc, thump, t0 + k * beat, 0.45 if k % 2 == 0 else 0.25); place(perc, tamb, t0 + k * beat + beat / 2, 0.08)
for i, m in enumerate(mel * 3):
    t0 = i * beat / 2 + 2 * bar
    if m and t0 < DUR: place(music, pl(m, 0.7, 0.35), t0, 0.16)
mus = music + bass * 0.8 + perc
# thin out at night (time-lapse) and end
env = np.ones(N); tt = np.arange(N) / SR
env *= 1 - 0.65 * np.clip((tt - 19.6) / 0.4, 0, 1) * np.clip((21.0 - tt) / 0.4, 0, 1)
env *= np.clip((DUR - tt) / 0.35, 0, 1)
mus = norm(lp(mus, 7000) * env, 0.7)

# ---------------- SFX ----------------
sfx = np.zeros(N)
def whoosh(d=0.45, f0=300, f1=2500, g=1.0):
    n = rng.standard_normal(int(SR * d)); out = np.zeros_like(n); seg = 256
    for i in range(0, len(n), seg):
        k = i / len(n); f = f0 + (f1 - f0) * np.sin(np.pi * k) ; out[i:i + seg] = bp(n[max(0, i - 2048):i + seg], f * 0.6, min(f * 1.6, 20000))[-len(n[i:i + seg]):]
    e = np.sin(np.pi * np.linspace(0, 1, len(n))) ** 2
    return norm(out * e, 0.6) * g
def clang(d=1.0, base=520, g=1.0):
    t = t_(d); parts = [1, 2.52, 4.13, 5.81, 7.4]
    x = sum(np.sin(2 * np.pi * base * p * t + rng.uniform(0, 6)) * np.exp(-t * (3 + p * 1.5)) / (1 + p * 0.4) for p in parts)
    click = hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 60)
    return norm(x + click * 0.6, 0.8) * g
def ting(d=0.8, f=2600, g=1.0):
    t = t_(d); x = sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (5 + 3 * k)) for k in (1, 1.5, 2.01))
    x *= (1 + 0.3 * np.sin(2 * np.pi * 22 * t)); return norm(x, 0.5) * g
def sparkle(d=1.0, g=1.0):
    out = np.zeros(int(SR * d))
    for i in range(9): place(out, ting(0.4, rng.uniform(2500, 5200)), rng.uniform(0, d * 0.5), 0.6)
    return norm(out, 0.5) * g
def crackle(d=0.4, g=1.0):
    out = np.zeros(int(SR * d))
    for i in range(30): c = hp(rng.standard_normal(200), 3000) * np.exp(-np.arange(200) / 40); place(out, c, rng.uniform(0, d * 0.8) * (1 - i / 40), rng.uniform(0.2, 1))
    return norm(out, 0.5) * g
def flipclick(g=1.0):
    t = t_(0.06); return norm(bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t * 90) + np.sin(2 * np.pi * 900 * t) * np.exp(-t * 80) * 0.5, 0.6) * g
def march(d, g=1.0):
    out = np.zeros(int(SR * d)); step = 0.3
    for k in range(int(d / step)):
        for j in range(6):
            th = lp(rng.standard_normal(int(SR * 0.12)), 400) * np.exp(-t_(0.12) * 30); place(out, th, k * step + rng.uniform(0, 0.05), 0.5)
    crowd = lp(rng.standard_normal(len(out)), 500) * 0.15; out += crowd
    e = np.clip(np.arange(len(out)) / (SR * 0.4), 0, 1) * np.clip((len(out) - np.arange(len(out))) / (SR * 0.5), 0, 1)
    return norm(out * e, 0.6) * g
def crickets(d, g=1.0):
    t = t_(d); x = np.zeros_like(t)
    for f, r, ph in ((4400, 14, 0), (4700, 17, 1.3), (4150, 12, 2.1)):
        gate = (np.sin(2 * np.pi * r * t + ph) > 0.3) * (np.sin(2 * np.pi * 1.1 * t + ph) > -0.2)
        x += np.sin(2 * np.pi * f * t) * lp(gate.astype(float), 200)
    e = np.clip(t / 0.3, 0, 1) * np.clip((d - t) / 0.3, 0, 1); return norm(x * e, 0.4) * g
def chirp(g=1.0):
    out = np.zeros(int(SR * 0.6))
    for k in range(3):
        t = t_(0.09); f = 3200 + 1800 * np.sin(np.pi * t / 0.09); ph = 2 * np.pi * np.cumsum(f) / SR
        place(out, np.sin(ph) * np.sin(np.pi * t / 0.09), k * 0.14)
    return norm(out, 0.5) * g
def wind(d, g=1.0):
    x = bp(rng.standard_normal(int(SR * d)), 250, 900); t = t_(d); x *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.4 * t)
    e = np.clip(t / 0.5, 0, 1) * np.clip((d - t) / 0.5, 0, 1); return norm(x * e, 0.4) * g

ev = [
    (1.70, whoosh(0.3, 500, 3000), 0.55), (1.92, clang(1.1, 610), 0.9), (1.92, crackle(0.5), 0.5),
    (2.95, ting(0.9, 3100), 0.45), (3.45, whoosh(0.4, 300, 2200), 0.5), (3.72, sparkle(0.9), 0.55),
    (4.62, whoosh(0.2, 600, 3500), 0.35), (4.76, clang(1.2, 430), 0.85), (4.76, crackle(0.4), 0.45), (4.8, ting(1.0, 2400), 0.4),
    (5.35, whoosh(0.6, 200, 1200), 0.35), (6.45, whoosh(0.7, 250, 1500), 0.4),
    (8.42, flipclick(), 0.8), (8.48, flipclick(), 0.7), (8.53, flipclick(), 0.8),
    (9.45, whoosh(0.95, 150, 2600), 0.6), (10.95, sparkle(1.0), 0.6), (11.7, whoosh(0.6, 200, 1800), 0.45),
    (11.9, march(2.2), 0.55), (13.05, whoosh(1.0, 200, 1600), 0.45),
    (14.95, ting(1.0, 3300), 0.5), (16.35, whoosh(0.45, 300, 2200), 0.45), (16.72, sparkle(0.8), 0.5),
    (18.0, whoosh(0.5, 200, 1200), 0.3), (18.3, wind(1.4), 0.35),
    (19.45, whoosh(1.9, 120, 900), 0.4), (19.95, crickets(1.0), 0.45), (20.62, chirp(), 0.5),
]
for t0, x, gn in ev: place(sfx, x, t0, gn)
sfx = np.clip(sfx, -1, 1)
wf.write('audio/music.wav', SR, (mus * 32767).astype(np.int16))
wf.write('audio/sfx.wav', SR, (norm(sfx, 0.9) * 32767).astype(np.int16))
print('ok')
