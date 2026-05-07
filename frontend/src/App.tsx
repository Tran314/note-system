import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/error/ErrorBoundary';
import { Loading } from './components/common/Loading';

const NoteList = lazy(() => import('./pages/NoteList'));
const NoteEditor = lazy(() => import('./pages/NoteEditor'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./components/error/NotFound'));

function PageLoader() {
  return <Loading text="加载页面..." />;
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<NoteList />} />
            <Route path="notes" element={<NoteList />} />
            <Route path="notes/:id" element={<NoteEditor />} />
            <Route path="notes/new" element={<NoteEditor />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
