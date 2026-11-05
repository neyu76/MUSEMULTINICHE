"""Narration take -> voice/voice.wav + words.json in one pass:
  transcribe the take (faster-whisper, channel language) -> align to script.txt (script spelling, every token timed)
  -> cap every pause at max_gap (cut the middle of longer gaps, 6 ms fades) -> atempo to the target wpm
  -> words.json timings mapped through the same cuts and tempo (exact, no second transcription needed).
Writes voice/take.words.json (raw ASR), voice/voice.wav, words.json, words.txt (times per sentence, for the shot list)."""
import json, os, re, subprocess, tempfile
import numpy as np
from . import cfg

SR = 48000

def _pcm(src, sr=SR):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def _write(y, out, sr=SR, tempo=1.0):
    af = ['-af', f'atempo={tempo:.4f}'] if abs(tempo - 1) > 1e-3 else []
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(sr), '-ac', '1', '-i', '-', *af, '-ar', str(sr), out],
                   input=y.astype(np.float32).tobytes(), check=True)

def transcribe(audio, out_json, lang):
    from vidclone import speech
    wav = tempfile.mktemp(suffix='.wav')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', audio, '-ac', '1', '-ar', '16000', wav], check=True)
    if os.path.exists(out_json): os.remove(out_json)
    r = speech.transcribe(wav, out_json, None, lang); os.remove(wav)
    return r

def tighten(a, words, max_gap, sr=SR):
    """Keep segments around the words; pauses longer than max_gap shrink to max_gap. Returns audio and a time map."""
    st, en = [w['s'] for w in words], [w['e'] for w in words]
    keep = [[max(0, st[0] - 0.05), en[0]]]
    for i in range(1, len(words)):
        g0, g1 = en[i - 1], st[i]
        if g1 - g0 > max_gap:
            keep[-1][1] = g0 + max_gap / 2
            keep.append([g1 - max_gap / 2, en[i]])
        else:
            keep[-1][1] = max(keep[-1][1], en[i])
    keep[-1][1] = min(len(a) / sr, keep[-1][1] + 0.15)
    fade, parts, offs, o = int(0.006 * sr), [], [], 0.0
    for s, e in keep:
        seg = a[int(s * sr):int(e * sr)].copy()
        if len(seg) > 2 * fade:
            seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
        parts.append(seg); offs.append(o); o += len(seg) / sr

    def tmap(t):
        for (s, e), off in zip(keep, offs):
            if t < s: return off            # inside a removed gap -> start of the next kept piece
            if t <= e: return off + (t - s)
        return offs[-1] + keep[-1][1] - keep[-1][0]
    return np.concatenate(parts), tmap, len(keep)

def wpm(words):
    span = words[-1]['e'] - words[0]['s']
    return len(words) / span * 60, span

def sentences(words):
    out, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r'[.!?;:]["\')\]]?$', w['w']): out.append(cur); cur = []
    if cur: out.append(cur)
    return out

def run(ep_dir, take=None, target=None, max_gap=None, retranscribe=False):
    V = cfg.CHANNEL.get('voice', {}); lang = cfg.CHANNEL.get('language', 'en')
    target = target or V.get('target_wpm', 242); max_gap = max_gap or V.get('max_gap', 0.25)
    os.chdir(ep_dir)
    take = take or next((f for f in ('voice/take1.mp3', 'voice/take1.wav', 'voice/take.mp3') if os.path.exists(f)), None)
    if not take: raise SystemExit('no take: put the ElevenLabs take at voice/take1.mp3')
    script = open('script.txt', encoding='utf-8').read()
    from vidclone.speech import align_to_script
    raw = transcribe(take, 'voice/take.words.json', lang)['words']
    W = align_to_script(raw, script)
    matched = sum(1 for t in script.split() if re.sub(r"[^a-z0-9']", '', t.lower()) in {re.sub(r"[^a-z0-9']", '', w['w'].lower()) for w in raw})
    w0, _ = wpm(W)
    y, tmap, nseg = tighten(_pcm(take), W, max_gap)
    W = [dict(w, s=round(tmap(w['s']), 3), e=round(max(tmap(w['e']), tmap(w['s']) + 0.03), 3)) for w in W]
    w1, _ = wpm(W)
    tempo = max(0.8, min(1.6, target / w1))
    _write(y, 'voice/voice.wav', tempo=tempo)
    W = [dict(w, s=round(w['s'] / tempo, 3), e=round(w['e'] / tempo, 3)) for w in W]
    json.dump({'language': lang, 'words': W}, open('words.json', 'w'), indent=1)
    w2, span = wpm(W)
    lines = [f'{s[0]["s"]:6.2f}-{s[-1]["e"]:6.2f}  ' + ' '.join(f'{w["w"]}@{w["s"]:.2f}' for w in s) for s in sentences(W)]
    open('words.txt', 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
    gaps = sorted(((b['s'] - a['e']), a['w']) for a, b in zip(W, W[1:]))[-3:]
    rep = {'take_wpm': round(w0, 1), 'tight_wpm': round(w1, 1), 'segments': nseg, 'atempo': round(tempo, 3), 'final_wpm': round(w2, 1),
           'span_s': round(span, 2), 'words': len(W), 'script_tokens_heard': f'{matched}/{len(script.split())}',
           'end_s': W[-1]['e'], 'longest_gaps': [(round(g, 2), w) for g, w in gaps]}
    if retranscribe:
        chk = transcribe('voice/voice.wav', 'voice/check.words.json', lang)['words']
        rep['check_wpm'] = round(wpm(chk)[0], 1); rep['check_first_last'] = [chk[0], chk[-1]]
    lo, hi = V.get('wpm_range', [0, 999])
    rep['ok'] = bool(lo <= float(w2) <= hi)
    print(json.dumps(rep, indent=1, ensure_ascii=False))
    return rep
