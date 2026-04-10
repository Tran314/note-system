import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  const mockHandlers = {
    onSave: vi.fn(),
    onNew: vi.fn(),
    onSearch: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register keyboard shortcuts', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(mockHandlers));

    expect(result.current.shortcuts).toBeDefined();
    expect(Array.isArray(result.current.shortcuts)).toBe(true);
  });

  it('should handle Ctrl+S for save', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers));

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });

    document.dispatchEvent(event);

    expect(mockHandlers.onSave).toHaveBeenCalled();
  });

  it('should handle Ctrl+N for new', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers));

    const event = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
    });

    document.dispatchEvent(event);

    expect(mockHandlers.onNew).toHaveBeenCalled();
  });

  it('should handle Ctrl+F for search', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers));

    const event = new KeyboardEvent('keydown', {
      key: 'f',
      ctrlKey: true,
    });

    document.dispatchEvent(event);

    expect(mockHandlers.onSearch).toHaveBeenCalled();
  });

  it('should prevent default for handled shortcuts', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers));

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      cancelable: true,
    });

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    document.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not call handlers for unregistered keys', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers));

    const event = new KeyboardEvent('keydown', {
      key: 'x',
      ctrlKey: true,
    });

    document.dispatchEvent(event);

    expect(mockHandlers.onSave).not.toHaveBeenCalled();
    expect(mockHandlers.onNew).not.toHaveBeenCalled();
    expect(mockHandlers.onSearch).not.toHaveBeenCalled();
    expect(mockHandlers.onDelete).not.toHaveBeenCalled();
  });
});