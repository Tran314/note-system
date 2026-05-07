import { cosService } from './cos.service';
import { cacheService } from './cache.service';
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
    const index = await cacheService.getWithCache(
      () => cosService.getJSON(`users/${userId}/tags/index.json`),
      `tags-index-${userId}`,
      60000
    );
    return index.tags || [];
  }

  async createTag(data: { name: string; color?: string }): Promise<Tag> {
    const tagId = generateUUID();
    const tag: Tag = {
      id: tagId,
      userId,
      name: data.name,
      color: data.color || '#6B7280',
      createdAt: new Date().toISOString(),
    };

    await this.updateTagInIndex(tag, 'add');
    return tag;
  }

  async updateTag(tagId: string, data: { name?: string; color?: string }): Promise<Tag> {
    const tag = await cosService.getJSON(`users/${userId}/tags/${tagId}.json`);
    const updatedTag = { ...tag, ...data };

    await cosService.putJSON(`users/${userId}/tags/${tagId}.json`, updatedTag);
    await this.updateTagInIndex(updatedTag, 'update');

    return updatedTag;
  }

  async deleteTag(tagId: string): Promise<void> {
    await cosService.deleteJSON(`users/${userId}/tags/${tagId}.json`);
    await this.updateTagInIndex({ id: tagId }, 'remove');
  }

  private async updateTagInIndex(
    tag: Partial<Tag>,
    action: 'add' | 'update' | 'remove'
  ): Promise<void> {
    const index = await cosService.getJSON(`users/${userId}/tags/index.json`);
    let tags = index.tags || [];

    if (action === 'add') {
      tags.push(tag as Tag);
    } else if (action === 'update') {
      tags = tags.map((t: Tag) => (t.id === tag.id ? { ...t, ...tag } : t));
    } else {
      tags = tags.filter((t: Tag) => t.id !== tag.id);
    }

    await cosService.putJSON(`users/${userId}/tags/index.json`, {
      userId,
      tags,
    });
    cacheService.invalidate(`tags-index-${userId}`);
  }
}

export const tagService = new TagService();
