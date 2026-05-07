import { useEffect, useMemo, useRef, useState } from 'react';
import { lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNoteStore } from '../store/note.store';
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
  History,
  Paperclip,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { EditorSkeleton } from '../components/common/Skeleton';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { noteService } from '../services/note.service';
import { attachmentService } from '../services/attachment.service';
import { Attachment, NoteVersion } from '../types/api.types';
import type { EditorRef } from '../components/note/RichTextEditor';

const RichTextEditor = lazy(() => import('../components/note/RichTextEditor'));

function NoteEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notes, currentNote, fetchNote, createNote, updateNote, loading } =
    useNoteStore();

  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [versionsLoaded, setVersionsLoaded] = useState(false);
  const [attachmentsLoaded, setAttachmentsLoaded] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedTitleRef = useRef('');
  const lastSavedContentRef = useRef('');
  const editorRef = useRef<EditorRef>(null);

  const isNewNote = id === 'new';

  const currentIndex = useMemo(() => notes.findIndex((note) => note.id === id), [notes, id]);
  const previousNote = currentIndex > 0 ? notes[currentIndex - 1] : null;
  const nextNote = currentIndex >= 0 && currentIndex < notes.length - 1 ? notes[currentIndex + 1] : null;

  useEffect(() => {
    if (!isNewNote && id) {
      fetchNote(id);
    }
  }, [id, isNewNote, fetchNote]);

  useEffect(() => {
    if (!id || isNewNote) {
      return;
    }
  }, [id, isNewNote]);

  useEffect(() => {
    if (isNewNote && editorRef.current) {
      setTitle('');
      editorRef.current.setContent('');
      lastSavedTitleRef.current = '';
      lastSavedContentRef.current = '';
      setLastSaved(null);
      setHasUnsavedChanges(false);
      setVersions([]);
      setAttachments([]);
      setVersionsLoaded(false);
      setAttachmentsLoaded(false);
      return;
    }

    if (currentNote && editorRef.current) {
      setTitle(currentNote.title);
      editorRef.current.setContent(currentNote.content || '');
      lastSavedTitleRef.current = currentNote.title;
      lastSavedContentRef.current = currentNote.content || '';
      setLastSaved(new Date(currentNote.updatedAt));
      setHasUnsavedChanges(false);
      setVersions([]);
      setAttachments([]);
      setVersionsLoaded(false);
      setAttachmentsLoaded(false);
    }
  }, [currentNote, isNewNote]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const handleSave = async (isAutoSave = false) => {
    const content = editorRef.current?.getEditor()?.getHTML() || '';

    if (!title.trim() && !editorRef.current?.getEditor()?.getText().trim()) {
      if (!isAutoSave) {
        alert('请输入标题或内容');
      }
      return;
    }

    if (!isAutoSave) {
      setSaving(true);
    }

    try {
      if (isNewNote) {
        const newNote = await createNote({ title, content });
        lastSavedTitleRef.current = newNote.title;
        lastSavedContentRef.current = newNote.content || '';
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        navigate(`/notes/${newNote.id}`, { replace: true });
      } else {
        const payload: { title?: string; content?: string } = {};

        if (title !== lastSavedTitleRef.current) {
          payload.title = title;
        }

        if (content !== lastSavedContentRef.current) {
          payload.content = content;
        }

        if (Object.keys(payload).length === 0) {
          setHasUnsavedChanges(false);
          setLastSaved((current) => current ?? new Date());
          return;
        }

        await updateNote(id!, payload);
        lastSavedTitleRef.current = payload.title ?? lastSavedTitleRef.current;
        lastSavedContentRef.current = payload.content ?? lastSavedContentRef.current;
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      if (!isAutoSave) {
        alert('保存失败');
      }
    } finally {
      if (!isAutoSave) {
        setSaving(false);
      }
    }
  };

  const loadVersions = async () => {
    if (!id || isNewNote || versionsLoaded || versionsLoading) {
      return;
    }

    setVersionsLoading(true);
    try {
      const response = await noteService.getVersions(id);
      setVersions(response.data.versions ?? []);
      setVersionsLoaded(true);
    } finally {
      setVersionsLoading(false);
    }
  };

  const loadAttachments = async () => {
    if (!id || isNewNote || attachmentsLoaded || attachmentsLoading) {
      return;
    }

    setAttachmentsLoading(true);
    try {
      const response = await attachmentService.getAttachments(id);
      setAttachments(response.data.data ?? response.data);
      setAttachmentsLoaded(true);
    } finally {
      setAttachmentsLoading(false);
    }
  };

  const scheduleAutoSave = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (title.trim() || editorRef.current?.getEditor()?.getText().trim()) {
        void handleSave(true);
      }
    }, 2000);
  };

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
      action: () => editorRef.current?.getEditor()?.chain().focus().toggleBold().run(),
      description: '加粗',
    },
    {
      key: 'i',
      ctrl: true,
      action: () => editorRef.current?.getEditor()?.chain().focus().toggleItalic().run(),
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
    { icon: Bold, action: () => editorRef.current?.getEditor()?.chain().focus().toggleBold().run(), title: '加粗', active: editorRef.current?.getEditor()?.isActive('bold') },
    { icon: Italic, action: () => editorRef.current?.getEditor()?.chain().focus().toggleItalic().run(), title: '斜体', active: editorRef.current?.getEditor()?.isActive('italic') },
    { icon: Code, action: () => editorRef.current?.getEditor()?.chain().focus().toggleCode().run(), title: '代码', active: editorRef.current?.getEditor()?.isActive('code') },
    { icon: Quote, action: () => editorRef.current?.getEditor()?.chain().focus().toggleBlockquote().run(), title: '引用', active: editorRef.current?.getEditor()?.isActive('blockquote') },
    { icon: List, action: () => editorRef.current?.getEditor()?.chain().focus().toggleBulletList().run(), title: '无序列表', active: editorRef.current?.getEditor()?.isActive('bulletList') },
    { icon: ListOrdered, action: () => editorRef.current?.getEditor()?.chain().focus().toggleOrderedList().run(), title: '有序列表', active: editorRef.current?.getEditor()?.isActive('orderedList') },
    { icon: LinkIcon, action: () => setShowLinkDialog(true), title: '链接', active: editorRef.current?.getEditor()?.isActive('link') },
    { icon: ImageIcon, action: () => setShowImageDialog(true), title: '图片', active: false },
  ];

  const handleAddLink = () => {
    if (linkUrl) {
      editorRef.current?.getEditor()?.chain().focus().setLink({ href: linkUrl }).run();
    }
    setShowLinkDialog(false);
    setLinkUrl('');
  };

  const handleAddImage = () => {
    if (imageUrl) {
      editorRef.current?.getEditor()?.chain().focus().setImage({ src: imageUrl }).run();
    }
    setShowImageDialog(false);
    setImageUrl('');
  };

  useEffect(() => {
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            if (file.size > MAX_IMAGE_SIZE) {
              alert('图片大小不能超过 5MB');
              return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              editorRef.current?.getEditor()?.chain().focus().setImage({ src: reader.result as string }).run();
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  if (loading && !isNewNote) {
    return <div className="flex h-full items-center justify-center">加载中...</div>;
  }

  return (
    <div className="page-enter flex h-full gap-4 rounded-[24px] border border-stone-200/70 bg-white/45 p-1 backdrop-blur-md">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200/70 bg-white/70 p-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded p-2 hover:bg-gray-100"
              title="返回"
            >
              <ArrowLeft size={20} />
            </button>

            {previousNote && (
              <button
                onClick={() => navigate(`/notes/${previousNote.id}`)}
                className="rounded p-2 hover:bg-gray-100"
                title={`上一篇：${previousNote.title}`}
              >
                <ChevronLeft size={18} />
              </button>
            )}

            {nextNote && (
              <button
                onClick={() => navigate(`/notes/${nextNote.id}`)}
                className="rounded p-2 hover:bg-gray-100"
                title={`下一篇：${nextNote.title}`}
              >
                <ChevronRight size={18} />
              </button>
            )}

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
            <Button onClick={() => handleSave(false)} disabled={saving} loading={saving}>
              <Save size={16} />
              保存
            </Button>
          </div>
        </div>

        <div className="border-b border-stone-200/70 p-4">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasUnsavedChanges(true);
              scheduleAutoSave();
            }}
            placeholder="笔记标题"
            className="w-full text-2xl font-bold outline-none"
          />
        </div>

        <div className="sticky top-[60px] z-10 flex flex-wrap items-center gap-1 border-b border-stone-200/70 bg-white/70 p-2 backdrop-blur-md">
          {toolbarItems.map(({ icon: Icon, action, title, active }, index) => (
            <button
              key={index}
              onClick={action}
              className={`rounded p-2 transition-colors ${
                active ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              title={title}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto">
          <Suspense fallback={<EditorSkeleton />}>
            <RichTextEditor
              ref={editorRef}
              content={currentNote?.content || ''}
              onUpdate={() => {
                setHasUnsavedChanges(true);
                scheduleAutoSave();
              }}
            />
          </Suspense>
        </div>
      </div>

      {!isNewNote && id && (
        <aside className="w-80 shrink-0 rounded-r-[22px] border-l border-stone-200/70 bg-stone-50/70 p-4">
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <button
                onClick={() => void loadVersions()}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="flex items-center gap-2 font-medium">
                  <History size={16} />
                  历史版本
                </span>
                <span className="text-sm text-gray-500">
                  {versionsLoaded ? `${versions.length} 条` : '点击加载'}
                </span>
              </button>
              {versionsLoading && <p className="mt-3 text-sm text-gray-500">加载中...</p>}
              {versionsLoaded && (
                <div className="mt-3 space-y-2">
                  {versions.length === 0 ? (
                    <p className="text-sm text-gray-500">暂无版本记录</p>
                  ) : (
                    versions.map((version) => (
                      <div key={version.id} className="rounded border border-gray-100 bg-gray-50 p-2">
                        <div className="text-sm font-medium">v{version.version}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(version.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <button
                onClick={() => void loadAttachments()}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Paperclip size={16} />
                  附件
                </span>
                <span className="text-sm text-gray-500">
                  {attachmentsLoaded ? `${attachments.length} 个` : '点击加载'}
                </span>
              </button>
              {attachmentsLoading && <p className="mt-3 text-sm text-gray-500">加载中...</p>}
              {attachmentsLoaded && (
                <div className="mt-3 space-y-2">
                  {attachments.length === 0 ? (
                    <p className="text-sm text-gray-500">暂无附件</p>
                  ) : (
                    attachments.map((attachment) => (
                      <div key={attachment.id} className="rounded border border-gray-100 bg-gray-50 p-2">
                        <div className="truncate text-sm font-medium">{attachment.filename}</div>
                        <div className="text-xs text-gray-500">
                          {(attachment.fileSize / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {showLinkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-lg bg-white p-4">
            <h3 className="mb-3 font-medium">添加链接</h3>
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

      {showImageDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-lg bg-white p-4">
            <h3 className="mb-3 font-medium">添加图片</h3>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="input-field mb-3"
              autoFocus
            />
            <p className="mb-3 text-sm text-gray-500">或直接粘贴图片（Ctrl/Cmd + V）</p>
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