---
name: prop-3d
description: GPU ONLY — turn a reference image into a textured GLB prop with Hunyuan3D-2 (shape mini-turbo + paint turbo) and load it into an episode. Use only on a machine with an NVIDIA GPU (tested 12 GB; peak use 6.7 GB); on CPU-only machines reuse existing GLBs or build the prop from primitives.
---

Run everything from the RickClips repo (`repo_dir` in `~/.rickclips/config.json`, through its `run_prefix`); no config → skill `setup`.
# 3D prop (GPU)

Check first: `bash tools3d/check_gpu.sh` (needs `nvidia-smi`). No NVIDIA GPU → stop; options: reuse `episodes/T015/art/jug.glb`,
primitives (Lathe/Box in the set file), or a CC0 model (Poly Haven, Kenney) as GLB.

Install once (venv ~7.6 GB + CUDA toolkit + ~25 GB models on first generation): `bash tools3d/install_hunyuan3d.sh` (WSL CUDA repo by default; bare-metal Ubuntu:
`CUDA_REPO=ubuntu2404`; set `TORCH_CUDA_ARCH_LIST` for your card). glibc ≥ 2.41 build error → `bash tools3d/fix_cuda_glibc.sh`.

Generate:
1. Reference image: one object, plain light background, 3/4 view, no cast shadow (T015: Nano Banana 2.1 → `episodes/T015/art/jug_ref.png`).
2. `bash tools3d/run_gen.sh episodes/<EP>/art/<prop>_ref.png episodes/<EP>/art/<prop>.glb --faces 30000` (T015 jug: 617 s on an RTX 3060 12 GB, peak VRAM 6.7 GB with CPU offload; first run fills ~25 GB of HuggingFace cache).
3. Load in the set file like T015's jug (`taverna.js`): `GLTFLoader` inside `TEXLOAD`, scale to real size, put the grip at the origin,
   find the spout/contact point from real mesh vertices (a bounding-box corner floats off the model), add emissive = map × 0.22 so the
   texture survives the toon lighting. Copy the GLB into `mg/` from the episode's `prepare_mg.sh`.
4. Meshes come out solid: for insides use `cutaway.js` (`sectionCut`, `xray`, `strata`), not a hollow model.
