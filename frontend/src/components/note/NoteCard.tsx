import { Note } from '../../types/note.types';
import { Pin, Clock, Folder, Tag, Trash2, Edit } from 'lucide-react';
import { timeAgo, truncate } from '../../utils/format';

interface NoteCardProps {
  note: Note;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function NoteCard({ note, onClick, onEdit, onDelete }: NoteCardProps) {
  return (
    <div onClick={onClick} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-shadow group cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {note.isPinned && <Pin size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
          <h3 className="font-medium truncate text-gray-900 dark:text-gray-100">{note.title}</h3>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
              title="编辑"
            >
              <Edit size={14} />
            </button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 dark:text-red-400"
              title="删除"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content preview */}
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
        {truncate(note.content?.replace(/<[^>]*>/g, '') || '', 120)}
      </p>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{timeAgo(note.updatedAt)}</span>
        </div>
        
        {note.folder && (
          <div className="flex items-center gap-1">
            <Folder size={12} />
            <span className="truncate max-w-[100px]">{note.folder.name}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {note.tags.slice(0, 3).map((tag: any) => (
            <span key={tag.id || tag.tagId}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <Tag size={10} style={{ color: tag.color || '#6B7280' }} />
              {tag.name || tag.tagName}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">+{note.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}