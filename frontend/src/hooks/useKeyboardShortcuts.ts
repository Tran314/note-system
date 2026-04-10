import { useEffect, useCallback } from 'react';

type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
};

/**
 * 键盘快捷键 Hook
 * @param shortcuts 快捷键配置数组
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlPressed = event.ctrlKey || event.metaKey;

        if (
          keyMatch &&
          (!shortcut.ctrl || ctrlPressed) &&
          (!shortcut.shift || event.shiftKey) &&
          (!shortcut.alt || event.altKey)
        ) {
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

/**
 * 编辑器快捷键预设
 */
export const editorShortcuts = {
  bold: { key: 'b', ctrl: true, description: '加粗' },
  italic: { key: 'i', ctrl: true, description: '斜体' },
  underline: { key: 'u', ctrl: true, description: '下划线' },
  save: { key: 's', ctrl: true, description: '保存' },
  newNote: { key: 'n', ctrl: true, description: '新建笔记' },
  search: { key: 'k', ctrl: true, description: '搜索' },
  escape: { key: 'Escape', description: '取消/返回' },
};