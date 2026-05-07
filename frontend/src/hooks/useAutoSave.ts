import { useEffect, useCallback } from 'react';
import { useNoteStore } from '../store/note.store';

interface UseAutoSaveOptions {
  noteId: string;
  delay?: number;
}

/**
 * 笔记自动保存 Hook
 * @param noteId 笔记ID
 * @param delay 防抖延迟（毫秒），默认 2000ms
 */
export function useAutoSave({ noteId, delay = 2000 }: UseAutoSaveOptions) {
  const { updateNote, currentNote } = useNoteStore();

  const save = useCallback(async () => {
    if (!currentNote || currentNote.id !== noteId) return;
    
    try {
      await updateNote(noteId, {
        title: currentNote.title,
        content: currentNote.content ?? undefined,
      });
      return true;
    } catch (error) {
      console.error('Auto-save failed:', error);
      return false;
    }
  }, [noteId, currentNote, updateNote]);

  useEffect(() => {
    if (!currentNote || currentNote.id !== noteId) return;

    const timer = setTimeout(() => {
      save();
    }, delay);

    return () => clearTimeout(timer);
  }, [currentNote?.content, currentNote?.title, delay, noteId, save]);

  return { save };
}