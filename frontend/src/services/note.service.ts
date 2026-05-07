import { api } from './api';

export const noteService = {
  getNotes: (params?: {
    folderId?: string;
    tagId?: string;
    keyword?: string;
    page?: number;
    limit?: number;
  }) => api.get('/notes', { params }),

  getNotesBatch: (ids: string[]) => api.get('/notes/batch', { params: { ids: ids.join(',') } }),

  getNote: (id: string) => api.get(`/notes/${id}`),

  createNote: (data: { title: string; content?: string; folderId?: string; tags?: string[] }) =>
    api.post('/notes', data),

  createNotesBatch: (
    notes: Array<{ title: string; content?: string; folderId?: string; tags?: string[] }>,
  ) => api.post('/notes/batch', { notes }),

  updateNote: (
    id: string,
    data: {
      title?: string;
      content?: string;
      folderId?: string;
      isPinned?: boolean;
      tags?: string[];
    },
  ) => api.put(`/notes/${id}`, data),

  updateNotesBatch: (updates: Array<{ id: string; data: any }>) =>
    api.put('/notes/batch', { updates }),

  deleteNotesBatch: (ids: string[]) => api.delete('/notes/batch', { data: { ids } }),

  deleteNote: (id: string) => api.delete(`/notes/${id}`),

  restoreNote: (id: string) => api.post(`/notes/${id}/restore`),

  restoreNotesBatch: (ids: string[]) => api.post('/notes/batch/restore', { ids }),

  getVersions: (id: string) => api.get(`/notes/${id}/versions`),

  getTrash: () => api.get('/notes/trash'),
};
