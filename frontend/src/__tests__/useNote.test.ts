import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNote } from '../useNote';

// 模拟 API 调用
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock('../services/api', () => ({
  api: mockApi,
}));

describe('useNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch note by id', async () => {
    const mockNote = {
      id: '1',
      title: 'Test Note',
      content: 'Content',
    };

    mockApi.get.mockResolvedValue({ data: mockNote });

    const { result } = renderHook(() => useNote('1'));

    // 等待异步操作完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(mockApi.get).toHaveBeenCalledWith('/notes/1');
  });

  it('should create new note', async () => {
    const newNote = {
      title: 'New Note',
      content: 'New Content',
    };

    mockApi.post.mockResolvedValue({ data: { id: '2', ...newNote } });

    const { result } = renderHook(() => useNote());

    await act(async () => {
      await result.current.createNote(newNote);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/notes', newNote);
  });

  it('should update note', async () => {
    const updateData = {
      title: 'Updated Title',
    };

    mockApi.put.mockResolvedValue({ data: { id: '1', ...updateData } });

    const { result } = renderHook(() => useNote('1'));

    await act(async () => {
      await result.current.updateNote(updateData);
    });

    expect(mockApi.put).toHaveBeenCalledWith('/notes/1', updateData);
  });

  it('should delete note', async () => {
    mockApi.delete.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useNote('1'));

    await act(async () => {
      await result.current.deleteNote();
    });

    expect(mockApi.delete).toHaveBeenCalledWith('/notes/1');
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useNote('1'));

    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', async () => {
    mockApi.get.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useNote('invalid-id'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.error).toBeDefined();
  });
});