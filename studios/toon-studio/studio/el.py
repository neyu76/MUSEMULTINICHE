"""ElevenLabs requests for agents whose API key lives in a vault/connector (never in the shell): this writes the requests,
the agent sends them with its connector helper, then `verify` checks what came back. Host api.elevenlabs.io, key in the
HTTP header `xi-api-key` (added by the connector — never put it in these files).

  studio el plan voice EP     → el_requests_voice.json   (ONE take: channel voice tag + script.txt → voice/take1.mp3)
  studio el plan music EP     → el_requests_music.json   (channel music prompt, instrumental, ≥ END + 5 s → audio/music.mp3)
  studio el plan sfx EP       → el_requests_sfx.json     (from audio/sfx_plan.json: [{"name": "sx_plop", "prompt": "...", "seconds": 1.0}, ...])
  studio el verify EP         every planned "out" exists and is audio (not an error JSON); prints durations
Each request: {"method", "url", "headers", "json", "out"}; write the response body (audio/mpeg) to "out" (path relative to the episode).
Every call spends credits: send each request once; on an error body, read it and fix the cause before re-sending."""
import glob, json, os, re, subprocess
from . import cfg

API = 'https://api.elevenlabs.io/v1'
H = {'Content-Type': 'application/json', 'Accept': 'audio/mpeg'}

def _end():
    if os.path.exists('words.json'):
        return json.load(open('words.json'))['words'][-1]['e'] + 1.0
    return None

def plan(kind):
    C = cfg.CHANNEL; reqs = []
    if kind == 'voice':
        V = C['voice']; text = open('script.txt', encoding='utf-8').read().strip()
        if re.search(r'\d', text): raise SystemExit('script.txt has digits — spell numbers out as spoken')
        reqs.append({'method': 'POST', 'url': f"{API}/text-to-speech/{V['voice_id']}?output_format=mp3_44100_128", 'headers': H,
                     'json': {'text': (V.get('tag', '') + ' ' + text).strip(), 'model_id': V.get('model', 'eleven_v4')},
                     'out': 'voice/take1.mp3'})
    elif kind == 'music':
        M = C['music']; end = _end(); sec = max(M.get('length_s', 80), (end or 0) + 5)
        body = {'prompt': M['prompt'], 'music_length_ms': int(sec * 1000), 'force_instrumental': True}
        if M.get('api_model'): body['model_id'] = M['api_model']
        reqs.append({'method': 'POST', 'url': f'{API}/music?output_format=mp3_44100_128', 'headers': H, 'json': body, 'out': 'audio/music.mp3'})
    elif kind == 'sfx':
        if not os.path.exists('audio/sfx_plan.json'):
            raise SystemExit('write audio/sfx_plan.json first: [{"name": "sx_plop", "prompt": "short wet cartoon plop", "seconds": 0.8}, ...]')
        for s in json.load(open('audio/sfx_plan.json')):
            n = s['name'] if s['name'].startswith('sx_') else 'sx_' + s['name']
            reqs.append({'method': 'POST', 'url': f'{API}/sound-generation?output_format=mp3_44100_128', 'headers': H,
                         'json': {'text': s['prompt'], 'duration_seconds': float(s.get('seconds', 1.0))}, 'out': f'audio/{n}.mp3'})
    else:
        raise SystemExit('plan voice | music | sfx')
    p = f'el_requests_{kind}.json'; json.dump(reqs, open(p, 'w'), indent=1)
    print(f'{len(reqs)} request(s) → {os.path.abspath(p)}  (send each with the ElevenLabs connector; body → out)')

def verify():
    reqs = [r for f in sorted(glob.glob('el_requests_*.json')) for r in json.load(open(f))]
    if not reqs: raise SystemExit('no el_requests_*.json — run studio el plan … first')
    bad = 0
    for r in reqs:
        o = r['out']
        if not os.path.exists(o) or os.path.getsize(o) < 2000:
            print('MISSING / too small:', o); bad += 1; continue
        head = open(o, 'rb').read(400)
        if head.lstrip().startswith(b'{') or b'<html' in head.lower():
            print('NOT AUDIO (error body?):', o, head[:200]); bad += 1; continue
        d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', o],
                           capture_output=True, text=True).stdout.strip()
        print(f'ok {o}  {d} s')
    print('ALL OK' if not bad else f'{bad} problem(s)')
    return bad == 0
