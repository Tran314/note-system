import { localDb, LocalNote } from './local-db.service';
import { generateUUID } from '../utils/uuid';

const userId = 'anonymous-user';

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

export class NoteService {
  async getNotes(params?: { folderId?: string; tagId?: string; keyword?: string; page?: number; limit?: number }): Promise<{ notes: NoteSummary[]; pagination: { total: number; page: number; limit: number } }> {
    let query = localDb.notes.where({ userId, isDeleted: false });
    
    if (params?.folderId) {
      query = query.and(note => note.folderId === params.folderId);
    }
    
    const allNotes = await query.toArray();
    
    let filtered = allNotes;
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      filtered = allNotes.filter(n => 
        n.title.toLowerCase().includes(keyword) || 
        (n.content && n.content.toLowerCase().includes(keyword))
      );
    }
    
    const sorted = filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    const paginated = sorted.slice(start, start + limit);
    
    return {
      notes: paginated.map(n => ({
        id: n.id,
        title: n.title,
        updatedAt: n.updatedAt,
        isPinned: n.isPinned,
        folderId: n.folderId,
        tags: n.tags,
      })),
      pagination: {
        total: filtered.length,
        page,
        limit,
      },
    };
  }

  async getNote(id: string): Promise<Note> {
    const note = await localDb.notes.get(id);
    if (!note) throw new Error('Note not found');
    return note;
  }

  async createNote(data: { title: string; content?: string; folderId?: string; tags?: string[] }): Promise<Note> {
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
      tags: data.tags || [],
      syncedAt: null,
    };

    await localDb.notes.add(note);
    return note;
  }

  async updateNote(id: string, data: { title?: string; content?: string; folderId?: string; isPinned?: boolean; tags?: string[] }): Promise<Note> {
    const note = await localDb.notes.get(id);
    if (!note) throw new Error('Note not found');

    const updatedNote = {
      ...note,
      ...data,
      updatedAt: new Date().toISOString(),
      version: note.version + 1,
      syncedAt: null,
    };

    await localDb.notes.update(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: string): Promise<void> {
    const note = await localDb.notes.get(id);
    if (!note) throw new Error('Note not found');

    await localDb.notes.update(id, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
    });
  }

  async restoreNote(id: string): Promise<Note> {
    const note = await localDb.notes.get(id);
    if (!note) throw new Error('Note not found');

    const restoredNote = {
      ...note,
      isDeleted: false,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
      syncedAt: null,
    };

    await localDb.notes.update(id, restoredNote);
    return restoredNote;
  }
}

export const noteService = new NoteService();
