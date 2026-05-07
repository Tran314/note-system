import Dexie, { Table } from 'dexie';

export interface LocalNote {
  id: string;
  userId: string;
  folderId: string | null;
  title: string;
  content: string | null;
  isPinned: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  syncedAt: string | null;
}

export interface LocalFolder {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
}

export interface LocalTag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  syncedAt: string | null;
}

export interface LocalUserSettings {
  userId: string;
  theme: string;
  editorFontSize: number;
  autoSave: boolean;
  autoSaveInterval: number;
  syncedAt: string | null;
}

class LocalDatabase extends Dexie {
  notes!: Table<LocalNote>;
  folders!: Table<LocalFolder>;
  tags!: Table<LocalTag>;
  settings!: Table<LocalUserSettings>;

  constructor() {
    super('NebulaLocalDB');
    this.version(1).stores({
      notes: 'id, userId, folderId, isDeleted, updatedAt, syncedAt',
      folders: 'id, userId, parentId, syncedAt',
      tags: 'id, userId, syncedAt',
      settings: 'userId, syncedAt',
    });
  }
}

export const localDb = new LocalDatabase();
