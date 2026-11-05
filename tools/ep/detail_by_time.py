"""Fine-detail ratio (1 − Lap(blur σ1)/Lap, same metric as tools/analysis/sharpness.py) once per second, top 840 px @720×1280.
usage: python3 -I detail_by_time.py video.mp4   — low values = motion-blurred whips (expected) or soft shots (fix)."""
import cv2, sys
c = cv2.VideoCapture(sys.argv[1]); fps = c.get(5); N = int(c.get(7))
for i in range(0, N, int(fps)):
    c.set(1, i); ok, f = c.read()
    if not ok: break
    f = cv2.resize(f, (720, 1280), interpolation=cv2.INTER_AREA)[:840]
    g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).astype(float); l = cv2.Laplacian(g, cv2.CV_64F).var()
    d = 1 - cv2.Laplacian(cv2.GaussianBlur(g, (0, 0), 1.0), cv2.CV_64F).var() / (l + 1e-6)
    print(f'{i / fps:5.1f}s  detail {d:.3f}  lap {l:7.1f}')
