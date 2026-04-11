import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNoteStore } from '../store/note.store';
import { useFolderStore } from '../store/folder.store';
import { useTagStore } from '../store/tag.store';
import {
  FileText,
  Pin,
  Trash2,
  Clock,
  Folder,
  Tag,
  Plus,
  Search,
  Grid,
  List,
} from 'lucide-react';
import { timeAgo, truncate } from '../utils/format';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Note } from '../types/note.types';

const NOTE_LIST_SEARCH_KEY = 'note-list-search';
const NOTE_LIST_VIEW_MODE_KEY = 'note-list-view-mode';
const LIST_ROW_HEIGHT = 140;
const LIST_OVERSCAN = 6;

const normalizeSearchText = (value: string) =>
  value.toLowerCase().replace(/\s+/g, ' ').trim();

const buildSearchIndex = (note: Note) =>
  normalizeSearchText(
    [
      note.title,
      note.content,
      note.folder?.name,
      ...(note.tags?.map((nt) => nt.tag?.name || '') || []),
    ]
      .filter(Boolean)
      .join(' '),
  );

const readStoredText = (key: string) => {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
};

const readStoredViewMode = (): 'list' | 'grid' => {
  try {
    return localStorage.getItem(NOTE_LIST_VIEW_MODE_KEY) === 'grid' ? 'grid' : 'list';
  } catch {
    return 'list';
  }
};

