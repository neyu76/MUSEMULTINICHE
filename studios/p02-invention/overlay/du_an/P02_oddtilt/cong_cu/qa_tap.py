#!/usr/bin/env python3
"""QA video cuối một tập P02 — số đo + điểm cắt khớp chữ nối + contact sheet để rà bằng mắt.

Dùng:  python3 -I cong_cu/qa_tap.py <video.mp4> <tap/EXX_ten> [--kieu cat|lien]
Cần:   <tap>/am_thanh/words.json (mốc từ của giọng trong video) ; ffmpeg/ffprobe
Ghi:   <tap>/qa/qa.json, <tap>/qa/sheet_XX.jpg (2 khung/giây, 10×4 ô có mốc giờ) — CRITIC-V mở từng tấm
Ngưỡng = bản "cửa" đã viral + 5 video viral (xem skill invention-script-writer/references/viral-analysis.md).
"""
import json, re, subprocess, sys, pathlib


def sh(c):
    return subprocess.run(c, capture_output=True, text=True)


def main():
    a = sys.argv[1:]
    if len(a) < 2:
        sys.exit(__doc__)
    mp4 = pathlib.Path(a[0]); tap = pathlib.Path(a[1]); kieu = a[a.index("--kieu") + 1] if "--kieu" in a else "cat"
    q = tap / "qa"; q.mkdir(exist_ok=True)
    pr = json.loads(sh(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height,r_frame_rate:format=duration", "-of", "json", str(mp4)]).stdout)
    v = next(s for s in pr["streams"] if s["codec_type"] == "video"); dur = float(pr["format"]["duration"])
    num, den = v["r_frame_rate"].split("/"); fps = float(num) / float(den)
    r = sh(["ffmpeg", "-hide_banner", "-nostats", "-i", str(mp4), "-af", "loudnorm=print_format=json", "-f", "null", "-"]).stderr
    m = json.loads(r[r.rindex("{"):r.rindex("}") + 1]); I = float(m["input_i"]); TP = float(m["input_tp"])
    r = sh(["ffmpeg", "-hide_banner", "-nostats", "-i", str(mp4), "-af", "highpass=f=200,lowpass=f=4000,silencedetect=n=-32dB:d=0.45", "-f", "null", "-"]).stderr
    sil = [float(x) for x in re.findall(r"silence_duration: ([0-9.]+)", r)]
    r = sh(["ffmpeg", "-hide_banner", "-nostats", "-i", str(mp4), "-vf", "select='gt(scene,0.3)',showinfo", "-an", "-f", "null", "-"]).stderr
    cuts = [float(x) for x in re.findall(r"pts_time:([0-9.]+)", r)]
    d = json.loads((tap / "am_thanh" / "words.json").read_text()); W = d["words"] if isinstance(d, dict) else d
    tok = [re.sub(r"[^a-z]", "", w["w"].lower()) for w in W]
    marks = [W[i]["s"] for i, t in enumerate(tok) if t in ("but", "except", "now") or (t == "so" and i + 1 < len(tok) and tok[i + 1] == "you")]
    on = [c for c in cuts if any(abs(c - x) <= 0.35 for x in marks)]
    wpm = len(W) / (W[-1]["e"] - W[0]["s"]) * 60
    chk = [
        ("Khung", f"{v['width']}x{v['height']}", (v["width"], v["height"]) == (1080, 1920), "1080x1920"),
        ("fps", round(fps, 2), abs(fps - 30) < 0.01, "30"),
        ("Thời lượng", round(dur, 2), 30 <= dur <= 43.5, "30–43 s"),
        ("Loudness", I, -15 <= I <= -13, "−14 ± 1 LUFS"),
        ("True peak", TP, TP <= -1.0, "≤ −1 dBTP"),
        ("Lặng > 0,45 s (dải giọng)", len(sil), len(sil) == 0, "0 (viral: lặng dài nhất 0,41 s)"),
        ("Từ/phút", round(wpm), 205 <= wpm <= 235, "220 ± 15"),
        ("Lời bắt đầu", W[0]["s"], W[0]["s"] <= 0.3, "≤ 0,3 s"),
        ("Đuôi sau từ cuối", round(dur - W[-1]["e"], 2), 0.2 <= dur - W[-1]["e"] <= 0.8, "~0,4 s"),
    ]
    if kieu == "cat":
        chk.append(("Cắt cứng", len(cuts), 7 <= len(cuts) <= 16, "10–14"))
        chk.append(("Cắt rơi đúng chữ nối ±0,35 s", f"{len(on)}/{len(cuts)}", bool(cuts) and len(on) / len(cuts) >= 0.7, "≥ 70 % (viral 79 %)"))
    # beat = điểm cắt + cue âm (cues_auto.json + cues_tay.json); đích ≥ 8 / 10 s, không khoảng > 3 s trống (nguyên tắc "3 giây không có gì mới")
    ev = sorted(set([round(c, 2) for c in cuts] + [round(float(c[0]), 2) for f in ("cues_auto.json", "cues_tay.json")
                                                   if (tap / f).exists() for c in json.loads((tap / f).read_text())]))
    ev = [0.0] + [e for e in ev if 0 < e < dur] + [dur]
    gaps = [(round(ev[i], 2), round(ev[i + 1] - ev[i], 2)) for i in range(len(ev) - 1)]
    big = [g for g in gaps if g[1] > 3.0]
    bp10 = (len(ev) - 2) / dur * 10
    chk.append(("Beat / 10 s (cắt + cue âm)", round(bp10, 1), bp10 >= 8, "≥ 8"))
    chk.append(("Khoảng > 3 s không beat", [f"{t}s+{g}s" for t, g in big] or 0, not big, "0"))
    for f in q.glob("sheet_*.jpg"):
        f.unlink()
    sh(["ffmpeg", "-loglevel", "error", "-y", "-i", str(mp4), "-vf",
        "fps=2,scale=180:-2,drawtext=text='%{pts\\:hms}':x=4:y=4:fontsize=14:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=10x4",
        str(q / "sheet_%02d.jpg")])
    sheets = sorted(str(p) for p in q.glob("sheet_*.jpg"))
    bad = [c for c in chk if not c[2]]
    rep = {"video": str(mp4), "checks": [{"muc": c[0], "gia_tri": c[1], "dat": bool(c[2]), "dich": c[3]} for c in chk],
           "cuts": cuts, "silences": sil, "beat_gaps_over_3s": big, "sheets": sheets, "pass_so_do": not bad,
           "con_phai_xem_bang_mat": ["khung 0 có động cơ/vấn đề + mặt khoa trương", "mỗi 'so you' có bộ phận mới thấy rõ trên đồ vật",
                                     "mỗi 'But/Except' có thất bại vật lý thấy được", "phụ đề không che mặt/bộ phận đang nói tới",
                                     "không vật lơ lửng, không xuyên vật, không nhấp nháy 1 khung", "khung kết gọi lại khung mở đầu",
                                     "1 màu nhấn = đồ vật; nhân vật tách khỏi nền", "không logo/chữ MakeHuman"]}
    (q / "qa.json").write_text(json.dumps(rep, ensure_ascii=False, indent=1))
    for c in chk:
        print(f"[{'ĐẠT' if c[2] else 'LỆCH'}] {c[0]}: {c[1]}  (đích {c[3]})")
    print(f"contact sheet: {len(sheets)} tấm trong {q} — mở từng tấm, chấm theo danh sách 'con_phai_xem_bang_mat' trong qa.json")
    print("SỐ ĐO:", "ĐẠT" if not bad else f"{len(bad)} mục lệch")


if __name__ == "__main__":
    main()
