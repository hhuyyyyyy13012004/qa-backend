import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  NOTIFICATION_QUEUE,
  NotificationJobData,
} from '../notifications.service';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  // Logger giúp theo dõi quá trình xử lý job
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  // Hàm này được BullMQ tự động gọi khi có job mới trong queue
  async process(job: Job<NotificationJobData>): Promise<void> {
    this.logger.log(
      `Processing notification job #${job.id} | type: ${job.data.type} | userId: ${job.data.userId}`,
    );

    try {
      // Lưu notification vào database
      await this.prisma.notification.create({
        data: {
          userId: job.data.userId,
          type: job.data.type,
          title: job.data.title,
          message: job.data.message,
          metadata: job.data.metadata ?? {},
        },
      });

      this.logger.log(
        `✅ Notification saved for user ${job.data.userId} | type: ${job.data.type}`,
      );

      // 👉 Trong thực tế, đây là nơi bạn có thể thêm:
      // - Gửi email (nodemailer)
      // - Gửi push notification (Firebase FCM)
      // - Gửi websocket event (Socket.io)
    } catch (error) {
      this.logger.error(
        `❌ Failed to process notification job #${job.id}`,
        error,
      );
      // Throw lại để BullMQ biết job thất bại → retry
      throw error;
    }
  }
}
