"""analyze one video → analysis.json + sheets; merge samples → profile.json + gates.json."""
import os, glob, numpy as np
from . import edit, look, speech, audio, text, sheets
from .common import prepare, save, load

def caption_band(tx):
    """Rows to leave out of the camera fit: burned-in captions change every word and read as motion.
    Band = baseline − 4 letter heights … baseline + 1.5 letter heights, padded 3 % (≈ 56–80 % on 9:16 one-word captions)."""
    c = (tx or {}).get('captions') or {}
    if (c.get('present_share') or 0) < 0.2 or not c.get('baseline_rel'): return None
    b, h = c['baseline_rel']['median'], c['height_rel']['median']
    return (round(max(0.0, b - 4 * h - 0.03), 3), round(min(1.0, b + 1.5 * h + 0.03), 3))

def analyze(video, out, script=None, with_sheets=True):
    work = f'{out}/work'
    info = prepare(video, work)
    sc = open(script, encoding='utf-8').read() if script else None
    tr = speech.transcribe(f'{work}/audio16.wav', f'{out}/words.json', sc) if info['acodec'] else {'words': [], 'language': None}
    words = tr['words']
    r = {'source': os.path.abspath(video), 'info': info}
    print('· text', flush=True); r['text'] = text.analyze(work, words)
    print('· edit/camera', flush=True); r['edit'] = edit.analyze(f'{work}/proxy.mp4', mask_band=caption_band(r['text']))
    print('· look', flush=True); r['look'] = look.analyze(work)
    print('· speech', flush=True); r['speech'] = speech.analyze(tr, info['dur'])
    print('· audio', flush=True); r['audio'] = audio.analyze(work, words, info['dur']) if info['acodec'] else None
    if script: r['script_given'] = sc
    save(r, f'{out}/analysis.json')
    print('· motion', flush=True)
    r['motion'] = motion(f'{work}/proxy.mp4', f'{out}/analysis.json', f'{out}/parts', caption_band(r['text']))
    save(r, f'{out}/analysis.json')
    if with_sheets:
        r['sheets'] = sheets.seconds(work, f'{out}/sheets') + sheets.shots(video, r['edit']['shots'], work, f'{out}/sheets')
        save(r, f'{out}/analysis.json')
    return r

def motion(proxy, analysis_path, parts_out, band=None):
    """How much happens INSIDE the picture: picture changes / min (cuts + pose swaps + block moves) and local motion
    (flow minus the camera fit: share of the frame that moves, p95 speed). Separates "stills + camera" styles from
    animated / cut-out / pose-swap styles in any niche."""
    from . import frames, parts
    m = frames.motion(proxy); m.pop('change_frames', None)
    try:
        lp = parts.analyze(proxy, analysis_path, parts_out, band or (1.0, 1.0))   # no captions -> keep every row
        m['local'] = {k: v for k, v in lp.items() if not isinstance(v, (list, dict))}
    except Exception as e:   # local motion is optional (very short or static videos)
        m['local'] = {'error': str(e)[:200]}
    return m

# ---------------------------------------------------------------- merge + gates
def _get(d, path):
    for k in path.split('.'):
        if d is None: return None
        d = d.get(k) if isinstance(d, dict) else None
    return d

