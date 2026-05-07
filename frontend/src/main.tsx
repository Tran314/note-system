import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/common/Toast';
import { setAuthHandlers } from './services/api';
import { useAuthStore } from './store/auth.store';
import { getStoredAccessToken } from './utils/auth-storage';
import './i18n';
import App from './App';
import './index.css';
import './styles/dark-theme.css';

setAuthHandlers({
  getToken: () => useAuthStore.getState().accessToken || getStoredAccessToken(),
  refreshToken: async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Refresh failed');
      const data = await response.json();
      const newToken = data.data.accessToken;
      useAuthStore.setState({ accessToken: newToken });
      return newToken;
    } catch {
      useAuthStore.getState().logout();
      return null;
    }
  },
  logout: () => useAuthStore.getState().logout(),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
