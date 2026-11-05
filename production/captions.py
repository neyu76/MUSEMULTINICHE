import json
W=json.load(open('voice/words.json'))['words']
groups=["A","blacksmith","sold a","spear","that","could","pierce","anything","to one","king,","and a","shield","that","nothing","could","pierce","to his","worst","enemy.",
"The two kingdoms","had","been","at war","for 100","years,","and now","each","king","finally","had the","weapon","to end","it.",
"So both","armies","marched","to the","same","field.","The","spear","at the","front","of one,","and","the shield","at the","front","of","the other.","Then","nobody","moved.","A","whole week","went by."]
i=0; ev=[]
for g in groups:
    n=len(g.split()); ws=W[i:i+n]; assert ' '.join(w['word'] for w in ws)==g, (g,ws); i+=n
    ev.append([ws[0]['start'],ws[-1]['end'],g])
assert i==len(W)
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
out=[]
for k,(a,b,g) in enumerate(ev):
    nxt=ev[k+1][0] if k+1<len(ev) else b+0.6
    end=nxt if nxt-b<0.45 else b+0.2
    if k==len(ev)-1: end=21.65
    out.append(f"Dialogue: 0,{ts(a)},{ts(end)},Word,,0,0,0,,{{\\fscx88\\fscy88\\t(0,70,\\fscx100\\fscy100)}}{g}")
open('captions.ass','w').write(hdr+'\n'.join(out)+'\n')
srt=[]
for k,(a,b,g) in enumerate(ev):
    nxt=ev[k+1][0] if k+1<len(ev) else 21.65
    e=nxt if nxt-b<0.45 else b+0.2
    f=lambda s: f"{int(s//3600):02d}:{int(s%3600//60):02d}:{int(s%60):02d},{int(round((s%1)*1000)):03d}"
    srt.append(f"{k+1}\n{f(a)} --> {f(min(e,21.65))}\n{g}\n")
open('captions.srt','w').write('\n'.join(srt))
print(len(ev),'caption events')
