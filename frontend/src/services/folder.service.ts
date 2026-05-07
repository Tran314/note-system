import { localDb } from './local-db.service';
import { generateUUID } from '../utils/uuid';

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

const userId = import.meta.env.VITE_DEFAULT_USER_ID || 'test-user-001';

export class FolderService {
  async fetchFolders(): Promise<FolderTree[]> {
    const folders = await localDb.folders.where('userId').equals(userId).toArray();
    return this.buildTree(folders);
  }

  async createFolder(data: { name: string; parentId?: string | null }): Promise<Folder> {
    const folderId = generateUUID();
    const now = new Date().toISOString();

    const folder = {
      id: folderId,
      userId,
      name: data.name,
      parentId: data.parentId || null,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
      syncedAt: null,
    };

    await localDb.folders.add(folder);
    return folder;
  }

  async updateFolder(folderId: string, data: { name?: string }): Promise<Folder> {
    const folder = await localDb.folders.get(folderId);
    if (!folder) throw new Error('Folder not found');

    const updatedFolder = {
      ...folder,
      ...data,
      updatedAt: new Date().toISOString(),
      syncedAt: null,
    };

    await localDb.folders.update(folderId, updatedFolder);
    return updatedFolder;
  }

  async deleteFolder(folderId: string): Promise<void> {
    await localDb.folders.delete(folderId);
  }

  private buildTree(folders: any[]): FolderTree[] {
    const folderMap = new Map<string, FolderTree>();
    const roots: FolderTree[] = [];

    folders.forEach((f) => {
      folderMap.set(f.id, {
        id: f.id,
        name: f.name,
        parentId: f.parentId,
        children: [],
      });
    });

    folderMap.forEach((node) => {
      if (node.parentId && folderMap.has(node.parentId)) {
        folderMap.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}

export const folderService = new FolderService();
