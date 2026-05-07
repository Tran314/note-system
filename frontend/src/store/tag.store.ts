import { create } from 'zustand';
import { Tag } from '../types/api.types';
import { tagService } from '../services/tag.service';

interface TagState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  fetchTags: () => Promise<void>;
  createTag: (data: { name: string; color?: string }) => Promise<Tag>;
  updateTag: (id: string, data: { name?: string; color?: string }) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  loading: false,
  error: null,

  fetchTags: async () => {
    set({ loading: true, error: null });
    try {
      const response = await tagService.getTags();
      set({ tags: response.data.data, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '获取标签列表失败';
      set({ loading: false, error: message });
    }
  },

  createTag: async (data: { name: string; color?: string }) => {
    set({ error: null });
    try {
      const response = await tagService.createTag(data);
      const newTag = response.data.data;
      set({ tags: [...get().tags, newTag] });
      return newTag;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '创建标签失败';
      set({ error: message });
      throw error;
    }
  },

  updateTag: async (id: string, data: { name?: string; color?: string }) => {
    set({ error: null });
    try {
      const response = await tagService.updateTag(id, data);
      const updatedTag = response.data.data;
      set({
        tags: get().tags.map((t) => (t.id === id ? updatedTag : t)),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '更新标签失败';
      set({ error: message });
      throw error;
    }
  },

  deleteTag: async (id: string) => {
    set({ error: null });
    try {
      await tagService.deleteTag(id);
      set({ tags: get().tags.filter((t) => t.id !== id) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '删除标签失败';
      set({ error: message });
      throw error;
    }
  },
}));