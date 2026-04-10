import { api } from './api';

export const authService = {
  // 用户登录
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  // 用户注册
  register: (data: { email: string; password: string; nickname?: string }) =>
    api.post('/auth/register', data),

  // 刷新 Token
  refresh: () => api.post('/auth/refresh'),

  // 用户登出
  logout: () => api.post('/auth/logout'),

  // 获取当前用户
  getCurrentUser: () => api.get('/auth/me'),
};