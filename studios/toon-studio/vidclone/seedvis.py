"""seedvis.com image generation (Nano Banana 2.1 = model "NARWHAL", plus the other models GET /models lists).

Key: ~/.secrets/seedvis_key (chmod 600) or $SEEDVIS_API_KEY — never in the repo, config or logs.
  generate(prompt, out, refs=[...], aspect='9:16', upscale='2k', model='NARWHAL') -> local PNG
  models() -> the account's model list
Rules from the seedvis docs: queued/processing is success — follow next.url until is_final; never resend (a resend is a new
charge); always send an Idempotency-Key so a retry after a network error returns the same job.
"""
import base64, json, os, time, uuid, urllib.request, urllib.error

BASE = 'https://seedvis.com/api/v1'
GOOGLE = BASE + '/google/v1beta/interactions'

def _key():
    k = os.environ.get('SEEDVIS_API_KEY')
    if not k:
        p = os.path.expanduser('~/.secrets/seedvis_key')
        if not os.path.exists(p): raise SystemExit('no seedvis key: put it in ~/.secrets/seedvis_key (chmod 600)')
        k = open(p).read().strip()
    return k

def _req(url, body=None, idem=None, timeout=150, tries=5):
    # an explicit User-Agent: Cloudflare in front of seedvis answers Python's default urllib agent with 403 / error 1010
    h = {'x-goog-api-key': _key(), 'Authorization': f'Bearer {_key()}', 'Content-Type': 'application/json',
         'User-Agent': 'vidclone/1.0 (+https://github.com/neyu76/vidclone)', 'Accept': 'application/json'}
    if idem: h['Idempotency-Key'] = idem
    data = json.dumps(body).encode() if body is not None else None
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=h, method='POST' if data else 'GET'), timeout=timeout) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors='replace')[:500]
            if e.code in (429, 500, 502, 503, 504) and k < tries - 1: time.sleep(4 * (k + 1)); continue   # same key: same job
            raise SystemExit(f'seedvis HTTP {e.code}: {msg}')
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            if k < tries - 1: time.sleep(4 * (k + 1)); continue
            raise

def models():
    return _req(BASE + '/models')

def _img(path):
    return {'data': base64.b64encode(open(path, 'rb').read()).decode(), 'file_name': os.path.basename(path)}

def generate(prompt, out, refs=(), aspect='9:16', upscale='2k', model='NARWHAL'):
    body = {'model': model, 'input': prompt, 'aspect_ratio': aspect, 'upscale_image': upscale, 'count': 1}
    if refs: body['reference_images'] = [_img(r) for r in refs]
    r = _req(GOOGLE, body, idem=str(uuid.uuid4()))
    d = r.get('data', r)
    while not d.get('is_final', d.get('status') in ('completed', 'failed')):
        nxt = d.get('next') or {}
        time.sleep(nxt.get('after_seconds', 5))
        r = _req(nxt['url']); d = r.get('data', r)
    if d.get('status') == 'failed': raise SystemExit(f"seedvis failed: {d.get('error')}")
    url = [o['url'] for o in d.get('outputs', []) if o.get('type', 'image') == 'image'][0]
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    rq = urllib.request.Request(url, headers={'User-Agent': 'vidclone/1.0 (+https://github.com/neyu76/vidclone)'})
    with urllib.request.urlopen(rq, timeout=120) as r, open(out, 'wb') as f: f.write(r.read())
    open(out + '.url', 'w').write(url)   # the CDN URL, for tools that take a link (e.g. background removal elsewhere)
    for ref, echo in zip(refs, d.get('references', [])):   # seedvis stores every reference: keep its link too
        if echo.get('url') and not os.path.exists(ref + '.url'): open(ref + '.url', 'w').write(echo['url'])
    return out

def batch(jobs, workers=4):
    """jobs: [{'out', 'prompt', 'refs': [...], 'aspect', 'upscale'}]; already-made outputs are skipped.
    Runs `workers` at a time (the seedvis plan's parallel slots). Returns {out: 'ok' | error text}."""
    from concurrent.futures import ThreadPoolExecutor
    def one(j):
        if os.path.exists(j['out']) and os.path.getsize(j['out']) > 1000: return j['out'], 'ok (cached)'
        try:
            generate(j['prompt'], j['out'], j.get('refs', ()), j.get('aspect', '9:16'), j.get('upscale', '2k'), j.get('model', 'NARWHAL'))
            return j['out'], 'ok'
        except (SystemExit, Exception) as e: return j['out'], f'error: {e}'
    with ThreadPoolExecutor(workers) as ex: return dict(ex.map(one, jobs))
