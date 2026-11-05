import json,numpy as np,sys
from scipy.signal import find_peaks, peak_widths
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
fig,ax=plt.subplots(len(sys.argv)-1,1,figsize=(18,3*(len(sys.argv)-1)))
for k,fn in enumerate(sys.argv[1:]):
    a=np.array(json.load(open(fn))); p=a[:,0:3]; d=a[:,3:6]; f=a[:,6]; seg=a[:,7]
    # screen speed in px/frame @1280 height
    ang=np.arccos(np.clip((d[1:]*d[:-1]).sum(1),-1,1)); lin=np.linalg.norm(np.diff(p,axis=0),axis=1)/4.0
    zf=np.abs(np.diff(np.log(np.tan(np.radians(f)/2))))
    sp=(ang+lin+zf*0.5)/np.radians(f[1:])*1280/4   # scaled to ~180px width units like flow
    same=seg[1:]==seg[:-1]; sp[~same]=np.nan
    s=np.nan_to_num(sp)
    pk,_=find_peaks(s,height=2.0,distance=10,prominence=1.5); w=peak_widths(s,pk,rel_height=0.5)[0]/30
    print(fn, len(pk),'peaks FWHM med %.2f'%np.median(w), 'share<0.3 %.0f%%'%(100*np.mean(w<0.3)), 'max %.1f'%np.nanmax(sp),'static(<0.15) %.0f%%'%(100*np.nanmean(sp<0.15)))
    ax[k].plot(np.arange(len(sp))/30,sp,lw=.8); ax[k].set_ylim(0,10); ax[k].set_xlim(0,50); ax[k].set_ylabel(fn.split('/')[-1])
plt.tight_layout(); plt.savefig('camspeed.png',dpi=60)
