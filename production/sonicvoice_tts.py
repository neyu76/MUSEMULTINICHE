#!/usr/bin/env python3
"""SonicVoice TTS -> voice sạch. Khóa: biến môi trường SONICVOICE_API_KEY.
Lệnh: balance | models [--provider] | voices [--provider eleven --language en --gender male --q --use_case] |
      tts script.txt --voice ID [--provider eleven|mini --language English --speed --model --out] |
      clean raw.wav --out dir | words voice.wav --out dir"""
import argparse, json, os, shutil, subprocess, sys, time, urllib.error, urllib.parse, urllib.request

BASE = "https://sonicvoice.pro/api"
FINAL = {"succeeded", "failed", "partial", "cancelled"}

def key():
    k = os.environ.get("SONICVOICE_API_KEY", "").strip()
    if not k:
        sys.exit("Thiếu SONICVOICE_API_KEY.")
    return k

def call(method, path, body=None, params=None, raw=False, retries=4):
    url = BASE + path + ("?" + urllib.parse.urlencode(params) if params else "")
    data = json.dumps(body).encode() if body is not None else None
    headers = {"X-API-Key": key(), "Accept": "*/*", "User-Agent": "RicksClips-TTS/1.0 (+curl-compatible)"}
    if data is not None:
        headers["Content-Type"] = "application/json"
    for attempt in range(retries + 1):
        req = urllib.request.Request(url, data=data, method=method, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                payload = r.read()
                return payload if raw else json.loads(payload or b"null")
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "replace")[:500]
            if e.code in (429, 500, 502, 503, 504) and attempt < retries:
                time.sleep(5 * (attempt + 1)); continue
            hints = {401: "khóa API sai/thiếu", 402: "hết ký tự", 403: "Cloudflare chặn (kiểm tra User-Agent/domain)", 404: "không tìm thấy/chưa sẵn sàng", 422: "tham số không hợp lệ"}
            sys.exit(f"HTTP {e.code} ({hints.get(e.code, 'lỗi')}) tại {method} {path}: {msg}")
        except urllib.error.URLError as e:
            if attempt < retries:
                time.sleep(3); continue
            sys.exit(f"Không kết nối được {url}: {e}")

def clean(raw, out_dir):
    if not shutil.which("ffmpeg"):
        sys.exit("Chưa có ffmpeg trong PATH.")
    out = os.path.join(out_dir, "voice.wav")
    trim = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,"
            "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse")
    pre = f"aformat=channel_layouts=mono,highpass=f=80,deesser=i=0.3,{trim}"
    m = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", pre + ",loudnorm=I=-16:TP=-1.5:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True).stderr
    s = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
    gain = -16.0 - float(s["input_i"])
    ln = f"volume={gain:.2f}dB,alimiter=limit=0.80:attack=5:release=50:level=false"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", f"{pre},{ln}",
                    "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", out], check=True)
    print(f"Đã xử lý: {out}")
    return out

def words(wav, out_dir, lang=None):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("Bỏ qua words.json: chưa cài faster-whisper (dùng srt_words.py)."); return None
    model = WhisperModel(os.environ.get("WHISPER_MODEL", "small"), device="auto", compute_type="auto")
    segs, info = model.transcribe(wav, word_timestamps=True, language=lang)
    items = [{"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)}
             for s in segs for w in (s.words or [])]
    path = os.path.join(out_dir, "words.json")
    json.dump({"language": info.language, "words": items}, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"Mốc từng từ: {path} ({len(items)} từ)")
    return path

def tts(a):
    text = open(a.script, encoding="utf-8").read().strip()
    if not text:
        sys.exit("Kịch bản rỗng.")
    os.makedirs(a.out, exist_ok=True)
    body = {"kind": "single", "provider": a.provider, "voice_id": a.voice, "text": text, "speed": a.speed,
            "split_mode": "keep", "srt_out": True, "title": os.path.splitext(os.path.basename(a.script))[0]}
    if a.language: body["language"] = a.language
    if a.model: body["model"] = a.model
    if a.provider == "eleven":
        body.update(stability=a.stability, similarity_boost=0.75, style=a.style, use_speaker_boost=True)
    print(f"Số dư: {call('GET', '/v1/me/balance').get('available_chars')} | Kịch bản: {len(text)} ký tự")
    jid = call("POST", "/v1/tts/jobs", body)["id"]
    t0 = time.time()
    while True:
        time.sleep(3)
        j = call("GET", f"/v1/tts/jobs/{jid}")
        print(f"  {j.get('status')} {j.get('progress_done')}/{j.get('progress_total')}", flush=True)
        if j.get("status") in FINAL: break
        if time.time() - t0 > 1800: sys.exit(f"Job {jid} quá 30 phút.")
    if j["status"] != "succeeded":
        sys.exit(f"Job {j['status']}: {j.get('error')}")
    raw = os.path.join(a.out, "voice_raw.wav")
    open(raw, "wb").write(call("GET", f"/v1/tts/jobs/{jid}/audio", raw=True))
    try:
        open(os.path.join(a.out, "voice_sentences.srt"), "wb").write(call("GET", f"/v1/tts/jobs/{jid}/srt", raw=True))
    except SystemExit as e:
        print(f"Không lấy được SRT: {e}")
    words(clean(raw, a.out), a.out)

def main():
    p = argparse.ArgumentParser(description=__doc__)
    sp = p.add_subparsers(dest="cmd", required=True)
    sp.add_parser("balance")
    m = sp.add_parser("models"); m.add_argument("--provider")
    v = sp.add_parser("voices")
    for f in ("provider", "language", "gender", "q", "use_case"): v.add_argument("--" + f)
    v.add_argument("--limit", type=int, default=50)
    t = sp.add_parser("tts"); t.add_argument("script"); t.add_argument("--voice", required=True)
    t.add_argument("--provider", default="eleven", choices=["eleven", "mini"])
    t.add_argument("--language", default="English"); t.add_argument("--model")
    t.add_argument("--speed", type=float, default=1.0)
    t.add_argument("--stability", type=float, default=0.5); t.add_argument("--style", type=float, default=0.0)
    t.add_argument("--out", default="voice_out")
    c = sp.add_parser("clean"); c.add_argument("wav"); c.add_argument("--out", default="voice_out")
    w = sp.add_parser("words"); w.add_argument("wav"); w.add_argument("--out", default="voice_out"); w.add_argument("--lang")
    a = p.parse_args()
    if a.cmd == "balance": print(json.dumps(call("GET", "/v1/me/balance"), indent=1))
    elif a.cmd == "models":
        for x in call("GET", "/v1/models", params={"provider": a.provider} if a.provider else None):
            print(x["provider"], x["model_id"], x.get("credit_ratio"), x.get("max_chars"))
    elif a.cmd == "voices":
        params = {k: getattr(a, k) for k in ("provider", "language", "gender", "q", "use_case") if getattr(a, k)}
        params["limit"] = a.limit; params["sort"] = "trending"
        r = call("GET", "/v1/voices", params=params)
        print("Tổng:", r.get("total"))
        for x in r["items"]:
            print(x["id"], "|", x.get("name"), "|", x.get("use_case"), "|", x.get("style"), "|", x.get("age"))
    elif a.cmd == "tts": tts(a)
    elif a.cmd == "clean": os.makedirs(a.out, exist_ok=True); clean(a.wav, a.out)
    elif a.cmd == "words": os.makedirs(a.out, exist_ok=True); words(a.wav, a.out, a.lang)

if __name__ == "__main__":
    main()
