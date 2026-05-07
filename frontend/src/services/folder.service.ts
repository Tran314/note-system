import { api } from './api';
import { Folder, ApiResponse, PaginatedResponse } from '../types/api.types';

export const folderService = {
  getFolders: async (): Promise<ApiResponse<PaginatedResponse<Folder>>> => {
    const response = await api.get('/folders');
    return response.data;
  },

  getFolder: async (id: string): Promise<ApiResponse<Folder>> => {
    const response = await api.get(`/folders/${id}`);
    return response.data;
  },

  createFolder: async (data: { name: string; parentId?: string; sortOrder?: number }): Promise<ApiResponse<Folder>> => {
    const response = await api.post('/folders', data);
    return response.data;
  },

  updateFolder: async (id: string, data: { name?: string; parentId?: string; sortOrder?: number }): Promise<ApiResponse<Folder>> => {
    const response = await api.put(`/folders/${id}`, data);
    return response.data;
  },

  deleteFolder: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/folders/${id}`);
    return response.data;
  },
};