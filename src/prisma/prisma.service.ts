import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientInitializationError &&
        error.errorCode === 'P1001'
      ) {
        this.logger.error(
          [
            'Cannot connect to PostgreSQL.',
            `DATABASE_URL: ${process.env.DATABASE_URL ?? '(not set)'}`,
            'Start the local database with: docker compose up -d postgres',
          ].join('\n'),
        );
      }

      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
