import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  
  const isNewNote = id === 'new';

  // TipTap 编辑器
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: '开始编写...',
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
      triggerAutoSave();
    },
  });

  // 加载笔记数据
  useEffect(() => {
    if (!isNewNote && id) {
      fetchNote(id);
    }
  }, [id, isNewNote]);

  // 同步编辑器内容
  useEffect(() => {
    if (currentNote && editor) {
      setTitle(currentNote.title);
      editor.commands.setContent(currentNote.content || '');
      setLastSaved(new Date(currentNote.updatedAt));
    }
  }, [currentNote, editor]);

  // 自动保存逻辑
  const triggerAutoSave = useCallback(
    debounce(() => {
      if (title.trim() || editor?.getText().trim()) {
        handleSave(true);
      }
    }, 2000),
    [title, editor, id]
  );

  // 手动保存
  const handleSave = async (isAutoSave = false) => {
    if (!title.trim() && !editor?.getText().trim()) {
      if (!isAutoSave) alert('请输入标题或内容');
      return;
    }

    if (!isAutoSave) setSaving(true);

    const content = editor?.getHTML() || '';

    try {
      if (isNewNote) {
        const newNote = await createNote({ title, content });
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        // 更新 URL
        navigate(`/notes/${newNote.id}`, { replace: true });
      } else {
        await updateNote(id!, { title, content });
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      if (!isAutoSave) alert('保存失败');
    } finally {
      if (!isAutoSave) setSaving(false);
    }
  };

  // 键盘快捷键
  useKeyboardShortcuts([
    {
      key: 's',
      ctrl: true,
      action: () => handleSave(false),
      description: '保存笔记',
    },
    {
      key: 'b',
      ctrl: true,
      action: () => editor?.chain().focus().toggleBold().run(),
      description: '加粗',
    },
    {
      key: 'i',
      ctrl: true,
      action: () => editor?.chain().focus().toggleItalic().run(),
      description: '斜体',
    },
    {
      key: 'k',
      ctrl: true,
      action: () => setShowLinkDialog(true),
      description: '插入链接',
    },
    {
      key: 'Escape',
      action: () => {
        if (showLinkDialog) setShowLinkDialog(false);
        if (showImageDialog) setShowImageDialog(false);
      },
      description: '关闭弹窗',
    },
  ]);

  // 离开页面提醒
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

  // 工具栏配置
  const toolbarItems = [
    { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), title: '加粗', active: editor?.isActive('bold') },
    { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), title: '斜体', active: editor?.isActive('italic') },
    { icon: Code, action: () => editor?.chain().focus().toggleCode().run(), title: '代码', active: editor?.isActive('code') },
    { icon: Quote, action: () => editor?.chain().focus().toggleBlockquote().run(), title: '引用', active: editor?.isActive('blockquote') },
    { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), title: '无序列表', active: editor?.isActive('bulletList') },
    { icon: ListOrdered, action: () => editor?.chain().focus().toggleOrderedList().run(), title: '有序列表', active: editor?.isActive('orderedList') },
    { icon: LinkIcon, action: () => setShowLinkDialog(true), title: '链接', active: editor?.isActive('link') },
    { icon: ImageIcon, action: () => setShowImageDialog(true), title: '图片', active: false },
  ];

  // 添加链接
  const handleAddLink = () => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
    }
    setShowLinkDialog(false);
    setLinkUrl('');
  };

  // 添加图片
  const handleAddImage = () => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
    }
    setShowImageDialog(false);
    setImageUrl('');
  };

  // 粘贴图片处理
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            // TODO: 上传图片到服务器
            // 临时方案：创建本地预览
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
    return <div className="flex items-center justify-center h-full">加载中...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded"
            title="返回"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="text-sm text-gray-500">
            {hasUnsavedChanges ? (
              <span className="text-orange-500">未保存</span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1 text-green-600">
                <Check size={14} />
                已保存 {lastSaved.toLocaleTimeString()}
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
            保存
          </Button>
        </div>
      </div>

      {/* 标题输入 */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setHasUnsavedChanges(true);
            triggerAutoSave();
          }}
          placeholder="笔记标题"
          className="w-full text-2xl font-bold outline-none"
        />
      </div>

      {/* 编辑器工具栏 */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 flex-wrap sticky top-[60px] bg-white z-10">
        {toolbarItems.map(({ icon: Icon, action, title, active }, index) => (
          <button
            key={index}
            onClick={action}
            className={`p-2 rounded transition-colors ${
              active ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            }`}
            title={title}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      {/* 编辑器内容区 */}
      <div className="flex-1 overflow-auto">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none p-4 min-h-[400px]"
        />
      </div>

      {/* 链接弹窗 */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-96">
            <h3 className="font-medium mb-3">添加链接</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="input-field mb-3"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowLinkDialog(false)}>
                取消
              </Button>
              <Button onClick={handleAddLink}>添加</Button>
            </div>
          </div>
        </div>
      )}

      {/* 图片弹窗 */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-96">
            <h3 className="font-medium mb-3">添加图片</h3>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="input-field mb-3"
              autoFocus
            />
            <p className="text-sm text-gray-500 mb-3">
              或直接粘贴图片（Ctrl/Cmd + V）
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowImageDialog(false)}>
                取消
              </Button>
              <Button onClick={handleAddImage}>添加</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteEditor;