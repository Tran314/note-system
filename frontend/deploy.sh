#!/bin/bash

# 前端部署脚本

set -e

echo "🚀 开始部署前端..."

cd /root/.openclaw/workspace/projects/note-system/frontend

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 部署到静态服务器（示例）
# 可以使用 nginx、vercel、netlify 等
echo "📁 构建产物位于 dist/ 目录"
echo ""
echo "部署选项："
echo "  1. Nginx: 将 dist/ 目录复制到网站根目录"
echo "  2. Vercel: vercel --prod"
echo "  3. Netlify: netlify deploy --prod --dir=dist"
echo ""
echo "✅ 构建完成！"