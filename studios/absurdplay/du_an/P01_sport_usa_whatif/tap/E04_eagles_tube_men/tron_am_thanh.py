"""E04: tạo am_thanh/nhac.wav (nhạc upbeat CC0, nhỏ hơn lời ~8–10 dB) và am_thanh/sfx.wav (tiếng động theo mốc shot).
Dùng: python3 tron_am_thanh.py  (chạy trong thư mục tập). Thư viện CC0: /root/work/assets/audio."""
import subprocess, re, numpy as np
SR = 48000; LIB = '/root/work/assets/audio/'; MG = 'magnific_sfx/'
# v0.6: mọi mốc đọc từ ep04_shots.js (bản cũ ghi cứng SUB và DUR=49.09 → sai khi đổi nhịp bằng doi_nhip.py)
src = open('../../engine/ep04_shots.js', encoding='utf-8').read()
sh_src, sub_src = src.split('export const SUB')[0], src.split('export const SUB')[1].split('export const END')[0]
SH = {k: [float(x) for x in v.split(',')] for k, v in re.findall(r"(s\d+):\[([\d.,]+)\]", sh_src)}
SUB = {}
for k, v in re.findall(r"(s\d+):(\[[\d.,]+\]|[\d.]+)", sub_src):
    SUB[k] = [float(x) for x in v.strip('[]').split(',')] if v.startswith('[') else float(v)
DUR = float(re.search(r"END=([\d.]+)", src).group(1))
def load(f):
    x = subprocess.run(['ffmpeg', '-v', 'error', '-i', LIB + f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(x, np.float32).copy()
def lufs(x):
    p = subprocess.run(['ffmpeg', '-hide_banner', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=x.astype(np.float32).tobytes(), capture_output=True)
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', p.stderr.decode())[-1])
N = int(DUR * SR); T = np.arange(N) / SR
voice = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', 'am_thanh/giong.wav', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
LV = lufs(voice)
# ---- nhạc: upbeat "Bouncing" (HoliznaCC0, CC0) — tươi như quảng cáo bán xe, khựng ở "Except", tắt ở Final
m = load('alvana-audio/music/upbeat/bouncing.mp3')[int(2.0 * SR):][:N]; m = np.pad(m, (0, N - len(m)))
m *= 10 ** ((LV - 8 - lufs(m)) / 20)
env = np.abs(np.pad(voice, (0, max(0, N - len(voice))))[:N]); k = int(0.25 * SR)
env = np.convolve(env, np.ones(k) / k, 'same'); duck = 1 - 0.25 * np.clip(env / (env.max() * 0.3), 0, 1)
g = np.ones(N); g[:int(0.2 * SR)] = np.linspace(0, 1, int(0.2 * SR))
g[(T >= SH['s6'][0]) & (T < SH['s6'][0] + 0.9)] = 0.12
g[(T >= SH['s6'][0] + 0.9) & (T < SH['s8'][0])] = 0.6
g[(T >= SH['s15'][0]) & (T < SH['s16'][0])] = 0.0
g[(T >= SH['s16'][0])] = 0.55
sm = int(0.08 * SR); g = np.convolve(g, np.ones(sm) / sm, 'same'); m *= duck * g
# ---- SFX
sfx = np.zeros(N, np.float32)
def put(f, t, db=0.0, n=None):
    x = load(f) * 10 ** (db / 20)
    if n: x = x[:int(n * SR)]; f_ = min(len(x), int(0.12 * SR)); x[-f_:] *= np.linspace(1, 0, f_)
    i = int(t * SR); L = min(len(x), N - i)
    if L > 0: sfx[i:i + L] += x[:L]
B = {'whoosh': 'alvana-audio/sfx/transition/whoosh-hit-2.wav', 'air': 'alvana-audio/sfx/whoosh/air-03.wav', 'pop': 'alvana-audio/sfx/pop/classic-pop.wav',
     'boom': 'alvana-audio/sfx/impact/cinematic-heavy.wav', 'fail': 'sfx-kit/sounds/notifications/notification-failure-thud.wav', 'scratch': 'alvana-audio/sfx/ui/scratch-004.wav',
     'thud': 'sfx-kit/sounds/impacts/impact-heavy-soft.wav', 'inflate': 'sfx-kit/sounds/shape-changes/transform-inflate.wav', 'spring': 'alvana-audio/sfx/misc/spring-01.wav',
     'spring2': 'alvana-audio/sfx/misc/spring-03.wav', 'ding': 'alvana-audio/sfx/foley/metal-01.wav', 'tick': 'alvana-audio/sfx/mechanical/clock-tick-tock.wav', 'wind': 'alvana-audio/sfx/ambience/wind.wav'}
# nền: gió nhẹ ngoài trời + tiếng quạt thổi (gió lọc) suốt video
w = load(B['wind']); w = np.tile(w, N // len(w) + 1)[:N] * 10 ** (-20 / 20); sfx += w
put(MG + 'crowd_cheer.wav', 0.0, -16, 2.5)
put(B['inflate'], SH['s2'][0], -6)
for k_, a in [('s3', 0.3), ('s5', 0.3), ('s7', 0.5), ('s9', 0.4), ('s17', 0.15), ('s18', 0.4)]: put(B['pop'], SH[k_][0] + a, -10)
put(B['spring2'], SH['s4'][0] + 0.75, -8)
put(B['boom'], SH['s6'][0], -5)
put(MG + 'ref_whistle.wav', SH['s8'][0] + 0.1, -8)
put(MG + 'crowd_roar.wav', SUB['s8'] + 1.4, -12, 1.4)
put(B['tick'], SH['s9'][0], -10, 2.1)
put(MG + 'football_hit.wav', SH['s10'][0] + 1.34, -4)                  # Barkley đâm vào
put(B['spring'], SUB['s10'][0] + 0.6, -4)                               # bật dậy (quay chậm)
put(B['thud'], SUB['s10'][0] + 1.4, -6)
put(B['air'], SUB['s11'], -8)
for q, tq in enumerate([SH['s12'][0], *SUB['s12']]): put(MG + 'football_hit.wav', tq + 0.12, -5 - q); put(B['pop'], tq + 0.15, -14)
put(MG + 'football_kick.wav', SH['s13'][0] + 0.3 + 0.275, -4)
put(B['ding'], SUB['s13'], -2); put(MG + 'crowd_gasp.wav', SUB['s13'] + 0.15, -10)
put(B['whoosh'], SH['s14'][0], -9)
for i in range(9): put(B['pop'], SH['s14'][0] + (i + 1) * (SH['s14'][1] - SH['s14'][0]) / 10, -15)
put(MG + 'buzzer.wav', SH['s15'][0], -8); put(MG + 'sad_trombone.wav', SH['s15'][0] + 0.5, -4)
for tq in SUB['s16']: put(MG + 'football_kick.wav', tq + 0.3, -6)
put(MG + 'crowd_silence_cough.wav', SH['s17'][0], -10, 2.2)
put(B['inflate'], SH['s18'][0] + 0.2, -10)
for name, x in [('nhac', m), ('sfx', sfx)]:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s16le', f'am_thanh/{name}.wav'], input=np.clip(x, -0.99, 0.99).astype(np.float32).tobytes())
print('LUFS lời', LV, 'nhạc', round(lufs(m), 1), 'sfx', round(lufs(sfx), 1))
