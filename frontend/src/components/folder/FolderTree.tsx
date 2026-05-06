import { Folder as FolderIcon, ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react';
import type { Folder } from '../../types/api.types';

interface FolderTreeProps {
  folders: Folder[];
  expandedFolders: string[];
  selectedFolder: string | null;
  onToggleFolder: (folderId: string) => void;
  onSelectFolder: (folderId: string) => void;
  onContextMenu: (type: 'folder' | 'tag', id: string, x: number, y: number) => void;
  level?: number;
}

export function FolderTree({
  folders,
  expandedFolders,
  selectedFolder,
  onToggleFolder,
  onSelectFolder,
  onContextMenu,
  level = 0,
}: FolderTreeProps) {
  return (
    <>
      {folders.map((folder) => {
        const hasChildren = folder.children && folder.children.length > 0;
        const isExpanded = expandedFolders.includes(folder.id);
        const isSelected = selectedFolder === folder.id;

        return (
          <div key={folder.id}>
            <div
              className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer
                group ${level > 0 ? 'ml-4' : ''}
                ${isSelected
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              onClick={() => onSelectFolder(folder.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                onContextMenu('folder', folder.id, e.clientX, e.clientY);
              }}
            >
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFolder(folder.id);
                  }}
                  className="p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <span className="w-5" />
              )}

              <FolderIcon size={16} className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'} />
              <span className="text-sm flex-1 truncate">{folder.name}</span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onContextMenu('folder', folder.id, e.clientX, e.clientY);
                }}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
              >
                <MoreHorizontal size={14} />
              </button>
            </div>

            {hasChildren && isExpanded && (
              <FolderTree
                folders={folder.children}
                expandedFolders={expandedFolders}
                selectedFolder={selectedFolder}
                onToggleFolder={onToggleFolder}
                onSelectFolder={onSelectFolder}
                onContextMenu={onContextMenu}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
