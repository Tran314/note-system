import { create } from 'zustand';
import { Folder } from '../types/api.types';
import { folderService } from '../services/folder.service';

interface FolderState {
  folders: Folder[];
  loading: boolean;
  error: string | null;
  fetchFolders: () => Promise<void>;
  createFolder: (data: { name: string; parentId?: string }) => Promise<Folder>;
  updateFolder: (
    id: string,
    data: { name?: string; parentId?: string },
  ) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
}

export const useFolderStore = create<FolderState>((set, get) => ({
  folders: [],
  loading: false,
  error: null,

  fetchFolders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await folderService.getFolders();
      set({ folders: response.data.data, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '获取文件夹列表失败';
      set({ loading: false, error: message });
    }
  },

  createFolder: async (data: { name: string; parentId?: string }) => {
    set({ error: null });
    try {
      const response = await folderService.createFolder(data);
      const newFolder = response.data.data;
      set({ folders: [...get().folders, newFolder] });
      return newFolder;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '创建文件夹失败';
      set({ error: message });
      throw error;
    }
  },

  updateFolder: async (id: string, data: { name?: string; parentId?: string }) => {
    set({ error: null });
    try {
      const response = await folderService.updateFolder(id, data);
      const updatedFolder = response.data.data;
      set({
        folders: get().folders.map((f) => (f.id === id ? updatedFolder : f)),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '更新文件夹失败';
      set({ error: message });
      throw error;
    }
  },

  deleteFolder: async (id: string) => {
    set({ error: null });
    try {
      await folderService.deleteFolder(id);
      set({ folders: get().folders.filter((f) => f.id !== id) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '删除文件夹失败';
      set({ error: message });
      throw error;
    }
  },
}));