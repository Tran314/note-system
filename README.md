# 🌌 Nebula

> 一个现代化、轻量级的笔记管理系统
> 基于 React + Tencent COS 构建

**Nebula** - 意为星云，象征思维如星云般凝聚成形

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)

---

## ✨ 特性亮点

### 🔐 安全可靠
- **JWT 认证** - Access Token + Refresh Token 机制
- **密码加密** - bcrypt 哈希存储
- **COS 签名上传** - 安全的文件上传机制

### 📝 笔记功能
- **富文本编辑** - 基于 TipTap，支持 Markdown
- **自动保存** - 2秒防抖自动保存
- **版本历史** - 自动记录修改历史
- **文件夹管理** - 无限层级嵌套
- **标签系统** - 彩色标签分类
- **附件上传** - 图片、PDF 等文件（存储于 Tencent COS）

### 🖥️ 多平台支持
- **Web 应用** - 响应式设计，支持移动端
- **桌面应用** - Electron 封装，Windows/macOS/Linux
- **离线使用** - 桌面版支持离线编辑

### ⚡ 性能优化
- **代码分割** - 按需加载，减少首屏时间
- **虚拟滚动** - 大量笔记流畅滚动
- **防抖节流** - 优化搜索和保存

### 🎨 用户体验
- **暗色主题** - 支持亮色/暗色切换
- **快捷键** - 丰富的键盘快捷键
- **拖拽排序** - 文件夹和笔记拖拽
- **自动更新** - 桌面版自动检查更新

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/nebula.git
cd nebula

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填写 Tencent COS 配置
```

### 开发模式

```bash
# 启动前端开发服务器
npm run dev  # http://localhost:3000
```

### 生产构建

```bash
npm run build
npm run preview
```

---

## 📁 项目结构

```
note-system/
├── 📁 frontend/             # 前端应用 (React)
│   ├── src/
│   │   ├── components/     # 组件
│   │   │   ├── common/     # 通用组件
│   │   │   ├── layout/     # 布局组件
│   │   │   ├── note/       # 笔记组件
│   │   │   └── folder/     # 文件夹组件
│   │   ├── pages/          # 页面
│   │   ├── store/          # 状态管理
│   │   ├── services/       # API 服务
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── utils/          # 工具函数
│   │   └── styles/         # 样式文件
│   ├── e2e/                # E2E 测试
│   └── Dockerfile
│
├── 📁 desktop/              # 桌面应用 (Electron)
│   ├── src/
│   │   ├── main.ts         # 主进程
│   │   └── preload.ts      # 预加载脚本
│   └── build/              # 构建资源
│
├── 📁 .github/              # GitHub 配置
│   └── workflows/          # CI/CD 工作流
│
├── 📄 package.json          # 根项目配置
├── 📄 ARCHITECTURE.md       # 架构文档
└── 📄 README.md             # 本文件
```

---

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建**: Vite 5
- **样式**: TailwindCSS
- **状态**: Zustand
- **编辑器**: TipTap (ProseMirror)
- **表单**: React Hook Form + Zod
- **测试**: Vitest + React Testing Library + Playwright

### 存储
- **对象存储**: Tencent COS (文件、图片、附件)

### 桌面端
- **框架**: Electron 28
- **打包**: electron-builder
- **更新**: electron-updater
- **存储**: electron-store

---

## 📚 文档

- [架构设计](ARCHITECTURE.md) - 系统架构和技术选型

---

## 🧪 测试

```bash
# 前端单元测试
cd frontend && npm test

# E2E 测试
cd frontend && npm run test:e2e
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

[MIT](LICENSE) © 2024 Note System Contributors
