# 本地预览

> 快速在本地预览 Nebula 笔记系统

---

## 环境要求

- Node.js >= 18
- 现代浏览器（Chrome/Edge/Firefox/Safari）

---

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问应用

打开浏览器访问: http://localhost:3000

---

## 配置 COS 同步（可选）

如果需要启用云端同步功能：

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，填入腾讯云 COS 配置
```

**环境变量说明**:

| 变量 | 说明 |
|------|------|
| VITE_COS_BUCKET | COS 存储桶名称 |
| VITE_COS_REGION | COS 地域 |
| VITE_COS_SECRET_ID | 腾讯云 SecretId |
| VITE_COS_SECRET_KEY | 腾讯云 SecretKey |

---

## 生产构建

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

构建后的文件位于 `frontend/dist` 目录，可部署到任何静态托管服务。

---

## 故障排除

### 端口被占用

如果 3000 端口被占用，Vite 会自动使用其他端口。

### 浏览器兼容性问题

确保使用现代浏览器，支持 IndexedDB 和 ES2020。

---

**提示**: 本地预览无需后端服务，所有数据存储在浏览器 IndexedDB 中。
