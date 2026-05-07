import { localDb, LocalNote, LocalFolder, LocalTag } from './local-db.service';
import { cosService } from './cos.service';

const userId = import.meta.env.VITE_DEFAULT_USER_ID || 'test-user-001';

export interface SyncStatus {
  lastSync: string | null;
  pendingChanges: number;
  syncing: boolean;
  error: string | null;
}

export class SyncService {
  private syncStatus: SyncStatus = {
    lastSync: null,
    pendingChanges: 0,
    syncing: false,
    error: null,
  };

  async getSyncStatus(): Promise<SyncStatus> {
    const unsyncedNotes = await localDb.notes.where('syncedAt').equals(null).count();
    const unsyncedFolders = await localDb.folders.where('syncedAt').equals(null).count();
    const unsyncedTags = await localDb.tags.where('syncedAt').equals(null).count();

    return {
      ...this.syncStatus,
      pendingChanges: unsyncedNotes + unsyncedFolders + unsyncedTags,
    };
  }

  async syncToCOS(): Promise<void> {
    this.syncStatus.syncing = true;
    this.syncStatus.error = null;

    try {
      await this.syncNotes();
      await this.syncFolders();
      await this.syncTags();

      this.syncStatus.lastSync = new Date().toISOString();
    } catch (error) {
      this.syncStatus.error = error instanceof Error ? error.message : '同步失败';
      throw error;
    } finally {
      this.syncStatus.syncing = false;
    }
  }

  async syncFromCOS(): Promise<void> {
    this.syncStatus.syncing = true;
    this.syncStatus.error = null;

    try {
      await this.downloadNotes();
      await this.downloadFolders();
      await this.downloadTags();

      this.syncStatus.lastSync = new Date().toISOString();
    } catch (error) {
      this.syncStatus.error = error instanceof Error ? error.message : '同步失败';
      throw error;
    } finally {
      this.syncStatus.syncing = false;
    }
  }

  private async syncNotes(): Promise<void> {
    const unsyncedNotes = await localDb.notes.where('syncedAt').equals(null).toArray();

    for (const note of unsyncedNotes) {
      await cosService.putJSON(`users/${userId}/notes/${note.id}.json`, {
        id: note.id,
        userId: note.userId,
        folderId: note.folderId,
        title: note.title,
        content: note.content,
        isPinned: note.isPinned,
        isDeleted: note.isDeleted,
        deletedAt: note.deletedAt,
        version: note.version,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        tags: note.tags,
      });

      await localDb.notes.update(note.id, { syncedAt: new Date().toISOString() });
    }

    const allNotes = await localDb.notes.where('userId').equals(userId).toArray();
    const activeNotes = allNotes.filter(n => !n.isDeleted);
    await cosService.putJSON(`users/${userId}/notes/index.json`, {
      userId,
      notes: activeNotes.map(n => ({
        id: n.id,
        title: n.title,
        updatedAt: n.updatedAt,
        isPinned: n.isPinned,
        folderId: n.folderId,
        tags: n.tags,
      })),
    });
  }

  private async syncFolders(): Promise<void> {
    const unsyncedFolders = await localDb.folders.where('syncedAt').equals(null).toArray();

    for (const folder of unsyncedFolders) {
      await cosService.putJSON(`users/${userId}/folders/${folder.id}.json`, folder);
      await localDb.folders.update(folder.id, { syncedAt: new Date().toISOString() });
    }

    const allFolders = await localDb.folders.where('userId').equals(userId).toArray();
    const tree = this.buildFolderTree(allFolders);
    await cosService.putJSON(`users/${userId}/folders/tree.json`, { userId, tree });
  }

  private async syncTags(): Promise<void> {
    const unsyncedTags = await localDb.tags.where('syncedAt').equals(null).toArray();

    for (const tag of unsyncedTags) {
      await cosService.putJSON(`users/${userId}/tags/${tag.id}.json`, tag);
      await localDb.tags.update(tag.id, { syncedAt: new Date().toISOString() });
    }

    const allTags = await localDb.tags.where('userId').equals(userId).toArray();
    await cosService.putJSON(`users/${userId}/tags/index.json`, {
      userId,
      tags: allTags.map(t => ({ id: t.id, name: t.name, color: t.color })),
    });
  }

  private async downloadNotes(): Promise<void> {
    const index = await cosService.getJSON(`users/${userId}/notes/index.json`);

    for (const noteSummary of index.notes || []) {
      const localNote = await localDb.notes.get(noteSummary.id);

      if (!localNote) {
        const note = await cosService.getJSON(`users/${userId}/notes/${noteSummary.id}.json`);
        await localDb.notes.add({
          ...note,
          syncedAt: new Date().toISOString(),
        });
      } else if (new Date(localNote.updatedAt) < new Date(noteSummary.updatedAt)) {
        const note = await cosService.getJSON(`users/${userId}/notes/${noteSummary.id}.json`);
        await localDb.notes.update(noteSummary.id, { ...note, syncedAt: new Date().toISOString() });
      }
    }
  }

  private async downloadFolders(): Promise<void> {
    const tree = await cosService.getJSON(`users/${userId}/folders/tree.json`);

    const flattenTree = (nodes: any[]): any[] => {
      return nodes.flatMap(node => [node, ...flattenTree(node.children || [])]);
    };

    const folders = flattenTree(tree.tree || []);

    for (const folder of folders) {
      const localFolder = await localDb.folders.get(folder.id);
      if (!localFolder) {
        await localDb.folders.add({ ...folder, syncedAt: new Date().toISOString() });
      }
    }
  }

  private async downloadTags(): Promise<void> {
    const index = await cosService.getJSON(`users/${userId}/tags/index.json`);

    for (const tag of index.tags || []) {
      const localTag = await localDb.tags.get(tag.id);
      if (!localTag) {
        await localDb.tags.add({ ...tag, syncedAt: new Date().toISOString() });
      }
    }
  }

  private buildFolderTree(folders: any[]): any[] {
    const folderMap = new Map<string, any>();
    const roots: any[] = [];

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
        folderMap.get(node.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}

export const syncService = new SyncService();
