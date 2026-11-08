# Sinh phụ đề ASS kiểu mẫu P02: cụm 1–3 từ (ưu tiên 2), cắt ở dấu câu, trắng Poppins ExtraBold, tâm y≈60 %, nảy nhẹ, 1 khung trống giữa cụm.
# Bản overlay p02-invention (08/11/2026): dùng chung mọi tập (cong_cu/), thêm từ chửi/cảm xúc viết HOA như video viral (DUMBASS…).
# Dùng: python3 -I cong_cu/tao_phu_de.py <words.json> <ra.ass> [t_max]   — thêm từ viết hoa: biến môi trường CAPS_THEM="word1,word2"
import json,sys
_d=json.load(open(sys.argv[1])); words=_d['words'] if isinstance(_d,dict) else _d; out=sys.argv[2]; tmax=float(sys.argv[3]) if len(sys.argv)>3 else 1e9
K=1.5  # khung 1080×1920 (bản duyệt); đặt K=1 cho khung 720×1280
import os
CAPS={'fucking','love','dumbass','dumb-ass'}|{x.strip().lower() for x in os.environ.get('CAPS_THEM','').split(',') if x.strip()}
chunks=[];cur=[]
for i,w in enumerate(words):
    cur.append(w)
    end_p=w['w'][-1] in '.,!?'
    nxt=words[i+1] if i+1<len(words) else None
    if end_p or len(cur)==3 or (len(cur)==2 and nxt and not (nxt['w'][-1] in '.,!?' and len(nxt['w'])<=4)):
        chunks.append(cur);cur=[]
if cur: chunks.append(cur)
def ts(t):
    h=int(t//3600);m=int(t%3600//60);s=t%60;return f"{h}:{m:02d}:{s:05.2f}"
L=["[Script Info]","ScriptType: v4.00+",f"PlayResX: {int(720*K)}",f"PlayResY: {int(1280*K)}","WrapStyle: 2","",
"[V4+ Styles]","Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
f"Style: Sub,Poppins ExtraBold,{int(70*K)},&H00FFFFFF,&H00FFFFFF,&H00141414,&H96000000,0,0,0,0,100,100,0,0,1,{3*K},{2.5*K},5,{int(30*K)},{int(30*K)},0,1","",
"[Events]","Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
fr=1/30
for k,c in enumerate(chunks):
    st=c[0]['s']; en=(chunks[k+1][0]['s']-fr) if k+1<len(chunks) else c[-1]['e']
    if st>=tmax: break
    en=min(en,tmax)
    txt=' '.join(w['w'].upper() if w['w'].strip('.,!?').lower() in CAPS else w['w'] for w in c)
    L.append(f"Dialogue: 0,{ts(st)},{ts(en)},Sub,,0,0,0,,{{\\pos({int(360*K)},{int(767*K)})\\fscx86\\fscy86\\t(0,90,\\fscx100\\fscy100)}}{txt}")
open(out,'w').write('\n'.join(L)+'\n')
print(len(chunks),'cum; tu/cum:',sorted(len(c) for c in chunks)[len(chunks)//2])
