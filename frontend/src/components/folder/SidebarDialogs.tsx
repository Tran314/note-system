import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';

interface SidebarDialogsProps {
  showNewFolder: boolean;
  showNewTag: boolean;
  showRenameDialog: boolean;
  showDeleteDialog: boolean;
  newFolderName: string;
  newTagName: string;
  newTagColor: string;
  renameValue: string;
  deleteTarget: { type: 'folder' | 'tag'; id: string; name: string } | null;
  onNewFolderNameChange: (name: string) => void;
  onNewTagNameChange: (name: string) => void;
  onNewTagColorChange: (color: string) => void;
  onRenameValueChange: (value: string) => void;
  onCloseNewFolder: () => void;
  onCloseNewTag: () => void;
  onCloseRenameDialog: () => void;
  onCloseDeleteDialog: () => void;
  onCreateFolder: () => void;
  onCreateTag: () => void;
  onSaveRename: () => void;
  onDeleteConfirm: () => void;
  presetColors: string[];
  t: (key: string, params?: Record<string, string | undefined>) => string;
}

export function SidebarDialogs({
  showNewFolder,
  showNewTag,
  showRenameDialog,
  showDeleteDialog,
  newFolderName,
  newTagName,
  newTagColor,
  renameValue,
  deleteTarget,
  onNewFolderNameChange,
  onNewTagNameChange,
  onNewTagColorChange,
  onRenameValueChange,
  onCloseNewFolder,
  onCloseNewTag,
  onCloseRenameDialog,
  onCloseDeleteDialog,
  onCreateFolder,
  onCreateTag,
  onSaveRename,
  onDeleteConfirm,
  presetColors,
  t,
}: SidebarDialogsProps) {
  return (
    <>
      <Modal isOpen={showNewFolder} onClose={onCloseNewFolder} title={t('folders.newFolder')} footer={
        <>
          <Button variant="ghost" onClick={onCloseNewFolder}>{t('common.cancel')}</Button>
          <Button onClick={onCreateFolder}>{t('common.create')}</Button>
        </>
      }>
        <Input placeholder={t('folders.folderNamePlaceholder')} value={newFolderName} onChange={(e) => onNewFolderNameChange(e.target.value)} autoFocus />
      </Modal>

      <Modal isOpen={showNewTag} onClose={onCloseNewTag} title={t('tags.newTag')} footer={
        <>
          <Button variant="ghost" onClick={onCloseNewTag}>{t('common.cancel')}</Button>
          <Button onClick={onCreateTag}>{t('common.create')}</Button>
        </>
      }>
        <div className="space-y-3">
          <Input placeholder={t('tags.tagNamePlaceholder')} value={newTagName} onChange={(e) => onNewTagNameChange(e.target.value)} autoFocus />
          <div>
            <label className="block text-sm font-medium mb-2">{t('tags.tagColor')}</label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button key={color} onClick={() => onNewTagColorChange(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${newTagColor === color ? 'border-gray-800 dark:border-gray-200 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showRenameDialog} onClose={onCloseRenameDialog} title={t('common.rename')} footer={
        <>
          <Button variant="ghost" onClick={onCloseRenameDialog}>{t('common.cancel')}</Button>
          <Button onClick={onSaveRename}>{t('common.save')}</Button>
        </>
      }>
        <Input
          value={renameValue}
          onChange={(e) => onRenameValueChange(e.target.value)}
          autoFocus
        />
      </Modal>

      <Modal isOpen={showDeleteDialog} onClose={onCloseDeleteDialog} title={t('common.confirmDelete')} footer={
        <>
          <Button variant="ghost" onClick={onCloseDeleteDialog}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={onDeleteConfirm}>{t('common.delete')}</Button>
        </>
      }>
        <p>
          {deleteTarget?.type === 'folder'
            ? t('folders.confirmDelete', { name: deleteTarget?.name })
            : t('tags.confirmDelete', { name: deleteTarget?.name })}
        </p>
      </Modal>
    </>
  );
}
