#!/bin/bash

# Nebula 桌面版启动脚本（性能优化版）

# 设置 Node.js 优化参数
export UV_THREADPOOL_SIZE=4
export NODE_OPTIONS="--max-old-space-size=4096 --enable-gc"

# 启动应用
electron . --enable-features=VaapiVideoDecoderLib --disable-gpu-sandbox