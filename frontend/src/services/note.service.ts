import { cosService } from './cos.service';
import { cacheService } from './cache.service';
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
    const index = await cacheService.getWithCache(
      () => cosService.getJSON(`users/${userId}/notes/index.json`),
      `notes-index-${userId}`,
      30000
    );
    return index.notes || [];
  }

  async fetchNote(noteId: string): Promise<Note> {
    return await cosService.getJSON(`users/${userId}/notes/${noteId}.json`);
  }

  async createNote(data: CreateNoteData): Promise<Note> {
    const noteId = generateUUID();
    const now = new Date().toISOString();
    
    const note: Note = {
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
    };

    await cosService.putJSON(`users/${userId}/notes/${noteId}.json`, note);
    await this.updateIndex();

    return note;
  }

  async updateNote(noteId: string, data: UpdateNoteData): Promise<Note> {
    const note = await this.fetchNote(noteId);
    const updatedNote = {
      ...note,
      ...data,
      updatedAt: new Date().toISOString(),
      version: note.version + 1,
    };

    await cosService.putJSON(`users/${userId}/notes/${noteId}.json`, updatedNote);
    await this.updateIndex();

    return updatedNote;
  }

  async deleteNote(noteId: string): Promise<void> {
    const note = await this.fetchNote(noteId);
    const deletedNote = {
      ...note,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await cosService.putJSON(`users/${userId}/notes/${noteId}.json`, deletedNote);
    await this.updateIndex();
  }

  private async updateIndex(): Promise<void> {
    const allNotes = await this.listAllNotes();
    const activeNotes = allNotes.filter((n) => !n.isDeleted);
    
    const index = {
      userId,
      notes: activeNotes
        .map((n) => ({
          id: n.id,
          title: n.title,
          updatedAt: n.updatedAt,
          isPinned: n.isPinned,
          folderId: n.folderId,
          tags: n.tags,
        }))
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    };

    await cosService.putJSON(`users/${userId}/notes/index.json`, index);
    cacheService.invalidate(`notes-index-${userId}`);
  }

  private async listAllNotes(): Promise<Note[]> {
    const index = await cosService.getJSON(`users/${userId}/notes/index.json`);
    const notes = await Promise.all(
      (index.notes || []).map((n: NoteSummary) => this.fetchNote(n.id))
    );
    return notes;
  }
}

export const noteService = new NoteService();
