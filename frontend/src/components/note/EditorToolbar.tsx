import { Bold, Italic, List, ListOrdered, Code, Quote, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

interface ToolbarItem {
  icon: React.ComponentType<{ size: number }>;
  action: () => void;
  title: string;
  active?: boolean;
}

interface EditorToolbarProps {
  editor: any;
  onLinkClick: () => void;
  onImageClick: () => void;
  t: (key: string) => string;
}

export function EditorToolbar({ editor, onLinkClick, onImageClick, t }: EditorToolbarProps) {
  const items: ToolbarItem[] = [
    { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), title: t('editor.bold'), active: editor?.isActive('bold') },
    { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), title: t('editor.italic'), active: editor?.isActive('italic') },
    { icon: Code, action: () => editor?.chain().focus().toggleCode().run(), title: t('editor.code'), active: editor?.isActive('code') },
    { icon: Quote, action: () => editor?.chain().focus().toggleBlockquote().run(), title: t('editor.quote'), active: editor?.isActive('blockquote') },
    { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), title: t('editor.bulletList'), active: editor?.isActive('bulletList') },
    { icon: ListOrdered, action: () => editor?.chain().focus().toggleOrderedList().run(), title: t('editor.numberedList'), active: editor?.isActive('orderedList') },
    { icon: LinkIcon, action: onLinkClick, title: t('editor.link'), active: editor?.isActive('link') },
    { icon: ImageIcon, action: onImageClick, title: t('editor.image'), active: false },
  ];

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 flex-wrap sticky top-[60px] bg-white z-10">
      {items.map(({ icon: Icon, action, title: tooltip, active }, index) => (
        <button
          key={index}
          onClick={action}
          className={`p-2 rounded transition-colors ${
            active ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
          }`}
          title={tooltip}
          aria-label={tooltip}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
