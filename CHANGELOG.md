# 更新日志

所有重要的更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [1.0.0] - 2024-04-10

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

## 计划中的功能

### [1.1.0] - 计划中

- 文件夹拖拽排序
- 笔记导出 (PDF/Markdown)
- 国际化 (i18n)
- PWA 离线支持

### [1.2.0] - 计划中

- 协作编辑
- 笔记分享
- 移动端适配
- 浏览器扩展

---

## 版本说明

- **主版本号**: 不兼容的 API 更改
- **次版本号**: 向后兼容的功能新增
- **修订号**: 向后兼容的问题修正

---

[1.0.0]: https://github.com/your-username/nebula/releases/tag/v1.0.0