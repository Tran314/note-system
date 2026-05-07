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

    const mockOnReorder = vi.fn();
    const { result } = require('@testing-library/react').renderHook(() =>
      useDragAndDrop(mockOnReorder)
    );

    expect(result.current.isDragging).toBe(false);
    expect(typeof result.current.handleDragStart).toBe('function');
    expect(typeof result.current.handleDragEnd).toBe('function');
    expect(typeof result.current.handleDragOver).toBe('function');
    expect(typeof result.current.handleDragCancel).toBe('function');
  });

  it('should track dragging state', async () => {
    const { useDragAndDrop } = await import('../hooks/useDragAndDrop');

    const mockOnReorder = vi.fn();
    const { result } = require('@testing-library/react').renderHook(() =>
      useDragAndDrop(mockOnReorder)
    );

    result.current.handleDragStart({ id: 'item-1', type: 'folder' });

    expect(result.current.isDragging).toBe(true);
    expect(result.current.dragItem?.id).toBe('item-1');
  });
});