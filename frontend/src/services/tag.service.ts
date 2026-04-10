import { api } from './api';

export const tagService = {
  // 获取所有标签
  getTags: () => api.get('/tags'),

  // 获取标签详情
  getTag: (id: string) => api.get(`/tags/${id}`),

  // 创建标签
  createTag: (data: { name: string; color?: string }) => api.post('/tags', data),

  // 更新标签
  updateTag: (id: string, data: { name?: string; color?: string }) =>
    api.put(`/tags/${id}`, data),

  // 删除标签
  deleteTag: (id: string) => api.delete(`/tags/${id}`),

  // 为笔记添加标签
  addToNote: (noteId: string, tagId: string) =>
    api.post(`/tags/note/${noteId}/${tagId}`),

  // 从笔记移除标签
  removeFromNote: (noteId: string, tagId: string) =>
    api.delete(`/tags/note/${noteId}/${tagId}`),
};