import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFolderStore } from '../../store/folder.store';
import { useTagStore } from '../../store/tag.store';
<<<<<<< Updated upstream
import {
  Folder,
  Tag,
  Plus,
  ChevronRight,
  ChevronDown,
  FileText,
  Trash2,
  Edit2,
  MoreHorizontal,
  Search,
} from 'lucide-react';
=======
import { Folder as FolderIcon, Tag as TagIcon, Plus, FileText, Trash2 } from 'lucide-react';
>>>>>>> Stashed changes
import { Button } from '../common/Button';
import { FolderTree } from '../folder/FolderTree';
import { TagList } from '../folder/TagList';
import { SidebarDialogs } from '../folder/SidebarDialogs';
import { SidebarContextMenu } from '../folder/SidebarContextMenu';
import type { Folder, Tag } from '../../types/api.types';

interface SidebarProps {
  onFolderSelect?: (folderId: string | null) => void;
  onTagSelect?: (tagId: string | null) => void;
  selectedFolder?: string | null;
  selectedTag?: string | null;
}

const SIDEBAR_EXPANDED_FOLDERS_KEY = 'sidebar-expanded-folders';
const SIDEBAR_FOLDER_QUERY_KEY = 'sidebar-folder-query';
const SIDEBAR_TAG_QUERY_KEY = 'sidebar-tag-query';

const readStoredArray = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
};

const readStoredText = (key: string) => {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
};

function Sidebar({ onFolderSelect, onTagSelect, selectedFolder, selectedTag }: SidebarProps) {
  const navigate = useNavigate();
  const { folders, createFolder, deleteFolder, updateFolder } = useFolderStore();
  const { tags, createTag, deleteTag } = useTagStore();

<<<<<<< Updated upstream
  const [expandedFolders, setExpandedFolders] = useState<string[]>(() => readStoredArray(SIDEBAR_EXPANDED_FOLDERS_KEY));
=======
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
>>>>>>> Stashed changes
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showNewTag, setShowNewTag] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6B7280');
  const [folderQuery, setFolderQuery] = useState(() => readStoredText(SIDEBAR_FOLDER_QUERY_KEY));
  const [tagQuery, setTagQuery] = useState(() => readStoredText(SIDEBAR_TAG_QUERY_KEY));
  const [contextMenu, setContextMenu] = useState<{ type: 'folder' | 'tag'; id: string; x: number; y: number } | null>(null);

<<<<<<< Updated upstream
  useEffect(() => {
    localStorage.setItem(SIDEBAR_EXPANDED_FOLDERS_KEY, JSON.stringify(expandedFolders));
  }, [expandedFolders]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_FOLDER_QUERY_KEY, folderQuery);
  }, [folderQuery]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_TAG_QUERY_KEY, tagQuery);
  }, [tagQuery]);
=======
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ type: 'folder' | 'tag'; id: string; name: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'folder' | 'tag'; id: string; name: string } | null>(null);
>>>>>>> Stashed changes

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId],
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

<<<<<<< Updated upstream
  const filterFolderTree = (folderList: any[], query: string): any[] => {
    if (!query.trim()) return folderList;
    const normalizedQuery = query.toLowerCase().trim();
    return folderList
      .map((folder) => {
        const filteredChildren = filterFolderTree(folder.children || [], normalizedQuery);
        const matches = folder.name.toLowerCase().includes(normalizedQuery);
        if (!matches && filteredChildren.length === 0) return null;
        return { ...folder, children: filteredChildren };
      })
      .filter(Boolean);
  };

  const filteredFolders = useMemo(() => filterFolderTree(folders, folderQuery), [folders, folderQuery]);
  const filteredTags = useMemo(() => {
    const normalizedQuery = tagQuery.toLowerCase().trim();
    if (!normalizedQuery) return tags;
    return tags.filter((tag) => tag.name.toLowerCase().includes(normalizedQuery));
  }, [tags, tagQuery]);

  const renderFolderTree = (folderList: any[], level = 0) => {
    return folderList.map((folder) => {
      const hasChildren = folder.children && folder.children.length > 0;
      const isExpanded = expandedFolders.includes(folder.id) || folderQuery.trim().length > 0;
      const isSelected = selectedFolder === folder.id;

      return (
        <div key={folder.id}>
          <div
            className={`group flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors
              ${level > 0 ? 'ml-4' : ''}
              ${isSelected ? 'bg-[#10a37f]/20 text-[#10a37f]' : 'hover:bg-[#363636]'}`}
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
                className="rounded p-0.5 hover:bg-[#363636]"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <Folder size={16} className={isSelected ? 'text-[#10a37f]' : 'text-[#888888]'} />
            <span className="flex-1 truncate text-sm">{folder.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setContextMenu({ type: 'folder', id: folder.id, x: e.clientX, y: e.clientY });
              }}
              className="rounded p-1 opacity-0 group-hover:opacity-100 hover:bg-[#363636]"
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
          {hasChildren && isExpanded && renderFolderTree(folder.children, level + 1)}
        </div>
      );
    });
