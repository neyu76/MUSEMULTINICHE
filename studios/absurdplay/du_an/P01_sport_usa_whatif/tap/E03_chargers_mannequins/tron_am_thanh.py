"""E03: tạo am_thanh/nhac.wav (nhạc nền funk CC0, nhỏ hơn lời ~8 dB) và am_thanh/sfx.wav (tiếng động theo mốc shot).
Dùng: python3 tron_am_thanh.py  (chạy trong thư mục tập). Thư viện CC0: /root/work/assets/audio."""
import subprocess, re, numpy as np
SR = 48000; LIB = '/root/work/assets/audio/'; MG = 'magnific_sfx/'; DUR = 48.69
src = open('../../engine/ep03_shots.js').read()
SH = {k: [float(x) for x in v.split(',')] for k, v in re.findall(r"(s\d+):\[([\d.,]+)\]", src.split('SUB')[0])}
SUB = {'s6': 12.1, 's8': 18.52, 's11': 26.52, 's12': [28.64, 29.82], 's14': 36.34}
KB = [SH['s12'][0], *SUB['s12'], SH['s12'][1]]
def load(f):
    x = subprocess.run(['ffmpeg', '-v', 'error', '-i', LIB + f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(x, np.float32).copy()
def lufs(x):
    p = subprocess.run(['ffmpeg', '-hide_banner', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=x.astype(np.float32).tobytes(), capture_output=True)
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', p.stderr.decode())[-1])
N = int(DUR * SR); T = np.arange(N) / SR
voice = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', 'am_thanh/giong.wav', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
LV = lufs(voice)
# ---- nhạc: funk "Make Money" (HoliznaCC0, CC0) — vênh váo đầu clip, hạ dần khi Chargers sụp đổ, tắt ở FINAL
m = load('alvana-audio/music/funk/make-money.mp3')[int(4.0 * SR):][:N]; m = np.pad(m, (0, N - len(m)))
m *= 10 ** ((LV - 8 - lufs(m)) / 20)
env = np.abs(np.pad(voice, (0, max(0, N - len(voice))))[:N]); k = int(0.25 * SR)
env = np.convolve(env, np.ones(k) / k, 'same'); duck = 1 - 0.25 * np.clip(env / (env.max() * 0.3), 0, 1)
g = np.ones(N); g[:int(0.25 * SR)] = np.linspace(0, 1, int(0.25 * SR))
g[(T >= SH['s6'][0]) & (T < SH['s6'][0] + 0.9)] = 0.15          # "Except" — nhạc khựng lại
g[(T >= SH['s6'][0] + 0.9) & (T < SH['s8'][0])] = 0.6
g[(T >= SH['s16'][0])] = 0.0                                     # FINAL: tắt nhạc, nhường kèn buồn
sm = int(0.08 * SR); g = np.convolve(g, np.ones(sm) / sm, 'same')
m *= duck * g
# ---- SFX
sfx = np.zeros(N, np.float32)
def put(f, t, db=0.0, n=None):
    x = load(f) * 10 ** (db / 20)
    if n: x = x[:int(n * SR)]; f_ = min(len(x), int(0.15 * SR)); x[-f_:] *= np.linspace(1, 0, f_)
    i = int(t * SR); L = min(len(x), N - i)
    if L > 0: sfx[i:i + L] += x[:L]
B = {'whoosh': 'alvana-audio/sfx/transition/whoosh-hit-2.wav', 'air': 'alvana-audio/sfx/whoosh/air-03.wav', 'pop': 'alvana-audio/sfx/pop/classic-pop.wav',
     'boom': 'alvana-audio/sfx/impact/cinematic-heavy.wav', 'fail': 'sfx-kit/sounds/notifications/notification-failure-thud.wav', 'scratch': 'alvana-audio/sfx/ui/scratch-004.wav',
     'ding': 'sfx-kit/sounds/tones/tone-ding-high.wav', 'thud': 'sfx-kit/sounds/impacts/impact-heavy-soft.wav', 'breath': 'alvana-audio/sfx/body/breath.wav',
     'crickets': 'alvana-audio/sfx/ambience/night-crickets.wav'}
# nền: đám đông sân ngoài trời liên tục (nhỏ), tắt dần cuối clip — thay bằng tiếng dế ở đoạn ê chề
amb = load(MG + 'stadium_crowd_outdoor.wav'); amb = np.tile(amb, N // len(amb) + 1)[:N] * 10 ** (-13 / 20)
amb *= np.clip((SH['s17'][0] + 0.5 - T) / 1.0, 0, 1); sfx += amb
put(B['crickets'], SH['s17'][0] + 0.2, -6)
put(MG + 'crowd_cheer.wav', 0.0, -10, 3.4)
put(B['whoosh'], SH['s2'][0], -8)
put(MG + 'drumline.wav', SH['s3'][0], -12, 2.1)
for k, a in [('s3', 0.3), ('s4', 0.75), ('s5', 0.35), ('s7', 0.5), ('s9', 0.1), ('s11', 0.2), ('s13', 0.05), ('s17', 0.4), ('s18', 0.15), ('s19', 0.4)]: put(B['pop'], SH[k][0] + a, -10)
put(B['boom'], SH['s6'][0], -5)                                   # lóa trắng "Except"
put(MG + 'crowd_boo.wav', SUB['s6'], -8, 2.0)
put(MG + 'ref_whistle.wav', SH['s8'][0], -8)                      # Kickoff
put(MG + 'crowd_silence_cough.wav', SUB['s8'], -8, 2.1)           # "Nobody moves" — im phăng phắc
put(B['breath'], SH['s9'][0] + 0.15, -4)                          # ngáp
put(B['air'], SH['s10'][0] + 0.43, -8)                            # ném
put(B['thud'], SH['s10'][0] + 1.38, -6); put(MG + 'crowd_boo.wav', SH['s10'][0] + 1.45, -9, 1.6)
k7 = lambda i: SH['s11'][0] + 0.3 + (SUB['s11'] - SH['s11'][0] - 0.5) * i / 7
for i in range(7): put(B['ding'], k7(i) + 0.02, -14)
put(B['fail'], SUB['s11'] + 0.1, -5)
for q in range(3):
    put(MG + 'football_kick.wav', KB[q] + 0.25, -4); put(MG + 'crowd_cheer.wav', KB[q] + 0.85, -14, 0.9)
put(B['air'], SH['s13'][0] + 0.25, -10); put(MG + 'football_hit.wav', 32.67, -6); put(MG + 'crowd_gasp.wav', 32.75, -8)
put(B['thud'], 34.86, -6); put(MG + 'stadium_horn.wav', SUB['s14'], -9); put(MG + 'crowd_boo.wav', SUB['s14'] + 0.2, -10, 1.4)
put(B['scratch'], SH['s15'][0], -6); put(MG + 'football_hit.wav', SH['s15'][0] + 0.47, -8); put(B['thud'], SH['s15'][0] + 1.0, -6)
put(MG + 'buzzer.wav', SH['s16'][0], -8); put(MG + 'sad_trombone.wav', SH['s16'][0] + 0.5, -4)
for name, x in [('nhac', m), ('sfx', sfx)]:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s16le', f'am_thanh/{name}.wav'], input=np.clip(x, -0.99, 0.99).astype(np.float32).tobytes())
print('LUFS lời', LV, 'nhạc', round(lufs(m), 1), 'sfx', round(lufs(sfx), 1))
