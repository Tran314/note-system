# 📝 自建笔记系统

> 一个现代化、安全、可扩展的自建笔记管理系统

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![NestJS](https://img.shields.io/badge/NestJS-10.x-e0234e.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-336791.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)

---

## ✨ 特性亮点

- 🔐 **双重验证架构** - 前端强验证 + 后端二次校验，安全可靠
- 🔄 **版本控制** - 自动保存历史版本，随时回溯
- 📁 **文件夹管理** - 支持多层嵌套文件夹
- 🏷️ **标签系统** - 彩色标签，灵活分类
- 🔍 **全文搜索** - 基于 PostgreSQL 的高性能搜索
- 📎 **附件支持** - 图片、PDF 文件上传管理
- 🌙 **主题切换** - 支持亮色/暗色主题
- 📱 **响应式设计** - 完美适配桌面和移动端

---

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **状态管理**: Zustand
- **路由**: React Router 6
- **UI 框架**: TailwindCSS 3
- **编辑器**: TipTap 2
- **表单验证**: React Hook Form + Zod
- **HTTP 客户端**: Axios

### 后端
- **框架**: NestJS 10
- **数据库 ORM**: Prisma 5
- **数据库**: PostgreSQL 16
- **缓存**: Redis 7
- **认证**: JWT (双 Token 架构)
- **文件上传**: Multer
- **API 文档**: Swagger/OpenAPI

### 开发工具
- **代码规范**: ESLint + Prettier
- **测试**: Vitest + Jest + Playwright
- **容器化**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.x
- npm >= 9.x
- Docker >= 20.x (可选，用于数据库)

### 方式一：使用 Docker（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/YOUR_USERNAME/note-system.git
cd note-system

# 2. 复制环境变量文件
cp .env.example .env

# 3. 启动数据库（PostgreSQL + Redis）
npm run docker:up

# 4. 安装所有依赖
npm run install:all

# 5. 运行数据库迁移
npm run migrate

# 6. 启动开发服务器
npm run dev
```

访问：
- 前端：http://localhost:3000
- 后端 API: http://localhost:3001
- API 文档：http://localhost:3001/api/docs
- pgAdmin: http://localhost:5050

### 方式二：本地部署

```bash
# 1. 手动启动 PostgreSQL 和 Redis
# 2. 配置 .env 文件中的数据库连接
# 3. 安装依赖并启动
npm run install:all
npm run migrate
npm run dev
```

---

## 📁 项目结构

```
note-system/
├── backend/                 # 后端 NestJS 项目
│   ├── src/
│   │   ├── modules/         # 业务模块
│   │   │   ├── auth/        # 认证模块
│   │   │   ├── user/        # 用户模块
│   │   │   ├── note/        # 笔记模块
│   │   │   ├── folder/      # 文件夹模块
│   │   │   ├── tag/         # 标签模块
│   │   │   └── attachment/  # 附件模块
│   │   ├── common/          # 公共模块
│   │   └── database/        # 数据库配置
│   └── prisma/              # Prisma Schema
├── frontend/                # 前端 React 项目
│   └── src/
│       ├── components/      # 组件
│       ├── pages/           # 页面
│       ├── hooks/           # 自定义 Hooks
│       ├── services/        # API 服务
│       └── store/           # 状态管理
├── docker/                  # Docker 配置
├── docs/                    # 文档目录
└── .github/                 # GitHub 配置
```

---

## 📖 API 文档

启动项目后访问：http://localhost:3001/api/docs

### 核心接口

#### 认证模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/register` | 用户注册 |
| POST | `/api/v1/auth/login` | 用户登录 |
| POST | `/api/v1/auth/refresh` | 刷新 Token |
| POST | `/api/v1/auth/logout` | 用户登出 |

#### 笔记模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/notes` | 获取笔记列表 |
| GET | `/api/v1/notes/:id` | 获取笔记详情 |
| POST | `/api/v1/notes` | 创建笔记 |
| PUT | `/api/v1/notes/:id` | 更新笔记 |
| DELETE | `/api/v1/notes/:id` | 删除笔记 |

完整 API 文档见 [docs/api.md](./docs/api.md)

---

## 🧪 测试

```bash
# 运行所有测试
npm run test

# 仅后端测试
npm run test:backend

# 仅前端测试
npm run test:frontend

# 查看测试覆盖率
npm run test:backend -- --coverage
```

---

## 📦 部署

### Docker 部署（生产环境）

```bash
# 使用生产配置启动
docker-compose -f docker/docker-compose.prod.yml up -d
```

### 手动部署

```bash
# 1. 构建项目
npm run build

# 2. 启动后端
cd backend && npm run start:prod

# 3. 部署前端（以 Vercel 为例）
cd frontend && vercel deploy --prod
```

详细部署指南见 [docs/deployment.md](./docs/deployment.md)

---

## 🤝 贡献

欢迎贡献代码！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解贡献流程。

### 开发步骤

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📄 开源协议

本项目采用 [MIT](./LICENSE) 协议开源。

---

## 📞 联系方式

- 作者：[Your Name]
- Email: [your.email@example.com]
- 项目地址：https://github.com/YOUR_USERNAME/note-system

---

## 🙏 致谢

感谢以下开源项目：

- [React](https://react.dev/)
- [NestJS](https://nestjs.com/)
- [Prisma](https://www.prisma.io/)
- [TipTap](https://tiptap.dev/)
- [TailwindCSS](https://tailwindcss.com/)

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star！**

</div>
