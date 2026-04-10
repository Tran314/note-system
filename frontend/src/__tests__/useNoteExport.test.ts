import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNoteExport } from '../hooks/useNoteExport';

describe('useNoteExport', () => {
  const mockNote = {
    id: '1',
    title: 'Test Note',
    content: '<h1>Title</h1><p>Content paragraph</p>',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  };

  it('should export to markdown', () => {
    const { result } = renderHook(() => useNoteExport());

    const markdown = result.current.exportMarkdown(mockNote, { format: 'markdown', includeMetadata: false });

    expect(markdown).toContain('# Test Note');
    expect(markdown).toContain('Title');
    expect(markdown).toContain('Content paragraph');
  });

  it('should export to html', () => {
    const { result } = renderHook(() => useNoteExport());

    const html = result.current.exportHtml(mockNote, { format: 'html', includeMetadata: false });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Test Note</title>');
    expect(html).toContain('Content paragraph');
  });

  it('should export to txt', () => {
    const { result } = renderHook(() => useNoteExport());

    const txt = result.current.exportTxt(mockNote);

    expect(txt).toContain('Test Note');
    expect(txt).toContain('Content paragraph');
  });

  it('should include metadata when requested', () => {
    const { result } = renderHook(() => useNoteExport());

    const markdown = result.current.exportMarkdown(mockNote, { format: 'markdown', includeMetadata: true });

    expect(markdown).toContain('---');
    expect(markdown).toContain('title: Test Note');
  });

  it('should convert html to markdown correctly', () => {
    const { result } = renderHook(() => useNoteExport());

    const html = '<h1>Heading</h1><p><strong>Bold</strong> text</p>';
    const markdown = result.current.htmlToMarkdown(html);

    expect(markdown).toContain('# Heading');
    expect(markdown).toContain('**Bold**');
  });
});