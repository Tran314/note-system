import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNoteStore } from '../store/note.store';

vi.mock('../services/note.service', () => ({
  noteService: {
    getNotes: vi.fn(),
    getNote: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    restoreNote: vi.fn(),
  },
}));

describe('useNoteStore', () => {
  beforeEach(() => {
    useNoteStore.setState({
      notes: [],
      currentNote: null,
      loading: false,
      error: null,
      total: 0,
      page: 1,
    });
  });

  it('should have initial state', () => {
    const state = useNoteStore.getState();
    expect(state.notes).toEqual([]);
    expect(state.currentNote).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.total).toBe(0);
    expect(state.page).toBe(1);
  });

  it('should set page', () => {
    useNoteStore.getState().setPage(3);
    expect(useNoteStore.getState().page).toBe(3);
  });

  it('should clear error', () => {
    useNoteStore.setState({ error: 'Some error' });
    useNoteStore.getState().clearError();
    expect(useNoteStore.getState().error).toBeNull();
  });

  it('should add note to notes array on createNote success', async () => {
    const newNote = {
      id: '1',
      userId: 'user-1',
      title: 'New Note',
      content: '<p>Content</p>',
      isPinned: false,
      isDeleted: false,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockResponse = {
      data: {
        data: newNote,
      },
    };

    const { noteService } = await import('../services/note.service');
    vi.mocked(noteService.createNote).mockResolvedValue(mockResponse as any);

    useNoteStore.setState({ notes: [] });
    const result = await useNoteStore.getState().createNote({
      title: 'New Note',
      content: '<p>Content</p>',
    });

    expect(result).toEqual(newNote);
    expect(useNoteStore.getState().notes).toContain(newNote);
    expect(useNoteStore.getState().total).toBe(1);
  });

  it('should remove note from notes array on deleteNote success', async () => {
    const noteToDelete = {
      id: '1',
      userId: 'user-1',
      title: 'Note to Delete',
      isPinned: false,
      isDeleted: false,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { noteService } = await import('../services/note.service');
    vi.mocked(noteService.deleteNote).mockResolvedValue({ data: { data: { message: 'deleted' } } } as any);

    useNoteStore.setState({
      notes: [noteToDelete],
      total: 1,
    });

    await useNoteStore.getState().deleteNote('1');

    expect(useNoteStore.getState().notes).not.toContainEqual(expect.objectContaining({ id: '1' }));
    expect(useNoteStore.getState().total).toBe(0);
  });

  it('should set error on failed fetchNotes', async () => {
    const { noteService } = await import('../services/note.service');
    vi.mocked(noteService.getNotes).mockRejectedValue(new Error('Network error'));

    useNoteStore.setState({ loading: false });

    await useNoteStore.getState().fetchNotes();

    expect(useNoteStore.getState().error).toBe('Network error');
    expect(useNoteStore.getState().loading).toBe(false);
  });
});