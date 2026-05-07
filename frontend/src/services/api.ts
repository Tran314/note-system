import axios from 'axios';

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
    const accessToken = getToken();
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
      isHandling401 = true;
      try {
        const newAccessToken = await refreshToken();
        if (newAccessToken) {
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(error.config);
        }
        logout();
        window.location.href = '/login';
        return Promise.reject(error);
      } catch {
        logout();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isHandling401 = false;
      }
    }

    return Promise.reject(error);
  },
);

export { api };
