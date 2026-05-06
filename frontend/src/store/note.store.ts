import { create } from 'zustand';
import { Note } from '../types/note.types';
import { noteService } from '../services/note.service';

interface NoteQueryParams {
  folderId?: string;
  tagId?: string;
  keyword?: string;
  isPinned?: boolean;
  page?: number;
  limit?: number;
}

interface CreateNoteData {
  title: string;
  content?: string;
  folderId?: string;
  tags?: string[];
}

interface UpdateNoteData {
  title?: string;
  content?: string;
  folderId?: string;
  isPinned?: boolean;
  tags?: string[];
}

interface NoteState {
  notes: Note[];
  currentNote: Note | null;
  loading: boolean;
  total: number;
  page: number;
  fetchNotes: (params?: NoteQueryParams) => Promise<void>;
  fetchNote: (id: string) => Promise<void>;
  createNote: (data: CreateNoteData) => Promise<Note>;
  updateNote: (id: string, data: UpdateNoteData) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  setPage: (page: number) => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  currentNote: null,
  loading: false,
  total: 0,
  page: 1,

  fetchNotes: async (params?: NoteQueryParams) => {
    set({ loading: true });
    try {
      const response = await noteService.getNotes({ ...params, page: get().page });
      const { notes, pagination } = response.data;
      set({ notes, total: pagination.total, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('获取笔记列表失败:', error);
    }
  },

  fetchNote: async (id: string) => {
    set({ loading: true });
    try {
      const response = await noteService.getNote(id);
      set({ currentNote: response.data, loading: false });
    } catch (error) {
      set({ loading: false, currentNote: null });
      console.error('获取笔记详情失败:', error);
    }
  },

  createNote: async (data: CreateNoteData) => {
    try {
      const response = await noteService.createNote(data);
      const newNote = response.data;
      set({ notes: [newNote, ...get().notes], total: get().total + 1 });
      return newNote;
    } catch (error) {
      console.error('创建笔记失败:', error);
      throw error;
    }
  },

  updateNote: async (id: string, data: UpdateNoteData) => {
    try {
      const response = await noteService.updateNote(id, data);
      const updatedNote = response.data;
      set({
        notes: get().notes.map((note) =>
          note.id === id ? updatedNote : note
        ),
        currentNote: get().currentNote?.id === id ? updatedNote : get().currentNote,
      });
    } catch (error) {
      console.error('更新笔记失败:', error);
      throw error;
    }
  },

  deleteNote: async (id: string) => {
    try {
      await noteService.deleteNote(id);
      set({
        notes: get().notes.filter((note) => note.id !== id),
        total: get().total - 1,
        currentNote: get().currentNote?.id === id ? null : get().currentNote,
      });
    } catch (error) {
      console.error('删除笔记失败:', error);
      throw error;
    }
  },

  restoreNote: async (id: string) => {
    try {
      const response = await noteService.restoreNote(id);
      const restoredNote = response.data;
      set({ notes: [restoredNote, ...get().notes], total: get().total + 1 });
    } catch (error) {
      console.error('恢复笔记失败:', error);
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ page });
  },
}));
