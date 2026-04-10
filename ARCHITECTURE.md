# 自建笔记系统 - 项目架构文档

> 版本：v1.0  
> 创建日期：2026-04-10  
> 状态：待完善

---

## 📐 系统架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户层                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Web 端     │  │  移动端 H5   │  │  PWA 离线   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      前端层 (React)                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  强验证模块                                              │    │
│  │  • Token 校验  • 权限预判  • 防重复提交  • 输入验证       │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  笔记编辑器  │  │  笔记列表   │  │  用户中心   │              │
│  │  (TipTap)   │  │  (搜索/筛选) │  │  (设置)     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  本地缓存层 (IndexedDB + LocalStorage)                   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/HTTPS (JWT Auth)
┌─────────────────────────────────────────────────────────────────┐
│                      后端层 (Node.js)                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  API Gateway / 路由层                                     │    │
│  │  • 请求分发  • 限流  • CORS  • 日志记录                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  中间件层                                                │    │
│  │  • JWT 验证  • 权限控制  • 输入清洗  • XSS/CSRF 防护      │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  认证服务   │  │  笔记服务   │  │  用户服务   │              │
│  │  (Auth)     │  │  (Note)     │  │  (User)     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  数据访问层 (Repository Pattern)                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      数据层                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  SQLite     │  │  Redis      │  │  文件系统   │              │
│  │  (主数据库)  │  │  (缓存)     │  │  (附件)     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 技术栈选型

### 前端技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **框架** | React | 18.x | 组件化开发 |
| **语言** | TypeScript | 5.x | 类型安全 |
| **构建工具** | Vite | 5.x | 快速开发服务器 |
| **状态管理** | Zustand | 4.x | 轻量级状态管理 |
| **路由** | React Router | 6.x | 客户端路由 |
| **UI 框架** | TailwindCSS | 3.x | 原子化 CSS |
| **编辑器** | TipTap | 2.x | 富文本编辑器 |
| **HTTP 客户端** | Axios | 1.x | API 请求 |
| **本地存储** | Dexie.js | 4.x | IndexedDB 封装 |
| **测试** | Vitest + RTL | - | 单元测试 |

### 后端技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **框架** | NestJS | 10.x | 企业级 Node.js 框架 |
| **语言** | TypeScript | 5.x | 类型安全 |
| **数据库 ORM** | Prisma | 5.x | 类型安全 ORM |
| **数据库** | SQLite | 3.x | 轻量级数据库 |
| **缓存** | Redis | 7.x | 会话/热点数据缓存 |
| **认证** | JWT | - | Token 认证 |
| **验证** | class-validator | - | 输入验证 |
| **API 文档** | Swagger/OpenAPI | - | 自动生成文档 |
| **测试** | Jest + Supertest | - | 单元/集成测试 |

### 开发工具链

| 类别 | 工具 | 说明 |
|------|------|------|
| **代码规范** | ESLint + Prettier | 代码质量 |
| **Git Hooks** | Husky + lint-staged | 提交前检查 |
| **CI/CD** | GitHub Actions | 自动化测试/部署 |
| **容器化** | Docker + Docker Compose | 环境一致性 |
| **监控** | Sentry | 错误追踪 |

---

## 📁 项目目录结构

