#!/bin/bash

# 部署脚本

set -e

echo "🚀 开始部署笔记系统..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 安装依赖（使用 npm ci 确保可重复性）
echo "📦 安装后端依赖..."
npm ci --production

# 生成 Prisma 客户端
echo "🔧 生成 Prisma 客户端..."
npx prisma generate

# 运行数据库迁移
echo "📊 运行数据库迁移..."
npx prisma migrate deploy

# 构建项目
echo "🔨 构建项目..."
npm run build

# 创建日志目录
mkdir -p logs

# 使用 PM2 启动/重载
echo "🚀 启动服务..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "note-system-backend"; then
        pm2 reload ecosystem.config.js
    else
        pm2 start ecosystem.config.js
    fi
    pm2 save
else
    echo "⚠️ PM2 未安装，使用 node 直接启动"
    nohup node dist/main.js > logs/out.log 2> logs/error.log &
fi

echo "✅ 部署完成！"
echo "📚 API 地址: http://localhost:3001/api/v1"
echo "📖 API 文档: http://localhost:3001/api/docs"
