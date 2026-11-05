import cv2, numpy as np, sys, json
v=sys.argv[1]; t0=float(sys.argv[2]) if len(sys.argv)>2 else 0; t1=float(sys.argv[3]) if len(sys.argv)>3 else 1e9
cap=cv2.VideoCapture(v); fps=cap.get(5); prev=None; out=[]; i=0
while True:
    ok,f=cap.read()
    if not ok: break
    t=i/fps; i+=1
    if t<t0: continue
    if t>t1: break
    g=cv2.cvtColor(cv2.resize(f,(180,320)),cv2.COLOR_BGR2GRAY)
    # mask caption band
    g[220:250,:]=0
    if prev is not None:
        fl=cv2.calcOpticalFlowFarneback(prev,g,None,0.5,3,15,3,5,1.2,0)
        dx,dy=fl[...,0],fl[...,1]
        h,w=g.shape; ys,xs=np.mgrid[0:h,0:w]; cx,cy=xs-w/2,ys-h/2
        # fit similarity: dx = s*cx - r*cy + tx ; dy = r*cx + s*cy + ty
        A=np.zeros((2*h*w,4)); A[0::2,0]=cx.ravel();A[0::2,1]=-cy.ravel();A[0::2,2]=1
        A[1::2,0]=cy.ravel();A[1::2,1]=cx.ravel();A[1::2,3]=1
        b=np.empty(2*h*w); b[0::2]=dx.ravel(); b[1::2]=dy.ravel()
        sel=np.random.default_rng(0).choice(h*w,3000,replace=False); rows=np.concatenate([2*sel,2*sel+1])
        p,*_=np.linalg.lstsq(A[rows],b[rows],rcond=None)
        diff=np.abs(g.astype(float)-prev.astype(float)).mean()
        out.append([round(t,3),float(p[0])*100,float(p[2]),float(p[3]),float(diff)])
    prev=g
json.dump(out,open(sys.argv[4] if len(sys.argv)>4 else '/dev/stdout','w'))
