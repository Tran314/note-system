import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/error/ErrorBoundary';
import { GenericSkeleton } from './components/common/Skeleton';
import { getStoredAccessToken } from './utils/auth-storage';

// 懒加载页面组件（性能优化）
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NoteList = lazy(() => import('./pages/NoteList'));
const NoteEditor = lazy(() => import('./pages/NoteEditor'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./components/error/NotFound'));

// 路由守卫组件 - 立即检查认证状态
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  // 快速判断：立即从 localStorage 读取，不等待 hydration
  const storedToken = getStoredAccessToken();
  
  // 有 token 或 isAuthenticated 都允许访问
  if (!isAuthenticated && !storedToken) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// 悬浮加载组件（优化用户体验）
function PageLoader() {
  return <GenericSkeleton />;
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 私有路由（需要登录） */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<NoteList />} />
            <Route path="notes" element={<NoteList />} />
            <Route path="notes/:id" element={<NoteEditor />} />
            <Route path="notes/new" element={<NoteEditor />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 页面 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
