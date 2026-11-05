"""Scan EVERY frame of a video for black/flat frames (the QA's 'black frames ≤ 1 %' samples too sparsely to catch a 1-frame flash).
usage: python3 -I flat_frames.py video.mp4      → prints frame indices whose top 2/3 has std < 3; exit 1 if any."""
import cv2, sys
c = cv2.VideoCapture(sys.argv[1]); i = 0; bad = []
while True:
    ok, f = c.read()
    if not ok: break
    g = cv2.cvtColor(cv2.resize(f, (360, 640))[:420], cv2.COLOR_BGR2GRAY)
    if g.std() < 3: bad.append((i, round(i / 30, 2), round(float(g.mean()), 1)))
    i += 1
print(f'flat-frame scan: {i} frames, flat {bad if bad else "none"}')
sys.exit(1 if bad else 0)
