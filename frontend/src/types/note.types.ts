export interface Note {
  id: string;
  userId: string;
  folderId?: string;
  title: string;
  content?: string;
  isPinned: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  folder?: Folder;
  tags?: NoteTag[];
  attachments?: Attachment[];
}

export interface NoteVersion {
  id: string;
  noteId: string;
  version: number;
  title: string;
  content?: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  parentId?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  children?: Folder[];
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  noteCount?: number;
}

export interface NoteTag {
  noteId: string;
  tagId: string;
  tag?: Tag;
}

export interface Attachment {
  id: string;
  noteId?: string;
  userId: string;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType?: string;
  createdAt: string;
}