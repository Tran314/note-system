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

  // 批量获取笔记详情（合并网络请求）
  getNotesBatch: (ids: string[]) => 
    api.get('/notes/batch', { params: { ids: ids.join(',') } }),

  // 获取笔记详情
  getNote: (id: string) => api.get(`/notes/${id}`),

  // 创建笔记
  createNote: (data: { title: string; content?: string; folderId?: string; tags?: string[] }) =>
    api.post('/notes', data),

  // 批量创建笔记（合并网络请求）
  createNotesBatch: (notes: Array<{ title: string; content?: string; folderId?: string; tags?: string[] }>) =>
    api.post('/notes/batch', { notes }),

  // 更新笔记
  updateNote: (id: string, data: { title?: string; content?: string; folderId?: string; isPinned?: boolean; tags?: string[] }) =>
    api.put(`/notes/${id}`, data),

  // 批量更新笔记（合并网络请求）
  updateNotesBatch: (updates: Array<{ id: string; data: any }>) =>
    api.put('/notes/batch', { updates }),

  // 批量删除笔记（合并网络请求）
  deleteNotesBatch: (ids: string[]) =>
    api.delete('/notes/batch', { data: { ids } }),

  // 删除笔记
  deleteNote: (id: string) => api.delete(`/notes/${id}`),

  // 恢复笔记
  restoreNote: (id: string) => api.post(`/notes/${id}/restore`),

  // 批量恢复笔记（合并网络请求）
  restoreNotesBatch: (ids: string[]) =>
    api.post('/notes/batch/restore', { ids }),

  // 获取历史版本
  getVersions: (id: string) => api.get(`/notes/${id}/versions`),

  // 获取回收站笔记
  getTrash: () => api.get('/notes/trash'),

  // 搜索笔记（合并全文搜索）
  search: (query: string, options?: { folderId?: string; tagId?: string }) =>
    api.get('/notes/search', { params: { q: query, ...options } }),
};