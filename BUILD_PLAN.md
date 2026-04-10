# 自建笔记系统 - 构建计划

> 版本：v2.0  
> 创建日期：2026-04-10  
> 预计总工期：5-7 天  
> 开发模式：AI 辅助开发

---

## 📅 总体排期

| 阶段 | 内容 | 工期 | 交付物 |
|------|------|------|--------|
| **Day 1** | 项目初始化 + 数据库设计 | 1 天 | 可运行的脚手架 + Prisma Schema |
| **Day 2** | 认证模块开发 | 1 天 | 登录/注册/Token 刷新完整功能 |
| **Day 3** | 笔记核心模块开发 | 1 天 | 笔记 CRUD + 版本控制 |
| **Day 4** | 文件夹 + 标签模块 | 1 天 | 文件夹管理 + 标签系统 |
| **Day 5** | 附件模块 + 前端联调 | 1 天 | 文件上传 + 前后端对接 |
| **Day 6** | 测试 + 文档 + 开源准备 | 1 天 | 测试用例 + README + 部署 |

---

## 🎯 Day 1: 项目初始化 + 数据库设计

### 上午：项目脚手架 (2-3 小时)

| 序号 | 任务 | 输出文件 | AI 提示词 |
|------|------|----------|----------|
| 1.1 | 创建项目目录结构 | `note-system/` 根目录 | "创建笔记系统项目目录结构" |
| 1.2 | 初始化后端 NestJS 项目 | `backend/package.json`, `nest-cli.json` | "创建 NestJS + TypeScript 项目配置" |
| 1.3 | 初始化前端 React 项目 | `frontend/package.json`, `vite.config.ts` | "创建 React + Vite + TS + Tailwind 项目" |
| 1.4 | 配置 Git 仓库 | `.gitignore`, `.gitattributes` | "生成 Git 配置文件" |
| 1.5 | 配置开发工具链 | `eslint.config.js`, `prettier.config.js` | "生成 ESLint + Prettier 配置" |

### 下午：数据库设计 (3-4 小时)

| 序号 | 任务 | 输出文件 | AI 提示词 |
|------|------|----------|----------|
| 2.1 | 编写 Prisma Schema | `backend/prisma/schema.prisma` | "根据 ER 图生成 Prisma Schema" |
| 2.2 | 生成数据库迁移文件 | `backend/prisma/migrations/` | "生成 Prisma 迁移脚本" |
| 2.3 | 配置 Docker 数据库服务 | `docker/docker-compose.yml` | "生成 PostgreSQL + Redis Docker 配置" |
| 2.4 | 编写数据库种子脚本 | `backend/prisma/seed.ts` | "生成测试数据种子脚本" |

### 晚上：环境验证 (1-2 小时)

| 序号 | 任务 | 验收标准 |
|------|------|----------|
| 3.1 | 启动 Docker 数据库 | `docker-compose up -d` 成功 |
| 3.2 | 运行数据库迁移 | `npx prisma migrate dev` 成功 |
| 3.3 | 验证后端启动 | `npm run start:dev` 无报错 |
| 3.4 | 验证前端启动 | `npm run dev` 无报错 |

### Day 1 交付清单

- [ ] `note-system/` 项目根目录创建
- [ ] `backend/` NestJS 项目可运行
- [ ] `frontend/` React 项目可运行
- [ ] `docker-compose.yml` 可启动 PostgreSQL + Redis
- [ ] Prisma Schema 完成并迁移成功
- [ ] `.env.example` 环境变量模板

---

## 🎯 Day 2: 认证模块开发

### 上午：后端认证服务 (3-4 小时)

| 序号 | 任务 | 输出文件 | AI 提示词 |
|------|------|----------|----------|
| 1.1 | 创建 Auth 模块骨架 | `backend/src/modules/auth/` | "创建 NestJS Auth 模块结构" |
| 1.2 | 实现用户注册接口 | `auth.service.ts`, `auth.controller.ts` | "实现邮箱密码注册接口" |
| 1.3 | 实现用户登录接口 | 同上 | "实现 JWT 登录接口" |
| 1.4 | 实现双 Token 刷新 | `auth.service.ts` 刷新逻辑 | "实现 Access + Refresh Token 刷新" |
| 1.5 | 实现登出接口 | 同上 | "实现登出 + Token 黑名单" |

