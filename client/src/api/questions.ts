import axiosInstance from './axios';
import type { Question } from '../types';

export const questionsApi = {
  getAll: () => axiosInstance.get<Question[]>('/questions'),

  getOne: (id: string) => axiosInstance.get<Question>(`/questions/${id}`),

  getMyQuestions: () =>
    axiosInstance.get<Question[]>('/questions/user/my-questions'),

  create: (data: { title: string; content: string }) =>
    axiosInstance.post<Question>('/questions', data),

  update: (id: string, data: { title?: string; content?: string }) =>
    axiosInstance.patch<Question>(`/questions/${id}`, data),

  delete: (id: string) => axiosInstance.delete(`/questions/${id}`),
};
