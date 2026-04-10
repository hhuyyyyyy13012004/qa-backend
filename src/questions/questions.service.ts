import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import type { User } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  // ─── Tạo câu hỏi mới ─────────────────────────────────────────────
  async create(dto: CreateQuestionDto, author: User) {
    return this.prisma.question.create({
      data: {
        title: dto.title,
        content: dto.content,
        authorId: author.id,
      },
      include: {
        author: { select: { id: true, username: true } },
      },
    });
  }

  // ─── Lấy tất cả câu hỏi (public) ─────────────────────────────────
  async findAll() {
    return this.prisma.question.findMany({
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Lấy chi tiết 1 câu hỏi ──────────────────────────────────────
  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!question) throw new NotFoundException('Question not found');

    return question;
  }

  // ─── Lấy câu hỏi của chính mình ──────────────────────────────────
  async findMyQuestions(userId: string) {
    return this.prisma.question.findMany({
      where: { authorId: userId },
      include: {
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Cập nhật câu hỏi ────────────────────────────────────────────
  async update(id: string, dto: UpdateQuestionDto, currentUser: User) {
    await this.findQuestionAndCheckOwner(id, currentUser.id);

    return this.prisma.question.update({
      where: { id },
      data: dto,
    });
  }

  // ─── Xóa câu hỏi ─────────────────────────────────────────────────
  async remove(id: string, currentUser: User) {
    await this.findQuestionAndCheckOwner(id, currentUser.id);

    return this.prisma.question.delete({ where: { id } });
  }

  // ─── Helper: tìm question và kiểm tra ownership ──────────────────
  private async findQuestionAndCheckOwner(questionId: string, userId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) throw new NotFoundException('Question not found');

    if (question.authorId !== userId) {
      throw new ForbiddenException('You do not own this question');
    }

    return question;
  }
}
