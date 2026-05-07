import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, isAuthHydrated } from './store/auth.store';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/error/ErrorBoundary';
import { Loading } from './components/common/Loading';

// 懒加载页面组件（性能优化）
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NoteList = lazy(() => import('./pages/NoteList'));
const NoteEditor = lazy(() => import('./pages/NoteEditor'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./components/error/NotFound'));

// 路由守卫组件 - 等待水合完成后才判断认证状态
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hydrated } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 等待水合完成
    if (_hydrated) {
      setReady(true);
    } else {
      // 备用检查：如果 localStorage 有 token，先允许访问
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        setReady(true);
      }
    }
  }, [_hydrated]);

  // 未准备好时显示加载状态
  if (!ready) {
    return (
      <div className="nebula-shell flex min-h-screen items-center justify-center">
        <Loading text="验证登录状态..." />
      </div>
    );
  }

  // 水合完成后检查认证状态
  if (!isAuthenticated && !localStorage.getItem('accessToken')) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// 悬浮加载组件（优化用户体验）
function PageLoader() {
  return (
    <div className="nebula-shell flex min-h-screen items-center justify-center">
      <Loading text="加载页面..." />
    </div>
  );
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
