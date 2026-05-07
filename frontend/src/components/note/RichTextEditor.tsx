import { forwardRef, useImperativeHandle } from 'react';
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

export interface EditorRef {
  getEditor: () => Editor | null;
  setContent: (content: string) => void;
}

const RichTextEditor = forwardRef<EditorRef, RichTextEditorProps>(
  ({ content, placeholder = '开始编写...', onUpdate, className = '' }, ref) => {
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

    useImperativeHandle(ref, () => ({
      getEditor: () => editor,
      setContent: (content: string) => editor?.commands.setContent(content),
    }));

    return (
      <EditorContent
        editor={editor}
        className={`prose prose-sm min-h-[300px] max-w-none ${className}`}
      />
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;