import { useCallback } from 'react';

interface ExportOptions {
  format: 'markdown' | 'html' | 'pdf' | 'txt';
  includeMetadata?: boolean;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 笔记导出 Hook
 */
export function useNoteExport() {

  const htmlToMarkdown = useCallback((html: string): string => {
    let md = html;
    
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
    md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n');
    
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
    
    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    
    md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
    
    md = md.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```');
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    
    md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, (_match: string, content: string) => {
      const lines = content.replace(/<[^>]*>/g, '').split('\n');
      return lines.map((line: string) => `> ${line}`).join('\n') + '\n';
    });
    
    md = md.replace(/<ul[^>]*>(.*?)<\/ul>/gi, (_match: string, content: string) => {
      const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
      return items.map((item: string) => `- ${item.replace(/<[^>]*>/g, '')}`).join('\n') + '\n';
    });
    md = md.replace(/<ol[^>]*>(.*?)<\/ol>/gi, (_match: string, content: string) => {
      const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
      return items.map((item: string, i: number) => `${i + 1}. ${item.replace(/<[^>]*>/g, '')}`).join('\n') + '\n';
    });
    
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    
    md = md.replace(/<[^>]*>/g, '');
    
    md = md.replace(/\n{3,}/g, '\n\n');
    
    return md.trim();
  }, []);

  const exportMarkdown = useCallback((note: any, options?: ExportOptions) => {
    let content = '';
    
    if (options?.includeMetadata) {
      content += `---\n`;
      content += `title: ${escapeHtml(note.title)}\n`;
      content += `created: ${note.createdAt}\n`;
      content += `updated: ${note.updatedAt}\n`;
      content += `---\n\n`;
    }
    
    content += `# ${escapeHtml(note.title)}\n\n`;
    content += htmlToMarkdown(note.content || '');
    
    return content;
  }, [htmlToMarkdown]);

  const exportHtml = useCallback((note: any, options?: ExportOptions) => {
    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(note.title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1, h2, h3 { margin-top: 1.5em; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; margin-left: 0; padding-left: 16px; color: #666; }
    img { max-width: 100%; }
  </style>
</head>
<body>
`;
    
    if (options?.includeMetadata) {
      html += `<p><small>创建时间: ${new Date(note.createdAt).toLocaleString('zh-CN')}</small></p>\n`;
      html += `<p><small>更新时间: ${new Date(note.updatedAt).toLocaleString('zh-CN')}</small></p>\n`;
      html += `<hr>\n`;
    }
    
    html += `<h1>${escapeHtml(note.title)}</h1>\n`;
    html += note.content || '';
    html += `\n</body>\n</html>`;
    
    return html;
  }, []);

  const exportTxt = useCallback((note: any) => {
    let txt = `${escapeHtml(note.title)}\n\n`;
    txt += note.content?.replace(/<[^>]*>/g, '').replace(/\n+/g, '\n') || '';
    return txt;
  }, []);

  const exportNote = useCallback(async (
    note: any,
    options: ExportOptions
  ): Promise<void> => {
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (options.format) {
      case 'markdown':
        content = exportMarkdown(note, options);
        filename = `${note.title}.md`;
        mimeType = 'text/markdown';
        break;
      
      case 'html':
        content = exportHtml(note, options);
        filename = `${note.title}.html`;
        mimeType = 'text/html';
        break;
      
      case 'txt':
        content = exportTxt(note);
        filename = `${note.title}.txt`;
        mimeType = 'text/plain';
        break;
      
      case 'pdf':
        const htmlContent = exportHtml(note, options);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.print();
        }
        return;
      
      default:
        throw new Error('Unknown export format');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportMarkdown, exportHtml, exportTxt]);

  return {
    exportNote,
    exportMarkdown,
    exportHtml,
    exportTxt,
    htmlToMarkdown,
  };
}
