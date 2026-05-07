import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFolderStore } from '../../store/folder.store';
import { useTagStore } from '../../store/tag.store';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { FolderTree } from '../folder/FolderTree';
import { TagList } from '../folder/TagList';
import { SidebarDialogs } from '../folder/SidebarDialogs';
import { SidebarContextMenu } from '../folder/SidebarContextMenu';

interface SidebarProps {
  onFolderSelect?: (folderId: string | null) => void;
  onTagSelect?: (tagId: string | null) => void;
  selectedFolder?: string | null;
  selectedTag?: string | null;
}

function Sidebar({ onFolderSelect, onTagSelect, selectedFolder, selectedTag }: SidebarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { folders, createFolder, deleteFolder, updateFolder } = useFolderStore();
  const { tags, createTag, deleteTag } = useTagStore();

  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showNewTag, setShowNewTag] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6B7280');
  const [contextMenu, setContextMenu] = useState<{ type: 'folder' | 'tag'; id: string; x: number; y: number } | null>(null);

  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ type: 'folder' | 'tag'; id: string; name: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'folder' | 'tag'; id: string; name: string } | null>(null);

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
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded
            ${!selectedFolder && !selectedTag
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
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
      </div>

      {/* 标签区域 */}
      <div className="mt-2 flex-1 px-3 py-1">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium uppercase text-[#888888]">标签</span>
          <button onClick={() => setShowNewTag(true)} className="rounded p-1 hover:bg-[#363636]" title="新建标签">
            <Plus size={14} />
          </button>
        </div>

        <TagList
          tags={tags}
          selectedTag={selectedTag || null}
          onSelectTag={handleSelectTag}
          onContextMenu={handleContextMenu}
          t={t}
        />
      </div>

      {/* 回收站 */}
      <div className="mt-auto border-t border-[#3a3a3a] px-3 py-2">
        <button onClick={() => navigate('/notes?trash=true')} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[#888888] hover:bg-[#363636]">
          <Trash2 size={16} />
          <span className="text-sm">回收站</span>
        </button>
      </div>

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
    </aside>
  );
}

export default Sidebar;