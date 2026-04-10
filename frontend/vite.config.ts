import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

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
          // React 生态
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 状态管理
          'state': ['zustand', '@tanstack/react-query'],
          // 表单和验证
          'form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // 编辑器
          'editor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-link', '@tiptap/extension-placeholder'],
          // 工具库
          'utils': ['axios', 'clsx', 'tailwind-merge', 'lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});