```
note-system/
├── frontend/                          # 前端项目
│   ├── public/                        # 静态资源
│   ├── src/
│   │   ├── components/                # 可复用组件
│   │   │   ├── common/                # 通用组件 (Button, Input...)
│   │   │   ├── layout/                # 布局组件 (Header, Sidebar...)
│   │   │   └── note/                  # 笔记相关组件
│   │   ├── pages/                     # 页面组件
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── NoteList.tsx
│   │   │   ├── NoteEditor.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/                     # 自定义 Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useNote.ts
│   │   │   └── useLocalStorage.ts
│   │   ├── services/                  # API 服务层
│   │   │   ├── api.ts                 # Axios 实例配置
│   │   │   ├── auth.service.ts
│   │   │   └── note.service.ts
│   │   ├── store/                     # 状态管理
│   │   │   ├── auth.store.ts
│   │   │   └── note.store.ts
│   │   ├── utils/                     # 工具函数
│   │   │   ├── validator.ts           # 前端验证逻辑
│   │   │   ├── crypto.ts              # 加密工具
│   │   │   └── format.ts
│   │   ├── types/                     # TypeScript 类型定义
│   │   │   ├── api.types.ts
│   │   │   └── note.types.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── __tests__/                     # 测试文件
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                           # 后端项目
│   ├── src/
│   │   ├── main.ts                    # 入口文件
│   │   ├── app.module.ts              # 根模块
│   │   ├── common/                    # 公共模块
│   │   │   ├── decorators/            # 自定义装饰器
│   │   │   ├── filters/               # 异常过滤器
│   │   │   ├── guards/                # 守卫 (权限/认证)
│   │   │   ├── interceptors/          # 拦截器
│   │   │   └── pipes/                 # 管道 (验证)
│   │   ├── modules/                   # 业务模块
│   │   │   ├── auth/                  # 认证模块
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── dto/               # 数据传输对象
│   │   │   │   └── strategies/        # JWT 策略
│   │   │   ├── user/                  # 用户模块
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   └── user.module.ts
│   │   │   └── note/                  # 笔记模块
│   │   │       ├── note.controller.ts
│   │   │       ├── note.service.ts
│   │   │       ├── note.module.ts
│   │   │       ├── dto/
│   │   │       └── entities/          # 数据实体
│   │   ├── database/                  # 数据库配置
│   │   │   ├── prisma/                # Prisma Schema
│   │   │   └── database.module.ts
│   │   └── config/                    # 配置文件
│   │       └── configuration.ts
│   ├── test/                          # 测试文件
│   ├── prisma/                        # Prisma 迁移文件
│   ├── package.json
│   ├── nest-cli.json
│   └── tsconfig.json
│
├── docs/                              # 文档目录
│   ├── api.md                         # API 文档
│   ├── deployment.md                  # 部署指南
│   ├── development.md                 # 开发指南
│   └── architecture.md                # 架构文档 (本文件)
│
├── docker/                            # Docker 配置
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
│
├── .github/                           # GitHub 配置
│   ├── workflows/                     # CI/CD 工作流
│   ├── ISSUE_TEMPLATE/                # Issue 模板
│   └── PULL_REQUEST_TEMPLATE.md       # PR 模板
│
├── .env.example                       # 环境变量示例
├── .gitignore
├── LICENSE                            # 开源协议
├── README.md                          # 项目说明
└── CONTRIBUTING.md                    # 贡献指南
```

---

## 🔐 安全架构设计

### 前端强验证流程

```
┌──────────────┐
│  用户操作     │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────┐
│  前端验证层 (第一道防线)          │
│  • Token 有效性检查              │
│  • 请求参数格式校验              │
│  • 操作权限预判                  │
│  • 防重复提交 (防抖/节流)         │
│  • XSS 输入过滤                  │
└──────┬──────────────────────────┘
       │ 验证通过
       ▼
┌─────────────────────────────────┐
│  发送 HTTPS 请求 (携带 JWT)       │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  后端验证层 (第二道防线)          │
│  • JWT 签名验证                  │
│  • Token 过期检查                │
│  • 数据所有权确认                │
│  • 业务规则校验                  │
│  • SQL 注入防护                  │
│  • 速率限制                      │
└──────┬──────────────────────────┘
       │ 验证通过
       ▼
┌─────────────────────────────────┐
│  数据库操作                      │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  返回结果 + 审计日志             │
└─────────────────────────────────┘
```

### JWT Token 结构

```typescript
// Payload 示例
{
  "sub": "user_id",
  "username": "user@example.com",
  "roles": ["user"],
  "iat": 1712736000,      // 签发时间
  "exp": 1712822400,      // 过期时间 (24h)
  "refreshExp": 1713340800 // 刷新 Token 过期时间 (7d)
}
```

### 安全中间件清单

| 中间件 | 作用 | 位置 |
|--------|------|------|
| `JwtAuthGuard` | JWT 认证守卫 | 后端 |
| `RolesGuard` | 角色权限守卫 | 后端 |
| `ThrottlerGuard` | 限流保护 | 后端 |
| `ValidationPipe` | 输入验证 | 后端 |
| `Helmet` | HTTP 头安全 | 后端 |
| `CORS` | 跨域控制 | 后端 |
| `axios-interceptor` | Token 自动刷新 | 前端 |
| `react-hook-form` | 表单验证 | 前端 |

---

## 📊 数据库设计

### 核心表结构

