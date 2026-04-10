import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import NoteList from './pages/NoteList';
import NoteEditor from './pages/NoteEditor';
import Settings from './pages/Settings';
import NotFound from './components/error/NotFound';
import ErrorBoundary from './components/error/ErrorBoundary';

// 路由守卫组件
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        // 公开路由
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        // 私有路由（需要登录）
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

        // 404 页面
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;