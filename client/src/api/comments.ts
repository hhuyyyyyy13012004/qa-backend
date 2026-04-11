import axiosInstance from './axios';
import type { Comment } from '../types';

export const commentsApi = {
  getByPost: (postId: string) =>
    axiosInstance.get<Comment[]>(`/comments/post/${postId}`),

  getByQuestion: (questionId: string) =>
    axiosInstance.get<Comment[]>(`/comments/question/${questionId}`),

  create: (data: {
    content: string;
    postId?: string;
    questionId?: string;
    parentId?: string;
  }) => axiosInstance.post<Comment>('/comments', data),

  delete: (id: string) => axiosInstance.delete(`/comments/${id}`),
};
