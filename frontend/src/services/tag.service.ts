import { api } from './api';
import { Tag, ApiResponse, PaginatedResponse } from '../types/api.types';

export const tagService = {
  getTags: (): Promise<ApiResponse<PaginatedResponse<Tag>>> =>
    api.get('/tags'),

  getTag: (id: string): Promise<ApiResponse<Tag>> =>
    api.get(`/tags/${id}`),

  createTag: (data: { name: string; color?: string }): Promise<ApiResponse<Tag>> =>
    api.post('/tags', data),

  updateTag: (id: string, data: { name?: string; color?: string }): Promise<ApiResponse<Tag>> =>
    api.put(`/tags/${id}`, data),

  deleteTag: (id: string): Promise<ApiResponse<{ message: string }>> =>
    api.delete(`/tags/${id}`),

  addToNote: (noteId: string, tagId: string): Promise<ApiResponse<{ message: string }>> =>
    api.post(`/tags/note/${noteId}/${tagId}`),

  removeFromNote: (noteId: string, tagId: string): Promise<ApiResponse<{ message: string }>> =>
    api.delete(`/tags/note/${noteId}/${tagId}`),
};