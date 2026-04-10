import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import type { User } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  // ─── Tạo comment hoặc reply ───────────────────────────────────────
  async create(dto: CreateCommentDto, author: User) {
    // Validate: phải có postId HOẶC questionId, không được cả hai
    if (!dto.postId && !dto.questionId) {
      throw new BadRequestException(
        'Either postId or questionId must be provided',
      );
    }

    if (dto.postId && dto.questionId) {
      throw new BadRequestException(
        'Cannot comment on both post and question at the same time',
      );
    }

    // Kiểm tra post/question có tồn tại không
    if (dto.postId) {
      const post = await this.prisma.post.findUnique({
        where: { id: dto.postId },
      });
      if (!post) throw new NotFoundException('Post not found');
    }

    if (dto.questionId) {
      const question = await this.prisma.question.findUnique({
        where: { id: dto.questionId },
      });
      if (!question) throw new NotFoundException('Question not found');
    }

    // Nếu là reply → kiểm tra parent comment có tồn tại và là top-level không
    if (dto.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      // Không cho phép reply của reply (chỉ hỗ trợ 1 cấp)
      if (parentComment.parentId) {
        throw new BadRequestException(
          'Cannot reply to a reply. Only 1 level of nesting is supported',
        );
      }
    }

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        authorId: author.id,
        postId: dto.postId,
        questionId: dto.questionId,
        parentId: dto.parentId,
      },
      include: {
        author: { select: { id: true, username: true } },
      },
    });
  }

  // ─── Lấy comments của một Post ───────────────────────────────────
  async findByPost(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    // Chỉ lấy top-level comments (parentId = null)
    // replies được nested bên trong
    return this.prisma.comment.findMany({
      where: {
        postId,
        parentId: null, // chỉ top-level
      },
      include: {
        author: { select: { id: true, username: true } },
        replies: {
          include: {
            author: { select: { id: true, username: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── Lấy comments của một Question ───────────────────────────────
  async findByQuestion(questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Question not found');

    return this.prisma.comment.findMany({
      where: {
        questionId,
        parentId: null,
      },
      include: {
        author: { select: { id: true, username: true } },
        replies: {
          include: {
            author: { select: { id: true, username: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── Xóa comment ─────────────────────────────────────────────────
  async remove(id: string, currentUser: User) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) throw new NotFoundException('Comment not found');

    // Chỉ owner mới được xóa
    if (comment.authorId !== currentUser.id) {
      throw new ForbiddenException('You do not own this comment');
    }

    // Xóa comment sẽ tự động cascade xóa các replies
    // (do onDelete: Cascade trong schema)
    return this.prisma.comment.delete({ where: { id } });
  }
}
