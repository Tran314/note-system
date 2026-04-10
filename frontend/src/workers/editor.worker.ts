// Web Worker 用于后台处理密集任务
// 文件位置：frontend/src/workers/editor.worker.ts

// 编辑器性能优化：后台处理大型文档

interface WorkerMessage {
  type: 'parse' | 'serialize' | 'search' | 'count';
  data: any;
}

interface WorkerResponse {
  type: string;
  result: any;
  error?: string;
}

// 处理大型文档解析（性能优化）
function parseLargeDocument(html: string): any {
  const paragraphs = html.split(/<p[^>]*>/gi).filter(Boolean);
  const wordCount = paragraphs.reduce((count: number, p: string) => {
    const text = p.replace(/<[^>]*>/g, '').trim();
    return count + text.split(/\s+/).filter(Boolean).length;
  }, 0);
  
  return {
    paragraphCount: paragraphs.length,
    wordCount,
    characterCount: html.length,
  };
}

// 处理文档序列化（性能优化）
function serializeDocument(content: any, format: string): string {
  switch (format) {
    case 'markdown':
      return convertToMarkdown(content);
    case 'html':
      return convertToHtml(content);
    case 'txt':
      return convertToTxt(content);
    default:
      return '';
  }
}

// 文档内搜索（性能优化）
function searchInDocument(html: string, query: string): Array<{ index: number; text: string }> {
  const text = html.replace(/<[^>]*>/g, '');
  const regex = new RegExp(query, 'gi');
  const matches: Array<{ index: number; text: string }> = [];
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      text: match[0],
    });
  }
  
  return matches;
}

// 转换函数
function convertToMarkdown(content: any): string {
  // 简化版 Markdown 转换
  return content.text || '';
}

function convertToHtml(content: any): string {
  return content.html || '';
}

function convertToTxt(content: any): string {
  return (content.text || '').replace(/<[^>]*>/g, '');
}

// Worker 主线程
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;
  
  try {
    let result: any;
    
    switch (type) {
      case 'parse':
        result = parseLargeDocument(data);
        break;
      case 'serialize':
        result = serializeDocument(data.content, data.format);
        break;
      case 'search':
        result = searchInDocument(data.html, data.query);
        break;
      case 'count':
        result = { count: (data.text || '').length };
        break;
      default:
        throw new Error(`Unknown worker type: ${type}`);
    }
    
    const response: WorkerResponse = { type, result };
    self.postMessage(response);
  } catch (error: any) {
    const response: WorkerResponse = { 
      type, 
      result: null, 
      error: error.message 
    };
    self.postMessage(response);
  }
};

export {};