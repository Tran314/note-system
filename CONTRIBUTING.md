# 贡献指南

感谢你考虑为 Nebula 做贡献！🎉

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交信息](#提交信息)
- [Pull Request 流程](#pull-request-流程)

---

## 行为准则

请阅读并遵守我们的行为准则，营造友好、包容的社区环境。

---

## 如何贡献

### 报告 Bug

如果你发现了 Bug，请通过 [GitHub Issues](https://github.com/your-username/nebula/issues) 提交：

1. 使用清晰的标题描述问题
2. 描述复现步骤
3. 说明预期行为和实际行为
4. 附上相关日志或截图

### 提出新功能

欢迎提出新功能建议！请：

1. 描述功能需求
2. 说明使用场景
3. 讨论实现方案

---

## 开发流程

### 1. Fork 并克隆仓库

```bash
git clone https://github.com/your-username/nebula.git
cd nebula
```

### 2. 安装依赖

```bash
npm run install:all
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件
```

### 4. 初始化数据库

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
cd ..
```

### 5. 启动开发服务器

```bash
npm run dev
```

---

## 代码规范

### TypeScript

- 使用 TypeScript 编写所有代码
- 启用严格模式 (`strict: true`)
- 为所有函数添加类型注解

### 后端 (NestJS)

- 遵循 NestJS 官方风格指南
- 使用 DTO 进行数据验证
- 使用 Guards 和 Interceptors

### 前端 (React)

- 使用函数组件和 Hooks
- 使用 TailwindCSS 进行样式
- 遵循 React 最佳实践

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件 | kebab-case | `note-editor.tsx` |
| 组件 | PascalCase | `NoteEditor` |
| 函数 | camelCase | `fetchNotes` |
| 常量 | UPPER_SNAKE_CASE | `MAX_NOTES` |
| 类型/接口 | PascalCase | `NoteData` |

---

## 提交信息

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型 (type)

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

### 示例

```
feat(editor): 添加代码块语法高亮

- 支持 JavaScript, TypeScript, Python
- 使用 Prism.js 高亮
- 添加语言选择器

Closes #123
```

---

## Pull Request 流程

### 1. 创建分支

```bash
git checkout -b feature/your-feature
```

### 2. 提交更改

```bash
git add .
git commit -m "feat: your feature"
```

### 3. 推送到 Fork

```bash
git push origin feature/your-feature
```

### 4. 创建 Pull Request

- 填写 PR 模板
- 关联相关 Issue
- 等待代码审查

### 5. 代码审查

- 响应审查意见
- 进行必要的修改
- 保持讨论友好

---

## 测试

### 运行测试

```bash
# 所有测试
npm test

# 后端测试
npm run test:backend

# 前端测试
npm run test:frontend

# E2E 测试
npm run test:e2e
```

### 测试覆盖率

我们期望代码覆盖率达到 80% 以上。

---

## 许可证

提交代码即表示你同意将代码以 MIT 许可证开源。

---

感谢你的贡献！🌟