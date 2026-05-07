import { Edit2, Trash2 } from 'lucide-react';
import type { Folder, Tag } from '../../types/api.types';

interface ContextMenuState {
  type: 'folder' | 'tag';
  id: string;
  x: number;
  y: number;
}

interface SidebarContextMenuProps {
  contextMenu: ContextMenuState | null;
  folders: Folder[];
  tags: Tag[];
  onRename: (type: 'folder' | 'tag', id: string, name: string) => void;
  onDelete: (type: 'folder' | 'tag', id: string, name: string) => void;
  onClose: () => void;
  t: (key: string) => string;
}

export function SidebarContextMenu({
  contextMenu,
  folders,
  tags,
  onRename,
  onDelete,
  onClose,
  t,
}: SidebarContextMenuProps) {
  if (!contextMenu) return null;

  const target = contextMenu.type === 'folder'
    ? folders.find(f => f.id === contextMenu.id)
    : tags.find(tag => tag.id === contextMenu.id);

  const name = target && 'name' in target ? target.name : '';

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px]"
        style={{ left: contextMenu.x, top: contextMenu.y }}
      >
        <button
          className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          onClick={() => {
            onRename(contextMenu.type, contextMenu.id, name);
          }}
        >
          <Edit2 size={14} />
          {t('common.rename')}
        </button>
        <button
          className="w-full px-3 py-1.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
          onClick={() => {
            onDelete(contextMenu.type, contextMenu.id, name);
          }}
        >
          <Trash2 size={14} />
          {t('common.delete')}
        </button>
      </div>
    </>
  );
}
