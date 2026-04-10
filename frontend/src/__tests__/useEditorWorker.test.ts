import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditorWorker } from '../useEditorWorker';

// 模拟 Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  
  postMessage(data: any) {
    // 模拟异步响应
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', {
          data: { type: data.type, result: 'mock result' }
        }));
      }
    }, 10);
  }
  
  terminate() {}
}

Object.defineProperty(window, 'Worker', {
  value: MockWorker,
});

describe('useEditorWorker', () => {
  it('should initialize worker', () => {
    const { result } = renderHook(() => useEditorWorker());

    expect(result.current.isReady).toBe(true);
  });

  it('should parse document', async () => {
    const { result } = renderHook(() => useEditorWorker());

    const parsePromise = act(async () => {
      return result.current.parseDocument('<p>test</p>');
    });

    const result_data = await parsePromise;
    expect(result_data).toBeDefined();
  });

  it('should serialize document', async () => {
    const { result } = renderHook(() => useEditorWorker());

    const serializePromise = act(async () => {
      return result.current.serializeDocument({ text: 'test' }, 'markdown');
    });

    const result_data = await serializePromise;
    expect(result_data).toBeDefined();
  });

  it('should search in document', async () => {
    const { result } = renderHook(() => useEditorWorker());

    const searchPromise = act(async () => {
      return result.current.searchDocument('<p>test content</p>', 'test');
    });

    const result_data = await searchPromise;
    expect(result_data).toBeDefined();
  });

  it('should count characters', async () => {
    const { result } = renderHook(() => useEditorWorker());

    const countPromise = act(async () => {
      return result.current.countCharacters('test string');
    });

    const result_data = await countPromise;
    expect(result_data).toBeDefined();
  });
});