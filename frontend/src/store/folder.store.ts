import { create } from 'zustand';
import { Folder } from '../types/note.types';
import { folderService } from '../services/folder.service';

interface FolderState {
  folders: Folder[];
  loading: boolean;
  fetchFolders: () => Promise<void>;
  createFolder: (data: { name: string; parentId?: string }) => Promise<Folder>;
  updateFolder: (id: string, data: { name?: string; parentId?: string }) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
}

export const useFolderStore = create<FolderState>((set, get) => ({
  folders: [],
  loading: false,

  fetchFolders: async () => {
    set({ loading: true });
    try {
      const response = await folderService.getFolders();
      set({ folders: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('获取文件夹列表失败:', error);
    }
  },

  createFolder: async (data: { name: string; parentId?: string }) => {
    try {
      const response = await folderService.createFolder(data);
      const newFolder = response.data;
      set({ folders: [...get().folders, newFolder] });
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
      });
    } catch (error) {
      console.error('更新文件夹失败:', error);
      throw error;
    }
  },

  deleteFolder: async (id: string) => {
    try {
      await folderService.deleteFolder(id);
      set({ folders: get().folders.filter((f) => f.id !== id) });
    } catch (error) {
      console.error('删除文件夹失败:', error);
      throw error;
    }
  },
}));