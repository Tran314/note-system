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
  logout: (notifyServer?: boolean) => void;
  setUser: (user: User) => void;
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

        localStorage.setItem('accessToken', accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },

      register: async (email: string, password: string, nickname?: string) => {
        const response = await api.post('/auth/register', { email, password, nickname });
        const { user, accessToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },

      logout: (notifyServer = true) => {
        const accessToken = get().accessToken;
        if (notifyServer && accessToken) {
          api.post('/auth/logout').catch(() => {});
        }
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
