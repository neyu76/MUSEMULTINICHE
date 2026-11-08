#!/usr/bin/env python3
"""Trộn giọng + nhạc + SFX cho một tập P02, không phải chép/sửa tron_am.py mỗi tập.

Dùng:  python3 -I cong_cu/tron_am_auto.py <tap/EXX_ten> [--dur 36.4] [--nhac tai_nguyen/nhac/x.mp3] [--lufs -14] [--nhac_db -19]
Đọc:   <tap>/am_thanh/giong.wav            giọng đã rút nghỉ + chỉnh tốc độ
       <tap>/cues_auto.json                 từ moc_shot.py (whoosh / ding / uh_oh)
       <tap>/cues_tay.json  (tuỳ chọn)      [[t, "ten_sfx", dB], …] tiếng theo hành động (ngã, gãy, bật ra, gió…)
       tai_nguyen/sfx/<ten>.mp3|.wav        thư viện SFX (gói âm thanh của chủ dự án + tiếng mới tạo)
Ghi:   <tap>/am_thanh/mix.wav               44,1 kHz stereo, loudnorm I=LUFS TP=−1,5
Thiếu file SFX → bỏ cue đó và in cảnh báo (không dừng). Cùng chuỗi lọc với tap/E05_xe_dap/cong_cu/tron_am.py.
"""
import json, subprocess, sys, pathlib

P = pathlib.Path(__file__).resolve().parents[1]


def arg(a, k, d):
    return a[a.index(k) + 1] if k in a else d


def main():
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    tap = pathlib.Path(a[0]).resolve()
    giong = tap / "am_thanh" / "giong.wav"
    if not giong.exists():
        sys.exit(f"thiếu {giong}")
    dur = arg(a, "--dur", None)
    if dur is None:
        mj = tap / "moc_shot.json"
        dur = json.loads(mj.read_text())["dur"] if mj.exists() else None
    if dur is None:
        sys.exit("cần --dur hoặc chạy moc_shot.py trước")
    dur = float(dur)
    nhac = pathlib.Path(arg(a, "--nhac", str(P / "tai_nguyen/nhac/the_curious_ukulele_conundrum.mp3")))
    lufs = float(arg(a, "--lufs", -14)); ndb = float(arg(a, "--nhac_db", -19))
    cues = []
    for f in ("cues_auto.json", "cues_tay.json"):
        p = tap / f
        if p.exists():
            cues += json.loads(p.read_text())
    X = P / "tai_nguyen" / "sfx"; ok = []; miss = set()
    for t, n, db in sorted(cues):
        f = next((X / f"{n}{e}" for e in (".mp3", ".wav") if (X / f"{n}{e}").exists()), None)
        if f is None:
            miss.add(n); continue
        if 0 <= float(t) < dur:
            ok.append((float(t), f, float(db)))
    inp = ["-i", str(giong)]
    fl = [f"[0]atrim=0:{dur},aformat=channel_layouts=mono,aresample=44100,asetpts=N/SR/TB,apad=whole_dur={dur}[v]"]
    mix = "[v]"; k = 1
    if nhac.exists():
        inp += ["-stream_loop", "-1", "-i", str(nhac)]
        fl.append(f"[{k}]atrim=0:{dur},aformat=channel_layouts=mono,aresample=44100,volume={ndb}dB,afade=t=out:st={max(0, dur-0.6)}:d=0.6[m]")
        mix += "[m]"; k += 1
    else:
        print(f"CẢNH BÁO: không có nhạc {nhac} — trộn không nhạc")
    for i, (t, f, db) in enumerate(ok):
        inp += ["-i", str(f)]
        fl.append(f"[{k}]aformat=channel_layouts=mono,aresample=44100,adelay={int(t*1000)},volume={db}dB[s{i}]")
        mix += f"[s{i}]"; k += 1
    fl.append(f"{mix}amix=inputs={k}:normalize=0:duration=first,atrim=0:{dur}")
    out = tap / "am_thanh" / "mix.wav"; tho = tap / "am_thanh" / "mix_tho.wav"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *inp, "-filter_complex", ";".join(fl), "-ar", "44100", "-ac", "1", str(tho)], check=True)
    # loudnorm 2 lượt: đo rồi chỉnh tuyến tính (1 lượt thường hụt đích 2–4 LU)
    ln = f"loudnorm=I={lufs}:TP=-1.5:LRA=11"
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(tho), "-af", ln + ":print_format=json", "-f", "null", "-"], capture_output=True, text=True)
    m = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
    ln2 = (ln + f":measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
           f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(tho), "-af", ln2, "-ar", "44100", "-ac", "2", str(out)], check=True)
    tho.unlink()
    print(f"mix.wav: {dur} s, {len(ok)} cue SFX, nhạc {'có' if nhac.exists() else 'KHÔNG'}" + (f"; THIẾU SFX: {', '.join(sorted(miss))}" if miss else ""))


if __name__ == "__main__":
    main()
