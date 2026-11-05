"""Soundtrack mix in numpy: voice at a set loudness, music bed at a level relative to the voice
(the profile's bed_db), optional ducking, SFX hits, then integrated loudness + true-peak limit."""
import os, subprocess, numpy as np, pyloudnorm as pyln, soundfile as sf

SR = 48000

def _read(path):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
                       capture_output=True, check=True).stdout
    return np.frombuffer(b, np.float32).reshape(-1, 2).copy()

def _lufs(x, meter):
    if len(x) < SR * 0.5: x = np.concatenate([x, np.zeros((int(SR * 0.5) - len(x), 2), np.float32)])
    v = meter.integrated_loudness(x)
    return v if np.isfinite(v) else -70.0

def _fit(x, n, xfade=1.0):
    """Loop (with crossfade) or trim to n samples."""
    if len(x) >= n: return x[:n]
    f = int(xfade * SR); out = x.copy()
    while len(out) < n:
        ramp = np.linspace(0, 1, f, dtype=np.float32)[:, None]
        out[-f:] = out[-f:] * (1 - ramp) + x[:f] * ramp
        out = np.concatenate([out, x[f:]])
    return out[:n]

def mix(A, base, dur, out_wav):
    meter = pyln.Meter(SR)
    n = int(round(dur * SR))
    bus = np.zeros((n, 2), np.float32)
    P = lambda p: os.path.join(base, p)
    vl = A.get('voice_lufs', -16.0)
    vmask = np.zeros(n, np.float32)
    if A.get('voice'):
        v = _read(P(A['voice'])); v = v * 10 ** ((vl - _lufs(v, meter)) / 20)
        o = int(A.get('voice_offset', 0.0) * SR); m = min(len(v), n - o)
        bus[o:o + m] += v[:m]
        env = np.abs(v[:m]).max(1)
        # speech mask: 30 ms envelope above −40 dBFS
        k = int(0.03 * SR); env = np.convolve(env, np.ones(k) / k, 'same')
        vmask[o:o + m] = (env > 0.01).astype(np.float32)
    if A.get('music'):
        mu = _fit(_read(P(A['music'])), n)
        mu = mu * 10 ** ((vl + A.get('bed_db', -14.0) - _lufs(mu, meter)) / 20)
        if A.get('duck_db'):
            k = int(0.15 * SR); g = np.convolve(vmask, np.ones(k) / k, 'same')
            mu *= (1 - g * (1 - 10 ** (-abs(A['duck_db']) / 20)))[:, None]
        fi, fo = int(A.get('music_fade_in', 0.2) * SR), int(A.get('music_fade_out', 1.5) * SR)
        mu[:fi] *= np.linspace(0, 1, fi)[:, None]; mu[n - fo:] *= np.linspace(1, 0, fo)[:, None]
        bus += mu
    for s in A.get('sfx', []):
        x = _read(P(s['src']))
        if s.get('dur'): x = x[:int(s['dur'] * SR)]
        x = x * 10 ** ((vl + s.get('db', -6.0) - _lufs(x, meter)) / 20)
        o = int(s['t'] * SR)
        if o >= n: continue
        m = min(len(x), n - o); fo = min(int(0.03 * SR), m)
        x = x[:m].copy(); x[m - fo:] *= np.linspace(1, 0, fo)[:, None]
        bus[o:o + m] += x
    if A.get('mono', True):
        mid = bus.mean(1, keepdims=True); bus = np.repeat(mid, 2, 1)
    bus *= 10 ** ((A.get('lufs', -14.0) - _lufs(bus, meter)) / 20)
    sf.write(out_wav + '.pre.wav', bus, SR, subtype='FLOAT')
    tp = A.get('true_peak', -1.5)
    # true-peak limit with ffmpeg (4× oversampled limiter), keep integrated loudness
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', out_wav + '.pre.wav', '-af',
                    f'aresample=192000,alimiter=limit={10 ** (tp / 20):.4f}:attack=1:release=50:level=false,aresample={SR}',
                    '-c:a', 'pcm_s24le', out_wav], check=True)
    os.remove(out_wav + '.pre.wav')
    return out_wav
