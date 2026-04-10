import { api } from './api';

export const folderService = {
  // 获取文件夹列表
  getFolders: () => api.get('/folders'),

  // 获取文件夹详情
  getFolder: (id: string) => api.get(`/folders/${id}`),

  // 创建文件夹
  createFolder: (data: { name: string; parentId?: string; sortOrder?: number }) =>
    api.post('/folders', data),

  // 更新文件夹
  updateFolder: (id: string, data: { name?: string; parentId?: string; sortOrder?: number }) =>
    api.put(`/folders/${id}`, data),

  // 删除文件夹
  deleteFolder: (id: string) => api.delete(`/folders/${id}`),
};