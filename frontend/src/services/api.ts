import axios from 'axios';
<<<<<<< Updated upstream
import { useAuthStore } from '../store/auth.store';
import { getStoredAccessToken } from '../utils/auth-storage';
=======

type TokenProvider = () => string | null;
type RefreshTokenHandler = () => Promise<string | null>;
type LogoutHandler = () => void;

let getToken: TokenProvider = () => null;
let refreshToken: RefreshTokenHandler = async () => null;
let logout: LogoutHandler = () => {};

export function setAuthHandlers(handlers: {
  getToken: TokenProvider;
  refreshToken: RefreshTokenHandler;
  logout: LogoutHandler;
}) {
  getToken = handlers.getToken;
  refreshToken = handlers.refreshToken;
  logout = handlers.logout;
}
>>>>>>> Stashed changes

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 标记是否已经处理过 401（防止重复处理）
let isHandling401 = false;

api.interceptors.request.use(
  (config) => {
<<<<<<< Updated upstream
    // 优先从 zustand state 获取，其次从 localStorage
    const accessToken = useAuthStore.getState().accessToken ?? getStoredAccessToken();
=======
    const accessToken = getToken();
>>>>>>> Stashed changes
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestUrl = String(error.config?.url ?? '');
    const isAuthRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh');

    // 只处理非认证请求的 401 错误
    if (error.response?.status === 401 && !isAuthRequest && !isHandling401) {
      // 检查水合状态和实际存储的 token
      const { _hydrated, isAuthenticated } = useAuthStore.getState();
      const storedToken = getStoredAccessToken();

<<<<<<< Updated upstream
      // 只有在水合完成且确实没有有效 token 时才 logout
      if (_hydrated && !isAuthenticated && !storedToken) {
        isHandling401 = true;
        useAuthStore.getState().logout(false);

        // 延迟重定向，避免竞态条件
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          isHandling401 = false;
        }, 100);
      } else if (!_hydrated && storedToken) {
        // 水合未完成但有 token，可能是临时状态，不 logout
        console.warn('Auth not hydrated yet, skipping logout on 401');
=======
      try {
        const newAccessToken = await refreshToken();
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
        logout();
        window.location.href = '/login';
        return Promise.reject(error);
      } catch {
        logout();
        window.location.href = '/login';
        return Promise.reject(error);
>>>>>>> Stashed changes
      }
    }

    return Promise.reject(error);
  },
);

export { api };
