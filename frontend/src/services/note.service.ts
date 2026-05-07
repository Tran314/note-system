import { localDb, LocalNote } from './local-db.service';
import { generateUUID } from '../utils/uuid';

export interface Note {
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
}

export interface NoteSummary {
  id: string;
  title: string;
  updatedAt: string;
  isPinned: boolean;
  folderId: string | null;
  tags: string[];
}

export interface CreateNoteData {
  title: string;
  content?: string;
  folderId?: string | null;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  folderId?: string | null;
  isPinned?: boolean;
}

const userId = import.meta.env.VITE_DEFAULT_USER_ID || 'test-user-001';

export class NoteService {
  async fetchNotes(): Promise<NoteSummary[]> {
    const notes = await localDb.notes
      .where({ userId, isDeleted: false })
      .sortBy('updatedAt');

    return notes.reverse().map(n => ({
      id: n.id,
      title: n.title,
      updatedAt: n.updatedAt,
      isPinned: n.isPinned,
      folderId: n.folderId,
      tags: n.tags,
    }));
  }

  async fetchNote(noteId: string): Promise<Note> {
    const note = await localDb.notes.get(noteId);
    if (!note) throw new Error('Note not found');
    return note;
  }

  async createNote(data: CreateNoteData): Promise<Note> {
    const noteId = generateUUID();
    const now = new Date().toISOString();

    const note: LocalNote = {
      id: noteId,
      userId,
      folderId: data.folderId || null,
      title: data.title,
      content: data.content || null,
      isPinned: false,
      isDeleted: false,
      deletedAt: null,
      version: 1,
      createdAt: now,
      updatedAt: now,
      tags: [],
      syncedAt: null,
    };

    await localDb.notes.add(note);
    return note;
  }

  async updateNote(noteId: string, data: UpdateNoteData): Promise<Note> {
    const note = await localDb.notes.get(noteId);
    if (!note) throw new Error('Note not found');

    const updatedNote = {
      ...note,
      ...data,
      updatedAt: new Date().toISOString(),
      version: note.version + 1,
      syncedAt: null,
    };

    await localDb.notes.update(noteId, updatedNote);
    return updatedNote;
  }

  async deleteNote(noteId: string): Promise<void> {
    const note = await localDb.notes.get(noteId);
    if (!note) throw new Error('Note not found');

    await localDb.notes.update(noteId, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
    });
  }
}

export const noteService = new NoteService();