### 下午：前端认证 UI (3-4 小时)

| 序号 | 任务 | 输出文件 | AI 提示词 |
|------|------|----------|----------|
| 2.1 | 创建登录页面 | `frontend/src/pages/Login.tsx` | "创建登录页面组件" |
| 2.2 | 创建注册页面 | `frontend/src/pages/Register.tsx` | "创建注册页面组件" |
| 2.3 | 实现表单验证 | `react-hook-form + zod` | "实现登录表单验证" |
| 2.4 | 实现 Token 存储 | `useAuth.ts` Hook | "实现 JWT Token 存储逻辑" |
| 2.5 | 实现路由守卫 | `AuthGuard.tsx` | "实现登录状态路由守卫" |

### 晚上：联调测试 (2-3 小时)

| 序号 | 任务 | 验收标准 |
|------|------|----------|
| 3.1 | 注册流程测试 | 可成功注册新用户 |
| 3.2 | 登录流程测试 | 可成功登录获取 Token |
| 3.3 | Token 刷新测试 | Access Token 过期自动刷新 |
| 3.4 | 路由守卫测试 | 未登录访问受保护页面跳转登录 |

### Day 2 交付清单

- [ ] `POST /api/v1/auth/register` 可用
- [ ] `POST /api/v1/auth/login` 可用
- [ ] `POST /api/v1/auth/refresh` 可用
- [ ] `POST /api/v1/auth/logout` 可用
- [ ] 前端登录/注册页面可交互
- [ ] Token 自动刷新机制工作正常

---

## 🎯 Day 3: 笔记核心模块开发

### 上午：后端笔记服务 (3-4 小时)

| 序号 | 任务 | 输出文件 | AI 提示词 |
|------|------|----------|----------|
| 1.1 | 创建 Note 模块骨架 | `backend/src/modules/note/` | "创建 NestJS Note 模块结构" |
| 1.2 | 实现创建笔记接口 | `note.service.ts`, `note.controller.ts` | "实现创建笔记接口" |
| 1.3 | 实现获取笔记列表 | 同上 | "实现笔记列表 + 分页 + 搜索" |
| 1.4 | 实现获取笔记详情 | 同上 | "实现笔记详情接口" |
| 1.5 | 实现更新笔记接口 | 同上 | "实现笔记更新接口" |
| 1.6 | 实现删除笔记接口 | 同上 | "实现软删除接口" |

### 下午：版本控制 + 前端笔记 UI (4-5 小时)

| 序号 | 任务 | 输出文件 | AI 提示词 |
|------|------|----------|----------|
| 2.1 | 实现版本控制逻辑 | `note.service.ts` 版本管理 | "实现笔记版本控制" |
| 2.2 | 实现历史版本查询 | `note.controller.ts` 版本接口 | "实现历史版本查询接口" |
| 2.3 | 创建笔记列表页 | `frontend/src/pages/NoteList.tsx` | "创建笔记列表页面" |
| 2.4 | 创建笔记编辑器 | `frontend/src/pages/NoteEditor.tsx` | "创建 TipTap 编辑器页面" |
| 2.5 | 实现搜索功能 | `note.service.ts` + 前端搜索框 | "实现笔记全文搜索" |

### 晚上：联调测试 (2 小时)

| 序号 | 任务 | 验收标准 |
|------|------|----------|
| 3.1 | 笔记 CRUD 测试 | 增删改查功能正常 |
| 3.2 | 版本控制测试 | 每次更新生成新版本 |
| 3.3 | 搜索功能测试 | 可按标题/内容搜索 |
| 3.4 | 权限测试 | 只能操作自己的笔记 |

### Day 3 交付清单

- [ ] `GET/POST/PUT/DELETE /api/v1/notes` 可用
- [ ] `GET /api/v1/notes/:id/versions` 可用
- [ ] 前端笔记列表页可展示
- [ ] 前端笔记编辑器可编辑
- [ ] 笔记版本控制功能正常

---

## 🎯 Day 4: 文件夹 + 标签模块

### 上午：文件夹模块 (3-4 小时)

| 序号 | 任务 | 输出文件 | AI 提示词 |
|------|------|----------|----------|
| 1.1 | 创建 Folder 模块 | `backend/src/modules/folder/` | "创建 Folder 模块结构" |
| 1.2 | 实现文件夹 CRUD | `folder.service.ts`, `folder.controller.ts` | "实现文件夹增删改查" |
| 1.3 | 实现嵌套文件夹 | 同上 | "实现文件夹父子层级" |
| 1.4 | 前端文件夹组件 | `frontend/src/components/folder/` | "创建文件夹树形组件" |

