#!/bin/bash
# GPU ONLY (NVIDIA; tested on RTX 3060 12 GB). Image → textured GLB prop with Hunyuan3D-2.
#   bash tools3d/run_gen.sh <image.png> <out.glb> [--faces 30000] [--no-texture] [--seed 1234]
# Install first: bash tools3d/install_hunyuan3d.sh (then fix_cuda_glibc.sh if the texture extensions fail to build on glibc ≥ 2.41).
# Log: $H3D/gen.log. T015 jug: art/jug_ref.png (Nano Banana 2.1) → jug.glb in 617 s, peak VRAM 6.7 GB (paint model CPU-offloaded);
# first run downloads the models (~25 GB HuggingFace cache).
H3D=${H3D:-$HOME/h3d}; T=$(cd "$(dirname "$0")" && pwd)
export PATH=/usr/local/cuda-12.8/bin:$PATH HF_HUB_DISABLE_TELEMETRY=1
source $H3D/venv/bin/activate; cd $H3D/repo
python "$T/gen_prop.py" "$@" 2>&1 | tee $H3D/gen.log
