import os
EP = os.environ.get('EP', os.getcwd())  # thư mục tập: voice/align.json, script.txt → out/
import json,re
A=json.load(open(EP+'/voice/align.json'))
script=open(EP+'/script.txt').read()
toks=re.findall(r"[A-Za-zÀ-ÿ0-9'’]+[.,!?\"”]*|\"",script)
toks=[t for t in toks if t!='"']
# expand display tokens to spoken counts
SPOKEN={'1925':3}
aw=[a for a in A]; i=0; words=[]
for t in toks:
    core=re.sub(r'[^A-Za-zÀ-ÿ0-9]','',t)
    n=SPOKEN.get(core,1); seg=aw[i:i+n]; i+=n
    words.append({'w':t,'s':seg[0]['start'],'e':seg[-1]['end']})
assert i==len(aw),(i,len(aw))
# number display
disp=[]; k=0
while k<len(words):
    w=words[k]; low=w['w'].lower().strip('.,!?')
    if low=='seven' and words[k+1]['w'].lower().startswith('thousand'):
        disp.append({'w':'7,000','s':w['s'],'e':words[k+1]['e']}); k+=2; continue
    if low=='five': w=dict(w,w='5')
    if low=='six': w=dict(w,w='6')
    disp.append(w); k+=1
SHORT={'a','the','to','of','in','for','and','he','it','is','an','his','so','was','with','for','at','had','but'}
groups=[]; k=0
while k<len(disp):
    w=disp[k]; core=w['w'].lower().strip('.,!?"')
    if core in SHORT and k+1<len(disp) and not re.search(r'[.,!?]$',w['w']) and len(w['w'])+len(disp[k+1]['w'])<=11:
        groups.append({'t':w['w']+' '+disp[k+1]['w'],'s':w['s'],'e':disp[k+1]['e']}); k+=2
    else: groups.append({'t':w['w'],'s':w['s'],'e':w['e']}); k+=1
one=sum(1 for g in groups if len(g['t'].split())==1)/len(groups)
END=49.75
def ts(s): return f"{int(s//3600)}:{int(s%3600//60):02d}:{s%60:05.2f}"
hdr="""[Script Info]
ScriptType: v4.00+
PlayResX: 720
PlayResY: 1280
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Word,Work Sans ExtraBold,75,&H00FFFFFF,&H00FFFFFF,&H00000000,&H78000000,0,0,0,0,99,100,0,0,1,5,2.5,2,30,30,344,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
out=[]; srt=[]
f=lambda s: f"{int(s//3600):02d}:{int(s%3600//60):02d}:{int(s%60):02d},{int(round((s%1)*1000)):03d}"
for k,g in enumerate(groups):
    nxt=groups[k+1]['s'] if k+1<len(groups) else END
    end=nxt if nxt-g['e']<0.45 else g['e']+0.2
    if k==len(groups)-1: end=END
    txt=g['t'].replace('"','').replace('“','').replace('”','')
    out.append(f"Dialogue: 0,{ts(g['s'])},{ts(end)},Word,,0,0,0,,{{\\fscx88\\fscy88\\t(0,70,\\fscx100\\fscy100)}}{txt}")
    srt.append(f"{k+1}\n{f(g['s'])} --> {f(end)}\n{txt}\n")
open(EP+'/out/captions.ass','w').write(hdr+'\n'.join(out)+'\n')
open(EP+'/out/captions.srt','w').write('\n'.join(srt))
json.dump(disp,open(EP+'/out/words.json','w'),indent=0)
print(len(groups),'events, 1-word share',round(one*100,1),'%'); print([g['t'] for g in groups][:40])
