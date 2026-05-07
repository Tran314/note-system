import { create } from 'zustand';
import { Tag } from '../types/note.types';
import { tagService } from '../services/tag.service';

const CACHE_TTL = 30 * 1000;

interface TagState {
  tags: Tag[];
  loading: boolean;
  lastLoadedAt: number | null;
  fetchTags: (options?: { force?: boolean }) => Promise<void>;
  createTag: (data: { name: string; color?: string }) => Promise<Tag>;
  updateTag: (id: string, data: { name?: string; color?: string }) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  loading: false,
  lastLoadedAt: null,

  fetchTags: async (options?: { force?: boolean }) => {
    const { loading, lastLoadedAt, tags } = get();
    const isCacheFresh =
      !options?.force &&
      tags.length > 0 &&
      lastLoadedAt !== null &&
      Date.now() - lastLoadedAt < CACHE_TTL;

    if (loading || isCacheFresh) {
      return;
    }

    set({ loading: true });
    try {
      const response = await tagService.getTags();
      set({
        tags: response.data,
        loading: false,
        lastLoadedAt: Date.now(),
      });
    } catch (error) {
      set({ loading: false });
      console.error('获取标签列表失败:', error);
    }
  },

  createTag: async (data: { name: string; color?: string }) => {
    try {
      const response = await tagService.createTag(data);
      const newTag = response.data;
      set({
        tags: [...get().tags, newTag],
        lastLoadedAt: Date.now(),
      });
      return newTag;
    } catch (error) {
      console.error('创建标签失败:', error);
      throw error;
    }
  },

  updateTag: async (id: string, data: { name?: string; color?: string }) => {
    try {
      const response = await tagService.updateTag(id, data);
      const updatedTag = response.data;
      set({
        tags: get().tags.map((t) => (t.id === id ? updatedTag : t)),
        lastLoadedAt: Date.now(),
      });
    } catch (error) {
      console.error('更新标签失败:', error);
      throw error;
    }
  },

  deleteTag: async (id: string) => {
    try {
      await tagService.deleteTag(id);
      set({
        tags: get().tags.filter((t) => t.id !== id),
        lastLoadedAt: Date.now(),
      });
    } catch (error) {
      console.error('删除标签失败:', error);
      throw error;
    }
  },
}));
