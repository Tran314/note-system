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
    <div
      onClick={onClick}
      className="card cursor-pointer hover:shadow-lg transition-shadow group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {note.isPinned && <Pin size={14} className="text-blue-600 shrink-0" />}
          <h3 className="font-medium truncate">{note.title}</h3>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 hover:bg-gray-100 rounded text-gray-500"
              title="编辑"
            >
              <Edit size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 hover:bg-red-50 rounded text-red-500"
              title="删除"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content preview */}
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
        {truncate(note.content?.replace(/<[^>]*>/g, '') || '无内容', 100)}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {timeAgo(note.updatedAt)}
        </span>
        
        {note.folder && (
          <span className="flex items-center gap-1">
            <Folder size={12} />
            {note.folder.name}
          </span>
        )}
        
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag size={12} />
            {note.tags.slice(0, 2).map((nt) => (
              <span
                key={nt.tagId}
                className="px-1 rounded"
                style={{ backgroundColor: nt.tag?.color || '#6B7280', color: '#fff' }}
              >
                {nt.tag?.name}
              </span>
            ))}
            {note.tags.length > 2 && (
              <span className="text-gray-400">+{note.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}