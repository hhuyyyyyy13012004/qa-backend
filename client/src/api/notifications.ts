import axiosInstance from './axios';
import type { Notification } from '../types';

export const notificationsApi = {
  getAll: () => axiosInstance.get<Notification[]>('/notifications'),

  getUnreadCount: () =>
    axiosInstance.get<{ unreadCount: number }>('/notifications/unread/count'),

  markAsRead: (id: string) => axiosInstance.patch(`/notifications/${id}/read`),

  markAllAsRead: () => axiosInstance.patch('/notifications/read/all'),
};
