import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize as not authenticated', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should restore auth from localStorage', () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'nebula_token') return 'mock-token';
      if (key === 'nebula_user') return JSON.stringify(mockUser);
      return null;
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should handle login', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    const mockUser = { id: '1', email: 'test@example.com' };

    act(() => {
      result.current.login('mock-token', mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('nebula_token', 'mock-token');
  });

  it('should handle logout', () => {
    localStorageMock.getItem.mockReturnValue('mock-token');

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('nebula_token');
  });
});