# key → (path in analysis, rule, tolerance, label)
#   rel: [min*(1-tol), max*(1+tol)]   abs: [min-tol, max+tol]   max: ≤ max+tol   min: ≥ min-tol
GATES = [
    ('duration_s', 'info.dur', 'rel', 0.25, 'Duration (s)'),
    ('wpm', 'speech.wpm', 'rel', 0.08, 'Narration pace (words/min)'),
    ('hook_end_s', 'speech.hook.end', 'max', 1.0, 'Hook sentence ends by (s)'),
    ('closer_words', 'speech.closer.words', 'max', 3, 'Closing sentence words'),
    ('longest_pause_s', 'speech.longest_pause', 'max', 0.25, 'Longest pause (s)'),
    ('speech_start_s', 'speech.speech_start', 'max', 0.4, 'First word starts by (s)'),
    ('shot_len_median_s', 'edit.summary.shot_len.median', 'rel', 0.35, 'Median shot length (s)'),
    ('transitions_per_min', 'edit.summary.transitions_per_min', 'rel', 0.4, 'Transitions per minute'),
    ('cuts', 'edit.summary.transition_mix.cut', 'max', 1, 'Hard cuts (count)'),
    ('dissolve_dur_s', 'edit.summary.dissolve_dur.median', 'abs', 0.12, 'Dissolve length (s)'),
    ('cuts_in_last_3s', 'edit.summary.cuts_in_last_3s', 'max', 0, 'Hard cuts in last 3 s'),
    ('static_share', 'edit.summary.camera_share.static', 'abs', 0.12, 'Camera static share'),
    ('push_share', 'edit.summary.camera_share.push', 'abs', 0.15, 'Camera push-in share'),
    ('pull_share', 'edit.summary.camera_share.pull', 'abs', 0.12, 'Camera pull-out share'),
    ('pan_share', 'edit.summary.camera_share.pan', 'abs', 0.15, 'Camera pan share'),
    ('move_run_median_s', 'edit.summary.camera_move_run_s.median', 'rel', 0.5, 'Camera move changes every (s)'),
    ('jitter', 'edit.summary.handheld_jitter', 'rel', 0.6, 'Handheld jitter'),
    ('cam_hold_share', 'edit.camera_grammar.hold_share', 'max', 0.1,'Camera dead-still frames (< 0.3 px/f)'),
    ('cam_move_share', 'edit.camera_grammar.move_share', 'abs', 0.12, 'Camera moving frames (≥ 2 px/f)'),
    ('moves_per_10s', 'edit.camera_grammar.moves_per_10s', 'rel', 0.4, 'Camera moves per 10 s'),
    ('move_peak_px', 'edit.camera_grammar.move_peak_px720.median', 'rel', 0.5, 'Camera move peak speed (px/f @720)'),
    ('move_peak_p90_px', 'edit.camera_grammar.move_peak_px720.p90', 'max', 10, 'Fastest moves, p90 (px/f @720)'),
    ('move_fwhm_f', 'edit.camera_grammar.move_fwhm_f.median', 'min', 2, 'Camera move width at half speed (frames)'),
    ('move_attack_f', 'edit.camera_grammar.move_attack_f.median', 'min', 2, 'Camera move ease-in (frames)'),
    ('quiet_push_rate', 'edit.camera_grammar.quiet_push_rate_pct_f.median', 'rel', 0.6, 'Push-in during holds (%/f)'),
    ('hf_residual_px', 'edit.camera_grammar.hf_residual_px720', 'max', 0.1, 'Hand-held float (px @720)'),
    ('whips_per_min', 'edit.camera_grammar.whips_per_min', 'max', 0.5, 'Whip pans per minute'),
    ('picture_changes_per_min', 'motion.changes_per_min', 'rel', 0.35, 'Picture changes per minute (cuts + swaps + block moves)'),
    ('local_motion_share', 'motion.local.active_share_median', 'abs', 0.2, 'Share of the frame moving inside shots'),
    ('local_motion_p95', 'motion.local.local_p95_median', 'rel', 0.8, 'Local motion speed p95 (px/f @720)'),
    ('saturation', 'look.saturation.median', 'rel', 0.15, 'Saturation median'),
    ('brightness', 'look.brightness.median', 'rel', 0.12, 'Brightness median'),
    ('contrast', 'look.contrast.median', 'rel', 0.2, 'Contrast (luma std)'),
    ('detail', 'look.detail.median', 'abs', 0.05, 'Fine detail ratio'),
    ('warmth', 'look.warmth.median', 'abs', 6, 'Warmth (Lab b*)'),
    ('face_share', 'look.face_share', 'abs', 0.2, 'Frames with a face'),
    ('caption_share', 'text.captions.present_share', 'abs', 0.2, 'Seconds with captions'),
    ('caption_baseline', 'text.captions.baseline_rel.median', 'abs', 0.03, 'Caption baseline (y / height)'),
    ('caption_height', 'text.captions.height_rel.median', 'rel', 0.2, 'Caption letter height (/ height)'),
    ('caption_words', 'text.captions.words_on_screen.median', 'abs', 1, 'Words on screen per caption'),
    ('lufs', 'audio.lufs', 'abs', 1.0, 'Loudness (LUFS)'),
    ('true_peak', 'audio.true_peak', 'max', 0.5, 'True peak (dBTP)'),
    ('bed_db', 'audio.bed_under_voice_db', 'abs', 3.0, 'Music/bed in gaps vs voice (dB)'),
    ('stereo_side_db', 'audio.side_minus_mid_db', 'abs', 6.0, 'Stereo side − mid (dB)'),
]

