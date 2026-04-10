import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '../useAutoSave';

// 模拟延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('useAutoSave', () => {
  const mockSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct state', () => {
    const { result } = renderHook(() => useAutoSave(mockSave, 1000));

    expect(result.current.isSaving).toBe(false);
    expect(result.current.lastSaved).toBeNull();
    expect(result.current.hasChanges).toBe(false);
  });

  it('should mark hasChanges when content changes', () => {
    const { result } = renderHook(() => useAutoSave(mockSave, 1000));

    act(() => {
      result.current.setContent('new content');
    });

    expect(result.current.hasChanges).toBe(true);
  });

  it('should auto save after delay', async () => {
    const { result } = renderHook(() => useAutoSave(mockSave, 100));

    act(() => {
      result.current.setContent('content to save');
    });

    // 等待自动保存触发
    await act(async () => {
      await delay(150);
    });

    expect(mockSave).toHaveBeenCalledWith('content to save');
  });

  it('should reset state after save', async () => {
    const { result } = renderHook(() => useAutoSave(mockSave, 100));

    act(() => {
      result.current.setContent('content');
    });

    await act(async () => {
      await delay(150);
    });

    expect(result.current.hasChanges).toBe(false);
    expect(result.current.lastSaved).not.toBeNull();
  });

  it('should cancel pending save on unmount', async () => {
    const { result, unmount } = renderHook(() => useAutoSave(mockSave, 100));

    act(() => {
      result.current.setContent('content');
    });

    unmount();

    await act(async () => {
      await delay(200);
    });

    // 不应该调用保存
    expect(mockSave).not.toHaveBeenCalled();
  });
});