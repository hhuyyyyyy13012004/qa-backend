import axiosInstance from './axios';
import type { AuthResponse, User } from '../types';

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    axiosInstance.post<User>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    axiosInstance.post<AuthResponse>('/auth/login', data),

  getMe: () => axiosInstance.get<User>('/auth/me'),
};
