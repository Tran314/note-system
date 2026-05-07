import { api } from './api';
import { Note, BatchUpdateItem, NoteQueryResponse, ApiResponse, PaginatedResponse, NoteVersion } from '../types/api.types';

export const noteService = {
  getNotes: async (params?: {
    folderId?: string;
    tagId?: string;
    keyword?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<NoteQueryResponse>> => {
    const response = await api.get('/notes', { params });
    return response.data;
  },

  getNotesBatch: async (ids: string[]): Promise<ApiResponse<PaginatedResponse<Note>>> => {
    const response = await api.get('/notes/batch', { params: { ids: ids.join(',') } });
    return response.data;
  },

  getNote: async (id: string): Promise<ApiResponse<Note>> => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  createNote: async (data: { title: string; content?: string; folderId?: string; tags?: string[] }): Promise<ApiResponse<Note>> => {
    const response = await api.post('/notes', data);
    return response.data;
  },

  createNotesBatch: async (notes: Array<{ title: string; content?: string; folderId?: string; tags?: string[] }>): Promise<ApiResponse<PaginatedResponse<Note>>> => {
    const response = await api.post('/notes/batch', { notes });
    return response.data;
  },

  updateNote: async (id: string, data: { title?: string; content?: string; folderId?: string; isPinned?: boolean; tags?: string[] }): Promise<ApiResponse<Note>> => {
    const response = await api.put(`/notes/${id}`, data);
    return response.data;
  },

  updateNotesBatch: async (updates: BatchUpdateItem[]): Promise<ApiResponse<PaginatedResponse<Note>>> => {
    const response = await api.put('/notes/batch', { updates });
    return response.data;
  },

  deleteNotesBatch: async (ids: string[]): Promise<ApiResponse<{ deletedCount: number }>> => {
    const response = await api.delete('/notes/batch', { data: { ids } });
    return response.data;
  },

  deleteNote: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },

  restoreNote: async (id: string): Promise<ApiResponse<Note>> => {
    const response = await api.post(`/notes/${id}/restore`);
    return response.data;
  },

  restoreNotesBatch: async (ids: string[]): Promise<ApiResponse<PaginatedResponse<Note>>> => {
    const response = await api.post('/notes/batch/restore', { ids });
    return response.data;
  },

  getVersions: async (id: string): Promise<ApiResponse<{ versions: NoteVersion[] }>> => {
    const response = await api.get(`/notes/${id}/versions`);
    return response.data;
  },

  getTrash: async (): Promise<ApiResponse<PaginatedResponse<Note>>> => {
    const response = await api.get('/notes/trash');
    return response.data;
  },

  search: async (query: string, options?: { folderId?: string; tagId?: string }): Promise<ApiResponse<PaginatedResponse<Note>>> => {
    const response = await api.get('/notes/search', { params: { q: query, ...options } });
    return response.data;
  },
};