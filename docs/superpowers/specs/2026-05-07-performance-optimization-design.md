# 首次加载性能优化设计

> 版本：1.0  
> 日期：2026-05-07  
> 目标：FCP < 1.2s, LCP < 2.0s, 对标 Notion/Obsidian 水平

---

## 问题分析

### 当前性能问题

1. **初始包体积过大**
   - TipTap 编辑器在初始 chunk (~100KB)
   - Lucide React 图标库未独立拆分
   - TailwindCSS purge 可能不充分
   - 当前初始包 ~400KB (gzip ~120KB)

2. **渲染阻塞**
   - Auth hydration 等待完成才判断路由
   - Suspense 包裹所有路由，白屏时间长
   - 缺少骨架屏，用户感知慢

3. **资源加载顺序不合理**
   - 关键 CSS 未 inline
   - 缺少 preload/prefetch 策略
   - 所有懒加载页面共享同一 Suspense

---

## 优化方案

### 阶段划分

将首次加载分为三个阶段：

**阶段 1：骨架展示 (< 0.3s)**
- HTML 解析完成
- 关键 CSS inline
- 骨架屏立即显示
- 用户看到页面结构

**阶段 2：最小可用 (< 1.2s)**
- 核心 JS 加载完成
- Auth 快速初始化（localStorage）
- 路由判断完成
- 基础 UI 渲染
- 用户可查看笔记列表

**阶段 3：功能完整 (< 2.0s)**
- 数据请求完成
- 编辑器后台加载
- 用户可编辑笔记

---

## 具体实施措施

### 1. TipTap 编辑器按需加载（高优先级）

**当前：** 编辑器在 vite.config.ts 的 'editor' chunk，初始加载时引入

**优化：**
- 移除 vite.config.ts 中 'editor' chunk 配置
- 创建独立 RichTextEditor 组件，动态导入
- NoteEditor 页面仅在用户点击编辑时加载编辑器
- 编辑器未加载时显示骨架屏或简化预览

**预期收益：** 减少 ~100KB 初始包体积

**实施文件：**
- `frontend/vite.config.ts`
- `frontend/src/components/note/RichTextEditor.tsx` (新建)
- `frontend/src/pages/NoteEditor.tsx`

---

### 2. Auth 快速初始化（高优先级）

**当前：** App.tsx PrivateRoute 等待 `_hydrated` 完成

**优化：**
- PrivateRoute 立即从 localStorage 读取 token
- 有 token → 允许访问，后台异步 hydrate
- 无 token → 立即跳转登录
- 消除 hydration 阻塞

**预期收益：** 减少 ~0.3-0.5s 白屏时间

**实施文件：**
- `frontend/src/App.tsx`
- `frontend/src/store/auth.store.ts`

---

### 3. 骨架屏组件（高优先级）

**创建骨架组件：**
- NoteListSkeleton：侧边栏骨架
- NoteCardSkeleton：笔记卡片骨架
- EditorSkeleton：编辑器骨架
- GenericSkeleton：通用骨架

**使用位置：**
- App.tsx PrivateRoute 加载状态
- NoteList.tsx 数据加载状态
- NoteEditor.tsx 编辑器加载状态

**预期收益：** FCP 提升至 < 1.2s，视觉感知速度提升 40%

**实施文件：**
- `frontend/src/components/common/Skeleton.tsx` (新建)
- 各页面组件引入骨架屏

---

### 4. 代码分割优化（中优先级）

**调整 vite.config.ts manualChunks：**

```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'state': ['zustand', '@tanstack/react-query'],
  'icons': ['lucide-react'],  // 独立拆分图标库
  'form': ['react-hook-form', '@hookform/resolvers', 'zod'],
  'utils': ['axios', 'clsx', 'tailwind-merge'],
}
// 移除 'editor' chunk，让 TipTap 按需加载
```

**预期收益：** 初始包降至 ~250KB (gzip ~75KB)

**实施文件：**
- `frontend/vite.config.ts`

---

### 5. 预加载策略（中优先级）

**HTML preload：**
- Preload 关键字体（如果使用 Web Fonts）
- Preload 核心 CSS

**路由 prefetch：**
- 用户 hover 链接时 prefetch 目标页面
- React Router 6 支持预加载机制

**预期收益：** 路由切换时间减少 50%

**实施文件：**
- `frontend/index.html`
- `frontend/src/App.tsx`

---

### 6. TailwindCSS 优化（低优先级）

**确保 purge 配置：**
- 检查 tailwind.config.js content 配置
- 确保正确扫描所有组件文件
- 移除 safelist 中不必要的类

**关键 CSS inline（可选）：**
- 将骨架屏关键样式 inline 在 HTML
- 减少关键 CSS 阻塞

**预期收益：** 减少 20-30KB CSS

**实施文件：**
- `frontend/tailwind.config.js`

---

### 7. Service Worker 缓存（可选，第二阶段）

**策略：**
- 缓存静态资源（JS、CSS、字体）
- API 请求使用 network-first
- 用户离线时可查看缓存笔记

**预期收益：** 二次访问加载时间 < 0.5s

**实施文件：**
- `frontend/src/sw.js` (新建)
- `frontend/vite.config.ts` (添加 Vite PWA plugin)

---

## 实施优先级

### 第一阶段（立即实施）
1. Auth 快速初始化
2. 骨架屏组件
3. TipTap 按需加载
4. 代码分割优化

**预期效果：** FCP < 1.2s，LCP < 2.0s

### 第二阶段（后续优化）
1. 预加载策略
2. TailwindCSS 优化
3. Service Worker 缓存

**预期效果：** 二次访问 < 0.5s，持续优化

---

## 性能目标

### Core Web Vitals 目标
- **FCP (First Contentful Paint):** < 1.2s
- **LCP (Largest Contentful Paint):** < 2.0s  
- **TTI (Time to Interactive):** < 2.5s
- **CLS (Cumulative Layout Shift):** < 0.1

### Bundle Size 目标
- **Initial Bundle:** ~250KB (gzip ~75KB)
- **编辑器 Chunk:** ~100KB (按需加载)
- **图标 Chunk:** ~50KB (按需加载)

---

## 测试验证

### 性能测试方法
1. Chrome DevTools Performance 面板
2. Lighthouse 性能审计
3. WebPageTest 实测
4. 对比 Notion/Obsidian 加载速度

### 关键指标监控
- 监控 FCP/LCP/TTI 数值
- Bundle size 分析（rollup-plugin-visualizer）
- 路由切换时间
- 编辑器加载时间

---

## 风险与注意事项

### 技术风险
1. **编辑器延迟加载可能影响用户体验**
   - 解决：提供骨架屏 + 简化预览模式
   - 用户点击编辑时后台加载，最大延迟 < 0.5s

2. **Auth 快速初始化可能导致状态不一致**
   - 解决：后台 hydrate 完成后更新状态
   - 失败时平滑跳转登录页

3. **代码分割可能影响开发体验**
   - 解决：dev 滚动不启用代码分割
   - 仅在生产构建生效

### 注意事项
1. 所有优化需保持功能完整性
2. 骨架屏样式需与实际组件一致
3. 移动端性能同样重要
4. 测试覆盖各种网络条件

---

## 成功标准

优化完成后需满足：
1. FCP < 1.2s (Lighthouse 测量)
2. LCP < 2.0s (Lighthouse 测量)
3. 初始包体积 < 250KB (gzip < 75KB)
4. 用户感知速度明显提升（主观测试）
5. 与 Notion/Obsidian 加载速度持平或更好

---