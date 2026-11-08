#!/usr/bin/env python3
"""Mốc lời → bảng shot + cue âm thanh + kiểm công thức viral (P02 "How you invented …").

Dùng:  python3 -I cong_cu/moc_shot.py <tap/EXX_ten> [--kieu cat|lien] [--dur 36.4]
Đọc:   <tap>/am_thanh/words.json   ({"words":[{"w","s","e"}…]} hoặc danh sách)
Ghi:   <tap>/moc_shot.json   vế lời: kind (HOOK/FIX/TWIST/PRAISE/MECH/PAYOFF/LINE), A/B, t0, t1, cắt?, chữ
       <tap>/moc_shot.js     `export const MOC=[…]` (+ bản sao engine/moc/<tên tập>.js — cảnh: `import {MOC} from './moc/EXX_ten.js'`)
       <tap>/cues_auto.json  [[t, tên_sfx, dB], …]: whoosh ở mỗi cắt (−0,15 s), ding ở câu khen, uh_oh ở But/Except
       in bảng + cảnh báo so với 5 video viral (references/viral-analysis.md của skill invention-script-writer)

Quy tắc (đo trên 5 video viral): 79 % điểm cắt nằm ±0,35 s quanh "so you" / "But" / "Except" / "Now".
- kieu cat  (mặc định, kiểu cửa / giấy VS): cắt cứng ở mọi vế FIX/TWIST/MECH/PAYOFF, không cắt ở câu khen (khen giữ trên shot đồ vật vừa xong).
- kieu lien (kiểu quạt / trampoline): không cắt cứng; mỗi mốc là điểm đổi chủ thể cho máy trôi — vẫn ghi để đặt SH.
Vế ngắn < 0,9 s được gộp vào shot trước (không cắt), trừ PAYOFF.
"""
import json, re, sys, pathlib

PRAISE = {"clever", "genius", "brilliant", "lovely", "perfect", "nice", "beautiful"}
ROUGH = {"ass", "shit", "fat", "lazy", "dumbass", "dumb", "fucking", "poop", "fart", "balls", "crap", "damn", "hell", "idiot", "fatass"}


def norm(w):
    return re.sub(r"[^a-z']", "", w.lower())


def load(p):
    d = json.loads(pathlib.Path(p).read_text())
    W = d["words"] if isinstance(d, dict) else d
    return [{"w": x["w"].strip(), "s": float(x["s"]), "e": float(x["e"])} for x in W]


def clauses(W):
    n = len(W); starts = [0]; kinds = ["HOOK"]
    for i in range(1, n):
        a, prev = norm(W[i]["w"]), W[i - 1]["w"]
        nx = norm(W[i + 1]["w"]) if i + 1 < n else ""
        endp = prev[-1:] in ".,!?;:"
        k = None
        if a in ("but", "except"):
            k = "TWIST"
        elif a == "so" and nx == "you":
            k = "FIX"
        elif endp and (a in PRAISE or (a == "much" and nx == "better")):
            k = "PRAISE"
        elif a == "now" and endp:
            k = "MECH" if nx in ("when", "if", "whenever") else "NOW"
        elif a == "as" and endp:
            k = "MECH"
        elif endp and prev[-1:] in ".!?":
            k = "LINE"
        if k:
            starts.append(i); kinds.append(k)
    # câu "Now …" cuối cùng = PAYOFF; các NOW khác = MECH
    last_now = max([j for j, k in enumerate(kinds) if k == "NOW"], default=None)
    kinds = ["PAYOFF" if (k == "NOW" and j == last_now) else ("MECH" if k == "NOW" else k) for j, k in enumerate(kinds)]
    out = []
    for j, i0 in enumerate(starts):
        i1 = starts[j + 1] - 1 if j + 1 < len(starts) else n - 1
        out.append({"kind": kinds[j], "i0": i0, "i1": i1, "t0": W[i0]["s"], "t1": W[i1]["e"],
                    "text": " ".join(w["w"] for w in W[i0:i1 + 1])})
    return out


AB = {"HOOK": "A", "FIX": "B", "MECH": "B+do_hoa", "PRAISE": "B_hero", "TWIST": "A", "PAYOFF": "A_goi_lai_mo_dau", "LINE": "A"}
HINT = {"HOOK": "động cơ thấy ở khung 0, mặt khoa trương, ≥2 lớp phụ (ruồi/mồ hôi/mùi/tim)",
        "FIX": "MACRO đồ vật: bộ phận bật ra đúng lúc đọc danh từ (POP 0,28 s)",
        "MECH": "macro + đồ hoạ khoa học (mũi tên lực/dòng khí/nhiệt/sóng)",
        "PRAISE": "đồ vật hoàn chỉnh lấp lánh hoặc nhân vật tự hào (giữ shot trước)",
        "TWIST": "thất bại vật lý + phản ứng 1–2 s (ngã, gãy, kẹt, bắn văng)",
        "PAYOFF": "gọi lại khung mở đầu, động cơ đã đạt; có thể kéo lùi lộ gag",
        "LINE": "tiếp diễn vế trước"}


