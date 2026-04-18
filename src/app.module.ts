import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { isNotificationsQueueEnabled } from './config/env.helpers';
import { LikesModule } from './likes/likes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { QuestionsModule } from './questions/questions.module';
import { UploadModule } from './upload/upload.module';

const notificationsQueueEnabled = isNotificationsQueueEnabled();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ...(notificationsQueueEnabled
      ? [
          BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
              const redisUrl = configService.get<string>('REDIS_URL');

              if (redisUrl) {
                const url = new URL(redisUrl);

                return {
                  connection: {
                    host: url.hostname,
                    port: parseInt(url.port, 10),
                    password: url.password || undefined,
                    tls: redisUrl.startsWith('rediss://') ? {} : undefined,
                  },
                };
              }

              return {
                connection: {
                  host: configService.get<string>('REDIS_HOST', 'localhost'),
                  port: configService.get<number>('REDIS_PORT', 6379),
                },
              };
            },
          }),
        ]
      : []),
    PrismaModule,
    AuthModule,
    PostsModule,
    QuestionsModule,
    CommentsModule,
    LikesModule,
    NotificationsModule.register(notificationsQueueEnabled),
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
