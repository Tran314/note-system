# 更新日志

所有重要的更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [3.0.0] - 2026-05-07

### 🚀 重大变更

**架构迁移：从后端+数据库到纯前端本地优先架构**

#### 移除
- **后端服务** - 完全移除 NestJS 服务器
- **数据库** - 移除 PostgreSQL + Prisma
- **缓存** - 移除 Redis
- **认证系统** - 移除 JWT、bcrypt、Passport.js
- **Docker/K8s** - 移除容器化部署配置

#### 新增
- **本地存储** - IndexedDB (Dexie) 作为主存储
- **云端同步** - 腾讯云 COS 对象存储
- **离线支持** - 无需网络即可使用全部功能
- **同步服务** - 按需同步到云端

#### 变更
- **认证** - 从 JWT 认证改为本地匿名使用
- **部署** - 从 Docker 改为静态文件托管
- **CI/CD** - 移除后端相关检查，简化为前端构建

### 📦 技术栈变更

| 组件 | v2.0 | v3.0 |
|------|------|------|
| 后端 | NestJS 10 | 移除 |
| 数据库 | PostgreSQL 16 | IndexedDB (Dexie) |
| 缓存 | Redis 7 | 内存缓存 |
| 认证 | JWT + bcrypt | 无 |
| 云存储 | 本地文件 | 腾讯云 COS |
| 部署 | Docker + K8s | 静态托管 |

### 📝 文档更新
- **README.md** - 完全重写，反映新架构
- **ARCHITECTURE.md** - 更新架构图和技术栈
- **CONTRIBUTING.md** - 更新贡献指南

---

## [2.0.0] - 2024-04-10

### ✨ 新增

#### 后端 (NestJS)
- **认证模块** - JWT 双 Token 认证（Access + Refresh）
- **用户模块** - 个人资料、密码修改、设置
- **笔记模块** - CRUD、版本控制、搜索、回收站
- **文件夹模块** - 无限层级嵌套
- **标签模块** - 彩色标签、笔记关联
- **附件模块** - 文件上传、下载、删除
- **健康检查** - `/api/v1/health` 端点

#### 前端 (React)
- **登录/注册页面** - 表单验证、错误提示
- **笔记列表** - 搜索、筛选、列表/网格视图
- **笔记编辑器** - TipTap 富文本、自动保存、图片粘贴
- **设置页面** - 个人资料、密码修改、主题切换
- **暗色主题** - 完整暗色模式支持
- **键盘快捷键** - Ctrl+S/B/I/K 等

#### 桌面端 (Electron)
- **跨平台支持** - Windows、macOS、Linux
- **自动更新** - electron-updater 集成
- **本地存储** - electron-store
- **内嵌后端** - 离线可用

#### DevOps
- **Docker 支持** - docker-compose 生产/开发配置
- **CI/CD** - GitHub Actions 完整流水线
- **Kubernetes** - K8s 部署配置
- **部署脚本** - 自动部署、回滚脚本

#### 文档
- **架构文档** - ARCHITECTURE.md
- **构建计划** - BUILD_PLAN.md
- **贡献指南** - CONTRIBUTING.md

### 🔧 技术栈

**后端:**
- NestJS 10
- PostgreSQL 16 + Prisma
- Redis 7
- JWT + Passport

**前端:**
- React 18
- TypeScript
- Vite 5
- TailwindCSS
- TipTap
- Zustand

**桌面端:**
- Electron 28
- electron-builder
- electron-updater

### 📊 统计

- 总文件: ~300 个
- TypeScript 文件: 148 个
- 代码行数: ~28,000+
- 测试文件: 7 个

---

## [1.0.0] - 2024-04-10

### 初始版本

- 基础笔记 CRUD 功能
- 简单用户认证
- 本地文件存储

---

## 计划中的功能

### [3.1.0] - 计划中

- 多设备同步
- 笔记分享链接
- 协作编辑
- 移动端 PWA

### [3.2.0] - 计划中

- 笔记导出 (PDF/Markdown)
- 批量操作
- 高级搜索
- 插件系统

---

## 版本说明

- **主版本号**: 不兼容的 API 更改
- **次版本号**: 向后兼容的功能新增
- **修订号**: 向后兼容的问题修正

---

[3.0.0]: https://github.com/Tran314/note-system/releases/tag/v3.0.0
[2.0.0]: https://github.com/Tran314/note-system/releases/tag/v2.0.0
[1.0.0]: https://github.com/Tran314/note-system/releases/tag/v1.0.0