import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from '../useDragAndDrop';

describe('useDragAndDrop', () => {
  const mockItems = [
    { id: '1', name: 'Item 1', order: 0 },
    { id: '2', name: 'Item 2', order: 1 },
    { id: '3', name: 'Item 3', order: 2 },
  ];

  const mockOnReorder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with items', () => {
    const { result } = renderHook(() => useDragAndDrop(mockItems, mockOnReorder));

    expect(result.current.items).toEqual(mockItems);
    expect(result.current.draggedItem).toBeNull();
    expect(result.current.dropTarget).toBeNull();
  });

  it('should handle drag start', () => {
    const { result } = renderHook(() => useDragAndDrop(mockItems, mockOnReorder));

    act(() => {
      result.current.handleDragStart('1');
    });

    expect(result.current.draggedItem).toBe('1');
  });

  it('should handle drag over', () => {
    const { result } = renderHook(() => useDragAndDrop(mockItems, mockOnReorder));

    act(() => {
      result.current.handleDragStart('1');
      result.current.handleDragOver('2', 'before');
    });

    expect(result.current.dropTarget).toEqual({ id: '2', position: 'before' });
  });

  it('should handle drop and reorder items', () => {
    const { result } = renderHook(() => useDragAndDrop(mockItems, mockOnReorder));

    act(() => {
      result.current.handleDragStart('1');
      result.current.handleDragOver('3', 'before');
      result.current.handleDrop();
    });

    expect(mockOnReorder).toHaveBeenCalled();
    const reorderedItems = mockOnReorder.mock.calls[0][0];
    expect(reorderedItems.length).toBe(3);
  });

  it('should handle drag end', () => {
    const { result } = renderHook(() => useDragAndDrop(mockItems, mockOnReorder));

    act(() => {
      result.current.handleDragStart('1');
      result.current.handleDragOver('2', 'before');
    });

    expect(result.current.draggedItem).toBe('1');

    act(() => {
      result.current.handleDragEnd();
    });

    expect(result.current.draggedItem).toBeNull();
    expect(result.current.dropTarget).toBeNull();
  });

  it('should not reorder if dropped on itself', () => {
    const { result } = renderHook(() => useDragAndDrop(mockItems, mockOnReorder));

    act(() => {
      result.current.handleDragStart('1');
      result.current.handleDragOver('1', 'before');
      result.current.handleDrop();
    });

    // 不应该调用 onReorder
    expect(mockOnReorder).not.toHaveBeenCalled();
  });
});