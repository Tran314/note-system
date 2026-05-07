import { cosService } from './cos.service';
import { cacheService } from './cache.service';
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
    const tree = await cacheService.getWithCache(
      () => cosService.getJSON(`users/${userId}/folders/tree.json`),
      `folders-tree-${userId}`,
      60000
    );
    return tree.tree || [];
  }

  async createFolder(data: { name: string; parentId?: string | null }): Promise<Folder> {
    const folderId = generateUUID();
    const now = new Date().toISOString();

    const folder: Folder = {
      id: folderId,
      userId,
      name: data.name,
      parentId: data.parentId || null,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    };

    await cosService.putJSON(`users/${userId}/folders/${folderId}.json`, folder);
    await this.updateTree();

    return folder;
  }

  async updateFolder(folderId: string, data: { name?: string }): Promise<Folder> {
    const folder = await cosService.getJSON(`users/${userId}/folders/${folderId}.json`);
    const updatedFolder = {
      ...folder,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await cosService.putJSON(`users/${userId}/folders/${folderId}.json`, updatedFolder);
    await this.updateTree();

    return updatedFolder;
  }

  async deleteFolder(folderId: string): Promise<void> {
    await cosService.deleteJSON(`users/${userId}/folders/${folderId}.json`);
    await this.updateTree();
  }

  private async updateTree(): Promise<void> {
    const allFolders = await this.listAllFolders();
    const tree = this.buildTree(allFolders);

    await cosService.putJSON(`users/${userId}/folders/tree.json`, {
      userId,
      tree,
    });
    cacheService.invalidate(`folders-tree-${userId}`);
  }

  private async listAllFolders(): Promise<Folder[]> {
    const keys = await cosService.listObjects(`users/${userId}/folders/`);
    const folderKeys = keys.filter(
      (k) => k.endsWith('.json') && !k.includes('tree.json')
    );
    const folders = await Promise.all(
      folderKeys.map((k) => cosService.getJSON(k))
    );
    return folders;
  }

  private buildTree(folders: Folder[]): FolderTree[] {
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
