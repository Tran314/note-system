import { api } from './api';
import { Tag, ApiResponse, PaginatedResponse } from '../types/api.types';

export const tagService = {
  getTags: async (): Promise<ApiResponse<PaginatedResponse<Tag>>> => {
    const response = await api.get('/tags');
    return response.data;
  },

  getTag: async (id: string): Promise<ApiResponse<Tag>> => {
    const response = await api.get(`/tags/${id}`);
    return response.data;
  },

  createTag: async (data: { name: string; color?: string }): Promise<ApiResponse<Tag>> => {
    const response = await api.post('/tags', data);
    return response.data;
  },

  updateTag: async (id: string, data: { name?: string; color?: string }): Promise<ApiResponse<Tag>> => {
    const response = await api.put(`/tags/${id}`, data);
    return response.data;
  },

  deleteTag: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/tags/${id}`);
    return response.data;
  },

  addToNote: async (noteId: string, tagId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post(`/tags/note/${noteId}/${tagId}`);
    return response.data;
  },

  removeFromNote: async (noteId: string, tagId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/tags/note/${noteId}/${tagId}`);
    return response.data;
  },
};