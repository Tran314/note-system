import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useDragAndDrop', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  it('should be defined as a hook', async () => {
    const { useDragAndDrop } = await import('../hooks/useDragAndDrop');
    expect(useDragAndDrop).toBeDefined();
  });

  it('should return drag state and handlers', async () => {
    const { useDragAndDrop } = await import('../hooks/useDragAndDrop');

    const mockCallback = vi.fn();
    const { result } = require('@testing-library/react').renderHook(() =>
      useDragAndDrop({ onDragStart: mockCallback, onDragEnd: mockCallback })
    );

    expect(result.current.isDragging).toBe(false);
    expect(typeof result.current.dragStart).toBe('function');
    expect(typeof result.current.dragEnd).toBe('function');
    expect(typeof result.current.dragOver).toBe('function');
    expect(typeof result.current.drop).toBe('function');
  });

  it('should track dragging state', async () => {
    const { useDragAndDrop } = await import('../hooks/useDragAndDrop');

    const mockCallback = vi.fn();
    const { result } = require('@testing-library/react').renderHook(() =>
      useDragAndDrop({ onDragStart: mockCallback, onDragEnd: mockCallback })
    );

    result.current.dragStart('item-1');

    expect(result.current.isDragging).toBe(true);
    expect(result.current.draggedId).toBe('item-1');
  });
});