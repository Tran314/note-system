import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '../services/api';
import { User } from '../types/api.types';
import { getStoredAccessToken, setStoredAccessToken } from '../utils/auth-storage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  _hydrated: boolean; // 水合完成标记
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname?: string) => Promise<void>;
  logout: (notifyServer?: boolean) => void;
  setUser: (user: User) => void;
  checkAuth: () => boolean; // 检查认证状态（考虑水合）
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      _hydrated: false,

      login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const payload = response.data?.data ?? response.data;
        const { user, accessToken } = payload;

        setStoredAccessToken(accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },

      register: async (email: string, password: string, nickname?: string) => {
        const response = await api.post('/auth/register', { email, password, nickname });
        const payload = response.data?.data ?? response.data;
        const { user, accessToken } = payload;

        setStoredAccessToken(accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },

      logout: (notifyServer = true) => {
        const accessToken = get().accessToken;
        if (notifyServer && accessToken) {
          api.post('/auth/logout').catch(() => {});
        }
        setStoredAccessToken(null);
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      setUser: (user: User) => {
        set({ user });
      },

      // 检查认证状态，考虑水合是否完成
      checkAuth: () => {
        const state = get();
        if (!state._hydrated) {
          // 水合未完成时，从 localStorage 检查
          const storedToken = getStoredAccessToken();
          return !!storedToken;
        }
        return state.isAuthenticated;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // 水合完成后，同步 token 并标记已完成
        const accessToken = state?.accessToken ?? getStoredAccessToken();
        setStoredAccessToken(accessToken);
        // 标记水合完成
        useAuthStore.setState({ _hydrated: true });
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// 获取水合状态的辅助函数
export const isAuthHydrated = () => useAuthStore.getState()._hydrated;
