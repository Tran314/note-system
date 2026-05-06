import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Modal } from './Modal';

interface ShortcutHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

function ShortcutHelp({ isOpen, onClose }: ShortcutHelpProps) {
  const { t } = useTranslation();

  const shortcuts = [
    { key: 'Ctrl + S', description: t('shortcuts.saveNote') },
    { key: 'Ctrl + B', description: t('shortcuts.boldText') },
    { key: 'Ctrl + I', description: t('shortcuts.italicText') },
    { key: 'Ctrl + K', description: t('shortcuts.insertLink') },
    { key: 'Ctrl + N', description: t('shortcuts.newNote') },
    { key: 'Ctrl + Shift + K', description: t('shortcuts.searchNotes') },
    { key: 'Esc', description: t('shortcuts.closeDialog') },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('shortcuts.shortcuts')}
      footer={
        <Button onClick={onClose}>{t('common.cancel')}</Button>
      }
    >
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <span className="text-sm text-gray-600">{shortcut.description}</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export { ShortcutHelp };
