#!/usr/bin/env python3
"""Mix cuối cho 1 tập RickClips (SKILL §9.2) — chạy trong thư mục audio của tập.
Dùng: python3 mix_final.py --voice ../voice/voice_final.wav --music music.mp3 [--sfx sfx_lib.wav] --dur 49.8
       [--bed -23] [--sfx-lufs -27] [--voice-lufs -16] [--master -14]
Ra:  voice_pad.wav (voice −16, đệm đủ thời lượng), music_ducked.wav (bed −23 rồi duck theo voice),
     sfx_n.wav (−27), final_mix.wav (master −14 LUFS, alimiter 0.84, mono 48 kHz) + in số đo.
Bed −23 LUFS trước ducking là mức đã đo cho truyện hài (lời cao hơn nhạc ~26 dB khi nói; sàn khoảng nghỉ ~−18 dB).
Muốn nhạc rõ hơn giữa câu: --bed -21 (sàn ~−16 dB như mẫu)."""
import argparse, subprocess, re, os, sys
a = argparse.ArgumentParser()
a.add_argument('--voice', required=True); a.add_argument('--music', required=True); a.add_argument('--sfx')
a.add_argument('--dur', type=float, required=True); a.add_argument('--bed', type=float, default=-23)
a.add_argument('--sfx-lufs', type=float, default=-27); a.add_argument('--voice-lufs', type=float, default=-16)
a.add_argument('--master', type=float, default=-14); a.add_argument('--fade', type=float, default=0.8)
A = a.parse_args()
def ff(*args): r = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', *args], capture_output=True, text=True); r.returncode and sys.exit(r.stderr)
def lufs(p):
    e = subprocess.run(['ffmpeg', '-nostdin', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', e)[-1])
def to_target(src, dst, target, extra=''):
    tmp = dst + '.tmp.wav'
    ff('-i', src, '-af', f'aresample=48000,pan=mono|c0=0.5*c0+0.5*c1' if 'stereo' in probe_ch(src) else 'aresample=48000', '-ac', '1', tmp)
    ff('-i', tmp, '-af', f'apad,atrim=0:{A.dur}{extra}', '-ar', '48000', '-ac', '1', tmp + '2.wav'); os.replace(tmp + '2.wav', tmp)
    g = target - lufs(tmp); ff('-i', tmp, '-af', f'volume={g:.2f}dB', '-ar', '48000', '-ac', '1', dst); os.remove(tmp)
def probe_ch(p): return subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=channel_layout,channels', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout
to_target(A.voice, 'voice_pad.wav', A.voice_lufs)
to_target(A.music, 'bed_n.wav', A.bed, f',afade=t=out:st={A.dur - A.fade}:d={A.fade}')
# sidechaincompress stops at the shorter input → pad back to the full length (kit v7 bug: T015's ducked bed ended at 27.6 s)
ff('-i', 'bed_n.wav', '-i', 'voice_pad.wav', '-filter_complex', f'[0][1]sidechaincompress=threshold=0.03:ratio=4:attack=20:release=300,apad,atrim=0:{A.dur}', '-ar', '48000', '-ac', '1', 'music_ducked.wav')
ins = ['-i', 'voice_pad.wav', '-i', 'music_ducked.wav']; n = 2
if A.sfx:
    to_target(A.sfx, 'sfx_n.wav', A.sfx_lufs); ins += ['-i', 'sfx_n.wav']; n = 3
ff(*ins, '-filter_complex', f'amix=inputs={n}:normalize=0:duration=first', '-ar', '48000', '-ac', '1', 'sum.wav')
g = A.master - lufs('sum.wav')
ff('-i', 'sum.wav', '-af', f'volume={g:.2f}dB,alimiter=limit=0.84:level=false', '-ar', '48000', '-ac', '1', 'final_mix.wav')
print(f"voice {lufs('voice_pad.wav'):.1f}  bed(ducked) {lufs('music_ducked.wav'):.1f}" + (f"  sfx {lufs('sfx_n.wav'):.1f}" if A.sfx else '') + f"  master {lufs('final_mix.wav'):.1f} LUFS → final_mix.wav")
