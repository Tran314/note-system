# 首次加载性能优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化首次加载性能，使 FCP < 1.2s, LCP < 2.0s，对标 Notion/Obsidian 水平

**Architecture:** 三阶段加载策略：骨架展示 → 最小可用 → 功能完整。通过 Auth 快速初始化、骨架屏、编辑器按需加载、代码分割优化实现

**Tech Stack:** React 18, Vite 5, TipTap, Zustand, TailwindCSS

---

## 文件结构

**新建文件：**
- `frontend/src/components/common/Skeleton.tsx` - 骨架屏组件（通用、笔记列表、编辑器）
- `frontend/src/components/note/RichTextEditor.tsx` - TipTap 编辑器封装组件（按需加载）

**修改文件：**
- `frontend/src/App.tsx` - Auth 快速初始化 + 骨架屏
- `frontend/src/store/auth.store.ts` - 快速认证检查逻辑
- `frontend/src/pages/NoteEditor.tsx` - 动态导入 RichTextEditor
- `frontend/src/pages/NoteList.tsx` - 使用骨架屏加载状态
- `frontend/vite.config.ts` - 代码分割优化
- `frontend/tailwind.config.js` - Purge 配置检查

---

## 第一阶段：核心性能优化

### Task 1: Auth 快速初始化

**Goal:** 移除 hydration 阻塞，实现立即从 localStorage 判断认证状态

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/store/auth.store.ts`

#### Step 1: 优化 App.tsx PrivateRoute

**当前问题：** PrivateRoute 等待 `_hydrated` 完成，导致白屏

**修改 `frontend/src/App.tsx`:**

```tsx
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  // 快速判断：立即从 localStorage 读取，不等待 hydration
  const storedToken = localStorage.getItem('accessToken');
  
  // 有 token 或 isAuthenticated 都允许访问
  if (!isAuthenticated && !storedToken) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
```

**删除的代码：**
- 移除 `_hydrated` 状态检查
- 移除 `useState` 的 `ready` 状态
- 移除 `useEffect` 水合等待逻辑
- 移除 "验证登录状态..." Loading

- [ ] **Step 2: Commit Auth 快速初始化**

```bash
git add frontend/src/App.tsx frontend/src/store/auth.store.ts
git commit -m "perf: remove auth hydration blocking for faster initial render"
```

---

### Task 2: 创建骨架屏组件

**Goal:** 创建通用骨架屏组件，替代 Loading 显示

**Files:**
- Create: `frontend/src/components/common/Skeleton.tsx`

#### Step 1: 编写骨架屏组件

**创建 `frontend/src/components/common/Skeleton.tsx`:**

```tsx
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[#363636] rounded-lg ${className}`}
    />
  );
}

export function NoteListSkeleton() {
  return (
    <div className="flex h-full">
      {/* 侧边栏骨架 */}
      <aside className="w-64 bg-[#242424] border-r border-[#3a3a3a] p-4">
        <Skeleton className="h-8 w-full mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </aside>
      
      {/* 主内容区骨架 */}
      <main className="flex-1 p-4">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-[#3a3a3a] p-4">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export function NoteCardSkeleton() {
  return (
    <div className="rounded-lg border border-[#3a3a3a] p-4">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header 骨架 */}
      <div className="border-b border-[#3a3a3a] p-4">
        <Skeleton className="h-8 w-32" />
      </div>
      
      {/* 标题骨架 */}
      <div className="p-4 border-b border-[#3a3a3a]">
        <Skeleton className="h-10 w-full" />
      </div>
      
      {/* 工具栏骨架 */}
      <div className="flex gap-2 p-3 border-b border-[#3a3a3a]">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} className="h-8 w-8 rounded" />
        ))}
      </div>
      
      {/* 编辑区骨架 */}
      <div className="flex-1 p-4">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit 骨架屏组件**

```bash
git add frontend/src/components/common/Skeleton.tsx
git commit -m "feat: add skeleton components for faster perceived loading"
```

---

### Task 3: App.tsx 使用骨架屏

**Goal:** App.tsx 首次加载时立即显示骨架屏

**Files:**
- Modify: `frontend/src/App.tsx`

