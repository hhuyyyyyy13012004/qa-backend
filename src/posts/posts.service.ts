import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostStatus, NotificationType } from '@prisma/client';
import type { User } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // ─── Tạo bài viết mới (mặc định DRAFT) ───────────────────────────
  async create(dto: CreatePostDto, author: User) {
    return this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        authorId: author.id,
        status: PostStatus.DRAFT,
      },
      include: { author: { select: { id: true, username: true } } },
    });
  }

  // ─── Lấy danh sách bài viết public (chỉ APPROVED) ────────────────
  async findAll() {
    return this.prisma.post.findMany({
      where: { status: PostStatus.APPROVED },
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Lấy bài viết của chính mình (tất cả trạng thái) ─────────────
  async findMyPosts(userId: string) {
    return this.prisma.post.findMany({
      where: { authorId: userId },
      include: {
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Lấy tất cả bài (ADMIN) ───────────────────────────────────────
  async findAllAdmin() {
    return this.prisma.post.findMany({
      include: {
        author: { select: { id: true, username: true, email: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Lấy chi tiết 1 bài viết ──────────────────────────────────────
  async findOne(id: string, currentUser?: User) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    // DRAFT chỉ author mới xem được
    if (post.status === PostStatus.DRAFT) {
      if (!currentUser || post.authorId !== currentUser.id) {
        throw new ForbiddenException('This post is not available');
      }
    }

    return post;
  }

  // ─── Submit bài để duyệt ──────────────────────────────────────────
  async submit(id: string, currentUser: User) {
    const post = await this.findPostAndCheckOwner(id, currentUser.id);

    if (post.status !== PostStatus.DRAFT) {
      throw new BadRequestException(
        'Only DRAFT posts can be submitted for review',
      );
    }

    return this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.PENDING },
    });
  }

  // ─── Edit bài viết ────────────────────────────────────────────────
  async update(id: string, dto: UpdatePostDto, currentUser: User) {
    const post = await this.findPostAndCheckOwner(id, currentUser.id);

    // Logic state machine:
    // APPROVED hoặc REJECTED → edit → tự động về PENDING
    const shouldRevertToPending =
      post.status === PostStatus.APPROVED ||
      post.status === PostStatus.REJECTED;

    return this.prisma.post.update({
      where: { id },
      data: {
        ...dto,
        ...(shouldRevertToPending && { status: PostStatus.PENDING }),
      },
    });
  }

  // ─── Xóa bài viết ────────────────────────────────────────────────
  async remove(id: string, currentUser: User) {
    await this.findPostAndCheckOwner(id, currentUser.id);

    return this.prisma.post.delete({ where: { id } });
  }

  // ─── ADMIN: Approve bài ───────────────────────────────────────────
  async approve(id: string, adminUser: User) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) throw new NotFoundException('Post not found');
    if (post.status !== PostStatus.PENDING) {
      throw new BadRequestException('Only PENDING posts can be approved');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.APPROVED,
        reviewedBy: adminUser.id,
        reviewNote: null,
      },
    });

    // 🔔 Đẩy notification job vào queue (KHÔNG chờ, fire-and-forget)
    await this.notificationsService.queueNotification({
      userId: post.authorId,
      type: NotificationType.POST_APPROVED,
      title: '🎉 Your post has been approved!',
      message: `Your post "${post.title}" has been approved and is now public.`,
      metadata: { postId: post.id },
    });

    return updatedPost;
  }

  // ─── ADMIN: Reject bài ────────────────────────────────────────────
  async reject(id: string, adminUser: User, reason?: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) throw new NotFoundException('Post not found');
    if (post.status !== PostStatus.PENDING) {
      throw new BadRequestException('Only PENDING posts can be rejected');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.REJECTED,
        reviewedBy: adminUser.id,
        reviewNote: reason || null,
      },
    });

    // 🔔 Đẩy notification job vào queue
    await this.notificationsService.queueNotification({
      userId: post.authorId,
      type: NotificationType.POST_REJECTED,
      title: '❌ Your post has been rejected',
      message: reason
        ? `Your post "${post.title}" was rejected. Reason: ${reason}`
        : `Your post "${post.title}" has been rejected.`,
      metadata: { postId: post.id, reason },
    });

    return updatedPost;
  }

  // ─── Helper: tìm post và kiểm tra ownership ──────────────────────
  private async findPostAndCheckOwner(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) throw new NotFoundException('Post not found');

    if (post.authorId !== userId) {
      throw new ForbiddenException('You do not own this post');
    }

    return post;
  }
}
