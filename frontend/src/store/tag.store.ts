import { create } from 'zustand';
import { tagService, Tag } from '../services/tag.service';

interface TagState {
  tags: Tag[];
  loading: boolean;
  fetchTags: () => Promise<void>;
  createTag: (data: { name: string; color?: string }) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  loading: false,

  fetchTags: async () => {
    set({ loading: true });
    try {
      const tags = await tagService.fetchTags();
      set({ tags });
    } finally {
      set({ loading: false });
    }
  },

  createTag: async (data) => {
    await tagService.createTag(data);
    await get().fetchTags();
  },

  deleteTag: async (id) => {
    await tagService.deleteTag(id);
    await get().fetchTags();
  },
}));
