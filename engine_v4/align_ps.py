import sys,json,re,subprocess
from pocketsphinx import Decoder
wav,txt,out=sys.argv[1:4]
raw=subprocess.run(['ffmpeg','-nostdin','-v','error','-i',wav,'-ac','1','-ar','16000','-f','s16le','-'],capture_output=True).stdout
text=open(txt).read()
NUM={'1925':'nineteen twenty five'}
for k,v in NUM.items(): text=text.replace(k,v)
toks=[w for w in re.findall(r"[A-Za-zÀ-ÿ']+",text)]
norm=[re.sub(r"[^a-z']","",t.lower().replace('é','e')) for t in toks]
d=Decoder(samprate=16000,bestpath=False)
d.set_align_text(' '.join(norm))
d.start_utt(); d.process_raw(raw,full_utt=True); d.end_utt()
segs=[(s.word,s.start_frame/100,(s.end_frame+1)/100) for s in d.seg() if s.word not in ('<s>','</s>','<sil>','(NULL)')]
print(len(segs),len(norm))
json.dump([{'word':w,'start':a,'end':b} for w,a,b in segs],open(out,'w'),indent=0)
print(segs[:12])
