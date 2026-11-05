---
name: finalize-qa
description: Assemble the delivery (MP4 with burned captions, Kdenlive project checked with melt), run the 21-point QA plus the every-frame black scan, review contact sheets by eye, make the phone preview, and compare against the reference episode. Use after a render or to judge whether a video is ready.
---

Run everything from the RickClips repo (`repo_dir` in `~/.rickclips/config.json`, through its `run_prefix`); no config → skill `setup`.
# Finalize + QA

```bash
bash tools/ep/finalize.sh <EP>      # assemble → Kdenlive (+melt check) → qa.sh
bash tools/ep/sheets.sh <EP>        # 4 fps contact sheets → ~/rc_work/<EP>/review/sheet_NN.jpg
bash tools/ep/preview.sh <EP>       # ~17 MB phone preview
python3 -I tools/ep/compare_ref.py ~/rc_work/<EP> assets/reference/<EP>    # only for episodes with a reference (T015)
```
Outputs: `~/rc_work/<EP>/deliver/<NAME>.mp4` (+ `media/`, `<NAME>.kdenlive`), `~/rc_work/<EP>/<NAME>_kdenlive.zip`, `qa_out/qa_report.json`.

Ready = all of:
1. QA `→ 21/21 đạt` (table in CLAUDE.md). The Vietnamese labels: ĐẠT = pass, KHÔNG = fail.
2. `flat-frame scan: … flat none`.
3. `melt check: dur = DUR, I: −14.0 LUFS`.
4. `video: … pix_fmt=yuv420p|color_range=tv|color_space=bt709`.
5. Every contact sheet reviewed: no floating/unheld props, no clipped sign/label/effect, water & streams present when narrated,
   labels not over objects, no 1-frame flashes, captions readable.

Failure → fix:
- detail < 0.86: look at `qa_out/detail_by_time.txt`; whip-pan seconds are expected low; static soft shots → more texture/props in flat areas.
  Don't raise unsharp beyond the two passes in `assemble.sh` (0.7+ gives halos).
- caption height: skill `audio-captions`.
- black frames: `bash tools/ep/render.sh <EP> "" "<i>-<i>"`, then finalize again.
- visual bug: skill `shots`, stills, partial re-render, finalize, sheets again — re-check the whole video, fixes can break other shots.
Report honestly what failed and what was only measured, not seen.
