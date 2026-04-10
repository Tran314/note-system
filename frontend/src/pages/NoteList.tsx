import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNoteStore } from '../store/note.store';
import { useFolderStore } from '../store/folder.store';
import { useTagStore } from '../store/tag.store';
import { FileText, Pin, Trash2, Clock, Folder, Tag, Plus, Search, Grid, List } from 'lucide-react';
import { timeAgo, truncate, debounce } from '../utils/format';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Note } from '../types/note.types';

function NoteList() {
  const navigate = useNavigate();
  const { notes, loading, fetchNotes, deleteNote } = useNoteStore();
  const { folders, fetchFolders } = useFolderStore();
  const { tags, fetchTags } = useTagStore();
  
  const [keyword, setKeyword] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // 初始加载数据
  useEffect(() => {
    fetchNotes({ keyword, folderId: selectedFolder || undefined, tagId: selectedTag || undefined });
    fetchFolders();
    fetchTags();
  }, [keyword, selectedFolder, selectedTag]);

  // 防抖搜索
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setKeyword(value);
    }, 300),
    []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleDelete = async (noteId: string) => {
    if (confirm('确定要删除此笔记吗？')) {
      await deleteNote(noteId);
    }
  };

  const handleCreateNote = () => {
    navigate('/notes/new');
  };

  const renderNoteItem = (note: Note) => (
    <div
      key={note.id}
      onClick={() => navigate(`/notes/${note.id}`)}
      className={`note-item group ${viewMode === 'grid' ? 'rounded-lg border hover:shadow-md' : ''}`}
    >
      {/* 标题行 */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {note.isPinned && <Pin size={14} className="text-blue-600 shrink-0" />}
          <h3 className="font-medium truncate">{note.title}</h3>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(note.id);
            }}
            className="p-1 hover:bg-red-50 rounded text-red-500"
            title="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 内容预览 */}
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
        {truncate(note.content?.replace(/<[^>]*>/g, '') || '无内容', 100)}
      </p>

      {/* 元信息 */}
      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
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
                className="px-1.5 py-0.5 rounded text-white hover:opacity-80 transition-opacity"
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
    <div className="h-full flex flex-col">
      {/* 顶部工具栏 */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3 mb-3">
          {/* 搜索框 */}
          <div className="flex-1">
            <Input
              placeholder="搜索笔记..."
              onChange={handleSearch}
              icon={<Search size={18} />}
            />
          </div>
          
          {/* 视图切换 */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
              title="列表视图"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
              title="网格视图"
            >
              <Grid size={18} />
            </button>
          </div>
          
          {/* 新建按钮 */}
          <Button onClick={handleCreateNote}>
            <Plus size={18} />
            新建笔记
          </Button>
        </div>

        {/* 筛选标签 */}
        {(selectedFolder || selectedTag) && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">筛选：</span>
            {selectedFolder && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {folders.find(f => f.id === selectedFolder)?.name}
                <button onClick={() => setSelectedFolder(null)} className="hover:text-blue-900">×</button>
              </span>
            )}
            {selectedTag && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {tags.find(t => t.id === selectedTag)?.name}
                <button onClick={() => setSelectedTag(null)} className="hover:text-gray-900">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 笔记列表 */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">加载中...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText size={48} className="mx-auto mb-3 opacity-50" />
            <p className="mb-2">暂无笔记</p>
            <Button variant="ghost" onClick={handleCreateNote}>
              <Plus size={16} />
              创建第一篇笔记
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 gap-4' : ''}>
            {notes.map(renderNoteItem)}
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteList;