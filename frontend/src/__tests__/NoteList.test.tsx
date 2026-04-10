import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NoteList from '../pages/NoteList';

// Mock stores
vi.mock('../store/note.store', () => ({
  useNoteStore: vi.fn(() => ({
    notes: [],
    loading: false,
    fetchNotes: vi.fn(),
  })),
}));

vi.mock('../store/folder.store', () => ({
  useFolderStore: vi.fn(() => ({
    folders: [],
  })),
}));

vi.mock('../store/tag.store', () => ({
  useTagStore: vi.fn(() => ({
    tags: [],
  })),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('NoteList Page', () => {
  it('should render search input', () => {
    renderWithRouter(<NoteList />);

    expect(screen.getByPlaceholderText(/搜索/i)).toBeInTheDocument();
  });

  it('should render view toggle buttons', () => {
    renderWithRouter(<NoteList />);

    expect(screen.getByRole('button', { name: /列表/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /网格/i })).toBeInTheDocument();
  });

  it('should render new note button', () => {
    renderWithRouter(<NoteList />);

    expect(screen.getByRole('button', { name: /新建/i })).toBeInTheDocument();
  });

  it('should show empty state when no notes', () => {
    renderWithRouter(<NoteList />);

    expect(screen.getByText(/暂无笔记/i)).toBeInTheDocument();
  });
});