### 下午：标签模块 (3-4 小时)

| 序号 | 任务 | 输出文件 | AI 提示词 |
|------|------|----------|----------|
| 2.1 | 创建 Tag 模块 | `backend/src/modules/tag/` | "创建 Tag 模块结构" |
| 2.2 | 实现标签 CRUD | `tag.service.ts`, `tag.controller.ts` | "实现标签增删改查" |
| 2.3 | 实现笔记 - 标签关联 | `note.service.ts` 关联逻辑 | "实现笔记添加/移除标签" |
| 2.4 | 前端标签组件 | `frontend/src/components/tag/` | "创建标签选择器组件" |

### 晚上：联调测试 (2 小时)

| 序号 | 任务 | 验收标准 |
|------|------|----------|
| 3.1 | 文件夹嵌套测试 | 支持多层嵌套 |
| 3.2 | 标签管理测试 | 可创建/编辑/删除标签 |
| 3.3 | 笔记关联测试 | 笔记可添加/移除标签 |
| 3.4 | 筛选功能测试 | 可按文件夹/标签筛选笔记 |

### Day 4 交付清单

- [ ] `GET/POST/PUT/DELETE /api/v1/folders` 可用
- [ ] `GET/POST/DELETE /api/v1/tags` 可用
- [ ] `PUT /api/v1/notes/:id/tags` 可用
- [ ] 前端文件夹树形导航可用
- [ ] 前端标签选择器可用

---

## 🎯 Day 5: 附件模块 + 前端联调

### 上午：附件模块 (3-4 小时)

| 序号 | 任务 | 输出文件 | AI 提示词 |
|------|------|----------|----------|
| 1.1 | 创建 Attachment 模块 | `backend/src/modules/attachment/` | "创建 Attachment 模块结构" |
| 1.2 | 实现文件上传接口 | `attachment.service.ts`, `controller.ts` | "实现 Multer 文件上传" |
| 1.3 | 实现文件下载接口 | 同上 | "实现文件下载接口" |
| 1.4 | 实现文件删除接口 | 同上 | "实现文件删除接口" |
| 1.5 | 文件大小/类型限制 | Multer 配置 | "配置文件上传限制" |

### 下午：前端联调优化 (4-5 小时)

| 序号 | 任务 | 输出文件 | AI 提示词 |
|------|------|----------|----------|
| 2.1 | 实现文件上传组件 | `frontend/src/components/attachment/` | "创建文件上传组件" |
| 2.2 | 实现图片预览 | 同上 | "实现图片预览功能" |
| 2.3 | 全局错误处理 | `ErrorBoundary.tsx` | "实现全局错误边界" |
| 2.4 | 加载状态优化 | `Loading.tsx` | "实现加载状态组件" |
| 2.5 | API 拦截器完善 | `frontend/src/services/api.ts` | "完善 Axios 拦截器" |

### 晚上：全链路测试 (2 小时)

| 序号 | 任务 | 验收标准 |
|------|------|----------|
| 3.1 | 文件上传测试 | 可上传图片/PDF |
| 3.2 | 文件关联测试 | 附件可关联到笔记 |
| 3.3 | 错误处理测试 | 网络错误有友好提示 |
| 3.4 | 性能测试 | 列表加载 < 1s |

### Day 5 交付清单

- [ ] `POST /api/v1/attachments/upload` 可用
- [ ] `GET /api/v1/attachments/:id` 可用
- [ ] `DELETE /api/v1/attachments/:id` 可用
- [ ] 前端文件上传组件可用
- [ ] 全局错误处理完善

---

## 🎯 Day 6: 测试 + 文档 + 开源准备

### 上午：测试用例编写 (3-4 小时)

| 序号 | 任务 | 输出文件 | AI 提示词 |
|------|------|----------|----------|
| 1.1 | 后端单元测试 | `backend/test/` | "生成 Jest 单元测试用例" |
| 1.2 | 后端集成测试 | 同上 | "生成 Supertest 集成测试" |
| 1.3 | 前端单元测试 | `frontend/__tests__/` | "生成 Vitest 测试用例" |
| 1.4 | E2E 测试脚本 | `e2e/` | "生成 Playwright E2E 测试" |

