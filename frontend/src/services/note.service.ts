import { api } from './api';

export const noteService = {
  // 获取笔记列表
  getNotes: (params?: {
    folderId?: string;
    tagId?: string;
    keyword?: string;
    page?: number;
    limit?: number;
  }) => api.get('/notes', { params }),

  // 获取笔记详情
  getNote: (id: string) => api.get(`/notes/${id}`),

  // 创建笔记
  createNote: (data: { title: string; content?: string; folderId?: string; tags?: string[] }) =>
    api.post('/notes', data),

  // 更新笔记
  updateNote: (id: string, data: { title?: string; content?: string; folderId?: string; isPinned?: boolean; tags?: string[] }) =>
    api.put(`/notes/${id}`, data),

  // 删除笔记
  deleteNote: (id: string) => api.delete(`/notes/${id}`),

  // 恢复笔记
  restoreNote: (id: string) => api.post(`/notes/${id}/restore`),

  // 获取历史版本
  getVersions: (id: string) => api.get(`/notes/${id}/versions`),

  // 获取回收站笔记
  getTrash: () => api.get('/notes/trash'),
};