"""Narration: words with timestamps (faster-whisper), pace, pauses, sentences, hook."""
import os, re, numpy as np
from .common import dist, save, load

MODEL = os.environ.get('VIDCLONE_WHISPER', 'small')

def align_to_script(words, script):
    """Script tokens with times: match ASR words to the script (difflib on normalised words); tokens the ASR missed or
    misheard get times interpolated between their matched neighbours. Returns [{'w', 's', 'e'}] with the script's spelling."""
    import difflib
    norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
    toks = script.split()
    a, b = [norm(t) for t in toks], [norm(w['w']) for w in words]
    out = [None] * len(toks)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            w = words[blk.b + k]; out[blk.a + k] = {'w': toks[blk.a + k], 's': w['s'], 'e': w['e']}
    i = 0
    while i < len(out):
        if out[i] is None:
            j = i
            while j < len(out) and out[j] is None: j += 1
            t0 = out[i - 1]['e'] if i else (words[0]['s'] if words else 0.0)
            t1 = out[j]['s'] if j < len(out) else (words[-1]['e'] if words else t0 + 0.3 * (j - i))
            step = max(0.05, (t1 - t0) / (j - i))
            for k in range(i, j): out[k] = {'w': toks[k], 's': round(t0 + (k - i) * step, 3), 'e': round(t0 + (k - i + 1) * step, 3)}
            i = j
        else: i += 1
    return out

def transcribe(wav16, out_json, script=None, language=None):
    """language: force it ('en') for scripted narration — auto-detect plus a long prompt can make Whisper hallucinate."""
    if os.path.exists(out_json): return load(out_json)
    from faster_whisper import WhisperModel
    import soundfile as sf
    m = WhisperModel(MODEL, device='cpu', compute_type='int8')
    pcm, _ = sf.read(wav16, dtype='float32')  # 16 kHz mono; avoids faster-whisper's PyAV decoder
    # never pass the script as initial_prompt: Whisper treats prompt text as already spoken and skips the opening sentences
    segs, info = m.transcribe(pcm, word_timestamps=True, vad_filter=True, language=language or os.environ.get('VIDCLONE_LANG'))
    words = []
    for s in segs:
        for w in s.words or []:
            words.append({'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3), 'p': round(w.probability, 3)})
    r = {'language': info.language, 'lang_prob': round(info.language_probability, 3), 'words': words}
    save(r, out_json)
    return r

def analyze(tr, dur):
    W = tr['words']
    if len(W) < 5:
        return {'has_speech': False, 'language': tr.get('language')}
    text = ' '.join(w['w'] for w in W)
    span = W[-1]['e'] - W[0]['s']
    gaps = [b['s'] - a['e'] for a, b in zip(W, W[1:])]
    # sentences: split after words ending with . ! ?
    sents, cur = [], []
    for w in W:
        cur.append(w)
        if re.search(r'[.!?]["\')\]]?$', w['w']):
            sents.append(cur); cur = []
    if cur: sents.append(cur)
    S = [{'s': x[0]['s'], 'e': x[-1]['e'], 'n': len(x), 'text': ' '.join(w['w'] for w in x)} for x in sents]
    hook = S[:1]
    while len(hook) < len(S) and hook[-1]['e'] < 2.5: hook.append(S[len(hook)])
    closer = S[-1]
    words_per_s = np.histogram([w['s'] for w in W], bins=np.arange(0, dur + 1, 1.0))[0]
    return {
        'has_speech': True, 'language': tr['language'],
        'word_count': len(W), 'text': text,
        'wpm': round(len(W) / span * 60, 1),
        'speech_start': W[0]['s'], 'speech_end': W[-1]['e'], 'tail_after_speech': round(dur - W[-1]['e'], 2),
        'speech_coverage': round(sum(w['e'] - w['s'] for w in W) / dur, 3),
        'pause_count_per_min': round(sum(g > 0.25 for g in gaps) / span * 60, 1),
        'pause_len': dist([g for g in gaps if g > 0.25]),
        'longest_pause': round(max(gaps), 2) if gaps else 0,
        'sentence_words': dist([s['n'] for s in S]),
        'sentences': S,
        'hook': {'text': ' '.join(s['text'] for s in hook), 'words': sum(s['n'] for s in hook), 'end': hook[-1]['e']},
        'closer': {'text': closer['text'], 'words': closer['n']},
        'questions': sum(s['text'].strip().endswith('?') for s in S),
        'second_person': sum(1 for w in W if re.sub(r'\W', '', w['w'].lower()) in ('you', "you're", 'your', 'youre')),
        'words_per_second': [int(x) for x in words_per_s],
    }
