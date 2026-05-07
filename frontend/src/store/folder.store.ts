import { create } from 'zustand';
import { Folder } from '../types/note.types';
import { folderService } from '../services/folder.service';

const CACHE_TTL = 30 * 1000;

interface FolderState {
  folders: Folder[];
  loading: boolean;
  lastLoadedAt: number | null;
  fetchFolders: (options?: { force?: boolean }) => Promise<void>;
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
  lastLoadedAt: null,

  fetchFolders: async (options?: { force?: boolean }) => {
    const { loading, lastLoadedAt, folders } = get();
    const isCacheFresh =
      !options?.force &&
      folders.length > 0 &&
      lastLoadedAt !== null &&
      Date.now() - lastLoadedAt < CACHE_TTL;

    if (loading || isCacheFresh) {
      return;
    }

    set({ loading: true });
    try {
      const response = await folderService.getFolders();
      set({
        folders: response.data,
        loading: false,
        lastLoadedAt: Date.now(),
      });
    } catch (error) {
      set({ loading: false });
      console.error('获取文件夹列表失败:', error);
    }
  },

  createFolder: async (data: { name: string; parentId?: string }) => {
    try {
      const response = await folderService.createFolder(data);
      const newFolder = response.data;
      set({
        folders: [...get().folders, newFolder],
        lastLoadedAt: Date.now(),
      });
      return newFolder;
    } catch (error) {
      console.error('创建文件夹失败:', error);
      throw error;
    }
  },

  updateFolder: async (id: string, data: { name?: string; parentId?: string }) => {
    try {
      const response = await folderService.updateFolder(id, data);
      const updatedFolder = response.data;
      set({
        folders: get().folders.map((f) => (f.id === id ? updatedFolder : f)),
        lastLoadedAt: Date.now(),
      });
    } catch (error) {
      console.error('更新文件夹失败:', error);
      throw error;
    }
  },

  deleteFolder: async (id: string) => {
    try {
      await folderService.deleteFolder(id);
      set({
        folders: get().folders.filter((f) => f.id !== id),
        lastLoadedAt: Date.now(),
      });
    } catch (error) {
      console.error('删除文件夹失败:', error);
      throw error;
    }
  },
}));