#### users (用户表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| email | VARCHAR(255) | 邮箱 (唯一) |
| password_hash | VARCHAR(255) | 密码哈希 |
| nickname | VARCHAR(50) | 昵称 |
| avatar_url | VARCHAR(500) | 头像 URL |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### notes (笔记表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 外键 (users.id) |
| title | VARCHAR(500) | 标题 |
| content | TEXT | 内容 (Markdown/HTML) |
| is_deleted | BOOLEAN | 软删除标记 |
| deleted_at | TIMESTAMP | 删除时间 |
| version | INTEGER | 版本号 |
| parent_id | UUID | 父笔记 ID (支持嵌套) |
| tags | JSON | 标签数组 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### note_versions (笔记版本表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| note_id | UUID | 外键 (notes.id) |
| version | INTEGER | 版本号 |
| content | TEXT | 版本内容 |
| created_at | TIMESTAMP | 创建时间 |

---

## 🔌 API 接口设计

### 认证模块

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | ❌ |
| POST | `/api/auth/login` | 用户登录 | ❌ |
| POST | `/api/auth/logout` | 用户登出 | ✅ |
| POST | `/api/auth/refresh` | 刷新 Token | ✅ |
| GET | `/api/auth/me` | 获取当前用户 | ✅ |

### 笔记模块

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/notes` | 获取笔记列表 | ✅ |
| GET | `/api/notes/:id` | 获取笔记详情 | ✅ |
| POST | `/api/notes` | 创建笔记 | ✅ |
| PUT | `/api/notes/:id` | 更新笔记 | ✅ |
| DELETE | `/api/notes/:id` | 删除笔记 | ✅ |
| POST | `/api/notes/:id/restore` | 恢复已删除笔记 | ✅ |
| GET | `/api/notes/:id/versions` | 获取历史版本 | ✅ |

### 用户模块

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/users/profile` | 获取个人资料 | ✅ |
| PUT | `/api/users/profile` | 更新个人资料 | ✅ |
| PUT | `/api/users/password` | 修改密码 | ✅ |

---

## 🚀 部署方案

### 开发环境

```bash
# 启动开发服务器
docker-compose -f docker-compose.dev.yml up

# 前端：http://localhost:3000
# 后端：http://localhost:3001
# 数据库：localhost:5432
```

### 生产环境

```bash
# 使用 Docker Compose 部署
docker-compose -f docker-compose.prod.yml up -d

# 或使用 Kubernetes
kubectl apply -f k8s/
```

### 环境变量配置

```bash
# .env
# 后端配置
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
REDIS_HOST="localhost"
REDIS_PORT="6379"

# 前端配置
VITE_API_URL="http://localhost:3001"
VITE_APP_TITLE="My Notes"
```

---

## 📈 性能优化策略

### 前端优化

| 优化项 | 方案 |
|--------|------|
| 代码分割 | React.lazy + Suspense |
| 图片优化 | WebP 格式 + 懒加载 |
| 缓存策略 | Service Worker + IndexedDB |
| 请求优化 | Axios 拦截器 + 请求合并 |
| 渲染优化 | useMemo + useCallback |

### 后端优化

| 优化项 | 方案 |
|--------|------|
| 数据库索引 | 常用查询字段建立索引 |
| 缓存层 | Redis 缓存热点数据 |
| 分页查询 | 游标分页避免深度分页 |
| 连接池 | 数据库连接池复用 |
| 异步处理 | 耗时操作放入队列 |

---

## 🧪 测试策略

| 测试类型 | 覆盖率目标 | 工具 |
|----------|-----------|------|
| 单元测试 | >80% | Vitest + Jest |
| 集成测试 | >60% | Supertest + RTL |
| E2E 测试 | 核心流程 | Playwright |
| 安全测试 |  OWASP Top 10 | ZAP + 手动审计 |

---

## 📝 开发规范

### Git 分支策略

```
main          # 生产分支
├── develop   # 开发分支
│   ├── feature/auth      # 功能分支
│   ├── feature/note
│   └── fix/login-bug     # 修复分支
```

### 提交信息规范

```
feat: 添加笔记标签功能
fix: 修复登录 Token 刷新问题
docs: 更新 API 文档
style: 代码格式化
refactor: 重构用户服务
test: 添加单元测试
chore: 更新依赖
```

---

## 📋 待办事项

- [ ] 确认技术栈最终选型
- [ ] 完善数据库 Schema 设计
- [ ] 补充 API 详细文档
- [ ] 设计 UI/UX 原型
- [ ] 制定开发排期
- [ ] 配置 CI/CD 流程

---

## 📚 参考资料

- [React 官方文档](https://react.dev/)
- [NestJS 官方文档](https://docs.nestjs.com/)
- [Prisma 官方文档](https://www.prisma.io/docs/)
- [TipTap 编辑器](https://tiptap.dev/)
- [OWASP 安全指南](https://owasp.org/)
