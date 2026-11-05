#!/usr/bin/env python3
"""ElevenLabs REST helper for workers without the ElevenLabs connector. Key: ~/.secrets/elevenlabs_key (chmod 600) or $ELEVENLABS_API_KEY.

  python3 -I tools/ep/el_media.py tts   <EP> [takes=2]      script.txt → episodes/<EP>/voice/take1.mp3, take2.mp3
  python3 -I tools/ep/el_media.py music <EP> [seconds=60]   MUSIC_PROMPT → episodes/<EP>/audio/music1.mp3 (music2.mp3 …)
  python3 -I tools/ep/el_media.py check                     key works? lists the channel voice

Voice/model/prompt come from niches/<CHANNEL>/channel.env (CHANNEL is read from episodes/<EP>/episode.env).
Each call spends ElevenLabs credits — never loop on failure; read the error and stop.

Agents that may not see the key (Muse: vault key only via a registered connector helper with a surrogate credential):
  python3 -I tools/ep/el_media.py plan tts|music <EP> [n|seconds]  → episodes/<EP>/el_requests_<kind>.json (no key inside):
      [{"method","url","headers" (without xi-api-key),"json","out"}] — send each with your connector helper
      (host api.elevenlabs.io, API key in header "xi-api-key"), write the response body (audio/mpeg) to "out"
  python3 -I tools/ep/el_media.py verify <EP>                      → checks every "out" exists, is audio, prints duration
"""
import json, os, re, sys, pathlib, urllib.request, urllib.error

RC = pathlib.Path(__file__).resolve().parents[2]
API = "https://api.elevenlabs.io/v1"

def key():
    k = os.environ.get("ELEVENLABS_API_KEY") or ""
    p = pathlib.Path.home() / ".secrets" / "elevenlabs_key"
    if not k and p.exists():
        k = p.read_text().strip()
    if not k:
        sys.exit("no API key: put it in ~/.secrets/elevenlabs_key (chmod 600) or $ELEVENLABS_API_KEY")
    return k

def envfile(path):
    d = {}
    for line in pathlib.Path(path).read_text().splitlines():
        m = re.match(r'\s*([A-Z_]+)=("([^"]*)"|(\S*))', line)
        if m:
            d[m.group(1)] = m.group(3) if m.group(3) is not None else m.group(4)
    return d

def channel_for(ep):
    e = envfile(RC / "episodes" / ep / "episode.env")
    return envfile(RC / "niches" / e.get("CHANNEL", "rickclips") / "channel.env")

def post(url, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method="POST",
                                 headers={"xi-api-key": key(), "Content-Type": "application/json", "Accept": "audio/mpeg"})
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code} from {url.split('?')[0]}: {e.read()[:600].decode(errors='replace')}")

def tts(ep, n=2):
    ch = channel_for(ep); text = (RC / "episodes" / ep / "script.txt").read_text().strip()
    if re.search(r"\d", text):
        sys.exit("script.txt has digits — spell numbers out first")
    out = RC / "episodes" / ep / "voice"; out.mkdir(parents=True, exist_ok=True)
    for i in range(1, int(n) + 1):
        b = post(f"{API}/text-to-speech/{ch['VOICE_ID']}?output_format=mp3_44100_128",
                 {"text": text, "model_id": ch.get("VOICE_MODEL", "eleven_v4")})
        (out / f"take{i}.mp3").write_bytes(b); print(f"voice/take{i}.mp3  {len(b)//1024} KB")

def music(ep, sec=60):
    ch = channel_for(ep); out = RC / "episodes" / ep / "audio"; out.mkdir(parents=True, exist_ok=True)
    body = {"prompt": ch["MUSIC_PROMPT"], "music_length_ms": int(float(sec) * 1000),
            "force_instrumental": ch.get("MUSIC_INSTRUMENTAL", "true") == "true"}
    if ch.get("MUSIC_MODEL"):
        body["model_id"] = ch["MUSIC_MODEL"]
    i = 1
    while (out / f"music{i}.mp3").exists():
        i += 1
    b = post(f"{API}/music?output_format=mp3_44100_128", body)
    (out / f"music{i}.mp3").write_bytes(b); print(f"audio/music{i}.mp3  {len(b)//1024} KB — listen once for vocals")

def requests_for(kind, ep, arg=None):
    ch = channel_for(ep); base = RC / "episodes" / ep; reqs = []
    if kind == "tts":
        text = (base / "script.txt").read_text().strip()
        if re.search(r"\d", text):
            sys.exit("script.txt has digits — spell numbers out first")
        for i in range(1, int(arg or 2) + 1):
            reqs.append({"method": "POST", "url": f"{API}/text-to-speech/{ch['VOICE_ID']}?output_format=mp3_44100_128",
                         "headers": {"Content-Type": "application/json", "Accept": "audio/mpeg"},
                         "json": {"text": text, "model_id": ch.get("VOICE_MODEL", "eleven_v4")}, "out": str(base / "voice" / f"take{i}.mp3")})
    else:
        body = {"prompt": ch["MUSIC_PROMPT"], "music_length_ms": int(float(arg or 60) * 1000),
                "force_instrumental": ch.get("MUSIC_INSTRUMENTAL", "true") == "true"}
        if ch.get("MUSIC_MODEL"):
            body["model_id"] = ch["MUSIC_MODEL"]
        n = 1
        while (base / "audio" / f"music{n}.mp3").exists():
            n += 1
        reqs.append({"method": "POST", "url": f"{API}/music?output_format=mp3_44100_128",
                     "headers": {"Content-Type": "application/json", "Accept": "audio/mpeg"}, "json": body, "out": str(base / "audio" / f"music{n}.mp3")})
    return reqs

def plan(kind, ep, arg=None):
    reqs = requests_for(kind, ep, arg); p = RC / "episodes" / ep / f"el_requests_{kind}.json"
    for r in reqs:
        pathlib.Path(r["out"]).parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(reqs, indent=1)); print(f"{len(reqs)} request(s) → {p}  (send each with the connector helper, body → out)")

def verify(ep):
    import subprocess
    reqs = [r for f in sorted((RC / "episodes" / ep).glob("el_requests_*.json")) for r in json.loads(f.read_text())]; bad = 0
    if not reqs:
        sys.exit("no el_requests_*.json — run plan first")
    for r in reqs:
        o = pathlib.Path(r["out"])
        if not o.exists() or o.stat().st_size < 10000:
            print("MISSING/too small:", o); bad += 1; continue
        head = o.read_bytes()[:400]
        if head.lstrip().startswith(b"{") or b"<html" in head.lower():
            print("NOT AUDIO (error body?):", o, head[:200]); bad += 1; continue
        d = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(o)], capture_output=True, text=True).stdout.strip()
        print(f"ok {o}  {d} s")
    sys.exit(1 if bad else 0)

def check():
    ch = envfile(RC / "niches" / "rickclips" / "channel.env")
    req = urllib.request.Request(f"{API}/voices/{ch['VOICE_ID']}", headers={"xi-api-key": key()})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            v = json.load(r); print("OK key; voice:", v.get("name"), v.get("voice_id"), v.get("category"))
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read()[:400].decode(errors='replace')}")

if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    {"tts": lambda: tts(*a[1:]), "music": lambda: music(*a[1:]), "check": check,
     "plan": lambda: plan(*a[1:]), "verify": lambda: verify(*a[1:])}[a[0]]()
