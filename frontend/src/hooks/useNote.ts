import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noteService } from '../services/note.service';
import type { Note, ApiResponse, NoteQueryResponse } from '../types/api.types';

type NoteQueryParams = {
  folderId?: string;
  tagId?: string;
  keyword?: string;
  page?: number;
};

type CreateNoteData = {
  title: string;
  content?: string;
  folderId?: string;
  tags?: string[];
};

type UpdateNoteData = {
  title?: string;
  content?: string;
  folderId?: string;
  isPinned?: boolean;
  tags?: string[];
};

export function useNotes(params?: NoteQueryParams) {
  return useQuery<ApiResponse<NoteQueryResponse>>({
    queryKey: ['notes', params],
    queryFn: () => noteService.getNotes(params),
  });
}

export function useNote(id: string) {
  return useQuery<ApiResponse<Note>>({
    queryKey: ['note', id],
    queryFn: () => noteService.getNote(id),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Note>, Error, CreateNoteData>({
    mutationFn: (data) => noteService.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Note>, Error, { id: string; data: UpdateNoteData }>({
    mutationFn: ({ id, data }) => noteService.updateNote(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', id] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<{ message: string }>, Error, string>({
    mutationFn: (id) => noteService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}