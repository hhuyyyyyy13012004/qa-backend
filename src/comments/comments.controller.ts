import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  // ── Public routes ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Get comments of a post' })
  @Get('post/:postId')
  findByPost(@Param('postId') postId: string) {
    return this.commentsService.findByPost(postId);
  }

  @ApiOperation({ summary: 'Get comments of a question' })
  @Get('question/:questionId')
  findByQuestion(@Param('questionId') questionId: string) {
    return this.commentsService.findByQuestion(questionId);
  }

  // ── Auth required ────────────────────────────────────────────────

  @ApiOperation({
    summary: 'Create comment or reply',
    description: `
      - Provide **postId** to comment on a post
      - Provide **questionId** to comment on a question
      - Provide **parentId** to reply to a comment (1 level only)
    `,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateCommentDto, @CurrentUser() user: User) {
    return this.commentsService.create(dto, user);
  }

  @ApiOperation({ summary: 'Delete my comment (also deletes replies)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.commentsService.remove(id, user);
  }
}
