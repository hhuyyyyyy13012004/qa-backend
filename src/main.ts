import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix — tất cả route đều bắt đầu bằng /api
  app.setGlobalPrefix('api');

  // Tự động validate request body dựa theo DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động xóa field không có trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu gửi field lạ
      transform: true, // Tự động convert type (string → number...)
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Q&A Backend API')
    .setDescription('API documentation for Q&A system')
    .setVersion('1.0')
    .addBearerAuth() // Thêm nút Authorize để test JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log('🚀 Server running on http://localhost:3000');
  console.log('📚 Swagger docs at http://localhost:3000/api/docs');
}
bootstrap();
