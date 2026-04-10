import { useState, useCallback } from 'react';

interface DragItem {
  id: string;
  type: 'folder' | 'note';
  parentId?: string | null;
}

interface DropResult {
  dragId: string;
  dropId: string;
  position: 'before' | 'after' | 'inside';
}

/**
 * 拖拽排序 Hook
 */
export function useDragAndDrop(
  onReorder: (result: DropResult) => Promise<void>
) {
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside'>('after');
  const [isDragging, setIsDragging] = useState(false);

  // 开始拖拽
  const handleDragStart = useCallback((item: DragItem) => {
    setDragItem(item);
    setIsDragging(true);
  }, []);

  // 结束拖拽
  const handleDragEnd = useCallback(async () => {
    if (dragItem && dropTarget) {
      await onReorder({
        dragId: dragItem.id,
        dropId: dropTarget,
        position: dropPosition,
      });
    }
    setDragItem(null);
    setDropTarget(null);
    setIsDragging(false);
  }, [dragItem, dropTarget, dropPosition, onReorder]);

  // 设置放置目标
  const handleDragOver = useCallback((targetId: string, position: 'before' | 'after' | 'inside') => {
    if (dragItem?.id !== targetId) {
      setDropTarget(targetId);
      setDropPosition(position);
    }
  }, [dragItem]);

  // 取消拖拽
  const handleDragCancel = useCallback(() => {
    setDragItem(null);
    setDropTarget(null);
    setIsDragging(false);
  }, []);

  return {
    dragItem,
    dropTarget,
    dropPosition,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragCancel,
  };
}