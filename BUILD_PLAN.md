# 构建计划

> **状态**: ✅ 已完成 (v3.0)

本文档记录 Nebula v3.0 架构迁移的构建计划。原计划已全部完成。

---

## ✅ 已完成任务

### Phase 1: 架构迁移

- [x] 移除 NestJS 后端服务
- [x] 移除 PostgreSQL 数据库
- [x] 移除 Redis 缓存
- [x] 移除 JWT 认证系统
- [x] 实现 IndexedDB 本地存储 (Dexie)
- [x] 实现腾讯云 COS 同步服务
- [x] 重构所有服务层为本地优先

### Phase 2: 前端更新

- [x] 更新状态管理 (Zustand)
- [x] 移除认证相关页面
- [x] 简化用户流程
- [x] 优化离线体验

### Phase 3: CI/CD 更新

- [x] 移除后端相关检查
- [x] 更新部署流程为静态托管
- [x] 配置 GitHub Pages 自动部署

### Phase 4: 文档更新

- [x] 重写 README.md
- [x] 重写 ARCHITECTURE.md
- [x] 更新 CHANGELOG.md
- [x] 更新 CONTRIBUTING.md

---

## 新架构概览

```
┌─────────────────────────────────────┐
│         纯前端应用 (React)           │
│                                     │
│  ┌──────────┐    ┌──────────────┐  │
│  │IndexedDB │◄──►│  应用逻辑    │  │
│  │ (Dexie)  │    │  (Zustand)   │  │
│  └────┬─────    └──────────────  │
│       │                             │
│       │ 同步时                      │
│       ▼                             │
│  ┌──────────────┐                  │
│  │  腾讯云 COS  │                  │
│  │  (对象存储)  │                  │
│  └──────────────┘                  │
└─────────────────────────────────────┘
```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式 | TailwindCSS |
| 状态管理 | Zustand |
| 本地存储 | IndexedDB (Dexie) |
| 云存储 | 腾讯云 COS |
| 编辑器 | TipTap |
| 测试 | Vitest + Playwright |

---

## 部署方式

- **开发**: Vite 开发服务器
- **生产**: 静态文件托管 (GitHub Pages/Vercel/Netlify)
- **桌面**: Electron (可选)

---

## 后续计划

查看 [CHANGELOG.md](CHANGELOG.md) 了解未来版本计划。

---

**最后更新**: 2026-05-07
