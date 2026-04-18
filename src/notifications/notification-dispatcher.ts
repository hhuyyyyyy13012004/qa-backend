import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import {
  NOTIFICATION_QUEUE,
  NotificationJobData,
} from './notifications.service';

export const NOTIFICATION_DISPATCHER = 'NOTIFICATION_DISPATCHER';

export interface NotificationDispatcher {
  dispatch(data: NotificationJobData): Promise<void>;
}

@Injectable()
export class BullNotificationDispatcher implements NotificationDispatcher {
  constructor(@InjectQueue(NOTIFICATION_QUEUE) private queue: Queue) {}

  async dispatch(data: NotificationJobData) {
    await this.queue.add('send-notification', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}

@Injectable()
export class DirectNotificationDispatcher implements NotificationDispatcher {
  constructor(private prisma: PrismaService) {}

  async dispatch(data: NotificationJobData) {
    await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata ?? {},
      },
    });
  }
}
