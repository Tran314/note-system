import { useRef, useCallback, useEffect } from 'react';

type WorkerMessageType = 'parse' | 'serialize' | 'search' | 'count';

interface WorkerMessage {
  type: WorkerMessageType;
  data: unknown;
}

interface WorkerResponse {
  type: string;
  result: unknown;
  error?: string;
}

interface ParseResult {
  headings: string[];
  wordCount: number;
  links: string[];
}

interface SearchResult {
  matches: Array<{ start: number; end: number; context: string }>;
  total: number;
}

interface SerializeResult {
  html: string;
  text: string;
}

export function useEditorWorker() {
  const workerRef = useRef<Worker | null>(null);
  const callbackIdRef = useRef<number>(0);

  useEffect(() => {
    const workerPath = new URL('./editor.worker.ts', import.meta.url);
    workerRef.current = new Worker(workerPath, { type: 'module' });

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const parseDocument = useCallback((html: string): Promise<ParseResult> => {
    return sendMessage<ParseResult>('parse', html);
  }, []);

  const serializeDocument = useCallback((content: unknown, format: string): Promise<string> => {
    return sendMessage<SerializeResult>('serialize', { content, format }).then(r => r.html);
  }, []);

  const searchDocument = useCallback((html: string, query: string): Promise<SearchResult> => {
    return sendMessage<SearchResult>('search', { html, query });
  }, []);

  const countCharacters = useCallback((text: string): Promise<number> => {
    return sendMessage<number>('count', text);
  }, []);

  const sendMessage = useCallback(<T,>(type: WorkerMessageType, data: unknown): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const callbackId = ++callbackIdRef.current;
      const timeoutId = setTimeout(() => {
        workerRef.current?.removeEventListener('message', handleMessage);
        reject(new Error(`Worker message timeout: ${type}`));
      }, 10000);

      const handleMessage = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.type === `${type}:${callbackId}`) {
          clearTimeout(timeoutId);
          workerRef.current?.removeEventListener('message', handleMessage);
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result as T);
          }
        }
      };

      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.postMessage({ type: `${type}:${callbackId}`, data });
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