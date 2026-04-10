import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { multerConfig } from './upload.config';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @ApiOperation({ summary: 'Upload image for a post' })
  @ApiConsumes('multipart/form-data') // Swagger biết đây là file upload
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('posts/:postId/image')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  uploadPostImage(
    @Param('postId') postId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.uploadService.uploadPostImage(postId, file, user.id);
  }

  @ApiOperation({ summary: 'Delete image of a post' })
  @Delete('posts/:postId/image')
  deletePostImage(@Param('postId') postId: string, @CurrentUser() user: User) {
    return this.uploadService.deletePostImage(postId, user.id);
  }
}
