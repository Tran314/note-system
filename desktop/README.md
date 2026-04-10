# Nebula Desktop

Nebula 桌面版 - 基于 Electron 的跨平台桌面应用。

## 功能特性

- 🖥️ 跨平台支持：Windows、macOS、Linux
- 🔄 自动更新：内置自动更新机制
- 💾 本地存储：数据保存在本地，隐私安全
- 🚀 内嵌后端：打包包含完整后端服务
- 📦 离线使用：无需网络即可使用

## 开发

```bash
# 进入桌面版目录
cd desktop

# 安装依赖
npm install

# 开发模式（需要前端 dev server 运行）
npm run dev

# 构建
npm run build
```

## 打包

```bash
# 打包所有平台
npm run dist

# 仅打包 macOS
npm run dist:mac

# 仅打包 Windows
npm run dist:win

# 仅打包 Linux
npm run dist:linux
```

## 项目结构

```
desktop/
├── src/
│   ├── main.ts        # 主进程
│   └── preload.ts     # 预加载脚本
├── build/             # 构建资源（图标等）
├── dist/              # 编译输出
├── release/           # 打包输出
├── package.json
└── tsconfig.main.json
```

## 技术栈

- Electron 28
- TypeScript
- electron-builder
- electron-updater
- electron-store