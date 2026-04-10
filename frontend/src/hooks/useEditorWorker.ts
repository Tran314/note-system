import { useRef, useCallback, useEffect } from 'react';

interface WorkerMessage {
  type: 'parse' | 'serialize' | 'search' | 'count';
  data: any;
}

interface WorkerResponse {
  type: string;
  result: any;
  error?: string;
}

/**
 * Web Worker Hook（渲染进程性能优化）
 * 用于后台处理大型文档操作
 */
export function useEditorWorker() {
  const workerRef = useRef<Worker | null>(null);

  // 初始化 Worker
  useEffect(() => {
    // Worker 文件路径
    const workerPath = new URL('./editor.worker.ts', import.meta.url);
    workerRef.current = new Worker(workerPath, { type: 'module' });

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // 解析大型文档
  const parseDocument = useCallback((html: string): Promise<any> => {
    return sendMessage('parse', html);
  }, []);

  // 序列化文档
  const serializeDocument = useCallback((content: any, format: string): Promise<string> => {
    return sendMessage('serialize', { content, format });
  }, []);

  // 文档内搜索
  const searchDocument = useCallback((html: string, query: string): Promise<any> => {
    return sendMessage('search', { html, query });
  }, []);

  // 统计字数
  const countCharacters = useCallback((text: string): Promise<number> => {
    return sendMessage('count', text);
  }, []);

  // 发送消息到 Worker
  const sendMessage = useCallback((type: WorkerMessage['type'], data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const handleMessage = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.type === type) {
          workerRef.current?.removeEventListener('message', handleMessage);
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }
        }
      };

      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.postMessage({ type, data });
    });
  }, []);

  return {
    parseDocument,
    serializeDocument,
    searchDocument,
    countCharacters,
    isReady: !!workerRef.current,
  };
}