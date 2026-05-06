import { create } from 'zustand';
import { Tag } from '../types/api.types';
import { tagService } from '../services/tag.service';

const CACHE_TTL = 30 * 1000;

interface TagState {
  tags: Tag[];
  loading: boolean;
<<<<<<< Updated upstream
  lastLoadedAt: number | null;
  fetchTags: (options?: { force?: boolean }) => Promise<void>;
=======
  error: string | null;
  fetchTags: () => Promise<void>;
>>>>>>> Stashed changes
  createTag: (data: { name: string; color?: string }) => Promise<Tag>;
  updateTag: (id: string, data: { name?: string; color?: string }) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  loading: false,
<<<<<<< Updated upstream
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
=======
  error: null,

  fetchTags: async () => {
    set({ loading: true, error: null });
    try {
      const response = await tagService.getTags();
      set({ tags: response.data.data, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '获取标签列表失败';
      set({ loading: false, error: message });
>>>>>>> Stashed changes
    }
  },

  createTag: async (data: { name: string; color?: string }) => {
    set({ error: null });
    try {
      const response = await tagService.createTag(data);
<<<<<<< Updated upstream
      const newTag = response.data;
      set({
        tags: [...get().tags, newTag],
        lastLoadedAt: Date.now(),
      });
=======
      const newTag = response.data.data;
      set({ tags: [...get().tags, newTag] });
>>>>>>> Stashed changes
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
        lastLoadedAt: Date.now(),
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
<<<<<<< Updated upstream
      set({
        tags: get().tags.filter((t) => t.id !== id),
        lastLoadedAt: Date.now(),
      });
    } catch (error) {
      console.error('删除标签失败:', error);
=======
      set({ tags: get().tags.filter((t) => t.id !== id) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '删除标签失败';
      set({ error: message });
>>>>>>> Stashed changes
      throw error;
    }
  },
}));
