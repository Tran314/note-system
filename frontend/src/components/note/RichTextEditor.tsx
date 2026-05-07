import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

interface RichTextEditorProps {
  content: string;
  placeholder?: string;
  onUpdate?: (content: string) => void;
  className?: string;
}

export function RichTextEditor({
  content,
  placeholder = '开始编写...',
  onUpdate,
  className = '',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#10a37f] underline' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full h-auto rounded-lg' },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
  });

  return (
    <EditorContent
      editor={editor}
      className={`prose prose-sm min-h-[300px] max-w-none ${className}`}
    />
  );
}