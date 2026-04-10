import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  // ─── Xử lý sau khi upload file ───────────────────────────────────
  async uploadPostImage(
    postId: string,
    file: Express.Multer.File,
    userId: string,
  ) {
    // Kiểm tra post tồn tại và thuộc về user
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      // Xóa file vừa upload nếu post không tồn tại
      this.deleteFile(file.path);
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      // Xóa file vừa upload nếu không có quyền
      this.deleteFile(file.path);
      throw new NotFoundException('Post not found');
    }

    // Tạo URL truy cập file
    const imageUrl = `/uploads/posts/${file.filename}`;

    // Nếu post đã có ảnh cũ → xóa ảnh cũ
    if (post.imageUrl) {
      const oldFilePath = path.join(process.cwd(), post.imageUrl);
      this.deleteFile(oldFilePath);
    }

    // Cập nhật imageUrl vào post
    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: { imageUrl },
    });

    return {
      message: 'Image uploaded successfully',
      imageUrl,
      post: updatedPost,
    };
  }

  // ─── Xóa ảnh của post ────────────────────────────────────────────
  async deletePostImage(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!post || post.authorId !== userId) {
      throw new NotFoundException('Post not found');
    }

    if (!post.imageUrl) {
      throw new NotFoundException('Post has no image');
    }

    // Xóa file vật lý
    const filePath = path.join(process.cwd(), post.imageUrl);
    this.deleteFile(filePath);

    // Xóa imageUrl trong DB
    await this.prisma.post.update({
      where: { id: postId },
      data: { imageUrl: null },
    });

    return { message: 'Image deleted successfully' };
  }

  // ─── Helper: xóa file vật lý ─────────────────────────────────────
  private deleteFile(filePath: string) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Log lỗi nhưng không throw — không để việc xóa file ảnh hưởng logic chính
      console.error('Failed to delete file:', filePath, error);
    }
  }
}
