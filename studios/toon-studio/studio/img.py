"""Nano Banana pictures through the Gemini API for agents whose key lives in a vault/connector (never in the shell).
Same model family as Google Flow (the look of the reference episode ATE01-004), fully unattended.
Host generativelanguage.googleapis.com, key in the HTTP header `x-goog-api-key` (added by the connector, never in these files).

  1. write art_plan.json in the episode: [{"name": "OC0", "kind": "pose|plate|person|head|prop", "prompt": "...",
                                          "ref": null | "OC0" | ["OC0", "SC_photo"], "white": false}, ...]
     (kind prop → props/green/NAME.png on green #00FF00, or white when "white": true; everything else → art/NAME.png)
  2. studio img plan EP     → img_requests.json: one request per picture whose refs already exist and that is not made yet
  3. send each request with the connector (method POST, url, headers, json body) and write the RESPONSE JSON to its "response"
  4. studio img save EP     → decodes every response into its picture ("out"), prints what is still missing
  Repeat 2–4 (wave by wave: base pictures first, then everything chained from them) until plan says 0 requests.
Every call costs: send each request once; on an error JSON, read it, fix the prompt/ref, then plan again.

  studio img todo EP        (any image tool, e.g. Muse media.generate_image): the next wave from art_plan.json — name, where to
                            save it, the reference picture(s) to chain from, the prompt. Save each result at the printed path."""
import base64, json, mimetypes, os
from . import cfg

API = 'https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent'

def _model():
    return cfg.CHANNEL.get('images', {}).get('api_model', 'gemini-nano-banana-2.1')

def _out(it):
    return f"props/green/{it['name']}.png" if it.get('kind') == 'prop' else f"art/{it['name']}.png"

def _find(name):
    for d in ('art', 'props/green'):
        for ext in ('.png', '.jpg', '.jpeg', '.webp'):
            p = f'{d}/{name}{ext}'
            if os.path.exists(p): return p
    return None

def _part(path):
    mt = mimetypes.guess_type(path)[0] or 'image/png'
    return {'inline_data': {'mime_type': mt, 'data': base64.b64encode(open(path, 'rb').read()).decode()}}

def plan():
    if not os.path.exists('art_plan.json'): raise SystemExit('write art_plan.json first (see studio/img.py)')
    items = json.load(open('art_plan.json')); I = cfg.CHANNEL.get('images', {})
    reqs, waiting, done = [], [], 0
    os.makedirs('img_responses', exist_ok=True)
    for it in items:
        out = _out(it)
        if os.path.exists(out) or _find(it['name']): done += 1; continue
        refs = it.get('ref') or []; refs = [refs] if isinstance(refs, str) else refs
        paths = [_find(r) for r in refs]
        if not all(paths): waiting.append(f"{it['name']} (needs {', '.join(r for r, p in zip(refs, paths) if not p)})"); continue
        body = {'contents': [{'role': 'user', 'parts': [_part(p) for p in paths] + [{'text': it['prompt']}]}],
                'generationConfig': {'responseModalities': ['IMAGE'],
                                     'imageConfig': {'aspectRatio': I.get('aspect', '9:16'), 'imageSize': I.get('size', '2K')}}}
        reqs.append({'name': it['name'], 'method': 'POST', 'url': API.format(m=_model()),
                     'headers': {'Content-Type': 'application/json'}, 'json': body,
                     'response': f"img_responses/{it['name']}.json", 'out': out, 'white': bool(it.get('white'))})
    json.dump(reqs, open('img_requests.json', 'w'))
    print(f'{len(reqs)} request(s) → img_requests.json; {done} done; {len(waiting)} waiting for refs' + (f': {waiting}' if waiting else ''))

def save():
    reqs = json.load(open('img_requests.json')) if os.path.exists('img_requests.json') else []
    ok = bad = 0
    for r in reqs:
        if os.path.exists(r['out']): continue
        if not os.path.exists(r['response']): print('no response yet:', r['name']); bad += 1; continue
        j = json.load(open(r['response'])); img = None
        for c in j.get('candidates', []):
            for p in c.get('content', {}).get('parts', []):
                d = p.get('inline_data') or p.get('inlineData')
                if d: img = base64.b64decode(d['data'])
        if not img: print('NO IMAGE', r['name'], json.dumps(j)[:300]); bad += 1; continue
        os.makedirs(os.path.dirname(r['out']), exist_ok=True); open(r['out'], 'wb').write(img); ok += 1; print('saved', r['out'])
        if r.get('white'): open(os.path.splitext(r['out'])[0] + '.white', 'w').close()   # studio cut props: shot on white
    print(f'{ok} saved, {bad} problem(s) — now look at them: studio sheet EP out/look.jpg art/*.png props/green/*.png')

def todo():
    if not os.path.exists('art_plan.json'): raise SystemExit('write art_plan.json first (see studio/img.py)')
    items = json.load(open('art_plan.json')); nxt, waiting, done = [], [], 0
    for it in items:
        if _find(it['name']): done += 1; continue
        refs = it.get('ref') or []; refs = [refs] if isinstance(refs, str) else refs
        paths = [_find(r) for r in refs]
        if all(paths): nxt.append((it, paths))
        else: waiting.append(it['name'])
    print(f'{done} done, {len(nxt)} to make now, {len(waiting)} waiting for their reference' + (f': {waiting}' if waiting else ''))
    for it, paths in nxt:
        print(f"\n[{it['name']}] {it.get('kind', '')} -> save as {_out(it)}" + (' (+ empty marker file ' + os.path.splitext(_out(it))[0] + '.white)' if it.get('white') else ''))
        print('  reference: ' + (', '.join(paths) if paths else 'none (new picture)'))
        print('  prompt: ' + it['prompt'])
