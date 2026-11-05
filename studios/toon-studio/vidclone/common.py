"""Shared helpers: probing, proxies, frame readers, JSON io."""
import json, os, subprocess, numpy as np

def sh(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw).stdout

def probe(path):
    j = json.loads(sh(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', path]))
    v = next((s for s in j['streams'] if s['codec_type'] == 'video'), None)
    a = next((s for s in j['streams'] if s['codec_type'] == 'audio'), None)
    num, den = (v['avg_frame_rate'] if v else '0/1').split('/')
    return {
        'w': int(v['width']) if v else 0, 'h': int(v['height']) if v else 0,
        'fps': round(float(num) / float(den or 1), 3) if v else 0,
        'dur': round(float(j['format']['duration']), 3),
        'vcodec': v['codec_name'] if v else None, 'acodec': a['codec_name'] if a else None,
        'channels': int(a['channels']) if a else 0, 'sr': int(a['sample_rate']) if a else 0,
        'size_mb': round(int(j['format']['size']) / 1e6, 2),
    }

def prepare(video, work):
    """Analysis inputs from any codec: 30 fps H.264 proxy (360 px short side),
    1 fps PNG stills (720 px short side), 48 kHz stereo wav, 16 kHz mono wav."""
    os.makedirs(work, exist_ok=True)
    px = f'{work}/proxy.mp4'
    if os.path.exists(px) and os.path.getmtime(video) > os.path.getmtime(px):  # video re-rendered: old inputs are stale
        import shutil
        for f in ('proxy.mp4', 'audio.wav', 'audio16.wav'):
            if os.path.exists(f'{work}/{f}'): os.remove(f'{work}/{f}')
        shutil.rmtree(f'{work}/stills', ignore_errors=True)
    info = probe(video)
    portrait = info['h'] >= info['w']
    small = 'scale=360:-2' if portrait else 'scale=-2:360'
    still = 'scale=720:-2' if portrait else 'scale=-2:720'
    if not os.path.exists(px):
        sh(['ffmpeg', '-y', '-v', 'error', '-i', video, '-an', '-vf', f'fps=30,{small}:flags=area',
            '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast', px])
    sd = f'{work}/stills'
    if not os.path.isdir(sd):
        os.makedirs(sd)
        sh(['ffmpeg', '-y', '-v', 'error', '-i', video, '-vf', f'fps=1,{still}:flags=lanczos', f'{sd}/%04d.png'])
    if info['acodec'] and not os.path.exists(f'{work}/audio.wav'):
        sh(['ffmpeg', '-y', '-v', 'error', '-i', video, '-vn', '-ac', '2', '-ar', '48000', f'{work}/audio.wav'])
        sh(['ffmpeg', '-y', '-v', 'error', '-i', video, '-vn', '-ac', '1', '-ar', '16000', f'{work}/audio16.wav'])
    return info

def read_frames(path, size=None, gray=False):
    """Decode a video with ffmpeg into numpy frames (sequential generator)."""
    info = probe(path)
    w, h = size or (info['w'], info['h'])
    pix = 'gray' if gray else 'bgr24'
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={w}:{h}:flags=area',
                          '-f', 'rawvideo', '-pix_fmt', pix, '-'], stdout=subprocess.PIPE)
    n = w * h * (1 if gray else 3)
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        f = np.frombuffer(b, np.uint8)
        yield f.reshape(h, w) if gray else f.reshape(h, w, 3)
    p.wait()

def stills(work):
    d = f'{work}/stills'
    return [f'{d}/{f}' for f in sorted(os.listdir(d)) if f.endswith('.png')]

def q(x, p=50):
    x = [v for v in x if v is not None]
    return round(float(np.percentile(x, p)), 4) if len(x) else None

def dist(x):
    return {'median': q(x), 'p10': q(x, 10), 'p90': q(x, 90), 'n': len(x)} if len(x) else None

def save(obj, path):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, indent=1, ensure_ascii=False)

def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)
