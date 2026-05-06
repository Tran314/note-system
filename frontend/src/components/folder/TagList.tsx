import { Tag as TagIcon } from 'lucide-react';
import type { Tag } from '../../types/api.types';

interface TagListProps {
  tags: Tag[];
  selectedTag: string | null;
  onSelectTag: (tagId: string) => void;
  onContextMenu: (type: 'folder' | 'tag', id: string, x: number, y: number) => void;
  t: (key: string) => string;
}

export function TagList({ tags, selectedTag, onSelectTag, onContextMenu, t }: TagListProps) {
  if (tags.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 px-2 py-1">{t('tags.noTags')}</p>
    );
  }

  return (
    <div className="space-y-0.5">
      {tags.map((tag) => {
        const isSelected = selectedTag === tag.id;
        return (
          <div
            key={tag.id}
            onClick={() => onSelectTag(tag.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              onContextMenu('tag', tag.id, e.clientX, e.clientY);
            }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer group
              ${isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <TagIcon size={14} style={{ color: tag.color }} />
            <span className="text-sm flex-1 truncate">{tag.name}</span>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
          </div>
        );
      })}
    </div>
  );
}