### 下午：文档编写 (3-4 小时)

| 序号 | 任务 | 输出文件 | AI 提示词 |
|------|------|----------|----------|
| 2.1 | 编写 README.md | `README.md` | "生成项目 README 文档" |
| 2.2 | 编写 API 文档 | `docs/api.md` | "生成 Swagger API 文档" |
| 2.3 | 编写部署指南 | `docs/deployment.md` | "生成部署指南" |
| 2.4 | 编写开发指南 | `docs/development.md` | "生成开发指南" |
| 2.5 | 编写 CONTRIBUTING.md | `CONTRIBUTING.md` | "生成贡献指南" |

### 晚上：开源配置 (2-3 小时)

| 序号 | 任务 | 输出文件 | AI 提示词 |
|------|------|----------|----------|
| 3.1 | 配置 GitHub Actions | `.github/workflows/ci.yml` | "生成 CI/CD 工作流" |
| 3.2 | 创建 Issue 模板 | `.github/ISSUE_TEMPLATE/` | "生成 Issue 模板" |
| 3.3 | 创建 PR 模板 | `.github/PULL_REQUEST_TEMPLATE.md` | "生成 PR 模板" |
| 3.4 | 选择开源协议 | `LICENSE` | "生成 MIT License" |
| 3.5 | 配置 Docker 部署 | `docker-compose.prod.yml` | "生成生产环境 Docker 配置" |

### Day 6 交付清单

- [ ] 单元测试覆盖率 > 80%
- [ ] README.md 完整
- [ ] API 文档完整
- [ ] GitHub Actions CI/CD 配置完成
- [ ] LICENSE 选择完成
- [ ] 可一键部署到生产环境

---

## 📦 最终交付物清单

### 代码仓库

```
note-system/
├── backend/              # 后端 NestJS 项目
├── frontend/             # 前端 React 项目
├── docker/               # Docker 配置
├── docs/                 # 文档目录
├── .github/              # GitHub 配置
├── README.md             # 项目说明
├── LICENSE               # 开源协议
└── CONTRIBUTING.md       # 贡献指南
```

### 功能清单

- [x] 用户注册/登录/登出
- [x] JWT 双 Token 认证
- [x] Token 自动刷新
- [x] 笔记 CRUD
- [x] 笔记版本控制
- [x] 笔记全文搜索
- [x] 文件夹管理（支持嵌套）
- [x] 标签管理（支持颜色）
- [x] 附件上传/下载
- [x] 软删除 + 回收站
- [x] 响应式 UI
- [x] 错误边界处理

### 文档清单

- [x] README.md
- [x] ARCHITECTURE.md
- [x] API 文档
- [x] 部署指南
- [x] 开发指南
- [x] 贡献指南

---

## 🚀 快速开始命令

### 开发环境

```bash
# 1. 克隆项目
git clone https://github.com/YOUR_USERNAME/note-system.git
cd note-system

# 2. 启动数据库
cd docker && docker-compose up -d

# 3. 安装后端依赖
cd ../backend && npm install
npx prisma migrate dev
npm run start:dev

# 4. 安装前端依赖
cd ../frontend && npm install
npm run dev
```

### 生产环境

```bash
# 一键部署
docker-compose -f docker-compose.prod.yml up -d
```

---

## ⚠️ 风险提示

| 风险 | 应对措施 |
|------|----------|
| AI 生成代码有 Bug | 每完成一个模块手动审查 + 测试 |
| 数据库设计变更 | 使用 Prisma 迁移，保留历史版本 |
| 前端样式问题 | 使用 Tailwind 原子化 CSS，减少自定义 |
| 文件上传安全 | 严格限制文件类型 + 大小，存储路径隔离 |
| Token 泄露 | HttpOnly Cookie + CORS 严格配置 |

---

## 📞 开发支持

遇到问题时的 AI 提示词模板：

```
"修复这个 NestJS 认证模块的 Bug：[粘贴错误日志]"

"优化这个 React 组件的性能：[粘贴代码]"

"为这个 API 接口添加单元测试：[粘贴代码]"

"生成这个功能的 TypeScript 类型定义：[描述功能]"
```

---

**准备好了吗？开始 Day 1 第一任务！** 🧚‍♀️
