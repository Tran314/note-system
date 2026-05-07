import { create } from 'zustand';
import { folderService, FolderTree } from '../services/folder.service';

interface FolderState {
  folders: FolderTree[];
  loading: boolean;
  fetchFolders: () => Promise<void>;
  createFolder: (data: { name: string; parentId?: string }) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
}

export const useFolderStore = create<FolderState>((set, get) => ({
  folders: [],
  loading: false,

  fetchFolders: async () => {
    set({ loading: true });
    try {
      const folders = await folderService.fetchFolders();
      set({ folders });
    } finally {
      set({ loading: false });
    }
  },

  createFolder: async (data) => {
    await folderService.createFolder(data);
    await get().fetchFolders();
  },

  deleteFolder: async (id) => {
    await folderService.deleteFolder(id);
    await get().fetchFolders();
  },
}));
