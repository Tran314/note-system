import { useEffect, useCallback } from 'react';

type Modifier = 'ctrl' | 'shift' | 'alt' | 'meta';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
  priority?: number;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], priority = 0) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const sorted = [...shortcuts].sort((a, b) => (b.priority || 0) - (a.priority || 0));

      for (const shortcut of sorted) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlPressed = event.ctrlKey || event.metaKey;
        const shiftPressed = event.shiftKey;
        const altPressed = event.altKey;

        const ctrlMatch = !shortcut.ctrl || ctrlPressed;
        const shiftMatch = !shortcut.shift || shiftPressed;
        const altMatch = !shortcut.alt || altPressed;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export const editorShortcuts = {
  bold: { key: 'b', ctrl: true, description: '加粗', priority: 100 },
  italic: { key: 'i', ctrl: true, description: '斜体', priority: 100 },
  underline: { key: 'u', ctrl: true, description: '下划线', priority: 100 },
  save: { key: 's', ctrl: true, description: '保存', priority: 100 },
  newNote: { key: 'n', ctrl: true, description: '新建笔记', priority: 100 },
  search: { key: 'k', ctrl: true, description: '搜索', priority: 100 },
  escape: { key: 'Escape', description: '取消/返回', priority: 1 },
};