=======
  const handleRename = (type: 'folder' | 'tag', id: string, currentName: string) => {
    setRenameTarget({ type, id, name: currentName });
    setRenameValue(currentName);
    setShowRenameDialog(true);
    setContextMenu(null);
  };

  const handleRenameSubmit = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    if (renameTarget.type === 'folder') {
      await updateFolder(renameTarget.id, { name: renameValue.trim() });
    }
    setShowRenameDialog(false);
    setRenameTarget(null);
    setRenameValue('');
  };

  const handleDelete = (type: 'folder' | 'tag', id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setShowDeleteDialog(true);
    setContextMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'folder') {
      await deleteFolder(deleteTarget.id);
    } else {
      await deleteTag(deleteTarget.id);
    }
    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  const handleContextMenu = (type: 'folder' | 'tag', id: string, x: number, y: number) => {
    setContextMenu({ type, id, x, y });
  };

  const handleSelectFolder = (folderId: string) => {
    onFolderSelect?.(folderId);
    navigate(`/notes?folderId=${folderId}`);
  };

  const handleSelectTag = (tagId: string) => {
    onTagSelect?.(tagId);
    navigate(`/notes?tagId=${tagId}`);
>>>>>>> Stashed changes
  };

  const presetColors = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4',
    '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#64748B', '#1F2937',
  ];

  return (
    <aside className="sidebar flex h-full w-64 flex-col overflow-y-auto">
      {/* 新建笔记按钮 */}
      <div className="p-3">
        <Button onClick={() => navigate('/notes/new')} className="w-full">
          <Plus size={16} />
          新建笔记
        </Button>
      </div>

      {/* 所有笔记 */}
      <div className="px-3 py-1">
        <button
          onClick={() => {
            onFolderSelect?.(null);
            onTagSelect?.(null);
            navigate('/notes');
          }}
<<<<<<< Updated upstream
          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors ${
            !selectedFolder && !selectedTag ? 'bg-[#10a37f]/20 text-[#10a37f]' : 'hover:bg-[#363636]'
          }`}
=======
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded
            ${!selectedFolder && !selectedTag
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
>>>>>>> Stashed changes
        >
          <FileText size={16} className={!selectedFolder && !selectedTag ? 'text-[#10a37f]' : 'text-[#888888]'} />
          <span className="text-sm">所有笔记</span>
        </button>
      </div>

      {/* 文件夹区域 */}
      <div className="mt-2 px-3 py-1">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium uppercase text-[#888888]">文件夹</span>
          <button onClick={() => setShowNewFolder(true)} className="rounded p-1 hover:bg-[#363636]" title="新建文件夹">
            <Plus size={14} />
          </button>
        </div>
<<<<<<< Updated upstream
        <div className="px-2 pb-2">
          <Input placeholder="搜索文件夹..." value={folderQuery} onChange={(e) => setFolderQuery(e.target.value)} icon={<Search size={14} />} />
        </div>
        {filteredFolders.length > 0 ? renderFolderTree(filteredFolders) : <p className="px-2 py-1 text-sm text-[#888888]">暂无匹配文件夹</p>}
=======

        {folders.length > 0 ? (
          <FolderTree
            folders={folders}
            expandedFolders={expandedFolders}
            selectedFolder={selectedFolder || null}
            onToggleFolder={toggleFolder}
            onSelectFolder={handleSelectFolder}
            onContextMenu={handleContextMenu}
          />
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 px-2 py-1">{t('folders.noFolders')}</p>
        )}
>>>>>>> Stashed changes
      </div>

      {/* 标签区域 */}
      <div className="mt-2 flex-1 px-3 py-1">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium uppercase text-[#888888]">标签</span>
          <button onClick={() => setShowNewTag(true)} className="rounded p-1 hover:bg-[#363636]" title="新建标签">
            <Plus size={14} />
          </button>
        </div>
<<<<<<< Updated upstream
        <div className="px-2 pb-2">
          <Input placeholder="搜索标签..." value={tagQuery} onChange={(e) => setTagQuery(e.target.value)} icon={<Search size={14} />} />
        </div>
        <div className="space-y-0.5">
          {filteredTags.map((tag) => {
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
                className={`group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors ${
                  isSelected ? 'bg-[#10a37f]/20' : 'hover:bg-[#363636]'
                }`}
              >
                <Tag size={14} style={{ color: tag.color }} />
                <span className="flex-1 truncate text-sm">{tag.name}</span>
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: tag.color }} />
              </div>
            );
          })}
          {filteredTags.length === 0 && <p className="px-2 py-1 text-sm text-[#888888]">暂无匹配标签</p>}
        </div>
=======

        <TagList
          tags={tags}
          selectedTag={selectedTag || null}
          onSelectTag={handleSelectTag}
          onContextMenu={handleContextMenu}
          t={t}
        />
>>>>>>> Stashed changes
      </div>

      {/* 回收站 */}
      <div className="mt-auto border-t border-[#3a3a3a] px-3 py-2">
        <button onClick={() => navigate('/notes?trash=true')} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[#888888] hover:bg-[#363636]">
          <Trash2 size={16} />
          <span className="text-sm">回收站</span>
        </button>
      </div>

<<<<<<< Updated upstream
      {/* 新建文件夹模态框 */}
      <Modal isOpen={showNewFolder} onClose={() => setShowNewFolder(false)} title="新建文件夹" footer={
        <>
          <Button variant="ghost" onClick={() => setShowNewFolder(false)}>取消</Button>
          <Button onClick={handleCreateFolder}>创建</Button>
        </>
      }>
        <Input placeholder="文件夹名称" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} autoFocus />
      </Modal>

      {/* 新建标签模态框 */}
      <Modal isOpen={showNewTag} onClose={() => setShowNewTag(false)} title="新建标签" footer={
        <>
          <Button variant="ghost" onClick={() => setShowNewTag(false)}>取消</Button>
          <Button onClick={handleCreateTag}>创建</Button>
        </>
      }>
        <div className="space-y-3">
          <Input placeholder="标签名称" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} autoFocus />
          <div>
            <label className="mb-2 block text-sm font-medium text-[#b4b4b4]">标签颜色</label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button key={color} onClick={() => setNewTagColor(color)} className={`h-6 w-6 rounded-full border-2 transition-transform ${
                  newTagColor === color ? 'scale-110 border-white' : 'border-transparent'
                }`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* 右键菜单 */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div className="fixed z-50 min-w-[120px] rounded-md border border-[#3a3a3a] bg-[#242424] py-1 shadow-lg" style={{ left: contextMenu.x, top: contextMenu.y }}>
            <button className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-[#363636]" onClick={() => setContextMenu(null)}>
              <Edit2 size={14} />
              重命名
            </button>
            <button className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[#ef4444] hover:bg-[#ef4444]/10" onClick={async () => {
              if (contextMenu.type === 'folder') await deleteFolder(contextMenu.id);
              else await deleteTag(contextMenu.id);
              setContextMenu(null);
            }}>
              <Trash2 size={14} />
              删除
            </button>
          </div>
        </>
      )}
=======
      <SidebarDialogs
        showNewFolder={showNewFolder}
        showNewTag={showNewTag}
        showRenameDialog={showRenameDialog}
        showDeleteDialog={showDeleteDialog}
        newFolderName={newFolderName}
        newTagName={newTagName}
        newTagColor={newTagColor}
        renameValue={renameValue}
        deleteTarget={deleteTarget}
        onNewFolderNameChange={setNewFolderName}
        onNewTagNameChange={setNewTagName}
        onNewTagColorChange={setNewTagColor}
        onRenameValueChange={setRenameValue}
        onCloseNewFolder={() => setShowNewFolder(false)}
        onCloseNewTag={() => setShowNewTag(false)}
        onCloseRenameDialog={() => setShowRenameDialog(false)}
        onCloseDeleteDialog={() => setShowDeleteDialog(false)}
        onCreateFolder={handleCreateFolder}
        onCreateTag={handleCreateTag}
        onSaveRename={handleRenameSubmit}
        onDeleteConfirm={handleDeleteConfirm}
        presetColors={presetColors}
        t={t}
      />

      <SidebarContextMenu
        contextMenu={contextMenu}
        folders={folders}
        tags={tags}
        onRename={handleRename}
        onDelete={handleDelete}
        onClose={() => setContextMenu(null)}
        t={t}
      />
>>>>>>> Stashed changes
    </aside>
  );
}

export default Sidebar;