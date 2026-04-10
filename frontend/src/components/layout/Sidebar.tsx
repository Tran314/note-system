import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFolderStore } from '../../store/folder.store';
import { useTagStore } from '../../store/tag.store';
import { Folder, Tag, Plus, ChevronRight, ChevronDown, FileText, Trash2, Edit2, MoreHorizontal } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';

interface SidebarProps {
  onFolderSelect?: (folderId: string | null) => void;
  onTagSelect?: (tagId: string | null) => void;
  selectedFolder?: string | null;
  selectedTag?: string | null;
}

function Sidebar({ onFolderSelect, onTagSelect, selectedFolder, selectedTag }: SidebarProps) {
  const navigate = useNavigate();
  const { folders, createFolder, deleteFolder } = useFolderStore();
  const { tags, createTag, deleteTag } = useTagStore();
  
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showNewTag, setShowNewTag] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6B7280');
  const [contextMenu, setContextMenu] = useState<{ type: 'folder' | 'tag'; id: string; x: number; y: number } | null>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder({ name: newFolderName.trim() });
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    await createTag({ name: newTagName.trim(), color: newTagColor });
    setNewTagName('');
    setNewTagColor('#6B7280');
    setShowNewTag(false);
  };

  const renderFolderTree = (folderList: any[], level = 0) => {
    return folderList.map((folder) => {
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
            onClick={() => {
              onFolderSelect?.(folder.id);
              navigate(`/notes?folderId=${folder.id}`);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ type: 'folder', id: folder.id, x: e.clientX, y: e.clientY });
            }}
          >
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                }}
                className="p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span className="w-5" />
            )}
            
            <Folder size={16} className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'} />
            <span className="text-sm flex-1 truncate">{folder.name}</span>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setContextMenu({ type: 'folder', id: folder.id, x: e.clientX, y: e.clientY });
              }}
              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
          
          {hasChildren && isExpanded && renderFolderTree(folder.children, level + 1)}
        </div>
      );
    });
  };

  const presetColors = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16',
    '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6',
    '#EC4899', '#6B7280', '#64748B', '#1F2937',
  ];

  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col h-full">
      {/* 新建笔记按钮 */}
      <div className="p-3">
        <Button onClick={() => navigate('/notes/new')} className="w-full">
          <Plus size={16} />
          新建笔记
        </Button>
      </div>

      {/* 所有笔记 */}
      <div className="px-2 py-1">
        <button
          onClick={() => {
            onFolderSelect?.(null);
            onTagSelect?.(null);
            navigate('/notes');
          }}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded 
            ${!selectedFolder && !selectedTag 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          <FileText size={16} className={!selectedFolder && !selectedTag ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'} />
          <span className="text-sm">所有笔记</span>
        </button>
      </div>

      {/* 文件夹列表 */}
      <div className="px-2 py-1 mt-2">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">文件夹</span>
          <button onClick={() => setShowNewFolder(true)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="新建文件夹">
            <Plus size={14} />
          </button>
        </div>
        
        {folders.length > 0 ? renderFolderTree(folders) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 px-2 py-1">暂无文件夹</p>
        )}
      </div>

      {/* 标签列表 */}
      <div className="px-2 py-1 mt-2 flex-1">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">标签</span>
          <button onClick={() => setShowNewTag(true)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="新建标签">
            <Plus size={14} />
          </button>
        </div>
        
        <div className="space-y-0.5">
          {tags.map((tag) => {
            const isSelected = selectedTag === tag.id;
            return (
              <div
                key={tag.id}
                onClick={() => {
                  onTagSelect?.(tag.id);
                  navigate(`/notes?tagId=${tag.id}`);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ type: 'tag', id: tag.id, x: e.clientX, y: e.clientY });
                }}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer group 
                  ${isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                <Tag size={14} style={{ color: tag.color }} />
                <span className="text-sm flex-1 truncate">{tag.name}</span>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
              </div>
            );
          })}
          {tags.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 px-2 py-1">暂无标签</p>
          )}
        </div>
      </div>

      {/* 回收站 */}
      <div className="px-2 py-1 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <button
          onClick={() => navigate('/notes?trash=true')}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          <Trash2 size={16} />
          <span className="text-sm">回收站</span>
        </button>
      </div>

      {/* 新建文件夹弹窗 */}
      <Modal isOpen={showNewFolder} onClose={() => setShowNewFolder(false)} title="新建文件夹" footer={
        <>
          <Button variant="ghost" onClick={() => setShowNewFolder(false)}>取消</Button>
          <Button onClick={handleCreateFolder}>创建</Button>
        </>
      }>
        <Input placeholder="文件夹名称" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} autoFocus />
      </Modal>

      {/* 新建标签弹窗 */}
      <Modal isOpen={showNewTag} onClose={() => setShowNewTag(false)} title="新建标签" footer={
        <>
          <Button variant="ghost" onClick={() => setShowNewTag(false)}>取消</Button>
          <Button onClick={handleCreateTag}>创建</Button>
        </>
      }>
        <div className="space-y-3">
          <Input placeholder="标签名称" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} autoFocus />
          <div>
            <label className="block text-sm font-medium mb-2">标签颜色</label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button key={color} onClick={() => setNewTagColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${newTagColor === color ? 'border-gray-800 dark:border-gray-200 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* 右键菜单 */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => setContextMenu(null)}>
              <Edit2 size={14} />
              重命名
            </button>
            <button className="w-full px-3 py-1.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
              onClick={async () => {
                if (contextMenu.type === 'folder') await deleteFolder(contextMenu.id);
                else await deleteTag(contextMenu.id);
                setContextMenu(null);
              }}
            >
              <Trash2 size={14} />
              删除
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

export default Sidebar;