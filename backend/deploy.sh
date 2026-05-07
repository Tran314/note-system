#!/bin/bash

# 部署脚本

set -e

echo "🚀 开始部署笔记系统..."

# 进入后端目录
cd /root/.openclaw/workspace/projects/note-system/backend

# 安装依赖
echo "📦 安装后端依赖..."
npm install --production

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

# 使用 PM2 启动
echo "🚀 启动服务..."
if command -v pm2 &> /dev/null; then
    pm2 start ecosystem.config.js
    pm2 save
else
    echo "⚠️ PM2 未安装，使用 node 直接启动"
    nohup node dist/main.js > logs/out.log 2> logs/error.log &
fi

echo "✅ 部署完成！"
echo "📚 API 地址: http://localhost:3001/api/v1"
echo "📖 API 文档: http://localhost:3001/api/docs"