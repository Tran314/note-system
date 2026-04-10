import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noteService } from '../services/note.service';

// 获取笔记列表
export function useNotes(params?: {
  folderId?: string;
  tagId?: string;
  keyword?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ['notes', params],
    queryFn: () => noteService.getNotes(params),
  });
}

// 获取单个笔记
export function useNote(id: string) {
  return useQuery({
    queryKey: ['note', id],
    queryFn: () => noteService.getNote(id),
    enabled: !!id,
  });
}

// 创建笔记
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; content?: string; folderId?: string }) =>
      noteService.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

// 更新笔记
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      noteService.updateNote(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', id] });
    },
  });
}

// 删除笔记
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}