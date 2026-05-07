# 🌌 Nebula

> 一个本地优先、离线可用的现代化笔记管理系统
> 数据存储在浏览器 IndexedDB，支持腾讯云 COS 云端同步

**Nebula** - 意为星云，象征思维如星云般凝聚成形

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)
![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB-orange.svg)

---

## ✨ 核心特性

### 📱 本地优先
- **离线可用** - 无需网络即可使用全部功能
- **即时响应** - 所有操作在本地 IndexedDB 完成，无网络延迟
- **隐私安全** - 数据存储在本地浏览器，不上传服务器

### ☁️ 云端同步
- **按需同步** - 手动触发同步到腾讯云 COS
- **数据备份** - 云端存储作为本地数据的备份
- **多设备** - 支持多设备间数据同步（开发中）

### 📝 笔记功能
- **富文本编辑** - 基于 TipTap，支持 Markdown
- **自动保存** - 本地自动保存，无需网络
- **版本历史** - 自动记录修改历史
- **全文搜索** - IndexedDB 本地高性能搜索
- **文件夹管理** - 无限层级嵌套
- **标签系统** - 彩色标签分类

### 🎨 用户体验
- **暗色主题** - 优雅的深色界面设计
- **快捷键** - 丰富的键盘快捷键支持
- **响应式设计** - 支持桌面和移动端

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- 现代浏览器（支持 IndexedDB）

### 安装

```bash
# 克隆仓库
git clone https://github.com/Tran314/note-system.git
cd note-system

# 安装依赖
cd frontend
npm install

# 配置环境变量（可选，用于 COS 同步）
cp .env.example .env.local
# 编辑 .env.local 填入腾讯云 COS 配置
```

### 开发模式

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

## 📁 项目结构

```
note-system/
├──  frontend/              # 前端应用 (React)
│   ├── src/
│   │   ├── components/       # UI 组件
│   │   │   ├── common/       # 通用组件
│   │   │   ├── layout/       # 布局组件
│   │   │   └── note/         # 笔记组件
│   │   ├── pages/            # 页面组件
│   │   ├── store/            # Zustand 状态管理
│   │   ├── services/         # 服务层
│   │   │   ├── local-db.service.ts   # IndexedDB 操作
│   │   │   ├── sync.service.ts       # COS 同步服务
│   │   │   ├── note.service.ts       # 笔记服务
│   │   │   ├── folder.service.ts     # 文件夹服务
│   │   │   └── tag.service.ts        # 标签服务
│   │   ├── hooks/            # 自定义 Hooks
│   │   ├── utils/            # 工具函数
│   │   └── styles/           # 样式文件
│   ├── public/               # 静态资源
│   └── package.json
│
├── 📁 scripts/               # 工具脚本
│   └── migrate-postgres-to-cos.ts  # 数据迁移脚本
│
├──  .github/               # GitHub 配置
│   └── workflows/            # CI/CD 工作流
│
├── 📄 ARCHITECTURE.md        # 架构文档
├── 📄 CHANGELOG.md           # 更新日志
└── 📄 README.md              # 本文件
```

---

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建**: Vite 5
- **样式**: TailwindCSS
- **状态管理**: Zustand
- **本地存储**: IndexedDB (Dexie)
- **编辑器**: TipTap (ProseMirror)
- **表单**: React Hook Form + Zod

### 云存储
- **对象存储**: 腾讯云 COS
- **SDK**: cos-js-sdk-v5

### 测试
- **单元测试**: Vitest + React Testing Library
- **E2E 测试**: Playwright

### DevOps
- **CI/CD**: GitHub Actions
- **代码质量**: CodeQL, SonarCloud
- **部署**: GitHub Pages

---

## 📚 文档

- [架构设计](ARCHITECTURE.md) - 系统架构和技术选型
- [更新日志](CHANGELOG.md) - 版本更新历史
- [贡献指南](CONTRIBUTING.md) - 如何贡献代码

---

## 🧪 测试

```bash
# 运行单元测试
npm test

# 运行 E2E 测试
npm run test:e2e

# 测试覆盖率
npm run test:coverage
```

---

## 🚀 部署

### GitHub Pages

项目配置了自动部署到 GitHub Pages，推送 main 分支后自动构建部署。

### 静态托管

构建后的 `frontend/dist` 目录可部署到任何静态托管服务：
- Vercel
- Netlify
- Cloudflare Pages
- 腾讯云静态网站托管

---

## 🔄 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新历史。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解贡献指南。

---

## 📄 许可证

[MIT](LICENSE) © 2024-2026 Nebula Contributors
