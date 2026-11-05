"""Paths and settings: the repo, the channel, machine-local tools (local.json) and episode folders."""
import glob, json, os

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CHANNEL_DIR = os.path.join(REPO, 'channel')
STYLE = os.path.join(CHANNEL_DIR, 'style')
FONT = os.path.join(REPO, 'fonts', 'Anton-Regular.ttf')
TEMPLATES = os.path.join(REPO, 'templates', 'episode')

def _load(p, default=None):
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else default

CHANNEL = _load(os.path.join(CHANNEL_DIR, 'channel.json'), {})
LOCAL = _load(os.path.join(REPO, 'local.json'), {})   # machine-specific (gitignored): python, birefnet_python, work_dir

def local(key, default=None):
    return os.environ.get('STUDIO_' + key.upper()) or LOCAL.get(key) or default

PY = local('python', os.path.expanduser('~/.vidclone/venv/bin/python'))
BIREFNET_PY = local('birefnet_python', os.path.expanduser('~/.toonstudio/rembg/bin/python'))
WORK_DIR = os.path.expanduser(local('work_dir', CHANNEL.get('work_dir', '~/toon_work')))

def episode_dir(ep):
    """ep = a path, a folder name ('ATE01-004-octopus') or just the id ('ATE01-004')."""
    if os.path.isdir(ep): return os.path.abspath(ep)
    p = os.path.join(WORK_DIR, ep)
    if os.path.isdir(p): return p
    hits = sorted(glob.glob(os.path.join(WORK_DIR, ep + '-*')))
    if len(hits) == 1: return hits[0]
    raise SystemExit(f'episode {ep!r} not found in {WORK_DIR}' + (f' (several: {hits})' if hits else ''))

def episode(ep_dir):
    """episode.json: {id, slug, title}; falls back to the folder name ID-slug."""
    E = _load(os.path.join(ep_dir, 'episode.json'))
    if E: return E
    name = os.path.basename(ep_dir.rstrip('/'))
    parts = name.split('-')
    return {'id': '-'.join(parts[:2]), 'slug': '-'.join(parts[2:]) or 'video', 'title': name}

def out_names(ep_dir):
    E = episode(ep_dir); d = CHANNEL.get('deliver', {})
    base = f"{E['id']}_{E['slug']}"
    return {'render': f'out/{base}.mp4',
            'final': d.get('final', '{id}_{slug}_FINAL.mp4').format(**E),
            'preview': d.get('preview', '{id}_{slug}_preview.mp4').format(**E)}
