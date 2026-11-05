#!/bin/bash
nvidia-smi --query-gpu=name,memory.total,memory.used,driver_version --format=csv,noheader 2>&1 | head -2
nvidia-smi | grep -i "cuda version"
command -v nvcc && nvcc --version | tail -1
command -v git || echo "no git"; command -v uv || echo "no uv"
df -h / | tail -1
