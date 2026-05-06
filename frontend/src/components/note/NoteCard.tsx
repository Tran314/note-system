import { Note } from '../../types/api.types';
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
      className="card group cursor-pointer p-4 transition-all hover:-translate-y-0.5"
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {note.isPinned && <Pin size={14} className="shrink-0 text-amber-700" />}
          <h3 className="truncate font-medium text-stone-900">{note.title}</h3>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="rounded-xl p-1.5 text-stone-500 hover:bg-stone-100/80"
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
              className="rounded-xl p-1.5 text-red-500 hover:bg-red-50/80"
              title="删除"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <p className="mb-3 line-clamp-2 text-sm text-stone-500">
        {truncate(note.content?.replace(/<[^>]*>/g, '') || '', 120)}
      </p>

      <div className="flex items-center gap-4 text-xs text-stone-400">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{timeAgo(note.updatedAt)}</span>
        </div>

        {note.folder && (
          <div className="flex items-center gap-1">
            <Folder size={12} />
            <span className="max-w-[100px] truncate">{note.folder.name}</span>
          </div>
        )}
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {note.tags.slice(0, 3).map((tag: any) => (
            <span
              key={tag.id || tag.tagId}
              className="inline-flex items-center gap-1 rounded-full bg-stone-100/80 px-2 py-0.5 text-xs text-stone-600"
            >
              <Tag size={10} style={{ color: tag.color || '#6B7280' }} />
              {tag.name || tag.tagName}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-xs text-stone-400">+{note.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}
