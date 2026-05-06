import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';
import { User } from '../types/api.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { user, accessToken } = response.data.data;

        set({ user, accessToken, isAuthenticated: true });
      },

      register: async (email: string, password: string, nickname?: string) => {
        const response = await api.post('/auth/register', { email, password, nickname });
        const { user, accessToken } = response.data.data;

        set({ user, accessToken, isAuthenticated: true });
      },

      logout: () => {
        const accessToken = get().accessToken;
        if (accessToken) {
          api.post('/auth/logout').catch(() => {});
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      setUser: (user: User) => {
        set({ user });
      },

      refreshToken: async () => {
        try {
          const response = await api.post('/auth/refresh');
          const { accessToken } = response.data.data;
          set({ accessToken });
        } catch (error) {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
