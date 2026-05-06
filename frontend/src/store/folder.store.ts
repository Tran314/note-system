import { create } from 'zustand';
import { Folder } from '../types/api.types';
import { folderService } from '../services/folder.service';

const CACHE_TTL = 30 * 1000;

interface FolderState {
  folders: Folder[];
  loading: boolean;
<<<<<<< Updated upstream
  lastLoadedAt: number | null;
  fetchFolders: (options?: { force?: boolean }) => Promise<void>;
=======
  error: string | null;
  fetchFolders: () => Promise<void>;
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
  error: null,

  fetchFolders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await folderService.getFolders();
      set({ folders: response.data.data, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '获取文件夹列表失败';
      set({ loading: false, error: message });
>>>>>>> Stashed changes
    }
  },

  createFolder: async (data: { name: string; parentId?: string }) => {
    set({ error: null });
    try {
      const response = await folderService.createFolder(data);
<<<<<<< Updated upstream
      const newFolder = response.data;
      set({
        folders: [...get().folders, newFolder],
        lastLoadedAt: Date.now(),
      });
=======
      const newFolder = response.data.data;
      set({ folders: [...get().folders, newFolder] });
>>>>>>> Stashed changes
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
        lastLoadedAt: Date.now(),
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
<<<<<<< Updated upstream
      set({
        folders: get().folders.filter((f) => f.id !== id),
        lastLoadedAt: Date.now(),
      });
    } catch (error) {
      console.error('删除文件夹失败:', error);
=======
      set({ folders: get().folders.filter((f) => f.id !== id) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '删除文件夹失败';
      set({ error: message });
>>>>>>> Stashed changes
      throw error;
    }
  },
}));
