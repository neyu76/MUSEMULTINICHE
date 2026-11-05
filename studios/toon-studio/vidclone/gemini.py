"""Google Gemini image + vision helpers (Nano Banana models) with the user's own key.

Key: ~/.secrets/gemini_key (chmod 600) or $GEMINI_API_KEY — never in the repo, config or logs.
  generate(prompt, out, refs=[...], aspect='9:16', model=...)  -> image file (PNG), refs = input images to edit/compose
  find_points(image, what)                                     -> [{label, x, y, w, h}] in 0..1 image coordinates
"""
import base64, json, mimetypes, os, time, urllib.request, urllib.error

API = 'https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent'
IMAGE_MODEL = os.environ.get('VIDCLONE_IMAGE_MODEL', 'gemini-nano-banana-2.1')
VISION_MODEL = os.environ.get('VIDCLONE_VISION_MODEL', 'gemini-3.8-flash')

def _key():
    k = os.environ.get('GEMINI_API_KEY')
    if not k:
        p = os.path.expanduser('~/.secrets/gemini_key')
        if not os.path.exists(p): raise SystemExit('no Gemini key: put it in ~/.secrets/gemini_key (chmod 600)')
        k = open(p).read().strip()
    return k

def _part(path):
    mt = mimetypes.guess_type(path)[0] or 'image/png'
    return {'inline_data': {'mime_type': mt, 'data': base64.b64encode(open(path, 'rb').read()).decode()}}

def _call(model, body, tries=4):
    req = urllib.request.Request(API.format(m=model), data=json.dumps(body).encode(),
                                 headers={'Content-Type': 'application/json', 'x-goog-api-key': _key()})
    for k in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=300) as r: return json.load(r)
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors='replace')[:400]
            if e.code in (429, 500, 503) and k < tries - 1: time.sleep(5 * (k + 1)); continue
            raise SystemExit(f'Gemini {model} HTTP {e.code}: {msg}')

def generate(prompt, out, refs=(), aspect='9:16', size='2K', model=None):
    parts = [_part(r) for r in refs] + [{'text': prompt}]
    body = {'contents': [{'role': 'user', 'parts': parts}],
            'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': aspect, 'imageSize': size}}}
    r = _call(model or IMAGE_MODEL, body)
    for c in r.get('candidates', []):
        for p in c.get('content', {}).get('parts', []):
            d = p.get('inline_data') or p.get('inlineData')
            if d:
                os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
                open(out, 'wb').write(base64.b64decode(d['data']))
                return out
    raise SystemExit(f'no image in Gemini reply: {json.dumps(r)[:400]}')

def find_points(image, what, max_side=768):
    """Bounding boxes of `what` (e.g. 'each eye of the character') as 0..1 boxes; Gemini box_2d is [ymin, xmin, ymax, xmax] /1000.
    The picture is sent downscaled (positions are relative), which keeps free-tier calls fast."""
    import io, tempfile
    from PIL import Image
    im = Image.open(image).convert('RGB'); im.thumbnail((max_side, max_side))
    tmp = tempfile.mktemp(suffix='.jpg'); im.save(tmp, quality=90)
    part = _part(tmp); os.remove(tmp)
    body = {'contents': [{'role': 'user', 'parts': [part, {'text':
            f'Detect {what}. Return a JSON list, each item {{"label": str, "box_2d": [ymin, xmin, ymax, xmax]}} normalised to 0-1000.'}]}],
            'generationConfig': {'responseMimeType': 'application/json', 'temperature': 0}}
    r = _call(VISION_MODEL, body)
    txt = r['candidates'][0]['content']['parts'][0]['text']
    out = []
    for it in json.loads(txt):
        y0, x0, y1, x1 = [v / 1000 for v in it['box_2d']]
        out.append({'label': it.get('label', ''), 'x': (x0 + x1) / 2, 'y': (y0 + y1) / 2, 'w': x1 - x0, 'h': y1 - y0})
    return out
