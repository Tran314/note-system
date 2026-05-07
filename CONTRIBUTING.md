# 贡献指南

感谢你对 Nebula 项目的关注！欢迎贡献代码、报告问题或提出建议。

---

## 项目概述

Nebula 是一个**本地优先**的笔记管理系统，使用纯前端架构：
- **数据存储**: IndexedDB (浏览器本地)
- **云端同步**: 腾讯云 COS (按需同步)
- **技术栈**: React 18 + TypeScript + Vite + TailwindCSS

**重要**: 本项目已移除后端服务，所有数据操作在本地完成。

---

## 如何贡献

### 1. 报告问题

在提交 Issue 前，请先：
- 搜索现有 Issues，确认问题未被报告
- 提供详细的复现步骤
- 附上浏览器版本和操作系统信息

### 2. 提出功能建议

- 描述功能的用途和场景
- 说明为什么这个功能有价值
- 如果有设计草图，请附上

### 3. 提交代码

#### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/Tran314/note-system.git
cd note-system

# 安装依赖
cd frontend
npm install

# 启动开发服务器
npm run dev
```

#### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 提交前运行 `npm run lint`

#### 提交信息格式

```
<type>: <description>

[optional body]

[optional footer]
```

**类型**:
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

**示例**:
```
feat: add folder drag and drop support

fix: resolve note content not saving issue

docs: update README with new architecture
```

---

## 项目结构

```
frontend/
├── src/
│   ├── components/       # UI 组件
│   │   ├── common/       # 通用组件
│   │   ├── layout/       # 布局组件
│   │   └── note/         # 笔记组件
│   ├── pages/            # 页面组件
│   ├── store/            # Zustand 状态管理
│   ├── services/         # 服务层
│   │   ├── local-db.service.ts   # IndexedDB 操作
│   │   ├── sync.service.ts       # COS 同步
│   │   └── ...
│   ├── hooks/            # 自定义 Hooks
│   └── utils/            # 工具函数
```

---

## 测试

### 运行测试

```bash
# 单元测试
npm test

# E2E 测试
npm run test:e2e

# 测试覆盖率
npm run test:coverage
```

### 编写测试

- 为新功能编写单元测试
- 确保测试覆盖核心逻辑
- E2E 测试覆盖关键用户流程

---

## 发布流程

1. 更新 `CHANGELOG.md`
2. 更新 `package.json` 版本号
3. 创建 Git Tag
4. 推送到远程仓库

---

## 行为准则

- 尊重其他贡献者
- 建设性地讨论问题
- 接受建设性批评
- 关注项目最佳利益

---

## 许可证

本项目采用 MIT 许可证。提交代码即表示你同意将代码以 MIT 许可证发布。

---

**感谢你的贡献！** 🎉
