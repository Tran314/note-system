import { localDb } from './local-db.service';
import { generateUUID } from '../utils/uuid';

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

const userId = import.meta.env.VITE_DEFAULT_USER_ID || 'test-user-001';

export class TagService {
  async fetchTags(): Promise<Tag[]> {
    return await localDb.tags.where('userId').equals(userId).toArray();
  }

  async createTag(data: { name: string; color?: string }): Promise<Tag> {
    const tagId = generateUUID();
    const tag = {
      id: tagId,
      userId,
      name: data.name,
      color: data.color || '#6B7280',
      createdAt: new Date().toISOString(),
      syncedAt: null,
    };

    await localDb.tags.add(tag);
    return tag;
  }

  async updateTag(tagId: string, data: { name?: string; color?: string }): Promise<Tag> {
    const tag = await localDb.tags.get(tagId);
    if (!tag) throw new Error('Tag not found');

    const updatedTag = { ...tag, ...data, syncedAt: null };
    await localDb.tags.update(tagId, updatedTag);
    return updatedTag;
  }

  async deleteTag(tagId: string): Promise<void> {
    await localDb.tags.delete(tagId);
  }
}

export const tagService = new TagService();
