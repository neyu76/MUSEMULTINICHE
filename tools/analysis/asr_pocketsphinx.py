#!/usr/bin/env python3
"""asr_pocketsphinx.py audio out.json — offline English ASR (pip install pocketsphinx; model bundled). ~60% word accuracy on music-backed narration: use to check a script belongs to its audio and to time speech, NOT as word-exact transcript."""
import sys, json, subprocess, numpy as np
from pocketsphinx import Decoder
src, out = sys.argv[1], sys.argv[2]
raw = subprocess.run(['ffmpeg','-nostdin','-v','error','-i',src,'-ac','1','-ar','16000','-af','highpass=f=120,lowpass=f=5000','-f','s16le','-'],capture_output=True).stdout
d = Decoder(samprate=16000)
d.start_utt(); d.process_raw(raw, full_utt=True); d.end_utt()
words=[(s.word.split("(")[0], s.start_frame/100, s.end_frame/100) for s in d.seg() if not s.word.startswith('<') and s.word not in ('[NOISE]','<sil>')]
json.dump(words, open(out,'w')); print(len(words), ' '.join(w[0] for w in words)[:600])
