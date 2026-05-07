import { api } from './api';

export const attachmentService = {
  getAttachments: (noteId?: string) => api.get('/attachments', { params: { noteId } }),
};