def merge(style_dir):
    rs = [load(p) for p in sorted(glob.glob(f'{style_dir}/samples/*/analysis.json'))]
    if not rs: raise SystemExit(f'no samples in {style_dir}/samples')
    prof = {'samples': [r['source'] for r in rs], 'n': len(rs), 'metrics': {}}
    gates = []
    for key, path, rule, tol, label in GATES:
        vals = [v for v in (_get(r, path) for r in rs) if isinstance(v, (int, float)) and not isinstance(v, bool)]
        if not vals: continue
        lo_, hi_ = min(vals), max(vals); med = float(np.median(vals))
        prof['metrics'][key] = {'median': round(med, 4), 'min': lo_, 'max': hi_, 'label': label}
        if rule == 'rel': lo, hi = lo_ * (1 - tol), hi_ * (1 + tol)
        elif rule == 'abs': lo, hi = lo_ - tol, hi_ + tol
        elif rule == 'max': lo, hi = None, hi_ + tol
        else: lo, hi = lo_ - tol, None
        if key.endswith('_share'):
            lo = None if lo is None else max(0.0, lo); hi = None if hi is None else min(1.0, hi)
        gates.append({'key': key, 'path': path, 'label': label, 'target': round(med, 4),
                      'lo': None if lo is None else round(lo, 4), 'hi': None if hi is None else round(hi, 4), 'on': True})
    # categorical / descriptive facts Claude needs when planning (from the first sample + all values)
    prof['facts'] = {
        'resolution': [f"{r['info']['w']}x{r['info']['h']}" for r in rs],
        'fps': [r['info']['fps'] for r in rs],
        'language': [_get(r, 'speech.language') for r in rs],
        'music_key': [_get(r, 'audio.key') for r in rs],
        'tempo_bpm': [_get(r, 'audio.tempo_bpm') for r in rs],
        'voice_f0_hz': [_get(r, 'audio.voice_f0_hz.median') for r in rs],
        'transition_mix': [_get(r, 'edit.summary.transition_mix') for r in rs],
        'camera_share': [_get(r, 'edit.summary.camera_share') for r in rs],
        'dissolve_dur_s': [_get(r, 'edit.summary.dissolve_dur.median') for r in rs],
        'palette': [_get(r, 'look.palette') for r in rs],
        'caption_style': [{k: _get(r, 'text.captions.' + k) for k in ('fill', 'edge', 'boxed', 'uppercase_share', 'words_hist')} for r in rs],
        'hooks': [_get(r, 'speech.hook.text') for r in rs],
        'closers': [_get(r, 'speech.closer.text') for r in rs],
    }
    save(prof, f'{style_dir}/profile.json')
    old = f'{style_dir}/gates.json'
    if os.path.exists(old):  # keep manual edits ("on": false, hand-set bounds marked "manual": true)
        prev = {g['key']: g for g in load(old)}
        gates = [prev[g['key']] if prev.get(g['key'], {}).get('manual') else {**g, 'on': prev.get(g['key'], g)['on']} for g in gates]
    save(gates, old)
    return prof, gates
