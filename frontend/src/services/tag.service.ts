import { localDb } from './local-db.service';
import { generateUUID } from '../utils/uuid';

const userId = 'anonymous-user';

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

export class TagService {
  async getTags(): Promise<Tag[]> {
    return await localDb.tags.where('userId').equals(userId).toArray();
  }

  async getTag(id: string): Promise<Tag> {
    const tag = await localDb.tags.get(id);
    if (!tag) throw new Error('Tag not found');
    return tag;
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

  async updateTag(id: string, data: { name?: string; color?: string }): Promise<Tag> {
    const tag = await localDb.tags.get(id);
    if (!tag) throw new Error('Tag not found');

    const updatedTag = { ...tag, ...data, syncedAt: null };
    await localDb.tags.update(id, updatedTag);
    return updatedTag;
  }

  async deleteTag(id: string): Promise<void> {
    await localDb.tags.delete(id);
  }

  async addToNote(noteId: string, tagId: string): Promise<void> {
    const note = await localDb.notes.get(noteId);
    if (!note) throw new Error('Note not found');
    
    if (!note.tags.includes(tagId)) {
      await localDb.notes.update(noteId, {
        tags: [...note.tags, tagId],
        updatedAt: new Date().toISOString(),
        syncedAt: null,
      });
    }
  }

  async removeFromNote(noteId: string, tagId: string): Promise<void> {
    const note = await localDb.notes.get(noteId);
    if (!note) throw new Error('Note not found');
    
    await localDb.notes.update(noteId, {
      tags: note.tags.filter(t => t !== tagId),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
    });
  }
}

export const tagService = new TagService();
