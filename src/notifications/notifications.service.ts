import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import type { User } from '@prisma/client';

// Tên queue — dùng constant để tránh typo
export const NOTIFICATION_QUEUE = 'notification';

// Interface định nghĩa data của job
export interface NotificationJobData {
  userId: string; // người nhận
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(NOTIFICATION_QUEUE) private notificationQueue: Queue,
  ) {}

  // ─── Đẩy job vào queue (gọi từ PostsService) ─────────────────────
  async queueNotification(data: NotificationJobData) {
    await this.notificationQueue.add('send-notification', data, {
      attempts: 3, // retry tối đa 3 lần nếu lỗi
      backoff: {
        type: 'exponential', // chờ 2s, 4s, 8s giữa các lần retry
        delay: 2000,
      },
      removeOnComplete: true, // xóa job khỏi queue sau khi xong
      removeOnFail: false, // giữ lại job lỗi để debug
    });
  }

  // ─── Lấy notifications của user ──────────────────────────────────
  async findMyNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Đánh dấu đã đọc một notification ────────────────────────────
  async markAsRead(id: string, currentUser: User) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) throw new NotFoundException('Notification not found');

    if (notification.userId !== currentUser.id) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  // ─── Đánh dấu tất cả đã đọc ──────────────────────────────────────
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  }

  // ─── Đếm số notification chưa đọc ───────────────────────────────
  async countUnread(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount: count };
  }
}
