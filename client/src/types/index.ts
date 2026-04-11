export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  imageUrl?: string;
  authorId: string;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; username: string };
  _count?: { likes: number; comments: number };
}

export interface Question {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; username: string };
  _count?: { likes: number; comments: number };
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId?: string;
  questionId?: string;
  parentId?: string;
  createdAt: string;
  author: { id: string; username: string };
  replies?: Comment[];
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
