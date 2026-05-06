import { api } from './api';
import { Folder, ApiResponse, PaginatedResponse } from '../types/api.types';

export const folderService = {
  getFolders: (): Promise<ApiResponse<PaginatedResponse<Folder>>> =>
    api.get('/folders'),

  getFolder: (id: string): Promise<ApiResponse<Folder>> =>
    api.get(`/folders/${id}`),

  createFolder: (data: { name: string; parentId?: string; sortOrder?: number }): Promise<ApiResponse<Folder>> =>
    api.post('/folders', data),

  updateFolder: (id: string, data: { name?: string; parentId?: string; sortOrder?: number }): Promise<ApiResponse<Folder>> =>
    api.put(`/folders/${id}`, data),

  deleteFolder: (id: string): Promise<ApiResponse<{ message: string }>> =>
    api.delete(`/folders/${id}`),
};