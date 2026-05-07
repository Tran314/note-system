import { useEffect, useCallback, useRef } from 'react';

interface UseAutoSaveOptions {
  enabled?: boolean;
  delay?: number;
  onSave: () => Promise<void>;
}

export function useAutoSave({ enabled = true, delay = 2000, onSave }: UseAutoSaveOptions) {
  const saveRef = useRef(onSave);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    saveRef.current = onSave;
  }, [onSave]);

  const triggerSave = useCallback(() => {
    if (!enabled) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      saveRef.current();
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [enabled, delay]);

  useEffect(() => {
    const cleanup = triggerSave();
    return cleanup;
  }, [triggerSave]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { triggerSave };
}