def main():
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    tap = pathlib.Path(a[0]); kieu = "cat"; dur = None
    if "--kieu" in a: kieu = a[a.index("--kieu") + 1]
    if "--dur" in a: dur = float(a[a.index("--dur") + 1])
    W = load(tap / "am_thanh" / "words.json")
    end = W[-1]["e"]; dur = dur or round(end + 0.4, 2)
    C = clauses(W)
    shots = []
    for c in C:
        cut = c["kind"] in ("HOOK", "FIX", "TWIST", "MECH", "PAYOFF")
        if c["kind"] != "HOOK" and c["kind"] != "PAYOFF" and (c["t1"] - c["t0"]) < 0.9:
            cut = False
        c["cut"] = cut; c["ab"] = AB[c["kind"]]; c["hint"] = HINT[c["kind"]]
        c["t_cut"] = round(max(0.0, c["t0"] - 0.10), 2) if cut else None
        shots.append(c)
    # khoảng shot = từ điểm cắt này tới điểm cắt sau
    cuts = [s for s in shots if s["cut"]]
    for j, s in enumerate(cuts):
        s["shot_t0"] = 0.0 if j == 0 else s["t_cut"]
        s["shot_t1"] = cuts[j + 1]["t_cut"] if j + 1 < len(cuts) else dur
    cues = []
    for s in shots:
        if kieu == "cat" and s["cut"] and s["t_cut"] and s["t_cut"] > 0.2:
            cues.append([round(s["t_cut"] - 0.15, 2), "whoosh", -15])
        if s["kind"] == "PRAISE":
            cues.append([round(s["t0"] - 0.06, 2), "ding", -9])
        if s["kind"] == "TWIST":
            cues.append([round(s["t0"], 2), "uh_oh", -15])
    cues.sort()
    # ---- kiểm công thức (số đo 5 video viral) ----
    toks = [norm(w["w"]) for w in W]
    nw = len(W); wpm = nw / (end - W[0]["s"]) * 60
    fixes = [s for s in shots if s["kind"] == "FIX"]
    twists = [s for s in shots if s["kind"] == "TWIST"]
    praise = [s for s in shots if s["kind"] == "PRAISE"]
    pay = [s for s in shots if s["kind"] == "PAYOFF"]
    rough = sum(t in ROUGH for t in toks); fk = toks.count("fucking")
    chk = [
        ("Thời lượng", dur, 30 <= dur <= 43.5, "30–43 s"),
        ("Số từ", nw, 110 <= nw <= 160, "110–158"),
        ("Từ/phút", round(wpm), 205 <= wpm <= 235, "220–224 (kit 218)"),
        ("Lời bắt đầu", W[0]["s"], W[0]["s"] <= 0.3, "≤ 0,3 s"),
        ("'so you' đầu tiên", fixes[0]["t0"] if fixes else None, bool(fixes) and fixes[0]["t0"] <= 3.6, "1,0–3,4 s"),
        ("Số giải pháp 'so you'", len(fixes), 5 <= len(fixes) <= 6, "5–6"),
        ("Số But/Except", len(twists), 4 <= len(twists) <= 6, "4–5 (+ 'but' trong hook)"),
        ("Câu khen", len(praise), 1 <= len(praise) <= 2, "1–2"),
        ("Kết 'Now…' còn lại", round(dur - pay[0]["t0"], 2) if pay else None, bool(pay) and 1.6 <= dur - pay[0]["t0"] <= 3.0, "1,8–2,6 s trước hết"),
        ("Từ thô", rough, 2 <= rough <= 6, "2–5"),
        ("'fucking'", fk, fk <= 1, "≤ 1"),
    ]
    if kieu == "cat":
        chk.append(("Số cắt cứng", len(cuts) - 1, 7 <= len(cuts) - 1 <= 16, "10–14 (kiểu cắt)"))
    rep = {"tap": str(tap), "kieu": kieu, "dur": dur, "words": nw, "wpm": round(wpm, 1),
           "checks": [{"muc": m, "gia_tri": v, "dat": bool(ok), "dich": d} for m, v, ok, d in chk],
           "shots": [{k: s.get(k) for k in ("kind", "ab", "cut", "t_cut", "shot_t0", "shot_t1", "t0", "t1", "text", "hint")} for s in shots]}
    (tap / "moc_shot.json").write_text(json.dumps(rep, ensure_ascii=False, indent=1))
    js = [{"n": j + 1, "t0": s["shot_t0"], "t1": s["shot_t1"], "kind": s["kind"], "ab": s["ab"], "text": s["text"][:60]} for j, s in enumerate(cuts)]
    (tap / "moc_shot.js").write_text("// sinh bởi cong_cu/moc_shot.py — mốc shot theo lời (giây). Không sửa tay; chạy lại khi words.json đổi.\nexport const MOC=" + json.dumps(js, ensure_ascii=False, indent=0) + ";\n")
    eng = tap.resolve().parent.parent / "engine"
    if eng.is_dir():
        (eng / "moc").mkdir(exist_ok=True)
        (eng / "moc" / f"{tap.resolve().name}.js").write_text((tap / "moc_shot.js").read_text())
    (tap / "cues_auto.json").write_text(json.dumps(cues))
    print(f"{tap.name}: {nw} từ, {wpm:.0f} từ/phút, dài {dur} s, kiểu {kieu}, {len(cuts)} shot")
    for j, s in enumerate(cuts):
        print(f"  #{j+1:<2} {s['shot_t0']:5.2f}–{s['shot_t1']:5.2f}  {s['kind']:<6} {s['ab']:<16} {s['text'][:58]}")
    bad = 0
    for m, v, ok, d in chk:
        print(f"  [{'ĐẠT' if ok else 'LỆCH'}] {m}: {v}  (đích {d})"); bad += not ok
    print(f"  cue tự động: {len(cues)} (whoosh/ding/uh_oh) → cues_auto.json; thêm tiếng theo hành động vào cues_tay.json")
    print("KẾT QUẢ:", "ĐẠT công thức" if not bad else f"{bad} mục lệch — sửa lời hoặc ghi lý do trong KICH_BAN.md")


if __name__ == "__main__":
    main()
