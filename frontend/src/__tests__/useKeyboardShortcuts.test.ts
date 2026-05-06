import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useKeyboardShortcuts', () => {
  const mockAddEventListener = vi.fn();
  const mockRemoveEventListener = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('document', {
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register keydown event listener', async () => {
    const { useKeyboardShortcuts } = await import('../hooks/useKeyboardShortcuts');

    const callback = vi.fn();
    const shortcuts = [
      { key: 's', ctrl: true, action: callback, description: 'Save' },
    ];

    require('@testing-library/react').renderHook(() =>
      useKeyboardShortcuts(shortcuts)
    );

    expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should unregister event listener on cleanup', async () => {
    const { useKeyboardShortcuts } = await import('../hooks/useKeyboardShortcuts');

    const callback = vi.fn();
    const shortcuts = [
      { key: 's', ctrl: true, action: callback, description: 'Save' },
    ];

    const { unmount } = require('@testing-library/react').renderHook(() =>
      useKeyboardShortcuts(shortcuts)
    );

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should call action when correct shortcut is pressed', async () => {
    const { useKeyboardShortcuts } = await import('../hooks/useKeyboardShortcuts');

    const saveCallback = vi.fn();
    const shortcuts = [
      { key: 's', ctrl: true, action: saveCallback, description: 'Save' },
    ];

    require('@testing-library/react').renderHook(() =>
      useKeyboardShortcuts(shortcuts)
    );

    const eventHandler = mockAddEventListener.mock.calls[0][1];
    const mockEvent = {
      key: 's',
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault: vi.fn(),
    };

    eventHandler(mockEvent);

    expect(saveCallback).toHaveBeenCalledTimes(1);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('should respect priority ordering', async () => {
    const { useKeyboardShortcuts } = await import('../hooks/useKeyboardShortcuts');

    const highPriorityCallback = vi.fn();
    const lowPriorityCallback = vi.fn();

    const shortcuts = [
      { key: 's', ctrl: true, action: lowPriorityCallback, description: 'Low priority save', priority: 1 },
      { key: 's', ctrl: true, action: highPriorityCallback, description: 'High priority save', priority: 100 },
    ];

    require('@testing-library/react').renderHook(() =>
      useKeyboardShortcuts(shortcuts)
    );

    const eventHandler = mockAddEventListener.mock.calls[0][1];
    const mockEvent = {
      key: 's',
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault: vi.fn(),
    };

    eventHandler(mockEvent);

    expect(highPriorityCallback).toHaveBeenCalledTimes(1);
    expect(lowPriorityCallback).not.toHaveBeenCalled();
  });

  it('should not trigger when modifier key does not match', async () => {
    const { useKeyboardShortcuts } = await import('../hooks/useKeyboardShortcuts');

    const callback = vi.fn();
    const shortcuts = [
      { key: 's', ctrl: true, action: callback, description: 'Save' },
    ];

    require('@testing-library/react').renderHook(() =>
      useKeyboardShortcuts(shortcuts)
    );

    const eventHandler = mockAddEventListener.mock.calls[0][1];
    const mockEvent = {
      key: 's',
      ctrlKey: false,
      metaKey: false,
      preventDefault: vi.fn(),
    };

    eventHandler(mockEvent);

    expect(callback).not.toHaveBeenCalled();
  });
});