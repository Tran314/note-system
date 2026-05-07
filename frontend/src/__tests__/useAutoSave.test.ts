import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should debounce save operations', async () => {
    const { useAutoSave } = await import('../hooks/useAutoSave');
    const onSave = vi.fn().mockResolvedValue(undefined);

    renderHook(() =>
      useAutoSave({ delay: 1000, onSave })
    );

    vi.advanceTimersByTime(1000);

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('should not save when disabled', async () => {
    const { useAutoSave } = await import('../hooks/useAutoSave');
    const onSave = vi.fn().mockResolvedValue(undefined);

    renderHook(() =>
      useAutoSave({ enabled: false, delay: 1000, onSave })
    );

    vi.advanceTimersByTime(1000);

    expect(onSave).not.toHaveBeenCalled();
  });

  it('should reset timer on re-render', async () => {
    const { useAutoSave } = await import('../hooks/useAutoSave');
    const onSave = vi.fn().mockResolvedValue(undefined);

    const { rerender } = renderHook(
      ({ delay }) => useAutoSave({ delay, onSave }),
      { initialProps: { delay: 1000 } }
    );

    vi.advanceTimersByTime(500);
    rerender({ delay: 1000 });
    vi.advanceTimersByTime(500);

    expect(onSave).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('should expose triggerSave function', async () => {
    const { useAutoSave } = await import('../hooks/useAutoSave');
    const onSave = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useAutoSave({ delay: 1000, onSave })
    );

    expect(result.current.triggerSave).toBeDefined();
    expect(typeof result.current.triggerSave).toBe('function');
  });
});
