import { DynamicModule, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsController } from './notifications.controller';
import {
  NotificationsService,
  NOTIFICATION_QUEUE,
} from './notifications.service';
import { NotificationProcessor } from './processors/notification.processor';
import {
  BullNotificationDispatcher,
  DirectNotificationDispatcher,
  NOTIFICATION_DISPATCHER,
} from './notification-dispatcher';

@Module({})
export class NotificationsModule {
  static register(queueEnabled: boolean): DynamicModule {
    return {
      module: NotificationsModule,
      global: true,
      imports: queueEnabled
        ? [
            BullModule.registerQueue({
              name: NOTIFICATION_QUEUE,
            }),
          ]
        : [],
      controllers: [NotificationsController],
      providers: [
        NotificationsService,
        ...(queueEnabled ? [NotificationProcessor] : []),
        ...(queueEnabled
          ? [
              BullNotificationDispatcher,
              {
                provide: NOTIFICATION_DISPATCHER,
                useExisting: BullNotificationDispatcher,
              },
            ]
          : [
              DirectNotificationDispatcher,
              {
                provide: NOTIFICATION_DISPATCHER,
                useExisting: DirectNotificationDispatcher,
              },
            ]),
      ],
      exports: [NotificationsService],
    };
  }
}
