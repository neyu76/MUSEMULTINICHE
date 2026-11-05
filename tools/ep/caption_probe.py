"""Debug the caption QA: letter heights as tools/analysis/capgeo.py sees them + caption fill brightness, at time t.
usage: python3 -I caption_probe.py video.mp4 t [crop.png]
Reference (team samples, 720×1280): x-height 27 px, ascender 35–36 px, fill brightness ~252.
If the fill reads ~235 the file is full-range/BT.601 (old kit assemble) → letters split at the 235 threshold → cap_h too low."""
import sys, cv2, numpy as np
c = cv2.VideoCapture(sys.argv[1]); c.set(1, int(float(sys.argv[2]) * 30)); ok, fr = c.read()
fr = cv2.resize(fr, (720, 1280), interpolation=cv2.INTER_AREA); g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
band = g[700:1050]; white = (band > 235).astype(np.uint8); dark = cv2.dilate((band < 50).astype(np.uint8), np.ones((5, 5), np.uint8))
nb, lab, st, cen = cv2.connectedComponentsWithStats(white & cv2.dilate(dark, np.ones((7, 7), np.uint8)))
print('letters (x, y, w, h):', sorted([(int(s[0]), int(s[1]) + 700, int(s[2]), int(s[3])) for s in st[1:] if 6 < s[3] < 80 and s[2] < 80 and s[4] > 15]))
top = np.sort(g[870:925, 200:520].ravel())[-2000:]
print('caption fill: brightest-2000 px median', int(np.median(top)), '(samples ~252)')
if len(sys.argv) > 3: cv2.imwrite(sys.argv[3], cv2.resize(fr[860:940, 220:500], None, fx=3, fy=3, interpolation=cv2.INTER_NEAREST))