#### Step 1: 修改 App.tsx Suspense fallback

**修改 `frontend/src/App.tsx`:**

在 `import` 部分添加：

```tsx
import { NoteListSkeleton } from './components/common/Skeleton';
```

修改 `PageLoader` 组件：

```tsx
function PageLoader() {
  return <NoteListSkeleton />;
}
```

- [ ] **Step 2: Commit App 骨架屏**

```bash
git add frontend/src/App.tsx
git commit -m "perf: use skeleton screen for initial loading"
```

---

### Task 4: TipTap 按需加载 - 创建 RichTextEditor

**Goal:** 将 TipTap 编辑器封装为独立组件，支持动态导入

**Files:**
- Create: `frontend/src/components/note/RichTextEditor.tsx`

#### Step 1: 创建 RichTextEditor 组件

**创建 `frontend/src/components/note/RichTextEditor.tsx`:**

```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

interface RichTextEditorProps {
  content: string;
  placeholder?: string;
  onUpdate?: (content: string) => void;
  className?: string;
}

export function RichTextEditor({
  content,
  placeholder = '开始编写...',
  onUpdate,
  className = '',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#10a37f] underline' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full h-auto rounded-lg' },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
  });

  return (
    <EditorContent
      editor={editor}
      className={`prose prose-sm min-h-[300px] max-w-none ${className}`}
    />
  );
}
```

- [ ] **Step 2: Commit RichTextEditor**

```bash
git add frontend/src/components/note/RichTextEditor.tsx
git commit -m "feat: create RichTextEditor component for lazy loading"
```

---

### Task 5: NoteEditor 动态导入编辑器

**Goal:** NoteEditor 页面按需加载 TipTap 编辑器，未加载时显示骨架屏

**Files:**
- Modify: `frontend/src/pages/NoteEditor.tsx`

#### Step 1: 修改 NoteEditor.tsx 动态导入

**修改 `frontend/src/pages/NoteEditor.tsx`:**

移除顶部 TipTap imports：

```tsx
// DELETE these imports:
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
```

添加动态导入和骨架屏导入：

```tsx
import { lazy, Suspense } from 'react';
import { EditorSkeleton } from '../components/common/Skeleton';

const RichTextEditor = lazy(() => import('../components/note/RichTextEditor').then(m => ({ default: m.RichTextEditor })));
```

修改编辑器使用部分（替换 `EditorContent`）：

```tsx
<Suspense fallback={<EditorSkeleton />}>
  <RichTextEditor
    content={currentNote?.content || ''}
    onUpdate={(content) => {
      setHasUnsavedChanges(true);
      // 触发自动保存逻辑
    }}
  />
</Suspense>
```

**注意：** 需要调整 NoteEditor 中的编辑器相关逻辑，移除 `useEditor` 直接调用，改为通过 RichTextEditor 的 onUpdate 回调处理

- [ ] **Step 2: Commit NoteEditor 按需加载**

```bash
git add frontend/src/pages/NoteEditor.tsx
git commit -m "perf: lazy load TipTap editor in NoteEditor page"
```

---

### Task 6: 代码分割优化

**Goal:** 优化 vite.config.ts manualChunks 配置，拆分图标库

**Files:**
- Modify: `frontend/vite.config.ts`

#### Step 1: 修改 vite.config.ts

**修改 `frontend/vite.config.ts`:**

```ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'state': ['zustand', '@tanstack/react-query'],
          'icons': ['lucide-react'],
          'form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'utils': ['axios', 'clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
```

**关键变更：**
- 添加 'icons' chunk 独立拆分 lucide-react
- 移除 'editor' chunk（TipTap 现在按需加载）

- [ ] **Step 2: Commit 代码分割优化**

```bash
git add frontend/vite.config.ts
git commit -m "perf: optimize code splitting with separate icons chunk"
```

---

### Task 7: NoteList 使用骨架屏

**Goal:** NoteList 加载状态使用骨架屏

**Files:**
- Modify: `frontend/src/pages/NoteList.tsx`

#### Step 1: 修改 NoteList.tsx

**修改 `frontend/src/pages/NoteList.tsx`:**

