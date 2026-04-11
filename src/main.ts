import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

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

  // Lấy port từ biến môi trường của Render hoặc mặc định là 3000 nếu chạy local
  const port = process.env.PORT || 3000;

  // Lắng nghe trên '0.0.0.0' là bắt buộc để Render có thể forward traffic vào app
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server running on port: ${port}`);
  console.log(`📚 Swagger docs available at port: ${port}/api/docs`);
}
bootstrap();
