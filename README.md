# 📝 自建笔记系统 v2.0

> 一个现代化、安全、可扩展的笔记管理系统
> 支持 Web、桌面端（Electron）多平台

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![NestJS](https://img.shields.io/badge/NestJS-10.x-e0234e.svg)
![Electron](https://img.shields.io/badge/Electron-28.x-47848F.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-336791.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)

---

## ✨ 特性亮点

### 🔐 安全可靠
- **双重验证架构** - 前端强验证 + 后端二次校验
- **JWT 双 Token** - Access Token + Refresh Token 机制
- **密码加密** - bcrypt 哈希存储
- **请求限流** - 防止暴力破解

### 📝 笔记功能
- **富文本编辑** - 基于 TipTap，支持 Markdown
- **自动保存** - 2秒防抖自动保存
- **版本历史** - 自动记录修改历史
- **全文搜索** - PostgreSQL 高性能搜索
- **文件夹管理** - 无限层级嵌套
- **标签系统** - 彩色标签分类
- **附件上传** - 图片、PDF 等文件

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
- PostgreSQL >= 15
- Redis >= 7

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/note-system.git
cd note-system

# 安装所有依赖
npm run install:all

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 数据库迁移
cd backend && npx prisma migrate dev
```

### 开发模式

```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:backend   # http://localhost:3001
npm run dev:frontend  # http://localhost:3000
```

### 桌面版开发

```bash
# 先启动后端
npm run dev:backend

# 再启动桌面版
npm run dev:desktop
```

### 生产部署

```bash
# Docker 部署
docker-compose up -d

# 或手动部署
npm run build
npm run start:prod
```

---

## 📁 项目结构

```
note-system/
├── 📁 backend/              # 后端服务 (NestJS)
│   ├── src/
│   │   ├── modules/        # 业务模块
│   │   │   ├── auth/       # 认证模块
│   │   │   ├── user/       # 用户模块
│   │   │   ├── note/       # 笔记模块
│   │   │   ├── folder/     # 文件夹模块
│   │   │   ├── tag/        # 标签模块
│   │   │   └── attachment/ # 附件模块
│   │   ├── common/         # 公共组件
│   │   ├── database/       # 数据库配置
│   │   └── main.ts         # 入口文件
│   ├── prisma/
│   │   └── schema.prisma   # 数据库模型
│   ├── test/               # 测试文件
│   └── Dockerfile
│
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
├── 📁 docker/               # Docker 配置
│   └── docker-compose.yml
│
├── 📄 package.json          # 根项目配置
├── 📄 docker-compose.yml    # 生产环境编排
├── 📄 docker-compose.dev.yml # 开发环境编排
├── 📄 kubernetes.yml        # K8s 部署配置
├── 📄 deploy.sh             # 部署脚本
├── 📄 rollback.sh           # 回滚脚本
├── 📄 ARCHITECTURE.md       # 架构文档
├── 📄 BUILD_PLAN.md         # 构建计划
└── 📄 README.md             # 本文件
```

---

## 🛠️ 技术栈

### 后端
- **框架**: NestJS 10
- **数据库**: PostgreSQL 16 + Prisma ORM
- **缓存**: Redis 7
- **认证**: JWT (Passport.js)
- **文档**: Swagger/OpenAPI
- **测试**: Jest + Supertest

### 前端
- **框架**: React 18 + TypeScript
- **构建**: Vite 5
- **样式**: TailwindCSS
- **状态**: Zustand
- **编辑器**: TipTap (ProseMirror)
- **表单**: React Hook Form + Zod
- **测试**: Vitest + React Testing Library + Playwright

### 桌面端
- **框架**: Electron 28
- **打包**: electron-builder
- **更新**: electron-updater
- **存储**: electron-store

### DevOps
- **CI/CD**: GitHub Actions
- **容器**: Docker + Docker Compose
- **编排**: Kubernetes
- **监控**: 健康检查端点

---

## 📚 文档

- [架构设计](ARCHITECTURE.md) - 系统架构和技术选型
- [构建计划](BUILD_PLAN.md) - 详细的开发计划
- [API 文档](http://localhost:3001/api/docs) - Swagger UI (开发环境)
- [桌面版文档](desktop/README.md) - Electron 桌面版说明

---

## 🧪 测试

```bash
# 运行所有测试
npm test

# 后端测试
npm run test:backend

# 前端单元测试
npm run test:frontend

# E2E 测试
npm run test:e2e

# 测试覆盖率
npm run test:coverage
```

---

## 🚀 部署

### Docker Compose (推荐)

```bash
# 生产环境
docker-compose up -d

# 开发环境
docker-compose -f docker-compose.dev.yml up -d
```

### Kubernetes

```bash
kubectl apply -f kubernetes.yml
```

### 手动部署

```bash
# 使用部署脚本
./deploy.sh production
```

---

## 🔄 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新历史。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解贡献指南。

---

## 📄 许可证

[MIT](LICENSE) © 2024 Note System Contributors