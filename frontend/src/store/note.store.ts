import { create } from 'zustand';
import { noteService, Note, NoteSummary } from '../services/note.service';

interface NoteState {
  notes: NoteSummary[];
  currentNote: Note | null;
  loading: boolean;
  total: number;
  page: number;
  fetchNotes: (params?: any) => Promise<void>;
  fetchNote: (id: string) => Promise<void>;
  createNote: (data: { title: string; content?: string }) => Promise<Note>;
  updateNote: (id: string, data: { title?: string; content?: string }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setPage: (page: number) => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  currentNote: null,
  loading: false,
  total: 0,
  page: 1,

  fetchNotes: async (params?: any) => {
    set({ loading: true });
    try {
      const result = await noteService.getNotes({ ...params, page: get().page });
      set({ notes: result.notes, total: result.pagination.total, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('获取笔记列表失败:', error);
    }
  },

  fetchNote: async (id: string) => {
    set({ loading: true });
    try {
      const note = await noteService.getNote(id);
      set({ currentNote: note, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('获取笔记详情失败:', error);
    }
  },

  createNote: async (data) => {
    const note = await noteService.createNote(data);
    await get().fetchNotes();
    return note;
  },

  updateNote: async (id, data) => {
    await noteService.updateNote(id, data);
    await get().fetchNotes();
    if (get().currentNote?.id === id) {
      await get().fetchNote(id);
    }
  },

  deleteNote: async (id) => {
    await noteService.deleteNote(id);
    await get().fetchNotes();
    if (get().currentNote?.id === id) {
      set({ currentNote: null });
    }
  },

  setPage: (page: number) => {
    set({ page });
  },
}));