function NoteList() {
  const navigate = useNavigate();
  const { notes, loading, fetchNotes, deleteNote, prefetchNote } = useNoteStore();
  const { folders, fetchFolders } = useFolderStore();
  const { tags, fetchTags } = useTagStore();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [keywordInput, setKeywordInput] = useState(() => readStoredText(NOTE_LIST_SEARCH_KEY));
  const deferredKeyword = useDeferredValue(keywordInput.trim());
  const normalizedKeyword = normalizeSearchText(deferredKeyword);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => readStoredViewMode());
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    fetchFolders();
    fetchTags();
  }, [fetchFolders, fetchTags]);

  useEffect(() => {
    fetchNotes({
      folderId: selectedFolder || undefined,
      tagId: selectedTag || undefined,
      limit: 200,
    });
  }, [selectedFolder, selectedTag, fetchNotes]);

  useEffect(() => {
    localStorage.setItem(NOTE_LIST_SEARCH_KEY, keywordInput);
  }, [keywordInput]);

  useEffect(() => {
    localStorage.setItem(NOTE_LIST_VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const syncContainerHeight = () => {
      setContainerHeight(container.clientHeight);
    };

    syncContainerHeight();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', syncContainerHeight);
      return () => window.removeEventListener('resize', syncContainerHeight);
    }

    const observer = new ResizeObserver(() => syncContainerHeight());
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (viewMode !== 'list') {
      setScrollTop(0);
      return;
    }

    scrollContainerRef.current?.scrollTo({ top: 0 });
    setScrollTop(0);
  }, [viewMode, normalizedKeyword, selectedFolder, selectedTag]);

  const displayedNotes = useMemo(
    () =>
      normalizedKeyword
        ? notes.filter((note) => buildSearchIndex(note).includes(normalizedKeyword))
        : notes,
    [notes, normalizedKeyword],
  );

  const visibleRange = useMemo(() => {
    if (viewMode !== 'list') {
      return null;
    }

    const safeContainerHeight = containerHeight || LIST_ROW_HEIGHT * 6;
    const startIndex = Math.max(0, Math.floor(scrollTop / LIST_ROW_HEIGHT) - LIST_OVERSCAN);
    const endIndex = Math.min(
      displayedNotes.length,
      Math.ceil((scrollTop + safeContainerHeight) / LIST_ROW_HEIGHT) + LIST_OVERSCAN,
    );

    return {
      startIndex,
      endIndex,
      topSpacerHeight: startIndex * LIST_ROW_HEIGHT,
      bottomSpacerHeight: Math.max(0, (displayedNotes.length - endIndex) * LIST_ROW_HEIGHT),
    };
  }, [containerHeight, displayedNotes.length, scrollTop, viewMode]);

  const visibleNotes =
    viewMode === 'list' && visibleRange
      ? displayedNotes.slice(visibleRange.startIndex, visibleRange.endIndex)
      : displayedNotes;

  const handleDelete = async (noteId: string) => {
    if (confirm('纭畾瑕佸垹闄ゆ绗旇鍚楋紵')) {
      await deleteNote(noteId);
    }
  };

  const handleCreateNote = () => {
    navigate('/notes/new');
  };

  const renderNoteItem = (note: Note, className = '') => (
    <div
      key={note.id}
      onClick={() => navigate(`/notes/${note.id}`)}
      onMouseEnter={() => void prefetchNote(note.id)}
      onFocus={() => void prefetchNote(note.id)}
      className={`note-item group ${viewMode === 'grid' ? 'rounded-lg border hover:shadow-md' : ''} ${className}`}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {note.isPinned && <Pin size={14} className="shrink-0 text-blue-600" />}
          <h3 className="truncate font-medium">{note.title}</h3>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(note.id);
            }}
            className="rounded p-1 text-red-500 hover:bg-red-50"
            title="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p className="mb-3 line-clamp-2 text-sm text-gray-500">
        {truncate(note.content?.replace(/<[^>]*>/g, '') || '无内容', 100)}
      </p>

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {timeAgo(note.updatedAt)}
        </span>

        {note.folder && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFolder(note.folder!.id);
            }}
            className="flex items-center gap-1 hover:text-blue-600"
          >
            <Folder size={12} />
            {note.folder.name}
          </button>
        )}

        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag size={12} />
            {note.tags.slice(0, 3).map((nt) => (
              <button
                key={nt.tagId}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTag(nt.tagId);
                }}
                className="rounded px-1.5 py-0.5 text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: nt.tag?.color || '#6B7280' }}
              >
                {nt.tag?.name}
              </button>
            ))}
            {note.tags.length > 3 && (
              <span className="text-gray-400">+{note.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="鎼滅储绗旇..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              icon={<Search size={18} />}
            />
          </div>

          <div className="flex overflow-hidden rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
              title="鍒楄〃瑙嗗浘"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
              title="缃戞牸瑙嗗浘"
            >
              <Grid size={18} />
            </button>
          </div>

          <Button onClick={handleCreateNote}>
            <Plus size={18} />
            鏂板缓绗旇
          </Button>
        </div>

        {(selectedFolder || selectedTag) && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">绛涢€夛細</span>
            {selectedFolder && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-sm text-blue-700">
                {folders.find((f) => f.id === selectedFolder)?.name}
                <button
                  onClick={() => setSelectedFolder(null)}
                  className="hover:text-blue-900"
                >
                  脳
                </button>
              </span>
            )}
            {selectedTag && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-700">
                {tags.find((t) => t.id === selectedTag)?.name}
                <button
                  onClick={() => setSelectedTag(null)}
                  className="hover:text-gray-900"
                >
                  脳
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={viewMode === 'list' ? (e) => setScrollTop(e.currentTarget.scrollTop) : undefined}
        className="flex-1 overflow-auto p-4"
      >
        {loading ? (
          <div className="py-8 text-center text-gray-500">加载中...</div>
        ) : displayedNotes.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <FileText size={48} className="mx-auto mb-3 opacity-50" />
            <p className="mb-2">{normalizedKeyword ? '没有匹配的笔记' : '暂无笔记'}</p>
            {!normalizedKeyword && (
              <Button variant="ghost" onClick={handleCreateNote}>
                <Plus size={16} />
                创建第一篇笔记
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {displayedNotes.map((note) => renderNoteItem(note))}
          </div>
        ) : (
          <div>
            <div style={{ height: `${visibleRange?.topSpacerHeight ?? 0}px` }} />
            {visibleNotes.map((note) => (
              <div key={note.id} style={{ height: `${LIST_ROW_HEIGHT}px` }}>
                {renderNoteItem(note, 'h-full overflow-hidden')}
              </div>
            ))}
            <div style={{ height: `${visibleRange?.bottomSpacerHeight ?? 0}px` }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteList;
