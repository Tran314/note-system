import { create } from 'zustand';
import { Note, NoteQueryParams, CreateNoteData, UpdateNoteData } from '../types/api.types';
import { noteService } from '../services/note.service';

const NOTE_LIST_CACHE_KEY = 'note-list-cache';
const NOTE_LIST_CACHE_TTL = 60 * 1000;
const NOTE_DETAIL_MEMORY_TTL = 5 * 60 * 1000;
const NOTE_DETAIL_LRU_LIMIT = 24;

type NoteMemoryEntry = {
  note: Note;
  cachedAt: number;
};

type NoteListCache = {
  notes: Note[];
  total: number;
  cachedAt: number;
};

interface NoteState {
  notes: Note[];
  currentNote: Note | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  fetchNotes: (params?: any) => Promise<void>;
  fetchNote: (id: string) => Promise<void>;
  createNote: (data: any) => Promise<Note>;
  updateNote: (id: string, data: any) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  clearError: () => void;
}

const noteDetailMemoryCache = new Map<string, NoteMemoryEntry>();

const readNoteListCache = (): NoteListCache | null => {
  try {
    const raw = localStorage.getItem(NOTE_LIST_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as NoteListCache;
    if (Date.now() - parsed.cachedAt > NOTE_LIST_CACHE_TTL) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const writeNoteListCache = (notes: Note[], total: number) => {
  localStorage.setItem(
    NOTE_LIST_CACHE_KEY,
    JSON.stringify({
      notes,
      total,
      cachedAt: Date.now(),
    }),
  );
};

const pruneNoteDetailMemoryCache = () => {
  while (noteDetailMemoryCache.size > NOTE_DETAIL_LRU_LIMIT) {
    const oldestKey = noteDetailMemoryCache.keys().next().value;
    if (!oldestKey) {
      break;
    }
    noteDetailMemoryCache.delete(oldestKey);
  }
};

const getCachedNote = (id: string): Note | null => {
  const entry = noteDetailMemoryCache.get(id);
  if (!entry) {
    return null;
  }

  if (Date.now() - entry.cachedAt > NOTE_DETAIL_MEMORY_TTL) {
    noteDetailMemoryCache.delete(id);
    return null;
  }

  noteDetailMemoryCache.delete(id);
  noteDetailMemoryCache.set(id, {
    note: entry.note,
    cachedAt: entry.cachedAt,
  });

  return entry.note;
};

const cacheNote = (note: Note) => {
  noteDetailMemoryCache.delete(note.id);
  noteDetailMemoryCache.set(note.id, {
    note,
    cachedAt: Date.now(),
  });
  pruneNoteDetailMemoryCache();
};

const removeCachedNote = (id: string) => {
  noteDetailMemoryCache.delete(id);
};

const cachedList = readNoteListCache();

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: cachedList?.notes ?? [],
  currentNote: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,

  fetchNotes: async (params?: NoteQueryParams) => {
    set({ loading: true, error: null });
    try {
      const response = await noteService.getNotes({ ...params, page: get().page });
      const { notes, pagination } = response.data.data;
      set({ notes, total: pagination.total, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '获取笔记列表失败';
      set({ loading: false, error: message });
    }
  },

  fetchNote: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await noteService.getNote(id);
      set({ currentNote: response.data.data, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '获取笔记详情失败';
      set({ loading: false, currentNote: null, error: message });
    }
  },

  createNote: async (data: CreateNoteData) => {
    set({ error: null });
    try {
      const response = await noteService.createNote(data);
      const newNote = response.data.data;
      set({ notes: [newNote, ...get().notes], total: get().total + 1 });
      return newNote;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '创建笔记失败';
      set({ error: message });
      throw error;
    }
  },

  updateNote: async (id: string, data: UpdateNoteData) => {
    set({ error: null });
    try {
      const response = await noteService.updateNote(id, data);
      const updatedNote = response.data.data;
      const nextNotes = get().notes.map((note) => (note.id === id ? updatedNote : note));
      set({
        notes: nextNotes,
        currentNote: get().currentNote?.id === id ? updatedNote : get().currentNote,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '更新笔记失败';
      set({ error: message });
      throw error;
    }
  },

  deleteNote: async (id: string) => {
    set({ error: null });
    try {
      await noteService.deleteNote(id);
      const nextNotes = get().notes.filter((note) => note.id !== id);
      writeNoteListCache(nextNotes, Math.max(0, get().total - 1));
      removeCachedNote(id);

      set({
        notes: nextNotes,
        total: get().total - 1,
        currentNote: get().currentNote?.id === id ? null : get().currentNote,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '删除笔记失败';
      set({ error: message });
      throw error;
    }
  },

  restoreNote: async (id: string) => {
    set({ error: null });
    try {
      const response = await noteService.restoreNote(id);
      const restoredNote = response.data.data;
      set({ notes: [restoredNote, ...get().notes], total: get().total + 1 });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '恢复笔记失败';
      set({ error: message });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ page });
  },

  clearError: () => {
    set({ error: null });
  },
}));