"""E02: tạo am_thanh/nhac.wav (nhạc nền, nhỏ hơn lời ~10 dB) và am_thanh/sfx.wav (tiếng động theo mốc shot).
Dùng: python3 tron_am_thanh.py  (chạy trong thư mục tập). Thư viện CC0: /root/work/assets/audio."""
import subprocess, json, re, numpy as np
SR = 48000; LIB = '/root/work/assets/audio/'; DUR = 44.25
SH = {k: v for k, v in re.findall(r"(s\d+):\[([\d.,]+)\]", open('../../engine/ep02_shots.js').read())}
SH = {k: [float(x) for x in v.split(',')] for k, v in SH.items()}
SUB = {'s5': 11.62, 's9': 22.86, 's11': [27.26, 28.1], 's17': 41.4}
def load(f):
    x = subprocess.run(['ffmpeg', '-v', 'error', '-i', LIB + f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(x, np.float32).copy()
def lufs(x):
    p = subprocess.run(['ffmpeg', '-hide_banner', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=x.astype(np.float32).tobytes(), capture_output=True)
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', p.stderr.decode())[-1])
N = int(DUR * SR)
voice = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'am_thanh/giong.wav', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
voice = np.frombuffer(voice, np.float32)
LV = lufs(voice)
# ---- nhạc: hip-hop CC0, vào nhẹ, nhỏ hơn lời 10 dB, hạ thêm khi có lời (ducking nhẹ), fade cuối
m = load('alvana-audio/music/hiphop/legends.mp3')[int(8.0 * SR):][:N]
m = np.pad(m, (0, N - len(m)))
m *= 10 ** ((LV - 8 - lufs(m)) / 20)
env = np.abs(np.pad(voice, (0, max(0, N - len(voice))))[:N]); k = int(0.25 * SR)
env = np.convolve(env, np.ones(k) / k, 'same'); duck = 1 - 0.25 * np.clip(env / (env.max() * 0.3), 0, 1)
fade = np.ones(N); fade[:int(0.3 * SR)] = np.linspace(0, 1, int(0.3 * SR)); fade[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR))
# shot 14 (khán giả ngủ): nhạc chậm lại/nhỏ xuống
s14 = (np.arange(N) / SR >= SH['s14'][0]) & (np.arange(N) / SR < SH['s14'][1]); fade[s14] *= 0.45
m *= duck * fade
# ---- SFX
sfx = np.zeros(N, np.float32)
def put(f, t, db=0.0):
    x = load(f) * 10 ** (db / 20); i = int(t * SR); n = min(len(x), N - i)
    if n > 0: sfx[i:i + n] += x[:n]
B = {'bounce': 'sfx-kit/sounds/bounce-spin-zoom/move-bounce.wav', 'whoosh': 'alvana-audio/sfx/transition/whoosh-hit-2.wav', 'air': 'alvana-audio/sfx/whoosh/air-03.wav',
     'snore': 'alvana-audio/sfx/body/snore.wav', 'rim': 'alvana-audio/sfx/foley/metal-01.wav', 'big': 'sfx-kit/sounds/celebration/celebration-applause-big.wav',
     'small': 'sfx-kit/sounds/celebration/celebration-applause-small.wav', 'ding': 'sfx-kit/sounds/tones/tone-ding-high.wav', 'pop': 'alvana-audio/sfx/pop/classic-pop.wav',
     'boom': 'alvana-audio/sfx/impact/cinematic-heavy.wav', 'fail': 'sfx-kit/sounds/notifications/notification-failure-thud.wav', 'scratch': 'alvana-audio/sfx/ui/scratch-004.wav',
     'whistle': 'Free-SFX/Owlish/Sound Effects Pack/Human/attention-whistle.opus', 'thud': 'sfx-kit/sounds/impacts/impact-heavy-soft.wav', 'swish': 'alvana-audio/sfx/whoosh/swish-1.wav'}
# dẫn bóng shot 1–2 (1,7 nhịp/s, chạm sàn ở pha 0,5)
for i in range(8): put(B['bounce'], (i + 0.5) / 1.7, -14)
put(B['whoosh'], SH['s2'][0], -8)                                     # hất máy lên bảng điểm
for k, a in [('s3', 0.35), ('s4', 0.5), ('s5', 0.3), ('s6', 0.15), ('s7', 0.4), ('s13', 0.25), ('s14', 0.1), ('s16', 0.25), ('s17', 0.5)]: put(B['pop'], SH[k][0] + a, -10)
put(B['boom'], SH['s8'][0], -6)                                       # lóa trắng "except"
put(B['air'], SUB['s9'], -10)
put(B['whistle'], SH['s10'][0] + 0.15, -12)                           # tung bóng
BB = [SH['s11'][0], *SUB['s11'], SH['s11'][1]]
for q in range(3): t = BB[q] + (BB[q + 1] - BB[q]) * 0.62; put(B['thud'], t, -4); put(B['rim'], t + 0.02, -8); put(B['air'], BB[q], -12)
put(B['small'], BB[3] - 0.3, -10)
put(B['swish'], SH['s12'][0] + 1.66, -4); put(B['ding'], SH['s12'][0] + 1.7, -12)
for i in range(3): put(B['bounce'], SH['s13'][0] + (i + 0.5) / 0.9, -14)   # nảy bóng chậm ở vạch ném phạt
for i in range(5): put(B['snore'], SH['s14'][0] + 0.6 + i * 0.45, -6 - i)
put(B['big'], SH['s15'][0] + 0.4, -8); put(B['ding'], SH['s15'][0] + 0.4, -10)
put(B['fail'], SH['s16'][0] + 0.25, -6)
put(B['scratch'], SH['s17'][0], -6)
peak = max(np.abs(m).max(), 1e-6)
for name, x in [('nhac', m), ('sfx', sfx)]:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s16le', f'am_thanh/{name}.wav'], input=np.clip(x, -0.99, 0.99).astype(np.float32).tobytes())
print('LUFS lời', LV, 'nhạc', lufs(m), 'sfx', lufs(sfx))
