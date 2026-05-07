import { Button } from './Button';
import { Modal } from './Modal';

interface ShortcutHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

function ShortcutHelp({ isOpen, onClose }: ShortcutHelpProps) {
  const shortcuts = [
    { key: 'Ctrl + S', description: '保存笔记' },
    { key: 'Ctrl + B', description: '加粗文本' },
    { key: 'Ctrl + I', description: '斜体文本' },
    { key: 'Ctrl + K', description: '插入链接' },
    { key: 'Ctrl + N', description: '新建笔记' },
    { key: 'Ctrl + Shift + K', description: '搜索笔记' },
    { key: 'Esc', description: '关闭弹窗/返回' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="键盘快捷键"
      footer={
        <Button onClick={onClose}>关闭</Button>
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