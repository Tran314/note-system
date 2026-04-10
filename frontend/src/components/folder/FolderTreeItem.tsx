import { Folder, ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react';

interface FolderTreeItemProps {
  folder: any;
  level: number;
  selectedId: string | null;
  expandedIds: string[];
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, folder: any) => void;
}

function FolderTreeItem({
  folder,
  level,
  selectedId,
  expandedIds,
  onToggle,
  onSelect,
  onContextMenu,
}: FolderTreeItemProps) {
  const hasChildren = folder.children && folder.children.length > 0;
  const isExpanded = expandedIds.includes(folder.id);
  const isSelected = selectedId === folder.id;

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-200 group
          ${level > 0 ? 'ml-4' : ''} 
          ${isSelected ? 'bg-blue-100 text-blue-700' : ''}`}
        onClick={() => onSelect(folder.id)}
        onContextMenu={(e) => onContextMenu(e, folder)}
      >
        {/* 展开/折叠按钮 */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(folder.id);
            }}
            className="p-0.5 hover:bg-gray-300 rounded"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-5" />
        )}

        <Folder size={16} className={isSelected ? 'text-blue-600' : 'text-gray-500'} />
        <span className="text-sm flex-1 truncate">{folder.name}</span>

        {/* 操作按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e, folder);
          }}
          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-300 rounded"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* 子文件夹 */}
      {hasChildren && isExpanded && (
        <div>
          {folder.children.map((child: any) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              level={level + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { FolderTreeItem };