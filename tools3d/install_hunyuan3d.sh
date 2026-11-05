#!/bin/bash
# GPU ONLY. Hunyuan3D-2 (shape + texture) on Ubuntu/WSL with an NVIDIA GPU (tested: WSL Ubuntu 26.04, RTX 3060 12 GB, driver from Windows).
#   bash tools3d/install_hunyuan3d.sh          log: $H3D/install.log   (H3D defaults to ~/h3d; venv ~7.6 GB + HF models ~10 GB)
# Native Linux: install the NVIDIA driver first; the CUDA repo below is the WSL one — use the ubuntu2404 repo on bare metal.
# TORCH_CUDA_ARCH_LIST: 8.6 = RTX 30xx; set 8.9 for RTX 40xx, 12.0 for RTX 50xx.
set -e; H=${H3D:-$HOME/h3d}; mkdir -p $H; exec > >(tee -a $H/install.log) 2>&1
export DEBIAN_FRONTEND=noninteractive; cd $H; SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO=sudo
step(){ echo; echo "=== $(date +%T) $*"; }
step "apt base"
$SUDO apt-get install -y -qq git-lfs libgl1 libglib2.0-0 ninja-build wget gcc-14 g++-14 >/dev/null
step "CUDA toolkit 12.8 (nvcc for the texture extensions)"
if [ ! -x /usr/local/cuda-12.8/bin/nvcc ]; then
  REPO=${CUDA_REPO:-wsl-ubuntu}
  wget -q https://developer.download.nvidia.com/compute/cuda/repos/$REPO/x86_64/cuda-keyring_1.1-1_all.deb -O /tmp/cuda-keyring.deb
  $SUDO dpkg -i /tmp/cuda-keyring.deb >/dev/null; $SUDO apt-get update -qq; $SUDO apt-get install -y -qq cuda-toolkit-12-8 >/dev/null
fi
export CUDA_HOME=/usr/local/cuda-12.8 PATH=/usr/local/cuda-12.8/bin:$PATH CC=gcc-14 CXX=g++-14 NVCC_CCBIN=g++-14 TORCH_CUDA_ARCH_LIST=${TORCH_CUDA_ARCH_LIST:-8.6}
nvcc --version | tail -1
step "uv + Python 3.10 venv"
command -v uv >/dev/null || { curl -LsSf https://astral.sh/uv/install.sh | sh; }; export PATH=$HOME/.local/bin:$PATH
[ -d $H/venv ] || uv venv $H/venv -p 3.10; source $H/venv/bin/activate
step "PyTorch 2.7.1 cu128"
uv pip install -q torch==2.7.1 torchvision==0.22.1 --index-url https://download.pytorch.org/whl/cu128
python -c "import torch;print('torch',torch.__version__,'cuda',torch.cuda.is_available(),torch.cuda.get_device_name(0))"
step "repo + requirements (+ pins: newer transformers break the DINOv2 checkpoint layout → state_dict error)"
[ -d $H/repo ] || git clone -q --depth 1 https://github.com/Tencent-Hunyuan/Hunyuan3D-2 $H/repo
cd $H/repo; uv pip install -q -r requirements.txt; uv pip install -q -e . ; uv pip install -q setuptools wheel pybind11
uv pip install -q "transformers==4.48.3" "diffusers==0.32.2" "huggingface_hub==0.27.1" "accelerate==1.3.0"
step "texture extensions (custom_rasterizer, differentiable_renderer)"
if ! (cd hy3dgen/texgen/custom_rasterizer && python setup.py install >/tmp/cr.log 2>&1); then
  echo "custom_rasterizer failed — on glibc ≥ 2.41 run: bash $(dirname "$0")/fix_cuda_glibc.sh"; grep -iE " error" /tmp/cr.log | head; exit 1; fi
(cd hy3dgen/texgen/differentiable_renderer && python setup.py install >/tmp/dr.log 2>&1) || { tail -30 /tmp/dr.log; exit 1; }
step "DONE"
