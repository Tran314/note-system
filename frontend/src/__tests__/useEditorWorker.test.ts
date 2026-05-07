import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useEditorWorker', () => {
  const mockPostMessage = vi.fn();
  const mockTerminate = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('Worker', vi.fn().mockImplementation(() => ({
      postMessage: mockPostMessage,
      terminate: mockTerminate,
      addEventListener: vi.fn((event, handler) => {
        if (event === 'message') {
          vi.fn((e) => handler(e));
        }
      }),
      removeEventListener: vi.fn(),
    })));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('should be defined as a hook', async () => {
    const { useEditorWorker } = await import('../hooks/useEditorWorker');
    expect(useEditorWorker).toBeDefined();
  });

  it('should return worker methods', async () => {
    const { useEditorWorker } = await import('../hooks/useEditorWorker');

    const { result } = require('@testing-library/react').renderHook(() => useEditorWorker());

    expect(typeof result.current.parseDocument).toBe('function');
    expect(typeof result.current.serializeDocument).toBe('function');
    expect(typeof result.current.searchDocument).toBe('function');
    expect(typeof result.current.countCharacters).toBe('function');
    expect(typeof result.current.isReady).toBe('boolean');
  });

  it('should call worker postMessage when sending messages', async () => {
    const { useEditorWorker } = await import('../hooks/useEditorWorker');

    const { result } = require('@testing-library/react').renderHook(() => useEditorWorker());

    mockPostMessage.mockImplementation(() => {
      const handler = vi.fn();
      handler({ type: 'parse:1', result: { headings: [], wordCount: 0, links: [] }, error: undefined });
    });

    result.current.parseDocument('<h1>Test</h1>');

    await vi.waitFor(() => {
      expect(mockPostMessage).toHaveBeenCalled();
    });
  });
});