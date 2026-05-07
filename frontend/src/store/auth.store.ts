import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService, User } from '../services/auth.service';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname?: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const result = await authService.login(email, password);
        set({
          user: result.user,
          accessToken: result.token,
          isAuthenticated: true,
        });
        localStorage.setItem('accessToken', result.token);
      },

      register: async (email: string, password: string, nickname?: string) => {
        const user = await authService.register({ email, password, nickname });
        const result = await authService.login(email, password);
        set({
          user: result.user,
          accessToken: result.token,
          isAuthenticated: true,
        });
        localStorage.setItem('accessToken', result.token);
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('accessToken');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
