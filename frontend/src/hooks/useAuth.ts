import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';

// 自动刷新 Token 的 Hook
export function useTokenRefresh() {
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;

    // Token 有效期 30 分钟，在 25 分钟时刷新
    const refreshInterval = 25 * 60 * 1000;

    const interval = setInterval(() => {
      useAuthStore.getState().refreshToken().catch(() => {});
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [accessToken]);
}