添加导入：

```tsx
import { NoteCardSkeleton } from '../components/common/Skeleton';
```

修改加载状态显示：

```tsx
{loading ? (
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <NoteCardSkeleton key={i} />
    ))}
  </div>
) : displayedNotes.length === 0 ? (
  // ... 空状态
) : (
  // ... 笔记列表
)}
```

- [ ] **Step 2: Commit NoteList 骨架屏**

```bash
git add frontend/src/pages/NoteList.tsx
git commit -m "perf: use skeleton cards in NoteList loading state"
```

---

### Task 8: 构建并测试性能

**Goal:** 构建项目，验证 bundle size 和性能指标

**Files:**
- None (构建验证)

#### Step 1: 构建前端

```bash
cd frontend
npm run build
```

**预期输出：**
- 检查 dist/assets/ 文件大小
- 确认初始包 ~250KB
- 确认 icons chunk ~50KB
- 确认无 editor chunk

- [ ] **Step 2: 使用 Lighthouse 测试**

打开 Chrome DevTools → Lighthouse → Performance

**预期指标：**
- FCP < 1.2s
- LCP < 2.0s
- Total Blocking Time < 200ms

- [ ] **Step 3: Commit 性能优化完成标记**

```bash
git add -A
git commit -m "perf: complete phase 1 performance optimization - skeleton screen, lazy editor, code splitting"
```

---

## 第二阶段：进一步优化（可选）

### Task 9: TailwindCSS Purge 检查

**Goal:** 确保 TailwindCSS 正确 purge 未使用的样式

**Files:**
- Modify: `frontend/tailwind.config.js`

#### Step 1: 检查 tailwind.config.js content 配置

**确保配置正确：**

```js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // ... 其他配置
}
```

- [ ] **Step 2: Commit TailwindCSS 配置**

```bash
git add frontend/tailwind.config.js
git commit -m "perf: verify TailwindCSS purge configuration"
```

---

### Task 10: 预加载策略（可选）

**Goal:** 添加路由 prefetch 和资源 preload

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/src/App.tsx`

#### Step 1: 添加 preload hints（可选）

**仅在需要时添加到 `frontend/index.html`:**

```html
<link rel="preload" href="/src/main.tsx" as="script" />
```

- [ ] **Step 2: Commit 预加载策略**

```bash
git add frontend/index.html frontend/src/App.tsx
git commit -m "perf: add preload and prefetch strategies"
```

---

## 实施总结

### 预期性能提升

**第一阶段完成后：**
- ✅ FCP: < 1.2s (从 ~2s 提升)
- ✅ LCP: < 2.0s (从 ~3s 提升)
- ✅ Initial Bundle: ~250KB (从 ~400KB 减少)
- ✅ 骨架屏立即显示 (< 0.3s)
- ✅ Auth 无阻塞判断

**第二阶段完成后：**
- ✅ 二次访问 < 0.5s (Service Worker)
- ✅ TailwindCSS 优化 20-30KB

### 验证方法

1. Chrome DevTools Performance 面板录制
2. Lighthouse 性能审计（目标：90+ 分）
3. Bundle size 分析（rollup-plugin-visualizer）
4. 对比 Notion/Obsidian 加载速度

---

## 风险处理

### 编辑器延迟加载风险

**问题：** 用户首次编辑可能有短暂等待

**解决：**
- 骨架屏平滑过渡
- 编辑器 chunk < 100KB，加载时间 < 0.5s
- 用户感知：点击编辑 → 骨架屏 → 编辑器渲染 (< 0.5s)

### Auth 快速初始化风险

**问题：** hydration 完成前状态可能不一致

**解决：**
- localStorage 快速判断有 token → 允许访问
- 后台异步 hydrate，失败时平滑跳转登录
- 不影响用户感知速度

---

## 注意事项

1. **Git Merge Conflicts:** NoteEditor.tsx 和 NoteList.tsx 有未解决的冲突标记，需要在实施前先解决
2. **测试覆盖:** 每个优化后需验证功能完整性
3. **移动端:** 验证移动端性能同样优化
4. **网络条件:** 测试不同网络条件下的加载速度

---