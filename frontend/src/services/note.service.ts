import { api } from './api';
import { Note, BatchUpdateItem, NoteQueryResponse, ApiResponse, PaginatedResponse } from '../types/api.types';

export const noteService = {
  getNotes: (params?: {
    folderId?: string;
    tagId?: string;
    keyword?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<NoteQueryResponse>> =>
    api.get('/notes', { params }),

  getNotesBatch: (ids: string[]): Promise<ApiResponse<PaginatedResponse<Note>>> =>
    api.get('/notes/batch', { params: { ids: ids.join(',') } }),

  getNote: (id: string): Promise<ApiResponse<Note>> =>
    api.get(`/notes/${id}`),

  createNote: (data: { title: string; content?: string; folderId?: string; tags?: string[] }): Promise<ApiResponse<Note>> =>
    api.post('/notes', data),

  createNotesBatch: (notes: Array<{ title: string; content?: string; folderId?: string; tags?: string[] }>): Promise<ApiResponse<PaginatedResponse<Note>>> =>
    api.post('/notes/batch', { notes }),

  updateNote: (id: string, data: { title?: string; content?: string; folderId?: string; isPinned?: boolean; tags?: string[] }): Promise<ApiResponse<Note>> =>
    api.put(`/notes/${id}`, data),

  updateNotesBatch: (updates: BatchUpdateItem[]): Promise<ApiResponse<PaginatedResponse<Note>>> =>
    api.put('/notes/batch', { updates }),

  deleteNotesBatch: (ids: string[]): Promise<ApiResponse<{ deletedCount: number }>> =>
    api.delete('/notes/batch', { data: { ids } }),

  deleteNote: (id: string): Promise<ApiResponse<{ message: string }>> =>
    api.delete(`/notes/${id}`),

  restoreNote: (id: string): Promise<ApiResponse<Note>> =>
    api.post(`/notes/${id}/restore`),

  restoreNotesBatch: (ids: string[]): Promise<ApiResponse<PaginatedResponse<Note>>> =>
    api.post('/notes/batch/restore', { ids }),

  getVersions: (id: string): Promise<ApiResponse<{ versions: NoteVersion[] }>> =>
    api.get(`/notes/${id}/versions`),

  getTrash: (): Promise<ApiResponse<PaginatedResponse<Note>>> =>
    api.get('/notes/trash'),

  search: (query: string, options?: { folderId?: string; tagId?: string }): Promise<ApiResponse<PaginatedResponse<Note>>> =>
    api.get('/notes/search', { params: { q: query, ...options } }),
};