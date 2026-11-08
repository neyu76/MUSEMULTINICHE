#!/usr/bin/env python3
"""Bước B3 + B4 của kit gộp lại: giọng gốc → rút nghỉ → atempo tới tốc độ đích → Parakeet → words.json → kiểm khớp lời.

Dùng:  python3 -I cong_cu/giong_chuan.py <tap/EXX_ten> [--wpm 218] [--vao am_thanh/giong_goc.mp3]
Đọc:   <tap>/loi_doc.txt (lời sạch), <tap>/am_thanh/giong_goc.(mp3|wav), mô hình $P02_HOME/parakeet (mặc định ~/.p02/parakeet)
Ghi:   <tap>/am_thanh/giong.wav, <tap>/am_thanh/words.json, in hệ số atempo + kết quả khớp lời
Khớp lời: so từng từ (bỏ dấu câu, chữ thường). < 95 % khớp hoặc thiếu đuôi → in LỆCH: nghe không được thì đừng đoán —
tạo lại giọng 1 lần hoặc sửa words.json theo loi_doc.txt khi chỉ sai chính tả (giữ mốc thời gian).
"""
import difflib, json, os, re, subprocess, sys, tempfile, pathlib

HERE = pathlib.Path(__file__).resolve().parent


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(p)],
                                capture_output=True, text=True).stdout.strip())


def main():
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    tap = pathlib.Path(a[0]).resolve(); A = tap / "am_thanh"
    wpm = float(a[a.index("--wpm") + 1]) if "--wpm" in a else 218.0
    src = tap / a[a.index("--vao") + 1] if "--vao" in a else next((A / f"giong_goc{e}" for e in (".mp3", ".wav") if (A / f"giong_goc{e}").exists()), None)
    if not src or not src.exists():
        sys.exit("thiếu am_thanh/giong_goc.mp3|wav")
    loi = (tap / "loi_doc.txt").read_text().split()
    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp); rut = tmp / "rut.wav"
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(src), "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_duration=0.15:stop_threshold=-45dB:stop_silence=0.12",
                        "-ar", "44100", str(rut)], check=True)
        d0 = dur(rut); want = len(loi) / wpm * 60; k = d0 / want
        if not 0.8 <= k <= 1.25:
            print(f"CẢNH BÁO: atempo {k:.3f} ngoài 0,8–1,25 — giọng quá chậm/nhanh, nên tạo lại với speed khác")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(rut), "-af", f"atempo={k:.4f}", "-ar", "44100", str(A / "giong.wav")], check=True)
        v = tmp / "v"; v.mkdir(); o = tmp / "o"; o.mkdir()
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(A / "giong.wav"), "-f", "lavfi", "-i", "color=black:s=16x16:r=1",
                        "-shortest", "-c:a", "aac", str(v / "giong.mp4")], check=True)
        model = pathlib.Path(os.environ.get("P02_HOME", str(pathlib.Path.home() / ".p02"))) / "parakeet"
        subprocess.run([sys.executable, "-I", str(HERE / "asr_parakeet.py"), str(model), str(v), str(o)], check=True)
        W = json.loads((o / "giong.json").read_text())
    (A / "words.json").write_text(json.dumps(W, ensure_ascii=False))
    ww = W["words"] if isinstance(W, dict) else W
    n = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())
    x = [n(w) for w in loi]; y = [n(w["w"]) for w in ww]
    r = difflib.SequenceMatcher(None, x, y).ratio()
    d1 = dur(A / "giong.wav")
    print(f"giong.wav {d1:.2f} s (atempo {k:.3f}), {len(loi)} từ lời / {len(ww)} từ ASR, khớp {r*100:.1f} %, tốc độ {len(loi)/d1*60:.0f} từ/phút")
    tail_ok = bool(y) and y[-1] == x[-1]
    print("KHỚP LỜI:", "ĐẠT" if r >= 0.95 and tail_ok else "LỆCH — xem words.json (từ cuối ASR: %r, lời: %r)" % (y[-1:] , x[-1:]))


if __name__ == "__main__":
    main()
