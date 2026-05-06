import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNoteStore } from '../store/note.store';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlock from '@tiptap/extension-code-block';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { debounce } from '../utils/format';

function NoteEditor() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentNote, fetchNote, createNote, updateNote, loading } = useNoteStore();
  
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const isNewNote = id === 'new';
  const autoSaveRef = useRef<ReturnType<typeof debounce> | null>(null);
  const noteIdRef = useRef(id);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: t('notes.contentPlaceholder'),
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 p-4 rounded-lg font-mono text-sm',
        },
      }),
    ],
    content: '',
    onUpdate: () => {
      setHasUnsavedChanges(true);
      autoSaveRef.current?.();
    },
  });

  // 初始化自动保存
  useEffect(() => {
    autoSaveRef.current = debounce(() => {
      if (title.trim() || editor?.getText().trim()) {
        handleSave(true);
      }
    }, 2000);
  }, []);

  // 加载笔记数据
  useEffect(() => {
    if (!isNewNote && id) {
      fetchNote(id);
    }
  }, [id, isNewNote]);

  // 同步编辑器内容（仅在笔记 ID 变化时同步，防止覆盖用户编辑）
  useEffect(() => {
    if (currentNote && editor && noteIdRef.current !== id) {
      noteIdRef.current = id;
      setTitle(currentNote.title);
      editor.commands.setContent(currentNote.content || '');
      setLastSaved(new Date(currentNote.updatedAt));
      setHasUnsavedChanges(false);
      setSaveError(null);
    }
  }, [currentNote, editor, id]);

  const handleSave = async (isAutoSave = false) => {
    if (!title.trim() && !editor?.getText().trim()) {
      if (!isAutoSave) setSaveError(t('common.titlePlaceholder'));
      return;
    }

    if (!isAutoSave) {
      setSaving(true);
      setSaveError(null);
    }

    const content = editor?.getHTML() || '';

    try {
      if (isNewNote) {
        const newNote = await createNote({ title, content });
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        setSaveError(null);
        navigate(`/notes/${newNote.id}`, { replace: true });
      } else {
        await updateNote(id!, { title, content });
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        setSaveError(null);
      }
    } catch {
      if (!isAutoSave) setSaveError(t('notes.saveFailed'));
    } finally {
      if (!isAutoSave) setSaving(false);
    }
  };

  useKeyboardShortcuts([
    {
      key: 's',
      ctrl: true,
      action: () => handleSave(false),
      description: t('shortcuts.saveNote'),
    },
    {
      key: 'b',
      ctrl: true,
      action: () => editor?.chain().focus().toggleBold().run(),
      description: t('editor.bold'),
    },
    {
      key: 'i',
      ctrl: true,
      action: () => editor?.chain().focus().toggleItalic().run(),
      description: t('editor.italic'),
    },
    {
      key: 'k',
      ctrl: true,
      action: () => setShowLinkDialog(true),
      description: t('editor.insertLink'),
    },
    {
      key: 'Escape',
      action: () => {
        if (showLinkDialog) setShowLinkDialog(false);
        if (showImageDialog) setShowImageDialog(false);
      },
      description: t('shortcuts.closeDialog'),
    },
  ]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const toolbarItems = [
    { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), title: t('editor.bold'), active: editor?.isActive('bold') },
    { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), title: t('editor.italic'), active: editor?.isActive('italic') },
    { icon: Code, action: () => editor?.chain().focus().toggleCode().run(), title: t('editor.code'), active: editor?.isActive('code') },
    { icon: Quote, action: () => editor?.chain().focus().toggleBlockquote().run(), title: t('editor.quote'), active: editor?.isActive('blockquote') },
    { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), title: t('editor.bulletList'), active: editor?.isActive('bulletList') },
    { icon: ListOrdered, action: () => editor?.chain().focus().toggleOrderedList().run(), title: t('editor.numberedList'), active: editor?.isActive('orderedList') },
    { icon: LinkIcon, action: () => setShowLinkDialog(true), title: t('editor.link'), active: editor?.isActive('link') },
    { icon: ImageIcon, action: () => setShowImageDialog(true), title: t('editor.image'), active: false },
  ];

  const handleAddLink = () => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
    }
    setShowLinkDialog(false);
    setLinkUrl('');
  };

  const handleAddImage = () => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
    }
    setShowImageDialog(false);
    setImageUrl('');
  };

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              editor?.chain().focus().setImage({ src: reader.result as string }).run();
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [editor]);

  if (loading && !isNewNote) {
    return <div className="flex items-center justify-center h-full">{t('common.loading')}</div>;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded"
            title={t('common.back')}
            aria-label={t('common.back')}
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="text-sm text-gray-500">
            {hasUnsavedChanges ? (
              <span className="text-orange-500">{t('common.unsaved')}</span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1 text-green-600">
                <Check size={14} />
                {t('common.saved')} {lastSaved.toLocaleTimeString()}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleSave(false)}
            disabled={saving}
            loading={saving}
          >
            <Save size={16} />
            {t('common.save')}
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="p-2 bg-red-50 text-red-600 text-sm text-center">
          {saveError}
          <button onClick={() => setSaveError(null)} className="ml-2 underline">{t('common.cancel')}</button>
        </div>
      )}

      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setHasUnsavedChanges(true);
            autoSaveRef.current?.();
          }}
          placeholder={t('common.titlePlaceholder')}
          className="w-full text-2xl font-bold outline-none"
        />
      </div>

      <div className="flex items-center gap-1 p-2 border-b border-gray-200 flex-wrap sticky top-[60px] bg-white z-10">
        {toolbarItems.map(({ icon: Icon, action, title: tooltip, active }, index) => (
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

      <div className="flex-1 overflow-auto">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none p-4 min-h-[400px]"
        />
      </div>

      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-96">
            <h3 className="font-medium mb-3">{t('common.addLink')}</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder={t('editor.linkPlaceholder')}
              className="input-field mb-3"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowLinkDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleAddLink}>{t('common.create')}</Button>
            </div>
          </div>
        </div>
      )}

      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-96">
            <h3 className="font-medium mb-3">{t('common.addImage')}</h3>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={t('editor.imageUrl')}
              className="input-field mb-3"
              autoFocus
            />
            <p className="text-sm text-gray-500 mb-3">
              {t('common.pasteImageHint')}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowImageDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleAddImage}>{t('common.create')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteEditor;
