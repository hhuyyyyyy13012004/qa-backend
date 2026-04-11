import axiosInstance from './axios';
import type { Post } from '../types';

export const postsApi = {
  getAll: () => axiosInstance.get<Post[]>('/posts'),

  getOne: (id: string) => axiosInstance.get<Post>(`/posts/${id}`),

  getMyPosts: () => axiosInstance.get<Post[]>('/posts/user/my-posts'),

  getAllAdmin: () => axiosInstance.get<Post[]>('/posts/admin/all'),

  create: (data: { title: string; content: string }) =>
    axiosInstance.post<Post>('/posts', data),

  update: (id: string, data: { title?: string; content?: string }) =>
    axiosInstance.patch<Post>(`/posts/${id}`, data),

  submit: (id: string) => axiosInstance.patch<Post>(`/posts/${id}/submit`),

  approve: (id: string) => axiosInstance.patch<Post>(`/posts/${id}/approve`),

  reject: (id: string, reason?: string) =>
    axiosInstance.patch<Post>(`/posts/${id}/reject`, { reason }),

  delete: (id: string) => axiosInstance.delete(`/posts/${id}`),

  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post(`/upload/posts/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  toggleLike: (id: string) => axiosInstance.post(`/posts/${id}/like`),
};
