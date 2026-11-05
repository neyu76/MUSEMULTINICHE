---
name: render
description: Render an episode's delivery frames (1080×1920, 30 fps, SS=2, CPU/SwiftShader) in parallel workers, detached, resumable; re-render only the frame ranges a fix touched; drop black/broken frames. Use for any full or partial render.
---

Run everything from the RickClips repo (`repo_dir` in `~/.rickclips/config.json`, through its `run_prefix`); no config → skill `setup`.
# Render

Full render (detached — survives terminal/agent timeouts):
```bash
setsid nohup bash tools/ep/render.sh <EP> > ~/rc_work/<EP>/logs/render.out 2>&1 &
tail -3 ~/rc_work/<EP>/logs/render.out; ls ~/rc_work/<EP>/frames | wc -l      # progress
```
Partial re-render after a fix (frame index = round(t × 30); include dissolves on both sides of a changed segment):
```bash
setsid nohup bash tools/ep/render.sh <EP> "" "300-580 765-905" > ~/rc_work/<EP>/logs/render.out 2>&1 &
```
- Workers default to min(threads/2, RAM_GB/2.5). ~42 s/frame/worker on an i7-12700K → T015 (1392 frames) ≈ 100 min with 10 workers;
  930 frames ≈ 65 min; 280 frames ≈ 20 min.
- Missing frames are split evenly across workers; up to 3 passes; `drop_bad_frames.py` removes unreadable, wrong-size and all-black frames
  before each pass and at the end.
- Changing resolution? empty `frames/` first (render.js skips files that exist).
- Never run another heavy job beside a render; never `pkill -f` a pattern that matches your own shell.
- Do not wait in a sleep loop longer than your tool timeout; poll the frame count every few minutes.
When it prints `frames: N / N` → skill `finalize-qa`.
