"""Sound: loudness, stereo width, music bed level under the voice, music key/tempo/drums, voice pitch, SFX density."""
import json, re, subprocess, numpy as np, soundfile as sf
from .common import dist

KS_MAJ = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
KS_MIN = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

def loudness(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True)
    j = json.loads(re.findall(r'\{[^{}]*\}', r.stderr)[-1])
    return {'lufs': float(j['input_i']), 'true_peak': float(j['input_tp']), 'lra': float(j['input_lra'])}

def _db(x):
    return 20 * np.log10(np.sqrt(np.mean(x * x)) + 1e-9)

def analyze(work, words, dur):
    import librosa
    y, sr = sf.read(f'{work}/audio.wav', always_2d=True)
    out = loudness(f'{work}/audio.wav')
    L, R = y[:, 0], y[:, -1]
    mid, side = (L + R) / 2, (L - R) / 2
    out['side_minus_mid_db'] = round(_db(side) - _db(mid), 1)
    mono = mid
    # voice vs gaps (music/sfx alone) — 50 ms windows
    hop = int(0.05 * sr)
    rms = np.array([np.sqrt(np.mean(mono[i:i + hop] ** 2) + 1e-12) for i in range(0, len(mono) - hop, hop)])
    tt = np.arange(len(rms)) * 0.05
    sp = np.zeros(len(rms), bool)
    for w in words:
        sp[(tt >= w['s']) & (tt <= w['e'])] = True
    gap = np.zeros(len(rms), bool)
    for a, b in zip(words, words[1:]):
        if b['s'] - a['e'] > 0.12:
            gap[(tt > a['e'] + 0.03) & (tt < b['s'] - 0.03)] = True
    db = 20 * np.log10(rms)
    if sp.any():
        out['voice_rms_db'] = round(float(np.percentile(db[sp], 75)), 1)
        out['bed_under_voice_db'] = round(float(np.median(db[gap]) - np.percentile(db[sp], 75)), 1) if gap.sum() > 4 else None
    out['intro_db'] = round(float(np.median(db[tt < (words[0]['s'] if words else 0.5)])) , 1) if words and words[0]['s'] > 0.2 else None
    # music character from the non-speech-weighted signal
    y22 = librosa.resample(mono.astype(np.float32), orig_sr=sr, target_sr=22050)
    H, P = librosa.effects.hpss(y22)
    out['percussive_ratio'] = round(float(np.sum(P ** 2) / (np.sum(H ** 2) + 1e-9)), 3)
    onset = librosa.onset.onset_strength(y=P, sr=22050)
    tempo, beats = librosa.beat.beat_track(onset_envelope=onset, sr=22050)
    # beat regularity: low CV of inter-beat intervals = steady drum grid
    ibi = np.diff(librosa.frames_to_time(beats, sr=22050))
    out['tempo_bpm'] = round(float(np.atleast_1d(tempo)[0]), 1)
    out['beat_regularity'] = round(float(1 - np.std(ibi) / (np.mean(ibi) + 1e-9)), 3) if len(ibi) > 4 else None
    chroma = librosa.feature.chroma_cqt(y=H, sr=22050).mean(1)
    best = max(((np.corrcoef(np.roll(prof, k), chroma)[0, 1], NOTES[k] + (' major' if prof is KS_MAJ else ' minor'))
                for prof in (KS_MAJ, KS_MIN) for k in range(12)))
    out['key'] = best[1]; out['key_confidence'] = round(float(best[0]), 3)
    on = librosa.onset.onset_detect(onset_envelope=onset, sr=22050, units='time')
    out['onsets_per_min'] = round(len(on) / dur * 60, 1)
    # transient hits in gaps = likely SFX
    out['gap_hits_per_min'] = round(sum(1 for t in on if gap[min(len(gap) - 1, int(t / 0.05))]) / dur * 60, 1)
    # voice pitch (pyin on up to 25 s of speech)
    if words:
        y16 = librosa.resample(mono.astype(np.float32), orig_sr=sr, target_sr=16000)
        segs = [y16[int(w['s'] * 16000):int(w['e'] * 16000)] for w in words if w['e'] - w['s'] > 0.12]
        seg = np.concatenate(segs)[:25 * 16000] if segs else np.zeros(1)
        if len(seg) > 16000:
            f0, vf, _ = librosa.pyin(seg, fmin=60, fmax=450, sr=16000, frame_length=1024)
            f0 = f0[~np.isnan(f0)]
            out['voice_f0_hz'] = dist(list(map(float, f0))) if len(f0) else None
    # spectral tilt of the voice: energy share 1–4 kHz (presence)
    S = np.abs(librosa.stft(y22, n_fft=2048)) ** 2
    fr = librosa.fft_frequencies(sr=22050, n_fft=2048)
    out['presence_share'] = round(float(S[(fr > 1000) & (fr < 4000)].sum() / S.sum()), 3)
    out['low_share'] = round(float(S[fr < 200].sum() / S.sum()), 3)
    return out
