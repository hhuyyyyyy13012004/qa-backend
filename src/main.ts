import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3001',
      'https://qa-fullstack.vercel.app',
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Q&A Backend API')
    .setDescription('API documentation for Q&A system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Server running on port: ${port}`);
  console.log(`Swagger docs available at port: ${port}/api/docs`);
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');

  if (
    error instanceof Prisma.PrismaClientInitializationError &&
    error.errorCode === 'P1001'
  ) {
    logger.error(
      'PostgreSQL is not reachable at localhost:5432. Run `docker compose up -d postgres` and try again.',
    );
    process.exit(1);
  }

  throw error;
});
