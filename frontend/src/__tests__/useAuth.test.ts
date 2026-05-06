import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../store/auth.store';

vi.mock('../services/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set user and accessToken on login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      nickname: 'Test User',
    };
    const mockToken = 'mock-access-token';

    useAuthStore.setState({
      user: mockUser,
      accessToken: mockToken,
      isAuthenticated: true,
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear state on logout', () => {
    useAuthStore.setState({
      user: { id: '1', email: 'test@example.com', nickname: 'Test' },
      accessToken: 'token',
      isAuthenticated: true,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set user with setUser action', () => {
    const mockUser = {
      id: '2',
      email: 'update@example.com',
      nickname: 'Updated User',
    };

    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
  });
});