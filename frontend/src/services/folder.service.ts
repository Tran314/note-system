import { localDb } from './local-db.service';
import { generateUUID } from '../utils/uuid';

const userId = 'anonymous-user';

export interface Folder {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FolderTree {
  id: string;
  name: string;
  parentId: string | null;
  children: FolderTree[];
}

export class FolderService {
  async getFolders(): Promise<Folder[]> {
    return await localDb.folders.where('userId').equals(userId).toArray();
  }

  async getFolder(id: string): Promise<Folder> {
    const folder = await localDb.folders.get(id);
    if (!folder) throw new Error('Folder not found');
    return folder;
  }

  async createFolder(data: { name: string; parentId?: string; sortOrder?: number }): Promise<Folder> {
    const folderId = generateUUID();
    const now = new Date().toISOString();

    const folder = {
      id: folderId,
      userId,
      name: data.name,
      parentId: data.parentId || null,
      sortOrder: data.sortOrder || 0,
      createdAt: now,
      updatedAt: now,
      syncedAt: null,
    };

    await localDb.folders.add(folder);
    return folder;
  }

  async updateFolder(id: string, data: { name?: string; parentId?: string; sortOrder?: number }): Promise<Folder> {
    const folder = await localDb.folders.get(id);
    if (!folder) throw new Error('Folder not found');

    const updatedFolder = {
      ...folder,
      ...data,
      updatedAt: new Date().toISOString(),
      syncedAt: null,
    };

    await localDb.folders.update(id, updatedFolder);
    return updatedFolder;
  }

  async deleteFolder(id: string): Promise<void> {
    await localDb.folders.delete(id);
  }
}

export const folderService = new FolderService();
