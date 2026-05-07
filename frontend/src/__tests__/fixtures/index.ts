import type { User, Note, Folder, Tag, Attachment, NoteTag } from '../../types/api.types';

export const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  nickname: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const mockNote: Note = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Test Note',
  content: '<p>Test content</p>',
  isPinned: false,
  isDeleted: false,
  version: 1,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockFolder: Folder = {
  id: 'folder-1',
  userId: 'user-1',
  name: 'Test Folder',
  sortOrder: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockTag: Tag = {
  id: 'tag-1',
  userId: 'user-1',
  name: 'Test Tag',
  color: '#3B82F6',
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const mockAttachment: Attachment = {
  id: 'attachment-1',
  userId: 'user-1',
  noteId: 'note-1',
  filename: 'test.png',
  filePath: 'test.png',
  fileSize: 1024,
  mimeType: 'image/png',
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const mockNoteTag: NoteTag = {
  noteId: 'note-1',
  tagId: 'tag-1',
  tag: mockTag,
};

export function createMockNote(overrides: Partial<Note> = {}): Note {
  return { ...mockNote, ...overrides };
}

export function createMockFolder(overrides: Partial<Folder> = {}): Folder {
  return { ...mockFolder, ...overrides };
}

export function createMockTag(overrides: Partial<Tag> = {}): Tag {
  return { ...mockTag, ...overrides };
}
