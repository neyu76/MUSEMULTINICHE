"""Cut a prop out of a flat green-screen image -> trimmed RGBA PNG (soft edge, green spill removed).

  python -m vidclone.cutout in.png out.png [--white]
Generate props "on a flat pure green #00FF00 background, no shadow" so the key is clean; GREEN props (grass, leaves) go on
"a flat pure white #FFFFFF background" and are cut with --white.
"""
import sys, numpy as np, cv2
from PIL import Image

def cut(src, out, pad=6, white=False):
    bgr = cv2.imread(src, cv2.IMREAD_COLOR)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
    h, s, v = hsv[..., 0], hsv[..., 1] / 255, hsv[..., 2] / 255
    b, g, r = [bgr[..., i].astype(np.float32) for i in range(3)]
    if white:  # bright and unsaturated = background; fringe pixels get un-mixed from white
        bg = np.clip((np.minimum(np.minimum(r, g), b) - 205) / 40.0, 0, 1) * np.clip((0.16 - s) / 0.1, 0, 1)
        alpha = 1 - bg
    else:
        greenness = np.clip((g - np.maximum(r, b)) / 80.0, 0, 1) * (np.abs(h - 60) < 28) * (s > 0.25)
        alpha = 1 - greenness
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.8)
    if white:
        a = np.maximum(alpha, 0.05)
        r, g, b = [np.clip((c - 255 * (1 - a)) / a, 0, 255) for c in (r, g, b)]
        g2 = g
    else:  # despill: clamp green to the max of red/blue where the pixel is kept
        g2 = np.minimum(g, np.maximum(r, b) * 1.05)
    rgba = np.dstack([r, g2, b][::-1] if False else [r, g2, b] + [alpha * 255]).astype(np.uint8)
    ys, xs = np.where(alpha > 0.05)
    if len(xs):
        y0, y1, x0, x1 = max(0, ys.min() - pad), ys.max() + pad, max(0, xs.min() - pad), xs.max() + pad
        rgba = rgba[y0:y1, x0:x1]
    Image.fromarray(rgba, 'RGBA').save(out)
    return out

if __name__ == '__main__':
    print(cut(sys.argv[1], sys.argv[2], white='--white' in sys.argv[3:]))
