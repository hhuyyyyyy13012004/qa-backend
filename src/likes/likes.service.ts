import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  // ─── Toggle like cho Post ─────────────────────────────────────────
  async togglePostLike(postId: string, currentUser: User) {
    // Kiểm tra post tồn tại
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    // Kiểm tra đã like chưa
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: { userId: currentUser.id, postId },
      },
    });

    if (existingLike) {
      // Đã like rồi → unlike
      await this.prisma.like.delete({ where: { id: existingLike.id } });
      return { liked: false, message: 'Post unliked' };
    } else {
      // Chưa like → like
      await this.prisma.like.create({
        data: { userId: currentUser.id, postId },
      });
      return { liked: true, message: 'Post liked' };
    }
  }

  // ─── Toggle like cho Question ─────────────────────────────────────
  async toggleQuestionLike(questionId: string, currentUser: User) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Question not found');

    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_questionId: { userId: currentUser.id, questionId },
      },
    });

    if (existingLike) {
      await this.prisma.like.delete({ where: { id: existingLike.id } });
      return { liked: false, message: 'Question unliked' };
    } else {
      await this.prisma.like.create({
        data: { userId: currentUser.id, questionId },
      });
      return { liked: true, message: 'Question liked' };
    }
  }

  // ─── Lấy số like của Post ─────────────────────────────────────────
  async getPostLikes(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const count = await this.prisma.like.count({ where: { postId } });
    return { postId, likeCount: count };
  }

  // ─── Lấy số like của Question ─────────────────────────────────────
  async getQuestionLikes(questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Question not found');

    const count = await this.prisma.like.count({ where: { questionId } });
    return { questionId, likeCount: count };
  }

  // ─── Share Post ───────────────────────────────────────────────────
  async sharePost(postId: string, baseUrl: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    return {
      postId,
      title: post.title,
      shareUrl: `${baseUrl}/posts/${postId}`,
      sharedAt: new Date().toISOString(),
    };
  }

  // ─── Share Question ───────────────────────────────────────────────
  async shareQuestion(questionId: string, baseUrl: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Question not found');

    return {
      questionId,
      title: question.title,
      shareUrl: `${baseUrl}/questions/${questionId}`,
      sharedAt: new Date().toISOString(),
    };
  }
}
