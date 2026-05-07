# 本地 CI

> 在本地运行 CI 检查，确保代码质量

---

## CI 检查项

### 1. TypeScript 类型检查

```bash
cd frontend
npx tsc --noEmit
```

### 2. ESLint 代码检查

```bash
cd frontend
npm run lint
```

### 3. Prettier 格式化检查

```bash
cd frontend
npm run format:check
```

### 4. 单元测试

```bash
cd frontend
npm test
```

### 5. E2E 测试

```bash
cd frontend
npm run test:e2e
```

---

## 本地运行所有检查

```bash
cd frontend

# 类型检查
npx tsc --noEmit

# 代码检查
npm run lint

# 测试
npm test
```

---

## CI/CD 工作流

项目使用 GitHub Actions 进行持续集成：

| 工作流 | 触发条件 | 检查项 |
|--------|----------|--------|
| Code Quality | push/PR | CodeQL, SonarCloud, TypeScript |
| Frontend CI | frontend 变更 | 测试, 构建, Lint |
| Deploy | main 分支 | 构建并部署到 GitHub Pages |

---

## 提交前检查清单

- [ ] TypeScript 类型检查通过
- [ ] ESLint 无错误
- [ ] 单元测试通过
- [ ] 代码已格式化

---

**提示**: 建议在提交前运行本地 CI 检查，避免 CI 失败。
