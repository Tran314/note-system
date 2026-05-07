import { create } from 'zustand';
import { noteService, Note, NoteSummary } from '../services/note.service';

interface NoteState {
  notes: NoteSummary[];
  currentNote: Note | null;
  loading: boolean;
  fetchNotes: () => Promise<void>;
  fetchNote: (id: string) => Promise<void>;
  createNote: (data: { title: string; content?: string }) => Promise<Note>;
  updateNote: (id: string, data: { title?: string; content?: string }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  currentNote: null,
  loading: false,

  fetchNotes: async () => {
    set({ loading: true });
    try {
      const notes = await noteService.fetchNotes();
      set({ notes });
    } finally {
      set({ loading: false });
    }
  },

  fetchNote: async (id: string) => {
    set({ loading: true });
    try {
      const note = await noteService.fetchNote(id);
      set({ currentNote: note });
    } finally {
      set({ loading: false });
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
}));
