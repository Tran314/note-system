export interface User {
  id: string;
  email: string;
  nickname: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NoteQueryResponse {
  notes: Note[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

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

export interface NoteVersion {
  id: string;
  noteId: string;
  version: number;
  title: string;
  content?: string;
  createdAt: string;
}

export interface BatchUpdateItem {
  id: string;
  data: {
    title?: string;
    content?: string;
    folderId?: string;
    isPinned?: boolean;
    tags?: string[];
  };
}

export interface NoteQueryParams {
  folderId?: string;
  tagId?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface CreateNoteData {
  title: string;
  content?: string;
  folderId?: string;
  tags?: string[];
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  folderId?: string;
  isPinned?: boolean;
  tags?: string[];
}