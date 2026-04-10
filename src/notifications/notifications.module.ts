import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsController } from './notifications.controller';
import {
  NotificationsService,
  NOTIFICATION_QUEUE,
} from './notifications.service';
import { NotificationProcessor } from './processors/notification.processor';

@Module({
  imports: [
    // Đăng ký queue với tên NOTIFICATION_QUEUE
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationProcessor],
  exports: [NotificationsService], // export để PostsService dùng được
})
export class NotificationsModule {}
