import json,re,subprocess,sys
# split script into silence-delimited segments, distribute by syllable weight
txt=open('voice/script.txt').read().split()
segs_txt=[]; cur=[]
for w in txt:
    cur.append(w)
    if w.endswith(('.',',')) and w.rstrip('.,').lower() in ('enemy','years','it','field','one','other','moved','by'):
        segs_txt.append(cur); cur=[]
if cur: segs_txt.append(cur)
# speech regions from silencedetect
out=subprocess.run(['ffmpeg','-i','voice/voice.wav','-af','silencedetect=n=-40dB:d=0.2','-f','null','-'],capture_output=True,text=True).stderr
st=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',out)]; en=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',out)]
dur=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','voice/voice.wav'],capture_output=True,text=True).stdout)
starts=[0.0]+en; ends=st+[dur]
print(len(segs_txt),len(starts),list(zip(starts,ends)))
SP={'100':'one hundred'}
def syl(w):
    w=SP.get(re.sub(r'[^\w]','',w),re.sub(r'[^\w]','',w)).lower()
    n=len(re.findall(r'[aeiouy]+',w)); 
    if w.endswith('e') and n>1 and not w.endswith('le'): n-=1
    return max(1,n)*1.0+0.35
words=[]
for ws,a,b in zip(segs_txt,starts,ends):
    tot=sum(syl(w) for w in ws); c=a
    for w in ws:
        d=(b-a)*syl(w)/tot; words.append({'word':w,'start':round(c,3),'end':round(c+d,3)}); c+=d
json.dump({'source':'syllable-estimate within silence segments','words':words},open('voice/words.json','w'),indent=1)
for w in words: print(f"{w['start']:6.2f} {w['word']}")
